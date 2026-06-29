// ============================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================

const { logger } = require('../utils/logger');

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
    });

    // Handle Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry. The record already exists.',
            field: err.meta?.target?.[0] || 'unknown'
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Record not found.'
        });
    }

    if (err.code === 'P2003') {
        return res.status(400).json({
            success: false,
            message: 'Invalid reference. The related record does not exist.'
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired.'
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error.',
            errors: err.errors || err.message
        });
    }

    // Handle Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.'
        });
    }

    // Default response
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred.' 
        : err.message || 'Internal server error.';

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

/**
 * 404 handler
 */
function notFound(req, res) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
}

module.exports = {
    errorHandler,
    notFound
};
