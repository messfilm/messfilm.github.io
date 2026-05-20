/* ============================================================
   Archive for Som & Chan — Shared Top Navigation
   - 전역 헤더: 두 메달리온 로고 + Archive for / Som & Chan → 대문(/)
   - 컬렉션 sub-header: data-page-id에 따라 자동 주입
     좌측에 컬렉션 번호·명·이름, 우측에 섹션/시대 링크
   ============================================================ */

(function () {
  'use strict';

  var pageId = document.body && document.body.dataset && document.body.dataset.pageId;
  var collectionKey = pageId ? pageId.split('.')[0] : null;

  // Site root for absolute links (GitHub Pages may serve at sub-path)
  var ROOT = (function () {
    return (typeof window.SITE_ROOT === 'string') ? window.SITE_ROOT : '/';
  })();

  function url(rel) { return ROOT.replace(/\/$/, '') + '/' + rel.replace(/^\//, ''); }

  // ---------- Collection metadata ----------
  var COLLECTIONS = {
    religion: {
      num: '§ I',
      name: '아브라함의 세 자녀',
      latin: 'Abrahamic',
      base: 'abrahamic-religions/',
      sections: [
        { href: 'abrahamic-religions/#origins',     label: '뿌리' },
        { href: 'abrahamic-religions/#three',       label: '세 종교' },
        { href: 'abrahamic-religions/#sects',       label: '분파' },
        { href: 'abrahamic-religions/#timeline',    label: '연대기' },
        { href: 'abrahamic-religions/#wars',        label: '전쟁' },
        { href: 'abrahamic-religions/#iran-israel', label: '이란·이스라엘' },
        { href: 'abrahamic-religions/#impact',      label: '현재' }
      ]
    },
    korean: {
      num: '§ II',
      name: '한국사 4,000년',
      latin: 'Korean History',
      base: 'korean-history-v2/',
      sections: [
        { href: 'korean-history-v2/index.html',                       label: '개관', overviewFor: 'main' },
        { href: 'korean-history-v2/eras/01-prehistoric.html',         label: '선사',  eraKey: '01-prehistoric' },
        { href: 'korean-history-v2/eras/02-three-kingdoms.html',      label: '삼국',  eraKey: '02-three-kingdoms' },
        { href: 'korean-history-v2/eras/03-north-south.html',         label: '남북국', eraKey: '03-north-south' },
        { href: 'korean-history-v2/eras/04-goryeo.html',              label: '고려',  eraKey: '04-goryeo' },
        { href: 'korean-history-v2/eras/05-joseon-early.html',        label: '조선전기', eraKey: '05-joseon-early' },
        { href: 'korean-history-v2/eras/06-joseon-late.html',         label: '조선후기', eraKey: '06-joseon-late' },
        { href: 'korean-history-v2/eras/07-modern-opening.html',      label: '개항기', eraKey: '07-modern-opening' },
        { href: 'korean-history-v2/eras/08-japanese-colonial.html',   label: '일제',  eraKey: '08-japanese-colonial' },
        { href: 'korean-history-v2/eras/09-republic.html',            label: '대한민국', eraKey: '09-republic' }
      ]
    },
    science: {
      num: '§ III',
      name: '자연과학사',
      latin: 'Science',
      base: 'science-history/',
      sections: [
        { href: 'science-history/index.html',              label: '개관',     overviewFor: 'main' },
        { href: 'science-history/eras/01-ancient.html',    label: '고대',     eraKey: '01-ancient' },
        { href: 'science-history/eras/02-medieval.html',   label: '중세',     eraKey: '02-medieval' },
        { href: 'science-history/eras/03-revolution.html', label: '혁명',     eraKey: '03-revolution' },
        { href: 'science-history/eras/04-classical.html',  label: '고전과학', eraKey: '04-classical' },
        { href: 'science-history/eras/05-modern.html',     label: '현대물리', eraKey: '05-modern' },
        { href: 'science-history/eras/06-contemporary.html', label: '동시대', eraKey: '06-contemporary' }
      ]
    }
  };

  // ---------- Build global header ----------
  var header = document.createElement('header');
  header.className = 'site-header';

  var inner = document.createElement('div');
  inner.className = 'site-header__inner';

  var brand = document.createElement('a');
  brand.className = 'site-brand';
  brand.href = ROOT;
  brand.setAttribute('aria-label', 'Archive for Som & Chan — 대문으로');
  brand.innerHTML = [
    '<svg class="brand-logo" viewBox="0 0 90 50" width="78" height="44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<g>',
        '<circle cx="22" cy="25" r="20" fill="#faf6eb" stroke="#a37e2c" stroke-width="1.2"/>',
        '<defs><clipPath id="brandSomClip"><circle cx="22" cy="25" r="19.5"/></clipPath></defs>',
        '<g clip-path="url(#brandSomClip)">',
          '<path d="M 10 22 Q 8 32 10 42 L 14 42 Q 12 32 13 22 Z" fill="#1f1a14"/>',
          '<path d="M 34 22 Q 36 32 34 42 L 30 42 Q 32 32 31 22 Z" fill="#1f1a14"/>',
          '<ellipse cx="22" cy="28" rx="11.5" ry="12" fill="#faf6eb"/>',
          '<path d="M 11 23 C 9 16, 16 12, 22 12 C 28 12, 35 16, 33 23 Q 32 21 30 23 Q 28 20 26 23 Q 24 21 22 22 Q 20 21 18 23 Q 16 20 14 23 Q 12 21 11 23 Z" fill="#1f1a14"/>',
          '<ellipse cx="18" cy="28" rx="1.4" ry="1.7" fill="#1f1a14"/>',
          '<ellipse cx="26" cy="28" rx="1.4" ry="1.7" fill="#1f1a14"/>',
          '<ellipse cx="14.5" cy="32" rx="2" ry="1.3" fill="#e8a99c" opacity="0.55"/>',
          '<ellipse cx="29.5" cy="32" rx="2" ry="1.3" fill="#e8a99c" opacity="0.55"/>',
          '<path d="M 19 34 Q 22 37 25 34" fill="none" stroke="#1f1a14" stroke-width="0.8" stroke-linecap="round"/>',
        '</g>',
      '</g>',
      '<g transform="translate(46, 0)">',
        '<circle cx="22" cy="25" r="20" fill="#faf6eb" stroke="#a37e2c" stroke-width="1.2"/>',
        '<defs><clipPath id="brandChanClip"><circle cx="22" cy="25" r="19.5"/></clipPath></defs>',
        '<g clip-path="url(#brandChanClip)">',
          '<ellipse cx="22" cy="29" rx="11" ry="11" fill="#faf6eb"/>',
          '<path d="M 11 25 L 10 17 L 14 23 L 16 14 L 19 22 L 22 13 L 25 22 L 28 14 L 31 23 L 33 18 L 34 25 Q 32 28 30 28 L 14 28 Q 12 28 11 25 Z" fill="#1f1a14"/>',
          '<circle cx="18" cy="28" r="3.3" fill="#faf6eb" stroke="#1f1a14" stroke-width="0.9"/>',
          '<circle cx="26" cy="28" r="3.3" fill="#faf6eb" stroke="#1f1a14" stroke-width="0.9"/>',
          '<line x1="21.3" y1="28" x2="22.7" y2="28" stroke="#1f1a14" stroke-width="0.7"/>',
          '<circle cx="18" cy="28" r="0.8" fill="#1f1a14"/>',
          '<circle cx="26" cy="28" r="0.8" fill="#1f1a14"/>',
          '<path d="M 20 36 Q 22 37 24 36" fill="none" stroke="#1f1a14" stroke-width="0.7" stroke-linecap="round"/>',
        '</g>',
      '</g>',
    '</svg>',
    '<span class="brand-text">',
      '<span class="brand-prefix">Archive for</span>',
      '<span class="brand-names">Som <span class="brand-amp">&amp;</span> Chan</span>',
    '</span>'
  ].join('');
  inner.appendChild(brand);

  var hint = document.createElement('span');
  hint.className = 'site-header__hint';
  hint.textContent = '↑ 대문으로';
  hint.setAttribute('aria-hidden', 'true');
  inner.appendChild(hint);

  header.appendChild(inner);

  // ---------- Build collection sub-header (if applicable) ----------
  var subheader = null;
  var collection = COLLECTIONS[collectionKey];

  if (collection) {
    subheader = document.createElement('div');
    subheader.className = 'site-subheader collection-' + collectionKey;

    var subInner = document.createElement('div');
    subInner.className = 'site-subheader__inner';

    // Left: collection identity (clickable to overview)
    var ident = document.createElement('a');
    ident.className = 'site-subheader__brand';
    ident.href = url(collection.base);
    ident.innerHTML = [
      '<span class="sub-name">' + collection.name + '</span>',
      '<span class="sub-latin">' + collection.latin + '</span>',
      collection.wip ? '<span class="sub-wip">작업중</span>' : ''
    ].join('');
    subInner.appendChild(ident);

    // Right: section/era links
    var list = document.createElement('nav');
    list.className = 'site-subheader__list';
    list.setAttribute('aria-label', collection.name + ' 섹션');

    // Determine which item is current (era pages have data-page-id like "korean.era.01-prehistoric")
    var parts = pageId ? pageId.split('.') : [];
    var pageKind = parts[1] || null;   // 'main' or 'era'
    var pageSlug = parts[2] || null;   // 'main' kind has no third part; era kind has e.g. '01-prehistoric'

    collection.sections.forEach(function (s) {
      var a = document.createElement('a');
      a.href = url(s.href);
      a.textContent = s.label;

      // Active state
      var isActive = false;
      if (s.overviewFor === pageKind && pageKind === 'main') isActive = true;
      if (s.eraKey && s.eraKey === pageSlug) isActive = true;
      if (isActive) a.setAttribute('aria-current', 'page');

      list.appendChild(a);
    });

    subInner.appendChild(list);
    subheader.appendChild(subInner);
  }

  // ---------- Insert into DOM ----------
  if (document.body.firstChild) {
    document.body.insertBefore(header, document.body.firstChild);
  } else {
    document.body.appendChild(header);
  }
  if (subheader) {
    header.parentNode.insertBefore(subheader, header.nextSibling);
  }
})();
