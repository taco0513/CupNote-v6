import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';
import { Slider, type SliderProps } from '../form/Slider';

// 맛 평가 카테고리 정의
export const TASTE_CATEGORIES = {
  acidity: {
    name: '산미',
    description: '신맛의 정도',
    colorTheme: 'acidity' as const,
    minLabel: '산미 없음',
    maxLabel: '매우 높음',
    icon: '🍋',
  },
  sweetness: {
    name: '단맛',
    description: '단맛의 정도',
    colorTheme: 'sweetness' as const,
    minLabel: '단맛 없음',
    maxLabel: '매우 달콤',
    icon: '🍯',
  },
  bitterness: {
    name: '쓴맛',
    description: '쓴맛의 정도',
    colorTheme: 'bitterness' as const,
    minLabel: '쓴맛 없음',
    maxLabel: '매우 쓴',
    icon: '☕',
  },
  body: {
    name: '바디감',
    description: '무게감과 질감',
    colorTheme: 'body' as const,
    minLabel: '가벼움',
    maxLabel: '진함',
    icon: '💪',
  },
  balance: {
    name: '균형감',
    description: '전체적인 조화',
    colorTheme: 'balance' as const,
    minLabel: '불균형',
    maxLabel: '완벽한 균형',
    icon: '⚖️',
  },
  cleanness: {
    name: '깔끔함',
    description: '깔끔한 정도',
    colorTheme: 'balance' as const,
    minLabel: '탁함',
    maxLabel: '매우 깔끔',
    icon: '✨',
  },
  aftertaste: {
    name: '여운',
    description: '뒤맛의 지속성',
    colorTheme: 'balance' as const,
    minLabel: '여운 없음',
    maxLabel: '긴 여운',
    icon: '🌊',
  },
} as const;

export type TasteCategory = keyof typeof TASTE_CATEGORIES;

export interface TasteSliderProps extends Omit<SliderProps, 'colorTheme' | 'label' | 'minimumLabel' | 'maximumLabel'> {
  /** 맛 카테고리 */
  category: TasteCategory;
  
  /** 추천 값 표시 여부 */
  showRecommendation?: boolean;
  
  /** 추천 값 */
  recommendedValue?: number;
  
  /** 아이콘 표시 여부 */
  showIcon?: boolean;
  
  /** 설명 표시 여부 */
  showDescription?: boolean;
  
  /** 컴팩트 모드 */
  compact?: boolean;
  
  /** 카테고리 헤더 스타일 */
  headerStyle?: ViewStyle;
  
  /** 카테고리 이름 스타일 */
  categoryNameStyle?: TextStyle;
  
  /** 설명 텍스트 스타일 */
  descriptionStyle?: TextStyle;
}

/**
 * CupNote v6 TastingFlow TasteSlider 컴포넌트
 * 
 * Features:
 * - 7가지 맛 평가 카테고리 지원
 * - 카테고리별 색상 테마
 * - 추천 값 가이드라인
 * - 한국어 라벨링
 * - 아이콘과 설명 지원
 * - 컴팩트 모드 지원
 * - 접근성 지원
 */
export const TasteSlider: React.FC<TasteSliderProps> = ({
  category,
  showRecommendation = false,
  recommendedValue,
  showIcon = true,
  showDescription = false,
  compact = false,
  headerStyle,
  categoryNameStyle,
  descriptionStyle,
  ...sliderProps
}) => {
  const categoryConfig = TASTE_CATEGORIES[category];

  // 헤더 컨테이너 스타일
  const getHeaderContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: compact ? theme.spacing[2] : theme.spacing[3],
    };
    
    return baseStyle;
  };

  // 아이콘 스타일
  const getIconStyle = (): TextStyle => ({
    fontSize: compact ? 16 : 20,
    marginRight: theme.spacing[2],
  });

  // 카테고리 정보 컨테이너 스타일
  const getCategoryInfoStyle = (): ViewStyle => ({
    flex: 1,
  });

  // 카테고리 이름 스타일
  const getCategoryNameStyle = (): TextStyle => {
    return {
      fontSize: compact ? theme.typography.fontSize.base : theme.typography.fontSize.lg,
      lineHeight: compact ? theme.typography.lineHeight.base : theme.typography.lineHeight.lg,
      fontFamily: theme.typography.fontFamily.bold,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      includeFontPadding: false,
    };
  };

  // 설명 텍스트 스타일
  const getDescriptionTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing[1],
      includeFontPadding: false,
    };
  };

  // 추천 값 표시 스타일
  const getRecommendationStyle = (): ViewStyle => ({
    backgroundColor: theme.colors.status.info.light,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing[2],
  });

  const getRecommendationTextStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.status.info.default,
  });

  // 슬라이더 컨테이너 스타일
  const getSliderContainerStyle = (): ViewStyle => ({
    marginBottom: compact ? theme.spacing[3] : theme.spacing[4],
  });

  // 값 포맷터
  const formatValue = (value: number): string => {
    if (compact) {
      return value.toFixed(1);
    }
    
    // 값에 따른 설명적 표현
    if (value <= 2) return `${value.toFixed(1)} (낮음)`;
    if (value <= 4) return `${value.toFixed(1)} (보통 이하)`;
    if (value <= 6) return `${value.toFixed(1)} (보통)`;
    if (value <= 8) return `${value.toFixed(1)} (높음)`;
    return `${value.toFixed(1)} (매우 높음)`;
  };

  return (
    <View style={getSliderContainerStyle()}>
      {/* 카테고리 헤더 */}
      <View style={[getHeaderContainerStyle(), headerStyle]}>
        {/* 아이콘과 카테고리 정보 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {showIcon && (
            <Text style={getIconStyle()}>
              {categoryConfig.icon}
            </Text>
          )}
          
          <View style={getCategoryInfoStyle()}>
            <Text style={[getCategoryNameStyle(), categoryNameStyle]}>
              {categoryConfig.name}
            </Text>
            
            {showDescription && (
              <Text style={[getDescriptionTextStyle(), descriptionStyle]}>
                {categoryConfig.description}
              </Text>
            )}
          </View>
        </View>

        {/* 추천 값 표시 */}
        {showRecommendation && recommendedValue && (
          <View style={getRecommendationStyle()}>
            <Text style={getRecommendationTextStyle()}>
              추천: {recommendedValue.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* 슬라이더 */}
      <Slider
        colorTheme={categoryConfig.colorTheme}
        minimumLabel={categoryConfig.minLabel}
        maximumLabel={categoryConfig.maxLabel}
        valueFormatter={formatValue}
        size={compact ? 'small' : 'medium'}
        showMinMaxLabels={!compact}
        {...sliderProps}
      />
    </View>
  );
};

// 다중 맛 평가 슬라이더 컴포넌트
export interface MultipleTasteSlidersProps {
  /** 맛 평가 데이터 */
  values: Record<TasteCategory, number>;
  
  /** 값 변경 핸들러 */
  onValueChange: (category: TasteCategory, value: number) => void;
  
  /** 포함할 카테고리들 (기본: 모든 카테고리) */
  categories?: TasteCategory[];
  
  /** 추천 값들 */
  recommendedValues?: Partial<Record<TasteCategory, number>>;
  
  /** 추천 값 표시 여부 */
  showRecommendations?: boolean;
  
  /** 컴팩트 모드 */
  compact?: boolean;
  
  /** 카테고리별 설정 */
  categorySettings?: Partial<Record<TasteCategory, Partial<TasteSliderProps>>>;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 테스트 ID */
  testID?: string;
}

export const MultipleTasteSliders: React.FC<MultipleTasteSlidersProps> = ({
  values,
  onValueChange,
  categories = Object.keys(TASTE_CATEGORIES) as TasteCategory[],
  recommendedValues,
  showRecommendations = false,
  compact = false,
  categorySettings = {},
  containerStyle,
  testID,
}) => {
  return (
    <View 
      style={containerStyle}
      testID={testID}
      accessible
      accessibilityLabel="맛 평가 슬라이더 그룹"
    >
      {categories.map((category, index) => {
        const categoryProps = categorySettings[category] || {};
        
        return (
          <TasteSlider
            key={category}
            category={category}
            value={values[category]}
            onValueChange={(value) => onValueChange(category, value)}
            showRecommendation={showRecommendations}
            recommendedValue={recommendedValues?.[category]}
            compact={compact}
            testID={`${testID}-${category}`}
            {...categoryProps}
          />
        );
      })}
    </View>
  );
};

export default TasteSlider;