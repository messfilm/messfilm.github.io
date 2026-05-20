/* ============================================================
   Simulation: Oresme's velocity–time diagram (mean speed theorem)
   (Nicole Oresme, ~1350, Paris)
   Mounted on: data-sim-id="science.era.02-medieval.sim.oresme-motion"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-oresme-motion');

    var state = {
      mode: 'uniform',        // 'uniform' | 'accelerated'
      duration: 6,            // seconds
      v0: 4,                  // initial velocity (units/s)
      accel: 1.0              // m/s²
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    // Mode toggle
    var uBtn = document.createElement('button');
    uBtn.type = 'button';
    uBtn.className = 'sim-btn';
    uBtn.textContent = '등속';
    uBtn.setAttribute('aria-pressed', 'true');
    var aBtn = document.createElement('button');
    aBtn.type = 'button';
    aBtn.className = 'sim-btn';
    aBtn.textContent = '등가속';
    uBtn.addEventListener('click', function () {
      state.mode = 'uniform';
      uBtn.setAttribute('aria-pressed', 'true');
      aBtn.removeAttribute('aria-pressed');
      render();
    });
    aBtn.addEventListener('click', function () {
      state.mode = 'accelerated';
      aBtn.setAttribute('aria-pressed', 'true');
      uBtn.removeAttribute('aria-pressed');
      render();
    });
    controls.appendChild(uBtn);
    controls.appendChild(aBtn);

    var tLabel = document.createElement('label');
    tLabel.className = 'sim-range';
    tLabel.innerHTML = '<span>시간 <em class="sim-val" id="ores-t">6.0 s</em></span>';
    var tInput = document.createElement('input');
    tInput.type = 'range';
    tInput.min = '1'; tInput.max = '10'; tInput.step = '0.1'; tInput.value = '6';
    tInput.addEventListener('input', function () {
      state.duration = parseFloat(tInput.value);
      tLabel.querySelector('.sim-val').textContent = state.duration.toFixed(1) + ' s';
      render();
    });
    tLabel.appendChild(tInput);
    controls.appendChild(tLabel);

    var aLabel = document.createElement('label');
    aLabel.className = 'sim-range';
    aLabel.innerHTML = '<span>속도/가속 <em class="sim-val" id="ores-a">…</em></span>';
    var aInput = document.createElement('input');
    aInput.type = 'range';
    aInput.min = '0.3'; aInput.max = '2.5'; aInput.step = '0.05'; aInput.value = '1.0';
    aInput.addEventListener('input', function () {
      var v = parseFloat(aInput.value);
      state.accel = v;
      state.v0 = v * 4;       // for uniform mode use as constant velocity
      render();
    });
    aLabel.appendChild(aInput);
    controls.appendChild(aLabel);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '오레슴은 시간-속도 그래프를 처음으로 그렸다. 거리 = 그래프 아래의 면적. 등속이면 사각형, 등가속이면 삼각형. 17세기 갈릴레오의 s ∝ t²가 여기서 자라난다.';
    container.appendChild(caption);

    var W = 480, H = 320;
    var GX0 = 60, GY0 = 260;
    var GW = 360, GH = 200;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '오레슴 균등가속 도식');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Axes
    var xAxis = document.createElementNS(svgNS, 'line');
    xAxis.setAttribute('x1', GX0); xAxis.setAttribute('y1', GY0);
    xAxis.setAttribute('x2', GX0 + GW); xAxis.setAttribute('y2', GY0);
    xAxis.setAttribute('stroke', '#1f1a14'); xAxis.setAttribute('stroke-width', '1.2');
    svg.appendChild(xAxis);
    var yAxis = document.createElementNS(svgNS, 'line');
    yAxis.setAttribute('x1', GX0); yAxis.setAttribute('y1', GY0);
    yAxis.setAttribute('x2', GX0); yAxis.setAttribute('y2', GY0 - GH);
    yAxis.setAttribute('stroke', '#1f1a14'); yAxis.setAttribute('stroke-width', '1.2');
    svg.appendChild(yAxis);
    var xLb = document.createElementNS(svgNS, 'text');
    xLb.setAttribute('x', GX0 + GW + 8); xLb.setAttribute('y', GY0 + 4);
    xLb.setAttribute('class', 'sim-label');
    xLb.setAttribute('font-weight', '600');
    xLb.textContent = '시간 t';
    svg.appendChild(xLb);
    var yLb = document.createElementNS(svgNS, 'text');
    yLb.setAttribute('x', GX0 - 18); yLb.setAttribute('y', GY0 - GH - 6);
    yLb.setAttribute('class', 'sim-label');
    yLb.setAttribute('font-weight', '600');
    yLb.textContent = '속도 v';
    svg.appendChild(yLb);

    // Grid lines
    for (var i = 1; i <= 5; i++) {
      var gx = document.createElementNS(svgNS, 'line');
      gx.setAttribute('x1', GX0); gx.setAttribute('y1', GY0 - (GH / 5) * i);
      gx.setAttribute('x2', GX0 + GW); gx.setAttribute('y2', GY0 - (GH / 5) * i);
      gx.setAttribute('stroke', '#d8d0b8');
      gx.setAttribute('stroke-width', '0.5');
      gx.setAttribute('stroke-dasharray', '2 3');
      svg.appendChild(gx);
    }

    var dynamicGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicGroup);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>현재 속도 = <em id="ores-v">…</em></span>' +
      '<span>이동 거리 = <em id="ores-dist">…</em></span>';
    container.appendChild(readout);

    function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clearGroup(dynamicGroup);

      var T_MAX = 10, V_MAX = 10;
      var tScale = GW / T_MAX;
      var vScale = GH / V_MAX;

      var T = state.duration;

      if (state.mode === 'uniform') {
        var V = state.v0;
        // Rectangle from (0,0) to (T, V)
        var rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', GX0);
        rect.setAttribute('y', GY0 - V * vScale);
        rect.setAttribute('width', T * tScale);
        rect.setAttribute('height', V * vScale);
        rect.setAttribute('fill', '#2a5680');
        rect.setAttribute('opacity', '0.30');
        rect.setAttribute('stroke', '#2a5680');
        rect.setAttribute('stroke-width', '1.2');
        dynamicGroup.appendChild(rect);
        // Label inside
        var lb = document.createElementNS(svgNS, 'text');
        lb.setAttribute('x', GX0 + T * tScale / 2);
        lb.setAttribute('y', GY0 - V * vScale / 2 + 4);
        lb.setAttribute('class', 'sim-label');
        lb.setAttribute('text-anchor', 'middle');
        lb.setAttribute('fill', '#faf6eb');
        lb.setAttribute('font-weight', '600');
        lb.setAttribute('font-size', '12');
        lb.textContent = '거리 = V × t = ' + (V * T).toFixed(1);
        dynamicGroup.appendChild(lb);
        aLabel.querySelector('.sim-val').textContent = V.toFixed(1);
        readout.querySelector('#ores-v').textContent = V.toFixed(2);
        readout.querySelector('#ores-dist').textContent = (V * T).toFixed(2);
      } else {
        var a = state.accel;
        var v_final = a * T;
        // Triangle from (0,0) to (T, 0) to (T, v_final)
        var tri = document.createElementNS(svgNS, 'polygon');
        tri.setAttribute('points',
          GX0 + ',' + GY0 + ' ' +
          (GX0 + T * tScale) + ',' + GY0 + ' ' +
          (GX0 + T * tScale) + ',' + (GY0 - v_final * vScale));
        tri.setAttribute('fill', '#a04030');
        tri.setAttribute('opacity', '0.30');
        tri.setAttribute('stroke', '#a04030');
        tri.setAttribute('stroke-width', '1.2');
        dynamicGroup.appendChild(tri);

        // Velocity line drawn from origin (hypotenuse)
        var hLine = document.createElementNS(svgNS, 'line');
        hLine.setAttribute('x1', GX0);
        hLine.setAttribute('y1', GY0);
        hLine.setAttribute('x2', GX0 + T * tScale);
        hLine.setAttribute('y2', GY0 - v_final * vScale);
        hLine.setAttribute('stroke', '#7c2030');
        hLine.setAttribute('stroke-width', '1.6');
        dynamicGroup.appendChild(hLine);

        // Distance label
        var dist = 0.5 * a * T * T;
        var lb2 = document.createElementNS(svgNS, 'text');
        lb2.setAttribute('x', GX0 + T * tScale * 0.62);
        lb2.setAttribute('y', GY0 - v_final * vScale * 0.4);
        lb2.setAttribute('class', 'sim-label');
        lb2.setAttribute('text-anchor', 'middle');
        lb2.setAttribute('fill', '#faf6eb');
        lb2.setAttribute('font-weight', '600');
        lb2.setAttribute('font-size', '12');
        lb2.textContent = '거리 = ½at² = ' + dist.toFixed(1);
        dynamicGroup.appendChild(lb2);
        aLabel.querySelector('.sim-val').textContent = 'a = ' + a.toFixed(2);
        readout.querySelector('#ores-v').textContent = v_final.toFixed(2);
        readout.querySelector('#ores-dist').textContent = dist.toFixed(2);
      }

      // Tick marks: t
      for (var k = 1; k <= 10; k++) {
        var tk = document.createElementNS(svgNS, 'text');
        tk.setAttribute('x', GX0 + k * tScale);
        tk.setAttribute('y', GY0 + 14);
        tk.setAttribute('class', 'sim-label');
        tk.setAttribute('text-anchor', 'middle');
        tk.textContent = String(k);
        dynamicGroup.appendChild(tk);
      }
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.oresme-motion"]').forEach(init);
})();
