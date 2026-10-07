import { createClient } from '@supabase/supabase-js';

export const db = () => {
  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return createClient(url, key, {
    auth: { persistSession: false },
  });
};
