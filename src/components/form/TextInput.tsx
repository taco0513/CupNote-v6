import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { theme } from '../../theme';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  /** 입력 필드 라벨 */
  label?: string;
  
  /** 에러 메시지 */
  error?: string;
  
  /** 도움말 텍스트 */
  helperText?: string;
  
  /** 입력 필드 타입 */
  variant?: 'default' | 'outlined' | 'filled';
  
  /** 크기 */
  size?: 'small' | 'medium' | 'large';
  
  /** 필수 입력 표시 */
  required?: boolean;
  
  /** 성공 상태 */
  success?: boolean;
  
  /** 전체 너비 사용 */
  fullWidth?: boolean;
  
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
  
  /** 오른쪽 버튼 (예: 비밀번호 표시/숨김) */
  rightButton?: React.ReactNode;
  
  /** 오른쪽 버튼 클릭 핸들러 */
  onRightButtonPress?: () => void;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 입력 필드 스타일 */
  inputStyle?: TextStyle;
  
  /** 라벨 스타일 */
  labelStyle?: TextStyle;
  
  /** 테스트 ID */
  testID?: string;
}

export interface TextInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

/**
 * CupNote v6 Korean UX 최적화 TextInput 컴포넌트
 * 
 * Features:
 * - Korean IME 최적화 (한글 입력 지원)
 * - iOS/Android 일관성 보장
 * - 다양한 상태 (에러, 성공, 포커스) 지원
 * - 접근성 AAA 등급 준수
 * - 애니메이션 라벨 지원
 * - 커피 테마 컬러 적용
 */
export const TextInput = forwardRef<TextInputRef, TextInputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'medium',
  required = false,
  success = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  rightButton,
  onRightButtonPress,
  containerStyle,
  inputStyle,
  labelStyle,
  value,
  onFocus,
  onBlur,
  testID,
  editable = true,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasContent, setHasContent] = useState(!!value);
  const inputRef = useRef<RNTextInput>(null);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Ref 메소드 구현
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
    isFocused: () => inputRef.current?.isFocused() || false,
  }));

  // 포커스 핸들러
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (label && variant === 'default') {
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: theme.animation.duration.fast,
        useNativeDriver: false,
      }).start();
    }
    onFocus?.(e);
  };

  // 블러 핸들러
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (label && variant === 'default' && !hasContent) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: theme.animation.duration.fast,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.(e);
  };

  // 텍스트 변경 핸들러
  const handleChangeText = (text: string) => {
    setHasContent(text.length > 0);
    props.onChangeText?.(text);
  };

  // 입력 상태 계산
  const getInputState = () => {
    if (error) return 'error';
    if (success) return 'success';
    if (isFocused) return 'focused';
    return 'default';
  };

  // 컨테이너 스타일 계산
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: fullWidth ? '100%' : 'auto',
      marginBottom: error || helperText ? theme.spacing[1] : 0,
    };

    return baseStyle;
  };

  // 입력 필드 래퍼 스타일 계산
  const getInputWrapperStyle = (): ViewStyle => {
    const state = getInputState();
    
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: theme.dimensions.input.height,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing[4],
    };

    // 크기별 스타일
    const sizeStyles = {
      small: { minHeight: 40, paddingHorizontal: theme.spacing[3] },
      medium: { minHeight: theme.dimensions.input.height, paddingHorizontal: theme.spacing[4] },
      large: { minHeight: 64, paddingHorizontal: theme.spacing[5] },
    };

    // 변형별 스타일
    let variantStyle: ViewStyle = {};
    
    switch (variant) {
      case 'outlined':
        variantStyle = {
          backgroundColor: editable ? theme.colors.surface : theme.colors.warm[100],
          borderWidth: 2,
          borderColor: state === 'error' ? theme.colors.status.error.default :
                      state === 'success' ? theme.colors.status.success.default :
                      state === 'focused' ? theme.colors.coffee[500] :
                      theme.colors.border.default,
        };
        break;
      case 'filled':
        variantStyle = {
          backgroundColor: editable ? theme.colors.warm[50] : theme.colors.warm[100],
          borderBottomWidth: 2,
          borderBottomColor: state === 'error' ? theme.colors.status.error.default :
                            state === 'success' ? theme.colors.status.success.default :
                            state === 'focused' ? theme.colors.coffee[500] :
                            theme.colors.border.default,
        };
        break;
      default: // default variant
        variantStyle = {
          backgroundColor: editable ? theme.colors.surface : theme.colors.warm[100],
          borderWidth: 1,
          borderColor: state === 'error' ? theme.colors.status.error.default :
                      state === 'success' ? theme.colors.status.success.default :
                      state === 'focused' ? theme.colors.coffee[500] :
                      theme.colors.border.light,
          ...theme.shadows.sm,
        };
        break;
    }

    // 비활성화 상태
    const disabledStyle = !editable ? { opacity: theme.opacity.disabled } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyle,
      ...disabledStyle,
    };
  };

  // 입력 필드 스타일 계산
  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      fontSize: theme.typography.fontSize[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'],
      lineHeight: theme.typography.lineHeight[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'],
      fontFamily: theme.typography.fontFamily.regular,
      color: editable ? theme.colors.text.primary : theme.colors.text.disabled,
      includeFontPadding: false, // Android에서 한글 입력 최적화
      textAlignVertical: 'center', // Android 수직 정렬
    };

    // iOS에서 한글 입력 최적화
    if (Platform.OS === 'ios') {
      baseStyle.textAlign = 'left';
    }

    return baseStyle;
  };

  // 라벨 스타일 계산
  const getLabelStyle = (): TextStyle => {
    const state = getInputState();
    
    const baseStyle: TextStyle = {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      marginBottom: theme.spacing[1],
      color: state === 'error' ? theme.colors.status.error.default :
            state === 'success' ? theme.colors.status.success.default :
            state === 'focused' ? theme.colors.coffee[500] :
            theme.colors.text.secondary,
    };

    return baseStyle;
  };

  // 애니메이션 라벨 스타일 (default variant용)
  const getAnimatedLabelStyle = () => {
    const state = getInputState();
    
    return {
      position: 'absolute' as const,
      left: theme.spacing[4] + (leftIcon ? theme.spacing[6] : 0),
      fontSize: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.typography.fontSize.base, theme.typography.fontSize.sm],
      }),
      top: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.dimensions.input.height / 2 - theme.typography.fontSize.base / 2, -theme.spacing[2]],
      }),
      backgroundColor: variant === 'default' ? theme.colors.surface : 'transparent',
      paddingHorizontal: theme.spacing[1],
      color: state === 'error' ? theme.colors.status.error.default :
            state === 'success' ? theme.colors.status.success.default :
            state === 'focused' ? theme.colors.coffee[500] :
            theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.medium,
    };
  };

  // 헬퍼/에러 텍스트 스타일
  const getHelperTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      marginTop: theme.spacing[1],
      marginLeft: theme.spacing[1],
      color: error ? theme.colors.status.error.default :
            success ? theme.colors.status.success.default :
            theme.colors.text.tertiary,
    };
  };

  // 접근성 설정
  const getAccessibilityProps = () => {
    return {
      accessible: true,
      accessibilityLabel: label || props.placeholder,
      accessibilityHint: helperText || error,
      accessibilityState: {
        disabled: !editable,
      },
      accessibilityValue: value ? { text: value } : undefined,
    };
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {/* 고정 라벨 (outlined, filled variant) */}
      {label && variant !== 'default' && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
          {required && <Text style={{ color: theme.colors.status.error.default }}> *</Text>}
        </Text>
      )}

      {/* 입력 필드 래퍼 */}
      <View style={getInputWrapperStyle()}>
        {/* 왼쪽 아이콘 */}
        {leftIcon && (
          <View style={{ marginRight: theme.spacing[2] }}>
            {leftIcon}
          </View>
        )}

        {/* 애니메이션 라벨 (default variant) */}
        {label && variant === 'default' && (
          <Animated.Text style={getAnimatedLabelStyle()}>
            {label}
            {required && <Text style={{ color: theme.colors.status.error.default }}> *</Text>}
          </Animated.Text>
        )}

        {/* 텍스트 입력 */}
        <RNTextInput
          ref={inputRef}
          style={[getInputStyle(), inputStyle]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          testID={testID}
          placeholderTextColor={theme.colors.text.disabled}
          selectionColor={theme.colors.coffee[500]}
          // Korean IME 최적화
          autoCorrect={false}
          spellCheck={false}
          {...getAccessibilityProps()}
          {...props}
        />

        {/* 오른쪽 아이콘 */}
        {rightIcon && !rightButton && (
          <View style={{ marginLeft: theme.spacing[2] }}>
            {rightIcon}
          </View>
        )}

        {/* 오른쪽 버튼 */}
        {rightButton && (
          <TouchableOpacity
            onPress={onRightButtonPress}
            style={{
              marginLeft: theme.spacing[2],
              minHeight: theme.dimensions.touch.minimum,
              minWidth: theme.dimensions.touch.minimum,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={theme.opacity.pressed}
            testID={`${testID}-right-button`}
          >
            {rightButton}
          </TouchableOpacity>
        )}
      </View>

      {/* 헬퍼 텍스트 또는 에러 메시지 */}
      {(error || helperText) && (
        <Text 
          style={getHelperTextStyle()}
          testID={`${testID}-helper`}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;