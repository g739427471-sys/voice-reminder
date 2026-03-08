
// Supabase Client Initialization
const SUPABASE_URL = 'https://urcofukhutikgjkvmjjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY29mdWtodXRpa2dqa3ZtampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTk1MzgsImV4cCI6MjA4ODQ3NTUzOH0.ZVGB3FGC1hs7ggRRlAXv52sMJ5fhjtYA5yXP3IVp-iA';

// 确保已引入 supabase-js
if (typeof supabase === 'undefined') {
    console.error('Supabase client library not found! Please include it in your HTML.');
} else {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
