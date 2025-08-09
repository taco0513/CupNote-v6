import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { theme } from '../../theme';

export interface ContainerProps {
  /** 자식 요소 */
  children: React.ReactNode;
  
  /** 스크롤 가능 여부 */
  scrollable?: boolean;
  
  /** SafeAreaView 사용 여부 */
  useSafeArea?: boolean;
  
  /** 키보드 회피 동작 */
  keyboardBehavior?: 'height' | 'position' | 'padding' | 'none';
  
  /** 패딩 설정 */
  padding?: 'none' | 'small' | 'medium' | 'large' | number;
  
  /** 배경색 */
  backgroundColor?: string;
  
  /** 중앙 정렬 */
  centered?: boolean;
  
  /** 전체 높이 사용 */
  fullHeight?: boolean;
  
  /** 가로 패딩만 적용 */
  paddingHorizontal?: boolean;
  
  /** 세로 패딩만 적용 */
  paddingVertical?: boolean;
  
  /** 커스텀 스타일 */
  style?: ViewStyle;
  
  /** ScrollView props (scrollable이 true일 때) */
  scrollViewProps?: Partial<ScrollViewProps>;
  
  /** 테스트 ID */
  testID?: string;
}

/**
 * CupNote v6 Korean UX 최적화 Container 컴포넌트
 * 
 * Features:
 * - SafeAreaView 기본 지원
 * - 키보드 회피 동작
 * - 스크롤 뷰 옵션
 * - 반응형 패딩 시스템
 * - iOS/Android 일관성
 * - 접근성 지원
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  scrollable = false,
  useSafeArea = true,
  keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height',
  padding = 'medium',
  backgroundColor = theme.colors.background,
  centered = false,
  fullHeight = true,
  paddingHorizontal = false,
  paddingVertical = false,
  style,
  scrollViewProps = {},
  testID,
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
        return theme.spacing[3]; // 12px
      case 'large':
        return theme.spacing[6]; // 24px
      case 'medium':
      default:
        return theme.spacing[4]; // 16px
    }
  };

  const paddingValue = getPaddingValue();

  // 컨테이너 스타일 계산
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor,
      flex: fullHeight ? 1 : undefined,
    };

    // 패딩 적용
    if (paddingHorizontal) {
      baseStyle.paddingHorizontal = paddingValue;
    } else if (paddingVertical) {
      baseStyle.paddingVertical = paddingValue;
    } else if (padding !== 'none') {
      baseStyle.padding = paddingValue;
    }

    // 중앙 정렬
    if (centered) {
      baseStyle.justifyContent = 'center';
      baseStyle.alignItems = 'center';
    }

    return baseStyle;
  };

  // 스크롤 뷰 스타일
  const getScrollViewStyle = (): ViewStyle => {
    return {
      flexGrow: 1,
      ...getContainerStyle(),
    };
  };

  // 콘텐츠 컨테이너 스타일 (ScrollView용)
  const getContentContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {};

    if (centered) {
      baseStyle.flexGrow = 1;
      baseStyle.justifyContent = 'center';
      baseStyle.alignItems = 'center';
    }

    return baseStyle;
  };

  // 키보드 회피 컨테이너 렌더링
  const renderKeyboardAvoidingContainer = (content: React.ReactNode) => {
    if (keyboardBehavior === 'none') {
      return content;
    }

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        {content}
      </KeyboardAvoidingView>
    );
  };

  // SafeArea 컨테이너 렌더링
  const renderSafeAreaContainer = (content: React.ReactNode) => {
    if (!useSafeArea) {
      return content;
    }

    return (
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: backgroundColor 
        }}
      >
        {content}
      </SafeAreaView>
    );
  };

  // 메인 콘텐츠 렌더링
  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={getScrollViewStyle()}
          contentContainerStyle={getContentContainerStyle()}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          testID={`${testID}-scroll`}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View 
        style={[getContainerStyle(), style]}
        testID={testID}
      >
        {children}
      </View>
    );
  };

  // 최종 컨테이너 구조
  return renderSafeAreaContainer(
    renderKeyboardAvoidingContainer(
      renderContent()
    )
  );
};

export default Container;