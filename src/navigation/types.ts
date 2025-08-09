/**
 * Navigation Types for CupNote v6
 * 
 * Foundation Team 타입 시스템과 완벽하게 통합된 React Navigation 타입 정의
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';

// Foundation Team의 타입 시스템 import
import { 
  RecordMode,
  RootStackParamList as FoundationRootStackParamList,
  MainTabParamList as FoundationMainTabParamList
} from '../../../../worktree-foundation/src/types';

// TastingFlow 타입들 별도 import
import { 
  TastingFlowStackParamList
} from '../../../../worktree-foundation/src/types/tastingFlow';

// =====================================
// Root Stack Navigator Types
// =====================================

/**
 * 앱의 최상위 네비게이션 타입
 * Foundation Team의 RootStackParamList를 확장하여 완전한 네비게이션 구조 정의
 */
export type RootStackParamList = FoundationRootStackParamList & {
  // Auth Stack
  Auth: NavigatorScreenParams<AuthStackParamList>;
  
  // Main App (Main Tab Navigator 포함)
  Main: NavigatorScreenParams<MainTabParamList>;
  
  // TastingFlow Modal (Foundation에서 정의됨)
  TastingFlow: { 
    mode?: RecordMode; 
    draftId?: string;
  };
  
  // Additional Modal Screens
  RecordDetail: { recordId: string };
  Achievement: { achievementId: string };
  Settings: undefined;
  EditProfile: undefined;
  
  // Onboarding (첫 실행 시)
  Onboarding: undefined;
};

// =====================================
// Auth Stack Navigator Types
// =====================================

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// =====================================
// Main Tab Navigator Types
// =====================================

/**
 * Foundation Team이 정의한 MainTabParamList 사용하되 스택 네비게이터로 확장
 */
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  RecordsTab: NavigatorScreenParams<RecordsStackParamList>;
  AchievementsTab: NavigatorScreenParams<AchievementsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// =====================================
// Tab별 Stack Navigator Types
// =====================================

// Home Stack
export type HomeStackParamList = {
  Home: undefined;
  RecordDetail: { recordId: string };
  CommunityMatch: { recordId: string };
  Statistics: undefined;
};

// Records Stack
export type RecordsStackParamList = {
  Records: undefined;
  RecordDetail: { recordId: string };
  EditRecord: { recordId: string };
  RecordFilter: undefined;
  RecordSearch: undefined;
};

// Achievements Stack
export type AchievementsStackParamList = {
  Achievements: undefined;
  AchievementDetail: { achievementId: string };
  LeaderBoard: undefined;
};

// Profile Stack  
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  About: undefined;
  Terms: undefined;
  Privacy: undefined;
  DataExport: undefined;
};

// =====================================
// Screen Props Helper Types
// =====================================

// Root Stack Screen Props
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// Auth Stack Screen Props
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  StackScreenProps<AuthStackParamList, T>;

// Main Tab Screen Props
export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;

// Home Stack Screen Props
export type HomeStackScreenProps<T extends keyof HomeStackParamList> = 
  StackScreenProps<HomeStackParamList, T>;

// Records Stack Screen Props
export type RecordsStackScreenProps<T extends keyof RecordsStackParamList> = 
  StackScreenProps<RecordsStackParamList, T>;

// Achievements Stack Screen Props
export type AchievementsStackScreenProps<T extends keyof AchievementsStackParamList> = 
  StackScreenProps<AchievementsStackParamList, T>;

// Profile Stack Screen Props
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = 
  StackScreenProps<ProfileStackParamList, T>;

// TastingFlow Stack Screen Props (Foundation Team에서 정의됨)  
export type TastingFlowScreenProps<T extends keyof TastingFlowStackParamList> = 
  StackScreenProps<TastingFlowStackParamList, T>;

// TastingFlowStackParamList을 다시 export
export type { TastingFlowStackParamList };

// =====================================
// Navigation Utilities Types
// =====================================

/**
 * TypeScript로 타입 안전한 네비게이션을 위한 유틸리티 타입들
 */

// 모든 스크린 파라미터를 포함하는 통합 타입
export type AllScreenParams = 
  | RootStackParamList
  | AuthStackParamList
  | MainTabParamList
  | HomeStackParamList
  | RecordsStackParamList
  | AchievementsStackParamList
  | ProfileStackParamList
  | TastingFlowStackParamList;

// 네비게이션 상태 타입
export interface NavigationState {
  isNavigating: boolean;
  currentRoute?: string;
  previousRoute?: string;
  canGoBack: boolean;
  params?: Record<string, any>;
}

// Deep Link 파라미터 타입
export interface DeepLinkParams {
  screen: keyof AllScreenParams;
  params?: Record<string, any>;
  initial?: boolean;
}

// 네비게이션 옵션 타입
export interface NavigationOptions {
  animated?: boolean;
  gestureEnabled?: boolean;
  headerShown?: boolean;
  title?: string;
  headerBackTitle?: string;
  headerStyle?: {
    backgroundColor?: string;
    shadowColor?: string;
    elevation?: number;
  };
  headerTitleStyle?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
  };
  headerTintColor?: string;
  presentation?: 'modal' | 'card' | 'transparentModal';
  animationTypeForReplace?: 'push' | 'pop';
}

// =====================================
// Korean UX & Accessibility Types
// =====================================

export interface AccessibilityConfig {
  // Screen Reader 지원
  screenReaderEnabled: boolean;
  announceScreenChanges: boolean;
  
  // 한국어 접근성 설정
  koreaAccessibilityMode: 'standard' | 'enhanced';
  
  // 제스처 설정
  gestureNavigation: boolean;
  swipeGestures: {
    backGesture: boolean; // iOS 스타일 뒤로가기
    tabSwipe: boolean;    // 탭 간 스와이프
    cardSwipe: boolean;   // 카드 스와이프
  };
  
  // 햅틱 피드백 설정
  haptics: {
    enabled: boolean;
    intensity: 'light' | 'medium' | 'heavy';
    navigationFeedback: boolean;
    buttonFeedback: boolean;
    errorFeedback: boolean;
  };
}

// Navigation 테마 타입 (한국 사용자 선호도 고려)
export interface NavigationTheme {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    // CupNote 브랜드 컬러
    coffee: string;
    accent: string;
    warning: string;
    success: string;
  };
  fonts: {
    // 한국어 최적화 폰트
    regular: {
      fontFamily: string;
      fontWeight: string;
    };
    medium: {
      fontFamily: string;
      fontWeight: string;
    };
    bold: {
      fontFamily: string;
      fontWeight: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// =====================================
// Navigation Context Types
// =====================================

export interface NavigationContextValue {
  // 현재 네비게이션 상태
  state: NavigationState;
  
  // 인증 상태 연동
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // 테마 & 접근성
  theme: NavigationTheme;
  accessibility: AccessibilityConfig;
  
  // 유틸리티 함수들
  canGoBack: () => boolean;
  goBack: () => void;
  reset: (routeName: keyof RootStackParamList) => void;
  navigate: <T extends keyof RootStackParamList>(
    screen: T, 
    params?: RootStackParamList[T],
    options?: NavigationOptions
  ) => void;
  
  // Deep Link 처리
  handleDeepLink: (url: string) => void;
  
  // Draft/State 관리
  saveDraftState: (screen: string, data: any) => Promise<void>;
  loadDraftState: (screen: string) => Promise<any>;
  clearDraftState: (screen: string) => Promise<void>;
}

// =====================================
// Error Handling Types
// =====================================

export type NavigationError = 
  | 'INVALID_ROUTE'
  | 'MISSING_PARAMS'
  | 'AUTH_REQUIRED'
  | 'NAVIGATION_BLOCKED'
  | 'DEEP_LINK_ERROR'
  | 'STATE_SAVE_FAILED'
  | 'STACK_OVERFLOW';

export interface NavigationErrorInfo {
  code: NavigationError;
  message: string;
  route?: string;
  params?: any;
  stack?: string;
}

// =====================================
// Performance & Analytics Types
// =====================================

export interface NavigationPerformance {
  screenLoadTime: number;
  navigationTime: number;
  memoryUsage?: number;
  gestureResponseTime?: number;
}

export interface NavigationAnalytics {
  screenName: string;
  previousScreen?: string;
  timeSpent: number;
  interactions: number;
  errorCount: number;
  performance: NavigationPerformance;
  userId?: string;
  sessionId: string;
}

// Global Navigation Type Declaration for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}