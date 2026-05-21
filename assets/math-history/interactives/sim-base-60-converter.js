/* ============================================================
   Simulation: Base-60 ↔ Base-10 converter
   바빌로니아 60진법의 잔재(시간·각도)를 체감.
   Mounted on: <div class="sim" data-sim-id="base-60-converter">
   ============================================================ */

(function () {
  'use strict';

  var MAX_DEC = 215999; // 60^3 - 1

  // ─── 10진수 → 60진법 자리 배열 (대자리 우선) ───
  function decToSexagesimal(n) {
    if (!isFinite(n) || n < 0) return null;
    n = Math.floor(n);
    if (n === 0) return [0];
    var digits = [];
    while (n > 0) {
      digits.unshift(n % 60);
      n = Math.floor(n / 60);
    }
    return digits;
  }

  // 자리 배열 → "1;1;1" 형식 (대자리 우선, 세미콜론 + 공백)
  function digitsToString(digits) {
    if (!digits) return '';
    return digits.join(' ; ');
  }

  // 사용자가 친 "1;1;1" / "1 ; 1 ; 1" / "1,1,1" → 10진수
  function sexagesimalStringToDec(str) {
    if (!str) return NaN;
    var s = String(str).trim();
    if (s === '') return NaN;
    // 세미콜론/쉼표/공백 모두 구분자로 인정. 마지막 자리만 단일 숫자면 그대로.
    var parts = s.split(/[;,\s]+/).filter(function (x) { return x !== ''; });
    if (parts.length === 0) return NaN;
    var total = 0;
    for (var i = 0; i < parts.length; i++) {
      if (!/^\d+$/.test(parts[i])) return NaN;
      var d = parseInt(parts[i], 10);
      if (d < 0 || d > 59) return NaN; // 각 자리 0~59
      total = total * 60 + d;
    }
    if (total > MAX_DEC) return Infinity;
    return total;
  }

  // 두 입력란 동기화용: 시간/각도 미리보기 텍스트
  function timeHint(n) {
    if (n < 0 || !isFinite(n)) return '';
    if (n < 60) return n + '초 = ' + n + '초';
    var h = Math.floor(n / 3600);
    var m = Math.floor((n % 3600) / 60);
    var s = n % 60;
    if (h > 0) return h + '시간 ' + m + '분 ' + s + '초';
    return m + '분 ' + s + '초';
  }
  function angleHint(n) {
    if (n < 0 || !isFinite(n)) return '';
    if (n < 360) return n + '° = ' + n + '°';
    var turns = Math.floor(n / 360);
    var rem = n % 360;
    return turns + '회전 + ' + rem + '°';
  }

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-base-60-converter');

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '바빌로니아 사람들은 60을 한 묶음으로 셌다. 손가락 마디(엄지로 다른 네 손가락의 12마디) × 다섯 손가락 = 60. 지금도 1시간=60분, 원=360°, 1분=60초. 한쪽에 숫자를 쳐보면 다른 쪽이 따라 움직인다.';
    container.appendChild(lead);

    var stage = document.createElement('div');
    stage.className = 'sim-b60__stage';
    container.appendChild(stage);

    // ─── 왼쪽: 10진수 ───
    var leftCol = document.createElement('div');
    leftCol.className = 'sim-b60__col';
    leftCol.innerHTML =
      '<div class="sim-b60__col-head">' +
      '  <span class="sim-b60__col-label">10진법</span>' +
      '  <span class="sim-b60__col-latin">decimalis</span>' +
      '</div>';
    var decInput = document.createElement('input');
    decInput.type = 'text';
    decInput.className = 'sim-b60__input';
    decInput.setAttribute('inputmode', 'numeric');
    decInput.setAttribute('autocomplete', 'off');
    decInput.placeholder = '예: 3661';
    leftCol.appendChild(decInput);
    var decRange = document.createElement('div');
    decRange.className = 'sim-b60__range';
    decRange.textContent = '0 ~ ' + MAX_DEC.toLocaleString();
    leftCol.appendChild(decRange);

    // ─── 가운데: 화살표 ───
    var arrow = document.createElement('div');
    arrow.className = 'sim-b60__arrow';
    arrow.textContent = '⇄';

    // ─── 오른쪽: 60진수 ───
    var rightCol = document.createElement('div');
    rightCol.className = 'sim-b60__col';
    rightCol.innerHTML =
      '<div class="sim-b60__col-head">' +
      '  <span class="sim-b60__col-label">60진법</span>' +
      '  <span class="sim-b60__col-latin">sexagesimalis</span>' +
      '</div>';
    var sexInput = document.createElement('input');
    sexInput.type = 'text';
    sexInput.className = 'sim-b60__input';
    sexInput.setAttribute('autocomplete', 'off');
    sexInput.placeholder = '예: 1 ; 1 ; 1';
    rightCol.appendChild(sexInput);
    var sexRange = document.createElement('div');
    sexRange.className = 'sim-b60__range';
    sexRange.textContent = '각 자리 0–59, 세미콜론으로 구분';
    rightCol.appendChild(sexRange);

    stage.appendChild(leftCol);
    stage.appendChild(arrow);
    stage.appendChild(rightCol);

    // ─── 풀이 보기 ───
    var work = document.createElement('div');
    work.className = 'sim-b60__work';
    container.appendChild(work);

    // ─── 실용 힌트(시간·각도) ───
    var practical = document.createElement('div');
    practical.className = 'sim-b60__practical';
    container.appendChild(practical);

    // ─── 예시 버튼들 ───
    var examples = document.createElement('div');
    examples.className = 'sim-controls sim-b60__examples';
    var exHead = document.createElement('span');
    exHead.className = 'sim-b60__ex-head';
    exHead.textContent = '예시 :';
    examples.appendChild(exHead);
    var EX_LIST = [
      { dec: 62, note: '1시간 2분' },
      { dec: 75, note: '1° 15′ (60° 단위)' },
      { dec: 360, note: '원 한 바퀴 = 6 ; 0' },
      { dec: 3600, note: '1시간 = 1 ; 0 ; 0' },
      { dec: 3661, note: '1시간 1분 1초' },
      { dec: 86400, note: '하루의 초 수' }
    ];
    EX_LIST.forEach(function (ex) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sim-btn sim-b60__ex';
      b.textContent = ex.dec.toLocaleString();
      b.title = ex.note;
      b.addEventListener('click', function () {
        decInput.value = String(ex.dec);
        syncFromDec();
        decInput.focus();
      });
      examples.appendChild(b);
    });
    container.appendChild(examples);

    var note = document.createElement('p');
    note.className = 'sim-b60__note';
    note.innerHTML = '바빌로니아인의 표기에는 원래 자리값 사이 구분자가 <em>없었다</em>. 현대 학자들은 읽기 편하려고 세미콜론(<code>1 ; 1 ; 1</code>)으로 자리를 끊는다. 이 sim도 그 관행을 따른다.';
    container.appendChild(note);

    // ─── 동기화 로직 ───
    var syncing = false;

    function showWork(dec, digits) {
      if (!digits || dec === 0) {
        work.innerHTML = '<span class="sim-b60__work-empty">숫자를 입력해봐.</span>';
        return;
      }
      // 풀이: digits 배열을 60의 멱으로 풀어 쓴다
      var parts = [];
      for (var i = 0; i < digits.length; i++) {
        var power = digits.length - 1 - i;
        var d = digits[i];
        if (d === 0 && digits.length > 1) continue;
        if (power === 0) parts.push(d + '');
        else if (power === 1) parts.push(d + '×60');
        else parts.push(d + '×60' + supScript(power));
      }
      work.innerHTML =
        '<span class="sim-b60__work-eq">' + dec.toLocaleString() + '<sub>10</sub></span>' +
        ' = <span class="sim-b60__work-sum">' + parts.join(' + ') + '</span>' +
        ' = <span class="sim-b60__work-sex">' + digitsToString(digits) + '</span><sub>60</sub>';
    }

    function supScript(n) {
      var map = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
      return String(n).split('').map(function (c) { return map[c] || c; }).join('');
    }

    function showPractical(dec) {
      if (!isFinite(dec) || dec < 0) { practical.innerHTML = ''; return; }
      var rows = [];
      rows.push('<span class="sim-b60__pr-row"><em>시간으로</em> ' + timeHint(dec) + '</span>');
      rows.push('<span class="sim-b60__pr-row"><em>각도로</em> ' + angleHint(dec) + '</span>');
      practical.innerHTML = rows.join('');
    }

    function syncFromDec() {
      if (syncing) return;
      syncing = true;
      var raw = decInput.value.trim().replace(/[,\s]/g, '');
      if (raw === '') {
        sexInput.value = '';
        work.innerHTML = '<span class="sim-b60__work-empty">숫자를 입력해봐.</span>';
        practical.innerHTML = '';
        syncing = false;
        return;
      }
      if (!/^\d+$/.test(raw)) {
        sexInput.value = '';
        work.innerHTML = '<span class="sim-b60__work-err">10진수만 가능 (0 이상 정수).</span>';
        practical.innerHTML = '';
        syncing = false;
        return;
      }
      var n = parseInt(raw, 10);
      if (n > MAX_DEC) {
        sexInput.value = '';
        work.innerHTML = '<span class="sim-b60__work-err">너무 큰 수다. ' + MAX_DEC.toLocaleString() + ' 이하로.</span>';
        practical.innerHTML = '';
        syncing = false;
        return;
      }
      var digits = decToSexagesimal(n);
      sexInput.value = digitsToString(digits);
      showWork(n, digits);
      showPractical(n);
      syncing = false;
    }

    function syncFromSex() {
      if (syncing) return;
      syncing = true;
      var raw = sexInput.value.trim();
      if (raw === '') {
        decInput.value = '';
        work.innerHTML = '<span class="sim-b60__work-empty">숫자를 입력해봐.</span>';
        practical.innerHTML = '';
        syncing = false;
        return;
      }
      var n = sexagesimalStringToDec(raw);
      if (isNaN(n)) {
        decInput.value = '';
        work.innerHTML = '<span class="sim-b60__work-err">각 자리 0–59 정수 + 구분자(<code>;</code>) 형식이어야 해.</span>';
        practical.innerHTML = '';
        syncing = false;
        return;
      }
      if (!isFinite(n)) {
        decInput.value = '';
        work.innerHTML = '<span class="sim-b60__work-err">표현 가능한 범위(' + MAX_DEC.toLocaleString() + ')를 넘었다.</span>';
        practical.innerHTML = '';
        syncing = false;
        return;
      }
      decInput.value = String(n);
      var digits = decToSexagesimal(n);
      showWork(n, digits);
      showPractical(n);
      syncing = false;
    }

    decInput.addEventListener('input', syncFromDec);
    sexInput.addEventListener('input', syncFromSex);

    // 초기 상태
    decInput.value = '3661';
    syncFromDec();

    // ─── 스코프된 스타일 ───
    if (!document.getElementById('sim-base-60-converter-style')) {
      var style = document.createElement('style');
      style.id = 'sim-base-60-converter-style';
      style.textContent =
        '.sim-base-60-converter .sim-b60__stage{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;margin-top:14px;}' +
        '.sim-base-60-converter .sim-b60__col{padding:14px;background:var(--paper);border:1px solid var(--rule);box-sizing:border-box;min-width:0;}' +
        '.sim-base-60-converter .sim-b60__col-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px;}' +
        '.sim-base-60-converter .sim-b60__col-label{font-family:var(--serif-ko);font-weight:700;font-size:14px;color:var(--ink);}' +
        '.sim-base-60-converter .sim-b60__col-latin{font-family:var(--serif-en);font-style:italic;font-size:11.5px;color:var(--ink-mute);}' +
        '.sim-base-60-converter .sim-b60__input{width:100%;font-family:var(--mono);font-size:18px;padding:8px 10px;border:1px solid var(--rule);background:var(--paper-light);color:var(--ink);box-sizing:border-box;letter-spacing:0.03em;}' +
        '.sim-base-60-converter .sim-b60__input:focus{outline:none;border-color:var(--accent);}' +
        '.sim-base-60-converter .sim-b60__range{margin-top:6px;font-family:var(--sans-ko);font-size:11px;color:var(--ink-mute);letter-spacing:0.04em;}' +
        '.sim-base-60-converter .sim-b60__arrow{font-size:22px;color:var(--ink-mute);font-family:var(--mono);user-select:none;}' +
        '.sim-base-60-converter .sim-b60__work{margin-top:14px;padding:10px 12px;background:var(--paper-light);border-left:3px solid var(--accent);font-family:var(--serif-en);font-size:15px;color:var(--ink);line-height:1.7;word-break:break-word;}' +
        '.sim-base-60-converter .sim-b60__work-eq{font-weight:600;}' +
        '.sim-base-60-converter .sim-b60__work-sum{color:var(--ink-soft);}' +
        '.sim-base-60-converter .sim-b60__work-sex{color:var(--accent);font-weight:600;letter-spacing:0.04em;}' +
        '.sim-base-60-converter .sim-b60__work-empty,.sim-base-60-converter .sim-b60__work-err{font-family:var(--sans-ko);font-size:12.5px;font-style:italic;color:var(--ink-mute);}' +
        '.sim-base-60-converter .sim-b60__work-err{color:var(--ink-soft);}' +
        '.sim-base-60-converter .sim-b60__work-err code{font-family:var(--mono);background:var(--paper-dark);padding:1px 5px;}' +
        '.sim-base-60-converter .sim-b60__work sub{font-size:0.7em;color:var(--ink-mute);}' +
        '.sim-base-60-converter .sim-b60__practical{margin-top:10px;display:flex;gap:18px;flex-wrap:wrap;font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);}' +
        '.sim-base-60-converter .sim-b60__pr-row em{font-family:var(--serif-en);font-style:italic;color:var(--ink-mute);margin-right:6px;}' +
        '.sim-base-60-converter .sim-b60__examples{margin-top:14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
        '.sim-base-60-converter .sim-b60__ex-head{font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.08em;color:var(--ink-mute);text-transform:uppercase;}' +
        '.sim-base-60-converter .sim-b60__ex{font-family:var(--mono);font-size:12.5px;padding:4px 10px;}' +
        '.sim-base-60-converter .sim-b60__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}' +
        '.sim-base-60-converter .sim-b60__note code{font-family:var(--mono);font-style:normal;background:var(--paper-dark);padding:1px 5px;}' +
        '.sim-base-60-converter .sim-b60__note em{font-style:italic;color:var(--ink-soft);}' +
        '@media (max-width:640px){.sim-base-60-converter .sim-b60__stage{grid-template-columns:1fr;gap:10px;}.sim-base-60-converter .sim-b60__arrow{transform:rotate(90deg);text-align:center;}.sim-base-60-converter .sim-b60__work{font-size:13.5px;}}';
      document.head.appendChild(style);
    }
  }

  function mount() {
    var nodes = document.querySelectorAll('[data-sim-id="base-60-converter"]');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
