// ============================================================
// DATABASE CONFIGURATION
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

// Create Prisma client with connection pooling
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
    errorFormat: 'pretty'
});

// Test connection
async function testConnection() {
    try {
        await prisma.$connect();
        logger.info('✅ Database connected successfully');
        return true;
    } catch (error) {
        logger.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Handle disconnection
process.on('beforeExit', async () => {
    await prisma.$disconnect();
    logger.info('Database disconnected');
});

module.exports = {
    prisma,
    testConnection
};
