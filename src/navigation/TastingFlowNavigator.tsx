/**
 * TastingFlow Navigator for CupNote v6
 * 
 * 커피 테이스팅 기록 플로우를 위한 Modal Stack Navigator
 * - Foundation Team의 TastingFlow 타입 시스템과 완전 통합
 * - 2-Mode 시스템: Cafe Mode (5-7분) vs HomeCafe Mode (8-12분)
 * - 8단계 프로그레시브 플로우
 * - Draft 저장/복원 기능 내장
 * - Korean UX 최적화
 */

import React, { useEffect, useState } from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { Platform, Alert, BackHandler } from 'react-native';

// Foundation Team 타입 시스템
import { 
  TastingFlowStackParamList,
  TASTING_FLOW_STEPS,
  TASTING_FLOW_STEP_NAMES,
  RecordMode,
  TastingFlowDraft
} from '../../../worktree-foundation/src/types/tastingFlow';

// Foundation Team Store 연동  
import { useAuthStore } from '../../../worktree-foundation/src/store';

// Placeholder Screens (실제 스크린은 Screen Team이 구현)
import {
  ModeSelectScreen,
  CoffeeInfoScreen,
  BrewSetupScreen,
  FlavorSelectionScreen,
  SensoryExpressionScreen,
  SensoryMouthFeelScreen,
  PersonalNotesScreen,
  ResultScreen,
} from '../screens/tasting-flow/index';

// Navigation Hooks
import { useTastingFlowNavigation } from './hooks/useNavigation';

const Stack = createStackNavigator<TastingFlowStackParamList>();

// =====================================
// TastingFlow Progress Tracking
// =====================================

interface TastingFlowState {
  mode: RecordMode | null;
  currentStep: number;
  totalSteps: number;
  draftId: string | null;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: TastingFlowState = {
  mode: null,
  currentStep: 0,
  totalSteps: 0,
  draftId: null,
  hasUnsavedChanges: false,
  isLoading: false,
  error: null,
};

// =====================================
// Stack Navigator Options
// =====================================

const defaultScreenOptions: StackNavigationOptions = {
  // Modal 스타일 설정
  headerShown: false, // 커스텀 프로그레스 헤더 사용
  gestureEnabled: false, // 실수로 나가는 것 방지
  cardStyle: {
    backgroundColor: '#ffffff',
  },
  
  // Modal 전환 애니메이션
  presentation: 'modal',
  animationEnabled: true,
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
  
  // 성능 최적화
  cardStyleInterpolator: Platform.OS === 'ios' ? undefined : ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

// =====================================
// Step Progress Utilities
// =====================================

const getStepInfo = (mode: RecordMode, currentScreen: keyof TastingFlowStackParamList) => {
  const steps = TASTING_FLOW_STEPS[mode];
  const currentIndex = steps.indexOf(currentScreen);
  
  return {
    currentStep: currentIndex + 1,
    totalSteps: steps.length,
    stepName: TASTING_FLOW_STEP_NAMES[currentScreen],
    canGoBack: currentIndex > 0,
    canProceed: currentIndex < steps.length - 1,
    isComplete: currentScreen === 'Result',
    progress: (currentIndex + 1) / steps.length,
    nextScreen: currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null,
    prevScreen: currentIndex > 0 ? steps[currentIndex - 1] : null,
  };
};

// =====================================
// Back Handler for TastingFlow
// =====================================

const useTastingFlowBackHandler = (
  hasUnsavedChanges: boolean,
  onExit: () => void
) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (hasUnsavedChanges) {
        Alert.alert(
          '기록 중단',
          '작성 중인 내용이 있습니다. 정말로 나가시겠습니까?',
          [
            { text: '계속 작성', style: 'cancel' },
            { 
              text: '임시저장', 
              onPress: () => {
                // TODO: Draft 저장 로직
                console.log('Draft 저장 후 나가기');
                onExit();
              }
            },
            { 
              text: '나가기', 
              style: 'destructive', 
              onPress: onExit 
            }
          ]
        );
      } else {
        onExit();
      }
      return true;
    });
    
    return () => backHandler.remove();
  }, [hasUnsavedChanges, onExit]);
};

// =====================================
// TastingFlow Navigator Component
// =====================================

export function TastingFlowNavigator() {
  const [flowState, setFlowState] = useState<TastingFlowState>(initialState);
  const navigation = useTastingFlowNavigation();
  const authStore = useAuthStore();
  
  // Back Handler
  useTastingFlowBackHandler(
    flowState.hasUnsavedChanges,
    () => navigation.exitFlow(flowState.hasUnsavedChanges)
  );
  
  // 모드별 스크린 순서 결정
  const getScreensForMode = (mode: RecordMode) => {
    return TASTING_FLOW_STEPS[mode];
  };
  
  // Draft 저장 함수
  const saveDraft = async (data: Partial<TastingFlowDraft>) => {
    try {
      setFlowState(prev => ({ ...prev, isLoading: true }));
      
      // TODO: Foundation Team의 recordStore와 연동하여 Draft 저장
      console.log('Saving draft:', data);
      
      setFlowState(prev => ({ 
        ...prev, 
        isLoading: false,
        hasUnsavedChanges: false 
      }));
    } catch (error) {
      console.error('Draft save failed:', error);
      setFlowState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Draft 저장에 실패했습니다.' 
      }));
    }
  };
  
  // Draft 로드 함수
  const loadDraft = async (draftId: string) => {
    try {
      setFlowState(prev => ({ ...prev, isLoading: true }));
      
      // TODO: Foundation Team의 recordStore와 연동하여 Draft 로드
      console.log('Loading draft:', draftId);
      
      setFlowState(prev => ({ 
        ...prev, 
        isLoading: false,
        draftId 
      }));
    } catch (error) {
      console.error('Draft load failed:', error);
      setFlowState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Draft 로드에 실패했습니다.' 
      }));
    }
  };
  
  return (
    <Stack.Navigator
      initialRouteName="ModeSelect"
      screenOptions={defaultScreenOptions}
    >
      {/* 모드 선택 화면 */}
      <Stack.Screen
        name="ModeSelect"
        component={ModeSelectScreen}
        options={{
          title: TASTING_FLOW_STEP_NAMES.ModeSelect,
          gestureEnabled: true, // 모드 선택에서는 나가기 허용
        }}
      />
      
      {/* 커피 정보 화면 (카페 정보 통합) */}
      <Stack.Screen
        name="CoffeeInfo"
        component={CoffeeInfoScreen}
        options={({ route }) => {
          const mode = route.params?.mode;
          const stepInfo = mode ? getStepInfo(mode, 'CoffeeInfo') : null;
          
          return {
            title: TASTING_FLOW_STEP_NAMES.CoffeeInfo,
            headerShown: true,
            headerTitle: stepInfo ? `${stepInfo.currentStep}/${stepInfo.totalSteps} ${stepInfo.stepName}` : '',
          };
        }}
      />
      
      {/* 브루잉 설정 화면 (HomeCafe 모드 전용) */}
      <Stack.Screen
        name="BrewSetup"
        component={BrewSetupScreen}
        options={({ route }) => {
          const stepInfo = getStepInfo('homecafe', 'BrewSetup');
          
          return {
            title: TASTING_FLOW_STEP_NAMES.BrewSetup,
            headerShown: true,
            headerTitle: `${stepInfo.currentStep}/${stepInfo.totalSteps} ${stepInfo.stepName}`,
          };
        }}
      />
      
      {/* 향미 선택 화면 */}
      <Stack.Screen
        name="FlavorSelection"
        component={FlavorSelectionScreen}
        options={({ route }) => {
          const mode = route.params?.mode;
          const stepInfo = mode ? getStepInfo(mode, 'FlavorSelection') : null;
          
          return {
            title: TASTING_FLOW_STEP_NAMES.FlavorSelection,
            headerShown: true,
            headerTitle: stepInfo ? `${stepInfo.currentStep}/${stepInfo.totalSteps} ${stepInfo.stepName}` : '',
          };
        }}
      />
      
      {/* 감각 표현 화면 */}
      <Stack.Screen
        name="SensoryExpression"
        component={SensoryExpressionScreen}
        options={({ route }) => {
          const mode = route.params?.mode;
          const stepInfo = mode ? getStepInfo(mode, 'SensoryExpression') : null;
          
          return {
            title: TASTING_FLOW_STEP_NAMES.SensoryExpression,
            headerShown: true,
            headerTitle: stepInfo ? `${stepInfo.currentStep}/${stepInfo.totalSteps} ${stepInfo.stepName}` : '',
          };
        }}
      />
      
      {/* 수치 평가 화면 (선택적) */}
      <Stack.Screen
        name="SensoryMouthFeel"
        component={SensoryMouthFeelScreen}
        options={({ route }) => {
          const mode = route.params?.mode;
          const stepInfo = mode ? getStepInfo(mode, 'SensoryMouthFeel') : null;
          
          return {
            title: TASTING_FLOW_STEP_NAMES.SensoryMouthFeel,
            headerShown: true,
            headerTitle: stepInfo ? `${stepInfo.currentStep}/${stepInfo.totalSteps} ${stepInfo.stepName}` : '',
          };
        }}
      />
      
      {/* 개인 노트 화면 */}
      <Stack.Screen
        name="PersonalNotes"
        component={PersonalNotesScreen}
        options={({ route }) => {
          const mode = route.params?.mode;
          const stepInfo = mode ? getStepInfo(mode, 'PersonalNotes') : null;
          
          return {
            title: TASTING_FLOW_STEP_NAMES.PersonalNotes,
            headerShown: true,
            headerTitle: stepInfo ? `${stepInfo.currentStep}/${stepInfo.totalSteps} ${stepInfo.stepName}` : '',
          };
        }}
      />
      
      {/* 결과 화면 */}
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{
          title: TASTING_FLOW_STEP_NAMES.Result,
          headerShown: true,
          gestureEnabled: false, // 결과 화면에서는 뒤로가기 방지
        }}
      />
    </Stack.Navigator>
  );
}

// =====================================
// TastingFlow Utilities
// =====================================

/**
 * TastingFlow 관련 유틸리티 함수들
 */
export const TastingFlowUtils = {
  // 모드별 예상 소요 시간 계산
  getEstimatedDuration: (mode: RecordMode): { min: number; max: number } => {
    switch (mode) {
      case 'cafe':
        return { min: 5, max: 7 };
      case 'homecafe':
        return { min: 8, max: 12 };
      default:
        return { min: 5, max: 12 };
    }
  },
  
  // 진행률 계산
  getProgress: (mode: RecordMode, currentScreen: keyof TastingFlowStackParamList): number => {
    const stepInfo = getStepInfo(mode, currentScreen);
    return stepInfo.progress;
  },
  
  // 다음 스크린 결정
  getNextScreen: (
    mode: RecordMode, 
    currentScreen: keyof TastingFlowStackParamList,
    skipOptional: boolean = false
  ): keyof TastingFlowStackParamList | null => {
    const stepInfo = getStepInfo(mode, currentScreen);
    
    // 수치 평가는 선택적으로 건너뛸 수 있음
    if (stepInfo.nextScreen === 'SensoryMouthFeel' && skipOptional) {
      const nextAfterOptional = getStepInfo(mode, 'SensoryMouthFeel').nextScreen;
      return nextAfterOptional;
    }
    
    return stepInfo.nextScreen;
  },
  
  // 이전 스크린 결정
  getPreviousScreen: (
    mode: RecordMode,
    currentScreen: keyof TastingFlowStackParamList
  ): keyof TastingFlowStackParamList | null => {
    const stepInfo = getStepInfo(mode, currentScreen);
    return stepInfo.prevScreen;
  },
  
  // 완료 조건 체크
  canCompleteStep: (
    screen: keyof TastingFlowStackParamList,
    data: any
  ): { canProceed: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    switch (screen) {
      case 'ModeSelect':
        if (!data.mode) errors.push('모드를 선택해주세요.');
        break;
        
      case 'CoffeeInfo':
        if (!data.coffeeData?.name) errors.push('커피 이름을 입력해주세요.');
        if (data.mode === 'cafe' && !data.coffeeData?.cafe?.name) {
          errors.push('카페 이름을 입력해주세요.');
        }
        break;
        
      case 'BrewSetup':
        if (!data.brewSetupData?.method) errors.push('브루잉 방법을 선택해주세요.');
        if (!data.brewSetupData?.waterTemperature) errors.push('물 온도를 입력해주세요.');
        if (!data.brewSetupData?.waterAmount) errors.push('물 양을 입력해주세요.');
        if (!data.brewSetupData?.coffeeAmount) errors.push('커피 양을 입력해주세요.');
        break;
        
      case 'FlavorSelection':
        if (!data.flavorData?.selectedFlavors?.length) {
          errors.push('최소 1개의 향미를 선택해주세요.');
        }
        break;
        
      case 'PersonalNotes':
        if (!data.personalNotesData?.rating) errors.push('평점을 입력해주세요.');
        break;
    }
    
    return {
      canProceed: errors.length === 0,
      errors
    };
  },
  
  // Draft 만료 체크
  isDraftExpired: (draft: TastingFlowDraft): boolean => {
    return new Date() > new Date(draft.expiresAt);
  },
  
  // 에러 메시지 한국어 변환
  getKoreanErrorMessage: (error: string): string => {
    const errorMap: Record<string, string> = {
      'INVALID_STEP': '잘못된 단계입니다.',
      'MISSING_DATA': '필수 정보가 누락되었습니다.',
      'VALIDATION_FAILED': '입력값 검증에 실패했습니다.',
      'SAVE_FAILED': '저장에 실패했습니다.',
      'DRAFT_EXPIRED': 'Draft가 만료되었습니다.',
      'NETWORK_ERROR': '네트워크 연결을 확인해주세요.',
      'PERMISSION_DENIED': '권한이 없습니다.',
      'STORAGE_FULL': '저장 공간이 부족합니다.',
    };
    
    return errorMap[error] || '알 수 없는 오류가 발생했습니다.';
  }
};

// =====================================
// TastingFlow Performance Tracking
// =====================================

/**
 * TastingFlow 성능 추적을 위한 훅
 */
export const useTastingFlowPerformance = (
  mode: RecordMode,
  sessionId: string
) => {
  const [startTime] = useState(new Date());
  const [stepTimes, setStepTimes] = useState<Record<string, number>>({});
  
  const recordStepTime = (step: string, duration: number) => {
    setStepTimes(prev => ({
      ...prev,
      [step]: duration
    }));
  };
  
  const getPerformanceReport = () => {
    const totalDuration = Date.now() - startTime.getTime();
    
    return {
      sessionId,
      mode,
      startTime,
      endTime: new Date(),
      stepTimes,
      totalDuration,
      averageStepTime: Object.values(stepTimes).reduce((a, b) => a + b, 0) / Object.keys(stepTimes).length,
      completed: true,
    };
  };
  
  return {
    recordStepTime,
    getPerformanceReport
  };
};