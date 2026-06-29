// ============================================================
// AUTH CONTROLLER - Complete Implementation
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
 * @route   POST /api/auth/login
 * @desc    Login user
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user with role
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

        // Reset failed attempts and update login
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
        const tokens = generateTokens(user.id);

        // Remove sensitive data
        const { passwordHash, ...userData } = user;

        logger.info(`User logged in: ${user.email}`);

        res.json({
            success: true,
            data: {
                user: userData,
                tokens
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
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
        const tokens = generateTokens(user.id);

        // Send welcome email
        await sendEmail({
            to: email,
            subject: 'Welcome to MEI Group',
            template: 'welcome',
            data: { name: `${firstName} ${lastName}` }
        });

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user,
                tokens
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 */
exports.logout = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400);
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const tokens = generateTokens(user.id);

        res.json({
            success: true,
            data: { tokens }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists, you will receive a password reset link.'
            });
        }

        const resetToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await prisma.user.update({
            where: { id: user.id },
            data: { rememberToken: resetToken }
        });

        await sendEmail({
            to: email,
            subject: 'Password Reset - MEI Group',
            template: 'reset-password',
            data: {
                name: user.profile?.firstName || 'User',
                resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            }
        });

        res.json({
            success: true,
            message: 'If an account exists, you will receive a password reset link.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findFirst({
            where: {
                id: decoded.userId,
                rememberToken: token
            }
        });

        if (!user) {
            throw new AppError('Invalid or expired reset token', 400);
        }

        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                rememberToken: null
            }
        });

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
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
 * @route   PUT /api/auth/me
 * @desc    Update current user
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
