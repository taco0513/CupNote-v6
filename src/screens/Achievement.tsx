/**
 * Achievement Screen
 * Displays user's badge progress and achievements
 */

import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import useStore from '../store/useStore';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width - spacing.xxl * 2 - spacing.lg * 2) / 3;

// Badge definitions
const BADGES = {
  // Count-based badges
  'first_step': {
    id: 'first_step',
    emoji: '🌱',
    name: '첫 발걸음',
    description: '첫 번째 커피 기록',
    target: 1,
    type: 'count',
    points: 10,
  },
  'weekly_coffee': {
    id: 'weekly_coffee',
    emoji: '☕',
    name: '커피 일주일',
    description: '7잔 기록 달성',
    target: 7,
    type: 'count',
    points: 50,
  },
  'monthly_coffee': {
    id: 'monthly_coffee',
    emoji: '📅',
    name: '한 달 커피',
    description: '30잔 기록 달성',
    target: 30,
    type: 'count',
    points: 150,
  },
  'hundred_master': {
    id: 'hundred_master',
    emoji: '💯',
    name: '100잔 마스터',
    description: '100잔 기록 달성',
    target: 100,
    type: 'count',
    points: 500,
  },
  
  // Mode-based badges
  'homecafe_master': {
    id: 'homecafe_master',
    emoji: '🏠',
    name: '홈카페 마스터',
    description: 'HomeCafe Mode 20회 사용',
    target: 20,
    type: 'homecafe',
    points: 100,
  },
  'cafe_expert': {
    id: 'cafe_expert',
    emoji: '☕',
    name: '카페 전문가',
    description: 'Cafe Mode 30회 사용',
    target: 30,
    type: 'cafe',
    points: 150,
  },
  
  // Diversity badges
  'origin_explorer': {
    id: 'origin_explorer',
    emoji: '🌍',
    name: '원산지 탐험가',
    description: '5개 다른 나라 원두 기록',
    target: 5,
    type: 'diversity',
    points: 75,
  },
  'flavor_collector': {
    id: 'flavor_collector',
    emoji: '🎨',
    name: '플레이버 수집가',
    description: '15개 다른 플레이버 기록',
    target: 15,
    type: 'diversity',
    points: 100,
  },
};

interface BadgeCardProps {
  badge: typeof BADGES[keyof typeof BADGES];
  progress: number;
  isEarned: boolean;
  onPress?: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, progress, isEarned, onPress }) => {
  const progressPercentage = Math.min((progress / badge.target) * 100, 100);

  return (
    <TouchableOpacity
      style={[
        styles.badgeCard,
        isEarned ? styles.badgeCardEarned : styles.badgeCardLocked
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[
        styles.badgeEmoji,
        !isEarned && styles.badgeEmojiLocked
      ]}>
        {badge.emoji}
      </Text>
      <Text style={[
        styles.badgeName,
        !isEarned && styles.badgeNameLocked
      ]}>
        {badge.name}
      </Text>
      <Text style={[
        styles.badgeProgress,
        !isEarned && styles.badgeProgressLocked
      ]}>
        {progress}/{badge.target}
      </Text>
    </TouchableOpacity>
  );
};

interface ProgressBadgeProps {
  badge: typeof BADGES[keyof typeof BADGES];
  progress: number;
}

const ProgressBadge: React.FC<ProgressBadgeProps> = ({ badge, progress }) => {
  const progressPercentage = Math.min((progress / badge.target) * 100, 100);

  return (
    <View style={styles.progressBadgeCard}>
      <View style={styles.progressBadgeHeader}>
        <Text style={styles.progressBadgeEmoji}>{badge.emoji}</Text>
        <View style={styles.progressBadgeInfo}>
          <Text style={styles.progressBadgeName}>{badge.name}</Text>
          <Text style={styles.progressBadgeText}>
            진행률: {progress}/{badge.target} ({Math.round(progressPercentage)}%)
          </Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

export default function AchievementScreen() {
  const { stats, records } = useStore();

  // Calculate badge progress
  const badgeProgress = useMemo(() => {
    const progress: Record<string, number> = {};
    
    // Count-based badges
    progress.first_step = stats.totalRecords;
    progress.weekly_coffee = stats.totalRecords;
    progress.monthly_coffee = stats.totalRecords;
    progress.hundred_master = stats.totalRecords;
    
    // Mode-based badges
    progress.homecafe_master = stats.homecafeRecords;
    progress.cafe_expert = stats.cafeRecords;
    
    // For diversity badges, we'll use simplified calculations for now
    // In a real app, you'd track unique origins and flavors
    progress.origin_explorer = Math.min(Math.floor(stats.totalRecords / 3), 5);
    progress.flavor_collector = Math.min(Math.floor(stats.totalRecords / 2), 15);
    
    return progress;
  }, [stats, records]);

  // Get badges in progress (>=30% completion but not earned)
  const badgesInProgress = useMemo(() => {
    return Object.values(BADGES)
      .filter(badge => {
        const progress = badgeProgress[badge.id] || 0;
        const percentage = (progress / badge.target) * 100;
        return percentage >= 30 && progress < badge.target;
      })
      .sort((a, b) => {
        const progressA = (badgeProgress[a.id] || 0) / a.target;
        const progressB = (badgeProgress[b.id] || 0) / b.target;
        return progressB - progressA; // 진행률 높은 순
      })
      .slice(0, 3); // Max 3 badges
  }, [badgeProgress]);

  // Get earned badges
  const earnedBadges = useMemo(() => {
    return Object.values(BADGES)
      .filter(badge => {
        const progress = badgeProgress[badge.id] || 0;
        return progress >= badge.target;
      })
      .sort((a, b) => b.points - a.points); // 포인트 높은 순
  }, [badgeProgress]);

  // Get next to achieve (highest progress among unearned)
  const nextBadge = useMemo(() => {
    return Object.values(BADGES)
      .filter(badge => {
        const progress = badgeProgress[badge.id] || 0;
        return progress < badge.target;
      })
      .sort((a, b) => {
        const progressA = (badgeProgress[a.id] || 0) / a.target;
        const progressB = (badgeProgress[b.id] || 0) / b.target;
        return progressB - progressA;
      })[0];
  }, [badgeProgress]);

  // Calculate total points earned
  const totalPoints = useMemo(() => {
    return earnedBadges.reduce((sum, badge) => sum + badge.points, 0);
  }, [earnedBadges]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header with Stats */}
          <Text style={styles.screenTitle}>🏆 성취</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>획득 뱃지</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>총 포인트</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round((earnedBadges.length / Object.keys(BADGES).length) * 100)}%
              </Text>
              <Text style={styles.statLabel}>완성도</Text>
            </View>
          </View>

          {/* Next Achievement */}
          {nextBadge && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 다음 목표</Text>
              <ProgressBadge
                badge={nextBadge}
                progress={badgeProgress[nextBadge.id] || 0}
              />
            </View>
          )}

          {/* Badges in Progress */}
          {badgesInProgress.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏱️ 진행 중 ({badgesInProgress.length}개)</Text>
              {badgesInProgress.map(badge => (
                <ProgressBadge
                  key={badge.id}
                  badge={badge}
                  progress={badgeProgress[badge.id] || 0}
                />
              ))}
            </View>
          )}

          {/* Earned Badges */}
          {earnedBadges.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                ✅ 획득 완료 ({earnedBadges.length}개)
              </Text>
              <View style={styles.badgeGrid}>
                {earnedBadges.map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    progress={badgeProgress[badge.id] || 0}
                    isEarned={true}
                  />
                ))}
              </View>
            </View>
          ) : (
            /* Empty State for First Time Users */
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🌟</Text>
              <Text style={styles.emptyStateText}>첫 번째 뱃지를 획득해보세요!</Text>
              <Text style={styles.emptyStateSubtext}>
                커피를 기록하면 자동으로 뱃지를 얻을 수 있어요
              </Text>
            </View>
          )}

          {/* All Badges Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 전체 뱃지 ({Object.keys(BADGES).length}개)</Text>
            <View style={styles.badgeGrid}>
              {Object.values(BADGES).map(badge => {
                const progress = badgeProgress[badge.id] || 0;
                return (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    progress={progress}
                    isEarned={progress >= badge.target}
                  />
                );
              })}
            </View>
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
  content: {
    padding: spacing.xl,
  },
  screenTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  screenSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    marginBottom: spacing.xxxl,
  },
  
  // Stats Row Styles
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxxl,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  
  // Progress Badge Styles
  progressBadgeCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  progressBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBadgeEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  progressBadgeInfo: {
    flex: 1,
  },
  progressBadgeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  progressBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  progressBarContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  
  // Badge Grid Styles
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.xs,
  },
  badgeCard: {
    width: BADGE_SIZE,
    aspectRatio: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  badgeCardEarned: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badgeCardLocked: {
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  badgeEmojiLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeNameLocked: {
    color: colors.text.tertiary,
  },
  badgeProgress: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  badgeProgressLocked: {
    color: colors.text.tertiary,
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  previewBadges: {
    width: '100%',
  },
  previewTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});