/* ============================================================
   Simulation: Pythagoras theorem visualized (a² + b² = c²)
   Mounted on: data-sim-id="science.era.01-ancient.sim.pythagoras"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-pythagoras');

    var state = { a: 3, b: 4 };  // legs in grid units

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var aLabel = document.createElement('label');
    aLabel.className = 'sim-range';
    aLabel.innerHTML = '<span>a (밑변) <em class="sim-val" id="pyt-a">3</em></span>';
    var aInput = document.createElement('input');
    aInput.type = 'range';
    aInput.min = '1'; aInput.max = '6'; aInput.step = '0.1'; aInput.value = '3';
    aInput.addEventListener('input', function () {
      state.a = parseFloat(aInput.value);
      aLabel.querySelector('.sim-val').textContent = state.a.toFixed(1);
      render();
    });
    aLabel.appendChild(aInput);
    controls.appendChild(aLabel);

    var bLabel = document.createElement('label');
    bLabel.className = 'sim-range';
    bLabel.innerHTML = '<span>b (높이) <em class="sim-val" id="pyt-b">4</em></span>';
    var bInput = document.createElement('input');
    bInput.type = 'range';
    bInput.min = '1'; bInput.max = '6'; bInput.step = '0.1'; bInput.value = '4';
    bInput.addEventListener('input', function () {
      state.b = parseFloat(bInput.value);
      bLabel.querySelector('.sim-val').textContent = state.b.toFixed(1);
      render();
    });
    bLabel.appendChild(bInput);
    controls.appendChild(bLabel);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '직각삼각형의 두 짧은 변에 그린 정사각형의 면적의 합은 빗변에 그린 정사각형의 면적과 같다. a²+b²=c². 슬라이더로 두 변을 조절해보자.';
    container.appendChild(caption);

    var W = 480, H = 380;
    var ORIGIN_X = 200, ORIGIN_Y = 260;  // bottom-right of triangle
    var UNIT = 28;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '피타고라스 정리 시각화');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var dynamicGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicGroup);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>a² = <em id="pyt-a2">9</em></span>' +
      '<span>b² = <em id="pyt-b2">16</em></span>' +
      '<span>a² + b² = <em id="pyt-sum">25</em></span>' +
      '<span>c² = <em id="pyt-c2">25</em></span>';
    container.appendChild(readout);

    function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clearGroup(dynamicGroup);

      var a = state.a;
      var b = state.b;
      var c = Math.sqrt(a * a + b * b);

      // Triangle vertices in svg coords
      // Right angle at origin (ORIGIN_X, ORIGIN_Y).
      // a is horizontal to the LEFT, b is vertical UP.
      var P1 = { x: ORIGIN_X,            y: ORIGIN_Y };                 // right angle
      var P2 = { x: ORIGIN_X - a * UNIT, y: ORIGIN_Y };                 // along a
      var P3 = { x: ORIGIN_X,            y: ORIGIN_Y - b * UNIT };      // along b

      // Square on a (below the leg a, downward)
      var sqA = document.createElementNS(svgNS, 'rect');
      sqA.setAttribute('x', P2.x);
      sqA.setAttribute('y', P1.y);
      sqA.setAttribute('width', a * UNIT);
      sqA.setAttribute('height', a * UNIT);
      sqA.setAttribute('fill', '#2a5680'); sqA.setAttribute('opacity', '0.45');
      sqA.setAttribute('stroke', '#2a5680'); sqA.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(sqA);
      var sqALb = document.createElementNS(svgNS, 'text');
      sqALb.setAttribute('x', P2.x + (a * UNIT) / 2);
      sqALb.setAttribute('y', P1.y + (a * UNIT) / 2 + 5);
      sqALb.setAttribute('class', 'sim-label');
      sqALb.setAttribute('text-anchor', 'middle');
      sqALb.setAttribute('fill', '#faf6eb');
      sqALb.setAttribute('font-weight', '600');
      sqALb.setAttribute('font-size', '12');
      sqALb.textContent = 'a² = ' + (a * a).toFixed(1);
      dynamicGroup.appendChild(sqALb);

      // Square on b (to the right, rightward)
      var sqB = document.createElementNS(svgNS, 'rect');
      sqB.setAttribute('x', P1.x);
      sqB.setAttribute('y', P3.y);
      sqB.setAttribute('width', b * UNIT);
      sqB.setAttribute('height', b * UNIT);
      sqB.setAttribute('fill', '#a04030'); sqB.setAttribute('opacity', '0.45');
      sqB.setAttribute('stroke', '#a04030'); sqB.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(sqB);
      var sqBLb = document.createElementNS(svgNS, 'text');
      sqBLb.setAttribute('x', P1.x + (b * UNIT) / 2);
      sqBLb.setAttribute('y', P3.y + (b * UNIT) / 2 + 5);
      sqBLb.setAttribute('class', 'sim-label');
      sqBLb.setAttribute('text-anchor', 'middle');
      sqBLb.setAttribute('fill', '#faf6eb');
      sqBLb.setAttribute('font-weight', '600');
      sqBLb.setAttribute('font-size', '12');
      sqBLb.textContent = 'b² = ' + (b * b).toFixed(1);
      dynamicGroup.appendChild(sqBLb);

      // Square on c (rotated, placed on the hypotenuse, outside the triangle)
      // Hypotenuse from P2 to P3
      // Direction from P2 to P3: (P3-P2)
      var dx = P3.x - P2.x;
      var dy = P3.y - P2.y;
      var len = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / len, uy = dy / len;
      // Normal pointing OUTward (away from right angle).
      // P1 is at (ORIGIN_X, ORIGIN_Y); the triangle's right angle is at P1.
      // Normal of hypotenuse: (-uy, ux) or (uy, -ux). Choose one pointing away from P1.
      // Midpoint of hypotenuse:
      var mx = (P2.x + P3.x) / 2;
      var my = (P2.y + P3.y) / 2;
      var n1x = -uy, n1y = ux;
      // Choose normal that points AWAY from P1
      var dot = (P1.x - mx) * n1x + (P1.y - my) * n1y;
      if (dot > 0) { n1x = -n1x; n1y = -n1y; }

      // Build square: P2 → P3 → P3+n*c*UNIT → P2+n*c*UNIT
      var Q1 = P2;
      var Q2 = P3;
      var Q3 = { x: P3.x + n1x * c * UNIT, y: P3.y + n1y * c * UNIT };
      var Q4 = { x: P2.x + n1x * c * UNIT, y: P2.y + n1y * c * UNIT };
      var sqC = document.createElementNS(svgNS, 'polygon');
      sqC.setAttribute('points',
        Q1.x + ',' + Q1.y + ' ' + Q2.x + ',' + Q2.y + ' ' + Q3.x + ',' + Q3.y + ' ' + Q4.x + ',' + Q4.y);
      sqC.setAttribute('fill', '#2d5a3f'); sqC.setAttribute('opacity', '0.45');
      sqC.setAttribute('stroke', '#2d5a3f'); sqC.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(sqC);
      // Center of square c for label
      var cxC = (Q1.x + Q3.x) / 2;
      var cyC = (Q1.y + Q3.y) / 2;
      var sqCLb = document.createElementNS(svgNS, 'text');
      sqCLb.setAttribute('x', cxC); sqCLb.setAttribute('y', cyC + 5);
      sqCLb.setAttribute('class', 'sim-label');
      sqCLb.setAttribute('text-anchor', 'middle');
      sqCLb.setAttribute('fill', '#faf6eb');
      sqCLb.setAttribute('font-weight', '600');
      sqCLb.setAttribute('font-size', '12');
      sqCLb.textContent = 'c² = ' + (c * c).toFixed(1);
      dynamicGroup.appendChild(sqCLb);

      // Triangle on top
      var tri = document.createElementNS(svgNS, 'polygon');
      tri.setAttribute('points', P1.x + ',' + P1.y + ' ' + P2.x + ',' + P2.y + ' ' + P3.x + ',' + P3.y);
      tri.setAttribute('fill', '#f5efe0');
      tri.setAttribute('stroke', '#1f1a14');
      tri.setAttribute('stroke-width', '1.4');
      dynamicGroup.appendChild(tri);

      // Right angle indicator
      var ra = document.createElementNS(svgNS, 'rect');
      ra.setAttribute('x', P1.x - 10);
      ra.setAttribute('y', P1.y - 10);
      ra.setAttribute('width', 10); ra.setAttribute('height', 10);
      ra.setAttribute('fill', 'none');
      ra.setAttribute('stroke', '#1f1a14');
      ra.setAttribute('stroke-width', '0.8');
      dynamicGroup.appendChild(ra);

      // Side labels (a, b, c)
      var aLb = document.createElementNS(svgNS, 'text');
      aLb.setAttribute('x', (P1.x + P2.x) / 2);
      aLb.setAttribute('y', P1.y - 4);
      aLb.setAttribute('class', 'sim-label');
      aLb.setAttribute('text-anchor', 'middle');
      aLb.setAttribute('fill', '#1f1a14');
      aLb.setAttribute('font-weight', '600');
      aLb.textContent = 'a';
      dynamicGroup.appendChild(aLb);
      var bLb = document.createElementNS(svgNS, 'text');
      bLb.setAttribute('x', P1.x + 6);
      bLb.setAttribute('y', (P1.y + P3.y) / 2);
      bLb.setAttribute('class', 'sim-label');
      bLb.setAttribute('fill', '#1f1a14');
      bLb.setAttribute('font-weight', '600');
      bLb.textContent = 'b';
      dynamicGroup.appendChild(bLb);
      var cLb = document.createElementNS(svgNS, 'text');
      cLb.setAttribute('x', mx + n1x * 8);
      cLb.setAttribute('y', my + n1y * 8 - 2);
      cLb.setAttribute('class', 'sim-label');
      cLb.setAttribute('fill', '#1f1a14');
      cLb.setAttribute('font-weight', '600');
      cLb.textContent = 'c';
      dynamicGroup.appendChild(cLb);

      readout.querySelector('#pyt-a2').textContent = (a * a).toFixed(1);
      readout.querySelector('#pyt-b2').textContent = (b * b).toFixed(1);
      readout.querySelector('#pyt-sum').textContent = (a * a + b * b).toFixed(1);
      readout.querySelector('#pyt-c2').textContent = (c * c).toFixed(1);
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.pythagoras"]').forEach(init);
})();
