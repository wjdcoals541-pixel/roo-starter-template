// 스티커 목록을 필터링하고 정렬하는 순수 유틸 함수 모음이다.
const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

export function getStickersByPack(stickers, packId) {
  if (!Array.isArray(stickers) || !packId) {
    return [];
  }

  return stickers.filter((sticker) => sticker.pack === packId);
}

export function searchStickers(stickers, query) {
  if (!Array.isArray(stickers)) {
    return [];
  }

  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [...stickers];
  }

  return stickers.filter((sticker) => {
    const searchableText = [
      sticker.id,
      sticker.title,
      sticker.name,
      sticker.pack,
      ...(Array.isArray(sticker.tags) ? sticker.tags : []),
    ]
      .map(normalizeText)
      .join(' ');

    return searchableText.includes(normalizedQuery);
  });
}

export function filterByTags(stickers, tags) {
  if (!Array.isArray(stickers)) {
    return [];
  }

  const normalizedTags = Array.isArray(tags)
    ? tags.map(normalizeText).filter(Boolean)
    : [];

  if (normalizedTags.length === 0) {
    return [...stickers];
  }

  return stickers.filter((sticker) => {
    const stickerTags = Array.isArray(sticker.tags)
      ? sticker.tags.map(normalizeText)
      : [];

    return normalizedTags.every((tag) => stickerTags.includes(tag));
  });
}

export function sortStickers(stickers, mode = 'name') {
  if (!Array.isArray(stickers)) {
    return [];
  }

  const sortedStickers = [...stickers];

  switch (mode) {
    case 'name-desc':
      return sortedStickers.sort((a, b) =>
        normalizeText(getStickerLabel(b)).localeCompare(
          normalizeText(getStickerLabel(a))
        )
      );
    case 'newest':
      return sortedStickers.sort(
        (a, b) => Date.parse(b.createdAt ?? 0) - Date.parse(a.createdAt ?? 0)
      );
    case 'oldest':
      return sortedStickers.sort(
        (a, b) => Date.parse(a.createdAt ?? 0) - Date.parse(b.createdAt ?? 0)
      );
    case 'popular':
      return sortedStickers.sort(
        (a, b) => (b.frequency ?? 0) - (a.frequency ?? 0)
      );
    case 'name':
    case 'name-asc':
    default:
      return sortedStickers.sort((a, b) =>
        normalizeText(getStickerLabel(a)).localeCompare(
          normalizeText(getStickerLabel(b))
        )
      );
  }
}

function getStickerLabel(sticker) {
  return sticker?.title ?? sticker?.name ?? sticker?.id ?? '';
}
