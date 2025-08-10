/**
 * Chip Component
 * Selectable chip following design system
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined' | 'filled';
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  disabled = false,
  size = 'medium',
  variant = 'default',
  color,
  style,
  textStyle,
}) => {
  const chipColor = color || colors.primary;
  
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[size],
        variant === 'outlined' && styles.outlined,
        variant === 'filled' && styles.filled,
        selected && [
          styles.selected,
          { 
            backgroundColor: variant === 'outlined' ? chipColor : chipColor,
            borderColor: chipColor,
          }
        ],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          styles[`${size}Text`],
          selected && styles.selectedText,
          disabled && styles.disabledText,
          variant === 'filled' && styles.filledText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.full,
  },
  
  // Variants
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  filled: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  
  // Sizes
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 28,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  
  // States
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Text
  text: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  selectedText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  disabledText: {
    color: colors.gray[500],
  },
  filledText: {
    color: colors.text.primary,
  },
  
  // Text Sizes
  smallText: {
    fontSize: typography.fontSize.xs,
  },
  mediumText: {
    fontSize: typography.fontSize.sm,
  },
  largeText: {
    fontSize: typography.fontSize.md,
  },
});