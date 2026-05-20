/* ============================================================
   Simulation: Faraday's law — electromagnetic induction
   (Michael Faraday, 1831, Royal Institution)
   Mounted on: data-sim-id="science.era.04-classical.sim.faraday-induction"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-faraday-induction');

    var state = {
      magnetX: 100,         // magnet x position (svg coords)
      vx: 0,                // velocity from last frame
      lastX: 100,
      lastTime: performance.now(),
      flippedPolarity: false
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var posLabel = document.createElement('label');
    posLabel.className = 'sim-range';
    posLabel.innerHTML = '<span>자석 위치 <em class="sim-val" id="far-pos">…</em></span>';
    var posInput = document.createElement('input');
    posInput.type = 'range';
    posInput.min = '40'; posInput.max = '360'; posInput.step = '1'; posInput.value = '100';
    posInput.addEventListener('input', function () {
      var now = performance.now();
      var dt = (now - state.lastTime) / 1000;
      var newX = parseFloat(posInput.value);
      state.vx = dt > 0 ? (newX - state.lastX) / dt : 0;
      state.lastX = newX;
      state.lastTime = now;
      state.magnetX = newX;
      render();
    });
    posInput.addEventListener('change', function () {
      // Reset velocity when stop dragging
      setTimeout(function () { state.vx = 0; render(); }, 200);
    });
    posLabel.appendChild(posInput);
    controls.appendChild(posLabel);

    var flipBtn = document.createElement('button');
    flipBtn.type = 'button';
    flipBtn.className = 'sim-btn';
    flipBtn.textContent = '극 뒤집기 N↔S';
    flipBtn.addEventListener('click', function () {
      state.flippedPolarity = !state.flippedPolarity;
      render();
    });
    controls.appendChild(flipBtn);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '자석을 코일 쪽으로 *움직이면* 전류가 생긴다. 멈추면 전류가 0. 반대로 빼면 반대 방향 전류. 자기 *변화*가 전기를 만든다. 슬라이더로 자석을 움직여보자.';
    container.appendChild(caption);

    var W = 480, H = 320;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '패러데이 전자기 유도 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Static: coil on the right
    var COIL_X = 350, COIL_Y = H / 2;
    var coilLines = document.createElementNS(svgNS, 'g');
    for (var i = -3; i <= 3; i++) {
      var ring = document.createElementNS(svgNS, 'ellipse');
      ring.setAttribute('cx', COIL_X + i * 6);
      ring.setAttribute('cy', COIL_Y);
      ring.setAttribute('rx', 8);
      ring.setAttribute('ry', 40);
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', '#a37e2c');
      ring.setAttribute('stroke-width', '2');
      coilLines.appendChild(ring);
    }
    svg.appendChild(coilLines);

    // Wires from coil to ammeter
    var wire1 = document.createElementNS(svgNS, 'path');
    wire1.setAttribute('d', 'M ' + (COIL_X + 18) + ' ' + (COIL_Y + 40) + ' L 420 250 L 420 290');
    wire1.setAttribute('fill', 'none');
    wire1.setAttribute('stroke', '#5a3a28');
    wire1.setAttribute('stroke-width', '1.4');
    svg.appendChild(wire1);
    var wire2 = document.createElementNS(svgNS, 'path');
    wire2.setAttribute('d', 'M ' + (COIL_X + 18) + ' ' + (COIL_Y - 40) + ' L 460 60 L 460 250 L 460 290');
    wire2.setAttribute('fill', 'none');
    wire2.setAttribute('stroke', '#5a3a28');
    wire2.setAttribute('stroke-width', '1.4');
    svg.appendChild(wire2);

    // Ammeter
    var ammG = document.createElementNS(svgNS, 'g');
    var ammCenter = { x: 440, y: 290 };
    var ammRect = document.createElementNS(svgNS, 'circle');
    ammRect.setAttribute('cx', ammCenter.x);
    ammRect.setAttribute('cy', ammCenter.y);
    ammRect.setAttribute('r', 20);
    ammRect.setAttribute('fill', '#faf6eb');
    ammRect.setAttribute('stroke', '#1f1a14');
    ammRect.setAttribute('stroke-width', '1');
    ammG.appendChild(ammRect);
    // Tick marks for scale
    for (var t = -1; t <= 1; t += 0.5) {
      var ang = -Math.PI / 2 + t * Math.PI / 3;
      var x1 = ammCenter.x + 16 * Math.cos(ang);
      var y1 = ammCenter.y + 16 * Math.sin(ang);
      var x2 = ammCenter.x + 19 * Math.cos(ang);
      var y2 = ammCenter.y + 19 * Math.sin(ang);
      var tk = document.createElementNS(svgNS, 'line');
      tk.setAttribute('x1', x1); tk.setAttribute('y1', y1);
      tk.setAttribute('x2', x2); tk.setAttribute('y2', y2);
      tk.setAttribute('stroke', '#1f1a14'); tk.setAttribute('stroke-width', '0.6');
      ammG.appendChild(tk);
    }
    var needle = document.createElementNS(svgNS, 'line');
    needle.setAttribute('x1', ammCenter.x);
    needle.setAttribute('y1', ammCenter.y);
    needle.setAttribute('stroke', '#7c2030');
    needle.setAttribute('stroke-width', '1.6');
    ammG.appendChild(needle);
    var ammLb = document.createElementNS(svgNS, 'text');
    ammLb.setAttribute('x', ammCenter.x); ammLb.setAttribute('y', ammCenter.y + 36);
    ammLb.setAttribute('class', 'sim-label');
    ammLb.setAttribute('text-anchor', 'middle');
    ammLb.setAttribute('font-weight', '600');
    ammLb.textContent = '전류계';
    ammG.appendChild(ammLb);
    svg.appendChild(ammG);

    // Coil label
    var coilLb = document.createElementNS(svgNS, 'text');
    coilLb.setAttribute('x', COIL_X); coilLb.setAttribute('y', H - 30);
    coilLb.setAttribute('class', 'sim-label');
    coilLb.setAttribute('text-anchor', 'middle');
    coilLb.setAttribute('font-weight', '600');
    coilLb.textContent = '코일';
    svg.appendChild(coilLb);

    // Dynamic group: magnet
    var dynamicGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicGroup);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>자석 속도 v = <em id="far-v">…</em> px/s</span>' +
      '<span>유도 전류 ∝ -dΦ/dt = <em id="far-i">…</em></span>';
    container.appendChild(readout);

    function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clearGroup(dynamicGroup);

      // Magnet (red N + blue S)
      var mw = 80, mh = 30;
      var mx = state.magnetX - mw / 2;
      var my = COIL_Y - mh / 2;
      // N half
      var nHalf = document.createElementNS(svgNS, 'rect');
      nHalf.setAttribute('x', state.flippedPolarity ? mx + mw / 2 : mx);
      nHalf.setAttribute('y', my);
      nHalf.setAttribute('width', mw / 2);
      nHalf.setAttribute('height', mh);
      nHalf.setAttribute('fill', '#7c2030');
      nHalf.setAttribute('stroke', '#1f1a14');
      nHalf.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(nHalf);
      // S half
      var sHalf = document.createElementNS(svgNS, 'rect');
      sHalf.setAttribute('x', state.flippedPolarity ? mx : mx + mw / 2);
      sHalf.setAttribute('y', my);
      sHalf.setAttribute('width', mw / 2);
      sHalf.setAttribute('height', mh);
      sHalf.setAttribute('fill', '#1b3a6b');
      sHalf.setAttribute('stroke', '#1f1a14');
      sHalf.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(sHalf);
      // Labels
      var nL = document.createElementNS(svgNS, 'text');
      nL.setAttribute('x', state.flippedPolarity ? mx + 3 * mw / 4 : mx + mw / 4);
      nL.setAttribute('y', my + mh / 2 + 5);
      nL.setAttribute('class', 'sim-label');
      nL.setAttribute('text-anchor', 'middle');
      nL.setAttribute('font-weight', '700');
      nL.setAttribute('fill', '#faf6eb');
      nL.textContent = 'N';
      dynamicGroup.appendChild(nL);
      var sL = document.createElementNS(svgNS, 'text');
      sL.setAttribute('x', state.flippedPolarity ? mx + mw / 4 : mx + 3 * mw / 4);
      sL.setAttribute('y', my + mh / 2 + 5);
      sL.setAttribute('class', 'sim-label');
      sL.setAttribute('text-anchor', 'middle');
      sL.setAttribute('font-weight', '700');
      sL.setAttribute('fill', '#faf6eb');
      sL.textContent = 'S';
      dynamicGroup.appendChild(sL);

      // Field lines from N pole (right side of magnet by default)
      var nPoleX = state.flippedPolarity ? mx + mw / 4 : mx + 3 * mw / 4;
      for (var fy = -16; fy <= 16; fy += 8) {
        var fline = document.createElementNS(svgNS, 'path');
        var ex = nPoleX + 40;
        fline.setAttribute('d',
          'M ' + nPoleX + ' ' + (COIL_Y + fy) +
          ' Q ' + (nPoleX + 20) + ' ' + COIL_Y + ' ' + ex + ' ' + (COIL_Y + fy * 0.7));
        fline.setAttribute('fill', 'none');
        fline.setAttribute('stroke', '#a37e2c');
        fline.setAttribute('stroke-width', '0.5');
        fline.setAttribute('opacity', '0.55');
        dynamicGroup.appendChild(fline);
      }

      // Compute induced current
      var dir = state.flippedPolarity ? -1 : 1;
      var current = -state.vx * dir / 80;       // arbitrary scale
      current = Math.max(-1, Math.min(1, current));

      // Needle deflection
      var ang = -Math.PI / 2 + current * Math.PI / 3;
      var nx = ammCenter.x + 16 * Math.cos(ang);
      var ny = ammCenter.y + 16 * Math.sin(ang);
      needle.setAttribute('x2', nx);
      needle.setAttribute('y2', ny);
      needle.setAttribute('stroke', current > 0 ? '#2d5a3f' : current < 0 ? '#7c2030' : '#6b6253');

      // Current arrows on wires (only if current ≠ 0)
      if (Math.abs(current) > 0.05) {
        var arrowDir = current > 0 ? 1 : -1;
        var arr = document.createElementNS(svgNS, 'text');
        arr.setAttribute('x', 420);
        arr.setAttribute('y', 200);
        arr.setAttribute('class', 'sim-label');
        arr.setAttribute('text-anchor', 'middle');
        arr.setAttribute('font-size', '14');
        arr.setAttribute('font-weight', '700');
        arr.setAttribute('fill', current > 0 ? '#2d5a3f' : '#7c2030');
        arr.textContent = arrowDir > 0 ? '↓' : '↑';
        dynamicGroup.appendChild(arr);
      }

      posLabel.querySelector('.sim-val').textContent = state.magnetX.toFixed(0);
      readout.querySelector('#far-v').textContent = state.vx.toFixed(0);
      readout.querySelector('#far-i').textContent =
        Math.abs(current) < 0.03 ? '0 (변화 없음)' :
        (current > 0 ? '+' + current.toFixed(2) : current.toFixed(2));
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.faraday-induction"]').forEach(init);
})();
