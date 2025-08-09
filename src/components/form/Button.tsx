import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { theme } from '../../theme';

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** 버튼에 표시할 텍스트 */
  title: string;
  
  /** 버튼 변형 스타일 */
  variant?: ButtonVariant;
  
  /** 버튼 크기 */
  size?: ButtonSize;
  
  /** 로딩 상태 */
  loading?: boolean;
  
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  
  /** 아이콘 (텍스트 앞에 표시) */
  icon?: React.ReactNode;
  
  /** 아이콘을 텍스트 뒤에 표시 */
  iconRight?: React.ReactNode;
  
  /** 커스텀 스타일 */
  style?: ViewStyle;
  
  /** 커스텀 텍스트 스타일 */
  textStyle?: TextStyle;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
  
  /** 접근성 힌트 */
  accessibilityHint?: string;
  
  /** 테스트 ID */
  testID?: string;
}

/**
 * CupNote v6 Korean UX 최적화 버튼 컴포넌트
 * 
 * Features:
 * - iOS Human Interface Guidelines 준수
 * - 한국인 터치 패턴 최적화 (48px 최소 높이)
 * - 접근성 AAA 등급 지원
 * - 다양한 변형 및 상태 지원
 * - 커피 테마 컬러 팔레트 적용
 * - 햅틱 피드백 준비
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  icon,
  iconRight,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
  onPress,
  ...props
}) => {
  // 버튼 스타일 계산
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      minHeight: theme.dimensions.button.height[size],
      minWidth: theme.dimensions.touch.comfortable,
    };

    // 크기별 패딩
    const paddingStyle = {
      paddingHorizontal: theme.dimensions.button.padding[size].horizontal,
      paddingVertical: theme.dimensions.button.padding[size].vertical,
    };

    // 전체 너비 설정
    const widthStyle = fullWidth ? { alignSelf: 'stretch' } : {};

    // 변형별 스타일
    let variantStyle: ViewStyle = {};
    
    switch (variant) {
      case 'primary':
        variantStyle = {
          backgroundColor: disabled || loading ? theme.colors.coffee[300] : theme.colors.coffee[500],
          ...theme.shadows.sm,
        };
        break;
      case 'secondary':
        variantStyle = {
          backgroundColor: disabled || loading ? theme.colors.warm[200] : theme.colors.warm[100],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled || loading ? theme.colors.coffee[300] : theme.colors.coffee[500],
        };
        break;
      case 'text':
        variantStyle = {
          backgroundColor: 'transparent',
          minHeight: theme.dimensions.button.height[size] - 8, // 텍스트 버튼은 약간 작게
        };
        break;
      case 'danger':
        variantStyle = {
          backgroundColor: disabled || loading ? theme.colors.status.error.light : theme.colors.status.error.default,
          ...theme.shadows.sm,
        };
        break;
    }

    // 비활성화 상태 불투명도
    const disabledStyle = disabled || loading ? { opacity: theme.opacity.disabled } : {};

    return {
      ...baseStyle,
      ...paddingStyle,
      ...widthStyle,
      ...variantStyle,
      ...disabledStyle,
    };
  };

  // 텍스트 스타일 계산
  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: theme.typography.fontSize[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'],
      lineHeight: theme.typography.lineHeight[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'],
      fontFamily: theme.typography.fontFamily.medium,
      fontWeight: theme.typography.fontWeight.semibold,
      textAlign: 'center',
      letterSpacing: theme.typography.letterSpacing.normal,
    };

    // 변형별 텍스트 색상
    let colorStyle: TextStyle = {};
    
    switch (variant) {
      case 'primary':
      case 'danger':
        colorStyle = { color: '#FFFFFF' };
        break;
      case 'secondary':
        colorStyle = { color: theme.colors.text.primary };
        break;
      case 'outline':
      case 'text':
        colorStyle = { 
          color: disabled || loading ? theme.colors.coffee[300] : theme.colors.coffee[500] 
        };
        break;
    }

    return {
      ...baseStyle,
      ...colorStyle,
    };
  };

  // 접근성 설정
  const getAccessibilityProps = () => {
    return {
      accessible: true,
      accessibilityRole: 'button' as AccessibilityRole,
      accessibilityLabel: accessibilityLabel || title,
      accessibilityHint: accessibilityHint,
      accessibilityState: {
        disabled: disabled || loading,
        busy: loading,
      },
    };
  };

  // 로딩 인디케이터 색상
  const getLoadingColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return theme.colors.text.primary;
      case 'outline':
      case 'text':
        return theme.colors.coffee[500];
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      onPress={onPress}
      testID={testID}
      activeOpacity={theme.opacity.pressed}
      {...getAccessibilityProps()}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size={size === 'small' ? 'small' : 'small'} 
          color={getLoadingColor()}
          testID={`${testID}-loading`}
        />
      ) : (
        <>
          {icon && (
            <React.Fragment>
              {icon}
              <Text style={{ width: theme.spacing[2] }} />
            </React.Fragment>
          )}
          
          <Text 
            style={[getTextStyle(), textStyle]}
            testID={`${testID}-text`}
          >
            {title}
          </Text>
          
          {iconRight && (
            <React.Fragment>
              <Text style={{ width: theme.spacing[2] }} />
              {iconRight}
            </React.Fragment>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

// Export default
export default Button;