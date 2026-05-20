/* ============================================================
   Simulation: Photoelectric effect — light frequency vs electron energy
   (Einstein, 1905)
   Mounted on: data-sim-id="science.era.05-modern.sim.photoelectric"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  // Planck constant (scaled for visualization). E = h·f - W
  // W = work function (depends on metal). Below threshold → no electron emitted.

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-photoelectric');

    var METALS = {
      sodium:  { name: '나트륨',   W: 2.3, color: '#c4a64a' },
      zinc:    { name: '아연',     W: 4.3, color: '#a09078' },
      copper:  { name: '구리',     W: 4.7, color: '#a04030' }
    };
    var state = {
      freq: 6.0,          // light frequency (× 10^14 Hz)
      intensity: 5,       // 1..10
      metal: 'sodium'
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var freqL = document.createElement('label');
    freqL.className = 'sim-range';
    freqL.innerHTML = '<span>빛 진동수 <em class="sim-val" id="ph-f">6.0</em> × 10¹⁴ Hz</span>';
    var freqI = document.createElement('input');
    freqI.type = 'range'; freqI.min = '2'; freqI.max = '14'; freqI.step = '0.1'; freqI.value = '6';
    freqI.addEventListener('input', function () {
      state.freq = parseFloat(freqI.value);
      freqL.querySelector('.sim-val').textContent = state.freq.toFixed(1);
      render();
    });
    freqL.appendChild(freqI);
    controls.appendChild(freqL);

    var intL = document.createElement('label');
    intL.className = 'sim-range';
    intL.innerHTML = '<span>빛 강도 <em class="sim-val" id="ph-i">5</em></span>';
    var intI = document.createElement('input');
    intI.type = 'range'; intI.min = '1'; intI.max = '10'; intI.step = '1'; intI.value = '5';
    intI.addEventListener('input', function () {
      state.intensity = parseInt(intI.value, 10);
      intL.querySelector('.sim-val').textContent = state.intensity;
      render();
    });
    intL.appendChild(intI);
    controls.appendChild(intL);

    Object.keys(METALS).forEach(function (k) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sim-btn';
      btn.textContent = METALS[k].name + ' (' + METALS[k].W + ' eV)';
      if (k === state.metal) btn.setAttribute('aria-pressed', 'true');
      btn.addEventListener('click', function () {
        state.metal = k;
        controls.querySelectorAll('button').forEach(function (b) { b.removeAttribute('aria-pressed'); });
        btn.setAttribute('aria-pressed', 'true');
        render();
      });
      controls.appendChild(btn);
    });
    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '아인슈타인 1905 — 빛은 *알갱이*(광자)다. 광자 에너지 E = hf 가 금속의 일함수 W를 넘어야 전자가 튀어나온다. 강도(밝기)는 광자의 *수*만 늘리지 에너지에는 영향이 없다. 진동수만 결정적.';
    container.appendChild(caption);

    var W = 480, H = 320;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '광전효과 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Metal plate (left)
    var plate = document.createElementNS(svgNS, 'rect');
    plate.setAttribute('x', 80); plate.setAttribute('y', 100);
    plate.setAttribute('width', 24); plate.setAttribute('height', 120);
    svg.appendChild(plate);
    var plateLb = document.createElementNS(svgNS, 'text');
    plateLb.setAttribute('x', 92); plateLb.setAttribute('y', 240);
    plateLb.setAttribute('class', 'sim-label');
    plateLb.setAttribute('text-anchor', 'middle');
    plateLb.setAttribute('font-weight', '600');
    svg.appendChild(plateLb);

    var dynG = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynG);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>광자 에너지 E = hf = <em id="ph-E">…</em> eV</span>' +
      '<span>일함수 W = <em id="ph-W">…</em> eV</span>' +
      '<span>전자 운동에너지 = <em id="ph-K">…</em> eV</span>';
    container.appendChild(readout);

    function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    var photonTime = 0;
    function render() {
      clear(dynG);
      var m = METALS[state.metal];
      plate.setAttribute('fill', m.color);
      plateLb.textContent = m.name;

      // Photon energy: E = h·f (scaled). Use h = 0.414 eV/(10^14 Hz)
      var E = 0.414 * state.freq;
      var K = E - m.W;

      // Photons from left side
      for (var i = 0; i < state.intensity; i++) {
        var phase = ((photonTime + i * 30) % 200) / 200;
        var px = 20 + 60 * phase;
        var py = 130 + i * 12;
        if (py > 210) py -= 80;
        var p = document.createElementNS(svgNS, 'circle');
        p.setAttribute('cx', px); p.setAttribute('cy', py);
        p.setAttribute('r', 3);
        // 진동수가 높으면 보라/파랑, 낮으면 빨강
        var hue = Math.max(0, Math.min(280, 280 - (state.freq - 2) * 25));
        p.setAttribute('fill', 'hsl(' + hue + ', 70%, 55%)');
        dynG.appendChild(p);
      }

      // Electrons emitted (if K > 0)
      if (K > 0) {
        var nElec = Math.max(1, Math.floor(state.intensity * 0.7));
        var speed = Math.sqrt(K) * 30;   // visual speed scales with sqrt(K)
        for (var j = 0; j < nElec; j++) {
          var phase2 = ((photonTime * speed / 100 + j * 35) % 350) / 350;
          var ex = 110 + 350 * phase2;
          var ey = 110 + j * 18;
          if (ey > 215) ey -= 110;
          var e = document.createElementNS(svgNS, 'circle');
          e.setAttribute('cx', ex); e.setAttribute('cy', ey);
          e.setAttribute('r', 2.5);
          e.setAttribute('fill', '#2a5680');
          dynG.appendChild(e);
        }
        // 전자 라벨
        var elabel = document.createElementNS(svgNS, 'text');
        elabel.setAttribute('x', 280); elabel.setAttribute('y', 60);
        elabel.setAttribute('class', 'sim-label');
        elabel.setAttribute('fill', '#2a5680');
        elabel.setAttribute('font-weight', '700');
        elabel.textContent = '전자 방출 (운동에너지 ' + K.toFixed(2) + ' eV)';
        dynG.appendChild(elabel);
      } else {
        var note = document.createElementNS(svgNS, 'text');
        note.setAttribute('x', 280); note.setAttribute('y', 60);
        note.setAttribute('class', 'sim-label');
        note.setAttribute('fill', '#7c2030');
        note.setAttribute('font-weight', '700');
        note.textContent = '광자 에너지 < 일함수 → 전자 방출 없음';
        dynG.appendChild(note);
      }

      readout.querySelector('#ph-E').textContent = E.toFixed(2);
      readout.querySelector('#ph-W').textContent = m.W.toFixed(2);
      readout.querySelector('#ph-K').textContent = K > 0 ? K.toFixed(2) : '0 (방출 없음)';
    }

    function loop() {
      photonTime += 2;
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  document.querySelectorAll('[data-sim-id$=".sim.photoelectric"]').forEach(init);
})();
