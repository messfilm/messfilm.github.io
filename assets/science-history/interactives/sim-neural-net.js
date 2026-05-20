/* ============================================================
   Simulation: Single-layer perceptron — learns to separate points
   (Rosenblatt 1958, lineage to modern deep learning)
   Mounted on: data-sim-id="science.era.06-contemporary.sim.neural-net"
   ============================================================ */

(function () {
  'use strict';
  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-neural-net');

    var W = 480, H = 360;
    var PLOT = { x: 30, y: 30, w: 320, h: 300 };

    // State
    var state = {
      points: [],            // {x, y, label: 1|0}
      weights: { w1: 0.3, w2: -0.4, b: 0 },
      learning: false,
      learningRate: 0.05,
      epoch: 0,
      accuracy: 0
    };

    // Generate two clusters (linearly separable)
    function reseed() {
      state.points = [];
      var cx1 = PLOT.x + PLOT.w * 0.30, cy1 = PLOT.y + PLOT.h * 0.35;
      var cx2 = PLOT.x + PLOT.w * 0.70, cy2 = PLOT.y + PLOT.h * 0.70;
      for (var i = 0; i < 12; i++) {
        state.points.push({
          x: cx1 + (Math.random() - 0.5) * 80,
          y: cy1 + (Math.random() - 0.5) * 80,
          label: 1
        });
        state.points.push({
          x: cx2 + (Math.random() - 0.5) * 80,
          y: cy2 + (Math.random() - 0.5) * 80,
          label: 0
        });
      }
      state.weights = { w1: 0.3, w2: -0.4, b: 0 };
      state.epoch = 0;
    }
    reseed();

    // Convert screen to normalized [-1, 1]
    function normalize(p) {
      return {
        nx: (p.x - PLOT.x - PLOT.w / 2) / (PLOT.w / 2),
        ny: (p.y - PLOT.y - PLOT.h / 2) / (PLOT.h / 2)
      };
    }

    // Forward pass: sigmoid(w1·x + w2·y + b)
    function predict(p) {
      var n = normalize(p);
      var z = state.weights.w1 * n.nx + state.weights.w2 * n.ny + state.weights.b;
      return 1 / (1 + Math.exp(-z));
    }

    // One training step: gradient descent on cross-entropy
    function trainStep() {
      var total = 0, correct = 0;
      state.points.forEach(function (p) {
        var n = normalize(p);
        var z = state.weights.w1 * n.nx + state.weights.w2 * n.ny + state.weights.b;
        var pred = 1 / (1 + Math.exp(-z));
        var err = pred - p.label;
        state.weights.w1 -= state.learningRate * err * n.nx;
        state.weights.w2 -= state.learningRate * err * n.ny;
        state.weights.b  -= state.learningRate * err;
        if ((pred > 0.5 ? 1 : 0) === p.label) correct++;
        total++;
      });
      state.epoch++;
      state.accuracy = total > 0 ? correct / total : 0;
    }

    // Controls
    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var learnBtn = document.createElement('button');
    learnBtn.type = 'button';
    learnBtn.className = 'sim-btn';
    learnBtn.textContent = '▶ 학습 시작';
    learnBtn.addEventListener('click', function () {
      state.learning = !state.learning;
      learnBtn.textContent = state.learning ? '⏸ 멈춤' : '▶ 학습 시작';
    });
    controls.appendChild(learnBtn);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'sim-btn';
    resetBtn.textContent = '↻ 새 데이터';
    resetBtn.addEventListener('click', function () {
      reseed();
      state.learning = false;
      learnBtn.textContent = '▶ 학습 시작';
      render();
    });
    controls.appendChild(resetBtn);

    var lrL = document.createElement('label');
    lrL.className = 'sim-range';
    lrL.innerHTML = '<span>학습률 <em class="sim-val" id="nn-lr">0.05</em></span>';
    var lrI = document.createElement('input');
    lrI.type = 'range'; lrI.min = '0.01'; lrI.max = '0.3'; lrI.step = '0.01'; lrI.value = '0.05';
    lrI.addEventListener('input', function () {
      state.learningRate = parseFloat(lrI.value);
      lrL.querySelector('.sim-val').textContent = state.learningRate.toFixed(2);
    });
    lrL.appendChild(lrI);
    controls.appendChild(lrL);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '가장 단순한 신경망 — <em>퍼셉트론</em>. 두 종류의 점(파랑·빨강)을 가르는 직선을 학습으로 찾는다. 1958년 로젠블랫의 발명. 현대 딥러닝 — 이미지 인식, 언어 모델 — 도 결국 이 단순한 발상의 *수많은 층 쌓기*다.';
    container.appendChild(caption);

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '신경망 학습 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', PLOT.x); bg.setAttribute('y', PLOT.y);
    bg.setAttribute('width', PLOT.w); bg.setAttribute('height', PLOT.h);
    bg.setAttribute('fill', '#f5efe0');
    bg.setAttribute('stroke', '#a09078');
    bg.setAttribute('stroke-width', '0.6');
    svg.appendChild(bg);

    var dynG = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynG);

    // Network diagram on right
    var netG = document.createElementNS(svgNS, 'g');
    netG.setAttribute('transform', 'translate(370, 60)');
    svg.appendChild(netG);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>학습 횟수 <em id="nn-epoch">0</em></span>' +
      '<span>정확도 <em id="nn-acc">…</em></span>';
    container.appendChild(readout);

    function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clear(dynG);

      // Decision boundary: w1·nx + w2·ny + b = 0
      // => ny = (-w1·nx - b) / w2
      var w1 = state.weights.w1, w2 = state.weights.w2, b = state.weights.b;
      if (Math.abs(w2) > 0.001) {
        var nxA = -1, nxB = 1;
        var nyA = (-w1 * nxA - b) / w2;
        var nyB = (-w1 * nxB - b) / w2;
        // Convert back to screen
        var sxA = PLOT.x + PLOT.w / 2 + nxA * PLOT.w / 2;
        var syA = PLOT.y + PLOT.h / 2 + nyA * PLOT.h / 2;
        var sxB = PLOT.x + PLOT.w / 2 + nxB * PLOT.w / 2;
        var syB = PLOT.y + PLOT.h / 2 + nyB * PLOT.h / 2;
        var line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', sxA); line.setAttribute('y1', syA);
        line.setAttribute('x2', sxB); line.setAttribute('y2', syB);
        line.setAttribute('stroke', '#7a4030');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '4 2');
        dynG.appendChild(line);
      }

      // Color regions (subtle)
      for (var sy = PLOT.y; sy < PLOT.y + PLOT.h; sy += 12) {
        for (var sx = PLOT.x; sx < PLOT.x + PLOT.w; sx += 12) {
          var p = predict({ x: sx, y: sy });
          var r = document.createElementNS(svgNS, 'rect');
          r.setAttribute('x', sx); r.setAttribute('y', sy);
          r.setAttribute('width', 12); r.setAttribute('height', 12);
          r.setAttribute('fill', p > 0.5 ? '#2a5680' : '#a04030');
          r.setAttribute('opacity', String(Math.abs(p - 0.5) * 0.35));
          dynG.appendChild(r);
        }
      }

      // Points
      state.points.forEach(function (p) {
        var c = document.createElementNS(svgNS, 'circle');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
        c.setAttribute('r', 5);
        c.setAttribute('fill', p.label === 1 ? '#2a5680' : '#a04030');
        c.setAttribute('stroke', '#1f1a14');
        c.setAttribute('stroke-width', '0.6');
        dynG.appendChild(c);
      });

      // Mini network diagram
      clear(netG);
      // Inputs x, y → neuron → output
      var inputs = [
        { x: 0, y: 0, label: 'x' },
        { x: 0, y: 40, label: 'y' },
        { x: 0, y: 80, label: '1' }
      ];
      var weights = [w1, w2, b];
      var neuron = { x: 80, y: 40 };
      inputs.forEach(function (inp, i) {
        var c = document.createElementNS(svgNS, 'circle');
        c.setAttribute('cx', inp.x); c.setAttribute('cy', inp.y); c.setAttribute('r', 10);
        c.setAttribute('fill', '#faf6eb'); c.setAttribute('stroke', '#1f1a14'); c.setAttribute('stroke-width', '1');
        netG.appendChild(c);
        var t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', inp.x); t.setAttribute('y', inp.y + 4);
        t.setAttribute('class', 'sim-label'); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-weight', '700');
        t.textContent = inp.label;
        netG.appendChild(t);
        // Edge with weight
        var ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', inp.x + 10); ln.setAttribute('y1', inp.y);
        ln.setAttribute('x2', neuron.x - 10); ln.setAttribute('y2', neuron.y);
        var w = weights[i];
        ln.setAttribute('stroke', w > 0 ? '#2d5a3f' : '#7c2030');
        ln.setAttribute('stroke-width', String(Math.min(3, Math.abs(w) * 2 + 0.4)));
        netG.appendChild(ln);
        var wt = document.createElementNS(svgNS, 'text');
        wt.setAttribute('x', (inp.x + neuron.x) / 2); wt.setAttribute('y', (inp.y + neuron.y) / 2 - 4);
        wt.setAttribute('class', 'sim-label'); wt.setAttribute('text-anchor', 'middle'); wt.setAttribute('font-size', '8');
        wt.textContent = w.toFixed(2);
        netG.appendChild(wt);
      });
      var n = document.createElementNS(svgNS, 'circle');
      n.setAttribute('cx', neuron.x); n.setAttribute('cy', neuron.y); n.setAttribute('r', 14);
      n.setAttribute('fill', '#d49a2a'); n.setAttribute('stroke', '#1f1a14');
      netG.appendChild(n);
      var nt = document.createElementNS(svgNS, 'text');
      nt.setAttribute('x', neuron.x); nt.setAttribute('y', neuron.y + 4);
      nt.setAttribute('class', 'sim-label'); nt.setAttribute('text-anchor', 'middle'); nt.setAttribute('font-weight', '700'); nt.setAttribute('font-size', '11');
      nt.textContent = 'σ';
      netG.appendChild(nt);

      readout.querySelector('#nn-epoch').textContent = state.epoch;
      readout.querySelector('#nn-acc').textContent = (state.accuracy * 100).toFixed(1) + '%';
    }

    function loop() {
      if (state.learning && state.epoch < 500) {
        for (var k = 0; k < 3; k++) trainStep();
      }
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  document.querySelectorAll('[data-sim-id$=".sim.neural-net"]').forEach(init);
})();
