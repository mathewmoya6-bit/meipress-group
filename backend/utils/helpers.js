// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Custom error class
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Generate random string
 */
function generateRandomString(length = 32) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Sanitize input
 */
function sanitizeInput(input) {
    if (typeof input === 'string') {
        return input.trim().replace(/[<>]/g, '');
    }
    return input;
}

/**
 * Format date
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * Pagination helper
 */
function paginate(data, page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = data.slice(start, end);

    return {
        data: paginatedData,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: data.length,
            totalPages: Math.ceil(data.length / limit),
            hasNext: end < data.length,
            hasPrev: page > 1
        }
    };
}

/**
 * Validate email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    return phoneRegex.test(phone);
}

/**
 * Mask sensitive data
 */
function maskData(data) {
    if (data.email) {
        const [local, domain] = data.email.split('@');
        data.email = `${local.slice(0, 2)}***@${domain}`;
    }
    if (data.phone) {
        data.phone = data.phone.slice(0, 3) + '***' + data.phone.slice(-3);
    }
    return data;
}

/**
 * Slugify string
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

/**
 * Parse JSON safely
 */
function safeJsonParse(str, fallback = null) {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

module.exports = {
    AppError,
    generateRandomString,
    sanitizeInput,
    formatDate,
    paginate,
    isValidEmail,
    isValidPhone,
    maskData,
    slugify,
    safeJsonParse
};
