# Archive for My Son — Stage 1 Design

**Date:** 2026-05-19
**Scope:** 통합 골격 + 두 기존 프로젝트(한국사·아브라함 종교사) 마이그레이션 + 연구 아카이브 골격 + 자연과학사 placeholder
**Out of scope:** 자연과학사 콘텐츠 실제 작성, 사이트 전체 검색, 본문 시각 재작업, 통합 용어집, 노트(notes.json) 본격 작성

상위 아키텍처 문서: 사용자가 제공한 마스터 아키텍처 ("아들을 위한 아카이브"). 이 spec은 그 아키텍처를 **1단계 범위**에 맞춰 축약·구체화한 것이다.

---

## 1. 목표

1. 현재 단일 랜딩 페이지인 `messfilm.github.io`를 **세 컬렉션 + 연구 아카이브 통합 사이트** 구조로 전환.
2. 별도 저장소에 있는 한국사·종교사 프로젝트를 이 저장소의 서브폴더로 이식.
3. 향후 단계(과학사 본격 작성, 연구 아카이브 본격 채우기, 통합 검색)를 위한 **재료가 준비된 토대** 마련.
4. 핵심 가치 "출처 추적 가능성"의 골격(`/research/`)을 미리 깔아두기. 데이터는 단계적으로 채워짐.

---

## 2. 비-목표 (지금 하지 않는 것)

- 본문 콘텐츠 재작업·확장 (한국사·종교사 본문은 그대로 유지)
- `search-index.json` 사이트 통합 검색 (각 프로젝트의 기존 검색은 살림)
- 자연과학사 실제 콘텐츠
- `notes.json` 본격 작성 (스키마만 정의)
- 통합 용어집 (현재는 한국사만 보유, 그대로 유지)

---

## 3. 최종 디렉토리 구조

```
messfilm.github.io/
├── index.html                         ← 통합 아카이브 진입 (재작성)
├── README.md                          ← 갱신
│
├── abrahamic-religions/
│   └── index.html                     ← /종교역사/index.html에서 이식 + body data-page-id
│
├── korean-history/
│   ├── index.html                     ← /한국사/index.html에서 이식 + body data-page-id
│   ├── eras/
│   │   ├── 01-prehistoric.html
│   │   ├── 02-three-kingdoms.html
│   │   ├── 03-north-south.html
│   │   ├── 04-goryeo.html
│   │   ├── 05-joseon-early.html
│   │   ├── 06-joseon-late.html
│   │   ├── 07-modern-opening.html
│   │   ├── 08-japanese-colonial.html
│   │   └── 09-republic.html
│   └── assets/                        ← 기존 자산 그대로 (styles.css, search.js, glossary.js 등)
│
├── science-history/
│   └── index.html                     ← "작업중" 임시 페이지
│
├── research/
│   ├── index.html                     ← 연구 아카이브 메인
│   ├── abrahamic.html                 ← 종교사 출처·이력·노트
│   ├── korean.html                    ← 한국사 출처·이력·노트
│   ├── science.html                   ← "작업중" 표시
│   ├── updates.html                   ← 전체 업데이트 통합 뷰
│   └── data/
│       ├── sources.json
│       ├── updates.json
│       └── notes.json
│
└── assets/shared/
    ├── styles-base.css                ← 통합 디자인 토큰 (한지·먹·금박 베이스)
    ├── nav.js                         ← 공통 상단 네비 자동 주입
    ├── footer.js                      ← 공통 푸터 (last updated 자동 계산)
    └── research-loader.js             ← JSON → HTML 렌더러
```

이 worktree에서는 위 경로의 root가 `/Users/jojo/Documents/messfilm.github.io/.claude/worktrees/silly-vaughan-06e03d/` 이다.

---

## 4. URL 구조 (GitHub Pages 배포 시)

```
https://messfilm.github.io/                          ← 통합 아카이브
                          /abrahamic-religions/      ← 종교사 직접 진입
                          /korean-history/           ← 한국사 직접 진입
                          /korean-history/eras/04-goryeo.html
                          /science-history/          ← 작업중 placeholder
                          /research/                 ← 연구 아카이브
                          /research/korean.html
```

**제약:** 모든 페이지가 직접 URL로 접근 가능해야 함. 메인 진입을 거치지 않아도 동작.

---

## 5. 공통 디자인 시스템

### 5.1 베이스 (`assets/shared/styles-base.css`)

기존 두 프로젝트가 이미 거의 같은 팔레트(한지 #f5efe0 ~ #f5f1e8, 먹 #1f1a14 ~ #1a1e2e, 금박 #a37e2c·#b08d4d)를 쓰고 있어, 다음 공통 토큰을 정의한다:

```css
:root {
  --paper:        #f5efe0;
  --paper-light:  #faf6eb;
  --paper-dark:   #ebe3cf;
  --ink:          #1f1a14;
  --ink-soft:     #3a3328;
  --ink-mute:     #6b6253;
  --rule:         #c8bea4;
  --rule-soft:    #d8d0b8;
  --gold:         #a37e2c;
  --gold-soft:    #c7a55b;
  --serif-ko:     'Noto Serif KR', serif;
  --sans-ko:      'Noto Sans KR', sans-serif;
  --serif-en:     'Cormorant Garamond', serif;
  --accent:       var(--gold);
}

.collection-religion { --accent: #7c2030; }
.collection-korean   { --accent: #4a7a6e; }   /* 기존 한국사 청자색 유지 */
.collection-science  { --accent: #2a5680; }
.collection-research { --accent: var(--gold); }
```

### 5.2 기존 페이지 스타일 보존 원칙

- **본문 인라인 스타일 / 자체 CSS는 그대로 둔다.** 시각 재작업 없음.
- 일관성은 다음 셋만으로 확보:
  1. 공통 상단 네비 (모든 페이지 동일)
  2. 공통 푸터 (last updated, 출처 보기 링크)
  3. `data-page-id` 부여 (자동화의 키)
- `styles-base.css`는 메인·연구 아카이브·science placeholder 페이지에서만 본격 사용. 기존 한국사·종교사 페이지에서는 헤더·푸터 영역에만 영향.

---

## 6. 공통 헤더·푸터 (JS 주입)

### 6.1 적용 방식 결정

**선택: JavaScript 주입.** 페이지마다 마크업 직접 추가 안 하고, `nav.js`·`footer.js`가 DOM에 삽입.

**근거:**
- 페이지 수정 면적 최소화 (각 페이지에 한두 줄만 추가)
- 향후 네비 변경 시 단일 지점 수정
- GitHub Pages 정적 사이트 + 모던 브라우저 환경이므로 JS 무로딩 우려 낮음

**대안 (기각):** 페이지마다 마크업 직접 삽입 — 변경 시 모든 페이지를 일괄 수정해야 해서 비효율.

### 6.2 페이지 측 통합 인터페이스

각 페이지에 추가할 것은 **두 가지**뿐:

```html
<body data-page-id="korean.era.04-goryeo">
  ...
  <script src="/assets/shared/nav.js" defer></script>
  <script src="/assets/shared/footer.js" defer></script>
</body>
```

기존 페이지에 이미 자체 네비가 있는 경우(한국사 `index.html`의 `<nav class="site-nav">`):
- **유지**: 프로젝트 내부 네비 (개관 / 9개 시대) — 한국사 페이지 안에서 시대 이동
- **추가**: 사이트 최상단 공통 네비 — 다른 프로젝트로 이동

공통 네비를 페이지 최상단에, 기존 프로젝트 네비를 그 아래에 배치.

### 6.3 nav.js 동작 명세

1. `<body>` 첫 자식으로 다음 헤더 마크업 삽입:
   ```html
   <header class="site-header">
     <a class="site-brand" href="/">
       아들을 위한 아카이브 <span class="latin">Archive for My Son</span>
     </a>
     <nav class="site-nav">
       <a href="/abrahamic-religions/" data-collection="religion">종교사</a>
       <a href="/korean-history/" data-collection="korean">한국사</a>
       <a href="/science-history/" data-collection="science">자연과학사 <span class="badge-wip">작업중</span></a>
       <a href="/research/" data-collection="research">연구 아카이브</a>
     </nav>
   </header>
   ```
2. `data-page-id`의 첫 번째 점 앞 토큰(`religion` / `korean` / `science` / `research`)으로 현재 컬렉션 판정 → 해당 네비 링크에 `aria-current="page"` 부여.
3. 모바일 뷰포트(<700px)에서는 햄버거 없이 가로 스크롤로 처리 (1단계 단순화).

### 6.4 footer.js 동작 명세

1. `<body>` 마지막 자식으로 푸터 삽입:
   ```html
   <footer class="page-footer">
     <span class="footer-last-updated">…</span>
     <a class="footer-sources-link" href="…">이 페이지 출처 보기</a>
     <span class="copyright">© Archive for My Son — 학습 자료 (CC BY-NC-SA 4.0)</span>
   </footer>
   ```
2. `/research/data/updates.json` fetch → `data-page-id` 매칭 → 가장 최근 update의 날짜 표시.
3. 매칭 없으면 `last-updated` 영역 숨김 (오류 표시 X).
4. `footer-sources-link`는 `data-page-id`의 프로젝트 부분으로 `/research/{project}.html#page-{full-id}` 생성.

### 6.5 페이지 ID 체계

| Page ID | 페이지 |
|---|---|
| `religion.main` | `/abrahamic-religions/index.html` |
| `korean.main` | `/korean-history/index.html` |
| `korean.era.01-prehistoric` | `/korean-history/eras/01-prehistoric.html` |
| `korean.era.02-three-kingdoms` | ditto |
| `korean.era.03-north-south` | ditto |
| `korean.era.04-goryeo` | ditto |
| `korean.era.05-joseon-early` | ditto |
| `korean.era.06-joseon-late` | ditto |
| `korean.era.07-modern-opening` | ditto |
| `korean.era.08-japanese-colonial` | ditto |
| `korean.era.09-republic` | ditto |
| `science.main` | `/science-history/index.html` (placeholder) |
| `research.main` | `/research/index.html` |
| `research.religion` / `.korean` / `.science` / `.updates` | 각 연구 페이지 |

---

## 7. 메인 아카이브 페이지 (`/index.html`)

### 7.1 구조

```
[공통 헤더 — nav.js 주입]

   아들을 위한 아카이브
   Archive for My Son

   [한 단락 소개문 — 사용자 기존 랜딩 페이지 톤 계승]

   ─────────────────────────────────────────

   [4-카드 그리드 2×2]

   §I 아브라함의 세 자녀          §II 한국사 4,000년
   유대교·기독교·이슬람교의       단군부터 대한민국까지
   4,000년사                       9개 시대
   [페이지 1 · 업데이트 …]         [페이지 10 · 업데이트 …]
   [들어가기 →]                    [들어가기 →]

   §III 자연과학사 [작업중]       ◇ 연구 아카이브
   탈레스부터 양자컴퓨터까지      출처·업데이트 이력·연구 노트
   6개 시대 예정                  [출처 N개 · 노트 N개]
   [작업중 — 비활성]              [들어가기 →]

   ─────────────────────────────────────────

   사용 안내 (단락 3~4줄)
     - 어떤 순서로 읽어도 좋다
     - 모든 사실은 /research/에서 출처 추적 가능
     - 시간이 흐르며 사실도 갱신됨

[공통 푸터 — footer.js 주입]
```

### 7.2 자연과학사 카드 처리

- 카드 자체는 노출, 제목 `자연과학사`, 상태 배지 `작업중`
- 카드 톤: 다른 카드와 동일 종이 톤 + 좌측/상단 액센트 띠를 `--accent` 적용
- `[들어가기 →]` 버튼은 활성 (눌러서 `/science-history/` 작업중 페이지 도착)
- 비활성 회색 처리 대신 "작업중" 배지로만 진행 상황 표시

### 7.3 "아버지의 편지" 섹션

마스터 아키텍처에 선택 섹션으로 명시됨. 1단계에서는 **자리만 마련하고 비워둠** — `<!-- 아버지의 편지 — 추후 작성 -->` 주석으로 대체.

---

## 8. 연구 아카이브 (`/research/`)

### 8.1 페이지

| 파일 | 내용 (1단계) |
|---|---|
| `index.html` | 메타 통계 + 프로젝트 진입 카드 3개 + 최근 업데이트 상위 N개 + "왜 이 페이지가 있나" |
| `abrahamic.html` | sources / updates / notes 섹션 (loader 통한 렌더링) |
| `korean.html` | 동일 |
| `science.html` | `자연과학사 — 작업중` 안내만 |
| `updates.html` | 전체 업데이트 통합 시간역순 뷰 |

### 8.2 JSON 데이터 시드

#### 8.2.1 `sources.json` (시드)

스키마는 마스터 아키텍처와 동일. 시드 항목:

**한국사 (4건, 한국사 README에서 추출):**
- `src-0001` 국사편찬위원회 한국사데이터베이스 — https://db.history.go.kr/
- `src-0002` 한국학중앙연구원 한국민족문화대백과사전 — https://encykorea.aks.ac.kr/
- `src-0003` 우리역사넷 — https://contents.history.go.kr/
- `src-0004` 동북아역사재단 — https://www.nahf.or.kr/

각 항목 `usedFor`는 일단 `[{ "page": "korean.main" }]`로 시작. 시대 페이지별 세분화는 다음 단계.

**종교사:** 종교사 `index.html`(175KB)을 텍스트 스캔하여 명시 URL·기관명·서지 정보가 잡히는 것만 추출 → 추정 5~15건. 자동 추출이 무리면 빈 상태로 두고 `notes.json`에 "출처 정리 필요" 작업 노트 남김.

#### 8.2.2 `updates.json` (시드)

```json
{
  "version": "1.0",
  "updates": [
    {
      "id": "upd-0001",
      "date": "2026-05-19",
      "project": "korean",
      "page": "korean.main",
      "type": "migration",
      "description": "한국사 9개 시대 페이지를 통합 아카이브로 이식",
      "by": "Father + Claude Code",
      "details": "별도 저장소 /한국사/에서 /korean-history/로 이식. 본문 변경 없음."
    },
    {
      "id": "upd-0002",
      "date": "2026-05-19",
      "project": "religion",
      "page": "religion.main",
      "type": "migration",
      "description": "아브라함 계통 종교 대시보드를 통합 아카이브로 이식",
      "by": "Father + Claude Code",
      "details": "별도 저장소 /종교역사/에서 /abrahamic-religions/로 이식. 본문 변경 없음."
    }
  ]
}
```

`type` 값에 `migration` 추가 (마스터 아키텍처의 `creation/addition/correction/update/removal/restructure`에 더해 1단계 전용).

#### 8.2.3 `notes.json` (시드)

빈 `notes: []` 배열. 스키마는 마스터 아키텍처대로.

### 8.3 `research-loader.js` 동작

```javascript
// 의사 인터페이스
ResearchLoader.load(project) -> Promise<{sources, updates, notes}>
ResearchLoader.renderSources(sources, selector)
ResearchLoader.renderUpdates(updates, selector)
ResearchLoader.renderNotes(notes, selector)
```

- 카드형 렌더링. 신뢰도 배지(HIGH/MED/LOW), 종류 태그, 사용된 페이지 링크.
- 빈 배열일 때 "등록된 항목이 없습니다 — 작업 중" 메시지.
- 검색·필터는 1단계 범위 아님 (단순 정렬만: 출처는 신뢰도 내림차순, 업데이트는 날짜 역순).

---

## 9. Science placeholder (`/science-history/index.html`)

단순한 안내 페이지:

```
[공통 헤더]

   §III 자연과학사
   Natural Science History — 작업중

   탈레스의 만물 근원에 대한 물음부터,
   행성 운동, 진화의 발견, 양자역학,
   그리고 오늘의 양자컴퓨터까지.

   현재 자료를 정리하고 있습니다.
   완성되면 메인 아카이브에서 안내드립니다.

   ─────────────────────────────────────────

   현재 진행 상황을 보려면 → [/research/science.html]

[공통 푸터]
```

`data-page-id="science.main"` 부여.

---

## 10. 마이그레이션 절차

### 10.1 한국사

1. `/Users/jojo/Documents/한국사/index.html` → `/korean-history/index.html`
2. `/Users/jojo/Documents/한국사/eras/*.html` → `/korean-history/eras/*.html`
3. `/Users/jojo/Documents/한국사/assets/*` → `/korean-history/assets/*`
4. 모든 HTML에 `data-page-id` 부여 + 공통 nav/footer 스크립트 태그 삽입.
5. 페이지 내부 링크(`href="index.html"`, `href="eras/01-…"`)는 **상대경로라 그대로 작동**. 절대경로로 바꿀 필요 없음.

### 10.2 종교사

1. `/Users/jojo/Documents/종교역사/index.html` → `/abrahamic-religions/index.html`
2. `data-page-id="religion.main"` 부여 + 공통 nav/footer 삽입.
3. 내부 앵커(`#section-id`) 그대로 유지.

### 10.3 원본 보존

원본 저장소(`/Users/jojo/Documents/한국사`, `/종교역사`)는 **건드리지 않음**. 백업으로 남김.

---

## 11. Git 전략

- 모든 작업은 worktree `silly-vaughan-06e03d` 브랜치 `claude/silly-vaughan-06e03d`에서.
- 커밋 단계 (4건 예상):
  1. `feat: 통합 골격 추가 (assets/shared, /research, /science-history placeholder)`
  2. `feat: 한국사 프로젝트 마이그레이션 (/korean-history)`
  3. `feat: 종교사 프로젝트 마이그레이션 (/abrahamic-religions)`
  4. `feat: 메인 아카이브 페이지 4-카드 레이아웃으로 재작성 + 연구 아카이브 시드 데이터`
- `main` 머지는 사용자가 확인 후 별도 결정 (이 spec 범위 외).

---

## 12. 검증 체크리스트 (작업 완료 시)

- [ ] 메인 페이지(`/`)에서 4개 카드 모두 표시. 자연과학사 카드에 "작업중" 배지.
- [ ] `/korean-history/`, `/korean-history/eras/04-goryeo.html` 직접 URL 진입 시 정상 작동.
- [ ] `/abrahamic-religions/` 직접 URL 진입 시 정상 작동 (단일 페이지 175KB 그대로).
- [ ] 모든 마이그레이션된 페이지 상단에 공통 네비 표시, 현재 페이지의 컬렉션 하이라이트.
- [ ] 모든 페이지 하단에 공통 푸터 표시. `updates.json`에 매칭되는 페이지는 last updated 자동 표시.
- [ ] `/research/`에서 한국사·종교사·전체 업데이트 페이지 정상 렌더링 (시드 데이터 표시).
- [ ] `/research/data/sources.json` 한국사 시드 4건 등록 확인.
- [ ] `/research/data/updates.json` 마이그레이션 시드 2건 등록 확인.
- [ ] `/science-history/` "작업중" 안내 표시.
- [ ] 한국사 페이지의 기존 내부 네비·검색·용어집 기능 그대로 작동.
- [ ] 종교사 페이지의 기존 앵커 링크·내부 네비 그대로 작동.

---

## 13. 위험·트레이드오프

- **JS 무로딩 시 헤더·푸터 누락**: GitHub Pages + 모던 브라우저 환경이므로 실질 영향 미미. 페이지 본문은 정상 표시됨.
- **공통 헤더 추가로 기존 페이지 레이아웃 살짝 밀림**: 한국사 페이지의 sticky 네비와 충돌 가능. 해결: 공통 헤더를 sticky 아님으로, 한국사 내부 네비를 sticky 유지.
- **종교사 출처 자동 추출의 정밀도 한계**: 텍스트 스캔으로 잡히는 만큼만. 부족분은 노트로 추적.

---

## 14. 다음 단계 (Stage 2 이후, 별도 spec)

- 사이트 전체 검색 (`search-index.json` 통합)
- 연구 아카이브 본격 채우기 (시대 페이지별 출처 세분화, notes 작성)
- 자연과학사 콘텐츠 작성 (별도 기획서 `science_history_dashboard_prompt.md` 필요)
- 통합 용어집
- 모바일 햄버거 메뉴
