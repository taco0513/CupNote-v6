import React from 'react';
import { View, Text, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, {
  Rect,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { colors, typography } from '../../styles/theme';

export interface BarChartDataItem {
  label: string;
  value: number;
  color?: string;
  subLabel?: string;
}

export interface BarChartProps {
  /** 차트 데이터 */
  data: BarChartDataItem[];
  
  /** 차트 너비 */
  width: number;
  
  /** 차트 높이 */
  height: number;
  
  /** 최댓값 (자동 계산되지만 수동 설정 가능) */
  maxValue?: number;
  
  /** 기본 바 색상 */
  barColor?: string;
  
  /** 그리드 색상 */
  gridColor?: string;
  
  /** 바 너비 비율 (0-1) */
  barWidthRatio?: number;
  
  /** 애니메이션 활성화 */
  animated?: boolean;
  
  /** 애니메이션 지연 시간 */
  animationDelay?: number;
  
  /** 애니메이션 지속 시간 */
  animationDuration?: number;
  
  /** 값 표시 여부 */
  showValues?: boolean;
  
  /** 그리드 표시 여부 */
  showGrid?: boolean;
  
  /** Y축 라벨 표시 여부 */
  showYAxisLabels?: boolean;
  
  /** X축 라벨 회전 각도 */
  xLabelRotation?: number;
  
  /** 인터랙티브 모드 */
  interactive?: boolean;
  
  /** 바 클릭 핸들러 */
  onBarPress?: (item: BarChartDataItem, index: number) => void;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
}

/**
 * CupNote v6 BarChart 컴포넌트
 * 
 * Features:
 * - React Native Reanimated 기반 부드러운 애니메이션
 * - 사용자 통계 전용 최적화
 * - 인터랙티브 터치 지원
 * - 한국어 라벨 지원
 * - 접근성 지원
 * - 커피 테마 컬러
 * - 그라디언트 바 지원
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  width,
  height,
  maxValue,
  barColor = colors.primary,
  gridColor = colors.gray[200],
  barWidthRatio = 0.7,
  animated = true,
  animationDelay = 0,
  animationDuration = 1000,
  showValues = true,
  showGrid = true,
  showYAxisLabels = true,
  xLabelRotation = 0,
  interactive = false,
  onBarPress,
  containerStyle,
  testID,
  accessibilityLabel,
}) => {
  const padding = {
    top: 20,
    right: 20,
    bottom: 60,
    left: showYAxisLabels ? 50 : 20,
  };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // 최댓값 계산
  const calculatedMaxValue = maxValue || Math.max(...data.map(item => item.value));
  const roundedMaxValue = Math.ceil(calculatedMaxValue / 10) * 10;
  
  // 바 너비 계산
  const barWidth = (chartWidth / data.length) * barWidthRatio;
  const barSpacing = (chartWidth / data.length) * (1 - barWidthRatio);
  
  // 애니메이션 값
  const animationProgress = useSharedValue(0);
  const scaleValue = useSharedValue(0);

  // 애니메이션 시작
  React.useEffect(() => {
    if (animated) {
      animationProgress.value = withDelay(
        animationDelay,
        withTiming(1, { duration: animationDuration })
      );
      
      scaleValue.value = withSequence(
        withTiming(1, { duration: animationDuration }),
      );
    } else {
      animationProgress.value = 1;
      scaleValue.value = 1;
    }
  }, [animated, animationDelay, animationDuration]);

  // 값을 차트 높이로 변환
  const valueToHeight = (value: number) => {
    return (value / roundedMaxValue) * chartHeight;
  };

  // Y축 그리드 라인과 라벨 생성
  const yAxisElements = showGrid ? Array.from({ length: 6 }, (_, i) => {
    const value = (roundedMaxValue / 5) * i;
    const y = padding.top + chartHeight - valueToHeight(value);
    
    return (
      <React.Fragment key={i}>
        {/* 그리드 라인 */}
        <Line
          x1={padding.left}
          y1={y}
          x2={padding.left + chartWidth}
          y2={y}
          stroke={gridColor}
          strokeWidth={1}
          opacity={0.5}
        />
        
        {/* Y축 라벨 */}
        {showYAxisLabels && (
          <SvgText
            x={padding.left - 10}
            y={y + 4}
            textAnchor="end"
            fontSize="12"
            fill={colors.text.tertiary}
            fontFamily={typography.fontFamily.regular}
          >
            {value.toFixed(0)}
          </SvgText>
        )}
      </React.Fragment>
    );
  }) : [];

  // 바 요소들 생성
  const barElements = data.map((item, index) => {
    const barHeight = valueToHeight(item.value);
    const x = padding.left + (index * (chartWidth / data.length)) + barSpacing / 2;
    const y = padding.top + chartHeight - barHeight;
    
    const color = item.color || barColor;
    
    return (
      <G key={index}>
        {/* 바 */}
        <Rect
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={`url(#barGradient${index})`}
          rx={4}
          ry={4}
        />
        
        {/* 값 표시 */}
        {showValues && (
          <SvgText
            x={x + barWidth / 2}
            y={y - 8}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={colors.text.primary}
            fontFamily={typography.fontFamily.medium}
          >
            {item.value.toFixed(0)}
          </SvgText>
        )}
      </G>
    );
  });

  // X축 라벨들 생성
  const xAxisLabels = data.map((item, index) => {
    const x = padding.left + (index * (chartWidth / data.length)) + (chartWidth / data.length) / 2;
    const y = height - padding.bottom + 20;
    
    return (
      <G key={index}>
        {/* 메인 라벨 */}
        <SvgText
          x={x}
          y={y}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill={colors.text.primary}
          fontFamily={typography.fontFamily.medium}
          transform={xLabelRotation ? `rotate(${xLabelRotation}, ${x}, ${y})` : undefined}
        >
          {item.label}
        </SvgText>
        
        {/* 서브 라벨 */}
        {item.subLabel && (
          <SvgText
            x={x}
            y={y + 15}
            textAnchor="middle"
            fontSize="10"
            fill={colors.text.secondary}
            fontFamily={typography.fontFamily.regular}
            transform={xLabelRotation ? `rotate(${xLabelRotation}, ${x}, ${y + 15})` : undefined}
          >
            {item.subLabel}
          </SvgText>
        )}
      </G>
    );
  });

  // 인터랙티브 바 터치 영역
  const interactiveBars = interactive ? data.map((item, index) => {
    const x = padding.left + (index * (chartWidth / data.length)) + barSpacing / 2;
    const barHeight = valueToHeight(item.value);
    
    return (
      <TouchableOpacity
        key={index}
        style={{
          position: 'absolute',
          left: x,
          top: padding.top + chartHeight - barHeight,
          width: barWidth,
          height: barHeight,
          backgroundColor: 'transparent',
        }}
        onPress={() => onBarPress?.(item, index)}
        activeOpacity={0.7}
        testID={`${testID}-bar-${index}`}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${item.label}: ${item.value}`}
      />
    );
  }) : [];

  // 애니메이션 스타일
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
      transform: [{ scaleY: scaleValue.value }],
    };
  });

  // 각 바에 대한 애니메이션 스타일
  const getBarAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const delay = (index * 100); // 순차적 애니메이션
      const progress = interpolate(
        animationProgress.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP
      );
      
      return {
        opacity: withDelay(delay, withTiming(progress, { duration: 300 })),
        transform: [
          { 
            scaleY: withDelay(delay, withTiming(progress, { duration: 500 }))
          }
        ],
      };
    });
  };

  // 접근성 설정
  const getAccessibilityProps = () => {
    const dataDescription = data.map(item => 
      `${item.label}: ${item.value}`
    ).join(', ');
    
    return {
      accessible: true,
      accessibilityLabel: accessibilityLabel || `막대 차트. ${dataDescription}`,
      accessibilityRole: 'image' as const,
    };
  };

  return (
    <View 
      style={[{ alignItems: 'center' }, containerStyle]}
      testID={testID}
      {...getAccessibilityProps()}
    >
      <Animated.View style={animatedContainerStyle}>
        <Svg width={width} height={height}>
          {/* 그라디언트 정의 */}
          <Defs>
            {data.map((item, index) => {
              const color = item.color || barColor;
              return (
                <LinearGradient
                  key={index}
                  id={`barGradient${index}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor={color} stopOpacity={1} />
                  <Stop offset="100%" stopColor={color} stopOpacity={0.7} />
                </LinearGradient>
              );
            })}
          </Defs>
          
          {/* Y축 그리드와 라벨 */}
          {yAxisElements}
          
          {/* X축 라인 */}
          <Line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke={colors.text.tertiary}
            strokeWidth={1}
          />
          
          {/* Y축 라인 */}
          <Line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke={colors.text.tertiary}
            strokeWidth={1}
          />
          
          {/* 바 요소들 */}
          {barElements}
          
          {/* X축 라벨들 */}
          {xAxisLabels}
        </Svg>
      </Animated.View>
      
      {/* 인터랙티브 터치 영역 */}
      {interactive && (
        <View style={{ position: 'absolute', width, height }}>
          {interactiveBars}
        </View>
      )}
    </View>
  );
};

export default BarChart;