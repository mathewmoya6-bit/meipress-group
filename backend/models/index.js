// ============================================================
// MODELS INDEX
// ============================================================

const { prisma } = require('../config/database');

// Export all models
module.exports = {
    prisma,
    User: prisma.user,
    UserProfile: prisma.userProfile,
    UserRole: prisma.userRole,
    Application: prisma.application,
    Service: prisma.service,
    ServiceCategory: prisma.serviceCategory,
    Inquiry: prisma.inquiry,
    Company: prisma.company,
    Employer: prisma.employer,
    Notification: prisma.notification,
    AuditLog: prisma.auditLog,
    SystemSetting: prisma.systemSetting
};
