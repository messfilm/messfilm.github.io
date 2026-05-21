/* ============================================================
   Simulation: Hilbert's Hotel (무한 호텔의 손님 배정)
   ∞+1 = ∞, ∞+∞ = ∞ — 무한이라는 "수"가 유한의 직관을 어떻게 깨는가.
   Mounted on: <div class="sim" data-sim-id="hilbert-hotel">
   ============================================================ */

(function () {
  'use strict';

  var SHOW = 12; // 화면에 보일 방 수 (이후는 …)

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-hilbert-hotel');

    // 각 방: { occupant: 'G' (기존 손님 id) | 'N' (새 손님) | null }
    var state = { rooms: [], scenario: null, narration: '' };
    function reset() {
      state.rooms = [];
      for (var i = 0; i < SHOW; i++) state.rooms.push({ kind: 'G', id: i + 1 });
      state.scenario = null;
      state.narration = '시작: ∞개의 방 모두에 손님이 있다 (만실). 그런데 새 손님이 도착한다 — 어떻게 받을까?';
    }
    reset();

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '힐베르트가 강의에서 즐겨 쓴 비유: 방이 자연수만큼 무한히 있는 호텔. 만실인데도 새 손님을 받을 수 있다. 한 명이든, 무한 명이든.';
    container.appendChild(lead);

    var rowsWrap = document.createElement('div');
    rowsWrap.className = 'sim-hh__rows';
    container.appendChild(rowsWrap);

    var narr = document.createElement('div');
    narr.className = 'sim-hh__narr';
    container.appendChild(narr);

    var btnRow = document.createElement('div');
    btnRow.className = 'sim-controls sim-hh__btns';
    function makeBtn(text, handler, cls) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sim-btn ' + (cls || '');
      b.textContent = text; b.addEventListener('click', handler);
      return b;
    }
    var aBtn = makeBtn('A · 1명 도착 → 모두 +1로 이동', function () { runScenarioA(); });
    var bBtn = makeBtn('B · 무한 명 도착 → 모두 ×2로 이동', function () { runScenarioB(); });
    var rBtn = makeBtn('처음으로', function () { reset(); render(); }, 'sim-hh__reset');
    btnRow.appendChild(aBtn); btnRow.appendChild(bBtn); btnRow.appendChild(rBtn);
    container.appendChild(btnRow);

    var explain = document.createElement('div');
    explain.className = 'sim-hh__explain';
    container.appendChild(explain);

    var note = document.createElement('p');
    note.className = 'sim-hh__note';
    note.innerHTML = '핵심: 무한집합 ℕ과 그 부분집합(짝수만, 홀수만…) 사이에 <em>일대일 대응</em>이 존재한다. 그래서 ∞+1, ∞+∞ 모두 ∞와 "같은 크기" — 가산무한(ℵ₀)이다.';
    container.appendChild(note);

    function runScenarioA() {
      // n → n+1: 1번방이 빈다
      reset();
      state.scenario = 'A';
      // 모든 기존 손님 id+1로 이동: 첫 방 비움, 마지막은 잘림(…로 표현)
      for (var i = state.rooms.length - 1; i > 0; i--) {
        state.rooms[i] = { kind: 'G', id: state.rooms[i - 1].id };
      }
      state.rooms[0] = { kind: 'N', id: 1 };
      state.narration = '모든 손님이 n번방 → (n+1)번방으로 한 칸씩 이동. 1번방이 비었고, 새 손님은 1번방으로.';
      render();
      explain.innerHTML =
        '<div class="sim-hh__rule"><strong>매핑</strong> &nbsp;<em>f</em>(n) = n + 1 &nbsp;&nbsp;(기존 손님)</div>' +
        '<p>유한 호텔이라면 마지막 방의 손님이 갈 곳이 없다. 무한 호텔에서는 "마지막"이 없으므로 모두에게 갈 방이 있다. ' +
        '∴ <em>∞ + 1 = ∞</em>.</p>';
    }

    function runScenarioB() {
      // n → 2n: 홀수 방이 비고, 새 손님 무한 명이 채움
      reset();
      state.scenario = 'B';
      // 새 배열 구성: 짝수 인덱스(=홀수번방 idx 0,2,4...)는 새 손님, 홀수 인덱스(짝수번방)는 기존 (idx/2+1)번
      var next = [];
      for (var i = 0; i < state.rooms.length; i++) {
        var roomNum = i + 1;
        if (roomNum % 2 === 0) next.push({ kind: 'G', id: roomNum / 2 });
        else next.push({ kind: 'N', id: (roomNum + 1) / 2 });
      }
      state.rooms = next;
      state.narration = '모든 기존 손님이 n번방 → (2n)번방으로 이동. 홀수 방이 모두 비었고, 새 손님 무한 명이 1, 3, 5, … 방을 채운다.';
      render();
      explain.innerHTML =
        '<div class="sim-hh__rule"><strong>매핑</strong> &nbsp;기존 손님 <em>f</em>(n) = 2n &nbsp;·&nbsp; 새 손님 <em>g</em>(k) = 2k − 1</div>' +
        '<p>홀수와 짝수 모두 무한히 많다. 무한 + 무한이지만, 둘 다 자연수와 1대1로 짝지어진다. ' +
        '∴ <em>∞ + ∞ = ∞</em> (같은 농도 ℵ₀).</p>';
    }

    function render() {
      rowsWrap.innerHTML = '';
      var rowEl = document.createElement('div');
      rowEl.className = 'sim-hh__row';
      for (var i = 0; i < SHOW; i++) {
        var roomNum = i + 1;
        var occ = state.rooms[i];
        var cell = document.createElement('div');
        cell.className = 'sim-hh__room';
        var roomLabel = document.createElement('span');
        roomLabel.className = 'sim-hh__roomnum';
        roomLabel.textContent = roomNum;
        cell.appendChild(roomLabel);
        var guest = document.createElement('span');
        guest.className = 'sim-hh__guest';
        if (occ) {
          if (occ.kind === 'G') { guest.classList.add('sim-hh__guest--orig'); guest.textContent = 'G' + occ.id; }
          else { guest.classList.add('sim-hh__guest--new'); guest.textContent = 'N' + occ.id; }
        } else {
          guest.classList.add('sim-hh__guest--empty'); guest.textContent = '∅';
        }
        cell.appendChild(guest);
        rowEl.appendChild(cell);
      }
      // ellipsis
      var ell = document.createElement('div');
      ell.className = 'sim-hh__ellipsis';
      ell.textContent = '…';
      rowEl.appendChild(ell);
      var inf = document.createElement('div');
      inf.className = 'sim-hh__inf';
      inf.textContent = '∞';
      rowEl.appendChild(inf);
      rowsWrap.appendChild(rowEl);

      narr.textContent = state.narration;

      if (!state.scenario) explain.innerHTML = '';
    }

    render();

    // ─── 스타일 ───
    if (!document.getElementById('sim-hilbert-hotel-style')) {
      var style = document.createElement('style');
      style.id = 'sim-hilbert-hotel-style';
      style.textContent =
        '.sim-hilbert-hotel .sim-hh__rows{margin:14px 0 12px;background:var(--paper-light);padding:14px 12px;border:1px solid var(--rule-soft);overflow-x:auto;}' +
        '.sim-hilbert-hotel .sim-hh__row{display:flex;align-items:stretch;gap:4px;min-width:min-content;}' +
        '.sim-hilbert-hotel .sim-hh__room{flex:0 0 auto;width:46px;display:flex;flex-direction:column;align-items:center;gap:2px;}' +
        '.sim-hilbert-hotel .sim-hh__roomnum{font-family:var(--sans-ko);font-size:10.5px;color:var(--ink-mute);letter-spacing:0.04em;}' +
        '.sim-hilbert-hotel .sim-hh__guest{display:flex;align-items:center;justify-content:center;width:100%;height:34px;font-family:var(--mono);font-size:12px;border:1px solid var(--rule);background:var(--paper);transition:all 0.25s;}' +
        '.sim-hilbert-hotel .sim-hh__guest--orig{background:#e7ecf5;border-color:#5a7090;color:#2a3a55;}' +
        '.sim-hilbert-hotel .sim-hh__guest--new{background:#fbeeee;border-color:#b04848;color:#7a2a2a;font-weight:600;}' +
        '.sim-hilbert-hotel .sim-hh__guest--empty{color:var(--ink-mute);background:var(--paper);font-size:14px;}' +
        '.sim-hilbert-hotel .sim-hh__ellipsis{display:flex;align-items:center;color:var(--ink-mute);font-family:var(--serif-en);font-size:20px;padding:0 6px;}' +
        '.sim-hilbert-hotel .sim-hh__inf{display:flex;align-items:center;color:var(--ink-mute);font-family:var(--serif-en);font-style:italic;font-size:22px;padding:0 4px;}' +
        '.sim-hilbert-hotel .sim-hh__narr{font-family:var(--sans-ko);font-size:13px;color:var(--ink-soft);line-height:1.7;padding:8px 12px;background:var(--paper);border-left:2px solid var(--accent);margin-bottom:10px;}' +
        '.sim-hilbert-hotel .sim-hh__btns{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;}' +
        '.sim-hilbert-hotel .sim-hh__btns button{flex:0 1 auto;}' +
        '.sim-hilbert-hotel .sim-hh__reset{margin-left:auto;}' +
        '.sim-hilbert-hotel .sim-hh__explain{margin-top:8px;font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);line-height:1.75;}' +
        '.sim-hilbert-hotel .sim-hh__explain p{margin:6px 0 0;}' +
        '.sim-hilbert-hotel .sim-hh__rule{padding:6px 10px;background:var(--paper-light);border:1px dashed var(--accent);display:inline-block;font-family:var(--serif-en);color:var(--ink);}' +
        '.sim-hilbert-hotel .sim-hh__rule strong{font-family:var(--serif-ko);color:var(--accent);margin-right:4px;}' +
        '.sim-hilbert-hotel .sim-hh__rule em{font-style:italic;}' +
        '.sim-hilbert-hotel .sim-hh__explain em{font-family:var(--serif-en);font-style:italic;color:var(--accent);}' +
        '.sim-hilbert-hotel .sim-hh__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-hilbert-hotel .sim-hh__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-hilbert-hotel .sim-hh__room{width:40px;}.sim-hilbert-hotel .sim-hh__guest{height:30px;font-size:11px;}.sim-hilbert-hotel .sim-hh__btns{flex-direction:column;align-items:stretch;}.sim-hilbert-hotel .sim-hh__reset{margin-left:0;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="hilbert-hotel"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
