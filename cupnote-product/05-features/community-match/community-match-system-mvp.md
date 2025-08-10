# 커뮤니티 매치 시스템 - MVP (Phase 1)

## 시스템 개요
같은 커피를 마신 사용자 수와 평균 평점을 보여주는 **단순한** 커뮤니티 기능

## MVP 핵심 기능

### 1. 기본 정보만 표시
```
┌─────────────────────────────────┐
│     에티오피아 예가체페 G1        │
│       블루보틀 성수점             │
│                                 │
│    👥 12명이 마셨어요            │
│    ⭐ 평균 4.2 / 5.0            │
│                                 │
│    내 평점: ⭐ 4.0              │
└─────────────────────────────────┘
```

### 2. 매칭 기준 (단순화)
- **Cafe Mode**: 카페 + 커피 이름
- **HomeCafe Mode**: 원두 이름 + 로스터리

### 3. 특별 케이스
```
첫 번째 기록자:
"🌟 첫 번째로 기록하셨어요!"

데이터 부족 (1-2명):
"아직 충분한 데이터가 없어요"
```

## 제거된 기능 (Phase 2+로 연기)

### ❌ Phase 1에서 제외
- 복잡한 매치 점수 계산 알고리즘
- 맛 프로필 비교
- 키워드 매칭
- 다른 사용자 리뷰 표시
- 매치 기반 추천
- 취향 비슷한 사람 찾기
- 매치 스트릭
- 실시간 업데이트

### ✅ Phase 1에 포함
- 참여자 수 표시
- 평균 평점 표시
- 첫 기록자 표시
- 기본 프라이버시 (공개/비공개)

## 데이터 구조 (단순화)

### Coffee Record
```typescript
interface CoffeeRecord {
  id: string;
  userId: string;
  coffeeName: string;
  roastery?: string;
  cafeName?: string;
  rating: number;  // 1-5
  isPublic: boolean;  // 공개/비공개
  createdAt: Date;
}
```

### Community Summary
```typescript
interface CommunitySummary {
  coffeeIdentifier: string;  // "카페+커피" or "원두+로스터리"
  totalCount: number;
  averageRating: number;
  isFirstRecorder: boolean;
}
```

## 화면 플로우

### 기록 완료 후 표시
```
기록 저장
    ↓
커뮤니티 데이터 조회
    ↓
결과 표시 (참여자 수, 평균 평점)
    ↓
홈으로 이동
```

## 향후 확장 계획

### Phase 2 (3-4개월 후)
- 간단한 매치 점수 추가
- 맛 프로필 비교
- 다른 사용자 공개 기록 보기

### Phase 3 (6개월 후)
- 전체 매치 알고리즘
- 추천 시스템
- 소셜 기능 (팔로우, 피드)