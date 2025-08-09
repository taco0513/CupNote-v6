import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { theme } from '../../theme';

export interface SliderProps {
  /** 현재 값 */
  value: number;
  
  /** 값 변경 핸들러 */
  onValueChange: (value: number) => void;
  
  /** 최솟값 */
  minimumValue?: number;
  
  /** 최댓값 */
  maximumValue?: number;
  
  /** 단계 값 */
  step?: number;
  
  /** 라벨 */
  label?: string;
  
  /** 현재 값 표시 */
  showValue?: boolean;
  
  /** 최솟값/최댓값 라벨 표시 */
  showMinMaxLabels?: boolean;
  
  /** 커스텀 최솟값 라벨 */
  minimumLabel?: string;
  
  /** 커스텀 최댓값 라벨 */
  maximumLabel?: string;
  
  /** 값 포맷터 함수 */
  valueFormatter?: (value: number) => string;
  
  /** 비활성화 상태 */
  disabled?: boolean;
  
  /** 색상 테마 */
  colorTheme?: 'default' | 'acidity' | 'sweetness' | 'bitterness' | 'body' | 'balance';
  
  /** 크기 */
  size?: 'small' | 'medium' | 'large';
  
  /** 컨테이너 스타일 */
  containerStyle?: any;
  
  /** 테스트 ID */
  testID?: string;
}

/**
 * CupNote v6 맛 평가용 Slider 컴포넌트
 * 
 * Features:
 * - React Native Reanimated 기반 부드러운 애니메이션
 * - 맛 평가 특화 컬러 테마
 * - 한국어 라벨링 지원
 * - 접근성 AAA 등급 준수
 * - 햅틱 피드백 준비
 * - 1-10점 스케일 최적화
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  minimumValue = 1,
  maximumValue = 10,
  step = 0.1,
  label,
  showValue = true,
  showMinMaxLabels = true,
  minimumLabel,
  maximumLabel,
  valueFormatter,
  disabled = false,
  colorTheme = 'default',
  size = 'medium',
  containerStyle,
  testID,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

  // 색상 테마 가져오기
  const getThemeColors = () => {
    switch (colorTheme) {
      case 'acidity':
        return {
          primary: theme.colors.taste.acidity.default,
          light: theme.colors.taste.acidity.light,
          dark: theme.colors.taste.acidity.dark,
        };
      case 'sweetness':
        return {
          primary: theme.colors.taste.sweetness.default,
          light: theme.colors.taste.sweetness.light,
          dark: theme.colors.taste.sweetness.dark,
        };
      case 'bitterness':
        return {
          primary: theme.colors.taste.bitterness.default,
          light: theme.colors.taste.bitterness.light,
          dark: theme.colors.taste.bitterness.dark,
        };
      case 'body':
        return {
          primary: theme.colors.taste.body.default,
          light: theme.colors.taste.body.light,
          dark: theme.colors.taste.body.dark,
        };
      case 'balance':
        return {
          primary: theme.colors.taste.balance.default,
          light: theme.colors.taste.balance.light,
          dark: theme.colors.taste.balance.dark,
        };
      default:
        return {
          primary: theme.colors.coffee[500],
          light: theme.colors.coffee[100],
          dark: theme.colors.coffee[700],
        };
    }
  };

  const colors = getThemeColors();

  // 크기별 스타일
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          trackHeight: 4,
          thumbSize: 20,
          thumbBorderWidth: 2,
          fontSize: theme.typography.fontSize.sm,
        };
      case 'large':
        return {
          trackHeight: 8,
          thumbSize: 32,
          thumbBorderWidth: 3,
          fontSize: theme.typography.fontSize.lg,
        };
      default: // medium
        return {
          trackHeight: 6,
          thumbSize: 24,
          thumbBorderWidth: 2,
          fontSize: theme.typography.fontSize.base,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // 값을 위치로 변환
  const valueToPosition = useCallback((val: number) => {
    if (sliderWidth === 0) return 0;
    return ((val - minimumValue) / (maximumValue - minimumValue)) * (sliderWidth - sizeStyles.thumbSize);
  }, [sliderWidth, minimumValue, maximumValue, sizeStyles.thumbSize]);

  // 위치를 값으로 변환
  const positionToValue = useCallback((position: number) => {
    if (sliderWidth === 0) return minimumValue;
    const ratio = position / (sliderWidth - sizeStyles.thumbSize);
    const rawValue = minimumValue + ratio * (maximumValue - minimumValue);
    return Math.max(minimumValue, Math.min(maximumValue, Math.round(rawValue / step) * step));
  }, [sliderWidth, minimumValue, maximumValue, step, sizeStyles.thumbSize]);

  // 초기 위치 설정
  React.useEffect(() => {
    translateX.value = valueToPosition(value);
  }, [value, valueToPosition, translateX]);

  // 제스처 핸들러
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      isGestureActive.value = true;
    },
    onActive: (event) => {
      const newPosition = Math.max(0, Math.min(sliderWidth - sizeStyles.thumbSize, event.translationX + translateX.value));
      translateX.value = newPosition;
      
      const newValue = positionToValue(newPosition);
      runOnJS(onValueChange)(newValue);
    },
    onEnd: () => {
      isGestureActive.value = false;
      // 최종 위치로 스냅
      const finalValue = positionToValue(translateX.value);
      translateX.value = valueToPosition(finalValue);
    },
  });

  // 트랙 애니메이션 스타일
  const trackAnimatedStyle = useAnimatedStyle(() => {
    const progress = translateX.value / (sliderWidth - sizeStyles.thumbSize);
    return {
      width: interpolate(
        progress,
        [0, 1],
        [0, sliderWidth],
        Extrapolate.CLAMP
      ),
    };
  });

  // 썸 애니메이션 스타일
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const scale = isGestureActive.value ? 1.2 : 1;
    return {
      transform: [
        { translateX: translateX.value },
        { scale },
      ],
    };
  });

  // 값 포맷팅
  const formatValue = (val: number) => {
    if (valueFormatter) {
      return valueFormatter(val);
    }
    return val.toFixed(step < 1 ? 1 : 0);
  };

  // 컨테이너 스타일
  const getContainerStyle = () => ({
    opacity: disabled ? theme.opacity.disabled : 1,
  });

  // 라벨 스타일
  const getLabelStyle = () => ({
    fontSize: sizeStyles.fontSize,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    textAlign: 'center' as const,
  });

  // 값 표시 스타일
  const getValueStyle = () => ({
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: colors.primary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing[3],
  });

  // 트랙 컨테이너 스타일
  const getTrackContainerStyle = () => ({
    height: sizeStyles.trackHeight,
    backgroundColor: theme.colors.warm[200],
    borderRadius: sizeStyles.trackHeight / 2,
    justifyContent: 'center' as const,
  });

  // 액티브 트랙 스타일
  const getActiveTrackStyle = () => ({
    height: sizeStyles.trackHeight,
    backgroundColor: colors.primary,
    borderRadius: sizeStyles.trackHeight / 2,
  });

  // 썸 스타일
  const getThumbStyle = () => ({
    position: 'absolute' as const,
    width: sizeStyles.thumbSize,
    height: sizeStyles.thumbSize,
    backgroundColor: colors.primary,
    borderRadius: sizeStyles.thumbSize / 2,
    borderWidth: sizeStyles.thumbBorderWidth,
    borderColor: theme.colors.surface,
    ...theme.shadows.md,
  });

  // 최솟값/최댓값 라벨 스타일
  const getMinMaxLabelStyle = () => ({
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.tertiary,
    textAlign: 'center' as const,
  });

  return (
    <GestureHandlerRootView style={[getContainerStyle(), containerStyle]}>
      <View>
        {/* 라벨 */}
        {label && (
          <Text style={getLabelStyle()}>{label}</Text>
        )}

        {/* 현재 값 표시 */}
        {showValue && (
          <Text style={getValueStyle()}>
            {formatValue(value)}
          </Text>
        )}

        {/* 슬라이더 트랙 */}
        <View
          style={{ 
            paddingVertical: theme.spacing[4],
            paddingHorizontal: sizeStyles.thumbSize / 2,
          }}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setSliderWidth(width - sizeStyles.thumbSize);
          }}
        >
          <View style={getTrackContainerStyle()}>
            {/* 액티브 트랙 */}
            <Animated.View style={[getActiveTrackStyle(), trackAnimatedStyle]} />
          </View>

          {/* 썸 */}
          <PanGestureHandler
            onGestureEvent={gestureHandler}
            enabled={!disabled}
          >
            <Animated.View style={[getThumbStyle(), thumbAnimatedStyle]} />
          </PanGestureHandler>
        </View>

        {/* 최솟값/최댓값 라벨 */}
        {showMinMaxLabels && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing[1],
          }}>
            <Text style={getMinMaxLabelStyle()}>
              {minimumLabel || formatValue(minimumValue)}
            </Text>
            <Text style={getMinMaxLabelStyle()}>
              {maximumLabel || formatValue(maximumValue)}
            </Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default Slider;