/**
 * AchievementsScreen - 도전과제 화면
 * 
 * Features:
 * - Database Team의 30+ 도전과제 연동
 * - 6개 카테고리별 그룹화 (quantity, quality, variety, social, expertise, special)
 * - 진행률 프로그레스 바와 애니메이션
 * - 뱃지 시스템 (희귀도별 색상 구분)
 * - 뱃지 획득 시 축하 애니메이션
 * - 리더보드 및 경험치 시스템
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// Foundation Team Assets
import { useAchievementStore } from '../../../worktree-foundation/src/store/achievementStore';
import type { Achievement } from '../../../worktree-foundation/src/types';

// UI Components Team Assets
import {
  Container,
  Card,
  Button,
  Loading,
  EmptyState,
  Header,
  ProgressBar,
  theme,
  colors,
  spacing
} from '../../../worktree-ui-components/src';

// Types
import type { 
  AchievementCategory, 
  AchievementProgress,
  BadgeDisplay,
  ScreenProps 
} from '../../types';

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width - (spacing.md * 2) - (spacing.sm * 4)) / 3;

interface AchievementsScreenProps extends ScreenProps {
  navigation: any;
}

const CATEGORY_INFO: Record<string, { name: string; icon: string; color: string; description: string }> = {
  quantity: {
    name: '첫 걸음',
    icon: '👶',
    color: colors.primary.main,
    description: '기록 수량 달성'
  },
  quality: {
    name: '전문가',
    icon: '⭐',
    color: colors.warning.main,
    description: '품질과 기준'
  },
  variety: {
    name: '탐험가',
    icon: '🗺️',
    color: colors.success.main,
    description: '다양성 탐험'
  },
  social: {
    name: '사교가',
    icon: '👥',
    color: colors.info.main,
    description: '커뮤니티 참여'
  },
  expertise: {
    name: '달인',
    icon: '🏆',
    color: colors.secondary.main,
    description: '전문 기술'
  },
  special: {
    name: '수집가',
    icon: '💎',
    color: colors.accent.main,
    description: '특별한 순간'
  }
};

const RARITY_COLORS: Record<string, string> = {
  common: colors.text.secondary,
  uncommon: colors.success.main,
  rare: colors.info.main,
  epic: colors.secondary.main,
  legendary: colors.warning.main
};

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Foundation Store
  const {
    allAchievements,
    userAchievements,
    achievementProgress,
    stats,
    isLoading,
    error,
    recentUnlocks,
    newUnlocksCount,
    loadAchievements,
    loadUserAchievements,
    loadUserStats,
    refreshAll,
    markAllAchievementsAsSeen,
    getTotalPoints,
    getCompletionPercentage,
    getNextAchievements,
    getAchievementsByCategory,
    getProgressByCategory,
    canLevelUp,
    getPointsToNextLevel
  } = useAchievementStore();

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAnim] = useState(new Animated.Value(0));

  // Achievement Categories with Progress
  const achievementCategories: AchievementCategory[] = useMemo(() => {
    const categories = Object.entries(CATEGORY_INFO).map(([key, info]) => {
      const achievements = getAchievementsByCategory(key as any);
      return {
        key,
        name: info.name,
        description: info.description,
        icon: info.icon,
        color: info.color,
        achievements
      };
    });
    
    return categories;
  }, [allAchievements, getAchievementsByCategory]);

  // Badge Display Data
  const badgeDisplays: BadgeDisplay[] = useMemo(() => {
    const displays: BadgeDisplay[] = [];
    
    const filteredAchievements = selectedCategory === 'all' 
      ? allAchievements 
      : getAchievementsByCategory(selectedCategory as any);

    filteredAchievements.forEach(achievement => {
      const progress = achievementProgress[achievement.id];
      if (progress) {
        displays.push({
          achievement,
          progress,
          isNew: recentUnlocks.some(recent => recent.id === achievement.id)
        });
      }
    });

    // Sort by: unlocked first (by date), then by progress percentage
    return displays.sort((a, b) => {
      if (a.progress.isUnlocked && !b.progress.isUnlocked) return -1;
      if (!a.progress.isUnlocked && b.progress.isUnlocked) return 1;
      
      if (a.progress.isUnlocked && b.progress.isUnlocked) {
        // Sort unlocked by unlock date (recent first)
        const dateA = a.progress.unlockedAt?.getTime() || 0;
        const dateB = b.progress.unlockedAt?.getTime() || 0;
        return dateB - dateA;
      }
      
      // Sort locked by progress percentage (highest first)
      return b.progress.percentage - a.progress.percentage;
    });
  }, [allAchievements, achievementProgress, selectedCategory, recentUnlocks, getAchievementsByCategory]);

  // Data Loading
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      console.error('Failed to refresh achievements:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAll]);

  // Celebration Animation
  const startCelebration = useCallback(() => {
    setShowCelebration(true);
    
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowCelebration(false);
    });
  }, [celebrationAnim]);

  // Effects
  useEffect(() => {
    if (isFocused) {
      if (allAchievements.length === 0) {
        refreshAll();
      }
    }
  }, [isFocused, allAchievements.length, refreshAll]);

  useEffect(() => {
    if (newUnlocksCount > 0) {
      startCelebration();
      // Mark as seen after showing celebration
      setTimeout(() => {
        markAllAchievementsAsSeen();
      }, 3000);
    }
  }, [newUnlocksCount, startCelebration, markAllAchievementsAsSeen]);

  // Render Functions
  const renderStatsHeader = useCallback(() => {
    if (!stats) return null;

    const completionPercentage = getCompletionPercentage();
    const totalPoints = getTotalPoints();
    const pointsToNext = getPointsToNextLevel();

    return (
      <Card style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelNumber}>레벨 {stats.level}</Text>
            {canLevelUp() && (
              <Text style={styles.levelUpIndicator}>🎉 레벨업!</Text>
            )}
          </View>
          <Text style={styles.totalPoints}>{totalPoints}P</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            전체 진행률 {completionPercentage}% ({userAchievements.length}/{allAchievements.length})
          </Text>
          <ProgressBar
            progress={completionPercentage}
            height={8}
            color={colors.primary.main}
            backgroundColor={colors.background.light}
            animated
          />
        </View>

        {!canLevelUp() && pointsToNext > 0 && (
          <Text style={styles.nextLevelText}>
            다음 레벨까지 {pointsToNext}P
          </Text>
        )}

        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{stats.currentStreak}</Text>
            <Text style={styles.quickStatLabel}>연속일</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{stats.totalRecords}</Text>
            <Text style={styles.quickStatLabel}>총 기록</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.quickStatLabel}>평균 평점</Text>
          </View>
        </View>
      </Card>
    );
  }, [stats, getCompletionPercentage, getTotalPoints, getPointsToNextLevel, canLevelUp, userAchievements.length, allAchievements.length]);

  const renderCategoryTabs = useCallback(() => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryTabs}
    >
      <TouchableOpacity
        style={[
          styles.categoryTab,
          selectedCategory === 'all' && styles.selectedCategoryTab
        ]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text style={styles.categoryTabIcon}>🏅</Text>
        <Text 
          style={[
            styles.categoryTabText,
            selectedCategory === 'all' && styles.selectedCategoryTabText
          ]}
        >
          전체
        </Text>
      </TouchableOpacity>

      {achievementCategories.map(category => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryTab,
            selectedCategory === category.key && styles.selectedCategoryTab
          ]}
          onPress={() => setSelectedCategory(category.key)}
        >
          <Text style={styles.categoryTabIcon}>{category.icon}</Text>
          <Text 
            style={[
              styles.categoryTabText,
              selectedCategory === category.key && styles.selectedCategoryTabText
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ), [selectedCategory, achievementCategories]);

  const renderBadgeItem = useCallback(({ item }: { item: BadgeDisplay }) => {
    const { achievement, progress, isNew } = item;
    const isUnlocked = progress.isUnlocked;
    const canUnlock = progress.canUnlock;

    return (
      <TouchableOpacity
        style={styles.badgeContainer}
        activeOpacity={0.8}
        onPress={() => {
          // TODO: Show achievement detail modal
        }}
      >
        <View
          style={[
            styles.badge,
            { borderColor: RARITY_COLORS[achievement.rarity] },
            isUnlocked && styles.unlockedBadge,
            canUnlock && styles.canUnlockBadge
          ]}
        >
          {isNew && <View style={styles.newBadgeIndicator} />}
          
          <Text 
            style={[
              styles.badgeIcon,
              !isUnlocked && styles.lockedBadgeIcon
            ]}
          >
            {achievement.icon_emoji}
          </Text>
          
          {!isUnlocked && (
            <View style={styles.progressOverlay}>
              <ProgressBar
                progress={progress.percentage}
                height={4}
                color={RARITY_COLORS[achievement.rarity]}
                backgroundColor={colors.border.light}
              />
              <Text style={styles.progressText}>
                {progress.percentage}%
              </Text>
            </View>
          )}
          
          {isUnlocked && achievement.points && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+{achievement.points}P</Text>
            </View>
          )}
        </View>
        
        <Text 
          style={[
            styles.badgeName,
            !isUnlocked && styles.lockedBadgeName
          ]}
          numberOfLines={2}
        >
          {achievement.name}
        </Text>
        
        <Text style={styles.badgeDescription} numberOfLines={2}>
          {achievement.description}
        </Text>
        
        {!isUnlocked && (
          <Text style={styles.progressDetail}>
            {progress.current}/{progress.target}
          </Text>
        )}
      </TouchableOpacity>
    );
  }, []);

  const renderCelebration = useCallback(() => {
    if (!showCelebration || recentUnlocks.length === 0) return null;

    return (
      <Animated.View
        style={[
          styles.celebrationOverlay,
          {
            opacity: celebrationAnim,
            transform: [
              {
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }
            ]
          }
        ]}
      >
        <View style={styles.celebrationContent}>
          <Text style={styles.celebrationTitle}>🎉 축하합니다!</Text>
          {recentUnlocks.slice(0, 3).map(achievement => (
            <View key={achievement.id} style={styles.celebrationAchievement}>
              <Text style={styles.celebrationIcon}>{achievement.icon_emoji}</Text>
              <Text style={styles.celebrationName}>{achievement.name}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  }, [showCelebration, recentUnlocks, celebrationAnim]);

  // Error State
  if (error) {
    return (
      <Container style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="도전과제" />
        <EmptyState
          title="오류가 발생했습니다"
          description={error}
          icon="⚠️"
          actionText="다시 시도"
          onAction={refreshAll}
        />
      </Container>
    );
  }

  // Loading State
  if (isLoading || allAchievements.length === 0) {
    return (
      <Container style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="도전과제" />
        <Loading message="도전과제를 불러오는 중..." />
      </Container>
    );
  }

  return (
    <Container style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="도전과제" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 통계 헤더 */}
        {renderStatsHeader()}

        {/* 카테고리 탭 */}
        {renderCategoryTabs()}

        {/* 도전과제 그리드 */}
        <View style={styles.badgesGrid}>
          <FlatList
            data={badgeDisplays}
            renderItem={renderBadgeItem}
            keyExtractor={(item) => item.achievement.id}
            numColumns={3}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.badgesList}
          />
        </View>

        {/* 다음 도전과제 */}
        {selectedCategory === 'all' && (
          <Card style={styles.nextAchievementsCard}>
            <Text style={styles.nextAchievementsTitle}>다음 도전과제</Text>
            {getNextAchievements(3).map((progress) => {
              const achievement = allAchievements.find(a => a.id === progress.achievementId);
              if (!achievement) return null;

              return (
                <View key={achievement.id} style={styles.nextAchievementItem}>
                  <Text style={styles.nextAchievementIcon}>{achievement.icon_emoji}</Text>
                  <View style={styles.nextAchievementInfo}>
                    <Text style={styles.nextAchievementName}>{achievement.name}</Text>
                    <ProgressBar
                      progress={progress.percentage}
                      height={6}
                      color={RARITY_COLORS[achievement.rarity]}
                      backgroundColor={colors.background.light}
                    />
                    <Text style={styles.nextAchievementProgress}>
                      {progress.current}/{progress.target} ({progress.percentage}%)
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {/* 축하 애니메이션 */}
      {renderCelebration()}
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
  statsCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  levelUpIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success.main,
  },
  totalPoints: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.main,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  nextLevelText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.lg,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  categoryTabs: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.background.light,
    minWidth: 80,
  },
  selectedCategoryTab: {
    backgroundColor: colors.primary.main,
  },
  categoryTabIcon: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  categoryTabText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  selectedCategoryTabText: {
    color: colors.surface.main,
  },
  badgesGrid: {
    padding: spacing.md,
  },
  badgesList: {
    paddingBottom: spacing.xl,
  },
  badgeContainer: {
    flex: 1,
    margin: spacing.sm,
    maxWidth: BADGE_SIZE,
    alignItems: 'center',
  },
  badge: {
    width: BADGE_SIZE - (spacing.sm * 2),
    height: BADGE_SIZE - (spacing.sm * 2),
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    backgroundColor: colors.surface.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
    ...theme.shadows.sm,
  },
  unlockedBadge: {
    backgroundColor: colors.background.light,
    ...theme.shadows.md,
  },
  canUnlockBadge: {
    borderColor: colors.success.main,
    backgroundColor: colors.success.light,
  },
  newBadgeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error.main,
    zIndex: 1,
  },
  badgeIcon: {
    fontSize: 32,
  },
  lockedBadgeIcon: {
    opacity: 0.5,
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
  },
  pointsBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.success.main,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  pointsText: {
    fontSize: 8,
    color: colors.surface.main,
    fontWeight: '700',
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  lockedBadgeName: {
    color: colors.text.secondary,
  },
  badgeDescription: {
    fontSize: 10,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 12,
    marginBottom: spacing.xs,
  },
  progressDetail: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  nextAchievementsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
  },
  nextAchievementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  nextAchievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  nextAchievementIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  nextAchievementInfo: {
    flex: 1,
  },
  nextAchievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  nextAchievementProgress: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  celebrationContent: {
    backgroundColor: colors.surface.main,
    borderRadius: theme.borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: width * 0.8,
    ...theme.shadows.lg,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  celebrationAchievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  celebrationIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  celebrationName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

export default AchievementsScreen;