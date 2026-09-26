// ============================================================
// MEI GROUP – SHARED CONFIGURATION & HELPERS
// ============================================================

const MEI_CONFIG = {
    SUPABASE_URL: 'https://qkchnrrxrewmlvvxuuqe.supabase.co',
    SUPABASE_KEY: 'sb_publishable_-ki98JwzbWWiVXm7nzAAgQ_5H2qjXz7',
    TABLE: 'applications'
};

async function meiInsert(data) {
    try {
        const response = await fetch(
            `${MEI_CONFIG.SUPABASE_URL}/rest/v1/${MEI_CONFIG.TABLE}`,
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
        if (response.ok || response.status === 201) return { ok: true };
        const errorData = await response.json().catch(() => ({}));
        return { ok: false, message: errorData.message || `HTTP ${response.status}` };
    } catch (err) {
        return { ok: false, message: err.message || 'Network error' };
    }
}

function meiShowAlert(successEl, errorEl, ok, errorMessage) {
    if (ok) {
        successEl.classList.add('show');
        errorEl.classList.remove('show');
        setTimeout(() => successEl.classList.remove('show'), 6000);
    } else {
        if (errorMessage) errorEl.textContent = '❌ ' + errorMessage;
        errorEl.classList.add('show');
        setTimeout(() => errorEl.classList.remove('show'), 6000);
    }
}

function meiSetLoading(btn, isLoading, idleHTML) {
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Submitting...'
        : idleHTML;
}

function meiInitCommon() {
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.pageYOffset > 50);
        }, { passive: true });
    }

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            this.innerHTML = navLinks.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        document.addEventListener('click', function (e) {
            if (navLinks.classList.contains('active') && !e.target.closest('.navbar')) {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

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

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        observer.observe(el);
    });
}
