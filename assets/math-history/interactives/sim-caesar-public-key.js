/* ============================================================
   Simulation: Caesar cipher vs Public-key (RSA mini)
   (a) 시저 — 자리 이동 슬라이더, 즉시 암호화/복호화. 단일키의 취약성.
   (b) 공개키 — 소수 p=11, q=13 미니 RSA. 평문 정수 → 공개키 (e=7,n=143)로 암호화 → 비밀키 (d=103,n=143)로 복호화.
   Mounted on: <div class="sim" data-sim-id="caesar-public-key">
   ============================================================ */

(function () {
  'use strict';

  // ─── 시저 암호 ───
  function caesarShift(text, k) {
    k = ((k % 26) + 26) % 26;
    return text.split('').map(function (ch) {
      var c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCharCode(((c - 65 + k) % 26) + 65);
      if (c >= 97 && c <= 122) return String.fromCharCode(((c - 97 + k) % 26) + 97);
      return ch;
    }).join('');
  }

  // ─── RSA 미니 (p=11, q=13, n=143, φ=120, e=7, d=103) ───
  // 모듈러 거듭제곱: a^b mod m (반복 제곱, b는 작으므로 안전)
  function modpow(a, b, m) { var r = 1; a = a % m; while (b > 0) { if (b & 1) r = (r * a) % m; b = b >>> 1; a = (a * a) % m; } return r; }
  var RSA_N = 143, RSA_E = 7, RSA_D = 103;
  // 평문은 0..142 정수만 허용 (n보다 작아야 함)
  function rsaEnc(m) { return modpow(m, RSA_E, RSA_N); }
  function rsaDec(c) { return modpow(c, RSA_D, RSA_N); }

  function init(container) {
    container.innerHTML = '';
    container.classList.add('sim-caesar-pk');

    var lead = document.createElement('p');
    lead.className = 'sim-caption';
    lead.textContent = '암호의 두 시대 — 시저(BCE 50경)와 공개키(1976). 같은 키를 양쪽이 공유해야 하던 2천 년이, 한 쪽만 비밀로 두면 되는 한 줄 수학으로 끝났다.';
    container.appendChild(lead);

    // ─── 시저 패널 ───
    var caesarPanel = document.createElement('section'); caesarPanel.className = 'sim-cpk__panel sim-cpk__panel--caesar';
    caesarPanel.innerHTML =
      '<div class="sim-cpk__head"><span class="sim-cpk__label">시저 암호</span><span class="sim-cpk__latin">Cipher of Caesar — 대칭키</span></div>'+
      '<div class="sim-cpk__row"><label class="sim-cpk__inline">평문</label><input type="text" class="sim-cpk__in sim-cpk__caesar-plain" value="VENI VIDI VICI" maxlength="40"/></div>'+
      '<div class="sim-cpk__row"><label class="sim-cpk__inline">자리 이동 <em class="sim-cpk__shiftval">3</em></label><input type="range" class="sim-cpk__slider sim-cpk__caesar-shift" min="1" max="25" value="3"/></div>'+
      '<div class="sim-cpk__row"><label class="sim-cpk__inline">암호문</label><div class="sim-cpk__out sim-cpk__caesar-cipher"></div></div>'+
      '<details class="sim-cpk__weak"><summary>왜 약한가</summary>'+
      '<p>키는 1~25 단 25가지. 무차별 시도면 즉시 풀린다. 더 본질적으로는 — <em>문자 빈도</em>가 그대로다. 영어 평문에서 가장 흔한 글자는 E다. 충분히 긴 암호문에서 가장 흔한 글자를 찾아 E와 맞추면 자리 이동량이 즉시 추정된다(빈도 분석, 9세기 알 킨디).</p>'+
      '</details>';
    container.appendChild(caesarPanel);

    var plainEl  = caesarPanel.querySelector('.sim-cpk__caesar-plain');
    var shiftEl  = caesarPanel.querySelector('.sim-cpk__caesar-shift');
    var shiftVal = caesarPanel.querySelector('.sim-cpk__shiftval');
    var cipherEl = caesarPanel.querySelector('.sim-cpk__caesar-cipher');
    function updateCaesar() { var k = parseInt(shiftEl.value, 10); shiftVal.textContent = k; cipherEl.textContent = caesarShift(plainEl.value, k); }
    plainEl.addEventListener('input', updateCaesar); shiftEl.addEventListener('input', updateCaesar);
    updateCaesar();

    // ─── 공개키 패널 ───
    var pkPanel = document.createElement('section'); pkPanel.className = 'sim-cpk__panel sim-cpk__panel--pk';
    pkPanel.innerHTML =
      '<div class="sim-cpk__head"><span class="sim-cpk__label">공개키 (RSA 미니)</span><span class="sim-cpk__latin">Diffie–Hellman, RSA — 비대칭키</span></div>'+
      '<div class="sim-cpk__keybox">'+
        '<div><span class="sim-cpk__keylbl">공개키 (모두에게 공개)</span> <code>n=143, e=7</code></div>'+
        '<div><span class="sim-cpk__keylbl">비밀키 (수신자만)</span> <code>d=103</code></div>'+
        '<div class="sim-cpk__keynote">n=143=11·13. φ(n)=120. e·d ≡ 1 (mod 120) ⇒ 7·103=721=6·120+1. ✓</div>'+
      '</div>'+
      '<div class="sim-cpk__row"><label class="sim-cpk__inline">평문 정수 m (0~142)</label><input type="number" class="sim-cpk__in sim-cpk__rsa-m" value="42" min="0" max="142"/></div>'+
      '<div class="sim-cpk__row"><label class="sim-cpk__inline">암호화: c = m<sup>e</sup> mod n</label><div class="sim-cpk__out sim-cpk__rsa-c"></div></div>'+
      '<div class="sim-cpk__row"><label class="sim-cpk__inline">복호화: m′ = c<sup>d</sup> mod n</label><div class="sim-cpk__out sim-cpk__rsa-m2"></div></div>'+
      '<details class="sim-cpk__weak"><summary>비유로</summary>'+
      '<p>Alice는 자물쇠(공개키)를 사방에 뿌린다. 열쇠(비밀키)는 자기 주머니에만 있다. 누구나 Alice의 자물쇠로 상자를 잠글 수 있지만, 열 수 있는 사람은 Alice 한 명이다. 본 데모는 p=11, q=13으로 n=143 — 손가락으로도 푼다. 실제 RSA는 600자리 소수를 쓴다. <em>n을 두 소수로 쪼개는 일</em>이 어렵다는 것이 안전성의 전부다.</p>'+
      '</details>';
    container.appendChild(pkPanel);

    var mEl  = pkPanel.querySelector('.sim-cpk__rsa-m');
    var cEl  = pkPanel.querySelector('.sim-cpk__rsa-c');
    var m2El = pkPanel.querySelector('.sim-cpk__rsa-m2');
    function updateRSA() {
      var m = parseInt(mEl.value, 10);
      if (!isFinite(m) || m < 0 || m > RSA_N - 1) { cEl.textContent = '0~142 정수만 가능'; m2El.textContent = ''; return; }
      var c = rsaEnc(m), m2 = rsaDec(c);
      cEl.innerHTML = '<em>c =</em> ' + c + ' &nbsp;<span class="sim-cpk__work">(' + m + '<sup>7</sup> mod 143)</span>';
      m2El.innerHTML = '<em>m′ =</em> ' + m2 + ' &nbsp;' + (m2 === m ? '<span class="sim-cpk__ok">✓ 원문과 일치</span>' : '<span class="sim-cpk__no">!? 불일치</span>');
    }
    mEl.addEventListener('input', updateRSA);
    updateRSA();

    var note = document.createElement('p');
    note.className = 'sim-cpk__note';
    note.innerHTML = '시저는 키가 새면 끝. RSA는 자물쇠를 공개해도 안전하다 — 한 줄 수학(<em>큰 합성수의 소인수분해 어려움</em>)이 디지털 문명의 신원·결제·기밀을 떠받친다.';
    container.appendChild(note);

    if (!document.getElementById('sim-caesar-pk-style')) {
      var s = document.createElement('style'); s.id = 'sim-caesar-pk-style';
      s.textContent =
        '.sim-caesar-pk .sim-cpk__panel{padding:14px 16px;margin-top:12px;background:var(--paper);border:1px solid var(--rule);border-top:3px solid var(--ink-mute);}'+
        '.sim-caesar-pk .sim-cpk__panel--pk{border-top-color:var(--accent);}'+
        '.sim-caesar-pk .sim-cpk__head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px;}'+
        '.sim-caesar-pk .sim-cpk__label{font-family:var(--serif-ko);font-weight:700;font-size:15px;color:var(--ink);}'+
        '.sim-caesar-pk .sim-cpk__latin{font-family:var(--serif-en);font-style:italic;color:var(--ink-mute);font-size:12px;}'+
        '.sim-caesar-pk .sim-cpk__row{display:flex;align-items:center;gap:10px;margin:6px 0;flex-wrap:wrap;}'+
        '.sim-caesar-pk .sim-cpk__inline{flex:0 0 auto;min-width:120px;font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.04em;color:var(--ink-mute);text-transform:uppercase;}'+
        '.sim-caesar-pk .sim-cpk__inline em{font-family:var(--mono);font-style:normal;color:var(--accent);margin-left:6px;}'+
        '.sim-caesar-pk .sim-cpk__in{flex:1 1 200px;min-width:0;font-family:var(--mono);font-size:14px;padding:6px 10px;border:1px solid var(--rule);background:var(--paper-light);color:var(--ink);}'+
        '.sim-caesar-pk .sim-cpk__slider{flex:1 1 200px;min-width:0;}'+
        '.sim-caesar-pk .sim-cpk__out{flex:1 1 200px;font-family:var(--mono);font-size:14px;padding:6px 10px;background:var(--paper-light);border:1px dashed var(--rule-soft);color:var(--accent);min-height:1.4em;word-break:break-all;}'+
        '.sim-caesar-pk .sim-cpk__out em{font-style:normal;color:var(--ink-mute);font-family:var(--sans-ko);font-size:11.5px;letter-spacing:0.04em;margin-right:6px;}'+
        '.sim-caesar-pk .sim-cpk__work{color:var(--ink-mute);font-size:11.5px;font-family:var(--mono);}'+
        '.sim-caesar-pk .sim-cpk__ok{color:var(--accent);font-size:12px;}'+
        '.sim-caesar-pk .sim-cpk__no{color:#b04848;font-size:12px;}'+
        '.sim-caesar-pk .sim-cpk__keybox{padding:8px 12px;background:var(--paper-light);border-left:2px solid var(--accent);margin-bottom:8px;font-family:var(--sans-ko);font-size:12.5px;color:var(--ink-soft);line-height:1.8;}'+
        '.sim-caesar-pk .sim-cpk__keybox code{font-family:var(--mono);background:var(--paper);padding:1px 6px;border:1px solid var(--rule-soft);color:var(--ink);}'+
        '.sim-caesar-pk .sim-cpk__keylbl{font-family:var(--sans-ko);font-size:11px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;margin-right:6px;}'+
        '.sim-caesar-pk .sim-cpk__keynote{font-family:var(--mono);font-size:11.5px;color:var(--ink-mute);margin-top:4px;}'+
        '.sim-caesar-pk .sim-cpk__weak{margin-top:8px;font-size:12.5px;color:var(--ink-soft);}'+
        '.sim-caesar-pk .sim-cpk__weak summary{cursor:pointer;font-family:var(--sans-ko);font-size:12px;letter-spacing:0.06em;color:var(--ink-mute);text-transform:uppercase;padding:4px 0;}'+
        '.sim-caesar-pk .sim-cpk__weak summary:hover{color:var(--accent);}'+
        '.sim-caesar-pk .sim-cpk__weak p{margin:6px 0;line-height:1.75;}'+
        '.sim-caesar-pk .sim-cpk__weak em{font-style:italic;color:var(--ink);}'+
        '.sim-caesar-pk .sim-cpk__note{margin:14px 0 0;font-family:var(--sans-ko);font-size:12px;font-style:italic;color:var(--ink-mute);line-height:1.7;}'+
        '.sim-caesar-pk .sim-cpk__note em{font-style:italic;color:var(--ink-soft);}'+
        '@media (max-width:640px){.sim-caesar-pk .sim-cpk__inline{min-width:0;flex:1 1 100%;}.sim-caesar-pk .sim-cpk__in,.sim-caesar-pk .sim-cpk__out,.sim-caesar-pk .sim-cpk__slider{flex:1 1 100%;}}';
      document.head.appendChild(s);
    }
  }

  function mount() { var nodes = document.querySelectorAll('[data-sim-id="caesar-public-key"]'); if (!nodes || nodes.length === 0) return; nodes.forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
