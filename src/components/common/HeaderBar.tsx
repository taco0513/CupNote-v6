/**
 * HeaderBar Component
 * Standardized screen header following design system
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing, shadows } from '../../styles/theme';
import { ProgressBar } from './ProgressBar';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  progress?: number;
  showProgress?: boolean;
  style?: ViewStyle;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  onBack,
  onClose,
  rightAction,
  progress,
  showProgress = false,
  style,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Left Action */}
          <View style={styles.leftAction}>
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          
          {/* Right Action */}
          <View style={styles.rightActionContainer}>
            {rightAction && (
              <TouchableOpacity
                onPress={rightAction.onPress}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Text style={styles.rightActionText}>{rightAction.label}</Text>
              </TouchableOpacity>
            )}
            {onClose && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Progress Bar */}
        {showProgress && progress !== undefined && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress}
              height={4}
              color={colors.primary}
              backgroundColor={colors.gray[200]}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  container: {
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  leftAction: {
    minWidth: 44,
  },
  rightActionContainer: {
    flexDirection: 'row',
    minWidth: 44,
    justifyContent: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  actionButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  rightActionText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
});