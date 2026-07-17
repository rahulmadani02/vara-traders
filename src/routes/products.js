// src/routes/products.js
const express = require('express');
const Store = require('../db/store');

const router = express.Router();

// GET /api/products?category=rice&search=basmati&sort=price-asc
router.get('/products', (req, res) => {
  const { category, search, sort } = req.query;
  let rows = Store.filter('products', (p) => p.active !== false);

  if (category) {
    rows = rows.filter((p) => p.category === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
    );
  }

  const withMinPrice = rows.map((p) => {
    const minPrice = Math.min(...p.variants.map((v) => v.price));
    const discountPercent = p.discountPercent || 0;
    const discountedMinPrice = discountPercent > 0
      ? Math.round(minPrice * (1 - discountPercent / 100) * 100) / 100
      : minPrice;
    return {
      ...p,
      minPrice,
      discountedMinPrice,
      onSale: discountPercent > 0,
      inStock: p.variants.some((v) => v.stock > 0),
    };
  });

  if (sort === 'price-asc') withMinPrice.sort((a, b) => a.minPrice - b.minPrice);
  if (sort === 'price-desc') withMinPrice.sort((a, b) => b.minPrice - a.minPrice);
  if (sort === 'name') withMinPrice.sort((a, b) => a.name.localeCompare(b.name));

  res.json({ products: withMinPrice, count: withMinPrice.length });
});

router.get('/products/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const product = Store.find(
    'products',
    (p) => String(p.id) === idOrSlug || p.slug === idOrSlug
  );
  if (!product || product.active === false) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  const discountPercent = product.discountPercent || 0;
  const withVariantPricing = {
    ...product,
    onSale: discountPercent > 0,
    variants: product.variants.map((v) => ({
      ...v,
      discountedPrice: discountPercent > 0
        ? Math.round(v.price * (1 - discountPercent / 100) * 100) / 100
        : v.price,
    })),
  };
  res.json({ product: withVariantPricing });
});

router.get('/categories', (_req, res) => {
  const categories = Store.all('categories');
  const products = Store.all('products');
  const withCounts = categories.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.category === c.id && p.active !== false).length,
  }));
  res.json({ categories: withCounts });
});

module.exports = router;