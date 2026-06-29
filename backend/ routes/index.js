// ============================================================
// ROUTES INDEX
// ============================================================

const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const applicationRoutes = require('./applicationRoutes');
const serviceRoutes = require('./serviceRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const userRoutes = require('./userRoutes');
const companyRoutes = require('./companyRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/services', serviceRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/dashboard', dashboardRoutes);

// API version info
router.get('/info', (req, res) => {
    res.json({
        name: 'MEI Group API',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
