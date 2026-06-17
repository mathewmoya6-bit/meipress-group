// js/config.js
// Application configuration

const CONFIG = {
    APP_NAME: 'Mei Press Group',
    APP_VERSION: '1.0.0',
    
    SUPABASE: {
        URL: 'https://ciodxticnskxyvearhvt.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpb2R4dGljbnNreHl2ZWFyaHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjU5NjksImV4cCI6MjA1OTYwMTk2OX0.OZESiw6Qcw4Zc-SgO4aeXVY6kngrN5yD7TgZkIrPWbE'
    },
    
    CONTACT: {
        PHONE: '+254703738707',
        EMAIL: 'info@meipress.com',
        ADDRESS: 'Nairobi, Kenya'
    },
    
    MPESA: {
        PAYBILL: '4095377'
    },
    
    LINKS: {
        FACEBOOK: '#',
        TWITTER: '#',
        INSTAGRAM: '#',
        LINKEDIN: '#',
        YOUTUBE: '#',
        WHATSAPP: 'https://wa.me/254703738707'
    }
};

// Freeze to prevent modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.CONTACT);
Object.freeze(CONFIG.MPESA);
Object.freeze(CONFIG.LINKS);

console.log('✅ Config loaded');
