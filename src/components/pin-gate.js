// PIN 입력 기반의 캐주얼 접근 제한 화면을 생성하는 컴포넌트다.
import { APP_TITLE, PIN_HASH, STORAGE_KEYS } from '../constants.js';

const UNLOCK_TOKEN = 'unlocked';

export function createPinGate(options = {}) {
  const documentRef = globalThis.document;

  if (!documentRef) {
    return null;
  }

  if (isUnlocked()) {
    notifyUnlock(options);
  }

  const root = documentRef.createElement('section');
  root.className = 'gate';

  const panel = documentRef.createElement('div');
  panel.className = 'gate__panel';

  const title = documentRef.createElement('h1');
  title.className = 'gate__title';
  title.textContent = APP_TITLE;

  const description = documentRef.createElement('p');
  description.className = 'gate__description';
  description.textContent = 'PIN을 입력해 갤러리를 엽니다.';

  const form = documentRef.createElement('form');
  form.className = 'gate__form';

  const input = documentRef.createElement('input');
  input.className = 'gate__input';
  input.type = 'password';
  input.inputMode = 'numeric';
  input.autocomplete = 'current-password';
  input.placeholder = 'PIN';
  input.setAttribute('aria-label', 'PIN');

  const error = documentRef.createElement('p');
  error.className = 'gate__error';
  error.setAttribute('role', 'alert');
  error.hidden = true;

  const button = documentRef.createElement('button');
  button.className = 'gate__button';
  button.type = 'submit';
  button.textContent = '열기';

  form.append(input, error, button);
  panel.append(title, description, form);
  root.append(panel);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setError(error, '');

    const hash = await hashPin(input.value);

    if (hash && hash === PIN_HASH) {
      setUnlockToken();
      notifyUnlock(options);
      return;
    }

    setError(error, 'PIN이 올바르지 않습니다.');
  });

  return root;
}

// 이 게이트는 강한 인증 수단이 아니라 우발적인 접근을 줄이는 캐주얼 잠금 장치다.
async function hashPin(pin) {
  const cryptoRef = globalThis.crypto;

  if (!cryptoRef?.subtle) {
    return '';
  }

  const encodedPin = new globalThis.TextEncoder().encode(String(pin ?? ''));
  const digest = await cryptoRef.subtle.digest('SHA-256', encodedPin);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function isUnlocked() {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEYS.pinVerified) === UNLOCK_TOKEN;
  } catch {
    return false;
  }
}

function setUnlockToken() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEYS.pinVerified, UNLOCK_TOKEN);
  } catch {
    return false;
  }

  return true;
}

function notifyUnlock(options) {
  if (typeof options.onUnlock === 'function') {
    options.onUnlock();
  }
}

function setError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.hidden = message === '';
}
