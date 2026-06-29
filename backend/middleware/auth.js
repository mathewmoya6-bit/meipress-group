// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                role: true,
                profile: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please login again.'
            });
        }

        if (user.status === 'suspended' || user.status === 'locked') {
            return res.status(403).json({
                success: false,
                message: 'Account is suspended or locked. Please contact support.'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role?.slug || 'guest';

        next();
    } catch (error) {
        logger.error('Authentication error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed. Please try again.'
        });
    }
}

/**
 * Authorize specific roles
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role?.slug || 'guest';
        
        if (!roles.includes(userRole) && !roles.includes('*')) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                required: roles,
                current: userRole
            });
        }

        next();
    };
}

/**
 * Check if user has specific permission
 */
function hasPermission(permission) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userPermissions = await prisma.rolePermission.findMany({
                where: {
                    roleId: req.user.roleId,
                    permission: {
                        slug: permission
                    }
                }
            });

            if (userPermissions.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied: ${permission}`
                });
            }

            next();
        } catch (error) {
            logger.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
}

module.exports = {
    authenticate,
    authorize,
    hasPermission
};
