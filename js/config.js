const SUPABASE_URL="https://qkchnrrxrewmlvvxuuqe.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_-ki98JwzbWWiVXm7nzAAgQ_5H2qjXz7";

window.SUPABASE_URL=SUPABASE_URL;
window.SUPABASE_ANON_KEY=SUPABASE_ANON_KEY;

if(typeof supabase!=="undefined"){
window.supabaseClient=supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);
}

window.MEI_CONFIG={
supabaseUrl:SUPABASE_URL,
supabaseAnonKey:SUPABASE_ANON_KEY
};
