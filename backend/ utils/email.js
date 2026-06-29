// ============================================================
// EMAIL UTILITY
// ============================================================

const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Send email
 */
async function sendEmail({ to, subject, html, text, template, data }) {
    try {
        // If template is provided, render it
        let emailHtml = html;
        let emailText = text;

        if (template) {
            const rendered = await renderTemplate(template, data);
            emailHtml = rendered.html;
            emailText = rendered.text;
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@meipressgroup.com',
            to,
            subject,
            html: emailHtml,
            text: emailText
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error('Email sending failed:', error);
        throw error;
    }
}

/**
 * Render email template
 */
async function renderTemplate(template, data) {
    // Simple template rendering - you can use handlebars or other template engines
    const templates = {
        welcome: {
            html: `
                <h1>Welcome to MEI Group!</h1>
                <p>Hello ${data.name},</p>
                <p>Thank you for registering with MEI Group. We're excited to have you on board!</p>
                <p>Get started by exploring our services and building your career.</p>
                <a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a>
            `,
            text: `Welcome to MEI Group!\n\nHello ${data.name},\n\nThank you for registering with MEI Group. We're excited to have you on board!\n\nGet started by exploring our services.`
        },
        'reset-password': {
            html: `
                <h1>Password Reset Request</h1>
                <p>Hello ${data.name},</p>
                <p>You requested
