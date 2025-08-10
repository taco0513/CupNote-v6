/**
 * SegmentedControl Component
 * iOS-style segmented control for mutually exclusive options
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

interface SegmentedControlProps<T extends string> {
  options: Array<{
    value: T;
    label: string;
    icon?: string;
  }>;
  value: T;
  onValueChange: (value: T) => void;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  color?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  style,
  size = 'medium',
  fullWidth = false,
  disabled = false,
  color = colors.primary,
}: SegmentedControlProps<T>) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          option: styles.optionSmall,
          text: styles.textSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          option: styles.optionLarge,
          text: styles.textLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          option: styles.optionMedium,
          text: styles.textMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View 
      style={[
        styles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              sizeStyles.option,
              isSelected && styles.optionSelected,
              isSelected && { backgroundColor: color },
              isFirst && styles.optionFirst,
              isLast && styles.optionLast,
              fullWidth && styles.optionFullWidth,
            ]}
            onPress={() => !disabled && onValueChange(option.value)}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
          >
            {option.icon && (
              <Text 
                style={[
                  styles.icon,
                  isSelected && styles.iconSelected,
                ]}
              >
                {option.icon}
              </Text>
            )}
            <Text
              style={[
                styles.text,
                sizeStyles.text,
                isSelected && styles.textSelected,
                disabled && styles.textDisabled,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: 2,
  },
  fullWidth: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  // Size variations for container
  containerSmall: {
    padding: 2,
  },
  containerMedium: {
    padding: 2,
  },
  containerLarge: {
    padding: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md - 2,
    backgroundColor: 'transparent',
  },
  optionFullWidth: {
    flex: 1,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionFirst: {
    marginRight: 1,
  },
  optionLast: {
    marginLeft: 1,
  },
  // Size variations for options
  optionSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 32,
  },
  optionMedium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 40,
  },
  optionLarge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 48,
  },
  icon: {
    marginRight: spacing.xs,
    fontSize: 16,
  },
  iconSelected: {
    color: colors.white,
  },
  text: {
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  textSelected: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
  // Size variations for text
  textSmall: {
    fontSize: typography.fontSize.sm,
  },
  textMedium: {
    fontSize: typography.fontSize.md,
  },
  textLarge: {
    fontSize: typography.fontSize.lg,
  },
});

export default SegmentedControl;