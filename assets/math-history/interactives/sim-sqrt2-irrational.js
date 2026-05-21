/* ============================================================
   Simulation: √2 is irrational (proof by contradiction)
   히파소스의 충격: √2를 p/q로 적을 수 없다. 귀류법으로 단계별 추적.
   가정 → p²=2q² → p가 짝수 → p=2k → 4k²=2q² → q²=2k² → q도 짝수
   → 둘 다 짝수면 "기약"이 아님 — 모순.
   Mounted on: <div class="sim" data-sim-id="sqrt2-irrational">
   ============================================================ */

(function () {
  'use strict';

  // 8 단계 귀류법
  var STEPS = [
    {
      title: '0. 가정',
      claim: '√2는 유리수다.',
      detail: '귀류법: "√2 = p/q" 인 정수 p, q가 존재한다고 가정. <em>가장 약분한 (기약) 형태로</em> 잡는다. 즉 p와 q는 서로소 — 공약수 1.',
      key: '√2 = p/q (기약)',
      pState: '?', qState: '?',
      note: '"기약"이라는 조건이 함정의 핵심. 이걸 잘 기억해 둬.'
    },
    {
      title: '1. 제곱',
      claim: '양변을 제곱.',
      detail: '√2 = p/q ⇒ 2 = p²/q² ⇒ <strong>p² = 2q²</strong>.',
      key: 'p² = 2q²',
      pState: '?', qState: '?',
      note: '단순한 대수 조작. 여기까진 정직하다.'
    },
    {
      title: '2. p²는 짝수',
      claim: 'p²은 2의 배수.',
      detail: 'p² = 2q² 이므로 p²은 2로 나누어떨어진다. 즉 <strong>p²은 짝수</strong>.',
      key: 'p² = 짝수',
      pState: '?', qState: '?',
      note: ''
    },
    {
      title: '3. ⇒ p도 짝수',
      claim: 'p²이 짝수이면 p도 짝수.',
      detail: '대우: 만약 p가 홀수라면 p² = (2m+1)² = 4m²+4m+1 도 홀수. 그러므로 p²이 짝수이면 p는 반드시 짝수다.',
      key: 'p = 짝수',
      pState: 'even', qState: '?',
      note: '여기서 첫 결과 — <em>p는 짝수다</em>.'
    },
    {
      title: '4. p = 2k 대입',
      claim: 'p를 2k로 쓰자.',
      detail: 'p가 짝수이므로 p = 2k (k는 정수). 이걸 p² = 2q²에 대입: (2k)² = 2q² ⇒ <strong>4k² = 2q²</strong> ⇒ <strong>q² = 2k²</strong>.',
      key: 'q² = 2k²',
      pState: 'even', qState: '?',
      note: ''
    },
    {
      title: '5. q²도 짝수',
      claim: 'q²도 2의 배수.',
      detail: 'q² = 2k² 이므로 q²도 짝수.',
      key: 'q² = 짝수',
      pState: 'even', qState: '?',
      note: ''
    },
    {
      title: '6. ⇒ q도 짝수',
      claim: '같은 논법으로 q도 짝수.',
      detail: '3단계와 똑같은 논법. q²이 짝수면 q도 짝수.',
      key: 'q = 짝수',
      pState: 'even', qState: 'even',
      note: '이제 <em>p와 q 모두 짝수</em>다.'
    },
    {
      title: '7. 모순!',
      claim: '둘 다 짝수면 "기약"이 아니다.',
      detail: 'p, q 모두 짝수 ⇒ 둘 다 2로 나눌 수 있음 ⇒ 공약수 2가 있음. 그런데 우리는 처음에 p/q를 <strong>기약</strong>으로 잡았다 (공약수 1). <strong>모순</strong>.',
      key: '∴ 가정이 거짓. √2는 유리수가 아니다.',
      pState: 'even', qState: 'even',
      note: '히파소스(피타고라스 학파)가 이 결과를 발견했다는 전설. 한 학파의 신조 "모든 수는 두 정수의 비"가 깨졌다.',
      contradiction: true
    }
  ];

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-sqrt2-irrational');

    var state = { idx: 0 };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '√2 = 1.41421356... 이 십진 전개는 끝나지도 반복되지도 않는다. 즉 √2를 어떤 두 정수의 비 p/q로도 적을 수 없다는 뜻 — 유리수가 아니다. 8단계 귀류법으로 따라가 보자.';
    container.appendChild(lead);

    // ─── 진행 표시 (점들) ───
    var dots = document.createElement('div');
    dots.className = 'sim-sq2__dots';
    for (var i = 0; i < STEPS.length; i++) {
      var d = document.createElement('span');
      d.className = 'sim-sq2__dot';
      d.dataset.idx = String(i);
      d.textContent = String(i);
      d.addEventListener('click', function (e) {
        var idx = parseInt(e.currentTarget.dataset.idx, 10);
        state.idx = idx;
        render();
      });
      dots.appendChild(d);
    }
    container.appendChild(dots);

    // ─── 현재 단계 카드 ───
    var card = document.createElement('div');
    card.className = 'sim-sq2__card';
    container.appendChild(card);

    // ─── p, q 상태 표시 ───
    var pq = document.createElement('div');
    pq.className = 'sim-sq2__pq';
    container.appendChild(pq);

    // ─── 컨트롤 (이전/다음/처음) ───
    var controls = document.createElement('div');
    controls.className = 'sim-controls sim-sq2__controls';

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'sim-btn sim-sq2__prev';
    prevBtn.textContent = '← 이전';
    prevBtn.addEventListener('click', function () {
      if (state.idx > 0) { state.idx--; render(); }
    });
    controls.appendChild(prevBtn);

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'sim-btn sim-sq2__next';
    nextBtn.textContent = '다음 단계 →';
    nextBtn.addEventListener('click', function () {
      if (state.idx < STEPS.length - 1) { state.idx++; render(); }
    });
    controls.appendChild(nextBtn);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'sim-btn sim-sq2__reset';
    resetBtn.textContent = '처음으로';
    resetBtn.addEventListener('click', function () { state.idx = 0; render(); });
    controls.appendChild(resetBtn);

    container.appendChild(controls);

    var note = document.createElement('p');
    note.className = 'sim-sq2__note';
    note.innerHTML = '이 증명은 유클리드 〈원론〉 10권에 명시되어 있다. "측정할 수 없는 크기" — 그리스인들이 가장 마주치고 싶지 않았던 진실. 무한 소수의 영역이 여기서 처음 수학에 들어왔다.';
    container.appendChild(note);

    function render() {
      var s = STEPS[state.idx];

      // dots 갱신
      var dotEls = dots.querySelectorAll('.sim-sq2__dot');
      for (var i = 0; i < dotEls.length; i++) {
        dotEls[i].classList.toggle('sim-sq2__dot--active', i === state.idx);
        dotEls[i].classList.toggle('sim-sq2__dot--done', i < state.idx);
        dotEls[i].classList.toggle('sim-sq2__dot--contra', i === STEPS.length - 1 && state.idx === STEPS.length - 1);
      }

      // 카드
      var cardClass = 'sim-sq2__card' + (s.contradiction ? ' sim-sq2__card--contra' : '');
      card.className = cardClass;
      card.innerHTML =
        '<div class="sim-sq2__step-title">' + s.title + '</div>' +
        '<div class="sim-sq2__claim">' + s.claim + '</div>' +
        '<div class="sim-sq2__detail">' + s.detail + '</div>' +
        '<div class="sim-sq2__key">' + s.key + '</div>' +
        (s.note ? '<div class="sim-sq2__step-note">' + s.note + '</div>' : '');

      // p, q 상태
      pq.innerHTML =
        '<div class="sim-sq2__pq-cell ' + pqClass(s.pState) + '">' +
        '  <span class="sim-sq2__pq-name"><em>p</em></span>' +
        '  <span class="sim-sq2__pq-val">' + pqLabel(s.pState) + '</span>' +
        '</div>' +
        '<div class="sim-sq2__pq-cell ' + pqClass(s.qState) + '">' +
        '  <span class="sim-sq2__pq-name"><em>q</em></span>' +
        '  <span class="sim-sq2__pq-val">' + pqLabel(s.qState) + '</span>' +
        '</div>' +
        (s.pState === 'even' && s.qState === 'even' ?
          '<div class="sim-sq2__pq-warn">⚠ 둘 다 짝수 ⇒ 공약수 2 ⇒ 기약 아님</div>' : '');

      // 버튼 enable/disable
      prevBtn.disabled = state.idx === 0;
      nextBtn.disabled = state.idx === STEPS.length - 1;
    }

    function pqClass(s) {
      if (s === 'even') return 'sim-sq2__pq-cell--even';
      if (s === 'odd')  return 'sim-sq2__pq-cell--odd';
      return 'sim-sq2__pq-cell--unknown';
    }
    function pqLabel(s) {
      if (s === 'even') return '짝수';
      if (s === 'odd')  return '홀수';
      return '? (미정)';
    }

    render();

    // ─── 스타일 ───
    if (!document.getElementById('sim-sqrt2-irrational-style')) {
      var style = document.createElement('style');
      style.id = 'sim-sqrt2-irrational-style';
      style.textContent =
        '.sim-sqrt2-irrational .sim-sq2__dots{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 12px;}' +
        '.sim-sqrt2-irrational .sim-sq2__dot{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid var(--rule);background:var(--paper);font-family:var(--mono);font-size:12px;color:var(--ink-mute);cursor:pointer;user-select:none;transition:all 0.18s;}' +
        '.sim-sqrt2-irrational .sim-sq2__dot:hover{border-color:var(--accent);color:var(--accent);}' +
        '.sim-sqrt2-irrational .sim-sq2__dot--done{background:var(--paper-light);color:var(--ink-soft);border-color:var(--rule-soft);}' +
        '.sim-sqrt2-irrational .sim-sq2__dot--active{background:var(--accent);color:var(--paper);border-color:var(--accent);font-weight:700;}' +
        '.sim-sqrt2-irrational .sim-sq2__dot--contra{background:#b04848;border-color:#b04848;color:#fff;}' +
        '.sim-sqrt2-irrational .sim-sq2__card{padding:14px 16px;background:var(--paper-light);border-left:3px solid var(--accent);min-height:140px;transition:border-color 0.3s;}' +
        '.sim-sqrt2-irrational .sim-sq2__card--contra{border-left-color:#b04848;background:#fbeeee;}' +
        '.sim-sqrt2-irrational .sim-sq2__step-title{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.08em;color:var(--ink-mute);text-transform:uppercase;margin-bottom:6px;}' +
        '.sim-sqrt2-irrational .sim-sq2__claim{font-family:var(--serif-ko);font-size:16px;font-weight:600;color:var(--ink);margin-bottom:8px;line-height:1.4;}' +
        '.sim-sqrt2-irrational .sim-sq2__detail{font-family:var(--sans-ko);font-size:13.5px;color:var(--ink-soft);line-height:1.75;margin-bottom:10px;}' +
        '.sim-sqrt2-irrational .sim-sq2__detail strong{font-family:var(--mono);font-weight:600;color:var(--ink);background:var(--paper);padding:1px 5px;}' +
        '.sim-sqrt2-irrational .sim-sq2__detail em{font-style:italic;color:var(--ink);}' +
        '.sim-sqrt2-irrational .sim-sq2__key{font-family:var(--serif-en);font-size:15px;font-style:italic;color:var(--accent);padding:6px 10px;background:var(--paper);border:1px dashed var(--accent);display:inline-block;}' +
        '.sim-sqrt2-irrational .sim-sq2__card--contra .sim-sq2__key{color:#b04848;border-color:#b04848;}' +
        '.sim-sqrt2-irrational .sim-sq2__step-note{margin-top:8px;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-sqrt2-irrational .sim-sq2__step-note em{font-style:italic;color:var(--ink-soft);}' +
        '.sim-sqrt2-irrational .sim-sq2__pq{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:12px;}' +
        '.sim-sqrt2-irrational .sim-sq2__pq-cell{display:flex;align-items:baseline;gap:8px;padding:6px 12px;background:var(--paper);border:1px solid var(--rule-soft);font-family:var(--serif-en);font-size:14px;transition:all 0.2s;}' +
        '.sim-sqrt2-irrational .sim-sq2__pq-cell--unknown{color:var(--ink-mute);}' +
        '.sim-sqrt2-irrational .sim-sq2__pq-cell--even{background:#fff4d6;border-color:#a37e2c;color:#5a4a14;}' +
        '.sim-sqrt2-irrational .sim-sq2__pq-cell--odd{background:#e7ecf5;border-color:#5a7090;color:#2a3a55;}' +
        '.sim-sqrt2-irrational .sim-sq2__pq-name{font-style:italic;font-weight:600;}' +
        '.sim-sqrt2-irrational .sim-sq2__pq-name em{font-style:italic;}' +
        '.sim-sqrt2-irrational .sim-sq2__pq-val{font-family:var(--sans-ko);font-size:12.5px;}' +
        '.sim-sqrt2-irrational .sim-sq2__pq-warn{font-family:var(--sans-ko);font-size:12.5px;color:#b04848;font-weight:600;}' +
        '.sim-sqrt2-irrational .sim-sq2__controls{margin-top:14px;}' +
        '.sim-sqrt2-irrational .sim-sq2__controls button[disabled]{opacity:0.4;cursor:not-allowed;}' +
        '.sim-sqrt2-irrational .sim-sq2__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '@media (max-width:640px){.sim-sqrt2-irrational .sim-sq2__dot{width:26px;height:26px;font-size:11px;}.sim-sqrt2-irrational .sim-sq2__claim{font-size:14.5px;}.sim-sqrt2-irrational .sim-sq2__detail{font-size:12.5px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="sqrt2-irrational"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
