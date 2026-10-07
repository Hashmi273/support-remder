const SUPABASE_BASE_URL = "https://jsjlxlsaivdwfuicondd.supabase.co";
const B64_KEY = "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1wemFteDRiSE5oYVhaa2QyWjFhV052Ym1Sa0lpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT0RrMU5EY3lORE1zSW1WNGNDSTZNakV3TlRFeU16STBNMzAuSlQ3VHgyQTFDWENmb0dEaExyUDh6QjFjeUpHUmNhc003TTcwWWhYN2NoQQ==";

function getKey() {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(B64_KEY, 'base64').toString('utf8').trim();
  }
  return typeof atob !== 'undefined' ? atob(B64_KEY).trim() : '';
}

class QueryBuilder {
  constructor(table) {
    this.table = table;
    const key = getKey();
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    this.url = `${SUPABASE_BASE_URL}/rest/v1/${table}`;
    this.method = 'GET';
    this.body = null;
    this.filters = [];
  }

  select(fields = '*') {
    this.method = 'GET';
    return this;
  }

  insert(data) {
    this.method = 'POST';
    this.body = JSON.stringify(data);
    return this;
  }

  update(data) {
    this.method = 'PATCH';
    this.body = JSON.stringify(data);
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  eq(column, value) {
    this.filters.push(`${column}=eq.${encodeURIComponent(value)}`);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.filters.push(`order=${column}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  async then(resolve, reject) {
    try {
      let finalUrl = this.url;
      if (this.filters.length > 0) {
        finalUrl += '?' + this.filters.join('&');
      }
      const res = await fetch(finalUrl, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        cache: 'no-store'
      });
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = errText;
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.message || parsed.error || errText;
        } catch (_) {}
        resolve({ data: null, error: { message: errMsg } });
        return;
      }
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      resolve({ data, error: null });
    } catch (err) {
      resolve({ data: null, error: { message: err.message || 'Fetch error' } });
    }
  }
}

export const db = () => ({
  from: (table) => new QueryBuilder(table)
});
