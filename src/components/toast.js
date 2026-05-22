// 토스트 알림을 화면에 표시하는 독립 컴포넌트다.
const DEFAULT_DURATION = 1800;
const TOAST_TYPES = new Set(['success', 'error']);

let toastRegion = null;
let activeToast = null;
let hideTimer = null;

export function showToast(message, options = {}) {
  const documentRef = globalThis.document;

  if (!documentRef?.body) {
    return null;
  }

  const duration = Number.isFinite(options.duration)
    ? options.duration
    : DEFAULT_DURATION;
  const type = TOAST_TYPES.has(options.type) ? options.type : 'success';

  clearActiveToast();

  toastRegion = getToastRegion(documentRef);
  activeToast = documentRef.createElement('div');
  activeToast.className = `toast toast--${type}`;
  activeToast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  activeToast.textContent = String(message ?? '');

  toastRegion.append(activeToast);

  if (duration > 0) {
    hideTimer = globalThis.setTimeout(() => {
      clearActiveToast();
    }, duration);
  }

  return activeToast;
}

function getToastRegion(documentRef) {
  if (toastRegion?.isConnected) {
    return toastRegion;
  }

  const existingRegion = documentRef.querySelector('.toast-region');

  if (existingRegion) {
    return existingRegion;
  }

  const region = documentRef.createElement('div');
  region.className = 'toast-region';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  documentRef.body.append(region);

  return region;
}

function clearActiveToast() {
  if (hideTimer) {
    globalThis.clearTimeout(hideTimer);
    hideTimer = null;
  }

  if (activeToast?.isConnected) {
    activeToast.remove();
  }

  activeToast = null;
}
