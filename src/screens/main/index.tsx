/**
 * Main App Screens Export
 * 
 * 메인 앱 스크린들 - Placeholder 컴포넌트들
 * 실제 구현은 Screen Team이 담당
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  HomeStackScreenProps,
  RecordsStackScreenProps,
  AchievementsStackScreenProps,
  ProfileStackScreenProps,
} from '../../navigation/types';

// =====================================
// Placeholder Screen Component Factory
// =====================================

const createMainScreenPlaceholder = <T extends any>(
  screenName: string,
  stackName: string,
  additionalActions?: (props: T) => React.ReactElement[]
) => {
  return function MainScreenPlaceholder(props: T) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{screenName}</Text>
          <Text style={styles.subtitle}>{stackName} - Screen Team 구현 예정</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.description}>
            이 화면은 Navigation Team에서 생성한 Placeholder입니다.{'\n'}
            실제 UI는 Screen Team에서 구현합니다.
          </Text>
          
          <View style={styles.routeInfo}>
            <Text style={styles.routeTitle}>네비게이션 정보:</Text>
            <Text style={styles.routeText}>Route: {(props as any).route.name}</Text>
            {(props as any).route.params && (
              <Text style={styles.routeText}>
                Params: {JSON.stringify((props as any).route.params, null, 2)}
              </Text>
            )}
          </View>
          
          {/* 추가 액션들 */}
          {additionalActions && (
            <View style={styles.additionalActions}>
              {additionalActions(props)}
            </View>
          )}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log(`${screenName} - 기본 액션 실행됨`);
            }}
          >
            <Text style={styles.buttonText}>기본 액션</Text>
          </TouchableOpacity>
          
          {(props as any).navigation.canGoBack() && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => (props as any).navigation.goBack()}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                뒤로 가기
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  };
};

// =====================================
// Home Stack Screens
// =====================================

export const HomeScreen = createMainScreenPlaceholder<HomeStackScreenProps<'Home'>>(
  '홈',
  'Home Stack',
  (props) => [
    <TouchableOpacity
      key="record-detail"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('RecordDetail', { recordId: 'sample-record-1' })}
    >
      <Text style={styles.actionButtonText}>샘플 기록 보기</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="community-match"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('CommunityMatch', { recordId: 'sample-record-1' })}
    >
      <Text style={styles.actionButtonText}>커뮤니티 매치</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="statistics"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('Statistics')}
    >
      <Text style={styles.actionButtonText}>통계 보기</Text>
    </TouchableOpacity>,
  ]
);

export const HomeRecordDetailScreen = createMainScreenPlaceholder<HomeStackScreenProps<'RecordDetail'>>(
  '기록 상세 (홈)',
  'Home Stack'
);

export const CommunityMatchScreen = createMainScreenPlaceholder<HomeStackScreenProps<'CommunityMatch'>>(
  '커뮤니티 매치',
  'Home Stack'
);

export const StatisticsScreen = createMainScreenPlaceholder<HomeStackScreenProps<'Statistics'>>(
  '통계',
  'Home Stack'
);

// =====================================
// Records Stack Screens
// =====================================

export const RecordsScreen = createMainScreenPlaceholder<RecordsStackScreenProps<'Records'>>(
  '내 기록',
  'Records Stack',
  (props) => [
    <TouchableOpacity
      key="record-detail"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('RecordDetail', { recordId: 'sample-record-1' })}
    >
      <Text style={styles.actionButtonText}>기록 상세 보기</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="edit-record"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('EditRecord', { recordId: 'sample-record-1' })}
    >
      <Text style={styles.actionButtonText}>기록 편집</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="filter"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('RecordFilter')}
    >
      <Text style={styles.actionButtonText}>필터</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="search"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('RecordSearch')}
    >
      <Text style={styles.actionButtonText}>검색</Text>
    </TouchableOpacity>,
  ]
);

export const RecordsRecordDetailScreen = createMainScreenPlaceholder<RecordsStackScreenProps<'RecordDetail'>>(
  '기록 상세 (Records)',
  'Records Stack'
);

export const EditRecordScreen = createMainScreenPlaceholder<RecordsStackScreenProps<'EditRecord'>>(
  '기록 편집',
  'Records Stack'
);

export const RecordFilterScreen = createMainScreenPlaceholder<RecordsStackScreenProps<'RecordFilter'>>(
  '기록 필터',
  'Records Stack'
);

export const RecordSearchScreen = createMainScreenPlaceholder<RecordsStackScreenProps<'RecordSearch'>>(
  '기록 검색',
  'Records Stack'
);

// =====================================
// Achievements Stack Screens
// =====================================

export const AchievementsScreen = createMainScreenPlaceholder<AchievementsStackScreenProps<'Achievements'>>(
  '업적',
  'Achievements Stack',
  (props) => [
    <TouchableOpacity
      key="achievement-detail"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('AchievementDetail', { achievementId: 'sample-achievement-1' })}
    >
      <Text style={styles.actionButtonText}>샘플 업적 보기</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="leaderboard"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('LeaderBoard')}
    >
      <Text style={styles.actionButtonText}>리더보드</Text>
    </TouchableOpacity>,
  ]
);

export const AchievementDetailScreen = createMainScreenPlaceholder<AchievementsStackScreenProps<'AchievementDetail'>>(
  '업적 상세',
  'Achievements Stack'
);

export const LeaderBoardScreen = createMainScreenPlaceholder<AchievementsStackScreenProps<'LeaderBoard'>>(
  '리더보드',
  'Achievements Stack'
);

// =====================================
// Profile Stack Screens
// =====================================

export const ProfileScreen = createMainScreenPlaceholder<ProfileStackScreenProps<'Profile'>>(
  '프로필',
  'Profile Stack',
  (props) => [
    <TouchableOpacity
      key="edit-profile"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('EditProfile')}
    >
      <Text style={styles.actionButtonText}>프로필 편집</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="settings"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('Settings')}
    >
      <Text style={styles.actionButtonText}>설정</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="about"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('About')}
    >
      <Text style={styles.actionButtonText}>앱 정보</Text>
    </TouchableOpacity>,
  ]
);

export const EditProfileScreen = createMainScreenPlaceholder<ProfileStackScreenProps<'EditProfile'>>(
  '프로필 편집',
  'Profile Stack'
);

export const SettingsScreen = createMainScreenPlaceholder<ProfileStackScreenProps<'Settings'>>(
  '설정',
  'Profile Stack',
  (props) => [
    <TouchableOpacity
      key="terms"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('Terms')}
    >
      <Text style={styles.actionButtonText}>이용약관</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="privacy"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('Privacy')}
    >
      <Text style={styles.actionButtonText}>개인정보처리방침</Text>
    </TouchableOpacity>,
    <TouchableOpacity
      key="data-export"
      style={styles.actionButton}
      onPress={() => props.navigation.navigate('DataExport')}
    >
      <Text style={styles.actionButtonText}>데이터 내보내기</Text>
    </TouchableOpacity>,
  ]
);

export const AboutScreen = createMainScreenPlaceholder<ProfileStackScreenProps<'About'>>(
  '앱 정보',
  'Profile Stack'
);

export const TermsScreen = createMainScreenPlaceholder<ProfileStackScreenProps<'Terms'>>(
  '이용약관',
  'Profile Stack'
);

export const PrivacyScreen = createMainScreenPlaceholder<ProfileStackScreenProps<'Privacy'>>(
  '개인정보처리방침',
  'Profile Stack'
);

export const DataExportScreen = createMainScreenPlaceholder<ProfileStackScreenProps<'DataExport'>>(
  '데이터 내보내기',
  'Profile Stack'
);

// =====================================
// Styles
// =====================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  content: {
    flex: 1,
    minHeight: 200,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  routeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  additionalActions: {
    marginBottom: 24,
  },
  actionButton: {
    height: 48,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  actions: {
    paddingTop: 20,
  },
  button: {
    height: 48,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  secondaryButtonText: {
    color: '#8B4513',
  },
});