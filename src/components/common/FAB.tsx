/**
 * Floating Action Button (FAB) Component
 * Primary CTA for starting coffee recording
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../../styles/theme';

interface FABProps {
  onPress: () => void;
  isVisible?: boolean;
}

export const FAB: React.FC<FABProps> = ({ onPress, isVisible = true }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    onPress();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.fab}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityLabel="커피 기록 시작"
        accessibilityHint="새로운 커피 기록을 시작합니다"
        accessibilityRole="button"
      >
        <Text style={styles.icon}>☕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // 80px from bottom (above tab bar)
    right: 20, // 20px from right
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    // Additional shadow for prominence
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 24,
    color: colors.white,
    // Slight text shadow for better visibility
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default FAB;