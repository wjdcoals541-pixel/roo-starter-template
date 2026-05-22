// gifs.json의 스티커 파일 URL이 R2에서 접근 가능한지 HEAD 요청으로 확인한다.
/* global console, fetch, process */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GIFS_PATH = path.join(ROOT_DIR, 'src', 'data', 'gifs.json');
const CONSTANTS_PATH = path.join(ROOT_DIR, 'src', 'constants.js');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

const data = JSON.parse(await readFile(GIFS_PATH, 'utf8'));
const constants = await readFile(CONSTANTS_PATH, 'utf8');
const baseUrl = readConstant(constants, 'R2_BASE_URL').replace(/\/$/, '');
const stickers = Array.isArray(data.stickers) ? data.stickers : [];
const failures = [];

for (const sticker of stickers) {
  const filePath = String(sticker.file ?? '').replace(/^\//, '');
  const url = `${baseUrl}/${filePath}`;

  try {
    const response = await fetch(url, { method: 'HEAD' });

    if (!response.ok) {
      failures.push(`${response.status} ${url}`);
    }
  } catch (error) {
    failures.push(`${error.message} ${url}`);
  }
}

if (failures.length > 0) {
  console.log('Failed URLs:');
  for (const failure of failures) {
    console.log(failure);
  }
  process.exit(1);
}

console.log(`All ${stickers.length} sticker URLs responded successfully.`);

function readConstant(source, name) {
  const match = source.match(
    new RegExp(`export\\s+const\\s+${name}\\s*=\\s*['"]([^'"]+)['"]`)
  );

  if (!match) {
    throw new Error(`Missing constant: ${name}`);
  }

  return match[1];
}

function printHelp() {
  console.log(`Usage:
  npm run check-urls

Checks every sticker URL from src/data/gifs.json using R2_BASE_URL from src/constants.js.`);
}
