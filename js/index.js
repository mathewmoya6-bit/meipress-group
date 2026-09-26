// ============================================================
// MEI GROUP – HOMEPAGE SCRIPT
// ============================================================
(function () {
    'use strict';

    meiInitCommon();

    // FAQ ACCORDION
    document.querySelectorAll('.faq-item').forEach(function (item) {
        item.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    });

    // CONTACT FORM → SUPABASE
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById('contactSubmitBtn');
            const alertSuccess = document.getElementById('contactAlert');
            const alertError = document.getElementById('contactError');
            const idleHTML = '<i class="fas fa-paper-plane"></i> Send Message';

            const payload = {
                service: 'General Contact',
                full_name: document.getElementById('contactName').value.trim(),
                email: document.getElementById('contactEmail').value.trim(),
                phone: document.getElementById('contactPhone').value.trim(),
                subject: document.getElementById('contactSubject').value.trim(),
                message: document.getElementById('contactMessage').value.trim(),
                status: 'new',
                created_at: new Date().toISOString()
            };

            if (!payload.full_name || !payload.email ||
                !payload.subject || !payload.message) {
                meiShowAlert(alertSuccess, alertError, false,
                    'Please fill in all required fields.');
                return;
            }

            meiSetLoading(submitBtn, true, idleHTML);
            const result = await meiInsert(payload);
            meiSetLoading(submitBtn, false, idleHTML);

            if (result.ok) {
                contactForm.reset();
                meiShowAlert(alertSuccess, alertError, true);
            } else {
                meiShowAlert(alertSuccess, alertError, false,
                    'Submission failed: ' + (result.message || 'Please try again.'));
            }
        });
    }

    console.log('✅ MEI Group – Homepage loaded');
})();
