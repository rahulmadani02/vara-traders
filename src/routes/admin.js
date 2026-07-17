// src/routes/admin.js
const express = require('express');
const Store = require('../db/store');
const { attachUser, requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Every route below requires a logged-in admin.
router.use(attachUser, requireAuth, requireAdmin);

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---- Dashboard ----
router.get('/stats', (_req, res) => {
  const orders = Store.all('orders');
  const products = Store.all('products');
  const users = Store.all('users');
  const revenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' || o.paymentMethod === 'cod' ? o.total : 0), 0);
  const lowStock = products.filter((p) => p.variants.some((v) => v.stock <= 5));

  res.json({
    totalOrders: orders.length,
    totalRevenue: revenue,
    totalProducts: products.length,
    totalCustomers: users.filter((u) => u.role === 'customer').length,
    lowStockCount: lowStock.length,
    lowStockProducts: lowStock.map((p) => ({ id: p.id, name: p.name, variants: p.variants })),
    recentOrders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
  });
});

// ---- Products ----
router.get('/products', (_req, res) => {
  res.json({ products: Store.all('products') });
});

router.post('/products', (req, res) => {
  const { name, category, brand, description, image, variants } = req.body || {};
  if (!name || !category || !Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({ error: 'Name, category and at least one variant are required.' });
  }
  const product = Store.insert('products', {
    name,
    slug: slugify(name),
    category,
    brand: brand || 'Vara Traders',
    description: description || '',
    image: image || '',
    variants: variants.map((v, i) => ({
      id: v.id || `${Date.now()}-${i}`,
      label: v.label,
      price: Number(v.price) || 0,
      stock: Number(v.stock) || 0,
    })),
    active: true,
  });
  res.status(201).json({ product });
});

router.put('/products/:id', (req, res) => {
  const { name, category, brand, description, image, variants, active } = req.body || {};
  const patch = {};
  if (name !== undefined) { patch.name = name; patch.slug = slugify(name); }
  if (category !== undefined) patch.category = category;
  if (brand !== undefined) patch.brand = brand;
  if (description !== undefined) patch.description = description;
  if (image !== undefined) patch.image = image;
  if (active !== undefined) patch.active = active;
  if (variants !== undefined) {
    patch.variants = variants.map((v, i) => ({
      id: v.id || `${Date.now()}-${i}`,
      label: v.label,
      price: Number(v.price) || 0,
      stock: Number(v.stock) || 0,
    }));
  }
  const product = Store.update('products', req.params.id, patch);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product });
});

router.delete('/products/:id', (req, res) => {
  const ok = Store.remove('products', req.params.id);
  if (!ok) return res.status(404).json({ error: 'Product not found.' });
  res.json({ success: true });
});

// ---- Categories ----
router.post('/categories', (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Category name is required.' });
  const id = slugify(name);
  if (Store.getById('categories', id)) {
    return res.status(409).json({ error: 'A category with this name already exists.' });
  }
  const categories = Store.all('categories');
  categories.push({ id, name, slug: id, description: description || '', createdAt: new Date().toISOString() });
  Store.replaceAll('categories', categories);
  res.status(201).json({ category: categories[categories.length - 1] });
});

// ---- Orders ----
router.get('/orders', (_req, res) => {
  const orders = Store.all('orders').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders });
});

// GET /api/admin/orders/export — download all orders as a CSV (opens in Excel)
router.get('/orders/export', (_req, res) => {
  const orders = Store.all('orders').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'City', 'County', 'Eircode', 'Items', 'Payment Method', 'Subtotal', 'Delivery Fee', 'Total', 'Status'];

  function csvEscape(value) {
    const str = String(value ?? '');
    // Wrap in quotes if it contains a comma, quote, or newline; double up any internal quotes.
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  }

  const rows = orders.map((o) => [
    o.id,
    new Date(o.createdAt).toLocaleString('en-IE'),
    o.customer.name,
    o.customer.phone,
    o.customer.address,
    o.customer.city,
    o.customer.county || '',
    o.customer.eircode || '',
    o.items.map((i) => `${i.productName} (${i.variantLabel}) x${i.qty}`).join('; '),
    o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online',
    o.subtotal.toFixed(2),
    o.deliveryFee.toFixed(2),
    o.total.toFixed(2),
    o.status,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="vara-traders-orders-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('\uFEFF' + csv); // BOM prefix so Excel opens UTF-8 correctly (handles the € symbol properly)
});

const VALID_STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  const order = Store.update('orders', req.params.id, { status });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order });
});

// ---- Customers ----
router.get('/customers', (_req, res) => {
  const users = Store.filter('users', (u) => u.role === 'customer').map(({ passwordHash, ...rest }) => rest);
  res.json({ customers: users });
});

module.exports = router;