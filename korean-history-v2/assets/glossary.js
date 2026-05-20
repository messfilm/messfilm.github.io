/* 한국사 4,000년 — Glossary hover popup
 * 본문의 [data-term] 요소 위에 마우스를 올리면 작은 카드 팝업을 표시한다.
 * 모바일에서는 탭 동작.
 */
(function () {
  'use strict';

  const DATA_URL = new URL('glossary-data.json', getAssetBase()).href;
  const CAT_LABEL = {
    person: '인물',
    event: '사건',
    institution: '제도',
    concept: '개념',
    place: '지명',
    artifact: '유물·문화'
  };

  let glossary = null;
  let popEl = null;
  let activeTerm = null;
  let hideTimer = null;

  function getAssetBase() {
    // /assets/ 경로를 기준으로 데이터 URL 계산 (상대경로 호환)
    const scripts = document.getElementsByTagName('script');
    for (const s of scripts) {
      const src = s.getAttribute('src') || '';
      if (src.indexOf('glossary.js') !== -1) {
        return new URL(src, window.location.href);
      }
    }
    return new URL('./', window.location.href);
  }

  async function loadGlossary() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      glossary = await res.json();
      bindTerms();
    } catch (err) {
      console.warn('[glossary] 데이터 로드 실패:', err);
    }
  }

  function ensurePopup() {
    if (popEl) return popEl;
    popEl = document.createElement('div');
    popEl.className = 'glossary-pop';
    popEl.style.display = 'none';
    popEl.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    popEl.addEventListener('mouseleave', scheduleHide);
    document.body.appendChild(popEl);
    return popEl;
  }

  function renderPopup(termKey) {
    const data = glossary[termKey];
    if (!data) return null;
    const pop = ensurePopup();
    const catLabel = CAT_LABEL[data.category] || data.category || '';
    pop.innerHTML = '';
    const titleWrap = document.createElement('div');
    const title = document.createElement('span');
    title.className = 'glossary-pop__title';
    title.textContent = data.title || termKey;
    titleWrap.appendChild(title);
    if (data.hanja) {
      const h = document.createElement('span');
      h.className = 'glossary-pop__hanja';
      h.textContent = data.hanja;
      titleWrap.appendChild(h);
    }
    if (catLabel) {
      const cat = document.createElement('span');
      cat.className = 'glossary-pop__cat';
      cat.textContent = catLabel;
      titleWrap.appendChild(cat);
    }
    pop.appendChild(titleWrap);
    const body = document.createElement('div');
    body.className = 'glossary-pop__body';
    body.textContent = data.summary || '';
    pop.appendChild(body);
    return pop;
  }

  function positionPopup(termEl, pop) {
    const rect = termEl.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    pop.style.display = 'block';
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    const margin = 8;
    let left = rect.left + scrollX;
    if (left + pw > scrollX + window.innerWidth - margin) {
      left = scrollX + window.innerWidth - pw - margin;
    }
    if (left < scrollX + margin) left = scrollX + margin;
    let top = rect.bottom + scrollY + 6;
    if (rect.bottom + ph + 6 > window.innerHeight && rect.top - ph - 6 > 0) {
      top = rect.top + scrollY - ph - 6;
    }
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function showFor(el) {
    const key = el.getAttribute('data-term');
    if (!key || !glossary || !glossary[key]) return;
    clearTimeout(hideTimer);
    activeTerm = el;
    const pop = renderPopup(key);
    if (!pop) return;
    positionPopup(el, pop);
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (popEl) popEl.style.display = 'none';
      activeTerm = null;
    }, 180);
  }

  function bindTerms() {
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-term]');
      if (el) showFor(el);
    });
    document.addEventListener('mouseout', (e) => {
      const el = e.target.closest('[data-term]');
      if (el && !el.contains(e.relatedTarget)) scheduleHide();
    });
    // Mobile tap toggle
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-term]');
      if (!el) {
        if (popEl && !popEl.contains(e.target)) {
          popEl.style.display = 'none';
          activeTerm = null;
        }
        return;
      }
      if (activeTerm === el && popEl && popEl.style.display === 'block') {
        popEl.style.display = 'none';
        activeTerm = null;
      } else {
        showFor(el);
      }
    });
    window.addEventListener('scroll', () => {
      if (popEl && popEl.style.display === 'block') {
        popEl.style.display = 'none';
        activeTerm = null;
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGlossary);
  } else {
    loadGlossary();
  }
})();
