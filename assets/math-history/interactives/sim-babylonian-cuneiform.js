/* ============================================================
   Simulation: Babylonian cuneiform numerals
   60진법 점토판 숫자를 쐐기문자(𒁹·𒌋)로 렌더.
   Mounted on: <div class="sim" data-sim-id="babylonian-cuneiform">
   ============================================================ */

(function () {
  'use strict';

  // 유니코드 쐐기:
  //   𒁹 U+12079  → 1 (세로쐐기, vertical wedge)
  //   𒌋 U+1230B  → 10 (각진쐐기, Winkelhaken)
  var WEDGE_1 = '𒁹';   // 𒁹
  var WEDGE_10 = '𒌋';  // 𒌋

  // 한 자리(0~59)를 쐐기 문자열로 — 10그룹과 1그룹 사이 시각적 틈
  function digitToWedges(d) {
    if (d === 0) return ''; // 빈 자리 (sim에서는 공란 자리 표시기로 대체)
    if (d < 0 || d > 59) return '';
    var tens = Math.floor(d / 10);
    var ones = d % 10;
    var s = '';
    for (var i = 0; i < tens; i++) s += WEDGE_10;
    if (tens > 0 && ones > 0) s += ' '; // 얇은 공백
    for (var j = 0; j < ones; j++) s += WEDGE_1;
    return s;
  }

  // 10진수 → 60진 자리 배열
  function decToSexagesimal(n) {
    if (n === 0) return [0];
    var digits = [];
    while (n > 0) { digits.unshift(n % 60); n = Math.floor(n / 60); }
    return digits;
  }

  // 자리 배열 → 점토판 같은 묶음 HTML
  function digitsToTablet(digits) {
    return digits.map(function (d) {
      if (d === 0) {
        return '<span class="sim-bc__digit sim-bc__digit--empty" title="빈 자리 (바빌로니아인은 후기에 와서 빈자리 표시기를 썼다)">⌷</span>';
      }
      return '<span class="sim-bc__digit" title="' + d + '">' + digitToWedges(d) + '</span>';
    }).join('<span class="sim-bc__sep"></span>');
  }

  // 자리 배열 → "1 ; 15" 형식
  function digitsToSexNotation(digits) {
    return digits.join(' ; ');
  }

  // 풀이 식: 1 × 60 + 15 = 75
  function digitsToExpansion(digits, total) {
    if (digits.length === 1) return digits[0] + ' = ' + total;
    var parts = [];
    for (var i = 0; i < digits.length; i++) {
      var p = digits.length - 1 - i;
      var d = digits[i];
      if (d === 0 && digits.length > 1) continue;
      if (p === 0) parts.push(d + '');
      else if (p === 1) parts.push(d + '×60');
      else parts.push(d + '×60' + sup(p));
    }
    return parts.join(' + ') + ' = ' + total;
  }
  function sup(n) {
    var m = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    return String(n).split('').map(function (c) { return m[c] || c; }).join('');
  }

  // 퀴즈용 미리 정의된 점토판 숫자들 (의도적으로 다양한 패턴)
  var QUIZ = [
    { dec: 5,    why: '세로쐐기 5개. 한 자리 안.' },
    { dec: 14,   why: '10 한 묶음 + 1 네 개.' },
    { dec: 32,   why: '10 세 묶음 + 1 두 개.' },
    { dec: 60,   why: '한 자리 올림. 첫 자리 「1」, 다음 자리 비어 있다.' },
    { dec: 75,   why: '1×60 + 15.' },
    { dec: 144,  why: '2×60 + 24.' },
    { dec: 600,  why: '10×60 + 0. 둘째 자리가 비어 있어 — 바빌로니아인을 곤란하게 했던 그 「0」.' },
    { dec: 3601, why: '1×3600 + 0×60 + 1. 두 개의 빈자리 문제.' }
  ];

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-babylonian-cuneiform');

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '점토판에 갈대로 두 가지 쐐기만 찍는다 — 세로(𒁹)는 1, 비스듬(𒌋)은 10. 한 자리에 최대 59까지 찍고, 다 차면 옆자리로 넘어간다 (60진법). 숫자를 쳐보면 그 즉시 쐐기로 옮겨진다.';
    container.appendChild(lead);

    // ─── 자유 입력 모드 ───
    var freePanel = document.createElement('div');
    freePanel.className = 'sim-bc__panel';
    var freeHead = document.createElement('div');
    freeHead.className = 'sim-bc__panel-head';
    freeHead.innerHTML =
      '<span class="sim-bc__panel-label">자유 입력</span>' +
      '<span class="sim-bc__panel-latin">numerus tuus</span>';
    freePanel.appendChild(freeHead);
    var inputRow = document.createElement('div');
    inputRow.className = 'sim-bc__input-row';
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'sim-bc__input';
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('autocomplete', 'off');
    input.placeholder = '1 ~ 3599 사이 정수';
    inputRow.appendChild(input);
    freePanel.appendChild(inputRow);

    var tablet = document.createElement('div');
    tablet.className = 'sim-bc__tablet';
    freePanel.appendChild(tablet);

    var workLine = document.createElement('div');
    workLine.className = 'sim-bc__work';
    freePanel.appendChild(workLine);

    container.appendChild(freePanel);

    function renderFree(rawVal) {
      var raw = String(rawVal == null ? '' : rawVal).trim().replace(/[,\s]/g, '');
      if (raw === '') {
        tablet.innerHTML = '<span class="sim-bc__empty">숫자를 입력해.</span>';
        workLine.innerHTML = '';
        return;
      }
      if (!/^\d+$/.test(raw)) {
        tablet.innerHTML = '<span class="sim-bc__empty">정수만 가능.</span>';
        workLine.innerHTML = '';
        return;
      }
      var n = parseInt(raw, 10);
      if (n < 1 || n > 3599) {
        tablet.innerHTML = '<span class="sim-bc__empty">1 ~ 3599 사이로.</span>';
        workLine.innerHTML = '';
        return;
      }
      var digits = decToSexagesimal(n);
      tablet.innerHTML = digitsToTablet(digits);
      workLine.innerHTML =
        '<span class="sim-bc__work-label">60진법</span>' +
        '<span class="sim-bc__work-sex">' + digitsToSexNotation(digits) + '</span>' +
        '<span class="sim-bc__work-eq">' + digitsToExpansion(digits, n) + '</span>';
    }

    input.addEventListener('input', function () { renderFree(input.value); });
    input.value = '75';
    renderFree('75');

    // ─── 퀴즈 모드 ───
    var quizPanel = document.createElement('div');
    quizPanel.className = 'sim-bc__panel sim-bc__panel--quiz';
    var quizHead = document.createElement('div');
    quizHead.className = 'sim-bc__panel-head';
    quizHead.innerHTML =
      '<span class="sim-bc__panel-label">퀴즈 : 이 점토판 숫자는?</span>' +
      '<span class="sim-bc__panel-latin">quaestio</span>';
    quizPanel.appendChild(quizHead);

    var quizTablet = document.createElement('div');
    quizTablet.className = 'sim-bc__tablet sim-bc__tablet--quiz';
    quizPanel.appendChild(quizTablet);

    var quizRow = document.createElement('div');
    quizRow.className = 'sim-bc__input-row';
    var quizInput = document.createElement('input');
    quizInput.type = 'text';
    quizInput.className = 'sim-bc__input';
    quizInput.setAttribute('inputmode', 'numeric');
    quizInput.setAttribute('autocomplete', 'off');
    quizInput.placeholder = '10진법 정수로 답해';
    var quizCheck = document.createElement('button');
    quizCheck.type = 'button';
    quizCheck.className = 'sim-btn';
    quizCheck.textContent = '확인';
    var quizNext = document.createElement('button');
    quizNext.type = 'button';
    quizNext.className = 'sim-btn sim-bc__next';
    quizNext.textContent = '다음 문제';
    quizRow.appendChild(quizInput);
    quizRow.appendChild(quizCheck);
    quizRow.appendChild(quizNext);
    quizPanel.appendChild(quizRow);

    var quizFeedback = document.createElement('div');
    quizFeedback.className = 'sim-bc__feedback';
    quizPanel.appendChild(quizFeedback);

    container.appendChild(quizPanel);

    var quizIdx = Math.floor(Math.random() * QUIZ.length);
    var quizSolved = false;

    function loadQuiz() {
      var q = QUIZ[quizIdx];
      var digits = decToSexagesimal(q.dec);
      quizTablet.innerHTML = digitsToTablet(digits);
      quizInput.value = '';
      quizInput.disabled = false;
      quizCheck.disabled = false;
      quizFeedback.textContent = '';
      quizFeedback.className = 'sim-bc__feedback';
      quizSolved = false;
    }
    function checkQuiz() {
      if (quizSolved) return;
      var q = QUIZ[quizIdx];
      var raw = quizInput.value.trim().replace(/[,\s]/g, '');
      if (!/^\d+$/.test(raw)) {
        quizFeedback.textContent = '정수로 답해.';
        quizFeedback.className = 'sim-bc__feedback sim-bc__feedback--neutral';
        return;
      }
      var g = parseInt(raw, 10);
      if (g === q.dec) {
        quizSolved = true;
        quizInput.disabled = true;
        quizCheck.disabled = true;
        var digits = decToSexagesimal(q.dec);
        quizFeedback.innerHTML =
          '<span class="sim-bc__ok">맞았어. ' + q.dec + ' = ' + digitsToSexNotation(digits) + '<sub>60</sub></span>' +
          ' <span class="sim-bc__why">' + q.why + '</span>';
        quizFeedback.className = 'sim-bc__feedback sim-bc__feedback--ok';
      } else {
        quizFeedback.textContent = '아니야. 자리별로 쪼개 — 10쐐기(𒌋) × ?, 1쐐기(𒁹) × ?';
        quizFeedback.className = 'sim-bc__feedback sim-bc__feedback--no';
      }
    }
    function nextQuiz() {
      var next = quizIdx;
      if (QUIZ.length > 1) {
        while (next === quizIdx) next = Math.floor(Math.random() * QUIZ.length);
      }
      quizIdx = next;
      loadQuiz();
    }
    quizCheck.addEventListener('click', checkQuiz);
    quizNext.addEventListener('click', nextQuiz);
    quizInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); checkQuiz(); }
    });
    loadQuiz();

    // ─── 정직성 안내 ───
    var note = document.createElement('p');
    note.className = 'sim-bc__note';
    note.innerHTML =
      '실제 점토판은 자리 사이 구분자도, 「0」도 없었다 — 빈자리는 그냥 공백으로 두었다. 그래서 ' +
      '<code class="sim-bc__sex">2 ; 1</code> (121)과 <code class="sim-bc__sex">2 ; 0 ; 1</code> (7201)이 서기에 따라 헷갈리기도 했다. ' +
      '셀레우코스 시대(BC 4세기)에 와서야 ⸢⸣ 같은 빈자리 기호가 등장한다. 본 sim은 빈 자리를 <code>⌷</code> 박스로 시각화해 두었지만, 원본은 정말 그저 ' +
      '<em>아무것도 없는 공백</em>이었다.';
    container.appendChild(note);

    // ─── 스코프된 스타일 ───
    if (!document.getElementById('sim-babylonian-cuneiform-style')) {
      var style = document.createElement('style');
      style.id = 'sim-babylonian-cuneiform-style';
      style.textContent =
        '.sim-babylonian-cuneiform .sim-bc__panel{padding:16px;background:var(--paper);border:1px solid var(--rule);margin-top:14px;box-sizing:border-box;}' +
        '.sim-babylonian-cuneiform .sim-bc__panel--quiz{border-top:3px solid var(--accent);}' +
        '.sim-babylonian-cuneiform .sim-bc__panel-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px;}' +
        '.sim-babylonian-cuneiform .sim-bc__panel-label{font-family:var(--serif-ko);font-weight:700;font-size:14px;color:var(--ink);}' +
        '.sim-babylonian-cuneiform .sim-bc__panel-latin{font-family:var(--serif-en);font-style:italic;font-size:11.5px;color:var(--ink-mute);}' +
        '.sim-babylonian-cuneiform .sim-bc__input-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;}' +
        '.sim-babylonian-cuneiform .sim-bc__input{flex:1 1 140px;min-width:0;font-family:var(--mono);font-size:15px;padding:6px 10px;border:1px solid var(--rule);background:var(--paper-light);color:var(--ink);}' +
        '.sim-babylonian-cuneiform .sim-bc__input:focus{outline:none;border-color:var(--accent);}' +
        '.sim-babylonian-cuneiform .sim-bc__next{flex:0 0 auto;}' +
        '.sim-babylonian-cuneiform .sim-bc__tablet{margin:14px 0 12px;padding:18px 14px;background:var(--paper-dark);border:1px solid var(--rule);display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:center;min-height:64px;}' +
        '.sim-babylonian-cuneiform .sim-bc__tablet--quiz{background:var(--paper-light);}' +
        '.sim-babylonian-cuneiform .sim-bc__digit{font-size:32px;line-height:1.1;letter-spacing:0;color:var(--ink);font-family:"Noto Sans Cuneiform","Segoe UI Historic","Akkadian",serif;}' +
        '.sim-babylonian-cuneiform .sim-bc__digit--empty{font-family:var(--mono);color:var(--ink-mute);font-size:24px;border:1px dashed var(--rule);padding:2px 10px;}' +
        '.sim-babylonian-cuneiform .sim-bc__sep{display:inline-block;width:1px;height:36px;background:var(--rule);}' +
        '.sim-babylonian-cuneiform .sim-bc__empty{font-family:var(--sans-ko);font-size:12.5px;font-style:italic;color:var(--ink-mute);}' +
        '.sim-babylonian-cuneiform .sim-bc__work{margin-top:8px;display:flex;gap:14px;flex-wrap:wrap;align-items:baseline;font-family:var(--serif-en);font-size:14px;color:var(--ink-soft);}' +
        '.sim-babylonian-cuneiform .sim-bc__work-label{font-family:var(--sans-ko);font-size:10.5px;letter-spacing:0.08em;color:var(--ink-mute);text-transform:uppercase;}' +
        '.sim-babylonian-cuneiform .sim-bc__work-sex{font-family:var(--mono);font-weight:600;color:var(--accent);letter-spacing:0.04em;}' +
        '.sim-babylonian-cuneiform .sim-bc__work-eq{color:var(--ink-soft);}' +
        '.sim-babylonian-cuneiform .sim-bc__feedback{min-height:1.4em;margin-top:8px;font-family:var(--sans-ko);font-size:12.5px;line-height:1.7;}' +
        '.sim-babylonian-cuneiform .sim-bc__feedback--ok{color:var(--accent);}' +
        '.sim-babylonian-cuneiform .sim-bc__feedback--no{color:var(--ink-soft);}' +
        '.sim-babylonian-cuneiform .sim-bc__feedback--neutral{color:var(--ink-mute);}' +
        '.sim-babylonian-cuneiform .sim-bc__ok{color:var(--accent);font-family:var(--serif-en);font-style:italic;font-size:14px;}' +
        '.sim-babylonian-cuneiform .sim-bc__ok sub{font-size:0.7em;color:var(--ink-mute);}' +
        '.sim-babylonian-cuneiform .sim-bc__why{color:var(--ink-mute);font-style:italic;margin-left:6px;}' +
        '.sim-babylonian-cuneiform .sim-bc__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-babylonian-cuneiform .sim-bc__note code{font-family:var(--mono);font-style:normal;background:var(--paper-dark);padding:1px 5px;}' +
        '.sim-babylonian-cuneiform .sim-bc__note .sim-bc__sex{color:var(--accent);}' +
        '.sim-babylonian-cuneiform .sim-bc__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-babylonian-cuneiform .sim-bc__digit{font-size:26px;}.sim-babylonian-cuneiform .sim-bc__tablet{padding:12px 8px;gap:8px;min-height:54px;}.sim-babylonian-cuneiform .sim-bc__sep{height:28px;}.sim-babylonian-cuneiform .sim-bc__work{font-size:13px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="babylonian-cuneiform"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
