// ============================================================
// MEI GROUP – ROAD SAFETY TRAINING PAGE SCRIPT
// ============================================================
(function () {
    'use strict';

    // ===== NAVBAR =====
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.pageYOffset > 50);
    }, { passive: true });

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

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;

            e.preventDefault();
            const navHeight = navbar.offsetHeight || 70;
            const targetPosition =
                targetEl.getBoundingClientRect().top +
                window.pageYOffset - navHeight - 20;

            window.scrollTo({ top: targetPosition, behavior: 'smooth' });

            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    // ===== ANIMATE ON SCROLL =====
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        observer.observe(el);
    });

    // ===== ROAD SAFETY FORM → SUPABASE =====
    const form = document.getElementById('roadsafetyForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const alertSuccess = document.getElementById('formAlert');
            const alertError = document.getElementById('formError');
            const idleHTML = '<i class="fas fa-paper-plane"></i> Submit Application';

            const payload = {
                service: 'Road Safety Training',
                full_name: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                organization: document.getElementById('organization').value.trim(),
                training_type: document.getElementById('trainingType').value,
                participants: document.getElementById('participants').value,
                preferred_date: document.getElementById('preferredDate').value,
                location: document.getElementById('location').value.trim(),
                additional_info: document.getElementById('additionalInfo').value.trim(),
                status: 'pending',
                created_at: new Date().toISOString()
            };

            if (!payload.full_name || !payload.email ||
                !payload.phone || !payload.training_type) {
                meiShowAlert(alertSuccess, alertError, false,
                    'Please fill in all required fields.');
                return;
            }

            meiSetLoading(submitBtn, true, idleHTML);
            const result = await meiInsert(payload);
            meiSetLoading(submitBtn, false, idleHTML);

            if (result.ok) {
                form.reset();
                meiShowAlert(alertSuccess, alertError, true);
            } else {
                meiShowAlert(alertSuccess, alertError, false,
                    'Submission failed: ' + (result.message || 'Please try again.'));
            }
        });
    }

    console.log('✅ MEI Group – Road Safety Training page loaded');
})();
