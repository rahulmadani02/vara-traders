// src/routes/orders.js
const express = require('express');
const Store = require('../db/store');
const { attachUser, requireAuth } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../services/mailer');

const router = express.Router();

const DELIVERY_FLAT_FEE = 4.99;
const FREE_DELIVERY_THRESHOLD = 50;

function findVariant(product, variantId) {
  return product.variants.find((v) => v.id === variantId);
}

// Re-price the cart against current server-side data. Never trust prices
// sent from the browser — always recompute from the product catalog.
function priceCart(items) {
  const priced = [];
  const issues = [];

  for (const item of items) {
    const product = Store.getById('products', item.productId);
    if (!product || product.active === false) {
      issues.push(`"${item.name || item.productId}" is no longer available.`);
      continue;
    }
    const variant = findVariant(product, item.variantId);
    if (!variant) {
      issues.push(`Selected size for "${product.name}" is no longer available.`);
      continue;
    }
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    if (variant.stock < qty) {
      issues.push(`Only ${variant.stock} left of "${product.name} (${variant.label})".`);
      continue;
    }
    priced.push({
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantLabel: variant.label,
      unitPrice: variant.price,
      qty,
      lineTotal: variant.price * qty,
      image: product.image,
    });
  }

  const subtotal = priced.reduce((sum, i) => sum + i.lineTotal, 0);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT_FEE;
  const total = subtotal + deliveryFee;

  return { priced, issues, subtotal, deliveryFee, total };
}

// POST /api/cart/price — re-price a cart, used to render live totals & catch stock issues before checkout
router.post('/cart/price', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const result = priceCart(items);
  res.json(result);
});

// POST /api/orders — place an order (guest or logged in)
router.post('/orders', attachUser, (req, res) => {
  const { items, customer, paymentMethod } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }
if (!customer || !customer.name || !customer.phone || !customer.address || !customer.county || !customer.eircode) {
    return res.status(400).json({ error: 'Please provide name, phone, address, county and Eircode.' });
  }
  if (!['cod', 'online'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Choose a valid payment method.' });
  }

  const { priced, issues, subtotal, deliveryFee, total } = priceCart(items);
  if (issues.length) {
    return res.status(409).json({ error: 'Some items changed before checkout.', issues });
  }

  // Decrement stock now that we know the order is valid.
  for (const line of priced) {
    const product = Store.getById('products', line.productId);
    const variant = findVariant(product, line.variantId);
    variant.stock -= line.qty;
    Store.update('products', product.id, { variants: product.variants });
  }

  const order = Store.insert('orders', {
    userId: req.user ? req.user.id : null,
    items: priced,
    customer,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending', // 'online' would flip to 'paid' after gateway webhook
    subtotal,
    deliveryFee,
    total,
    status: 'placed', // placed -> confirmed -> packed -> shipped -> delivered / cancelled
  });

  // Send the confirmation email in the background — we don't want a slow
  // or failed email to delay the customer's checkout response. If Gmail
  // isn't configured yet in .env, this just logs a note and does nothing.
  sendOrderConfirmation(order).catch((err) => console.error('Email error:', err));

  res.status(201).json({ order });
});

// GET /api/orders — logged-in user's own orders
router.get('/orders', attachUser, requireAuth, (req, res) => {
  const orders = Store.filter('orders', (o) => String(o.userId) === String(req.user.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders });
});

// GET /api/orders/:id — a single order (owner or admin only)
router.get('/orders/:id', attachUser, requireAuth, (req, res) => {
  const order = Store.getById('orders', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (String(order.userId) !== String(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not your order.' });
  }
  res.json({ order });
});

module.exports = router;