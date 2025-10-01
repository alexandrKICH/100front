import { createClient } from '@supabase/supabase-js';

// Прямые значения для разработки
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diaksuzdtmbwnnioyztz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYWtzdXpkdG1id25uaW95enR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTk5NTgsImV4cCI6MjA3NDczNTk1OH0.KXW3HsrJoaLMIR0rFeowm2CxsMgsgY-IKbbOSZLSQBc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};