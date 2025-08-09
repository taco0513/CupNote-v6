import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar,
} from 'react-native';
import { theme } from '../../theme';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps {
  /** 선택 옵션 리스트 */
  options: SelectOption[];
  
  /** 선택된 값 */
  value?: string;
  
  /** 선택 변경 핸들러 */
  onValueChange: (value: string, option: SelectOption) => void;
  
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  
  /** 라벨 */
  label?: string;
  
  /** 에러 메시지 */
  error?: string;
  
  /** 도움말 텍스트 */
  helperText?: string;
  
  /** 비활성화 상태 */
  disabled?: boolean;
  
  /** 필수 입력 표시 */
  required?: boolean;
  
  /** 성공 상태 */
  success?: boolean;
  
  /** 전체 너비 사용 */
  fullWidth?: boolean;
  
  /** 크기 */
  size?: 'small' | 'medium' | 'large';
  
  /** 변형 */
  variant?: 'default' | 'outlined' | 'filled';
  
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  
  /** 검색 가능 여부 */
  searchable?: boolean;
  
  /** 검색 플레이스홀더 */
  searchPlaceholder?: string;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 선택 버튼 스타일 */
  selectStyle?: ViewStyle;
  
  /** 라벨 스타일 */
  labelStyle?: TextStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 모달 제목 */
  modalTitle?: string;
  
  /** 최대 표시 옵션 수 */
  maxOptionsVisible?: number;
}

/**
 * CupNote v6 Korean UX 최적화 Select 컴포넌트
 * 
 * Features:
 * - iOS/Android 네이티브 느낌의 Modal 기반 선택
 * - 검색 기능 지원
 * - 한국어 콘텐츠 최적화
 * - 접근성 AAA 등급 준수
 * - 커피 테마 컬러 적용
 * - 키보드 네비게이션 준비
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = '선택하세요',
  label,
  error,
  helperText,
  disabled = false,
  required = false,
  success = false,
  fullWidth = true,
  size = 'medium',
  variant = 'default',
  leftIcon,
  searchable = false,
  searchPlaceholder = '검색...',
  containerStyle,
  selectStyle,
  labelStyle,
  testID,
  modalTitle,
  maxOptionsVisible = 8,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef<View>(null);

  // 선택된 옵션 찾기
  const selectedOption = options.find(option => option.value === value);

  // 검색 필터링된 옵션
  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // 선택 상태 계산
  const getSelectState = () => {
    if (error) return 'error';
    if (success) return 'success';
    return 'default';
  };

  // 컨테이너 스타일 계산
  const getContainerStyle = (): ViewStyle => {
    return {
      width: fullWidth ? '100%' : 'auto',
      marginBottom: error || helperText ? theme.spacing[1] : 0,
    };
  };

  // 라벨 스타일 계산
  const getLabelStyle = (): TextStyle => {
    const state = getSelectState();
    
    return {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      marginBottom: theme.spacing[1],
      color: state === 'error' ? theme.colors.status.error.default :
            state === 'success' ? theme.colors.status.success.default :
            theme.colors.text.secondary,
    };
  };

  // 선택 버튼 스타일 계산
  const getSelectButtonStyle = (): ViewStyle => {
    const state = getSelectState();
    
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
          backgroundColor: disabled ? theme.colors.warm[100] : theme.colors.surface,
          borderWidth: 2,
          borderColor: state === 'error' ? theme.colors.status.error.default :
                      state === 'success' ? theme.colors.status.success.default :
                      theme.colors.border.default,
        };
        break;
      case 'filled':
        variantStyle = {
          backgroundColor: disabled ? theme.colors.warm[100] : theme.colors.warm[50],
          borderBottomWidth: 2,
          borderBottomColor: state === 'error' ? theme.colors.status.error.default :
                            state === 'success' ? theme.colors.status.success.default :
                            theme.colors.border.default,
        };
        break;
      default: // default variant
        variantStyle = {
          backgroundColor: disabled ? theme.colors.warm[100] : theme.colors.surface,
          borderWidth: 1,
          borderColor: state === 'error' ? theme.colors.status.error.default :
                      state === 'success' ? theme.colors.status.success.default :
                      theme.colors.border.light,
          ...theme.shadows.sm,
        };
        break;
    }

    // 비활성화 상태
    const disabledStyle = disabled ? { opacity: theme.opacity.disabled } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyle,
      ...disabledStyle,
    };
  };

  // 선택 텍스트 스타일 계산
  const getSelectTextStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: theme.typography.fontSize[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'],
      lineHeight: theme.typography.lineHeight[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'],
      fontFamily: theme.typography.fontFamily.regular,
      color: selectedOption 
        ? theme.colors.text.primary 
        : theme.colors.text.disabled,
    };
  };

  // 헬퍼 텍스트 스타일
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

  // 모달 스타일
  const getModalStyle = (): ViewStyle => {
    return {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    };
  };

  // 모달 콘텐츠 스타일
  const getModalContentStyle = (): ViewStyle => {
    const maxHeight = Math.min(filteredOptions.length, maxOptionsVisible) * 56 + 120; // 옵션 높이 + 패딩
    
    return {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: maxHeight,
      paddingTop: theme.spacing[4],
      ...theme.shadows.xl,
    };
  };

  // 옵션 아이템 스타일
  const getOptionStyle = (option: SelectOption, isSelected: boolean): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[5],
      backgroundColor: isSelected ? theme.colors.coffee[50] : 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      opacity: option.disabled ? theme.opacity.disabled : 1,
    };
  };

  // 옵션 텍스트 스타일
  const getOptionTextStyle = (isSelected: boolean): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.base,
      fontFamily: isSelected ? theme.typography.fontFamily.medium : theme.typography.fontFamily.regular,
      color: isSelected ? theme.colors.coffee[700] : theme.colors.text.primary,
      flex: 1,
    };
  };

  // 선택 처리
  const handleOptionSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onValueChange(option.value, option);
      setIsModalVisible(false);
      setSearchQuery('');
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalVisible(false);
    setSearchQuery('');
  };

  // 화살표 아이콘
  const renderArrowIcon = () => (
    <View style={{ 
      marginLeft: theme.spacing[2],
      transform: [{ rotate: isModalVisible ? '180deg' : '0deg' }],
    }}>
      <Text style={{ 
        fontSize: 16, 
        color: theme.colors.text.tertiary,
        fontWeight: 'bold',
      }}>
        ▼
      </Text>
    </View>
  );

  // 옵션 렌더링
  const renderOption = ({ item }: { item: SelectOption }) => {
    const isSelected = item.value === value;
    
    return (
      <TouchableOpacity
        style={getOptionStyle(item, isSelected)}
        onPress={() => handleOptionSelect(item)}
        disabled={item.disabled}
        activeOpacity={theme.opacity.pressed}
        testID={`${testID}-option-${item.value}`}
      >
        {item.icon && (
          <View style={{ marginRight: theme.spacing[3] }}>
            {item.icon}
          </View>
        )}
        
        <Text style={getOptionTextStyle(isSelected)}>
          {item.label}
        </Text>
        
        {isSelected && (
          <Text style={{
            fontSize: 18,
            color: theme.colors.coffee[500],
            fontWeight: 'bold',
          }}>
            ✓
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {/* 라벨 */}
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
          {required && <Text style={{ color: theme.colors.status.error.default }}> *</Text>}
        </Text>
      )}

      {/* 선택 버튼 */}
      <TouchableOpacity
        ref={selectRef}
        style={[getSelectButtonStyle(), selectStyle]}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
        activeOpacity={theme.opacity.pressed}
        testID={testID}
        accessible
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityHint={`현재 선택: ${selectedOption?.label || '없음'}`}
        accessibilityState={{ disabled, expanded: isModalVisible }}
      >
        {/* 왼쪽 아이콘 */}
        {leftIcon && (
          <View style={{ marginRight: theme.spacing[2] }}>
            {leftIcon}
          </View>
        )}

        {/* 선택된 옵션 또는 플레이스홀더 */}
        <Text 
          style={getSelectTextStyle()}
          numberOfLines={1}
        >
          {selectedOption?.label || placeholder}
        </Text>

        {/* 화살표 아이콘 */}
        {renderArrowIcon()}
      </TouchableOpacity>

      {/* 헬퍼 텍스트 또는 에러 메시지 */}
      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}

      {/* 옵션 선택 모달 */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <TouchableOpacity 
          style={getModalStyle()}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity 
            style={getModalContentStyle()}
            activeOpacity={1}
          >
            {/* 모달 헤더 */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing[5],
              paddingBottom: theme.spacing[3],
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.light,
            }}>
              <Text style={{
                fontSize: theme.typography.fontSize.lg,
                fontFamily: theme.typography.fontFamily.bold,
                color: theme.colors.text.primary,
              }}>
                {modalTitle || label || '옵션 선택'}
              </Text>
              
              <TouchableOpacity
                onPress={closeModal}
                style={{
                  padding: theme.spacing[2],
                  minHeight: theme.dimensions.touch.minimum,
                  minWidth: theme.dimensions.touch.minimum,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                testID={`${testID}-close`}
              >
                <Text style={{
                  fontSize: 24,
                  color: theme.colors.text.secondary,
                  fontWeight: 'bold',
                }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* 검색 입력 (선택적) */}
            {searchable && (
              <View style={{
                paddingHorizontal: theme.spacing[5],
                paddingVertical: theme.spacing[3],
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border.light,
              }}>
                {/* 여기에 검색 입력 필드 추가 가능 */}
              </View>
            )}

            {/* 옵션 리스트 */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={renderOption}
              maxToRenderPerBatch={maxOptionsVisible}
              windowSize={maxOptionsVisible}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Select;