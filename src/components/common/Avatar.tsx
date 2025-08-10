/**
 * Avatar Component
 * User profile image or placeholder
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius } from '../../styles/theme';

interface AvatarProps {
  source?: { uri: string };
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = 'User',
  size = 'medium',
  style,
}) => {
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <View style={[styles.container, styles[size], style]}>
      {source?.uri ? (
        <Image source={source} style={[styles.image, styles[size]]} />
      ) : (
        <View style={[styles.placeholder, styles[size]]}>
          <Text style={[styles.initial, styles[`${size}Text`]]}>{initial}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  
  // Sizes
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  medium: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  large: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  xlarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  // Text Sizes
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.lg,
  },
  largeText: {
    fontSize: typography.fontSize.xxl,
  },
  xlargeText: {
    fontSize: typography.fontSize.display,
  },
});