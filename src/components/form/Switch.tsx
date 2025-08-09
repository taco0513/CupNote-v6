import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch as RNSwitch,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../../theme';

export interface SwitchProps {
  /** 스위치 상태 */
  value: boolean;
  
  /** 상태 변경 핸들러 */
  onValueChange: (value: boolean) => void;
  
  /** 라벨 텍스트 */
  label?: string;
  
  /** 설명 텍스트 */
  description?: string;
  
  /** 비활성화 상태 */
  disabled?: boolean;
  
  /** 크기 */
  size?: 'small' | 'medium' | 'large';
  
  /** 색상 테마 */
  colorTheme?: 'default' | 'success' | 'warning' | 'error';
  
  /** 네이티브 스위치 사용 여부 (iOS는 항상 네이티브) */
  useNativeSwitch?: boolean;
  
  /** 라벨 위치 */
  labelPosition?: 'left' | 'right';
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 라벨 스타일 */
  labelStyle?: TextStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
  
  /** 접근성 힌트 */
  accessibilityHint?: string;
}

/**
 * CupNote v6 Korean UX 최적화 Switch 컴포넌트
 * 
 * Features:
 * - iOS에서는 네이티브 스위치 사용
 * - Android에서는 커스텀 애니메이션 스위치
 * - 다양한 색상 테마 지원
 * - 접근성 AAA 등급 준수
 * - 햅틱 피드백 준비
 * - 한국어 라벨링 지원
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'medium',
  colorTheme = 'default',
  useNativeSwitch = Platform.OS === 'ios',
  labelPosition = 'right',
  containerStyle,
  labelStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const animationProgress = useSharedValue(value ? 1 : 0);

  // 색상 테마 가져오기
  const getThemeColors = () => {
    switch (colorTheme) {
      case 'success':
        return {
          active: theme.colors.status.success.default,
          inactive: theme.colors.warm[300],
          thumb: theme.colors.surface,
        };
      case 'warning':
        return {
          active: theme.colors.status.warning.default,
          inactive: theme.colors.warm[300],
          thumb: theme.colors.surface,
        };
      case 'error':
        return {
          active: theme.colors.status.error.default,
          inactive: theme.colors.warm[300],
          thumb: theme.colors.surface,
        };
      default:
        return {
          active: theme.colors.coffee[500],
          inactive: theme.colors.warm[300],
          thumb: theme.colors.surface,
        };
    }
  };

  const colors = getThemeColors();

  // 크기별 스타일
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          trackWidth: 40,
          trackHeight: 24,
          thumbSize: 20,
          thumbMargin: 2,
        };
      case 'large':
        return {
          trackWidth: 64,
          trackHeight: 36,
          thumbSize: 32,
          thumbMargin: 2,
        };
      default: // medium
        return {
          trackWidth: 52,
          trackHeight: 32,
          thumbSize: 28,
          thumbMargin: 2,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // 애니메이션 업데이트
  React.useEffect(() => {
    animationProgress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [value, animationProgress]);

  // 스위치 변경 핸들러
  const handleValueChange = (newValue: boolean) => {
    if (!disabled) {
      onValueChange(newValue);
    }
  };

  // 커스텀 스위치 스타일
  const getCustomTrackStyle = (): ViewStyle => {
    return {
      width: sizeStyles.trackWidth,
      height: sizeStyles.trackHeight,
      borderRadius: sizeStyles.trackHeight / 2,
      justifyContent: 'center',
      padding: sizeStyles.thumbMargin,
    };
  };

  const getCustomThumbStyle = (): ViewStyle => {
    return {
      width: sizeStyles.thumbSize,
      height: sizeStyles.thumbSize,
      borderRadius: sizeStyles.thumbSize / 2,
      backgroundColor: colors.thumb,
      ...theme.shadows.sm,
    };
  };

  // 애니메이션 스타일
  const animatedTrackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [colors.inactive, colors.active]
    );

    return {
      backgroundColor,
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    const translateX = animationProgress.value * (sizeStyles.trackWidth - sizeStyles.thumbSize - sizeStyles.thumbMargin * 2);

    return {
      transform: [{ translateX }],
    };
  });

  // 컨테이너 스타일
  const getContainerStyle = (): ViewStyle => {
    const flexDirection = labelPosition === 'left' ? 'row-reverse' : 'row';
    
    return {
      flexDirection,
      alignItems: 'center',
      opacity: disabled ? theme.opacity.disabled : 1,
    };
  };

  // 라벨 컨테이너 스타일
  const getLabelContainerStyle = (): ViewStyle => {
    const marginStyle = labelPosition === 'left' 
      ? { marginRight: theme.spacing[3] }
      : { marginLeft: theme.spacing[3] };

    return {
      flex: 1,
      ...marginStyle,
    };
  };

  // 라벨 텍스트 스타일
  const getLabelTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.text.primary,
    };
  };

  // 설명 텍스트 스타일
  const getDescriptionStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing[1],
    };
  };

  // 접근성 설정
  const getAccessibilityProps = () => {
    return {
      accessible: true,
      accessibilityRole: 'switch' as const,
      accessibilityLabel: accessibilityLabel || label,
      accessibilityHint: accessibilityHint || description,
      accessibilityState: {
        checked: value,
        disabled,
      },
    };
  };

  // 네이티브 스위치 렌더링
  const renderNativeSwitch = () => (
    <RNSwitch
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
      trackColor={{
        false: colors.inactive,
        true: colors.active,
      }}
      thumbColor={colors.thumb}
      ios_backgroundColor={colors.inactive}
      testID={testID}
      {...getAccessibilityProps()}
    />
  );

  // 커스텀 스위치 렌더링
  const renderCustomSwitch = () => (
    <TouchableOpacity
      onPress={() => handleValueChange(!value)}
      disabled={disabled}
      activeOpacity={theme.opacity.pressed}
      testID={testID}
      {...getAccessibilityProps()}
    >
      <Animated.View style={[getCustomTrackStyle(), animatedTrackStyle]}>
        <Animated.View style={[getCustomThumbStyle(), animatedThumbStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {/* 스위치 */}
      {useNativeSwitch ? renderNativeSwitch() : renderCustomSwitch()}

      {/* 라벨 및 설명 */}
      {(label || description) && (
        <View style={getLabelContainerStyle()}>
          {label && (
            <Text style={[getLabelTextStyle(), labelStyle]}>
              {label}
            </Text>
          )}
          
          {description && (
            <Text style={getDescriptionStyle()}>
              {description}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default Switch;