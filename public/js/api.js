// public/js/api.js
const API_BASE = '/api';

const Auth = {
  getToken() { return localStorage.getItem('vt_token'); },
  setToken(token) { localStorage.setItem('vt_token', token); },
  clearToken() { localStorage.removeItem('vt_token'); },
  getUser() {
    const raw = localStorage.getItem('vt_user');
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) { localStorage.setItem('vt_user', JSON.stringify(user)); },
  clearUser() { localStorage.removeItem('vt_user'); },
  isLoggedIn() { return !!Auth.getToken(); },
  isAdmin() {
    const u = Auth.getUser();
    return !!u && u.role === 'admin';
  },
  logout() {
    Auth.clearToken();
    Auth.clearUser();
    window.location.href = '/index.html';
  },
};

async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && Auth.getToken()) {
    headers.Authorization = `Bearer ${Auth.getToken()}`;
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. 204) — fine
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status}).`);
    err.status = res.status;
    err.issues = data.issues;
    throw err;
  }
  return data;
}

const Api = {
  // Products & categories
  getCategories: () => apiRequest('/categories', { auth: false }),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },
  getProduct: (idOrSlug) => apiRequest(`/products/${idOrSlug}`, { auth: false }),

  // Auth
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => apiRequest('/auth/me'),

  // Cart / checkout
  priceCart: (items) => apiRequest('/cart/price', { method: 'POST', body: { items }, auth: false }),
  placeOrder: (payload) => apiRequest('/orders', { method: 'POST', body: payload }),
  myOrders: () => apiRequest('/orders'),
  getOrder: (id) => apiRequest(`/orders/${id}`),

  // Admin
  adminStats: () => apiRequest('/admin/stats'),
  adminProducts: () => apiRequest('/admin/products'),
  adminCreateProduct: (payload) => apiRequest('/admin/products', { method: 'POST', body: payload }),
  adminUpdateProduct: (id, payload) => apiRequest(`/admin/products/${id}`, { method: 'PUT', body: payload }),
  adminDeleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  adminOrders: () => apiRequest('/admin/orders'),
  adminUpdateOrderStatus: (id, status) => apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } }),
  adminCustomers: () => apiRequest('/admin/customers'),
};