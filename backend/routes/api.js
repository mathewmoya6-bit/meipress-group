// ============================================================
// API ROUTES - Complete API Endpoints
// ============================================================

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// ============================================================
// MIDDLEWARE
// ============================================================
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { authLimiter, applicationLimiter, contactLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');

// ============================================================
// AUTH CONTROLLERS (to be implemented)
// ============================================================
const authController = {
    login: async (req, res) => { /* Implementation */ },
    register: async (req, res) => { /* Implementation */ },
    logout: async (req, res) => { /* Implementation */ },
    refreshToken: async (req, res) => { /* Implementation */ },
    forgotPassword: async (req, res) => { /* Implementation */ },
    resetPassword: async (req, res) => { /* Implementation */ },
    getCurrentUser: async (req, res) => { /* Implementation */ },
    updateProfile: async (req, res) => { /* Implementation */ }
};

// ============================================================
// APPLICATION CONTROLLERS (to be implemented)
// ============================================================
const applicationController = {
    getAll: async (req, res) => { /* Implementation */ },
    create: async (req, res) => { /* Implementation */ },
    getOne: async (req, res) => { /* Implementation */ },
    update: async (req, res) => { /* Implementation */ },
    delete: async (req, res) => { /* Implementation */ },
    updateStatus: async (req, res) => { /* Implementation */ }
};

// ============================================================
// SERVICE CONTROLLERS (to be implemented)
// ============================================================
const serviceController = {
    getAll: async (req, res) => { /* Implementation */ },
    getOne: async (req, res) => { /* Implementation */ },
    getCategories: async (req, res) => { /* Implementation */ }
};

// ============================================================
// INQUIRY CONTROLLERS (to be implemented)
// ============================================================
const inquiryController = {
    create: async (req, res) => { /* Implementation */ },
    getAll: async (req, res) => { /* Implementation */ },
    getOne: async (req, res) => { /* Implementation */ },
    updateStatus: async (req, res) => { /* Implementation */ }
};

// ============================================================
// USER CONTROLLERS (to be implemented)
// ============================================================
const userController = {
    getAll: async (req, res) => { /* Implementation */ },
    getOne: async (req, res) => { /* Implementation */ },
    update: async (req, res) => { /* Implementation */ },
    delete: async (req, res) => { /* Implementation */ }
};

// ============================================================
// DASHBOARD CONTROLLERS (to be implemented)
// ============================================================
const dashboardController = {
    getStats: async (req, res) => { /* Implementation */ },
    getRecent: async (req, res) => { /* Implementation */ },
    getAnalytics: async (req, res) => { /* Implementation */ }
};

// ============================================================
// VALIDATION RULES
// ============================================================

// Auth Validation
const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
];

const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Valid email is required')
];

const resetPasswordValidation = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

// Application Validation
const createApplicationValidation = [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('serviceId').isInt().withMessage('Service ID is required'),
    body('serviceData').optional().isObject()
];

const updateApplicationValidation = [
    param('id').isInt().withMessage('Invalid application ID'),
    body('status').optional().isIn(['draft', 'pending', 'under_review', 'processing', 'completed', 'rejected', 'cancelled'])
];

const updateStatusValidation = [
    param('id').isInt().withMessage('Invalid application ID'),
    body('status').isIn(['pending', 'under_review', 'processing', 'completed', 'rejected', 'cancelled'])
        .withMessage('Invalid status value')
];

// Inquiry Validation
const createInquiryValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required')
];

// User Validation
const updateUserValidation = [
    param('id').isInt().withMessage('Invalid user ID'),
    body('status').optional().isIn(['active', 'inactive', 'suspended']),
    body('roleId').optional().isInt()
];

// ============================================================
// ============================================================
// AUTH ROUTES
// ============================================================
// ============================================================

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
    '/auth/login',
    authLimiter,
    validate(loginValidation),
    authController.login
);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
    '/auth/register',
    authLimiter,
    validate(registerValidation),
    authController.register
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
    '/auth/logout',
    authenticate,
    authController.logout
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
    '/auth/refresh-token',
    authLimiter,
    authController.refreshToken
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
    '/auth/forgot-password',
    authLimiter,
    validate(forgotPasswordValidation),
    authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
    '/auth/reset-password',
    authLimiter,
    validate(resetPasswordValidation),
    authController.resetPassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
    '/auth/me',
    authenticate,
    authController.getCurrentUser
);

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
    '/auth/me',
    authenticate,
    authController.updateProfile
);

// ============================================================
// ============================================================
// APPLICATION ROUTES
// ============================================================
// ============================================================

/**
 * @route   GET /api/applications
 * @desc    Get all applications
 * @access  Private (Admin/Staff)
 */
router.get(
    '/applications',
    authenticate,
    authorize('admin', 'super_admin', 'staff'),
    applicationController.getAll
);

/**
 * @route   POST /api/applications
 * @desc    Create new application
 * @access  Public / Private
 */
router.post(
    '/applications',
    applicationLimiter,
    validate(createApplicationValidation),
    applicationController.create
);

/**
 * @route   GET /api/applications/:id
 * @desc    Get application by ID
 * @access  Private (Owner or Admin)
 */
router.get(
    '/applications/:id',
    authenticate,
    validate([param('id').isInt()]),
    applicationController.getOne
);

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application
 * @access  Private (Owner or Admin)
 */
router.put(
    '/applications/:id',
    authenticate,
    authorize('admin', 'super_admin', 'staff'),
    validate(updateApplicationValidation),
    applicationController.update
);

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete application
 * @access  Private (Admin only)
 */
router.delete(
    '/applications/:id',
    authenticate,
    authorize('admin', 'super_admin'),
    validate([param('id').isInt()]),
    applicationController.delete
);

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application status
 * @access  Private (Admin/Staff)
 */
router.put(
    '/applications/:id/status',
    authenticate,
    authorize('admin', 'super_admin', 'staff'),
    validate(updateStatusValidation),
    applicationController.updateStatus
);

// ============================================================
// ============================================================
// SERVICE ROUTES
// ============================================================
// ============================================================

/**
 * @route   GET /api/services
 * @desc    Get all services
 * @access  Public
 */
router.get(
    '/services',
    serviceController.getAll
);

/**
 * @route   GET /api/services/:id
 * @desc    Get service by ID
 * @access  Public
 */
router.get(
    '/services/:id',
    validate([param('id').isInt()]),
    serviceController.getOne
);

/**
 * @route   GET /api/services/categories
 * @desc    Get service categories
 * @access  Public
 */
router.get(
    '/services/categories',
    serviceController.getCategories
);

// ============================================================
// ============================================================
// INQUIRY ROUTES
// ============================================================
// ============================================================

/**
 * @route   POST /api/inquiries
 * @desc    Submit contact inquiry
 * @access  Public
 */
router.post(
    '/inquiries',
    contactLimiter,
    validate(createInquiryValidation),
    inquiryController.create
);

/**
 * @route   GET /api/inquiries
 * @desc    Get all inquiries
 * @access  Private (Admin/Staff)
 */
router.get(
    '/inquiries',
    authenticate,
    authorize('admin', 'super_admin', 'staff'),
    inquiryController.getAll
);

/**
 * @route   GET /api/inquiries/:id
 * @desc    Get inquiry by ID
 * @access  Private (Admin/Staff)
 */
router.get(
    '/inquiries/:id',
    authenticate,
    authorize('admin', 'super_admin', 'staff'),
    validate([param('id').isInt()]),
    inquiryController.getOne
);

/**
 * @route   PUT /api/inquiries/:id/status
 * @desc    Update inquiry status
 * @access  Private (Admin/Staff)
 */
router.put(
    '/inquiries/:id/status',
    authenticate,
    authorize('admin', 'super_admin', 'staff'),
    validate([
        param('id').isInt(),
        body('status').isIn(['new', 'read', 'replied', 'closed'])
    ]),
    inquiryController.updateStatus
);

// ============================================================
// ============================================================
// USER ROUTES
// ============================================================
// ============================================================

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get(
    '/users',
    authenticate,
    authorize('admin', 'super_admin'),
    userController.getAll
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or Self)
 */
router.get(
    '/users/:id',
    authenticate,
    authorize('admin', 'super_admin'),
    validate([param('id').isInt()]),
    userController.getOne
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put(
    '/users/:id',
    authenticate,
    authorize('admin', 'super_admin'),
    validate(updateUserValidation),
    userController.update
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete(
    '/users/:id',
    authenticate,
    authorize('super_admin'),
    validate([param('id').isInt()]),
    userController.delete
);

// ============================================================
// ============================================================
// DASHBOARD ROUTES
// ============================================================
// ============================================================

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin/Staff)
 */
router.get(
    '/dashboard/stats',
    authenticate,
    authorize('admin', 'super_admin', 'staff'),
    dashboardController.getStats
);

/**
 * @route   GET /api/dashboard/recent
 * @desc    Get recent activity
 * @access  Private (Admin/Staff)
 */
router.get(
    '/dashboard/recent',
    authenticate,
    authorize('admin', 'super_admin', 'staff'),
    dashboardController.getRecent
);

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get dashboard analytics
 * @access  Private (Admin only)
 */
router.get(
    '/dashboard/analytics',
    authenticate,
    authorize('admin', 'super_admin'),
    dashboardController.getAnalytics
);

// ============================================================
// ============================================================
// API DOCUMENTATION
// ============================================================
// ============================================================

/**
 * @route   GET /api/docs
 * @desc    API Documentation
 * @access  Public
 */
router.get('/docs', (req, res) => {
    res.json({
        name: 'MEI Group API',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: { method: 'POST', path: '/api/auth/login', description: 'Login user' },
                register: { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
                logout: { method: 'POST', path: '/api/auth/logout', description: 'Logout user' },
                refreshToken: { method: 'POST', path: '/api/auth/refresh-token', description: 'Refresh access token' },
                forgotPassword: { method: 'POST', path: '/api/auth/forgot-password', description: 'Send password reset email' },
                resetPassword: { method: 'POST', path: '/api/auth/reset-password', description: 'Reset password' },
                me: { method: 'GET', path: '/api/auth/me', description: 'Get current user' },
                updateMe: { method: 'PUT', path: '/api/auth/me', description: 'Update current user' }
            },
            applications: {
                getAll: { method: 'GET', path: '/api/applications', description: 'Get all applications (Admin)' },
                create: { method: 'POST', path: '/api/applications', description: 'Create application' },
                getOne: { method: 'GET', path: '/api/applications/:id', description: 'Get application by ID' },
                update: { method: 'PUT', path: '/api/applications/:id', description: 'Update application' },
                delete: { method: 'DELETE', path: '/api/applications/:id', description: 'Delete application' },
                updateStatus: { method: 'PUT', path: '/api/applications/:id/status', description: 'Update application status' }
            },
            services: {
                getAll: { method: 'GET', path: '/api/services', description: 'Get all services' },
                getOne: { method: 'GET', path: '/api/services/:id', description: 'Get service by ID' },
                getCategories: { method: 'GET', path: '/api/services/categories', description: 'Get service categories' }
            },
            inquiries: {
                create: { method: 'POST', path: '/api/inquiries', description: 'Submit inquiry' },
                getAll: { method: 'GET', path: '/api/inquiries', description: 'Get all inquiries (Admin)' },
                getOne: { method: 'GET', path: '/api/inquiries/:id', description: 'Get inquiry by ID' },
                updateStatus: { method: 'PUT', path: '/api/inquiries/:id/status', description: 'Update inquiry status' }
            },
            users: {
                getAll: { method: 'GET', path: '/api/users', description: 'Get all users (Admin)' },
                getOne: { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
                update: { method: 'PUT', path: '/api/users/:id', description: 'Update user' },
                delete: { method: 'DELETE', path: '/api/users/:id', description: 'Delete user' }
            },
            dashboard: {
                stats: { method: 'GET', path: '/api/dashboard/stats', description: 'Get dashboard stats' },
                recent: { method: 'GET', path: '/api/dashboard/recent', description: 'Get recent activity' },
                analytics: { method: 'GET', path: '/api/dashboard/analytics', description: 'Get analytics' }
            }
        }
    });
});

// ============================================================
// EXPORT
// ============================================================
module.exports = router;
