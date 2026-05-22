// R2 버킷을 스캔해 pack과 sticker 목록을 반환하는 Pages Function API다.
const LEGACY_PACK_ID = '구구가가';
const PRIORITY_PACK_ID = '루미콘';
const SUPPORTED_EXTENSIONS = new Set(['.gif', '.webp', '.mp4', '.webm']);
const collator = new globalThis.Intl.Collator('ko-KR', {
  numeric: true,
  sensitivity: 'base',
});

export async function onRequestGet({ env }) {
  try {
    if (!env?.GIF_BUCKET?.list) {
      return json({ error: 'GIF_BUCKET binding is not configured.' }, 500);
    }

    const objects = await listAllObjects(env.GIF_BUCKET);
    const payload = buildPayload(objects);

    return json(payload);
  } catch (error) {
    return json(
      {
        error: 'Failed to load packs.',
        message: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

async function listAllObjects(bucket) {
  const objects = [];
  let cursor;

  do {
    const result = await bucket.list({
      cursor,
      limit: 1000,
    });

    objects.push(...result.objects);
    cursor = result.cursor;

    if (!result.truncated) {
      break;
    }
  } while (cursor);

  return objects;
}

function buildPayload(objects) {
  const packMap = new Map();
  const stickers = [];

  for (const object of objects) {
    const key = object.key;

    if (!isSupportedMediaKey(key)) {
      continue;
    }

    const packId = getPackId(key);

    if (!packMap.has(packId)) {
      packMap.set(packId, {
        id: packId,
        name: packId,
      });
    }

    stickers.push({
      id: createStickerId(packId, key),
      pack: packId,
      name: getFileTitle(key),
      title: getFileTitle(key),
      file: key,
    });
  }

  return {
    packs: [...packMap.values()].sort(comparePacks),
    stickers: stickers.sort(compareStickers),
  };
}

function isSupportedMediaKey(key) {
  if (typeof key !== 'string' || key.endsWith('/')) {
    return false;
  }

  return SUPPORTED_EXTENSIONS.has(getExtension(key).toLowerCase());
}

function getPackId(key) {
  const slashIndex = key.indexOf('/');

  if (slashIndex === -1) {
    return LEGACY_PACK_ID;
  }

  return key.slice(0, slashIndex);
}

function getFileTitle(key) {
  const fileName = key.split('/').at(-1) ?? key;
  const dotIndex = fileName.lastIndexOf('.');

  return dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
}

function getExtension(key) {
  const fileName = key.split('/').at(-1) ?? key;
  const dotIndex = fileName.lastIndexOf('.');

  return dotIndex === -1 ? '' : fileName.slice(dotIndex);
}

function createStickerId(packId, key) {
  return `${packId}-${getFileTitle(key)}`;
}

function comparePacks(a, b) {
  if (a.id === PRIORITY_PACK_ID) {
    return -1;
  }

  if (b.id === PRIORITY_PACK_ID) {
    return 1;
  }

  if (a.id === LEGACY_PACK_ID && b.id !== LEGACY_PACK_ID) {
    return 1;
  }

  if (b.id === LEGACY_PACK_ID && a.id !== LEGACY_PACK_ID) {
    return -1;
  }

  return collator.compare(a.name, b.name);
}

function compareStickers(a, b) {
  const packCompare = comparePacks(
    { id: a.pack, name: a.pack },
    { id: b.pack, name: b.pack }
  );

  if (packCompare !== 0) {
    return packCompare;
  }

  return collator.compare(getFileName(a.file), getFileName(b.file));
}

function getFileName(file) {
  return file.split('/').at(-1) ?? file;
}

function json(payload, status = 200) {
  return new globalThis.Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
