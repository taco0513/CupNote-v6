import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

export interface HeaderAction {
  /** 액션 아이콘 또는 텍스트 */
  content: React.ReactNode;
  /** 액션 핸들러 */
  onPress: () => void;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 테스트 ID */
  testID?: string;
  /** 접근성 라벨 */
  accessibilityLabel?: string;
}

export interface HeaderProps {
  /** 헤더 제목 */
  title?: string;
  
  /** 서브타이틀 */
  subtitle?: string;
  
  /** 왼쪽 액션 (주로 뒤로가기) */
  leftAction?: HeaderAction;
  
  /** 오른쪽 액션들 */
  rightActions?: HeaderAction[];
  
  /** 헤더 변형 */
  variant?: 'default' | 'large' | 'compact';
  
  /** 배경색 */
  backgroundColor?: string;
  
  /** 텍스트 색상 */
  textColor?: string;
  
  /** 테두리 표시 여부 */
  showBorder?: boolean;
  
  /** 그림자 표시 여부 */
  showShadow?: boolean;
  
  /** StatusBar 스타일 */
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  
  /** StatusBar 배경색 투명 여부 */
  statusBarTranslucent?: boolean;
  
  /** 커스텀 중앙 컨텐츠 */
  centerContent?: React.ReactNode;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 타이틀 스타일 */
  titleStyle?: TextStyle;
  
  /** 서브타이틀 스타일 */
  subtitleStyle?: TextStyle;
  
  /** 테스트 ID */
  testID?: string;
}

/**
 * CupNote v6 Korean UX 최적화 Header 컴포넌트
 * 
 * Features:
 * - SafeArea 자동 지원
 * - iOS/Android StatusBar 통합 관리
 * - 다양한 헤더 변형 지원
 * - 접근성 AAA 등급 준수
 * - 한국어 타이포그래피 최적화
 * - 커피 테마 컬러 적용
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions = [],
  variant = 'default',
  backgroundColor = theme.colors.surface,
  textColor = theme.colors.text.primary,
  showBorder = true,
  showShadow = true,
  statusBarStyle = 'dark-content',
  statusBarTranslucent = false,
  centerContent,
  containerStyle,
  titleStyle,
  subtitleStyle,
  testID,
}) => {
  const insets = useSafeAreaInsets();

  // 헤더 높이 계산
  const getHeaderHeight = () => {
    const baseHeight = {
      compact: 44,
      default: 56,
      large: 96,
    };

    return baseHeight[variant];
  };

  // 컨테이너 스타일 계산
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor,
      paddingTop: statusBarTranslucent ? insets.top : 0,
      paddingHorizontal: theme.spacing[4],
      minHeight: getHeaderHeight(),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    };

    // 테두리
    if (showBorder) {
      baseStyle.borderBottomWidth = 1;
      baseStyle.borderBottomColor = theme.colors.border.light;
    }

    // 그림자
    if (showShadow) {
      Object.assign(baseStyle, theme.shadows.sm);
    }

    return baseStyle;
  };

  // 타이틀 컨테이너 스타일
  const getTitleContainerStyle = (): ViewStyle => {
    return {
      flex: 1,
      alignItems: variant === 'large' ? 'flex-start' : 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[3],
    };
  };

  // 타이틀 텍스트 스타일
  const getTitleTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: textColor,
      fontFamily: theme.typography.fontFamily.bold,
      textAlign: variant === 'large' ? 'left' : 'center',
      includeFontPadding: false,
    };

    // 크기별 스타일
    switch (variant) {
      case 'compact':
        baseStyle.fontSize = theme.typography.fontSize.base;
        baseStyle.lineHeight = theme.typography.lineHeight.base;
        break;
      case 'large':
        baseStyle.fontSize = theme.typography.fontSize['2xl'];
        baseStyle.lineHeight = theme.typography.lineHeight['2xl'];
        baseStyle.fontWeight = theme.typography.fontWeight.bold;
        break;
      case 'default':
      default:
        baseStyle.fontSize = theme.typography.fontSize.lg;
        baseStyle.lineHeight = theme.typography.lineHeight.lg;
        baseStyle.fontWeight = theme.typography.fontWeight.semibold;
        break;
    }

    return baseStyle;
  };

  // 서브타이틀 텍스트 스타일
  const getSubtitleTextStyle = (): TextStyle => {
    return {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      textAlign: variant === 'large' ? 'left' : 'center',
      marginTop: theme.spacing[1],
      includeFontPadding: false,
    };
  };

  // 액션 버튼 스타일
  const getActionButtonStyle = (): ViewStyle => {
    return {
      minHeight: theme.dimensions.touch.minimum,
      minWidth: theme.dimensions.touch.minimum,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[2],
    };
  };

  // 왼쪽 액션 렌더링
  const renderLeftAction = () => {
    if (!leftAction) {
      return <View style={{ width: theme.dimensions.touch.minimum }} />;
    }

    return (
      <TouchableOpacity
        style={getActionButtonStyle()}
        onPress={leftAction.onPress}
        disabled={leftAction.disabled}
        activeOpacity={theme.opacity.pressed}
        testID={leftAction.testID}
        accessible
        accessibilityRole="button"
        accessibilityLabel={leftAction.accessibilityLabel || '뒤로가기'}
      >
        {leftAction.content}
      </TouchableOpacity>
    );
  };

  // 오른쪽 액션들 렌더링
  const renderRightActions = () => {
    if (rightActions.length === 0) {
      return <View style={{ width: theme.dimensions.touch.minimum }} />;
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              getActionButtonStyle(),
              index > 0 && { marginLeft: theme.spacing[1] }
            ]}
            onPress={action.onPress}
            disabled={action.disabled}
            activeOpacity={theme.opacity.pressed}
            testID={action.testID}
            accessible
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
          >
            {action.content}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 중앙 컨텐츠 렌더링
  const renderCenterContent = () => {
    if (centerContent) {
      return (
        <View style={getTitleContainerStyle()}>
          {centerContent}
        </View>
      );
    }

    if (!title) {
      return <View style={{ flex: 1 }} />;
    }

    return (
      <View style={getTitleContainerStyle()}>
        <Text
          style={[getTitleTextStyle(), titleStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
          testID={`${testID}-title`}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text
            style={[getSubtitleTextStyle(), subtitleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
            testID={`${testID}-subtitle`}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      {/* StatusBar */}
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarTranslucent ? 'transparent' : backgroundColor}
        translucent={statusBarTranslucent}
      />

      {/* Header Container */}
      <View 
        style={[getContainerStyle(), containerStyle]}
        testID={testID}
      >
        {/* Left Action */}
        {renderLeftAction()}

        {/* Center Content */}
        {renderCenterContent()}

        {/* Right Actions */}
        {renderRightActions()}
      </View>
    </>
  );
};

export default Header;