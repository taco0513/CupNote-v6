import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom' | 'center';

export interface ToastProps {
  /** 메시지 내용 */
  message: string;
  
  /** 토스트 타입 */
  type?: ToastType;
  
  /** 표시 위치 */
  position?: ToastPosition;
  
  /** 표시 여부 */
  visible: boolean;
  
  /** 자동 숨김 시간 (ms) */
  duration?: number;
  
  /** 토스트 닫기 핸들러 */
  onHide?: () => void;
  
  /** 수동 닫기 버튼 표시 */
  closable?: boolean;
  
  /** 왼쪽 아이콘 */
  icon?: React.ReactNode;
  
  /** 액션 버튼 */
  action?: {
    label: string;
    onPress: () => void;
  };
  
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
 * CupNote v6 Korean UX 최적화 Toast 컴포넌트
 * 
 * Features:
 * - React Native Reanimated 기반 부드러운 애니메이션
 * - 다양한 토스트 타입과 위치 지원
 * - SafeArea 자동 대응
 * - 한국어 메시지 최적화
 * - 접근성 지원
 * - 커피 테마 컬러
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  position = 'top',
  visible,
  duration = 4000,
  onHide,
  closable = false,
  icon,
  action,
  containerStyle,
  messageStyle,
  testID,
  accessibilityLabel,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(position === 'top' ? -200 : 200);
  const opacity = useSharedValue(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 토스트 타입별 색상 및 아이콘
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.status.success.default,
          textColor: '#FFFFFF',
          iconColor: '#FFFFFF',
          defaultIcon: '✓',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.status.error.default,
          textColor: '#FFFFFF',
          iconColor: '#FFFFFF',
          defaultIcon: '✕',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.status.warning.default,
          textColor: theme.colors.text.primary,
          iconColor: theme.colors.text.primary,
          defaultIcon: '⚠',
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.coffee[500],
          textColor: '#FFFFFF',
          iconColor: '#FFFFFF',
          defaultIcon: 'ℹ',
        };
    }
  };

  const typeConfig = getTypeConfig();

  // 토스트 표시
  const showToast = () => {
    const targetY = position === 'center' ? 0 : 
                   position === 'top' ? 0 : 0;
                   
    translateY.value = withSpring(targetY, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 300 });

    // 자동 숨김 타이머 설정
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  // 토스트 숨김
  const hideToast = () => {
    const targetY = position === 'top' ? -200 : 
                   position === 'center' ? -200 : 200;
                   
    translateY.value = withTiming(targetY, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 });

    setTimeout(() => {
      if (onHide) {
        runOnJS(onHide)();
      }
    }, 300);
  };

  // visible 상태 변경 감지
  useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  // 컨테이너 스타일
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: typeConfig.backgroundColor,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      marginHorizontal: theme.spacing[4],
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      maxWidth: SCREEN_WIDTH - theme.spacing[8],
      ...theme.shadows.md,
    };

    // 위치별 추가 스타일
    switch (position) {
      case 'top':
        baseStyle.marginTop = insets.top + theme.spacing[2];
        break;
      case 'bottom':
        baseStyle.marginBottom = insets.bottom + theme.spacing[2];
        break;
      case 'center':
        // 중앙 정렬은 상위 컨테이너에서 처리
        break;
    }

    return baseStyle;
  };

  // 전체 컨테이너 스타일
  const getWrapperStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: theme.zIndex.toast,
      alignItems: 'center',
    };

    switch (position) {
      case 'top':
        baseStyle.top = 0;
        break;
      case 'bottom':
        baseStyle.bottom = 0;
        break;
      case 'center':
        baseStyle.top = '50%';
        baseStyle.marginTop = -24; // 컨테이너 높이의 절반
        break;
    }

    return baseStyle;
  };

  // 메시지 텍스트 스타일
  const getMessageStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: typeConfig.textColor,
      textAlign: 'left',
      includeFontPadding: false,
    };
  };

  // 아이콘 스타일
  const getIconStyle = (): TextStyle => {
    return {
      fontSize: 18,
      color: typeConfig.iconColor,
      marginRight: theme.spacing[2],
      textAlign: 'center',
      minWidth: 20,
    };
  };

  // 액션 버튼 스타일
  const getActionButtonStyle = (): ViewStyle => {
    return {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginLeft: theme.spacing[3],
      minHeight: theme.dimensions.touch.minimum,
      justifyContent: 'center',
      alignItems: 'center',
    };
  };

  // 액션 버튼 텍스트 스타일
  const getActionTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: typeConfig.textColor,
      fontWeight: theme.typography.fontWeight.semibold,
    };
  };

  // 닫기 버튼 스타일
  const getCloseButtonStyle = (): ViewStyle => {
    return {
      padding: theme.spacing[1],
      marginLeft: theme.spacing[2],
      minHeight: theme.dimensions.touch.minimum,
      minWidth: theme.dimensions.touch.minimum,
      justifyContent: 'center',
      alignItems: 'center',
    };
  };

  // 접근성 설정
  const getAccessibilityProps = () => {
    return {
      accessible: true,
      accessibilityRole: 'alert' as const,
      accessibilityLabel: accessibilityLabel || `${type} 알림: ${message}`,
      accessibilityLiveRegion: 'polite' as const,
    };
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={getWrapperStyle()} pointerEvents="box-none">
      <Animated.View
        style={[getContainerStyle(), containerStyle, animatedStyle]}
        testID={testID}
        {...getAccessibilityProps()}
      >
        {/* 아이콘 */}
        {(icon || typeConfig.defaultIcon) && (
          <Text style={getIconStyle()}>
            {icon || typeConfig.defaultIcon}
          </Text>
        )}

        {/* 메시지 */}
        <Text 
          style={[getMessageStyle(), messageStyle]}
          numberOfLines={3}
        >
          {message}
        </Text>

        {/* 액션 버튼 */}
        {action && (
          <TouchableOpacity
            style={getActionButtonStyle()}
            onPress={action.onPress}
            activeOpacity={theme.opacity.pressed}
            testID={`${testID}-action`}
          >
            <Text style={getActionTextStyle()}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}

        {/* 닫기 버튼 */}
        {closable && (
          <TouchableOpacity
            style={getCloseButtonStyle()}
            onPress={hideToast}
            activeOpacity={theme.opacity.pressed}
            testID={`${testID}-close`}
            accessible
            accessibilityRole="button"
            accessibilityLabel="알림 닫기"
          >
            <Text style={{
              fontSize: 16,
              color: typeConfig.iconColor,
              fontWeight: 'bold',
            }}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default Toast;