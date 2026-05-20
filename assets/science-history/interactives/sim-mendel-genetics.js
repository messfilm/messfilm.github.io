/* ============================================================
   Simulation: Mendel's pea genetics — Punnett square + 3:1 ratio
   (Gregor Mendel, 1866, Brno)
   Mounted on: data-sim-id="science.era.04-classical.sim.mendel-genetics"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-mendel-genetics');

    // State: which gamete combination is highlighted, sample size for ratio
    var state = {
      sample: 800,           // F2 generation sample size
      // Y = yellow (dominant), g = green (recessive)
      // F1 cross: Yg × Yg → YY, Yg, gY, gg
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var sampleLabel = document.createElement('label');
    sampleLabel.className = 'sim-range';
    sampleLabel.innerHTML = '<span>F₂ 표본 크기 <em class="sim-val" id="mdl-n">800</em></span>';
    var sampleInput = document.createElement('input');
    sampleInput.type = 'range';
    sampleInput.min = '20'; sampleInput.max = '4000'; sampleInput.step = '20'; sampleInput.value = '800';
    sampleInput.addEventListener('input', function () {
      state.sample = parseInt(sampleInput.value, 10);
      sampleLabel.querySelector('.sim-val').textContent = state.sample;
      render();
    });
    sampleLabel.appendChild(sampleInput);
    controls.appendChild(sampleLabel);

    var rollBtn = document.createElement('button');
    rollBtn.type = 'button';
    rollBtn.className = 'sim-btn';
    rollBtn.textContent = '🎲 다시 추출';
    rollBtn.addEventListener('click', function () { render(); });
    controls.appendChild(rollBtn);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '멘델은 약 28,000개의 콩으로 실험했다. 노란 콩(Y, 우성) × 녹색 콩(g, 열성)의 F₁ 모두 노란색. F₁끼리 교배한 F₂에서는 노란:녹색 = *약 3:1*. 표본이 클수록 비율이 3:1에 가까워진다 — *통계적 법칙*의 등장.';
    container.appendChild(caption);

    var W = 480, H = 380;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '멘델 유전 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var dynamicGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicGroup);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>노란 콩 = <em id="mdl-yellow">…</em></span>' +
      '<span>녹색 콩 = <em id="mdl-green">…</em></span>' +
      '<span>비율 = <em id="mdl-ratio">…</em></span>';
    container.appendChild(readout);

    function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clearGroup(dynamicGroup);

      // ===== Punnett square (top half) =====
      var SQ_X = 20, SQ_Y = 20, SQ_W = 200, SQ_H = 140;
      var cellW = SQ_W / 3, cellH = SQ_H / 3;

      // Header labels
      var titles = [['', 'Y', 'g'], ['Y', 'YY', 'Yg'], ['g', 'gY', 'gg']];
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          var cellX = SQ_X + c * cellW;
          var cellY = SQ_Y + r * cellH;
          var fill = '#f5efe0';
          var fc = '#1f1a14';
          var fw = '500';
          if (r > 0 && c > 0) {
            // F2 genotype
            var g = titles[r][c];
            var hasUpper = g[0] === 'Y' || g[1] === 'Y';
            fill = hasUpper ? '#d49a2a' : '#6a8f7e';
            fc = '#faf6eb';
            fw = '700';
          } else if (r === 0 && c === 0) {
            fill = '#3a3328';
            fc = '#faf6eb';
          }
          var cell = document.createElementNS(svgNS, 'rect');
          cell.setAttribute('x', cellX); cell.setAttribute('y', cellY);
          cell.setAttribute('width', cellW); cell.setAttribute('height', cellH);
          cell.setAttribute('fill', fill);
          cell.setAttribute('stroke', '#1f1a14');
          cell.setAttribute('stroke-width', '0.8');
          dynamicGroup.appendChild(cell);
          if (titles[r][c]) {
            var lb = document.createElementNS(svgNS, 'text');
            lb.setAttribute('x', cellX + cellW / 2);
            lb.setAttribute('y', cellY + cellH / 2 + 5);
            lb.setAttribute('class', 'sim-label');
            lb.setAttribute('text-anchor', 'middle');
            lb.setAttribute('font-size', '16');
            lb.setAttribute('font-weight', fw);
            lb.setAttribute('fill', fc);
            lb.textContent = titles[r][c];
            dynamicGroup.appendChild(lb);
          }
        }
      }
      var pTitle = document.createElementNS(svgNS, 'text');
      pTitle.setAttribute('x', SQ_X + SQ_W / 2); pTitle.setAttribute('y', SQ_Y - 6);
      pTitle.setAttribute('class', 'sim-label');
      pTitle.setAttribute('text-anchor', 'middle');
      pTitle.setAttribute('font-weight', '700');
      pTitle.textContent = '푸넷 사각형 (Yg × Yg)';
      dynamicGroup.appendChild(pTitle);

      // Legend / ratio breakdown next to square
      var lgX = 240, lgY = 30;
      var lgLines = [
        ['1 YY', '#d49a2a', '노란 (순종)'],
        ['2 Yg', '#d49a2a', '노란 (잡종)'],
        ['1 gg', '#6a8f7e', '녹색 (순종)']
      ];
      lgLines.forEach(function (line, i) {
        var lgRect = document.createElementNS(svgNS, 'rect');
        lgRect.setAttribute('x', lgX); lgRect.setAttribute('y', lgY + i * 28);
        lgRect.setAttribute('width', 14); lgRect.setAttribute('height', 14);
        lgRect.setAttribute('fill', line[1]);
        lgRect.setAttribute('stroke', '#1f1a14');
        dynamicGroup.appendChild(lgRect);
        var lgL = document.createElementNS(svgNS, 'text');
        lgL.setAttribute('x', lgX + 22); lgL.setAttribute('y', lgY + i * 28 + 12);
        lgL.setAttribute('class', 'sim-label');
        lgL.setAttribute('font-size', '12');
        lgL.textContent = line[0] + ' — ' + line[2];
        dynamicGroup.appendChild(lgL);
      });
      var ratioLb = document.createElementNS(svgNS, 'text');
      ratioLb.setAttribute('x', lgX); ratioLb.setAttribute('y', lgY + 100);
      ratioLb.setAttribute('class', 'sim-label');
      ratioLb.setAttribute('font-weight', '700');
      ratioLb.setAttribute('font-size', '13');
      ratioLb.textContent = '표현형 노란:녹색 = 3:1';
      dynamicGroup.appendChild(ratioLb);

      // ===== F2 sample visualization (bottom half) =====
      var GY0 = 200, GH2 = 160;
      var n = state.sample;
      // Each F2 individual: independent draw of two alleles, each 50/50 Y or g
      var ny = 0, ng = 0;
      for (var i = 0; i < n; i++) {
        var a1 = Math.random() < 0.5 ? 'Y' : 'g';
        var a2 = Math.random() < 0.5 ? 'Y' : 'g';
        if (a1 === 'Y' || a2 === 'Y') ny++;
        else ng++;
      }

      // Draw bar comparison
      var BX = 30, BY = GY0 + 40, BW = W - 60, BH = 36;
      var yellowW = BW * (ny / n);
      var yellowRect = document.createElementNS(svgNS, 'rect');
      yellowRect.setAttribute('x', BX); yellowRect.setAttribute('y', BY);
      yellowRect.setAttribute('width', yellowW); yellowRect.setAttribute('height', BH);
      yellowRect.setAttribute('fill', '#d49a2a');
      dynamicGroup.appendChild(yellowRect);
      var greenRect = document.createElementNS(svgNS, 'rect');
      greenRect.setAttribute('x', BX + yellowW); greenRect.setAttribute('y', BY);
      greenRect.setAttribute('width', BW - yellowW); greenRect.setAttribute('height', BH);
      greenRect.setAttribute('fill', '#6a8f7e');
      dynamicGroup.appendChild(greenRect);
      // 3:1 ideal line
      var ideal = document.createElementNS(svgNS, 'line');
      ideal.setAttribute('x1', BX + BW * 0.75); ideal.setAttribute('y1', BY - 6);
      ideal.setAttribute('x2', BX + BW * 0.75); ideal.setAttribute('y2', BY + BH + 6);
      ideal.setAttribute('stroke', '#1f1a14');
      ideal.setAttribute('stroke-width', '1.4');
      ideal.setAttribute('stroke-dasharray', '4 3');
      dynamicGroup.appendChild(ideal);
      var idealLb = document.createElementNS(svgNS, 'text');
      idealLb.setAttribute('x', BX + BW * 0.75); idealLb.setAttribute('y', BY - 10);
      idealLb.setAttribute('class', 'sim-label');
      idealLb.setAttribute('text-anchor', 'middle');
      idealLb.setAttribute('font-weight', '600');
      idealLb.textContent = '이론값 3:1';
      dynamicGroup.appendChild(idealLb);
      // Counts in bar
      if (yellowW > 50) {
        var yt = document.createElementNS(svgNS, 'text');
        yt.setAttribute('x', BX + yellowW / 2);
        yt.setAttribute('y', BY + BH / 2 + 5);
        yt.setAttribute('class', 'sim-label');
        yt.setAttribute('text-anchor', 'middle');
        yt.setAttribute('font-weight', '700');
        yt.setAttribute('fill', '#1f1a14');
        yt.textContent = '노란 ' + ny + ' (' + (ny / n * 100).toFixed(1) + '%)';
        dynamicGroup.appendChild(yt);
      }
      if (BW - yellowW > 50) {
        var gt = document.createElementNS(svgNS, 'text');
        gt.setAttribute('x', BX + yellowW + (BW - yellowW) / 2);
        gt.setAttribute('y', BY + BH / 2 + 5);
        gt.setAttribute('class', 'sim-label');
        gt.setAttribute('text-anchor', 'middle');
        gt.setAttribute('font-weight', '700');
        gt.setAttribute('fill', '#faf6eb');
        gt.textContent = '녹색 ' + ng;
        dynamicGroup.appendChild(gt);
      }

      var f2Title = document.createElementNS(svgNS, 'text');
      f2Title.setAttribute('x', BX); f2Title.setAttribute('y', GY0 + 20);
      f2Title.setAttribute('class', 'sim-label');
      f2Title.setAttribute('font-weight', '700');
      f2Title.setAttribute('font-size', '12');
      f2Title.textContent = 'F₂ ' + n + '개 표본 — 무작위 추출';
      dynamicGroup.appendChild(f2Title);

      readout.querySelector('#mdl-yellow').textContent = ny;
      readout.querySelector('#mdl-green').textContent = ng;
      readout.querySelector('#mdl-ratio').textContent =
        (ny / ng).toFixed(2) + ' : 1 (이론 3.00 : 1)';
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.mendel-genetics"]').forEach(init);
})();
