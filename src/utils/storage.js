// localStorage 접근을 안전하게 감싸는 저장소 유틸 함수 모음이다.
import { STORAGE_KEYS } from '../constants.js';

const STORAGE_KEY_MAP = {
  favorites: STORAGE_KEYS.favorites,
  recent: STORAGE_KEYS.recentPacks,
  frequency: 'gif-sticker-gallery:frequency',
};

const DEFAULT_RECENT_LIMIT = 12;

function getLocalStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function getStoredValue(key, fallbackValue) {
  const storage = getLocalStorage();

  if (!storage) {
    return fallbackValue;
  }

  try {
    const rawValue = storage.getItem(key);
    return rawValue === null ? fallbackValue : JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

export function setStoredValue(key, value) {
  const storage = getLocalStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStoredValue(key) {
  const storage = getLocalStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getFavorites() {
  const favorites = getStoredValue(STORAGE_KEY_MAP.favorites, []);
  return Array.isArray(favorites) ? favorites : [];
}

export function setFavorites(favorites) {
  return setStoredValue(
    STORAGE_KEY_MAP.favorites,
    Array.isArray(favorites) ? [...new Set(favorites)] : []
  );
}

export function addFavorite(stickerId) {
  if (!stickerId) {
    return getFavorites();
  }

  const favorites = [...new Set([...getFavorites(), stickerId])];
  setFavorites(favorites);
  return favorites;
}

export function removeFavorite(stickerId) {
  const favorites = getFavorites().filter((id) => id !== stickerId);
  setFavorites(favorites);
  return favorites;
}

export function toggleFavorite(stickerId) {
  return getFavorites().includes(stickerId)
    ? removeFavorite(stickerId)
    : addFavorite(stickerId);
}

export function isFavorite(stickerId) {
  return getFavorites().includes(stickerId);
}

export function getRecent() {
  const recent = getStoredValue(STORAGE_KEY_MAP.recent, []);
  return Array.isArray(recent) ? recent : [];
}

export function setRecent(recent) {
  return setStoredValue(
    STORAGE_KEY_MAP.recent,
    Array.isArray(recent) ? [...new Set(recent)] : []
  );
}

export function addRecent(stickerId, limit = DEFAULT_RECENT_LIMIT) {
  if (!stickerId) {
    return getRecent();
  }

  const nextRecent = [
    stickerId,
    ...getRecent().filter((id) => id !== stickerId),
  ].slice(0, limit);

  setRecent(nextRecent);
  return nextRecent;
}

export function clearRecent() {
  return removeStoredValue(STORAGE_KEY_MAP.recent);
}

export function getFrequency() {
  const frequency = getStoredValue(STORAGE_KEY_MAP.frequency, {});
  return frequency && typeof frequency === 'object' && !Array.isArray(frequency)
    ? frequency
    : {};
}

export function setFrequency(frequency) {
  return setStoredValue(
    STORAGE_KEY_MAP.frequency,
    frequency && typeof frequency === 'object' && !Array.isArray(frequency)
      ? frequency
      : {}
  );
}

export function incrementFrequency(stickerId) {
  if (!stickerId) {
    return getFrequency();
  }

  const frequency = getFrequency();
  const nextFrequency = {
    ...frequency,
    [stickerId]: (Number(frequency[stickerId]) || 0) + 1,
  };

  setFrequency(nextFrequency);
  return nextFrequency;
}

export function clearFrequency() {
  return removeStoredValue(STORAGE_KEY_MAP.frequency);
}
