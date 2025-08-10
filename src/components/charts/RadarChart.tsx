import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Line,
  Polygon,
  G,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { colors, typography } from '../../styles/theme';

export interface RadarChartData {
  [key: string]: number;
}

export interface RadarChartLabels {
  [key: string]: string;
}

export interface RadarChartProps {
  /** 차트 데이터 */
  data: RadarChartData;
  
  /** 라벨 매핑 */
  labels: RadarChartLabels;
  
  /** 차트 크기 */
  size: number;
  
  /** 최댓값 */
  maxValue: number;
  
  /** 선 굵기 */
  strokeWidth?: number;
  
  /** 그리드 색상 */
  gridColor?: string;
  
  /** 데이터 색상 */
  dataColor?: string;
  
  /** 데이터 불투명도 */
  dataOpacity?: number;
  
  /** 이상적인 데이터 (가이드라인) */
  idealData?: RadarChartData;
  
  /** 이상적인 데이터 색상 */
  idealColor?: string;
  
  /** 애니메이션 활성화 */
  animated?: boolean;
  
  /** 애니메이션 지연 시간 */
  animationDelay?: number;
  
  /** 애니메이션 지속 시간 */
  animationDuration?: number;
  
  /** 인터랙티브 모드 */
  interactive?: boolean;
  
  /** 값 표시 여부 */
  showValues?: boolean;
  
  /** 범례 표시 여부 */
  showLegend?: boolean;
  
  /** 점 표시 여부 */
  showPoints?: boolean;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
}

/**
 * CupNote v6 Enhanced RadarChart 컴포넌트
 * 
 * Features:
 * - React Native Reanimated 기반 부드러운 애니메이션
 * - 맛 프로필 전용 최적화
 * - 이상적인 밸런스 가이드라인 표시
 * - 한국어 라벨 지원
 * - 접근성 지원
 * - 커피 테마 컬러
 * - 반응형 디자인
 */
export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  labels,
  size,
  maxValue,
  strokeWidth = 2,
  gridColor = colors.gray[200],
  dataColor = colors.primary,
  dataOpacity = 0.3,
  idealData,
  idealColor = colors.success,
  animated = true,
  animationDelay = 0,
  animationDuration = 1200,
  interactive = false,
  showValues = true,
  showLegend = true,
  showPoints = true,
  containerStyle,
  testID,
  accessibilityLabel,
}) => {
  const center = size / 2;
  const radius = (size / 2) - 80; // 라벨 공간 확보
  const keys = Object.keys(data);
  const angleStep = (2 * Math.PI) / keys.length;
  
  // 애니메이션 값
  const animationProgress = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);

  // 애니메이션 시작
  React.useEffect(() => {
    if (animated) {
      animationProgress.value = withDelay(
        animationDelay,
        withTiming(1, { duration: animationDuration })
      );
      
      scaleValue.value = withSequence(
        withTiming(1.1, { duration: animationDuration / 3 }),
        withTiming(1, { duration: animationDuration / 3 })
      );
    } else {
      animationProgress.value = 1;
      scaleValue.value = 1;
    }
  }, [animated, animationDelay, animationDuration]);

  // 점 좌표 계산 함수
  const getPointCoordinates = (value: number, angle: number) => {
    const scaledValue = (value / maxValue) * radius;
    const x = center + Math.cos(angle - Math.PI / 2) * scaledValue;
    const y = center + Math.sin(angle - Math.PI / 2) * scaledValue;
    return { x, y };
  };

  // 라벨 좌표 계산 함수
  const getLabelCoordinates = (angle: number) => {
    const labelRadius = radius + 40;
    const x = center + Math.cos(angle - Math.PI / 2) * labelRadius;
    const y = center + Math.sin(angle - Math.PI / 2) * labelRadius;
    return { x, y };
  };

  // 데이터 포인트들 계산
  const dataPoints = keys.map((key, index) => {
    const angle = angleStep * index;
    const value = data[key];
    return getPointCoordinates(value, angle);
  });

  // 이상적인 밸런스 포인트들 계산
  const idealPoints = idealData ? keys.map((key, index) => {
    const angle = angleStep * index;
    const value = idealData[key] || maxValue * 0.7;
    return getPointCoordinates(value, angle);
  }) : null;

  // 폴리곤 포인트 문자열 생성
  const polygonPoints = dataPoints.map(point => `${point.x},${point.y}`).join(' ');
  const idealPolygonPoints = idealPoints 
    ? idealPoints.map(point => `${point.x},${point.y}`).join(' ')
    : '';

  // 그리드 원들 생성
  const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => (
    <Circle
      key={ratio}
      cx={center}
      cy={center}
      r={radius * ratio}
      fill="none"
      stroke={gridColor}
      strokeWidth={1}
      opacity={0.6}
    />
  ));

  // 축 선들 생성
  const axisLines = keys.map((key, index) => {
    const angle = angleStep * index;
    const endPoint = getLabelCoordinates(angle);
    
    return (
      <Line
        key={key}
        x1={center}
        y1={center}
        x2={endPoint.x - (endPoint.x - center) * 0.12}
        y2={endPoint.y - (endPoint.y - center) * 0.12}
        stroke={gridColor}
        strokeWidth={1}
        opacity={0.8}
      />
    );
  });

  // 라벨들 생성
  const labelElements = keys.map((key, index) => {
    const angle = angleStep * index;
    const labelPos = getLabelCoordinates(angle);
    const labelText = labels[key] || key;
    const value = data[key];
    
    // 텍스트 앵커 계산 (위치에 따라 정렬 조정)
    const getTextAnchor = () => {
      if (labelPos.x < center - 20) return 'end';
      if (labelPos.x > center + 20) return 'start';
      return 'middle';
    };
    
    return (
      <G key={key}>
        {/* 라벨 텍스트 */}
        <SvgText
          x={labelPos.x}
          y={labelPos.y - 5}
          textAnchor={getTextAnchor()}
          fontSize="14"
          fontWeight="600"
          fill={colors.text.primary}
          fontFamily={typography.fontFamily.medium}
        >
          {labelText}
        </SvgText>
        
        {/* 값 표시 */}
        {showValues && (
          <SvgText
            x={labelPos.x}
            y={labelPos.y + 12}
            textAnchor={getTextAnchor()}
            fontSize="12"
            fill={colors.text.secondary}
            fontFamily={typography.fontFamily.regular}
          >
            {value.toFixed(1)}
          </SvgText>
        )}
      </G>
    );
  });

  // 애니메이션 스타일
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
      transform: [{ scale: scaleValue.value }],
    };
  });

  // 범례 스타일
  const getLegendContainerStyle = (): ViewStyle => ({
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16[4],
    paddingHorizontal: 16[4],
  });

  const getLegendItemStyle = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16[3],
  });

  const getLegendIndicatorStyle = (color: string): ViewStyle => ({
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: color,
    marginRight: 16[2],
  });

  const getLegendTextStyle = (): TextStyle => ({
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
  });

  // 접근성 설정
  const getAccessibilityProps = () => {
    const dataDescription = keys.map(key => 
      `${labels[key] || key}: ${data[key].toFixed(1)}`
    ).join(', ');
    
    return {
      accessible: true,
      accessibilityLabel: accessibilityLabel || `맛 프로필 차트. ${dataDescription}`,
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
        <Svg height={size} width={size}>
          {/* 그라디언트 정의 */}
          <Defs>
            <RadialGradient id="dataGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={dataColor} stopOpacity={dataOpacity * 1.5} />
              <Stop offset="100%" stopColor={dataColor} stopOpacity={dataOpacity * 0.5} />
            </RadialGradient>
            <RadialGradient id="idealGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={idealColor} stopOpacity={0.15} />
              <Stop offset="100%" stopColor={idealColor} stopOpacity={0.05} />
            </RadialGradient>
          </Defs>
          
          {/* 그리드 원들 */}
          {gridCircles}
          
          {/* 축 선들 */}
          {axisLines}
          
          {/* 이상적인 밸런스 가이드라인 */}
          {idealPoints && idealPolygonPoints && (
            <Polygon
              points={idealPolygonPoints}
              fill="url(#idealGradient)"
              stroke={idealColor}
              strokeWidth={1.5}
              strokeDasharray="6,4"
              opacity={0.8}
            />
          )}
          
          {/* 실제 데이터 폴리곤 */}
          <Polygon
            points={polygonPoints}
            fill="url(#dataGradient)"
            stroke={dataColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          
          {/* 데이터 포인트들 */}
          {showPoints && dataPoints.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={dataColor}
              stroke={colors.white}
              strokeWidth="2"
            />
          ))}
          
          {/* 이상적인 데이터 포인트들 */}
          {showPoints && idealPoints && idealPoints.map((point, index) => (
            <Circle
              key={`ideal-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={idealColor}
              stroke={colors.white}
              strokeWidth="1"
            />
          ))}
          
          {/* 라벨들 */}
          {labelElements}
          
          {/* 중심점 */}
          <Circle
            cx={center}
            cy={center}
            r="3"
            fill={gridColor}
            opacity={0.8}
          />
        </Svg>
      </Animated.View>
      
      {/* 범례 */}
      {showLegend && (
        <View style={getLegendContainerStyle()}>
          <View style={getLegendItemStyle()}>
            <View style={getLegendIndicatorStyle(dataColor)} />
            <Text style={getLegendTextStyle()}>현재 평가</Text>
          </View>
          
          {idealData && (
            <View style={getLegendItemStyle()}>
              <View 
                style={[
                  getLegendIndicatorStyle(idealColor),
                  { 
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: idealColor,
                    borderStyle: 'dashed',
                  }
                ]}
              />
              <Text style={getLegendTextStyle()}>이상적 밸런스</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// 이상적인 밸런스 가이드라인 데이터 (SCA 기준)
export const IDEAL_TASTE_BALANCE = {
  acidity: 6.5,
  sweetness: 7.0,
  bitterness: 4.5,
  body: 6.0,
  aftertaste: 6.5,
  balance: 7.5,
  cleanness: 7.0,
} as const;

// 한국어 라벨 매핑
export const KOREAN_TASTE_LABELS = {
  acidity: '산미',
  sweetness: '단맛',
  bitterness: '쓴맛',
  body: '바디감',
  balance: '균형감',
  cleanness: '깔끔함',
  aftertaste: '여운',
} as const;

export default RadarChart;