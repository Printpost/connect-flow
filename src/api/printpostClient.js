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

function buildQueryString(params) {
  if (!params) return '';
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'object') {
      query.set(key, JSON.stringify(value));
      return;
    }
    query.set(key, String(value));
  });

  return query.toString();
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
    const error = new Error('Falha de conexão com o servidor');
    error.type = 'network_unreachable';
    error.cause = err;
    throw error;
  }
}

async function apiRequest(endpoint, {
  method = 'GET',
  token,
  body,
  headers,
  params,
  signal,
} = {}) {
  const queryString = buildQueryString(params);
  const url = buildUrl(queryString ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}` : endpoint);

  const options = {
    method,
    headers: buildHeaders(token, headers),
    signal,
  };

  if (body !== undefined && body !== null && method !== 'GET') {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await safeFetch(url, options);
  return handleResponse(response);
}

export async function loginRequest({ email, password }) {
  return apiRequest('/Accounts/auth', {
    method: 'POST',
    body: {
      email: email.trim().toLowerCase(),
      password,
    },
  });
}

export async function validateTwoFactorCode({ userId, code }) {
  return apiRequest('/Accounts/validate-code', {
    method: 'POST',
    body: {
      email: userId,
      password: code,
    },
  });
}

export async function resendTwoFactorCode({ userId }) {
  return apiRequest('/Accounts/resend-code', {
    method: 'POST',
    body: { userId },
  });
}

export async function fetchAccountProfile({ token, userId }) {
  if (!token || !userId) {
    throw new Error('Token e usuário são obrigatórios');
  }

  return apiRequest(`/Accounts/${userId}`, {
    token,
  });
}

export async function refreshAccessToken({ accessToken, refreshToken }) {
  if (!refreshToken) {
    throw new Error('Refresh token obrigatório');
  }

  return apiRequest('/Accounts/refresh-token', {
    method: 'POST',
    token: accessToken,
    body: { refreshToken },
  });
}

export async function fetchRequestTags({
  token,
  search,
  active,
  limit,
  skip,
  filter,
  signal,
} = {}) {
  if (!token) {
    throw new Error('Token obrigatório para listar tags');
  }

  const params = {};
  const where = { ...filter };

  if (active !== undefined) {
    where.active = active;
  }

  if (search) {
    where.description = { like: `%${search}%` };
  }

  if (Object.keys(where).length) {
    params.filter = { where };
  }

  if (limit !== undefined || skip !== undefined) {
    params.filter = {
      ...(params.filter || {}),
      limit,
      skip,
    };
  }

  return apiRequest('/RequestTags/find', {
    token,
    params,
    signal,
  });
}

export async function fetchCostCenters({
  token,
  active,
  limit,
  skip,
  signal,
} = {}) {
  if (!token) {
    throw new Error('Token obrigatório para listar centros de custo');
  }

  const params = {};

  if (active !== undefined) {
    params.active = active;
  }

  if (limit !== undefined) {
    params.limit = limit;
  }

  if (skip !== undefined) {
    params.skip = skip;
  }

  return apiRequest('/CostCenters/list', {
    token,
    params,
    signal,
  });
}

export async function fetchRequestsDashboard({
  token,
  from,
  to,
  campaignId,
  costCenterId,
  signal,
} = {}) {
  if (!token) {
    throw new Error('Token obrigatório para resumo de pedidos');
  }

  let endpoint = '/Requests/dashboard';

  const filters = new URLSearchParams();
  let whereIndex = 0;

  if (from) {
    filters.set(`filter[where][and][${whereIndex++}][createdAt][gte]`, from);
  }

  if (to) {
    filters.set(`filter[where][and][${whereIndex++}][createdAt][lte]`, to);
  }

  if (campaignId && campaignId !== 'todas') {
    filters.set(`filter[where][and][${whereIndex++}][campaignId]`, campaignId);
  }

  if (costCenterId) {
    filters.set(`filter[where][and][${whereIndex++}][costCenterId]`, costCenterId);
  }

  const serializedFilters = filters.toString();
  if (serializedFilters) {
    endpoint = `${endpoint}?${serializedFilters}`;
  }

  return apiRequest(endpoint, {
    token,
    signal,
  });
}

export async function fetchRequestDatasetsDashboard({
  token,
  from,
  to,
  campaignId,
  costCenterId,
  signal,
} = {}) {
  if (!token) {
    throw new Error('Token obrigatório para detalhar pedidos');
  }

  if (!from || !to) {
    throw new Error('Intervalo de datas é obrigatório');
  }

  const query = new URLSearchParams();
  let whereIndex = 0;

  query.set(`filter[where][and][${whereIndex++}][createdAt][gte]`, from);
  query.set(`filter[where][and][${whereIndex++}][createdAt][lte]`, to);

  if (campaignId && campaignId !== 'todas') {
    query.set(`filter[where][and][${whereIndex++}][campaignId]`, campaignId);
  }

  if (costCenterId) {
    query.set(`filter[where][and][${whereIndex++}][costCenterId]`, costCenterId);
  }

  return apiRequest(`/RequestDatasets/dashboard?${query.toString()}`, {
    token,
    signal,
  });
}

export async function fetchCampaignIndicators({
  token,
  from,
  signal,
} = {}) {
  if (!token) {
    throw new Error('Token obrigatório para indicadores de campanhas');
  }

  const params = new URLSearchParams({
    'mp': 'true',
    'filter[where][status][nin]': 'Pendente',
    'filter[where][title][nlike]': 'envio api',
    'filter[where][title][options]': 'i',
    'filter[include]': 'wallet',
  });

  // Add second nin filter for "Em Pendente"
  params.append('filter[where][status][nin]', 'Em Pendente');

  if (from) {
    params.set('filter[where][createdAt][gte]', from);
  }

  return apiRequest(`/Requests/indicators?${params.toString()}`, {
    token,
    signal,
  });
}

export async function fetchCampaignsList({
  token,
  from,
  status,
  limit = 20,
  page = 1,
  signal,
} = {}) {
  if (!token) {
    throw new Error('Token obrigatório para listar campanhas');
  }

  const params = new URLSearchParams({
    'mp': 'true',
    'filter[where][requestRulerId]': 'null',
    'filter[where][requestRulerMultichannelId]': 'null',
    'filter[where][title][nlike]': 'envio api',
    'filter[where][title][options]': 'i',
    'filter[order]': 'id DESC',
    'filter[limit]': String(limit),
    'filter[include]': 'wallet',
  });

  // Add nin filters for Pendente
  params.append('filter[where][status][nin]', 'Pendente');
  params.append('filter[where][status][nin]', 'Em Pendente');

  // Add includes
  params.append('filter[include]', 'account');
  params.append('filter[include]', 'files');

  if (from) {
    params.set('filter[where][createdAt][gte]', from);
  }

  if (status && status !== 'todas') {
    params.set('filter[where][status]', status);
  }

  return apiRequest(`/Requests/list?${params.toString()}`, {
    token,
    signal,
  });
}

export function resolveApiBaseUrl() {
  return API_BASE_URL;
}
