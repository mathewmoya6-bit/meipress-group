// ============================================================
// AUTH CONTROLLER
// ============================================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { sendEmail } = require('../utils/email');
const { AppError } = require('../utils/helpers');

/**
 * Generate JWT tokens
 */
function generateTokens(userId) {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
}

/**
 * Login user
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: true,
                profile: true
            }
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            throw new AppError('Account temporarily locked. Please try again later.', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            // Increment failed attempts
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: { increment: 1 },
                    lockedUntil: user.failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
                }
            });
            throw new AppError('Invalid credentials', 401);
        }

        // Reset failed attempts on successful login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: 0,
                lockedUntil: null,
                lastLogin: new Date(),
                loginCount: { increment: 1 }
            }
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Log success
        logger.info(`User logged in: ${user.email}`);

        // Remove sensitive data
        const { passwordHash, ...userData } = user;

        res.json({
            success: true,
            data: {
                user: userData,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new AppError('User already exists with this email', 409);
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Get default role
        const defaultRole = await prisma.userRole.findFirst({
            where: { isDefault: true }
        });

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                phone,
                roleId: defaultRole?.id,
                profile: {
                    create: {
                        firstName,
                        lastName,
                        displayName: `${firstName} ${lastName}`
                    }
                }
            },
            include: {
                role: true,
                profile: true
            }
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Send welcome email
        await sendEmail({
            to: email,
            subject: 'Welcome to MEI Group',
            template: 'welcome',
            data: { name: `${firstName} ${lastName}` }
        });

        // Log registration
        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
    try {
        // Invalidate refresh token (implement token blacklist if needed)
        // For now, just return success
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh token
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400);
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Generate new tokens
        const tokens = generateTokens(user.id);

        res.json({
            success: true,
            data: {
                tokens
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                role: true,
                profile: true,
                company: true
            }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const { passwordHash, ...userData } = user;

        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, phone, address, bio } = req.body;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                phone,
                profile: {
                    update: {
                        firstName,
                        lastName,
                        displayName: `${firstName} ${lastName}`,
                        address,
                        bio
                    }
                }
            },
            include: {
                profile: true
            }
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Don't reveal if user exists or not
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Save reset token to user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                rememberToken: resetToken
            }
        });

        // Send reset email
        await sendEmail({
            to: email,
            subject: 'Password Reset Request - MEI Group',
            template: 'reset-password',
            data: {
                name: user.profile?.firstName || 'User',
                resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            }
        });

        res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user with token
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.userId,
                rememberToken: token
            }
        });

        if (!user) {
            throw new AppError('Invalid or expired reset token', 400);
        }

        // Hash new password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                rememberToken: null
            }
        });

        res.json({
            success: true,
            message: 'Password reset successfully. Please login with your new password.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify email
 */
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Update user
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                emailVerified: true
            }
        });

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resend verification email
 */
exports.resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.emailVerified) {
            throw new AppError('Email already verified', 400);
        }

        // Generate verification token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send verification email
        await sendEmail({
            to: email,
            subject: 'Verify Your Email - MEI Group',
            template: 'verify-email',
            data: {
                name: user.profile?.firstName || 'User',
                verifyLink: `${process.env.FRONTEND_URL}/verify-email?token=${token}`
            }
        });

        res.json({
            success: true,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        next(error);
    }
};
