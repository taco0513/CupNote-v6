# CupNote v6 Component Library

## 📚 Component Categories

### 1. Input Components

#### CascadeAutocomplete
```typescript
interface CascadeAutocompleteProps {
  mode: 'cafe' | 'homecafe';
  steps: 2 | 3;
  onSelect: (value: Selection) => void;
}
```
- **용도**: 계층적 자동완성
- **사용처**: CoffeeInfo 화면

#### FlavorWheel
```typescript
interface FlavorWheelProps {
  categories: 9;
  totalFlavors: 85;
  minSelection: 1;
  maxSelection?: number;
  onSelect: (flavors: string[]) => void;
}
```
- **용도**: SCA Flavor Wheel 향미 선택
- **사용처**: FlavorSelection 화면

#### SensoryExpressionGrid
```typescript
interface SensoryExpressionGridProps {
  categories: 6;
  expressionsPerCategory: 7;
  maxPerCategory: 3;
  onSelect: (expressions: string[]) => void;
}
```
- **용도**: 한국어 감각 표현 선택
- **사용처**: SensoryExpression 화면

#### MouthfeelSlider
```typescript
interface MouthfeelSliderProps {
  metric: 'body' | 'acidity' | 'sweetness' | 'finish' | 'bitterness' | 'balance';
  min: 1;
  max: 5;
  defaultValue: 3;
  onChange: (value: number) => void;
}
```
- **용도**: 감각 수치 평가
- **사용처**: SensoryMouthFeel 화면

---

### 2. Brew Components (HomeCafe 전용)

#### DripperSelector
```typescript
interface DripperSelectorProps {
  options: ['V60', 'Kalita Wave', 'Origami', 'April'];
  onSelect: (dripper: string) => void;
}
```
- **용도**: 드리퍼 선택
- **사용처**: BrewSetup 화면

#### RatioPreset
```typescript
interface RatioPresetProps {
  ratios: ['1:15', '1:15.5', '1:16', '1:16.5', '1:17', '1:17.5', '1:18'];
  onSelect: (ratio: string) => void;
  onCoffeeAmountChange: (grams: number) => void;
}
```
- **용도**: 커피:물 비율 설정
- **사용처**: BrewSetup 화면

#### BrewTimer
```typescript
interface BrewTimerProps {
  bloomTime: number;
  totalTime: number;
  onStart: () => void;
  onStop: () => void;
  onLap: (time: number) => void;
}
```
- **용도**: 추출 타이머
- **사용처**: BrewSetup 화면

---

### 3. Navigation Components

#### ProgressBar
```typescript
interface ProgressBarProps {
  currentStep: number;
  totalSteps: 6 | 7;
  percentage: number;
}
```
- **용도**: 진행률 표시
- **사용처**: 모든 TastingFlow 화면

#### StepIndicator
```typescript
interface StepIndicatorProps {
  current: number;
  total: number;
  label?: string;
}
```
- **용도**: 현재 단계 표시
- **사용처**: 화면 헤더

---

### 4. Display Components

#### MatchScore
```typescript
interface MatchScoreProps {
  score: number; // 0-100
  roasterNotes: string[];
  userSelections: string[];
  displayType: 'percentage' | 'chart' | 'both';
}
```
- **용도**: 로스터 노트와 비교
- **사용처**: Result 화면

#### ComparisonChart
```typescript
interface ComparisonChartProps {
  type: 'venn' | 'radar' | 'bar';
  data: ComparisonData;
  size: 'small' | 'medium' | 'large';
}
```
- **용도**: 시각적 비교
- **사용처**: Result 화면

---

### 5. Layout Components

#### CollapsibleSection
```typescript
interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}
```
- **용도**: Progressive Disclosure
- **사용처**: CoffeeInfo, 각종 선택 화면

#### BottomActionBar
```typescript
interface BottomActionBarProps {
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
```
- **용도**: 화면 하단 액션
- **사용처**: 모든 입력 화면

---

### 6. Feedback Components

#### ChipSelector
```typescript
interface ChipSelectorProps {
  options: string[];
  multiple?: boolean;
  maxSelection?: number;
  onSelect: (selected: string[]) => void;
}
```
- **용도**: 빠른 선택
- **사용처**: PersonalNotes, 각종 태그 선택

#### EmotionTag
```typescript
interface EmotionTagProps {
  emotions: Array<{
    emoji: string;
    label: string;
  }>;
  onSelect: (emotion: string) => void;
}
```
- **용도**: 감정 표현
- **사용처**: PersonalNotes 화면

---

## 🎨 Component States

### Interactive States
- **Default**: 기본 상태
- **Hover**: 마우스 오버 (웹)
- **Pressed**: 터치/클릭 중
- **Focused**: 포커스 상태
- **Disabled**: 비활성화
- **Loading**: 로딩 중
- **Error**: 오류 상태
- **Success**: 성공 상태

### Visual Variants
- **Primary**: 주요 액션
- **Secondary**: 보조 액션
- **Outline**: 윤곽선만
- **Ghost**: 배경 없음
- **Filled**: 채워진 상태

---

## 📐 Component Sizing

### Size Scale
```css
--size-xs: 24px;  /* 아이콘, 작은 버튼 */
--size-sm: 32px;  /* 칩, 태그 */
--size-md: 44px;  /* 기본 터치 타겟 */
--size-lg: 56px;  /* 큰 버튼 */
--size-xl: 64px;  /* FAB, 주요 액션 */
```

### Touch Targets
- **최소 크기**: 44 × 44pt (iOS HIG)
- **권장 크기**: 48 × 48dp (Material)
- **여백**: 최소 8pt 간격

---

## 🔄 Component Lifecycle

### Mount
1. Initial render
2. Data fetching
3. Animation in

### Update
1. Props change
2. State update
3. Re-render

### Unmount
1. Animation out
2. Cleanup
3. Remove from DOM

---

## 📝 Usage Guidelines

### Do's ✅
- 일관된 컴포넌트 사용
- 접근성 고려
- 반응형 디자인 적용
- 에러 상태 처리

### Don'ts ❌
- 커스텀 스타일 남용
- 중복 컴포넌트 생성
- 일관성 없는 패턴
- 접근성 무시

---

## 🚀 Next Steps

1. **Phase 1**: Core Components
   - CascadeAutocomplete
   - FlavorWheel
   - ProgressBar

2. **Phase 2**: Advanced Components
   - SensoryExpressionGrid
   - BrewTimer
   - ComparisonChart

3. **Phase 3**: Polish
   - Animations
   - Transitions
   - Micro-interactions

---

*Last Updated: 2025-08-08*