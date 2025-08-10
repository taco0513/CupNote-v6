/**
 * Slider Component
 * Simple and reliable slider for rating inputs
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  ViewStyle,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  min?: number; // alias for minimumValue
  max?: number; // alias for maximumValue
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  trackColor?: string;
  thumbColor?: string;
  color?: string; // alias for trackColor
  style?: ViewStyle;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 5,
  min,
  max,
  step = 1,
  label,
  showValue = true,
  disabled = false,
  trackColor = colors.primary,
  thumbColor = colors.primary,
  color,
  style,
}) => {
  // Use min/max as aliases if provided
  const minVal = min !== undefined ? min : minimumValue;
  const maxVal = max !== undefined ? max : maximumValue;
  const trackCol = color || trackColor;
  const thumbCol = color || thumbColor;
  
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Safe value calculation
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : minVal;
  const range = maxVal - minVal;
  const percentage = range > 0 ? ((safeValue - minVal) / range) * 100 : 0;
  
  // Update value based on touch position
  const updateValueFromPosition = useCallback((locationX: number) => {
    if (sliderWidth <= 0 || disabled) return;
    
    const clampedX = Math.max(0, Math.min(locationX, sliderWidth));
    const percentage = clampedX / sliderWidth;
    const newValue = percentage * range + minVal;
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.min(Math.max(steppedValue, minVal), maxVal);
    
    if (typeof clampedValue === 'number' && !isNaN(clampedValue)) {
      onValueChange(clampedValue);
    }
  }, [sliderWidth, disabled, range, minVal, maxVal, step, onValueChange]);

  // Create PanResponder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      setIsDragging(true);
      updateValueFromPosition(evt.nativeEvent.locationX);
    },
    
    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      updateValueFromPosition(evt.nativeEvent.locationX);
    },
    
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
    
    onPanResponderTerminate: () => {
      setIsDragging(false);
    },
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showValue && <Text style={styles.value}>{safeValue.toFixed(step < 1 ? 1 : 0)}</Text>}
        </View>
      )}
      
      <View
        style={[
          styles.sliderContainer,
          isDragging && styles.sliderContainerActive
        ]}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {/* Track */}
        <View style={[
          styles.track, 
          disabled && styles.disabledTrack
        ]} />
        
        {/* Fill */}
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(0, Math.min(percentage, 100))}%`,
              backgroundColor: disabled ? colors.gray[400] : trackCol,
            },
          ]}
        />
        
        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: `${Math.max(0, Math.min(percentage, 100))}%`,
              backgroundColor: disabled ? colors.gray[400] : thumbCol,
              transform: [{ scale: isDragging ? 1.2 : 1 }],
            },
          ]}
        />
      </View>
      
      {showValue && !label && (
        <Text style={styles.standaloneValue}>{safeValue.toFixed(step < 1 ? 1 : 0)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium as any,
  },
  value: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold as any,
  },
  standaloneValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sliderContainer: {
    height: 44, // Increased for better touch target
    justifyContent: 'center',
    paddingVertical: 8,
  },
  sliderContainerActive: {
    // Visual feedback when dragging
  },
  track: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
  },
  disabledTrack: {
    backgroundColor: colors.gray[100],
  },
  fill: {
    position: 'absolute',
    height: 6,
    borderRadius: borderRadius.full,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginLeft: -12,
    top: 10, // Center vertically in the 44px container
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});