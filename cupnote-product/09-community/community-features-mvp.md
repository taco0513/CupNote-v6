# 커뮤니티 기능 - MVP (Phase 1)

## 개요
개인 프로젝트 MVP를 위한 **최소한의 커뮤니티 기능**

## Phase 1 핵심 기능 (1-2개월)

### 1. 공개 프로필
```
┌─────────────────────────────────┐
│ 👤 사용자 프로필                 │
│                                 │
│ coffee_lover_92                 │
│                                 │
│ 📊 활동 통계                    │
│ • 총 기록: 45개                 │
│ • 평균 평점: ⭐ 4.2            │
│ • 가입일: 2025.08.01            │
│                                 │
│ 최근 공개 기록:                 │
│ • 에티오피아 예가체페 ⭐4       │
│ • 콜롬비아 게이샤 ⭐5           │
│ • 케냐 AA ⭐4                   │
└─────────────────────────────────┘
```

### 2. 기록 공개/비공개 설정
```
기록 저장 시:
☑ 다른 사용자에게 공개
   (커뮤니티 통계에 포함됩니다)
```

### 3. 커뮤니티 통계
```
┌─────────────────────────────────┐
│ 📈 이 커피의 커뮤니티 데이터     │
│                                 │
│ 에티오피아 예가체페 G1           │
│                                 │
│ 👥 12명이 기록했어요            │
│ ⭐ 평균 평점: 4.2 / 5.0        │
│                                 │
│ 🏆 첫 기록자: @coffee_master    │
│ 📅 최근 기록: 2시간 전          │
└─────────────────────────────────┘
```

### 4. 공개 기록 탐색
```
┌─────────────────────────────────┐
│ 🌍 최근 공개 기록               │
│                                 │
│ @user1 • 방금 전               │
│ 파나마 게이샤 ⭐⭐⭐⭐⭐        │
│ 블루보틀 성수                   │
│                                 │
│ @user2 • 1시간 전              │
│ 콜롬비아 핑크버번 ⭐⭐⭐⭐      │
│ HomeCafe - V60                  │
│                                 │
│ [더 보기]                       │
└─────────────────────────────────┘
```

## 제거/연기된 기능

### ❌ Phase 1에서 제외된 기능들

#### 소셜 네트워크
- 팔로우/언팔로우 시스템
- 활동 피드/타임라인
- 좋아요/댓글
- 공유 기능

#### 커뮤니티 활동
- 블라인드 커핑
- 레시피 공유
- Q&A 섹션
- 토론 스레드
- 커뮤니티 위키

#### 이벤트 & 챌린지
- 월간 챌린지
- 오프라인 모임
- 시즌 이벤트
- 리더보드

#### 평판 시스템
- 레벨 시스템
- 포인트 누적
- 특별 권한
- 기여도 측정

#### 고급 기능
- 실시간 알림
- 콘텐츠 모더레이션
- 신고 시스템
- 추천 알고리즘

## 데이터 구조 (단순화)

### User Profile
```typescript
interface UserProfile {
  id: string;
  username: string;
  totalRecords: number;
  publicRecords: number;
  averageRating: number;
  joinedAt: Date;
}
```

### Public Record
```typescript
interface PublicRecord {
  id: string;
  userId: string;
  username: string;
  coffeeName: string;
  cafeName?: string;
  rating: number;
  createdAt: Date;
}
```

## 기술 구현 (단순화)

### 필요한 API
```
GET  /api/users/:id/profile    - 공개 프로필 조회
GET  /api/records/public       - 공개 기록 목록
GET  /api/coffee/stats         - 커피별 통계
POST /api/records              - 기록 생성 (공개/비공개)
```

### 데이터베이스
```sql
-- 최소 필요 테이블
users (id, username, created_at)
records (id, user_id, coffee_info, rating, is_public, created_at)
coffee_stats (coffee_id, total_count, avg_rating, first_recorder)
```

## Phase 2 계획 (3-4개월 후)

### 추가 예정 기능
1. **기본 소셜**
   - 팔로우 시스템
   - 간단한 활동 피드
   - 좋아요 기능

2. **개선된 매칭**
   - 맛 프로필 비교
   - 간단한 매치 점수

3. **기본 상호작용**
   - 공개 기록에 반응
   - 간단한 메시지

## Phase 3 계획 (6개월 후)

### 고급 커뮤니티
- 레시피 공유
- 커뮤니티 챌린지
- 평판 시스템
- Q&A 섹션

## MVP 개발 우선순위

1. **필수 (Week 1-2)**
   - 공개/비공개 설정
   - 커피별 통계 표시
   - 공개 프로필 페이지

2. **중요 (Week 3-4)**
   - 공개 기록 탐색
   - 첫 기록자 표시
   - 기본 검색

3. **선택 (Week 5-6)**
   - 프로필 커스터마이징
   - 통계 시각화
   - 성취 배지 (단순)