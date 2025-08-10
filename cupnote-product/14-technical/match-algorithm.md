# CupNote 매치 점수 알고리즘

## 개요
사용자의 테이스팅 기록과 로스터/타인의 기록을 비교하여 매치 점수를 계산하는 알고리즘 정의

---

## 1. 매치 점수 구성 요소

### 가중치 배분
```typescript
interface MatchScoreWeights {
  flavorMatch: 0.40,      // 40% - 향미 프로필 일치도
  sensoryMatch: 0.30,     // 30% - 감각 표현 유사도
  mouthfeelMatch: 0.20,   // 20% - 마우스필 유사도
  overallRating: 0.10     // 10% - 전체 평점 차이
}
```

### 점수 범위
- **최종 점수**: 0-100%
- **표시 형식**: "87% 일치"
- **등급 분류**:
  - 90-100%: "완벽한 매치 🎯"
  - 80-89%: "매우 유사 💚"
  - 70-79%: "유사함 💛"
  - 60-69%: "약간 다름 🟠"
  - 0-59%: "많이 다름 ⚪"

---

## 2. 향미 프로필 매치 (40%)

### 2.1 Jaccard 유사도 기반 계산

```typescript
interface FlavorMatchCalculation {
  /**
   * Jaccard Similarity Index
   * 교집합 / 합집합
   */
  calculate: (roasterFlavors: string[], userFlavors: string[]) => {
    const intersection = roasterFlavors.filter(x => 
      userFlavors.includes(x)
    );
    const union = [...new Set([...roasterFlavors, ...userFlavors])];
    
    // 기본 Jaccard 계산
    const jaccardScore = intersection.length / union.length;
    
    // 가중치 적용 (카테고리별)
    const weightedScore = calculateWeightedFlavor(
      intersection,
      union
    );
    
    return weightedScore * 100; // 0-100 범위
  }
}
```

### 2.2 카테고리별 가중치

```typescript
const flavorCategoryWeights = {
  // Primary Notes (주요 향미) - 높은 가중치
  fruity: 1.2,        // 과일류
  chocolate: 1.2,     // 초콜릿/코코아
  nutty: 1.1,        // 견과류
  
  // Secondary Notes (부가 향미) - 중간 가중치
  floral: 1.0,        // 꽃
  spices: 1.0,        // 향신료
  sweet: 1.0,         // 단맛
  
  // Tertiary Notes (미세 향미) - 낮은 가중치
  vegetal: 0.8,       // 식물성
  other: 0.8,         // 기타
  roasted: 0.9        // 로스팅
};
```

### 2.3 부분 매치 처리

```typescript
interface PartialFlavorMatch {
  // 유사 향미 그룹 정의
  similarGroups: {
    citrus: ['lemon', 'lime', 'orange', 'grapefruit'],
    berry: ['strawberry', 'blueberry', 'raspberry', 'blackberry'],
    chocolate: ['dark chocolate', 'milk chocolate', 'cocoa'],
    nutty: ['almond', 'hazelnut', 'walnut', 'peanut']
  },
  
  // 부분 점수 부여
  partialScore: (flavor1: string, flavor2: string) => {
    if (inSameGroup(flavor1, flavor2)) {
      return 0.7; // 70% 점수
    }
    if (inRelatedCategory(flavor1, flavor2)) {
      return 0.4; // 40% 점수
    }
    return 0;
  }
}
```

---

## 3. 감각 표현 매치 (30%)

### 3.1 벡터 거리 기반 계산

```typescript
interface SensoryMatchCalculation {
  /**
   * 한국어 감각 표현 그리드 (6x7 = 42개)
   * 각 표현을 벡터로 변환 후 코사인 유사도 계산
   */
  calculate: (roasterExpressions: string[], userExpressions: string[]) => {
    // 각 표현을 6차원 벡터로 변환
    const roasterVector = expressionsToVector(roasterExpressions);
    const userVector = expressionsToVector(userExpressions);
    
    // 코사인 유사도 계산
    const cosineSimilarity = calculateCosine(roasterVector, userVector);
    
    return cosineSimilarity * 100; // 0-100 범위
  }
}
```

### 3.2 감각 차원 매핑

```typescript
const sensoryDimensions = {
  acidity: {
    expressions: ['밝은', '톡쏘는', '시큼한', '상큼한', '날카로운', '부드러운', '둔한'],
    vectorIndex: 0,
    weight: 1.2
  },
  sweetness: {
    expressions: ['달콤한', '은은한', '진한', '캐러멜같은', '꿀같은', '과일같은', '설탕같은'],
    vectorIndex: 1,
    weight: 1.1
  },
  bitterness: {
    expressions: ['쓴', '탄', '스모키한', '다크한', '진한', '가벼운', '깔끔한'],
    vectorIndex: 2,
    weight: 1.0
  },
  body: {
    expressions: ['묵직한', '크리미한', '실키한', '가벼운', '투명한', '진득한', '부드러운'],
    vectorIndex: 3,
    weight: 1.0
  },
  aftertaste: {
    expressions: ['긴', '짧은', '깔끔한', '여운있는', '드라이한', '스윗한', '클린한'],
    vectorIndex: 4,
    weight: 0.9
  },
  balance: {
    expressions: ['균형잡힌', '조화로운', '복합적인', '단순한', '일관된', '변화하는', '안정적인'],
    vectorIndex: 5,
    weight: 0.8
  }
};
```

---

## 4. 마우스필 매치 (20%)

### 4.1 유클리드 거리 계산

```typescript
interface MouthfeelMatchCalculation {
  /**
   * 6개 메트릭 (1-5 스케일)
   * 정규화된 유클리드 거리 사용
   */
  calculate: (roasterMetrics: number[], userMetrics: number[]) => {
    // 각 메트릭 차이의 제곱합
    const euclideanDistance = Math.sqrt(
      roasterMetrics.reduce((sum, val, i) => 
        sum + Math.pow(val - userMetrics[i], 2), 0
      )
    );
    
    // 최대 거리로 정규화 (0-1 범위)
    const maxDistance = Math.sqrt(6 * Math.pow(4, 2)); // 최대 차이
    const normalizedDistance = euclideanDistance / maxDistance;
    
    // 유사도로 변환 (거리의 역)
    const similarity = 1 - normalizedDistance;
    
    return similarity * 100; // 0-100 범위
  }
}
```

### 4.2 메트릭별 가중치

```typescript
const mouthfeelWeights = {
  body: 1.2,        // 바디감 - 가장 중요
  acidity: 1.1,     // 산미
  sweetness: 1.1,   // 단맛
  finish: 1.0,      // 피니시
  bitterness: 0.9,  // 쓴맛
  balance: 0.8      // 밸런스
};
```

---

## 5. 전체 평점 차이 (10%)

### 5.1 선형 차이 계산

```typescript
interface RatingMatchCalculation {
  /**
   * 5점 만점 평점 차이
   */
  calculate: (roasterRating: number, userRating: number) => {
    const difference = Math.abs(roasterRating - userRating);
    
    // 차이에 따른 점수
    const scoreMap = {
      0.0: 100,  // 동일
      0.5: 90,   // 0.5점 차이
      1.0: 70,   // 1점 차이
      1.5: 50,   // 1.5점 차이
      2.0: 30,   // 2점 차이
      2.5: 10,   // 2.5점 차이
      3.0: 0     // 3점 이상 차이
    };
    
    return scoreMap[difference] || 0;
  }
}
```

---

## 6. 최종 점수 계산

### 6.1 가중 합산

```typescript
export const calculateFinalMatchScore = (
  comparison: TastingComparison
): MatchScore => {
  const { roaster, user } = comparison;
  
  // 각 요소별 점수 계산
  const flavorScore = calculateFlavorMatch(
    roaster.flavors, 
    user.flavors
  );
  
  const sensoryScore = calculateSensoryMatch(
    roaster.sensoryExpressions,
    user.sensoryExpressions
  );
  
  const mouthfeelScore = calculateMouthfeelMatch(
    roaster.mouthfeel,
    user.mouthfeel
  );
  
  const ratingScore = calculateRatingMatch(
    roaster.overallRating,
    user.overallRating
  );
  
  // 가중 합산
  const finalScore = 
    flavorScore * 0.40 +
    sensoryScore * 0.30 +
    mouthfeelScore * 0.20 +
    ratingScore * 0.10;
  
  return {
    total: Math.round(finalScore),
    breakdown: {
      flavor: Math.round(flavorScore),
      sensory: Math.round(sensoryScore),
      mouthfeel: Math.round(mouthfeelScore),
      rating: Math.round(ratingScore)
    },
    grade: getMatchGrade(finalScore),
    message: getMatchMessage(finalScore)
  };
};
```

### 6.2 결과 메시지

```typescript
const getMatchMessage = (score: number): string => {
  if (score >= 90) {
    return "와! 거의 똑같은 맛을 느끼셨네요! 🎯";
  } else if (score >= 80) {
    return "매우 비슷한 테이스팅 프로필이에요! 💚";
  } else if (score >= 70) {
    return "비슷한 부분이 많네요! 💛";
  } else if (score >= 60) {
    return "조금씩 다르게 느끼셨네요 🟠";
  } else {
    return "각자의 개성이 뚜렷하네요! ⚪";
  }
};
```

---

## 7. 특수 케이스 처리

### 7.1 데이터 누락 처리

```typescript
interface MissingDataHandling {
  // 누락 데이터별 대체 전략
  strategies: {
    missingFlavors: {
      action: 'skip',
      weightRedistribution: true,
      message: "향미 데이터 없음"
    },
    missingSensory: {
      action: 'useDefault',
      defaultValue: 50,
      message: "감각 표현 미입력"
    },
    missingMouthfeel: {
      action: 'skip',
      weightRedistribution: true,
      message: "마우스필 건너뜀"
    },
    missingRating: {
      action: 'useAverage',
      defaultValue: 3.5,
      message: "평점 미입력"
    }
  }
}
```

### 7.2 가중치 재분배

```typescript
const redistributeWeights = (
  missingComponents: string[]
): AdjustedWeights => {
  const originalWeights = {
    flavor: 0.40,
    sensory: 0.30,
    mouthfeel: 0.20,
    rating: 0.10
  };
  
  // 누락된 컴포넌트의 가중치를 나머지에 비례 분배
  const totalMissingWeight = missingComponents.reduce(
    (sum, comp) => sum + originalWeights[comp], 0
  );
  
  const activeComponents = Object.keys(originalWeights)
    .filter(k => !missingComponents.includes(k));
  
  const adjustedWeights = {};
  const totalActiveWeight = 1 - totalMissingWeight;
  
  activeComponents.forEach(comp => {
    adjustedWeights[comp] = 
      originalWeights[comp] / totalActiveWeight;
  });
  
  return adjustedWeights;
};
```

---

## 8. 성능 최적화

### 8.1 캐싱 전략

```typescript
interface MatchScoreCache {
  // 캐시 키 생성
  generateKey: (roasterId: string, userId: string, coffeeId: string) => {
    return `match_${roasterId}_${userId}_${coffeeId}`;
  },
  
  // 캐시 유효기간
  ttl: 3600 * 24, // 24시간
  
  // 캐시 무효화 조건
  invalidateOn: [
    'userTastingUpdate',
    'roasterProfileUpdate',
    'algorithmVersionChange'
  ]
}
```

### 8.2 배치 처리

```typescript
const calculateBatchMatchScores = async (
  comparisons: TastingComparison[]
): Promise<MatchScore[]> => {
  // 병렬 처리 (최대 10개씩)
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < comparisons.length; i += batchSize) {
    const batch = comparisons.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(comp => calculateFinalMatchScore(comp))
    );
    results.push(...batchResults);
  }
  
  return results;
};
```

---

## 9. UI 표시 예제

### 9.1 매치 점수 카드

```typescript
interface MatchScoreDisplay {
  // 메인 점수
  mainScore: {
    value: 87,
    label: "87% 일치",
    color: "#4CAF50", // 녹색
    icon: "💚"
  },
  
  // 세부 점수
  breakdown: {
    flavor: { score: 92, label: "향미 프로필" },
    sensory: { score: 85, label: "감각 표현" },
    mouthfeel: { score: 78, label: "마우스필" },
    rating: { score: 90, label: "전체 평점" }
  },
  
  // 시각화
  visualization: {
    type: "radar", // 레이더 차트
    animated: true,
    showComparison: true
  }
}
```

### 9.2 커뮤니티 비교

```typescript
interface CommunityComparison {
  // 나 vs 평균
  myScore: 87,
  averageScore: 72,
  percentile: 85, // 상위 15%
  
  // 메시지
  message: "평균보다 15% 더 비슷하게 느끼셨어요!",
  
  // 유사한 사용자
  similarUsers: [
    { userId: "user1", matchScore: 89, nickname: "커피러버" },
    { userId: "user2", matchScore: 86, nickname: "홈카페마스터" }
  ]
}
```

---

## 10. 테스트 케이스

### 10.1 단위 테스트

```typescript
describe('MatchAlgorithm', () => {
  test('완벽한 일치는 100점', () => {
    const result = calculateFlavorMatch(
      ['chocolate', 'nutty'],
      ['chocolate', 'nutty']
    );
    expect(result).toBe(100);
  });
  
  test('전혀 다른 경우 0점', () => {
    const result = calculateFlavorMatch(
      ['chocolate', 'nutty'],
      ['fruity', 'floral']
    );
    expect(result).toBe(0);
  });
  
  test('부분 일치 처리', () => {
    const result = calculateFlavorMatch(
      ['dark chocolate', 'almond'],
      ['milk chocolate', 'hazelnut']
    );
    expect(result).toBeGreaterThan(40);
    expect(result).toBeLessThan(80);
  });
});
```

---

## 11. 버전 관리

```typescript
interface AlgorithmVersion {
  current: "1.0.0",
  history: [
    {
      version: "1.0.0",
      date: "2025-08-08",
      changes: "초기 알고리즘 구현"
    }
  ],
  
  // 버전별 가중치 변경 추적
  weightHistory: {
    "1.0.0": {
      flavor: 0.40,
      sensory: 0.30,
      mouthfeel: 0.20,
      rating: 0.10
    }
  }
}
```

---

## 12. 향후 개선 사항

### Phase 1: 기본 구현 (MVP)
- Jaccard 유사도 기반 향미 매칭
- 간단한 거리 계산
- 기본 가중치 적용

### Phase 2: 고도화 (v1.1)
- 머신러닝 기반 가중치 최적화
- 사용자 피드백 반영
- 협업 필터링 적용

### Phase 3: AI 적용 (v2.0)
- 딥러닝 기반 향미 임베딩
- 개인화된 매칭 알고리즘
- 실시간 학습 및 개선

---

*작성일: 2025-08-08*