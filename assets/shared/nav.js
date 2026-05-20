/* ============================================================
   Archive for My Son — Shared Top Navigation
   data-page-id를 읽어 현재 컬렉션 하이라이트
   ============================================================ */

(function () {
  'use strict';

  var pageId = document.body && document.body.dataset && document.body.dataset.pageId;
  var collection = pageId ? pageId.split('.')[0] : null;

  // Determine site root for absolute links (GitHub Pages may serve at sub-path)
  var ROOT = (function () {
    // If pages live under /<repo>/, computed via window.SITE_ROOT or default '/'
    return (typeof window.SITE_ROOT === 'string') ? window.SITE_ROOT : '/';
  })();

  function url(rel) { return ROOT.replace(/\/$/, '') + '/' + rel.replace(/^\//, ''); }

  var links = [
    { href: 'abrahamic-religions/', label: '종교사',     collection: 'religion' },
    { href: 'korean-history/',      label: '한국사',     collection: 'korean'   },
    { href: 'science-history/',     label: '자연과학사', collection: 'science' },
    { href: 'research/',            label: '연구 아카이브', collection: 'research' }
  ];

  var header = document.createElement('header');
  header.className = 'site-header';
  if (collection) header.classList.add('collection-' + collection);

  var inner = document.createElement('div');
  inner.className = 'site-header__inner';

  var brand = document.createElement('a');
  brand.className = 'site-brand';
  brand.href = url('/');
  brand.innerHTML = '아들을 위한 아카이브<span class="latin">Archive for My Son</span>';
  inner.appendChild(brand);

  var nav = document.createElement('nav');
  nav.className = 'site-header__nav';
  nav.setAttribute('aria-label', '사이트 전체 네비게이션');

  links.forEach(function (l) {
    var a = document.createElement('a');
    a.href = url(l.href);
    a.setAttribute('data-collection', l.collection);
    a.innerHTML = l.label + (l.wip ? ' <span class="badge-wip">작업중</span>' : '');
    if (collection === l.collection) a.setAttribute('aria-current', 'page');
    nav.appendChild(a);
  });
  inner.appendChild(nav);
  header.appendChild(inner);

  // Insert at the very top of body
  if (document.body.firstChild) {
    document.body.insertBefore(header, document.body.firstChild);
  } else {
    document.body.appendChild(header);
  }
})();
