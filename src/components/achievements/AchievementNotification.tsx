import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';
import { Achievement } from '../../types';
import { AchievementBadge } from './AchievementBadge';

interface AchievementNotificationProps {
  achievement: Achievement;
  visible: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
  autoHideDuration?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NOTIFICATION_HEIGHT = 120;

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  visible,
  onPress,
  onDismiss,
  autoHideDuration = 4000,
}) => {
  const slideAnim = useRef(new Animated.Value(-NOTIFICATION_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const autoHideTimer = useRef<NodeJS.Timeout>();

  // Pan responder for swipe to dismiss
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy < 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy < -50 || gestureState.vy < -0.5) {
        // Swipe up to dismiss
        hideNotification();
      } else {
        // Return to original position
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const showNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    if (autoHideDuration > 0) {
      autoHideTimer.current = setTimeout(() => {
        hideNotification();
      }, autoHideDuration);
    }
  };

  const hideNotification = () => {
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -NOTIFICATION_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  useEffect(() => {
    if (visible) {
      showNotification();
    } else {
      hideNotification();
    }

    return () => {
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
      }
    };
  }, [visible]);

  const getRarityColors = () => {
    switch (achievement.rarity) {
      case 'common':
        return {
          background: colors.gray[50],
          border: colors.gray[300],
          accent: colors.gray[400],
        };
      case 'uncommon':
        return {
          background: colors.successLight,
          border: colors.success,
          accent: colors.success,
        };
      case 'rare':
        return {
          background: colors.infoLight,
          border: colors.info,
          accent: colors.info,
        };
      case 'epic':
        return {
          background: colors.warningLight,
          border: colors.warning,
          accent: colors.warning,
        };
      case 'legendary':
        return {
          background: colors.errorLight,
          border: colors.error,
          accent: colors.error,
        };
      default:
        return {
          background: colors.gray[50],
          border: colors.gray[300],
          accent: colors.gray[400],
        };
    }
  };

  const rarityColors = getRarityColors();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: rarityColors.background,
      borderColor: rarityColors.border,
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim },
      ],
      opacity: opacityAnim,
    },
  ];

  const handlePress = () => {
    if (onPress) {
      onPress();
      hideNotification();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.wrapper, containerStyle]} {...panResponder.panHandlers}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Celebration Effect */}
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationEmoji}>✨</Text>
          <Text style={styles.celebrationEmoji}>🎊</Text>
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>새로운 성취!</Text>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={hideNotification}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Achievement Info */}
          <View style={styles.achievementInfo}>
            <View style={styles.badgeContainer}>
              <AchievementBadge
                achievement={achievement}
                progress={{ 
                  achievementId: achievement.id,
                  current: achievement.requirement.target,
                  target: achievement.requirement.target,
                  percentage: 100,
                  isUnlocked: true,
                  canUnlock: false,
                  unlockedAt: new Date(),
                }}
                size="small"
              />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.achievementName} numberOfLines={1}>
                {achievement.name}
              </Text>
              <Text style={styles.achievementDesc} numberOfLines={2}>
                {achievement.description}
              </Text>
              <Text style={[styles.achievementPoints, { color: rarityColors.accent }]}>
                +{achievement.points} 포인트
              </Text>
            </View>
          </View>

          {/* Rarity Indicator */}
          <View style={[styles.rarityIndicator, { backgroundColor: rarityColors.accent }]} />
        </View>

        {/* Swipe Indicator */}
        <View style={styles.swipeIndicator}>
          <View style={styles.swipeHandle} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60, // Below status bar
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    elevation: 20,
  },
  container: {
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  celebrationContainer: {
    position: 'absolute',
    top: -10,
    right: 10,
    flexDirection: 'row',
    gap: spacing.xs,
    zIndex: 1,
  },
  celebrationEmoji: {
    fontSize: 20,
  },
  content: {
    padding: spacing.md,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  dismissButton: {
    padding: spacing.xs,
  },
  dismissText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badgeContainer: {
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  achievementName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  achievementDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    lineHeight: typography.fontSize.sm * 1.3,
    marginBottom: spacing.xs,
  },
  achievementPoints: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold as any,
  },
  rarityIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  swipeIndicator: {
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  swipeHandle: {
    width: 40,
    height: 3,
    backgroundColor: colors.gray[400],
    borderRadius: 1.5,
  },
});

export default AchievementNotification;