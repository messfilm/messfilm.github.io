/* 한국사 4,000년 — Site-wide search
 * 상단 네비 .search 박스에서 실시간 자동완성.
 * search-index.json을 클라이언트가 로드 → 한글·한자·라틴 부분일치.
 */
(function () {
  'use strict';

  const TYPE_LABEL = {
    page: '페이지',
    era: '시대',
    person: '인물',
    event: '사건',
    institution: '제도',
    concept: '개념',
    place: '지명',
    artifact: '유물'
  };

  let index = null;
  let baseUrl = null;
  let dataUrl = null;
  let activeIdx = -1;
  let results = [];
  let searchEl = null;
  let inputEl = null;
  let resultsEl = null;

  function init() {
    searchEl = document.querySelector('[data-search]');
    if (!searchEl) return;
    inputEl = searchEl.querySelector('.search__input');
    resultsEl = searchEl.querySelector('.search__results');
    if (!inputEl || !resultsEl) return;

    computeBase();
    inputEl.addEventListener('input', onInput);
    inputEl.addEventListener('focus', () => { if (inputEl.value.trim()) doSearch(inputEl.value); });
    inputEl.addEventListener('keydown', onKey);
    document.addEventListener('click', (e) => {
      if (!searchEl.contains(e.target)) close();
    });

    loadIndex();
  }

  function computeBase() {
    // search.js의 src 경로에서 사이트 루트 도출
    const scripts = document.getElementsByTagName('script');
    for (const s of scripts) {
      const src = s.getAttribute('src') || '';
      if (src.indexOf('search.js') !== -1) {
        const scriptUrl = new URL(src, window.location.href);
        // assets/ 디렉토리의 부모가 사이트 루트
        baseUrl = new URL('../', scriptUrl).href;
        dataUrl = new URL('search-index.json', scriptUrl).href;
        return;
      }
    }
    baseUrl = new URL('./', window.location.href).href;
    dataUrl = baseUrl + 'assets/search-index.json';
  }

  async function loadIndex() {
    try {
      const res = await fetch(dataUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      index = await res.json();
    } catch (err) {
      console.warn('[search] 인덱스 로드 실패:', err);
    }
  }

  function onInput() {
    const q = inputEl.value.trim();
    if (!q) { close(); return; }
    doSearch(q);
  }

  function doSearch(q) {
    if (!index) { renderEmpty('인덱스 로딩 중…'); return; }
    const qLower = q.toLowerCase();
    const scored = [];
    for (const item of index) {
      const title = (item.title || '').toLowerCase();
      const hanja = (item.hanja || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      let score = 0;
      if (title === qLower) score += 100;
      if (title.startsWith(qLower)) score += 50;
      if (title.indexOf(qLower) !== -1) score += 25;
      if (hanja.indexOf(qLower) !== -1) score += 30;
      if (content.indexOf(qLower) !== -1) score += 5;
      // 한글 자모 부분일치 보너스 (간이)
      if (score === 0 && containsKoreanPart(item.title || '', q)) score += 8;
      if (score > 0) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    results = scored.slice(0, 12).map(s => s.item);
    activeIdx = results.length > 0 ? 0 : -1;
    render();
  }

  function containsKoreanPart(title, q) {
    // 단순화: 한글 한 글자라도 포함되면 매치
    if (q.length < 1) return false;
    for (const ch of q) {
      if (title.indexOf(ch) === -1) return false;
    }
    return true;
  }

  function render() {
    if (results.length === 0) { renderEmpty('검색 결과 없음'); return; }
    resultsEl.innerHTML = '';
    results.forEach((item, i) => {
      const a = document.createElement('a');
      a.className = 'search__item' + (i === activeIdx ? ' is-active' : '');
      a.href = resolveUrl(item.url);
      a.addEventListener('mouseenter', () => { activeIdx = i; updateActive(); });
      const title = document.createElement('div');
      title.className = 'search__item-title';
      title.textContent = item.title;
      if (item.hanja) {
        const h = document.createElement('span');
        h.className = 'hanja';
        h.textContent = item.hanja;
        title.appendChild(h);
      }
      const meta = document.createElement('div');
      meta.className = 'search__item-meta';
      meta.textContent = [TYPE_LABEL[item.type] || item.type, item.era].filter(Boolean).join(' · ');
      a.appendChild(title);
      a.appendChild(meta);
      if (item.content) {
        const snip = document.createElement('div');
        snip.className = 'search__item-snippet';
        snip.textContent = item.content;
        a.appendChild(snip);
      }
      resultsEl.appendChild(a);
    });
    searchEl.classList.add('is-open');
  }

  function renderEmpty(msg) {
    resultsEl.innerHTML = '<div class="search__empty">' + msg + '</div>';
    searchEl.classList.add('is-open');
    activeIdx = -1;
    results = [];
  }

  function updateActive() {
    const items = resultsEl.querySelectorAll('.search__item');
    items.forEach((el, i) => el.classList.toggle('is-active', i === activeIdx));
  }

  function close() {
    searchEl.classList.remove('is-open');
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length === 0) return;
      activeIdx = (activeIdx + 1) % results.length;
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length === 0) return;
      activeIdx = (activeIdx - 1 + results.length) % results.length;
      updateActive();
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && results[activeIdx]) {
        e.preventDefault();
        window.location.href = resolveUrl(results[activeIdx].url);
      }
    } else if (e.key === 'Escape') {
      close();
      inputEl.blur();
    }
  }

  function resolveUrl(url) {
    if (!url) return '#';
    if (url.indexOf('://') !== -1 || url.startsWith('/')) return url;
    return baseUrl + url;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
