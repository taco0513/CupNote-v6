/**
 * Simple Loading Component for CupNote v6
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

export type LoadingSize = 'small' | 'medium' | 'large';

export interface LoadingProps {
  visible?: boolean;
  message?: string;
  size?: LoadingSize;
  overlay?: boolean;
  style?: ViewStyle;
}

const getSizeConfig = (size: LoadingSize) => {
  switch (size) {
    case 'small':
      return {
        indicatorSize: 'small' as const,
        containerSize: 60,
        fontSize: typography.fontSize.sm,
      };
    case 'large':
      return {
        indicatorSize: 'large' as const,
        containerSize: 120,
        fontSize: typography.fontSize.lg,
      };
    case 'medium':
    default:
      return {
        indicatorSize: 'small' as const,
        containerSize: 80,
        fontSize: typography.fontSize.md,
      };
  }
};

export const Loading: React.FC<LoadingProps> = ({
  visible = false,
  message,
  size = 'medium',
  overlay = false,
  style,
}) => {
  const sizeConfig = getSizeConfig(size);

  const content = (
    <View style={[
      styles.container,
      overlay && styles.overlayContainer,
      style,
    ]}>
      <View style={[
        styles.content,
        { 
          minHeight: sizeConfig.containerSize,
          minWidth: sizeConfig.containerSize,
        }
      ]}>
        <ActivityIndicator
          size={sizeConfig.indicatorSize}
          color={colors.primary}
          style={styles.indicator}
        />
        {message && (
          <Text style={[
            styles.message,
            { fontSize: sizeConfig.fontSize }
          ]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  if (!visible) {
    return null;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  overlayContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  indicator: {
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium as any,
    lineHeight: 20,
  },
});

export default Loading;