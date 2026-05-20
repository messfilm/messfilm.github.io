/* ============================================================
   Simulation: al-Khwarizmi's geometric completing-the-square
   (Baghdad, ~825, Kitāb al-jabr)
   Mounted on: data-sim-id="science.era.02-medieval.sim.completing-square"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-completing-square');

    var state = { b: 10, c: 39 };  // x² + bx = c (al-Khwarizmi's classic example)

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var bLabel = document.createElement('label');
    bLabel.className = 'sim-range';
    bLabel.innerHTML = '<span>b (선형 계수) <em class="sim-val" id="cs-b">10</em></span>';
    var bInput = document.createElement('input');
    bInput.type = 'range';
    bInput.min = '2'; bInput.max = '14'; bInput.step = '0.5'; bInput.value = '10';
    bInput.addEventListener('input', function () {
      state.b = parseFloat(bInput.value);
      bLabel.querySelector('.sim-val').textContent = state.b.toFixed(1);
      render();
    });
    bLabel.appendChild(bInput);
    controls.appendChild(bLabel);

    var cLabel = document.createElement('label');
    cLabel.className = 'sim-range';
    cLabel.innerHTML = '<span>c (상수) <em class="sim-val" id="cs-c">39</em></span>';
    var cInput = document.createElement('input');
    cInput.type = 'range';
    cInput.min = '5'; cInput.max = '80'; cInput.step = '1'; cInput.value = '39';
    cInput.addEventListener('input', function () {
      state.c = parseFloat(cInput.value);
      cLabel.querySelector('.sim-val').textContent = state.c.toFixed(0);
      render();
    });
    cLabel.appendChild(cInput);
    controls.appendChild(cLabel);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '알 콰리즈미의 대수 — 이차방정식 x² + bx = c를 사각형 완성으로 푸는 기하 풀이. 큰 사각형 x²에 폭 b/2 직사각형 둘을 붙이고, 빠진 모서리(b/2)²만 채우면 변 x+b/2의 큰 정사각형. 그 면적은 c + (b/2)².';
    container.appendChild(caption);

    var W = 480, H = 380;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '알 콰리즈미 사각형 완성법 시각화');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var dynamicGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicGroup);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>방정식 x² + bx = c → x = <em id="cs-x">…</em></span>' +
      '<span>(x + b/2)² = c + (b/2)² = <em id="cs-sum">…</em></span>';
    container.appendChild(readout);

    function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clearGroup(dynamicGroup);

      var b = state.b, c = state.c;
      var x = (-b + Math.sqrt(b * b + 4 * c)) / 2;
      if (!isFinite(x) || x <= 0) {
        readout.querySelector('#cs-x').textContent = '실근 없음';
        readout.querySelector('#cs-sum').textContent = (c + b * b / 4).toFixed(2);
        return;
      }
      var halfB = b / 2;

      // Scale: pick a unit such that the big square (x + halfB) fits in ~260 px
      var totalSide = x + halfB;
      var UNIT = Math.min(280 / totalSide, 30);
      var OX = (W - totalSide * UNIT) / 2;
      var OY = 50;

      // Big completed square (outer border, dashed)
      var bigSq = document.createElementNS(svgNS, 'rect');
      bigSq.setAttribute('x', OX);
      bigSq.setAttribute('y', OY);
      bigSq.setAttribute('width', totalSide * UNIT);
      bigSq.setAttribute('height', totalSide * UNIT);
      bigSq.setAttribute('fill', 'none');
      bigSq.setAttribute('stroke', '#1f1a14');
      bigSq.setAttribute('stroke-width', '1.4');
      bigSq.setAttribute('stroke-dasharray', '5 4');
      dynamicGroup.appendChild(bigSq);

      // Inner x² square (top-left)
      var xSq = document.createElementNS(svgNS, 'rect');
      xSq.setAttribute('x', OX);
      xSq.setAttribute('y', OY);
      xSq.setAttribute('width', x * UNIT);
      xSq.setAttribute('height', x * UNIT);
      xSq.setAttribute('fill', '#2a5680'); xSq.setAttribute('opacity', '0.55');
      xSq.setAttribute('stroke', '#2a5680'); xSq.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(xSq);
      var xLb = document.createElementNS(svgNS, 'text');
      xLb.setAttribute('x', OX + x * UNIT / 2);
      xLb.setAttribute('y', OY + x * UNIT / 2 + 5);
      xLb.setAttribute('class', 'sim-label');
      xLb.setAttribute('text-anchor', 'middle');
      xLb.setAttribute('fill', '#faf6eb');
      xLb.setAttribute('font-weight', '600');
      xLb.setAttribute('font-size', '14');
      xLb.textContent = 'x²';
      dynamicGroup.appendChild(xLb);

      // Right strip: x × b/2
      var rStrip = document.createElementNS(svgNS, 'rect');
      rStrip.setAttribute('x', OX + x * UNIT);
      rStrip.setAttribute('y', OY);
      rStrip.setAttribute('width', halfB * UNIT);
      rStrip.setAttribute('height', x * UNIT);
      rStrip.setAttribute('fill', '#a04030'); rStrip.setAttribute('opacity', '0.55');
      rStrip.setAttribute('stroke', '#a04030'); rStrip.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(rStrip);
      var rLb = document.createElementNS(svgNS, 'text');
      rLb.setAttribute('x', OX + x * UNIT + halfB * UNIT / 2);
      rLb.setAttribute('y', OY + x * UNIT / 2 + 4);
      rLb.setAttribute('class', 'sim-label');
      rLb.setAttribute('text-anchor', 'middle');
      rLb.setAttribute('fill', '#faf6eb');
      rLb.setAttribute('font-weight', '600');
      rLb.textContent = '(b/2)·x';
      dynamicGroup.appendChild(rLb);

      // Bottom strip: b/2 × x
      var bStrip = document.createElementNS(svgNS, 'rect');
      bStrip.setAttribute('x', OX);
      bStrip.setAttribute('y', OY + x * UNIT);
      bStrip.setAttribute('width', x * UNIT);
      bStrip.setAttribute('height', halfB * UNIT);
      bStrip.setAttribute('fill', '#a04030'); bStrip.setAttribute('opacity', '0.55');
      bStrip.setAttribute('stroke', '#a04030'); bStrip.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(bStrip);
      var bLb2 = document.createElementNS(svgNS, 'text');
      bLb2.setAttribute('x', OX + x * UNIT / 2);
      bLb2.setAttribute('y', OY + x * UNIT + halfB * UNIT / 2 + 4);
      bLb2.setAttribute('class', 'sim-label');
      bLb2.setAttribute('text-anchor', 'middle');
      bLb2.setAttribute('fill', '#faf6eb');
      bLb2.setAttribute('font-weight', '600');
      bLb2.textContent = '(b/2)·x';
      dynamicGroup.appendChild(bLb2);

      // Corner: (b/2)²
      var corner = document.createElementNS(svgNS, 'rect');
      corner.setAttribute('x', OX + x * UNIT);
      corner.setAttribute('y', OY + x * UNIT);
      corner.setAttribute('width', halfB * UNIT);
      corner.setAttribute('height', halfB * UNIT);
      corner.setAttribute('fill', '#d49a2a'); corner.setAttribute('opacity', '0.7');
      corner.setAttribute('stroke', '#a37e2c'); corner.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(corner);
      var cornerLb = document.createElementNS(svgNS, 'text');
      cornerLb.setAttribute('x', OX + x * UNIT + halfB * UNIT / 2);
      cornerLb.setAttribute('y', OY + x * UNIT + halfB * UNIT / 2 + 4);
      cornerLb.setAttribute('class', 'sim-label');
      cornerLb.setAttribute('text-anchor', 'middle');
      cornerLb.setAttribute('fill', '#1f1a14');
      cornerLb.setAttribute('font-weight', '700');
      cornerLb.textContent = '(b/2)²';
      dynamicGroup.appendChild(cornerLb);

      // Side labels
      var sideX = document.createElementNS(svgNS, 'text');
      sideX.setAttribute('x', OX + x * UNIT / 2);
      sideX.setAttribute('y', OY - 8);
      sideX.setAttribute('class', 'sim-label');
      sideX.setAttribute('text-anchor', 'middle');
      sideX.setAttribute('fill', '#1f1a14');
      sideX.setAttribute('font-weight', '600');
      sideX.textContent = 'x = ' + x.toFixed(2);
      dynamicGroup.appendChild(sideX);

      var sideHalfB = document.createElementNS(svgNS, 'text');
      sideHalfB.setAttribute('x', OX + x * UNIT + halfB * UNIT / 2);
      sideHalfB.setAttribute('y', OY - 8);
      sideHalfB.setAttribute('class', 'sim-label');
      sideHalfB.setAttribute('text-anchor', 'middle');
      sideHalfB.setAttribute('fill', '#1f1a14');
      sideHalfB.setAttribute('font-weight', '600');
      sideHalfB.textContent = 'b/2 = ' + halfB.toFixed(1);
      dynamicGroup.appendChild(sideHalfB);

      var totalLb = document.createElementNS(svgNS, 'text');
      totalLb.setAttribute('x', OX + totalSide * UNIT + 10);
      totalLb.setAttribute('y', OY + totalSide * UNIT / 2);
      totalLb.setAttribute('class', 'sim-label');
      totalLb.setAttribute('fill', '#7a4030');
      totalLb.setAttribute('font-weight', '700');
      totalLb.textContent = 'x + b/2';
      dynamicGroup.appendChild(totalLb);

      readout.querySelector('#cs-x').textContent = x.toFixed(3);
      readout.querySelector('#cs-sum').textContent = (c + halfB * halfB).toFixed(2)
        + ' → x + b/2 = ' + Math.sqrt(c + halfB * halfB).toFixed(3);
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.completing-square"]').forEach(init);
})();
