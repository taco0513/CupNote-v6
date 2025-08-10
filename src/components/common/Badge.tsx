/**
 * Badge Component
 * Small label for status or categorization
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  icon?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
  icon,
  style,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]}>
      {icon && <Text style={[styles.icon, styles[`${variant}Text`]]}>{icon}</Text>}
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  
  // Variants
  default: {
    backgroundColor: colors.gray[200],
  },
  primary: {
    backgroundColor: colors.primary,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  error: {
    backgroundColor: colors.error,
  },
  info: {
    backgroundColor: colors.info,
  },
  
  // Sizes
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  
  // Text
  text: {
    fontWeight: typography.fontWeight.medium,
  },
  defaultText: {
    color: colors.text.primary,
  },
  primaryText: {
    color: colors.white,
  },
  successText: {
    color: colors.white,
  },
  warningText: {
    color: colors.white,
  },
  errorText: {
    color: colors.white,
  },
  infoText: {
    color: colors.white,
  },
  
  // Text Sizes
  smallText: {
    fontSize: typography.fontSize.xs,
  },
  mediumText: {
    fontSize: typography.fontSize.sm,
  },
  
  // Icon
  icon: {
    marginRight: spacing.xs,
    fontSize: 16,
  },
});