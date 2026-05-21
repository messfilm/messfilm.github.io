/* ============================================================
   Simulation: Calculus intuition (derivative + integral on one curve)
   같은 곡선 위에서 미분(접선 기울기)과 적분(곡선 아래 넓이)을 함께 본다.
   슬라이더 x로 점 위치 선택 → 그 점의 접선 + 0~x 넓이 색칠.
   Mounted on: <div class="sim" data-sim-id="calculus-intuition">
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  // ─── 곡선 카탈로그 (해석적 미분/적분 — 정직한 수식) ───
  var CURVES = {
    parabola: {
      name: 'y = x²',
      formula: 'f(x) = x²',
      dfFormula: "f'(x) = 2x",
      intFormula: '∫₀^x f = x³/3',
      f: function (x) { return x * x; },
      df: function (x) { return 2 * x; },
      integral: function (x) { return x * x * x / 3; },
      xRange: [-3, 3], yRange: [-1, 9]
    },
    sine: {
      name: 'y = sin(x)',
      formula: 'f(x) = sin(x)',
      dfFormula: "f'(x) = cos(x)",
      intFormula: '∫₀^x f = 1 − cos(x)',
      f: function (x) { return Math.sin(x); },
      df: function (x) { return Math.cos(x); },
      integral: function (x) { return 1 - Math.cos(x); },
      xRange: [-Math.PI, Math.PI], yRange: [-1.5, 1.5]
    },
    exp: {
      name: 'y = eˣ',
      formula: 'f(x) = eˣ',
      dfFormula: "f'(x) = eˣ",
      intFormula: '∫₀^x f = eˣ − 1',
      f: function (x) { return Math.exp(x); },
      df: function (x) { return Math.exp(x); },
      integral: function (x) { return Math.exp(x) - 1; },
      xRange: [-2, 2], yRange: [-1, 8]
    },
    cubic: {
      name: 'y = x³/3 − x',
      formula: 'f(x) = x³/3 − x',
      dfFormula: "f'(x) = x² − 1",
      intFormula: '∫₀^x f = x⁴/12 − x²/2',
      f: function (x) { return x * x * x / 3 - x; },
      df: function (x) { return x * x - 1; },
      integral: function (x) { return x * x * x * x / 12 - x * x / 2; },
      xRange: [-2.5, 2.5], yRange: [-2.5, 2.5]
    }
  };

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-calculus-intuition');

    var state = { curveKey: 'parabola', x: 1.0, showTangent: true, showArea: true };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '한 곡선 위에서 미적분의 두 얼굴을 함께 본다. 점 x를 옮기면 접선(미분 — 그 순간의 기울기)과 0부터 x까지의 넓이(적분 — 누적된 양)가 동시에 갱신된다.';
    container.appendChild(lead);

    // ─── 곡선 선택 ───
    var topRow = document.createElement('div');
    topRow.className = 'sim-controls sim-cli__top';

    var selWrap = document.createElement('label');
    selWrap.className = 'sim-cli__sel-wrap';
    selWrap.innerHTML = '<span class="sim-cli__sel-lbl">곡선</span>';
    var sel = document.createElement('select');
    sel.className = 'sim-cli__sel';
    Object.keys(CURVES).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = CURVES[k].name;
      if (k === state.curveKey) o.selected = true;
      sel.appendChild(o);
    });
    selWrap.appendChild(sel);
    topRow.appendChild(selWrap);

    var toggleWrap = document.createElement('div');
    toggleWrap.className = 'sim-cli__toggles';
    function makeToggle(label, key) {
      var lab = document.createElement('label');
      lab.className = 'sim-cli__toggle';
      var cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = state[key];
      cb.addEventListener('change', function () { state[key] = cb.checked; render(); });
      lab.appendChild(cb);
      var sp = document.createElement('span'); sp.textContent = label;
      lab.appendChild(sp);
      return lab;
    }
    toggleWrap.appendChild(makeToggle('접선 (미분)', 'showTangent'));
    toggleWrap.appendChild(makeToggle('넓이 (적분)', 'showArea'));
    topRow.appendChild(toggleWrap);

    container.appendChild(topRow);

    // ─── 슬라이더 ───
    var sliderRow = document.createElement('div');
    sliderRow.className = 'sim-cli__slider-row';
    var sliderLab = document.createElement('label');
    sliderLab.className = 'sim-cli__slider';
    var sliderTxt = document.createElement('span');
    sliderTxt.className = 'sim-cli__slider-lbl';
    var slider = document.createElement('input');
    slider.type = 'range'; slider.className = 'sim-cli__range';
    slider.addEventListener('input', function () {
      state.x = parseFloat(slider.value);
      render();
    });
    sliderLab.appendChild(sliderTxt);
    sliderLab.appendChild(slider);
    sliderRow.appendChild(sliderLab);
    container.appendChild(sliderRow);

    // ─── SVG ───
    var stageWrap = document.createElement('div');
    stageWrap.className = 'sim-cli__stage-wrap';
    container.appendChild(stageWrap);
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'sim-cli__stage');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '미분과 적분 시각화');
    stageWrap.appendChild(svg);

    // ─── 수치 출력 ───
    var readout = document.createElement('div');
    readout.className = 'sim-cli__readout';
    container.appendChild(readout);

    var note = document.createElement('p');
    note.className = 'sim-cli__note';
    note.innerHTML = '<em>접선</em>은 그 점 좌우 아주 가까운 값으로 기울기를 정확히 계산한 결과다. <em>넓이</em>는 곡선을 가는 직사각형 1,000개로 잘라 더한 리만 합 — 두 직관이 1665~1675년 뉴턴과 라이프니츠 손에서 한 줄짜리 기호 미적분으로 묶였다.';
    container.appendChild(note);

    sel.addEventListener('change', function () {
      state.curveKey = sel.value;
      resetSlider();
      render();
    });

    function resetSlider() {
      var c = CURVES[state.curveKey];
      slider.min = String(c.xRange[0]);
      slider.max = String(c.xRange[1]);
      slider.step = String((c.xRange[1] - c.xRange[0]) / 200);
      // 기본 x를 곡선 범위 안 적당한 위치로
      var defaultX = (state.curveKey === 'sine') ? 1 : (state.curveKey === 'exp' ? 1 : (state.curveKey === 'cubic' ? 1.2 : 1.5));
      if (defaultX > c.xRange[1] || defaultX < c.xRange[0]) defaultX = (c.xRange[0] + c.xRange[1]) / 2;
      state.x = defaultX;
      slider.value = String(state.x);
    }

    var VIEW_W = 600, VIEW_H = 420;
    var PAD = 28;
    function toSvgX(x, curve) {
      return PAD + (x - curve.xRange[0]) / (curve.xRange[1] - curve.xRange[0]) * (VIEW_W - 2 * PAD);
    }
    function toSvgY(y, curve) {
      return VIEW_H - PAD - (y - curve.yRange[0]) / (curve.yRange[1] - curve.yRange[0]) * (VIEW_H - 2 * PAD);
    }

    function render() {
      var c = CURVES[state.curveKey];
      sliderTxt.innerHTML = 'x = <em class="sim-cli__sx">' + state.x.toFixed(3) + '</em>';

      svg.setAttribute('viewBox', '0 0 ' + VIEW_W + ' ' + VIEW_H);
      svg.setAttribute('width', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      // 배경
      var bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', '0'); bg.setAttribute('y', '0');
      bg.setAttribute('width', String(VIEW_W)); bg.setAttribute('height', String(VIEW_H));
      bg.setAttribute('class', 'sim-cli__bg'); svg.appendChild(bg);

      // 축
      var x0Pix = toSvgX(0, c), y0Pix = toSvgY(0, c);
      // x축 (y=0이 화면 안에 있을 때만)
      if (y0Pix >= PAD && y0Pix <= VIEW_H - PAD) {
        var xa = document.createElementNS(svgNS, 'line');
        xa.setAttribute('x1', String(PAD)); xa.setAttribute('x2', String(VIEW_W - PAD));
        xa.setAttribute('y1', String(y0Pix)); xa.setAttribute('y2', String(y0Pix));
        xa.setAttribute('class', 'sim-cli__axis'); svg.appendChild(xa);
      }
      // y축 (x=0이 화면 안에 있을 때만)
      if (x0Pix >= PAD && x0Pix <= VIEW_W - PAD) {
        var ya = document.createElementNS(svgNS, 'line');
        ya.setAttribute('y1', String(PAD)); ya.setAttribute('y2', String(VIEW_H - PAD));
        ya.setAttribute('x1', String(x0Pix)); ya.setAttribute('x2', String(x0Pix));
        ya.setAttribute('class', 'sim-cli__axis'); svg.appendChild(ya);
      }

      // ─── 적분 넓이 색칠 ───
      if (state.showArea) {
        var N = 600;
        var lo = Math.min(0, state.x), hi = Math.max(0, state.x);
        var d = 'M' + toSvgX(lo, c) + ' ' + toSvgY(0, c);
        for (var i = 0; i <= N; i++) {
          var xx = lo + (hi - lo) * i / N;
          d += ' L' + toSvgX(xx, c) + ' ' + toSvgY(c.f(xx), c);
        }
        d += ' L' + toSvgX(hi, c) + ' ' + toSvgY(0, c) + ' Z';
        var area = document.createElementNS(svgNS, 'path');
        area.setAttribute('d', d); area.setAttribute('class', 'sim-cli__area');
        svg.appendChild(area);
      }

      // ─── 곡선 ───
      var N2 = 600;
      var dC = '';
      var on = false;
      for (var j = 0; j <= N2; j++) {
        var x = c.xRange[0] + (c.xRange[1] - c.xRange[0]) * j / N2;
        var y = c.f(x);
        if (!isFinite(y) || y < c.yRange[0] - 1 || y > c.yRange[1] + 1) { on = false; continue; }
        var sx = toSvgX(x, c), sy = toSvgY(y, c);
        if (!on) { dC += 'M' + sx.toFixed(2) + ' ' + sy.toFixed(2); on = true; }
        else dC += ' L' + sx.toFixed(2) + ' ' + sy.toFixed(2);
      }
      var curvePath = document.createElementNS(svgNS, 'path');
      curvePath.setAttribute('d', dC); curvePath.setAttribute('class', 'sim-cli__curve');
      svg.appendChild(curvePath);

      // ─── 접선 ───
      var slope = c.df(state.x);
      var fx = c.f(state.x);
      if (state.showTangent && isFinite(slope) && isFinite(fx)) {
        // 곡선 화면 폭의 30% 정도로 접선 그림
        var span = (c.xRange[1] - c.xRange[0]) * 0.35;
        var x1 = state.x - span, x2 = state.x + span;
        var y1 = fx + slope * (x1 - state.x);
        var y2 = fx + slope * (x2 - state.x);
        var tln = document.createElementNS(svgNS, 'line');
        tln.setAttribute('x1', String(toSvgX(x1, c))); tln.setAttribute('y1', String(toSvgY(y1, c)));
        tln.setAttribute('x2', String(toSvgX(x2, c))); tln.setAttribute('y2', String(toSvgY(y2, c)));
        tln.setAttribute('class', 'sim-cli__tangent'); svg.appendChild(tln);
      }

      // ─── 선택 점 ───
      if (isFinite(fx)) {
        var dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', String(toSvgX(state.x, c))); dot.setAttribute('cy', String(toSvgY(fx, c)));
        dot.setAttribute('r', '5'); dot.setAttribute('class', 'sim-cli__dot');
        svg.appendChild(dot);
        // 수직 안내선
        var v = document.createElementNS(svgNS, 'line');
        v.setAttribute('x1', String(toSvgX(state.x, c))); v.setAttribute('x2', String(toSvgX(state.x, c)));
        v.setAttribute('y1', String(toSvgY(fx, c))); v.setAttribute('y2', String(toSvgY(0, c)));
        v.setAttribute('class', 'sim-cli__guide'); svg.appendChild(v);
      }

      // ─── 수치 readout ───
      var intVal = c.integral(state.x);
      readout.innerHTML =
        '<div class="sim-cli__row"><span class="sim-cli__rl">' + c.formula + '</span></div>' +
        '<div class="sim-cli__row sim-cli__row--metric">' +
        '  <span class="sim-cli__cell"><em>x</em> = ' + state.x.toFixed(3) + '</span>' +
        '  <span class="sim-cli__cell"><em>f(x)</em> = ' + (isFinite(fx) ? fx.toFixed(3) : '—') + '</span>' +
        '</div>' +
        '<div class="sim-cli__row sim-cli__row--metric">' +
        '  <span class="sim-cli__cell sim-cli__cell--deriv"><em>' + c.dfFormula + '</em> = ' + (isFinite(slope) ? slope.toFixed(3) : '—') + ' <span class="sim-cli__tag">접선 기울기</span></span>' +
        '</div>' +
        '<div class="sim-cli__row sim-cli__row--metric">' +
        '  <span class="sim-cli__cell sim-cli__cell--int"><em>' + c.intFormula + '</em> = ' + (isFinite(intVal) ? intVal.toFixed(3) : '—') + ' <span class="sim-cli__tag">0 ~ x 넓이</span></span>' +
        '</div>';
    }

    resetSlider();
    render();

    // ─── 스타일 ───
    if (!document.getElementById('sim-calculus-intuition-style')) {
      var style = document.createElement('style');
      style.id = 'sim-calculus-intuition-style';
      style.textContent =
        '.sim-calculus-intuition .sim-cli__top{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin:12px 0 6px;}' +
        '.sim-calculus-intuition .sim-cli__sel-wrap{display:flex;align-items:center;gap:8px;}' +
        '.sim-calculus-intuition .sim-cli__sel-lbl{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;}' +
        '.sim-calculus-intuition .sim-cli__sel{font-family:var(--serif-ko);font-size:14px;padding:5px 8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}' +
        '.sim-calculus-intuition .sim-cli__sel:focus{outline:none;border-color:var(--accent);}' +
        '.sim-calculus-intuition .sim-cli__toggles{display:flex;gap:14px;flex-wrap:wrap;}' +
        '.sim-calculus-intuition .sim-cli__toggle{display:flex;align-items:center;gap:6px;font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);cursor:pointer;}' +
        '.sim-calculus-intuition .sim-cli__toggle input{accent-color:var(--accent);}' +
        '.sim-calculus-intuition .sim-cli__slider-row{margin:8px 0 14px;}' +
        '.sim-calculus-intuition .sim-cli__slider{display:flex;flex-direction:column;gap:4px;}' +
        '.sim-calculus-intuition .sim-cli__slider-lbl{font-family:var(--sans-ko);font-size:12px;color:var(--ink-mute);}' +
        '.sim-calculus-intuition .sim-cli__sx{font-family:var(--serif-en);font-style:normal;font-weight:600;color:var(--accent);}' +
        '.sim-calculus-intuition .sim-cli__range{width:100%;}' +
        '.sim-calculus-intuition .sim-cli__stage-wrap{background:var(--paper-light);border:1px solid var(--rule-soft);padding:8px;}' +
        '.sim-calculus-intuition .sim-cli__stage{display:block;width:100%;max-width:560px;height:auto;margin:0 auto;}' +
        '.sim-calculus-intuition .sim-cli__bg{fill:var(--paper);}' +
        '.sim-calculus-intuition .sim-cli__axis{stroke:var(--ink-mute);stroke-width:1;}' +
        '.sim-calculus-intuition .sim-cli__curve{fill:none;stroke:var(--ink);stroke-width:2;}' +
        '.sim-calculus-intuition .sim-cli__area{fill:var(--accent);fill-opacity:0.18;stroke:var(--accent);stroke-opacity:0.45;stroke-width:1;}' +
        '.sim-calculus-intuition .sim-cli__tangent{stroke:#a3582c;stroke-width:2;stroke-dasharray:none;opacity:0.85;}' +
        '.sim-calculus-intuition .sim-cli__dot{fill:var(--accent);stroke:var(--paper);stroke-width:1.5;}' +
        '.sim-calculus-intuition .sim-cli__guide{stroke:var(--ink-mute);stroke-width:0.8;stroke-dasharray:3 3;opacity:0.55;}' +
        '.sim-calculus-intuition .sim-cli__readout{margin-top:12px;padding:12px 14px;background:var(--paper-light);border-left:3px solid var(--accent);}' +
        '.sim-calculus-intuition .sim-cli__row{font-family:var(--serif-en);font-size:14px;color:var(--ink);margin:0 0 4px;}' +
        '.sim-calculus-intuition .sim-cli__row--metric{display:flex;gap:18px;flex-wrap:wrap;}' +
        '.sim-calculus-intuition .sim-cli__rl{font-style:italic;color:var(--ink-soft);}' +
        '.sim-calculus-intuition .sim-cli__cell em{font-style:italic;color:var(--accent);font-weight:600;}' +
        '.sim-calculus-intuition .sim-cli__cell--deriv em{color:#a3582c;}' +
        '.sim-calculus-intuition .sim-cli__cell--int em{color:var(--accent);}' +
        '.sim-calculus-intuition .sim-cli__tag{font-family:var(--sans-ko);font-size:10.5px;letter-spacing:0.05em;color:var(--ink-mute);margin-left:6px;text-transform:uppercase;font-style:normal;}' +
        '.sim-calculus-intuition .sim-cli__note{margin:12px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-calculus-intuition .sim-cli__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-calculus-intuition .sim-cli__top{gap:10px;}.sim-calculus-intuition .sim-cli__row--metric{flex-direction:column;gap:6px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="calculus-intuition"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
