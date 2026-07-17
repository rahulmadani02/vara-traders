// src/db/seed.js — run with: npm run seed
// Real product list from the owner (dals, rice, peanuts). Prices below are
// PLACEHOLDERS — swap in the owner's real prices once you have them (see
// the "Kg" column reference photo). Just edit the `variants` price fields
// below and re-run `npm run seed`.

const bcrypt = require('bcryptjs');
const Store = require('./store');

const categories = [
  { id: 'rice', name: 'Rice', slug: 'rice', description: 'Matta, sona masoori, ponni, kollam and basmati rice.' },
  { id: 'dals-pulses', name: 'Dals & Pulses', slug: 'dals-pulses', description: 'Chana, toor, urad, moong, masoor dal, rajma and more.' },
  { id: 'nuts-seeds', name: 'Nuts & Seeds', slug: 'nuts-seeds', description: 'Red and pink peanuts.' },
];

const products = [
  // Dals & Pulses
  { name: 'Chana Dal', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Split chickpeas, nutty flavour, used in dal and sweets.', img: 'chana-dal', variants: [
    { label: '0.5 kg', price: 2.20, stock: 100 },
    { label: '1 kg', price: 3.99, stock: 100 },
    { label: '2 kg', price: 7.50, stock: 60 },
  ] },
  { name: 'Toor Dal', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Split pigeon peas, staple for sambar and everyday dal.', img: 'toor-dal', variants: [
    { label: '0.5 kg', price: 2.50, stock: 100 },
    { label: '1 kg', price: 4.50, stock: 100 },
    { label: '2 kg', price: 8.50, stock: 60 },
  ] },
  { name: 'Urad Dal', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Split and skinned urad dal, essential for dosa and idli batter.', img: 'urad-dal', variants: [
    { label: '0.5 kg', price: 2.80, stock: 100 },
    { label: '1 kg', price: 5.20, stock: 100 },
    { label: '2 kg', price: 9.80, stock: 60 },
  ] },
  { name: 'Urad Gota', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Whole black gram (urad), unsplit, with skin on.', img: 'urad-gota', variants: [
    { label: '0.5 kg', price: 2.60, stock: 90 },
    { label: '1 kg', price: 4.80, stock: 90 },
    { label: '2 kg', price: 9.00, stock: 50 },
  ] },
  { name: 'Moong Dal', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Split and skinned green gram, easy to digest, ideal for khichdi.', img: 'moong-dal', variants: [
    { label: '0.5 kg', price: 2.70, stock: 100 },
    { label: '1 kg', price: 4.90, stock: 100 },
    { label: '2 kg', price: 9.20, stock: 60 },
  ] },
  { name: 'Masoor Dal', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Split red lentils, quick-cooking and mild in flavour.', img: 'masoor-dal', variants: [
    { label: '0.5 kg', price: 2.30, stock: 100 },
    { label: '1 kg', price: 4.10, stock: 100 },
    { label: '2 kg', price: 7.80, stock: 60 },
  ] },
  { name: 'Rajma', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Red kidney beans, the base of classic rajma chawal.', img: 'rajma', variants: [
    { label: '0.5 kg', price: 3.20, stock: 90 },
    { label: '1 kg', price: 5.80, stock: 90 },
    { label: '2 kg', price: 10.99, stock: 50 },
  ] },
  { name: 'Kala Chana', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Whole black chickpeas, used in curries and chaat.', img: 'kala-chana', variants: [
    { label: '0.5 kg', price: 2.40, stock: 90 },
    { label: '1 kg', price: 4.30, stock: 90 },
    { label: '2 kg', price: 8.00, stock: 50 },
  ] },
  { name: 'Chana Big', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Large-grain whole chickpeas (kabuli chana).', img: 'chana-big', variants: [
    { label: '0.5 kg', price: 2.20, stock: 90 },
    { label: '1 kg', price: 3.90, stock: 90 },
    { label: '2 kg', price: 7.30, stock: 50 },
  ] },
  { name: 'Moong Sabut', category: 'dals-pulses', brand: 'Vara Traders', desc: 'Whole green gram, unsplit, with skin on.', img: 'moong-sabut', variants: [
    { label: '0.5 kg', price: 2.60, stock: 90 },
    { label: '1 kg', price: 4.70, stock: 90 },
    { label: '2 kg', price: 8.90, stock: 50 },
  ] },
  // Rice
  { name: 'Matta Rice', category: 'rice', brand: 'Vara Traders', desc: 'Kerala-style reddish parboiled rice, hearty and full-flavoured.', img: 'matta-rice', variants: [
    { label: '10 kg', price: 14.99, stock: 40 },
    { label: '20 kg', price: 27.99, stock: 20 },
  ] },
  { name: 'Sona Masoori Rice', category: 'rice', brand: 'Vara Traders', desc: 'Lightweight, aromatic medium-grain rice popular across South India.', img: 'sona-masoori', variants: [
    { label: '10 kg', price: 13.99, stock: 40 },
    { label: '20 kg', price: 25.99, stock: 20 },
  ] },
  { name: 'Ponni Rice', category: 'rice', brand: 'Vara Traders', desc: 'Traditional Tamil Nadu rice, great for everyday meals.', img: 'ponni-rice', variants: [
    { label: '10 kg', price: 13.49, stock: 40 },
    { label: '20 kg', price: 24.99, stock: 20 },
  ] },
  { name: 'Ponni Idly Rice', category: 'rice', brand: 'Vara Traders', desc: 'Specially processed short-grain rice for soft idlis and dosas.', img: 'ponni-idly-rice', variants: [
    { label: '10 kg', price: 14.49, stock: 40 },
    { label: '20 kg', price: 26.99, stock: 20 },
  ] },
  { name: 'Kollam Rice', category: 'rice', brand: 'Vara Traders', desc: 'A classic Kerala household rice, soft when cooked.', img: 'kollam-rice', variants: [
    { label: '10 kg', price: 15.99, stock: 40 },
    { label: '20 kg', price: 29.99, stock: 20 },
  ] },
  { name: 'Basmati Rice', category: 'rice', brand: 'Vara Traders', desc: 'Aged, extra-long grain basmati with a fragrant aroma.', img: 'basmati-rice', variants: [
    { label: '10 kg', price: 24.99, stock: 40 },
    { label: '20 kg', price: 46.99, stock: 20 },
  ] },
  // Nuts & Seeds
  { name: 'Red Peanuts', category: 'nuts-seeds', brand: 'Vara Traders', desc: 'Raw red-skin peanuts, great for roasting or chutneys.', img: 'red-peanuts', variants: [
    { label: '0.5 kg', price: 2.50, stock: 80 },
    { label: '1 kg', price: 4.50, stock: 80 },
  ] },
  { name: 'Pink Peanuts', category: 'nuts-seeds', brand: 'Vara Traders', desc: 'Raw pink-skin peanuts, a South Indian household staple.', img: 'pink-peanuts', variants: [
    { label: '0.5 kg', price: 2.70, stock: 80 },
    { label: '1 kg', price: 4.90, stock: 80 },
  ] },
];

// A few items on "Today's Offers" for the homepage — adjust freely.
const ON_SALE = {
  'Basmati Rice': 12,
  'Toor Dal': 10,
  'Red Peanuts': 15,
};

function run() {
  Store.replaceAll('categories', categories.map((c) => ({ ...c, createdAt: new Date().toISOString() })));

  let pid = 1000;
  const productRows = products.map((p) => {
    pid += 1;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
      id: pid,
      name: p.name,
      slug,
      category: p.category,
      brand: p.brand,
      description: p.desc,
      image: p.img,
      variants: p.variants.map((v, i) => ({ id: `${pid}-${i}`, ...v })),
      discountPercent: ON_SALE[p.name] || 0,
      active: true,
      createdAt: new Date().toISOString(),
    };
  });
  Store.replaceAll('products', productRows);

  const existingAdmin = Store.find('users', (u) => u.role === 'admin');
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('ChangeMe123!', 10);
    Store.insert('users', {
      name: 'Vara Traders Admin',
      email: 'admin@varatraders.ie',
      passwordHash,
      role: 'admin',
      phone: '',
      addresses: [],
    });
    console.log('Created default admin -> email: admin@varatraders.ie  password: ChangeMe123!');
    console.log('IMPORTANT: log in and change this password immediately in production.');
  }

  if (!Store.all('orders').length) {
    Store.replaceAll('orders', []);
  }

  console.log(`Seeded ${categories.length} categories and ${productRows.length} products.`);
}

run();