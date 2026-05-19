/* ============================================================
   Archive for My Son — Research Archive JSON Loader
   sources.json / updates.json / notes.json을 카드형 HTML로 렌더링
   ============================================================ */

(function (global) {
  'use strict';

  var ROOT = (typeof global.SITE_ROOT === 'string') ? global.SITE_ROOT : '/';
  function url(rel) { return ROOT.replace(/\/$/, '') + '/' + rel.replace(/^\//, ''); }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function reliabilityBadge(level) {
    var label = level === 'high' ? 'HIGH' : level === 'medium' ? 'MED' : 'LOW';
    return '<span class="rel-badge rel-' + level + '">' + label + '</span>';
  }

  function typeLabel(t) {
    var map = {
      'primary-database': '1차 데이터베이스',
      'encyclopedia': '백과사전',
      'book': '도서',
      'journal-article': '논문',
      'museum': '박물관',
      'government-doc': '정부 문서',
      'news': '뉴스',
      'academic-archive': '학술 아카이브',
      'website-other': '웹사이트'
    };
    return map[t] || t || '기타';
  }

  function updateTypeLabel(t) {
    var map = {
      'creation': '신규',
      'addition': '추가',
      'correction': '수정',
      'update': '갱신',
      'removal': '삭제',
      'restructure': '재구성',
      'migration': '이식'
    };
    return map[t] || t;
  }

  function load(project) {
    var paths = [
      url('research/data/sources.json'),
      url('research/data/updates.json'),
      url('research/data/notes.json')
    ];
    return Promise.all(paths.map(function (p) {
      return fetch(p).then(function (r) { return r.ok ? r.json() : null; });
    })).then(function (results) {
      var srcAll = (results[0] && results[0].sources) || [];
      var updAll = (results[1] && results[1].updates) || [];
      var notAll = (results[2] && results[2].notes) || [];
      if (project && project !== 'all') {
        srcAll = srcAll.filter(function (s) { return s.project === project; });
        updAll = updAll.filter(function (u) { return u.project === project; });
        notAll = notAll.filter(function (n) { return n.project === project; });
      }
      return { sources: srcAll, updates: updAll, notes: notAll };
    });
  }

  function renderSources(sources, selector) {
    var host = document.querySelector(selector);
    if (!host) return;
    if (!sources.length) {
      host.innerHTML = '<p class="empty-note">등록된 출처가 없습니다 — 작업 중.</p>';
      return;
    }
    var order = { high: 0, medium: 1, low: 2 };
    sources = sources.slice().sort(function (a, b) {
      return (order[a.reliability] || 3) - (order[b.reliability] || 3);
    });
    host.innerHTML = sources.map(function (s) {
      var usedList = (s.usedFor || []).map(function (u) {
        return '<li><code>' + escapeHtml(u.page) + '</code>' +
               (u.section ? ' — ' + escapeHtml(u.section) : '') + '</li>';
      }).join('');
      return '' +
        '<article class="source-card" data-reliability="' + escapeHtml(s.reliability) + '">' +
          '<header>' +
            reliabilityBadge(s.reliability) +
            '<h3>' + escapeHtml(s.title) + '</h3>' +
            (s.title_en ? '<span class="src-title-en">' + escapeHtml(s.title_en) + '</span>' : '') +
          '</header>' +
          '<dl class="src-meta">' +
            '<dt>종류</dt><dd>' + typeLabel(s.type) + '</dd>' +
            (s.publisher ? '<dt>발행</dt><dd>' + escapeHtml(s.publisher) + '</dd>' : '') +
            (s.accessed  ? '<dt>접속</dt><dd>' + escapeHtml(s.accessed) + '</dd>'  : '') +
            (s.language  ? '<dt>언어</dt><dd>' + escapeHtml(s.language) + '</dd>'  : '') +
          '</dl>' +
          (s.notes ? '<p class="src-notes">' + escapeHtml(s.notes) + '</p>' : '') +
          (usedList ? '<details class="src-usedfor"><summary>사용된 페이지</summary><ul>' + usedList + '</ul></details>' : '') +
          (s.url ? '<a class="src-link" href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">원본 보기 ↗</a>' : '') +
        '</article>';
    }).join('');
  }

  function renderUpdates(updates, selector) {
    var host = document.querySelector(selector);
    if (!host) return;
    if (!updates.length) {
      host.innerHTML = '<p class="empty-note">기록된 업데이트가 없습니다.</p>';
      return;
    }
    updates = updates.slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
    host.innerHTML = '<ol class="updates-list">' + updates.map(function (u) {
      return '' +
        '<li class="update-item">' +
          '<time datetime="' + escapeHtml(u.date) + '">' + escapeHtml(u.date) + '</time>' +
          '<span class="upd-type upd-type-' + escapeHtml(u.type) + '">' + updateTypeLabel(u.type) + '</span>' +
          '<span class="upd-page"><code>' + escapeHtml(u.page) + '</code></span>' +
          '<p class="upd-desc">' + escapeHtml(u.description) + '</p>' +
          (u.details ? '<p class="upd-details">' + escapeHtml(u.details) + '</p>' : '') +
          (u.by ? '<span class="upd-by">— ' + escapeHtml(u.by) + '</span>' : '') +
        '</li>';
    }).join('') + '</ol>';
  }

  function renderNotes(notes, selector) {
    var host = document.querySelector(selector);
    if (!host) return;
    if (!notes.length) {
      host.innerHTML = '<p class="empty-note">기록된 연구 노트가 없습니다 — 작업 중.</p>';
      return;
    }
    notes = notes.slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
    host.innerHTML = notes.map(function (n) {
      return '' +
        '<article class="note-card">' +
          '<header>' +
            '<h3>' + escapeHtml(n.topic) + '</h3>' +
            '<time>' + escapeHtml(n.date) + '</time>' +
          '</header>' +
          (n.question     ? '<p><strong>질문:</strong> ' + escapeHtml(n.question) + '</p>' : '') +
          (n.investigation? '<p><strong>조사:</strong> ' + escapeHtml(n.investigation) + '</p>' : '') +
          (n.finding      ? '<p><strong>발견:</strong> ' + escapeHtml(n.finding) + '</p>' : '') +
          (n.decision     ? '<p><strong>결정:</strong> ' + escapeHtml(n.decision) + '</p>' : '') +
        '</article>';
    }).join('');
  }

  function renderStats(data, selector) {
    var host = document.querySelector(selector);
    if (!host) return;
    host.innerHTML =
      '<div class="stat"><span class="stat-num">' + data.sources.length + '</span><span class="stat-label">출처</span></div>' +
      '<div class="stat"><span class="stat-num">' + data.updates.length + '</span><span class="stat-label">업데이트</span></div>' +
      '<div class="stat"><span class="stat-num">' + data.notes.length + '</span><span class="stat-label">노트</span></div>';
  }

  global.ResearchLoader = {
    load: load,
    renderSources: renderSources,
    renderUpdates: renderUpdates,
    renderNotes: renderNotes,
    renderStats: renderStats
  };
})(window);
