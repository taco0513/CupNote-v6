import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
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

interface AchievementBadgeProps {
  achievement: Achievement;
  progress?: AchievementProgress;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const getRarityColors = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return {
        border: colors.gray[300],
        background: colors.gray[50],
        text: colors.gray[700],
        accent: colors.gray[400],
      };
    case 'uncommon':
      return {
        border: colors.success,
        background: colors.successLight,
        text: colors.success,
        accent: colors.success,
      };
    case 'rare':
      return {
        border: colors.info,
        background: colors.infoLight,
        text: colors.info,
        accent: colors.info,
      };
    case 'epic':
      return {
        border: colors.warning,
        background: colors.warningLight,
        text: colors.warning,
        accent: colors.warning,
      };
    case 'legendary':
      return {
        border: colors.error,
        background: colors.errorLight,
        text: colors.error,
        accent: colors.error,
      };
    default:
      return {
        border: colors.gray[300],
        background: colors.gray[50],
        text: colors.gray[700],
        accent: colors.gray[400],
      };
  }
};

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        containerSize: 60,
        iconSize: 24,
        fontSize: typography.fontSize.xs,
        borderWidth: 2,
        borderRadius: 30,
      };
    case 'medium':
      return {
        containerSize: 80,
        iconSize: 32,
        fontSize: typography.fontSize.sm,
        borderWidth: 3,
        borderRadius: 40,
      };
    case 'large':
      return {
        containerSize: 100,
        iconSize: 40,
        fontSize: typography.fontSize.md,
        borderWidth: 4,
        borderRadius: 50,
      };
    default:
      return {
        containerSize: 80,
        iconSize: 32,
        fontSize: typography.fontSize.sm,
        borderWidth: 3,
        borderRadius: 40,
      };
  }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  progress,
  size = 'medium',
  showProgress = false,
  onPress,
  style,
}) => {
  const rarityColors = getRarityColors(achievement.rarity);
  const sizeConfig = getSizeConfig(size);
  const isUnlocked = progress?.isUnlocked || false;
  const canUnlock = progress?.canUnlock || false;

  const badgeStyle = [
    styles.container,
    {
      width: sizeConfig.containerSize,
      height: sizeConfig.containerSize,
      borderRadius: sizeConfig.borderRadius,
      borderWidth: sizeConfig.borderWidth,
      borderColor: isUnlocked ? rarityColors.border : colors.gray[300],
      backgroundColor: isUnlocked ? rarityColors.background : colors.gray[100],
      opacity: isUnlocked ? 1 : 0.6,
    },
    canUnlock && !isUnlocked && styles.canUnlock,
    style,
  ];

  const textStyle = [
    styles.icon,
    {
      fontSize: sizeConfig.iconSize,
      color: isUnlocked ? rarityColors.text : colors.gray[500],
    },
  ];

  const nameStyle = [
    styles.name,
    {
      fontSize: sizeConfig.fontSize,
      color: isUnlocked ? colors.text.primary : colors.gray[500],
    },
  ];

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={badgeStyle}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={textStyle}>{achievement.icon}</Text>
      
      {size !== 'small' && (
        <Text style={nameStyle} numberOfLines={2} textAlign="center">
          {achievement.name}
        </Text>
      )}

      {showProgress && progress && !isUnlocked && (
        <View style={[styles.progressContainer, { width: sizeConfig.containerSize - 8 }]}>
          <View
            style={[
              styles.progressBar,
              { 
                width: `${progress.percentage}%`,
                backgroundColor: rarityColors.accent,
              },
            ]}
          />
        </View>
      )}

      {isUnlocked && achievement.rarity !== 'common' && (
        <View style={[styles.rarityBadge, { backgroundColor: rarityColors.accent }]}>
          <Text style={styles.rarityText}>
            {achievement.rarity.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {canUnlock && !isUnlocked && (
        <View style={styles.canUnlockIndicator}>
          <Text style={styles.canUnlockText}>!</Text>
        </View>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    position: 'relative',
  },
  canUnlock: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium as any,
    lineHeight: typography.fontSize.sm * 1.2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 4,
    height: 3,
    backgroundColor: colors.gray[200],
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  rarityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold as any,
  },
  canUnlockIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canUnlockText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold as any,
  },
});

export default AchievementBadge;