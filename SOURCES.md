# 콘텐츠와 미디어 출처

콘텐츠 기준일: 2026-10-13. 사용자가 정리한 공개 노션 페이지와 해당 저장소의 구현 기록을 기준으로 작성했습니다.

## 프로젝트 기록

- [포트폴리오 메인](https://app.notion.com/p/59a8e7bb577082fabbf381ca689df946)
- [Unity AAC](https://app.notion.com/p/3678e7bb5770836ebaa8811cda4984c2): 3인 협업 졸업작품. 전체 UI/UX, 훈련·프로필·리포트, AI·음성, 캐릭터 보정과 립싱크 담당 범위를 명시.
- [인체탐험 VR](https://app.notion.com/p/04f8e7bb5770828e9d6481d3dac5d137): 개인 프로젝트, 실사화 개선 진행 중. [공개 코드](https://github.com/jeonghun267/HUMANBODY).
- [STILL](https://app.notion.com/p/3d48e7bb577081f4bd06ff765a08f616): 개인 프로젝트, 콘텐츠 추가 중. 저장소는 비공개. NDI 기능을 포함하지 않음.
- [LightOfKorea](https://app.notion.com/p/3f88e7bb5770817a9a90f414b4314c68): 개인 학습 프로젝트, ZONE 01 60초 프로토타입. [공개 코드](https://github.com/jeonghun267/LightOfKorea).

## 실제 화면과 시연

`assets/media`의 자료는 사용자가 현재 포트폴리오에 제공한 파일입니다.

- `aac-cover.png`: ARTTI 시작 화면. `AAC_*_screen.jpg`: 훈련·현장·리포트의 대표 화면 3장.
- AAC 동영상: [사용자 YouTube 시연](https://youtu.be/1W3cxmKj3GI).
- `humanbody-cover.png`: 위의 보트·NPC 화면. `humanbody-ndi.mp4`: NDI 연동 현장 시연, 전체 62.5초.
- `still-info.jpg` / `still-fish.jpg`: Meta Quest 실기기 캡처. `still-highlight.mp4`: 기존 수중 버전 실기기 하이라이트, 31초.
- `lightofkorea-cover.png`: 사용자가 지정한 대표사진. `lightofkorea-opening.mp4`: 오프닝 시연, 약 50초.
- 인체탐험·LightOfKorea 영상은 길이를 유지한 업로드용 압축본이며 사용자의 바탕화면 원본은 수정하지 않았습니다.

노션의 임시 파일 주소는 다운로드 시에만 사용했으며 저장소에는 포함하지 않습니다. 카드 이미지는 실제 프로젝트 자료입니다. 이전 콘셉트 아트 파일은 Git 이력과 함께 유지되지만 현재 프로젝트 구성에서는 사용하지 않습니다.

## 구현 범위

- AAC 말하기 훈련은 편의점. 현장모드는 사진 인식·장소·문장 전달이며 AR 매장 배치로 소개하지 않습니다.
- STILL의 로비·입장 흐름은 현재 추가 내용이며 영상은 기존 수중 체험입니다.
- LightOfKorea의 센서 입력·다중 존·현장 nDisplay/DMX는 후속 범위입니다.
- 웹 큐브는 프로젝트에서 영감을 받은 절차적 미니 장면이며 원본 엔진 실행 화면과 구분합니다.
- 프로젝트의 개발 문서와 로컬 검증 기록을 실제 전시장 성능·학습 효과 보증으로 해석하지 않습니다.

## 외부 코드·아이콘

기존 Three.js와 Font Awesome 자산의 라이선스·출처는 `NOTICE.md`와 각 vendor/license 파일을 유지합니다. 이 갱신에서는 외부 디자인 스킬이나 새로운 런타임 패키지를 설치하지 않았습니다.

기존 시각 시안은 사용자가 제작에 동의한 이미지이며 원본은 references/approved-concept.png에 유지합니다. 이전 콘셉트 썸네일은 이 시안에서 추출한 자료입니다.
