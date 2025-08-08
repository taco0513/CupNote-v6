# 📱 TF_Screen_SensoryMouthFeel

**문서타입**: TastingFlow 화면 설계서  
**화면명**: SensoryMouthFeel 화면 (수치 평가)  
**모드 지원**: 모든 TastingFlow 모드 공통  
**작성일**: 2025-08-01  
**문서상태**: ✅ Lab 모드 제거, 범용화 완료  

---

## 📋 개요 & 목적

**화면 역할**: TastingFlow의 5단계 - 6개 감각 항목 정량적 평가 (선택사항)  
**구현 파일**: `[screens]/tasting/SensoryMouthFeelScreen`  
**소요시간**: 2-3분 (건너뛰기 가능)  
**진행률**: 85% (전체 TastingFlow 중)  

### 주요 목표
- **선택적 수치 평가**: 원하는 사용자만 상세한 1-5 스케일 평가
- 표준화된 평가 기준으로 일관성 확보
- 직관적 슬라이더 UI로 정밀한 평가 지원
- 개인 취향 데이터와 품질 평가 데이터 동시 수집

---

## 🎯 수치 평가 시스템 (객관적 데이터)

### 설계 철학
- **정량적 평가**: 주관적 표현을 보완하는 객관적 수치
- **표준화**: 국제 큐핑 기준 준수로 일관성 확보
- **사용 편의성**: 복잡한 전문 지식 없이도 직관적 평가
- **데이터 호환성**: 글로벌 커피 품질 평가와 호환

### 6개 평가 항목 (SCA 기준 적응)

#### 1. Body (바디감) - 커피의 무게감과 질감
- **1점**: 물 같이 가벼움, 얇은 질감
- **2점**: 약간 가벼운 바디감
- **3점**: 적당한 바디감, 표준적인 무게 (기본값)
- **4점**: 충실한 바디감, 묵직함
- **5점**: 크리미하고 매우 묵직한 바디감

#### 2. Acidity (산미) - 밝고 상쾌한 산미의 강도  
- **1점**: 산미 거의 없음, 평면적
- **2점**: 약한 산미, 은은함
- **3점**: 적당한 산미, 균형감 있음 (기본값)
- **4점**: 좋은 산미, 생동감 있음
- **5점**: 강하고 복잡한 산미, 매우 생동감

#### 3. Sweetness (단맛) - 자연스러운 단맛의 정도
- **1점**: 단맛 부족, 건조함
- **2점**: 약한 단맛, 아쉬움
- **3점**: 은은한 자연 단맛 (기본값)
- **4점**: 풍부한 단맛, 만족스러움
- **5점**: 매우 풍부하고 지속적인 단맛

#### 4. Finish (여운) - 맛이 지속되는 시간과 품질
- **1점**: 여운이 짧고 급격히 사라짐
- **2점**: 짧은 여운, 아쉬움
- **3점**: 적당한 길이의 깔끔한 여운 (기본값)
- **4점**: 길고 좋은 여운, 만족스러움
- **5점**: 매우 길고 복합적인 아름다운 여운

#### 5. Bitterness (쓴맛) - 쓴맛의 강도와 품질
- **1점**: 쓴맛 거의 없음
- **2점**: 약한 쓴맛
- **3점**: 적당하고 균형잡힌 쓴맛 (기본값)
- **4점**: 좋은 쓴맛, 복합적
- **5점**: 강하지만 불쾌하지 않은 고급 쓴맛

#### 6. Balance (밸런스) - 전체적인 조화와 균형
- **1점**: 특정 요소가 과도하게 강함, 불균형
- **2점**: 약간 불균형, 아쉬움
- **3점**: 무난한 균형감 (기본값)
- **4점**: 좋은 균형감, 조화로움
- **5점**: 모든 요소가 완벽하게 조화

---

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (85%) + "수치 평가" + Skip Button
├── 안내 메시지
│   ├── "각 항목을 1-5 스케일로 평가해주세요"
│   ├── "💡 확실하지 않으면 3점(보통)으로 두세요"
│   └── "⏭️ 수치 평가를 원하지 않으면 건너뛸 수 있어요"
├── 평가 항목 (6개 슬라이더)
│   ├── 1️⃣ Body (바디감)
│   │   ├── 슬라이더: 1(가벼움) ←●→ 5(묵직함)
│   │   ├── 현재값: 3.5 표시
│   │   └── 설명: "커피의 무게감과 질감"
│   ├── 2️⃣ Acidity (산미)
│   │   ├── 슬라이더: 1(약함) ←●→ 5(강함)  
│   │   ├── 현재값: 4.0 표시
│   │   └── 설명: "밝고 상쾌한 산미의 강도"
│   ├── 3️⃣ Sweetness (단맛)
│   │   ├── 슬라이더: 1(약함) ←●→ 5(강함)
│   │   ├── 현재값: 3.0 표시  
│   │   └── 설명: "자연스러운 단맛의 정도"
│   ├── 4️⃣ Finish (여운)
│   │   ├── 슬라이더: 1(짧음) ←●→ 5(긺)
│   │   ├── 현재값: 3.5 표시
│   │   └── 설명: "맛이 지속되는 시간과 품질"
│   ├── 5️⃣ Bitterness (쓴맛)
│   │   ├── 슬라이더: 1(약함) ←●→ 5(강함)
│   │   ├── 현재값: 2.5 표시
│   │   └── 설명: "쓴맛의 강도와 품질"
│   └── 6️⃣ Balance (밸런스)
│       ├── 슬라이더: 1(불균형) ←●→ 5(완벽)
│       ├── 현재값: 4.0 표시
│       └── 설명: "전체적인 조화와 균형"
├── 평가 요약 카드
│   ├── 📊 총점: 20.5/30 (평균: 3.4/5)
│   ├── 🔝 강점: Balance (4.0), Acidity (4.0)
│   ├── 🔻 약점: Bitterness (2.5)
│   └── 💬 자동 코멘트: "균형잡힌 커피, 적당한 쓴맛"
├── Skip 옵션
│   └── "수치 평가 건너뛰기" 버튼 (항상 표시)
└── Footer: "다음" Button (평가 완료 또는 건너뛰기)
```

### 핵심 UX 원칙

#### 1. 직관적 슬라이더 시스템
- **1 단위 조정**: 1, 2, 3, 4, 5 형태로 명확한 구분
- **시각적 피드백**: 슬라이더 값 실시간 숫자 + 색상 표시
- **터치 최적화**: 충분한 터치 영역, 햅틱 피드백
- **접근성**: VoiceOver 지원, 색각이상 대응

#### 2. 스마트 기본값 시스템
- **3점 시작**: 모든 항목 3점(보통)으로 시작
- **컨텍스트 기본값**: 이전 한국어 표현 기반 추천값 (Phase 2)
- **개인화**: 사용자 평가 패턴 기반 조정 (Phase 2)

#### 3. 실시간 피드백
- **총점 계산**: 6개 항목 합계 자동 계산 (6-30점)
- **평균 표시**: 평균값 자동 계산 (1-5점)
- **강점/약점**: 최고/최저 점수 항목 자동 하이라이트
- **자동 코멘트**: 점수 패턴 기반 간단 코멘트

#### 4. 건너뛰기 시스템 ⭐**핵심**
- **항상 제공**: 헤더와 하단에 건너뛰기 옵션 제공
- **압박감 없음**: 수치 평가 부담 없이 진행 가능
- **선택적 깊이**: 원하는 사용자만 상세 평가
- **플로우 연속성**: 건너뛰어도 자연스러운 다음 단계 진행

---

## 💾 데이터 처리

### 입력 데이터
```typescript
interface PreviousScreenData {
  // 공통 데이터
  coffee_info: CoffeeInfoData;
  selected_flavors: FlavorChoice[];
  sensory_expression: SensoryExpressionData;
  
  // 모드별 선택적 데이터
  homecafe_data?: HomeCafeData;
}
```

### 출력 데이터
```typescript
interface SensoryMouthFeelData {
  // 필수 6개 항목 (1-5 스케일, 1 단위)
  scores: {
    body: number;              // 바디감 (1: 가벼움 ~ 5: 묵직함)
    acidity: number;           // 산미 (1: 약함 ~ 5: 강함)
    sweetness: number;         // 단맛 (1: 약함 ~ 5: 강함) 
    finish: number;            // 여운 (1: 짧음 ~ 5: 긺)
    bitterness: number;        // 쓴맛 (1: 약함 ~ 5: 강함)
    balance: number;           // 밸런스 (1: 불균형 ~ 5: 완벽)
  };
  
  // 계산 결과
  summary: {
    total_score: number;       // 총점 (6-30)
    average_score: number;     // 평균 (1-5)
    highest_scoring: SensoryItem[];  // 최고점 항목들
    lowest_scoring: SensoryItem[];   // 최저점 항목들
    auto_comment: string;      // 자동 생성 코멘트
  };
  
  // 메타데이터
  evaluation_time: number;     // 평가 소요 시간 (초)
  adjustment_count: number;    // 슬라이더 조정 횟수
  evaluation_timestamp: Date;
  evaluation_method: 'slider_scale' | 'skipped'; // 평가 방법 표시
  was_skipped: boolean;        // 건너뛰기 여부
}

interface SensoryItem {
  category: SensoryCategorySlider;
  score: number;
  label: string;
}

enum SensoryCategorySlider {
  BODY = 'body',
  ACIDITY = 'acidity',
  SWEETNESS = 'sweetness', 
  FINISH = 'finish',
  BITTERNESS = 'bitterness',
  BALANCE = 'balance'
}
```

### 기본값 설정
```typescript
const DEFAULT_SCORES = {
  body: 3.0,        // 중간값으로 시작
  acidity: 3.0,
  sweetness: 3.0,
  finish: 3.0,
  bitterness: 3.0,
  balance: 3.0,
};

// 자동 코멘트 생성 로직
const generateAutoComment = (scores: SensoryScores): string => {
  const avg = (Object.values(scores).reduce((sum, score) => sum + score, 0)) / 6;
  const highest = Object.entries(scores).sort(([,a], [,b]) => b - a)[0];
  const lowest = Object.entries(scores).sort(([,a], [,b]) => a - b)[0];
  
  if (avg >= 4.0) return `우수한 커피, 특히 ${highest[0]}이 뛰어남`;
  if (avg >= 3.5) return `균형잡힌 커피, ${highest[0]}이 돋보임`;
  if (avg >= 3.0) return `평균적인 커피, ${lowest[0]}이 아쉬움`;
  return `개선이 필요한 커피, 전반적으로 약함`;
};
```

---

## 🔄 사용자 인터랙션

### 평가 시나리오

#### 시나리오 1: 건너뛰기 (즉시)
```
1. 화면 진입 → "수치 평가가 복잡해 보여요"
2. 헤더 "건너뛰기" 또는 하단 "수치 평가 건너뛰기" 클릭
3. 즉시 다음 화면 이동 (PersonalComment)
4. 데이터: was_skipped: true, evaluation_method: 'skipped'
```

#### 시나리오 2: 빠른 평가 (1-2분)
```
1. 모든 항목 3점 기본값 확인
2. 특별히 강하게 느껴지는 2-3개 항목만 조정
   - Acidity: 3.0 → 4.0 (산미 좋음)
   - Balance: 3.0 → 3.5 (약간 좋음)
3. 요약 확인: 총점 19.5/30, 평균 3.3/5
4. 완료
```

#### 시나리오 2: 정밀 평가 (2-3분)
```
1. 모든 항목을 세심하게 평가
   - Body: 3.0 → 3.5 (적당히 묵직)
   - Acidity: 3.0 → 4.0 (생동감 있음)
   - Sweetness: 3.0 → 3.5 (은은한 단맛)
   - Finish: 3.0 → 4.0 (길고 좋은 여운)
   - Bitterness: 3.0 → 2.5 (약간 부족)
   - Balance: 3.0 → 4.5 (매우 조화로움)
2. 요약 확인: 총점 22.0/30, 평균 3.7/5
3. 자동 코멘트: "균형잡힌 커피, Balance가 돋보임"
4. 완료
```

### 인터랙션 플로우
```
Option A: 건너뛰기 → 즉시 다음 화면
Option B: 기본값 확인 → 항목별 슬라이더 조정 → 실시간 요약 확인 → 최종 검토 → 다음 화면
```

### 조정 지원 기능
- **되돌리기**: 개별 항목 기본값(3.0)으로 리셋
- **전체 리셋**: 모든 항목 기본값으로 초기화
- **이전 평가 참조**: 비슷한 커피 이전 평가 참고 (Phase 2)
- **도움말**: 각 점수의 의미 설명 툴팁

---

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **SensoryMouthFeel**: 1-5 스케일 슬라이더 (1 단위)
- **ScoreDisplay**: 현재 값 표시 (숫자 + 색상 바)
- **EvaluationSummary**: 총점/평균/강점/약점 요약
- **AutoComment**: 점수 패턴 기반 자동 코멘트
- **SkipButton**: 건너뛰기 버튼 (헤더 + 하단)
- **ResetButton**: 개별/전체 초기화 버튼
- **HelpTooltip**: 점수 의미 설명

### Tamagui 스타일링
```typescript
const SliderContainer = styled(YStack, {
  paddingVertical: '$md',
  paddingHorizontal: '$md',
  marginBottom: '$sm',
  backgroundColor: '$background',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const SliderHeader = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$sm',
});

const SliderTrack = styled(View, {
  height: 8,
  backgroundColor: '$gray5',
  borderRadius: '$4',
  flex: 1,
  marginHorizontal: '$md',
});

const SliderThumb = styled(View, {
  width: 28,
  height: 28,
  backgroundColor: '$cupBlue',
  borderRadius: '$6',
  elevation: 3,
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  borderWidth: 2,
  borderColor: 'white',
});

const ScoreValue = styled(Text, {
  fontSize: '$6',
  fontWeight: 'bold',
  color: '$cupBlue',
  variants: {
    range: {
      low: { color: '$red9' },      // 1-2점
      medium: { color: '$orange9' }, // 2.5-3.5점
      high: { color: '$green9' }     // 4-5점
    }
  }
});

const SummaryCard = styled(YStack, {
  padding: '$md',
  backgroundColor: '$gray1',
  borderRadius: '$4',
  marginVertical: '$md',
  borderLeftWidth: 4,
  borderLeftColor: '$cupBlue',
});

const SkipButton = styled(Button, {
  backgroundColor: '$gray6',
  color: '$gray12',
  borderRadius: '$2',
  variants: {
    position: {
      header: {
        size: '$3',
        padding: '$sm',
      },
      footer: {
        size: '$4',
        marginVertical: '$md',
        backgroundColor: '$gray3',
      }
    }
  },
  pressStyle: { backgroundColor: '$gray8' },
});
```

### 색상 시스템 (점수별)
```typescript
const SCORE_COLORS = {
  1.0: '$red9',      // 매우 부족
  1.5: '$red8',
  2.0: '$red7',      // 부족
  2.5: '$orange9',
  3.0: '$gray9',     // 보통 (기본값)
  3.5: '$blue8',
  4.0: '$blue9',     // 좋음
  4.5: '$green8',
  5.0: '$green9',    // 매우 좋음
};

const getScoreColor = (score: number): string => {
  if (score < 2.5) return '$red9';
  if (score < 3.5) return '$orange9';
  if (score < 4.0) return '$gray9';
  if (score < 4.5) return '$blue9';
  return '$green9';
};
```

---

## 📱 반응형 고려사항

### 슬라이더 최적화
- **터치 영역**: 슬라이더 썸(thumb) 최소 44px
- **정밀도**: 1 단위 스냅, 부드러운 조정
- **햅틱 피드백**: 값 변경 시 진동 피드백
- **접근성**: VoiceOver, 키보드 네비게이션 지원

### 화면 크기별 대응
- **작은 화면**: 슬라이더 간격 축소, 스크롤 지원
- **큰 화면**: 2열 배치로 한 번에 더 많이 표시
- **가로모드**: 가로 배치로 공간 효율성 증대
- **태블릿**: 더 큰 슬라이더와 여백 활용

---

## 🔗 네비게이션

### 이전 화면
- **SensoryExpressionScreen**: 한국어 감각 표현 선택 완료

### 다음 화면  
- **PersonalCommentScreen**: 개인 코멘트 및 평점 입력

### 데이터 전달
```typescript
const handleNext = () => {
  const mouthFeelData: SensoryMouthFeelData = {
    scores: getCurrentScores(),
    summary: generateSummary(getCurrentScores()),
    evaluation_time: Date.now() - startTime,
    adjustment_count: adjustmentCount,
    evaluation_timestamp: new Date(),
    evaluation_method: 'slider_scale',
    was_skipped: false
  }
  
  navigation.navigate('PersonalComment', {
    ...previousData,
    sensory_mouthfeel: mouthFeelData
  })
}

const handleSkip = () => {
  const skippedData: SensoryMouthFeelData = {
    scores: DEFAULT_SCORES, // 모든 항목 3.0
    summary: {
      total_score: 18,
      average_score: 3.0,
      highest_scoring: [],
      lowest_scoring: [],
      auto_comment: '수치 평가를 건너뛰었습니다'
    },
    evaluation_time: Date.now() - startTime,
    adjustment_count: 0,
    evaluation_timestamp: new Date(),
    evaluation_method: 'skipped',
    was_skipped: true
  }
  
  navigation.navigate('PersonalComment', {
    ...previousData,
    sensory_mouthfeel: skippedData
  })
}
```

---

## 📈 성능 최적화

### 슬라이더 최적화
```typescript
// 디바운싱으로 과도한 업데이트 방지
const debouncedScoreUpdate = useMemo(
  () => debounce((category: string, value: number) => {
    updateScore(category, value);
    incrementAdjustmentCount();
  }, 150),
  []
);

// 메모이제이션으로 불필요한 계산 방지
const calculatedSummary = useMemo(() => {
  const scores = getCurrentScores();
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const average = total / 6;
  const entries = Object.entries(scores);
  
  return {
    total_score: total,
    average_score: Math.round(average * 10) / 10,
    highest_scoring: entries.filter(([,score]) => score === Math.max(...Object.values(scores))),
    lowest_scoring: entries.filter(([,score]) => score === Math.min(...Object.values(scores))),
    auto_comment: generateAutoComment(scores)
  };
}, [scores]);

// 슬라이더 상태 최적화
const useSliderState = (initialValue: number = 3.0) => {
  const [value, setValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleValueChange = useCallback((newValue: number) => {
    const snappedValue = Math.round(newValue); // 1 단위 스냅
    setValue(snappedValue);
    debouncedScoreUpdate(category, snappedValue);
  }, [category]);
  
  return { value, setValue: handleValueChange, isDragging, setIsDragging };
};
```

---

## 🧪 테스트 시나리오

### 기능 테스트
1. **슬라이더 동작**: 각 슬라이더 정확한 값 반영 (1 단위)
2. **실시간 계산**: 값 변경 시 총점/평균 즉시 업데이트
3. **자동 코멘트**: 점수 패턴에 따른 적절한 코멘트 생성
4. **데이터 저장**: 모든 평가 값 정확한 저장

### 정확성 테스트
1. **스케일 일관성**: 1-5 범위 내 정확한 값, 1 단위 스냅
2. **계산 정확도**: 총점/평균 계산 정확성 (소수점 1자리)
3. **강점/약점 식별**: 최고/최저 점수 항목 정확한 식별

### 사용성 테스트
1. **직관성**: 처음 사용자도 쉬운 슬라이더 조작
2. **일관성**: 동일 커피 재평가 시 일관된 결과 (±1 오차)
3. **속도**: 6개 항목 평가 2-3분 내 완료
4. **만족도**: 평가 결과에 대한 사용자 만족도

---

## 🚀 확장 가능성

### Phase 2 개선사항
- **스마트 기본값**: 한국어 표현 기반 추천 기본값
- **비교 모드**: 여러 커피 동시 평가 및 비교
- **개인화**: 사용자 평가 패턴 기반 조정
- **상세 분석**: 점수 패턴 기반 상세 분석 리포트

### Phase 3 고급 기능
- **AI 보정**: 개인 편향 보정 기능
- **전문가 캘리브레이션**: 표준 샘플로 평가 기준 보정
- **커뮤니티 비교**: 다른 사용자와 평가 비교
- **트렌드 분석**: 시간에 따른 평가 패턴 변화

---

## 🎯 데이터 활용 가치

### 개인 데이터
- **취향 프로필**: 수치 기반 객관적 취향 분석
- **일관성 추적**: 평가 일관성으로 미각 발달 추적
- **추천 알고리즘**: 점수 패턴 기반 커피 추천

### 커뮤니티 데이터
- **품질 공유**: 로스터리/카페 품질 일관성 피드백
- **취향 분석**: 한국인 선호 커피 특성 파악
- **개선 제안**: 선호 점수 패턴 기반 품질 개선

### 연구 데이터
- **감각 연구**: 한국인 커피 감각 평가 패턴 연구
- **문화적 차이**: 지역별/세대별 평가 차이 분석
- **AI 학습**: 커피 품질 예측 모델 학습 데이터

---

## 📊 주요 혁신사항 요약

### 🔄 이번 통합에서 확정된 내용
1. **Lab 모드 제거**: 모든 사용자 대상 범용 수치 평가
2. **건너뛰기 옵션**: 선택적 수치 평가로 부담 해소 ⭐**핵심 추가**
3. **1 단위 명확성**: 직관적이고 명확한 5단계 평가
4. **스마트 기본값**: 3점 시작으로 부담 없는 평가
5. **실시간 피드백**: 총점/평균/강점/약점 즉시 확인
6. **자동 코멘트**: 점수 패턴 기반 간단 해석

### 🎯 핵심 가치 제안
- **선택의 자유**: 건너뛰기 옵션으로 부담 없는 사용자 경험 ⭐**추가**
- **객관성**: 주관적 표현을 보완하는 정량적 데이터
- **표준화**: 국제 큐핑 기준 기반 일관된 평가
- **사용 편의성**: 복잡한 전문 지식 없이도 직관적 평가
- **데이터 가치**: 개인 취향부터 품질 관리까지 다양한 활용
- **호환성**: 글로벌 커피 품질 평가와 호환

---

**✅ 문서 완성 상태**: 수치 평가 시스템 완료, 구현 준비 완료  
**📋 다음 단계**: PersonalComment 화면 또는 다른 TastingFlow 화면 작업  
**🔗 관련 문서**: TF_Screen_SensoryExpression.md, TF_Screen_PersonalNotes.md  
**📝 변경이력**: 
- 2025-08-01: Lab 모드 제거 및 범용화 완료
- 2025-08-01: 건너뛰기 옵션 추가로 선택적 수치 평가 구현 ⭐**핵심 업데이트**
- 2025-08-01: 1 단위 명확한 5단계 슬라이더 시스템으로 변경
- 2025-08-01: 실시간 피드백 및 자동 코멘트 기능 추가
- 2025-08-01: 6개 감각 항목 표준화된 평가 기준 확립