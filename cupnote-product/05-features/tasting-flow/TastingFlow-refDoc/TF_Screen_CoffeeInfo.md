# 📱 TF_Screen_CoffeeInfo

**문서타입**: TastingFlow 화면 설계서  
**화면명**: CoffeeInfo 화면 (커피 정보 입력)  
**모드 지원**: Cafe모드, HomeCafe모드  
**작성일**: 2025-08-01  
**문서상태**: ✅ 통합 완료  

---

## 📋 개요 & 목적

**화면 역할**: TastingFlow의 2단계 - 커피 기본 정보 수집  
**구현 파일**: `[screens]/tasting/CoffeeInfoScreen`  
**소요시간**: 1-2분  
**진행률**: 29% (전체 TastingFlow 중)  

### 주요 목표
- 테이스팅할 커피의 기본 메타데이터 수집
- 모드별 맞춤 입력 필드 제공
- 자동완성을 통한 입력 효율성 극대화
- 데이터베이스 자동 확장 및 품질 관리

---

## 🎯 모드별 차별화

### 🏪 Cafe 모드
**필수 정보**: 카페명, 로스터명, 커피명, 온도  
**자동완성 순서**: 카페 → 로스터 → 커피 (3단계 Cascade)  
**사용 시나리오**: 카페에서 주문한 커피 테이스팅  

```typescript
interface CafeModeData {
  mode: 'cafe';
  cafe_name: string;              // 필수 - 카페명
  roaster_name: string;           // 필수 - 로스터명
  coffee_name: string;            // 필수 - 커피명
  temperature: 'hot' | 'iced';    // 필수 - 온도
  
  // 선택정보 (접힌 상태 기본)
  origin?: string;                // 원산지
  variety?: string;               // 품종
  processing?: string;            // 가공방식
  roast_level?: string;           // 로스팅 레벨
  altitude?: number;              // 고도 (NEW)
}
```

### 🏠 HomeCafe 모드
**필수 정보**: 로스터명, 커피명, 온도 (카페명 제외)  
**자동완성 순서**: 로스터 → 커피 (2단계 Cascade)  
**사용 시나리오**: 집에서 구매한 원두로 추출  

```typescript
interface HomeCafeModeData {
  mode: 'homecafe';
  // 카페명 없음 - 핵심 차별화
  roaster_name: string;           // 필수 - 로스터명
  coffee_name: string;            // 필수 - 커피명
  temperature: 'hot' | 'iced';    // 필수 - 온도
  
  // 선택정보 (접힌 상태 기본)
  origin?: string;                // 원산지
  variety?: string;               // 품종
  processing?: string;            // 가공방식
  roast_level?: string;           // 로스팅 레벨
  altitude?: number;              // 고도 (NEW)
}
```

---

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (29%) + "커피 정보"
├── 모드 표시 (Cafe/HomeCafe 아이콘)
├── 필수 정보 섹션
│   ├── [Cafe모드만] 카페명 (AutocompleteInput)
│   ├── 로스터명 (AutocompleteInput) 
│   ├── 커피명 (AutocompleteInput)
│   └── 온도 선택 (Hot/Iced Toggle)
├── 선택 정보 섹션 (Progressive Disclosure)
│   ├── 📂 "추가 정보" (접기/펼치기)
│   ├── 원산지 (Input)
│   ├── 품종 (Input) 
│   ├── 가공방식 (Input)
│   ├── 로스팅 레벨 (Input)
│   └── 고도/Altitude (Input) ⭐NEW
└── Footer: "다음" Button (플로팅)
```

### 핵심 UX 개선사항
- **Progressive Disclosure**: 선택정보는 기본 접힌 상태
- **Cascade 자동완성**: 상위 선택에 따른 하위 필터링
- **Smart Defaults**: DB에 커피 정보 있으면 선택정보 자동입력
- **DB 자동확장**: 새로운 커피 → 유저 수동입력 → DB 자동추가 → 관리자 검증

---

## 🔄 자동완성 시스템 (핵심 혁신)

### Cascade 자동완성 로직

#### Cafe 모드 (3단계)
```typescript
// 1단계: 카페명 입력 → 해당 카페의 로스터 목록 필터링
const roastersByCafe = await searchRoasters({ cafe_id: selectedCafe.id });

// 2단계: 로스터 선택 → 해당 카페+로스터의 커피 목록 필터링  
const coffeesByRoaster = await searchCoffees({ 
  cafe_id: selectedCafe.id,
  roaster_id: selectedRoaster.id 
});

// 3단계: 커피 선택 → 선택정보 자동입력
if (selectedCoffee.exists_in_db) {
  autoFillOptionalFields(selectedCoffee);
}
```

#### HomeCafe 모드 (2단계)
```typescript
// 1단계: 로스터명 입력 → 해당 로스터의 커피 목록 필터링
const coffeesByRoaster = await searchCoffees({ 
  roaster_id: selectedRoaster.id 
});

// 2단계: 커피 선택 → 선택정보 자동입력
if (selectedCoffee.exists_in_db) {
  autoFillOptionalFields(selectedCoffee);
}
```

### 데이터베이스 자동확장 워크플로우
```typescript
const handleCoffeeSelection = async (coffeeInput: string) => {
  const existingCoffee = await searchCoffee(coffeeInput);
  
  if (!existingCoffee) {
    // DB에 없는 새로운 커피
    const newCoffee = {
      name: coffeeInput,
      roaster_id: selectedRoaster.id,
      cafe_id: selectedCafe?.id, // Cafe모드만
      auto_added: true,
      needs_validation: true,
      added_by_user: currentUser.id,
      created_at: new Date()
    };
    
    // 1. DB에 자동 추가
    await addCoffeeToDatabase(newCoffee);
    
    // 2. 관리자에게 검증 알림
    await sendAdminNotification({
      type: 'new_coffee_validation',
      coffee: newCoffee,
      message: `새로운 커피 "${coffeeInput}"가 추가되었습니다. 데이터 검증이 필요합니다.`
    });
    
    // 3. 유저가 선택정보 수동입력 가능하도록 UI 활성화
    setAllowManualInput(true);
  }
};
```

---

## 💾 데이터 처리

### 통합 출력 데이터 구조
```typescript
interface CoffeeInfoData {
  // 메타데이터
  mode: 'cafe' | 'homecafe';
  timestamp: Date;
  
  // 필수 정보 (모드별 차이)
  cafe_name?: string;             // Cafe모드만 필수
  roaster_name: string;           // 공통 필수
  coffee_name: string;            // 공통 필수  
  temperature: 'hot' | 'iced';    // 공통 필수
  
  // 선택 정보 (Progressive Disclosure)
  optional_info?: {
    origin?: string;              // 원산지
    variety?: string;             // 품종
    processing?: string;          // 가공방식
    roast_level?: string;         // 로스팅 레벨
    altitude?: number;            // 고도 ⭐NEW
  };
  
  // DB 확장 정보
  is_new_coffee?: boolean;        // 새로 추가된 커피 여부
  auto_filled?: boolean;          // 선택정보 자동입력 여부
}
```

### 데이터 소스 우선순위
1. **RealmService (로컬)**: 사용자 기록 우선 표시
2. **SupabaseSearch (클라우드)**: 전체 사용자 데이터
3. **UserHistory**: 개인 입력 히스토리
4. **AdminValidated**: 관리자 검증 완료된 고품질 데이터

---

## 📱 UI 컴포넌트

### 핵심 컴포넌트
- **ModeIndicator**: 현재 모드 시각적 표시  
- **CascadeAutocompleteInput**: 연쇄 자동완성 입력
- **ProgressiveDisclosure**: 접기/펼치기 선택정보 섹션
- **TemperatureToggle**: Hot/Iced 토글 버튼
- **NewCoffeeHandler**: 새 커피 추가 처리 컴포넌트

### Tamagui 스타일링
```typescript
const ModeIndicator = styled(XStack, {
  alignItems: 'center',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  backgroundColor: '$cupBlue',
  borderRadius: '$2',
});

const CollapsibleSection = styled(YStack, {
  marginTop: '$md',
  padding: '$md',
  backgroundColor: '$gray1',
  borderRadius: '$3',
  animation: 'fadeIn',
});
```

---

## 🔗 네비게이션 & 분기

### 이전 화면
- **ModeSelectionScreen**: 모드 선택 완료 후 진입

### 다음 화면 (모드별 분기)
```typescript
const handleNext = () => {
  const { mode } = tastingStore;
  switch (mode) {
    case 'cafe':
      navigation.navigate('FlavorSelection');
      break;
    case 'homecafe':
      navigation.navigate('BrewSetup'); // 브루잉 설정
      break;
  }
};
```

---

## 📈 성능 최적화

### 자동완성 최적화
- **Debouncing**: 300ms 지연으로 과도한 검색 방지
- **Intelligent Caching**: Cascade 결과 단계별 캐싱
- **Lazy Loading**: 스크롤 시 추가 결과 로딩
- **Background Sync**: 백그라운드에서 DB 업데이트

### 메모리 관리
- **컴포넌트 언마운트**: 검색 상태 정리
- **Cascade State**: 단계별 상태 효율적 관리

---

## 🧪 테스트 시나리오

### 기능 테스트
1. **Cascade 자동완성**: 카페→로스터→커피 순서 정확성
2. **모드별 차이**: Cafe모드 카페명, HomeCafe모드 카페명 없음
3. **DB 자동확장**: 새 커피 추가→관리자 알림→검증 워크플로우
4. **Progressive Disclosure**: 선택정보 접기/펼치기 동작

### 사용성 테스트  
1. **첫 사용자**: DB 없어도 수동입력으로 완성 가능
2. **재방문자**: 이전 기록 기반 빠른 자동완성
3. **바리스타**: 전문 정보(고도 등) 세밀 입력 가능

---

## 🚀 향후 확장 계획

### Phase 2 개선
- **사진 첨부**: 커피/카페 이미지 업로드
- **QR/바코드**: 원두 포장지 스캔 자동입력
- **GPS 연동**: 카페 위치 자동 감지

### Phase 3 고급 기능
- **OCR 텍스트 인식**: 메뉴판 자동 추출
- **AI 추천**: 과거 취향 기반 커피 추천
- **데이터 품질 스코어**: 사용자 기여도 평가

---

## 📊 주요 개선사항 요약

### 🔄 이번 통합에서 확정된 내용
1. **모드별 차별화**: Cafe모드(카페명+로스터명), HomeCafe모드(로스터명만)
2. **Cascade 자동완성**: 단계별 필터링으로 정확도 향상
3. **Progressive Disclosure**: 선택정보 접기로 UI 간소화
4. **DB 자동확장**: 새 커피 자동추가 + 관리자 검증 워크플로우
5. **고도 필드 추가**: 전문성 향상을 위한 선택정보 확장

### 🎯 핵심 가치 제안
- **효율성**: 2분 내 완료 + 자동완성으로 입력 부담 최소화  
- **정확성**: Cascade 필터링으로 데이터 품질 향상
- **확장성**: 사용자 기여 → DB 성장 → 품질 개선 선순환
- **전문성**: 바리스타급 세부정보 지원 (고도, 가공방식 등)

---

**✅ 문서 완성 상태**: 통합 완료, 구현 준비 완료  
**📋 다음 단계**: HomeCafe 브루잉 설정 화면 연계 개발  
**🔗 관련 문서**: TF_Screen_ModeSelection.md, TF_Screen_HomeCafe.md  
**📝 변경이력**: 
- 2025-08-01: 모드별 차별화 및 DB 자동확장 로직 추가
- 2025-08-01: Cascade 자동완성 시스템 상세 설계
- 2025-08-01: Progressive Disclosure 및 고도 필드 추가