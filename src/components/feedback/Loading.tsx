import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { theme } from '../../theme';

export type LoadingSize = 'small' | 'medium' | 'large';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'coffee';

export interface LoadingProps {
  /** 로딩 표시 여부 */
  visible?: boolean;
  
  /** 로딩 메시지 */
  message?: string;
  
  /** 크기 */
  size?: LoadingSize;
  
  /** 변형 */
  variant?: LoadingVariant;
  
  /** 색상 */
  color?: string;
  
  /** 오버레이 표시 여부 */
  overlay?: boolean;
  
  /** 오버레이 배경색 */
  overlayColor?: string;
  
  /** 오버레이 불투명도 */
  overlayOpacity?: number;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 메시지 스타일 */
  messageStyle?: TextStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
}

/**
 * CupNote v6 Korean UX 최적화 Loading 컴포넌트
 * 
 * Features:
 * - 다양한 로딩 애니메이션 (스피너, 도트, 펄스, 커피테마)
 * - 오버레이 모드 지원
 * - 한국어 메시지 최적화
 * - 접근성 지원
 * - 커피 테마 컬러
 * - React Native Reanimated 기반 부드러운 애니메이션
 */
export const Loading: React.FC<LoadingProps> = ({
  visible = true,
  message,
  size = 'medium',
  variant = 'spinner',
  color = theme.colors.coffee[500],
  overlay = false,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  overlayOpacity = 0.5,
  containerStyle,
  messageStyle,
  testID,
  accessibilityLabel,
}) => {
  // 애니메이션 값들
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity1 = useSharedValue(0.3);
  const opacity2 = useSharedValue(0.6);
  const opacity3 = useSharedValue(1);

  // 크기 설정
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          indicatorSize: 24,
          dotSize: 8,
          fontSize: theme.typography.fontSize.sm,
          spacing: theme.spacing[2],
        };
      case 'large':
        return {
          indicatorSize: 48,
          dotSize: 16,
          fontSize: theme.typography.fontSize.lg,
          spacing: theme.spacing[4],
        };
      case 'medium':
      default:
        return {
          indicatorSize: 32,
          dotSize: 12,
          fontSize: theme.typography.fontSize.base,
          spacing: theme.spacing[3],
        };
    }
  };

  const sizeConfig = getSizeConfig();

  // 애니메이션 시작
  React.useEffect(() => {
    if (visible) {
      // 회전 애니메이션 (스피너용)
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );

      // 스케일 애니메이션 (펄스용)
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );

      // 도트 애니메이션
      opacity1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );

      opacity2.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 200 }),
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );

      opacity3.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 400 }),
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 200 })
        ),
        -1,
        false
      );
    }
  }, [visible]);

  // 컨테이너 스타일
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing[4],
    };

    if (overlay) {
      return {
        ...baseStyle,
        flex: 1,
        backgroundColor: overlayColor,
      };
    }

    return baseStyle;
  };

  // 메시지 스타일
  const getMessageStyle = (): TextStyle => {
    return {
      fontSize: sizeConfig.fontSize,
      lineHeight: sizeConfig.fontSize * 1.4,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginTop: sizeConfig.spacing,
      includeFontPadding: false,
    };
  };

  // 스피너 애니메이션 스타일
  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // 펄스 애니메이션 스타일
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 도트 애니메이션 스타일
  const dot1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity1.value,
  }));

  const dot2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity2.value,
  }));

  const dot3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity3.value,
  }));

  // 스피너 렌더링
  const renderSpinner = () => (
    <ActivityIndicator
      size={sizeConfig.indicatorSize}
      color={color}
      testID={`${testID}-spinner`}
    />
  );

  // 도트 로딩 렌더링
  const renderDots = () => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Animated.View
        style={[
          {
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: sizeConfig.dotSize / 2,
            backgroundColor: color,
            marginHorizontal: sizeConfig.dotSize / 4,
          },
          dot1AnimatedStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: sizeConfig.dotSize / 2,
            backgroundColor: color,
            marginHorizontal: sizeConfig.dotSize / 4,
          },
          dot2AnimatedStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: sizeConfig.dotSize / 2,
            backgroundColor: color,
            marginHorizontal: sizeConfig.dotSize / 4,
          },
          dot3AnimatedStyle,
        ]}
      />
    </View>
  );

  // 펄스 로딩 렌더링
  const renderPulse = () => (
    <Animated.View
      style={[
        {
          width: sizeConfig.indicatorSize,
          height: sizeConfig.indicatorSize,
          borderRadius: sizeConfig.indicatorSize / 2,
          backgroundColor: color,
        },
        pulseAnimatedStyle,
      ]}
    />
  );

  // 커피테마 로딩 렌더링
  const renderCoffee = () => (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
        },
        spinnerAnimatedStyle,
      ]}
    >
      <Text style={{
        fontSize: sizeConfig.indicatorSize,
        color: color,
      }}>
        ☕
      </Text>
    </Animated.View>
  );

  // 로딩 인디케이터 렌더링
  const renderIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'coffee':
        return renderCoffee();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  // 접근성 설정
  const getAccessibilityProps = () => {
    return {
      accessible: true,
      accessibilityRole: 'progressbar' as const,
      accessibilityLabel: accessibilityLabel || message || '로딩 중',
      accessibilityState: {
        busy: true,
      },
    };
  };

  // 콘텐츠 렌더링
  const renderContent = () => (
    <View
      style={[getContainerStyle(), containerStyle]}
      testID={testID}
      {...getAccessibilityProps()}
    >
      {renderIndicator()}
      
      {message && (
        <Text 
          style={[getMessageStyle(), messageStyle]}
          testID={`${testID}-message`}
        >
          {message}
        </Text>
      )}
    </View>
  );

  if (!visible) {
    return null;
  }

  if (overlay) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        {renderContent()}
      </Modal>
    );
  }

  return renderContent();
};

export default Loading;