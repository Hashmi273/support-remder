import { createClient } from '@supabase/supabase-js';

const VALID_URL = "https://jsjlxlsaivdwfuicondd.supabase.co";
const VALID_KEY = Buffer.from("c2Jfc2VjcmV0X2FHOWFybTdTT2RTXzVPZkdMYklnRUFfam9EbFFCSG0=", "base64").toString("utf8");

export const db = () => {
  return createClient(VALID_URL, VALID_KEY, {
    auth: { persistSession: false },
  });
};
