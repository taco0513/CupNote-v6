import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

export interface ProgressHeaderProps {
  /** 현재 단계 */
  currentStep: number;
  
  /** 전체 단계 수 */
  totalSteps: number;
  
  /** 헤더 제목 */
  title: string;
  
  /** 서브타이틀 */
  subtitle?: string;
  
  /** 뒤로가기 핸들러 */
  onBack?: () => void;
  
  /** 닫기 핸들러 */
  onClose?: () => void;
  
  /** 임시저장 핸들러 */
  onSaveDraft?: () => Promise<void>;
  
  /** 뒤로가기 버튼 표시 여부 */
  showBackButton?: boolean;
  
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
  
  /** 진행률 바 표시 여부 */
  showProgressBar?: boolean;
  
  /** 임시저장 버튼 표시 여부 */
  showDraftButton?: boolean;
  
  /** 로딩 상태 */
  isLoading?: boolean;
  
  /** 임시저장 중 상태 */
  isSaving?: boolean;
  
  /** 진행률 색상 */
  progressColor?: string;
  
  /** 배경색 */
  backgroundColor?: string;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 제목 스타일 */
  titleStyle?: TextStyle;
  
  /** 서브타이틀 스타일 */
  subtitleStyle?: TextStyle;
  
  /** 테스트 ID */
  testID?: string;
}

/**
 * CupNote v6 TastingFlow ProgressHeader 컴포넌트
 * 
 * Features:
 * - 8단계 진행률 표시
 * - 애니메이션 진행률 바
 * - 임시저장 기능
 * - SafeArea 자동 대응
 * - 한국어 UX 최적화
 * - 접근성 지원
 * - 커피 테마 컬러
 */
export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
  onBack,
  onClose,
  onSaveDraft,
  showBackButton = true,
  showCloseButton = true,
  showProgressBar = true,
  showDraftButton = true,
  isLoading = false,
  isSaving = false,
  progressColor = theme.colors.coffee[500],
  backgroundColor = theme.colors.surface,
  containerStyle,
  titleStyle,
  subtitleStyle,
  testID,
}) => {
  const insets = useSafeAreaInsets();
  const progressValue = useSharedValue(0);

  // 진행률 계산 및 애니메이션
  React.useEffect(() => {
    const progress = Math.max(0, Math.min(currentStep / totalSteps, 1));
    progressValue.value = withTiming(progress, { duration: 500 });
  }, [currentStep, totalSteps]);

  // 진행률 바 애니메이션 스타일
  const progressBarAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      width: `${width}%`,
    };
  });

  // 컨테이너 스타일
  const getContainerStyle = (): ViewStyle => {
    return {
      backgroundColor,
      paddingTop: insets.top,
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      ...theme.shadows.sm,
    };
  };

  // 헤더 내용 스타일
  const getHeaderContentStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
      marginBottom: showProgressBar ? theme.spacing[3] : 0,
    };
  };

  // 제목 영역 스타일
  const getTitleAreaStyle = (): ViewStyle => {
    return {
      flex: 1,
      marginHorizontal: theme.spacing[3],
      alignItems: 'center',
    };
  };

  // 제목 텍스트 스타일
  const getTitleTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.lineHeight.lg,
      fontFamily: theme.typography.fontFamily.bold,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      includeFontPadding: false,
    };
  };

  // 서브타이틀 텍스트 스타일
  const getSubtitleTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing[1],
      includeFontPadding: false,
    };
  };

  // 버튼 스타일
  const getButtonStyle = (): ViewStyle => {
    return {
      minHeight: theme.dimensions.touch.minimum,
      minWidth: theme.dimensions.touch.minimum,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[2],
    };
  };

  // 버튼 텍스트 스타일
  const getButtonTextStyle = (color: string = theme.colors.text.primary): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color,
      fontWeight: theme.typography.fontWeight.medium,
    };
  };

  // 진행률 컨테이너 스타일
  const getProgressContainerStyle = (): ViewStyle => {
    return {
      height: 4,
      backgroundColor: theme.colors.warm[200],
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: theme.spacing[2],
    };
  };

  // 진행률 바 스타일
  const getProgressBarStyle = (): ViewStyle => {
    return {
      height: '100%',
      backgroundColor: progressColor,
      borderRadius: 2,
    };
  };

  // 단계 텍스트 스타일
  const getStepTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    };
  };

  // 임시저장 처리
  const handleSaveDraft = async () => {
    if (onSaveDraft && !isSaving) {
      try {
        await onSaveDraft();
      } catch (error) {
        console.warn('Draft save failed:', error);
      }
    }
  };

  // 뒤로가기 버튼 렌더링
  const renderBackButton = () => {
    if (!showBackButton || !onBack) return null;
    
    return (
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onBack}
        disabled={isLoading || isSaving}
        activeOpacity={theme.opacity.pressed}
        testID={`${testID}-back`}
        accessible
        accessibilityRole="button"
        accessibilityLabel="이전 단계로"
      >
        <Text style={getButtonTextStyle()}>‹</Text>
      </TouchableOpacity>
    );
  };

  // 닫기/임시저장 버튼 영역 렌더링
  const renderRightButtons = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* 임시저장 버튼 */}
        {showDraftButton && onSaveDraft && (
          <TouchableOpacity
            style={[getButtonStyle(), { marginRight: theme.spacing[2] }]}
            onPress={handleSaveDraft}
            disabled={isLoading || isSaving}
            activeOpacity={theme.opacity.pressed}
            testID={`${testID}-draft`}
            accessible
            accessibilityRole="button"
            accessibilityLabel={isSaving ? "저장 중..." : "임시저장"}
          >
            <Text style={getButtonTextStyle(theme.colors.coffee[500])}>
              {isSaving ? '저장중' : '임시저장'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* 닫기 버튼 */}
        {showCloseButton && onClose && (
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={onClose}
            disabled={isLoading || isSaving}
            activeOpacity={theme.opacity.pressed}
            testID={`${testID}-close`}
            accessible
            accessibilityRole="button"
            accessibilityLabel="테이스팅 플로우 닫기"
          >
            <Text style={getButtonTextStyle()}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View 
      style={[getContainerStyle(), containerStyle]}
      testID={testID}
      accessible
      accessibilityRole="header"
      accessibilityLabel={`테이스팅 플로우 진행률 헤더. ${title}. ${currentStep}단계 중 ${totalSteps}단계`}
    >
      {/* 헤더 내용 */}
      <View style={getHeaderContentStyle()}>
        {/* 뒤로가기 버튼 */}
        {renderBackButton()}
        
        {/* 제목 영역 */}
        <View style={getTitleAreaStyle()}>
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
        
        {/* 오른쪽 버튼들 */}
        {renderRightButtons()}
      </View>
      
      {/* 진행률 바 */}
      {showProgressBar && (
        <View>
          <View style={getProgressContainerStyle()}>
            <Animated.View 
              style={[getProgressBarStyle(), progressBarAnimatedStyle]}
              testID={`${testID}-progress-bar`}
            />
          </View>
          
          {/* 단계 표시 */}
          <Text 
            style={getStepTextStyle()}
            testID={`${testID}-step-text`}
          >
            {currentStep} / {totalSteps} 단계
          </Text>
        </View>
      )}
    </View>
  );
};

export default ProgressHeader;