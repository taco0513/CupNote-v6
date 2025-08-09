/**
 * CupNote v6 TastingFlow Screens Index
 * 
 * 8개 완전 구현된 TastingFlow 스크린 모음
 * - Korean UX 최적화
 * - Foundation Team 타입 시스템 완전 통합
 * - UI Components Team 컴포넌트 활용
 * - Database Team 한국어 데이터 연동
 * - Navigation Team 네비게이션 시스템
 */

// 8개 TastingFlow 스크린 (순서대로)
export { default as ModeSelectScreen } from './ModeSelectScreen';
export { default as CoffeeInfoScreen } from './CoffeeInfoScreen';
export { default as BrewSetupScreen } from './BrewSetupScreen';
export { default as FlavorSelectionScreen } from './FlavorSelectionScreen';
export { default as SensoryExpressionScreen } from './SensoryExpressionScreen';
export { default as SensoryMouthFeelScreen } from './SensoryMouthFeelScreen';
export { default as PersonalNotesScreen } from './PersonalNotesScreen';
export { default as ResultScreen } from './ResultScreen';

// 스크린 컴포넌트 맵핑 (Navigation Team용)
export const TastingFlowScreens = {
  ModeSelect: require('./ModeSelectScreen').default,
  CoffeeInfo: require('./CoffeeInfoScreen').default,
  BrewSetup: require('./BrewSetupScreen').default,
  FlavorSelection: require('./FlavorSelectionScreen').default,
  SensoryExpression: require('./SensoryExpressionScreen').default,
  SensoryMouthFeel: require('./SensoryMouthFeelScreen').default,
  PersonalNotes: require('./PersonalNotesScreen').default,
  Result: require('./ResultScreen').default
} as const;

// 스크린 메타데이터
export const TASTING_FLOW_SCREEN_METADATA = {
  ModeSelect: {
    name: '모드 선택',
    description: '카페 모드와 홈카페 모드 중 선택',
    estimatedTime: 1, // 분
    required: true,
    korean: true
  },
  CoffeeInfo: {
    name: '커피 정보',
    description: '커피 기본 정보 및 카페 정보 입력',
    estimatedTime: 2,
    required: true,
    korean: true,
    features: ['GPS 카페 감지', 'OCR 메뉴 스캔']
  },
  BrewSetup: {
    name: '브루잉 설정',
    description: '홈카페 모드 전용 추출 설정',
    estimatedTime: 3,
    required: false, // 카페 모드에서는 건너뜀
    korean: true,
    features: ['타이머 기능', '비율 계산기', '레시피 저장']
  },
  FlavorSelection: {
    name: '향미 선택',
    description: 'SCA 85개 향미 중 선택',
    estimatedTime: 2,
    required: true,
    korean: true,
    features: ['SCA 향미 휠', '다중 선택', '강도 조절']
  },
  SensoryExpression: {
    name: '감각 표현',
    description: '44개 한국어 감각 표현 중 선택',
    estimatedTime: 2,
    required: true,
    korean: true,
    features: ['44개 한국어 표현', '7개 카테고리', '추천 시스템']
  },
  SensoryMouthFeel: {
    name: '수치 평가',
    description: '7항목 맛 슬라이더 평가 (선택사항)',
    estimatedTime: 2,
    required: false,
    korean: true,
    features: ['레이더 차트', '실시간 시각화', '건너뛰기 옵션']
  },
  PersonalNotes: {
    name: '개인 노트',
    description: '개인 메모 및 최종 평가',
    estimatedTime: 3,
    required: true,
    korean: true,
    features: ['별점 평가', '사진 추가', '음성 메모', '공유 설정']
  },
  Result: {
    name: '완료',
    description: '기록 완료 및 결과 확인',
    estimatedTime: 1,
    required: true,
    korean: true,
    features: ['맛 프로필 차트', '업적 시스템', '공유 기능']
  }
} as const;

// 모드별 스크린 흐름
export const SCREEN_FLOWS = {
  cafe: [
    'ModeSelect',
    'CoffeeInfo',     // 카페 정보 포함
    'FlavorSelection',
    'SensoryExpression',
    'SensoryMouthFeel', // 선택사항
    'PersonalNotes',
    'Result'
  ],
  homecafe: [
    'ModeSelect',
    'CoffeeInfo',     // 커피 정보만
    'BrewSetup',      // HomeCafe 전용
    'FlavorSelection',
    'SensoryExpression',
    'SensoryMouthFeel', // 선택사항
    'PersonalNotes',
    'Result'
  ]
} as const;

// 스크린별 예상 소요 시간 계산
export const calculateTotalTime = (mode: 'cafe' | 'homecafe', includeOptional: boolean = true): number => {
  const flow = SCREEN_FLOWS[mode];
  
  return flow.reduce((total, screenName) => {
    const screen = TASTING_FLOW_SCREEN_METADATA[screenName as keyof typeof TASTING_FLOW_SCREEN_METADATA];
    
    // 선택사항 스크린 처리
    if (!includeOptional && !screen.required) {
      return total;
    }
    
    // BrewSetup은 HomeCafe 모드에서만 필요
    if (screenName === 'BrewSetup' && mode !== 'homecafe') {
      return total;
    }
    
    return total + screen.estimatedTime;
  }, 0);
};

// 한국어 스크린 이름 매핑
export const getKoreanScreenName = (screenName: string): string => {
  const metadata = TASTING_FLOW_SCREEN_METADATA[screenName as keyof typeof TASTING_FLOW_SCREEN_METADATA];
  return metadata?.name || screenName;
};

// 스크린 기능 목록
export const getScreenFeatures = (screenName: string): string[] => {
  const metadata = TASTING_FLOW_SCREEN_METADATA[screenName as keyof typeof TASTING_FLOW_SCREEN_METADATA];
  return metadata?.features || [];
};

// TastingFlow 완료도 체크
export const checkFlowCompleteness = (mode: 'cafe' | 'homecafe', completedScreens: string[]): {
  isComplete: boolean;
  remainingScreens: string[];
  completionRate: number;
} => {
  const requiredScreens = SCREEN_FLOWS[mode].filter(screenName => {
    const screen = TASTING_FLOW_SCREEN_METADATA[screenName as keyof typeof TASTING_FLOW_SCREEN_METADATA];
    
    // BrewSetup은 HomeCafe에서만 필수
    if (screenName === 'BrewSetup') {
      return mode === 'homecafe';
    }
    
    // 나머지는 모두 필수 (Result 제외하고 체크)
    return screen.required && screenName !== 'Result';
  });
  
  const completed = completedScreens.filter(screen => requiredScreens.includes(screen));
  const remaining = requiredScreens.filter(screen => !completedScreens.includes(screen));
  
  return {
    isComplete: remaining.length === 0,
    remainingScreens: remaining,
    completionRate: completed.length / requiredScreens.length
  };
};