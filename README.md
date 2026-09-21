# OJH — Interactive Portfolio

오정훈(OJH)의 인터랙티브 포트폴리오. 공개 주소: **https://jeonghun267.github.io/**

첫 화면은 Three.js로 만든 **디오라마 큐브 씬**입니다. Unity 에디터처럼 EDIT 모드(와이어프레임)로 시작해 ▶ 버튼을 누르면
큐브가 차례로 빌드되며 프로젝트별 미니 월드가 살아 움직입니다. 큐브를 클릭하면 카메라가 다이브하고 프로젝트 상세 창이 열립니다.
DEBUG 토글은 FPS·드로우콜·삼각형 수를 오버레이합니다.

## 실행

Node.js 18.18 이상. 추가 패키지 설치 없음.

```bash
npm run dev
```

브라우저에서 `http://127.0.0.1:4173`. ES 모듈과 importmap을 쓰기 때문에 `file://`로 직접 열면 3D 씬이 뜨지 않습니다 — 로컬 서버나 GitHub Pages로 여세요.

## 배포

`main` 브랜치를 GitHub Pages(root)에서 서빙합니다. `git push origin main` 후 1~2분 내 반영.

## 구조

```
index.html       페이지 구조 (히어로 + 프로젝트 + About/Skills/Contact + 상세 dialog)
styles.css       레이아웃·반응형·상태 스타일
config.js        프로필·프로젝트 데이터·Notion 주소 (내용 수정은 여기서)
app.js           필터·상세 창·모션 설정·접근성 (의존성 없음)
hero3d.js        Three.js 히어로 씬: 큐브 5개, Edit/Play 전환, 디버그 오버레이
vendor/          three.js r170 + postprocessing 애드온 (MIT, vendor/LICENSE.three.txt)
assets/          프로젝트 카드 이미지(콘셉트 아트)·SVG 아이콘
tests/           Playwright 스모크 테스트 (dev 서버 대상)
```

### 히어로 씬 동작

- 큐브 ↔ 프로젝트 매핑은 `hero3d.js`의 `BUILDERS`/`TONES`가 `config.js`의 `projects[].id`를 참조합니다.
- 큐브 클릭 → `ojh:open-project` 이벤트 → `app.js`가 기존 상세 창을 엶. 창이 닫히면 `ojh:project-closed`로 카메라 복귀.
- 헤더의 모션 토글은 `window.OJH_HERO.setRunning()`으로 씬 시뮬레이션도 함께 멈춥니다. `prefers-reduced-motion`이면 전환 애니메이션 없이 바로 PLAY 상태.
- 성능: DPR 상한 1.5, 700px 미만에서는 블룸 비활성, 탭이 숨겨지면 렌더 스킵. 물고기 64마리는 InstancedMesh 1 드로우콜.
- 큐브 안 오브젝트는 전부 프로시저럴 지오메트리(외부 3D 에셋 없음).

## 검수

```bash
npm run check                      # 문법 검사
python tests/smoke_test.py         # Playwright + Chromium(WebGL) 필요, dev 서버 실행 중이어야 함
```

## 보안·라이선스

API 키·토큰 없음. 노션 링크는 공개 게시 주소로 유지해야 비로그인 방문자가 열 수 있습니다.
아이콘: Font Awesome Free (CC BY 4.0) — `assets/icons/LICENSE.txt`, `NOTICE.md`. three.js: MIT.
