// js/supabase-config.js
const { createClient } = supabase;

const supabaseClient = createClient(
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

const Auth = {
    getSession: async () => {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return data.session;
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
    }
};
window.Auth = Auth;

const DB = {
    createInquiry: async (data) => {
        const { data: result, error } = await supabaseClient
            .from('inquiries')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return result;
    },
    getInquiries: async (filters = {}) => {
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
    }
};
window.DB = DB;
