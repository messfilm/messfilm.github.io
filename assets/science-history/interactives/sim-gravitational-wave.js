/* ============================================================
   Simulation: Gravitational waves from binary black hole merger
   (LIGO, 2015)
   Mounted on: data-sim-id="science.era.06-contemporary.sim.gravitational-wave"
   ============================================================ */

(function () {
  'use strict';
  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-gravitational-wave');

    var state = {
      time: 0,
      mass1: 30,        // solar masses
      mass2: 30,
      separation: 60,
      running: true
    };

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

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'sim-btn';
    resetBtn.textContent = '↻ 처음으로';
    resetBtn.addEventListener('click', function () {
      state.time = 0;
      state.separation = 60;
    });
    controls.appendChild(resetBtn);

    var m1L = document.createElement('label');
    m1L.className = 'sim-range';
    m1L.innerHTML = '<span>질량 1 <em class="sim-val" id="gw-m1">30</em> M☉</span>';
    var m1I = document.createElement('input');
    m1I.type = 'range'; m1I.min = '10'; m1I.max = '50'; m1I.step = '1'; m1I.value = '30';
    m1I.addEventListener('input', function () {
      state.mass1 = parseInt(m1I.value, 10);
      m1L.querySelector('.sim-val').textContent = state.mass1;
    });
    m1L.appendChild(m1I);
    controls.appendChild(m1L);

    var m2L = document.createElement('label');
    m2L.className = 'sim-range';
    m2L.innerHTML = '<span>질량 2 <em class="sim-val" id="gw-m2">30</em> M☉</span>';
    var m2I = document.createElement('input');
    m2I.type = 'range'; m2I.min = '10'; m2I.max = '50'; m2I.step = '1'; m2I.value = '30';
    m2I.addEventListener('input', function () {
      state.mass2 = parseInt(m2I.value, 10);
      m2L.querySelector('.sim-val').textContent = state.mass2;
    });
    m2L.appendChild(m2I);
    controls.appendChild(m2L);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '아인슈타인이 1916년에 예측한 <em>시공의 잔물결</em>. 두 블랙홀이 합쳐지면 — 우주가 떨린다. 2015년 LIGO가 13억 광년 떨어진 두 블랙홀의 합병에서 온 신호를 처음 검출. *지구가 양성자 폭만큼 흔들렸다*.';
    container.appendChild(caption);

    var W = 480, H = 380;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '중력파 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var dynG = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynG);

    var waveformG = document.createElementNS(svgNS, 'g');
    svg.appendChild(waveformG);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>총 질량 <em id="gw-total">…</em> M☉</span>' +
      '<span>분리 거리 <em id="gw-sep">…</em></span>' +
      '<span>위상 <em id="gw-phase">…</em></span>';
    container.appendChild(readout);

    var waveformHistory = [];

    function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clear(dynG);
      var CX = 140, CY = 140;

      // Time-dependent inspiral: separation shrinks
      var totalM = state.mass1 + state.mass2;
      var inspiralRate = totalM / 800;
      if (state.running) {
        if (state.separation > 5) {
          state.separation -= inspiralRate;
          state.time += 0.1;
        } else {
          // Merger reset after a flash
          if (state.separation > -10) {
            state.separation -= inspiralRate;
          }
        }
      }

      var merged = state.separation <= 5;
      var sep = Math.max(0, state.separation);

      // Orbital frequency increases as they spiral
      var freq = 1 / Math.max(2, Math.pow(state.separation, 1.5) * 0.04);
      var theta1 = state.time * freq * 4;
      var theta2 = theta1 + Math.PI;

      // Position both black holes
      var r1 = sep * state.mass2 / totalM;
      var r2 = sep * state.mass1 / totalM;

      var size1 = Math.sqrt(state.mass1) * 1.8;
      var size2 = Math.sqrt(state.mass2) * 1.8;

      // Ripples (concentric circles)
      for (var k = 0; k < 6; k++) {
        var r = ((state.time * 8 + k * 28) % 130) + 15;
        var rip = document.createElementNS(svgNS, 'circle');
        rip.setAttribute('cx', CX); rip.setAttribute('cy', CY);
        rip.setAttribute('r', r);
        rip.setAttribute('fill', 'none');
        rip.setAttribute('stroke', '#7c2030');
        rip.setAttribute('stroke-width', '0.8');
        rip.setAttribute('opacity', String(0.7 - r / 200));
        dynG.appendChild(rip);
      }

      if (!merged) {
        // Two black holes orbiting
        var bh1 = document.createElementNS(svgNS, 'circle');
        bh1.setAttribute('cx', CX + r1 * Math.cos(theta1));
        bh1.setAttribute('cy', CY + r1 * Math.sin(theta1));
        bh1.setAttribute('r', size1);
        bh1.setAttribute('fill', '#1f1a14');
        bh1.setAttribute('stroke', '#d49a2a'); bh1.setAttribute('stroke-width', '1');
        dynG.appendChild(bh1);
        var bh2 = document.createElementNS(svgNS, 'circle');
        bh2.setAttribute('cx', CX + r2 * Math.cos(theta2));
        bh2.setAttribute('cy', CY + r2 * Math.sin(theta2));
        bh2.setAttribute('r', size2);
        bh2.setAttribute('fill', '#1f1a14');
        bh2.setAttribute('stroke', '#d49a2a'); bh2.setAttribute('stroke-width', '1');
        dynG.appendChild(bh2);
      } else {
        // Merged black hole
        var merged_size = Math.sqrt(state.mass1 + state.mass2) * 1.8;
        var mBH = document.createElementNS(svgNS, 'circle');
        mBH.setAttribute('cx', CX); mBH.setAttribute('cy', CY);
        mBH.setAttribute('r', merged_size + (state.separation < -5 ? 0 : (5 - state.separation)));
        mBH.setAttribute('fill', '#1f1a14');
        mBH.setAttribute('stroke', '#d49a2a'); mBH.setAttribute('stroke-width', '2');
        dynG.appendChild(mBH);
        var flash = document.createElementNS(svgNS, 'circle');
        flash.setAttribute('cx', CX); flash.setAttribute('cy', CY);
        flash.setAttribute('r', merged_size + 30);
        flash.setAttribute('fill', '#d49a2a');
        flash.setAttribute('opacity', String(Math.max(0, 0.5 + state.separation / 10)));
        dynG.insertBefore(flash, dynG.firstChild);
      }

      // Title labels
      var l = document.createElementNS(svgNS, 'text');
      l.setAttribute('x', CX); l.setAttribute('y', 30);
      l.setAttribute('class', 'sim-label'); l.setAttribute('text-anchor', 'middle'); l.setAttribute('font-weight', '700');
      l.textContent = merged ? '합병!' : '나선 인스파이럴';
      dynG.appendChild(l);

      // Waveform on right
      clear(waveformG);
      var waveAmp = (1 / Math.max(2, state.separation)) * 30;
      var waveSig = Math.sin(state.time * freq * 8) * waveAmp;
      waveformHistory.push(waveSig);
      if (waveformHistory.length > 200) waveformHistory.shift();

      var WX = 280, WY = 60, WW = 180, WH = 200;
      var wf = document.createElementNS(svgNS, 'rect');
      wf.setAttribute('x', WX); wf.setAttribute('y', WY);
      wf.setAttribute('width', WW); wf.setAttribute('height', WH);
      wf.setAttribute('fill', '#1f1a14');
      wf.setAttribute('stroke', '#6b6253');
      waveformG.appendChild(wf);
      // Mid line
      var mid = document.createElementNS(svgNS, 'line');
      mid.setAttribute('x1', WX); mid.setAttribute('y1', WY + WH / 2);
      mid.setAttribute('x2', WX + WW); mid.setAttribute('y2', WY + WH / 2);
      mid.setAttribute('stroke', '#6b6253');
      waveformG.appendChild(mid);
      // Waveform
      var pts = waveformHistory.map(function (v, i) {
        var px = WX + (i / 200) * WW;
        var py = WY + WH / 2 + v;
        return px + ',' + py;
      }).join(' ');
      var wave = document.createElementNS(svgNS, 'polyline');
      wave.setAttribute('points', pts);
      wave.setAttribute('fill', 'none');
      wave.setAttribute('stroke', '#d49a2a');
      wave.setAttribute('stroke-width', '1.2');
      waveformG.appendChild(wave);
      var wtitle = document.createElementNS(svgNS, 'text');
      wtitle.setAttribute('x', WX + WW / 2); wtitle.setAttribute('y', WY - 6);
      wtitle.setAttribute('class', 'sim-label'); wtitle.setAttribute('text-anchor', 'middle'); wtitle.setAttribute('font-weight', '700');
      wtitle.textContent = 'LIGO 검출 신호';
      waveformG.appendChild(wtitle);

      readout.querySelector('#gw-total').textContent = totalM;
      readout.querySelector('#gw-sep').textContent = Math.max(0, state.separation).toFixed(0);
      readout.querySelector('#gw-phase').textContent = merged ? '병합 후' : '인스파이럴';
    }

    function loop() {
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  document.querySelectorAll('[data-sim-id$=".sim.gravitational-wave"]').forEach(init);
})();
