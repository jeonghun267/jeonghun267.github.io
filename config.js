/* Portfolio content. Edit this file to change copy, tags, links, and project details.
   Public URLs only: do not add a Notion integration token or other secret here.
   These are snapshots of the user's Notion portfolio, not an automatic API sync. */
'use strict';
window.PORTFOLIO_CONFIG = Object.freeze({
  name: '오정훈',
  initials: 'OJH',
  email: 'popmin07@gmail.com',
  github: 'https://github.com/jeonghun267',
  notion: 'https://app.notion.com/p/59a8e7bb577082fabbf381ca689df946',
  contentDate: '2026-09-19',
  projects: [
    {
      id: 'block', number: '01', title: 'BlockTrade', subtitle: '블록으로 조립하는 가상자산 전략 플랫폼',
      category: 'QUANT · WEB', filters: ['quant', 'web'], art: 'assets/project-quant.webp',
      tags: ['React', 'TypeScript', 'PWA'],
      description: '복잡한 전략을 조건 블록으로 연결하고, 하나의 화면에서 관리하는 가상자산 자동매매 Web / App 프로젝트입니다.',
      role: '전략 빌더 · 반응형 웹 인터페이스',
      points: ['블록 조립형 노코드 전략 빌더', 'PC·모바일 반응형 화면과 설치형 PWA', 'UI·보안 흐름 회귀 테스트'],
      note: '서비스의 구현 범위는 연결된 프로젝트 문서를 기준으로 확인할 수 있습니다. 거래 수익이나 성과를 보증하는 포트폴리오가 아닙니다.',
      notion: 'https://app.notion.com/p/3c18e7bb577081b6b97ff2ca3a10c062'
    },
    {
      id: 'aac', number: '02', title: 'Unity AAC', subtitle: '일상 속 의사소통을 연습하는 학습 경험',
      category: 'UNITY · INTERACTION', filters: ['unity', 'creative'], art: 'assets/project-aac.webp',
      tags: ['Unity', 'C#', 'AAC'],
      description: '편의점·약국·식당처럼 익숙한 장면 속에서, AAC 표현을 선택하고 상황에 맞는 반응을 확인하는 Unity 기반 의사소통 학습 프로젝트입니다.',
      role: '학습 흐름 기획 · Unity 상호작용 · 화면 구성',
      points: ['선택 → 상황 속 반응 → 결과 확인의 학습 루프', '한 화면에 한 가지 선택을 두는 UI 설계', '재시도를 돕는 피드백과 일상 장면 기반 학습'],
      note: '연결된 Notion 문서는 기획·설계 중심의 기록입니다. 최신 AI 대화·립싱크 구현 현황은 이 페이지에서 완료로 단정하지 않았습니다.',
      notion: 'https://app.notion.com/p/3678e7bb5770836ebaa8811cda4984c2'
    },
    {
      id: 'still', number: '03', title: 'STILL', subtitle: '바닷속에서 만나는 VR 해양생물 도감',
      category: 'UNITY · AI', filters: ['unity', 'ai', 'creative'], art: 'assets/project-world.webp',
      tags: ['Unity', 'Gemini', 'VR'],
      description: '가상 아쿠아리움 속에서 해양생물을 만나고 탐색하는 VR 도감 프로젝트입니다. 공간 상호작용과 AI·네이티브 연동을 함께 다룹니다.',
      role: 'Unity 공간 상호작용 · 시뮬레이션 · AI 연동',
      points: ['VR 이동·보트 탑승과 월드 UI', '보이드 군집 시뮬레이션과 이웃 탐색', 'Gemini REST·한국어 TTS 연동'],
      note: '노션 포트폴리오의 기술별 구현 범위를 요약했습니다. 실제 시연과 세부 기록은 원문에서 확인할 수 있습니다.',
      notion: 'https://app.notion.com/p/3d48e7bb577081f4bd06ff765a08f616'
    },
    {
      id: 'humanbody', number: '04', title: '인체탐험 VR', subtitle: '소화기관을 직접 탐험하는 몰입형 학습',
      category: 'UNITY · XR', filters: ['unity', 'creative'], art: 'assets/project-world-tall.webp',
      tags: ['Unity', 'C#', 'XR'],
      description: '소화기관을 주제로, 공간을 이동하고 장면과 상호작용하며 학습하는 VR 콘텐츠 프로젝트입니다.',
      role: 'XR 상호작용 · 씬 흐름 · 공간 연출',
      points: ['다중 씬 전환과 페이드 동기화', 'VR 이동·월드 UI 상호작용', 'URP·셰이더를 활용한 공간 연출'],
      note: '노션 포트폴리오에 기록된 범위의 소개입니다. 프로젝트별 구현 세부사항은 연결된 문서를 참고하세요.',
      notion: 'https://app.notion.com/p/04f8e7bb5770828e9d6481d3dac5d137'
    },
    {
      id: 'xbit', number: '05', title: 'XBIT', subtitle: '복잡한 Git 제출을 하나의 흐름으로',
      category: 'APP · AUTOMATION', filters: ['web'], art: 'assets/project-automation.webp',
      tags: ['C#', '.NET', 'SQLite'],
      description: 'Git을 몰라도 파일 선택 한 번으로 과제를 제출할 수 있도록, 반복되는 Git 작업을 표준화한 Windows 데스크톱 협업 툴입니다.',
      role: '개인 프로젝트 · UI·데이터·GitHub 연동',
      points: ['파일 선택부터 브랜치·커밋·푸시까지 이어지는 제출 흐름', 'SQLite 기반 제출 이력과 과제 관리', '팀 태스크·역할 관리와 런타임 테마 전환'],
      note: '원문에 기록된 기능을 요약했습니다. 보안 수준이나 서비스 운영 성과에 관한 추가 주장은 넣지 않았습니다.',
      notion: 'https://app.notion.com/p/2c18e7bb577082deaacf81f959a1d8d4'
    }
  ]
});
