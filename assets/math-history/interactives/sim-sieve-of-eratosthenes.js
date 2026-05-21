/* ============================================================
   Simulation: Sieve of Eratosthenes
   1부터 N까지 격자에서 단계별로 합성수를 제거 → 소수만 남는다.
   각 단계: 다음 살아남은 수 p를 잡고, p² 부터 N까지 p의 배수를 모두 제거.
   Mounted on: <div class="sim" data-sim-id="sieve-of-eratosthenes">
   ============================================================ */

(function () {
  'use strict';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-sieve-of-eratosthenes');

    var state = {
      N: 100,
      sieve: [],       // 0: 미정, 1: 소수확정, 2: 합성수제거, 3: 1(특수)
      currentPrime: null,
      foundPrimes: [],
      step: 0,         // 0 = 시작 전
      done: false,
      playing: false,
      timer: null
    };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '에라토스테네스의 체. 2의 배수를 지우고, 다음 살아남은 수 3의 배수를 지우고, 5… 7… 이렇게 √N까지 한 단계씩. 끝나면 남은 수가 곧 소수다.';
    container.appendChild(lead);

    // ─── 컨트롤 ───
    var controls = document.createElement('div');
    controls.className = 'sim-controls sim-soe__controls';

    var sizeLabel = document.createElement('label');
    sizeLabel.className = 'sim-soe__size';
    sizeLabel.innerHTML = '<span class="sim-soe__sl">범위 N</span>';
    var sizeSel = document.createElement('select');
    sizeSel.className = 'sim-soe__sel';
    [50, 100, 200, 400].forEach(function (n) {
      var o = document.createElement('option');
      o.value = String(n); o.textContent = '1 ~ ' + n;
      if (n === 100) o.selected = true;
      sizeSel.appendChild(o);
    });
    sizeSel.addEventListener('change', function () {
      state.N = parseInt(sizeSel.value, 10);
      reset();
    });
    sizeLabel.appendChild(sizeSel);
    controls.appendChild(sizeLabel);

    var stepBtn = document.createElement('button');
    stepBtn.type = 'button';
    stepBtn.className = 'sim-btn sim-soe__step';
    stepBtn.textContent = '다음 단계';
    stepBtn.addEventListener('click', function () { stepOnce(); });
    controls.appendChild(stepBtn);

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'sim-btn sim-soe__play';
    playBtn.textContent = '▶ 자동';
    playBtn.addEventListener('click', function () { togglePlay(); });
    controls.appendChild(playBtn);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'sim-btn sim-soe__reset';
    resetBtn.textContent = '처음으로';
    resetBtn.addEventListener('click', function () { reset(); });
    controls.appendChild(resetBtn);

    container.appendChild(controls);

    // ─── 현재 단계 표시 ───
    var statusEl = document.createElement('div');
    statusEl.className = 'sim-soe__status';
    container.appendChild(statusEl);

    // ─── 격자 ───
    var grid = document.createElement('div');
    grid.className = 'sim-soe__grid';
    container.appendChild(grid);

    // ─── 결과 ───
    var result = document.createElement('div');
    result.className = 'sim-soe__result';
    container.appendChild(result);

    var note = document.createElement('p');
    note.className = 'sim-soe__note';
    note.innerHTML = '체는 단순하다 — 그런데도 끝까지 살아남은 수는 어떤 분명한 규칙으로 결정되지 않는다. "다음 소수는 어디에 있을까?"는 오늘까지 미해결 영역 (리만 가설).';
    container.appendChild(note);

    function reset() {
      stopPlay();
      state.sieve = new Array(state.N + 1).fill(0);
      state.sieve[0] = 3; // 0은 정의상 제외
      state.sieve[1] = 3; // 1은 소수 아님 (특수)
      state.currentPrime = null;
      state.foundPrimes = [];
      state.step = 0;
      state.done = false;
      stepBtn.disabled = false;
      playBtn.disabled = false;
      playBtn.textContent = '▶ 자동';
      buildGrid();
      renderStatus();
      renderResult();
    }

    function buildGrid() {
      grid.innerHTML = '';
      var cols = state.N <= 50 ? 10 : (state.N <= 100 ? 10 : (state.N <= 200 ? 20 : 20));
      grid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
      for (var i = 1; i <= state.N; i++) {
        var cell = document.createElement('div');
        cell.className = 'sim-soe__cell';
        cell.dataset.n = String(i);
        cell.textContent = i;
        if (i === 1) cell.classList.add('sim-soe__cell--one');
        grid.appendChild(cell);
      }
      paintCells();
    }

    function paintCells() {
      var cells = grid.querySelectorAll('.sim-soe__cell');
      for (var i = 0; i < cells.length; i++) {
        var n = parseInt(cells[i].dataset.n, 10);
        var s = state.sieve[n];
        cells[i].classList.remove('sim-soe__cell--prime', 'sim-soe__cell--composite', 'sim-soe__cell--active', 'sim-soe__cell--current');
        if (s === 1) cells[i].classList.add('sim-soe__cell--prime');
        else if (s === 2) cells[i].classList.add('sim-soe__cell--composite');
        if (state.currentPrime === n) cells[i].classList.add('sim-soe__cell--current');
      }
    }

    function highlightMultiples(p) {
      var cells = grid.querySelectorAll('.sim-soe__cell');
      for (var i = 0; i < cells.length; i++) {
        var n = parseInt(cells[i].dataset.n, 10);
        if (n > p && n % p === 0 && state.sieve[n] === 0) {
          cells[i].classList.add('sim-soe__cell--active');
        }
      }
    }

    function stepOnce() {
      if (state.done) return;
      // 1) 다음 소수 찾기
      var p = -1;
      var start = (state.currentPrime || 1) + 1;
      for (var i = start; i <= state.N; i++) {
        if (state.sieve[i] === 0) { p = i; break; }
      }
      if (p === -1 || p * p > state.N) {
        // 남은 모든 0을 소수로 확정하고 종료
        for (var j = 2; j <= state.N; j++) {
          if (state.sieve[j] === 0) { state.sieve[j] = 1; state.foundPrimes.push(j); }
        }
        state.done = true;
        state.currentPrime = null;
        stepBtn.disabled = true;
        playBtn.disabled = true;
        playBtn.textContent = '완료';
        stopPlay();
        paintCells();
        renderStatus();
        renderResult();
        return;
      }
      // p는 소수 확정
      state.sieve[p] = 1;
      state.foundPrimes.push(p);
      state.currentPrime = p;
      // p의 배수 제거 (p² 부터)
      for (var k = p * p; k <= state.N; k += p) {
        if (state.sieve[k] === 0) state.sieve[k] = 2;
      }
      state.step++;
      paintCells();
      highlightMultiples(p);
      renderStatus();
      renderResult();
    }

    function togglePlay() {
      if (state.playing) {
        stopPlay();
      } else {
        if (state.done) return;
        state.playing = true;
        playBtn.textContent = '■ 정지';
        state.timer = setInterval(function () {
          if (state.done) { stopPlay(); return; }
          stepOnce();
        }, 700);
      }
    }
    function stopPlay() {
      state.playing = false;
      playBtn.textContent = state.done ? '완료' : '▶ 자동';
      if (state.timer) { clearInterval(state.timer); state.timer = null; }
    }

    function renderStatus() {
      if (state.done) {
        statusEl.innerHTML = '<span class="sim-soe__done">체질 완료.</span>';
        return;
      }
      if (state.currentPrime === null) {
        statusEl.innerHTML = '<span class="sim-soe__hint">"다음 단계" 누르면 2부터 시작.</span>';
        return;
      }
      var p = state.currentPrime;
      statusEl.innerHTML =
        '<span class="sim-soe__cur">단계 ' + state.step + '</span>' +
        '<span class="sim-soe__cur-eq">' + p + '은 소수 — ' +
        p + '²=' + (p * p) + ' 부터 ' + p + '의 배수를 모두 제거.</span>';
    }

    function renderResult() {
      var found = state.foundPrimes.length;
      var expected = state.done ? found : (state.N === 100 ? 25 : null);
      var primesList = state.foundPrimes.slice(0, 20).join(', ');
      if (state.foundPrimes.length > 20) primesList += ', …';
      result.innerHTML =
        '<div class="sim-soe__count">발견한 소수: <em>' + found + '</em>개' +
        (state.done && state.N === 100 ? ' <span class="sim-soe__exp">(1–100에는 정확히 25개)</span>' : '') +
        '</div>' +
        (found > 0 ? '<div class="sim-soe__list">' + primesList + '</div>' : '');
    }

    // 초기화
    reset();

    // ─── 스타일 ───
    if (!document.getElementById('sim-sieve-of-eratosthenes-style')) {
      var style = document.createElement('style');
      style.id = 'sim-sieve-of-eratosthenes-style';
      style.textContent =
        '.sim-sieve-of-eratosthenes .sim-soe__controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:14px 0 10px;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__size{display:flex;align-items:center;gap:6px;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__sl{font-family:var(--sans-ko);font-size:12px;color:var(--ink-mute);letter-spacing:0.04em;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__sel{font-family:var(--mono);font-size:13px;padding:4px 8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}' +
        '.sim-sieve-of-eratosthenes .sim-soe__status{margin:8px 0 10px;font-family:var(--sans-ko);font-size:13px;color:var(--ink-soft);min-height:1.6em;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__cur{display:inline-block;font-family:var(--serif-en);font-style:italic;color:var(--accent);margin-right:10px;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__cur-eq{color:var(--ink);}' +
        '.sim-sieve-of-eratosthenes .sim-soe__hint{font-style:italic;color:var(--ink-mute);}' +
        '.sim-sieve-of-eratosthenes .sim-soe__done{font-family:var(--serif-en);font-style:italic;color:var(--accent);font-weight:600;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__grid{display:grid;gap:2px;padding:8px;background:var(--paper-light);border:1px solid var(--rule-soft);max-width:560px;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__cell{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:12px;background:var(--paper);color:var(--ink);transition:background 0.18s, color 0.18s;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__cell--one{color:var(--ink-mute);background:var(--paper-light);}' +
        '.sim-sieve-of-eratosthenes .sim-soe__cell--prime{background:var(--accent);color:var(--paper);font-weight:700;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__cell--composite{color:var(--ink-mute);background:var(--paper-light);text-decoration:line-through;text-decoration-color:rgba(0,0,0,0.35);opacity:0.55;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__cell--current{outline:2px solid var(--ink);outline-offset:-2px;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__cell--active{animation:simSoeFlash 0.6s ease-out;background:#f4d77a;color:var(--ink);}' +
        '@keyframes simSoeFlash{0%{background:#f4d77a;}100%{background:var(--paper-light);}}' +
        '.sim-sieve-of-eratosthenes .sim-soe__result{margin-top:14px;padding:10px 14px;background:var(--paper-light);border-left:3px solid var(--accent);}' +
        '.sim-sieve-of-eratosthenes .sim-soe__count{font-family:var(--serif-en);font-size:14px;color:var(--ink);}' +
        '.sim-sieve-of-eratosthenes .sim-soe__count em{font-style:italic;color:var(--accent);font-weight:700;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__exp{font-size:12px;color:var(--ink-mute);margin-left:6px;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__list{margin-top:6px;font-family:var(--mono);font-size:11.5px;color:var(--ink-soft);word-break:break-all;line-height:1.6;}' +
        '.sim-sieve-of-eratosthenes .sim-soe__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '@media (max-width:640px){.sim-sieve-of-eratosthenes .sim-soe__cell{font-size:10px;}.sim-sieve-of-eratosthenes .sim-soe__controls{gap:8px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="sieve-of-eratosthenes"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
