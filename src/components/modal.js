// GIF 확대보기 모달을 생성하고 재사용하는 컴포넌트다.
import { R2_BASE_URL } from '../constants.js';
import { copyText } from '../utils/clipboard.js';
import { showToast } from './toast.js';

export function createModal() {
  const documentRef = globalThis.document;

  if (!documentRef?.body) {
    return null;
  }

  let currentUrl = '';
  let previousOverflow = '';

  const backdrop = documentRef.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.hidden = true;

  const modal = documentRef.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'sticker-modal-title');

  const header = documentRef.createElement('header');
  header.className = 'modal__header';

  const title = documentRef.createElement('h2');
  title.className = 'modal__title';
  title.id = 'sticker-modal-title';

  const closeButton = documentRef.createElement('button');
  closeButton.className = 'modal__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '모달 닫기');
  closeButton.textContent = '닫기';

  const body = documentRef.createElement('div');
  body.className = 'modal__body';

  const image = documentRef.createElement('img');
  image.className = 'modal__image';
  image.loading = 'lazy';

  const footer = documentRef.createElement('footer');
  footer.className = 'modal__footer';

  const copyButton = documentRef.createElement('button');
  copyButton.className = 'sticker-card__action';
  copyButton.type = 'button';
  copyButton.textContent = 'URL 복사';

  header.append(title, closeButton);
  body.append(image);
  footer.append(copyButton);
  modal.append(header, body, footer);
  backdrop.append(modal);
  documentRef.body.append(backdrop);

  function open(sticker) {
    currentUrl = createGifUrl(sticker?.file);
    const stickerLabel = getStickerLabel(sticker);
    title.textContent = stickerLabel;
    image.src = currentUrl;
    image.alt = stickerLabel;
    if (backdrop.hidden) {
      previousOverflow = documentRef.body.style.overflow ?? '';
      documentRef.body.style.overflow = 'hidden';
      backdrop.hidden = false;
      documentRef.addEventListener('keydown', handleKeydown);
    }
  }

  function close() {
    if (backdrop.hidden) {
      return;
    }

    backdrop.hidden = true;
    image.removeAttribute('src');
    documentRef.body.style.overflow = previousOverflow;
    documentRef.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      close();
    }
  });

  closeButton.addEventListener('click', () => {
    close();
  });

  copyButton.addEventListener('click', async () => {
    const copied = await copyText(currentUrl);

    showToast(copied ? 'URL 복사 완료' : 'URL 복사 실패', {
      type: copied ? 'success' : 'error',
    });
  });

  return {
    element: backdrop,
    open,
    close,
  };
}

function createGifUrl(file) {
  const baseUrl = R2_BASE_URL.replace(/\/$/, '');
  const filePath = String(file ?? '').replace(/^\//, '');
  return `${baseUrl}/${filePath}`;
}

function getStickerLabel(sticker) {
  return sticker?.title ?? sticker?.name ?? sticker?.id ?? '';
}
