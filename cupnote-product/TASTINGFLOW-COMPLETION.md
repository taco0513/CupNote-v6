# TastingFlow 로직 완성도 분석 (90% → 100%)

## 📊 현재 완성도: 90%

### ✅ 잘 정의된 부분 (90%)

#### 1. 핵심 플로우 구조 ✨
- **Cafe Mode**: 6단계 명확히 정의
- **HomeCafe Mode**: 7단계 (BrewSetup 포함)
- **Progressive Disclosure**: 필수/선택 정보 구분
- **진행률 계산**: 단계별 퍼센트 명시

#### 2. 데이터 구조 📊
- **CoffeeInfo**: Cascade Autocomplete 로직
- **FlavorSelection**: 85개 향미, 3단계 계층
- **SensoryExpression**: 44개 한국어 표현 체계
- **SensoryMouthFeel**: 6개 항목, 1-5점 척도

#### 3. 사용자 경험 🎯
- **시간 예측**: 각 단계별 소요시간
- **건너뛰기 옵션**: SensoryMouthFeel
- **자동저장**: 단계별 임시저장

---

## ⚠️ 누락된 10% (보완 필요)

### 1. 🔴 데이터 유효성 검증 로직 (Critical)

#### 현재 상태
```markdown
문제: "필수 입력" 표시만 있고 검증 규칙 없음
```

#### 필요한 정의
```typescript
// 검증 규칙 명세
interface ValidationRules {
  coffeeInfo: {
    coffeeName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[가-힣a-zA-Z0-9\s]+$/,
      errorMessages: {
        required: "커피 이름을 입력해주세요",
        minLength: "최소 2자 이상 입력해주세요",
        pattern: "특수문자는 사용할 수 없습니다"
      }
    },
    roastery: {
      required: true,
      autocompleteMatch: true, // DB에 있는 값만 허용
    }
  },
  flavorSelection: {
    minSelection: 1,
    maxSelection: 10,
    errorMessage: "최소 1개, 최대 10개 향미를 선택해주세요"
  }
}
```

**작업 시간**: 4시간

---

### 2. 🔴 상태 전환 로직 (Critical)

#### 현재 상태
```markdown
문제: 뒤로가기, 임시저장, 이탈 시 데이터 처리 불명확
```

#### 필요한 정의
```typescript
// 상태 전환 다이어그램
stateMachine: {
  states: {
    IDLE: {},
    IN_PROGRESS: {
      on: {
        NEXT: 'SAVE_AND_PROCEED',
        PREVIOUS: 'SAVE_AND_GO_BACK',
        EXIT: 'SHOW_SAVE_DIALOG'
      }
    },
    COMPLETED: {
      on: {
        EDIT: 'IN_PROGRESS',
        NEW: 'IDLE'
      }
    }
  },
  actions: {
    SAVE_AND_PROCEED: async (data) => {
      await saveDraft(data);
      return nextStep();
    },
    SHOW_SAVE_DIALOG: () => {
      return confirm("저장하지 않은 내용이 있습니다. 저장하시겠습니까?");
    }
  }
}
```

**작업 시간**: 6시간

---

### 3. 🟡 BrewSetup 타이머 세부 로직 (Important)

#### 현재 상태
```markdown
문제: "타이머 시작/정지" 언급만 있고 구현 로직 없음
```

#### 필요한 정의
```typescript
// 타이머 구현 명세
interface TimerLogic {
  phases: [
    { name: "Bloom", duration: 30, water: 40 },
    { name: "First Pour", duration: 30, water: 120 },
    { name: "Second Pour", duration: 45, water: 160 },
    { name: "Final Pour", duration: 30, water: 0 }
  ],
  features: {
    vibration: true,  // 단계 전환 시 진동
    sound: true,      // 단계 전환 시 소리
    autoNext: false,  // 자동 다음 단계 진행
    lapTime: true     // 랩타임 기록
  },
  storage: {
    format: "HH:MM:SS",
    data: ["bloomTime", "totalTime", "lapTimes[]"]
  }
}
```

**작업 시간**: 8시간

---

### 4. 🟡 매치 점수 계산 알고리즘 (Important)

#### 현재 상태
```markdown
문제: "XX% 일치" 표시만 있고 계산 방법 없음
```

#### 필요한 정의
```typescript
// 매치 점수 알고리즘
interface MatchScoreAlgorithm {
  weights: {
    flavorMatch: 0.4,      // 40% 가중치
    sensoryMatch: 0.3,     // 30% 가중치
    mouthfeelMatch: 0.2,   // 20% 가중치
    overallRating: 0.1     // 10% 가중치
  },
  
  flavorMatchCalculation: (roaster: string[], user: string[]) => {
    const intersection = roaster.filter(x => user.includes(x));
    const union = [...new Set([...roaster, ...user])];
    return (intersection.length / union.length) * 100;
  },
  
  sensoryMatchCalculation: (roaster: number[], user: number[]) => {
    // 유클리드 거리 기반 유사도
    const distance = Math.sqrt(
      roaster.reduce((sum, val, i) => 
        sum + Math.pow(val - user[i], 2), 0)
    );
    return Math.max(0, 100 - distance * 10);
  }
}
```

**작업 시간**: 6시간

---

### 5. 🟡 오프라인 모드 처리 (Important)

#### 현재 상태
```markdown
문제: "오프라인 모드 지원" 언급만 있음
```

#### 필요한 정의
```typescript
// 오프라인 동기화 전략
interface OfflineStrategy {
  storage: {
    method: "IndexedDB",
    maxSize: "50MB",
    structure: {
      drafts: TastingDraft[],
      completed: TastingRecord[],
      queue: PendingSync[]
    }
  },
  
  sync: {
    trigger: "online" | "manual" | "interval",
    conflictResolution: "server-wins" | "client-wins" | "merge",
    retry: {
      maxAttempts: 3,
      backoff: "exponential"
    }
  },
  
  features: {
    queuedActions: true,
    optimisticUpdate: true,
    backgroundSync: true
  }
}
```

**작업 시간**: 12시간

---

### 6. 🟢 에러 복구 시나리오 (Nice to have)

#### 현재 상태
```markdown
문제: 에러 발생 시 처리 방안 없음
```

#### 필요한 정의
```typescript
// 에러 처리 매트릭스
interface ErrorHandling {
  network: {
    timeout: "재시도 버튼 표시",
    offline: "오프라인 모드 자동 전환",
    500: "서버 오류 메시지, 나중에 다시 시도"
  },
  
  validation: {
    required: "필수 입력 필드 하이라이트",
    format: "올바른 형식 예시 표시",
    range: "유효 범위 안내"
  },
  
  business: {
    duplicate: "이미 기록한 커피입니다. 수정하시겠습니까?",
    notFound: "해당 커피를 찾을 수 없습니다. 새로 추가하시겠습니까?",
    quota: "저장 공간이 부족합니다. 이전 기록을 정리해주세요."
  }
}
```

**작업 시간**: 4시간

---

### 7. 🟢 접근성 지원 (Nice to have)

#### 현재 상태
```markdown
문제: 스크린리더, 키보드 네비게이션 미정의
```

#### 필요한 정의
- ARIA 라벨 정의
- 키보드 단축키 매핑
- 포커스 관리 전략
- 고대비 모드 지원

**작업 시간**: 8시간

---

## 📋 완성을 위한 우선순위

### 🚨 Phase 1: Critical (3일)
1. **데이터 유효성 검증** - 4시간
2. **상태 전환 로직** - 6시간
3. **매치 점수 알고리즘** - 6시간

### ⚡ Phase 2: Important (1주)
4. **BrewSetup 타이머** - 8시간
5. **오프라인 모드** - 12시간
6. **에러 복구** - 4시간

### 💫 Phase 3: Enhancement (2주)
7. **접근성** - 8시간
8. **애니메이션** - 6시간
9. **성능 최적화** - 8시간

---

## 🎯 스마트 완성 전략

### Option A: 완벽주의 접근 (2주)
```
모든 10% 완성 → 개발 시작
장점: 명확한 개발
단점: 시간 소요
```

### Option B: 실용주의 접근 (3일) ⭐
```
Critical 3개만 완성 → 개발 시작 → 병행 완성
장점: 빠른 시작, 유연성
단점: 일부 재작업 가능성
```

### Option C: 애자일 접근 (0일)
```
즉시 개발 → 필요시 정의
장점: 가장 빠름
단점: 혼란 가능성
```

---

## 📝 즉시 실행 가능한 템플릿

### 1. Validation Rules 템플릿
```typescript
// /utils/validation.ts
export const tastingFlowValidation = {
  // 위 검증 규칙 복사
}
```

### 2. State Machine 템플릿
```typescript
// /stores/tastingFlowStore.ts
export const useTastingFlowStore = create((set) => ({
  // 위 상태 머신 복사
}))
```

### 3. Match Algorithm 템플릿
```typescript
// /utils/matchScore.ts
export const calculateMatchScore = (roaster, user) => {
  // 위 알고리즘 복사
}
```

---

## ✅ 결론

**TastingFlow 90% → 100% 완성:**
- **Critical 3개**: 3일 (권장)
- **Important 3개**: 1주 (개발 중 병행)
- **Enhancement 3개**: 2주 (MVP 후)

**권장 방안:**
3일간 Critical만 완성 후 개발 시작하면, 전체 개발 기간 단축 가능!

*작성일: 2025-08-08*