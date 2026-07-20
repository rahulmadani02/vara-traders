// client/src/api.js
const API_BASE = '/api';

// rahul: same localStorage keys as the original site so a browser that
// already has a cart/session from the old static pages keeps working
export const TOKEN_KEY = 'vt_token';
export const USER_KEY = 'vt_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
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
    // rahul: 401 means the token is missing/expired/invalid — clear the
    // stale session right here (api.js has no React context to do this
    // itself) and fire an event so AuthContext can clear its live state
    // and send the user back to login, instead of just showing a raw
    // error on whatever page happened to make the call.
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new CustomEvent('vt:unauthorized'));
    }
    const defaultMessages = {
      401: 'Please log in to continue.',
      403: "You don't have permission to do that.",
    };
    const err = new Error(data.error || defaultMessages[res.status] || `Request failed (${res.status}).`);
    err.status = res.status;
    err.issues = data.issues;
    throw err;
  }
  return data;
}

export const Api = {
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

export function formatEUR(amount) {
  return `€${Number(amount).toFixed(2)}`;
}

// Filenames we actually have real photos for (in /public/images/). Products
// whose `image` field isn't in this list fall back to a text placeholder.
export const PRODUCT_IMAGES_AVAILABLE = new Set([
  'chana-dal', 'toor-dal', 'urad-dal', 'urad-gota', 'moong-dal',
  'masoor-dal', 'rajma', 'kala-chana', 'chana-big', 'moong-sabut',
  'red-peanuts', 'pink-peanuts', 'sona-masoori', 'matta-rice',
  'ponni-rice', 'ponni-idly-rice', 'kollam-rice', 'basmati-rice',
]);

export function productImageSrc(product) {
  if (product?.image && PRODUCT_IMAGES_AVAILABLE.has(product.image)) {
    return `/images/${product.image}.jpg`;
  }
  return null;
}
