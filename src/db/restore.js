// src/db/restore.js — run with: npm run restore
// Lists available backups and restores the chosen one back into /data.
// IMPORTANT: this overwrites whatever is currently in /data — the current
// data is NOT saved anywhere first, so if you're unsure, run `npm run backup`
// first to snapshot the current state before restoring an older one.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const BACKUPS_DIR = path.join(__dirname, '..', '..', 'backups');

function listBackups() {
  if (!fs.existsSync(BACKUPS_DIR)) return [];
  return fs.readdirSync(BACKUPS_DIR)
    .filter((f) => fs.statSync(path.join(BACKUPS_DIR, f)).isDirectory())
    .sort()
    .reverse(); // most recent first
}

function restore(folderName) {
  const folder = path.join(BACKUPS_DIR, folderName);
  const files = fs.readdirSync(folder).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    fs.copyFileSync(path.join(folder, file), path.join(DATA_DIR, file));
  }
  console.log(`Restored ${files.length} file(s) from: ${folder}`);
}

function run() {
  const backups = listBackups();
  if (!backups.length) {
    console.log('No backups found. Run "npm run backup" first to create one.');
    return;
  }

  console.log('Available backups (most recent first):\n');
  backups.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('\nEnter the number of the backup to restore (or press Enter to cancel): ', (answer) => {
    rl.close();
    const index = parseInt(answer, 10) - 1;
    if (Number.isNaN(index) || index < 0 || index >= backups.length) {
      console.log('Cancelled — no changes made.');
      return;
    }
    restore(backups[index]);
  });
}

run();