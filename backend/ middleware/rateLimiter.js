// ============================================================
// RATE LIMITER MIDDLEWARE
// ============================================================

const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.'
        });
    },
    skip: (req) => {
        // Skip rate limiting for admin users
        return req.user?.role?.slug === 'super_admin';
    }
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again later.'
    },
    handler: (req, res) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts. Please try again later.'
        });
    }
});

// Stricter limiter for application submissions
const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 applications per hour
    message: {
        success: false,
        message: 'Too many applications submitted. Please try again later.'
    }
});

// Limiter for contact forms
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 contact messages per hour
    message: {
        success: false,
        message: 'Too many messages sent. Please try again later.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    applicationLimiter,
    contactLimiter
};
