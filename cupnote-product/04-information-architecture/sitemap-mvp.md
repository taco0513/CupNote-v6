# Sitemap - MVP Version

CupNote v6.0.0 MVP의 간소화된 정보 구조

## 📱 MVP Navigation Structure

```
CupNote MVP
│
├── 🏠 홈 (Home)
│   ├── 오늘의 커피 통계
│   ├── 최근 기록 (3개)
│   ├── 이번 주 목표
│   └── [+ 새 기록] 버튼
│
├── ✍️ 새 기록 (New Record)
│   ├── 모드 선택
│   │   ├── ☕ Cafe Mode
│   │   └── 🏠 HomeCafe Mode
│   │
│   ├── Cafe Mode Flow (6단계 + 결과)
│   │   ├── 1. 모드 선택
│   │   ├── 2. 커피 정보
│   │   ├── 3. 카페 정보
│   │   ├── 4. 맛 평가
│   │   ├── 5. 최종 리뷰
│   │   ├── 6. 저장
│   │   └── 결과: 커뮤니티 통계
│   │
│   └── HomeCafe Mode Flow (5단계)
│       ├── 1. 원두 정보
│       ├── 2. 레시피 설정
│       ├── 3. 추출 과정
│       ├── 4. 맛 평가
│       └── 5. 저장
│
├── 📚 내 기록 (My Records)
│   ├── 전체 기록 목록
│   ├── 필터 (날짜, 모드)
│   ├── 검색
│   └── 기록 상세 보기
│
├── 🌍 탐색 (Explore) - 간소화
│   ├── 최근 공개 기록
│   ├── 인기 커피
│   └── 커피별 통계
│
├── 👤 프로필 (Profile)
│   ├── 내 정보
│   ├── 통계 요약
│   ├── 획득 배지
│   └── 설정
│
└── ⚙️ 설정 (Settings)
    ├── 계정 관리
    ├── 기록 설정
    ├── 알림 설정
    └── 앱 정보
```

## 🚫 MVP에서 제외된 페이지

```
❌ 소셜 피드
❌ 팔로워/팔로잉 목록
❌ 레시피 공유 페이지
❌ 커뮤니티 챌린지
❌ 리더보드
❌ 상세 매치 분석
❌ Q&A 섹션
❌ 이벤트 페이지
```

## 📊 Page Priority

### P0 - Critical (Week 1-2)
- 홈
- 새 기록 (Cafe/HomeCafe Mode)
- 내 기록
- 기본 설정

### P1 - Important (Week 3-4)
- 프로필
- 탐색 (공개 기록)
- 커뮤니티 통계
- 배지 시스템

### P2 - Nice to Have (Week 5-6)
- 상세 통계
- 검색 기능
- 데이터 내보내기

## 🔀 User Flow (MVP)

### 신규 사용자
```
앱 시작
  ↓
회원가입
  ↓
간단 온보딩 (3 스텝)
  ↓
홈 화면
  ↓
첫 기록 유도
```

### 기존 사용자
```
앱 시작
  ↓
홈 화면
  ↓
[새 기록] or [내 기록]
```

### 기록 플로우
```
새 기록 버튼
  ↓
모드 선택
  ↓
단계별 입력 (6 or 5 단계)
  ↓
저장
  ↓
커뮤니티 통계 (Cafe Mode)
  ↓
홈으로
```

## 🎯 Navigation Rules

### Bottom Navigation (5 tabs)
```
[홈] [탐색] [+기록] [내기록] [프로필]
```

### Header Actions
- 홈: 알림 아이콘만
- 내 기록: 검색 아이콘
- 프로필: 설정 아이콘

### Back Navigation
- 모든 하위 페이지는 뒤로가기 가능
- 기록 중에는 "나가기 확인" 다이얼로그

## 📱 Screen Count

### MVP Total: ~20 screens
- 온보딩: 3
- 홈: 1
- Cafe Mode: 7 (6 steps + result)
- HomeCafe Mode: 5
- 내 기록: 2 (list + detail)
- 탐색: 1
- 프로필: 1
- 설정: 4

### Full Version: 50+ screens
- MVP의 2.5배 이상 복잡도

## 🔗 Deep Links (MVP)

```
mycupnote://home
mycupnote://record/cafe
mycupnote://record/homecafe
mycupnote://my-records
mycupnote://profile
```

## 📊 Analytics Events (MVP)

### Critical Events
- `app_open`
- `signup_complete`
- `record_start`
- `record_complete`
- `record_public_toggle`

### Important Events
- `mode_select`
- `achievement_unlock`
- `profile_view`
- `community_stats_view`

## 🚀 Post-MVP Expansion

### Phase 2 Additions
- Follow system pages
- Activity feed
- Enhanced search
- Like/comment features

### Phase 3 Additions
- Recipe sharing
- Challenges
- Leaderboards
- Advanced analytics