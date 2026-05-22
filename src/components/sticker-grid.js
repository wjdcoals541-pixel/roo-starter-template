// 스티커 카드 목록을 그리드로 렌더링하는 컴포넌트다.
import { createStickerCard } from './sticker-card.js';

export function createStickerGrid(options = {}) {
  const documentRef = globalThis.document;

  if (!documentRef) {
    return null;
  }

  const root = documentRef.createElement('section');
  root.className = 'sticker-grid-section';

  const heading = documentRef.createElement('h2');
  heading.className = 'sticker-grid-title';

  const grid = documentRef.createElement('div');
  grid.className = 'sticker-grid';

  const emptyState = documentRef.createElement('p');
  emptyState.className = 'sticker-grid-empty';
  emptyState.textContent = options.emptyMessage ?? '표시할 스티커가 없습니다.';

  root.append(heading, grid);

  function renderStickers(nextStickers = [], nextTitle = options.title) {
    const stickers = Array.isArray(nextStickers) ? nextStickers : [];
    heading.textContent = nextTitle ?? '';
    heading.hidden = !nextTitle;

    if (stickers.length === 0) {
      grid.replaceChildren(emptyState);
      return root;
    }

    const fragment = documentRef.createDocumentFragment();

    for (const sticker of stickers) {
      const card = createStickerCard(sticker, {
        onPreview: options.onPreview,
      });

      if (card) {
        fragment.append(card);
      }
    }

    grid.replaceChildren(fragment);
    return root;
  }

  renderStickers(options.stickers, options.title);

  return {
    element: root,
    grid,
    renderStickers,
    update: renderStickers,
  };
}
