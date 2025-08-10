# TF_Screen_BrewSetup - 브루잉 설정 화면

> TastingFlow의 모드별 사용자 플로우에서 사용되는 브루잉 설정 화면 (통합 사양서)

## 📱 화면 개요

**구현 파일**: `[screens]/tasting/BrewSetupScreen`  
**역할**: TastingFlow 내 모드별 브루잉 설정 및 추출 레시피 기록
**소요시간**: 2-3분
**적용 모드**: HomeCafe Mode (43% 진행률)
**최종 업데이트**: 2025-08-01 (차이점 분석 및 통합 완료)

## 🎯 기능 정의

### 기술적 목표
- TastingFlow 모드별 추출 레시피 관리 시스템
- 정밀한 추출 변수 기록 및 추적 기능
- 직관적인 키패드 입력 방식의 레시피 설정
- HomeCafe Mode 전용 최적화된 브루잉 경험 제공

### 핵심 기능 (2025-07-29 최신 결정사항 반영)
- **키패드 입력 시스템**: 직접 입력 방식으로 원두량 조정 (기본값 20g)
- **비율 프리셋 버튼**: 1:15~1:18 범위 7개 세분화된 선택 옵션
- **실시간 자동 계산**: 원두량 변경 시 비율 유지 물량 자동 계산
- **개인 레시피 시스템**: AsyncStorage 기반 레시피 저장/로드
- **분쇄도 세팅**: 브랜드, 그라인더 모델, 세팅 직접 입력

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (모드별 상이) + "브루잉 설정"
├── 드리퍼 선택 섹션
│   └── 4개 드리퍼 그리드 (V60, Kalita Wave, Origami, April)
├── 레시피 설정 섹션 (6-Field 구성)
│   ├── 1️⃣ 비율 프리셋 버튼
│   │   └── [1:15] [1:15.5] [1:16] [1:16.5] [1:17] [1:17.5] [1:18]
│   ├── 2️⃣ 키패드 입력 시스템
│   │   ├── 원두량: 직접 입력 (기본값 20g)
│   │   └── 물량: 자동 계산 표시
│   ├── 3️⃣ 물 온도: 입력 필드 (°C)
│   ├── 4️⃣ 분쇄도 세팅: "브랜드, 모델, 세팅" 직접 입력
│   ├── 5️⃣ 추출 타이머
│   │   ├── 1차 추출 시간: 블룸 시간 (초)
│   │   ├── 총 시간: 시작/정지 버튼
│   │   └── 랩타임: 다단계 기록
│   └── 6️⃣ 간단 노트: 한 줄 메모
├── 개인 레시피 관리
│   ├── "나의 커피" 저장 버튼
│   └── 저장된 레시피 불러오기
└── Footer: "다음" Button
```

### 🎛️ 핵심 UI 혁신

#### 1. 키패드 입력 시스템 (2025-07-29 결정)
- **직접 입력**: 키패드 방식으로 원두량 입력
- **기본값**: 20g (표준 1인분)
- **범위**: 15-30g 권장
- **검증**: 물리적으로 불가능한 값 입력 방지

#### 2. 비율 중심 접근 (세분화)
- **7개 프리셋**: 1:15, 1:15.5, 1:16, 1:16.5, 1:17, 1:17.5, 1:18
- **설명 표시**: 
  - 1:15 - "진한 맛"
  - 1:16 - "균형"
  - 1:17 - "순한 맛"  
  - 1:18 - "가벼운 맛"
- **즉시 적용**: 버튼 터치 시 실시간 물량 계산

#### 3. 분쇄도 세팅 시스템 (신규 추가)
- **입력 형식**: "브랜드, 그라인더 모델, 세팅"
- **예시**: "코만단도, C40 MK4, 25 클릭"
- **자유 입력**: 사용자의 다양한 그라인더 환경 지원

## 💾 데이터 처리

### 입력 데이터
```typescript
interface CoffeeInfo {
  // 이전 화면에서 전달
  cafe_name: string;
  coffee_name: string;
  temperature: 'hot' | 'iced';
  // ... 기타 기본 정보
}
```

### 출력 데이터 (통합 버전)
```typescript
interface HomeCafeData {
  // 장비 설정
  dripper: PouroverDripper;        // 선택된 드리퍼 (4개 중)
  
  // 레시피 (통합된 6-Field)
  recipe: {
    coffee_amount: number;         // 원두량(g) - 키패드 입력
    water_amount: number;          // 물량(ml) - 자동 계산
    ratio: number;                 // 비율 (15-18, 0.5 단위)
    water_temp?: number;           // 물 온도(°C)
    grind_setting?: string;        // 분쇄도 세팅 (신규)
    brew_times: {                  // 추출 시간 (개선)
      first_pour_time?: number;    // 1차 추출 시간 (블룸)
      total_time?: number;         // 총 추출 시간(초)
      lap_times?: number[];        // 다단계 랩타임
    };
  };
  
  // 메모
  quick_note?: string;             // 한 줄 간단 메모
  
  // 개인 레시피 저장
  saved_recipe?: {
    name: "나의 커피";
    coffee_amount: number;
    water_amount: number;
    ratio: number;
    grind_setting?: string;
  };
}
```

### 드리퍼 열거형 (확정된 4개)
```typescript
enum PouroverDripper {
  V60 = 'V60',
  KALITA_WAVE = 'Kalita Wave',
  ORIGAMI = 'Origami',
  APRIL = 'April'
}
```

### 영구 저장 (AsyncStorage)
```typescript
const SAVED_RECIPE_KEY = 'homecafe_my_coffee_recipe';

// 레시피 저장 (분쇄도 세팅 포함)
await AsyncStorage.setItem(SAVED_RECIPE_KEY, JSON.stringify({
  name: "나의 커피",
  coffee_amount: currentRecipe.coffee_amount,
  water_amount: currentRecipe.water_amount,
  ratio: currentRecipe.ratio,
  grind_setting: currentRecipe.grind_setting,
  saved_at: new Date().toISOString()
}));
```

## 🔄 사용자 인터랙션

### 주요 액션
1. **드리퍼 선택**: 4개 옵션 중 하나 선택 (V60, Kalita Wave, Origami, April)
2. **원두량 입력**: 키패드로 직접 입력 (기본값 20g)
3. **비율 선택**: 7개 세분화된 프리셋 버튼으로 즉시 비율 적용
4. **분쇄도 입력**: "브랜드, 모델, 세팅" 형식으로 입력
5. **타이머 사용**: 1차 추출(블룸) + 총시간 + 랩타임 기록
6. **레시피 저장**: "나의 커피"로 개인 레시피 저장

### 인터랙션 플로우
```
드리퍼 선택 → 원두량 입력 → 비율 선택 → 분쇄도 입력 → 타이머 시작 → 메모 작성 → 저장/다음
```

### 스마트 기본값
- **원두량**: 20g (표준 1인분)
- **비율**: 1:16 (가장 인기있는 비율)
- **물 온도**: 92°C (일반적인 추출 온도)

## 📊 드리퍼 시스템 (확정)

### 지원되는 드리퍼 (4종)
```typescript
enum PouroverDripper {
  V60 = 'V60',              // 가장 인기
  KALITA_WAVE = 'Kalita Wave',  // 안정적 추출
  ORIGAMI = 'Origami',          // 다재다능
  APRIL = 'April'               // 균형 잡힌 맛
}
```

### 드리퍼별 특성
- **시각적 구분**: 각 드리퍼 고유 아이콘
- **추천 레시피**: 드리퍼별 최적 비율 제안
- **통계 연동**: 드리퍼별 사용 통계 제공

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **DripperGrid**: 4개 드리퍼 선택 그리드
- **KeypadInput**: 원두량 키패드 입력 컴포넌트
- **RatioPresetButtons**: 7개 비율 프리셋 버튼
- **GrindSettingInput**: 분쇄도 세팅 입력 필드
- **BrewTimer**: 1차추출 + 총시간 + 랩타임 기록
- **RecipeSaver**: 개인 레시피 저장/불러오기

## 🔗 네비게이션

### 이전 화면
- **CoffeeInfoScreen**: 커피 기본 정보 입력 완료

### 다음 화면
- **FlavorSelection**: 향미 선택 화면

### 조건부 네비게이션
- **HomeCafe Mode**: 필수 진입 (43% 진행률)
- **Cafe Mode**: 건너뛰기 (간단한 정보만 필요)

## 📈 성능 최적화

### 실시간 계산 최적화
```typescript
// Debounced 계산으로 성능 향상
const debouncedCalculation = useMemo(
  () => debounce((coffee: number, ratio: number) => {
    setWaterAmount(Math.round(coffee * ratio));
  }, 100),
  []
);
```

### 메모리 관리
- **타이머 정리**: 컴포넌트 언마운트 시 타이머 정리
- **상태 최적화**: 불필요한 리렌더링 방지
- **레시피 캐싱**: 자주 사용하는 설정 캐시

## 🧪 테스트 시나리오

### 기능 테스트
1. **키패드 입력**: 원두량 입력 시 물량 자동 계산
2. **비율 선택**: 7개 프리셋 버튼 선택 시 즉시 적용
3. **분쇄도 입력**: 자유 형식 입력 및 저장 검증
4. **레시피 저장**: 저장/불러오기 정상 동작
5. **타이머**: 1차 추출 + 총시간 정확한 측정

### 사용성 테스트
1. **홈카페 초보**: 기본값으로도 충분한 기록 가능
2. **고급 사용자**: 세밀한 분쇄도 설정으로 실험 지원
3. **반복 사용자**: 저장된 레시피로 빠른 재현

## 🚀 확장 가능성

### Phase 2 개선사항
- **그라인더 DB**: 인기 그라인더 모델 자동완성
- **추출 곡선**: 시간별 추출량 그래프
- **레시피 공유**: 다른 사용자와 레시피 공유

### Phase 3 고급 기능
- **스마트 추천**: AI 기반 최적 레시피 제안
- **장비 연동**: 스마트 저울/온도계 연동
- **실험 분석**: 변수별 맛 변화 분석

## 🎯 핵심 가치

### 차별화 요소
- **TastingFlow 통합**: 모드별 사용자 플로우에 최적화된 UI
- **정밀한 기록**: 분쇄도까지 포함하는 상세 레시피 관리
- **사용성**: 키패드 입력과 프리셋의 절묘한 조합
- **모드 호환성**: HomeCafe Mode 최적화

### 사용자 가치
- **홈카페 애호가** 레시피 실험 기록
- **체계적 관리** 커피 추출 변수 추적
- **향상 경험** 맛의 재현성 향상

## 📋 문서 통합 히스토리

### 통합된 문서들
- ✅ HOMECAFE_SCREEN.md (UI 구조 및 컴포넌트)
- ✅ homecafe-mode.md (모드 개념 및 플로우)
- ✅ HOMECAFE_MODE_WORKFLOW.md (상세 로직 및 데이터)
- ✅ TastingFlow_노트_모음.md (최신 결정사항)
- ✅ checkpoint-2025-07-29-14-30.md (드리퍼 4개 확정)

### 주요 변경사항
- **드리퍼**: 10개/6개 → **4개로 확정** (V60, Kalita Wave, Origami, April)
- **입력 방식**: 다이얼 → **키패드 직접 입력**
- **비율**: 4개 기본 → **7개 세분화** 유지
- **분쇄도**: 단순 선택 → **"브랜드, 모델, 세팅" 직접 입력**
- **타이머**: 단순 → **1차 추출(블룸) + 총시간 + 랩타임**

---

**문서 버전**: 2.0 (통합 완료)  
**최종 수정**: 2025-08-01  
**관련 문서**: TF_Screen_CoffeeInfo.md, TF_Screen_FlavorSelection.md  
**구현 상태**: 📋 통합 스펙 완료 (구현 대기)