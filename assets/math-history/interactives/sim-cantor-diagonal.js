/* ============================================================
   Simulation: Cantor's diagonal argument (실수의 비가산성)
   (0,1) 사이 실수 목록 → 대각선 추출 → 자리 바꿈 → 새 실수
   "이 새 실수는 목록에 없다" — 즉, 어떤 실수 목록도 빠뜨림이 있다.
   Mounted on: <div class="sim" data-sim-id="cantor-diagonal">
   ============================================================ */

(function () {
  'use strict';

  var N = 8;       // 보여줄 행 수
  var DIG = 10;    // 소수점 자리 수

  // 시드 기반 의사난수 (재현 가능)
  function makeRng(seed) {
    var s = seed | 0;
    return function () { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) % 1000) / 1000; };
  }

  function genDigits(seed) {
    var rng = makeRng(seed);
    var rows = [];
    for (var i = 0; i < N; i++) {
      var row = [];
      for (var j = 0; j < DIG; j++) row.push(Math.floor(rng() * 10));
      rows.push(row);
    }
    return rows;
  }

  // 자리 바꿈 규칙: 5 → 6, 그 외 → 5
  function flip(d) { return d === 5 ? 6 : 5; }

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-cantor-diagonal');

    var state = { phase: 0, seed: 17, rows: null };
    state.rows = genDigits(state.seed);

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '(0,1) 사이의 실수들을 한 줄씩 적어 보자. 어떻게 적어도 — 어떤 무한 목록이라도 — 빠뜨린 실수가 적어도 하나 있다. 칸토어의 대각선 논법.';
    container.appendChild(lead);

    var grid = document.createElement('div');
    grid.className = 'sim-cd__grid';
    container.appendChild(grid);

    var rulePanel = document.createElement('div');
    rulePanel.className = 'sim-cd__rule';
    rulePanel.innerHTML = '<strong>자리 바꿈 규칙</strong> &nbsp;— &nbsp;5 → 6, &nbsp;그 외 → 5';
    container.appendChild(rulePanel);

    var newRow = document.createElement('div');
    newRow.className = 'sim-cd__new';
    container.appendChild(newRow);

    var proof = document.createElement('div');
    proof.className = 'sim-cd__proof';
    container.appendChild(proof);

    var ctrls = document.createElement('div');
    ctrls.className = 'sim-controls sim-cd__controls';
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button'; nextBtn.className = 'sim-btn';
    var resetBtn = document.createElement('button');
    resetBtn.type = 'button'; resetBtn.className = 'sim-btn';
    resetBtn.textContent = '새 목록으로';
    nextBtn.addEventListener('click', function () { if (state.phase < 4) { state.phase++; render(); } });
    resetBtn.addEventListener('click', function () { state.seed = (state.seed * 31 + 7) | 0; state.rows = genDigits(state.seed); state.phase = 0; render(); });
    ctrls.appendChild(nextBtn); ctrls.appendChild(resetBtn);
    container.appendChild(ctrls);

    var note = document.createElement('p');
    note.className = 'sim-cd__note';
    note.innerHTML = '칸토어(1891)는 이 한 줄짜리 논증으로 "실수가 자연수보다 진정 더 많다"는 것을 보였다. 무한에 <em>크기 등급</em>이 있다 — 수학 전체가 다시 흔들렸다.';
    container.appendChild(note);

    function render() {
      // ─── 격자 ───
      grid.innerHTML = '';
      for (var i = 0; i < N; i++) {
        var rowEl = document.createElement('div');
        rowEl.className = 'sim-cd__row';
        var label = document.createElement('span');
        label.className = 'sim-cd__rowlabel';
        label.innerHTML = '<em>r</em><sub>' + (i + 1) + '</sub> &nbsp;= &nbsp;0.';
        rowEl.appendChild(label);
        for (var j = 0; j < DIG; j++) {
          var cell = document.createElement('span');
          cell.className = 'sim-cd__cell';
          if (state.phase >= 1 && i === j) cell.classList.add('sim-cd__cell--diag');
          if (state.phase >= 2 && i === j) cell.classList.add('sim-cd__cell--flipped');
          cell.textContent = state.rows[i][j];
          rowEl.appendChild(cell);
        }
        grid.appendChild(rowEl);
      }

      // ─── 새 숫자 ───
      newRow.innerHTML = '';
      if (state.phase >= 1) {
        var diagBox = document.createElement('div');
        diagBox.className = 'sim-cd__line';
        var lbl1 = document.createElement('span');
        lbl1.className = 'sim-cd__linelabel';
        lbl1.textContent = '대각선 추출';
        diagBox.appendChild(lbl1);
        var diagNum = document.createElement('span');
        diagNum.className = 'sim-cd__num sim-cd__num--diag';
        var ds = '0.';
        for (var k = 0; k < N; k++) ds += state.rows[k][k];
        diagNum.textContent = ds;
        diagBox.appendChild(diagNum);
        newRow.appendChild(diagBox);
      }
      if (state.phase >= 2) {
        var flipBox = document.createElement('div');
        flipBox.className = 'sim-cd__line';
        var lbl2 = document.createElement('span');
        lbl2.className = 'sim-cd__linelabel';
        lbl2.textContent = '자리 바꿈 → 새 실수';
        flipBox.appendChild(lbl2);
        var newNum = document.createElement('span');
        newNum.className = 'sim-cd__num sim-cd__num--new';
        var ns = '0.';
        for (var m = 0; m < N; m++) ns += flip(state.rows[m][m]);
        newNum.textContent = ns;
        flipBox.appendChild(newNum);
        newRow.appendChild(flipBox);
      }

      // ─── 증명 ───
      proof.innerHTML = '';
      if (state.phase >= 3) {
        var lines = [];
        for (var p = 0; p < N; p++) {
          var orig = state.rows[p][p], chg = flip(orig);
          lines.push('<li><em>r</em><sub>' + (p + 1) + '</sub>의 ' + (p + 1) + '자리 = ' + orig + ', &nbsp;새 수의 ' + (p + 1) + '자리 = ' + chg + ' &nbsp;⇒ &nbsp;<em>r</em><sub>' + (p + 1) + '</sub>와 다르다.</li>');
        }
        proof.innerHTML =
          '<div class="sim-cd__proof-title">왜 이 새 실수가 목록에 없는가</div>' +
          '<ul class="sim-cd__proof-list">' + lines.join('') + '</ul>';
      }
      if (state.phase >= 4) {
        proof.innerHTML +=
          '<div class="sim-cd__proof-conc">' +
          '∴ 새 실수는 목록의 <em>모든 행</em>과 적어도 한 자리에서 다르다. 즉 어떤 행과도 같지 않다 — <strong>목록에 없다</strong>. ' +
          '아무리 긴 (자연수와 1대1로 짝지은) 목록을 만들어도 빠뜨림이 있으므로, 실수는 자연수보다 <em>본질적으로 더 많다</em>.' +
          '</div>';
      }

      // 버튼 라벨
      var labels = ['대각선 표시 →', '자리 바꿔 새 실수 만들기 →', '왜 목록에 없는지 보이기 →', '결론 →', '완료'];
      nextBtn.textContent = labels[state.phase];
      nextBtn.disabled = state.phase >= 4;
    }

    render();

    // ─── 스타일 ───
    if (!document.getElementById('sim-cantor-diagonal-style')) {
      var style = document.createElement('style');
      style.id = 'sim-cantor-diagonal-style';
      style.textContent =
        '.sim-cantor-diagonal .sim-cd__grid{margin:14px 0 12px;font-family:var(--mono);font-size:14px;line-height:1.5;background:var(--paper-light);padding:12px 14px;border:1px solid var(--rule-soft);overflow-x:auto;}' +
        '.sim-cantor-diagonal .sim-cd__row{display:flex;align-items:center;gap:2px;white-space:nowrap;}' +
        '.sim-cantor-diagonal .sim-cd__rowlabel{color:var(--ink-mute);font-family:var(--serif-en);margin-right:4px;}' +
        '.sim-cantor-diagonal .sim-cd__rowlabel em{font-style:italic;}' +
        '.sim-cantor-diagonal .sim-cd__cell{display:inline-block;width:18px;text-align:center;color:var(--ink-soft);transition:all 0.25s;}' +
        '.sim-cantor-diagonal .sim-cd__cell--diag{color:var(--accent);font-weight:700;background:#fff4d6;}' +
        '.sim-cantor-diagonal .sim-cd__cell--flipped{color:#b04848;}' +
        '.sim-cantor-diagonal .sim-cd__rule{font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);padding:6px 10px;background:var(--paper);border-left:2px solid var(--accent);}' +
        '.sim-cantor-diagonal .sim-cd__rule strong{font-family:var(--serif-ko);color:var(--ink);}' +
        '.sim-cantor-diagonal .sim-cd__new{margin-top:12px;display:flex;flex-direction:column;gap:8px;}' +
        '.sim-cantor-diagonal .sim-cd__line{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;}' +
        '.sim-cantor-diagonal .sim-cd__linelabel{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;}' +
        '.sim-cantor-diagonal .sim-cd__num{font-family:var(--mono);font-size:15px;padding:4px 10px;border:1px solid var(--rule-soft);background:var(--paper);}' +
        '.sim-cantor-diagonal .sim-cd__num--diag{color:var(--accent);background:#fff4d6;border-color:#a37e2c;}' +
        '.sim-cantor-diagonal .sim-cd__num--new{color:#b04848;background:#fbeeee;border-color:#b04848;font-weight:600;}' +
        '.sim-cantor-diagonal .sim-cd__proof{margin-top:12px;}' +
        '.sim-cantor-diagonal .sim-cd__proof-title{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.08em;color:var(--ink-mute);text-transform:uppercase;margin-bottom:6px;}' +
        '.sim-cantor-diagonal .sim-cd__proof-list{margin:0 0 10px;padding-left:1.2em;font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);line-height:1.8;}' +
        '.sim-cantor-diagonal .sim-cd__proof-list em{font-family:var(--serif-en);font-style:italic;color:var(--ink);}' +
        '.sim-cantor-diagonal .sim-cd__proof-conc{padding:10px 12px;background:var(--paper-light);border-left:3px solid var(--accent);font-family:var(--sans-ko);font-size:13px;color:var(--ink);line-height:1.75;}' +
        '.sim-cantor-diagonal .sim-cd__proof-conc strong{color:var(--accent);}' +
        '.sim-cantor-diagonal .sim-cd__proof-conc em{font-style:italic;color:var(--ink-soft);}' +
        '.sim-cantor-diagonal .sim-cd__controls{margin-top:14px;}' +
        '.sim-cantor-diagonal .sim-cd__controls button[disabled]{opacity:0.4;cursor:not-allowed;}' +
        '.sim-cantor-diagonal .sim-cd__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-cantor-diagonal .sim-cd__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-cantor-diagonal .sim-cd__grid{font-size:12.5px;}.sim-cantor-diagonal .sim-cd__cell{width:15px;}.sim-cantor-diagonal .sim-cd__num{font-size:13px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="cantor-diagonal"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
