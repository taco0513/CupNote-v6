/**
 * Navigation Export Index
 * 
 * CupNote v6 Navigation 시스템의 중앙 Export
 */

// =====================================
// Main Navigation Components
// =====================================

export { AppNavigator, AppNavigatorWithErrorBoundary, AppNavigatorUtils } from './AppNavigator';
export { AuthNavigator, AuthFlowUtils, AuthScreenConfig } from './AuthNavigator';
export { MainTabNavigator, TabBadgeUtils, TabBarAnimationConfig, AccessibilityConfig, TabDeepLinkConfig } from './MainTabNavigator';
export { TastingFlowNavigator, TastingFlowUtils, useTastingFlowPerformance } from './TastingFlowNavigator';

// =====================================
// Type Definitions
// =====================================

export type {
  // Root & Stack Types
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  RecordsStackParamList,
  AchievementsStackParamList,
  ProfileStackParamList,
  
  // Screen Props Types
  RootStackScreenProps,
  AuthStackScreenProps,
  MainTabScreenProps,
  HomeStackScreenProps,
  RecordsStackScreenProps,
  AchievementsStackScreenProps,
  ProfileStackScreenProps,
  TastingFlowScreenProps,
  
  // Utility Types
  AllScreenParams,
  NavigationState,
  DeepLinkParams,
  NavigationOptions,
  AccessibilityConfig,
  NavigationTheme,
  NavigationContextValue,
  NavigationError,
  NavigationErrorInfo,
  NavigationPerformance,
  NavigationAnalytics,
} from './types';

// =====================================
// Navigation Hooks
// =====================================

export {
  // Navigation Hooks
  useRootNavigation,
  useRootRoute,
  useAuthNavigation,
  useAuthRoute,
  useMainTabNavigation,
  useMainTabRoute,
  useHomeNavigation,
  useHomeRoute,
  useRecordsNavigation,
  useRecordsRoute,
  useAchievementsNavigation,
  useAchievementsRoute,
  useProfileNavigation,
  useProfileRoute,
  useTastingFlowNavigation,
  useTastingFlowRoute,
  useTypedNavigation,
  useBackHandler,
  useNavigationErrorHandler,
  useNavigationPerformance,
  
  // Route Hooks
  useTypedRootRoute,
  useTypedAuthRoute,
  useTypedMainTabRoute,
  useTypedHomeRoute,
  useTypedRecordsRoute,
  useTypedAchievementsRoute,
  useTypedProfileRoute,
  useTypedTastingFlowRoute,
  useRouteParams,
  useRecordDetailParams,
  useAchievementDetailParams,
  useTastingFlowParams,
  useResetPasswordParams,
  useCurrentRoute,
  useNavigationHistory,
  useDeepLinkParams,
  useRouteValidation,
  
  // React Navigation Re-exports
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocused,
} from './hooks';

// =====================================
// Screen Components (Placeholder)
// =====================================

// Auth Screens
export {
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from '../screens/auth/index';

// Main App Screens
export {
  // Home Stack
  HomeScreen,
  HomeRecordDetailScreen,
  CommunityMatchScreen,
  StatisticsScreen,
  
  // Records Stack
  RecordsScreen,
  RecordsRecordDetailScreen,
  EditRecordScreen,
  RecordFilterScreen,
  RecordSearchScreen,
  
  // Achievements Stack
  AchievementsScreen,
  AchievementDetailScreen,
  LeaderBoardScreen,
  
  // Profile Stack
  ProfileScreen,
  EditProfileScreen,
  SettingsScreen,
  AboutScreen,
  TermsScreen,
  PrivacyScreen,
  DataExportScreen,
} from '../screens/main/index';

// TastingFlow Screens
export {
  ModeSelectScreen,
  CoffeeInfoScreen,
  BrewSetupScreen,
  FlavorSelectionScreen,
  SensoryExpressionScreen,
  SensoryMouthFeelScreen,
  PersonalNotesScreen,
  ResultScreen,
} from '../screens/tasting-flow/index';

// Other Screens
export { OnboardingScreen } from '../screens/onboarding/index';
export { LoadingScreen } from '../screens/loading/index';

// =====================================
// Foundation Team Types Re-export
// =====================================

// TastingFlow 관련 타입들을 편의상 재내보내기
export type {
  TastingFlowStackParamList,
  CoffeeInfoData,
  BrewSetupData,
  FlavorSelectionData,
  SensoryExpressionData,
  SensoryMouthFeelData,
  PersonalNotesData,
  TastingFlowDraft,
  TastingFlowScreenState,
  TastingFlowProgress,
  BaseTastingFlowScreenProps,
  ProgressHeaderProps,
  StepCounterProps,
  NavigationActionsProps,
  ValidationRule,
  ValidationResult,
  BrewTimerConfig,
  TastingFlowPerformance,
  TastingFlowError,
  RecordMode,
} from '../../../worktree-foundation/src/types/tastingFlow';

export {
  TASTING_FLOW_STEPS,
  TASTING_FLOW_STEP_NAMES,
  SENSORY_EXPRESSIONS,
  SCA_FLAVOR_CATEGORIES,
} from '../../../worktree-foundation/src/types/tastingFlow';

// =====================================
// Default Export (Main App Navigator)
// =====================================

export { AppNavigatorWithErrorBoundary as default } from './AppNavigator';