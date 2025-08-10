/**
 * AchievementsScreen - Achievement Display and Progress Tracking
 * 
 * Features:
 * - Achievement grid/list view
 * - Progress bars for in-progress achievements
 * - Achievement categories/filters
 * - Achievement details modal
 * - Stats and progress tracking
 * - New unlock notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { useAchievementStore } from '../store';
import type { Achievement } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

// Achievement Card Component
const AchievementCard = ({
  achievement,
  progress,
  onPress,
}: {
  achievement: Achievement;
  progress?: any;
  onPress: () => void;
}) => {
  const isUnlocked = progress?.isUnlocked || !!achievement.unlockedAt;
  const currentProgress = progress?.current || 0;
  const targetProgress = progress?.target || achievement.requirement.target;
  const progressPercentage = progress?.percentage || (isUnlocked ? 100 : 0);

  return (
    <TouchableOpacity
      style={[styles.achievementCard, !isUnlocked && styles.achievementCardLocked]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        {isUnlocked && (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedBadgeText}>✓</Text>
          </View>
        )}
      </View>
      
      <Text 
        style={[styles.achievementName, !isUnlocked && styles.achievementTextLocked]}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>
      
      <Text 
        style={[styles.achievementDescription, !isUnlocked && styles.achievementTextLocked]}
        numberOfLines={3}
      >
        {achievement.description}
      </Text>
      
      {!isUnlocked && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentProgress}/{targetProgress}
          </Text>
        </View>
      )}
      
      <View style={styles.achievementFooter}>
        <View style={[
          styles.rarityBadge,
          { backgroundColor: getRarityColor(achievement.rarity) }
        ]}>
          <Text style={styles.rarityText}>
            {getRarityLabel(achievement.rarity)}
          </Text>
        </View>
        <Text style={styles.pointsText}>+{achievement.points}P</Text>
      </View>
    </TouchableOpacity>
  );
};

// Achievement Detail Modal
const AchievementDetailModal = ({
  visible,
  achievement,
  progress,
  onClose,
}: {
  visible: boolean;
  achievement: Achievement | null;
  progress?: any;
  onClose: () => void;
}) => {
  if (!achievement) return null;

  const isUnlocked = progress?.isUnlocked || !!achievement.unlockedAt;
  const currentProgress = progress?.current || 0;
  const targetProgress = progress?.target || achievement.requirement.target;
  const progressPercentage = progress?.percentage || (isUnlocked ? 100 : 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalIcon}>{achievement.icon}</Text>
            {isUnlocked && (
              <View style={styles.modalUnlockedBadge}>
                <Text style={styles.modalUnlockedText}>달성 완료!</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.modalTitle}>{achievement.name}</Text>
          <Text style={styles.modalDescription}>{achievement.description}</Text>
          
          {!isUnlocked && (
            <View style={styles.modalProgressSection}>
              <Text style={styles.modalProgressLabel}>진행 상황</Text>
              <View style={styles.modalProgressBar}>
                <View 
                  style={[
                    styles.modalProgressFill,
                    { width: `${Math.min(progressPercentage, 100)}%` }
                  ]}
                />
              </View>
              <Text style={styles.modalProgressText}>
                {currentProgress}/{targetProgress} ({progressPercentage.toFixed(1)}%)
              </Text>
            </View>
          )}
          
          <View style={styles.modalFooter}>
            <View style={styles.modalMetaRow}>
              <Text style={styles.modalMetaLabel}>카테고리:</Text>
              <Text style={styles.modalMetaValue}>
                {getCategoryLabel(achievement.category)}
              </Text>
            </View>
            <View style={styles.modalMetaRow}>
              <Text style={styles.modalMetaLabel}>등급:</Text>
              <Text style={[
                styles.modalMetaValue,
                { color: getRarityColor(achievement.rarity) }
              ]}>
                {getRarityLabel(achievement.rarity)}
              </Text>
            </View>
            <View style={styles.modalMetaRow}>
              <Text style={styles.modalMetaLabel}>포인트:</Text>
              <Text style={styles.modalMetaValue}>+{achievement.points}P</Text>
            </View>
            {isUnlocked && achievement.unlockedAt && (
              <View style={styles.modalMetaRow}>
                <Text style={styles.modalMetaLabel}>달성일:</Text>
                <Text style={styles.modalMetaValue}>
                  {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Helper functions
const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return colors.gray[400];
    case 'uncommon': return colors.success;
    case 'rare': return colors.info;
    case 'epic': return colors.warning;
    case 'legendary': return colors.error;
    default: return colors.gray[400];
  }
};

const getRarityLabel = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return '일반';
    case 'uncommon': return '레어';
    case 'rare': return '희귀';
    case 'epic': return '에픽';
    case 'legendary': return '전설';
    default: return '일반';
  }
};

const getCategoryLabel = (category: Achievement['category']) => {
  switch (category) {
    case 'quantity': return '기록 수';
    case 'quality': return '품질';
    case 'variety': return '다양성';
    case 'social': return '소셜';
    case 'expertise': return '전문성';
    case 'special': return '특별';
    default: return '기타';
  }
};

export default function AchievementsScreen() {
  const navigation = useNavigation<any>();
  
  // Foundation stores
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
    markAllAchievementsAsSeen,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsByCategory,
    getTotalPoints,
    getCompletionPercentage,
  } = useAchievementStore();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const [showLocked, setShowLocked] = useState(true);
  
  // Data loading
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        loadAchievements(),
        loadUserAchievements(),
        loadUserStats(),
      ]);
    } catch (error) {
      console.error('Failed to load achievements data:', error);
    }
  }, [loadAchievements, loadUserAchievements, loadUserStats]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);
  
  // Achievement handling
  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };
  
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAchievement(null);
  };
  
  // Filter achievements
  const filteredAchievements = React.useMemo(() => {
    let achievements = selectedCategory === 'all' 
      ? allAchievements 
      : getAchievementsByCategory(selectedCategory);
    
    if (!showLocked) {
      achievements = achievements.filter(achievement => 
        achievementProgress[achievement.id]?.isUnlocked || achievement.unlockedAt
      );
    }
    
    return achievements;
  }, [allAchievements, selectedCategory, showLocked, getAchievementsByCategory, achievementProgress]);
  
  // Effects
  useFocusEffect(
    useCallback(() => {
      loadData();
      // Mark new unlocks as seen when screen is focused
      if (newUnlocksCount > 0) {
        markAllAchievementsAsSeen();
      }
    }, [loadData, newUnlocksCount, markAllAchievementsAsSeen])
  );
  
  // Stats
  const unlockedCount = getUnlockedAchievements().length;
  const totalCount = allAchievements.length;
  const completionPercentage = getCompletionPercentage();
  const totalPoints = getTotalPoints();
  
  // Categories
  const categories: Array<{ key: Achievement['category'] | 'all', label: string }> = [
    { key: 'all', label: '전체' },
    { key: 'quantity', label: '기록 수' },
    { key: 'quality', label: '품질' },
    { key: 'variety', label: '다양성' },
    { key: 'social', label: '소셜' },
    { key: 'expertise', label: '전문성' },
    { key: 'special', label: '특별' },
  ];
  
  // Error state
  if (error && allAchievements.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>데이터를 불러올 수 없습니다</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>업적</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowLocked(!showLocked)}
        >
          <Text style={styles.toggleButtonText}>
            {showLocked ? '완료된 것만' : '전체 보기'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{unlockedCount}/{totalCount}</Text>
          <Text style={styles.statsLabel}>달성한 업적</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{completionPercentage.toFixed(1)}%</Text>
          <Text style={styles.statsLabel}>완료율</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{totalPoints}</Text>
          <Text style={styles.statsLabel}>총 포인트</Text>
        </View>
      </View>
      
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.key && styles.categoryButtonTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Achievements List */}
      <FlatList
        data={filteredAchievements}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <AchievementCard
            achievement={item}
            progress={achievementProgress[item.id]}
            onPress={() => handleAchievementPress(item)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>업적이 없습니다</Text>
            <Text style={styles.emptyMessage}>
              {selectedCategory === 'all' 
                ? '아직 업적이 로드되지 않았습니다'
                : '이 카테고리에 업적이 없습니다'
              }
            </Text>
          </View>
        )}
      />
      
      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        visible={modalVisible}
        achievement={selectedAchievement}
        progress={selectedAchievement ? achievementProgress[selectedAchievement.id] : undefined}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  toggleButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Stats Overview
  statsOverview: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statsLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  
  // Category Filter
  categoryScrollView: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  
  // Achievements List
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  achievementCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  achievementIcon: {
    fontSize: typography.fontSize.xxxl,
  },
  unlockedBadge: {
    backgroundColor: colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedBadgeText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  achievementName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    minHeight: typography.fontSize.md * 2,
  },
  achievementDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.md,
    minHeight: typography.fontSize.sm * 3 * 1.4,
  },
  achievementTextLocked: {
    color: colors.text.tertiary,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  rarityText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  pointsText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    marginTop: spacing.huge,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.5,
  },
  
  // Error State
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    padding: spacing.sm,
  },
  modalCloseText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  modalUnlockedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  modalUnlockedText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.5,
    marginBottom: spacing.xl,
  },
  modalProgressSection: {
    marginBottom: spacing.xl,
  },
  modalProgressLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.lg,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalMetaLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  modalMetaValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
});