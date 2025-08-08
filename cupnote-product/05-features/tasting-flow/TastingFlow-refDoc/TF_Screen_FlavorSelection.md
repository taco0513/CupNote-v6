# 📱 TF_Screen_FlavorSelection

**문서타입**: TastingFlow 화면 설계서  
**화면명**: FlavorSelection 화면 (향미 선택)  
**모드 지원**: 모든 TastingFlow 모드 공통  
**작성일**: 2025-08-01  
**문서상태**: ✅ SCA 완전판 통합 완료  

---

## 📋 개요 & 목적

**화면 역할**: TastingFlow의 3단계 - 커피 향미 프로필 정의  
**구현 파일**: `[screens]/tasting/FlavorSelectionScreen`  
**소요시간**: 1-3분 (초보자: 1분, 전문가: 3분)  
**진행률**: 57% (전체 TastingFlow 중)  

### 주요 목표
- SCA Flavor Wheel 기반 체계적 향미 분류 시스템
- 초보자부터 전문가까지 모든 레벨 지원
- 사용자 취향 데이터 축적으로 Match Score 계산 기반 제공
- 한국어 친화적 향미 표현으로 접근성 향상

---

## 🎯 SCA Flavor Wheel 완전판 구조

### 9개 대분류, 85개 향미 (국제 표준 완전 준수)

#### 🍓 과일향/프루티 (Fruity) - 16개
```
베리류/딸기류
• 블랙베리 - 진하고 달콤한 검은 베리
• 라즈베리 - 새콤달콤한 붉은 베리  
• 블루베리 - 달콤하고 과즙이 많은 베리
• 딸기 - 상큼하고 달콤한 붉은 베리

건조 과일
• 건포도 - 달콤하고 진한 말린 포도
• 자두 - 부드럽고 달콤한 과일

기타 과일
• 코코넛, 체리, 석류, 파인애플, 포도
• 사과, 복숭아, 배

감귤향/시트러스  
• 자몽, 오렌지, 레몬, 라임
```

#### 🍋 신맛/발효 (Sour/Fermented) - 11개
```
신맛
• 신맛 아로마, 아세트산, 뷰티르산
• 이소발러산, 구연산, 사과산

알코올/발효
• 와인향, 위스키향, 발효, 과숙
```

#### 🌿 초록/식물성 (Green/Vegetative) - 11개
```
올리브 오일, 생것

허브/식물성
• 덜 익은, 완두콩 꼬투리, 신선한
• 진한 녹색, 식물성, 건초, 허브

콩비린내
• 콩비린내
```

#### 📦 기타 (Other) - 14개
```
종이 냄새/곰팡이 냄새
• 묵은, 판지, 종이, 목재 냄새
• 곰팡이/습한, 곰팡이/먼지, 곰팡이/흙냄새
• 동물 냄새, 고기/육수, 페놀

화학물질 냄새
• 쓴맛, 짠맛, 약품 냄새, 석유, 스컹크, 고무 냄새
```

#### 🔥 로스팅 (Roasted) - 8개
```
파이프 담배, 담배

탄내/스모키
• 신랄한, 재 냄새, 연기, 브라운 로스트

곡물 냄새/구운 빵 냄새
• 곡식, 맥아
```

#### 🌶️ 향신료 (Spices) - 6개
```
자극적/펀전트, 후추

갈색 향신료
• 아니스, 육두구, 계피, 정향
```

#### 🥜 견과류/너티/코코아 (Nutty/Cocoa) - 5개
```
견과류 냄새
• 아몬드, 헤이즐넛, 땅콩

초콜릿향
• 초콜릿, 다크초콜릿
```

#### 🍯 단맛 (Sweet) - 9개
```
캐러멜향/갈색설탕
• 당밀, 메이플시럽, 캐러멜, 꿀

바닐라, 바닐린, 전반적 단맛, 달콤한 아로마
```

#### 🌺 꽃향기/플로럴 (Floral) - 4개
```
홍차, 꽃향기
• 카모마일, 장미, 자스민
```

---

## 🏗️ UI/UX 구조 (3단계 계층 시스템)

### 화면 레이아웃
```
Header: ProgressBar (57%) + "향미 선택"
├── 안내 메시지 & 도움말
│   └── "느껴지는 향미를 선택해주세요 (제한 없음)"
├── 🔍 향미 검색 (Quick Access)
├── ⭐ 자주 선택되는 향미 (Popular)
│   └── [베리류] [초콜릿향] [캐러멜향] [견과류] [시트러스] [바닐라]
├── 📂 9개 대분류 카테고리 (Collapsible)
│   ├── 🍓 과일향/프루티 ▼
│   │   ├── ☑️ 베리류 (비활성) ← Level 2
│   │   │   └─ 구체적으로: ● 딸기 ○ 블루베리 ○ 라즈베리 ← Level 3
│   │   ├── □ 시트러스 ← Level 2
│   │   ├── □ 건조 과일 ← Level 2  
│   │   └── □ 기타 과일 ← Level 2
│   ├── 🍋 신맛/발효 ▶
│   ├── 🌿 초록/식물성 ▶
│   └── [나머지 6개 카테고리...]
├── 선택된 향미 프리뷰 (Horizontal Scroll)
│   └── "딸기, 캐러멜향, 아몬드" + 개수 표시
└── Footer: "다음" Button (1개 이상 선택 시 활성화)
```

### 핵심 UX 혁신

#### 1. Level 2 중심 선택 전략 ⭐**핵심**
```
Level 1: 대분류 (카테고리 역할) - UI 구조화
Level 2: 중분류 (실제 선택 단위) ← 기본 선택
Level 3: 소분류 (선택적 구체화) ← 원하는 경우만
```

**선택 로직**:
- **Level 2 선택**: 체크박스로 선택 (예: "베리류", "시트러스")
- **Level 3 구체화**: Level 2 선택 시 하위 옵션 표시 (선택적)
- **상호 배타적**: Level 3 선택 시 Level 2는 자동 선택되지만 비활성화
- **유연성**: Level 2만 선택해도 충분히 유효

#### 2. Progressive Disclosure (점진적 노출)
- **기본 상태**: 대분류만 표시, 하위 카테고리 접힘
- **선택 시**: 해당 카테고리 자동 펼침, Level 2 옵션 표시
- **구체화**: Level 2 선택 시 Level 3 옵션 표시 (선택적)

#### 3. 스마트 향미 추천 시스템
```typescript
// 인기 향미 계산 (상단 노출)
getPopularFlavors(limit = 6) {
  const flavorCounts = {}
  
  // 전체 사용자 선택 데이터에서 집계
  allUserSelections.forEach(selection => {
    selection.flavors.forEach(flavor => {
      const key = flavor.level3 || flavor.level2
      flavorCounts[key] = (flavorCounts[key] || 0) + 1
    })
  })
  
  return Object.entries(flavorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
}
```

---

## 💾 데이터 처리 (계층적 구조)

### 입력 데이터
```typescript
interface PreviousScreenData {
  coffee_info: CoffeeInfoData;
  homecafe_data?: HomeCafeData;      // HomeCafe 모드만
}
```

### 출력 데이터 (SCA 완전 준수)
```typescript
interface FlavorSelectionData {
  selected_flavors: FlavorChoice[];     // 제한 없음
  selection_method: 'quick' | 'detailed'; // 선택 방식
  selection_duration: number;          // 선택에 걸린 시간 (초)
  timestamp: Date;
}

interface FlavorChoice {
  level1: string;                      // 대분류 (예: "과일향/프루티")
  level2: string;                      // 중분류 (필수, 예: "베리류")
  level3?: string[];                   // 소분류 (선택적, 예: ["딸기", "블루베리"])
  selection_confidence?: number;       // 선택 확신도 (1-5, Phase 2)
}

// 85개 향미 완전 데이터베이스
interface FlavorDatabase {
  id: string;
  level1: string;                      // 대분류
  level2: string;                      // 중분류  
  level3?: string;                     // 소분류
  nameKo: string;                      // 한국어 이름
  nameEn: string;                      // 영어 이름 (SCA 표준)
  description: string;                 // 향미 설명
  emoji: string;                       // 대표 이모지
  frequency: number;                   // 사용 빈도
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'; // 난이도
}
```

### 선택 로직 구현
```typescript
// 복합 선택 상태 관리
class FlavorSelectionState {
  // Level 2 클릭 처리
  onLevel2Click(level2: FlavorItem) {
    if (level2.hasSelectedLevel3) {
      // Level 3가 선택된 경우: 모두 해제
      this.deselectAllLevel3(level2)
      level2.selected = false
    } else {
      // Level 3가 없는 경우: 토글
      level2.selected = !level2.selected
    }
  }

  // Level 3 클릭 처리
  onLevel3Click(level3: FlavorItem, parentLevel2: FlavorItem) {
    level3.selected = !level3.selected
    
    if (this.anyLevel3Selected(parentLevel2)) {
      parentLevel2.selected = true
      parentLevel2.disabled = true  // 비활성화 표시
    } else {
      parentLevel2.selected = false
      parentLevel2.disabled = false
    }
  }

  // 선택된 향미 수집
  getSelectedFlavors(): FlavorChoice[] {
    const choices: FlavorChoice[] = []
    
    this.categories.forEach(category => {
      category.level2Items.forEach(level2 => {
        const selectedLevel3 = level2.level3Items.filter(l3 => l3.selected)
        
        if (selectedLevel3.length > 0) {
          // Level 3가 선택된 경우
          choices.push({
            level1: category.name,
            level2: level2.name,
            level3: selectedLevel3.map(l3 => l3.name)
          })
        } else if (level2.selected) {
          // Level 2만 선택된 경우
          choices.push({
            level1: category.name,
            level2: level2.name,
            level3: null
          })
        }
      })
    })
    
    return choices
  }
}
```

---

## 🔄 사용자 인터랙션 플로우

### 선택 시나리오

#### 시나리오 1: 초보자 (빠른 선택)
```
1. 인기 향미에서 "초콜릿향" 클릭 → 즉시 선택
2. "과일향" 카테고리 펼치기 → "베리류" 선택
3. 총 2개 선택 → "다음" 버튼 활성화 → 완료 (30초)
```

#### 시나리오 2: 중급자 (구체적 선택)
```
1. "과일향" 카테고리 → "베리류" 선택 → "딸기", "블루베리" 구체화
2. "단맛" 카테고리 → "캐러멜" 선택
3. "견과류" 카테고리 → "아몬드" 선택
4. 총 4개 구체적 선택 → 완료 (1-2분)
```

#### 시나리오 3: 전문가 (세밀한 분석)
```
1. 검색: "발효" → "와인향", "뷰티르산" 선택
2. "로스팅" → "브라운 로스트" 선택
3. "기타" → "페놀" (결점 향미) 선택
4. 총 6개 전문적 선택 → 완료 (2-3분)
```

### 접근성 지원
- **초보자 가이드**: "💡 처음이라면 인기 향미에서 2-3개만 선택해보세요"
- **향미 설명**: 각 향미 옆 (?) 아이콘으로 툴팁 제공
- **검색 기능**: 85개 중 원하는 향미 빠른 찾기
- **되돌리기**: 선택 실수 시 쉬운 해제

---

## 🎨 UI 컴포넌트 (Tamagui)

### 핵심 컴포넌트
- **CategoryCollapsible**: 9개 대분류 접기/펼치기
- **FlavorHierarchySelect**: Level 2/3 계층 선택
- **PopularFlavorChips**: 상단 인기 향미 칩
- **FlavorSearchBar**: 향미 검색 및 필터링
- **SelectedFlavorPreview**: 선택된 향미 가로 스크롤 프리뷰

### 스타일링 시스템
```typescript
const CategoryHeader = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$md',
  backgroundColor: '$gray1',
  borderRadius: '$3',
  pressStyle: { backgroundColor: '$gray2' },
});

const Level2Checkbox = styled(XStack, {
  alignItems: 'center',
  padding: '$sm',
  marginLeft: '$md',
  variants: {
    state: {
      normal: { opacity: 1 },
      disabled: { opacity: 0.6, backgroundColor: '$gray3' },
      selected: { backgroundColor: '$cupBlue', color: 'white' }
    }
  }
});

const Level3Options = styled(YStack, {
  marginLeft: '$xl',
  paddingLeft: '$md',
  borderLeftColor: '$gray6',
  borderLeftWidth: 1,
  animation: 'fadeIn',
});

const PopularChip = styled(Button, {
  size: '$sm',
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$6',
  pressStyle: { scale: 0.95 },
});
```

---

## 📈 성능 최적화

### 대용량 데이터 처리
```typescript
// 85개 향미 효율적 렌더링
const FlavorList = memo(({ category, onSelect }) => {
  const [expandedItems, setExpandedItems] = useState(new Set())
  
  // 가상화 리스트 사용 (긴 카테고리의 경우)
  const renderItem = useCallback(({ item, index }) => (
    <FlavorItem
      key={item.id}
      flavor={item}
      isExpanded={expandedItems.has(item.id)}
      onSelect={onSelect}
      onToggleExpand={handleToggleExpand}
    />
  ), [expandedItems, onSelect])
  
  return <FlatList data={category.items} renderItem={renderItem} />
})

// 검색 최적화 (Debouncing)
const useFlavorSearch = (query: string, delay = 300) => {
  const [results, setResults] = useState([])
  
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
      const filtered = FLAVOR_DATABASE.filter(flavor =>
        flavor.nameKo.includes(searchQuery) ||
        flavor.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flavor.description.includes(searchQuery)
      )
      setResults(filtered)
    }, delay),
    [delay]
  )
  
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])
  
  return results
}
```

### 메모리 관리
- **지연 로딩**: 카테고리 별 Level 3 데이터 지연 로딩
- **상태 최적화**: 선택 상태만 메모리에 유지, 전체 데이터는 캐시
- **컴포넌트 최적화**: React.memo와 useMemo 적극 활용

---

## 🔗 네비게이션 & 모드 분기

### 이전 화면
- **Cafe 모드**: CoffeeInfoScreen
- **HomeCafe 모드**: BrewSetupScreen (브루잉 설정 완료)

### 다음 화면 (모드 공통)
- **SensoryExpressionScreen**: 감각적 표현 화면

### 데이터 전달
```typescript
const handleNext = () => {
  const flavorData = {
    selected_flavors: getSelectedFlavors(),
    selection_duration: Date.now() - startTime,
    selection_method: usedQuickSelect ? 'quick' : 'detailed'
  }
  
  // 모든 모드 공통으로 다음 화면 이동
  navigation.navigate('SensoryExpression', {
    ...previousData,
    flavor_selection: flavorData
  })
}
```

---

## 🧪 테스트 시나리오

### 기능 테스트
1. **계층 선택**: Level 2 → Level 3 선택 로직 정확성
2. **검색 기능**: 85개 향미 중 정확한 검색 결과
3. **인기 향미**: 사용 빈도 기반 정확한 추천
4. **상태 관리**: 복잡한 선택 상태 일관성

### 사용성 테스트
1. **초보자**: 인기 향미만으로 빠른 완성 (30초)
2. **중급자**: Level 2 중심 적절한 선택 (1-2분)
3. **전문가**: Level 3 세밀한 분석 (2-3분)
4. **접근성**: 시각장애, 색각이상 사용자 지원

### 성능 테스트
1. **대용량 렌더링**: 85개 향미 부드러운 렌더링
2. **검색 응답속도**: 300ms 이내 검색 결과
3. **메모리 사용량**: 장시간 사용 시 메모리 누수 없음

---

## 🚀 향후 확장 계획

### Phase 2 개선사항
- **향미 강도**: 1-5단계 강도 선택 기능
- **AI 추천**: 개인 취향 기반 향미 추천
- **시각화**: 선택한 향미의 레이더 차트 표시
- **소셜 기능**: 다른 사용자와 향미 비교

### Phase 3 고급 기능
- **커스텀 향미**: 사용자 정의 향미 추가
- **지역별 향미**: 문화권별 향미 표현 차이
- **계절별 추천**: 시즌별 인기 향미 하이라이트

---

## 📊 주요 혁신사항 요약

### 🔄 이번 통합에서 확정된 내용
1. **SCA 완전 준수**: 9개 대분류, 85개 향미 국제 표준 적용
2. **3단계 계층**: Level 1(대분류) → Level 2(중분류) → Level 3(소분류)
3. **유연한 선택**: Level 2 기본, Level 3 선택적 구체화
4. **접근성 향상**: 초보자부터 전문가까지 모든 레벨 지원
5. **스마트 추천**: 인기 향미 기반 빠른 선택 옵션

### 🎯 핵심 가치 제안
- **전문성**: SCA 국제 표준 완전 준수로 전문적 향미 분석
- **접근성**: 한국어 친화적 표현과 단계별 가이드
- **효율성**: 초보자 30초, 전문가 3분 내 완성
- **확장성**: 개인 취향 데이터 축적으로 AI 추천 기반 마련
- **국제성**: 글로벌 커피 커뮤니티와 소통 가능한 표준 사용

---

**✅ 문서 완성 상태**: SCA 완전판 통합 완료, 구현 준비 완료  
**📋 다음 단계**: SensoryExpression 화면 연계 개발  
**🔗 관련 문서**: TF_Screen_CoffeeInfo.md, TF_Screen_SensoryExpression.md  
**📝 변경이력**: 
- 2025-08-01: SCA Flavor Wheel 완전판 85개 향미 통합
- 2025-08-01: 3단계 계층 선택 시스템 상세 설계
- 2025-08-01: 초보자-전문가 지원 접근성 시스템 추가
- 2025-08-01: 인기 향미 추천 및 검색 기능 통합