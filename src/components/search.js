// 검색어 입력과 초기화를 처리하는 검색 컴포넌트다.
const SEARCH_DEBOUNCE_MS = 150;

export function createSearchBox(options = {}) {
  const documentRef = globalThis.document;

  if (!documentRef) {
    return null;
  }

  let searchTimer = null;

  const root = documentRef.createElement('div');
  root.className = 'search-box';

  const input = documentRef.createElement('input');
  input.className = 'search-box__input';
  input.type = 'search';
  input.placeholder = 'Search stickers';
  input.value = options.initialQuery ?? '';
  input.setAttribute('aria-label', 'Search stickers');

  const clearButton = documentRef.createElement('button');
  clearButton.className = 'search-box__clear';
  clearButton.type = 'button';
  clearButton.textContent = 'Clear';

  root.append(input, clearButton);
  updateClearButton();

  input.addEventListener('input', () => {
    updateClearButton();
    scheduleSearch(input.value);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearSearch();
    }
  });

  clearButton.addEventListener('click', () => {
    clearSearch();
    input.focus();
  });

  function scheduleSearch(query) {
    if (searchTimer) {
      globalThis.clearTimeout(searchTimer);
    }

    searchTimer = globalThis.setTimeout(() => {
      searchTimer = null;
      emitSearch(query);
    }, SEARCH_DEBOUNCE_MS);
  }

  function clearSearch() {
    if (input.value === '') {
      return;
    }

    input.value = '';
    updateClearButton();
    scheduleSearch('');
  }

  function emitSearch(query) {
    if (typeof options.onSearch === 'function') {
      options.onSearch(query);
    }
  }

  function updateClearButton() {
    clearButton.hidden = input.value === '';
  }

  return root;
}
