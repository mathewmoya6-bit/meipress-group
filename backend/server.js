// ============================================================
// MEI GROUP - BACKEND SERVER (UPDATED)
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import custom modules
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');

// ============================================================
// IMPORT API ROUTES
// ============================================================
const apiRoutes = require('./routes/api');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// CREATE LOGS DIRECTORY
// ============================================================
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================================
// MIDDLEWARE
// ============================================================

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    }
}));

// CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use(cors(corsOptions));

// Request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - apply to all API routes
app.use('/api', rateLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - ${req.ip}`);
    next();
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        memory: process.memoryUsage(),
        version: process.version
    });
});

// ============================================================
// API DOCUMENTATION
// ============================================================
app.get('/', (req, res) => {
    res.json({
        name: 'MEI Group API',
        version: '1.0.0',
        description: 'Complete backend API for MEI Group',
        endpoints: {
            docs: '/api/docs',
            health: '/health',
            api: '/api'
        },
        documentation: 'https://meipressgroup.com/api/docs'
    });
});

// ============================================================
// MOUNT API ROUTES
// ============================================================
app.use('/api', apiRoutes);

// ============================================================
// 404 HANDLER
// ============================================================
app.use(notFound);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use(errorHandler);

// ============================================================
// CREATE UPLOADS DIRECTORY
// ============================================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    
    // Create subdirectories for different file types
    const subDirs = ['documents', 'images', 'profiles', 'temp'];
    subDirs.forEach(dir => {
        const subDir = path.join(uploadsDir, dir);
        if (!fs.existsSync(subDir)) {
            fs.mkdirSync(subDir, { recursive: true });
        }
    });
}

// ============================================================
// START SERVER
// ============================================================
const server = app.listen(PORT, () => {
    logger.info('🚀 ============================================');
    logger.info(`🚀 MEI Group Backend Server Started`);
    logger.info(`🚀 ============================================`);
    logger.info(`📡 Port: ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
    logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    logger.info(`🏥 Health: http://localhost:${PORT}/health`);
    logger.info(`🚀 ============================================`);
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================
const shutdown = async (signal) => {
    logger.info(`${signal} signal received: closing HTTP server`);
    
    server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close database connections
        try {
            const { prisma } = require('./config/database');
            await prisma.$disconnect();
            logger.info('Database connections closed');
        } catch (error) {
            logger.error('Error closing database connections:', error);
        }
        
        process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
});

module.exports = { app, server };
