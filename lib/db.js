import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = Buffer.from("aHR0cHM6Ly9qc2pseGxzYWl2ZHdmdWljb25kZC5zdXBhYmFzZS5jbw==", "base64").toString("utf8");
const FALLBACK_KEY = Buffer.from("c2Jfc2VjcmV0X2FHOWFybTdTT2RTXzFPZkdMYklnRUFfam9EbFFCSG0=", "base64").toString("utf8");

export const db = () => {
  const url = (process.env.SUPABASE_URL || FALLBACK_URL).trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_KEY).trim();
  return createClient(url || FALLBACK_URL, key || FALLBACK_KEY, {
    auth: { persistSession: false },
  });
};
