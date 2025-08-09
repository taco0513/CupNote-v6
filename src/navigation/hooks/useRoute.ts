/**
 * Type-safe Route Hooks for CupNote v6
 * 
 * 타입 안전한 라우트 파라미터 접근을 위한 훅들
 */

import { useRoute, RouteProp } from '@react-navigation/native';
import { useMemo } from 'react';

// Navigation Types
import { 
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  RecordsStackParamList,
  AchievementsStackParamList,
  ProfileStackParamList,
  TastingFlowStackParamList
} from '../types';

// =====================================
// Typed Route Hooks
// =====================================

/**
 * Root Stack Route Hook
 */
export function useTypedRootRoute<T extends keyof RootStackParamList>(): RouteProp<RootStackParamList, T> {
  return useRoute<RouteProp<RootStackParamList, T>>();
}

/**
 * Auth Stack Route Hook
 */
export function useTypedAuthRoute<T extends keyof AuthStackParamList>(): RouteProp<AuthStackParamList, T> {
  return useRoute<RouteProp<AuthStackParamList, T>>();
}

/**
 * Main Tab Route Hook
 */
export function useTypedMainTabRoute<T extends keyof MainTabParamList>(): RouteProp<MainTabParamList, T> {
  return useRoute<RouteProp<MainTabParamList, T>>();
}

/**
 * Home Stack Route Hook
 */
export function useTypedHomeRoute<T extends keyof HomeStackParamList>(): RouteProp<HomeStackParamList, T> {
  return useRoute<RouteProp<HomeStackParamList, T>>();
}

/**
 * Records Stack Route Hook
 */
export function useTypedRecordsRoute<T extends keyof RecordsStackParamList>(): RouteProp<RecordsStackParamList, T> {
  return useRoute<RouteProp<RecordsStackParamList, T>>();
}

/**
 * Achievements Stack Route Hook
 */
export function useTypedAchievementsRoute<T extends keyof AchievementsStackParamList>(): RouteProp<AchievementsStackParamList, T> {
  return useRoute<RouteProp<AchievementsStackParamList, T>>();
}

/**
 * Profile Stack Route Hook
 */
export function useTypedProfileRoute<T extends keyof ProfileStackParamList>(): RouteProp<ProfileStackParamList, T> {
  return useRoute<RouteProp<ProfileStackParamList, T>>();
}

/**
 * TastingFlow Stack Route Hook
 */
export function useTypedTastingFlowRoute<T extends keyof TastingFlowStackParamList>(): RouteProp<TastingFlowStackParamList, T> {
  return useRoute<RouteProp<TastingFlowStackParamList, T>>();
}

// =====================================
// Route Parameter Utilities
// =====================================

/**
 * 안전한 파라미터 접근을 위한 헬퍼 훅
 */
export function useRouteParams<T extends Record<string, any>>() {
  const route = useRoute();
  
  return useMemo(() => {
    const params = (route.params as T) || ({} as T);
    
    return {
      params,
      // 파라미터 존재 여부 확인
      hasParam: (key: keyof T): boolean => {
        return params && key in params && params[key] !== undefined;
      },
      // 안전한 파라미터 접근 (기본값 지원)
      getParam: <K extends keyof T>(key: K, defaultValue?: T[K]): T[K] => {
        return params && key in params && params[key] !== undefined 
          ? params[key] 
          : defaultValue as T[K];
      },
      // 필수 파라미터 접근 (없으면 에러)
      getRequiredParam: <K extends keyof T>(key: K): T[K] => {
        if (!params || !(key in params) || params[key] === undefined) {
          throw new Error(`Required parameter '${String(key)}' is missing from route`);
        }
        return params[key];
      }
    };
  }, [route.params]);
}

// =====================================
// Specific Route Parameter Hooks
// =====================================

/**
 * Record Detail 파라미터 훅
 */
export function useRecordDetailParams() {
  const route = useRoute<RouteProp<{ RecordDetail: { recordId: string } }, 'RecordDetail'>>();
  
  return useMemo(() => {
    const recordId = route.params?.recordId;
    
    if (!recordId) {
      throw new Error('recordId parameter is required for RecordDetail screen');
    }
    
    return { recordId };
  }, [route.params]);
}

/**
 * Achievement Detail 파라미터 훅  
 */
export function useAchievementDetailParams() {
  const route = useRoute<RouteProp<{ Achievement: { achievementId: string } }, 'Achievement'>>();
  
  return useMemo(() => {
    const achievementId = route.params?.achievementId;
    
    if (!achievementId) {
      throw new Error('achievementId parameter is required for Achievement screen');
    }
    
    return { achievementId };
  }, [route.params]);
}

/**
 * TastingFlow 파라미터 훅
 */
export function useTastingFlowParams() {
  const route = useRoute<RouteProp<RootStackParamList, 'TastingFlow'>>();
  
  return useMemo(() => {
    const mode = route.params?.mode;
    const draftId = route.params?.draftId;
    
    return { 
      mode, 
      draftId,
      hasMode: !!mode,
      hasDraft: !!draftId,
      isNewRecord: !draftId,
      isDraftRestore: !!draftId
    };
  }, [route.params]);
}

/**
 * Reset Password 파라미터 훅
 */
export function useResetPasswordParams() {
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();
  
  return useMemo(() => {
    const token = route.params?.token;
    
    if (!token) {
      throw new Error('token parameter is required for ResetPassword screen');
    }
    
    return { token };
  }, [route.params]);
}

// =====================================
// Route State Hooks
// =====================================

/**
 * 현재 라우트 정보 훅
 */
export function useCurrentRoute() {
  const route = useRoute();
  
  return useMemo(() => ({
    name: route.name,
    key: route.key,
    params: route.params,
    // 라우트 타입 체크 유틸리티
    isAuthRoute: (routeName?: string): boolean => {
      const name = routeName || route.name;
      return ['Login', 'SignUp', 'ForgotPassword', 'ResetPassword'].includes(name);
    },
    isMainRoute: (routeName?: string): boolean => {
      const name = routeName || route.name;
      return ['HomeTab', 'RecordsTab', 'AchievementsTab', 'ProfileTab'].includes(name);
    },
    isTastingFlowRoute: (routeName?: string): boolean => {
      const name = routeName || route.name;
      return [
        'ModeSelect', 'CoffeeInfo', 'BrewSetup', 'FlavorSelection',
        'SensoryExpression', 'SensoryMouthFeel', 'PersonalNotes', 'Result'
      ].includes(name);
    },
    isModalRoute: (routeName?: string): boolean => {
      const name = routeName || route.name;
      return ['TastingFlow', 'RecordDetail', 'Achievement', 'Settings'].includes(name);
    }
  }), [route]);
}

/**
 * 네비게이션 히스토리 훅 (디버깅용)
 */
export function useNavigationHistory() {
  const route = useRoute();
  
  // 실제로는 navigation state에서 히스토리를 추적해야 하지만,
  // 간단한 구현으로 현재 라우트만 반환
  return useMemo(() => ({
    current: route.name,
    // TODO: 실제 히스토리 추적 구현
    history: [route.name],
    canGoBack: false, // navigation.canGoBack()으로 대체 필요
    depth: 1
  }), [route.name]);
}

// =====================================
// Deep Link Route Hooks
// =====================================

/**
 * Deep Link 파라미터 파싱 훅
 */
export function useDeepLinkParams(url?: string) {
  return useMemo(() => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      const queryParams = Object.fromEntries(urlObj.searchParams.entries());
      
      // CupNote Deep Link 패턴 파싱
      // cupnote://record/{recordId}
      // cupnote://achievement/{achievementId}  
      // cupnote://tasting-flow?mode={mode}&draft={draftId}
      
      const route = pathSegments[0];
      const id = pathSegments[1];
      
      switch (route) {
        case 'record':
          return {
            screen: 'RecordDetail' as keyof RootStackParamList,
            params: { recordId: id }
          };
          
        case 'achievement':
          return {
            screen: 'Achievement' as keyof RootStackParamList,
            params: { achievementId: id }
          };
          
        case 'tasting-flow':
          return {
            screen: 'TastingFlow' as keyof RootStackParamList,
            params: { 
              mode: queryParams.mode as 'cafe' | 'homecafe',
              draftId: queryParams.draft
            }
          };
          
        default:
          return null;
      }
    } catch (error) {
      console.error('Deep link parsing error:', error);
      return null;
    }
  }, [url]);
}

// =====================================
// Route Validation Hooks  
// =====================================

/**
 * 라우트 파라미터 유효성 검사 훅
 */
export function useRouteValidation<T extends Record<string, any>>(
  validationRules: {
    [K in keyof T]?: {
      required?: boolean;
      type?: 'string' | 'number' | 'boolean' | 'object';
      validator?: (value: T[K]) => boolean;
      message?: string;
    }
  }
) {
  const { params } = useRouteParams<T>();
  
  return useMemo(() => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    for (const [key, rules] of Object.entries(validationRules)) {
      const value = params[key as keyof T];
      const rule = rules as NonNullable<typeof validationRules[keyof T]>;
      
      // 필수값 체크
      if (rule.required && (value === undefined || value === null)) {
        errors[key] = rule.message || `${key} is required`;
        isValid = false;
        continue;
      }
      
      if (value !== undefined && value !== null) {
        // 타입 체크
        if (rule.type) {
          const actualType = typeof value;
          if (actualType !== rule.type) {
            errors[key] = rule.message || `${key} must be of type ${rule.type}`;
            isValid = false;
            continue;
          }
        }
        
        // 커스텀 검증
        if (rule.validator && !rule.validator(value)) {
          errors[key] = rule.message || `${key} validation failed`;
          isValid = false;
        }
      }
    }
    
    return { isValid, errors, validatedParams: params };
  }, [params, validationRules]);
}