/**
 * Main Screens - 4개 메인 탭 스크린들
 * 
 * HomeScreen: 대시보드 홈
 * RecordsScreen: 기록 목록 
 * RecordDetailScreen: 기록 상세보기
 * AchievementsScreen: 도전과제
 * ProfileScreen: 프로필 설정
 */

export { default as HomeScreen } from './HomeScreen';
export { default as RecordsScreen } from './RecordsScreen';
export { default as RecordDetailScreen } from './RecordDetailScreen';
export { default as AchievementsScreen } from './AchievementsScreen';
export { default as ProfileScreen } from './ProfileScreen';

// Screen 정보 내보내기
export const MainScreens = {
  Home: 'HomeScreen',
  Records: 'RecordsScreen', 
  RecordDetail: 'RecordDetailScreen',
  Achievements: 'AchievementsScreen',
  Profile: 'ProfileScreen',
} as const;

export type MainScreenType = keyof typeof MainScreens;