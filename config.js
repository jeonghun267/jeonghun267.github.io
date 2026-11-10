/* 포트폴리오 내용. 문구·링크·자료는 여기서만 고친다. 공개 링크와 저장소 안 파일만 쓴다. */
'use strict';
window.PORTFOLIO_CONFIG = Object.freeze({
  name: '오정훈',
  email: 'popmin07@gmail.com',
  github: 'https://github.com/jeonghun267',
  contentDate: '2026-11-10',
  intro: {
    hello: '안녕하세요, 오정훈입니다',
    headline: '직접 들어가서 겪는<br><em>가상 공간</em>을 만듭니다',
    paragraphs: [
      'Unity와 C#으로 VR 체험과 AI 대화 앱을 만듭니다. 보고 끝나는 화면보다, 걸어 들어가 관찰하고 말을 걸 수 있는 콘텐츠에 관심이 있습니다.',
      '여기 있는 세 공간은 제가 만든 프로젝트입니다.'
    ],
    facts: [
      ['소속', '한국폴리텍대학 인천캠퍼스 컴퓨터공학과 · 2027.02 졸업 예정'],
      ['하는 일', 'XR 상호작용 · AI 대화 연동 · 3D 캐릭터와 UI'],
      ['도구', 'Unity 6 · C# · Meta Quest · Gemini · Blender']
    ]
  },
  projects: [
    {
      id: 'still',
      number: '01',
      title: 'STILL',
      short: '해변에서 1,000m 심해까지, 관찰하고 기록하는 VR',
      subtitle: '해변의 해양 관측소에서 출발해 24m · 200m · 1,000m를 내려가며 해양생물을 관찰하고 기록하는 VR',
      meta: '개인 프로젝트 · Meta Quest · 2026.08 – 2026.11',
      stack: 'Unity 6.3 · C# · URP · OpenXR · XR Interaction Toolkit · Gemini · HLSL · Blender',
      cover: 'assets/media/still-reef24.jpg',
      mood: 'sea',
      description: '지구 표면의 71%는 바다지만, 그 바다의 80% 이상은 아직 아무도 본 적이 없습니다. STILL은 생물을 잡아 모으는 대신 모르는 바다를 한 칸씩 기록하는 관찰 체험입니다. 10~15세 관람객을 기준으로 글자 크기와 단어, UI 배치를 맞췄습니다.',
      role: '씬 빌더, 해변·로비 연출과 NPC 대화, 층별 하강과 엔딩, 보이드 시뮬레이션, 수조·심해 셰이더, 관찰기와 XR 입력, Gemini 설명과 음성 해설, 관찰 일지, Quest 최적화까지 혼자 설계하고 구현했습니다.',
      points: [
        '해변 조수 웅덩이에서 첫 기록을 남기고, 보리 선장과 놀란을 만난 뒤 엘리베이터로 24m 산호초 · 200m 박광층 · 1,000m 심해를 차례로 내려갑니다.',
        '헤엄치는 생물을 손으로 겨누고 지켜보면 기록됩니다. Gemini가 만든 한국어 설명과 음성 해설이 나오고, 110종 관찰 일지가 채워집니다.',
        '1,000m에서는 조명을 끄고 가만히 있어야 다가오는 ‘신호의 주인’을 처음 기록해 이름을 붙입니다. 크레딧 뒤에는 ‘오늘 밤의 이야기’ 다섯 장면이 이어집니다.',
        '해변을 걷는 동안 보이지 않는 수중 돔이 물고기 142마리와 렌더러 299개를 계속 돌리고 있었습니다. 물 위에서는 돔을 통째로 끄고, 처음 내려갈 때 검은 화면 뒤에서 켭니다.',
        'Quest에서 추가 조명을 켜는 대신 심해 전용 셰이더가 조명을 직접 계산합니다. 고정 포비에이티드 렌더링과 동시 물고기 150마리 예산으로 프레임을 지켰습니다.'
      ],
      note: '사진은 에디터 플레이로 찍은 장면입니다. 본편과 밤의 이야기 다섯 장면까지 완성했고, Quest 실기기에서 전체 흐름을 한 번에 확인하는 일이 남아 있습니다.',
      media: [
        { type: 'image', label: '해변', src: 'assets/media/still-beach.jpg', caption: '해변에서 본 관측소 — 벽 전체 벽화와 지붕 간판, 테라스로 오르는 나무 계단' },
        { type: 'image', label: '로비', src: 'assets/media/still-lobby.jpg', caption: '로비 홀 — 바시스피어 전시 · 개찰구 · 데이터 월' },
        { type: 'image', label: '24m', src: 'assets/media/still-reef24.jpg', caption: '24m 산호초 — 바다거북 · 돌고래 · 상어와 산호초 물고기' },
        { type: 'image', label: '200m', src: 'assets/media/still-200m.jpg', caption: '200m 박광층 — 가끔 돔 가까이 지나가는 대왕고래' },
        { type: 'image', label: '밤', src: 'assets/media/still-night.jpg', caption: '밤의 관측소 — 달과 등대 빛줄기가 비치는 밤바다' }
      ],
      links: [
        ['전체 영상', 'https://youtu.be/65kSSI_hgK0'],
        ['GitHub', 'https://github.com/jeonghun267/STILL']
      ]
    },
    {
      id: 'aac',
      number: '02',
      title: '아르띠',
      short: '편의점 대화를 연습하는 AI · AAC 앱',
      subtitle: '편의점 대화를 미리 연습하고, 실제 가게에서는 대신 말해 주는 AI · AAC 앱',
      meta: '3인 팀 졸업작품 · Android 태블릿 · 2026.05 – 진행 중',
      stack: 'Unity 6.3 · C# · Gemini 2.5 Flash · STT/TTS · uLipSync · Blender',
      cover: 'assets/media/aac-cover.png',
      mood: 'store',
      description: '발달장애인이 동네 가게에서 스스로 말할 수 있도록 돕는 앱입니다. 특수학교 교사와 복지관 담당자 인터뷰에서 나온 ‘실제와 비슷한 반복 연습’과 ‘현장에서 바로 쓰는 보조 수단’을 한 앱의 두 모드로 만들었습니다.',
      role: '훈련 모드 전체, 앱 전체 UI/UX 디자인과 구현, 프로필·음성 설정, 리포트, 3D 점원 캐릭터를 맡았습니다.',
      points: [
        '3D 편의점에서 점원과 인사 → 물건 고르기 → 추가 요청 → 계산 → 인사까지 실제 순서대로 대화합니다.',
        'Gemini가 다음 단계를 제안해도 그대로 믿지 않습니다. 없는 단계는 무시하고, 지난 단계로 돌아가거나 건너뛰는 것을 막습니다.',
        '정해진 문장과 상품 선택은 규칙으로 바로 처리하고, 규칙에 없는 말만 LLM에 보내 응답 속도를 확보했습니다.',
        '서버 음성 인식이 끊기면 Android 기본 음성 인식으로 자동 전환해 훈련이 멈추지 않습니다.',
        'Meshy로 만든 점원 모델을 Blender에서 리깅·UV·셰이프 키까지 보정하고 립싱크를 붙였습니다.'
      ],
      note: '말하기 훈련 시나리오는 현재 편의점 하나입니다. 현장 모드의 기능 구현은 팀원 담당이고, 저는 그 화면의 UI/UX를 맡았습니다.',
      media: [
        { type: 'image', label: '시작 화면', src: 'assets/media/aac-cover.png', caption: '아르띠 시작 화면' },
        { type: 'image', label: '훈련', src: 'assets/media/AAC_training_screen.jpg', caption: '말하기 훈련 — 음성·카드·키보드로 점원과 대화하고 힌트를 받습니다' },
        { type: 'image', label: '현장', src: 'assets/media/AAC_field_screen.jpg', caption: '현장 지원 — 장소에 맞는 카드를 눌러 음성으로 전달합니다' },
        { type: 'image', label: '리포트', src: 'assets/media/AAC_report_screen.jpg', caption: '학습 리포트 — 연습 시간과 어려웠던 발음을 확인합니다' }
      ],
      links: [
        ['시연 영상', 'https://youtu.be/1W3cxmKj3GI'],
        ['GitHub', 'https://github.com/jeonghun267/AAC_ARTTI']
      ]
    },
    {
      id: 'humanbody',
      number: '03',
      title: '인체탐험 VR',
      short: '치료 잠수정을 타고 몸속으로, 아픈 곳을 직접 고치는 VR',
      subtitle: '환자를 진찰하고, 초소형 치료 잠수정을 타고 입에서 대장까지 들어가 아픈 곳을 직접 고치는 VR 교육 체험',
      meta: '개인 프로젝트 · Meta Quest 2/3 · 2026.05 – 진행 중',
      stack: 'Unity 6 · C# · URP · Meta XR SDK · OSC · NDI',
      cover: 'assets/media/hb-intestine-3.jpg',
      mood: 'body',
      description: '소화기관을 그림으로 외우는 대신, 안에 들어가 보고 · 겨누고 · 고치며 배우도록 만들었습니다. 체험관 어린이 관람객이 대상이라 대사는 아이 눈높이 말투로 쓰고, 앉아서 하는 체험과 왼손잡이 설정을 지원합니다.',
      role: '여정 진행과 임무, 병원 NPC 대화, 겨누기와 표적, 화면 표시 규칙, 이동과 멀미 줄이기, 몸속 표현, 소리, 체험관 운영 기능, Quest 최적화까지 혼자 설계하고 구현했습니다.',
      points: [
        '진료실에서 홀로그램 몸의 빨간 점 세 곳(이 · 위 · 대장)을 겨눠 진찰하면 출발 버튼이 열리고, 잠수정이 입으로 들어갑니다.',
        '기관마다 치료 임무가 있습니다. 입의 충치와 치태 세균, 식도의 역류 위산, 위의 헬리코박터균, 소장의 효소 짝 맞추기, 대장의 해로운 균.',
        '마지막 진료실에서 치료 결과 모니터와 OX 퀴즈, 치료 보고서로 배운 내용을 정리합니다.',
        '순간이동 대신 걷기와 부드러운 회전, 가장자리 비네트로 멀미를 줄였습니다.',
        '세균 모형의 삼각형을 UV를 지키며 줄여 대장 장면을 96만에서 53만으로 낮추고, 융털 5만여 개는 눈앞 11m 구간만 그립니다.'
      ],
      note: '사진은 2026년 11월 에디터 플레이 화면입니다. 영상은 리뉴얼 전 버전(병아리 의사 · 보트)으로, 헤드셋 화면을 NDI로 옆 PC에 띄우는 모습을 보여 주려고 남겼습니다. 지금 버전의 전체 영상은 헤드셋 확인 뒤에 넣을 예정입니다.',
      media: [
        { type: 'image', label: '진료실', src: 'assets/media/hb-clinic.jpg', caption: '병원 진료실 — 홀로그램 몸, 진찰 모니터, 잠수정 탑승구, 의사 선생님' },
        { type: 'image', label: '입', src: 'assets/media/hb-mouth-2.jpg', caption: '입 — 양치를 안 하면 생기는 충치' },
        { type: 'image', label: '위', src: 'assets/media/hb-stomach-3.jpg', caption: '위 — 위액 위를 떠다니는 헬리코박터균 물리치기' },
        { type: 'image', label: '소장', src: 'assets/media/hb-intestine-1.jpg', caption: '소장 — 융털과 혈관 속 적혈구' },
        { type: 'image', label: '대장', src: 'assets/media/hb-intestine-3.jpg', caption: '대장 — 해로운 균 물리치기' },
        { type: 'image', label: '결과', src: 'assets/media/hb-ending-2.jpg', caption: '마지막 진료실 — 치료 결과 모니터' },
        { type: 'video', label: 'NDI 영상', src: 'assets/media/humanbody-ndi-15s.mp4', poster: 'assets/media/hb-clinic.jpg', caption: 'NDI 실시간 송출 · 15초 · 리뉴얼 전 버전' }
      ],
      links: [
        ['예전 버전 영상', 'https://www.youtube.com/watch?v=oTahLEX3NXo'],
        ['GitHub', 'https://github.com/jeonghun267/HUMANBODY']
      ]
    }
  ]
});
