/* ============================================================
   Simulation: Archimedes' approximation of π using inscribed/
   circumscribed regular polygons (Method of Exhaustion, BC ~250)
   Mounted on: data-sim-id="science.era.01-ancient.sim.archimedes-pi"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-archimedes-pi');

    var state = { n: 6 };  // number of polygon sides (Archimedes went up to 96)

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var nLabel = document.createElement('label');
    nLabel.className = 'sim-range';
    nLabel.innerHTML = '<span>다각형 변의 수 <em class="sim-val" id="api-n">6</em></span>';
    var nInput = document.createElement('input');
    nInput.type = 'range';
    nInput.min = '3'; nInput.max = '96'; nInput.step = '1'; nInput.value = '6';
    nInput.addEventListener('input', function () {
      state.n = parseInt(nInput.value, 10);
      nLabel.querySelector('.sim-val').textContent = state.n;
      render();
    });
    nLabel.appendChild(nInput);
    controls.appendChild(nLabel);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '원을 내접·외접 다각형으로 끼워 가두면, π는 두 다각형의 둘레 비 사이에 *반드시* 있다. 변의 수를 늘릴수록 두 값이 좁혀진다. 아르키메데스는 변 96개까지 계산해 π가 3.1408과 3.1429 사이임을 증명했다.';
    container.appendChild(caption);

    var W = 480, H = 360;
    var CX = W / 2, CY = H / 2;
    var R = 110;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '아르키메데스 원주율 근사 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Circle
    var circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', CX); circle.setAttribute('cy', CY);
    circle.setAttribute('r', R);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#2a5680');
    circle.setAttribute('stroke-width', '1.4');
    svg.appendChild(circle);

    var inscribed   = document.createElementNS(svgNS, 'polygon');
    inscribed.setAttribute('fill', '#2d5a3f'); inscribed.setAttribute('opacity', '0.20');
    inscribed.setAttribute('stroke', '#2d5a3f'); inscribed.setAttribute('stroke-width', '1.1');
    svg.appendChild(inscribed);

    var circumscribed = document.createElementNS(svgNS, 'polygon');
    circumscribed.setAttribute('fill', 'none');
    circumscribed.setAttribute('stroke', '#a04030'); circumscribed.setAttribute('stroke-width', '1.1');
    circumscribed.setAttribute('stroke-dasharray', '3 3');
    svg.appendChild(circumscribed);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>내접 다각형 → π ≈ <em id="api-low">…</em></span>' +
      '<span>외접 다각형 → π ≈ <em id="api-high">…</em></span>' +
      '<span>참값 π = <em>3.14159…</em></span>';
    container.appendChild(readout);

    function poly(n, r) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var theta = -Math.PI / 2 + (2 * Math.PI * i) / n;
        pts.push((CX + r * Math.cos(theta)) + ',' + (CY + r * Math.sin(theta)));
      }
      return pts.join(' ');
    }

    function render() {
      var n = state.n;
      // Inscribed: vertices on circle of radius R
      inscribed.setAttribute('points', poly(n, R));
      // Circumscribed: vertices on circle of radius R/cos(π/n)
      var rOut = R / Math.cos(Math.PI / n);
      circumscribed.setAttribute('points', poly(n, rOut));
      // π estimates from perimeters: for a unit-diameter circle, π = perimeter
      // For our circle of radius R, perimeter / (2R) = π_est
      var inPerim  = 2 * n * R * Math.sin(Math.PI / n);
      var outPerim = 2 * n * R * Math.tan(Math.PI / n);
      var piLow  = inPerim  / (2 * R);
      var piHigh = outPerim / (2 * R);
      readout.querySelector('#api-low').textContent  = piLow.toFixed(6);
      readout.querySelector('#api-high').textContent = piHigh.toFixed(6);
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.archimedes-pi"]').forEach(init);
})();
