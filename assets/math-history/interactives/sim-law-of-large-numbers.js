/* ============================================================
   Simulation: Law of Large Numbers
   시도가 늘수록 표본 평균이 기댓값에 수렴한다.
   동전(앞면 비율 → 0.5) 또는 주사위(평균 → 3.5).
   Mounted on: <div class="sim" data-sim-id="law-of-large-numbers">
   ============================================================ */

(function () {
  'use strict';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-law-of-large-numbers');

    // ─── state ───
    var state = {
      mode: 'coin',     // 'coin' | 'die'
      trials: 0,        // 누적 시도수
      sum: 0,           // 합계 (동전은 앞면 개수, 주사위는 눈 합)
      history: [],      // [{n, value}] — 차트용 (다운샘플링)
      maxHistory: 400   // 차트 점 수 상한
    };

    var EXPECTED = { coin: 0.5, die: 3.5 };
    var LABEL = { coin: '앞면 비율', die: '평균 눈' };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '동전이나 주사위를 던져보자. 시도가 늘수록 비율은 기댓값으로 수렴한다 — 그게 큰 수의 법칙이다.';
    container.appendChild(lead);

    // ─── 모드 토글 ───
    var modeRow = document.createElement('div');
    modeRow.className = 'sim-controls sim-lln__mode-row';
    var coinBtn = makeBtn('동전 (앞·뒤)', 'sim-lln__mode-coin');
    var dieBtn = makeBtn('주사위 (1–6)', 'sim-lln__mode-die');
    coinBtn.classList.add('sim-lln__mode--active');
    coinBtn.addEventListener('click', function () { setMode('coin'); });
    dieBtn.addEventListener('click', function () { setMode('die'); });
    modeRow.appendChild(coinBtn);
    modeRow.appendChild(dieBtn);
    container.appendChild(modeRow);

    // ─── 던지기 버튼들 ───
    var throwRow = document.createElement('div');
    throwRow.className = 'sim-controls sim-lln__throw-row';
    var b1 = makeBtn('한 번 더', '');
    var b100 = makeBtn('100번 더', '');
    var b10k = makeBtn('10,000번 더', '');
    var bReset = makeBtn('처음으로', 'sim-lln__reset');
    b1.addEventListener('click', function () { runTrials(1); });
    b100.addEventListener('click', function () { runTrials(100); });
    b10k.addEventListener('click', function () { runTrials(10000); });
    bReset.addEventListener('click', reset);
    throwRow.appendChild(b1);
    throwRow.appendChild(b100);
    throwRow.appendChild(b10k);
    throwRow.appendChild(bReset);
    container.appendChild(throwRow);

    // ─── 통계 표시 ───
    var stats = document.createElement('div');
    stats.className = 'sim-lln__stats';
    container.appendChild(stats);

    // ─── 차트 ───
    var chartWrap = document.createElement('div');
    chartWrap.className = 'sim-lln__chart-wrap';
    container.appendChild(chartWrap);

    var note = document.createElement('p');
    note.className = 'sim-lln__note';
    note.innerHTML = '큰 수의 법칙은 <em>확실히 수렴</em>이 아니라 <em>확률적으로 수렴</em>한다. 시도 결과는 매번 다르고, 작은 시도수에서는 큰 변동이 정상이다.';
    container.appendChild(note);

    function makeBtn(label, cls) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sim-btn' + (cls ? ' ' + cls : '');
      b.textContent = label;
      return b;
    }

    function setMode(m) {
      if (state.mode === m) return;
      state.mode = m;
      coinBtn.classList.toggle('sim-lln__mode--active', m === 'coin');
      dieBtn.classList.toggle('sim-lln__mode--active', m === 'die');
      reset();
    }

    function reset() {
      state.trials = 0;
      state.sum = 0;
      state.history = [];
      render();
    }

    function runTrials(n) {
      // 빠른 모드: 결과만 누적, 일정 주기로 history 샘플
      var sampleInterval = Math.max(1, Math.floor(n / 200));
      for (var i = 0; i < n; i++) {
        state.trials++;
        if (state.mode === 'coin') {
          state.sum += Math.random() < 0.5 ? 1 : 0;
        } else {
          state.sum += 1 + Math.floor(Math.random() * 6);
        }
        // 초반 50회는 매번 기록, 이후 sampleInterval 마다
        if (state.trials <= 50 || state.trials % sampleInterval === 0 || i === n - 1) {
          var v = state.sum / state.trials;
          state.history.push({ n: state.trials, value: v });
        }
      }
      // history 상한 유지 (다운샘플링)
      if (state.history.length > state.maxHistory) {
        var stride = Math.ceil(state.history.length / state.maxHistory);
        var thinned = [];
        for (var k = 0; k < state.history.length; k += stride) thinned.push(state.history[k]);
        // 마지막 점은 항상 보존
        var last = state.history[state.history.length - 1];
        if (thinned[thinned.length - 1] !== last) thinned.push(last);
        state.history = thinned;
      }
      render();
    }

    function render() {
      var expected = EXPECTED[state.mode];
      var current = state.trials === 0 ? null : state.sum / state.trials;
      var diff = current === null ? null : current - expected;
      stats.innerHTML =
        '<div class="sim-lln__stat"><span class="sim-lln__sl">시도</span>' +
        '<em class="sim-lln__sv">' + state.trials.toLocaleString() + '</em></div>' +
        '<div class="sim-lln__stat"><span class="sim-lln__sl">' + LABEL[state.mode] + '</span>' +
        '<em class="sim-lln__sv">' + (current === null ? '—' : current.toFixed(4)) + '</em></div>' +
        '<div class="sim-lln__stat"><span class="sim-lln__sl">기댓값</span>' +
        '<em class="sim-lln__sv sim-lln__sv--exp">' + expected.toFixed(4) + '</em></div>' +
        '<div class="sim-lln__stat"><span class="sim-lln__sl">차이</span>' +
        '<em class="sim-lln__sv">' + (diff === null ? '—' : (diff >= 0 ? '+' : '') + diff.toFixed(4)) + '</em></div>';
      drawChart();
    }

    function drawChart() {
      var w = 560, h = 200;
      var pad = { t: 14, r: 14, b: 26, l: 44 };
      var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
      var expected = EXPECTED[state.mode];
      // Y 축 범위: 동전 0~1, 주사위 1~6
      var yMin = state.mode === 'coin' ? 0 : 1;
      var yMax = state.mode === 'coin' ? 1 : 6;
      var maxN = Math.max(10, state.trials);

      function xOf(n) {
        // 로그 축이면 더 보기 좋지만, 단순 선형 사용 + 초반은 자동으로 잘 보임
        return pad.l + (n / maxN) * iw;
      }
      function yOf(v) {
        return pad.t + (1 - (v - yMin) / (yMax - yMin)) * ih;
      }

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('class', 'sim-lln__chart');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // 배경
      var bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', pad.l); bg.setAttribute('y', pad.t);
      bg.setAttribute('width', iw); bg.setAttribute('height', ih);
      bg.setAttribute('class', 'sim-lln__chart-bg');
      svg.appendChild(bg);

      // Y축 그리드 + 라벨
      var yTicks = state.mode === 'coin' ? [0, 0.25, 0.5, 0.75, 1] : [1, 2, 3, 4, 5, 6];
      yTicks.forEach(function (t) {
        var ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', pad.l); ln.setAttribute('x2', pad.l + iw);
        ln.setAttribute('y1', yOf(t)); ln.setAttribute('y2', yOf(t));
        ln.setAttribute('class', 'sim-lln__grid');
        svg.appendChild(ln);
        var tx = document.createElementNS(svgNS, 'text');
        tx.setAttribute('x', pad.l - 6); tx.setAttribute('y', yOf(t) + 3);
        tx.setAttribute('class', 'sim-lln__axis-lbl');
        tx.setAttribute('text-anchor', 'end');
        tx.textContent = state.mode === 'coin' ? t.toFixed(2) : String(t);
        svg.appendChild(tx);
      });

      // 기댓값 점선
      var expLine = document.createElementNS(svgNS, 'line');
      expLine.setAttribute('x1', pad.l); expLine.setAttribute('x2', pad.l + iw);
      expLine.setAttribute('y1', yOf(expected)); expLine.setAttribute('y2', yOf(expected));
      expLine.setAttribute('class', 'sim-lln__expected');
      svg.appendChild(expLine);

      var expLbl = document.createElementNS(svgNS, 'text');
      expLbl.setAttribute('x', pad.l + iw - 4); expLbl.setAttribute('y', yOf(expected) - 4);
      expLbl.setAttribute('class', 'sim-lln__expected-lbl');
      expLbl.setAttribute('text-anchor', 'end');
      expLbl.textContent = '기댓값 ' + expected;
      svg.appendChild(expLbl);

      // X축 라벨
      var xLbl = document.createElementNS(svgNS, 'text');
      xLbl.setAttribute('x', pad.l + iw / 2); xLbl.setAttribute('y', h - 6);
      xLbl.setAttribute('class', 'sim-lln__axis-lbl');
      xLbl.setAttribute('text-anchor', 'middle');
      xLbl.textContent = '시도 횟수 (총 ' + state.trials.toLocaleString() + ')';
      svg.appendChild(xLbl);

      // 라인 (history)
      if (state.history.length > 1) {
        var d = '';
        for (var i = 0; i < state.history.length; i++) {
          var p = state.history[i];
          d += (i === 0 ? 'M' : 'L') + xOf(p.n).toFixed(1) + ',' + yOf(p.value).toFixed(1) + ' ';
        }
        var path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', d.trim());
        path.setAttribute('class', 'sim-lln__line');
        svg.appendChild(path);
      } else if (state.history.length === 1) {
        var p0 = state.history[0];
        var dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', xOf(p0.n)); dot.setAttribute('cy', yOf(p0.value));
        dot.setAttribute('r', 3);
        dot.setAttribute('class', 'sim-lln__dot');
        svg.appendChild(dot);
      }

      chartWrap.innerHTML = '';
      chartWrap.appendChild(svg);
    }

    // 초기 렌더
    reset();

    // ─── 스타일 ───
    if (!document.getElementById('sim-law-of-large-numbers-style')) {
      var style = document.createElement('style');
      style.id = 'sim-law-of-large-numbers-style';
      style.textContent =
        '.sim-law-of-large-numbers .sim-lln__mode-row{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 8px;}' +
        '.sim-law-of-large-numbers .sim-lln__mode--active{background:var(--accent);color:var(--paper);border-color:var(--accent);}' +
        '.sim-law-of-large-numbers .sim-lln__throw-row{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px;}' +
        '.sim-law-of-large-numbers .sim-lln__stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:10px 12px;background:var(--paper-light);border:1px solid var(--rule-soft);margin-bottom:12px;}' +
        '.sim-law-of-large-numbers .sim-lln__stat{display:flex;flex-direction:column;gap:2px;min-width:0;}' +
        '.sim-law-of-large-numbers .sim-lln__sl{font-family:var(--sans-ko);font-size:11px;color:var(--ink-mute);letter-spacing:0.04em;text-transform:uppercase;}' +
        '.sim-law-of-large-numbers .sim-lln__sv{font-family:var(--mono);font-style:normal;font-size:15px;color:var(--ink);font-weight:600;}' +
        '.sim-law-of-large-numbers .sim-lln__sv--exp{color:var(--accent);}' +
        '.sim-law-of-large-numbers .sim-lln__chart-wrap{width:100%;background:var(--paper-light);border:1px solid var(--rule-soft);padding:6px;box-sizing:border-box;}' +
        '.sim-law-of-large-numbers .sim-lln__chart{width:100%;height:auto;display:block;}' +
        '.sim-law-of-large-numbers .sim-lln__chart-bg{fill:var(--paper);stroke:none;}' +
        '.sim-law-of-large-numbers .sim-lln__grid{stroke:var(--rule-soft);stroke-width:1;}' +
        '.sim-law-of-large-numbers .sim-lln__axis-lbl{font-family:var(--mono);font-size:10px;fill:var(--ink-mute);}' +
        '.sim-law-of-large-numbers .sim-lln__expected{stroke:var(--accent);stroke-width:1.4;stroke-dasharray:4 3;fill:none;opacity:0.85;}' +
        '.sim-law-of-large-numbers .sim-lln__expected-lbl{font-family:var(--serif-en);font-size:10.5px;font-style:italic;fill:var(--accent);}' +
        '.sim-law-of-large-numbers .sim-lln__line{stroke:var(--ink);stroke-width:1.5;fill:none;stroke-linejoin:round;stroke-linecap:round;}' +
        '.sim-law-of-large-numbers .sim-lln__dot{fill:var(--ink);}' +
        '.sim-law-of-large-numbers .sim-lln__note{margin:12px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-law-of-large-numbers .sim-lln__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-law-of-large-numbers .sim-lln__stats{grid-template-columns:repeat(2,minmax(0,1fr));}.sim-law-of-large-numbers .sim-lln__sv{font-size:13px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="law-of-large-numbers"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
