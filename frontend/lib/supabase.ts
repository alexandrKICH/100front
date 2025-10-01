import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const testConnection = async (): Promise<boolean> => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or key is missing');
      return false;
    }

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};
