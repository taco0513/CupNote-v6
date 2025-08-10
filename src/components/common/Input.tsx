/**
 * Input Component
 * Reusable text input with variants
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  required?: boolean;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  variant = 'outlined',
  size = 'medium',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Get size-specific styles
  const sizeStyles = {
    small: {
      container: styles.inputContainerSmall,
      input: styles.inputSmall,
      paddingVertical: spacing.sm,
    },
    medium: {
      container: styles.inputContainerMedium,
      input: styles.inputMedium,
      paddingVertical: spacing.md,
    },
    large: {
      container: styles.inputContainerLarge,
      input: styles.inputLarge,
      paddingVertical: spacing.lg,
    },
  };

  const currentSizeStyle = sizeStyles[size];

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.requiredIndicator}> *</Text>}
          </Text>
        </View>
      )}
      
      <View
        style={[
          styles.inputContainer,
          variant === 'filled' && styles.inputContainerFilled,
          currentSizeStyle.container,
          isFocused && styles.inputContainerFocused,
          isFocused && variant === 'filled' && styles.inputContainerFilledFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <Text style={styles.leftIcon}>{leftIcon}</Text>}
        
        <TextInput
          style={[styles.input, currentSizeStyle.input, style]}
          placeholderTextColor={colors.gray[500]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Text style={styles.rightIcon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  requiredIndicator: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    paddingHorizontal: spacing.md,
  },
  inputContainerFilled: {
    backgroundColor: colors.gray[100],
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerFilledFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  // Size variations for container
  inputContainerSmall: {
    paddingHorizontal: spacing.sm,
  },
  inputContainerMedium: {
    paddingHorizontal: spacing.md,
  },
  inputContainerLarge: {
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  // Size variations for input text
  inputSmall: {
    fontSize: typography.fontSize.sm,
    paddingVertical: spacing.sm,
  },
  inputMedium: {
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
  },
  inputLarge: {
    fontSize: typography.fontSize.lg,
    paddingVertical: spacing.lg,
  },
  leftIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    color: colors.text.secondary,
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: spacing.sm,
    color: colors.text.secondary,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
});