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
    },
    math: {
      num: '§ IV',
      name: '수학사',
      latin: 'Mathematics',
      base: 'math-history/',
      sections: [
        { href: 'math-history/index.html',                 label: '개관',     overviewFor: 'main' },
        { href: 'math-history/eras/01-counting.html',      label: '셈',       eraKey: '01-counting' },
        { href: 'math-history/eras/02-proof.html',         label: '증명',     eraKey: '02-proof' },
        { href: 'math-history/eras/03-zero-algebra.html',  label: '0과 대수', eraKey: '03-zero-algebra' },
        { href: 'math-history/eras/04-natures-language.html', label: '자연 언어', eraKey: '04-natures-language' },
        { href: 'math-history/eras/05-uncertainty.html',   label: '불확실성', eraKey: '05-uncertainty' },
        { href: 'math-history/eras/06-infinity-foundations.html', label: '무한·기초', eraKey: '06-infinity-foundations' },
        { href: 'math-history/eras/07-the-machine.html',   label: '기계',     eraKey: '07-the-machine' }
      ]
    },
    insect: {
      num: '§ V',
      name: '곤충의 역사',
      latin: 'Insects',
      base: 'insect-history/',
      sections: [
        { href: 'insect-history/index.html',                 label: '개관',     overviewFor: 'main' },
        { href: 'insect-history/eras/00-prologue.html',      label: '프롤로그', eraKey: '00-prologue' },
        { href: 'insect-history/eras/01-carboniferous.html', label: '석탄기',   eraKey: '01-carboniferous' },
        { href: 'insect-history/eras/02-permian.html',       label: '페름기',   eraKey: '02-permian' },
        { href: 'insect-history/eras/03-mesozoic.html',      label: '중생대',   eraKey: '03-mesozoic' },
        { href: 'insect-history/eras/04-society.html',       label: '사회성',   eraKey: '04-society' },
        { href: 'insect-history/eras/05-resources.html',     label: '실크·꿀',  eraKey: '05-resources' },
        { href: 'insect-history/eras/06-history.html',       label: '질병·재해', eraKey: '06-history' },
        { href: 'insect-history/eras/07-ecosystem.html',     label: '생태계',   eraKey: '07-ecosystem' },
        { href: 'insect-history/eras/08-epilogue.html',      label: '에필로그', eraKey: '08-epilogue' }
      ]
    },
    'insect-war': {
      num: '§ VI',
      name: '곤충 전쟁',
      latin: 'Insect War',
      base: 'insect-war/',
      sections: [
        { href: 'insect-war/index.html',                            label: '개관',     overviewFor: 'main' },
        { href: 'insect-war/chapters/00-prologue.html',             label: '프롤로그', eraKey: '00-prologue' },
        { href: 'insect-war/chapters/01-7432.html',                 label: '1장',     eraKey: '01-7432' },
        { href: 'insect-war/chapters/02-pesticide.html',            label: '2장',     eraKey: '02-pesticide' },
        { href: 'insect-war/chapters/03-first-report.html',         label: '3장',     eraKey: '03-first-report' },
        { href: 'insect-war/chapters/04-arrival.html',              label: '4장',     eraKey: '04-arrival' },
        { href: 'insect-war/chapters/05-yellow-dance.html',         label: '5장',     eraKey: '05-yellow-dance' },
        { href: 'insect-war/chapters/06-cities-sync.html',          label: '6장',     eraKey: '06-cities-sync' },
        { href: 'insect-war/chapters/07-black-cloud.html',          label: '7장',     eraKey: '07-black-cloud' },
        { href: 'insect-war/chapters/08-chans-breakthrough.html',   label: '8장',     eraKey: '08-chans-breakthrough' },
        { href: 'insect-war/chapters/09-amber-mine.html',           label: '9장',     eraKey: '09-amber-mine' },
        { href: 'insect-war/chapters/10-nairobi-journey.html',      label: '10장',    eraKey: '10-nairobi-journey' },
        { href: 'insect-war/chapters/11-molecules-match.html',      label: '11장',    eraKey: '11-molecules-match' },
        { href: 'insect-war/chapters/12-queen-decides.html',        label: '12장',    eraKey: '12-queen-decides' },
        { href: 'insect-war/chapters/13-han-river.html',            label: '13장',    eraKey: '13-han-river' },
        { href: 'insect-war/chapters/14-un-calls.html',             label: '14장',    eraKey: '14-un-calls' },
        { href: 'insect-war/chapters/15-cloud-marches.html',        label: '15장',    eraKey: '15-cloud-marches' },
        { href: 'insect-war/chapters/16-chan-meets-nat.html',       label: '16장',    eraKey: '16-chan-meets-nat' },
        { href: 'insect-war/chapters/17-camilles-logic.html',       label: '17장',    eraKey: '17-camilles-logic' },
        { href: 'insect-war/chapters/18-council-of-hives.html',     label: '18장',    eraKey: '18-council-of-hives' },
        { href: 'insect-war/chapters/19-amiras-answer.html',        label: '19장',    eraKey: '19-amiras-answer' },
        { href: 'insect-war/chapters/20-yellow-last-dance.html',    label: '20장',    eraKey: '20-yellow-last-dance' },
        { href: 'insect-war/chapters/21-soms-testimony.html',       label: '21장',    eraKey: '21-soms-testimony' },
        { href: 'insect-war/chapters/22-facing-cloud.html',         label: '22장',    eraKey: '22-facing-cloud' },
        { href: 'insect-war/chapters/23-one-vote.html',             label: '23장',    eraKey: '23-one-vote' },
        { href: 'insect-war/chapters/24-beijing-alone.html',        label: '24장',    eraKey: '24-beijing-alone' },
        { href: 'insect-war/chapters/25-beijing-week-one.html',     label: '25장',    eraKey: '25-beijing-week-one' },
        { href: 'insect-war/chapters/26-nat-decides.html',          label: '26장',    eraKey: '26-nat-decides' },
        { href: 'insect-war/chapters/27-last-signal.html',          label: '27장',    eraKey: '27-last-signal' },
        { href: 'insect-war/chapters/28-beijing-month-one.html',    label: '28장',    eraKey: '28-beijing-month-one' },
        { href: 'insect-war/chapters/29-camille-arrives.html',      label: '29장',    eraKey: '29-camille-arrives' },
        { href: 'insect-war/chapters/30-new-promise.html',          label: '30장',    eraKey: '30-new-promise' },
        { href: 'insect-war/chapters/31-spring-after.html',         label: '31장',    eraKey: '31-spring-after' },
        { href: 'insect-war/chapters/32-epilogue-som-chan.html',    label: 'E1',      eraKey: '32-epilogue-som-chan' },
        { href: 'insect-war/chapters/33-epilogue-hive.html',        label: 'E2',      eraKey: '33-epilogue-hive' }
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
