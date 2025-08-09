/**
 * CupNote v6 TastingFlow Components
 * 
 * Korean UX 최적화 테이스팅 플로우 전용 컴포넌트 라이브러리
 * - 8단계 진행률 시스템
 * - SCA 85개 향미 선택기
 * - 7가지 맛 평가 슬라이더
 * - 카페/홈카페 모드 카드
 * - 접근성 AAA 등급 준수
 * - 커피 테마 통합
 */

export { 
  ProgressHeader,
  type ProgressHeaderProps,
} from './ProgressHeader';

export { 
  FlavorSelector,
  SCA_FLAVOR_CATEGORIES,
  type FlavorSelectorProps,
} from './FlavorSelector';

export { 
  TasteSlider,
  MultipleTasteSliders,
  TASTE_CATEGORIES,
  type TasteSliderProps,
  type MultipleTasteSlidersProps,
  type TasteCategory,
} from './TasteSlider';

export { 
  ModeCard,
  TASTING_MODES,
  type ModeCardProps,
  type TastingMode,
  type ModeInfo,
} from './ModeCard';

// TastingFlow component utilities
export const TastingFlowComponents = {
  ProgressHeader,
  FlavorSelector,
  TasteSlider,
  MultipleTasteSliders,
  ModeCard,
} as const;

export type TastingFlowComponentType = keyof typeof TastingFlowComponents;

// TastingFlow utilities
export const TastingFlowUtils = {
  // 진행률 계산
  calculateProgress: (currentStep: number, totalSteps: number): number => {
    return Math.max(0, Math.min(currentStep / totalSteps, 1));
  },
  
  // 단계 이름 가져오기
  getStepName: (step: number, mode: TastingMode): string => {
    const stepNames = {
      cafe: [
        '모드 선택', '커피 정보', '향미 선택', '감각 표현', 
        '수치 평가', '개인 노트', '완료'
      ],
      homecafe: [
        '모드 선택', '커피 정보', '브루잉 설정', '향미 선택', 
        '감각 표현', '수치 평가', '개인 노트', '완료'
      ],
    };
    
    return stepNames[mode][step - 1] || '알 수 없는 단계';
  },
  
  // 예상 소요 시간 계산
  getEstimatedTime: (mode: TastingMode, currentStep: number): string => {
    const modeInfo = TASTING_MODES[mode];
    const totalMinutes = mode === 'cafe' ? 6 : 10; // 평균 소요시간 (분)
    const remainingSteps = modeInfo.steps - currentStep;
    const remainingMinutes = Math.ceil((remainingSteps / modeInfo.steps) * totalMinutes);
    
    return `약 ${remainingMinutes}분 남음`;
  },
  
  // 향미 데이터 검증
  validateFlavorSelection: (flavors: string[], minRequired: number = 1, maxAllowed: number = 10): boolean => {
    return flavors.length >= minRequired && flavors.length <= maxAllowed;
  },
  
  // 맛 평가 데이터 검증
  validateTasteEvaluation: (tasteData: Record<string, number>): boolean => {
    const requiredCategories = ['acidity', 'sweetness', 'bitterness', 'body', 'balance'];
    
    return requiredCategories.every(category => {
      const value = tasteData[category];
      return typeof value === 'number' && value >= 1 && value <= 10;
    });
  },
  
  // 맛 프로필 점수 계산
  calculateTasteProfileScore: (tasteData: Record<string, number>): number => {
    const values = Object.values(tasteData);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.round(average * 10) / 10; // 소수점 1자리
  },
  
  // 주요 향미 추출 (상위 3개)
  extractPrimaryFlavors: (flavors: string[]): string[] => {
    return flavors.slice(0, 3);
  },
} as const;