/* ============================================================
   Simulation: Non-Euclidean geometry — triangle angle sum
   유클리드(평면)=180°, 구면>180°, 쌍곡(Poincaré 디스크)<180°.
   슬라이더로 삼각형 크기를 조절 → 곡률이 각의 합을 어떻게 바꾸는지.
   Mounted on: <div class="sim" data-sim-id="non-euclidean">
   ============================================================ */

(function () {
  'use strict';

  var W = 240, H = 220;

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-non-euclidean');

    var state = { mode: 'plane', size: 0.5 }; // size: 0~1

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '"삼각형 내각의 합은 180°" — 유클리드의 다섯 번째 공준에 의존하는 결과다. 그 공준을 풀어주면 다른 기하가 열린다. 슬라이더로 삼각형을 키워 보자.';
    container.appendChild(lead);

    var tabs = document.createElement('div');
    tabs.className = 'sim-ne__tabs';
    var modes = [
      { id: 'plane',      label: '평면 (Euclidean)',         curv: '곡률 0' },
      { id: 'sphere',     label: '구면 (Spherical)',         curv: '양의 곡률' },
      { id: 'hyperbolic', label: '쌍곡 (Hyperbolic)',        curv: '음의 곡률' }
    ];
    modes.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sim-ne__tab'; b.dataset.mode = m.id;
      b.innerHTML = '<span class="sim-ne__tab-label">' + m.label + '</span><span class="sim-ne__tab-curv">' + m.curv + '</span>';
      b.addEventListener('click', function () { state.mode = m.id; render(); });
      tabs.appendChild(b);
    });
    container.appendChild(tabs);

    var stage = document.createElement('div');
    stage.className = 'sim-ne__stage';
    container.appendChild(stage);

    var sliderRow = document.createElement('div');
    sliderRow.className = 'sim-ne__slider-row';
    sliderRow.innerHTML =
      '<label for="sim-ne-size" class="sim-ne__slider-label">삼각형 크기</label>' +
      '<input type="range" id="sim-ne-size" min="0" max="100" value="50" class="sim-ne__slider" />' +
      '<span class="sim-ne__size-val">50%</span>';
    container.appendChild(sliderRow);
    var slider = sliderRow.querySelector('.sim-ne__slider');
    var sizeVal = sliderRow.querySelector('.sim-ne__size-val');
    slider.addEventListener('input', function () {
      state.size = parseInt(slider.value, 10) / 100;
      sizeVal.textContent = slider.value + '%';
      render();
    });

    var info = document.createElement('div');
    info.className = 'sim-ne__info';
    container.appendChild(info);

    var note = document.createElement('p');
    note.className = 'sim-ne__note';
    note.innerHTML = '주의: 위 그림은 <em>모델</em>이다 — 구면은 평면에 정사영, 쌍곡은 Poincaré 디스크로 표현. 디스크 모델에서는 경계로 갈수록 길이가 "무한히" 늘어난다 (사람 눈엔 작아 보여도 진짜 길이는 크다). 실제 비유클리드 공간의 성질을 한 그림이 다 보여줄 수는 없다.';
    container.appendChild(note);

    function render() {
      // tab 활성화
      var tabEls = tabs.querySelectorAll('.sim-ne__tab');
      tabEls.forEach(function (t) { t.classList.toggle('sim-ne__tab--active', t.dataset.mode === state.mode); });

      stage.innerHTML = '';
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('class', 'sim-ne__svg');

      var angles; // [A, B, C] in degrees

      if (state.mode === 'plane') {
        // 정삼각형 (모든 내각 60°). 크기만 변함.
        var cx = W / 2, cy = H / 2;
        var r = 30 + state.size * 60;
        // 정삼각형 (위쪽 꼭짓점)
        var A = [cx, cy - r];
        var B = [cx - r * Math.sin(Math.PI / 3), cy + r * Math.cos(Math.PI / 3)];
        var C = [cx + r * Math.sin(Math.PI / 3), cy + r * Math.cos(Math.PI / 3)];
        angles = [60, 60, 60]; // 합 = 180
        drawGrid(svg, 'plane');
        drawTri(svg, A, B, C);
        drawAngleLabels(svg, A, B, C, angles);
      } else if (state.mode === 'sphere') {
        // 구의 정사영. 큰 원과, 위에 그려진 "구면 삼각형" (자오선/위도 두 점)
        var cxs = W / 2, cys = H / 2;
        var rs = 90;
        // 구 윤곽
        var sphere = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sphere.setAttribute('cx', cxs); sphere.setAttribute('cy', cys); sphere.setAttribute('r', rs);
        sphere.setAttribute('class', 'sim-ne__sphere'); svg.appendChild(sphere);
        // 위도/경도선 (예시)
        for (var i = -2; i <= 2; i++) {
          var ry = rs * Math.abs(Math.cos(i * Math.PI / 6));
          if (ry < 1) continue;
          var lat = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          lat.setAttribute('cx', cxs); lat.setAttribute('cy', cys + rs * Math.sin(i * Math.PI / 6));
          lat.setAttribute('rx', rs * Math.cos(i * Math.PI / 6)); lat.setAttribute('ry', ry * 0.15);
          lat.setAttribute('class', 'sim-ne__grid'); svg.appendChild(lat);
        }
        // 삼각형: 북극 + 적도 위 두 점 (경도 차)
        // size 0~1을 경도차 θ (5°~90°)로 매핑 → 각 합 (185°~270°)
        var thetaDeg = 5 + state.size * 85;
        var theta = thetaDeg * Math.PI / 180;
        // 북극 (정사영: 위쪽)
        var Ap = [cxs, cys - rs];
        // 적도 두 점 — 정사영으로 x = rs*sin(경도)
        var Bp = [cxs - rs * Math.sin(theta / 2), cys];
        var Cp = [cxs + rs * Math.sin(theta / 2), cys];
        // 호로 그리기 (대원 호) — 시각적 단순화: 호의 곡선 (q-bezier로 어림)
        drawSphericalTri(svg, Ap, Bp, Cp, cxs, cys, rs);
        // 각: 북극에서의 각 = 두 자오선 사이 각 = thetaDeg, 적도 두 꼭짓점은 자오선과 적도가 만나므로 각 90°
        angles = [thetaDeg, 90, 90];
        drawAngleLabels(svg, Ap, Bp, Cp, angles);
      } else if (state.mode === 'hyperbolic') {
        // Poincaré 디스크. 삼각형 변은 디스크 경계와 직교하는 원호.
        var cxd = W / 2, cyd = H / 2;
        var rd = 90;
        var disc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        disc.setAttribute('cx', cxd); disc.setAttribute('cy', cyd); disc.setAttribute('r', rd);
        disc.setAttribute('class', 'sim-ne__disk'); svg.appendChild(disc);
        // 삼각형: 디스크 중심 근처 정삼각형. size가 커지면 꼭짓점이 경계로 다가가고, 변(원호)의 휨이 강해진다.
        var rho = 0.2 + state.size * 0.72; // 0.2~0.92 (경계 근처까지)
        var Ah = [cxd, cyd - rd * rho];
        var Bh = [cxd - rd * rho * Math.sin(Math.PI / 3), cyd + rd * rho * Math.cos(Math.PI / 3)];
        var Ch = [cxd + rd * rho * Math.sin(Math.PI / 3), cyd + rd * rho * Math.cos(Math.PI / 3)];
        // 각 변을 디스크 경계와 직교하는 원호로 그림 (단순 근사: 휨 정도는 size에 비례)
        drawHyperTri(svg, Ah, Bh, Ch, cxd, cyd, rd, state.size);
        // 각 합: rho에 따라 60°*3 = 180°에서 작아지다 0 근방으로. 근사식.
        // 정확값 대신, 시각 일관성을 위해 0~1 매핑.
        var sumDeg = 180 - 175 * state.size; // size=0 → 180, size=1 → 5
        // 정삼각형이므로 세 각이 같다.
        var each = sumDeg / 3;
        angles = [each, each, each];
        drawAngleLabels(svg, Ah, Bh, Ch, angles);
      }

      stage.appendChild(svg);

      var sum = angles[0] + angles[1] + angles[2];
      var sumLabel = sum > 180.5 ? '> 180°' : sum < 179.5 ? '< 180°' : '= 180°';
      var sumCls = sum > 180.5 ? 'sim-ne__sum--gt' : sum < 179.5 ? 'sim-ne__sum--lt' : 'sim-ne__sum--eq';
      info.innerHTML =
        '<div class="sim-ne__angles">' +
        '  <span><em>α</em> = ' + angles[0].toFixed(1) + '°</span>' +
        '  <span><em>β</em> = ' + angles[1].toFixed(1) + '°</span>' +
        '  <span><em>γ</em> = ' + angles[2].toFixed(1) + '°</span>' +
        '</div>' +
        '<div class="sim-ne__sum ' + sumCls + '">합 = <strong>' + sum.toFixed(1) + '°</strong> &nbsp; (' + sumLabel + ')</div>' +
        '<div class="sim-ne__hint">' + hintText() + '</div>';
    }

    function hintText() {
      if (state.mode === 'plane') return '평면 정삼각형: 각 = 60°, 합 = 180°. 크기를 바꿔도 합은 그대로다.';
      if (state.mode === 'sphere') return '구면 삼각형은 항상 합 > 180°. 작은 삼각형은 180°에 가깝고, 커질수록 (예: 한 점이 북극, 다른 두 점이 적도) 합이 270°까지 갈 수 있다.';
      return 'Poincaré 디스크 모델: 변은 경계와 직교하는 원호. 정삼각형이 커질수록 (꼭짓점이 경계로 갈수록) 변이 더 휘고 내각이 좁아진다. 합은 항상 < 180°.';
    }

    function drawGrid(svg, kind) {
      // 평면에서만 옅은 격자
      for (var x = 0; x <= W; x += 20) {
        var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', x); ln.setAttribute('y1', 0); ln.setAttribute('x2', x); ln.setAttribute('y2', H);
        ln.setAttribute('class', 'sim-ne__grid'); svg.appendChild(ln);
      }
      for (var y = 0; y <= H; y += 20) {
        var ln2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln2.setAttribute('x1', 0); ln2.setAttribute('y1', y); ln2.setAttribute('x2', W); ln2.setAttribute('y2', y);
        ln2.setAttribute('class', 'sim-ne__grid'); svg.appendChild(ln2);
      }
    }

    function drawTri(svg, A, B, C) {
      var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', A.join(',') + ' ' + B.join(',') + ' ' + C.join(','));
      poly.setAttribute('class', 'sim-ne__tri'); svg.appendChild(poly);
    }

    function drawSphericalTri(svg, A, B, C, cx, cy, r) {
      // 자오선 두 개: A(북극) → B, A → C. 시각적으론 직선 (정사영에서 자오선은 직선처럼 보임)
      addLine(svg, A, B);
      addLine(svg, A, C);
      // 적도(B → C)는 가로 직선
      addLine(svg, B, C);
      // 약간의 채움 (옅게)
      var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', A.join(',') + ' ' + B.join(',') + ' ' + C.join(','));
      poly.setAttribute('class', 'sim-ne__tri sim-ne__tri--sphere'); svg.appendChild(poly);
    }

    function addLine(svg, P, Q) {
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', P[0]); l.setAttribute('y1', P[1]);
      l.setAttribute('x2', Q[0]); l.setAttribute('y2', Q[1]);
      l.setAttribute('class', 'sim-ne__edge'); svg.appendChild(l);
    }

    function drawHyperTri(svg, A, B, C, cx, cy, rd, sz) {
      // 각 변을 원호로: 변의 중점에서 디스크 중심 쪽으로 휘게 한다 (안쪽으로 오목)
      // 단순화: quadratic Bezier로 안쪽 휨
      function arc(P, Q) {
        var mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2;
        // 중심 방향 벡터
        var dx = cx - mx, dy = cy - my;
        var dlen = Math.sqrt(dx * dx + dy * dy) || 1;
        var bend = 8 + sz * 40;
        var ctrlX = mx + (dx / dlen) * bend;
        var ctrlY = my + (dy / dlen) * bend;
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M ' + P[0] + ' ' + P[1] + ' Q ' + ctrlX + ' ' + ctrlY + ' ' + Q[0] + ' ' + Q[1]);
        path.setAttribute('class', 'sim-ne__edge'); path.setAttribute('fill', 'none');
        svg.appendChild(path);
      }
      arc(A, B); arc(B, C); arc(C, A);
      // 옅은 채움
      var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', A.join(',') + ' ' + B.join(',') + ' ' + C.join(','));
      poly.setAttribute('class', 'sim-ne__tri sim-ne__tri--hyper'); svg.appendChild(poly);
    }

    function drawAngleLabels(svg, A, B, C, ang) {
      var pts = [A, B, C], lbls = ['α', 'β', 'γ'];
      for (var i = 0; i < 3; i++) {
        var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', pts[i][0]);
        t.setAttribute('y', pts[i][1] - 6);
        t.setAttribute('class', 'sim-ne__lbl');
        t.setAttribute('text-anchor', 'middle');
        t.textContent = lbls[i];
        svg.appendChild(t);
      }
    }

    render();

    if (!document.getElementById('sim-non-euclidean-style')) {
      var style = document.createElement('style');
      style.id = 'sim-non-euclidean-style';
      style.textContent =
        '.sim-non-euclidean .sim-ne__tabs{display:flex;gap:6px;margin:14px 0 10px;flex-wrap:wrap;}' +
        '.sim-non-euclidean .sim-ne__tab{flex:1 1 120px;padding:8px 10px;border:1px solid var(--rule);background:var(--paper);cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:2px;font-family:var(--sans-ko);transition:all 0.18s;}' +
        '.sim-non-euclidean .sim-ne__tab:hover{border-color:var(--accent);}' +
        '.sim-non-euclidean .sim-ne__tab--active{background:var(--accent);border-color:var(--accent);color:var(--paper);}' +
        '.sim-non-euclidean .sim-ne__tab--active .sim-ne__tab-curv{color:var(--paper);opacity:0.85;}' +
        '.sim-non-euclidean .sim-ne__tab-label{font-size:13px;font-weight:600;color:var(--ink);}' +
        '.sim-non-euclidean .sim-ne__tab--active .sim-ne__tab-label{color:var(--paper);}' +
        '.sim-non-euclidean .sim-ne__tab-curv{font-size:11px;color:var(--ink-mute);letter-spacing:0.04em;}' +
        '.sim-non-euclidean .sim-ne__stage{margin:0 0 10px;background:var(--paper-light);border:1px solid var(--rule-soft);padding:10px;display:flex;justify-content:center;}' +
        '.sim-non-euclidean .sim-ne__svg{width:100%;max-width:340px;height:auto;display:block;}' +
        '.sim-non-euclidean .sim-ne__grid{stroke:var(--rule-soft);stroke-width:0.5;fill:none;opacity:0.55;}' +
        '.sim-non-euclidean .sim-ne__sphere{fill:#eef2f7;stroke:#5a7090;stroke-width:1.2;}' +
        '.sim-non-euclidean .sim-ne__disk{fill:#eef2f7;stroke:#5a7090;stroke-width:1.2;}' +
        '.sim-non-euclidean .sim-ne__tri{fill:rgba(176,72,72,0.15);stroke:#b04848;stroke-width:1.5;}' +
        '.sim-non-euclidean .sim-ne__tri--sphere{fill:rgba(176,72,72,0.18);stroke:none;}' +
        '.sim-non-euclidean .sim-ne__tri--hyper{fill:rgba(176,72,72,0.12);stroke:none;}' +
        '.sim-non-euclidean .sim-ne__edge{stroke:#b04848;stroke-width:1.6;fill:none;}' +
        '.sim-non-euclidean .sim-ne__lbl{font-family:var(--serif-en);font-style:italic;font-size:13px;fill:var(--ink);}' +
        '.sim-non-euclidean .sim-ne__slider-row{display:flex;align-items:center;gap:10px;margin:10px 0;flex-wrap:wrap;}' +
        '.sim-non-euclidean .sim-ne__slider-label{font-family:var(--sans-ko);font-size:12px;color:var(--ink-soft);letter-spacing:0.04em;}' +
        '.sim-non-euclidean .sim-ne__slider{flex:1 1 160px;min-width:120px;}' +
        '.sim-non-euclidean .sim-ne__size-val{font-family:var(--mono);font-size:12px;color:var(--accent);width:40px;text-align:right;}' +
        '.sim-non-euclidean .sim-ne__info{margin-top:8px;font-family:var(--sans-ko);font-size:13px;color:var(--ink-soft);}' +
        '.sim-non-euclidean .sim-ne__angles{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:6px;}' +
        '.sim-non-euclidean .sim-ne__angles em{font-family:var(--serif-en);font-style:italic;color:var(--accent);margin-right:3px;}' +
        '.sim-non-euclidean .sim-ne__sum{padding:6px 10px;border:1px dashed var(--rule);display:inline-block;background:var(--paper);}' +
        '.sim-non-euclidean .sim-ne__sum strong{font-family:var(--mono);color:var(--ink);}' +
        '.sim-non-euclidean .sim-ne__sum--eq{border-color:var(--accent);}' +
        '.sim-non-euclidean .sim-ne__sum--gt{border-color:#b04848;color:#7a2a2a;}' +
        '.sim-non-euclidean .sim-ne__sum--lt{border-color:#5a7090;color:#2a3a55;}' +
        '.sim-non-euclidean .sim-ne__hint{margin-top:8px;font-size:12.5px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-non-euclidean .sim-ne__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-non-euclidean .sim-ne__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-non-euclidean .sim-ne__tab{flex:1 1 100%;}.sim-non-euclidean .sim-ne__tab-label{font-size:12.5px;}.sim-non-euclidean .sim-ne__svg{max-width:280px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="non-euclidean"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
