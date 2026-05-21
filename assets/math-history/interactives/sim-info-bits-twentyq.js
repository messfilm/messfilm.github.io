/* ============================================================
   Simulation: Information = bits — 20 Questions / Binary Search
   N개 후보 중 하나를 찾기 = log₂N 비트. 이진 질문 한 번 = 1비트 획득.
   사용자가 N을 정하고 직접 이진 탐색 또는 자동 시연.
   Mounted on: <div class="sim" data-sim-id="info-bits-twentyq">
   ============================================================ */

(function () {
  'use strict';

  function log2(x) { return Math.log(x) / Math.LN2; }
  function ceilLog2(n) { return Math.ceil(log2(Math.max(2, n))); }

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-ibq');

    var state = { N: 20, target: 0, lo: 1, hi: 20, questions: 0, history: [], done: false };
    function newRound(N) { state.N = N; state.target = 1 + Math.floor(Math.random() * N); state.lo = 1; state.hi = N; state.questions = 0; state.history = []; state.done = false; }

    container.innerHTML = '<p class="sim-caption">정보 = 비트 (섀넌, 1948). N개 중 하나를 찾으려면 ⌈log₂N⌉번의 이진 질문이면 충분하다 — 스무고개의 수학.</p>'+
      '<div class="sim-ibq__setup"><label class="sim-ibq__lbl">N (후보 수)</label>'+
        '<select class="sim-ibq__N"><option value="10">10</option><option value="20" selected>20</option><option value="50">50</option><option value="100">100</option><option value="1000">1000</option></select>'+
        '<button type="button" class="sim-btn sim-ibq__new">새 라운드</button>'+
        '<button type="button" class="sim-btn sim-ibq__auto">자동 이진탐색 시연</button></div>'+
      '<div class="sim-ibq__info"></div>'+
      '<div class="sim-ibq__bar"><div class="sim-ibq__bar-track"><div class="sim-ibq__bar-range"></div></div><div class="sim-ibq__bar-lbl"></div></div>'+
      '<div class="sim-ibq__qpanel"><div class="sim-ibq__qrow"><label class="sim-ibq__qlbl">정답이 다음 값 <em>이하</em>인가?</label><input type="number" class="sim-ibq__qinput" value="10" min="1" max="20"/><button type="button" class="sim-btn sim-ibq__ask">물어보기</button></div><div class="sim-ibq__hint">힌트: 매번 범위 한가운데를 물으면 1비트씩 정확히 얻는다.</div></div>'+
      '<ol class="sim-ibq__hist"></ol>'+
      '<div class="sim-ibq__result"></div>'+
      '<p class="sim-ibq__note">한 번의 이진 질문(예/아니오) → 후보 수가 절반. 즉 <em>1비트</em>의 정보. N=20이면 log₂20 ≈ 4.32, 다섯 질문이면 끝난다. 섀넌은 이 단순한 셈을 측정 단위로 격상시켰다 — 디지털 통신·압축·암호의 토대.</p>';
    var setup = container.querySelector('.sim-ibq__setup');
    var info = container.querySelector('.sim-ibq__info');
    var barRange = container.querySelector('.sim-ibq__bar-range');
    var barLbl = container.querySelector('.sim-ibq__bar-lbl');
    var qPanel = container.querySelector('.sim-ibq__qpanel');
    var hist = container.querySelector('.sim-ibq__hist');
    var result = container.querySelector('.sim-ibq__result');

    var Nsel  = setup.querySelector('.sim-ibq__N');
    var newBtn= setup.querySelector('.sim-ibq__new');
    var autoBtn=setup.querySelector('.sim-ibq__auto');
    var qInput= qPanel.querySelector('.sim-ibq__qinput');
    var askBtn= qPanel.querySelector('.sim-ibq__ask');

    Nsel.addEventListener('change', function () { newRound(parseInt(Nsel.value, 10)); render(); });
    newBtn.addEventListener('click', function () { newRound(parseInt(Nsel.value, 10)); render(); });
    askBtn.addEventListener('click', function () { askUser(); });
    qInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); askUser(); } });
    autoBtn.addEventListener('click', function () { autoDemo(); });

    function ask(threshold) {
      if (state.done) return;
      if (!isFinite(threshold) || threshold < state.lo || threshold >= state.hi) { state.history.push({ q: threshold, ans: '범위 밖 — 무효', wasted: true }); render(); return; }
      state.questions++;
      var isLE = state.target <= threshold;
      if (isLE) state.hi = threshold; else state.lo = threshold + 1;
      state.history.push({ q: threshold, ans: isLE ? '예 (≤)' : '아니오 (>)', wasted: false });
      if (state.lo === state.hi) state.done = true;
      render();
    }
    function askUser() { ask(parseInt(qInput.value, 10)); }
    function autoDemo() { newRound(parseInt(Nsel.value, 10)); render(); var tick = setInterval(function () { if (state.done) { clearInterval(tick); return; } ask(Math.floor((state.lo + state.hi) / 2)); }, 600); }

    function render() {
      qInput.min = state.lo; qInput.max = state.hi - 1;
      var cur = parseInt(qInput.value, 10);
      if (cur < state.lo || cur >= state.hi) qInput.value = Math.floor((state.lo + state.hi - 1) / 2);
      var remain = state.hi - state.lo + 1, minQ = ceilLog2(state.N), bitsLeft = Math.max(0, log2(remain));
      info.innerHTML = '<span>N <em>'+state.N+'</em></span><span>이론 최솟값 <em>⌈log₂'+state.N+'⌉ = '+minQ+'</em>회 (log₂'+state.N+' = '+log2(state.N).toFixed(2)+' 비트)</span><span>현재 후보 <em>'+remain+'</em>개 (남은 정보 ≈ '+bitsLeft.toFixed(2)+' 비트)</span><span>질문 횟수 <em>'+state.questions+'</em></span>';
      barRange.style.left = ((state.lo - 1) / state.N * 100) + '%';
      barRange.style.width = ((state.hi - state.lo + 1) / state.N * 100) + '%';
      barLbl.textContent = state.lo === state.hi ? '범위: ' + state.lo + ' (확정)' : '범위: ' + state.lo + ' ~ ' + state.hi;
      hist.innerHTML = state.history.map(function (h, i) { return '<li class="sim-ibq__hitem'+(h.wasted?' sim-ibq__hitem--wasted':'')+'"><span class="sim-ibq__qn">Q'+(i+1)+'</span> '+(h.wasted?'<em>'+h.q+' ≤ ?</em> — '+h.ans:'<em>정답 ≤ '+h.q+' ?</em> — '+h.ans)+'</li>'; }).join('');
      if (state.done) {
        var optimal = state.questions <= minQ;
        result.className = 'sim-ibq__result sim-ibq__result--show';
        result.innerHTML = '<strong>찾았다 → '+state.target+'</strong> &middot; 사용 질문 '+state.questions+'회 &middot; 이론 최솟값 '+minQ+'회 '+(optimal?'<span class="sim-ibq__ok">— 최적 (1비트/질문)</span>':'<span class="sim-ibq__no">— '+(state.questions - minQ)+'회 더 썼다 (질문이 균등 분할이 아니었다)</span>');
        askBtn.disabled = true; qInput.disabled = true;
      } else { result.className = 'sim-ibq__result'; result.innerHTML = ''; askBtn.disabled = false; qInput.disabled = false; }
    }

    newRound(20); render();

    if (!document.getElementById('sim-ibq-style')) {
      var s = document.createElement('style'); s.id = 'sim-ibq-style';
      s.textContent = '.sim-ibq .sim-ibq__setup{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 10px;}.sim-ibq .sim-ibq__lbl{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;}.sim-ibq .sim-ibq__N{font-family:var(--mono);font-size:13px;padding:4px 8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}.sim-ibq .sim-ibq__info{display:flex;gap:14px;flex-wrap:wrap;padding:8px 10px;background:var(--paper-light);border-left:2px solid var(--accent);font-family:var(--sans-ko);font-size:11.5px;color:var(--ink-mute);letter-spacing:0.04em;line-height:1.8;}.sim-ibq .sim-ibq__info em{font-family:var(--mono);font-style:normal;color:var(--accent);}.sim-ibq .sim-ibq__bar{margin:10px 0;}.sim-ibq .sim-ibq__bar-track{position:relative;height:14px;background:var(--paper-light);border:1px solid var(--rule-soft);}.sim-ibq .sim-ibq__bar-range{position:absolute;top:0;bottom:0;background:#fff4d6;border-left:1px solid var(--accent);border-right:1px solid var(--accent);transition:left 0.3s,width 0.3s;}.sim-ibq .sim-ibq__bar-lbl{margin-top:4px;font-family:var(--mono);font-size:12px;color:var(--ink-soft);}.sim-ibq .sim-ibq__qpanel{margin-top:6px;}.sim-ibq .sim-ibq__qrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}.sim-ibq .sim-ibq__qlbl{flex:1 1 auto;font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);}.sim-ibq .sim-ibq__qlbl em{font-family:var(--serif-en);font-style:italic;color:var(--ink);}.sim-ibq .sim-ibq__qinput{width:90px;font-family:var(--mono);font-size:14px;padding:6px 10px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);}.sim-ibq .sim-ibq__hint{margin-top:4px;font-family:var(--sans-ko);font-size:11.5px;font-style:italic;color:var(--ink-mute);}.sim-ibq .sim-ibq__hist{margin:10px 0 0;padding-left:1.2em;font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);list-style:none;}.sim-ibq .sim-ibq__hitem{padding:2px 0;border-bottom:1px dotted var(--rule-soft);}.sim-ibq .sim-ibq__hitem--wasted{color:#b04848;}.sim-ibq .sim-ibq__qn{display:inline-block;width:30px;color:var(--ink-mute);font-family:var(--mono);}.sim-ibq .sim-ibq__hitem em{font-family:var(--mono);font-style:normal;color:var(--ink);}.sim-ibq .sim-ibq__result{margin-top:10px;padding:0;opacity:0;max-height:0;overflow:hidden;transition:opacity 0.3s;}.sim-ibq .sim-ibq__result--show{padding:10px 14px;background:var(--paper-light);border-left:3px solid var(--accent);opacity:1;max-height:200px;font-family:var(--sans-ko);font-size:13px;color:var(--ink);line-height:1.7;}.sim-ibq .sim-ibq__result strong{font-family:var(--serif-ko);color:var(--accent);}.sim-ibq .sim-ibq__ok{color:var(--accent);font-size:12px;font-style:italic;}.sim-ibq .sim-ibq__no{color:#b04848;font-size:12px;font-style:italic;}.sim-ibq .sim-ibq__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}.sim-ibq .sim-ibq__note em{font-style:italic;color:var(--ink-soft);}@media (max-width:640px){.sim-ibq .sim-ibq__info{gap:10px;font-size:11px;}.sim-ibq .sim-ibq__qinput{width:80px;}}';
      document.head.appendChild(s);
    }
  }

  function mount() { var nodes = document.querySelectorAll('[data-sim-id="info-bits-twentyq"]'); if (!nodes || nodes.length === 0) return; nodes.forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
