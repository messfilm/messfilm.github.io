/* ============================================================
   Simulation: Euclidean algorithm (geometric)
   gcd(a,b)를 큰 사각형에서 가장 큰 정사각형들로 잘라내며 시각화.
   예: gcd(63,24) → 24×24 두 개를 빼면 24×15가 남고, 15×15 하나를
   빼면 15×9가 남고, 9×9 → 9×6 → 6×6 → 6×3 → 3×3 두 개로 끝.
   ⇒ gcd = 3
   Mounted on: <div class="sim" data-sim-id="euclidean-algorithm">
   ============================================================ */

(function () {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';

  // 미리 정의한 예시
  var EXAMPLES = [
    { a: 63, b: 24, gcd: 3 },
    { a: 252, b: 105, gcd: 21 },
    { a: 100, b: 75, gcd: 25 },
    { a: 48, b: 36, gcd: 12 },
    { a: 144, b: 60, gcd: 12 }
  ];

  // gcd 계산 + 단계 기록 (a >= b, 둘 다 양의 정수)
  function gcdSteps(a, b) {
    var steps = [];
    var x = a, y = b;
    var safety = 0;
    while (y > 0 && safety < 200) {
      var q = Math.floor(x / y);
      var r = x - q * y;
      steps.push({ x: x, y: y, q: q, r: r });
      x = y; y = r;
      safety++;
    }
    return { gcd: x, steps: steps };
  }

  // 색 팔레트 (사각형 단계별)
  var COLORS = ['#c9b87a', '#a37e2c', '#7a9970', '#c98770', '#b888c2', '#6f99c8', '#c9a06a', '#88b78a'];

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-euclidean-algorithm');

    var state = { a: 63, b: 24 };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '두 자연수 a, b의 가장 큰 공약수(gcd). 유클리드는 기하학적으로 봤다 — 큰 사각형에서 가능한 가장 큰 정사각형을 떼어내고, 남은 직사각형에 같은 과정을 반복. 끝에 남는 정사각형의 변 길이가 곧 gcd다.';
    container.appendChild(lead);

    // ─── 컨트롤 ───
    var controls = document.createElement('div');
    controls.className = 'sim-controls sim-eua__controls';

    var aWrap = document.createElement('label');
    aWrap.className = 'sim-eua__input-wrap';
    aWrap.innerHTML = '<span class="sim-eua__lbl">a</span>';
    var aInput = document.createElement('input');
    aInput.type = 'number';
    aInput.min = '2'; aInput.max = '500'; aInput.step = '1';
    aInput.value = '63';
    aInput.className = 'sim-eua__input';
    aWrap.appendChild(aInput);
    controls.appendChild(aWrap);

    var bWrap = document.createElement('label');
    bWrap.className = 'sim-eua__input-wrap';
    bWrap.innerHTML = '<span class="sim-eua__lbl">b</span>';
    var bInput = document.createElement('input');
    bInput.type = 'number';
    bInput.min = '2'; bInput.max = '500'; bInput.step = '1';
    bInput.value = '24';
    bInput.className = 'sim-eua__input';
    bWrap.appendChild(bInput);
    controls.appendChild(bWrap);

    var goBtn = document.createElement('button');
    goBtn.type = 'button';
    goBtn.className = 'sim-btn sim-eua__go';
    goBtn.textContent = 'gcd 계산';
    goBtn.addEventListener('click', function () { applyInputs(); });
    controls.appendChild(goBtn);

    container.appendChild(controls);

    // ─── 예시 버튼 ───
    var exRow = document.createElement('div');
    exRow.className = 'sim-controls sim-eua__examples';
    var exHead = document.createElement('span');
    exHead.className = 'sim-eua__ex-head';
    exHead.textContent = '예시 :';
    exRow.appendChild(exHead);
    EXAMPLES.forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sim-btn sim-eua__ex';
      b.textContent = e.a + ', ' + e.b;
      b.title = 'gcd = ' + e.gcd;
      b.addEventListener('click', function () {
        aInput.value = String(e.a);
        bInput.value = String(e.b);
        applyInputs();
      });
      exRow.appendChild(b);
    });
    container.appendChild(exRow);

    // ─── SVG 무대 ───
    var svgWrap = document.createElement('div');
    svgWrap.className = 'sim-eua__stage-wrap';
    container.appendChild(svgWrap);

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'sim-eua__stage');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '유클리드 호제법 시각화');
    svgWrap.appendChild(svg);

    // ─── 단계 표 ───
    var stepsTbl = document.createElement('div');
    stepsTbl.className = 'sim-eua__steps';
    container.appendChild(stepsTbl);

    // ─── 결과 ───
    var result = document.createElement('div');
    result.className = 'sim-eua__result';
    container.appendChild(result);

    var note = document.createElement('p');
    note.className = 'sim-eua__note';
    note.innerHTML = '같은 절차를 숫자로만 쓰면 "큰 수 ÷ 작은 수, 나머지로 다시 나누기" — 우리가 학교에서 배운 호제법. 유클리드 〈원론〉 7권 명제 1–2.';
    container.appendChild(note);

    function applyInputs() {
      var a = parseInt(aInput.value, 10);
      var b = parseInt(bInput.value, 10);
      if (!isFinite(a) || !isFinite(b) || a < 2 || b < 2) {
        result.innerHTML = '<span class="sim-eua__err">a와 b 모두 2 이상 정수여야 해.</span>';
        return;
      }
      if (a > 500 || b > 500) {
        result.innerHTML = '<span class="sim-eua__err">500 이하로 해줘 (시각화가 너무 작아져).</span>';
        return;
      }
      state.a = Math.max(a, b);
      state.b = Math.min(a, b);
      render();
    }

    function render() {
      var data = gcdSteps(state.a, state.b);

      // ─── SVG 사각형 분할 그리기 ───
      var maxPx = 460;
      var scale = maxPx / state.a;
      var W = state.a * scale;
      var H = state.b * scale;
      svg.setAttribute('viewBox', '0 0 ' + (W + 2) + ' ' + (H + 2));
      svg.setAttribute('width', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      // 바깥 직사각형 a × b
      var outer = document.createElementNS(svgNS, 'rect');
      outer.setAttribute('x', '1'); outer.setAttribute('y', '1');
      outer.setAttribute('width', String(W));
      outer.setAttribute('height', String(H));
      outer.setAttribute('class', 'sim-eua__outer');
      svg.appendChild(outer);

      // 단계별로 정사각형(변 길이 y)을 q개 떼어낸다 — 떼어내는 방향은 가로/세로 번갈아.
      // 시작: 가로로 a, 세로로 b. y=b 정사각형을 가로 방향으로 q개 — 그러면 남는 직사각형은 b × r (이제 가로가 더 짧음 → 회전 효과).
      // 시뮬레이션에선 "원본 a×b 사각형 안에서 사각형을 배치"하므로, 현재 남아있는 직사각형의 위치/크기를 추적.
      var rectX = 1, rectY = 1, rectW = W, rectH = H;
      // 방향: true면 가로가 더 김 (정사각형을 가로 방향으로 떼어냄)
      var horizontal = state.a >= state.b;

      for (var i = 0; i < data.steps.length; i++) {
        var s = data.steps[i];
        var color = COLORS[i % COLORS.length];
        // 정사각형 변 길이 = s.y * scale
        var side = s.y * scale;
        for (var k = 0; k < s.q; k++) {
          var sq = document.createElementNS(svgNS, 'rect');
          if (horizontal) {
            sq.setAttribute('x', String(rectX + k * side));
            sq.setAttribute('y', String(rectY));
          } else {
            sq.setAttribute('x', String(rectX));
            sq.setAttribute('y', String(rectY + k * side));
          }
          sq.setAttribute('width', String(side));
          sq.setAttribute('height', String(side));
          sq.setAttribute('fill', color);
          sq.setAttribute('fill-opacity', String(0.32 + 0.06 * (i % 4)));
          sq.setAttribute('stroke', color);
          sq.setAttribute('stroke-width', '1');
          sq.setAttribute('class', 'sim-eua__sq');
          svg.appendChild(sq);

          // 변 길이 라벨 (첫 사각형에만)
          if (k === 0 && side > 20) {
            var lb = document.createElementNS(svgNS, 'text');
            var lbx = parseFloat(sq.getAttribute('x')) + side / 2;
            var lby = parseFloat(sq.getAttribute('y')) + side / 2 + 3;
            lb.setAttribute('x', String(lbx));
            lb.setAttribute('y', String(lby));
            lb.setAttribute('text-anchor', 'middle');
            lb.setAttribute('class', 'sim-eua__sq-lb');
            lb.textContent = s.y;
            svg.appendChild(lb);
          }
        }
        // 남은 직사각형 갱신
        if (horizontal) {
          rectX += s.q * side;
          rectW -= s.q * side;
        } else {
          rectY += s.q * side;
          rectH -= s.q * side;
        }
        horizontal = !horizontal;
        if (s.r === 0) break;
      }

      // ─── 단계 표 렌더 ───
      var tblHTML =
        '<div class="sim-eua__steps-head">' +
        '  <span>단계</span><span>나눗셈</span><span>몫</span><span>나머지</span>' +
        '</div>';
      for (var j = 0; j < data.steps.length; j++) {
        var st = data.steps[j];
        tblHTML +=
          '<div class="sim-eua__steps-row' + (j === data.steps.length - 1 ? ' sim-eua__steps-row--last' : '') + '">' +
          '  <span class="sim-eua__sn">' + (j + 1) + '</span>' +
          '  <span class="sim-eua__sd">' + st.x + ' = ' + st.y + ' × ' + st.q + ' + ' + st.r + '</span>' +
          '  <span class="sim-eua__sq2">' + st.q + '</span>' +
          '  <span class="sim-eua__sr">' + st.r + '</span>' +
          '</div>';
      }
      stepsTbl.innerHTML = tblHTML;

      // ─── 결과 ───
      result.innerHTML =
        '<div class="sim-eua__gcd">gcd(' + state.a + ', ' + state.b + ') = <em>' + data.gcd + '</em></div>' +
        '<div class="sim-eua__expl">마지막 단계에서 나머지가 0 — 그 직전의 나누는 수(가장 작은 정사각형의 변)가 곧 gcd다.</div>';
    }

    render();

    // ─── 스타일 ───
    if (!document.getElementById('sim-euclidean-algorithm-style')) {
      var style = document.createElement('style');
      style.id = 'sim-euclidean-algorithm-style';
      style.textContent =
        '.sim-euclidean-algorithm .sim-eua__controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:14px 0 6px;}' +
        '.sim-euclidean-algorithm .sim-eua__input-wrap{display:flex;align-items:center;gap:6px;}' +
        '.sim-euclidean-algorithm .sim-eua__lbl{font-family:var(--serif-en);font-style:italic;font-size:14px;color:var(--ink-soft);}' +
        '.sim-euclidean-algorithm .sim-eua__input{width:80px;font-family:var(--mono);font-size:14px;padding:5px 8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}' +
        '.sim-euclidean-algorithm .sim-eua__input:focus{outline:none;border-color:var(--accent);}' +
        '.sim-euclidean-algorithm .sim-eua__examples{margin:6px 0 12px;align-items:center;}' +
        '.sim-euclidean-algorithm .sim-eua__ex-head{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.08em;color:var(--ink-mute);text-transform:uppercase;}' +
        '.sim-euclidean-algorithm .sim-eua__ex{font-family:var(--mono);font-size:12px;padding:3px 8px;}' +
        '.sim-euclidean-algorithm .sim-eua__stage-wrap{margin:10px 0;background:var(--paper-light);border:1px solid var(--rule-soft);padding:10px;}' +
        '.sim-euclidean-algorithm .sim-eua__stage{width:100%;height:auto;display:block;max-width:520px;margin:0 auto;}' +
        '.sim-euclidean-algorithm .sim-eua__outer{fill:none;stroke:var(--ink);stroke-width:1.4;}' +
        '.sim-euclidean-algorithm .sim-eua__sq{transition:opacity 0.2s;}' +
        '.sim-euclidean-algorithm .sim-eua__sq-lb{font-family:var(--serif-en);font-size:11px;font-style:italic;fill:var(--ink);}' +
        '.sim-euclidean-algorithm .sim-eua__steps{display:flex;flex-direction:column;gap:0;margin-top:10px;border:1px solid var(--rule-soft);background:var(--paper);}' +
        '.sim-euclidean-algorithm .sim-eua__steps-head,.sim-euclidean-algorithm .sim-eua__steps-row{display:grid;grid-template-columns:60px 1fr 60px 60px;padding:6px 10px;font-family:var(--mono);font-size:12.5px;}' +
        '.sim-euclidean-algorithm .sim-eua__steps-head{background:var(--paper-light);color:var(--ink-mute);font-family:var(--sans-ko);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;border-bottom:1px solid var(--rule-soft);}' +
        '.sim-euclidean-algorithm .sim-eua__steps-row{color:var(--ink);border-bottom:1px solid var(--rule-soft);}' +
        '.sim-euclidean-algorithm .sim-eua__steps-row:last-child{border-bottom:none;}' +
        '.sim-euclidean-algorithm .sim-eua__steps-row--last{background:var(--paper-light);}' +
        '.sim-euclidean-algorithm .sim-eua__steps-row--last .sim-eua__sr{color:var(--accent);font-weight:700;}' +
        '.sim-euclidean-algorithm .sim-eua__sn{color:var(--ink-mute);}' +
        '.sim-euclidean-algorithm .sim-eua__sd{font-family:var(--mono);}' +
        '.sim-euclidean-algorithm .sim-eua__result{margin-top:14px;padding:12px 14px;background:var(--paper-light);border-left:3px solid var(--accent);}' +
        '.sim-euclidean-algorithm .sim-eua__gcd{font-family:var(--serif-en);font-size:18px;color:var(--ink);}' +
        '.sim-euclidean-algorithm .sim-eua__gcd em{font-style:italic;color:var(--accent);font-weight:700;font-size:22px;}' +
        '.sim-euclidean-algorithm .sim-eua__expl{margin-top:6px;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-soft);line-height:1.7;}' +
        '.sim-euclidean-algorithm .sim-eua__err{font-family:var(--sans-ko);font-size:13px;color:#b04848;}' +
        '.sim-euclidean-algorithm .sim-eua__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '@media (max-width:640px){.sim-euclidean-algorithm .sim-eua__steps-head,.sim-euclidean-algorithm .sim-eua__steps-row{grid-template-columns:40px 1fr 40px 40px;font-size:11.5px;padding:5px 8px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="euclidean-algorithm"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
