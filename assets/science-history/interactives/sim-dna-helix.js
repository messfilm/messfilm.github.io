/* ============================================================
   Simulation: DNA double helix — base pairing
   (Watson, Crick, Franklin, 1953)
   Mounted on: data-sim-id="science.era.05-modern.sim.dna-helix"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-dna-helix');

    var state = {
      rotation: 0,
      paused: false,
      sequence: 'ATCGATCGTACGCATG'   // example sequence
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'sim-btn';
    playBtn.textContent = '⏸ 멈춤';
    playBtn.addEventListener('click', function () {
      state.paused = !state.paused;
      playBtn.textContent = state.paused ? '▶ 재생' : '⏸ 멈춤';
    });
    controls.appendChild(playBtn);

    var seqL = document.createElement('label');
    seqL.className = 'sim-range';
    seqL.innerHTML = '<span>염기 순서</span>';
    var seqI = document.createElement('input');
    seqI.type = 'text';
    seqI.value = state.sequence;
    seqI.maxLength = 24;
    seqI.style.fontFamily = 'monospace';
    seqI.style.width = '180px';
    seqI.style.padding = '4px 8px';
    seqI.style.border = '1px solid var(--rule)';
    seqI.style.background = 'var(--paper)';
    seqI.addEventListener('input', function () {
      var v = seqI.value.toUpperCase().replace(/[^ATCG]/g, '');
      state.sequence = v;
      seqI.value = v;
      render();
    });
    seqL.appendChild(seqI);
    controls.appendChild(seqL);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '1953년 왓슨과 크릭 — 두 가닥의 나선. 안쪽에서 *A는 T와*, *G는 C와* 짝지어 사다리 가로대처럼 묶인다. 이 짝짓기가 *복제와 유전*의 메커니즘. 프랭클린의 X선 회절 사진 51이 결정적 단서.';
    container.appendChild(caption);

    var W = 480, H = 380;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'DNA 이중나선 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var dynG = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynG);

    var legend = document.createElement('div');
    legend.className = 'sim-readout';
    legend.innerHTML =
      '<span><em style="color:#2a5680;font-style:normal;font-weight:700">A</em> 아데닌</span>' +
      '<span><em style="color:#a04030;font-style:normal;font-weight:700">T</em> 티민</span>' +
      '<span><em style="color:#2d5a3f;font-style:normal;font-weight:700">G</em> 구아닌</span>' +
      '<span><em style="color:#a37e2c;font-style:normal;font-weight:700">C</em> 시토신</span>';
    container.appendChild(legend);

    var BASE_COLOR = {
      A: '#2a5680', T: '#a04030', G: '#2d5a3f', C: '#a37e2c'
    };
    var BASE_PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };

    function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clear(dynG);
      var CX = W / 2;
      var seq = state.sequence || 'ATCG';
      var n = seq.length;
      var stepY = 22;
      var amp = 60;      // helix amplitude
      var topY = 30;
      var phaseStep = Math.PI / 5;

      for (var i = 0; i < n; i++) {
        var y = topY + i * stepY;
        var angle = state.rotation + i * phaseStep;
        var x1 = CX + amp * Math.cos(angle);
        var x2 = CX + amp * Math.cos(angle + Math.PI);
        var depth = Math.sin(angle);   // -1 ~ 1, used for z-ordering

        // Base pair connection line (rung)
        if (Math.abs(x1 - x2) > 6) {
          var rung = document.createElementNS(svgNS, 'line');
          rung.setAttribute('x1', x1); rung.setAttribute('y1', y);
          rung.setAttribute('x2', x2); rung.setAttribute('y2', y);
          rung.setAttribute('stroke', '#6b6253');
          rung.setAttribute('stroke-width', '1');
          rung.setAttribute('opacity', '0.4');
          rung.setAttribute('stroke-dasharray', '3 2');
          dynG.appendChild(rung);
        }

        // Bases on each strand
        var b1 = seq[i % n];
        var b2 = BASE_PAIR[b1] || 'T';

        var c1 = document.createElementNS(svgNS, 'circle');
        c1.setAttribute('cx', x1); c1.setAttribute('cy', y);
        c1.setAttribute('r', depth > 0 ? 10 : 8);
        c1.setAttribute('fill', BASE_COLOR[b1]);
        c1.setAttribute('opacity', String(0.5 + 0.5 * (depth + 1) / 2));
        dynG.appendChild(c1);
        var t1 = document.createElementNS(svgNS, 'text');
        t1.setAttribute('x', x1); t1.setAttribute('y', y + 4);
        t1.setAttribute('text-anchor', 'middle');
        t1.setAttribute('font-family', 'monospace');
        t1.setAttribute('font-size', '12');
        t1.setAttribute('font-weight', '700');
        t1.setAttribute('fill', '#faf6eb');
        t1.textContent = b1;
        dynG.appendChild(t1);

        var c2 = document.createElementNS(svgNS, 'circle');
        c2.setAttribute('cx', x2); c2.setAttribute('cy', y);
        c2.setAttribute('r', depth < 0 ? 10 : 8);
        c2.setAttribute('fill', BASE_COLOR[b2]);
        c2.setAttribute('opacity', String(0.5 + 0.5 * (-depth + 1) / 2));
        dynG.appendChild(c2);
        var t2 = document.createElementNS(svgNS, 'text');
        t2.setAttribute('x', x2); t2.setAttribute('y', y + 4);
        t2.setAttribute('text-anchor', 'middle');
        t2.setAttribute('font-family', 'monospace');
        t2.setAttribute('font-size', '12');
        t2.setAttribute('font-weight', '700');
        t2.setAttribute('fill', '#faf6eb');
        t2.textContent = b2;
        dynG.appendChild(t2);
      }

      // Sugar-phosphate backbone (two curves)
      var bb1 = 'M ';
      var bb2 = 'M ';
      for (var k = 0; k < n; k++) {
        var ya = topY + k * stepY;
        var ang = state.rotation + k * phaseStep;
        var xa = CX + amp * Math.cos(ang);
        var xb = CX + amp * Math.cos(ang + Math.PI);
        bb1 += (k > 0 ? ' L ' : '') + xa + ' ' + ya;
        bb2 += (k > 0 ? ' L ' : '') + xb + ' ' + ya;
      }
      var path1 = document.createElementNS(svgNS, 'path');
      path1.setAttribute('d', bb1);
      path1.setAttribute('fill', 'none');
      path1.setAttribute('stroke', '#5a3a28');
      path1.setAttribute('stroke-width', '2.4');
      path1.setAttribute('opacity', '0.55');
      dynG.insertBefore(path1, dynG.firstChild);
      var path2 = document.createElementNS(svgNS, 'path');
      path2.setAttribute('d', bb2);
      path2.setAttribute('fill', 'none');
      path2.setAttribute('stroke', '#5a3a28');
      path2.setAttribute('stroke-width', '2.4');
      path2.setAttribute('opacity', '0.55');
      dynG.insertBefore(path2, dynG.firstChild);
    }

    function loop() {
      if (!state.paused) state.rotation += 0.03;
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  document.querySelectorAll('[data-sim-id$=".sim.dna-helix"]').forEach(init);
})();
