
import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas pelo usuário
const SUPABASE_URL = 'https://lqqybpsvfwrutukkyvur.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_NUX9Xgrm1QiCbPsWx5tAWA_bPCmzPKB'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
