/**
 * Home Screen - Main Dashboard
 * 
 * Features:
 * - Welcome header with user info
 * - Quick stats dashboard
 * - Recent activity feed
 * - Quick action buttons
 * - Achievement highlights
 * - Draft continuation support
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import useStore from '../store/useStore';
import { useAchievementStore } from '../store/achievementStore';
import { AchievementBadge, AchievementNotification } from '../components/achievements';
import type { HomeStats, DashboardCard } from '../types';
import draftManager, { DraftMetadata } from '../utils/draftManager';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  
  // Store
  const { 
    user, 
    isAuthenticated, 
    records, 
    stats,
  } = useStore();
  
  const { 
    stats: achievementStats, 
    userAchievements, 
    recentUnlocks,
    newUnlocksCount,
    isLoading: achievementsLoading,
    error: achievementsError,
    initializeAchievements,
    updateStatsAfterRecord,
    markAchievementAsSeen,
    getTotalPoints,
    getCompletionPercentage,
  } = useAchievementStore();
  
  // Local state
  const [draftMetadata, setDraftMetadata] = useState<DraftMetadata | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [homeStats, setHomeStats] = useState<HomeStats | null>(null);
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  
  // Get recent records (last 3)
  const recentRecords = records.slice(0, 3);
  
  // Data loading
  const loadData = useCallback(async () => {
    try {
      // Initialize achievements if not already loaded
      if (!achievementStats) {
        initializeAchievements();
      }
      
      // Update achievement stats based on current records
      await updateStatsAfterRecord();
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  }, [achievementStats, initializeAchievements, updateStatsAfterRecord]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);
  
  // Calculate home stats from record store
  const calculateHomeStats = useCallback(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRecords = records.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;
    
    const totalRating = records.reduce((sum, record) => sum + record.overallRating, 0);
    const averageRating = records.length > 0 ? totalRating / records.length : 0;
    
    const uniqueOrigins = new Set(records.map(record => record.origin).filter(Boolean)).size;
    
    const homeStats: HomeStats = {
      totalRecords: records.length,
      monthlyRecords,
      averageRating,
      uniqueOrigins,
    };
    setHomeStats(homeStats);
  }, [records]);
  
  // Check for draft on mount and focus
  const checkForDraft = useCallback(async () => {
    const metadata = await draftManager.getMetadata();
    if (metadata.exists) {
      setDraftMetadata(metadata);
    }
  }, []);
  
  // Effects
  useEffect(() => {
    checkForDraft();
  }, [checkForDraft]);
  
  useFocusEffect(
    useCallback(() => {
      loadData();
      checkForDraft();
    }, [loadData, checkForDraft])
  );
  
  useEffect(() => {
    calculateHomeStats();
  }, [calculateHomeStats]);
  
  // Handle achievement notifications
  useEffect(() => {
    if (recentUnlocks.length > 0 && currentNotificationIndex < recentUnlocks.length) {
      setShowAchievementNotification(true);
    }
  }, [recentUnlocks, currentNotificationIndex]);
  
  const handleNotificationDismiss = () => {
    const currentAchievement = recentUnlocks[currentNotificationIndex];
    if (currentAchievement) {
      markAchievementAsSeen(currentAchievement.id);
    }

    setShowAchievementNotification(false);
    
    const nextIndex = currentNotificationIndex + 1;
    if (nextIndex < recentUnlocks.length) {
      setTimeout(() => {
        setCurrentNotificationIndex(nextIndex);
        setShowAchievementNotification(true);
      }, 500);
    }
  };
  
  const handleContinueDraft = async () => {
    if (!draftMetadata) return;
    
    try {
      // Load draft data directly to TastingFlow
      navigation.navigate('TastingFlow', { 
        draftId: draftMetadata.id || 'current'
      });
    } catch (error) {
      Alert.alert('오류', '임시 저장된 기록을 불러올 수 없습니다.');
    }
  };
  
  const handleDeleteDraft = () => {
    Alert.alert(
      '임시 저장 삭제',
      '저장된 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            await draftManager.clearDraft();
            setDraftMetadata(null);
          }
        }
      ]
    );
  };
  
  // Navigation handlers
  const handleStartNewRecord = () => {
    navigation.navigate('TastingFlow');
  };
  
  const handleViewRecords = () => {
    navigation.navigate('Records');
  };
  
  const handleViewAchievements = () => {
    navigation.navigate('Achievements');
  };
  
  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };
  
  // Dashboard cards data
  const dashboardCards: DashboardCard[] = homeStats ? [
    {
      title: '이번 달 기록',
      value: homeStats.monthlyRecords,
      subtitle: '개',
      icon: '📅',
    },
    {
      title: '총 기록',
      value: homeStats.totalRecords,
      subtitle: '개',
      icon: '☕',
    },
    {
      title: '달성한 성취',
      value: userAchievements.length,
      subtitle: '개',
      icon: '🏆',
    },
    {
      title: '레벨',
      value: achievementStats?.level || 1,
      subtitle: '레벨',
      icon: '⭐',
    },
  ] : [];
  
  // Get best coffee of current month
  const bestCoffeeThisMonth = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthRecords = records.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    if (thisMonthRecords.length === 0) return null;
    
    // Sort by rating (highest first), then by date (most recent first)
    return thisMonthRecords.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })[0];
  }, [records]);
  
  // Error state
  if (achievementsError) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>데이터를 불러올 수 없습니다</Text>
            <Text style={styles.errorMessage}>
              {achievementsError}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Loading state
  if (achievementsLoading && !homeStats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>안녕하세요! ☀️</Text>
              <Text style={styles.title}>오늘의 커피 어떠셨나요?</Text>
            </View>
            <TouchableOpacity onPress={handleViewProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0) || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {dashboardCards.map((card, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{card.icon}</Text>
              <Text style={styles.statValue}>
                {card.value}{card.subtitle}
              </Text>
              <Text style={styles.statLabel}>{card.title}</Text>
            </View>
          ))}
        </View>
        
        {/* Draft Continue Card */}
        {draftMetadata && draftMetadata.exists && (
          <View style={[styles.ctaCard, styles.draftCard]}>
            <View style={styles.draftHeader}>
              <Text style={styles.draftEmoji}>📝</Text>
              <TouchableOpacity onPress={handleDeleteDraft} style={styles.draftDeleteButton}>
                <Text style={styles.draftDeleteText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.draftTitle}>이어서 기록하기</Text>
            <Text style={styles.draftSubtitle}>
              {draftMetadata.coffeeName || '커피 기록'} - {draftMetadata.completionPercentage}% 완료
            </Text>
            <Text style={styles.draftTime}>
              {new Date(draftMetadata.lastSavedAt).toLocaleString('ko-KR', {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}에 저장됨
            </Text>
            <View style={styles.draftButtons}>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinueDraft}>
                <Text style={styles.continueButtonText}>이어하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.newButton} onPress={handleStartNewRecord}>
                <Text style={styles.newButtonText}>새로 시작</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main CTA */}
        {!draftMetadata?.exists && (
          <View style={styles.ctaCard}>
            <Text style={styles.ctaEmoji}>☕</Text>
            <Text style={styles.ctaTitle}>오늘의 커피를 기록해보세요</Text>
            <Text style={styles.ctaSubtitle}>
              당신만의 특별한 커피 이야기를 남겨보세요
            </Text>
            <TouchableOpacity style={styles.ctaButton} onPress={handleStartNewRecord}>
              <Text style={styles.ctaButtonText}>☕ 커피 기록하기</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Best Coffee This Month */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ 이번 달의 베스트</Text>
          </View>
          {bestCoffeeThisMonth ? (
            <TouchableOpacity 
              onPress={() => handleViewRecords()}
              activeOpacity={0.7}
            >
              <View style={styles.bestCoffeeCard}>
                <View style={styles.bestCoffeeHeader}>
                <View style={styles.bestCoffeeImagePlaceholder}>
                  <Text style={styles.bestCoffeeImageEmoji}>☕</Text>
                </View>
                <View style={styles.bestCoffeeInfo}>
                  <Text style={styles.bestCoffeeTitle}>{bestCoffeeThisMonth.coffee.name}</Text>
                  <Text style={styles.bestCoffeeSubtitle}>
                    {bestCoffeeThisMonth.cafe?.name || bestCoffeeThisMonth.coffee.roastery || '로스터리'}
                  </Text>
                </View>
              </View>
              <View style={styles.bestCoffeeFooter}>
                <Text style={styles.bestCoffeeRating}>⭐ {bestCoffeeThisMonth.rating.toFixed(1)}</Text>
                <Text style={styles.bestCoffeeDate}>
                  {new Date(bestCoffeeThisMonth.createdAt).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.bestCoffeeEmptyCard}>
              <Text style={styles.bestCoffeeEmptyIcon}>🏆</Text>
              <Text style={styles.bestCoffeeEmptyTitle}>이번 달 베스트 커피가 없어요</Text>
              <Text style={styles.bestCoffeeEmptySubtitle}>
                커피를 기록하고 이번 달의{'\n'}최고 평점 커피를 만나보세요!
              </Text>
            </View>
          )}
        </View>
        
        {/* Recent Achievements */}
        {userAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏆 최근 성취</Text>
              <TouchableOpacity onPress={handleViewAchievements}>
                <Text style={styles.sectionLink}>모두 보기 →</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.achievementsList}>
              {userAchievements.slice(0, 3).map((achievement) => (
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
                    size="small"
                  />
                  <View style={styles.achievementItemInfo}>
                    <Text style={styles.achievementItemName}>{achievement.name}</Text>
                    <Text style={styles.achievementItemDesc}>{achievement.description}</Text>
                    <Text style={styles.achievementItemPoints}>+{achievement.points} 포인트</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Recent Records */}
        {recentRecords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 기록</Text>
              <TouchableOpacity onPress={handleViewRecords}>
                <Text style={styles.sectionLink}>모두 보기 →</Text>
              </TouchableOpacity>
            </View>
            
            {recentRecords.map((record) => (
              <TouchableOpacity key={record.id} onPress={() => handleViewRecords()}>
                <View style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordTitle}>{record.coffeeName}</Text>
                    <View style={styles.modeBadge}>
                      <Text style={styles.modeBadgeText}>
                        {record.mode === 'cafe' ? '카페' : '홈카페'}
                      </Text>
                    </View>
                  </View>
                  {record.cafeName && (
                    <Text style={styles.recordSubtitle}>📍 {record.cafeName}</Text>
                  )}
                  <View style={styles.recordFooter}>
                    <Text style={styles.recordDate}>
                      {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                    </Text>
                    <Text style={styles.recordRating}>⭐ {record.overallRating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Tips */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>오늘의 팁</Text>
            <Text style={styles.tipText}>
              커피의 향미를 더 잘 느끼려면 한 모금 마신 후 
              코로 숨을 내쉬어보세요. 후각을 통해 더 많은 향을 느낄 수 있어요!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Achievement Notification */}
      {recentUnlocks.length > 0 && currentNotificationIndex < recentUnlocks.length && (
        <AchievementNotification
          achievement={recentUnlocks[currentNotificationIndex]}
          visible={showAchievementNotification}
          onDismiss={handleNotificationDismiss}
          autoHideDuration={5000}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: -spacing.xxl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  statIcon: {
    fontSize: typography.fontSize.xxl,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  ctaCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  ctaEmoji: {
    fontSize: typography.fontSize.display + 16, // 48px
    marginBottom: spacing.lg,
  },
  ctaTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    minWidth: 200,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  recordCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  modeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  modeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recordTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  recordSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  recordRating: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  },
  tipCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '30',
    borderWidth: 1,
  },
  tipIcon: {
    fontSize: typography.fontSize.xxl,
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  // Best of the Month styles
  bestCoffeeCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  bestCoffeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestCoffeeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bestCoffeeImageEmoji: {
    fontSize: typography.fontSize.xxl,
  },
  bestCoffeeInfo: {
    flex: 1,
  },
  bestCoffeeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bestCoffeeSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  bestCoffeeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bestCoffeeRating: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  bestCoffeeDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  bestCoffeeEmptyCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  bestCoffeeEmptyIcon: {
    fontSize: typography.fontSize.display,
    marginBottom: spacing.md,
  },
  bestCoffeeEmptyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bestCoffeeEmptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  // Recent Records horizontal scroll styles
  recentRecordsContainer: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.lg + spacing.md, // Extra padding for last card
  },
  recentRecordCard: {
    width: spacing.lg * 10, // 160px (spacing.lg = 16px)
    marginRight: spacing.md,
    padding: spacing.md,
  },
  recentRecordImagePlaceholder: {
    width: '100%',
    height: spacing.lg * 5, // 80px (spacing.lg = 16px)
    borderRadius: borderRadius.sm,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  recentRecordImageEmoji: {
    fontSize: typography.fontSize.xxl,
  },
  recentRecordContent: {
    flex: 1,
  },
  recentRecordTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.sm * 1.2,
  },
  recentRecordSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  recentRecordBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  recentRecordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  recentRecordRating: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.warning,
  },
  recentRecordDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  // Draft styles
  draftCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  draftEmoji: {
    fontSize: 32,
  },
  draftDeleteButton: {
    padding: spacing.xs,
  },
  draftDeleteText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  draftTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  draftSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  draftTime: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  draftButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  continueButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  newButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  newButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  // Achievement styles
  achievementsList: {
    paddingHorizontal: spacing.lg,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  achievementItemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  achievementItemName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  achievementItemDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  achievementItemPoints: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});