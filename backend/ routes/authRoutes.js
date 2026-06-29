// ============================================================
// AUTH ROUTES
// ============================================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validation');

// Validation rules
const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
];

const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

// Routes
router.post('/login', authLimiter, validate(loginValidation), authController.login);
router.post('/register', authLimiter, validate(registerValidation), authController.register);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordValidation), authController.resetPassword);
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/me', authenticate, authController.updateProfile);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);

module.exports = router;
