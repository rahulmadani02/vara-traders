// src/db/store.js
// A tiny, dependency-free JSON datastore.
//
// Why not a real SQL database? Native DB packages need compilation tools
// that aren't always available, and a running DB server is extra setup.
// For a store this size, a JSON file per "table," written safely, is
// genuinely fine — and it deploys anywhere with zero extra setup.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(table) {
  return path.join(DATA_DIR, `${table}.json`);
}

// In-memory cache so we're not re-reading disk on every request.
const cache = {};

function load(table) {
  if (cache[table]) return cache[table];
  const fp = filePath(table);
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, '[]', 'utf-8');
  }
  const raw = fs.readFileSync(fp, 'utf-8');
  cache[table] = raw.trim() ? JSON.parse(raw) : [];
  return cache[table];
}

// Atomic write: write to a temp file then rename, so a crash mid-write can
// never corrupt the table file.
function persist(table) {
  const fp = filePath(table);
  const tmp = `${fp}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cache[table], null, 2), 'utf-8');
  fs.renameSync(tmp, fp);
}

let idCounter = Date.now();
function nextId() {
  idCounter += 1;
  return idCounter;
}

const Store = {
  all(table) {
    return load(table).slice();
  },

  find(table, predicate) {
    return load(table).find(predicate);
  },

  filter(table, predicate) {
    return load(table).filter(predicate);
  },

  getById(table, id) {
    return load(table).find((row) => String(row.id) === String(id));
  },

  insert(table, row) {
    const rows = load(table);
    const record = { id: nextId(), createdAt: new Date().toISOString(), ...row };
    rows.push(record);
    persist(table);
    return record;
  },

  update(table, id, patch) {
    const rows = load(table);
    const idx = rows.findIndex((row) => String(row.id) === String(id));
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...patch, updatedAt: new Date().toISOString() };
    persist(table);
    return rows[idx];
  },

  remove(table, id) {
    const rows = load(table);
    const idx = rows.findIndex((row) => String(row.id) === String(id));
    if (idx === -1) return false;
    rows.splice(idx, 1);
    persist(table);
    return true;
  },

  // Replace the whole table (used by the seed script only).
  replaceAll(table, rows) {
    cache[table] = rows;
    persist(table);
  },
};

module.exports = Store;