// 로컬 GIF 폴더를 gifs.json의 새 스티커 묶음으로 추가한다.
/* global console, process */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GIFS_PATH = path.join(ROOT_DIR, 'src', 'data', 'gifs.json');

const [, , packId, packName, emoji, folderPath] = process.argv;

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

if (!packId || !packName || !emoji || !folderPath) {
  printHelp();
  process.exit(1);
}

const data = JSON.parse(await readFile(GIFS_PATH, 'utf8'));
const packs = Array.isArray(data.packs) ? data.packs : [];
const stickers = Array.isArray(data.stickers) ? data.stickers : [];

if (packs.some((pack) => pack.id === packId)) {
  console.error(`Pack id already exists: ${packId}`);
  process.exit(1);
}

const gifFiles = (await readdir(path.resolve(folderPath), { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.gif'))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

if (gifFiles.length === 0) {
  console.error(`No .gif files found in: ${folderPath}`);
  process.exit(1);
}

const nextStickers = gifFiles.map((fileName) => {
  const baseName = path.basename(fileName, path.extname(fileName));
  const stickerId = `${packId}-${slugify(baseName)}`;

  if (stickers.some((sticker) => sticker.id === stickerId)) {
    console.error(`Sticker id already exists: ${stickerId}`);
    process.exit(1);
  }

  return {
    id: stickerId,
    pack: packId,
    name: titleize(baseName),
    file: `${packId}/${fileName}`,
  };
});

const nextData = {
  ...data,
  packs: [
    ...packs,
    {
      id: packId,
      name: packName,
      emoji,
    },
  ],
  stickers: [...stickers, ...nextStickers],
};

await writeFile(GIFS_PATH, `${JSON.stringify(nextData, null, 2)}\n`);

console.log(`Added pack ${packId} with ${nextStickers.length} stickers.`);

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleize(value) {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function printHelp() {
  console.log(`Usage:
  npm run add-pack -- <pack-id> <name> <emoji> <local-folder-path>

Example:
  npm run add-pack -- funny-cats "Funny Cats" "🐱" ./assets/funny-cats`);
}
