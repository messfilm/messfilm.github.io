/* ============================================================
   Archive for Som & Chan — Shared Page Footer
   updates.json에서 data-page-id 매칭하여 last updated 자동 표시
   ============================================================ */

(function () {
  'use strict';

  var pageId = document.body && document.body.dataset && document.body.dataset.pageId;
  var collection = pageId ? pageId.split('.')[0] : null;

  var ROOT = (typeof window.SITE_ROOT === 'string') ? window.SITE_ROOT : '/';
  function url(rel) { return ROOT.replace(/\/$/, '') + '/' + rel.replace(/^\//, ''); }

  var footer = document.createElement('footer');
  footer.className = 'page-footer';

  var inner = document.createElement('div');
  inner.className = 'page-footer__inner';

  // Left side: meta items
  var meta = document.createElement('div');
  meta.className = 'page-footer__meta';

  var lastUpdatedSpan = document.createElement('span');
  lastUpdatedSpan.className = 'meta-item meta-item--last-updated';
  lastUpdatedSpan.style.display = 'none'; // hidden until populated
  lastUpdatedSpan.innerHTML =
    '<span class="meta-label">Last updated</span><time></time>';
  meta.appendChild(lastUpdatedSpan);

  if (pageId && collection !== 'research') {
    var sourcesProject = (collection === 'religion') ? 'abrahamic'
                       : (collection === 'korean')   ? 'korean'
                       : (collection === 'science')  ? 'science'
                       : null;
    if (sourcesProject) {
      var sourcesLink = document.createElement('a');
      sourcesLink.className = 'meta-item meta-item--sources';
      sourcesLink.href = url('research/' + sourcesProject + '.html');
      sourcesLink.textContent = '이 페이지 출처 보기';
      meta.appendChild(sourcesLink);
    }
  }
  inner.appendChild(meta);

  // Right: copyright
  var copy = document.createElement('div');
  copy.className = 'copyright';
  copy.textContent = '© Archive for Som & Chan — 학습 자료 (CC BY-NC-SA 4.0)';
  inner.appendChild(copy);

  footer.appendChild(inner);
  document.body.appendChild(footer);

  // Fetch updates.json and populate last-updated
  if (pageId) {
    fetch(url('research/data/updates.json'))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.updates)) return;
        var matching = data.updates.filter(function (u) { return u.page === pageId; });
        if (!matching.length) return;
        matching.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
        var latest = matching[0];
        var timeEl = lastUpdatedSpan.querySelector('time');
        timeEl.setAttribute('datetime', latest.date);
        timeEl.textContent = latest.date;
        lastUpdatedSpan.style.display = '';
      })
      .catch(function () { /* silent — missing data is OK */ });
  }
})();
