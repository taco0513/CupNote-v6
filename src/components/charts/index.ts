/**
 * CupNote v6 Charts Components
 * 
 * Korean UX 최적화 차트 컴포넌트 라이브러리
 * - 맛 프로필 전용 RadarChart
 * - 사용자 통계용 BarChart
 * - React Native Reanimated 기반 애니메이션
 * - 접근성 AAA 등급 준수
 * - 커피 테마 통합
 */

export { 
  RadarChart, 
  IDEAL_TASTE_BALANCE,
  KOREAN_TASTE_LABELS,
  type RadarChartProps,
  type RadarChartData,
  type RadarChartLabels,
} from './RadarChart';

export { 
  BarChart,
  type BarChartProps,
  type BarChartDataItem,
} from './BarChart';

// Chart component utilities
export const ChartComponents = {
  RadarChart,
  BarChart,
} as const;

export type ChartComponentType = keyof typeof ChartComponents;

// Common chart utilities
export const ChartUtils = {
  // 맛 프로필 데이터 검증
  validateTasteData: (data: Record<string, number>): boolean => {
    return Object.values(data).every(value => 
      typeof value === 'number' && value >= 0 && value <= 10
    );
  },
  
  // 차트 데이터 정규화
  normalizeChartData: (data: Record<string, number>, maxValue: number = 10): Record<string, number> => {
    const normalized: Record<string, number> = {};
    Object.entries(data).forEach(([key, value]) => {
      normalized[key] = Math.min(Math.max(value, 0), maxValue);
    });
    return normalized;
  },
  
  // 색상 보간
  interpolateColor: (color1: string, color2: string, factor: number): string => {
    // 간단한 색상 보간 (실제 구현 시 더 정교한 로직 필요)
    return factor < 0.5 ? color1 : color2;
  },
} as const;