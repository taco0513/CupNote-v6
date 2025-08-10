/**
 * Simple Toast Component for CupNote v6
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  style?: ViewStyle;
}

const getTypeColors = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: colors.success,
        textColor: colors.white,
        icon: '✓',
      };
    case 'error':
      return {
        backgroundColor: colors.error,
        textColor: colors.white,
        icon: '✕',
      };
    case 'warning':
      return {
        backgroundColor: colors.warning,
        textColor: colors.white,
        icon: '⚠',
      };
    case 'info':
    default:
      return {
        backgroundColor: colors.primary,
        textColor: colors.white,
        icon: 'ℹ',
      };
  }
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  position = 'top',
  visible,
  duration = 4000,
  onHide,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(position === 'top' ? -200 : 200);
  const opacity = useSharedValue(0);

  const typeColors = getTypeColors(type);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 300 });

      if (duration > 0) {
        const timer = setTimeout(() => {
          translateY.value = withTiming(position === 'top' ? -200 : 200, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 });
          setTimeout(() => {
            onHide?.();
          }, 300);
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      translateY.value = withTiming(position === 'top' ? -200 : 200, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, position, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <View style={[
      styles.wrapper,
      position === 'top' 
        ? { top: insets.top + spacing.md }
        : { bottom: insets.bottom + spacing.md }
    ]}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: typeColors.backgroundColor,
          },
          style,
          animatedStyle,
        ]}
      >
        <Text style={[styles.icon, { color: typeColors.textColor }]}>
          {typeColors.icon}
        </Text>
        <Text style={[styles.message, { color: typeColors.textColor }]}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: SCREEN_WIDTH - spacing.xl,
    minHeight: 48,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
    textAlign: 'center',
    minWidth: 20,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium as any,
    lineHeight: 20,
  },
});

export default Toast;