import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { colors, spacing } from '../../styles/theme';
import { Achievement } from '../../types';
import { AchievementBadge } from './AchievementBadge';
import { AchievementModal } from './AchievementModal';

interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
  canUnlock: boolean;
  unlockedAt?: Date;
}

interface AchievementGridProps {
  achievements: Achievement[];
  achievementProgress: Record<string, AchievementProgress>;
  onRefresh?: () => void;
  refreshing?: boolean;
  showProgress?: boolean;
  numColumns?: number;
  onAchievementPress?: (achievement: Achievement) => void;
  onAchievementShare?: (achievement: Achievement) => void;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  achievementProgress,
  onRefresh,
  refreshing = false,
  showProgress = true,
  numColumns = 3,
  onAchievementPress,
  onAchievementShare,
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAchievementPress = (achievement: Achievement) => {
    if (onAchievementPress) {
      onAchievementPress(achievement);
    } else {
      setSelectedAchievement(achievement);
      setModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedAchievement(null);
  };

  const handleShare = () => {
    if (selectedAchievement && onAchievementShare) {
      onAchievementShare(selectedAchievement);
    }
    handleModalClose();
  };

  const sortedAchievements = [...achievements].sort((a, b) => {
    const progressA = achievementProgress[a.id];
    const progressB = achievementProgress[b.id];

    // Prioritize unlocked achievements
    if (progressA?.isUnlocked && !progressB?.isUnlocked) return -1;
    if (!progressA?.isUnlocked && progressB?.isUnlocked) return 1;

    // Then prioritize achievements that can be unlocked
    if (progressA?.canUnlock && !progressB?.canUnlock) return -1;
    if (!progressA?.canUnlock && progressB?.canUnlock) return 1;

    // Then sort by progress percentage (highest first)
    const percentageA = progressA?.percentage || 0;
    const percentageB = progressB?.percentage || 0;
    if (percentageA !== percentageB) return percentageB - percentageA;

    // Finally sort by rarity (legendary first)
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    const rarityA = rarityOrder[a.rarity] || 5;
    const rarityB = rarityOrder[b.rarity] || 5;
    
    return rarityA - rarityB;
  });

  const renderAchievement: ListRenderItem<Achievement> = ({ item, index }) => {
    const progress = achievementProgress[item.id];
    const isLastInRow = (index + 1) % numColumns === 0;
    const isLastRow = index >= sortedAchievements.length - (sortedAchievements.length % numColumns || numColumns);

    return (
      <View style={[
        styles.achievementItem,
        { width: `${100 / numColumns}%` },
        !isLastInRow && styles.achievementItemWithMargin,
        !isLastRow && styles.achievementItemWithBottomMargin,
      ]}>
        <AchievementBadge
          achievement={item}
          progress={progress}
          showProgress={showProgress}
          onPress={() => handleAchievementPress(item)}
          size="medium"
        />
      </View>
    );
  };

  const getItemLayout = (_: any, index: number) => ({
    length: 100 + spacing.md, // Approximate height + margin
    offset: (100 + spacing.md) * Math.floor(index / numColumns),
    index,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedAchievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      />

      <AchievementModal
        visible={modalVisible}
        achievement={selectedAchievement}
        progress={selectedAchievement ? achievementProgress[selectedAchievement.id] : undefined}
        onClose={handleModalClose}
        onShare={onAchievementShare ? handleShare : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  row: {
    justifyContent: 'flex-start',
  },
  achievementItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  achievementItemWithMargin: {
    marginRight: spacing.sm,
  },
  achievementItemWithBottomMargin: {
    marginBottom: spacing.md,
  },
});

export default AchievementGrid;