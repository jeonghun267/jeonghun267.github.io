# OJH — Unity / Unreal Interactive Portfolio

오정훈의 공개 포트폴리오: **https://jeonghun267.github.io/**

현재 노션 포트폴리오를 기준으로 정리한 정적 사이트입니다. 콘텐츠 기준일은 **2026-10-13**이며 자동 API 동기화는 사용하지 않습니다.

## 소개하는 프로젝트

1. **아르띠 · Unity AAC** — 대표 졸업작품, 3인 협업. 편의점 말하기 훈련·현장 의사소통 지원·프로필·학습 리포트. UI/UX·개발·Blender/Meshy 보정·음성·립싱크 기여를 소개합니다.
2. **인체탐험 VR** — 개인 프로젝트. 소화기관 체험·보트·가이드·씬 전환·OSC/NDI. 실사화 개선 진행 중.
3. **STILL** — 개인 프로젝트. Meta Quest 수중 관찰·보이드·Gemini 설명과 TTS·관찰 일지. 로비·엘리베이터와 콘텐츠 추가 진행 중.
4. **LightOfKorea** — 개인 학습 프로젝트. Unreal의 60초 ZONE 01 미디어아트 오프닝. 재질·조명·Sequencer·Niagara·Python 자동화.

AAC는 첫 대표 카드로 크게 표시합니다. 상세 창에 역할·AI 활용·문제 해결 8줄, 대표 화면 3장과 YouTube 시연을 넣었습니다. 나머지 프로젝트는 로컬 MP4 시연을 제공합니다. 비공개 소스 저장소의 링크는 노출하지 않습니다.

## 실행

Node.js 18.18 이상. 추가 패키지 설치 없이 실행합니다.

```bash
npm run dev
```

기본 주소는 http://127.0.0.1:4173 입니다. ES 모듈·importmap을 사용하므로 로컬 서버나 GitHub Pages에서 엽니다.

## 구조

- `config.js`: 프로젝트 소개·역할·진행 상태·링크·미디어 데이터
- `index.html` / `styles.css`: 소개·필터·카드·상세 창·반응형 레이아웃
- `app.js`: 카드·필터·상세 시연·키보드와 모션 설정
- `hero3d.js`: AAC·인체·아쿠아리움·달항아리 정원의 4개 미니 큐브
- `assets/media`: 사용자의 실제 프로젝트 화면·대표사진·시연 압축본
- `vendor`: Three.js r170와 애드온
- `server.mjs`: 로컬 미리보기 서버
- `tests/smoke_test.py`: 브라우저 회귀 검사

첫 3D 씬은 EDIT 모드이며 Play를 누르면 색·빛과 움직임이 활성화됩니다. 큐브 선택 또는 바로가기 버튼으로 상세를 엽니다. 축소 모션·탭 숨김·상세 창 표시 상태에 맞춰 시뮬레이션을 제어합니다. DPR은 1.5까지이며 좁은 화면에서는 블룸을 비활성화합니다.

큐브는 프로젝트를 소개하는 웹용 절차적 미니 장면입니다. Unity/Unreal 실행 화면 자체는 카드·사진·영상에서 확인합니다.

## 확인

```bash
npm run check
python tests/smoke_test.py
```

브라우저 검사에는 Playwright와 Chromium이 필요합니다. `CHROMIUM_PATH`로 설치 경로를 지정할 수 있습니다. 문법 검사와 실제 브라우저 확인 결과는 [design-qa.md](design-qa.md)에 구분해 기록합니다.

## 배포와 자료

GitHub Pages는 `main` 브랜치의 루트를 제공합니다. 미디어는 로컬 파일로 호스팅하고, AAC YouTube 시연만 네트워크 연결이 필요합니다. 영상은 자동 재생하지 않으며 상세 창을 닫으면 재생을 정지합니다.

API 키·토큰·Notion의 임시 서명 주소를 코드에 저장하지 않습니다. 이미지·영상 출처와 콘텐츠 범위는 [SOURCES.md](SOURCES.md), 외부 코드 라이선스는 [NOTICE.md](NOTICE.md)에 있습니다.
