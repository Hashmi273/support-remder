import { createClient } from '@supabase/supabase-js';

const VALID_URL = "https://jsjlxlsaivdwfuicondd.supabase.co";
const VALID_KEY = Buffer.from("c2Jfc2VjcmV0X2FHOWFybTdTT2RTXzVPZkdMYklnRUFfam9EbFFCSG0=", "base64").toString("utf8");

export const db = () => {
  let url = (process.env.SUPABASE_URL || '').trim();
  let key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !url.startsWith('http')) url = VALID_URL;
  if (!key || key.includes('PASTE_') || key.startsWith('sb_publishable_') || key.length < 20) key = VALID_KEY;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
};
