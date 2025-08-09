import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../theme';

export interface CardProps {
  /** 자식 요소 */
  children: React.ReactNode;
  
  /** 터치 가능 여부 */
  touchable?: boolean;
  
  /** 터치 핸들러 */
  onPress?: () => void;
  
  /** 카드 변형 */
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  
  /** 그림자 크기 */
  shadow?: 'none' | 'small' | 'medium' | 'large';
  
  /** 패딩 크기 */
  padding?: 'none' | 'small' | 'medium' | 'large' | number;
  
  /** 마진 크기 */
  margin?: 'none' | 'small' | 'medium' | 'large' | number;
  
  /** 배경색 */
  backgroundColor?: string;
  
  /** 테두리 반지름 */
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full' | number;
  
  /** 비활성화 상태 */
  disabled?: boolean;
  
  /** 선택된 상태 */
  selected?: boolean;
  
  /** 에러 상태 */
  error?: boolean;
  
  /** 성공 상태 */
  success?: boolean;
  
  /** 전체 너비 */
  fullWidth?: boolean;
  
  /** 최소 높이 */
  minHeight?: number;
  
  /** 커스텀 스타일 */
  style?: ViewStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
  
  /** 접근성 힌트 */
  accessibilityHint?: string;
  
  /** TouchableOpacity props (touchable이 true일 때) */
  touchableProps?: Partial<TouchableOpacityProps>;
}

/**
 * CupNote v6 Korean UX 최적화 Card 컴포넌트
 * 
 * Features:
 * - 다양한 변형과 상태 지원
 * - 한국형 카드 디자인
 * - 접근성 AAA 등급 준수
 * - 터치 피드백 최적화
 * - 반응형 스타일링
 * - 커피 테마 통합
 */
export const Card: React.FC<CardProps> = ({
  children,
  touchable = false,
  onPress,
  variant = 'default',
  shadow = 'medium',
  padding = 'medium',
  margin = 'none',
  backgroundColor,
  borderRadius = 'medium',
  disabled = false,
  selected = false,
  error = false,
  success = false,
  fullWidth = true,
  minHeight,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  touchableProps = {},
}) => {
  // 패딩 값 계산
  const getPaddingValue = () => {
    if (typeof padding === 'number') {
      return padding;
    }
    
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return theme.spacing[2]; // 8px
      case 'large':
        return theme.spacing[6]; // 24px
      case 'medium':
      default:
        return theme.spacing[4]; // 16px
    }
  };

  // 마진 값 계산
  const getMarginValue = () => {
    if (typeof margin === 'number') {
      return margin;
    }
    
    switch (margin) {
      case 'none':
        return 0;
      case 'small':
        return theme.spacing[2]; // 8px
      case 'large':
        return theme.spacing[6]; // 24px
      case 'medium':
      default:
        return theme.spacing[4]; // 16px
    }
  };

  // 테두리 반지름 값 계산
  const getBorderRadiusValue = () => {
    if (typeof borderRadius === 'number') {
      return borderRadius;
    }
    
    switch (borderRadius) {
      case 'none':
        return 0;
      case 'small':
        return theme.borderRadius.sm; // 6px
      case 'large':
        return theme.borderRadius.lg; // 16px
      case 'full':
        return theme.borderRadius.full; // 9999px
      case 'medium':
      default:
        return theme.borderRadius.md; // 12px
    }
  };

  // 그림자 스타일 가져오기
  const getShadowStyle = () => {
    switch (shadow) {
      case 'none':
        return {};
      case 'small':
        return theme.shadows.sm;
      case 'large':
        return theme.shadows.lg;
      case 'medium':
      default:
        return theme.shadows.default;
    }
  };

  // 배경색 계산
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    
    // 상태별 배경색
    if (error) return theme.colors.status.error.light;
    if (success) return theme.colors.status.success.light;
    if (selected) return theme.colors.coffee[50];
    
    // 변형별 배경색
    switch (variant) {
      case 'filled':
        return theme.colors.warm[50];
      case 'outlined':
      case 'default':
      default:
        return theme.colors.surface;
    }
  };

  // 테두리 스타일 계산
  const getBorderStyle = () => {
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (variant === 'outlined' || selected || error || success) {
      borderWidth = selected || error || success ? 2 : 1;
      
      if (error) {
        borderColor = theme.colors.status.error.default;
      } else if (success) {
        borderColor = theme.colors.status.success.default;
      } else if (selected) {
        borderColor = theme.colors.coffee[500];
      } else {
        borderColor = theme.colors.border.light;
      }
    }

    return {
      borderWidth,
      borderColor,
    };
  };

  // 카드 스타일 계산
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: getBackgroundColor(),
      borderRadius: getBorderRadiusValue(),
      padding: getPaddingValue(),
      margin: getMarginValue(),
      minHeight: minHeight || theme.dimensions.card.minHeight,
      width: fullWidth ? '100%' : 'auto',
      alignSelf: fullWidth ? 'stretch' : 'auto',
      ...getBorderStyle(),
      ...getShadowStyle(),
    };

    // 비활성화 상태
    if (disabled) {
      baseStyle.opacity = theme.opacity.disabled;
    }

    return baseStyle;
  };

  // 접근성 설정
  const getAccessibilityProps = () => {
    const props: any = {
      accessible: true,
      accessibilityLabel: accessibilityLabel,
      accessibilityHint: accessibilityHint,
    };

    if (touchable) {
      props.accessibilityRole = 'button';
      props.accessibilityState = {
        disabled,
        selected,
      };
    }

    return props;
  };

  // 터치 가능한 카드 렌더링
  const renderTouchableCard = () => (
    <TouchableOpacity
      style={[getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={theme.opacity.pressed}
      testID={testID}
      {...getAccessibilityProps()}
      {...touchableProps}
    >
      {children}
    </TouchableOpacity>
  );

  // 일반 카드 렌더링
  const renderStaticCard = () => (
    <View
      style={[getCardStyle(), style]}
      testID={testID}
      {...getAccessibilityProps()}
    >
      {children}
    </View>
  );

  return touchable ? renderTouchableCard() : renderStaticCard();
};

export default Card;