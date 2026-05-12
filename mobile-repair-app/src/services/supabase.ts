import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/** Supabase client singleton.
 * Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 * in your .env file. See .env.example for reference.
 */
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl
  ?? process.env.EXPO_PUBLIC_SUPABASE_URL
  ?? 'https://uhqzvbkyuqptlusttgwo.supabase.co';

const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey
  ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? 'sb_publishable_AuBwryA6ZKbaY7WTs9FUUA_PrQZ-LJC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
