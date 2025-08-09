import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../theme';
import { Card, type CardProps } from '../layout/Card';

export type TastingMode = 'cafe' | 'homecafe';

export interface ModeInfo {
  title: string;
  subtitle: string;
  description: string;
  estimatedTime: string;
  steps: number;
  features: string[];
  icon: string;
  color: string;
  gradientColors: [string, string];
}

export const TASTING_MODES: Record<TastingMode, ModeInfo> = {
  cafe: {
    title: '카페 모드',
    subtitle: '카페에서 마시는 커피',
    description: '카페 분위기와 함께 커피의 맛과 경험을 기록합니다.',
    estimatedTime: '5-7분',
    steps: 6,
    features: [
      'GPS 기반 카페 정보',
      '메뉴 OCR 스캔',
      '분위기 및 동행자 기록',
      '향미 및 감각 평가',
      '개인 노트 작성',
    ],
    icon: '☕',
    color: theme.colors.coffee[500],
    gradientColors: [theme.colors.coffee[400], theme.colors.coffee[600]],
  },
  homecafe: {
    title: '홈카페 모드',
    subtitle: '집에서 직접 내린 커피',
    description: '브루잉 과정과 레시피를 상세히 기록하고 관리합니다.',
    estimatedTime: '8-12분',
    steps: 8,
    features: [
      '브루잉 방법 및 레시피',
      '타이머 및 추출 과정',
      '원두 및 장비 정보',
      '향미 및 감각 평가',
      '레시피 저장 및 공유',
    ],
    icon: '🏠',
    color: theme.colors.taste.body.default,
    gradientColors: [theme.colors.taste.body.light, theme.colors.taste.body.dark],
  },
} as const;

export interface ModeCardProps extends Omit<CardProps, 'onPress'> {
  /** 테이스팅 모드 */
  mode: TastingMode;
  
  /** 선택된 상태 */
  isSelected?: boolean;
  
  /** 카드 클릭 핸들러 */
  onPress?: (mode: TastingMode) => void;
  
  /** 애니메이션 활성화 */
  animated?: boolean;
  
  /** 애니메이션 지연 */
  animationDelay?: number;
  
  /** 세로 레이아웃 */
  vertical?: boolean;
  
  /** 컴팩트 모드 */
  compact?: boolean;
  
  /** 아이콘 표시 여부 */
  showIcon?: boolean;
  
  /** 기능 리스트 표시 여부 */
  showFeatures?: boolean;
  
  /** 단계 수 표시 여부 */
  showSteps?: boolean;
  
  /** 소요 시간 표시 여부 */
  showTime?: boolean;
  
  /** 카드 헤더 스타일 */
  headerStyle?: ViewStyle;
  
  /** 제목 스타일 */
  titleStyle?: TextStyle;
  
  /** 서브타이틀 스타일 */
  subtitleStyle?: TextStyle;
  
  /** 설명 스타일 */
  descriptionStyle?: TextStyle;
  
  /** 기능 리스트 스타일 */
  featuresStyle?: ViewStyle;
}

/**
 * CupNote v6 TastingFlow ModeCard 컴포넌트
 * 
 * Features:
 * - 카페/홈카페 모드 선택 카드
 * - 모드별 색상 테마
 * - 애니메이션 지원
 * - 상세 정보 표시
 * - 선택 상태 표시
 * - 한국어 콘텐츠
 * - 접근성 지원
 */
export const ModeCard: React.FC<ModeCardProps> = ({
  mode,
  isSelected = false,
  onPress,
  animated = true,
  animationDelay = 0,
  vertical = true,
  compact = false,
  showIcon = true,
  showFeatures = true,
  showSteps = true,
  showTime = true,
  headerStyle,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  featuresStyle,
  ...cardProps
}) => {
  const modeInfo = TASTING_MODES[mode];
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(0);

  // 애니메이션 초기화
  React.useEffect(() => {
    if (animated) {
      opacityValue.value = withTiming(1, { duration: 500 });
      if (animationDelay > 0) {
        setTimeout(() => {
          scaleValue.value = withSpring(1.02, { damping: 15 });
          setTimeout(() => {
            scaleValue.value = withSpring(1, { damping: 15 });
          }, 200);
        }, animationDelay);
      }
    } else {
      opacityValue.value = 1;
    }
  }, [animated, animationDelay]);

  // 선택 애니메이션
  React.useEffect(() => {
    if (isSelected) {
      scaleValue.value = withSpring(1.05, { damping: 15, stiffness: 200 });
    } else {
      scaleValue.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [isSelected]);

  // 카드 애니메이션 스타일
  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  // 헤더 스타일
  const getHeaderStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: vertical ? 'column' : 'row',
      alignItems: vertical ? 'center' : 'flex-start',
      marginBottom: compact ? theme.spacing[3] : theme.spacing[4],
    };

    return baseStyle;
  };

  // 아이콘 스타일
  const getIconStyle = (): TextStyle => ({
    fontSize: compact ? 32 : 48,
    textAlign: 'center',
    marginBottom: vertical ? theme.spacing[2] : 0,
    marginRight: vertical ? 0 : theme.spacing[3],
  });

  // 제목 영역 스타일
  const getTitleAreaStyle = (): ViewStyle => ({
    alignItems: vertical ? 'center' : 'flex-start',
    flex: vertical ? 0 : 1,
  });

  // 제목 스타일
  const getTitleTextStyle = (): TextStyle => {
    return {
      fontSize: compact ? theme.typography.fontSize.lg : theme.typography.fontSize['2xl'],
      lineHeight: compact ? theme.typography.lineHeight.lg : theme.typography.lineHeight['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      fontWeight: theme.typography.fontWeight.bold,
      color: isSelected ? modeInfo.color : theme.colors.text.primary,
      textAlign: vertical ? 'center' : 'left',
      marginBottom: theme.spacing[1],
      includeFontPadding: false,
    };
  };

  // 서브타이틀 스타일
  const getSubtitleTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.text.secondary,
      textAlign: vertical ? 'center' : 'left',
      includeFontPadding: false,
    };
  };

  // 설명 스타일
  const getDescriptionTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.base * 1.3,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary,
      textAlign: vertical ? 'center' : 'left',
      marginBottom: showFeatures || showSteps || showTime ? theme.spacing[4] : 0,
      includeFontPadding: false,
    };
  };

  // 정보 섹션 스타일
  const getInfoSectionStyle = (): ViewStyle => ({
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.warm[50],
    borderRadius: theme.borderRadius.md,
    marginBottom: showFeatures ? theme.spacing[4] : 0,
  });

  // 정보 아이템 스타일
  const getInfoItemStyle = (): ViewStyle => ({
    alignItems: 'center',
  });

  const getInfoLabelStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[1],
  });

  const getInfoValueStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.bold,
    color: modeInfo.color,
    fontWeight: theme.typography.fontWeight.bold,
  });

  // 기능 리스트 스타일
  const getFeaturesListStyle = (): ViewStyle => ({
    marginTop: theme.spacing[2],
  });

  const getFeatureItemStyle = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  });

  const getFeatureTextStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[2],
    flex: 1,
  });

  // 카드 프레스 핸들러
  const handlePress = () => {
    if (onPress) {
      onPress(mode);
    }
  };

  return (
    <Animated.View style={animatedCardStyle}>
      <Card
        touchable
        onPress={handlePress}
        selected={isSelected}
        variant={isSelected ? 'outlined' : 'default'}
        shadow={isSelected ? 'large' : 'medium'}
        padding="large"
        testID={`mode-card-${mode}`}
        accessibilityLabel={`${modeInfo.title}. ${modeInfo.description}. 소요시간 ${modeInfo.estimatedTime}, ${modeInfo.steps}단계`}
        {...cardProps}
      >
        {/* 헤더 */}
        <View style={[getHeaderStyle(), headerStyle]}>
          {showIcon && (
            <Text style={getIconStyle()}>
              {modeInfo.icon}
            </Text>
          )}
          
          <View style={getTitleAreaStyle()}>
            <Text style={[getTitleTextStyle(), titleStyle]}>
              {modeInfo.title}
            </Text>
            
            <Text style={[getSubtitleTextStyle(), subtitleStyle]}>
              {modeInfo.subtitle}
            </Text>
          </View>
        </View>

        {/* 설명 */}
        <Text style={[getDescriptionTextStyle(), descriptionStyle]}>
          {modeInfo.description}
        </Text>

        {/* 정보 섹션 */}
        {(showTime || showSteps) && (
          <View style={getInfoSectionStyle()}>
            {showTime && (
              <View style={getInfoItemStyle()}>
                <Text style={getInfoLabelStyle()}>소요시간</Text>
                <Text style={getInfoValueStyle()}>{modeInfo.estimatedTime}</Text>
              </View>
            )}
            
            {showSteps && (
              <View style={getInfoItemStyle()}>
                <Text style={getInfoLabelStyle()}>단계</Text>
                <Text style={getInfoValueStyle()}>{modeInfo.steps}단계</Text>
              </View>
            )}
          </View>
        )}

        {/* 기능 리스트 */}
        {showFeatures && !compact && (
          <View style={[getFeaturesListStyle(), featuresStyle]}>
            {modeInfo.features.map((feature, index) => (
              <View key={index} style={getFeatureItemStyle()}>
                <Text style={{ color: modeInfo.color, fontSize: 12 }}>●</Text>
                <Text style={getFeatureTextStyle()}>{feature}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

export default ModeCard;