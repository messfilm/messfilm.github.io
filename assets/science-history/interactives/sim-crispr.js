/* ============================================================
   Simulation: CRISPR/Cas9 — guided DNA editing
   (Doudna & Charpentier, 2012; Nobel 2020)
   Mounted on: data-sim-id="science.era.06-contemporary.sim.crispr"
   ============================================================ */

(function () {
  'use strict';
  var svgNS = 'http://www.w3.org/2000/svg';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-crispr');

    // Default DNA sequence (40 bases). Target = 6-base guide RNA matches.
    var DEFAULT_DNA = 'ATCGATCGAACCGGTTATCGATCGATCGAACCGGTTATCG';
    var state = {
      dna: DEFAULT_DNA,
      guide: 'CCGGTT',   // 6-base guide RNA
      stage: 0,          // 0=initial, 1=cas9 bound, 2=cut, 3=edited
      replacement: 'AAATTT'
    };

    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var dnaL = document.createElement('label');
    dnaL.className = 'sim-range';
    dnaL.innerHTML = '<span>DNA</span>';
    var dnaI = document.createElement('input');
    dnaI.type = 'text'; dnaI.value = state.dna; dnaI.maxLength = 40;
    dnaI.style.cssText = 'font-family:monospace; width:280px; padding:4px 8px; border:1px solid var(--rule); background:var(--paper);';
    dnaI.addEventListener('input', function () {
      var v = dnaI.value.toUpperCase().replace(/[^ATCG]/g, '');
      state.dna = v;
      dnaI.value = v;
      state.stage = 0;
      render();
    });
    dnaL.appendChild(dnaI);
    controls.appendChild(dnaL);

    var guideL = document.createElement('label');
    guideL.className = 'sim-range';
    guideL.innerHTML = '<span>가이드 RNA</span>';
    var guideI = document.createElement('input');
    guideI.type = 'text'; guideI.value = state.guide; guideI.maxLength = 8;
    guideI.style.cssText = 'font-family:monospace; width:90px; padding:4px 8px; border:1px solid var(--rule); background:var(--paper);';
    guideI.addEventListener('input', function () {
      var v = guideI.value.toUpperCase().replace(/[^ATCG]/g, '');
      state.guide = v;
      guideI.value = v;
      state.stage = 0;
      render();
    });
    guideL.appendChild(guideI);
    controls.appendChild(guideL);

    var newL = document.createElement('label');
    newL.className = 'sim-range';
    newL.innerHTML = '<span>새 염기</span>';
    var newI = document.createElement('input');
    newI.type = 'text'; newI.value = state.replacement; newI.maxLength = 8;
    newI.style.cssText = 'font-family:monospace; width:90px; padding:4px 8px; border:1px solid var(--rule); background:var(--paper);';
    newI.addEventListener('input', function () {
      var v = newI.value.toUpperCase().replace(/[^ATCG]/g, '');
      state.replacement = v;
      newI.value = v;
      render();
    });
    newL.appendChild(newI);
    controls.appendChild(newL);

    var stepBtn = document.createElement('button');
    stepBtn.type = 'button';
    stepBtn.className = 'sim-btn';
    stepBtn.textContent = '다음 단계';
    stepBtn.addEventListener('click', function () {
      state.stage = (state.stage + 1) % 4;
      render();
    });
    controls.appendChild(stepBtn);

    container.appendChild(controls);

    var caption = document.createElement('p');
    caption.className = 'sim-caption';
    caption.textContent = '2012년 다우드나·샤르팡티에가 발견한 <em>유전자 가위</em>. 가이드 RNA가 DNA의 일치 부위를 찾아 Cas9 효소가 정확히 그곳을 자른다. 자른 자리에 새 염기를 끼워 넣으면 — 유전 정보를 *글자 단위*로 편집할 수 있다. 2020년 노벨 화학상.';
    container.appendChild(caption);

    var W = 480, H = 360;

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'CRISPR 시뮬레이션');
    svg.classList.add('sim-stage');
    container.appendChild(svg);

    var dynG = document.createElementNS(svgNS, 'g');
    svg.appendChild(dynG);

    var readout = document.createElement('div');
    readout.className = 'sim-readout';
    readout.innerHTML = '<span>단계: <em id="cr-stage">…</em></span><span>일치 위치: <em id="cr-match">…</em></span>';
    container.appendChild(readout);

    var COLOR = { A: '#2a5680', T: '#a04030', G: '#2d5a3f', C: '#a37e2c' };
    var PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };

    function findMatch(dna, guide) {
      if (!guide || guide.length < 3) return -1;
      return dna.indexOf(guide);
    }

    function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function drawDNA(seq, baseY, highlight, cut) {
      // seq: array of chars. highlight: {start, len} or null. cut: {pos} or null.
      var cellW = Math.min(20, 440 / seq.length);
      var startX = (W - cellW * seq.length) / 2;
      for (var i = 0; i < seq.length; i++) {
        var b = seq[i];
        var x = startX + i * cellW;
        // Cut gap
        if (cut !== null && i === cut.pos) {
          var gap = document.createElementNS(svgNS, 'rect');
          gap.setAttribute('x', x - 2); gap.setAttribute('y', baseY - 18);
          gap.setAttribute('width', 4); gap.setAttribute('height', 64);
          gap.setAttribute('fill', '#7c2030');
          dynG.appendChild(gap);
        }
        // Top strand base
        var r1 = document.createElementNS(svgNS, 'rect');
        r1.setAttribute('x', x); r1.setAttribute('y', baseY - 16);
        r1.setAttribute('width', cellW - 2); r1.setAttribute('height', 16);
        r1.setAttribute('fill', COLOR[b] || '#a09078');
        if (highlight && i >= highlight.start && i < highlight.start + highlight.len) {
          r1.setAttribute('stroke', '#d49a2a');
          r1.setAttribute('stroke-width', '2');
        }
        dynG.appendChild(r1);
        var t1 = document.createElementNS(svgNS, 'text');
        t1.setAttribute('x', x + cellW / 2 - 1); t1.setAttribute('y', baseY - 4);
        t1.setAttribute('class', 'sim-label'); t1.setAttribute('text-anchor', 'middle');
        t1.setAttribute('fill', '#faf6eb'); t1.setAttribute('font-weight', '700');
        t1.setAttribute('font-family', 'monospace'); t1.setAttribute('font-size', '11');
        t1.textContent = b;
        dynG.appendChild(t1);
        // Bottom strand (complement)
        var c = PAIR[b] || 'N';
        var r2 = document.createElementNS(svgNS, 'rect');
        r2.setAttribute('x', x); r2.setAttribute('y', baseY + 14);
        r2.setAttribute('width', cellW - 2); r2.setAttribute('height', 16);
        r2.setAttribute('fill', COLOR[c] || '#a09078');
        r2.setAttribute('opacity', '0.7');
        dynG.appendChild(r2);
        var t2 = document.createElementNS(svgNS, 'text');
        t2.setAttribute('x', x + cellW / 2 - 1); t2.setAttribute('y', baseY + 26);
        t2.setAttribute('class', 'sim-label'); t2.setAttribute('text-anchor', 'middle');
        t2.setAttribute('fill', '#faf6eb'); t2.setAttribute('font-weight', '700');
        t2.setAttribute('font-family', 'monospace'); t2.setAttribute('font-size', '11');
        t2.textContent = c;
        dynG.appendChild(t2);
        // Pair line
        var line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', x + cellW / 2); line.setAttribute('y1', baseY);
        line.setAttribute('x2', x + cellW / 2); line.setAttribute('y2', baseY + 14);
        line.setAttribute('stroke', '#6b6253'); line.setAttribute('stroke-width', '0.5');
        dynG.appendChild(line);
      }
      return { startX: startX, cellW: cellW };
    }

    function render() {
      clear(dynG);
      var stageNames = ['1. 표적 DNA', '2. Cas9 + 가이드 RNA 결합', '3. DNA 절단', '4. 새 염기 삽입'];
      var matchPos = findMatch(state.dna, state.guide);

      // Title
      var title = document.createElementNS(svgNS, 'text');
      title.setAttribute('x', W / 2); title.setAttribute('y', 30);
      title.setAttribute('class', 'sim-label'); title.setAttribute('text-anchor', 'middle');
      title.setAttribute('font-weight', '700'); title.setAttribute('font-size', '13');
      title.textContent = stageNames[state.stage];
      dynG.appendChild(title);

      var dnaArr;
      var highlight = null;
      var cut = null;
      var label = '없음';

      if (state.stage === 0) {
        dnaArr = state.dna.split('');
      } else if (state.stage === 1) {
        dnaArr = state.dna.split('');
        if (matchPos >= 0) {
          highlight = { start: matchPos, len: state.guide.length };
          label = '위치 ' + (matchPos + 1) + '~' + (matchPos + state.guide.length);

          // Draw Cas9 + guide
          var dims = { startX: (W - Math.min(20, 440 / dnaArr.length) * dnaArr.length) / 2,
                       cellW: Math.min(20, 440 / dnaArr.length) };
          var hx = dims.startX + (matchPos + state.guide.length / 2) * dims.cellW;
          var hy = 80;
          var cas = document.createElementNS(svgNS, 'ellipse');
          cas.setAttribute('cx', hx); cas.setAttribute('cy', hy);
          cas.setAttribute('rx', dims.cellW * state.guide.length / 2 + 6);
          cas.setAttribute('ry', 18);
          cas.setAttribute('fill', '#d49a2a'); cas.setAttribute('opacity', '0.7');
          cas.setAttribute('stroke', '#7a5a20'); cas.setAttribute('stroke-width', '1');
          dynG.appendChild(cas);
          var ct = document.createElementNS(svgNS, 'text');
          ct.setAttribute('x', hx); ct.setAttribute('y', hy + 4);
          ct.setAttribute('class', 'sim-label'); ct.setAttribute('text-anchor', 'middle');
          ct.setAttribute('font-weight', '700'); ct.setAttribute('fill', '#1f1a14');
          ct.textContent = 'Cas9 + gRNA: ' + state.guide;
          dynG.appendChild(ct);
        } else {
          label = '일치 없음';
        }
      } else if (state.stage === 2) {
        if (matchPos >= 0) {
          dnaArr = state.dna.split('');
          highlight = { start: matchPos, len: state.guide.length };
          cut = { pos: matchPos + state.guide.length };
          label = '위치 ' + (matchPos + state.guide.length) + '에서 절단';
        } else {
          dnaArr = state.dna.split('');
        }
      } else if (state.stage === 3) {
        if (matchPos >= 0) {
          var edited = state.dna.substring(0, matchPos) +
                       state.replacement +
                       state.dna.substring(matchPos + state.guide.length);
          dnaArr = edited.split('');
          highlight = { start: matchPos, len: state.replacement.length };
          label = '"' + state.guide + '" → "' + state.replacement + '"';
        } else {
          dnaArr = state.dna.split('');
        }
      }

      drawDNA(dnaArr, 200, highlight, cut);

      readout.querySelector('#cr-stage').textContent = stageNames[state.stage];
      readout.querySelector('#cr-match').textContent = label;
    }

    render();
  }
  document.querySelectorAll('[data-sim-id$=".sim.crispr"]').forEach(init);
})();
