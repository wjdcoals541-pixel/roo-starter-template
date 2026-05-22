// gifs.json에서 스티커 id, file, title 중복을 검사한다.
/* global console, process */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GIFS_PATH = path.join(ROOT_DIR, 'src', 'data', 'gifs.json');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

const data = JSON.parse(await readFile(GIFS_PATH, 'utf8'));
const stickers = Array.isArray(data.stickers) ? data.stickers : [];
const duplicateGroups = [
  ...findDuplicates(stickers, 'id'),
  ...findDuplicates(stickers, 'file'),
  ...findDuplicates(stickers, 'name', 'title'),
];

if (duplicateGroups.length > 0) {
  console.log('Duplicate stickers found:');
  for (const group of duplicateGroups) {
    console.log(`${group.field}: ${group.value}`);
    for (const sticker of group.items) {
      console.log(`  - ${sticker.id} (${sticker.file})`);
    }
  }
  process.exit(1);
}

console.log(`No duplicate sticker id, file, or title values in ${stickers.length} stickers.`);

function findDuplicates(stickers, property, label = property) {
  const groups = new Map();

  for (const sticker of stickers) {
    const value = String(sticker[property] ?? '').trim().toLowerCase();

    if (!value) {
      continue;
    }

    if (!groups.has(value)) {
      groups.set(value, []);
    }

    groups.get(value).push(sticker);
  }

  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([value, items]) => ({
      field: label,
      value,
      items,
    }));
}

function printHelp() {
  console.log(`Usage:
  npm run find-duplicates

Checks duplicate sticker id, file, and title values in src/data/gifs.json.`);
}
