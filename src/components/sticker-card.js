// 스티커 카드 DOM 요소를 생성하는 컴포넌트다.
import { R2_BASE_URL } from '../constants.js';
import { copyText } from '../utils/clipboard.js';
import {
  addRecent,
  incrementFrequency,
  isFavorite,
  toggleFavorite,
} from '../utils/storage.js';
import { showToast } from './toast.js';

export function createStickerCard(sticker, options = {}) {
  const documentRef = globalThis.document;

  if (!documentRef) {
    return null;
  }

  const gifUrl = createGifUrl(sticker.file);
  const card = documentRef.createElement('article');
  card.className = 'sticker-card';

  const mediaButton = documentRef.createElement('button');
  mediaButton.className = 'sticker-card__media';
  mediaButton.type = 'button';
  mediaButton.setAttribute('aria-label', `${sticker.name} 미리보기`);

  const image = documentRef.createElement('img');
  image.className = 'sticker-card__image';
  image.src = gifUrl;
  image.alt = sticker.name;
  image.loading = 'lazy';

  const body = documentRef.createElement('div');
  body.className = 'sticker-card__body';

  const content = documentRef.createElement('div');
  content.className = 'sticker-card__content';

  const title = documentRef.createElement('h3');
  title.className = 'sticker-card__title';
  title.textContent = sticker.name;

  const actions = documentRef.createElement('div');
  actions.className = 'sticker-card__actions';

  const copyButton = documentRef.createElement('button');
  copyButton.className = 'sticker-card__action';
  copyButton.type = 'button';
  copyButton.textContent = '복사';

  const favoriteButton = documentRef.createElement('button');
  favoriteButton.className = 'sticker-card__action';
  favoriteButton.type = 'button';

  updateFavoriteButton(favoriteButton, sticker.id);

  mediaButton.append(image);
  content.append(title);
  actions.append(copyButton, favoriteButton);
  body.append(content, actions);
  card.append(mediaButton, body);

  mediaButton.addEventListener('click', () => {
    recordStickerUsage(sticker.id);

    if (typeof options.onPreview === 'function') {
      options.onPreview(sticker, { url: gifUrl });
    }
  });

  copyButton.addEventListener('click', async () => {
    recordStickerUsage(sticker.id);

    const copied = await copyText(gifUrl);

    showToast(copied ? '복사 완료' : '복사 실패', {
      type: copied ? 'success' : 'error',
    });
  });

  favoriteButton.addEventListener('click', () => {
    toggleFavorite(sticker.id);
    updateFavoriteButton(favoriteButton, sticker.id);
  });

  return card;
}

function createGifUrl(file) {
  const baseUrl = R2_BASE_URL.replace(/\/$/, '');
  const filePath = String(file ?? '').replace(/^\//, '');
  return `${baseUrl}/${filePath}`;
}

function updateFavoriteButton(button, stickerId) {
  const active = isFavorite(stickerId);
  button.textContent = active ? '즐겨찾기 해제' : '즐겨찾기';
  button.setAttribute('aria-pressed', String(active));
}

function recordStickerUsage(stickerId) {
  addRecent(stickerId);
  incrementFrequency(stickerId);
}
