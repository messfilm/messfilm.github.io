/* ============================================================
   Simulation: Kepler's Second Law (equal areas in equal times)
   Mounted on: <div class="sim" data-sim-id="science.era.03-revolution.sim.kepler">
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-kepler');

    var state = {
      e: 0.6,         // eccentricity 0..0.85
      running: true,
      speed: 1.0,
      M: 0            // mean anomaly
    };

    // ===== Controls =====
    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'sim-btn';
    playBtn.textContent = '⏸ 멈춤';
    playBtn.addEventListener('click', function () {
      state.running = !state.running;
      playBtn.textContent = state.running ? '⏸ 멈춤' : '▶ 재생';
    });
    controls.appendChild(playBtn);

    var eccLabel = document.createElement('label');
    eccLabel.className = 'sim-range';
    eccLabel.innerHTML = '<span>이심률 <em class="sim-val" id="kep-e-val">0.60</em></span>';
    var eccInput = document.createElement('input');
    eccInput.type = 'range';
    eccInput.min = '0'; eccInput.max = '0.85'; eccInput.step = '0.01'; eccInput.value = '0.6';
    eccInput.addEventListener('input', function () {
      state.e = parseFloat(eccInput.value);
      eccLabel.querySelector('.sim-val').textContent = state.e.toFixed(2);
      sweepHistory.length = 0; // reset sweep area accumulation
    });
    eccLabel.appendChild(eccInput);
    controls.appendChild(eccLabel);

    var spdLabel = document.createElement('label');
    spdLabel.className = 'sim-range';
    spdLabel.innerHTML = '<span>속도</span>';
    var spdInput = document.createElement('input');
    spdInput.type = 'range';
    spdInput.min = '0.3'; spdInput.max = '3'; spdInput.step = '0.1'; spdInput.value = '1';
    spdInput.addEventListener('input', function () {
      state.speed = parseFloat(spdInput.value);
    });
    spdLabel.appendChild(spdInput);
    controls.appendChild(spdLabel);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '행성은 태양에 가까울 때 빠르고, 멀어지면 느려진다. 같은 시간 동안 휘젓는 면적은 항상 같다.';
    container.appendChild(caption);

    // ===== SVG =====
    var W = 460, H = 320;
    var CX = W / 2 + 60, CY = H / 2;
    var A = 160; // semi-major
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '케플러 제2법칙 시각화');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var ellipse = document.createElementNS(svgNS, 'ellipse');
    ellipse.setAttribute('fill', 'none');
    ellipse.setAttribute('stroke', '#c8bea4');
    ellipse.setAttribute('stroke-width', '0.8');
    svg.appendChild(ellipse);

    var sweepGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(sweepGroup);

    var sun = document.createElementNS(svgNS, 'circle');
    sun.setAttribute('r', 8); sun.setAttribute('fill', '#d49a2a');
    svg.appendChild(sun);

    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('stroke', '#2a5680'); line.setAttribute('stroke-width', '0.8');
    svg.appendChild(line);

    var planet = document.createElementNS(svgNS, 'circle');
    planet.setAttribute('r', 5); planet.setAttribute('fill', '#2a5680');
    svg.appendChild(planet);

    // Sweep history (accumulated path triangles)
    var sweepHistory = [];

    // Solve Kepler: M -> E -> position (focus at origin)
    function solve(M, e) {
      // Newton iteration on Kepler's equation: M = E - e sin E
      var E = M;
      for (var i = 0; i < 8; i++) {
        E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      }
      var b = A * Math.sqrt(1 - e * e);
      var cosE = Math.cos(E), sinE = Math.sin(E);
      // Position in ellipse-center frame
      var xc = A * cosE;
      var yc = b * sinE;
      // Shift so focus is at origin: focus distance = A*e
      var x = xc - A * e;
      var y = yc;
      return { x: x, y: y };
    }

    function render() {
      var b = A * Math.sqrt(1 - state.e * state.e);
      ellipse.setAttribute('cx', CX - A * state.e * 0); // center shifted right of focus
      ellipse.setAttribute('cy', CY);
      ellipse.setAttribute('rx', A);
      ellipse.setAttribute('ry', b);
      // Position ellipse center: focus is at CX, center at CX + A*e (right focus)
      ellipse.setAttribute('cx', CX + A * state.e);
      // (We use right-focus convention; actual focus at origin/CX.)

      sun.setAttribute('cx', CX);
      sun.setAttribute('cy', CY);

      var pos = solve(state.M, state.e);
      // Note: above ellipse is shifted +A*e from focus. So planet pos at (x+A*e, y) in screen.
      var px = CX + pos.x + A * state.e;
      var py = CY + pos.y;
      planet.setAttribute('cx', px); planet.setAttribute('cy', py);
      line.setAttribute('x1', CX); line.setAttribute('y1', CY);
      line.setAttribute('x2', px); line.setAttribute('y2', py);

      // Accumulate sweep area (fading triangles every chunk of M)
      var lastSweep = sweepHistory[sweepHistory.length - 1];
      if (!lastSweep || Math.abs(state.M - lastSweep.M) > 0.18) {
        sweepHistory.push({ M: state.M, x: px, y: py });
        if (sweepHistory.length > 36) sweepHistory.shift();

        // Repaint sweep
        while (sweepGroup.firstChild) sweepGroup.removeChild(sweepGroup.firstChild);
        for (var i = 1; i < sweepHistory.length; i++) {
          var p0 = sweepHistory[i - 1], p1 = sweepHistory[i];
          var tri = document.createElementNS(svgNS, 'polygon');
          tri.setAttribute('points',
            CX + ',' + CY + ' ' + p0.x + ',' + p0.y + ' ' + p1.x + ',' + p1.y);
          var alpha = i / sweepHistory.length;
          tri.setAttribute('fill', '#2a5680');
          tri.setAttribute('opacity', String(0.06 + 0.10 * alpha));
          tri.setAttribute('stroke', 'none');
          sweepGroup.appendChild(tri);
        }
      }
    }

    var last = performance.now();
    function loop(now) {
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (state.running) {
        state.M += dt * state.speed * 0.9;
        if (state.M > Math.PI * 2) state.M -= Math.PI * 2;
      }
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  document.querySelectorAll('[data-sim-id$=".sim.kepler"]').forEach(init);
})();
