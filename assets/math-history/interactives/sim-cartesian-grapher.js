/* ============================================================
   Simulation: Cartesian grapher
   함수 종류와 파라미터를 골라 좌표 평면에 곡선을 그린다.
   "도형 = 방정식" 데카르트의 통찰 — 기하와 대수가 한 평면 위에서 만난다.
   Mounted on: <div class="sim" data-sim-id="cartesian-grapher">
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  // ─── 함수 카탈로그 ───
  // 각 함수는 type: 'explicit'(y=f(x)) 또는 'implicit'(F(x,y)=0 — 매개변수로 그림)
  var FNS = {
    linear: {
      name: '직선',
      formula: 'y = a·x + b',
      type: 'explicit',
      params: [
        { key: 'a', label: '기울기 a', min: -3, max: 3, step: 0.1, value: 1 },
        { key: 'b', label: 'y절편 b', min: -5, max: 5, step: 0.1, value: 0 }
      ],
      f: function (x, p) { return p.a * x + p.b; }
    },
    quadratic: {
      name: '이차곡선',
      formula: 'y = a·x² + b·x + c',
      type: 'explicit',
      params: [
        { key: 'a', label: '이차계수 a', min: -2, max: 2, step: 0.1, value: 1 },
        { key: 'b', label: '일차계수 b', min: -4, max: 4, step: 0.1, value: 0 },
        { key: 'c', label: '상수 c', min: -5, max: 5, step: 0.1, value: 0 }
      ],
      f: function (x, p) { return p.a * x * x + p.b * x + p.c; }
    },
    sine: {
      name: '사인파',
      formula: 'y = a·sin(b·x + c)',
      type: 'explicit',
      params: [
        { key: 'a', label: '진폭 a', min: 0.1, max: 4, step: 0.1, value: 2 },
        { key: 'b', label: '진동수 b', min: 0.1, max: 3, step: 0.1, value: 1 },
        { key: 'c', label: '위상 c', min: -3.14, max: 3.14, step: 0.05, value: 0 }
      ],
      f: function (x, p) { return p.a * Math.sin(p.b * x + p.c); }
    },
    circle: {
      name: '원',
      formula: 'x² + y² = r²',
      type: 'parametric',
      params: [
        { key: 'r', label: '반지름 r', min: 0.5, max: 6, step: 0.1, value: 3 }
      ],
      f: function (t, p) { return { x: p.r * Math.cos(t), y: p.r * Math.sin(t) }; },
      tRange: [0, Math.PI * 2]
    },
    ellipse: {
      name: '타원',
      formula: 'x²/a² + y²/b² = 1',
      type: 'parametric',
      params: [
        { key: 'a', label: '반지름 a', min: 0.5, max: 6, step: 0.1, value: 4 },
        { key: 'b', label: '반지름 b', min: 0.5, max: 6, step: 0.1, value: 2 }
      ],
      f: function (t, p) { return { x: p.a * Math.cos(t), y: p.b * Math.sin(t) }; },
      tRange: [0, Math.PI * 2]
    }
  };

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-cartesian-grapher');

    var state = {
      fnKey: 'quadratic',
      params: {},
      hover: null // {x,y} 데이터 좌표
    };

    // ─── 리드 ───
    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '함수를 고르고 슬라이더로 계수를 바꿔봐. 식이 변하는 순간 곡선도 함께 휜다 — 데카르트가 본 풍경: 도형은 방정식이고, 방정식은 도형이다.';
    container.appendChild(lead);

    // ─── 함수 선택 ───
    var controls = document.createElement('div');
    controls.className = 'sim-controls sim-cgr__topcontrols';

    var selWrap = document.createElement('label');
    selWrap.className = 'sim-cgr__sel-wrap';
    selWrap.innerHTML = '<span class="sim-cgr__sel-lbl">함수</span>';
    var sel = document.createElement('select');
    sel.className = 'sim-cgr__sel';
    Object.keys(FNS).forEach(function (k) {
      var opt = document.createElement('option');
      opt.value = k; opt.textContent = FNS[k].name;
      if (k === state.fnKey) opt.selected = true;
      sel.appendChild(opt);
    });
    selWrap.appendChild(sel);
    controls.appendChild(selWrap);

    var formula = document.createElement('span');
    formula.className = 'sim-cgr__formula';
    controls.appendChild(formula);

    container.appendChild(controls);

    // ─── 슬라이더 영역 ───
    var sliders = document.createElement('div');
    sliders.className = 'sim-cgr__sliders';
    container.appendChild(sliders);

    // ─── SVG 평면 ───
    var stageWrap = document.createElement('div');
    stageWrap.className = 'sim-cgr__stage-wrap';
    container.appendChild(stageWrap);

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'sim-cgr__stage');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '데카르트 좌표 평면');
    stageWrap.appendChild(svg);

    var coordOut = document.createElement('div');
    coordOut.className = 'sim-cgr__coord';
    coordOut.textContent = '곡선 위에 마우스를 올리면 (x, y) 좌표가 표시된다.';
    container.appendChild(coordOut);

    var note = document.createElement('p');
    note.className = 'sim-cgr__note';
    note.innerHTML = '곡선은 가로축을 따라 수백 점을 찍어 연결한 <em>샘플링 근사</em>다. 데카르트(1637) 〈기하학〉 이전, 기하 도형과 대수 방정식은 다른 학문이었다.';
    container.appendChild(note);

    // ─── 좌표계 설정 (데이터 ↔ 픽셀) ───
    var VIEW = 600; // SVG viewBox 정사각형 한 변
    var DATA_RANGE = 10; // -10 ~ +10
    function toSvgX(x) { return (x + DATA_RANGE) / (2 * DATA_RANGE) * VIEW; }
    function toSvgY(y) { return VIEW - (y + DATA_RANGE) / (2 * DATA_RANGE) * VIEW; }

    function rebuildSliders() {
      sliders.innerHTML = '';
      state.params = {};
      var fn = FNS[state.fnKey];
      formula.textContent = fn.formula;
      fn.params.forEach(function (pdef) {
        state.params[pdef.key] = pdef.value;
        var wrap = document.createElement('label');
        wrap.className = 'sim-cgr__slider';
        var lab = document.createElement('span');
        lab.className = 'sim-cgr__slider-lbl';
        lab.innerHTML = pdef.label + ' = <em class="sim-cgr__slider-val">' + pdef.value.toFixed(2) + '</em>';
        var input = document.createElement('input');
        input.type = 'range';
        input.min = String(pdef.min); input.max = String(pdef.max); input.step = String(pdef.step);
        input.value = String(pdef.value);
        input.className = 'sim-cgr__range';
        input.addEventListener('input', function () {
          state.params[pdef.key] = parseFloat(input.value);
          lab.querySelector('.sim-cgr__slider-val').textContent = state.params[pdef.key].toFixed(2);
          render();
        });
        wrap.appendChild(lab);
        wrap.appendChild(input);
        sliders.appendChild(wrap);
      });
    }

    sel.addEventListener('change', function () {
      state.fnKey = sel.value;
      rebuildSliders();
      render();
    });

    function buildAxes() {
      // 격자 + 축
      var g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', 'sim-cgr__axes-g');
      // 격자선
      for (var i = -DATA_RANGE; i <= DATA_RANGE; i++) {
        if (i === 0) continue;
        var lv = document.createElementNS(svgNS, 'line');
        lv.setAttribute('x1', String(toSvgX(i))); lv.setAttribute('x2', String(toSvgX(i)));
        lv.setAttribute('y1', '0'); lv.setAttribute('y2', String(VIEW));
        lv.setAttribute('class', 'sim-cgr__grid');
        g.appendChild(lv);
        var lh = document.createElementNS(svgNS, 'line');
        lh.setAttribute('y1', String(toSvgY(i))); lh.setAttribute('y2', String(toSvgY(i)));
        lh.setAttribute('x1', '0'); lh.setAttribute('x2', String(VIEW));
        lh.setAttribute('class', 'sim-cgr__grid');
        g.appendChild(lh);
      }
      // 축
      var xa = document.createElementNS(svgNS, 'line');
      xa.setAttribute('x1', '0'); xa.setAttribute('x2', String(VIEW));
      xa.setAttribute('y1', String(toSvgY(0))); xa.setAttribute('y2', String(toSvgY(0)));
      xa.setAttribute('class', 'sim-cgr__axis'); g.appendChild(xa);
      var ya = document.createElementNS(svgNS, 'line');
      ya.setAttribute('y1', '0'); ya.setAttribute('y2', String(VIEW));
      ya.setAttribute('x1', String(toSvgX(0))); ya.setAttribute('x2', String(toSvgX(0)));
      ya.setAttribute('class', 'sim-cgr__axis'); g.appendChild(ya);
      // 눈금 숫자
      for (var k = -DATA_RANGE; k <= DATA_RANGE; k += 2) {
        if (k === 0) continue;
        var tx = document.createElementNS(svgNS, 'text');
        tx.setAttribute('x', String(toSvgX(k))); tx.setAttribute('y', String(toSvgY(0) + 14));
        tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('class', 'sim-cgr__tick');
        tx.textContent = k; g.appendChild(tx);
        var ty = document.createElementNS(svgNS, 'text');
        ty.setAttribute('x', String(toSvgX(0) - 6)); ty.setAttribute('y', String(toSvgY(k) + 4));
        ty.setAttribute('text-anchor', 'end'); ty.setAttribute('class', 'sim-cgr__tick');
        ty.textContent = k; g.appendChild(ty);
      }
      // 축 라벨
      var xl = document.createElementNS(svgNS, 'text');
      xl.setAttribute('x', String(VIEW - 8)); xl.setAttribute('y', String(toSvgY(0) - 6));
      xl.setAttribute('text-anchor', 'end'); xl.setAttribute('class', 'sim-cgr__axlb');
      xl.textContent = 'x'; g.appendChild(xl);
      var yl = document.createElementNS(svgNS, 'text');
      yl.setAttribute('x', String(toSvgX(0) + 8)); yl.setAttribute('y', '14');
      yl.setAttribute('class', 'sim-cgr__axlb'); yl.textContent = 'y'; g.appendChild(yl);
      return g;
    }

    function buildCurve() {
      var fn = FNS[state.fnKey];
      var pts = [];
      if (fn.type === 'explicit') {
        var N = 600;
        for (var i = 0; i <= N; i++) {
          var x = -DATA_RANGE + (2 * DATA_RANGE) * i / N;
          var y = fn.f(x, state.params);
          if (isFinite(y)) pts.push({ x: x, y: y });
          else pts.push(null);
        }
      } else if (fn.type === 'parametric') {
        var Nt = 360;
        for (var j = 0; j <= Nt; j++) {
          var t = fn.tRange[0] + (fn.tRange[1] - fn.tRange[0]) * j / Nt;
          var p = fn.f(t, state.params);
          if (isFinite(p.x) && isFinite(p.y)) pts.push(p);
        }
      }
      // path 문자열 — 클리핑(범위 벗어남)도 끊어서 처리
      var d = '';
      var lastIn = false;
      for (var k = 0; k < pts.length; k++) {
        var pt = pts[k];
        if (!pt) { lastIn = false; continue; }
        // y가 너무 크면 끊어서 안 그림
        if (Math.abs(pt.y) > DATA_RANGE * 1.5 || Math.abs(pt.x) > DATA_RANGE * 1.5) { lastIn = false; continue; }
        var sx = toSvgX(pt.x), sy = toSvgY(pt.y);
        if (!lastIn) { d += 'M' + sx.toFixed(2) + ' ' + sy.toFixed(2); lastIn = true; }
        else { d += ' L' + sx.toFixed(2) + ' ' + sy.toFixed(2); }
      }
      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'sim-cgr__curve');
      return path;
    }

    function buildHoverDot() {
      if (!state.hover) return null;
      var c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', String(toSvgX(state.hover.x)));
      c.setAttribute('cy', String(toSvgY(state.hover.y)));
      c.setAttribute('r', '5');
      c.setAttribute('class', 'sim-cgr__dot');
      return c;
    }

    function render() {
      svg.setAttribute('viewBox', '0 0 ' + VIEW + ' ' + VIEW);
      svg.setAttribute('width', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      var bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', '0'); bg.setAttribute('y', '0');
      bg.setAttribute('width', String(VIEW)); bg.setAttribute('height', String(VIEW));
      bg.setAttribute('class', 'sim-cgr__bg');
      svg.appendChild(bg);

      svg.appendChild(buildAxes());
      svg.appendChild(buildCurve());
      var dot = buildHoverDot();
      if (dot) svg.appendChild(dot);
    }

    // ─── hover로 좌표 표시 ───
    function onMove(ev) {
      var rect = svg.getBoundingClientRect();
      var px = (ev.clientX - rect.left) / rect.width * VIEW;
      var py = (ev.clientY - rect.top) / rect.height * VIEW;
      // SVG → 데이터
      var dx = px / VIEW * (2 * DATA_RANGE) - DATA_RANGE;
      var fn = FNS[state.fnKey];
      var bestPt = null;
      if (fn.type === 'explicit') {
        var y = fn.f(dx, state.params);
        if (isFinite(y) && Math.abs(y) <= DATA_RANGE * 1.5) bestPt = { x: dx, y: y };
      } else {
        // 가장 가까운 t 검색
        var bestD = Infinity;
        var dy = -(py / VIEW * (2 * DATA_RANGE) - DATA_RANGE);
        var Nt = 200;
        for (var j = 0; j <= Nt; j++) {
          var t = fn.tRange[0] + (fn.tRange[1] - fn.tRange[0]) * j / Nt;
          var p = fn.f(t, state.params);
          var d2 = (p.x - dx) * (p.x - dx) + (p.y - dy) * (p.y - dy);
          if (d2 < bestD) { bestD = d2; bestPt = p; }
        }
      }
      if (bestPt) {
        state.hover = bestPt;
        coordOut.innerHTML = '곡선 위 점 ( <em>x</em> = ' + bestPt.x.toFixed(2) + ', <em>y</em> = ' + bestPt.y.toFixed(2) + ' )';
        render();
      }
    }
    function onLeave() { state.hover = null; coordOut.textContent = '곡선 위에 마우스를 올리면 (x, y) 좌표가 표시된다.'; render(); }
    svg.addEventListener('mousemove', onMove);
    svg.addEventListener('mouseleave', onLeave);
    svg.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) { onMove(e.touches[0]); e.preventDefault(); }
    }, { passive: false });
    svg.addEventListener('touchend', onLeave);

    rebuildSliders();
    render();

    // ─── 스타일 ───
    if (!document.getElementById('sim-cartesian-grapher-style')) {
      var style = document.createElement('style');
      style.id = 'sim-cartesian-grapher-style';
      style.textContent =
        '.sim-cartesian-grapher .sim-cgr__topcontrols{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:12px 0 8px;}' +
        '.sim-cartesian-grapher .sim-cgr__sel-wrap{display:flex;align-items:center;gap:8px;}' +
        '.sim-cartesian-grapher .sim-cgr__sel-lbl{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;}' +
        '.sim-cartesian-grapher .sim-cgr__sel{font-family:var(--serif-ko);font-size:14px;padding:5px 8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}' +
        '.sim-cartesian-grapher .sim-cgr__sel:focus{outline:none;border-color:var(--accent);}' +
        '.sim-cartesian-grapher .sim-cgr__formula{font-family:var(--serif-en);font-style:italic;font-size:14px;color:var(--accent);}' +
        '.sim-cartesian-grapher .sim-cgr__sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:10px 0 14px;}' +
        '.sim-cartesian-grapher .sim-cgr__slider{display:flex;flex-direction:column;gap:4px;}' +
        '.sim-cartesian-grapher .sim-cgr__slider-lbl{font-family:var(--sans-ko);font-size:12px;color:var(--ink-mute);}' +
        '.sim-cartesian-grapher .sim-cgr__slider-val{font-family:var(--serif-en);font-style:normal;font-weight:600;color:var(--accent);}' +
        '.sim-cartesian-grapher .sim-cgr__range{width:100%;}' +
        '.sim-cartesian-grapher .sim-cgr__stage-wrap{background:var(--paper-light);border:1px solid var(--rule-soft);padding:8px;}' +
        '.sim-cartesian-grapher .sim-cgr__stage{display:block;width:100%;max-width:560px;height:auto;margin:0 auto;cursor:crosshair;}' +
        '.sim-cartesian-grapher .sim-cgr__bg{fill:var(--paper);}' +
        '.sim-cartesian-grapher .sim-cgr__grid{stroke:var(--rule-soft);stroke-width:0.6;}' +
        '.sim-cartesian-grapher .sim-cgr__axis{stroke:var(--ink-mute);stroke-width:1.2;}' +
        '.sim-cartesian-grapher .sim-cgr__tick{font-family:var(--serif-en);font-size:10px;fill:var(--ink-mute);font-style:italic;}' +
        '.sim-cartesian-grapher .sim-cgr__axlb{font-family:var(--serif-en);font-size:14px;font-style:italic;fill:var(--ink-soft);}' +
        '.sim-cartesian-grapher .sim-cgr__curve{fill:none;stroke:var(--accent);stroke-width:2;}' +
        '.sim-cartesian-grapher .sim-cgr__dot{fill:var(--accent);stroke:var(--paper);stroke-width:1.5;}' +
        '.sim-cartesian-grapher .sim-cgr__coord{margin-top:10px;padding:8px 12px;background:var(--paper-light);border-left:3px solid var(--accent);font-family:var(--serif-en);font-size:13px;color:var(--ink);}' +
        '.sim-cartesian-grapher .sim-cgr__coord em{font-style:italic;color:var(--accent);font-weight:600;}' +
        '.sim-cartesian-grapher .sim-cgr__note{margin:12px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-cartesian-grapher .sim-cgr__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-cartesian-grapher .sim-cgr__sliders{grid-template-columns:1fr;}.sim-cartesian-grapher .sim-cgr__stage{max-width:100%;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="cartesian-grapher"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
