import React from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme';
import { Button, type ButtonProps } from '../form/Button';

export interface EmptyStateProps {
  /** 빈 상태 제목 */
  title: string;
  
  /** 빈 상태 설명 */
  description?: string;
  
  /** 아이콘 또는 일러스트레이션 */
  icon?: React.ReactNode;
  
  /** 액션 버튼 설정 */
  action?: {
    label: string;
    onPress: () => void;
  } & Partial<ButtonProps>;
  
  /** 보조 액션 버튼 설정 */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  } & Partial<ButtonProps>;
  
  /** 빈 상태 타입 */
  variant?: 'default' | 'search' | 'error' | 'offline' | 'maintenance';
  
  /** 수직 정렬 */
  centered?: boolean;
  
  /** 최소 높이 */
  minHeight?: number;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 아이콘 컨테이너 스타일 */
  iconContainerStyle?: ViewStyle;
  
  /** 제목 스타일 */
  titleStyle?: TextStyle;
  
  /** 설명 스타일 */
  descriptionStyle?: TextStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
}

/**
 * CupNote v6 Korean UX 최적화 EmptyState 컴포넌트
 * 
 * Features:
 * - 다양한 빈 상태 변형 지원
 * - 한국어 메시지 최적화
 * - 접근성 AAA 등급 준수
 * - 커피 테마 컬러 적용
 * - 액션 버튼 통합
 * - 반응형 레이아웃
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  secondaryAction,
  variant = 'default',
  centered = true,
  minHeight = 300,
  containerStyle,
  iconContainerStyle,
  titleStyle,
  descriptionStyle,
  testID,
  accessibilityLabel,
}) => {
  // 변형별 기본 설정
  const getVariantConfig = () => {
    switch (variant) {
      case 'search':
        return {
          defaultIcon: '🔍',
          titleColor: theme.colors.text.primary,
          descriptionColor: theme.colors.text.secondary,
          defaultTitle: '검색 결과가 없습니다',
          defaultDescription: '다른 키워드로 검색해보세요',
        };
      case 'error':
        return {
          defaultIcon: '⚠️',
          titleColor: theme.colors.status.error.default,
          descriptionColor: theme.colors.text.secondary,
          defaultTitle: '오류가 발생했습니다',
          defaultDescription: '잠시 후 다시 시도해보세요',
        };
      case 'offline':
        return {
          defaultIcon: '📶',
          titleColor: theme.colors.text.primary,
          descriptionColor: theme.colors.text.secondary,
          defaultTitle: '인터넷 연결을 확인하세요',
          defaultDescription: '네트워크에 연결된 후 다시 시도해보세요',
        };
      case 'maintenance':
        return {
          defaultIcon: '🔧',
          titleColor: theme.colors.status.warning.default,
          descriptionColor: theme.colors.text.secondary,
          defaultTitle: '서비스 점검 중입니다',
          defaultDescription: '잠시 후 다시 이용해주세요',
        };
      case 'default':
      default:
        return {
          defaultIcon: '☕',
          titleColor: theme.colors.text.primary,
          descriptionColor: theme.colors.text.secondary,
          defaultTitle: '아직 기록이 없습니다',
          defaultDescription: '첫 번째 커피 기록을 만들어보세요',
        };
    }
  };

  const variantConfig = getVariantConfig();

  // 컨테이너 스타일
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      paddingHorizontal: theme.spacing[6],
      paddingVertical: theme.spacing[8],
      minHeight,
    };

    if (centered) {
      baseStyle.justifyContent = 'center';
      baseStyle.alignItems = 'center';
    }

    return baseStyle;
  };

  // 아이콘 컨테이너 스타일
  const getIconContainerStyle = (): ViewStyle => {
    return {
      marginBottom: theme.spacing[6],
      alignItems: 'center',
    };
  };

  // 기본 아이콘 스타일
  const getDefaultIconStyle = (): TextStyle => {
    return {
      fontSize: 64,
      textAlign: 'center',
      opacity: 0.6,
    };
  };

  // 제목 스타일
  const getTitleStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize['2xl'],
      lineHeight: theme.typography.lineHeight['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      fontWeight: theme.typography.fontWeight.bold,
      color: variantConfig.titleColor,
      textAlign: 'center',
      marginBottom: description ? theme.spacing[3] : theme.spacing[6],
      includeFontPadding: false,
    };
  };

  // 설명 스타일
  const getDescriptionStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.base * 1.3,
      fontFamily: theme.typography.fontFamily.regular,
      color: variantConfig.descriptionColor,
      textAlign: 'center',
      marginBottom: (action || secondaryAction) ? theme.spacing[8] : 0,
      maxWidth: 280,
      includeFontPadding: false,
    };
  };

  // 액션 버튼 컨테이너 스타일
  const getActionContainerStyle = (): ViewStyle => {
    return {
      width: '100%',
      maxWidth: 280,
      alignItems: 'center',
    };
  };

  // 접근성 설정
  const getAccessibilityProps = () => {
    const label = accessibilityLabel || `${title}${description ? `. ${description}` : ''}`;
    
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityRole: 'text' as const,
    };
  };

  return (
    <View 
      style={[getContainerStyle(), containerStyle]}
      testID={testID}
      {...getAccessibilityProps()}
    >
      {/* 아이콘 */}
      <View style={[getIconContainerStyle(), iconContainerStyle]}>
        {icon || (
          <Text style={getDefaultIconStyle()}>
            {variantConfig.defaultIcon}
          </Text>
        )}
      </View>

      {/* 제목 */}
      <Text 
        style={[getTitleStyle(), titleStyle]}
        testID={`${testID}-title`}
      >
        {title}
      </Text>

      {/* 설명 */}
      {description && (
        <Text 
          style={[getDescriptionStyle(), descriptionStyle]}
          testID={`${testID}-description`}
        >
          {description}
        </Text>
      )}

      {/* 액션 버튼들 */}
      {(action || secondaryAction) && (
        <View style={getActionContainerStyle()}>
          {/* 주요 액션 */}
          {action && (
            <Button
              title={action.label}
              onPress={action.onPress}
              variant="primary"
              size="large"
              fullWidth
              style={{ marginBottom: secondaryAction ? theme.spacing[3] : 0 }}
              testID={`${testID}-action`}
              {...action}
            />
          )}

          {/* 보조 액션 */}
          {secondaryAction && (
            <Button
              title={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="outline"
              size="large"
              fullWidth
              testID={`${testID}-secondary-action`}
              {...secondaryAction}
            />
          )}
        </View>
      )}
    </View>
  );
};

// 미리 정의된 빈 상태 컴포넌트들
export const EmptyRecords: React.FC<Omit<EmptyStateProps, 'variant' | 'title'>> = (props) => (
  <EmptyState
    {...props}
    variant="default"
    title="아직 기록이 없습니다"
    description="첫 번째 커피 기록을 만들어보세요"
    action={props.action || {
      label: '기록하기',
      onPress: () => {},
    }}
  />
);

export const EmptySearch: React.FC<Omit<EmptyStateProps, 'variant' | 'title'>> = (props) => (
  <EmptyState
    {...props}
    variant="search"
    title="검색 결과가 없습니다"
    description="다른 키워드로 검색해보세요"
  />
);

export const NetworkError: React.FC<Omit<EmptyStateProps, 'variant' | 'title'>> = (props) => (
  <EmptyState
    {...props}
    variant="offline"
    title="인터넷 연결을 확인하세요"
    description="네트워크에 연결된 후 다시 시도해보세요"
    action={props.action || {
      label: '다시 시도',
      onPress: () => {},
    }}
  />
);

export const ServerError: React.FC<Omit<EmptyStateProps, 'variant' | 'title'>> = (props) => (
  <EmptyState
    {...props}
    variant="error"
    title="오류가 발생했습니다"
    description="잠시 후 다시 시도해보세요"
    action={props.action || {
      label: '다시 시도',
      onPress: () => {},
    }}
  />
);

export default EmptyState;