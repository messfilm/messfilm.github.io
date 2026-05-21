/* ============================================================
   Simulation: Galton Board (Quincunx)
   못이 박힌 보드에서 구슬이 떨어지며 좌/우 50/50 선택.
   바닥 칸에 누적 → 이항분포 ~ 정규분포 근사.
   Mounted on: <div class="sim" data-sim-id="galton-board">
   ============================================================ */

(function () {
  'use strict';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-galton-board');

    var state = {
      rows: 12,          // 못의 행 수 (8~16)
      bins: null,        // 바닥 칸 [bins+1 = rows+1 칸]
      total: 0,          // 떨어진 구슬 총 수
      animating: false,
      animBalls: [],     // 진행 중 애니메이션 구슬들
      animTimer: null
    };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '못이 박힌 보드 — 구슬은 매 못에서 좌/우 50/50으로 갈라진다. 수천 개 떨어뜨리면 바닥에 정규분포 모양이 나타난다.';
    container.appendChild(lead);

    // ─── 컨트롤 ───
    var controls = document.createElement('div');
    controls.className = 'sim-controls sim-galt__controls';

    // 행 슬라이더
    var rowLbl = document.createElement('label');
    rowLbl.className = 'sim-galt__slider';
    rowLbl.innerHTML = '<span class="sim-galt__sl">행 수 <em class="sim-galt__rows-v">12</em></span>';
    var rowSlider = document.createElement('input');
    rowSlider.type = 'range';
    rowSlider.min = '8'; rowSlider.max = '16'; rowSlider.step = '1'; rowSlider.value = '12';
    rowSlider.className = 'sim-galt__range';
    rowSlider.addEventListener('input', function () {
      state.rows = parseInt(rowSlider.value, 10);
      rowLbl.querySelector('.sim-galt__rows-v').textContent = state.rows;
      reset();
    });
    rowLbl.appendChild(rowSlider);
    controls.appendChild(rowLbl);

    var drop1Btn = makeBtn('1개 떨어뜨리기', '');
    var drop100Btn = makeBtn('100개 한꺼번에', '');
    var drop1000Btn = makeBtn('1,000개 (즉시)', '');
    var resetBtn = makeBtn('처음으로', 'sim-galt__reset');
    drop1Btn.addEventListener('click', function () { dropAnimated(1); });
    drop100Btn.addEventListener('click', function () { dropAnimated(100); });
    drop1000Btn.addEventListener('click', function () { dropInstant(1000); });
    resetBtn.addEventListener('click', reset);
    controls.appendChild(drop1Btn);
    controls.appendChild(drop100Btn);
    controls.appendChild(drop1000Btn);
    controls.appendChild(resetBtn);

    container.appendChild(controls);

    // ─── 통계 ───
    var statsEl = document.createElement('div');
    statsEl.className = 'sim-galt__stats';
    container.appendChild(statsEl);

    // ─── 보드 SVG ───
    var boardWrap = document.createElement('div');
    boardWrap.className = 'sim-galt__board-wrap';
    container.appendChild(boardWrap);

    var note = document.createElement('p');
    note.className = 'sim-galt__note';
    note.innerHTML = '각 못에서 좌/우 확률은 정확히 50:50 — 이항분포 B(n=' +
      '<span class="sim-galt__n-inline">행수</span>' +
      ', p=½). 행수가 늘어나면 이항분포는 점점 정규분포에 가까워진다 (중심극한정리).';
    container.appendChild(note);

    function makeBtn(label, cls) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sim-btn' + (cls ? ' ' + cls : '');
      b.textContent = label;
      return b;
    }

    function reset() {
      stopAnim();
      state.bins = new Array(state.rows + 1).fill(0);
      state.total = 0;
      state.animBalls = [];
      render();
    }

    function simulateOne() {
      // n번의 좌/우 선택 → 우측 카운트가 bin index
      var right = 0;
      for (var i = 0; i < state.rows; i++) {
        if (Math.random() < 0.5) right++;
      }
      return right;
    }

    function dropInstant(n) {
      for (var i = 0; i < n; i++) {
        var bin = simulateOne();
        state.bins[bin]++;
        state.total++;
      }
      render();
    }

    function dropAnimated(n) {
      if (state.animating) return;
      // 미리 결과 계산해두고 애니메이션
      var pending = [];
      for (var i = 0; i < n; i++) pending.push(simulateOne());
      var board = computeBoardGeom();

      state.animating = true;
      state.animBalls = [];

      var spawnIdx = 0;
      var spawnInterval = n > 50 ? 30 : (n > 10 ? 80 : 200);
      var lastTime = performance.now();

      function tick() {
        if (!state.animating) return;
        var now = performance.now();
        var dt = Math.min(50, now - lastTime);
        lastTime = now;

        // spawn
        if (spawnIdx < pending.length) {
          // 각 tick에서 spawn (작은 n이면 천천히, 큰 n이면 빨리)
          var spawnsThisFrame = Math.max(1, Math.floor(dt / spawnInterval));
          for (var s = 0; s < spawnsThisFrame && spawnIdx < pending.length; s++) {
            var targetBin = pending[spawnIdx];
            // 미리 각 행에서 좌/우 선택 시퀀스 생성 (targetBin 우측 개수가 되도록)
            var seq = makeSequence(state.rows, targetBin);
            state.animBalls.push({
              row: 0, col: 0, // 시작: 맨 위 중앙
              seq: seq,
              progress: 0, // 0~1: 현재 행에서 다음 행으로 이동 진행도
              targetBin: targetBin,
              speed: 0.10 + Math.random() * 0.05 // 행당 진행 속도
            });
            spawnIdx++;
          }
        }

        // update existing balls
        var still = [];
        for (var b = 0; b < state.animBalls.length; b++) {
          var ball = state.animBalls[b];
          ball.progress += ball.speed * (dt / 16.67);
          while (ball.progress >= 1 && ball.row < state.rows) {
            // 다음 행으로
            var goRight = ball.seq[ball.row];
            if (goRight) ball.col++;
            ball.row++;
            ball.progress -= 1;
          }
          if (ball.row >= state.rows) {
            // 바닥 도착
            state.bins[ball.targetBin]++;
            state.total++;
          } else {
            still.push(ball);
          }
        }
        state.animBalls = still;

        render();

        if (spawnIdx < pending.length || state.animBalls.length > 0) {
          state.animTimer = requestAnimationFrame(tick);
        } else {
          state.animating = false;
          state.animTimer = null;
        }
      }
      state.animTimer = requestAnimationFrame(tick);
    }

    function makeSequence(rows, rightCount) {
      // rows 길이의 0/1 배열, 1이 rightCount 개
      var seq = new Array(rows).fill(0);
      for (var i = 0; i < rightCount; i++) seq[i] = 1;
      // shuffle (Fisher-Yates)
      for (var j = seq.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = seq[j]; seq[j] = seq[k]; seq[k] = tmp;
      }
      return seq;
    }

    function stopAnim() {
      state.animating = false;
      if (state.animTimer) {
        cancelAnimationFrame(state.animTimer);
        state.animTimer = null;
      }
    }

    function computeBoardGeom() {
      var w = 560;
      var pegArea = 280;
      var binArea = 130;
      var topPad = 18, sidePad = 30;
      var h = topPad + pegArea + binArea + 30;
      var pegRows = state.rows;
      var pegRowH = pegArea / pegRows;
      var maxPegsRow = pegRows;
      var pegColW = (w - 2 * sidePad) / maxPegsRow;
      return { w: w, h: h, topPad: topPad, sidePad: sidePad, pegArea: pegArea,
               binArea: binArea, pegRowH: pegRowH, pegColW: pegColW };
    }

    function pegPos(row, col, g) {
      // row: 0 ~ rows-1, col: 0 ~ row (각 행은 row+1개의 못)
      var cx = g.sidePad + g.pegColW * (col + (g.pegArea ? 0 : 0));
      // 가운데 정렬: 각 행에 row+1개의 못, 중앙에 배치
      var offset = (g.pegColW * (state.rows - row)) / 2;
      cx = g.sidePad + offset + col * g.pegColW;
      var cy = g.topPad + g.pegRowH * (row + 0.5);
      return { x: cx, y: cy };
    }

    function ballPos(ball, g) {
      // ball.row, ball.col이 현재 갈림 위치(이 못 위치에서 결정), progress가 다음 못으로의 이동.
      // row=0, col=0이 시작 (꼭대기 못 위)
      if (ball.row >= state.rows) {
        var binX = g.sidePad + (g.pegColW * (state.rows - state.rows)) / 2 + ball.col * g.pegColW;
        return { x: binX, y: g.topPad + g.pegArea };
      }
      var cur = pegPos(ball.row, ball.col, g);
      var goRight = ball.seq[ball.row];
      var nextCol = ball.col + (goRight ? 1 : 0);
      var nxt = ball.row + 1 >= state.rows
        ? { x: g.sidePad + (g.pegColW * 0) / 2 + nextCol * g.pegColW, y: g.topPad + g.pegArea }
        : pegPos(ball.row + 1, nextCol, g);
      var t = ball.progress;
      return { x: cur.x + (nxt.x - cur.x) * t, y: cur.y + (nxt.y - cur.y) * t };
    }

    function render() {
      // 통계
      var maxBin = 0;
      for (var i = 0; i < state.bins.length; i++) {
        if (state.bins[i] > maxBin) maxBin = state.bins[i];
      }
      // 이론값: B(rows, 0.5)에서 각 bin 기대 비율 = C(n,k)/2^n
      var n = state.rows;
      var meanIdx = n / 2;
      // 표본 평균/표준편차 계산
      var mean = 0, samp = state.total;
      if (samp > 0) {
        for (var b = 0; b < state.bins.length; b++) mean += b * state.bins[b];
        mean /= samp;
      }
      var sd = 0;
      if (samp > 0) {
        var sumSq = 0;
        for (var b2 = 0; b2 < state.bins.length; b2++) {
          var dx = b2 - mean;
          sumSq += dx * dx * state.bins[b2];
        }
        sd = Math.sqrt(sumSq / samp);
      }
      var theorSd = Math.sqrt(n * 0.25);
      statsEl.innerHTML =
        '<div class="sim-galt__stat"><span class="sim-galt__sl">총 구슬</span>' +
        '<em class="sim-galt__sv">' + state.total.toLocaleString() + '</em></div>' +
        '<div class="sim-galt__stat"><span class="sim-galt__sl">표본 평균</span>' +
        '<em class="sim-galt__sv">' + (samp > 0 ? mean.toFixed(3) : '—') + '</em>' +
        '<span class="sim-galt__sl-sub">(기댓값 ' + meanIdx + ')</span></div>' +
        '<div class="sim-galt__stat"><span class="sim-galt__sl">표본 표준편차</span>' +
        '<em class="sim-galt__sv">' + (samp > 0 ? sd.toFixed(3) : '—') + '</em>' +
        '<span class="sim-galt__sl-sub">(이론 ' + theorSd.toFixed(3) + ')</span></div>';

      // SVG
      var g = computeBoardGeom();
      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h);
      svg.setAttribute('class', 'sim-galt__board');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // 못
      for (var r = 0; r < state.rows; r++) {
        for (var c = 0; c <= r; c++) {
          var p = pegPos(r, c, g);
          var peg = document.createElementNS(svgNS, 'circle');
          peg.setAttribute('cx', p.x); peg.setAttribute('cy', p.y);
          peg.setAttribute('r', 1.5);
          peg.setAttribute('class', 'sim-galt__peg');
          svg.appendChild(peg);
        }
      }

      // 칸 경계선 + 히스토그램
      var binTopY = g.topPad + g.pegArea + 4;
      var binBotY = g.topPad + g.pegArea + g.binArea;
      var binH = binBotY - binTopY;
      for (var bi = 0; bi <= state.bins.length; bi++) {
        var bx = g.sidePad + (g.pegColW * (state.rows - state.rows + 1)) / 2 + (bi - 0.5) * g.pegColW;
        // 정렬: bin i의 중심 = 마지막 행의 i번째 위치 = sidePad + 0 + i * pegColW (행=rows-1에서 nextCol = 0..rows)
        bx = g.sidePad + bi * g.pegColW;
        var ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', bx); ln.setAttribute('x2', bx);
        ln.setAttribute('y1', binTopY); ln.setAttribute('y2', binBotY);
        ln.setAttribute('class', 'sim-galt__bin-edge');
        svg.appendChild(ln);
      }
      var floorLn = document.createElementNS(svgNS, 'line');
      floorLn.setAttribute('x1', g.sidePad); floorLn.setAttribute('x2', g.sidePad + state.bins.length * g.pegColW);
      floorLn.setAttribute('y1', binBotY); floorLn.setAttribute('y2', binBotY);
      floorLn.setAttribute('class', 'sim-galt__floor');
      svg.appendChild(floorLn);

      // 막대
      for (var k = 0; k < state.bins.length; k++) {
        var ratio = maxBin > 0 ? state.bins[k] / maxBin : 0;
        var barH = ratio * (binH - 6);
        if (barH > 0) {
          var rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', g.sidePad + k * g.pegColW + 1.5);
          rect.setAttribute('y', binBotY - barH);
          rect.setAttribute('width', g.pegColW - 3);
          rect.setAttribute('height', barH);
          rect.setAttribute('class', 'sim-galt__bar');
          svg.appendChild(rect);
        }
        // 카운트 라벨 (작게)
        if (state.bins[k] > 0 && g.pegColW > 16) {
          var lbl = document.createElementNS(svgNS, 'text');
          lbl.setAttribute('x', g.sidePad + (k + 0.5) * g.pegColW);
          lbl.setAttribute('y', binBotY + 14);
          lbl.setAttribute('text-anchor', 'middle');
          lbl.setAttribute('class', 'sim-galt__bin-lbl');
          lbl.textContent = state.bins[k];
          svg.appendChild(lbl);
        }
      }

      // 이론 곡선 (정규분포 근사 PDF 스케일)
      if (state.total > 30) {
        var d = '';
        var sigma = Math.sqrt(n * 0.25);
        var mu = n / 2;
        // peak ratio: 이론 peak = C(n, n/2) / 2^n, 단순히 이를 maxBin과 동일 스케일로
        // 표본의 maxBin이 차지하는 비율로 정규화: peak를 maxBin 위치에 맞춤
        var theorPeak = 1 / (sigma * Math.sqrt(2 * Math.PI));
        for (var x = 0; x <= n; x += 0.1) {
          var z = (x - mu) / sigma;
          var pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
          var ratioP = pdf / theorPeak;
          var cx2 = g.sidePad + (x + 0.5) * g.pegColW;
          var cy2 = binBotY - ratioP * (binH - 6);
          d += (x === 0 ? 'M' : 'L') + cx2.toFixed(1) + ',' + cy2.toFixed(1) + ' ';
        }
        var curve = document.createElementNS(svgNS, 'path');
        curve.setAttribute('d', d.trim());
        curve.setAttribute('class', 'sim-galt__curve');
        svg.appendChild(curve);
      }

      // 애니메이션 중인 구슬
      for (var bb = 0; bb < state.animBalls.length; bb++) {
        var bp = ballPos(state.animBalls[bb], g);
        var c2 = document.createElementNS(svgNS, 'circle');
        c2.setAttribute('cx', bp.x); c2.setAttribute('cy', bp.y);
        c2.setAttribute('r', 3.5);
        c2.setAttribute('class', 'sim-galt__ball');
        svg.appendChild(c2);
      }

      boardWrap.innerHTML = '';
      boardWrap.appendChild(svg);
    }

    reset();

    // ─── 스타일 ───
    if (!document.getElementById('sim-galton-board-style')) {
      var style = document.createElement('style');
      style.id = 'sim-galton-board-style';
      style.textContent =
        '.sim-galton-board .sim-galt__controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:14px 0 10px;}' +
        '.sim-galton-board .sim-galt__slider{display:flex;flex-direction:column;gap:4px;min-width:140px;}' +
        '.sim-galton-board .sim-galt__sl{font-family:var(--sans-ko);font-size:11.5px;color:var(--ink-mute);letter-spacing:0.04em;}' +
        '.sim-galton-board .sim-galt__sl-sub{font-family:var(--mono);font-size:10.5px;color:var(--ink-mute);margin-top:1px;}' +
        '.sim-galton-board .sim-galt__rows-v{font-family:var(--mono);font-style:normal;color:var(--accent);font-weight:600;}' +
        '.sim-galton-board .sim-galt__range{width:140px;}' +
        '.sim-galton-board .sim-galt__stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:10px 12px;background:var(--paper-light);border:1px solid var(--rule-soft);margin-bottom:10px;}' +
        '.sim-galton-board .sim-galt__stat{display:flex;flex-direction:column;gap:1px;min-width:0;}' +
        '.sim-galton-board .sim-galt__sv{font-family:var(--mono);font-style:normal;font-size:15px;color:var(--ink);font-weight:600;}' +
        '.sim-galton-board .sim-galt__board-wrap{width:100%;background:var(--paper-light);border:1px solid var(--rule-soft);padding:6px;box-sizing:border-box;}' +
        '.sim-galton-board .sim-galt__board{width:100%;height:auto;display:block;}' +
        '.sim-galton-board .sim-galt__peg{fill:var(--ink-mute);}' +
        '.sim-galton-board .sim-galt__bin-edge{stroke:var(--rule-soft);stroke-width:1;}' +
        '.sim-galton-board .sim-galt__floor{stroke:var(--ink-mute);stroke-width:1;}' +
        '.sim-galton-board .sim-galt__bar{fill:var(--accent);opacity:0.55;}' +
        '.sim-galton-board .sim-galt__bin-lbl{font-family:var(--mono);font-size:9.5px;fill:var(--ink-mute);}' +
        '.sim-galton-board .sim-galt__curve{stroke:var(--ink);stroke-width:1.4;fill:none;stroke-dasharray:3 2;opacity:0.7;}' +
        '.sim-galton-board .sim-galt__ball{fill:var(--ink);}' +
        '.sim-galton-board .sim-galt__note{margin:12px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-galton-board .sim-galt__n-inline{font-family:var(--mono);font-style:normal;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-galton-board .sim-galt__stats{grid-template-columns:1fr;}.sim-galton-board .sim-galt__bin-lbl{display:none;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="galton-board"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
