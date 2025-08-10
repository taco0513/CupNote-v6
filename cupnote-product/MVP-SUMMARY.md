# CupNote v6.0.0 MVP 요약

## 🎯 MVP 범위 정의

### 핵심 원칙
- **개인 프로젝트**로 1-2개월 내 출시 가능한 범위
- **복잡한 커뮤니티 기능 제외**, 개인 기록에 집중
- **단계적 확장** 가능한 구조

## ✅ Phase 1 MVP 기능 (1-2개월)

### 1. 핵심 기록 시스템
#### Cafe Mode (6단계)
1. 모드 선택
2. 커피 정보 입력
3. 카페 정보 입력
4. 맛 평가 (SCA Flavor Wheel 기반)
5. 최종 리뷰
6. 커뮤니티 통계 표시

#### HomeCafe Mode (5단계)
1. 원두 정보
2. 레시피 설정
3. 추출 과정 (타이머)
4. 맛 평가
5. 저장

### 2. 최소 커뮤니티 기능
- **통계만 표시**: "12명이 이 커피를 마셨어요, 평균 ⭐4.2"
- **공개/비공개**: 기록 공개 여부 선택
- **공개 프로필**: 기록 수, 평균 평점만
- **공개 기록 탐색**: 최근 공개된 기록 보기

### 3. 심플 게이미피케이션
- **개인 통계**: 총 기록, 월간 기록, 평균 평점
- **기본 배지**: 기록 수 기반 (10잔, 50잔, 100잔)
- **연속 기록**: 3일, 7일, 30일 스트릭
- **월간 요약**: 자동 생성 리포트

### 4. 기본 기능
- **검색**: 커피, 카페 검색
- **내 기록**: 개인 기록 관리
- **설정**: 프로필, 알림, 데이터 관리

## ❌ Phase 1에서 제외 (향후 추가)

### 커뮤니티
- 팔로우/언팔로우 시스템
- 활동 피드/타임라인
- 좋아요/댓글
- 매치 점수 계산
- 레시피 공유
- Q&A, 토론

### 게이미피케이션
- 레벨 시스템
- 포인트 경제
- 리더보드
- 챌린지/이벤트
- 친구 대결

### 고급 기능
- 실시간 알림
- 콘텐츠 모더레이션
- 추천 알고리즘
- 외부 SNS 공유

## 🛠 기술 스택 (권장)

### Frontend
```yaml
Framework: Next.js 14 + TypeScript
Styling: Tailwind CSS
State: Zustand
PWA: next-pwa
iOS Build: Capacitor
```

### Backend
```yaml
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
Storage: Supabase Storage
API: Next.js API Routes
```

### Deployment
```yaml
Hosting: Vercel
Domain: mycupnote.com
Admin: mycupnote.com/admin
App: app.mycupnote.com (PWA)
```

## 📊 데이터 모델 (단순화)

### 핵심 테이블
```sql
-- 사용자
users (
  id, username, email, created_at
)

-- 커피 기록
records (
  id, user_id, mode, coffee_name, roastery,
  cafe_name, rating, taste_notes, 
  is_public, created_at
)

-- 커피 통계
coffee_stats (
  coffee_identifier, total_count, 
  avg_rating, first_recorder
)

-- 사용자 통계
user_stats (
  user_id, total_records, avg_rating,
  current_streak, badges
)
```

## 🚀 개발 로드맵

### Phase 1 (MVP) - 1-2개월
- Week 1-2: 기본 설정, 인증, DB
- Week 3-4: 기록 시스템 (Cafe/HomeCafe Mode)
- Week 5-6: 최소 커뮤니티, 게이미피케이션
- Week 7-8: PWA, 테스트, 배포

### Phase 2 - 3-4개월 후
- 기본 소셜 (팔로우, 피드)
- 개선된 매칭
- 레벨/포인트 시스템

### Phase 3 - 6개월 후
- 레시피 공유
- 커뮤니티 챌린지
- 고급 분석

## 📱 배포 전략

1. **PWA 먼저**: app.mycupnote.com
2. **iOS TestFlight**: 100-200명 베타
3. **정식 출시**: App Store
4. **Android**: PWA로 대응

## 🎯 MVP 성공 지표

- 일일 활성 사용자: 30%
- 주간 재방문율: 60%
- 평균 기록 수: 주 3회
- 공개 기록 비율: 50%

## 📝 중요 결정 사항

1. **환경 평가 제거**: 커피 맛에만 집중
2. **SNS 공유 제거**: 커뮤니티 내부만
3. **복잡한 매칭 연기**: 단순 통계만
4. **비즈니스 모델 연기**: 개인 프로젝트

---

*이 문서는 CupNote v6.0.0 MVP의 범위를 명확히 정의합니다.*
*복잡한 기능은 과감히 제외하고 핵심 가치에 집중합니다.*