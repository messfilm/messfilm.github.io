/* ============================================================
   Simulation: Logarithm slide rule
   두 자(D, C 스케일)에 로그 간격 눈금. 슬라이드로 a × b = 10^(log a + log b).
   네이피어(1614) 로그가 곱셈을 덧셈으로 바꾼 직관을 손으로 만져본다.
   Mounted on: <div class="sim" data-sim-id="logarithm-slide-rule">
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  // 자 한 칸의 데이터 범위: 1 ~ 10 (한 사이클의 log10)
  var SCALE_MIN = 1, SCALE_MAX = 10;

  // 픽셀 좌표
  var VIEW_W = 720;
  var VIEW_H = 220;
  var RULE_LEN = 600; // 자 한 자루의 픽셀 길이 (1~10 매핑)
  var MARGIN_X = (VIEW_W - RULE_LEN) / 2; // 자 시작 x 픽셀 (a 자 기준)

  function logPos(v) {
    // v ∈ [1,10] → [0, RULE_LEN] (log10 간격)
    return Math.log10(v) * RULE_LEN;
  }
  function posToVal(p) {
    // [0, RULE_LEN] → [1, 10]
    return Math.pow(10, p / RULE_LEN);
  }

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-logarithm-slide-rule');

    var state = {
      // C 자(위)의 "1" 눈금이 D 자(아래)의 어느 값 위에 놓이는지 = a
      // 즉 a ∈ [1, 10] 사이에서 슬라이드
      a: 2.0
    };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '두 자를 로그 간격 눈금으로 새겼다. 위 자(C)의 "1"을 아래 자(D)의 a에 맞추고, 위 자에서 b를 찾아 아래 자의 같은 자리를 읽으면 곱 a × b가 나온다 — 곱셈이 그저 길이의 덧셈이 된다.';
    container.appendChild(lead);

    // ─── 슬라이더 (a 선택) ───
    var sliderRow = document.createElement('div');
    sliderRow.className = 'sim-controls sim-lsr__slider-row';
    var aLab = document.createElement('label');
    aLab.className = 'sim-lsr__slider';
    var aLabTxt = document.createElement('span');
    aLabTxt.className = 'sim-lsr__slider-lbl';
    var aInput = document.createElement('input');
    aInput.type = 'range';
    aInput.min = String(SCALE_MIN); aInput.max = String(SCALE_MAX); aInput.step = '0.01';
    aInput.value = String(state.a);
    aInput.className = 'sim-lsr__range';
    aInput.addEventListener('input', function () {
      state.a = parseFloat(aInput.value);
      render();
    });
    aLab.appendChild(aLabTxt); aLab.appendChild(aInput);
    sliderRow.appendChild(aLab);
    container.appendChild(sliderRow);

    // ─── b 선택 (위 자 위의 임의 위치 — 슬라이더로) ───
    var bRow = document.createElement('div');
    bRow.className = 'sim-controls sim-lsr__slider-row';
    var bLab = document.createElement('label');
    bLab.className = 'sim-lsr__slider';
    var bLabTxt = document.createElement('span');
    bLabTxt.className = 'sim-lsr__slider-lbl';
    var bInput = document.createElement('input');
    bInput.type = 'range';
    bInput.min = String(SCALE_MIN); bInput.max = String(SCALE_MAX); bInput.step = '0.01';
    bInput.value = '3.0';
    bInput.className = 'sim-lsr__range';
    state.b = 3.0;
    bInput.addEventListener('input', function () {
      state.b = parseFloat(bInput.value);
      render();
    });
    bLab.appendChild(bLabTxt); bLab.appendChild(bInput);
    bRow.appendChild(bLab);
    container.appendChild(bRow);

    // ─── SVG 자 ───
    var stageWrap = document.createElement('div');
    stageWrap.className = 'sim-lsr__stage-wrap';
    container.appendChild(stageWrap);
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'sim-lsr__stage');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '로그 계산자');
    stageWrap.appendChild(svg);

    // ─── 결과 readout ───
    var readout = document.createElement('div');
    readout.className = 'sim-lsr__readout';
    container.appendChild(readout);

    // ─── 빠른 예시 ───
    var exRow = document.createElement('div');
    exRow.className = 'sim-controls sim-lsr__ex';
    var exHead = document.createElement('span');
    exHead.className = 'sim-lsr__ex-head';
    exHead.textContent = '예시 :';
    exRow.appendChild(exHead);
    [
      { a: 2, b: 3, label: '2 × 3' },
      { a: 2, b: 4, label: '2 × 4' },
      { a: 3, b: 3, label: '3 × 3' },
      { a: 2.5, b: 4, label: '2.5 × 4' },
      { a: 1.5, b: 6, label: '1.5 × 6' }
    ].forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sim-btn sim-lsr__ex-btn';
      b.textContent = e.label;
      b.addEventListener('click', function () {
        state.a = e.a; state.b = e.b;
        aInput.value = String(e.a); bInput.value = String(e.b);
        render();
      });
      exRow.appendChild(b);
    });
    container.appendChild(exRow);

    var note = document.createElement('p');
    note.className = 'sim-lsr__note';
    note.innerHTML = '여기 보이는 건 한 사이클(C·D 스케일, 1~10) 뿐이다. 실제 계산자에는 <em>CI</em>(역수), <em>K</em>(세제곱), <em>LL</em>(로그·로그 — 거듭제곱) 등 여러 스케일이 함께 있어 한 번에 더 많은 계산을 할 수 있다. 위 자가 아래 자의 10을 넘어가면 한 사이클을 더 가야 한다 — 그때는 "decade"를 빌려와 자릿수를 맞춘다.';
    container.appendChild(note);

    // ─── 자 드래그(터치/마우스) — 위 자를 직접 슬라이드 ───
    var dragging = false, dragStartX = 0, dragStartA = 0;
    function onDown(ev) {
      dragging = true;
      var pt = ev.touches ? ev.touches[0] : ev;
      dragStartX = pt.clientX;
      dragStartA = state.a;
    }
    function onMove(ev) {
      if (!dragging) return;
      var pt = ev.touches ? ev.touches[0] : ev;
      var rect = svg.getBoundingClientRect();
      var dxPx = (pt.clientX - dragStartX) / rect.width * VIEW_W;
      // 자 길이 RULE_LEN을 [1,10]에 매핑. dxPx만큼 자가 이동했을 때 a 값 변화:
      // a = 10^(log a_start + dxPx / RULE_LEN)
      var newLog = Math.log10(dragStartA) + dxPx / RULE_LEN;
      newLog = Math.max(0, Math.min(1, newLog));
      state.a = Math.pow(10, newLog);
      aInput.value = String(state.a);
      render();
      ev.preventDefault();
    }
    function onUp() { dragging = false; }

    function render() {
      aLabTxt.innerHTML = 'a = <em class="sim-lsr__sx">' + state.a.toFixed(3) + '</em> <span class="sim-lsr__hint">(위 자의 "1"이 아래 자의 이 값에 정렬됨)</span>';
      bLabTxt.innerHTML = 'b = <em class="sim-lsr__sx">' + state.b.toFixed(3) + '</em> <span class="sim-lsr__hint">(위 자에서 읽는 값)</span>';

      svg.setAttribute('viewBox', '0 0 ' + VIEW_W + ' ' + VIEW_H);
      svg.setAttribute('width', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      // 배경
      var bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', '0'); bg.setAttribute('y', '0');
      bg.setAttribute('width', String(VIEW_W)); bg.setAttribute('height', String(VIEW_H));
      bg.setAttribute('class', 'sim-lsr__bg');
      svg.appendChild(bg);

      // ─── 아래 자 (D 스케일) — 고정 ───
      // 자 시작 x = MARGIN_X
      var dY = 130;
      var dRule = document.createElementNS(svgNS, 'rect');
      dRule.setAttribute('x', String(MARGIN_X)); dRule.setAttribute('y', String(dY));
      dRule.setAttribute('width', String(RULE_LEN)); dRule.setAttribute('height', '50');
      dRule.setAttribute('class', 'sim-lsr__rule sim-lsr__rule--d');
      svg.appendChild(dRule);
      var dLb = document.createElementNS(svgNS, 'text');
      dLb.setAttribute('x', String(MARGIN_X - 8)); dLb.setAttribute('y', String(dY + 30));
      dLb.setAttribute('text-anchor', 'end'); dLb.setAttribute('class', 'sim-lsr__rule-lb');
      dLb.textContent = 'D'; svg.appendChild(dLb);
      drawScale(svg, MARGIN_X, dY, RULE_LEN, 'd');

      // ─── 위 자 (C 스케일) — a만큼 이동 ───
      // C 자의 "1" 눈금이 D 자의 a 값 위에 놓이도록 정렬
      // → C 자의 시작 x = MARGIN_X + logPos(a) - logPos(1) = MARGIN_X + logPos(a)
      var cX = MARGIN_X + logPos(state.a);
      var cY = 60;
      var cRule = document.createElementNS(svgNS, 'rect');
      cRule.setAttribute('x', String(cX)); cRule.setAttribute('y', String(cY));
      cRule.setAttribute('width', String(RULE_LEN)); cRule.setAttribute('height', '50');
      cRule.setAttribute('class', 'sim-lsr__rule sim-lsr__rule--c');
      cRule.style.cursor = 'ew-resize';
      svg.appendChild(cRule);
      var cLb = document.createElementNS(svgNS, 'text');
      cLb.setAttribute('x', String(cX - 8)); cLb.setAttribute('y', String(cY + 30));
      cLb.setAttribute('text-anchor', 'end'); cLb.setAttribute('class', 'sim-lsr__rule-lb');
      cLb.textContent = 'C'; svg.appendChild(cLb);
      drawScale(svg, cX, cY, RULE_LEN, 'c');

      cRule.addEventListener('mousedown', onDown);
      cRule.addEventListener('touchstart', onDown, { passive: true });

      // ─── 정답 표시 ───
      var product = state.a * state.b;
      // b의 위 자 위에서의 위치 = cX + logPos(b)
      var bPixOnC = cX + logPos(state.b);
      // 같은 픽셀의 D 자 값 = posToVal(bPixOnC - MARGIN_X)
      var dValAtBpos = (bPixOnC - MARGIN_X >= 0 && bPixOnC - MARGIN_X <= RULE_LEN) ? posToVal(bPixOnC - MARGIN_X) : null;

      // 점선 — b 위치에서 아래로
      if (dValAtBpos !== null) {
        var ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', String(bPixOnC)); ln.setAttribute('x2', String(bPixOnC));
        ln.setAttribute('y1', String(cY + 50)); ln.setAttribute('y2', String(dY));
        ln.setAttribute('class', 'sim-lsr__align'); svg.appendChild(ln);
      }
      // 정렬 표시 — C 자 "1"과 D 자 a
      var alignTop = document.createElementNS(svgNS, 'circle');
      alignTop.setAttribute('cx', String(cX)); alignTop.setAttribute('cy', String(cY + 50));
      alignTop.setAttribute('r', '4'); alignTop.setAttribute('class', 'sim-lsr__align-dot sim-lsr__align-dot--top');
      svg.appendChild(alignTop);
      var alignBot = document.createElementNS(svgNS, 'circle');
      alignBot.setAttribute('cx', String(cX)); alignBot.setAttribute('cy', String(dY));
      alignBot.setAttribute('r', '4'); alignBot.setAttribute('class', 'sim-lsr__align-dot sim-lsr__align-dot--bot');
      svg.appendChild(alignBot);

      // 화살표 라벨 — b
      if (dValAtBpos !== null) {
        var bTri = document.createElementNS(svgNS, 'polygon');
        bTri.setAttribute('points', (bPixOnC - 5) + ',' + (cY - 6) + ' ' + (bPixOnC + 5) + ',' + (cY - 6) + ' ' + bPixOnC + ',' + (cY));
        bTri.setAttribute('class', 'sim-lsr__marker sim-lsr__marker--b');
        svg.appendChild(bTri);
        var bTxt = document.createElementNS(svgNS, 'text');
        bTxt.setAttribute('x', String(bPixOnC)); bTxt.setAttribute('y', String(cY - 10));
        bTxt.setAttribute('text-anchor', 'middle'); bTxt.setAttribute('class', 'sim-lsr__marker-lb sim-lsr__marker-lb--b');
        bTxt.textContent = 'b = ' + state.b.toFixed(2); svg.appendChild(bTxt);

        var pTri = document.createElementNS(svgNS, 'polygon');
        pTri.setAttribute('points', (bPixOnC - 5) + ',' + (dY + 56) + ' ' + (bPixOnC + 5) + ',' + (dY + 56) + ' ' + bPixOnC + ',' + (dY + 50));
        pTri.setAttribute('class', 'sim-lsr__marker sim-lsr__marker--p');
        svg.appendChild(pTri);
        var pTxt = document.createElementNS(svgNS, 'text');
        pTxt.setAttribute('x', String(bPixOnC)); pTxt.setAttribute('y', String(dY + 70));
        pTxt.setAttribute('text-anchor', 'middle'); pTxt.setAttribute('class', 'sim-lsr__marker-lb sim-lsr__marker-lb--p');
        pTxt.textContent = 'a × b ≈ ' + (dValAtBpos !== null ? dValAtBpos.toFixed(3) : '—'); svg.appendChild(pTxt);
      }

      // ─── readout ───
      var overflow = product > 10;
      readout.innerHTML =
        '<div class="sim-lsr__row">' +
        '  <span class="sim-lsr__cell"><em>a × b</em> = ' + state.a.toFixed(3) + ' × ' + state.b.toFixed(3) + ' = <strong>' + product.toFixed(3) + '</strong></span>' +
        '</div>' +
        '<div class="sim-lsr__row sim-lsr__row--sub">' +
        '  <span class="sim-lsr__cell"><em>log a</em> = ' + Math.log10(state.a).toFixed(3) + '</span>' +
        '  <span class="sim-lsr__cell"><em>log b</em> = ' + Math.log10(state.b).toFixed(3) + '</span>' +
        '  <span class="sim-lsr__cell"><em>log a + log b</em> = ' + (Math.log10(state.a) + Math.log10(state.b)).toFixed(3) + ' = <em>log(a × b)</em></span>' +
        '</div>' +
        (overflow
          ? '<div class="sim-lsr__row sim-lsr__row--warn">결과가 10을 넘어 자 한 사이클을 벗어났다 — 실제 계산자라면 한 자리 끌어올려 다음 사이클(10~100)로 읽는다.</div>'
          : '');
    }

    function drawScale(svg, startX, topY, len, kind) {
      // 주 눈금: 1, 2, 3, ..., 10
      // 보조 눈금: 1.5, 2.5, ..., 9.5 (희미하게)
      // 세부 눈금: 1~2 사이는 0.1마다, 2~5 사이는 0.2마다, 5~10 사이는 0.5마다 (계산자 표준 관행 단순화)
      var labelY = (kind === 'c') ? (topY + 44) : (topY + 14);
      var tickTopY = (kind === 'c') ? (topY + 50) : topY;
      var tickDir = (kind === 'c') ? -1 : 1; // c는 아래에서 위로, d는 위에서 아래로
      var majors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      majors.forEach(function (v) {
        var x = startX + logPos(v);
        var ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', String(x)); ln.setAttribute('x2', String(x));
        ln.setAttribute('y1', String(tickTopY)); ln.setAttribute('y2', String(tickTopY + tickDir * 16));
        ln.setAttribute('class', 'sim-lsr__tick sim-lsr__tick--major');
        svg.appendChild(ln);
        var t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', String(x)); t.setAttribute('y', String(labelY));
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('class', 'sim-lsr__tick-lb');
        t.textContent = v;
        svg.appendChild(t);
      });
      // 보조 눈금
      var minors = [];
      // 1~2: 0.1 간격, 2~5: 0.2 간격, 5~10: 0.5 간격
      for (var v = 1.1; v < 2; v += 0.1) minors.push(+v.toFixed(2));
      for (var v2 = 2.2; v2 < 5; v2 += 0.2) minors.push(+v2.toFixed(2));
      for (var v3 = 5.5; v3 < 10; v3 += 0.5) minors.push(+v3.toFixed(2));
      minors.forEach(function (mv) {
        var x = startX + logPos(mv);
        var ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', String(x)); ln.setAttribute('x2', String(x));
        ln.setAttribute('y1', String(tickTopY)); ln.setAttribute('y2', String(tickTopY + tickDir * 8));
        ln.setAttribute('class', 'sim-lsr__tick sim-lsr__tick--minor');
        svg.appendChild(ln);
      });
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);

    render();

    // ─── 스타일 ───
    if (!document.getElementById('sim-logarithm-slide-rule-style')) {
      var style = document.createElement('style');
      style.id = 'sim-logarithm-slide-rule-style';
      style.textContent =
        '.sim-logarithm-slide-rule .sim-lsr__slider-row{margin:8px 0 4px;}' +
        '.sim-logarithm-slide-rule .sim-lsr__slider{display:flex;flex-direction:column;gap:4px;width:100%;}' +
        '.sim-logarithm-slide-rule .sim-lsr__slider-lbl{font-family:var(--sans-ko);font-size:12px;color:var(--ink-mute);}' +
        '.sim-logarithm-slide-rule .sim-lsr__sx{font-family:var(--serif-en);font-style:normal;font-weight:600;color:var(--accent);}' +
        '.sim-logarithm-slide-rule .sim-lsr__hint{font-family:var(--sans-ko);font-size:11px;font-style:italic;color:var(--ink-mute);margin-left:6px;}' +
        '.sim-logarithm-slide-rule .sim-lsr__range{width:100%;}' +
        '.sim-logarithm-slide-rule .sim-lsr__stage-wrap{margin:14px 0 0;background:var(--paper-light);border:1px solid var(--rule-soft);padding:10px;overflow-x:auto;}' +
        '.sim-logarithm-slide-rule .sim-lsr__stage{display:block;width:100%;min-width:520px;max-width:760px;height:auto;margin:0 auto;}' +
        '.sim-logarithm-slide-rule .sim-lsr__bg{fill:var(--paper);}' +
        '.sim-logarithm-slide-rule .sim-lsr__rule{stroke:var(--ink);stroke-width:1.2;}' +
        '.sim-logarithm-slide-rule .sim-lsr__rule--c{fill:#f4ead2;}' +
        '.sim-logarithm-slide-rule .sim-lsr__rule--d{fill:#ede4cf;}' +
        '.sim-logarithm-slide-rule .sim-lsr__rule-lb{font-family:var(--serif-en);font-size:13px;font-style:italic;font-weight:700;fill:var(--ink-mute);}' +
        '.sim-logarithm-slide-rule .sim-lsr__tick{stroke:var(--ink);}' +
        '.sim-logarithm-slide-rule .sim-lsr__tick--major{stroke-width:1.2;}' +
        '.sim-logarithm-slide-rule .sim-lsr__tick--minor{stroke-width:0.6;opacity:0.55;}' +
        '.sim-logarithm-slide-rule .sim-lsr__tick-lb{font-family:var(--serif-en);font-size:10px;fill:var(--ink);font-style:italic;}' +
        '.sim-logarithm-slide-rule .sim-lsr__align{stroke:var(--accent);stroke-width:1;stroke-dasharray:3 3;opacity:0.7;}' +
        '.sim-logarithm-slide-rule .sim-lsr__align-dot{fill:var(--accent);stroke:var(--paper);stroke-width:1;}' +
        '.sim-logarithm-slide-rule .sim-lsr__marker{fill:var(--accent);}' +
        '.sim-logarithm-slide-rule .sim-lsr__marker--b{fill:#a3582c;}' +
        '.sim-logarithm-slide-rule .sim-lsr__marker--p{fill:var(--accent);}' +
        '.sim-logarithm-slide-rule .sim-lsr__marker-lb{font-family:var(--serif-en);font-size:11.5px;font-style:italic;}' +
        '.sim-logarithm-slide-rule .sim-lsr__marker-lb--b{fill:#a3582c;}' +
        '.sim-logarithm-slide-rule .sim-lsr__marker-lb--p{fill:var(--accent);font-weight:700;}' +
        '.sim-logarithm-slide-rule .sim-lsr__readout{margin-top:14px;padding:12px 14px;background:var(--paper-light);border-left:3px solid var(--accent);}' +
        '.sim-logarithm-slide-rule .sim-lsr__row{font-family:var(--serif-en);font-size:14px;color:var(--ink);margin:2px 0;}' +
        '.sim-logarithm-slide-rule .sim-lsr__row--sub{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--ink-soft);margin-top:6px;}' +
        '.sim-logarithm-slide-rule .sim-lsr__row--warn{margin-top:8px;font-family:var(--sans-ko);font-size:12px;color:#a3582c;font-style:italic;}' +
        '.sim-logarithm-slide-rule .sim-lsr__cell em{font-style:italic;color:var(--accent);font-weight:600;}' +
        '.sim-logarithm-slide-rule .sim-lsr__cell strong{font-family:var(--serif-en);font-weight:700;color:var(--accent);font-size:16px;}' +
        '.sim-logarithm-slide-rule .sim-lsr__ex{margin:10px 0 4px;align-items:center;flex-wrap:wrap;}' +
        '.sim-logarithm-slide-rule .sim-lsr__ex-head{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.08em;color:var(--ink-mute);text-transform:uppercase;}' +
        '.sim-logarithm-slide-rule .sim-lsr__ex-btn{font-family:var(--mono);font-size:12px;padding:3px 8px;}' +
        '.sim-logarithm-slide-rule .sim-lsr__note{margin:12px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-logarithm-slide-rule .sim-lsr__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-logarithm-slide-rule .sim-lsr__row--sub{flex-direction:column;gap:4px;}.sim-logarithm-slide-rule .sim-lsr__hint{display:block;margin-left:0;margin-top:2px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="logarithm-slide-rule"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
