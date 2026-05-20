/* ============================================================
   Simulation: Ibn al-Haytham's optics — reflection & refraction
   (Book of Optics, ~1015, Cairo)
   Mounted on: data-sim-id="science.era.02-medieval.sim.alhazen-optics"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-alhazen-optics');

    var MEDIA = {
      'air-water': { n1: 1.00, n2: 1.33, label1: '공기 (n=1.00)', label2: '물 (n=1.33)' },
      'air-glass': { n1: 1.00, n2: 1.50, label1: '공기 (n=1.00)', label2: '유리 (n=1.50)' },
      'water-air': { n1: 1.33, n2: 1.00, label1: '물 (n=1.33)', label2: '공기 (n=1.00)' }
    };

    var state = {
      angleDeg: 35,
      medium: 'air-water'
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var angLabel = document.createElement('label');
    angLabel.className = 'sim-range';
    angLabel.innerHTML = '<span>입사각 <em class="sim-val" id="alh-ang">35°</em></span>';
    var angInput = document.createElement('input');
    angInput.type = 'range';
    angInput.min = '5'; angInput.max = '85'; angInput.step = '1'; angInput.value = '35';
    angInput.addEventListener('input', function () {
      state.angleDeg = parseInt(angInput.value, 10);
      angLabel.querySelector('.sim-val').textContent = state.angleDeg + '°';
      render();
    });
    angLabel.appendChild(angInput);
    controls.appendChild(angLabel);

    Object.keys(MEDIA).forEach(function (key) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sim-btn';
      var labels = { 'air-water': '공기→물', 'air-glass': '공기→유리', 'water-air': '물→공기' };
      btn.textContent = labels[key];
      if (key === state.medium) btn.setAttribute('aria-pressed', 'true');
      btn.addEventListener('click', function () {
        state.medium = key;
        controls.querySelectorAll('button').forEach(function (b) { b.removeAttribute('aria-pressed'); });
        btn.setAttribute('aria-pressed', 'true');
        render();
      });
      controls.appendChild(btn);
    });

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '알하이삼은 빛이 *눈에서 나가 사물을 더듬는다*는 그리스의 시각론을 폐기하고, *사물에서 출발한 빛이 눈에 들어온다*는 모형을 제시했다. 반사각=입사각, 굴절은 매질의 밀도에 따라 — 그가 정리한 법칙을 직접 만져보자.';
    container.appendChild(caption);

    var W = 480, H = 320;
    var CX = W / 2, CY = H / 2;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '알하이삼 빛의 반사·굴절 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    // Upper medium (air) background
    var upper = document.createElementNS(svgNS, 'rect');
    upper.setAttribute('x', 0); upper.setAttribute('y', 0);
    upper.setAttribute('width', W); upper.setAttribute('height', CY);
    upper.setAttribute('fill', '#f5efe0');
    svg.appendChild(upper);

    // Lower medium (water/glass) — color updated by render
    var lower = document.createElementNS(svgNS, 'rect');
    lower.setAttribute('x', 0); lower.setAttribute('y', CY);
    lower.setAttribute('width', W); lower.setAttribute('height', CY);
    svg.appendChild(lower);

    // Interface line
    var iface = document.createElementNS(svgNS, 'line');
    iface.setAttribute('x1', 0); iface.setAttribute('y1', CY);
    iface.setAttribute('x2', W); iface.setAttribute('y2', CY);
    iface.setAttribute('stroke', '#1f1a14'); iface.setAttribute('stroke-width', '1.4');
    svg.appendChild(iface);

    // Normal (vertical dashed line at incidence point)
    var normal = document.createElementNS(svgNS, 'line');
    normal.setAttribute('x1', CX); normal.setAttribute('y1', 20);
    normal.setAttribute('x2', CX); normal.setAttribute('y2', H - 20);
    normal.setAttribute('stroke', '#6b6253');
    normal.setAttribute('stroke-width', '0.6');
    normal.setAttribute('stroke-dasharray', '4 3');
    svg.appendChild(normal);

    var dynamicGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicGroup);

    // Medium labels
    var upperLb = document.createElementNS(svgNS, 'text');
    upperLb.setAttribute('x', 12); upperLb.setAttribute('y', 24);
    upperLb.setAttribute('class', 'sim-label');
    upperLb.setAttribute('font-weight', '600');
    svg.appendChild(upperLb);
    var lowerLb = document.createElementNS(svgNS, 'text');
    lowerLb.setAttribute('x', 12); lowerLb.setAttribute('y', H - 12);
    lowerLb.setAttribute('class', 'sim-label');
    lowerLb.setAttribute('font-weight', '600');
    svg.appendChild(lowerLb);

    // Defs for arrowheads
    var defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML =
      '<marker id="alh-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" fill="#d49a2a"/></marker>' +
      '<marker id="alh-arrow-refl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" fill="#a04030"/></marker>' +
      '<marker id="alh-arrow-refr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" fill="#2a5680"/></marker>';
    svg.appendChild(defs);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>입사각 = <em id="alh-inc">…</em></span>' +
      '<span>반사각 = <em id="alh-refl">…</em></span>' +
      '<span>굴절각 = <em id="alh-refr">…</em></span>';
    container.appendChild(readout);

    function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      clearGroup(dynamicGroup);
      var m = MEDIA[state.medium];
      var n1 = m.n1, n2 = m.n2;
      lower.setAttribute('fill', state.medium === 'air-water' ? '#cfd8e4'
                              : state.medium === 'air-glass' ? '#dcd5c4'
                              : '#f5efe0');
      upper.setAttribute('fill', state.medium === 'water-air' ? '#cfd8e4' : '#f5efe0');
      upperLb.textContent = m.label1;
      lowerLb.textContent = m.label2;

      var thetaI = state.angleDeg * Math.PI / 180;
      var rayLen = 140;

      // Incident ray comes from upper-left
      var ix1 = CX - Math.sin(thetaI) * rayLen;
      var iy1 = CY - Math.cos(thetaI) * rayLen;
      var inc = document.createElementNS(svgNS, 'line');
      inc.setAttribute('x1', ix1); inc.setAttribute('y1', iy1);
      inc.setAttribute('x2', CX); inc.setAttribute('y2', CY);
      inc.setAttribute('stroke', '#d49a2a');
      inc.setAttribute('stroke-width', '1.6');
      inc.setAttribute('marker-end', 'url(#alh-arrow)');
      dynamicGroup.appendChild(inc);
      var incLb = document.createElementNS(svgNS, 'text');
      incLb.setAttribute('x', (ix1 + CX) / 2 - 16);
      incLb.setAttribute('y', (iy1 + CY) / 2);
      incLb.setAttribute('class', 'sim-label');
      incLb.setAttribute('fill', '#a37e2c');
      incLb.textContent = '입사';
      dynamicGroup.appendChild(incLb);

      // Reflection ray: same angle on upper-right
      var rx2 = CX + Math.sin(thetaI) * rayLen;
      var ry2 = CY - Math.cos(thetaI) * rayLen;
      var refl = document.createElementNS(svgNS, 'line');
      refl.setAttribute('x1', CX); refl.setAttribute('y1', CY);
      refl.setAttribute('x2', rx2); refl.setAttribute('y2', ry2);
      refl.setAttribute('stroke', '#a04030');
      refl.setAttribute('stroke-width', '1.6');
      refl.setAttribute('marker-end', 'url(#alh-arrow-refl)');
      dynamicGroup.appendChild(refl);
      var reflLb = document.createElementNS(svgNS, 'text');
      reflLb.setAttribute('x', (rx2 + CX) / 2 + 6);
      reflLb.setAttribute('y', (ry2 + CY) / 2);
      reflLb.setAttribute('class', 'sim-label');
      reflLb.setAttribute('fill', '#a04030');
      reflLb.textContent = '반사';
      dynamicGroup.appendChild(reflLb);

      // Refraction: Snell's law
      var sinR = (n1 / n2) * Math.sin(thetaI);
      var thetaR, refrLine;
      if (Math.abs(sinR) >= 1) {
        // Total internal reflection
        thetaR = null;
        var note = document.createElementNS(svgNS, 'text');
        note.setAttribute('x', CX); note.setAttribute('y', CY + 30);
        note.setAttribute('class', 'sim-label');
        note.setAttribute('text-anchor', 'middle');
        note.setAttribute('fill', '#7c2030');
        note.setAttribute('font-weight', '600');
        note.textContent = '전반사 — 빛이 모두 반사됨';
        dynamicGroup.appendChild(note);
      } else {
        thetaR = Math.asin(sinR);
        var rfx = CX + Math.sin(thetaR) * rayLen;
        var rfy = CY + Math.cos(thetaR) * rayLen;
        refrLine = document.createElementNS(svgNS, 'line');
        refrLine.setAttribute('x1', CX); refrLine.setAttribute('y1', CY);
        refrLine.setAttribute('x2', rfx); refrLine.setAttribute('y2', rfy);
        refrLine.setAttribute('stroke', '#2a5680');
        refrLine.setAttribute('stroke-width', '1.6');
        refrLine.setAttribute('marker-end', 'url(#alh-arrow-refr)');
        dynamicGroup.appendChild(refrLine);
        var refrLb = document.createElementNS(svgNS, 'text');
        refrLb.setAttribute('x', (rfx + CX) / 2 + 6);
        refrLb.setAttribute('y', (rfy + CY) / 2);
        refrLb.setAttribute('class', 'sim-label');
        refrLb.setAttribute('fill', '#2a5680');
        refrLb.textContent = '굴절';
        dynamicGroup.appendChild(refrLb);
      }

      // Angle arcs
      var arcR = 28;
      var incArc = document.createElementNS(svgNS, 'path');
      incArc.setAttribute('d',
        'M ' + (CX - 0) + ' ' + (CY - arcR) +
        ' A ' + arcR + ' ' + arcR + ' 0 0 0 ' +
        (CX - arcR * Math.sin(thetaI)) + ' ' + (CY - arcR * Math.cos(thetaI)));
      incArc.setAttribute('fill', 'none');
      incArc.setAttribute('stroke', '#d49a2a');
      incArc.setAttribute('stroke-width', '0.8');
      dynamicGroup.appendChild(incArc);

      readout.querySelector('#alh-inc').textContent  = state.angleDeg + '°';
      readout.querySelector('#alh-refl').textContent = state.angleDeg + '°';
      readout.querySelector('#alh-refr').textContent = thetaR === null ? '— (전반사)' : (thetaR * 180 / Math.PI).toFixed(1) + '°';
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.alhazen-optics"]').forEach(init);
})();
