/* ============================================================
   Simulation: Eratosthenes' measurement of Earth's circumference
   (BC ~240, Alexandria)
   Mounted on: data-sim-id="science.era.01-ancient.sim.eratosthenes"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-eratosthenes');

    var state = {
      angleDeg: 7.2,        // measured shadow angle in Alexandria (real: 7.2°)
      distanceStadia: 5000  // distance Syene→Alexandria (real: 5000 stadia ≈ 800 km)
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var angLabel = document.createElement('label');
    angLabel.className = 'sim-range';
    angLabel.innerHTML = '<span>그림자 각도 <em class="sim-val" id="erat-ang">7.2°</em></span>';
    var angInput = document.createElement('input');
    angInput.type = 'range';
    angInput.min = '3'; angInput.max = '15'; angInput.step = '0.1'; angInput.value = '7.2';
    angInput.addEventListener('input', function () {
      state.angleDeg = parseFloat(angInput.value);
      angLabel.querySelector('.sim-val').textContent = state.angleDeg.toFixed(1) + '°';
      render();
    });
    angLabel.appendChild(angInput);
    controls.appendChild(angLabel);

    var distLabel = document.createElement('label');
    distLabel.className = 'sim-range';
    distLabel.innerHTML = '<span>두 도시 거리 <em class="sim-val" id="erat-dist">5000 stadia</em></span>';
    var distInput = document.createElement('input');
    distInput.type = 'range';
    distInput.min = '3000'; distInput.max = '7000'; distInput.step = '100'; distInput.value = '5000';
    distInput.addEventListener('input', function () {
      state.distanceStadia = parseInt(distInput.value, 10);
      distLabel.querySelector('.sim-val').textContent = state.distanceStadia + ' stadia';
      render();
    });
    distLabel.appendChild(distInput);
    controls.appendChild(distLabel);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '한 도시에서 정오에 막대 그림자가 없을 때, 다른 도시에서는 그림자가 생긴다. 그림자 각도와 두 도시 거리만 알면 — 지구가 둥글다는 가정 위에 — 둘레를 계산할 수 있다.';
    container.appendChild(caption);

    var W = 480, H = 360;
    var CX = W / 2, CY = H / 2 + 30;
    var R = 110;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '에라토스테네스 지구 둘레 측정 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Earth circle
    var earth = document.createElementNS(svgNS, 'circle');
    earth.setAttribute('cx', CX); earth.setAttribute('cy', CY);
    earth.setAttribute('r', R);
    earth.setAttribute('fill', '#e7e1cb');
    earth.setAttribute('stroke', '#a09078');
    earth.setAttribute('stroke-width', '0.8');
    svg.appendChild(earth);

    // Center of Earth marker
    var centerDot = document.createElementNS(svgNS, 'circle');
    centerDot.setAttribute('cx', CX); centerDot.setAttribute('cy', CY);
    centerDot.setAttribute('r', 2); centerDot.setAttribute('fill', '#6b6253');
    svg.appendChild(centerDot);

    // Two locations & sun rays
    var dynamicGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicGroup);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>지구 둘레 = <em id="erat-circ">…</em> stadia ≈ <em id="erat-km">…</em> km</span>' +
      '<span>실제값 ≈ <em>40,075 km</em></span>';
    container.appendChild(readout);

    function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clearGroup(dynamicGroup);

      var angRad = state.angleDeg * Math.PI / 180;
      // Place Syene (사이엔, 정오에 그림자 없음) at top of Earth (angle -PI/2 from center)
      // Place Alexandria offset by angRad along the surface
      var syeneAngle = -Math.PI / 2;
      var alexAngle  = syeneAngle - angRad;
      var sx = CX + R * Math.cos(syeneAngle);
      var sy = CY + R * Math.sin(syeneAngle);
      var ax = CX + R * Math.cos(alexAngle);
      var ay = CY + R * Math.sin(alexAngle);

      // Sun rays from far above (parallel)
      var rayLen = 80;
      // Sun direction: straight down for Syene (rays vertical)
      var sunDx = 0, sunDy = 1;

      for (var i = -3; i <= 3; i++) {
        var rx = CX + i * 40;
        var ry1 = sy - rayLen - 10;
        var ry2 = sy + 10;
        if (i === -3 || i === 3) continue;
        var ray = document.createElementNS(svgNS, 'line');
        ray.setAttribute('x1', rx); ray.setAttribute('y1', ry1);
        ray.setAttribute('x2', rx); ray.setAttribute('y2', ry2);
        ray.setAttribute('stroke', '#d49a2a'); ray.setAttribute('stroke-width', '0.9');
        ray.setAttribute('opacity', '0.55');
        ray.setAttribute('stroke-dasharray', '3 3');
        dynamicGroup.appendChild(ray);
      }

      // Sun label
      var sunText = document.createElementNS(svgNS, 'text');
      sunText.setAttribute('x', CX); sunText.setAttribute('y', sy - rayLen - 18);
      sunText.setAttribute('class', 'sim-label');
      sunText.setAttribute('text-anchor', 'middle');
      sunText.setAttribute('fill', '#a37e2c');
      sunText.textContent = '☀ 태양 (정오, 평행광)';
      dynamicGroup.appendChild(sunText);

      // Syene stick (no shadow)
      var stickLen = 22;
      var syeneStick = document.createElementNS(svgNS, 'line');
      var sNx = sx + (sx - CX) / R * stickLen;
      var sNy = sy + (sy - CY) / R * stickLen;
      syeneStick.setAttribute('x1', sx); syeneStick.setAttribute('y1', sy);
      syeneStick.setAttribute('x2', sNx); syeneStick.setAttribute('y2', sNy);
      syeneStick.setAttribute('stroke', '#1f1a14'); syeneStick.setAttribute('stroke-width', '1.6');
      dynamicGroup.appendChild(syeneStick);

      var syeneLb = document.createElementNS(svgNS, 'text');
      syeneLb.setAttribute('x', sNx); syeneLb.setAttribute('y', sNy - 6);
      syeneLb.setAttribute('class', 'sim-label');
      syeneLb.setAttribute('text-anchor', 'middle');
      syeneLb.setAttribute('fill', '#1f1a14');
      syeneLb.textContent = '사이엔 (그림자 0)';
      dynamicGroup.appendChild(syeneLb);

      // Alexandria stick with shadow
      var aNx = ax + (ax - CX) / R * stickLen;
      var aNy = ay + (ay - CY) / R * stickLen;
      var alexStick = document.createElementNS(svgNS, 'line');
      alexStick.setAttribute('x1', ax); alexStick.setAttribute('y1', ay);
      alexStick.setAttribute('x2', aNx); alexStick.setAttribute('y2', aNy);
      alexStick.setAttribute('stroke', '#1f1a14'); alexStick.setAttribute('stroke-width', '1.6');
      dynamicGroup.appendChild(alexStick);

      // Shadow: sun rays vertical, stick tilted. Shadow projects on tangent.
      // Tangent direction at alex point
      var tdx = -Math.sin(alexAngle), tdy = Math.cos(alexAngle);
      var shadowLen = stickLen * Math.tan(angRad);
      // Shadow falls toward Syene side (positive tangent direction toward Syene)
      // Determine sign: tangent toward Syene goes counter-clockwise? alexAngle > syeneAngle? alex=syene-ang, so syene is at larger angle counter-clockwise.
      // tangent (-sin, cos) at alex points counter-clockwise tangent. Sun comes from above (positive y down means rays go +y). Shadow opposite to tilt.
      var shx = ax + tdx * shadowLen;
      var shy = ay + tdy * shadowLen;
      var shadow = document.createElementNS(svgNS, 'line');
      shadow.setAttribute('x1', ax); shadow.setAttribute('y1', ay);
      shadow.setAttribute('x2', shx); shadow.setAttribute('y2', shy);
      shadow.setAttribute('stroke', '#6b6253'); shadow.setAttribute('stroke-width', '2.2');
      shadow.setAttribute('opacity', '0.7');
      dynamicGroup.appendChild(shadow);

      var alexLb = document.createElementNS(svgNS, 'text');
      alexLb.setAttribute('x', aNx + 14); alexLb.setAttribute('y', aNy + 4);
      alexLb.setAttribute('class', 'sim-label');
      alexLb.setAttribute('fill', '#1f1a14');
      alexLb.textContent = '알렉산드리아 (그림자 ' + state.angleDeg.toFixed(1) + '°)';
      dynamicGroup.appendChild(alexLb);

      // Arc from Syene to Alexandria along surface
      var arc = document.createElementNS(svgNS, 'path');
      var largeArc = 0;
      arc.setAttribute('d', 'M ' + sx + ' ' + sy + ' A ' + R + ' ' + R + ' 0 ' + largeArc + ' 0 ' + ax + ' ' + ay);
      arc.setAttribute('fill', 'none');
      arc.setAttribute('stroke', '#2a5680');
      arc.setAttribute('stroke-width', '3');
      arc.setAttribute('opacity', '0.7');
      dynamicGroup.appendChild(arc);

      // Center angle visualization
      var lineS = document.createElementNS(svgNS, 'line');
      lineS.setAttribute('x1', CX); lineS.setAttribute('y1', CY);
      lineS.setAttribute('x2', sx); lineS.setAttribute('y2', sy);
      lineS.setAttribute('stroke', '#a09078'); lineS.setAttribute('stroke-width', '0.6');
      lineS.setAttribute('stroke-dasharray', '2 2');
      dynamicGroup.appendChild(lineS);
      var lineA = document.createElementNS(svgNS, 'line');
      lineA.setAttribute('x1', CX); lineA.setAttribute('y1', CY);
      lineA.setAttribute('x2', ax); lineA.setAttribute('y2', ay);
      lineA.setAttribute('stroke', '#a09078'); lineA.setAttribute('stroke-width', '0.6');
      lineA.setAttribute('stroke-dasharray', '2 2');
      dynamicGroup.appendChild(lineA);

      // Compute circumference
      var circStadia = state.distanceStadia * (360 / state.angleDeg);
      var circKm = circStadia * 0.16;  // 1 stadion ≈ 160 m
      readout.querySelector('#erat-circ').textContent = Math.round(circStadia).toLocaleString();
      readout.querySelector('#erat-km').textContent = Math.round(circKm).toLocaleString();
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.eratosthenes"]').forEach(init);
})();
