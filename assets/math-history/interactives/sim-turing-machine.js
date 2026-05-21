/* ============================================================
   Simulation: Turing Machine (단순 규칙 + 무한 테이프)
   사용자가 프로그램 선택 → 한 단계씩 (또는 자동) 실행 → 헤드/상태/테이프 변화
   Mounted on: <div class="sim" data-sim-id="turing-machine">
   ============================================================ */

(function () {
  'use strict';

  // ─── 미리 정의된 프로그램 (모두 검증됨) ───
  // 규칙: rules[state][symbol] = [writeSymbol, move(-1|0|1), nextState]
  // 'B'는 빈칸, 'H'는 정지(halt).
  var PROGRAMS = {
    'binary-inc': {
      name: '이진수 +1',
      desc: '오른쪽 끝에서 시작. 0을 만나면 1로 바꾸고 정지. 1을 만나면 0으로 쓰고 왼쪽으로. 빈칸이면 1을 쓰고 정지(자릿수 늘어남).',
      initTape: ['1','0','1','1'], initHead: 3, initState: 'q0',
      rules: { 'q0': { '0': ['1', 0, 'H'], '1': ['0', -1, 'q0'], 'B': ['1', 0, 'H'] } }
    },
    'flip-bits': {
      name: '비트 반전',
      desc: '왼쪽에서 오른쪽으로 진행하며 0↔1 뒤집기. 빈칸이면 정지.',
      initTape: ['1','0','1','1','0'], initHead: 0, initState: 'q0',
      rules: { 'q0': { '0': ['1', 1, 'q0'], '1': ['0', 1, 'q0'], 'B': ['B', 0, 'H'] } }
    },
    'count-ones': {
      name: '1의 개수 세기 (단항 변환)',
      desc: '입력의 1을 전부 X로 바꾸며 오른쪽으로. 빈칸이면 정지. (남은 X 개수 = 원래 1의 개수)',
      initTape: ['1','0','1','1','0','1'], initHead: 0, initState: 'q0',
      rules: { 'q0': { '0': ['0', 1, 'q0'], '1': ['X', 1, 'q0'], 'X': ['X', 1, 'q0'], 'B': ['B', 0, 'H'] } }
    }
  };
  var VIEW_CELLS = 9, HALF = (VIEW_CELLS - 1) / 2;

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-turing-machine');

    var state = { progKey: 'binary-inc', tape: [], head: 0, q: 'q0', steps: 0, halted: false, auto: null };

    function loadProgram(key) { var p = PROGRAMS[key]; state.progKey = key; state.tape = p.initTape.slice(); state.head = p.initHead; state.q = p.initState; state.steps = 0; state.halted = false; stopAuto(); }
    function read() { return (state.head < 0 || state.head >= state.tape.length) ? 'B' : state.tape[state.head]; }
    function write(sym) { while (state.head < 0) { state.tape.unshift('B'); state.head++; } while (state.head >= state.tape.length) state.tape.push('B'); state.tape[state.head] = sym; }
    function step() {
      if (state.halted) return;
      var rule = (PROGRAMS[state.progKey].rules[state.q] || {})[read()];
      if (!rule) { state.halted = true; render(); return; }
      write(rule[0]); state.head += rule[1]; state.q = rule[2]; state.steps++;
      if (state.q === 'H') state.halted = true;
      render();
    }
    function stopAuto() { if (state.auto) { clearInterval(state.auto); state.auto = null; render(); } }
    function startAuto() { if (state.auto || state.halted) return; state.auto = setInterval(function () { if (state.halted) stopAuto(); else step(); }, 380); render(); }

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '튜링 기계 — 테이프, 헤드, 상태, 규칙표. 이 단순한 장치가 "계산 가능한 모든 것"을 정의한다 (1936).';
    container.appendChild(lead);

    var picker = document.createElement('div'); picker.className = 'sim-tm__picker';
    var opts = Object.keys(PROGRAMS).map(function (k) { return '<option value="'+k+'">'+PROGRAMS[k].name+'</option>'; }).join('');
    picker.innerHTML = '<label class="sim-tm__pick-label">프로그램</label><select class="sim-tm__select">'+opts+'</select>';
    container.appendChild(picker);
    var sel = picker.querySelector('.sim-tm__select');
    sel.addEventListener('change', function () { loadProgram(sel.value); render(); });

    var desc = document.createElement('div'); desc.className = 'sim-tm__desc'; container.appendChild(desc);

    var tapeWrap = document.createElement('div'); tapeWrap.className = 'sim-tm__tapewrap';
    tapeWrap.innerHTML = '<div class="sim-tm__tape"></div><div class="sim-tm__headmark">▲</div>';
    container.appendChild(tapeWrap);
    var tapeRow = tapeWrap.querySelector('.sim-tm__tape');

    var meter = document.createElement('div'); meter.className = 'sim-tm__meter'; container.appendChild(meter);

    var rulesBox = document.createElement('details'); rulesBox.className = 'sim-tm__rules';
    rulesBox.innerHTML = '<summary>규칙표 보기</summary><div class="sim-tm__rules-body"></div>';
    container.appendChild(rulesBox);

    var ctrls = document.createElement('div'); ctrls.className = 'sim-controls sim-tm__controls';
    ctrls.innerHTML = '<button type="button" class="sim-btn sim-tm__step">한 단계 →</button><button type="button" class="sim-btn sim-tm__auto">자동 실행</button><button type="button" class="sim-btn sim-tm__reset">처음으로</button>';
    container.appendChild(ctrls);
    var stepBtn = ctrls.querySelector('.sim-tm__step'), autoBtn = ctrls.querySelector('.sim-tm__auto'), resetBtn = ctrls.querySelector('.sim-tm__reset');
    stepBtn.addEventListener('click', function(){ stopAuto(); step(); });
    autoBtn.addEventListener('click', function(){ if (state.auto) stopAuto(); else startAuto(); });
    resetBtn.addEventListener('click', function(){ loadProgram(state.progKey); render(); });

    function render() {
      var prog = PROGRAMS[state.progKey];
      desc.textContent = prog.desc; sel.value = state.progKey;
      var cells = '';
      for (var k = -HALF; k <= HALF; k++) {
        var idx = state.head + k, sym = (idx < 0 || idx >= state.tape.length) ? 'B' : state.tape[idx];
        cells += '<span class="sim-tm__cell' + (k === 0 ? ' sim-tm__cell--head' : '') + '">' + (sym === 'B' ? '·' : sym) + '</span>';
      }
      tapeRow.innerHTML = cells;
      meter.innerHTML = '<span>상태 <em>' + state.q + '</em></span><span>단계 <em>' + state.steps + '</em></span><span>' + (state.halted ? '<em class="sim-tm__halt">정지</em>' : '실행 중') + '</span>';
      var rows = '';
      Object.keys(prog.rules).forEach(function (q) { Object.keys(prog.rules[q]).forEach(function (sy) { var r = prog.rules[q][sy], mv = r[1]===-1?'←':r[1]===1?'→':'·'; rows += '<tr><td>'+q+'</td><td>'+(sy==='B'?'·':sy)+'</td><td>'+(r[0]==='B'?'·':r[0])+'</td><td>'+mv+'</td><td>'+r[2]+'</td></tr>'; }); });
      rulesBox.querySelector('.sim-tm__rules-body').innerHTML = '<table class="sim-tm__table"><thead><tr><th>상태</th><th>읽음</th><th>쓰기</th><th>이동</th><th>다음</th></tr></thead><tbody>'+rows+'</tbody></table>';
      stepBtn.disabled = state.halted; autoBtn.disabled = state.halted;
      autoBtn.textContent = state.auto ? '일시 정지' : '자동 실행';
    }

    loadProgram('binary-inc'); render();

    if (!document.getElementById('sim-turing-machine-style')) {
      var s = document.createElement('style'); s.id = 'sim-turing-machine-style';
      s.textContent = '.sim-turing-machine .sim-tm__picker{display:flex;align-items:center;gap:10px;margin:8px 0 6px;flex-wrap:wrap;}.sim-turing-machine .sim-tm__pick-label{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;}.sim-turing-machine .sim-tm__select{font-family:var(--mono);font-size:13px;padding:4px 8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}.sim-turing-machine .sim-tm__desc{font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);line-height:1.7;margin:4px 0 10px;}.sim-turing-machine .sim-tm__tapewrap{position:relative;padding:18px 6px 8px;background:var(--paper-light);border:1px solid var(--rule-soft);}.sim-turing-machine .sim-tm__tape{display:flex;justify-content:center;gap:2px;}.sim-turing-machine .sim-tm__cell{display:inline-block;width:32px;height:36px;line-height:36px;text-align:center;font-family:var(--mono);font-size:16px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}.sim-turing-machine .sim-tm__cell--head{border-color:var(--accent);background:#fff4d6;color:var(--accent);font-weight:700;}.sim-turing-machine .sim-tm__headmark{position:absolute;left:50%;transform:translateX(-50%);top:2px;color:var(--accent);font-size:11px;}.sim-turing-machine .sim-tm__meter{display:flex;gap:18px;margin-top:8px;font-family:var(--sans-ko);font-size:11.5px;color:var(--ink-mute);letter-spacing:0.04em;flex-wrap:wrap;}.sim-turing-machine .sim-tm__meter em{font-family:var(--mono);font-style:normal;color:var(--accent);}.sim-turing-machine .sim-tm__meter .sim-tm__halt{color:#b04848;}.sim-turing-machine .sim-tm__rules{margin-top:10px;font-size:12.5px;color:var(--ink-soft);}.sim-turing-machine .sim-tm__rules summary{cursor:pointer;font-family:var(--sans-ko);font-size:12px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;padding:4px 0;}.sim-turing-machine .sim-tm__rules summary:hover{color:var(--accent);}.sim-turing-machine .sim-tm__table{margin-top:6px;border-collapse:collapse;font-family:var(--mono);font-size:12px;}.sim-turing-machine .sim-tm__table th,.sim-turing-machine .sim-tm__table td{border:1px solid var(--rule-soft);padding:3px 8px;text-align:center;}.sim-turing-machine .sim-tm__table th{background:var(--paper-light);color:var(--ink-mute);font-family:var(--sans-ko);font-weight:normal;}.sim-turing-machine .sim-tm__controls{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;}.sim-turing-machine .sim-tm__controls button[disabled]{opacity:0.4;cursor:not-allowed;}@media (max-width:640px){.sim-turing-machine .sim-tm__cell{width:26px;height:30px;line-height:30px;font-size:14px;}}';
      document.head.appendChild(s);
    }
  }

  function mount() { var nodes = document.querySelectorAll('[data-sim-id="turing-machine"]'); if (!nodes || nodes.length === 0) return; nodes.forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
