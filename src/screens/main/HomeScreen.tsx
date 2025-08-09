/**
 * HomeScreen - 메인 대시보드 홈 화면
 * 
 * Features:
 * - 사용자 정보 및 레벨 표시
 * - 주요 통계 카드들 (이번 달 기록, 연속 기록일, 총 기록 수)
 * - 최근 5개 커피 기록 목록
 * - TastingFlow로 연결되는 FloatingActionButton
 * - 추천 및 인사이트 섹션
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Foundation Team Assets
import { useAuthStore } from '../../../worktree-foundation/src/store/authStore';
import { useRecordStore } from '../../../worktree-foundation/src/store/recordStore';
import { useAchievementStore } from '../../../worktree-foundation/src/store/achievementStore';

// UI Components Team Assets
import {
  Container,
  Card,
  Button,
  Loading,
  EmptyState,
  Toast,
  Header,
  theme,
  colors,
  spacing
} from '../../../worktree-ui-components/src';

// Types
import type {
  HomeStats,
  DashboardCard,
  RecentActivity,
  ScreenProps
} from '../../types';

const { width } = Dimensions.get('window');
const CARD_MARGIN = spacing.md;
const CARD_WIDTH = (width - (CARD_MARGIN * 4)) / 2;

interface HomeScreenProps extends ScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Foundation Stores
  const { user, isAuthenticated, getUserDisplayName } = useAuthStore();
  const {
    records,
    isLoading: recordsLoading,
    error: recordsError,
    loadRecords,
    getFilteredRecords
  } = useRecordStore();
  
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    loadUserStats,
    getTotalPoints,
    getNextAchievements,
    canLevelUp
  } = useAchievementStore();

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [homeStats, setHomeStats] = useState<HomeStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Navigation
  const handleTastingFlowPress = useCallback(() => {
    navigation.navigate('TastingFlow', { 
      screen: 'ModeSelect',
      params: { mode: null } 
    });
  }, [navigation]);

  const handleRecordsPress = useCallback(() => {
    navigation.navigate('Records');
  }, [navigation]);

  const handleAchievementsPress = useCallback(() => {
    navigation.navigate('Achievements');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleRecordPress = useCallback((recordId: string) => {
    navigation.navigate('Records', {
      screen: 'RecordDetail',
      params: { recordId }
    });
  }, [navigation]);

  // Data Loading
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        loadRecords(true),
        loadUserStats()
      ]);
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  }, [loadRecords, loadUserStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Stats Calculation
  const calculateHomeStats = useCallback(() => {
    if (!records.length || !stats) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRecords = records.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear;
    }).length;

    // Calculate favorite method and origin
    const methodCounts: Record<string, number> = {};
    const originCounts: Record<string, number> = {};
    
    records.forEach(record => {
      if (record.coffee?.origin) {
        originCounts[record.coffee.origin] = (originCounts[record.coffee.origin] || 0) + 1;
      }
      if (record.brew?.method) {
        methodCounts[record.brew.method] = (methodCounts[record.brew.method] || 0) + 1;
      }
    });

    const favoriteOrigin = Object.keys(originCounts).reduce((a, b) => 
      originCounts[a] > originCounts[b] ? a : b, '');
    const favoriteMethod = Object.keys(methodCounts).reduce((a, b) => 
      methodCounts[a] > methodCounts[b] ? a : b, '');

    const homeStats: HomeStats = {
      monthlyRecords,
      totalRecords: stats.totalRecords,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      averageRating: stats.averageRating,
      favoriteMethod: favoriteMethod || undefined,
      favoriteOrigin: favoriteOrigin || undefined
    };

    setHomeStats(homeStats);
  }, [records, stats]);

  // Recent Activity
  const generateRecentActivity = useCallback(() => {
    const activities: RecentActivity[] = [];
    
    // Recent records (last 3)
    const recentRecords = records
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    
    recentRecords.forEach(record => {
      activities.push({
        id: `record-${record.id}`,
        type: 'record',
        title: record.coffee.name || '커피 기록',
        subtitle: record.coffee.roastery || '로스터리',
        timestamp: new Date(record.createdAt),
        icon: record.mode === 'cafe' ? '🏪' : '🏠',
        data: { recordId: record.id }
      });
    });

    // Next achievements (top 2)
    const nextAchievements = getNextAchievements(2);
    nextAchievements.forEach(progress => {
      activities.push({
        id: `achievement-${progress.achievementId}`,
        type: 'achievement',
        title: '진행 중인 도전과제',
        subtitle: `${progress.current}/${progress.target} (${progress.percentage}%)`,
        timestamp: new Date(),
        icon: '🎯',
        data: { achievementId: progress.achievementId }
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setRecentActivity(activities.slice(0, 5));
  }, [records, getNextAchievements]);

  // Dashboard Cards Data
  const dashboardCards: DashboardCard[] = homeStats ? [
    {
      id: 'monthly',
      title: '이번 달 기록',
      value: homeStats.monthlyRecords,
      subtitle: '개',
      icon: '📅',
      color: colors.primary.main,
      onPress: handleRecordsPress
    },
    {
      id: 'streak',
      title: '연속 기록일',
      value: homeStats.currentStreak,
      subtitle: '일',
      icon: '🔥',
      color: colors.secondary.main,
      onPress: handleAchievementsPress
    },
    {
      id: 'total',
      title: '총 기록 수',
      value: homeStats.totalRecords,
      subtitle: '개',
      icon: '☕',
      color: colors.accent.main,
      onPress: handleRecordsPress
    },
    {
      id: 'rating',
      title: '평균 평점',
      value: homeStats.averageRating.toFixed(1),
      subtitle: '점',
      icon: '⭐',
      color: colors.success.main,
      onPress: handleRecordsPress
    }
  ] : [];

  // Effects
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    loadData();
  }, [isAuthenticated, navigation, loadData]);

  useEffect(() => {
    calculateHomeStats();
    generateRecentActivity();
  }, [calculateHomeStats, generateRecentActivity]);

  // Error Handling
  if (recordsError || statsError) {
    return (
      <Container style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="홈" />
        <EmptyState
          title="데이터를 불러올 수 없습니다"
          description={recordsError || statsError}
          icon="⚠️"
          actionText="다시 시도"
          onAction={loadData}
        />
      </Container>
    );
  }

  // Loading State
  if (recordsLoading || statsLoading || !homeStats) {
    return (
      <Container style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="홈" />
        <Loading message="홈 데이터를 불러오는 중..." />
      </Container>
    );
  }

  return (
    <Container style={[styles.container, { paddingTop: insets.top }]}>
      <Header 
        title="홈" 
        right={() => (
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        )}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 사용자 인사 섹션 */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            안녕하세요, {getUserDisplayName()}님! 👋
          </Text>
          {stats && (
            <View style={styles.levelInfo}>
              <Text style={styles.levelText}>
                레벨 {stats.level} • {getTotalPoints()}P
              </Text>
              {canLevelUp() && (
                <Text style={styles.levelUpText}>🎉 레벨업 가능!</Text>
              )}
            </View>
          )}
        </View>

        {/* 통계 카드들 */}
        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>통계</Text>
          <View style={styles.cardsGrid}>
            {dashboardCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.card, { backgroundColor: card.color }]}
                onPress={card.onPress}
                activeOpacity={0.8}
              >
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={styles.cardValue}>
                  {card.value}{card.subtitle}
                </Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 최근 활동 */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 활동</Text>
            <TouchableOpacity onPress={handleRecordsPress}>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          
          {recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivity.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityItem}
                  onPress={() => {
                    if (activity.type === 'record' && activity.data?.recordId) {
                      handleRecordPress(activity.data.recordId);
                    } else if (activity.type === 'achievement') {
                      handleAchievementsPress();
                    }
                  }}
                >
                  <Text style={styles.activityIcon}>{activity.icon}</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {activity.timestamp.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              title="아직 활동이 없습니다"
              description="첫 번째 커피를 기록해보세요!"
              icon="☕"
              actionText="기록하기"
              onAction={handleTastingFlowPress}
            />
          )}
        </View>

        {/* 추천 섹션 */}
        {homeStats.favoriteOrigin && (
          <View style={styles.recommendSection}>
            <Text style={styles.sectionTitle}>인사이트</Text>
            <Card style={styles.insightCard}>
              <Text style={styles.insightIcon}>💡</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>
                  {homeStats.favoriteOrigin} 원산지를 좋아하시네요!
                </Text>
                <Text style={styles.insightDescription}>
                  비슷한 특성을 가진 새로운 원산지를 탐험해보는 건 어떨까요?
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleTastingFlowPress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>✏️</Text>
        <Text style={styles.fabText}>기록하기</Text>
      </TouchableOpacity>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  profileButton: {
    padding: spacing.sm,
  },
  profileIcon: {
    fontSize: 20,
  },
  greetingSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface.main,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  levelUpText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success.main,
  },
  cardsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    height: 100,
    borderRadius: theme.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface.main,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 12,
    color: colors.surface.main,
    textAlign: 'center',
    opacity: 0.9,
  },
  recentSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: colors.surface.main,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  activityTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  recommendSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  insightDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl + (Platform.OS === 'ios' ? 20 : 0),
    right: spacing.xl,
    backgroundColor: colors.primary.main,
    borderRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.lg,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface.main,
  },
});

export default HomeScreen;