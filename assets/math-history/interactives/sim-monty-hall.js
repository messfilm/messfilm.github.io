/* ============================================================
   Simulation: Monty Hall Problem
   3개 문 중 차가 1개. 선택 → 호스트가 빈 문 공개 → 유지/바꾸기.
   바꾸면 2/3, 유지하면 1/3 확률 — 표본으로 직접 확인한다.
   Mounted on: <div class="sim" data-sim-id="monty-hall">
   ============================================================ */

(function () {
  'use strict';

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-monty-hall');

    var state = {
      phase: 'pick',     // 'pick' | 'decide' | 'reveal'
      carDoor: -1,
      pickedDoor: -1,
      openedDoor: -1,
      // 누적 통계
      stayPlays: 0, stayWins: 0,
      switchPlays: 0, switchWins: 0
    };

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '문 세 개 중 하나에 차가 있다. 너의 선택 다음, 호스트는 항상 차 없는 빈 문을 하나 연다. 이제 결정 — 유지할까, 바꿀까?';
    container.appendChild(lead);

    // ─── 문 표시 ───
    var doorsEl = document.createElement('div');
    doorsEl.className = 'sim-mh__doors';
    container.appendChild(doorsEl);

    // ─── 메시지 ───
    var msgEl = document.createElement('div');
    msgEl.className = 'sim-mh__msg';
    container.appendChild(msgEl);

    // ─── 결정 버튼 ───
    var decideRow = document.createElement('div');
    decideRow.className = 'sim-controls sim-mh__decide-row';
    var stayBtn = makeBtn('유지 (지금 문 그대로)', 'sim-mh__stay');
    var switchBtn = makeBtn('바꾸기 (남은 문으로)', 'sim-mh__switch');
    stayBtn.addEventListener('click', function () { resolve('stay'); });
    switchBtn.addEventListener('click', function () { resolve('switch'); });
    decideRow.appendChild(stayBtn);
    decideRow.appendChild(switchBtn);
    container.appendChild(decideRow);

    // ─── 다음 게임 / 자동 시뮬 ───
    var ctrlRow = document.createElement('div');
    ctrlRow.className = 'sim-controls sim-mh__ctrl-row';
    var nextBtn = makeBtn('다음 게임', '');
    var auto100Btn = makeBtn('100번 자동 (유지)', '');
    var auto100SwBtn = makeBtn('100번 자동 (바꾸기)', '');
    var resetBtn = makeBtn('통계 초기화', 'sim-mh__reset');
    nextBtn.addEventListener('click', startGame);
    auto100Btn.addEventListener('click', function () { autoSim('stay', 100); });
    auto100SwBtn.addEventListener('click', function () { autoSim('switch', 100); });
    resetBtn.addEventListener('click', resetStats);
    ctrlRow.appendChild(nextBtn);
    ctrlRow.appendChild(auto100Btn);
    ctrlRow.appendChild(auto100SwBtn);
    ctrlRow.appendChild(resetBtn);
    container.appendChild(ctrlRow);

    // ─── 통계 ───
    var statsEl = document.createElement('div');
    statsEl.className = 'sim-mh__stats';
    container.appendChild(statsEl);

    var note = document.createElement('p');
    note.className = 'sim-mh__note';
    note.innerHTML = '핵심: 호스트는 무작위로 여는 게 아니라 <em>항상 차 없는 빈 문</em>을 연다. 이 정보가 처음 선택(1/3)과 남은 문(2/3) 사이의 비대칭을 만든다.';
    container.appendChild(note);

    function makeBtn(label, cls) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sim-btn' + (cls ? ' ' + cls : '');
      b.textContent = label;
      return b;
    }

    function startGame() {
      state.phase = 'pick';
      state.carDoor = Math.floor(Math.random() * 3);
      state.pickedDoor = -1;
      state.openedDoor = -1;
      render();
    }

    function pickDoor(idx) {
      if (state.phase !== 'pick') return;
      state.pickedDoor = idx;
      // 호스트가 빈 문 공개 (carDoor도 아니고 picked도 아닌 문)
      var avail = [];
      for (var i = 0; i < 3; i++) {
        if (i !== state.carDoor && i !== state.pickedDoor) avail.push(i);
      }
      // 보통 1개 (사용자가 차를 골랐으면 2개 — 그중 하나 무작위)
      state.openedDoor = avail[Math.floor(Math.random() * avail.length)];
      state.phase = 'decide';
      render();
    }

    function resolve(action) {
      if (state.phase !== 'decide') return;
      var finalDoor = state.pickedDoor;
      if (action === 'switch') {
        for (var i = 0; i < 3; i++) {
          if (i !== state.pickedDoor && i !== state.openedDoor) { finalDoor = i; break; }
        }
      }
      var win = finalDoor === state.carDoor;
      if (action === 'stay') {
        state.stayPlays++;
        if (win) state.stayWins++;
      } else {
        state.switchPlays++;
        if (win) state.switchWins++;
      }
      state.finalDoor = finalDoor;
      state.action = action;
      state.win = win;
      state.phase = 'reveal';
      render();
    }

    function autoSim(strategy, n) {
      for (var k = 0; k < n; k++) {
        var car = Math.floor(Math.random() * 3);
        var picked = Math.floor(Math.random() * 3);
        // 호스트 공개
        var avail = [];
        for (var i = 0; i < 3; i++) if (i !== car && i !== picked) avail.push(i);
        var opened = avail[Math.floor(Math.random() * avail.length)];
        var finalDoor;
        if (strategy === 'stay') {
          finalDoor = picked;
        } else {
          for (var j = 0; j < 3; j++) if (j !== picked && j !== opened) { finalDoor = j; break; }
        }
        var w = finalDoor === car;
        if (strategy === 'stay') {
          state.stayPlays++;
          if (w) state.stayWins++;
        } else {
          state.switchPlays++;
          if (w) state.switchWins++;
        }
      }
      render();
    }

    function resetStats() {
      state.stayPlays = state.stayWins = 0;
      state.switchPlays = state.switchWins = 0;
      render();
    }

    function render() {
      // 문 그리기
      doorsEl.innerHTML = '';
      for (var i = 0; i < 3; i++) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'sim-mh__door';
        d.dataset.idx = String(i);

        var isPicked = state.pickedDoor === i;
        var isOpened = state.openedDoor === i;
        var revealed = state.phase === 'reveal';

        if (isPicked) d.classList.add('sim-mh__door--picked');
        if (isOpened) d.classList.add('sim-mh__door--opened');
        if (revealed && state.finalDoor === i) d.classList.add('sim-mh__door--final');
        if (revealed && state.carDoor === i) d.classList.add('sim-mh__door--car');

        var inside = '';
        if (isOpened) {
          inside = '<span class="sim-mh__door-content sim-mh__goat">🐐</span>';
        } else if (revealed) {
          inside = state.carDoor === i
            ? '<span class="sim-mh__door-content sim-mh__car">★</span>'
            : '<span class="sim-mh__door-content sim-mh__goat">🐐</span>';
        } else {
          inside = '<span class="sim-mh__door-num">' + (i + 1) + '</span>';
        }
        d.innerHTML = '<span class="sim-mh__door-frame">' + inside + '</span>';

        // 클릭 핸들러
        (function (idx) {
          d.addEventListener('click', function () {
            if (state.phase === 'pick') pickDoor(idx);
          });
        })(i);

        d.disabled = state.phase !== 'pick';
        doorsEl.appendChild(d);
      }

      // 메시지
      if (state.phase === 'pick' && state.carDoor === -1) {
        msgEl.innerHTML = '<span class="sim-mh__msg-start">"다음 게임" 누르고 시작.</span>';
      } else if (state.phase === 'pick') {
        msgEl.innerHTML = '<span class="sim-mh__msg-pick">문 하나 선택. 차는 무작위로 한 문 뒤에 있다.</span>';
      } else if (state.phase === 'decide') {
        msgEl.innerHTML =
          '<span class="sim-mh__msg-decide">호스트가 <em>' + (state.openedDoor + 1) + '번 문</em>을 열었다 (빈 문). ' +
          '너는 <em>' + (state.pickedDoor + 1) + '번 문</em>을 선택했다. 유지할까, 남은 문으로 바꿀까?</span>';
      } else if (state.phase === 'reveal') {
        var verdict = state.win ? '<em class="sim-mh__win">차를 얻었다.</em>' : '<em class="sim-mh__lose">염소다.</em>';
        var actLbl = state.action === 'stay' ? '유지' : '바꿈';
        msgEl.innerHTML = '<span class="sim-mh__msg-result">' + actLbl + ' → ' + verdict + ' 차는 ' + (state.carDoor + 1) + '번 문 뒤였다.</span>';
      }

      // 버튼 상태
      stayBtn.disabled = state.phase !== 'decide';
      switchBtn.disabled = state.phase !== 'decide';
      nextBtn.disabled = state.phase === 'decide';

      // 통계
      var sP = state.stayPlays, sW = state.stayWins;
      var swP = state.switchPlays, swW = state.switchWins;
      var sRate = sP > 0 ? (sW / sP) : null;
      var swRate = swP > 0 ? (swW / swP) : null;
      statsEl.innerHTML =
        '<div class="sim-mh__stat-block sim-mh__stat-block--stay">' +
        '<h5 class="sim-mh__stat-title">유지 전략</h5>' +
        '<div class="sim-mh__stat-row"><span class="sim-mh__sl">게임</span>' +
        '<em class="sim-mh__sv">' + sP + '</em></div>' +
        '<div class="sim-mh__stat-row"><span class="sim-mh__sl">승</span>' +
        '<em class="sim-mh__sv">' + sW + '</em></div>' +
        '<div class="sim-mh__stat-row"><span class="sim-mh__sl">승률</span>' +
        '<em class="sim-mh__sv sim-mh__sv--rate">' + (sRate === null ? '—' : (sRate * 100).toFixed(1) + '%') + '</em>' +
        '<span class="sim-mh__sl-sub">(이론 33.3%)</span></div>' +
        '</div>' +
        '<div class="sim-mh__stat-block sim-mh__stat-block--switch">' +
        '<h5 class="sim-mh__stat-title">바꾸기 전략</h5>' +
        '<div class="sim-mh__stat-row"><span class="sim-mh__sl">게임</span>' +
        '<em class="sim-mh__sv">' + swP + '</em></div>' +
        '<div class="sim-mh__stat-row"><span class="sim-mh__sl">승</span>' +
        '<em class="sim-mh__sv">' + swW + '</em></div>' +
        '<div class="sim-mh__stat-row"><span class="sim-mh__sl">승률</span>' +
        '<em class="sim-mh__sv sim-mh__sv--rate">' + (swRate === null ? '—' : (swRate * 100).toFixed(1) + '%') + '</em>' +
        '<span class="sim-mh__sl-sub">(이론 66.7%)</span></div>' +
        '</div>';
    }

    // 초기 렌더 (pick 단계 시작 전)
    render();
    // 첫 게임 자동 시작
    startGame();

    // ─── 스타일 ───
    if (!document.getElementById('sim-monty-hall-style')) {
      var style = document.createElement('style');
      style.id = 'sim-monty-hall-style';
      style.textContent =
        '.sim-monty-hall .sim-mh__doors{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:14px 0 12px;}' +
        '.sim-monty-hall .sim-mh__door{padding:0;background:transparent;border:none;cursor:pointer;font-family:inherit;}' +
        '.sim-monty-hall .sim-mh__door:disabled{cursor:default;}' +
        '.sim-monty-hall .sim-mh__door-frame{display:flex;align-items:center;justify-content:center;aspect-ratio:3/4;background:var(--paper-light);border:2px solid var(--rule);transition:all 0.2s;}' +
        '.sim-monty-hall .sim-mh__door:hover:not(:disabled) .sim-mh__door-frame{border-color:var(--accent);background:var(--paper);}' +
        '.sim-monty-hall .sim-mh__door--picked .sim-mh__door-frame{border-color:var(--accent);border-width:3px;background:var(--paper);}' +
        '.sim-monty-hall .sim-mh__door--opened .sim-mh__door-frame{background:var(--paper);border-color:var(--ink-mute);border-style:dashed;}' +
        '.sim-monty-hall .sim-mh__door--final .sim-mh__door-frame{outline:3px solid var(--accent);outline-offset:2px;}' +
        '.sim-monty-hall .sim-mh__door-num{font-family:var(--serif-en);font-size:38px;font-style:italic;color:var(--ink-mute);}' +
        '.sim-monty-hall .sim-mh__door-content{font-size:42px;line-height:1;}' +
        '.sim-monty-hall .sim-mh__car{font-family:var(--serif-en);color:var(--accent);font-weight:700;}' +
        '.sim-monty-hall .sim-mh__goat{color:var(--ink-soft);font-size:36px;}' +
        '.sim-monty-hall .sim-mh__msg{min-height:1.8em;margin:8px 0 10px;font-family:var(--sans-ko);font-size:13px;color:var(--ink-soft);line-height:1.6;}' +
        '.sim-monty-hall .sim-mh__msg em{font-family:var(--serif-en);font-style:italic;color:var(--accent);font-weight:normal;}' +
        '.sim-monty-hall .sim-mh__win{color:var(--accent);font-weight:600;}' +
        '.sim-monty-hall .sim-mh__lose{color:var(--ink-mute);}' +
        '.sim-monty-hall .sim-mh__decide-row{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 12px;}' +
        '.sim-monty-hall .sim-mh__ctrl-row{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px;}' +
        '.sim-monty-hall .sim-mh__stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;}' +
        '.sim-monty-hall .sim-mh__stat-block{padding:10px 12px;background:var(--paper-light);border:1px solid var(--rule-soft);}' +
        '.sim-monty-hall .sim-mh__stat-block--stay{border-top:3px solid var(--ink-mute);}' +
        '.sim-monty-hall .sim-mh__stat-block--switch{border-top:3px solid var(--accent);}' +
        '.sim-monty-hall .sim-mh__stat-title{margin:0 0 6px;font-family:var(--serif-ko);font-size:13px;color:var(--ink);font-weight:700;}' +
        '.sim-monty-hall .sim-mh__stat-row{display:flex;align-items:baseline;gap:8px;font-size:12px;margin:2px 0;}' +
        '.sim-monty-hall .sim-mh__sl{font-family:var(--sans-ko);color:var(--ink-mute);min-width:36px;}' +
        '.sim-monty-hall .sim-mh__sl-sub{font-family:var(--mono);font-size:10.5px;color:var(--ink-mute);}' +
        '.sim-monty-hall .sim-mh__sv{font-family:var(--mono);font-style:normal;color:var(--ink);font-weight:600;}' +
        '.sim-monty-hall .sim-mh__sv--rate{color:var(--accent);}' +
        '.sim-monty-hall .sim-mh__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-monty-hall .sim-mh__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-monty-hall .sim-mh__door-num{font-size:28px;}.sim-monty-hall .sim-mh__door-content{font-size:32px;}.sim-monty-hall .sim-mh__goat{font-size:28px;}.sim-monty-hall .sim-mh__stats{grid-template-columns:1fr;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="monty-hall"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
