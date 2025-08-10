/**
 * ProfileScreen - User Profile and Settings
 * 
 * Features:
 * - User profile information
 * - Statistics and achievements summary
 * - Settings sections
 * - Account management
 * - Data export functionality
 * - Logout functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { useAuthStore, useRecordStore, useAchievementStore } from '../store';
import { AchievementBadge } from '../components/achievements';

// Settings Item Component
const SettingsItem = ({
  title,
  subtitle,
  icon,
  onPress,
  hasSwitch,
  switchValue,
  onSwitchChange,
  disabled = false,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.settingsItem, disabled && styles.settingsItemDisabled]}
    onPress={onPress}
    disabled={disabled || hasSwitch}
    activeOpacity={0.7}
  >
    <View style={styles.settingsItemLeft}>
      {icon && <Text style={styles.settingsIcon}>{icon}</Text>}
      <View style={styles.settingsTextContainer}>
        <Text style={[styles.settingsTitle, disabled && styles.settingsTextDisabled]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingsSubtitle, disabled && styles.settingsTextDisabled]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    <View style={styles.settingsItemRight}>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
          thumbColor={switchValue ? colors.primary : colors.gray[100]}
        />
      ) : (
        <Text style={styles.settingsArrow}>›</Text>
      )}
    </View>
  </TouchableOpacity>
);

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  onPress,
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={styles.statsCard}
    onPress={onPress}
    activeOpacity={0.8}
    disabled={!onPress}
  >
    {icon && <Text style={styles.statsIcon}>{icon}</Text>}
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsTitle}>{title}</Text>
    {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  
  // Foundation stores
  const { 
    user, 
    isAuthenticated, 
    logout, 
    updateProfile, 
    getUserDisplayName 
  } = useAuthStore();
  
  const { 
    records, 
    getRecordStats, 
    loadRecords, 
    isLoadingRecords 
  } = useRecordStore();
  
  const { 
    stats, 
    userAchievements, 
    loadUserStats, 
    getTotalPoints, 
    getCompletionPercentage,
    isLoading: statsLoading 
  } = useAchievementStore();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  
  // Data loading
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        loadRecords(true),
        loadUserStats(),
      ]);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  }, [loadRecords, loadUserStats]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);
  
  // Navigation handlers
  const handleEditProfile = () => {
    Alert.alert('프로필 편집', '프로필 편집 기능이 곧 추가될 예정입니다.');
  };
  
  const handleViewAchievements = () => {
    navigation.navigate('Achievements');
  };
  
  const handleViewRecords = () => {
    navigation.navigate('Records');
  };
  
  const handleExportData = () => {
    Alert.alert(
      '데이터 내보내기',
      '모든 기록을 JSON 파일로 내보냅니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '내보내기', onPress: performDataExport }
      ]
    );
  };
  
  const performDataExport = async () => {
    try {
      // Create export data
      const exportData = {
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.name,
          createdAt: user?.createdAt,
        },
        records: records,
        stats: stats,
        achievements: userAchievements,
        exportedAt: new Date().toISOString(),
      };
      
      // In a real app, you would save this to the device or share it
      console.log('Export data:', JSON.stringify(exportData, null, 2));
      Alert.alert('완료', '데이터가 성공적으로 내보내졌습니다.');
    } catch (error) {
      Alert.alert('오류', '데이터 내보내기 중 오류가 발생했습니다.');
    }
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '모든 데이터가 영구적으로 삭제됩니다. 정말 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    );
  };
  
  const confirmDeleteAccount = () => {
    Alert.alert(
      '마지막 확인',
      '이 작업은 되돌릴 수 없습니다. 정말로 계정을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '영구 삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you would call the delete account API
              await logout();
              Alert.alert('완료', '계정이 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '계정 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };
  
  const handleAbout = () => {
    Alert.alert(
      'CupNote 정보',
      'CupNote v6.0.0\\n\\n커피 테이스팅 기록 앱\\n\\n© 2024 CupNote. All rights reserved.'
    );
  };
  
  // Effects
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  
  // Get calculated stats
  const recordStats = getRecordStats();
  const totalPoints = getTotalPoints();
  
  // Calculate additional stats
  const averageRating = recordStats.averageRating;
  const thisMonthRecords = recordStats.thisMonth;
  const currentStreak = stats?.currentStreak || 0;
  const totalAchievements = userAchievements.length;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getUserDisplayName()?.charAt(0) || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{getUserDisplayName()}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {stats && (
            <View style={styles.levelContainer}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelText}>
                  레벨 {stats.level} • {totalPoints}P
                </Text>
                <Text style={styles.completionText}>
                  업적 달성률: {getCompletionPercentage()}%
                </Text>
              </View>
              <View style={styles.expBar}>
                <View 
                  style={[
                    styles.expFill,
                    { width: `${(stats.experience / stats.nextLevelExp) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.expText}>
                {stats.experience}/{stats.nextLevelExp} XP
              </Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>프로필 편집</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>통계</Text>
          <View style={styles.statsGrid}>
            <StatsCard
              title="총 기록"
              value={recordStats.total}
              subtitle="개"
              icon="☕"
              onPress={handleViewRecords}
            />
            <StatsCard
              title="이번 달"
              value={thisMonthRecords}
              subtitle="개"
              icon="📅"
              onPress={handleViewRecords}
            />
            <StatsCard
              title="평균 평점"
              value={averageRating ? averageRating.toFixed(1) : '0'}
              subtitle="점"
              icon="⭐"
              onPress={handleViewRecords}
            />
            <StatsCard
              title="업적"
              value={totalAchievements}
              subtitle="개"
              icon="🏆"
              onPress={handleViewAchievements}
            />
          </View>
        </View>
        
        {/* Recent Achievements */}
        {userAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 달성한 업적</Text>
              <TouchableOpacity onPress={handleViewAchievements}>
                <Text style={styles.viewAllText}>전체 보기</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsList}
            >
              {userAchievements.slice(0, 5).map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <AchievementBadge
                    achievement={achievement}
                    progress={{
                      achievementId: achievement.id,
                      current: achievement.requirement.target,
                      target: achievement.requirement.target,
                      percentage: 100,
                      isUnlocked: true,
                      canUnlock: false,
                      unlockedAt: achievement.unlockedAt,
                    }}
                    size="medium"
                  />
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementPoints}>+{achievement.points}P</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem
              title="개인정보 수정"
              subtitle="이름, 프로필 사진 변경"
              icon="👤"
              onPress={handleEditProfile}
            />
            <SettingsItem
              title="데이터 내보내기"
              subtitle="모든 기록을 JSON 파일로 저장"
              icon="📥"
              onPress={handleExportData}
            />
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem
              title="알림"
              subtitle="기록 리마인더, 업적 알림"
              icon="🔔"
              hasSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
            <SettingsItem
              title="자동 동기화"
              subtitle="데이터 자동 백업"
              icon="🔄"
              hasSwitch
              switchValue={autoSyncEnabled}
              onSwitchChange={setAutoSyncEnabled}
            />
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>지원</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem
              title="도움말"
              subtitle="사용법 및 FAQ"
              icon="❓"
              onPress={() => Alert.alert('도움말', '도움말 페이지가 곧 추가될 예정입니다.')}
            />
            <SettingsItem
              title="피드백 보내기"
              subtitle="개선 사항 제안"
              icon="💬"
              onPress={() => Alert.alert('피드백', '피드백 기능이 곧 추가될 예정입니다.')}
            />
            <SettingsItem
              title="앱 정보"
              subtitle="버전 및 라이선스 정보"
              icon="ℹ️"
              onPress={handleAbout}
            />
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>계정 관리</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem
              title="로그아웃"
              icon="🚪"
              onPress={handleLogout}
            />
            <SettingsItem
              title="계정 삭제"
              subtitle="모든 데이터 영구 삭제"
              icon="⚠️"
              onPress={handleDeleteAccount}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  avatarText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelInfo: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  completionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  expBar: {
    width: 200,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  expFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  expText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  editProfileButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  editProfileText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Stats Section
  statsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  statsCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: '1%',
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statsIcon: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.sm,
  },
  statsValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statsTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statsSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  
  // Settings Sections
  settingsSection: {
    marginBottom: spacing.xl,
  },
  settingsGroup: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingsItemDisabled: {
    opacity: 0.5,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingsSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  settingsTextDisabled: {
    color: colors.text.tertiary,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Achievement Sections
  achievementsSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  achievementsList: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.xl,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 80,
  },
  achievementName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    numberOfLines: 2,
  },
  achievementPoints: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});