const SUPABASE_BASE_URL = "https://jsjlxlsaivdwfuicondd.supabase.co";

const KEY_CODES = [101,121,74,104,98,71,99,105,79,105,74,73,85,122,73,49,78,105,73,115,73,110,82,53,99,67,73,54,73,107,112,88,86,67,74,57,46,101,121,74,112,99,51,77,105,79,105,74,122,100,88,66,104,89,109,70,122,90,83,73,115,73,110,74,108,90,105,73,54,73,109,72,112,122,97,109,120,52,98,72,78,104,97,88,90,107,100,50,90,49,97,87,78,118,98,109,82,107,73,105,119,105,99,109,57,115,90,83,73,54,73,109,70,117,98,50,52,105,76,67,74,112,89,88,81,105,79,106,69,51,79,68,107,49,78,68,99,121,78,68,77,115,73,109,86,52,99,67,73,54,77,106,69,119,78,84,69,121,77,122,73,48,77,51,48,46,74,84,55,84,120,50,65,49,67,88,67,102,111,71,68,104,76,114,80,56,122,66,49,99,121,74,71,82,99,97,115,77,55,77,55,48,89,104,88,55,99,104,65];

function getKey() {
  return String.fromCharCode.apply(null, KEY_CODES);
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
