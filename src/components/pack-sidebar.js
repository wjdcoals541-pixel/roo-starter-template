// 스티커 묶음 선택 사이드바를 생성하는 컴포넌트다.
const DEFAULT_TABS = [
  { id: 'favorites', name: 'Favorites' },
  { id: 'recent', name: 'Recent' },
  { id: 'frequent', name: 'Frequent' },
];

export function createPackSidebar(options = {}) {
  const documentRef = globalThis.document;

  if (!documentRef) {
    return null;
  }

  const packs = Array.isArray(options.packs) ? options.packs : [];
  const root = documentRef.createElement('nav');
  root.className = 'pack-sidebar';
  root.setAttribute('aria-label', 'Sticker packs');

  const tabList = documentRef.createElement('div');
  tabList.className = 'pack-tabs';
  tabList.setAttribute('role', 'tablist');

  const buttons = new Map();

  for (const pack of [...DEFAULT_TABS, ...packs]) {
    const button = createPackButton(documentRef, pack);
    buttons.set(pack.id, button);
    tabList.append(button);
  }

  root.append(tabList);

  function setActive(packId) {
    for (const [id, button] of buttons) {
      const active = id === packId;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    }
  }

  tabList.addEventListener('click', (event) => {
    const button = event.target.closest('.pack-tab');

    if (!button) {
      return;
    }

    const packId = button.dataset.packId;
    setActive(packId);

    if (typeof options.onSelect === 'function') {
      options.onSelect(packId);
    }
  });

  setActive(options.selectedPackId ?? DEFAULT_TABS[0].id);

  return {
    element: root,
    setActive,
  };
}

function createPackButton(documentRef, pack) {
  const button = documentRef.createElement('button');
  button.className = 'pack-tab';
  button.type = 'button';
  button.dataset.packId = pack.id;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', 'false');
  button.textContent = pack.name;

  return button;
}
