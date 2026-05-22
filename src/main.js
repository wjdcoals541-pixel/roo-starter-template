// 앱 진입점에서 PIN 게이트와 스티커 갤러리 컴포넌트를 통합한다.
import './styles/index.css';
import gifsData from './data/gifs.json';
import { APP_TITLE } from './constants.js';
import { createModal } from './components/modal.js';
import { createPackSidebar } from './components/pack-sidebar.js';
import { createSearchBox } from './components/search.js';
import { createStickerGrid } from './components/sticker-grid.js';
import { getStickersByPack, searchStickers } from './utils/filters.js';
import { getFavorites, getFrequency, getRecent } from './utils/storage.js';

const documentRef = globalThis.document;
const app = documentRef.querySelector('#app');

let packs = [];
let stickers = [];
let stickerById = new Map();
let sidebarPacks = [];
let selectedPackId = 'favorites';
let searchQuery = '';
let sidebar = null;
let grid = null;
let modal = null;

initializeApp();

async function initializeApp() {
  renderLoading();
  setGalleryData(await loadGalleryData());
  renderGallery();
}

function renderLoading() {
  const loading = documentRef.createElement('div');
  loading.className = 'gate';
  loading.textContent = 'GIF창고를 여는 중입니다.';
  app.replaceChildren(loading);
}

async function loadGalleryData() {
  try {
    const response = await globalThis.fetch('/api/packs', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`GET /api/packs failed with ${response.status}`);
    }

    return normalizeGalleryData(await response.json());
  } catch (error) {
    globalThis.console.warn('Failed to load /api/packs. Falling back to gifs.json.', error);
    return normalizeGalleryData(gifsData);
  }
}

function normalizeGalleryData(data) {
  return {
    packs: Array.isArray(data?.packs) ? data.packs : [],
    stickers: Array.isArray(data?.stickers) ? data.stickers : [],
  };
}

function setGalleryData(data) {
  packs = data.packs;
  stickers = data.stickers;
  stickerById = new Map(stickers.map((sticker) => [sticker.id, sticker]));
  selectedPackId = getDefaultPackId(packs);
  sidebarPacks = prioritizePack(packs, selectedPackId);
}

function renderGallery() {
  modal = modal ?? createModal();
  app.replaceChildren(createAppShell());
  renderCurrentStickers();
}

function createAppShell() {
  const shell = documentRef.createElement('div');
  shell.className = 'app-shell';

  const sidebarRegion = documentRef.createElement('aside');
  sidebarRegion.className = 'app-sidebar';

  const main = documentRef.createElement('main');
  main.className = 'app-main';

  const header = documentRef.createElement('header');
  header.className = 'app-toolbar';

  const title = documentRef.createElement('h1');
  title.textContent = APP_TITLE;

  const search = createSearchBox({
    initialQuery: searchQuery,
    onSearch: (query) => {
      searchQuery = query;
      renderCurrentStickers();
    },
  });

  sidebar = createPackSidebar({
    packs: sidebarPacks,
    selectedPackId,
    onSelect: (packId) => {
      selectedPackId = packId;
      sidebar.setActive(packId);
      renderCurrentStickers();
    },
  });

  grid = createStickerGrid({
    stickers: [],
    title: '',
    emptyMessage: '표시할 스티커가 없습니다.',
    onPreview: (sticker) => {
      modal.open(sticker);
      renderCurrentStickers();
    },
  });

  main.addEventListener('click', (event) => {
    if (event.target.closest('.sticker-card__action')) {
      globalThis.setTimeout(renderCurrentStickers, 0);
    }
  });

  header.append(title);

  if (search) {
    header.append(search);
  }

  if (sidebar?.element) {
    sidebarRegion.append(sidebar.element);
  }

  if (grid?.element) {
    main.append(header, grid.element);
  } else {
    main.append(header);
  }

  shell.append(sidebarRegion, main);
  return shell;
}

function renderCurrentStickers() {
  if (!grid) {
    return;
  }

  const baseStickers = getSelectedStickers(selectedPackId);
  const visibleStickers = searchQuery
    ? searchStickers(baseStickers, searchQuery)
    : baseStickers;

  grid.renderStickers(visibleStickers, getSelectedTitle(selectedPackId));
}

function getSelectedStickers(packId) {
  if (packId === 'favorites') {
    return getFavorites()
      .map((stickerId) => stickerById.get(stickerId))
      .filter(Boolean);
  }

  if (packId === 'recent') {
    return getRecent()
      .map((stickerId) => stickerById.get(stickerId))
      .filter(Boolean);
  }

  if (packId === 'frequent') {
    const frequency = getFrequency();

    return Object.entries(frequency)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .map(([stickerId]) => stickerById.get(stickerId))
      .filter(Boolean);
  }

  return getStickersByPack(stickers, packId);
}

function getSelectedTitle(packId) {
  if (packId === 'favorites') {
    return 'Favorites';
  }

  if (packId === 'recent') {
    return 'Recent';
  }

  if (packId === 'frequent') {
    return 'Frequent';
  }

  return packs.find((pack) => pack.id === packId)?.name ?? APP_TITLE;
}

function getDefaultPackId(packs) {
  return packs.some((pack) => pack.id === '루미콘')
    ? '루미콘'
    : (packs[0]?.id ?? 'favorites');
}

function prioritizePack(packs, packId) {
  if (!packId) {
    return packs;
  }

  return [
    ...packs.filter((pack) => pack.id === packId),
    ...packs.filter((pack) => pack.id !== packId),
  ];
}
