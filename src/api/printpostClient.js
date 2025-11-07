// @ts-nocheck
const DEFAULT_API_BASE_URL = 'https://api.printpost.com.br/v1';
const API_BASE_URL = import.meta.env.VITE_PRINTPOST_API_URL || DEFAULT_API_BASE_URL;

function buildUrl(endpoint) {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

function buildHeaders(token, extraHeaders = {}) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...extraHeaders,
  });

  if (token) {
    headers.set('Authorization', token);
  }

  return headers;
}

async function handleResponse(response) {
  const contentType = response.headers.get('Content-Type');
  let payload = null;

  if (contentType && contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    const text = await response.text();
    payload = text ? { message: text } : null;
  }

  if (!response.ok) {
    const detail = payload?.errors?.[0]?.detail || payload?.message || response.statusText;
    const type = payload?.errors?.[0]?.code || 'unknown_error';
    const error = new Error(detail || 'Erro na requisição');
    error.status = response.status;
    error.type = type;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (err) {
    // ECONNREFUSED, DNS, etc.
    const error = new Error('Falha de conexão com o servidor');
    error.type = 'network_unreachable';
    error.cause = err;
    throw error;
  }
}

export async function loginRequest({ email, password }) {
  const body = {
    email: email.trim().toLowerCase(),
    password,
  };

  const response = await safeFetch(buildUrl('/Accounts/auth'), {
    method: 'POST',
    headers: buildHeaders(null),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

export async function validateTwoFactorCode({ userId, code }) {
  const body = {
    email: userId,
    password: code,
  };

  const response = await safeFetch(buildUrl('/Accounts/validate-code'), {
    method: 'POST',
    headers: buildHeaders(null),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

export async function resendTwoFactorCode({ userId }) {
  const response = await safeFetch(buildUrl('/Accounts/resend-code'), {
    method: 'POST',
    headers: buildHeaders(null),
    body: JSON.stringify({ userId }),
  });

  return handleResponse(response);
}

export async function fetchAccountProfile({ token, userId }) {
  if (!token || !userId) {
    throw new Error('Token e usuário são obrigatórios');
  }

  const response = await safeFetch(buildUrl(`/Accounts/${userId}`), {
    headers: buildHeaders(token),
  });

  return handleResponse(response);
}

export async function refreshAccessToken({ accessToken, refreshToken }) {
  if (!refreshToken) {
    throw new Error('Refresh token obrigatório');
  }

  const response = await safeFetch(buildUrl('/Accounts/refresh-token'), {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify({ refreshToken }),
  });

  return handleResponse(response);
}

export function resolveApiBaseUrl() {
  return API_BASE_URL;
}
