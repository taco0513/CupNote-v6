# 📱 TF_Screen_SensoryExpression

**문서타입**: TastingFlow 화면 설계서  
**화면명**: SensoryExpression 화면 (한국어 감각 표현)  
**모드 지원**: 모든 TastingFlow 모드 공통  
**작성일**: 2025-08-01  
**문서상태**: ✅ Lab 모드 제거, 범용화 완료  

---

## 📋 개요 & 목적

**화면 역할**: TastingFlow의 4단계 - 한국어 네이티브 감각 표현 수집  
**구현 파일**: `[screens]/tasting/SensoryExpressionScreen`  
**소요시간**: 2-3분  
**진행률**: 75% (전체 TastingFlow 중)  

### 주요 목표
- 한국어 고유 감각 표현으로 커피 경험 기록
- SCA 국제 표준을 한국 문화에 적응
- CATA 방법론 기반 직관적 다중 선택 시스템
- 초보자부터 애호가까지 모든 레벨 지원

---

## 🇰🇷 한국어 감각 표현 시스템 (핵심 차별화)

### 설계 철학
- **문화적 적합성**: 한국인 미각 표현 문화 반영
- **자연스러운 표현**: 일상 대화에서 사용하는 한국어 활용
- **과학적 기반**: SCA 표준 준수하면서 한국화
- **CATA 방법론**: Check All That Apply - 부담 없는 다중 선택

### 6개 카테고리 × 7개 표현 = 44개 체계

#### 🍋 산미 (Acidity) - 7개
```
싱그러운    발랄한    톡 쏘는    상큼한
과일 같은   와인 같은   시트러스 같은
```
**특징**: 밝고 생동감 있는 산미 표현  
**문화적 적응**: "톡 쏘는", "발랄한" 등 한국인 친숙 표현

#### 🍯 단맛 (Sweetness) - 7개  
```
농밀한      달콤한      꿀 같은      캐러멜 같은
설탕 같은   당밀 같은    메이플 시럽 같은
```
**특징**: 자연스러운 단맛부터 구체적 단맛까지  
**문화적 적응**: "농밀한" 등 한국어 고유 표현 활용

#### 🌰 쓴맛 (Bitterness) - 7개
```
스모키한    카카오 같은   허브 느낌의   고소한
견과류 같은  다크 초콜릿 같은  로스티한
```
**특징**: 부정적이지 않은 긍정적 쓴맛 표현  
**문화적 적응**: "고소한" 등 한국인 선호 표현

#### 💧 바디 (Body) - 7개  
```
크리미한    벨벳 같은    묵직한    가벼운
실키한     오일리한     물 같은
```
**특징**: 질감과 무게감의 다양한 스펙트럼  
**문화적 적응**: "묵직한", "물 같은" 등 직관적 표현

#### 🌬️ 애프터 (Aftertaste) - 7개
```
깔끔한     길게 남는    산뜻한     여운이 좋은
드라이한   달콤한 여운의  복합적인
```
**특징**: 여운의 길이, 품질, 특성 표현  
**문화적 적응**: "깔끔한", "여운이 좋은" 등 자연스러운 표현

#### ⚖️ 밸런스 (Balance) - 7개
```
조화로운    부드러운    자연스러운    복잡한
단순한     안정된     역동적인
```
**특징**: 전체적인 균형감과 조화 표현  
**문화적 적응**: "조화로운", "자연스러운" 등 한국적 가치 반영

---

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (75%) + "감각 표현"
├── 안내 메시지 & 도움말
│   ├── "느껴지는 감각을 자유롭게 선택해주세요"
│   └── "각 카테고리에서 최대 3개까지 선택 가능"
├── 선택 현황 요약
│   └── "총 8개 선택됨 (6개 카테고리 중 4개 사용)"
├── 6개 카테고리 (Progressive Disclosure)
│   ├── 🍋 산미 (Acidity) ▼ 
│   │   ├── ✓ 싱그러운  ✓ 발랄한  □ 톡 쏘는
│   │   ├── □ 상큼한   □ 과일 같은  □ 와인 같은  
│   │   └── □ 시트러스 같은
│   ├── 🍯 단맛 (Sweetness) ▼  
│   │   ├── □ 농밀한   ✓ 달콤한   □ 꿀 같은
│   │   ├── □ 캐러멜 같은  □ 설탕 같은  □ 당밀 같은
│   │   └── □ 메이플 시럽 같은
│   ├── 🌰 쓴맛 (Bitterness) ▼
│   │   ├── □ 스모키한  ✓ 카카오 같은  □ 허브 느낌의
│   │   ├── ✓ 고소한   □ 견과류 같은  □ 다크 초콜릿 같은
│   │   └── □ 로스티한
│   ├── 💧 바디 (Body) ▼
│   │   ├── ✓ 크리미한  □ 벨벳 같은  □ 묵직한
│   │   ├── □ 가벼운   □ 실키한   □ 오일리한
│   │   └── □ 물 같은
│   ├── 🌬️ 애프터 (Aftertaste) ▼
│   │   ├── ✓ 깔끔한   □ 길게 남는  □ 산뜻한
│   │   ├── □ 여운이 좋은  □ 드라이한  □ 달콤한 여운의
│   │   └── □ 복합적인
│   └── ⚖️ 밸런스 (Balance) ▼
│       ├── ✓ 조화로운  □ 부드러운  □ 자연스러운
│       ├── □ 복잡한   □ 단순한   □ 안정된
│       └── □ 역동적인
├── 선택된 표현 요약 (Horizontal Scroll)
│   └── "싱그러운, 발랄한, 달콤한, 카카오 같은, 고소한, 크리미한, 깔끔한, 조화로운"
└── Footer: "다음" Button (자유 선택, 최소 제한 없음)
```

### 핵심 UX 원칙

#### 1. Progressive Disclosure (점진적 노출)
- **기본 상태**: 카테고리 헤더만 표시, 표현 목록 접힘
- **선택 시**: 해당 카테고리 자동 펼침
- **시각적 구분**: 펼쳐진/접힌 상태 명확한 표시

#### 2. 유연한 선택 시스템
- **카테고리당 최대 3개**: 집중력 유지, 명확한 표현
- **전체 최소 제한 없음**: 느끼지 못한 특성은 선택하지 않아도 됨
- **실시간 제한**: 3개 선택 시 나머지 항목 비활성화
- **자유로운 조합**: 카테고리 간 자유로운 선택

#### 3. 직관적 인터랙션
- **원터치 선택**: 탭 한 번으로 선택/해제
- **시각적 피드백**: 선택된 항목 색상 변경 + 체크마크
- **카테고리별 색상**: 6개 카테고리 고유 색상 시스템
- **실시간 카운터**: 카테고리별/전체 선택 개수 실시간 표시

---

## 💾 데이터 처리

### 입력 데이터
```typescript
interface PreviousScreenData {
  // 공통 데이터
  coffee_info: CoffeeInfoData;
  selected_flavors: FlavorChoice[];
  
  // 모드별 선택적 데이터
  homecafe_data?: HomeCafeData;           // HomeCafe 모드
}
```

### 출력 데이터
```typescript
interface SensoryExpressionData {
  // 카테고리별 선택된 표현 (최대 3개씩)
  expressions: {
    acidity: KoreanExpression[];      // 산미 표현들
    sweetness: KoreanExpression[];    // 단맛 표현들  
    bitterness: KoreanExpression[];   // 쓴맛 표현들
    body: KoreanExpression[];         // 바디 표현들
    aftertaste: KoreanExpression[];   // 애프터 표현들
    balance: KoreanExpression[];      // 밸런스 표현들
  };
  
  // 통계 정보
  total_selected: number;             // 총 선택 개수
  categories_used: number;            // 사용된 카테고리 수
  category_distribution: {            // 카테고리별 선택 분포
    acidity: number;
    sweetness: number;
    bitterness: number;
    body: number;
    aftertaste: number;
    balance: number;
  };
  
  // 메타데이터
  selection_time: number;             // 선택 소요 시간 (초)
  selection_timestamp: Date;
  evaluation_method: 'korean_cata';   // 한국어 CATA 방법론 표시
}

interface KoreanExpression {
  id: string;                         // 고유 식별자
  korean_text: string;                // 한국어 표현 ("싱그러운")
  category: SensoryCategory;          // 카테고리
  english_equivalent?: string;        // 영어 대응어 (분석용)
  cultural_weight?: number;           // 문화적 중요도 (1-5)
}

enum SensoryCategory {
  ACIDITY = 'acidity',       // 산미
  SWEETNESS = 'sweetness',   // 단맛
  BITTERNESS = 'bitterness', // 쓴맛
  BODY = 'body',             // 바디
  AFTERTASTE = 'aftertaste', // 애프터
  BALANCE = 'balance'        // 밸런스
}
```

### 44개 표현 완전 데이터베이스
```typescript
const KOREAN_EXPRESSIONS_DATABASE: KoreanExpression[] = [
  // 산미 (7개)
  { id: 'acid_01', korean_text: '싱그러운', category: 'acidity', english_equivalent: 'Fresh, Bright' },
  { id: 'acid_02', korean_text: '발랄한', category: 'acidity', english_equivalent: 'Lively, Vibrant' },
  { id: 'acid_03', korean_text: '톡 쏘는', category: 'acidity', english_equivalent: 'Tangy, Sharp' },
  { id: 'acid_04', korean_text: '상큼한', category: 'acidity', english_equivalent: 'Refreshing, Clean' },
  { id: 'acid_05', korean_text: '과일 같은', category: 'acidity', english_equivalent: 'Fruity' },
  { id: 'acid_06', korean_text: '와인 같은', category: 'acidity', english_equivalent: 'Wine-like' },
  { id: 'acid_07', korean_text: '시트러스 같은', category: 'acidity', english_equivalent: 'Citrusy' },
  
  // 단맛 (7개)
  { id: 'sweet_01', korean_text: '농밀한', category: 'sweetness', english_equivalent: 'Dense, Syrupy' },
  { id: 'sweet_02', korean_text: '달콤한', category: 'sweetness', english_equivalent: 'Sweet' },
  { id: 'sweet_03', korean_text: '꿀 같은', category: 'sweetness', english_equivalent: 'Honey-like' },
  { id: 'sweet_04', korean_text: '캐러멜 같은', category: 'sweetness', english_equivalent: 'Caramel-like' },
  { id: 'sweet_05', korean_text: '설탕 같은', category: 'sweetness', english_equivalent: 'Sugar-like' },
  { id: 'sweet_06', korean_text: '당밀 같은', category: 'sweetness', english_equivalent: 'Molasses-like' },
  { id: 'sweet_07', korean_text: '메이플 시럽 같은', category: 'sweetness', english_equivalent: 'Maple Syrup-like' },
  
  // ... 나머지 30개 표현
];
```

---

## 🔄 사용자 인터랙션

### 선택 시나리오

#### 시나리오 1: 초보자 (간단 선택)
```
1. "산미" 카테고리 → "상큼한" 선택
2. "단맛" 카테고리 → "달콤한" 선택  
3. "밸런스" 카테고리 → "부드러운" 선택
4. 총 3개 선택 → 완료 (1분)
```

#### 시나리오 2: 애호가 (세밀한 표현)
```
1. "산미" → "싱그러운", "과일 같은", "시트러스 같은" (3개)
2. "단맛" → "꿀 같은", "캐러멜 같은" (2개)
3. "쓴맛" → "카카오 같은" (1개)
4. "바디" → "크리미한", "실키한" (2개)
5. "애프터" → "여운이 좋은" (1개)
6. "밸런스" → "조화로운", "복잡한" (2개)
7. 총 11개 선택 → 완료 (2-3분)
```

### 인터랙션 플로우
```
카테고리 탐색 → 표현 선택 (최대 3개/카테고리) → 다른 카테고리 → 요약 확인 → 다음 화면
```

### 선택 지원 기능
- **표현 설명**: 각 표현 옆 (?) 아이콘으로 설명 툴팁
- **예시 커피**: "이런 커피에서 많이 느껴져요" 가이드
- **되돌리기**: 선택 실수 시 쉬운 해제
- **건너뛰기**: 특정 카테고리 건너뛰기 가능

---

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **CategoryAccordion**: 6개 카테고리 접기/펼치기
- **ExpressionButton**: 개별 감각 표현 선택 버튼
- **SelectionCounter**: 카테고리별/전체 선택 개수 표시  
- **ExpressionSummary**: 선택된 표현들의 요약 표시
- **CategoryIcon**: 카테고리별 이모지 + 색상 아이콘
- **HelpTooltip**: 표현 설명 툴팁

### Tamagui 스타일링
```typescript
const CategoryHeader = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$md',
  backgroundColor: '$gray1',
  borderRadius: '$3',
  marginBottom: '$xs',
  pressStyle: { backgroundColor: '$gray2' },
});

const ExpressionButton = styled(Button, {
  size: '$3',
  backgroundColor: '$gray3',
  color: '$gray12',
  borderRadius: '$2',
  borderWidth: 1,
  borderColor: '$borderColor',
  margin: '$xs',
  minWidth: '28%',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue', 
        color: 'white',
        borderColor: '$cupBlue',
        scale: 0.98,
      }
    },
    disabled: {
      true: {
        backgroundColor: '$gray1',
        color: '$gray8',
        opacity: 0.5,
      }
    },
    category: {
      acidity: { borderColor: '$green9' },
      sweetness: { borderColor: '$orange9' },
      bitterness: { borderColor: '$brown9' },
      body: { borderColor: '$blue9' },
      aftertaste: { borderColor: '$purple9' },
      balance: { borderColor: '$gold9' }
    }
  } as const,
  
  pressStyle: { scale: 0.98 },
  animation: 'quick',
});

const SelectionSummary = styled(ScrollView, {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  padding: '$md',
  backgroundColor: '$gray1',
  borderRadius: '$3',
  marginBottom: '$md',
});
```

### 카테고리별 색상 시스템
```typescript
const CATEGORY_COLORS = {
  acidity: {
    primary: '$green9',      // 싱그러운 녹색
    background: '$green2',
    text: '$green12'
  },
  sweetness: {
    primary: '$orange9',     // 달콤한 오렌지
    background: '$orange2',
    text: '$orange12'
  },
  bitterness: {
    primary: '$brown9',      // 쓴맛 브라운
    background: '$brown2', 
    text: '$brown12'
  },
  body: {
    primary: '$blue9',       // 바디 블루
    background: '$blue2',
    text: '$blue12'
  },
  aftertaste: {
    primary: '$purple9',     // 애프터 퍼플
    background: '$purple2',
    text: '$purple12'
  },
  balance: {
    primary: '$gold9',       // 밸런스 골드
    background: '$gold2',
    text: '$gold12'
  }
};
```

---

## 📱 반응형 고려사항

### 표현 버튼 레이아웃
- **작은 화면**: 2-3열 그리드, 세로 스크롤 지원
- **큰 화면**: 3-4열로 한 번에 더 많이 표시
- **터치 최적화**: 최소 44px 터치 영역, 8px 간격
- **가독성**: 한국어 텍스트 최적 폰트 크기

### 카테고리 네비게이션
- **아코디언 방식**: 세로 스크롤로 모든 카테고리 표시
- **상태 유지**: 선택된 카테고리는 펼친 상태 유지
- **부드러운 애니메이션**: 펼치기/접기 시 부드러운 전환

---

## 🔗 네비게이션

### 이전 화면
- **FlavorSelectionScreen**: 향미 선택 완료 (모든 모드)

### 다음 화면
- **SensoryMouthFeelScreen**: 수치 평가 화면 (모든 모드)

### 데이터 전달
```typescript
const handleNext = () => {
  const expressionData: SensoryExpressionData = {
    expressions: getSelectedExpressions(),
    total_selected: getTotalSelected(),
    categories_used: getCategoriesUsed(),
    category_distribution: getCategoryDistribution(),
    selection_time: Date.now() - startTime,
    selection_timestamp: new Date(),
    evaluation_method: 'korean_cata'
  }
  
  navigation.navigate('SensoryMouthFeel', {
    ...previousData,
    sensory_expression: expressionData
  })
}
```

---

## 📈 성능 최적화

### 렌더링 최적화
```typescript
// 카테고리별 메모이제이션
const CategorySection = React.memo(({ 
  category, 
  expressions, 
  selectedExpressions, 
  onToggle,
  maxReached 
}) => {
  const isExpanded = selectedExpressions.length > 0 || category.isExpanded
  
  return (
    <YStack>
      <CategoryHeader onPress={() => toggleCategory(category.id)}>
        <Text>{category.emoji} {category.name}</Text>
        <Text>{selectedExpressions.length}/3</Text>
      </CategoryHeader>
      
      {isExpanded && (
        <XStack flexWrap="wrap" padding="$sm">
          {expressions.map(expression => (
            <ExpressionButton
              key={expression.id}
              expression={expression}
              isSelected={selectedExpressions.includes(expression.id)}
              onToggle={onToggle}
              disabled={maxReached && !selectedExpressions.includes(expression.id)}
              category={category.id}
            />
          ))}
        </XStack>
      )}
    </YStack>
  )
})

// 선택 상태 최적화
const useOptimizedSelection = () => {
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  
  const toggleExpression = useCallback((categoryId: string, expressionId: string) => {
    setSelections(prev => {
      const categorySelections = prev[categoryId] || []
      const isSelected = categorySelections.includes(expressionId)
      
      if (isSelected) {
        // 선택 해제
        return {
          ...prev,
          [categoryId]: categorySelections.filter(id => id !== expressionId)
        }
      } else if (categorySelections.length < 3) {
        // 새로 선택 (3개 제한)
        return {
          ...prev,
          [categoryId]: [...categorySelections, expressionId]
        }
      }
      
      return prev // 3개 초과 시 변경 없음
    })
  }, [])
  
  return { selections, toggleExpression }
}
```

---

## 🧪 테스트 시나리오

### 기능 테스트
1. **선택 제한**: 카테고리당 3개 초과 선택 시 제한 동작
2. **카테고리 독립성**: 각 카테고리 선택이 다른 카테고리에 영향 없음
3. **상태 동기화**: 선택/해제 상태 정확한 반영
4. **Progressive Disclosure**: 카테고리 펼치기/접기 정상 동작

### 문화적 적합성 테스트
1. **표현 이해도**: 한국인 사용자의 표현 이해 정도 (90%+ 목표)
2. **자연스러움**: 일상 대화 표현과의 일치도
3. **정확성**: 실제 커피 특성과 표현의 일치도
4. **선호도**: 영어 번역 대비 한국어 표현 선호도

### 사용성 테스트
1. **초보자**: 커피 용어 모르는 사용자도 쉬운 선택 (3개 이하)
2. **애호가**: 정확한 표현을 통한 정밀한 기록 (8-12개)
3. **일관성**: 동일 커피 재평가 시 유사한 선택 패턴 (70%+ 일치)
4. **완성률**: 중도 이탈 없이 완성하는 비율 (85%+ 목표)

---

## 🚀 확장 가능성

### Phase 2 개선사항
- **강도 설정**: 선택된 표현별 강도 설정 (1-3단계)
- **개인 표현**: 사용자 정의 감각 표현 추가 기능
- **AI 추천**: 향미 선택 기반 감각 표현 추천
- **비교 기능**: 이전 평가와 비교 표시

### Phase 3 고급 기능
- **지역별 표현**: 경상도, 전라도 등 지역별 표현 차이 반영
- **세대별 표현**: 연령대별 친숙한 표현 제공
- **감정 연결**: 감각 표현과 감정 연결 분석
- **소셜 비교**: 다른 사용자와 표현 패턴 비교

---

## 🎯 차별화 가치

### 주요 차별화 요소
- **국내 유일**: 한국어 네이티브 감각 표현 시스템
- **문화적 우월성**: 영어 번역보다 자연스러운 한국어 원생 표현
- **진입장벽 해소**: 전문 용어 없이도 정확한 표현 가능
- **국제적 호환**: SCA 표준 기반으로 해외 데이터와 연동 가능

### 데이터 가치
- **개인 취향 프로필**: 한국인 특유의 감각 표현 패턴 분석
- **문화적 인사이트**: 한국인 커피 감각 표현 데이터베이스 구축
- **커뮤니티 공유**: 로스터리, 카페와 한국인 취향 데이터 공유
- **AI 모델 학습**: 한국어 감각 표현 AI 모델 학습 데이터

### 교육적 가치
- **미각 발달**: 체계적 표현 학습으로 미각 발달 지원
- **커피 문해력**: 커피에 대한 이해와 표현 능력 향상
- **문화적 자긍심**: 한국어로 정확하게 표현하는 자신감

---

## 📊 주요 혁신사항 요약

### 🔄 이번 통합에서 확정된 내용
1. **Lab 모드 제거**: 범용적 사용을 위한 단순화
2. **44개 한국어 표현**: SCA 기반 한국 문화 적응 완료
3. **6개 카테고리 체계**: 과학적 기반 + 직관적 구조
4. **CATA 방법론**: 부담 없는 다중 선택 시스템
5. **Progressive Disclosure**: 카테고리별 접기/펼치기 UI

### 🎯 핵심 가치 제안
- **문화적 적합성**: 한국인이 가장 자연스럽게 사용할 수 있는 표현 시스템
- **접근성**: 초보자부터 애호가까지 모든 레벨 지원
- **과학적 신뢰성**: SCA 국제 표준 기반으로 정확성 확보
- **사용 편의성**: 2-3분 내 직관적 완성 가능
- **데이터 가치**: 한국인 감각 표현 빅데이터 구축

---

**✅ 문서 완성 상태**: 한국어 감각 표현 시스템 완료, 구현 준비 완료  
**📋 다음 단계**: SensoryMouthFeel 화면 통합 작업  
**🔗 관련 문서**: TF_Screen_FlavorSelection.md, TF_Screen_SensoryMouthFeel.md  
**📝 변경이력**: 
- 2025-08-01: Lab 모드 제거 및 범용화 완료
- 2025-08-01: 44개 한국어 표현 체계 통합
- 2025-08-01: Progressive Disclosure UI 설계 완료
- 2025-08-01: CATA 방법론 기반 사용자 경험 최적화