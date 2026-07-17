// src/db/backup.js — run with: npm run backup
// Copies every JSON "table" file in /data into a timestamped folder under
// /backups. Keeps the last 10 backups automatically so the folder doesn't
// grow forever.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const BACKUPS_DIR = path.join(__dirname, '..', '..', 'backups');
const KEEP_LAST = 10;

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function run() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error('No data/ folder found — nothing to back up yet.');
    process.exit(1);
  }
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.log('No .json data files found — nothing to back up.');
    return;
  }

  const backupFolder = path.join(BACKUPS_DIR, timestamp());
  fs.mkdirSync(backupFolder);

  for (const file of files) {
    fs.copyFileSync(path.join(DATA_DIR, file), path.join(backupFolder, file));
  }

  console.log(`Backed up ${files.length} file(s) to: ${backupFolder}`);

  // Prune old backups, keeping only the most recent KEEP_LAST
  const allBackups = fs.readdirSync(BACKUPS_DIR)
    .filter((f) => fs.statSync(path.join(BACKUPS_DIR, f)).isDirectory())
    .sort(); // folder names are timestamps, so alphabetical sort = chronological

  if (allBackups.length > KEEP_LAST) {
    const toDelete = allBackups.slice(0, allBackups.length - KEEP_LAST);
    for (const folder of toDelete) {
      fs.rmSync(path.join(BACKUPS_DIR, folder), { recursive: true, force: true });
    }
    console.log(`Pruned ${toDelete.length} old backup(s), keeping the last ${KEEP_LAST}.`);
  }
}

run();