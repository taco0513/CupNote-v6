/**
 * Stepper Component
 * Numeric input with increment/decrement controls
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

interface StepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  editable?: boolean;
  color?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit,
  style,
  size = 'medium',
  disabled = false,
  editable = true,
  color = colors.primary,
}) => {
  const handleIncrement = () => {
    const newValue = value + step;
    if (newValue <= max) {
      onValueChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onValueChange(newValue);
    }
  };

  const handleTextChange = (text: string) => {
    const numValue = parseFloat(text) || 0;
    if (numValue >= min && numValue <= max) {
      onValueChange(numValue);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          button: styles.buttonSmall,
          buttonText: styles.buttonTextSmall,
          value: styles.valueSmall,
          label: styles.labelSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          button: styles.buttonLarge,
          buttonText: styles.buttonTextLarge,
          value: styles.valueLarge,
          label: styles.labelLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          button: styles.buttonMedium,
          buttonText: styles.buttonTextMedium,
          value: styles.valueMedium,
          label: styles.labelMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const isDecrementDisabled = disabled || value <= min;
  const isIncrementDisabled = disabled || value >= max;

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, sizeStyles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
      
      <View style={[styles.container, sizeStyles.container, disabled && styles.containerDisabled]}>
        <TouchableOpacity
          style={[
            styles.button,
            sizeStyles.button,
            styles.buttonLeft,
            isDecrementDisabled && styles.buttonDisabled,
          ]}
          onPress={handleDecrement}
          disabled={isDecrementDisabled}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              sizeStyles.buttonText,
              isDecrementDisabled && styles.buttonTextDisabled,
            ]}
          >
            −
          </Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          {editable && !disabled ? (
            <TextInput
              style={[styles.value, sizeStyles.value]}
              value={value.toString()}
              onChangeText={handleTextChange}
              keyboardType="numeric"
              editable={!disabled}
              selectTextOnFocus
            />
          ) : (
            <Text style={[styles.value, sizeStyles.value, disabled && styles.valueDisabled]}>
              {value}
            </Text>
          )}
          {unit && (
            <Text style={[styles.unit, sizeStyles.value, disabled && styles.unitDisabled]}>
              {unit}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            sizeStyles.button,
            styles.buttonRight,
            isIncrementDisabled && styles.buttonDisabled,
          ]}
          onPress={handleIncrement}
          disabled={isIncrementDisabled}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              sizeStyles.buttonText,
              isIncrementDisabled && styles.buttonTextDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  labelDisabled: {
    color: colors.text.tertiary,
  },
  // Size variations for label
  labelSmall: {
    fontSize: typography.fontSize.xs,
  },
  labelMedium: {
    fontSize: typography.fontSize.sm,
  },
  labelLarge: {
    fontSize: typography.fontSize.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    overflow: 'hidden',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  // Size variations for container
  containerSmall: {
    height: 32,
  },
  containerMedium: {
    height: 44,
  },
  containerLarge: {
    height: 56,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderColor: colors.border.light,
  },
  buttonLeft: {
    borderRightWidth: 1,
  },
  buttonRight: {
    borderLeftWidth: 1,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[50],
  },
  // Size variations for button
  buttonSmall: {
    width: 32,
  },
  buttonMedium: {
    width: 44,
  },
  buttonLarge: {
    width: 56,
  },
  buttonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  buttonTextDisabled: {
    color: colors.text.tertiary,
  },
  // Size variations for button text
  buttonTextSmall: {
    fontSize: typography.fontSize.lg,
  },
  buttonTextMedium: {
    fontSize: typography.fontSize.xl,
  },
  buttonTextLarge: {
    fontSize: typography.fontSize.xxl,
  },
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  value: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    minWidth: 40,
  },
  valueDisabled: {
    color: colors.text.tertiary,
  },
  // Size variations for value
  valueSmall: {
    fontSize: typography.fontSize.sm,
  },
  valueMedium: {
    fontSize: typography.fontSize.md,
  },
  valueLarge: {
    fontSize: typography.fontSize.lg,
  },
  unit: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  unitDisabled: {
    color: colors.text.tertiary,
  },
});

export default Stepper;