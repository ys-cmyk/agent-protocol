import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials
const supabaseUrl = 'https://ffstfhgcvgnienydvxlw.supabase.co';
const supabaseAnonKey = 'sb_publishable_QGiRPnoLt_GQTEczXlc1jQ_l_lYiM0r';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
