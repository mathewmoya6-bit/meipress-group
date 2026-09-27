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

    // CONTACT FORM
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn    = document.getElementById('contactSubmitBtn');
            const alertSuccess = document.getElementById('contactAlert');
            const alertError   = document.getElementById('contactError');
            const idleHTML     = '<i class="fas fa-paper-plane"></i> Send Message';

            const payload = {
                service:   'General Contact',
                full_name: document.getElementById('contactName').value.trim(),
                email:     document.getElementById('contactEmail').value.trim(),
                phone:     document.getElementById('contactPhone').value.trim(),
                subject:   document.getElementById('contactSubject').value.trim(),
                message:   document.getElementById('contactMessage').value.trim(),
                status:    'new'
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

    // FEATURED SESSIONS
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;

    async function loadFeaturedSessions() {
        try {
            const today = new Date().toISOString().split('T')[0];

            const query =
                `training_sessions_full?` +
                `select=*` +
                `&status=in.(open,scheduled)` +
                `&start_date=gte.${today}` +
                `&order=start_date.asc` +
                `&limit=6`;

            const res = await fetch(
                `${MEI_CONFIG.SUPABASE_URL}/rest/v1/${query}`,
                {
                    method: 'GET',
                    headers: {
                        'apikey': MEI_CONFIG.SUPABASE_KEY,
                        'Authorization': `Bearer ${MEI_CONFIG.SUPABASE_KEY}`
                    }
                }
            );

            if (!res.ok) throw new Error('HTTP ' + res.status);

            const sessions = await res.json();

            if (!Array.isArray(sessions) || sessions.length === 0) {
                grid.innerHTML = `
                    <div class="featured-empty">
                        <i class="fas fa-calendar-times"></i>
                        <p>No upcoming sessions at the moment. Please check back soon.</p>
                        <a href="training-calendar.html" class="btn-primary" style="margin-top:16px;">
                            <i class="fas fa-calendar-alt"></i> View Full Calendar
                        </a>
                    </div>
                `;
                return;
            }

            grid.innerHTML = sessions.map(renderSessionCard).join('');

            // Attach register handlers
            grid.querySelectorAll('.btn-register').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const sessionId = this.dataset.sessionId;
                    if (!sessionId) return;

                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening...';

                    if (window.MEI_DB && MEI_DB.Router) {
                        MEI_DB.Router.openRegistration(sessionId);
                    } else {
                        window.location.href =
                            `training-registration.html?session_id=${sessionId}`;
                    }
                });
            });

        } catch (err) {
            console.error('Failed to load featured sessions:', err);
            grid.innerHTML = `
                <div class="featured-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to load sessions right now.</p>
                    <a href="training-calendar.html" class="btn-primary" style="margin-top:16px;">
                        <i class="fas fa-calendar-alt"></i> View Full Calendar
                    </a>
                </div>
            `;
        }
    }

    function renderSessionCard(s) {
        const serviceKey = mapServiceKey(s.service);
        const seatsTotal = Number(s.capacity || 0);
        const seatsTaken = Number(s.registered_count || 0);
        const seatsAvail = Number(s.available_seats || 0);
        const seatsPct   = seatsTotal > 0
            ? Math.min(100, Math.round((seatsTaken / seatsTotal) * 100))
            : 0;
        const isFull = seatsAvail <= 0;

        return `
            <div class="featured-card">
                <div class="badge-row">
                    <span class="service-badge ${serviceKey}">${escapeHtml(s.service || 'Training')}</span>
                    <span class="status-dot"></span>
                </div>
                <h4>${escapeHtml(s.session_title || s.course_name || 'Training Session')}</h4>
                <div class="meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(s.start_date)}</span>
                    <span><i class="far fa-clock"></i> ${formatTimeRange(s.start_time, s.end_time)}</span>
                    <span><i class="fas fa-location-dot"></i> ${escapeHtml(s.venue || 'TBC')}</span>
                    <span><i class="fas fa-user-tie"></i> ${escapeHtml(s.trainer || 'MEI Group')}</span>
                    <span><i class="fas fa-tag"></i> <span class="price">${formatPrice(s.price_kes)}</span></span>
                </div>
                <div class="seats-bar"><div class="seats-fill" style="width:${seatsPct}%"></div></div>
                <div class="seats-label">
                    ${isFull ? 'Session full' : `${seatsAvail} of ${seatsTotal} seats available`}
                </div>
                <button class="btn-register" ${isFull ? 'disabled' : ''} data-session-id="${s.id}">
                    <i class="fas fa-user-plus"></i> ${isFull ? 'Session Full' : 'Register Now'}
                </button>
            </div>
        `;
    }

    function mapServiceKey(service) {
        if (!service) return 'osh';
        const s = service.toLowerCase();
        if (s.includes('education')) return 'education';
        if (s.includes('road'))      return 'roadsafety';
        return 'osh';
    }

    function formatDate(value) {
        if (!value) return 'TBC';
        return new Date(value + 'T00:00:00').toLocaleDateString('en-KE', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });
    }

    function formatTimeRange(start, end) {
        if (!start) return 'TBC';
        const fmt = (t) => {
            if (!t) return '';
            const [h, m] = t.split(':');
            let hour = parseInt(h, 10);
            const suffix = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            return `${hour}:${m || '00'} ${suffix}`;
        };
        return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
    }

    function formatPrice(price) {
        if (!price || Number(price) === 0) return 'Contact MEI';
        return 'KES ' + Number(price).toLocaleString('en-KE');
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    loadFeaturedSessions();

    console.log('✅ MEI Group – Homepage loaded');
})();
