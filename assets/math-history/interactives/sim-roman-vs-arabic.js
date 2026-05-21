/* ============================================================
   Simulation: Roman vs Arabic numeral multiplication duel
   같은 곱셈을 두 표기법으로 시도 → 0과 자리값의 혁명을 체감.
   Mounted on: <div class="sim" data-sim-id="roman-vs-arabic">
   ============================================================ */

(function () {
  'use strict';

  // ─── 미리 검증된 숫자 쌍 (모두 1~3999 범위) ───
  var PROBLEMS = [
    { a: 47, b: 23, answer: 1081, romanA: 'XLVII',  romanB: 'XXIII', romanAnswer: 'MLXXXI'   },
    { a: 24, b: 16, answer: 384,  romanA: 'XXIV',   romanB: 'XVI',   romanAnswer: 'CCCLXXXIV'},
    { a: 38, b: 29, answer: 1102, romanA: 'XXXVIII',romanB: 'XXIX',  romanAnswer: 'MCII'     },
    { a: 56, b: 42, answer: 2352, romanA: 'LVI',    romanB: 'XLII',  romanAnswer: 'MMCCCLII' },
    { a: 19, b: 27, answer: 513,  romanA: 'XIX',    romanB: 'XXVII', romanAnswer: 'DXIII'    }
  ];

  // ─── 아라비아 → 로마 변환 (1~3999) — 사용자 입력 정답 표시용 ───
  function toRoman(n) {
    if (!isFinite(n) || n < 1 || n > 3999 || Math.floor(n) !== n) return '';
    var map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
               [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    var s = '';
    for (var i = 0; i < map.length; i++) {
      while (n >= map[i][0]) { s += map[i][1]; n -= map[i][0]; }
    }
    return s;
  }

  // ─── 로마 → 아라비아 (사용자가 로마 표기로 답해도 인정) ───
  function fromRoman(str) {
    if (!str) return NaN;
    var v = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    var s = String(str).toUpperCase().replace(/[^IVXLCDM]/g, '');
    if (!s) return NaN;
    var total = 0;
    for (var i = 0; i < s.length; i++) {
      var cur = v[s[i]], next = v[s[i+1]];
      if (next && cur < next) total -= cur; else total += cur;
    }
    return total;
  }

  function fmtTime(ms) {
    var s = ms / 1000;
    return s < 10 ? s.toFixed(1) + '초' : Math.round(s) + '초';
  }

  function pickNextProblem(currentIdx) {
    if (PROBLEMS.length <= 1) return 0;
    var next;
    do { next = Math.floor(Math.random() * PROBLEMS.length); } while (next === currentIdx);
    return next;
  }

  // ─── 한 쪽(로마 또는 아라비아) 패널 UI ───
  function buildPanel(opts) {
    // opts: { side: 'roman'|'arabic', label, latin, hint, problem, onSolved }
    var panel = document.createElement('div');
    panel.className = 'sim-rva__panel sim-rva__panel--' + opts.side;

    var head = document.createElement('div');
    head.className = 'sim-rva__panel-head';
    head.innerHTML =
      '<span class="sim-rva__panel-label">' + opts.label + '</span>' +
      '<span class="sim-rva__panel-latin">' + opts.latin + '</span>';
    panel.appendChild(head);

    var problemEl = document.createElement('div');
    problemEl.className = 'sim-rva__problem sim-rva__problem--' + opts.side;
    panel.appendChild(problemEl);

    var hint = document.createElement('details');
    hint.className = 'sim-rva__hint';
    hint.innerHTML = '<summary>도움말</summary><div class="sim-rva__hint-body">' + opts.hint + '</div>';
    panel.appendChild(hint);

    var inputRow = document.createElement('div');
    inputRow.className = 'sim-rva__input-row';
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'sim-rva__input';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.placeholder = opts.side === 'roman' ? '답 (예: MLXXXI 또는 1081)' : '답 (예: 1081)';
    var checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.className = 'sim-btn sim-rva__check';
    checkBtn.textContent = '정답 확인';
    inputRow.appendChild(input);
    inputRow.appendChild(checkBtn);
    panel.appendChild(inputRow);

    var feedback = document.createElement('div');
    feedback.className = 'sim-rva__feedback';
    panel.appendChild(feedback);

    var meter = document.createElement('div');
    meter.className = 'sim-rva__meter';
    meter.innerHTML =
      '<span>경과 <em class="sim-rva__time">0.0초</em></span>' +
      '<span>시도 <em class="sim-rva__tries">0</em></span>';
    panel.appendChild(meter);

    // ─── state ───
    var startTime = null, elapsed = 0, tries = 0, solved = false, ticker = null;
    function startTimer() {
      if (startTime || solved) return;
      startTime = performance.now();
      ticker = setInterval(function () {
        if (solved) return;
        var t = performance.now() - startTime + elapsed;
        meter.querySelector('.sim-rva__time').textContent = fmtTime(t);
      }, 100);
    }
    function stopTimer() {
      if (ticker) { clearInterval(ticker); ticker = null; }
      if (startTime) { elapsed += performance.now() - startTime; startTime = null; }
    }

    input.addEventListener('focus', startTimer);
    input.addEventListener('input', startTimer);

    function showProblem(p) {
      if (opts.side === 'roman') {
        problemEl.innerHTML = '<span class="sim-rva__rom">' + p.romanA + '</span>' +
          ' <span class="sim-rva__times">×</span> ' +
          '<span class="sim-rva__rom">' + p.romanB + '</span> = <span class="sim-rva__q">?</span>';
      } else {
        problemEl.innerHTML = '<span class="sim-rva__arab">' + p.a + '</span>' +
          ' <span class="sim-rva__times">×</span> ' +
          '<span class="sim-rva__arab">' + p.b + '</span> = <span class="sim-rva__q">?</span>';
      }
    }
    showProblem(opts.problem);

    function reset(newProblem) {
      stopTimer();
      elapsed = 0; tries = 0; solved = false; startTime = null;
      input.value = ''; input.disabled = false; checkBtn.disabled = false;
      feedback.textContent = ''; feedback.className = 'sim-rva__feedback';
      meter.querySelector('.sim-rva__time').textContent = '0.0초';
      meter.querySelector('.sim-rva__tries').textContent = '0';
      opts.problem = newProblem;
      showProblem(newProblem);
    }

    function check() {
      if (solved) return;
      startTimer();
      var raw = input.value.trim();
      if (!raw) {
        feedback.textContent = '답을 적어줘.';
        feedback.className = 'sim-rva__feedback sim-rva__feedback--neutral';
        return;
      }
      tries += 1;
      meter.querySelector('.sim-rva__tries').textContent = tries;

      var asNum = parseInt(raw.replace(/[,\s]/g, ''), 10);
      var asRoman = /^[IVXLCDM]+$/i.test(raw.replace(/\s/g, '')) ? fromRoman(raw) : NaN;
      var guess = !isNaN(asNum) ? asNum : asRoman;

      if (guess === opts.problem.answer) {
        solved = true;
        stopTimer();
        input.disabled = true; checkBtn.disabled = true;
        feedback.innerHTML = '맞았어. <em class="sim-rva__truth">' +
          opts.problem.answer + ' = ' + opts.problem.romanAnswer + '</em>';
        feedback.className = 'sim-rva__feedback sim-rva__feedback--ok';
        if (opts.onSolved) opts.onSolved({ elapsed: elapsed, tries: tries });
      } else {
        feedback.textContent = '아직 아냐. 다시 해봐.';
        feedback.className = 'sim-rva__feedback sim-rva__feedback--no';
      }
    }
    checkBtn.addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });

    return { el: panel, reset: reset, isSolved: function () { return solved; },
             getStats: function () { return { elapsed: elapsed, tries: tries, solved: solved }; } };
  }

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-roman-vs-arabic');

    var problemIdx = Math.floor(Math.random() * PROBLEMS.length);
    var problem = PROBLEMS[problemIdx];

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '같은 곱셈을 두 표기법으로 시도해봐. 어느 쪽이 더 잘 풀리는지 몸으로 느낀다 — 점수는 없다.';
    container.appendChild(lead);

    var stage = document.createElement('div');
    stage.className = 'sim-rva__stage';
    container.appendChild(stage);

    var roman, arabic;

    function onAnyPanelSolved() {
      if (roman.isSolved() && arabic.isSolved()) showResult();
    }

    roman = buildPanel({
      side: 'roman',
      label: '로마숫자',
      latin: 'Numerus Romanus',
      hint:
        '<p>로마숫자에는 0도, 자리값도 없다. 곱셈을 위한 일반 알고리즘이 없어, 실제 로마인들은 보통 다음 중 하나를 썼다.</p>' +
        '<ul>' +
        '<li><strong>주판(abacus)</strong> — 돌·구슬을 자리별 홈에 놓고 계산. 결과만 다시 로마숫자로 받아 적었다.</li>' +
        '<li><strong>두 배·반 (doubling &amp; halving)</strong> — 한 수를 계속 2배, 다른 수를 계속 반(소수부 버림). 반쪽 열이 홀수인 행만 모아 더한다(러시아 농부 곱셈, 이집트 린드 파피루스 방식).</li>' +
        '<li><strong>반복 덧셈</strong> — 작은 수에 한해 같은 수를 여러 번 더한다.</li>' +
        '</ul>' +
        '<p>한 줄 자리값을 쓰는 우리 방식으로는 한 번에 풀리지 않는다. 머릿속에서든 종이에서든, 자리값 표기로 한번 옮겨야 손에 잡힌다 — <em>그게 바로 핵심이다</em>.</p>',
      problem: problem,
      onSolved: onAnyPanelSolved
    });

    arabic = buildPanel({
      side: 'arabic',
      label: '아라비아숫자',
      latin: 'Numerus Indo-Arabicus',
      hint:
        '<p>0과 자리값이 있는 십진 표기. 학교에서 배운 세로 곱셈을 그대로 쓰면 된다.</p>' +
        '<pre class="sim-rva__longmul">' +
        '    ' + problem.a + '\n' +
        '  × ' + problem.b + '\n' +
        '  ─────\n' +
        '    (자리별로 곱해 차곡차곡 더한다)</pre>' +
        '<p>같은 문제를 로마숫자로 풀 때와 비교해보자. 어디서 막히고, 어디서 술술 풀리는가?</p>',
      problem: problem,
      onSolved: onAnyPanelSolved
    });

    stage.appendChild(roman.el);
    stage.appendChild(arabic.el);

    var result = document.createElement('div');
    result.className = 'sim-rva__result';
    container.appendChild(result);

    var controls = document.createElement('div');
    controls.className = 'sim-controls sim-rva__controls';
    var newBtn = document.createElement('button');
    newBtn.type = 'button'; newBtn.className = 'sim-btn';
    newBtn.textContent = '다른 문제로 다시';
    newBtn.addEventListener('click', function () {
      problemIdx = pickNextProblem(problemIdx);
      problem = PROBLEMS[problemIdx];
      // 아라비아 도움말 안의 세로곱셈 미리보기를 새 문제로 갱신하려면 패널을 재구축
      var newArabicHintPre = arabic.el.querySelector('.sim-rva__longmul');
      if (newArabicHintPre) {
        newArabicHintPre.textContent = '    ' + problem.a + '\n  × ' + problem.b + '\n  ─────\n    (자리별로 곱해 차곡차곡 더한다)';
      }
      roman.reset(problem);
      arabic.reset(problem);
      result.innerHTML = ''; result.className = 'sim-rva__result';
    });
    controls.appendChild(newBtn);
    container.appendChild(controls);

    function showResult() {
      var rs = roman.getStats(), as = arabic.getStats();
      result.className = 'sim-rva__result sim-rva__result--show';
      result.innerHTML =
        '<h4>두 표기법 다 풀었다.</h4>' +
        '<div class="sim-rva__result-row">' +
        '  <span class="sim-rva__result-cell"><em>로마숫자</em> ' + fmtTime(rs.elapsed) + ' · ' + rs.tries + '회</span>' +
        '  <span class="sim-rva__result-cell"><em>아라비아숫자</em> ' + fmtTime(as.elapsed) + ' · ' + as.tries + '회</span>' +
        '</div>' +
        '<p class="sim-rva__result-note">' +
        '브라마굽타·알 콰리즈미 이후 인도-아라비아 숫자가 유럽 상인의 회계장부를 휩쓴 이유 — 자리값과 0은 곱셈을 한 줄짜리 절차로 만든다.' +
        '</p>';
    }

    // ─── 스코프된 스타일 (sim 전용 prefix) ───
    if (!document.getElementById('sim-roman-vs-arabic-style')) {
      var style = document.createElement('style');
      style.id = 'sim-roman-vs-arabic-style';
      style.textContent =
        '.sim-roman-vs-arabic .sim-rva__stage{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:14px;}' +
        '.sim-roman-vs-arabic .sim-rva__panel{padding:16px 16px 14px;background:var(--paper);border:1px solid var(--rule);box-sizing:border-box;min-width:0;}' +
        '.sim-roman-vs-arabic .sim-rva__panel--roman{border-top:3px solid var(--ink-mute);}' +
        '.sim-roman-vs-arabic .sim-rva__panel--arabic{border-top:3px solid var(--accent);}' +
        '.sim-roman-vs-arabic .sim-rva__panel-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px;}' +
        '.sim-roman-vs-arabic .sim-rva__panel-label{font-family:var(--serif-ko);font-weight:700;font-size:15px;color:var(--ink);}' +
        '.sim-roman-vs-arabic .sim-rva__panel-latin{font-family:var(--serif-en);font-style:italic;color:var(--ink-mute);font-size:12px;}' +
        '.sim-roman-vs-arabic .sim-rva__problem{font-size:22px;margin:6px 0 12px;line-height:1.4;color:var(--ink);word-break:break-word;}' +
        '.sim-roman-vs-arabic .sim-rva__rom{font-family:var(--mono);letter-spacing:0.06em;color:var(--ink);}' +
        '.sim-roman-vs-arabic .sim-rva__arab{font-family:var(--serif-en);font-weight:600;color:var(--ink);}' +
        '.sim-roman-vs-arabic .sim-rva__times{color:var(--ink-mute);}' +
        '.sim-roman-vs-arabic .sim-rva__q{color:var(--accent);font-family:var(--serif-en);font-style:italic;}' +
        '.sim-roman-vs-arabic .sim-rva__hint{margin:8px 0 12px;font-size:12.5px;color:var(--ink-soft);}' +
        '.sim-roman-vs-arabic .sim-rva__hint summary{cursor:pointer;font-family:var(--sans-ko);font-size:12px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;padding:4px 0;}' +
        '.sim-roman-vs-arabic .sim-rva__hint summary:hover{color:var(--accent);}' +
        '.sim-roman-vs-arabic .sim-rva__hint-body{padding:6px 2px 4px;line-height:1.7;}' +
        '.sim-roman-vs-arabic .sim-rva__hint-body p{margin:0 0 0.6em;}' +
        '.sim-roman-vs-arabic .sim-rva__hint-body ul{margin:0 0 0.6em;padding-left:1.1em;}' +
        '.sim-roman-vs-arabic .sim-rva__hint-body li{margin:0.2em 0;}' +
        '.sim-roman-vs-arabic .sim-rva__longmul{font-family:var(--mono);font-size:12px;background:var(--paper-light);padding:8px 10px;border:1px solid var(--rule-soft);white-space:pre;margin:6px 0;overflow-x:auto;}' +
        '.sim-roman-vs-arabic .sim-rva__input-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;}' +
        '.sim-roman-vs-arabic .sim-rva__input{flex:1 1 140px;min-width:0;font-family:var(--mono);font-size:14px;padding:6px 10px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}' +
        '.sim-roman-vs-arabic .sim-rva__input:focus{outline:none;border-color:var(--accent);}' +
        '.sim-roman-vs-arabic .sim-rva__check{flex:0 0 auto;}' +
        '.sim-roman-vs-arabic .sim-rva__feedback{min-height:1.4em;margin-top:8px;font-size:12.5px;font-family:var(--sans-ko);}' +
        '.sim-roman-vs-arabic .sim-rva__feedback--ok{color:var(--accent);}' +
        '.sim-roman-vs-arabic .sim-rva__feedback--no{color:var(--ink-soft);}' +
        '.sim-roman-vs-arabic .sim-rva__feedback--neutral{color:var(--ink-mute);}' +
        '.sim-roman-vs-arabic .sim-rva__truth{font-family:var(--mono);font-style:normal;color:var(--accent);}' +
        '.sim-roman-vs-arabic .sim-rva__meter{display:flex;gap:18px;margin-top:8px;font-family:var(--sans-ko);font-size:11.5px;color:var(--ink-mute);letter-spacing:0.04em;}' +
        '.sim-roman-vs-arabic .sim-rva__meter em{font-family:var(--serif-en);font-style:normal;font-weight:600;color:var(--accent);}' +
        '.sim-roman-vs-arabic .sim-rva__result{margin-top:18px;padding:0;opacity:0;max-height:0;overflow:hidden;transition:opacity 0.3s;}' +
        '.sim-roman-vs-arabic .sim-rva__result--show{padding:14px 16px;background:var(--paper-light);border-left:3px solid var(--accent);opacity:1;max-height:400px;}' +
        '.sim-roman-vs-arabic .sim-rva__result h4{margin:0 0 8px;font-family:var(--serif-ko);font-size:15px;color:var(--ink);}' +
        '.sim-roman-vs-arabic .sim-rva__result-row{display:flex;gap:18px;flex-wrap:wrap;font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);}' +
        '.sim-roman-vs-arabic .sim-rva__result-cell em{font-family:var(--serif-en);font-style:italic;color:var(--accent);margin-right:6px;}' +
        '.sim-roman-vs-arabic .sim-rva__result-note{margin:10px 0 0;font-size:12.5px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-roman-vs-arabic .sim-rva__controls{margin-top:14px;}' +
        '@media (max-width:640px){.sim-roman-vs-arabic .sim-rva__stage{grid-template-columns:1fr;}.sim-roman-vs-arabic .sim-rva__problem{font-size:19px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="roman-vs-arabic"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
