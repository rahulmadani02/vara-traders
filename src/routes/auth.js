const express = require('express');
const bcrypt = require('bcryptjs');
const Store = require('../db/store');
const { sign, attachUser, requireAuth } = require('../middleware/auth');

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Accepts Irish mobile-style numbers loosely (e.g. 087 123 4567, +353 87 123 4567)
  // and general 7-15 digit numbers, so it doesn't reject valid intl numbers.
  const digitsOnly = String(phone).replace(/[\s()-]/g, '');
  return /^\+?\d{7,15}$/.test(digitsOnly);
}

router.post('/register', (req, res) => {
  const { name, email, phone, password } = req.body || {};
  const trimmedEmail = email ? String(email).trim() : '';
  const trimmedPhone = phone ? String(phone).trim() : '';

  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required.' });
  }
  if (!trimmedEmail && !trimmedPhone) {
    return res.status(400).json({ error: 'Enter an email address or a phone number.' });
  }
  if (trimmedEmail && !isValidEmail(trimmedEmail)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (trimmedPhone && !isValidPhone(trimmedPhone)) {
    return res.status(400).json({ error: 'Enter a valid phone number.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  if (trimmedEmail) {
    const existingEmail = Store.find('users', (u) => u.email && u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (existingEmail) return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  if (trimmedPhone) {
    const existingPhone = Store.find('users', (u) => u.phone && u.phone === trimmedPhone);
    if (existingPhone) return res.status(409).json({ error: 'An account with this phone number already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = Store.insert('users', {
    name,
    email: trimmedEmail.toLowerCase(),
    phone: trimmedPhone,
    passwordHash,
    role: 'customer',
    addresses: [],
  });
  const token = sign(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Enter your email/phone and password.' });
  }
  const trimmed = String(identifier).trim();
  const user = Store.find(
    'users',
    (u) => (u.email && u.email.toLowerCase() === trimmed.toLowerCase()) || (u.phone && u.phone === trimmed)
  );
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email/phone or password.' });
  }
  const token = sign(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', attachUser, requireAuth, (req, res) => {
  const user = Store.getById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: publicUser(user) });
});

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

module.exports = router;