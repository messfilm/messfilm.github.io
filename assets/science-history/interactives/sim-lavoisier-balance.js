/* ============================================================
   Simulation: Lavoisier's conservation of mass
   (Antoine Lavoisier, ~1789, Paris)
   Mounted on: data-sim-id="science.era.04-classical.sim.lavoisier-balance"
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  // 시뮬: 가열로 + 밀폐 용기 + 양팔 저울
  // 반응 전후 총 질량은 항상 같음을 양팔 저울로 시각화

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-lavoisier-balance');

    var REACTIONS = {
      'mercury': {
        name: '수은 가열 → 산화수은',
        before:    [{ label: '수은 Hg',  mass: 100, color: '#a09098' },
                    { label: '공기 O₂',  mass:   8, color: '#cfe0e8' }],
        after:     [{ label: '산화수은 HgO', mass: 108, color: '#c44030' }],
        note: '라부아지에가 1774년 직접 한 실험. 12일 가열, 수은 + 산소 → 붉은 산화수은. 총 질량 일정.'
      },
      'combustion': {
        name: '나무 연소 → 재 + 기체',
        before:    [{ label: '나무',     mass:  50, color: '#7a5a30' },
                    { label: '공기 O₂',  mass:  60, color: '#cfe0e8' }],
        after:     [{ label: '재',       mass:   3, color: '#3a3328' },
                    { label: 'CO₂',      mass:  70, color: '#a09078' },
                    { label: 'H₂O',      mass:  37, color: '#7eb0c8' }],
        note: '연소 후 *재만 가벼워 보이지만*, 빠져나간 기체까지 모으면 총 질량은 같다. 라부아지에가 *플로지스톤* 이론을 뒤집은 결정타.'
      },
      'water': {
        name: '물 분해 → 수소 + 산소',
        before:    [{ label: '물 H₂O', mass: 90, color: '#7eb0c8' }],
        after:     [{ label: '수소 H₂', mass: 10, color: '#d49a2a' },
                    { label: '산소 O₂', mass: 80, color: '#cfe0e8' }],
        note: '1783년 라부아지에·라플라스 실험. 물이 *원소*가 아니라 *수소와 산소의 화합물*임을 증명. 1:8 질량비.'
      }
    };

    var state = { reaction: 'mercury', tilt: 0 };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';
    Object.keys(REACTIONS).forEach(function (k) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sim-btn';
      btn.textContent = REACTIONS[k].name;
      if (k === state.reaction) btn.setAttribute('aria-pressed', 'true');
      btn.addEventListener('click', function () {
        state.reaction = k;
        controls.querySelectorAll('button').forEach(function (b) { b.removeAttribute('aria-pressed'); });
        btn.setAttribute('aria-pressed', 'true');
        render();
      });
      controls.appendChild(btn);
    });
    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '"자연에서 만들어지는 것은 없고 잃는 것도 없다. 모든 것은 변화할 뿐이다." — 라부아지에. 화학 반응 전·후의 총 질량은 *반드시 같다*. 세 반응을 양팔 저울로 직접 확인해보자.';
    container.appendChild(caption);

    var W = 480, H = 380;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '라부아지에 질량 보존 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var dynamicGroup = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynamicGroup);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML =
      '<span>반응 전 = <em id="lav-pre">…</em></span>' +
      '<span>반응 후 = <em id="lav-post">…</em></span>' +
      '<span>차이 = <em id="lav-diff">0</em></span>';
    container.appendChild(readout);

    function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function sum(arr) { return arr.reduce(function (s, x) { return s + x.mass; }, 0); }

    function drawPan(cx, cy, items, totalMass) {
      // Pan: trapezoid + chain
      var panW = 80;
      var pan = document.createElementNS(svgNS, 'path');
      pan.setAttribute('d',
        'M ' + (cx - panW / 2) + ' ' + cy +
        ' L ' + (cx + panW / 2) + ' ' + cy +
        ' L ' + (cx + panW / 2 - 12) + ' ' + (cy + 16) +
        ' L ' + (cx - panW / 2 + 12) + ' ' + (cy + 16) + ' Z');
      pan.setAttribute('fill', '#a09078');
      pan.setAttribute('stroke', '#5a3a28');
      pan.setAttribute('stroke-width', '1');
      dynamicGroup.appendChild(pan);

      // Stack items on top of pan
      var totalHeight = 0;
      var maxItems = items.length;
      var totalH = Math.min(60, totalMass * 0.5);
      items.forEach(function (it) {
        var h = (it.mass / totalMass) * totalH;
        var itemY = cy - totalHeight - h;
        var rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', cx - panW / 2 + 8);
        rect.setAttribute('y', itemY);
        rect.setAttribute('width', panW - 16);
        rect.setAttribute('height', h);
        rect.setAttribute('fill', it.color);
        rect.setAttribute('stroke', '#1f1a14');
        rect.setAttribute('stroke-width', '0.5');
        dynamicGroup.appendChild(rect);
        // Label
        if (h > 10) {
          var lb = document.createElementNS(svgNS, 'text');
          lb.setAttribute('x', cx);
          lb.setAttribute('y', itemY + h / 2 + 3);
          lb.setAttribute('class', 'sim-label');
          lb.setAttribute('text-anchor', 'middle');
          lb.setAttribute('font-size', '9');
          lb.setAttribute('fill', '#faf6eb');
          lb.setAttribute('font-weight', '600');
          lb.textContent = it.label + ' (' + it.mass + ')';
          dynamicGroup.appendChild(lb);
        } else {
          var lb2 = document.createElementNS(svgNS, 'text');
          lb2.setAttribute('x', cx);
          lb2.setAttribute('y', cy + 28);
          lb2.setAttribute('class', 'sim-label');
          lb2.setAttribute('text-anchor', 'middle');
          lb2.setAttribute('font-size', '9');
          lb2.textContent = it.label + ' (' + it.mass + ')';
          dynamicGroup.appendChild(lb2);
        }
        totalHeight += h;
      });
    }

    function render() {
      clearGroup(dynamicGroup);
      var R = REACTIONS[state.reaction];
      var preMass = sum(R.before);
      var postMass = sum(R.after);

      // Balance frame
      var CX = W / 2, CY = 200;
      // Stand
      var stand = document.createElementNS(svgNS, 'path');
      stand.setAttribute('d',
        'M ' + CX + ' ' + (CY + 30) +
        ' L ' + CX + ' ' + (CY + 100) +
        ' M ' + (CX - 40) + ' ' + (CY + 100) +
        ' L ' + (CX + 40) + ' ' + (CY + 100));
      stand.setAttribute('stroke', '#5a3a28');
      stand.setAttribute('stroke-width', '2');
      stand.setAttribute('fill', 'none');
      dynamicGroup.appendChild(stand);
      // Fulcrum
      var fulcrum = document.createElementNS(svgNS, 'polygon');
      fulcrum.setAttribute('points',
        CX + ',' + (CY + 18) + ' ' + (CX - 14) + ',' + (CY + 36) + ' ' + (CX + 14) + ',' + (CY + 36));
      fulcrum.setAttribute('fill', '#5a3a28');
      dynamicGroup.appendChild(fulcrum);

      // Beam — always level (mass conservation)
      var beam = document.createElementNS(svgNS, 'line');
      beam.setAttribute('x1', CX - 150);
      beam.setAttribute('y1', CY + 20);
      beam.setAttribute('x2', CX + 150);
      beam.setAttribute('y2', CY + 20);
      beam.setAttribute('stroke', '#1f1a14');
      beam.setAttribute('stroke-width', '3');
      dynamicGroup.appendChild(beam);

      // Chains
      var c1 = document.createElementNS(svgNS, 'line');
      c1.setAttribute('x1', CX - 130); c1.setAttribute('y1', CY + 20);
      c1.setAttribute('x2', CX - 130); c1.setAttribute('y2', CY + 60);
      c1.setAttribute('stroke', '#5a3a28'); c1.setAttribute('stroke-width', '0.8');
      dynamicGroup.appendChild(c1);
      var c2 = document.createElementNS(svgNS, 'line');
      c2.setAttribute('x1', CX + 130); c2.setAttribute('y1', CY + 20);
      c2.setAttribute('x2', CX + 130); c2.setAttribute('y2', CY + 60);
      c2.setAttribute('stroke', '#5a3a28'); c2.setAttribute('stroke-width', '0.8');
      dynamicGroup.appendChild(c2);

      // Pans with items
      drawPan(CX - 130, CY + 60, R.before, preMass);
      drawPan(CX + 130, CY + 60, R.after, postMass);

      // Labels
      var preL = document.createElementNS(svgNS, 'text');
      preL.setAttribute('x', CX - 130); preL.setAttribute('y', CY - 80);
      preL.setAttribute('class', 'sim-label');
      preL.setAttribute('text-anchor', 'middle');
      preL.setAttribute('font-weight', '700');
      preL.setAttribute('font-size', '13');
      preL.textContent = '반응 전';
      dynamicGroup.appendChild(preL);
      var postL = document.createElementNS(svgNS, 'text');
      postL.setAttribute('x', CX + 130); postL.setAttribute('y', CY - 80);
      postL.setAttribute('class', 'sim-label');
      postL.setAttribute('text-anchor', 'middle');
      postL.setAttribute('font-weight', '700');
      postL.setAttribute('font-size', '13');
      postL.textContent = '반응 후';
      dynamicGroup.appendChild(postL);

      // Arrow between
      var arr = document.createElementNS(svgNS, 'text');
      arr.setAttribute('x', CX); arr.setAttribute('y', CY - 50);
      arr.setAttribute('class', 'sim-label');
      arr.setAttribute('text-anchor', 'middle');
      arr.setAttribute('font-size', '22');
      arr.setAttribute('fill', '#a37e2c');
      arr.textContent = '→';
      dynamicGroup.appendChild(arr);

      // Note text
      var note = document.createElementNS(svgNS, 'text');
      note.setAttribute('x', CX); note.setAttribute('y', H - 14);
      note.setAttribute('class', 'sim-label');
      note.setAttribute('text-anchor', 'middle');
      note.setAttribute('font-style', 'italic');
      note.setAttribute('fill', '#6b6253');
      note.textContent = R.note;
      dynamicGroup.appendChild(note);

      readout.querySelector('#lav-pre').textContent  = preMass + ' g';
      readout.querySelector('#lav-post').textContent = postMass + ' g';
      readout.querySelector('#lav-diff').textContent = (postMass - preMass) + ' g  ' + (postMass === preMass ? '✓ 일치' : '✗');
    }

    render();
  }

  document.querySelectorAll('[data-sim-id$=".sim.lavoisier-balance"]').forEach(init);
})();
