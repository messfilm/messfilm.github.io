/* ============================================================
   Simulation: Double-slit experiment — wave–particle duality
   Mounted on: data-sim-id="science.era.05-modern.sim.double-slit"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-double-slit');

    var state = {
      mode: 'wave',     // 'wave' | 'particle' | 'quantum'
      wavelength: 60,   // visual wavelength (px)
      slitSep: 80
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var btns = [
      { key: 'wave', label: '파동' },
      { key: 'particle', label: '입자 (단순)' },
      { key: 'quantum', label: '광자 (양자)' }
    ];
    btns.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sim-btn';
      btn.textContent = b.label;
      if (b.key === state.mode) btn.setAttribute('aria-pressed', 'true');
      btn.addEventListener('click', function () {
        state.mode = b.key;
        controls.querySelectorAll('button').forEach(function (x) { x.removeAttribute('aria-pressed'); });
        btn.setAttribute('aria-pressed', 'true');
        // Reset hits when mode changes
        hits.length = 0;
        render();
      });
      controls.appendChild(btn);
    });

    var wlL = document.createElement('label');
    wlL.className = 'sim-range';
    wlL.innerHTML = '<span>파장 <em class="sim-val" id="ds-wl">60</em></span>';
    var wlI = document.createElement('input');
    wlI.type = 'range'; wlI.min = '30'; wlI.max = '100'; wlI.step = '2'; wlI.value = '60';
    wlI.addEventListener('input', function () {
      state.wavelength = parseInt(wlI.value, 10);
      wlL.querySelector('.sim-val').textContent = state.wavelength;
      hits.length = 0;
      render();
    });
    wlL.appendChild(wlI);
    controls.appendChild(wlL);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '빛(또는 전자)은 *입자*인가 *파동*인가? 두 슬릿을 지난 뒤 스크린에 *간섭무늬*가 생기면 파동성. 하지만 광자를 한 개씩 보내도 — 시간이 지나면 *간섭무늬*가 나타난다. 양자역학의 핵심 수수께끼.';
    container.appendChild(caption);

    var W = 480, H = 320;
    var SLIT_X = 200, SCREEN_X = 400;
    var CY = H / 2;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '이중 슬릿 실험 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Source
    var src = document.createElementNS(svgNS, 'circle');
    src.setAttribute('cx', 30); src.setAttribute('cy', CY);
    src.setAttribute('r', 8); src.setAttribute('fill', '#d49a2a');
    svg.appendChild(src);
    var srcLb = document.createElementNS(svgNS, 'text');
    srcLb.setAttribute('x', 30); srcLb.setAttribute('y', CY + 26);
    srcLb.setAttribute('class', 'sim-label'); srcLb.setAttribute('text-anchor', 'middle');
    srcLb.setAttribute('font-weight', '600');
    srcLb.textContent = '광원';
    svg.appendChild(srcLb);

    // Slit barrier
    function drawBarrier() {
      var s1 = CY - state.slitSep / 2;
      var s2 = CY + state.slitSep / 2;
      var b = document.createElementNS(svgNS, 'g');
      var bg1 = document.createElementNS(svgNS, 'rect');
      bg1.setAttribute('x', SLIT_X); bg1.setAttribute('y', 30);
      bg1.setAttribute('width', 8); bg1.setAttribute('height', s1 - 35);
      bg1.setAttribute('fill', '#5a3a28');
      b.appendChild(bg1);
      var bg2 = document.createElementNS(svgNS, 'rect');
      bg2.setAttribute('x', SLIT_X); bg2.setAttribute('y', s1 + 5);
      bg2.setAttribute('width', 8); bg2.setAttribute('height', s2 - s1 - 10);
      bg2.setAttribute('fill', '#5a3a28');
      b.appendChild(bg2);
      var bg3 = document.createElementNS(svgNS, 'rect');
      bg3.setAttribute('x', SLIT_X); bg3.setAttribute('y', s2 + 5);
      bg3.setAttribute('width', 8); bg3.setAttribute('height', H - s2 - 35);
      bg3.setAttribute('fill', '#5a3a28');
      b.appendChild(bg3);
      return b;
    }
    svg.appendChild(drawBarrier());

    // Screen
    var screen = document.createElementNS(svgNS, 'rect');
    screen.setAttribute('x', SCREEN_X); screen.setAttribute('y', 30);
    screen.setAttribute('width', 6); screen.setAttribute('height', H - 60);
    screen.setAttribute('fill', '#1f1a14');
    svg.appendChild(screen);

    // Dynamic visualization area
    var dynG = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynG);

    // Hits on screen (for particle/quantum modes)
    var hits = [];
    var hitG = document.createElementNS(svgNS, 'g');
    svg.appendChild(hitG);

    function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    // Intensity at position y on screen for two-slit interference
    // I(y) ∝ cos²(π·d·sinθ/λ) where sinθ ≈ (y-CY)/distance
    function intensity(y) {
      var dy = y - CY;
      var dist = SCREEN_X - SLIT_X;
      var sinTheta = dy / Math.sqrt(dy * dy + dist * dist);
      var phase = Math.PI * state.slitSep * sinTheta / (state.wavelength / 4);
      return Math.cos(phase) * Math.cos(phase);
    }

    var t = 0;
    function render() {
      clear(dynG);

      if (state.mode === 'wave') {
        // Concentric circles from each slit
        var s1y = CY - state.slitSep / 2;
        var s2y = CY + state.slitSep / 2;
        for (var k = 0; k < 8; k++) {
          var r = ((t + k * state.wavelength / 8) % state.wavelength) +
                  k * state.wavelength;
          if (r > 220) continue;
          var c1 = document.createElementNS(svgNS, 'circle');
          c1.setAttribute('cx', SLIT_X + 4); c1.setAttribute('cy', s1y);
          c1.setAttribute('r', r);
          c1.setAttribute('fill', 'none');
          c1.setAttribute('stroke', '#2a5680');
          c1.setAttribute('stroke-width', '0.7');
          c1.setAttribute('opacity', String(0.6 - r / 300));
          dynG.appendChild(c1);
          var c2 = document.createElementNS(svgNS, 'circle');
          c2.setAttribute('cx', SLIT_X + 4); c2.setAttribute('cy', s2y);
          c2.setAttribute('r', r);
          c2.setAttribute('fill', 'none');
          c2.setAttribute('stroke', '#2a5680');
          c2.setAttribute('stroke-width', '0.7');
          c2.setAttribute('opacity', String(0.6 - r / 300));
          dynG.appendChild(c2);
        }
        // Interference pattern on screen (bright bands)
        for (var y = 30; y < H - 30; y += 2) {
          var I = intensity(y);
          var bar = document.createElementNS(svgNS, 'rect');
          bar.setAttribute('x', SCREEN_X + 8); bar.setAttribute('y', y);
          bar.setAttribute('width', 30); bar.setAttribute('height', 2);
          bar.setAttribute('fill', '#d49a2a');
          bar.setAttribute('opacity', String(I));
          dynG.appendChild(bar);
        }
      } else if (state.mode === 'particle') {
        // Straight-line trajectories — two bands on screen
        for (var p = 0; p < 4; p++) {
          var phase = ((t + p * 80) % 200) / 200;
          var px = 30 + (SLIT_X - 30) * phase;
          var py = CY + (Math.random() - 0.5) * 4;
          // Choose slit randomly
          var slot = (p % 2 === 0) ? CY - state.slitSep / 2 : CY + state.slitSep / 2;
          if (phase > 0.5) {
            // After slit
            var phase2 = (phase - 0.5) * 2;
            px = SLIT_X + 8 + (SCREEN_X - SLIT_X - 8) * phase2;
            py = slot;
          }
          var p1 = document.createElementNS(svgNS, 'circle');
          p1.setAttribute('cx', px); p1.setAttribute('cy', py);
          p1.setAttribute('r', 3);
          p1.setAttribute('fill', '#a04030');
          dynG.appendChild(p1);
        }
        // Add hits to screen — concentrated at two slit positions
        if (Math.random() < 0.4) {
          var slot2 = Math.random() < 0.5 ? CY - state.slitSep / 2 : CY + state.slitSep / 2;
          hits.push({ y: slot2 + (Math.random() - 0.5) * 8 });
        }
      } else {
        // 'quantum' — single photons but build up interference pattern
        if (Math.random() < 0.5) {
          // Sample y from intensity distribution
          for (var trial = 0; trial < 20; trial++) {
            var yc = 30 + Math.random() * (H - 60);
            var I = intensity(yc);
            if (Math.random() < I) {
              hits.push({ y: yc });
              break;
            }
          }
        }
        // Show single moving photon
        var phase3 = (t % 100) / 100;
        var pxq = 30 + 370 * phase3;
        var pyq = CY + (Math.sin(t / 10) * 8);
        var pq = document.createElementNS(svgNS, 'circle');
        pq.setAttribute('cx', pxq); pq.setAttribute('cy', pyq);
        pq.setAttribute('r', 3);
        pq.setAttribute('fill', '#d49a2a');
        dynG.appendChild(pq);
      }

      // Render hits
      clear(hitG);
      var maxHits = 600;
      if (hits.length > maxHits) hits.splice(0, hits.length - maxHits);
      hits.forEach(function (h) {
        var c = document.createElementNS(svgNS, 'circle');
        c.setAttribute('cx', SCREEN_X + 18 + (Math.random() - 0.5) * 10);
        c.setAttribute('cy', h.y);
        c.setAttribute('r', 1.4);
        c.setAttribute('fill', '#1f1a14');
        c.setAttribute('opacity', '0.6');
        hitG.appendChild(c);
      });
    }

    function loop() { t += 2; render(); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  }

  document.querySelectorAll('[data-sim-id$=".sim.double-slit"]').forEach(init);
})();
