// ============================================================
// MEI GROUP – SUPABASE MODULE
// Centralised client + all DB operations
// Requires: @supabase/supabase-js v2 (loaded via CDN)
// Depends on:  js/config.js  (for MEI_CONFIG)
// ============================================================

/* ============================================================
   1. CLIENT INITIALISATION
   ============================================================ */
(function initSupabaseClient() {
    'use strict';

    if (typeof window.supabase === 'undefined' ||
        typeof window.supabase.createClient !== 'function') {
        console.warn('⚠️ Supabase JS v2 not loaded. Add the CDN script before js/supabase.js');
        return;
    }

    if (window.supabaseClient) {
        console.log('✅ Supabase client already exists.');
        return;
    }

    const url = (window.MEI_CONFIG && window.MEI_CONFIG.SUPABASE_URL) ||
                window.SUPABASE_URL;

    const key = (window.MEI_CONFIG && window.MEI_CONFIG.SUPABASE_KEY) ||
                window.SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('❌ Missing Supabase URL or key. Check js/config.js');
        return;
    }

    try {
        window.supabaseClient = window.supabase.createClient(url, key);
        console.log('✅ Supabase client initialised.');
    } catch (err) {
        console.error('❌ Supabase client init failed:', err);
    }
})();


/* ============================================================
   2. NAMESPACE
   ============================================================ */
window.MEI_DB = (function () {
    'use strict';

    /* --------------------------------------------------------
       Internal helpers
       -------------------------------------------------------- */
    function client() {
        if (!window.supabaseClient) {
            throw new Error('Supabase client not initialised. Load js/supabase.js after the CDN script.');
        }
        return window.supabaseClient;
    }

    function clean(value) {
        if (value === null || value === undefined) return null;
        const s = String(value).trim();
        return s || null;
    }

    function toInt(value) {
        if (value === null || value === undefined || value === '') return null;
        const n = parseInt(value, 10);
        return isNaN(n) ? null : n;
    }

    function toNumber(value) {
        if (value === null || value === undefined || value === '') return null;
        const n = Number(value);
        return isNaN(n) ? null : n;
    }

    function cleanObject(obj) {
        const out = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                out[key] = clean(obj[key]);
            }
        }
        return out;
    }

    /* ========================================================
       A. APPLICATIONS (general contact + service applications)
       ======================================================== */
    const Applications = {

        /**
         * Insert a new application/contact submission.
         * @param {Object} data
         * @returns {Promise<{ok: boolean, id?: number, error?: string}>}
         */
        async insert(data) {
            try {
                const payload = cleanObject(data);

                const { data: row, error } = await client()
                    .from('applications')
                    .insert(payload)
                    .select('id')
                    .single();

                if (error) throw error;
                return { ok: true, id: row.id };
            } catch (err) {
                console.error('Applications.insert error:', err);
                return { ok: false, error: err.message };
            }
        },

        /**
         * Fetch applications, optionally filtered by service.
         * @param {Object} opts  { service, status, limit, order }
         */
        async list(opts = {}) {
            try {
                let query = client()
                    .from('applications')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (opts.service) query = query.eq('service', opts.service);
                if (opts.status)  query = query.eq('status', opts.status);
                if (opts.limit)   query = query.limit(opts.limit);

                const { data, error } = await query;
                if (error) throw error;
                return { ok: true, data: data || [] };
            } catch (err) {
                console.error('Applications.list error:', err);
                return { ok: false, data: [], error: err.message };
            }
        },

        /**
         * Update an application (status, notes, etc.).
         */
        async update(id, changes) {
            try {
                const { error } = await client()
                    .from('applications')
                    .update(changes)
                    .eq('id', id);

                if (error) throw error;
                return { ok: true };
            } catch (err) {
                console.error('Applications.update error:', err);
                return { ok: false, error: err.message };
            }
        },

        /**
         * Delete an application.
         */
        async remove(id) {
            try {
                const { error } = await client()
                    .from('applications')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { ok: true };
            } catch (err) {
                console.error('Applications.remove error:', err);
                return { ok: false, error: err.message };
            }
        }
    };

    /* ========================================================
       B. TRAINING COURSES
       ======================================================== */
    const Courses = {

        async list(serviceFilter) {
            try {
                let query = client()
                    .from('training_courses')
                    .select('*')
                    .eq('is_active', true)
                    .order('service', { ascending: true })
                    .order('name', { ascending: true });

                if (serviceFilter) query = query.eq('service', serviceFilter);

                const { data, error } = await query;
                if (error) throw error;
                return { ok: true, data: data || [] };
            } catch (err) {
                console.error('Courses.list error:', err);
                return { ok: false, data: [], error: err.message };
            }
        },

        async getById(id) {
            try {
                const { data, error } = await client()
                    .from('training_courses')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Courses.getById error:', err);
                return { ok: false, data: null, error: err.message };
            }
        },

        async create(course) {
            try {
                const { data, error } = await client()
                    .from('training_courses')
                    .insert(course)
                    .select()
                    .single();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Courses.create error:', err);
                return { ok: false, error: err.message };
            }
        },

        async update(id, changes) {
            try {
                const { error } = await client()
                    .from('training_courses')
                    .update(changes)
                    .eq('id', id);

                if (error) throw error;
                return { ok: true };
            } catch (err) {
                console.error('Courses.update error:', err);
                return { ok: false, error: err.message };
            }
        }
    };

    /* ========================================================
       C. TRAINING SESSIONS
       ======================================================== */
    const Sessions = {

        /**
         * List sessions from public_training_calendar (view).
         * Automatically excludes cancelled/postponed unless asked.
         */
        async listPublic(opts = {}) {
            try {
                let query = client()
                    .from('public_training_calendar')
                    .select('*')
                    .order('session_date', { ascending: true });

                if (opts.upcoming) {
                    const today = new Date().toISOString().split('T')[0];
                    query = query.gte('session_date', today);
                }

                if (opts.service) {
                    query = query.eq('service', opts.service);
                }

                if (opts.statuses) {
                    query = query.in('status', opts.statuses);
                } else if (!opts.includeAllStatuses) {
                    query = query.not(
                        'status',
                        'in',
                        '(cancelled,postponed)'
                    );
                }

                if (opts.limit) query = query.limit(opts.limit);

                const { data, error } = await query;
                if (error) throw error;
                return { ok: true, data: data || [] };
            } catch (err) {
                console.error('Sessions.listPublic error:', err);
                return { ok: false, data: [], error: err.message };
            }
        },

        /**
         * Fetch a single session by its ID from the view.
         */
        async getPublicById(sessionId) {
            try {
                const { data, error } = await client()
                    .from('public_training_calendar')
                    .select('*')
                    .eq('session_id', sessionId)
                    .maybeSingle();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Sessions.getPublicById error:', err);
                return { ok: false, data: null, error: err.message };
            }
        },

        /**
         * Raw session record (admin).
         */
        async getById(id) {
            try {
                const { data, error } = await client()
                    .from('training_sessions')
                    .select('*, training_courses(*)')
                    .eq('id', id)
                    .maybeSingle();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Sessions.getById error:', err);
                return { ok: false, data: null, error: err.message };
            }
        },

        /**
         * Full list (admin).
         */
        async listAll(opts = {}) {
            try {
                let query = client()
                    .from('training_sessions')
                    .select('*, training_courses(name, code, service)')
                    .order('start_date', { ascending: false });

                if (opts.status) query = query.eq('status', opts.status);
                if (opts.limit)  query = query.limit(opts.limit);

                const { data, error } = await query;
                if (error) throw error;
                return { ok: true, data: data || [] };
            } catch (err) {
                console.error('Sessions.listAll error:', err);
                return { ok: false, data: [], error: err.message };
            }
        },

        async create(session) {
            try {
                const { data, error } = await client()
                    .from('training_sessions')
                    .insert(session)
                    .select()
                    .single();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Sessions.create error:', err);
                return { ok: false, error: err.message };
            }
        },

        async update(id, changes) {
            try {
                const { error } = await client()
                    .from('training_sessions')
                    .update(changes)
                    .eq('id', id);

                if (error) throw error;
                return { ok: true };
            } catch (err) {
                console.error('Sessions.update error:', err);
                return { ok: false, error: err.message };
            }
        },

        async remove(id) {
            try {
                const { error } = await client()
                    .from('training_sessions')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { ok: true };
            } catch (err) {
                console.error('Sessions.remove error:', err);
                return { ok: false, error: err.message };
            }
        },

        /**
         * Count confirmed registrations for a session.
         */
        async countRegistrations(sessionId) {
            try {
                const { count, error } = await client()
                    .from('training_registrations')
                    .select('id', { count: 'exact', head: true })
                    .eq('session_id', sessionId)
                    .in('registration_status', [
                        'registered', 'confirmed', 'completed'
                    ]);

                if (error) throw error;
                return { ok: true, count: count || 0 };
            } catch (err) {
                console.error('Sessions.countRegistrations error:', err);
                return { ok: false, count: 0, error: err.message };
            }
        }
    };

    /* ========================================================
       D. TRAINING REGISTRATIONS
       ======================================================== */
    const Registrations = {

        /**
         * Insert a new registration.
         */
        async create(registration) {
            try {
                const payload = {
                    session_id:          registration.session_id,
                    application_id:      registration.application_id || null,
                    registration_number: registration.registration_number || null,
                    full_name:           clean(registration.full_name),
                    email:               clean(registration.email),
                    phone:               clean(registration.phone),
                    organization:        clean(registration.organization),
                    job_title:           clean(registration.job_title),
                    participant_type:    clean(registration.participant_type),
                    amount_due:          toNumber(registration.amount_due) || 0,
                    amount_paid:         toNumber(registration.amount_paid) || 0,
                    payment_status:      registration.payment_status || 'unpaid',
                    registration_status: registration.registration_status || 'registered',
                    notes:               clean(registration.notes)
                };

                const { data, error } = await client()
                    .from('training_registrations')
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Registrations.create error:', err);
                return { ok: false, error: err.message };
            }
        },

        /**
         * Check for an existing registration by email or phone
         * for a given session.
         */
        async findDuplicate(sessionId, email, phone) {
            try {
                const filters = [];
                if (email) filters.push(`email.eq.${email}`);
                if (phone) filters.push(`phone.eq.${phone}`);

                if (filters.length === 0) {
                    return { ok: true, data: null };
                }

                const { data, error } = await client()
                    .from('training_registrations')
                    .select('id, registration_number, email, phone')
                    .eq('session_id', sessionId)
                    .or(filters.join(','))
                    .limit(1)
                    .maybeSingle();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.warn('Registrations.findDuplicate error:', err);
                return { ok: true, data: null }; // fail open
            }
        },

        /**
         * List registrations for a session (admin).
         */
        async listBySession(sessionId) {
            try {
                const { data, error } = await client()
                    .from('training_registrations')
                    .select('*')
                    .eq('session_id', sessionId)
                    .order('registered_at', { ascending: false });

                if (error) throw error;
                return { ok: true, data: data || [] };
            } catch (err) {
                console.error('Registrations.listBySession error:', err);
                return { ok: false, data: [], error: err.message };
            }
        },

        /**
         * List all registrations (admin).
         */
        async listAll(opts = {}) {
            try {
                let query = client()
                    .from('training_registrations')
                    .select(`
                        *,
                        training_sessions (
                            id,
                            start_date,
                            session_title,
                            training_courses (name, service)
                        )
                    `)
                    .order('registered_at', { ascending: false });

                if (opts.paymentStatus) {
                    query = query.eq('payment_status', opts.paymentStatus);
                }
                if (opts.registrationStatus) {
                    query = query.eq('registration_status', opts.registrationStatus);
                }
                if (opts.limit) query = query.limit(opts.limit);

                const { data, error } = await query;
                if (error) throw error;
                return { ok: true, data: data || [] };
            } catch (err) {
                console.error('Registrations.listAll error:', err);
                return { ok: false, data: [], error: err.message };
            }
        },

        async update(id, changes) {
            try {
                const { error } = await client()
                    .from('training_registrations')
                    .update(changes)
                    .eq('id', id);

                if (error) throw error;
                return { ok: true };
            } catch (err) {
                console.error('Registrations.update error:', err);
                return { ok: false, error: err.message };
            }
        },

        async remove(id) {
            try {
                const { error } = await client()
                    .from('training_registrations')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { ok: true };
            } catch (err) {
                console.error('Registrations.remove error:', err);
                return { ok: false, error: err.message };
            }
        }
    };

    /* ========================================================
       E. ATTENDANCE
       ======================================================== */
    const Attendance = {

        async mark({ registration_id, session_id, attended, day_number, remarks }) {
            try {
                const payload = {
                    registration_id,
                    session_id,
                    attended: attended === true,
                    day_number: toInt(day_number) || 1,
                    check_in_time: attended ? new Date().toISOString() : null,
                    remarks: clean(remarks)
                };

                const { data, error } = await client()
                    .from('training_attendance')
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Attendance.mark error:', err);
                return { ok: false, error: err.message };
            }
        },

        async listBySession(sessionId) {
            try {
                const { data, error } = await client()
                    .from('training_attendance')
                    .select('*')
                    .eq('session_id', sessionId);

                if (error) throw error;
                return { ok: true, data: data || [] };
            } catch (err) {
                console.error('Attendance.listBySession error:', err);
                return { ok: false, data: [], error: err.message };
            }
        },

        async listByRegistration(registrationId) {
            try {
                const { data, error } = await client()
                    .from('training_attendance')
                    .select('*')
                    .eq('registration_id', registrationId)
                    .order('day_number', { ascending: true });

                if (error) throw error;
                return { ok: true, data: data || [] };
            } catch (err) {
                console.error('Attendance.listByRegistration error:', err);
                return { ok: false, data: [], error: err.message };
            }
        }
    };

    /* ========================================================
       F. CERTIFICATES
       ======================================================== */
    const Certificates = {

        /**
         * Issue a certificate.
         */
        async issue(certificate) {
            try {
                const payload = {
                    registration_id: certificate.registration_id,
                    certificate_no:  certificate.certificate_no,
                    issued_date:     certificate.issued_date || new Date().toISOString().split('T')[0],
                    expiry_date:     certificate.expiry_date || null,
                    grade:           clean(certificate.grade),
                    issued_by:       certificate.issued_by || 'MEI Group',
                    verification_url: certificate.verification_url || null
                };

                const { data, error } = await client()
                    .from('training_certificates')
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Certificates.issue error:', err);
                return { ok: false, error: err.message };
            }
        },

        async getByRegistration(registrationId) {
            try {
                const { data, error } = await client()
                    .from('training_certificates')
                    .select('*')
                    .eq('registration_id', registrationId)
                    .maybeSingle();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Certificates.getByRegistration error:', err);
                return { ok: false, data: null, error: err.message };
            }
        },

        async verify(certificateNo) {
            try {
                const { data, error } = await client()
                    .from('training_certificates')
                    .select(`
                        *,
                        training_registrations (
                            full_name,
                            email,
                            training_sessions (
                                start_date,
                                training_courses (name, service)
                            )
                        )
                    `)
                    .eq('certificate_no', certificateNo)
                    .maybeSingle();

                if (error) throw error;
                return { ok: true, data };
            } catch (err) {
                console.error('Certificates.verify error:', err);
                return { ok: false, data: null, error: err.message };
            }
        }
    };

    /* ========================================================
       G. DASHBOARD STATS (admin)
       ======================================================== */
    const Stats = {

        async summary() {
            try {
                const [apps, sessions, regs, certs] = await Promise.all([
                    client().from('applications').select('id', { count: 'exact', head: true }),
                    client().from('training_sessions').select('id', { count: 'exact', head: true }),
                    client().from('training_registrations').select('id', { count: 'exact', head: true }),
                    client().from('training_certificates').select('id', { count: 'exact', head: true })
                ]);

                return {
                    ok: true,
                    applications:  apps.count || 0,
                    sessions:      sessions.count || 0,
                    registrations: regs.count || 0,
                    certificates:  certs.count || 0
                };
            } catch (err) {
                console.error('Stats.summary error:', err);
                return {
                    ok: false,
                    applications: 0,
                    sessions: 0,
                    registrations: 0,
                    certificates: 0,
                    error: err.message
                };
            }
        }
    };

    /* ========================================================
       H. UTILITIES
       ======================================================== */
    const Utils = {

        /**
         * Generate a temporary registration number.
         * (For production, replace with a DB sequence / trigger.)
         */
        generateRegistrationNumber() {
            const year = new Date().getFullYear();
            const rand = Math.floor(100000 + Math.random() * 900000);
            return `MEI-TR-${year}-${rand}`;
        },

        /**
         * Simple email validator.
         */
        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
        },

        /**
         * Simple phone validator (Kenya-friendly).
         */
        isValidPhone(phone) {
            const cleaned = String(phone || '').replace(/\s+/g, '');
            return /^(\+?254|0)[17]\d{8}$/.test(cleaned);
        },

        /**
         * Check if Supabase is connected.
         */
        isReady() {
            return !!window.supabaseClient;
        }
    };

    /* ========================================================
       PUBLIC API
       ======================================================== */
    return {
        Applications,
        Courses,
        Sessions,
        Registrations,
        Attendance,
        Certificates,
        Stats,
        Utils,

        /** Direct access to the raw Supabase client if needed */
        get client() {
            return window.supabaseClient;
        }
    };

})();

/* ============================================================
   11. READY
   ============================================================ */
console.log('✅ MEI supabase.js loaded — use window.MEI_DB');
