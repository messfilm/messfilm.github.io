/* ============================================================
   Simulation: Egyptian unit-fraction decomposition
   분수 a/b → 1/x + 1/y + … (Fibonacci–Sylvester 그리디).
   Mounted on: <div class="sim" data-sim-id="egyptian-unit-fractions">
   ============================================================ */

(function () {
  'use strict';

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = b; b = a % b; a = t; }
    return a || 1;
  }

  // 분수 객체 {n, d} 단순화
  function simplify(n, d) {
    var g = gcd(n, d);
    return { n: n / g, d: d / g };
  }

  // a/b → 단위분수 분모 배열 [x1, x2, ...]; 안전 가드(최대 항수 / 분모 크기)
  // 반환: { ok: bool, parts: [Number], reason: string }
  function decompose(num, den) {
    if (!isFinite(num) || !isFinite(den)) return { ok: false, parts: [], reason: 'invalid' };
    if (den <= 0) return { ok: false, parts: [], reason: 'den-nonpositive' };
    if (num <= 0) return { ok: false, parts: [], reason: 'num-nonpositive' };
    if (num !== Math.floor(num) || den !== Math.floor(den)) return { ok: false, parts: [], reason: 'not-integer' };

    var s = simplify(num, den);
    var n = s.n, d = s.d;
    if (n >= d) return { ok: false, parts: [], reason: 'improper' }; // 진분수만

    var parts = [];
    var safetyMax = 12;        // 항 수 가드 — 12항이면 충분
    var maxDenom = 1e15;       // 분모 폭주 가드
    while (n > 0) {
      if (parts.length >= safetyMax) return { ok: false, parts: parts, reason: 'too-many-terms' };
      // x = ⌈d / n⌉
      var x = Math.ceil(d / n);
      if (!isFinite(x) || x > maxDenom) return { ok: false, parts: parts, reason: 'denom-overflow' };
      parts.push(x);
      // 잔여 = (n*x - d) / (d*x)
      var newN = n * x - d;
      var newD = d * x;
      if (newN === 0) return { ok: true, parts: parts, reason: 'ok' };
      var sim2 = simplify(newN, newD);
      n = sim2.n; d = sim2.d;
      if (d > maxDenom) return { ok: false, parts: parts, reason: 'denom-overflow' };
    }
    return { ok: true, parts: parts, reason: 'ok' };
  }

  function partsToHtml(parts) {
    return parts.map(function (x) {
      return '<span class="sim-euf__frac"><em>1</em><span class="sim-euf__bar"></span><em>' + x.toLocaleString() + '</em></span>';
    }).join('<span class="sim-euf__plus">+</span>');
  }

  function origFracHtml(n, d) {
    return '<span class="sim-euf__frac sim-euf__frac--orig"><em>' + n + '</em><span class="sim-euf__bar"></span><em>' + d + '</em></span>';
  }

  // 미리 정의된 분수 — 역사적으로 유명한 것 위주
  var EXAMPLES = [
    { n: 2, d: 3,  note: '이집트인의 「특별 분수」 2/3에는 고유 기호(𓂋)가 있었다. 그리디 분해로는 1/2 + 1/6.' },
    { n: 5, d: 6,  note: 'Rhind 파피루스 곳곳에 등장. 1/2 + 1/3.' },
    { n: 3, d: 4,  note: '1/2 + 1/4 — 깔끔한 두 항.' },
    { n: 7, d: 12, note: '1/2 + 1/12. 두 항으로 끝.' },
    { n: 4, d: 5,  note: '그리디는 1/2 + 1/4 + 1/20. 이집트인이 실제 표에서 쓴 분해와 다를 수 있다.' },
    { n: 3, d: 7,  note: '그리디는 1/3 + 1/11 + 1/231 — 분모가 빠르게 커진다.' },
    { n: 2, d: 7,  note: 'Rhind 파피루스 2/n 표에는 1/4 + 1/28. 그리디도 같은 답.' },
    { n: 2, d: 11, note: 'Rhind 표: 1/6 + 1/66. 그리디도 같은 답.' }
  ];

  function reasonText(reason, n, d) {
    switch (reason) {
      case 'invalid': return '숫자를 다시 확인해.';
      case 'den-nonpositive': return '분모는 양의 정수여야 해.';
      case 'num-nonpositive': return '분자는 양의 정수여야 해.';
      case 'not-integer': return '분자·분모 모두 정수여야 해.';
      case 'improper': return '이집트 단위분수는 진분수(분자<분모)만. ' + n + '/' + d + '는 1보다 크거나 같아.';
      case 'too-many-terms': return '항이 너무 많아져서 멈췄어 (그리디는 가끔 폭주한다).';
      case 'denom-overflow': return '분모가 너무 커져서 멈췄어. 이집트인도 이런 분수는 표로 따로 다뤘다.';
      default: return '계산 중 문제.';
    }
  }

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-egyptian-unit-fractions');

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '이집트 서기에게 분수는 「1을 몇 조각으로 나눈 한 조각」뿐이었다 — 1/2, 1/3, 1/7… 모든 분수는 이런 단위분수의 합으로 적어야 했다. 어떤 분수든 쳐보면 한 가지 분해가 나온다.';
    container.appendChild(lead);

    // ─── 자유 입력 패널 ───
    var freePanel = document.createElement('div');
    freePanel.className = 'sim-euf__panel';
    var freeHead = document.createElement('div');
    freeHead.className = 'sim-euf__panel-head';
    freeHead.innerHTML =
      '<span class="sim-euf__panel-label">분수 분해</span>' +
      '<span class="sim-euf__panel-latin">decompositio</span>';
    freePanel.appendChild(freeHead);

    var inputRow = document.createElement('div');
    inputRow.className = 'sim-euf__input-row';
    var nInput = document.createElement('input');
    nInput.type = 'number'; nInput.min = '1'; nInput.step = '1';
    nInput.className = 'sim-euf__input sim-euf__input--n';
    nInput.placeholder = '분자';
    var slash = document.createElement('span');
    slash.className = 'sim-euf__slash';
    slash.textContent = '/';
    var dInput = document.createElement('input');
    dInput.type = 'number'; dInput.min = '2'; dInput.step = '1';
    dInput.className = 'sim-euf__input sim-euf__input--d';
    dInput.placeholder = '분모';
    var goBtn = document.createElement('button');
    goBtn.type = 'button';
    goBtn.className = 'sim-btn';
    goBtn.textContent = '분해';
    inputRow.appendChild(nInput);
    inputRow.appendChild(slash);
    inputRow.appendChild(dInput);
    inputRow.appendChild(goBtn);
    freePanel.appendChild(inputRow);

    var resultBox = document.createElement('div');
    resultBox.className = 'sim-euf__result';
    freePanel.appendChild(resultBox);

    container.appendChild(freePanel);

    function runDecompose() {
      var nv = parseInt(nInput.value, 10);
      var dv = parseInt(dInput.value, 10);
      if (isNaN(nv) || isNaN(dv)) {
        resultBox.innerHTML = '<span class="sim-euf__err">분자와 분모를 모두 입력해.</span>';
        return;
      }
      var r = decompose(nv, dv);
      if (!r.ok) {
        resultBox.innerHTML = '<span class="sim-euf__err">' + reasonText(r.reason, nv, dv) + '</span>';
        return;
      }
      var s = simplify(nv, dv);
      var simHtml = (s.n !== nv || s.d !== dv)
        ? '<span class="sim-euf__simp">= ' + origFracHtml(s.n, s.d) + '</span>'
        : '';
      var termsCount = r.parts.length;
      resultBox.innerHTML =
        '<div class="sim-euf__eq">' +
        origFracHtml(nv, dv) + simHtml +
        '<span class="sim-euf__eq-sign">=</span>' +
        partsToHtml(r.parts) +
        '</div>' +
        '<div class="sim-euf__meta">' + termsCount + '개 단위분수의 합.</div>';
    }
    goBtn.addEventListener('click', runDecompose);
    [nInput, dInput].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); runDecompose(); }
      });
    });
    nInput.value = '2'; dInput.value = '3';
    runDecompose();

    // ─── 예시 버튼들 ───
    var examplesRow = document.createElement('div');
    examplesRow.className = 'sim-controls sim-euf__examples';
    var exHead = document.createElement('span');
    exHead.className = 'sim-euf__ex-head';
    exHead.textContent = '역사적 분수 :';
    examplesRow.appendChild(exHead);
    EXAMPLES.forEach(function (ex) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sim-btn sim-euf__ex';
      b.innerHTML = ex.n + ' / ' + ex.d;
      b.title = ex.note;
      b.addEventListener('click', function () {
        nInput.value = String(ex.n);
        dInput.value = String(ex.d);
        runDecompose();
        // 노트도 갱신
        exampleNote.innerHTML = ex.note;
      });
      examplesRow.appendChild(b);
    });
    container.appendChild(examplesRow);

    var exampleNote = document.createElement('div');
    exampleNote.className = 'sim-euf__ex-note';
    exampleNote.innerHTML = '버튼을 누르면 분수가 자동 입력된다 — 설명은 여기에.';
    container.appendChild(exampleNote);

    // ─── 정직성 안내 ───
    var note = document.createElement('p');
    note.className = 'sim-euf__note';
    note.innerHTML =
      '본 sim은 <em>Fibonacci–Sylvester 그리디 알고리즘</em>으로 분해한다 — 매 단계에서 분수보다 작은 가장 큰 단위분수를 떼어낸다 ' +
      '<code>(a/b → 1/⌈b/a⌉ + 잔여)</code>. ' +
      '실제 이집트 서기는 이렇게 풀지 않았다. 그들은 <em>Rhind 파피루스 「2/n 표」</em> 같은 외운 분해표에 의존했고, 표의 답은 종종 ' +
      '그리디 결과보다 더 짧고 분모도 작다. 예: 2/29에 대해 그리디는 1/15 + 1/435 (분모 큼), Rhind 표는 1/24 + 1/58 + 1/174 + 1/232. ' +
      '둘 다 정확하지만 「우아함」의 기준이 달랐다.';
    container.appendChild(note);

    // ─── 스코프된 스타일 ───
    if (!document.getElementById('sim-egyptian-unit-fractions-style')) {
      var style = document.createElement('style');
      style.id = 'sim-egyptian-unit-fractions-style';
      style.textContent =
        '.sim-egyptian-unit-fractions .sim-euf__panel{padding:16px;background:var(--paper);border:1px solid var(--rule);border-top:3px solid var(--accent);margin-top:14px;box-sizing:border-box;}' +
        '.sim-egyptian-unit-fractions .sim-euf__panel-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px;}' +
        '.sim-egyptian-unit-fractions .sim-euf__panel-label{font-family:var(--serif-ko);font-weight:700;font-size:14px;color:var(--ink);}' +
        '.sim-egyptian-unit-fractions .sim-euf__panel-latin{font-family:var(--serif-en);font-style:italic;font-size:11.5px;color:var(--ink-mute);}' +
        '.sim-egyptian-unit-fractions .sim-euf__input-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px;}' +
        '.sim-egyptian-unit-fractions .sim-euf__input{width:88px;font-family:var(--mono);font-size:15px;padding:6px 10px;border:1px solid var(--rule);background:var(--paper-light);color:var(--ink);text-align:center;box-sizing:border-box;-moz-appearance:textfield;}' +
        '.sim-egyptian-unit-fractions .sim-euf__input::-webkit-outer-spin-button,.sim-egyptian-unit-fractions .sim-euf__input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}' +
        '.sim-egyptian-unit-fractions .sim-euf__input:focus{outline:none;border-color:var(--accent);}' +
        '.sim-egyptian-unit-fractions .sim-euf__slash{font-family:var(--mono);font-size:22px;color:var(--ink-mute);}' +
        '.sim-egyptian-unit-fractions .sim-euf__result{margin-top:14px;min-height:60px;}' +
        '.sim-egyptian-unit-fractions .sim-euf__eq{display:flex;align-items:center;gap:10px;flex-wrap:wrap;line-height:1.2;}' +
        '.sim-egyptian-unit-fractions .sim-euf__eq-sign{font-family:var(--serif-en);font-size:22px;color:var(--ink-mute);}' +
        '.sim-egyptian-unit-fractions .sim-euf__simp{display:inline-flex;align-items:center;gap:6px;font-family:var(--sans-ko);font-size:11.5px;color:var(--ink-mute);}' +
        '.sim-egyptian-unit-fractions .sim-euf__frac{display:inline-flex;flex-direction:column;align-items:center;font-family:var(--serif-en);font-size:18px;color:var(--ink);line-height:1;padding:0 4px;}' +
        '.sim-egyptian-unit-fractions .sim-euf__frac em{font-style:normal;font-weight:500;}' +
        '.sim-egyptian-unit-fractions .sim-euf__bar{display:block;width:100%;height:1px;background:var(--ink);margin:2px 0;min-width:22px;}' +
        '.sim-egyptian-unit-fractions .sim-euf__frac--orig{font-weight:600;}' +
        '.sim-egyptian-unit-fractions .sim-euf__plus{font-family:var(--serif-en);font-size:20px;color:var(--accent);padding:0 2px;}' +
        '.sim-egyptian-unit-fractions .sim-euf__meta{margin-top:10px;font-family:var(--sans-ko);font-size:11.5px;color:var(--ink-mute);letter-spacing:0.04em;}' +
        '.sim-egyptian-unit-fractions .sim-euf__err{font-family:var(--sans-ko);font-size:12.5px;font-style:italic;color:var(--ink-soft);}' +
        '.sim-egyptian-unit-fractions .sim-euf__examples{margin-top:14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
        '.sim-egyptian-unit-fractions .sim-euf__ex-head{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.08em;color:var(--ink-mute);text-transform:uppercase;}' +
        '.sim-egyptian-unit-fractions .sim-euf__ex{font-family:var(--mono);font-size:12.5px;padding:4px 10px;}' +
        '.sim-egyptian-unit-fractions .sim-euf__ex-note{margin-top:10px;padding:8px 12px;background:var(--paper-light);border-left:2px solid var(--rule);font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-soft);line-height:1.7;}' +
        '.sim-egyptian-unit-fractions .sim-euf__note{margin:16px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-egyptian-unit-fractions .sim-euf__note code{font-family:var(--mono);font-style:normal;background:var(--paper-dark);padding:1px 5px;}' +
        '.sim-egyptian-unit-fractions .sim-euf__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-egyptian-unit-fractions .sim-euf__frac{font-size:16px;}.sim-egyptian-unit-fractions .sim-euf__plus{font-size:18px;}.sim-egyptian-unit-fractions .sim-euf__eq-sign{font-size:18px;}.sim-egyptian-unit-fractions .sim-euf__input{width:72px;font-size:14px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="egyptian-unit-fractions"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
