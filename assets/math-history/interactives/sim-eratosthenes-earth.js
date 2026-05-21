/* ============================================================
   Simulation: Eratosthenes — Earth's circumference from a shadow
   사이엔(스완)에서 우물 바닥에 햇빛이 닿는 한낮, 알렉산드리아에서는
   막대 그림자가 7.2° 기운다. 두 도시 거리(약 5,000 스타디아)와
   각도만으로 지구 둘레를 구한다 (BC ~240).
   Mounted on: <div class="sim" data-sim-id="eratosthenes-earth">
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';
  var STADION_KM = 0.16;   // 1 스타디온 ≈ 160 m (정의 불확실; 가장 흔히 인용되는 값)
  var REAL_CIRC_KM = 40075; // 적도 기준 실제 둘레

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-eratosthenes-earth');

    var state = {
      angleDeg: 7.2,
      distanceStadia: 5000
    };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '사이엔(오늘날 아스완)에서 한낮에 깊은 우물 바닥까지 햇빛이 닿는다 — 태양이 머리 바로 위에 있다는 뜻. 같은 시각 알렉산드리아에서는 막대가 7.2° 기운 그림자를 만든다. 두 도시 거리와 각도만으로 지구 둘레가 나온다.';
    container.appendChild(lead);

    // ─── 컨트롤 ───
    var controls = document.createElement('div');
    controls.className = 'sim-controls sim-eer__controls';

    var angLabel = document.createElement('label');
    angLabel.className = 'sim-range sim-eer__range';
    angLabel.innerHTML = '<span class="sim-eer__rlabel">그림자 각도 <em class="sim-eer__val" data-v="ang">7.2°</em></span>';
    var angInput = document.createElement('input');
    angInput.type = 'range';
    angInput.min = '3'; angInput.max = '15'; angInput.step = '0.1'; angInput.value = '7.2';
    angInput.addEventListener('input', function () {
      state.angleDeg = parseFloat(angInput.value);
      angLabel.querySelector('[data-v="ang"]').textContent = state.angleDeg.toFixed(1) + '°';
      render();
    });
    angLabel.appendChild(angInput);
    controls.appendChild(angLabel);

    var distLabel = document.createElement('label');
    distLabel.className = 'sim-range sim-eer__range';
    distLabel.innerHTML = '<span class="sim-eer__rlabel">두 도시 거리 <em class="sim-eer__val" data-v="dist">5,000 stadia</em></span>';
    var distInput = document.createElement('input');
    distInput.type = 'range';
    distInput.min = '3000'; distInput.max = '7000'; distInput.step = '100'; distInput.value = '5000';
    distInput.addEventListener('input', function () {
      state.distanceStadia = parseInt(distInput.value, 10);
      distLabel.querySelector('[data-v="dist"]').textContent = state.distanceStadia.toLocaleString() + ' stadia';
      render();
    });
    distLabel.appendChild(distInput);
    controls.appendChild(distLabel);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'sim-btn sim-eer__reset';
    resetBtn.textContent = '에라토스테네스 값으로';
    resetBtn.addEventListener('click', function () {
      state.angleDeg = 7.2;
      state.distanceStadia = 5000;
      angInput.value = '7.2';
      distInput.value = '5000';
      angLabel.querySelector('[data-v="ang"]').textContent = '7.2°';
      distLabel.querySelector('[data-v="dist"]').textContent = '5,000 stadia';
      render();
    });
    controls.appendChild(resetBtn);

    container.appendChild(controls);

    // ─── SVG 무대 ───
    var W = 480, H = 380;
    var CX = W / 2, CY = H / 2 + 40;
    var R = 110;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '에라토스테네스 지구 둘레 측정 시뮬레이션');
    svg.classList.add('sim-eer__stage');
    container.appendChild(svg);

    var earth = document.createElementNS(svgNS, 'circle');
    earth.setAttribute('cx', CX); earth.setAttribute('cy', CY);
    earth.setAttribute('r', R);
    earth.setAttribute('class', 'sim-eer__earth');
    svg.appendChild(earth);

    var centerDot = document.createElementNS(svgNS, 'circle');
    centerDot.setAttribute('cx', CX); centerDot.setAttribute('cy', CY);
    centerDot.setAttribute('r', 2);
    centerDot.setAttribute('class', 'sim-eer__center');
    svg.appendChild(centerDot);

    var dynamicG = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicG);

    // ─── 결과 출력 ───
    var readout = document.createElement('div');
    readout.className = 'sim-eer__readout';
    container.appendChild(readout);

    var note = document.createElement('p');
    note.className = 'sim-eer__note';
    note.innerHTML = '<strong>정직함 한 줄.</strong> 고대 그리스 "스타디온"의 정확한 길이는 학자마다 추정이 갈린다(약 157–185 m). 그림자 각도도 막대와 평면 위 측정의 정밀도 한계가 있다. 그럼에도 에라토스테네스의 결과는 현대 측정과 1–15% 안에 들어온다 — 도구 아닌 <em>아이디어</em>가 핵심이었다.';
    container.appendChild(note);

    function clearG(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clearG(dynamicG);

      var angRad = state.angleDeg * Math.PI / 180;
      // 사이엔: 원의 꼭대기 (각 -π/2 = 12시 방향)
      var syeneAngle = -Math.PI / 2;
      // 알렉산드리아: 사이엔에서 angRad만큼 시계 반대 (왼쪽 위)
      var alexAngle  = syeneAngle - angRad;

      var sx = CX + R * Math.cos(syeneAngle);
      var sy = CY + R * Math.sin(syeneAngle);
      var ax = CX + R * Math.cos(alexAngle);
      var ay = CY + R * Math.sin(alexAngle);

      // 햇빛 (수직 평행광)
      var rayLen = 100;
      var rayYTop = sy - rayLen - 14;
      var rayYBottom = sy + 6;
      for (var i = -2; i <= 2; i++) {
        var rx = CX + i * 28;
        var ray = document.createElementNS(svgNS, 'line');
        ray.setAttribute('x1', rx); ray.setAttribute('y1', rayYTop);
        ray.setAttribute('x2', rx); ray.setAttribute('y2', rayYBottom);
        ray.setAttribute('class', 'sim-eer__ray');
        dynamicG.appendChild(ray);
      }
      var sunText = document.createElementNS(svgNS, 'text');
      sunText.setAttribute('x', CX); sunText.setAttribute('y', rayYTop - 8);
      sunText.setAttribute('text-anchor', 'middle');
      sunText.setAttribute('class', 'sim-eer__sun');
      sunText.textContent = '☀ 한낮의 평행 햇빛';
      dynamicG.appendChild(sunText);

      // 사이엔 우물 (그림자 0 — 우물 바닥까지 햇빛이 닿음)
      var wellW = 8, wellH = 14;
      var wellOutDx = (sx - CX) / R, wellOutDy = (sy - CY) / R;
      var wellInX = sx - wellOutDx * wellH;
      var wellInY = sy - wellOutDy * wellH;
      var well = document.createElementNS(svgNS, 'rect');
      well.setAttribute('x', sx - wellW / 2);
      well.setAttribute('y', sy - wellH);
      well.setAttribute('width', wellW);
      well.setAttribute('height', wellH);
      well.setAttribute('class', 'sim-eer__well');
      dynamicG.appendChild(well);
      // 우물 안 햇빛 (수직)
      var wellRay = document.createElementNS(svgNS, 'line');
      wellRay.setAttribute('x1', sx); wellRay.setAttribute('y1', sy - wellH);
      wellRay.setAttribute('x2', sx); wellRay.setAttribute('y2', sy - 1);
      wellRay.setAttribute('class', 'sim-eer__well-ray');
      dynamicG.appendChild(wellRay);

      var syeneLb = document.createElementNS(svgNS, 'text');
      syeneLb.setAttribute('x', sx + 12); syeneLb.setAttribute('y', sy - wellH - 2);
      syeneLb.setAttribute('class', 'sim-eer__city');
      syeneLb.textContent = '사이엔 (그림자 0)';
      dynamicG.appendChild(syeneLb);

      // 알렉산드리아 막대 + 기운 그림자
      var stickLen = 22;
      var aOutDx = (ax - CX) / R, aOutDy = (ay - CY) / R;
      var aNx = ax + aOutDx * stickLen;
      var aNy = ay + aOutDy * stickLen;
      var alexStick = document.createElementNS(svgNS, 'line');
      alexStick.setAttribute('x1', ax); alexStick.setAttribute('y1', ay);
      alexStick.setAttribute('x2', aNx); alexStick.setAttribute('y2', aNy);
      alexStick.setAttribute('class', 'sim-eer__stick');
      dynamicG.appendChild(alexStick);

      // 그림자 = 막대 끝에서 햇빛(수직) 방향과 표면 접선 교점까지
      // 막대 길이 stickLen, 햇빛 수직 → 그림자 길이 = stickLen * tan(angRad), 방향은 알렉산드리아 지점의 접선 (시계 반대 방향이 사이엔 쪽)
      var tdx = -Math.sin(alexAngle), tdy = Math.cos(alexAngle);
      var shadowLen = stickLen * Math.tan(angRad);
      var shx = ax + tdx * shadowLen;
      var shy = ay + tdy * shadowLen;
      var shadow = document.createElementNS(svgNS, 'line');
      shadow.setAttribute('x1', ax); shadow.setAttribute('y1', ay);
      shadow.setAttribute('x2', shx); shadow.setAttribute('y2', shy);
      shadow.setAttribute('class', 'sim-eer__shadow');
      dynamicG.appendChild(shadow);

      var alexLb = document.createElementNS(svgNS, 'text');
      alexLb.setAttribute('x', aNx - 6); alexLb.setAttribute('y', aNy - 4);
      alexLb.setAttribute('text-anchor', 'end');
      alexLb.setAttribute('class', 'sim-eer__city');
      alexLb.textContent = '알렉산드리아 (' + state.angleDeg.toFixed(1) + '°)';
      dynamicG.appendChild(alexLb);

      // 호: 두 도시 사이 표면
      var arc = document.createElementNS(svgNS, 'path');
      arc.setAttribute('d', 'M ' + sx + ' ' + sy + ' A ' + R + ' ' + R + ' 0 0 0 ' + ax + ' ' + ay);
      arc.setAttribute('class', 'sim-eer__arc');
      dynamicG.appendChild(arc);

      // 호 중간점 라벨 (거리)
      var midAngle = (syeneAngle + alexAngle) / 2;
      var mlblR = R + 22;
      var mlx = CX + mlblR * Math.cos(midAngle);
      var mly = CY + mlblR * Math.sin(midAngle);
      var arcLb = document.createElementNS(svgNS, 'text');
      arcLb.setAttribute('x', mlx); arcLb.setAttribute('y', mly);
      arcLb.setAttribute('text-anchor', 'end');
      arcLb.setAttribute('class', 'sim-eer__arc-lb');
      arcLb.textContent = state.distanceStadia.toLocaleString() + ' stadia';
      dynamicG.appendChild(arcLb);

      // 중심에서 두 점까지 점선 (중심각 시각화)
      var lineS = document.createElementNS(svgNS, 'line');
      lineS.setAttribute('x1', CX); lineS.setAttribute('y1', CY);
      lineS.setAttribute('x2', sx); lineS.setAttribute('y2', sy);
      lineS.setAttribute('class', 'sim-eer__radius');
      dynamicG.appendChild(lineS);
      var lineA = document.createElementNS(svgNS, 'line');
      lineA.setAttribute('x1', CX); lineA.setAttribute('y1', CY);
      lineA.setAttribute('x2', ax); lineA.setAttribute('y2', ay);
      lineA.setAttribute('class', 'sim-eer__radius');
      dynamicG.appendChild(lineA);

      // 중심각 호 표시
      var angR = 30;
      var angStartX = CX + angR * Math.cos(syeneAngle);
      var angStartY = CY + angR * Math.sin(syeneAngle);
      var angEndX   = CX + angR * Math.cos(alexAngle);
      var angEndY   = CY + angR * Math.sin(alexAngle);
      var angArc = document.createElementNS(svgNS, 'path');
      angArc.setAttribute('d', 'M ' + angStartX + ' ' + angStartY + ' A ' + angR + ' ' + angR + ' 0 0 0 ' + angEndX + ' ' + angEndY);
      angArc.setAttribute('class', 'sim-eer__angarc');
      dynamicG.appendChild(angArc);
      var angLb = document.createElementNS(svgNS, 'text');
      var alblAngle = (syeneAngle + alexAngle) / 2;
      angLb.setAttribute('x', CX + (angR + 12) * Math.cos(alblAngle));
      angLb.setAttribute('y', CY + (angR + 12) * Math.sin(alblAngle));
      angLb.setAttribute('text-anchor', 'middle');
      angLb.setAttribute('class', 'sim-eer__angtext');
      angLb.textContent = state.angleDeg.toFixed(1) + '°';
      dynamicG.appendChild(angLb);

      // ─── 둘레 계산 ───
      // 둘레 = 거리 × (360 / 각도)
      var circStadia = state.distanceStadia * (360 / state.angleDeg);
      var circKm = circStadia * STADION_KM;
      var errPct = (circKm - REAL_CIRC_KM) / REAL_CIRC_KM * 100;
      var errClass = Math.abs(errPct) < 5 ? 'sim-eer__err--good' : (Math.abs(errPct) < 15 ? 'sim-eer__err--ok' : 'sim-eer__err--bad');

      readout.innerHTML =
        '<div class="sim-eer__formula">' +
        '  지구 둘레 = 거리 × <span class="sim-eer__frac">360° / 각도</span> = ' +
        '  ' + state.distanceStadia.toLocaleString() + ' × <span class="sim-eer__frac">360 / ' + state.angleDeg.toFixed(1) + '</span>' +
        '</div>' +
        '<div class="sim-eer__result-row">' +
        '  <span class="sim-eer__cell"><em>스타디아</em> ' + Math.round(circStadia).toLocaleString() + '</span>' +
        '  <span class="sim-eer__cell"><em>km 환산</em> ' + Math.round(circKm).toLocaleString() + ' km</span>' +
        '  <span class="sim-eer__cell"><em>실제값</em> 40,075 km</span>' +
        '</div>' +
        '<div class="sim-eer__err ' + errClass + '">오차 ' + (errPct >= 0 ? '+' : '') + errPct.toFixed(1) + '%</div>';
    }

    render();

    // ─── 스타일 (스코프 가드) ───
    if (!document.getElementById('sim-eratosthenes-earth-style')) {
      var style = document.createElement('style');
      style.id = 'sim-eratosthenes-earth-style';
      style.textContent =
        '.sim-eratosthenes-earth .sim-eer__controls{display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin:14px 0 6px;}' +
        '.sim-eratosthenes-earth .sim-eer__range{display:flex;flex-direction:column;gap:4px;flex:1 1 220px;min-width:0;}' +
        '.sim-eratosthenes-earth .sim-eer__rlabel{font-family:var(--sans-ko);font-size:12px;letter-spacing:0.04em;color:var(--ink-mute);}' +
        '.sim-eratosthenes-earth .sim-eer__val{font-family:var(--serif-en);font-style:normal;font-weight:600;color:var(--accent);margin-left:6px;}' +
        '.sim-eratosthenes-earth .sim-eer__range input[type=range]{width:100%;}' +
        '.sim-eratosthenes-earth .sim-eer__reset{flex:0 0 auto;}' +
        '.sim-eratosthenes-earth .sim-eer__stage{display:block;width:100%;max-width:560px;height:auto;margin:14px auto 0;background:var(--paper-light);border:1px solid var(--rule-soft);}' +
        '.sim-eratosthenes-earth .sim-eer__earth{fill:#e7e1cb;stroke:#a09078;stroke-width:0.8;}' +
        '.sim-eratosthenes-earth .sim-eer__center{fill:#6b6253;}' +
        '.sim-eratosthenes-earth .sim-eer__ray{stroke:#d49a2a;stroke-width:0.9;opacity:0.6;stroke-dasharray:3 3;}' +
        '.sim-eratosthenes-earth .sim-eer__sun{font-family:var(--sans-ko);font-size:11px;fill:#a37e2c;}' +
        '.sim-eratosthenes-earth .sim-eer__well{fill:#3a2f22;stroke:#1f1a14;stroke-width:0.8;}' +
        '.sim-eratosthenes-earth .sim-eer__well-ray{stroke:#d49a2a;stroke-width:1.2;opacity:0.85;}' +
        '.sim-eratosthenes-earth .sim-eer__city{font-family:var(--sans-ko);font-size:11px;fill:var(--ink);}' +
        '.sim-eratosthenes-earth .sim-eer__stick{stroke:#1f1a14;stroke-width:1.8;stroke-linecap:round;}' +
        '.sim-eratosthenes-earth .sim-eer__shadow{stroke:#6b6253;stroke-width:2.4;opacity:0.75;stroke-linecap:round;}' +
        '.sim-eratosthenes-earth .sim-eer__arc{fill:none;stroke:var(--accent);stroke-width:3;opacity:0.78;}' +
        '.sim-eratosthenes-earth .sim-eer__arc-lb{font-family:var(--serif-en);font-size:11px;font-style:italic;fill:var(--accent);}' +
        '.sim-eratosthenes-earth .sim-eer__radius{stroke:#a09078;stroke-width:0.6;stroke-dasharray:2 2;}' +
        '.sim-eratosthenes-earth .sim-eer__angarc{fill:none;stroke:var(--accent);stroke-width:1.2;}' +
        '.sim-eratosthenes-earth .sim-eer__angtext{font-family:var(--serif-en);font-size:11px;font-style:italic;fill:var(--accent);}' +
        '.sim-eratosthenes-earth .sim-eer__readout{margin-top:14px;padding:12px 14px;background:var(--paper-light);border-left:3px solid var(--accent);font-family:var(--serif-en);font-size:14px;color:var(--ink);line-height:1.7;}' +
        '.sim-eratosthenes-earth .sim-eer__formula{font-family:var(--serif-en);font-size:14px;color:var(--ink-soft);margin-bottom:6px;}' +
        '.sim-eratosthenes-earth .sim-eer__frac{font-style:italic;color:var(--accent);}' +
        '.sim-eratosthenes-earth .sim-eer__result-row{display:flex;gap:18px;flex-wrap:wrap;margin-top:4px;}' +
        '.sim-eratosthenes-earth .sim-eer__cell em{font-family:var(--serif-en);font-style:italic;color:var(--ink-mute);margin-right:6px;}' +
        '.sim-eratosthenes-earth .sim-eer__err{margin-top:6px;font-family:var(--sans-ko);font-size:12px;font-weight:600;}' +
        '.sim-eratosthenes-earth .sim-eer__err--good{color:#2a8a4a;}' +
        '.sim-eratosthenes-earth .sim-eer__err--ok{color:#a37e2c;}' +
        '.sim-eratosthenes-earth .sim-eer__err--bad{color:#b04848;}' +
        '.sim-eratosthenes-earth .sim-eer__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-eratosthenes-earth .sim-eer__note strong{font-style:normal;color:var(--ink-soft);}' +
        '.sim-eratosthenes-earth .sim-eer__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-eratosthenes-earth .sim-eer__controls{flex-direction:column;align-items:stretch;}.sim-eratosthenes-earth .sim-eer__result-row{gap:10px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="eratosthenes-earth"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
