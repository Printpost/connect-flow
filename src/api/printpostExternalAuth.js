// External Printpost public API auth client
// Isolated from internal backend client

const EXTERNAL_BASE = 'https://api.printpost.com.br/v1';

function buildExternalUrl(endpoint) {
  const base = EXTERNAL_BASE.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

function buildHeaders(extra = {}) {
  return new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    ...extra,
  });
}

async function handleResponse(res) {
  const ct = res.headers.get('Content-Type') || '';
  let payload = null;
  if (ct.includes('application/json')) {
    payload = await res.json();
  } else {
    const text = await res.text();
    payload = text ? { message: text } : null;
  }
  if (!res.ok) {
    const detail = payload?.errors?.[0]?.detail || payload?.message || res.statusText;
    const type = payload?.errors?.[0]?.code || 'external_auth_error';
    const err = new Error(detail || 'Falha na autenticação externa');
    err.status = res.status;
    err.type = type;
    err.payload = payload;
    throw err;
  }
  return payload;
}

export async function externalLogin({ email, password }) {
  const body = { email, password };
  const res = await fetch(buildExternalUrl('/Accounts/auth'), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
    // Mode cors implicitly; rely on server CORS headers
  });
  return handleResponse(res);
}

export function getExternalBaseUrl() { return EXTERNAL_BASE; }
