/**
 * Navigation Hooks Export
 * 
 * 모든 네비게이션 훅들을 중앙에서 내보내기
 */

// Navigation Hooks
export {
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
  useNavigationPerformance
} from './useNavigation';

// Route Hooks
export {
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
  useRouteValidation
} from './useRoute';

// Re-export React Navigation hooks for convenience
export { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';