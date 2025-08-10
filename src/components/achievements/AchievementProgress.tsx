import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';
import { Achievement } from '../../types';

interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
  canUnlock: boolean;
  unlockedAt?: Date;
}

interface AchievementProgressProps {
  progress: AchievementProgress;
  achievement: Achievement;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return colors.gray[400];
    case 'uncommon':
      return colors.success;
    case 'rare':
      return colors.info;
    case 'epic':
      return colors.warning;
    case 'legendary':
      return colors.error;
    default:
      return colors.gray[400];
  }
};

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        height: 4,
        borderRadius: 2,
        fontSize: typography.fontSize.xs,
      };
    case 'medium':
      return {
        height: 6,
        borderRadius: 3,
        fontSize: typography.fontSize.sm,
      };
    case 'large':
      return {
        height: 8,
        borderRadius: 4,
        fontSize: typography.fontSize.md,
      };
    default:
      return {
        height: 6,
        borderRadius: 3,
        fontSize: typography.fontSize.sm,
      };
  }
};

export const AchievementProgress: React.FC<AchievementProgressProps> = ({
  progress,
  achievement,
  showLabel = false,
  size = 'medium',
  style,
}) => {
  const rarityColor = getRarityColor(achievement.rarity);
  const sizeConfig = getSizeConfig(size);
  const isUnlocked = progress.isUnlocked;
  const canUnlock = progress.canUnlock;

  const progressBarStyle = [
    styles.container,
    {
      height: sizeConfig.height,
      borderRadius: sizeConfig.borderRadius,
    },
    style,
  ];

  const fillStyle = [
    styles.fill,
    {
      width: `${Math.min(progress.percentage, 100)}%`,
      backgroundColor: isUnlocked 
        ? colors.success 
        : canUnlock 
          ? colors.primary 
          : rarityColor,
      borderRadius: sizeConfig.borderRadius,
    },
  ];

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { fontSize: sizeConfig.fontSize }]}>
            진행률
          </Text>
          <Text style={[styles.percentageText, { fontSize: sizeConfig.fontSize }]}>
            {progress.percentage}%
          </Text>
        </View>
      )}
      
      <View style={progressBarStyle}>
        <View style={fillStyle} />
        
        {canUnlock && !isUnlocked && (
          <View style={[styles.pulseOverlay, { borderRadius: sizeConfig.borderRadius }]} />
        )}
      </View>

      {showLabel && (
        <View style={styles.detailsContainer}>
          <Text style={[styles.details, { fontSize: sizeConfig.fontSize - 2 }]}>
            {progress.current} / {progress.target}
          </Text>
          
          {canUnlock && !isUnlocked && (
            <Text style={[styles.canUnlockLabel, { fontSize: sizeConfig.fontSize - 2 }]}>
              달성 가능!
            </Text>
          )}
          
          {isUnlocked && (
            <Text style={[styles.unlockedLabel, { fontSize: sizeConfig.fontSize - 2 }]}>
              완료 ✓
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium as any,
  },
  percentageText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold as any,
  },
  container: {
    backgroundColor: colors.gray[200],
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
  },
  pulseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  details: {
    color: colors.gray[600],
  },
  canUnlockLabel: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold as any,
  },
  unlockedLabel: {
    color: colors.success,
    fontWeight: typography.fontWeight.semibold as any,
  },
});

export default AchievementProgress;