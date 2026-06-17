// js/supabase-config.js
(function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase library not loaded.');
        return;
    }
    if (typeof CONFIG === 'undefined') {
        console.error('❌ CONFIG not defined.');
        return;
    }
    try {
        const supabaseClient = supabase.createClient(
            CONFIG.SUPABASE.URL,
            CONFIG.SUPABASE.ANON_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            }
        );
        window.supabaseClient = supabaseClient;
        console.log('✅ Supabase client initialized');

        const Auth = {
            getSession: async () => {
                try {
                    const { data, error } = await supabaseClient.auth.getSession();
                    if (error) throw error;
                    return data.session;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
            signIn: async (email, password) => {
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                return data;
            },
            signUp: async (email, password, userData) => {
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: { data: userData }
                });
                if (error) throw error;
                return data;
            },
            signOut: async () => {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;
            },
            resetPassword: async (email) => {
                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/pages/reset-password.html'
                });
                if (error) throw error;
            }
        };
        window.Auth = Auth;

        const DB = {
            createInquiry: async (data) => {
                try {
                    const { data: result, error } = await supabaseClient
                        .from('inquiries')
                        .insert([data])
                        .select()
                        .single();
                    if (error) throw error;
                    return result;
                } catch (error) {
                    console.error('DB error:', error);
                    throw error;
                }
            },
            getInquiries: async (filters = {}) => {
                try {
                    let query = supabaseClient
                        .from('inquiries')
                        .select('*')
                        .order('created_at', { ascending: false });
                    if (filters.status) {
                        query = query.eq('status', filters.status);
                    }
                    const { data, error } = await query;
                    if (error) throw error;
                    return data;
                } catch (error) {
                    console.error('DB error:', error);
                    return [];
                }
            },
            updateInquiryStatus: async (id, status) => {
                try {
                    const { data, error } = await supabaseClient
                        .from('inquiries')
                        .update({ status, updated_at: new Date() })
                        .eq('id', id)
                        .select()
                        .single();
                    if (error) throw error;
                    return data;
                } catch (error) {
                    console.error('DB error:', error);
                    throw error;
                }
            }
        };
        window.DB = DB;
        console.log('✅ Auth and DB helpers initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
    }
})();
