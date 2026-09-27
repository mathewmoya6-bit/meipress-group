// ============================================================
// MEI GROUP – SHARED CONFIGURATION & HELPERS
// Works with:
//   - applications table (REST helpers)
//   - training_courses / training_sessions / training_registrations
//   - Supabase JS v2 client (for training-registration.html)
// ============================================================

/* ============================================================
   1. SHARED CONFIG
   ============================================================ */
const MEI_CONFIG = {
    SUPABASE_URL: 'https://qkchnrrxrewmlvvxuuqe.supabase.co',
    SUPABASE_KEY: 'sb_publishable_-ki98JwzbWWiVXm7nzAAgQ_5H2qjXz7',
    TABLE: 'applications'
};

/* ============================================================
   2. GLOBAL ALIASES
   (some pages reference window.SUPABASE_URL directly)
   ============================================================ */
window.MEI_CONFIG       = MEI_CONFIG;
window.SUPABASE_URL     = MEI_CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = MEI_CONFIG.SUPABASE_KEY;

/* ============================================================
   3. SUPABASE V2 CLIENT (shared instance)
   Loaded only if @supabase/supabase-js is present on the page.
   ============================================================ */
if (
    typeof window.supabase !== 'undefined' &&
    typeof window.supabase.createClient === 'function' &&
    !window.supabaseClient
) {
    try {
        window.supabaseClient = window.supabase.createClient(
            MEI_CONFIG.SUPABASE_URL,
            MEI_CONFIG.SUPABASE_KEY
        );
        console.log('✅ Supabase client initialised (shared).');
    } catch (err) {
        console.warn('⚠️ Supabase client init failed:', err);
    }
}

/* ============================================================
   4. REST INSERT HELPER  →  public.applications
   ============================================================ */
async function meiInsert(data, tableOverride) {
    const table = tableOverride || MEI_CONFIG.TABLE;

    try {
        const response = await fetch(
            `${MEI_CONFIG.SUPABASE_URL}/rest/v1/${table}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': MEI_CONFIG.SUPABASE_KEY,
                    'Authorization': `Bearer ${MEI_CONFIG.SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data)
            }
        );

        if (response.ok || response.status === 201) {
            return { ok: true };
        }

        const errorData = await response.json().catch(() => ({}));
        return {
            ok: false,
            message: errorData.message || `HTTP ${response.status}`
        };
    } catch (err) {
        return { ok: false, message: err.message || 'Network error' };
    }
}

/* ============================================================
   5. REST SELECT HELPER  →  any table / view
   ============================================================ */
async function meiSelect(table, query) {
    const qs = query || 'select=*';

    try {
        const response = await fetch(
            `${MEI_CONFIG.SUPABASE_URL}/rest/v1/${table}?${qs}`,
            {
                method: 'GET',
                headers: {
                    'apikey': MEI_CONFIG.SUPABASE_KEY,
                    'Authorization': `Bearer ${MEI_CONFIG.SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return {
                ok: false,
                data: [],
                message: errData.message || `HTTP ${response.status}`
            };
        }

        const data = await response.json();
        return { ok: true, data };
    } catch (err) {
        return { ok: false, data: [], message: err.message || 'Network error' };
    }
}

/* ============================================================
   6. ALERT TOGGLE HELPER
   ============================================================ */
function meiShowAlert(successEl, errorEl, ok, errorMessage) {
    if (ok) {
        if (successEl) successEl.classList.add('show');
        if (errorEl)   errorEl.classList.remove('show');

        if (successEl) {
            setTimeout(() => successEl.classList.remove('show'), 6000);
        }
    } else {
        if (errorMessage && errorEl) {
            errorEl.textContent = '❌ ' + errorMessage;
        }
        if (errorEl) errorEl.classList.add('show');
        if (successEl) successEl.classList.remove('show');

        if (errorEl) {
            setTimeout(() => errorEl.classList.remove('show'), 6000);
        }
    }
}

/* ============================================================
   7. LOADING STATE HELPER
   ============================================================ */
function meiSetLoading(btn, isLoading, idleHTML) {
    if (!btn) return;

    btn.disabled = isLoading;
    btn.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Submitting...'
        : idleHTML;
}

/* ============================================================
   8. FORMATTERS (shared across pages)
   ============================================================ */
function meiFormatDate(value, opts) {
    if (!value) return 'To be confirmed';

    const date = new Date(
        value.includes('T') ? value : value + 'T00:00:00'
    );

    return date.toLocaleDateString(
        'en-KE',
        opts || {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }
    );
}

function meiFormatTime(timeValue) {
    if (!timeValue) return '';

    const parts = String(timeValue).split(':');
    let hour = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    const period = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minutes} ${period}`;
}

function meiFormatTimeRange(start, end) {
    if (!start) return 'To be confirmed';
    const first = meiFormatTime(start);
    const second = end ? meiFormatTime(end) : '';
    return second ? `${first} – ${second}` : first;
}

function meiFormatPrice(price, currency) {
    if (price === null || price === undefined || Number(price) === 0) {
        return 'Contact MEI';
    }

    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency || 'KES',
        maximumFractionDigits: 0
    }).format(Number(price));
}

function meiEscapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function meiClean(value) {
    if (value === null || value === undefined) return null;
    const clean = String(value).trim();
    return clean || null;
}

/* ============================================================
   9. COMMON PAGE BEHAVIOUR
   (navbar scroll, mobile menu, smooth scroll, animations)
   ============================================================ */
function meiInitCommon() {
    const navbar   = document.getElementById('navbar');
    const menuBtn  = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    /* ---------- Sticky navbar ---------- */
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.pageYOffset > 50);
        }, { passive: true });
    }

    /* ---------- Mobile menu ---------- */
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            this.innerHTML = navLinks.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        document.addEventListener('click', function (e) {
            if (navLinks.classList.contains('active') &&
                !e.target.closest('.navbar')) {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    /* ---------- Smooth scroll for in-page anchors ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;

            e.preventDefault();

            const navHeight = navbar ? (navbar.offsetHeight || 70) : 70;
            const targetPosition =
                targetEl.getBoundingClientRect().top +
                window.pageYOffset - navHeight - 20;

            window.scrollTo({ top: targetPosition, behavior: 'smooth' });

            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    /* ---------- Animate on scroll ---------- */
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        observer.observe(el);
    });
}

/* ============================================================
   10. READY
   ============================================================ */
console.log('✅ MEI config.js loaded');
