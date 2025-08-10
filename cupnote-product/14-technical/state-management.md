# TastingFlow 상태 관리 및 전환 로직

## 개요
TastingFlow의 상태 관리, 데이터 지속성, 네비게이션 전환 로직 정의

---

## 1. 상태 머신 정의

```typescript
// State Machine Definition
enum TastingFlowState {
  IDLE = 'idle',                    // 시작 전
  MODE_SELECTION = 'mode_selection', // 모드 선택 중
  IN_PROGRESS = 'in_progress',      // 진행 중
  PAUSED = 'paused',                // 일시 중지
  COMPLETED = 'completed',          // 완료
  ERROR = 'error'                   // 오류 상태
}

enum TastingFlowEvent {
  START = 'START',
  SELECT_MODE = 'SELECT_MODE',
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  SAVE_DRAFT = 'SAVE_DRAFT',
  RESUME = 'RESUME',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
  ERROR = 'ERROR'
}
```

---

## 2. Zustand Store 구조

```typescript
interface TastingFlowStore {
  // 상태
  currentState: TastingFlowState;
  currentMode: 'cafe' | 'homecafe' | null;
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  
  // 데이터
  data: {
    coffeeInfo: CoffeeInfo | null;
    brewSetup: BrewSetup | null; // HomeCafe only
    flavorSelection: string[];
    sensoryExpression: SensoryExpression | null;
    sensoryMouthFeel: SensoryMouthFeel | null;
    personalNotes: PersonalNotes | null;
  };
  
  // 메타데이터
  metadata: {
    startedAt: Date | null;
    lastSavedAt: Date | null;
    completedAt: Date | null;
    draftId: string | null;
    sessionId: string;
  };
  
  // 플래그
  flags: {
    hasUnsavedChanges: boolean;
    isValidating: boolean;
    isSaving: boolean;
    isLoading: boolean;
  };
  
  // 액션
  actions: {
    // 네비게이션
    startFlow: () => void;
    selectMode: (mode: 'cafe' | 'homecafe') => void;
    nextStep: () => Promise<void>;
    previousStep: () => Promise<void>;
    goToStep: (step: number) => Promise<void>;
    
    // 데이터 관리
    updateData: (step: string, data: any) => void;
    saveDraft: () => Promise<void>;
    loadDraft: (draftId: string) => Promise<void>;
    clearData: () => void;
    
    // 완료/취소
    complete: () => Promise<void>;
    cancel: () => Promise<void>;
    
    // 유틸리티
    validateCurrentStep: () => boolean;
    calculateProgress: () => number;
  };
}
```

---

## 3. 상태 전환 다이어그램

```typescript
const stateTransitions = {
  [TastingFlowState.IDLE]: {
    [TastingFlowEvent.START]: {
      target: TastingFlowState.MODE_SELECTION,
      action: 'initializeSession'
    }
  },
  
  [TastingFlowState.MODE_SELECTION]: {
    [TastingFlowEvent.SELECT_MODE]: {
      target: TastingFlowState.IN_PROGRESS,
      action: 'setModeAndStart'
    },
    [TastingFlowEvent.CANCEL]: {
      target: TastingFlowState.IDLE,
      action: 'clearSession'
    }
  },
  
  [TastingFlowState.IN_PROGRESS]: {
    [TastingFlowEvent.NEXT]: {
      target: TastingFlowState.IN_PROGRESS,
      guard: 'canProceed',
      action: 'saveAndNext'
    },
    [TastingFlowEvent.PREVIOUS]: {
      target: TastingFlowState.IN_PROGRESS,
      action: 'saveAndPrevious'
    },
    [TastingFlowEvent.SAVE_DRAFT]: {
      target: TastingFlowState.PAUSED,
      action: 'saveDraftAndPause'
    },
    [TastingFlowEvent.COMPLETE]: {
      target: TastingFlowState.COMPLETED,
      guard: 'isLastStep',
      action: 'saveAndComplete'
    },
    [TastingFlowEvent.CANCEL]: {
      target: TastingFlowState.IDLE,
      action: 'showExitDialog'
    }
  },
  
  [TastingFlowState.PAUSED]: {
    [TastingFlowEvent.RESUME]: {
      target: TastingFlowState.IN_PROGRESS,
      action: 'loadAndResume'
    },
    [TastingFlowEvent.CANCEL]: {
      target: TastingFlowState.IDLE,
      action: 'deleteDraft'
    }
  },
  
  [TastingFlowState.COMPLETED]: {
    [TastingFlowEvent.START]: {
      target: TastingFlowState.MODE_SELECTION,
      action: 'startNewSession'
    }
  }
};
```

---

## 4. 네비게이션 로직

### 4.1 다음 단계 이동

```typescript
const nextStep = async (): Promise<void> => {
  // 1. 현재 단계 검증
  const isValid = validateCurrentStep();
  if (!isValid) {
    showValidationErrors();
    return;
  }
  
  // 2. 데이터 저장
  await saveCurrentStepData();
  
  // 3. 다음 단계 결정
  const nextStepIndex = determineNextStep();
  
  // 4. 진행률 업데이트
  updateProgress(nextStepIndex);
  
  // 5. 화면 전환
  navigateToStep(nextStepIndex);
  
  // 6. 자동저장 (비동기)
  autosaveDraft();
};

// 다음 단계 결정 로직
const determineNextStep = (): number => {
  const { currentStep, currentMode, data } = store.getState();
  
  // SensoryMouthFeel 건너뛰기 처리
  if (currentStep === STEPS.SENSORY_EXPRESSION) {
    if (data.skipMouthFeel) {
      return STEPS.PERSONAL_NOTES;
    }
    return STEPS.SENSORY_MOUTH_FEEL;
  }
  
  return currentStep + 1;
};
```

### 4.2 이전 단계 이동

```typescript
const previousStep = async (): Promise<void> => {
  // 1. 현재 데이터 임시 저장
  await saveCurrentStepData();
  
  // 2. 이전 단계 결정
  const previousStepIndex = determinePreviousStep();
  
  // 3. 진행률 업데이트
  updateProgress(previousStepIndex);
  
  // 4. 화면 전환
  navigateToStep(previousStepIndex);
};
```

### 4.3 이탈 처리

```typescript
const handleExit = async (): Promise<void> => {
  const { flags } = store.getState();
  
  if (flags.hasUnsavedChanges) {
    const action = await showExitDialog();
    
    switch (action) {
      case 'SAVE_AND_EXIT':
        await saveDraft();
        clearSession();
        navigateToHome();
        break;
        
      case 'EXIT_WITHOUT_SAVE':
        clearSession();
        navigateToHome();
        break;
        
      case 'CANCEL':
        // 계속 진행
        break;
    }
  } else {
    clearSession();
    navigateToHome();
  }
};

// 이탈 다이얼로그
const showExitDialog = (): Promise<ExitAction> => {
  return new Promise((resolve) => {
    showModal({
      title: "테이스팅을 중단하시겠습니까?",
      message: "저장하지 않은 내용이 있습니다.",
      buttons: [
        {
          text: "저장 후 나가기",
          action: () => resolve('SAVE_AND_EXIT')
        },
        {
          text: "저장 안함",
          action: () => resolve('EXIT_WITHOUT_SAVE'),
          style: 'danger'
        },
        {
          text: "취소",
          action: () => resolve('CANCEL'),
          style: 'default'
        }
      ]
    });
  });
};
```

---

## 5. 데이터 지속성 전략

### 5.1 자동저장

```typescript
interface AutosaveStrategy {
  // 저장 시점
  triggers: {
    onStepChange: true,      // 단계 변경 시
    onFieldBlur: true,       // 필드 포커스 아웃 시
    onInterval: true,        // 주기적으로
    onBackground: true       // 앱 백그라운드 진입 시
  },
  
  // 저장 주기
  interval: 30000, // 30초마다
  
  // 디바운싱
  debounce: {
    enabled: true,
    delay: 2000 // 2초 후 저장
  }
}

const autosaveDraft = debounce(async () => {
  const { data, metadata, flags } = store.getState();
  
  if (!flags.hasUnsavedChanges) return;
  
  try {
    flags.isSaving = true;
    
    const draft = {
      id: metadata.draftId || generateId(),
      mode: store.currentMode,
      step: store.currentStep,
      data: data,
      savedAt: new Date(),
      sessionId: metadata.sessionId
    };
    
    // localStorage 저장
    localStorage.setItem(`draft_${draft.id}`, JSON.stringify(draft));
    
    // 서버 동기화 (비동기)
    syncToServer(draft).catch(console.error);
    
    metadata.lastSavedAt = new Date();
    flags.hasUnsavedChanges = false;
    
  } finally {
    flags.isSaving = false;
  }
}, 2000);
```

### 5.2 임시저장 복구

```typescript
const loadDraft = async (draftId: string): Promise<void> => {
  try {
    // 1. localStorage에서 먼저 확인
    const localDraft = localStorage.getItem(`draft_${draftId}`);
    if (localDraft) {
      const draft = JSON.parse(localDraft);
      restoreDraft(draft);
      return;
    }
    
    // 2. 서버에서 로드
    const serverDraft = await fetchDraftFromServer(draftId);
    if (serverDraft) {
      restoreDraft(serverDraft);
      localStorage.setItem(`draft_${draftId}`, JSON.stringify(serverDraft));
    }
    
  } catch (error) {
    console.error('Failed to load draft:', error);
    showError('임시저장된 데이터를 불러올 수 없습니다.');
  }
};

const restoreDraft = (draft: Draft): void => {
  store.setState({
    currentMode: draft.mode,
    currentStep: draft.step,
    data: draft.data,
    metadata: {
      ...store.metadata,
      draftId: draft.id,
      lastSavedAt: draft.savedAt
    },
    currentState: TastingFlowState.IN_PROGRESS
  });
};
```

---

## 6. 진행률 계산

```typescript
const calculateProgress = (): number => {
  const { currentStep, currentMode } = store.getState();
  
  const stepProgress = {
    cafe: {
      [STEPS.COFFEE_INFO]: 29,
      [STEPS.FLAVOR_SELECTION]: 57,
      [STEPS.SENSORY_EXPRESSION]: 75,
      [STEPS.SENSORY_MOUTH_FEEL]: 85,
      [STEPS.PERSONAL_NOTES]: 94,
      [STEPS.RESULT]: 100
    },
    homecafe: {
      [STEPS.COFFEE_INFO]: 29,
      [STEPS.BREW_SETUP]: 43,
      [STEPS.FLAVOR_SELECTION]: 57,
      [STEPS.SENSORY_EXPRESSION]: 71,
      [STEPS.SENSORY_MOUTH_FEEL]: 86,
      [STEPS.PERSONAL_NOTES]: 94,
      [STEPS.RESULT]: 100
    }
  };
  
  return stepProgress[currentMode][currentStep] || 0;
};
```

---

## 7. 세션 관리

```typescript
interface SessionManager {
  // 세션 초기화
  initializeSession: () => {
    const sessionId = generateSessionId();
    const startedAt = new Date();
    
    store.setState({
      metadata: {
        sessionId,
        startedAt,
        lastSavedAt: null,
        completedAt: null,
        draftId: null
      },
      flags: {
        hasUnsavedChanges: false,
        isValidating: false,
        isSaving: false,
        isLoading: false
      }
    });
    
    // 세션 추적 (Analytics)
    trackEvent('tasting_flow_started', { sessionId });
  },
  
  // 세션 정리
  clearSession: () => {
    // localStorage 정리
    const { metadata } = store.getState();
    if (metadata.draftId) {
      localStorage.removeItem(`draft_${metadata.draftId}`);
    }
    
    // Store 초기화
    store.setState(initialState);
    
    // 메모리 정리
    clearTimers();
    clearEventListeners();
  },
  
  // 세션 복구
  recoverSession: async () => {
    // 최근 임시저장 확인
    const drafts = getAllDrafts();
    if (drafts.length > 0) {
      const shouldRecover = await showRecoveryDialog(drafts[0]);
      if (shouldRecover) {
        await loadDraft(drafts[0].id);
      }
    }
  }
}
```

---

## 8. React Hook 구현

```typescript
// Custom Hook
export const useTastingFlow = () => {
  const store = useTastingFlowStore();
  const router = useRouter();
  
  // 자동저장 설정
  useEffect(() => {
    const interval = setInterval(() => {
      if (store.flags.hasUnsavedChanges) {
        store.actions.saveDraft();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [store.flags.hasUnsavedChanges]);
  
  // 브라우저 이탈 방지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (store.flags.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '저장하지 않은 내용이 있습니다.';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [store.flags.hasUnsavedChanges]);
  
  // 앱 백그라운드 처리
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && store.flags.hasUnsavedChanges) {
        store.actions.saveDraft();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  return {
    ...store,
    canProceed: () => store.actions.validateCurrentStep(),
    canGoBack: store.currentStep > 0,
    isLastStep: store.currentStep === store.totalSteps - 1
  };
};
```

---

## 9. 구현 우선순위

### Phase 1: Core (즉시)
1. Store 기본 구조
2. 네비게이션 로직
3. 자동저장 메커니즘

### Phase 2: Enhancement (1주)
4. 세션 복구
5. 오프라인 지원
6. 분석 추적

---

*작성일: 2025-08-08*