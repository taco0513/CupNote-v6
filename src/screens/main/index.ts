/**
 * Main Screens - 4개 메인 탭 스크린들
 * 
 * HomeScreen: 대시보드 홈
 * RecordsScreen: 기록 목록 
 * RecordDetailScreen: 기록 상세보기
 * AchievementsScreen: 도전과제
 * ProfileScreen: 프로필 설정
 */

// Import the new Main Screens implementations
export { default as HomeScreen } from '../Home';
export { default as RecordsScreen } from '../Records';
export { default as AchievementsScreen } from '../Achievements';
export { default as ProfileScreen } from '../Profile';

// Keep the existing RecordDetailScreen for now
export { default as RecordDetailScreen } from './RecordDetailScreen';

// Placeholder exports for screens referenced in navigation but not yet implemented
export { default as HomeRecordDetailScreen } from './RecordDetailScreen';
export { default as CommunityMatchScreen } from './RecordDetailScreen'; // Placeholder
export { default as StatisticsScreen } from './RecordDetailScreen'; // Placeholder
export { default as RecordsRecordDetailScreen } from './RecordDetailScreen';
export { default as EditRecordScreen } from './RecordDetailScreen'; // Placeholder
export { default as RecordFilterScreen } from './RecordDetailScreen'; // Placeholder
export { default as RecordSearchScreen } from './RecordDetailScreen'; // Placeholder
export { default as AchievementDetailScreen } from './RecordDetailScreen'; // Placeholder
export { default as LeaderBoardScreen } from './RecordDetailScreen'; // Placeholder
export { default as EditProfileScreen } from './RecordDetailScreen'; // Placeholder
export { default as SettingsScreen } from './RecordDetailScreen'; // Placeholder
export { default as AboutScreen } from './RecordDetailScreen'; // Placeholder
export { default as TermsScreen } from './RecordDetailScreen'; // Placeholder
export { default as PrivacyScreen } from './RecordDetailScreen'; // Placeholder
export { default as DataExportScreen } from './RecordDetailScreen'; // Placeholder

// Screen 정보 내보내기
export const MainScreens = {
  Home: 'HomeScreen',
  Records: 'RecordsScreen', 
  RecordDetail: 'RecordDetailScreen',
  Achievements: 'AchievementsScreen',
  Profile: 'ProfileScreen',
} as const;

export type MainScreenType = keyof typeof MainScreens;