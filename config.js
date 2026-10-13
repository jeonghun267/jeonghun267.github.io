/* Portfolio snapshot — current Unity / Unreal work. Public links and local media only. */
'use strict';
window.PORTFOLIO_CONFIG = Object.freeze({
  "name": "오정훈",
  "initials": "OJH",
  "email": "popmin07@gmail.com",
  "github": "https://github.com/jeonghun267",
  "notion": "https://app.notion.com/p/59a8e7bb577082fabbf381ca689df946",
  "contentDate": "2026-10-13",
  "projects": [
    {
      "id": "aac",
      "number": "01",
      "title": "아르띠 · Unity AAC",
      "subtitle": "일상 의사소통을 연습하고, 현장에서 표현을 돕는 앱",
      "category": "대표 졸업작품 · UNITY · AI",
      "filters": [
        "unity",
        "ai"
      ],
      "featured": true,
      "art": "assets/media/aac-cover.png",
      "imageAlt": "아르띠 AAC 시작 화면 — 편의점 공간과 ARTTI 로고",
      "artLabel": "프로젝트 대표 화면",
      "type": "3인 협업 · Android 태블릿",
      "status": "졸업작품 · 2026.04–2026.10",
      "tags": [
        "Unity",
        "C#",
        "UI/UX",
        "Blender",
        "Meshy",
        "Gemini",
        "STT · TTS",
        "uLipSync"
      ],
      "description": "편의점 말하기 훈련과 실제 장소의 의사소통을 지원하는 Unity 기반 AI·AAC 앱입니다. 음성·카드·키보드 입력, AI 점원의 응답, 사용자별 기록과 학습 리포트를 하나의 흐름으로 연결했습니다.",
      "role": "훈련 흐름·UX 설계, 전체 UI 디자인과 Unity 구현, 훈련·프로필·리포트 개발, AI·STT·TTS 연동, Meshy 모델의 Blender 보정과 리깅·UV·머티리얼·표정·립싱크 통합",
      "points": [
        "편의점 5단계 대화: 인사 → 물건 선택 → 추가 요청 → 결제 → 작별",
        "훈련지원: 음성·AAC 카드·키보드 입력, 힌트·되묻기·재시도와 AI 점원",
        "현장지원: 사진 OCR·장소 검색·지도, 문장 카드·카페 주문과 음성 전달",
        "사용자별 프로필·음성 설정, 학습 기록·기간별 리포트와 발음 비교 듣기"
      ],
      "summary": [
        [
          "내 역할",
          "Unity·C# 기반 훈련 흐름과 UX를 설계하고 앱 전체 UI 디자인과 화면 구현을 담당했습니다."
        ],
        [
          "내 역할",
          "편의점 대화 훈련, 프로필·학습 기록·리포트를 개발하고 Gemini·STT·TTS를 연결했습니다."
        ],
        [
          "3D 작업",
          "Meshy 모델을 Blender에서 보정하며 뼈대·스키닝·UV·머티리얼·셰이프키를 수정하고 애니메이션·립싱크를 통합했습니다."
        ],
        [
          "AI 활용",
          "Gemini로 점원 대화·학습 피드백을 생성하고, Meshy로 3D 캐릭터 원본 모델을 제작했습니다."
        ],
        [
          "개발 보조 AI",
          "Claude Code와 Unity 에디터 연동 도구로 코드 작성과 에디터 작업을 보조받았습니다."
        ],
        [
          "어려웠던 문제",
          "FBX 크기·팔 자세가 어긋나고 표정 스크립트가 입 모양을 동시에 제어했습니다."
        ],
        [
          "해결",
          "FBX 계층을 보존하고 남자 점원을 Generic 리그로 임포트해 크기와 뼈 회전 문제를 해결했습니다."
        ],
        [
          "해결",
          "입 모양 제어를 한 드라이버로 모으고 점원·카드 음성을 분리해 TTS 립싱크와 무음 시 입 닫기를 연결했습니다."
        ]
      ],
      "screens": [
        {
          "src": "assets/media/AAC_training_screen.jpg",
          "title": "01 · 훈련지원",
          "caption": "음성·카드·키보드로 편의점 이용을 연습하고 AI 점원의 응답과 힌트를 확인합니다. 훈련 UI/UX·대화 흐름·캐릭터와 립싱크를 구현했습니다."
        },
        {
          "src": "assets/media/AAC_field_screen.jpg",
          "title": "02 · 현장지원",
          "caption": "촬영 이미지·장소·지도를 확인하고 도움 카드와 주문 문장을 음성으로 전달합니다. 현장 화면의 UI/UX와 디자인을 담당했습니다."
        },
        {
          "src": "assets/media/AAC_report_screen.jpg",
          "title": "03 · 학습 리포트",
          "caption": "연습 시간·학습 지표·어려웠던 발음을 확인하고 다시 연습으로 이어집니다. 리포트 화면·기록 집계·AI 피드백 연결을 담당했습니다."
        }
      ],
      "note": "현재 말하기 훈련 시나리오는 편의점입니다. 현장모드는 사진 인식·장소 검색과 문장 전달을 지원하며, 공간에 매장을 배치하는 AR 기능으로 소개하지 않습니다. 소스 저장소는 비공개이며 상세 구현은 Notion에서 확인할 수 있습니다.",
      "notion": "https://app.notion.com/p/3678e7bb5770836ebaa8811cda4984c2",
      "video": "https://youtu.be/1W3cxmKj3GI",
      "youtubeEmbed": "https://www.youtube-nocookie.com/embed/1W3cxmKj3GI",
      "videoCaption": "AAC 시연 — 화면 이동, 대화 훈련, 점원 음성·립싱크와 학습 리포트"
    },
    {
      "id": "humanbody",
      "number": "02",
      "title": "인체탐험 VR",
      "subtitle": "소화기관을 따라 이동하는 VR 교육 콘텐츠",
      "category": "UNITY · XR · MEDIA",
      "filters": [
        "unity"
      ],
      "art": "assets/media/humanbody-cover.png",
      "imageAlt": "인체탐험 위 씬 — 보트와 가이드 NPC",
      "artLabel": "위 씬 · 실제 화면",
      "type": "개인 프로젝트",
      "status": "실사화 개선 진행 중",
      "tags": [
        "Unity",
        "C#",
        "Meta XR SDK",
        "Cinemachine",
        "OSC · NDI"
      ],
      "description": "소화기관 내부를 이동하며 기관별 설명을 듣는 Unity VR 교육 콘텐츠입니다. 보트·가이드 NPC·음성 안내·씬 전환과 OSC 입력·NDI 영상 송출을 하나의 체험 흐름으로 구성했습니다.",
      "role": "VR 환경, 다중 씬 전환·플레이어 위치 보정, 보트 탑승·하차, NPC·음성 안내·VFX와 OSC/NDI 연동을 개인으로 설계·구현",
      "points": [
        "입/식도 → 위 → 소장 → 마무리의 4개 씬 체험",
        "Spline 보트 이동·탑승·하차, 가이드 NPC와 위치 기반 음성 안내",
        "씬 전환 시 CharacterController 제어와 SpawnPoint 재배치, 페이드·비동기 로딩",
        "OSC A/B 입력 송수신과 RenderTexture 기반 NDI 영상 송출"
      ],
      "note": "기존 VR 구현을 바탕으로 실사화 개선을 진행 중입니다. 영상은 NDI 연동을 촬영한 현장 시연이며, 기존 구현 버전의 자료입니다.",
      "notion": "https://app.notion.com/p/04f8e7bb5770828e9d6481d3dac5d137",
      "github": "https://github.com/jeonghun267/HUMANBODY",
      "clip": {
        "src": "assets/media/humanbody-ndi.mp4",
        "poster": "assets/media/humanbody-cover.png",
        "caption": "NDI 연동 현장 시연 · 전체 1분 2.5초"
      }
    },
    {
      "id": "still",
      "number": "03",
      "title": "STILL",
      "subtitle": "해양생물을 관찰·기록하는 Meta Quest VR 도감",
      "category": "UNITY · XR · AI",
      "filters": [
        "unity",
        "ai"
      ],
      "art": "assets/media/still-info.jpg",
      "imageAlt": "STILL Quest 실기기 화면 — 해양생물 설명 패널",
      "artLabel": "Meta Quest · 실기기 캡처",
      "type": "개인 프로젝트",
      "status": "콘텐츠 추가 진행 중",
      "tags": [
        "Unity",
        "C#",
        "OpenXR · XRI",
        "Gemini · TTS",
        "HLSL"
      ],
      "description": "수중 돔에서 해양생물을 관찰하고 한국어 설명·음성 해설을 들으며 개인별 관찰 일지를 채우는 Meta Quest VR 콘텐츠입니다. 육상 관측소 로비와 엘리베이터 하강 연출을 추가하며 체험을 확장하고 있습니다.",
      "role": "보이드 시뮬레이션·수조 셰이더·XR 입력·Gemini 설명과 TTS·관찰 기록·오디오·씬 빌더를 개인으로 설계·구현",
      "points": [
        "보이드 군집 관찰과 수조 내벽·수중 효과 셰이더",
        "응시·접촉·컨트롤러 입력, 미스터리 상자와 생물 등장·해설",
        "Gemini 설명·TTS, 캐시·실패 시 대체 처리와 BGM 덕킹",
        "탐험가별 관찰 일지·필터·360° 미리보기, 로비·입장 흐름 확장"
      ],
      "note": "영상과 이미지는 기존 수중 체험의 실기기 자료입니다. 로비·입장·엘리베이터 하강 연출과 콘텐츠를 추가하고 있습니다. 소스 저장소는 비공개이며, 상세 구현은 Notion에서 확인할 수 있습니다.",
      "notion": "https://app.notion.com/p/3d48e7bb577081f4bd06ff765a08f616",
      "clip": {
        "src": "assets/media/still-highlight.mp4",
        "poster": "assets/media/still-fish.jpg",
        "caption": "Meta Quest 실기기 하이라이트 · 31초"
      }
    },
    {
      "id": "lightofkorea",
      "number": "04",
      "title": "LightOfKorea",
      "subtitle": "달항아리·한옥·빛의 숲을 잇는 Unreal 미디어아트",
      "category": "UNREAL · MEDIA ART",
      "filters": [
        "unreal",
        "ai"
      ],
      "art": "assets/media/lightofkorea-cover.png",
      "imageAlt": "LightOfKorea 대표사진 — 달항아리·한옥과 반사 바닥",
      "artLabel": "Unreal · 프로토타입 화면",
      "type": "개인 학습 프로젝트",
      "status": "ZONE 01 · 60초 프로토타입",
      "tags": [
        "Unreal Engine",
        "Sequencer",
        "Niagara",
        "Python",
        "HLSL"
      ],
      "description": "‘빛의 대한민국: 달빛에서 네온까지’의 첫 공간 ‘달빛의 한국’을 구성한 60초 오프닝 프로토타입입니다. 달항아리의 윤곽·유약·먹 매화 문양이 드러나고 바닥의 파동이 나무·한옥·입자의 빛으로 이어집니다.",
      "role": "공간 구도·절차적 메시·재질·조명·카메라·파티클 구성과 보정, Unreal Python 제작·검사·렌더 자동화, AI 생성 텍스처 통합",
      "points": [
        "달항아리·곡선 나무·한옥, 반사 바닥과 낮은 안개로 공간 구성",
        "AI 생성 유약·먹 매화 텍스처의 색·거칠기·미세 노멀과 윤곽 발광",
        "Sequencer·MPC를 이용한 단계별 등장과 거리 기반 빛 파동",
        "Niagara 4종, 꽃잎 인스턴스, 재실행 중복 검사·재생 확인·MRQ 출력"
      ],
      "note": "현재 구현은 ZONE 01의 자동 재생과 공간 연출입니다. 센서·관람객 입력, ZONE 2–5와 현장 nDisplay/DMX 구성은 후속 범위입니다. 업로드 영상은 오프닝을 약 50초로 담은 시연입니다.",
      "notion": "https://app.notion.com/p/3f88e7bb5770817a9a90f414b4314c68",
      "github": "https://github.com/jeonghun267/LightOfKorea",
      "clip": {
        "src": "assets/media/lightofkorea-opening.mp4",
        "poster": "assets/media/lightofkorea-cover.png",
        "caption": "달빛의 한국 오프닝 시연 · 약 50초"
      }
    }
  ]
});
