import { createClient } from '@supabase/supabase-js';

const VALID_URL = "https://jsjlxlsaivdwfuicondd.supabase.co";
const B64_KEY = "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1wemFteDRiSE5oYVhaa2QyWjFhV052Ym1Sa0lpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT0RrMU5EY3lORE1zSW1WNGNDSTZNakV3TlRFeU16STBNMzAuSlQ3VHgyQTFDWENmb0dEaExyUDh6QjFjeUpHUmNhc003TTcwWWhYN2NoQQ==";

export const db = () => {
  const key = typeof Buffer !== 'undefined'
    ? Buffer.from(B64_KEY, 'base64').toString('utf8').trim()
    : atob(B64_KEY).trim();
  return createClient(VALID_URL, key, {
    auth: { persistSession: false },
  });
};
