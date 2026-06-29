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
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${data.resetLink}">Reset Password</a>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
            text: `Password Reset Request\n\nHello ${data.name},\n\nYou requested to reset your password. Use this link to reset it:\n${data.resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`
        },
        'verify-email': {
            html: `
                <h1>Verify Your Email</h1>
                <p>Hello ${data.name},</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${data.verifyLink}">Verify Email</a>
                <p>This link expires in 24 hours.</p>
            `,
            text: `Verify Your Email\n\nHello ${data.name},\n\nPlease verify your email address by using this link:\n${data.verifyLink}\n\nThis link expires in 24 hours.`
        },
        'new-application': {
            html: `
                <h1>New Application Received</h1>
                <p>Hello Admin,</p>
                <p>A new application has been submitted for review.</p>
                <p><strong>Applicant:</strong> ${data.name}</p>
                <p><strong>Service:</strong> ${data.service}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <a href="${process.env.FRONTEND_URL}/admin/applications/${data.id}">View Application</a>
            `,
            text: `New Application Received\n\nHello Admin,\n\nA new application has been submitted for review.\n\nApplicant: ${data.name}\nService: ${data.service}\nEmail: ${data.email}\n\nView Application: ${process.env.FRONTEND_URL}/admin/applications/${data.id}`
        }
    };

    const templateData = templates[template];
    if (!templateData) {
        throw new Error(`Template not found: ${template}`);
    }

    return {
        html: templateData.html,
        text: templateData.text
    };
}

module.exports = {
    sendEmail,
    renderTemplate
};
