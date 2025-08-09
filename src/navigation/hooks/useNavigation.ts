/**
 * Type-safe Navigation Hooks for CupNote v6
 * 
 * Foundation Team의 authStore와 완전히 통합된 타입 안전한 네비게이션 훅
 */

import { useNavigation as useReactNavigation, useRoute as useReactRoute, ParamListBase } from '@react-navigation/native';
import React, { useCallback, useMemo, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Alert, BackHandler } from 'react-native';

// Foundation Team Store 연동  
import { useAuthStore } from '../../../../worktree-foundation/src/store';

// Navigation Types
import { 
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  RecordsStackParamList,
  AchievementsStackParamList,
  ProfileStackParamList,
  TastingFlowStackParamList,
  NavigationOptions,
  NavigationError,
  NavigationErrorInfo
} from '../types';

// =====================================
// Root Stack Navigation Hook
// =====================================

export function useRootNavigation() {
  return useReactNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

export function useRootRoute<T extends keyof RootStackParamList>() {
  return useReactRoute<RouteProp<RootStackParamList, T>>();
}

// =====================================
// Auth Stack Navigation Hooks
// =====================================

export function useAuthNavigation() {
  const navigation = useReactNavigation<StackNavigationProp<AuthStackParamList>>();
  const authStore = useAuthStore();
  
  return useMemo(() => ({
    ...navigation,
    // 인증 성공 후 자동 메인 앱으로 이동
    navigateToMain: () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    },
    // 로그아웃 후 로그인 화면으로 이동
    navigateToAuth: () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    },
  }), [navigation]);
}

export function useAuthRoute<T extends keyof AuthStackParamList>() {
  return useReactRoute<RouteProp<AuthStackParamList, T>>();
}

// =====================================
// Main Tab Navigation Hooks
// =====================================

export function useMainTabNavigation() {
  return useReactNavigation<BottomTabNavigationProp<MainTabParamList>>();
}

export function useMainTabRoute<T extends keyof MainTabParamList>() {
  return useReactRoute<RouteProp<MainTabParamList, T>>();
}

// =====================================
// Home Stack Navigation Hooks  
// =====================================

export function useHomeNavigation() {
  const navigation = useReactNavigation<StackNavigationProp<HomeStackParamList>>();
  const authStore = useAuthStore();
  
  return useMemo(() => ({
    ...navigation,
    // 인증 상태 확인 후 네비게이션
    navigateWithAuth: <T extends keyof HomeStackParamList>(
      screen: T, 
      params?: HomeStackParamList[T],
      options?: NavigationOptions
    ) => {
      if (!authStore.isAuthenticated) {
        Alert.alert(
          '로그인 필요', 
          '이 기능을 사용하려면 로그인이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '로그인', onPress: () => navigation.navigate('Auth' as any) }
          ]
        );
        return;
      }
      navigation.navigate(screen, params, options);
    },
  }), [navigation, authStore.isAuthenticated]);
}

export function useHomeRoute<T extends keyof HomeStackParamList>() {
  return useReactRoute<RouteProp<HomeStackParamList, T>>();
}

// =====================================
// Records Stack Navigation Hooks
// =====================================

export function useRecordsNavigation() {
  const navigation = useReactNavigation<StackNavigationProp<RecordsStackParamList>>();
  const authStore = useAuthStore();
  
  return useMemo(() => ({
    ...navigation,
    navigateWithAuth: <T extends keyof RecordsStackParamList>(
      screen: T, 
      params?: RecordsStackParamList[T],
      options?: NavigationOptions
    ) => {
      if (!authStore.isAuthenticated) {
        Alert.alert(
          '로그인 필요', 
          '기록을 보려면 로그인이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '로그인', onPress: () => navigation.navigate('Auth' as any) }
          ]
        );
        return;
      }
      navigation.navigate(screen, params, options);
    },
  }), [navigation, authStore.isAuthenticated]);
}

export function useRecordsRoute<T extends keyof RecordsStackParamList>() {
  return useReactRoute<RouteProp<RecordsStackParamList, T>>();
}

// =====================================
// Achievements Stack Navigation Hooks
// =====================================

export function useAchievementsNavigation() {
  const navigation = useReactNavigation<StackNavigationProp<AchievementsStackParamList>>();
  const authStore = useAuthStore();
  
  return useMemo(() => ({
    ...navigation,
    navigateWithAuth: <T extends keyof AchievementsStackParamList>(
      screen: T, 
      params?: AchievementsStackParamList[T],
      options?: NavigationOptions
    ) => {
      if (!authStore.isAuthenticated) {
        Alert.alert(
          '로그인 필요', 
          '업적을 보려면 로그인이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '로그인', onPress: () => navigation.navigate('Auth' as any) }
          ]
        );
        return;
      }
      navigation.navigate(screen, params, options);
    },
  }), [navigation, authStore.isAuthenticated]);
}

export function useAchievementsRoute<T extends keyof AchievementsStackParamList>() {
  return useReactRoute<RouteProp<AchievementsStackParamList, T>>();
}

// =====================================
// Profile Stack Navigation Hooks
// =====================================

export function useProfileNavigation() {
  const navigation = useReactNavigation<StackNavigationProp<ProfileStackParamList>>();
  const authStore = useAuthStore();
  
  return useMemo(() => ({
    ...navigation,
    navigateWithAuth: <T extends keyof ProfileStackParamList>(
      screen: T, 
      params?: ProfileStackParamList[T],
      options?: NavigationOptions
    ) => {
      if (!authStore.isAuthenticated) {
        Alert.alert(
          '로그인 필요', 
          '프로필을 보려면 로그인이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '로그인', onPress: () => navigation.navigate('Auth' as any) }
          ]
        );
        return;
      }
      navigation.navigate(screen, params, options);
    },
    // 로그아웃 후 인증 화면으로
    logout: () => {
      authStore.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  }), [navigation, authStore]);
}

export function useProfileRoute<T extends keyof ProfileStackParamList>() {
  return useReactRoute<RouteProp<ProfileStackParamList, T>>();
}

// =====================================
// TastingFlow Navigation Hooks
// =====================================

export function useTastingFlowNavigation() {
  const navigation = useReactNavigation<StackNavigationProp<TastingFlowStackParamList>>();
  
  return useMemo(() => ({
    ...navigation,
    // TastingFlow 완료 후 결과 화면으로
    completeFlow: (recordId: string, mode: 'cafe' | 'homecafe') => {
      navigation.navigate('Result', { recordId, mode });
    },
    // TastingFlow 중단 확인
    exitFlow: (hasUnsavedChanges: boolean = false) => {
      if (hasUnsavedChanges) {
        Alert.alert(
          '기록 중단', 
          '작성 중인 내용이 있습니다. 정말로 나가시겠습니까?',
          [
            { text: '계속 작성', style: 'cancel' },
            { text: '임시저장', onPress: () => {
              // TODO: Draft 저장 로직
              navigation.goBack();
            }},
            { text: '나가기', style: 'destructive', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        navigation.goBack();
      }
    },
  }), [navigation]);
}

export function useTastingFlowRoute<T extends keyof TastingFlowStackParamList>() {
  return useReactRoute<RouteProp<TastingFlowStackParamList, T>>();
}

// =====================================
// Universal Navigation Hook
// =====================================

/**
 * 모든 네비게이션을 통합한 범용 훅
 * 어떤 스크린에서든 사용 가능
 */
export function useTypedNavigation() {
  const navigation = useReactNavigation();
  const authStore = useAuthStore();
  
  return useMemo(() => ({
    // 기본 네비게이션 메서드들
    navigate: navigation.navigate,
    goBack: navigation.goBack,
    reset: navigation.reset,
    canGoBack: navigation.canGoBack,
    
    // 인증이 필요한 화면으로 네비게이션
    navigateWithAuth: (screen: string, params?: any) => {
      if (!authStore.isAuthenticated) {
        Alert.alert(
          '로그인 필요', 
          '이 기능을 사용하려면 로그인이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '로그인', onPress: () => navigation.navigate('Auth' as any) }
          ]
        );
        return;
      }
      navigation.navigate(screen as any, params);
    },
    
    // 인증 상태에 따른 자동 라우팅
    handleAuthRedirect: () => {
      if (authStore.isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' as any }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' as any }],
        });
      }
    },
    
    // TastingFlow 시작
    startTastingFlow: (mode?: 'cafe' | 'homecafe', draftId?: string) => {
      if (!authStore.isAuthenticated) {
        Alert.alert(
          '로그인 필요', 
          '커피 기록을 작성하려면 로그인이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '로그인', onPress: () => navigation.navigate('Auth' as any) }
          ]
        );
        return;
      }
      navigation.navigate('TastingFlow' as any, { mode, draftId });
    },
    
    // 기록 상세 보기
    viewRecord: (recordId: string) => {
      navigation.navigate('RecordDetail' as any, { recordId });
    },
    
    // 업적 상세 보기  
    viewAchievement: (achievementId: string) => {
      navigation.navigate('Achievement' as any, { achievementId });
    },
    
    // 로그아웃
    logout: () => {
      authStore.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as any }],
      });
    }
  }), [navigation, authStore]);
}

// =====================================
// Back Handler Hook (Android)
// =====================================

/**
 * Android 백 버튼 처리를 위한 훅
 * 한국어 UX를 고려한 백 버튼 동작
 */
export function useBackHandler(
  enabled: boolean = true,
  onBackPress?: () => boolean
) {
  const navigation = useRootNavigation();
  
  const handleBackPress = useCallback(() => {
    if (onBackPress) {
      return onBackPress();
    }
    
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    
    // 앱 종료 확인 (한국어)
    Alert.alert(
      '앱 종료',
      'CupNote를 종료하시겠습니까?',
      [
        { text: '취소', style: 'cancel', onPress: () => true },
        { text: '종료', style: 'destructive', onPress: () => BackHandler.exitApp() }
      ]
    );
    return true;
  }, [navigation, onBackPress]);
  
  // BackHandler 등록/해제
  React.useEffect(() => {
    if (!enabled) return;
    
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [enabled, handleBackPress]);
}

// =====================================
// Navigation Error Handler Hook
// =====================================

export function useNavigationErrorHandler() {
  const handleNavigationError = useCallback((error: NavigationErrorInfo) => {
    console.error('Navigation Error:', error);
    
    // 한국어 에러 메시지
    const getKoreanErrorMessage = (code: NavigationError): string => {
      switch (code) {
        case 'INVALID_ROUTE': return '잘못된 페이지 요청입니다.';
        case 'MISSING_PARAMS': return '필요한 정보가 부족합니다.';
        case 'AUTH_REQUIRED': return '로그인이 필요합니다.';
        case 'NAVIGATION_BLOCKED': return '페이지 이동이 차단되었습니다.';
        case 'DEEP_LINK_ERROR': return '링크 처리 중 오류가 발생했습니다.';
        case 'STATE_SAVE_FAILED': return '상태 저장에 실패했습니다.';
        case 'STACK_OVERFLOW': return '네비게이션 스택 오류입니다.';
        default: return '알 수 없는 오류가 발생했습니다.';
      }
    };
    
    Alert.alert(
      '페이지 이동 오류',
      getKoreanErrorMessage(error.code),
      [{ text: '확인' }]
    );
  }, []);
  
  return { handleNavigationError };
}

// =====================================
// Navigation Performance Hook
// =====================================

export function useNavigationPerformance() {
  const [screenLoadTimes, setScreenLoadTimes] = React.useState<Record<string, number>>({});
  
  const recordScreenLoad = useCallback((screenName: string, loadTime: number) => {
    setScreenLoadTimes(prev => ({
      ...prev,
      [screenName]: loadTime
    }));
  }, []);
  
  const getAverageLoadTime = useCallback(() => {
    const times = Object.values(screenLoadTimes);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }, [screenLoadTimes]);
  
  return {
    screenLoadTimes,
    recordScreenLoad,
    getAverageLoadTime
  };
}