import { RecordMode } from './index';

// TastingFlow Navigation Stack Parameter Types
export type TastingFlowStackParamList = {
  ModeSelect: undefined;
  
  // Coffee Information (통합 - 카페 정보 포함)
  CoffeeInfo: { 
    mode: RecordMode;
    editMode?: boolean;
    draftData?: Partial<TastingFlowDraft>;
  };
  
  // HomeCafe Mode Specific Screens
  BrewSetup: {
    mode: 'homecafe';
    coffeeData: CoffeeInfoData;
  };
  
  // Common Flavor & Sensory Screens
  FlavorSelection: {
    mode: RecordMode;
    coffeeData: CoffeeInfoData;
    brewSetupData?: BrewSetupData; // HomeCafe only
  };
  SensoryExpression: {
    mode: RecordMode;
    coffeeData: CoffeeInfoData;
    brewSetupData?: BrewSetupData;
    flavorData: FlavorSelectionData;
  };
  SensoryMouthFeel: {
    mode: RecordMode;
    coffeeData: CoffeeInfoData;
    brewSetupData?: BrewSetupData;
    flavorData: FlavorSelectionData;
    sensoryExpressionData: SensoryExpressionData;
  };
  PersonalNotes: {
    mode: RecordMode;
    coffeeData: CoffeeInfoData;
    brewSetupData?: BrewSetupData;
    flavorData: FlavorSelectionData;
    sensoryExpressionData: SensoryExpressionData;
    sensoryMouthFeelData?: SensoryMouthFeelData;
  };
  Result: {
    recordId: string;
    mode: RecordMode;
  };
};

// Core Data Interfaces

// Coffee Information (카페 정보 통합)
export interface CoffeeInfoData {
  // 커피 기본 정보
  name: string;
  roastery?: string;
  origin?: string;
  process?: 'washed' | 'natural' | 'honey' | 'other';
  variety?: string;
  altitude?: string;
  roastLevel?: 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
  roastDate?: Date;
  price?: number;
  notes?: string;
  scannedFromMenu?: boolean;
  menuImage?: string;
  
  // 카페 정보 (카페 모드에서만 사용)
  cafe?: {
    name: string;
    address?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    visitDate: Date;
    visitTime?: string;
    accompaniedBy?: 'alone' | 'friends' | 'family' | 'date' | 'business';
    discoveryMethod?: 'recommendation' | 'search' | 'passing-by' | 'social-media';
    gpsDetected?: boolean;
  };
}

// Brew Setup Information (HomeCafe)
export interface BrewSetupData {
  method: 'v60' | 'chemex' | 'french-press' | 'aeropress' | 'espresso' | 'cold-brew' | 'moka-pot' | 'siphon' | 'other';
  equipment?: string;
  grindSize: 'extra-fine' | 'fine' | 'medium-fine' | 'medium' | 'medium-coarse' | 'coarse' | 'extra-coarse';
  waterType?: 'tap' | 'bottled' | 'filtered' | 'distilled' | 'other';
  waterTemperature: number; // Celsius
  waterAmount: number; // ml
  coffeeAmount: number; // grams
  ratio: number; // calculated water:coffee ratio
  estimatedTime?: number; // seconds
  brewingNotes?: string;
  timerUsed?: boolean;
  actualBrewTime?: number; // seconds (recorded via timer)
}

// Flavor Selection Data (SCA 85개 향미)
export interface FlavorSelectionData {
  selectedFlavors: string[]; // SCA 85개 향미 중 선택
  flavorIntensity: number; // 1-5 (전체 향미 강도)
  customNotes?: string;
  primaryFlavors?: string[]; // Top 3 주요 향미
  secondaryFlavors?: string[]; // 부차적 향미
}

// 새로운 감각 표현 데이터 (한국어 44개 표현)
export interface SensoryExpressionData {
  // 6개 카테고리 × 7개 표현 = 42개 + 2개 추가
  sweetness?: string[]; // 단맛 관련 7개 표현
  acidity?: string[]; // 산미 관련 7개 표현  
  bitterness?: string[]; // 쓴맛 관련 7개 표현
  body?: string[]; // 바디감 관련 7개 표현
  flavor?: string[]; // 풍미 관련 7개 표현
  aftertaste?: string[]; // 여운 관련 7개 표현
  overall?: string[]; // 전체적 느낌 2개
  customExpression?: string;
}

// 수치 평가 데이터 (선택적)
export interface SensoryMouthFeelData {
  // 1-5점 7항목 (확장됨)
  acidity: number; // 산미 강도
  sweetness: number; // 단맛 강도
  bitterness: number; // 쓴맛 강도
  body: number; // 바디감 (가벼움-진함)
  balance: number; // 균형감
  cleanness: number; // 깔끔함
  aftertaste: number; // 여운
  skipped?: boolean; // 건너뛰기 여부
}

// Personal Notes and Rating
export interface PersonalNotesData {
  rating: number; // 1-5 stars
  personalNotes?: string;
  mood?: string; // current mood/situation
  context?: string; // companions/situation context
  photos?: string[];
  shareWithCommunity: boolean;
  tags?: string[]; // personal tags for organization
  weather?: string; // weather condition
  price?: number; // coffee price (if different from CoffeeInfoData)
  repurchaseIntent?: number; // 1-5 scale for repurchase/revisit intention
  wouldRecommend?: boolean;
  publicReview?: string; // 공개 리뷰 (커뮤니티용)
}

// Draft Data for Saving Progress
export interface TastingFlowDraft {
  id: string;
  userId: string;
  mode: RecordMode;
  currentStep: keyof TastingFlowStackParamList;
  
  // Data collected so far
  coffeeData?: CoffeeInfoData;
  brewSetupData?: BrewSetupData; // HomeCafe만
  flavorData?: FlavorSelectionData;
  sensoryExpressionData?: SensoryExpressionData;
  sensoryMouthFeelData?: SensoryMouthFeelData;
  personalNotesData?: PersonalNotesData;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // drafts expire after 7 days
  version: number; // Schema version for migration
}

// Screen State Management
export interface TastingFlowScreenState {
  isLoading: boolean;
  isSaving: boolean;
  error?: string;
  hasUnsavedChanges: boolean;
  validationErrors?: Record<string, string>;
  showExitConfirm?: boolean;
}

// Progress Tracking
export interface TastingFlowProgress {
  currentStep: number;
  totalSteps: number;
  mode: RecordMode;
  completedSteps: (keyof TastingFlowStackParamList)[];
  canProceed: boolean;
  canGoBack: boolean;
  stepValidation: Record<string, boolean>;
  estimatedTimeRemaining?: number; // minutes
}

// Screen Props Helper Types
export interface BaseTastingFlowScreenProps {
  navigation: any; // Replace with proper navigation type from @react-navigation
  route: any; // Replace with proper route type from @react-navigation
  progress: TastingFlowProgress;
  onDataUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
  onExit: () => void;
}

// Common Component Types
export interface ProgressHeaderProps {
  progress: TastingFlowProgress;
  title: string;
  subtitle?: string;
  onBack: () => void;
  onClose?: () => void;
  onSaveDraft?: () => Promise<void>;
  showDraftButton?: boolean;
  showProgressBar?: boolean;
  showCloseButton?: boolean;
  isLoading?: boolean;
}

export interface StepCounterProps {
  currentStep: number;
  totalSteps: number;
  mode: RecordMode;
  animated?: boolean;
}

export interface NavigationActionsProps {
  canProceed: boolean;
  canGoBack: boolean;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => Promise<void>;
  nextLabel?: string;
  backLabel?: string;
  saveLabel?: string;
  isLoading?: boolean;
  isSaving?: boolean;
  showSaveDraft?: boolean;
  enableHaptics?: boolean;
  disabled?: boolean;
}

// Validation Types
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, data?: any) => boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
  score?: number; // Completeness score 0-100
}

// Constants
export const TASTING_FLOW_STEPS = {
  cafe: [
    'ModeSelect',      // 모드 선택
    'CoffeeInfo',      // 1. 커피 정보 (카페 정보 통합)
    'FlavorSelection', // 2. 향미 선택 (SCA 85개)
    'SensoryExpression', // 3. 감각 표현 (한국어 44개)
    'SensoryMouthFeel',  // 4. 수치 평가 (선택적)
    'PersonalNotes',   // 5. 개인 노트
    'Result'          // 6. 결과
  ],
  homecafe: [
    'ModeSelect',      // 모드 선택
    'CoffeeInfo',      // 1. 커피 정보
    'BrewSetup',       // 2. 브루잉 설정
    'FlavorSelection', // 3. 향미 선택 (SCA 85개)
    'SensoryExpression', // 4. 감각 표현 (한국어 44개)
    'SensoryMouthFeel',  // 5. 수치 평가 (선택적)
    'PersonalNotes',   // 6. 개인 노트
    'Result'          // 7. 결과
  ]
} as const;

export const TASTING_FLOW_STEP_NAMES = {
  ModeSelect: '모드 선택',
  CoffeeInfo: '커피 정보',
  BrewSetup: '브루잉 설정',
  FlavorSelection: '향미 선택',
  SensoryExpression: '감각 표현',
  SensoryMouthFeel: '수치 평가',
  PersonalNotes: '개인 노트',
  Result: '기록 완료'
} as const;

// 한국어 감각 표현 44개 (6카테고리 × 7표현 + 2개)
export const SENSORY_EXPRESSIONS = {
  sweetness: [
    '달콤한', '부드러운', '감미로운', '설탕 같은', 
    '꿀 같은', '캐러멜 같은', '초콜릿 같은'
  ],
  acidity: [
    '상큼한', '밝은', '깔끔한', '톡 쏘는',
    '레몬 같은', '사과 같은', '와인 같은'
  ],
  bitterness: [
    '쌉쌀한', '진한', '묵직한', '강한',
    '코코아 같은', '다크 초콜릿 같은', '허브 같은'
  ],
  body: [
    '가벼운', '부드러운', '실키한', '크리미한',
    '풀바디한', '진한', '묵직한'
  ],
  flavor: [
    '과일향의', '꽃향의', '견과류의', '향신료의',
    '베리 같은', '시트러스 같은', '바닐라 같은'
  ],
  aftertaste: [
    '깔끔한', '지속되는', '부드러운', '상쾌한',
    '여운이 긴', '깨끗한', '매끄러운'
  ],
  overall: [
    '균형 잡힌', '복합적인'
  ]
} as const;

// SCA 85 Flavors (Simplified groups for mobile)
export const SCA_FLAVOR_CATEGORIES = {
  fruity: [
    'Berry', 'Dried Fruit', 'Other Fruit', 'Citrus Fruit'
  ],
  sweet: [
    'Chocolate', 'Vanilla', 'Overall Sweet', 'Sweet Aromatics'
  ],
  floral: [
    'Black Tea', 'Floral'
  ],
  spicy: [
    'Pungent', 'Pepper', 'Brown Spice'
  ],
  nutty: [
    'Nutty', 'Cocoa'
  ],
  cereal: [
    'Cereal'
  ],
  other: [
    'Green/Vegetative', 'Other', 'Roasted', 'Sour/Fermented'
  ]
} as const;

// Timer Configuration for HomeCafe Mode
export interface BrewTimerConfig {
  method: BrewSetupData['method'];
  phases: {
    name: string;
    duration: number; // seconds
    description?: string;
  }[];
  totalTime: number; // seconds
  notifications?: {
    at: number; // seconds
    message: string;
  }[];
}

// Performance tracking
export interface TastingFlowPerformance {
  sessionId: string;
  mode: RecordMode;
  startTime: Date;
  endTime?: Date;
  stepTimes: Record<string, number>; // milliseconds per step
  totalDuration?: number; // milliseconds
  dropOffStep?: string;
  completed: boolean;
  savedAsDraft: boolean;
}

// Error types specific to TastingFlow
export type TastingFlowError = 
  | 'INVALID_STEP'
  | 'MISSING_DATA'
  | 'VALIDATION_FAILED'
  | 'SAVE_FAILED'
  | 'DRAFT_EXPIRED'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'
  | 'STORAGE_FULL';