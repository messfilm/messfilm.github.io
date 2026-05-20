/* ============================================================
   Simulation: Newton's Universal Gravitation — orbit shapes
   Mounted on: <div class="sim" data-sim-id="science.era.03-revolution.sim.newton-gravity">
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-newton');

    var state = {
      distance: 2.4,    // initial distance (units)
      speed0:   1.0,    // initial tangential speed (units/s)
      running:  true,
      trail:    [],
      maxTrail: 600,
      r: null, v: null
    };

    // ===== Controls =====
    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var dLabel = document.createElement('label');
    dLabel.className = 'sim-range';
    dLabel.innerHTML = '<span>거리 <em class="sim-val" id="ng-d-val">2.4</em></span>';
    var dInput = document.createElement('input');
    dInput.type = 'range';
    dInput.min = '1.5'; dInput.max = '5'; dInput.step = '0.1'; dInput.value = '2.4';
    dInput.addEventListener('input', function () {
      state.distance = parseFloat(dInput.value);
      dLabel.querySelector('.sim-val').textContent = state.distance.toFixed(1);
      reset();
    });
    dLabel.appendChild(dInput);
    controls.appendChild(dLabel);

    var vLabel = document.createElement('label');
    vLabel.className = 'sim-range';
    vLabel.innerHTML = '<span>초기 속도 <em class="sim-val" id="ng-v-val">1.0</em></span>';
    var vInput = document.createElement('input');
    vInput.type = 'range';
    vInput.min = '0.3'; vInput.max = '2.0'; vInput.step = '0.05'; vInput.value = '1.0';
    vInput.addEventListener('input', function () {
      state.speed0 = parseFloat(vInput.value);
      vLabel.querySelector('.sim-val').textContent = state.speed0.toFixed(2);
      reset();
    });
    vLabel.appendChild(vInput);
    controls.appendChild(vLabel);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'sim-btn';
    resetBtn.textContent = '↻ 리셋';
    resetBtn.addEventListener('click', function () { reset(); });
    controls.appendChild(resetBtn);

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'sim-btn';
    playBtn.textContent = '⏸ 멈춤';
    playBtn.addEventListener('click', function () {
      state.running = !state.running;
      playBtn.textContent = state.running ? '⏸ 멈춤' : '▶ 재생';
    });
    controls.appendChild(playBtn);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent =
      '거리 r에 대해 힘은 1/r². 초기 속도가 작으면 충돌, 적절하면 타원, 임계 이상이면 포물·쌍곡.';
    container.appendChild(caption);

    // ===== SVG =====
    var W = 460, H = 360;
    var CX = W / 2, CY = H / 2;
    var SCALE = 50; // pixels per unit

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '뉴턴 만유인력 궤도 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Faint distance grid rings (r=1,2,3,4)
    var grid = document.createElementNS(svgNS, 'g');
    for (var rr = 1; rr <= 4; rr++) {
      var ring = document.createElementNS(svgNS, 'circle');
      ring.setAttribute('cx', CX); ring.setAttribute('cy', CY);
      ring.setAttribute('r', rr * SCALE);
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', '#d8d0b8');
      ring.setAttribute('stroke-width', '0.5');
      ring.setAttribute('stroke-dasharray', '2 3');
      grid.appendChild(ring);
    }
    svg.appendChild(grid);

    var trail = document.createElementNS(svgNS, 'polyline');
    trail.setAttribute('fill', 'none');
    trail.setAttribute('stroke', '#2a5680');
    trail.setAttribute('stroke-width', '1.1');
    trail.setAttribute('opacity', '0.85');
    svg.appendChild(trail);

    var sun = document.createElementNS(svgNS, 'circle');
    sun.setAttribute('cx', CX); sun.setAttribute('cy', CY);
    sun.setAttribute('r', 10); sun.setAttribute('fill', '#d49a2a');
    svg.appendChild(sun);

    var satellite = document.createElementNS(svgNS, 'circle');
    satellite.setAttribute('r', 5); satellite.setAttribute('fill', '#2a5680');
    svg.appendChild(satellite);

    // Force arrow (pointing from satellite toward Sun)
    var forceArrow = document.createElementNS(svgNS, 'line');
    forceArrow.setAttribute('stroke', '#a04030');
    forceArrow.setAttribute('stroke-width', '1.4');
    forceArrow.setAttribute('marker-end', 'url(#ng-arrow)');
    svg.appendChild(forceArrow);

    // Velocity arrow
    var velArrow = document.createElementNS(svgNS, 'line');
    velArrow.setAttribute('stroke', '#2a5680');
    velArrow.setAttribute('stroke-width', '1.2');
    velArrow.setAttribute('marker-end', 'url(#ng-arrow-blue)');
    svg.appendChild(velArrow);

    // Defs for arrowheads
    var defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML =
      '<marker id="ng-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" fill="#a04030"/></marker>' +
      '<marker id="ng-arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" fill="#2a5680"/></marker>';
    svg.appendChild(defs);

    // Force value readout
    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>거리 r = <em id="ng-r-val">…</em></span>' +
      '<span>힘 F ∝ 1/r² = <em id="ng-f-val">…</em></span>';
    container.appendChild(readout);

    function reset() {
      // Place satellite at (distance, 0) with velocity (0, speed0)
      state.r = { x: state.distance, y: 0 };
      state.v = { x: 0, y: state.speed0 };
      state.trail.length = 0;
    }

    var G = 1.0;

    function step(dt) {
      // F = -G * r / |r|^3 (per unit mass; pointing toward origin)
      var rx = state.r.x, ry = state.r.y;
      var r2 = rx * rx + ry * ry;
      var r = Math.sqrt(r2);
      if (r < 0.25) {
        // Crash: snap to origin and stop
        state.running = false;
        playBtn.textContent = '▶ 재생';
        return;
      }
      var ax = -G * rx / (r2 * r);
      var ay = -G * ry / (r2 * r);

      // Symplectic semi-implicit Euler
      state.v.x += ax * dt;
      state.v.y += ay * dt;
      state.r.x += state.v.x * dt;
      state.r.y += state.v.y * dt;
    }

    function render() {
      var px = CX + state.r.x * SCALE;
      var py = CY + state.r.y * SCALE;
      satellite.setAttribute('cx', px);
      satellite.setAttribute('cy', py);

      // Add to trail (in screen coords)
      state.trail.push(px + ',' + py);
      if (state.trail.length > state.maxTrail) state.trail.shift();
      trail.setAttribute('points', state.trail.join(' '));

      // Force arrow (from satellite toward sun, length proportional to F = 1/r²)
      var r = Math.sqrt(state.r.x * state.r.x + state.r.y * state.r.y);
      var F = 1 / Math.max(0.04, r * r);
      var ux = -state.r.x / r, uy = -state.r.y / r;
      var forceLen = Math.min(60, F * 22);
      forceArrow.setAttribute('x1', px); forceArrow.setAttribute('y1', py);
      forceArrow.setAttribute('x2', px + ux * forceLen);
      forceArrow.setAttribute('y2', py + uy * forceLen);

      // Velocity arrow
      var vmag = Math.sqrt(state.v.x * state.v.x + state.v.y * state.v.y);
      var vScale = 24;
      velArrow.setAttribute('x1', px); velArrow.setAttribute('y1', py);
      velArrow.setAttribute('x2', px + state.v.x * vScale);
      velArrow.setAttribute('y2', py + state.v.y * vScale);

      readout.querySelector('#ng-r-val').textContent = r.toFixed(2);
      readout.querySelector('#ng-f-val').textContent = F.toFixed(2);
    }

    reset();

    var last = performance.now();
    function loop(now) {
      var dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (state.running) {
        // Subdivide for stability
        for (var i = 0; i < 4; i++) step(dt / 4);
      }
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  document.querySelectorAll('[data-sim-id$=".sim.newton-gravity"]').forEach(init);
})();
