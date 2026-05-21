# 수학사 § IV — 7개 시대 데이터 시트

작업 에이전트가 일관된 데이터로 페이지를 만들기 위한 단일 출처. 모든 연도·인물·인용은 작업 중 web_search로 재검증한다(스펙 § 9). 본 시트는 출발점.

## 1. 7개 시대 정의 (랜딩 통합 연표 + 시대 카드 + 시대 페이지 헤더 공통)

| § | Korean | English | 시대 영문 부제 | 연도 범위 | 핵심 인물 (검증 시작점) | 한 줄 평 |
|---|--------|---------|----------------|-----------|------------------------|---------|
| § I | 수를 발명하다 | Counting | Ancient Orient | ~BC 3000 — BC 500 | 무명(이샹고 뼈), 바빌로니아 서기, 이집트 측량가 | 수는 철학이 아니라 회계에서 태어났다 |
| § II | 증명을 발명하다 | Proof | Ancient Greece | ~BC 600 — AD 400 | 탈레스, 피타고라스, 유클리드, 아르키메데스, 디오판토스, 히파티아 | "왜 그런가"를 물은 인류 — 증명의 탄생 |
| § III | 0과 대수 | Zero and Algebra | Indo-Islamic Golden Age | ~AD 400 — 1200 | 브라마굽타, 알 콰리즈미, 오마르 하이얌, 피보나치 | 가장 늦게 발명된 수, 그리고 방정식을 푸는 기술 |
| § IV | 자연의 언어 | Nature's Language | Scientific Revolution & Enlightenment | ~1500 — 1750 | 네이피어, 데카르트, 페르마, 뉴턴 & 라이프니츠, 오일러 | 수학이 자연을 기술하는 언어가 되다 |
| § V | 불확실성 | Uncertainty | Probability and Statistics | ~1650 — 1900 | 파스칼, 페르마, 베르누이, 가우스, 존 스노우, 나이팅게일 | 우연을 수로 다루다 — 도박에서 공중보건까지 |
| § VI | 무한과 기초 | Infinity & Foundations | 19th–Early 20th Century | ~1820 — 1940 | 가우스, 리만, 갈루아, 칸토어, 힐베르트, 괴델 | 수학이 자기 자신을 캐묻다 |
| § VII | 수학이 기계가 되다 | The Machine | Modern Era | 1930 — 현재 | 튜링, 폰 노이만, 섀넌, 와일즈 | 디지털 문명 전체가 이 시대의 수학 위에 |

## 2. 파일 경로 명명 규약

| § | 파일 |
|---|------|
| § I | `math-history/eras/01-counting.html` |
| § II | `math-history/eras/02-proof.html` |
| § III | `math-history/eras/03-zero-algebra.html` ← **Stage 1에서 작성** |
| § IV | `math-history/eras/04-natures-language.html` |
| § V | `math-history/eras/05-uncertainty.html` |
| § VI | `math-history/eras/06-infinity-foundations.html` |
| § VII | `math-history/eras/07-the-machine.html` |

랜딩 페이지: `math-history/index.html`  
인터랙티브: `assets/math-history/interactives/sim-<id>.js`  
data-page-id: `math.main` (랜딩) / `math.era.03-zero-algebra` 등

## 3. CSS 클래스 카탈로그 (math-history/styles.css 기준)

### 자연과학사에서 가져온 공통 컴포넌트 (`.sci-*` → `.math-*` prefix만 변경)
- `.math-hero` — 컬렉션 히어로 (h1 + latin + lead)
- `.math-section` — 섹션 wrapper
- `.math-stats` / `.math-stat` / `.math-stat__value` / `.math-stat__label` / `.math-stat__sub` — 스탯 행
- `.math-timeline-svg` / `.math-timeline-scroll` — 통합 연표 SVG (모바일에서 가로 스크롤)

### 시대 페이지 표준 컴포넌트 (자연과학사와 동일 이름)
- `.era-breadcrumb` — 상단 빵부스러기
- `.chapter-toc` — 챕터 목차 (시대 페이지 hero 아래)
- `.era-pagination` — 시대 페이지 하단 prev/next
- `.chapter` / `.chapter__head` / `.chapter__body` — 챕터 단위
- `.narrative` — 산문 본문 컨테이너
- `.scholar` / `.scholar__portrait` / `.scholar__name` 등 — 인물 카드
- `.inline-figure` — 본문 인라인 도식
- `.inline-scene` — 본문 인라인 장면 (피토그램 + 설명)
- `.inline-sim` — 본문 인라인 시뮬레이션 슬롯 (`<div class="sim" data-sim-id="...">`)
- `.era-cards` / `.era-card` — 랜딩의 시대 카드 그리드
- `.sources-note` — 시대 페이지 끝 출처 안내

### 수학사 전용 신규 클래스 (book-like 차별점)
- `.dropcap` — 첫 글자 드롭캡 (`::first-letter`로 동작). 한글 단락은 `.dropcap.ko` 사용
- `blockquote.pull` — 풀 쿼트 (이탤릭 영문 기본, 한글 단락은 `blockquote.pull.ko`)
- `.episode` (`.episode__label` / `.episode__title` / `.episode__body`) — 일화 박스
- `.legend-vs-fact` (`.legend-vs-fact__legend` / `.legend-vs-fact__fact`) — 전설 vs 사실 2단 박스

### 액센트 색 사용
- 모든 `.collection-math` body 안에서 `--accent: #554a8a` 자동 적용
- 직접 색 값을 박지 말 것. `var(--accent)`로 참조

## 4. 통합 연표 SVG — 7띠 좌표 가이드

viewBox 기준 1080 × 360 권장 (자연과학사 1080 × 250 대비 띠가 1개 더 많아 세로 확장).

7개 띠 y 좌표:
```
§ I  y=46   width 비율 (BC 3000 → AD 2026)
§ II y=90   width 비율 (BC 600  → AD 2026)   ← 그리스
§ III y=134 width 비율 (AD 400  → AD 1200)
§ IV y=178 width 비율 (1500     → 1750)
§ V  y=222 width 비율 (1650     → 1900)
§ VI y=266 width 비율 (1820     → 1940)
§ VII y=310 width 비율 (1930    → 2026)
```

각 띠 fill 색 (인라인, 자연과학사 통합연표 패턴 따름):
- § I `#b58853` 흙·점토 황토
- § II `#6a8f7e` 올리브 그린
- § III `#2a5680` 인도양 블루
- § IV `#c4a64a` 황금
- § V `#7a6b8a` 회보라
- § VI `#5a7090` 슬레이트 블루
- § VII `#3a5a4f` 다크 그린

## 5. 사실/전설 라벨 표시 규약

- **사실**: 라벨 없음 (디폴트)
- **전설**: `.legend-vs-fact__legend`에 분리, 또는 본문에 `*전설*: ...` 형태 인라인. 본문 사용 시 `<em class="legend-flag">전설</em>` 등으로 표시
- **후대 각색**: 같은 패턴, 라벨만 다름 (`<em class="legend-flag">후대 각색</em>`)
- **도시전설**: 명백히 근거 없는 것만 (예: "애플 로고 = 튜링 추모")

## 6. 시대별 인터랙티브 ID (확정)

각 sim은 IIFE 패턴으로 `data-sim-id` 컨테이너를 찾아 자체 UI 주입. 파일명은 `sim-<id>.js`.

| § | data-sim-id | 컨셉 |
|---|-------------|------|
| § I | `base-60-converter` | 60↔10진법 변환기 (바빌로니아 잔재 체감) |
| § I | `babylonian-cuneiform` | 점토판 쐐기문자 숫자 읽기 (1-59 입력 → 쐐기 렌더) |
| § I | `egyptian-unit-fractions` | 이집트 단위분수 퍼즐 (분수 → 1/a + 1/b … 분해) |
| § II | `eratosthenes-earth` | 에라토스테네스 지구 둘레 측정 |
| § II | `sieve-of-eratosthenes` | 소수의 체 게임 |
| § II | `euclidean-algorithm` | 호제법 시각화 (큰 수 → 작은 사각형들로 분할) |
| § II | `sqrt2-irrational` | √2가 분수 아님 보이기 (귀류법 시각화) |
| § III | `roman-vs-arabic` | (이미 완성) 로마숫자 vs 아라비아숫자 곱셈 대결 |
| § IV | `cartesian-grapher` | 데카르트 좌표 함수 그래퍼 (y=f(x) 슬라이더로 변형) |
| § IV | `calculus-intuition` | 미적분 직관 (접선 기울기 + 곡선 아래 넓이 슬라이더) |
| § IV | `logarithm-slide-rule` | 로그·계산자 (두 자 슬라이드로 곱셈 → 덧셈) |
| § V | `law-of-large-numbers` | 동전·주사위 시뮬레이션 (시도 ↑ → 기댓값 수렴) |
| § V | `galton-board` | 골턴 보드 (정규분포 형성 체감) |
| § V | `monty-hall` | 몬티 홀 문제 (자동 시뮬 + 사용자 시도) |
| § VI | `cantor-diagonal` | 칸토어 대각선 논법 (실수 비가산성 시각화) |
| § VI | `hilbert-hotel` | 힐베르트 무한 호텔 (무한+1, 무한+무한 손님 배정) |
| § VI | `non-euclidean` | 비유클리드 기하 (구면·쌍곡면 삼각형 내각합) |
| § VII | `turing-machine` | 튜링 기계 시뮬레이터 (간단한 규칙 + 테이프) |
| § VII | `caesar-public-key` | 시저 암호 + 공개키 RSA 비교 데모 |
| § VII | `info-bits-twentyq` | 정보=비트 스무고개 (log₂N 질문 횟수) |

## 7. era-pagination 체인 (각 시대 페이지 하단)

| § | Prev | Next |
|---|------|------|
| § I  | (없음) | § II  |
| § II | § I | § III |
| § III | § II | § IV |
| § IV | § III | § V |
| § V | § IV | § VI |
| § VI | § V | § VII |
| § VII | § VI | (없음, 또는 "수학사 개관으로") |

각 era 페이지 추가될 때 인접 era들도 prev/next 링크 활성화.

## 8. 검증 우선순위 (스펙 § 9 그대로)
1. MacTutor History of Mathematics (St Andrews) — 일급 출처
2. Stanford Encyclopedia of Philosophy — 논리·기초
3. 대학·박물관·학술기관
4. 일반 백과는 교차검증용
