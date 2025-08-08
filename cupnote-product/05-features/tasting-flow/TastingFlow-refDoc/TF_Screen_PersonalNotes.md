# 📱 TF_Screen_PersonalNotes

**문서타입**: TastingFlow 화면 설계서  
**화면명**: PersonalNotes 화면 (개인 노트 입력)  
**모드 지원**: 모든 TastingFlow 모드 공통  
**작성일**: 2025-08-01  
**문서상태**: ✅ Lab 모드 제거, 범용화 완료  

---

## 📋 개요 & 목적

**화면 역할**: TastingFlow의 6단계 - 자유형식 개인 노트 및 메모 작성  
**구현 파일**: `[screens]/tasting/PersonalNotesScreen`  
**소요시간**: 1-2분  
**진행률**: 94% (전체 TastingFlow 중)  

### 주요 목표
- 정량적 데이터를 정성적 데이터로 보완하는 시스템
- 자유 형식 텍스트 입력으로 개인적 경험 기록
- 빠른 입력을 위한 보조 도구 제공
- 개인화된 커피 경험 데이터 축적

---

## 🎯 개인 노트 시스템 (주관적 데이터)

### 설계 철학
- **자유도 우선**: 필수 입력 없이 완전 선택사항
- **감정 중심**: 논리적 분석보다 감정적 기록 우선
- **직관적 도구**: 빠른 입력을 위한 보조 도구 제공
- **컨텍스트 보존**: 시간, 장소 등 기억을 돕는 정보 자동 기록

### 입력 요소 구성

#### 1. 메인 텍스트 입력 (200자 제한)
- **다중 라인 텍스트**: 자유로운 형식의 개인적 경험 기록
- **실시간 카운터**: 글자 수 실시간 표시 (예: 15/200)
- **자동 저장**: 10초마다 드래프트 자동 저장
- **플레이스홀더**: "예) 아침에 마시기 좋은 부드러운 맛이었다..."

#### 2. 빠른 입력 도구 (선택사항)
**자주 사용하는 표현 (8개)**:
```
아침에 좋을 것 같다        다시 마시고 싶다
친구에게 추천하고 싶다      특별한 날에 어울린다
집중할 때 좋을 것 같다      편안한 느낌이다
새로운 경험이었다          기대보다 좋았다
```

#### 3. 감정 태그 시스템 (9개)
```
😊 만족    😍 최고    😌 편안함
🤔 흥미로움  😋 맛있음  ✨ 특별함
💭 생각나는  🎯 집중   ☕ 일상
```

#### 4. 컨텍스트 정보 (자동 기록)
- **작성 시간**: 현재 시간 자동 기록 (예: "오후 2:30")

---

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (94%) + "개인 노트"
├── 안내 메시지
│   ├── "이 커피에 대한 개인적인 생각을 자유롭게 적어보세요"
│   └── "특별한 순간이나 느낌을 기록해두면 좋은 추억이 됩니다"
├── 메인 입력 영역
│   ├── 텍스트 에리어 (다중 라인)
│   │   ├── 플레이스홀더: "예) 아침에 마시기 좋은 부드러운 맛이었다..."
│   │   ├── 글자 수 카운터: "15/200"
│   │   └── 키보드 타입: 기본 텍스트
│   └── 자동 저장 표시: "10초 전 자동 저장됨"
├── 빠른 입력 도구 (접기/펼치기)
│   ├── 자주 사용하는 표현 ▼
│   │   ├── 💬 "아침에 좋을 것 같다"  💬 "다시 마시고 싶다"
│   │   ├── 💬 "친구에게 추천하고 싶다"  💬 "특별한 날에 어울린다"
│   │   ├── 💬 "집중할 때 좋을 것 같다"  💬 "편안한 느낌이다"
│   │   └── 💬 "새로운 경험이었다"  💬 "기대보다 좋았다"
│   └── 감정 태그 ▼
│       ├── 😊 만족  😍 최고  😌 편안함
│       ├── 🤔 흥미로움  😋 맛있음  ✨ 특별함
│       └── 💭 생각나는  🎯 집중  ☕ 일상
├── 컨텍스트 정보 (자동 수집)
│   └── ⏰ 작성 시간: "오후 2:30"
└── Footer: "다음" Button (항상 활성화, 빈 내용도 허용)
```

### 핵심 UX 원칙

#### 1. 완전 선택적 입력
- **강제 없음**: 빈 상태로도 다음 단계 진행 가능
- **부담 최소화**: 선택적 입력으로 사용자 스트레스 해소
- **자유로운 표현**: 구조화되지 않은 자연스러운 기록

#### 2. 입력 지원 도구
- **빠른 표현**: 자주 사용하는 8개 표현 원터치 추가
- **감정 태그**: 9개 이모지로 간편한 감정 표현
- **자동 완성**: 이전 코멘트 패턴 기반 제안 (Phase 2)

#### 3. 스마트 보조 기능
- **자동 저장**: 입력 중 데이터 손실 방지
- **컨텍스트 수집**: 시간, 장소 정보 자동 기록
- **키보드 최적화**: 부드러운 키보드 표시/숨김

---

## 💾 데이터 처리

### 입력 데이터
```typescript
interface PreviousScreenData {
  // 공통 데이터
  coffee_info: CoffeeInfoData;
  selected_flavors: FlavorChoice[];
  sensory_expression: SensoryExpressionData;
  sensory_mouthfeel?: SensoryMouthFeelData;  // 선택적 (건너뛰기 가능)
  
  // 모드별 선택적 데이터
  homecafe_data?: HomeCafeData;
}
```

### 출력 데이터
```typescript
interface PersonalNotesData {
  // 주요 코멘트
  comment_text: string;                      // 메인 텍스트 (최대 200자)
  
  // 선택적 입력
  quick_expressions?: string[];              // 선택된 빠른 표현들
  emotion_tags?: EmotionTag[];              // 선택된 감정 태그들
  
  // 컨텍스트 정보 (자동 수집)
  context_info: {
    time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
    mood_before?: string;                    // 마시기 전 기분 (Phase 2)
  };
  
  // 메타데이터
  writing_duration: number;                  // 작성 소요 시간 (초)
  character_count: number;                   // 실제 글자 수
  created_at: Date;
  last_modified?: Date;                      // 수정된 경우
  auto_save_count: number;                   // 자동 저장 횟수
}

enum EmotionTag {
  SATISFIED = '😊',        // 만족
  AMAZING = '😍',          // 최고
  COMFORTABLE = '😌',      // 편안함
  INTERESTING = '🤔',      // 흥미로움
  DELICIOUS = '😋',        // 맛있음
  SPECIAL = '✨',          // 특별함
  MEMORABLE = '💭',        // 생각나는
  FOCUSED = '🎯',         // 집중
  DAILY = '☕'            // 일상
}
```

### 빠른 표현 데이터베이스
```typescript
const QUICK_EXPRESSIONS = [
  "아름에 좋을 것 같다",           // 시간대 추천
  "다시 마시고 싶다",             // 재구매 의향
  "친구에게 추천하고 싶다",        // 추천 의향  
  "특별한 날에 어울린다",          // 특별함
  "집중할 때 좋을 것 같다",        // 기능적 용도
  "편안한 느낌이다",              // 감정적 반응
  "새로운 경험이었다",            // 신선함
  "기대보다 좋았다"               // 기대치 비교
];

const EMOTION_CATEGORIES = {
  positive: ['😊', '😍', '😋', '✨'],      // 긍정적
  neutral: ['🤔', '💭', '☕'],            // 중립적  
  functional: ['🎯', '😌']               // 기능적
};
```

---

## 🔄 사용자 인터랙션

### 입력 시나리오

#### 시나리오 1: 간단 입력 (30초)
```
1. 텍스트 영역에 간단한 한 줄 입력
   "오늘 기분에 딱 맞는 커피였다"
2. 감정 태그 1개 선택: 😊 만족
3. 완료 (총 글자: 15자, 소요시간: 30초)
```

#### 시나리오 2: 상세 입력 (1-2분)
```
1. 메인 텍스트 작성 (100-150자)
   "아침 일찍 마셨는데 산미가 적당해서 좋았다. 
   어제 마신 원두보다 훨씬 부드럽고 단맛도 느껴졌다. 
   다음에 또 주문해봐야겠다."
2. 빠른 표현 2개 선택: "아침에 좋을 것 같다", "다시 마시고 싶다"
3. 감정 태그 2개 선택: 😊 만족, ☕ 일상
4. 완료 (총 글자: 78자, 소요시간: 1분 30초)
```

#### 시나리오 3: 건너뛰기 (즉시)
```
1. 텍스트 입력 없이 바로 "다음" 버튼 클릭
2. 빈 상태로 다음 화면 이동
3. 데이터: comment_text: "", 컨텍스트만 자동 기록
```

### 인터랙션 플로우
```
Option A: 건너뛰기 → 즉시 다음 화면
Option B: 자유 텍스트 입력 → 보조 도구 활용 → 컨텍스트 확인 → 다음 화면
```

### 입력 지원 기능
- **글자 수 카운터**: 실시간 200/200 표시
- **자동 저장**: 10초마다 드래프트 저장
- **키보드 최적화**: 텍스트 입력에 최적화된 키보드
- **실수 방지**: 뒤로가기 시 내용 손실 경고
- **원터치 추가**: 빠른 표현/감정 태그 탭으로 텍스트에 추가

---

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **MultiLineTextInput**: 200자 제한 다중 라인 입력
- **CharacterCounter**: 실시간 글자 수 표시
- **QuickExpressionChips**: 빠른 표현 선택 버튼들
- **EmotionTagGrid**: 감정 이모지 선택 그리드
- **ContextInfoCard**: 컨텍스트 정보 표시 카드
- **AutoSaveIndicator**: 자동 저장 상태 표시

### Tamagui 스타일링
```typescript
const NotesTextArea = styled(TextArea, {
  minHeight: 120,
  maxHeight: 200,
  backgroundColor: '$background',
  borderRadius: '$3',
  padding: '$md',
  fontSize: '$4',
  lineHeight: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  
  focusStyle: {
    borderColor: '$cupBlue',
    borderWidth: 2,
  },
  
  placeholderTextColor: '$placeholderColor',
});

const QuickExpressionChip = styled(Button, {
  size: '$2',
  backgroundColor: '$gray2',
  color: '$gray11',
  borderRadius: '$6',
  paddingHorizontal: '$sm',
  marginRight: '$xs',
  marginBottom: '$xs',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue',
        color: 'white',
      }
    }
  } as const,
  
  pressStyle: {
    scale: 0.98,
  },
});

const EmotionTag = styled(Button, {
  width: 48,
  height: 48,
  borderRadius: '$3',
  backgroundColor: '$gray1',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue20',
        borderWidth: 2,
        borderColor: '$cupBlue',
        scale: 1.1,
      }
    }
  } as const,
  
  pressStyle: {
    scale: 0.95,
  },
  
  animation: 'bouncy',
});

const ContextCard = styled(YStack, {
  padding: '$md',
  backgroundColor: '$gray1',
  borderRadius: '$3',
  marginVertical: '$sm',
  borderLeftWidth: 3,
  borderLeftColor: '$cupBlue',
});

const AutoSaveIndicator = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  
  variants: {
    status: {
      saving: { color: '$orange9' },
      saved: { color: '$green9' },
      error: { color: '$red9' }
    }
  }
});
```

---

## 📱 반응형 고려사항

### 키보드 처리
- **KeyboardAvoidingView**: 키보드 표시 시 입력 영역 보장
- **자동 스크롤**: 키보드로 가려진 영역 자동 스크롤
- **완료 버튼**: 키보드 완료 버튼으로 입력 완료
- **부드러운 전환**: 키보드 표시/숨김 시 자연스러운 애니메이션

### 화면 크기별 최적화
- **작은 화면**: 빠른 입력 도구 기본 접힘 상태
- **큰 화면**: 모든 도구 펼쳐서 표시
- **가로모드**: 입력 영역 확장, 도구는 측면 배치
- **태블릿**: 더 큰 텍스트 영역과 여백 활용

---

## 🔗 네비게이션

### 이전 화면
- **SensoryMouthFeelScreen**: 수치 평가 완료 (또는 건너뛰기)

### 다음 화면  
- **RoasterNotesScreen**: 로스터 노트 입력

### 데이터 전달
```typescript
const handleNext = () => {
  const notesData: PersonalNotesData = {
    comment_text: commentText.trim(),
    quick_expressions: selectedExpressions,
    emotion_tags: selectedEmotionTags,
    context_info: {
      time_of_day: getTimeOfDay(),
    },
    writing_duration: Date.now() - startTime,
    character_count: commentText.length,
    created_at: new Date(),
    auto_save_count: autoSaveCount
  }
  
  navigation.navigate('RoasterNotes', {
    ...previousData,
    personal_notes: notesData
  })
}
```

---

## 📈 성능 최적화

### 텍스트 입력 최적화
```typescript
// 디바운싱으로 자동 저장 최적화
const debouncedAutoSave = useMemo(
  () => debounce((text: string) => {
    saveDraft(text);
    setAutoSaveStatus('saved');
    incrementAutoSaveCount();
  }, 10000), // 10초마다 자동 저장
  []
);

// 글자 수 카운터 최적화
const characterCount = useMemo(() => {
  return commentText.length;
}, [commentText]);

// 메모리 누수 방지
useEffect(() => {
  return () => {
    debouncedAutoSave.cancel();
  };
}, [debouncedAutoSave]);

// 상태 업데이트 최적화
const handleTextChange = useCallback((text: string) => {
  if (text.length <= 200) {
    setCommentText(text);
    debouncedAutoSave(text);
  }
}, [debouncedAutoSave]);
```

### 상태 관리
- **로컬 상태**: 입력 중인 텍스트는 컴포넌트 로컬 상태로 관리
- **자동 저장**: 주기적으로 AsyncStorage에 드래프트 저장
- **메모리 효율**: 불필요한 렌더링 방지
- **컨텍스트 수집**: 앱 시작 시 한 번만 수집, 필요 시 업데이트

---

## 🧪 테스트 시나리오

### 기능 테스트
1. **글자 수 제한**: 200자 초과 입력 시 제한 동작
2. **자동 저장**: 10초 간격 드래프트 저장 확인
3. **데이터 복구**: 앱 종료 후 재실행 시 드래프트 복구
4. **빠른 입력**: 선택된 표현들이 텍스트에 올바르게 추가
5. **감정 태그**: 다중 선택 및 해제 정상 동작

### 사용성 테스트
1. **입력 편의성**: 키보드 표시/숨김 시 UI 적절성
2. **도구 활용도**: 빠른 입력 도구 사용 빈도 및 만족도
3. **감정 표현**: 감정 태그를 통한 만족도 향상 정도
4. **완성률**: 중도 이탈 없이 완성하는 비율 (90%+ 목표)

### 성능 테스트
1. **입력 응답성**: 텍스트 입력 시 지연 없는 반응
2. **메모리 사용량**: 장시간 입력 시 메모리 사용량 안정성
3. **자동 저장**: 주기적 저장으로 인한 성능 영향 없음
4. **키보드 최적화**: 키보드 표시/숨김 시 부드러운 전환

---

## 🚀 확장 가능성

### Phase 2 개선사항
- **STT 연동**: 음성-텍스트 변환 API 연동
- **스마트 제안**: 이전 코멘트 패턴 기반 텍스트 제안
- **템플릿 시스템**: 자주 사용하는 패턴 자동 수집 및 제안
- **감정 분석**: 입력한 텍스트의 감정 톤 분석

### Phase 3 고급 기능
- **마크다운 지원**: 텍스트 서식 및 스타일링 기능
- **미디어 첨부**: 이미지/오디오 파일 첨부 시스템
- **패턴 분석**: 머신러닝 기반 코멘트 패턴 분석
- **소셜 연동**: SNS API 통합 공유 시스템

---

## 🎯 데이터 활용 가치

### 개인 데이터
- **감정 여정**: 시간에 따른 커피 경험 감정 변화 추적
- **표현 발달**: 커피 표현 능력 향상 과정 기록
- **추억 보관**: 특별한 커피 경험과 순간들의 기록

### 커뮤니티 데이터
- **사용자 경험**: 커피에 대한 솔직한 피드백
- **개선점 발견**: 개인 노트에서 공통적인 패턴 분석
- **자연스러운 표현**: 실제 사용자들의 언어 패턴 수집

### 연구 데이터
- **언어학 연구**: 한국인의 커피 관련 자연어 표현 연구
- **감정 분석**: 커피 경험과 감정 연결 패턴 분석
- **문화 연구**: 커피 문화와 개인적 경험의 상관관계

---

## 🔒 프라이버시 고려사항

### 데이터 보호
- **로컬 우선**: 민감한 개인 노트는 로컬 저장 우선
- **암호화**: 개인 메모는 로컬 암호화 저장
- **선택적 동기화**: 사용자 선택에 따른 클라우드 동기화

### 사용자 제어
- **삭제 권한**: 언제든 개인 노트 삭제 가능
- **편집 기능**: 작성 후에도 자유로운 수정 허용
- **공개 범위**: 개인/공개 설정 선택 (Phase 3)
- **데이터 내보내기**: 개인 데이터 백업 및 내보내기 기능

---

## 📊 주요 혁신사항 요약

### 🔄 이번 통합에서 확정된 내용
1. **Lab 모드 제거**: 모든 사용자 대상 범용 개인 노트 시스템
2. **완전 선택적**: 빈 상태로도 진행 가능한 부담 없는 시스템
3. **스마트 보조 도구**: 빠른 표현 + 감정 태그로 입력 지원
4. **자동 컨텍스트**: 시간, 위치 등 추억 보조 정보 자동 수집
5. **자동 저장**: 데이터 손실 방지를 위한 드래프트 시스템

### 🎯 핵심 가치 제안
- **감정 기록**: 정량적 데이터를 보완하는 정성적 개인 경험
- **부담 없음**: 선택적 입력으로 스트레스 없는 사용자 경험
- **추억 보존**: 컨텍스트 정보로 특별한 순간들의 기록
- **표현 지원**: 빠른 입력 도구로 편리한 노트 작성
- **개인화**: 사용자만의 고유한 커피 여정 기록

---

**✅ 문서 완성 상태**: 개인 노트 시스템 완료, 구현 준비 완료  
**📋 다음 단계**: RoasterNotes 화면 또는 다른 TastingFlow 화면 작업  
**🔗 관련 문서**: TF_Screen_SensoryMouthFeel.md, TF_Screen_Result.md  
**📝 변경이력**: 
- 2025-08-01: Lab 모드 제거 및 범용화 완료
- 2025-08-01: 완전 선택적 입력 시스템 설계
- 2025-08-01: 빠른 입력 도구 및 감정 태그 시스템 추가
- 2025-08-01: 자동 컨텍스트 수집 및 드래프트 저장 기능 설계
- 2025-08-01: 200자 제한 다중 라인 텍스트 입력 시스템 완료