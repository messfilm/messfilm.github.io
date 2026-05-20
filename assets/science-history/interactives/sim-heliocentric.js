/* ============================================================
   Simulation: Heliocentric vs Geocentric model toggle
   Mounted on: <div class="sim" data-sim-id="science.era.03-revolution.sim.heliocentric">
   ============================================================ */

(function () {
  'use strict';

  // Planet definitions — simplified, equal angular speeds scaled for visual clarity
  // Heliocentric: planets orbit the Sun. Earth is one of them.
  // Geocentric (simplified Ptolemaic): planets orbit Earth, but each carries a small
  //   epicycle which produces retrograde motion. We render epicycles for outer planets.
  var PLANETS = [
    { name: 'Mercury', color: '#c4a64a', helioR: 30,  speed: 4.15 },
    { name: 'Venus',   color: '#d8b08a', helioR: 50,  speed: 1.62 },
    { name: 'Earth',   color: '#2a5680', helioR: 75,  speed: 1.00 },
    { name: 'Mars',    color: '#a04030', helioR: 100, speed: 0.53 },
    { name: 'Jupiter', color: '#a37e2c', helioR: 135, speed: 0.084 },
    { name: 'Saturn',  color: '#7a6b3a', helioR: 165, speed: 0.034 }
  ];

  function el(tag, attrs, text) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    return n;
  }

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-heliocentric');

    var state = {
      mode: 'helio',        // 'helio' | 'geo'
      running: true,
      speed: 1.0,
      t: 0
    };

    // ===== Controls =====
    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'sim-btn sim-btn-toggle';
    toggleBtn.textContent = '태양 중심 (Heliocentric)';
    toggleBtn.setAttribute('aria-pressed', 'true');
    toggleBtn.addEventListener('click', function () {
      state.mode = state.mode === 'helio' ? 'geo' : 'helio';
      toggleBtn.textContent = state.mode === 'helio'
        ? '태양 중심 (Heliocentric)'
        : '지구 중심 (Geocentric)';
      toggleBtn.setAttribute('aria-pressed', String(state.mode === 'helio'));
      caption.textContent = state.mode === 'helio'
        ? '코페르니쿠스 (1543) — 행성들이 태양을 도는 원궤도. 역행은 자연스럽게 나타남.'
        : '프톨레마이오스 — 모든 천체가 지구 둘레를 돎. 역행을 설명하려 주전원(epicycle)을 도입.';
    });
    controls.appendChild(toggleBtn);

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'sim-btn';
    playBtn.textContent = '⏸ 멈춤';
    playBtn.addEventListener('click', function () {
      state.running = !state.running;
      playBtn.textContent = state.running ? '⏸ 멈춤' : '▶ 재생';
    });
    controls.appendChild(playBtn);

    var speedLabel = document.createElement('label');
    speedLabel.className = 'sim-range';
    speedLabel.innerHTML = '<span>속도</span>';
    var speedInput = document.createElement('input');
    speedInput.type = 'range';
    speedInput.min = '0.2'; speedInput.max = '3'; speedInput.step = '0.1'; speedInput.value = '1';
    speedInput.addEventListener('input', function () {
      state.speed = parseFloat(speedInput.value);
    });
    speedLabel.appendChild(speedInput);
    controls.appendChild(speedLabel);

    container.appendChild(controls);

    // ===== Caption =====
    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '코페르니쿠스 (1543) — 행성들이 태양을 도는 원궤도. 역행은 자연스럽게 나타남.';
    container.appendChild(caption);

    // ===== SVG =====
    var svgNS = 'http://www.w3.org/2000/svg';
    var W = 460, H = 360;
    var CX = W / 2, CY = H / 2;
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '태양 중심 vs 지구 중심 행성 운동 비교');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Orbits group + planets group
    var orbits = document.createElementNS(svgNS, 'g');
    svg.appendChild(orbits);
    var bodies = document.createElementNS(svgNS, 'g');
    svg.appendChild(bodies);

    function clearChildren(node) { while (node.firstChild) node.removeChild(node.firstChild); }

    function render() {
      clearChildren(orbits);
      clearChildren(bodies);

      if (state.mode === 'helio') {
        // Sun at center
        var sun = document.createElementNS(svgNS, 'circle');
        sun.setAttribute('cx', CX); sun.setAttribute('cy', CY);
        sun.setAttribute('r', 9); sun.setAttribute('fill', '#d49a2a');
        bodies.appendChild(sun);
        var sunLabel = document.createElementNS(svgNS, 'text');
        sunLabel.setAttribute('x', CX); sunLabel.setAttribute('y', CY + 24);
        sunLabel.setAttribute('text-anchor', 'middle');
        sunLabel.setAttribute('class', 'sim-label');
        sunLabel.textContent = 'Sun';
        bodies.appendChild(sunLabel);

        PLANETS.forEach(function (p) {
          // orbit ring
          var ring = document.createElementNS(svgNS, 'circle');
          ring.setAttribute('cx', CX); ring.setAttribute('cy', CY);
          ring.setAttribute('r', p.helioR); ring.setAttribute('fill', 'none');
          ring.setAttribute('stroke', '#c8bea4'); ring.setAttribute('stroke-width', '0.6');
          orbits.appendChild(ring);

          // planet
          var angle = state.t * p.speed;
          var px = CX + p.helioR * Math.cos(angle);
          var py = CY + p.helioR * Math.sin(angle);
          var planet = document.createElementNS(svgNS, 'circle');
          planet.setAttribute('cx', px); planet.setAttribute('cy', py);
          planet.setAttribute('r', p.name === 'Earth' ? 4.5 : 3.5);
          planet.setAttribute('fill', p.color);
          bodies.appendChild(planet);

          if (p.name === 'Earth' || p.name === 'Mars') {
            var lb = document.createElementNS(svgNS, 'text');
            lb.setAttribute('x', px + 8); lb.setAttribute('y', py + 3);
            lb.setAttribute('class', 'sim-label');
            lb.textContent = p.name;
            bodies.appendChild(lb);
          }
        });
      } else {
        // Geocentric: Earth at center, Sun + planets orbit. Outer planets carry epicycle.
        var earth = document.createElementNS(svgNS, 'circle');
        earth.setAttribute('cx', CX); earth.setAttribute('cy', CY);
        earth.setAttribute('r', 7); earth.setAttribute('fill', '#2a5680');
        bodies.appendChild(earth);
        var elb = document.createElementNS(svgNS, 'text');
        elb.setAttribute('x', CX); elb.setAttribute('y', CY + 22);
        elb.setAttribute('text-anchor', 'middle'); elb.setAttribute('class', 'sim-label');
        elb.textContent = 'Earth';
        bodies.appendChild(elb);

        // Geocentric deferent radii (scaled differently for clarity)
        var GEO = [
          { name: 'Moon',    color: '#c0c0c0', defR: 28,  speed: 13.3, epi: 0 },
          { name: 'Mercury', color: '#c4a64a', defR: 50,  speed: 4.15, epi: 0 },
          { name: 'Venus',   color: '#d8b08a', defR: 70,  speed: 1.62, epi: 0 },
          { name: 'Sun',     color: '#d49a2a', defR: 95,  speed: 1.00, epi: 0 },
          { name: 'Mars',    color: '#a04030', defR: 125, speed: 0.53, epi: 12 },
          { name: 'Jupiter', color: '#a37e2c', defR: 155, speed: 0.34, epi: 10 },
          { name: 'Saturn',  color: '#7a6b3a', defR: 178, speed: 0.20, epi: 8 }
        ];

        GEO.forEach(function (p) {
          var ring = document.createElementNS(svgNS, 'circle');
          ring.setAttribute('cx', CX); ring.setAttribute('cy', CY);
          ring.setAttribute('r', p.defR); ring.setAttribute('fill', 'none');
          ring.setAttribute('stroke', '#c8bea4'); ring.setAttribute('stroke-width', '0.6');
          orbits.appendChild(ring);

          var angle = state.t * p.speed;
          var bx = CX + p.defR * Math.cos(angle);
          var by = CY + p.defR * Math.sin(angle);

          if (p.epi > 0) {
            // epicycle around (bx,by)
            var epiAngle = state.t * 3.0;
            var ex = bx + p.epi * Math.cos(epiAngle);
            var ey = by + p.epi * Math.sin(epiAngle);

            var epiRing = document.createElementNS(svgNS, 'circle');
            epiRing.setAttribute('cx', bx); epiRing.setAttribute('cy', by);
            epiRing.setAttribute('r', p.epi); epiRing.setAttribute('fill', 'none');
            epiRing.setAttribute('stroke', '#a37e2c'); epiRing.setAttribute('stroke-width', '0.4');
            epiRing.setAttribute('stroke-dasharray', '2 2');
            orbits.appendChild(epiRing);

            var planet = document.createElementNS(svgNS, 'circle');
            planet.setAttribute('cx', ex); planet.setAttribute('cy', ey);
            planet.setAttribute('r', 3.5); planet.setAttribute('fill', p.color);
            bodies.appendChild(planet);

            if (p.name === 'Mars') {
              var lb = document.createElementNS(svgNS, 'text');
              lb.setAttribute('x', ex + 8); lb.setAttribute('y', ey + 3);
              lb.setAttribute('class', 'sim-label');
              lb.textContent = p.name;
              bodies.appendChild(lb);
            }
          } else {
            var planet2 = document.createElementNS(svgNS, 'circle');
            planet2.setAttribute('cx', bx); planet2.setAttribute('cy', by);
            planet2.setAttribute('r', p.name === 'Sun' ? 6 : 3.5);
            planet2.setAttribute('fill', p.color);
            bodies.appendChild(planet2);
            if (p.name === 'Sun') {
              var slb = document.createElementNS(svgNS, 'text');
              slb.setAttribute('x', bx + 10); slb.setAttribute('y', by + 3);
              slb.setAttribute('class', 'sim-label');
              slb.textContent = 'Sun';
              bodies.appendChild(slb);
            }
          }
        });
      }
    }

    function tick(dt) {
      if (state.running) state.t += dt * state.speed * 0.4;
      render();
    }

    // Animation loop
    var last = performance.now();
    function loop(now) {
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tick(dt);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  document.querySelectorAll('[data-sim-id$=".sim.heliocentric"]').forEach(init);
})();
