/**
 * CupNote v6 UI Component Library
 * 
 * Korean UX 최적화 React Native 컴포넌트 라이브러리
 * - iOS Human Interface Guidelines 준수
 * - 한국인 터치 패턴 최적화 (48px 최소 터치 타겟)
 * - 접근성 AAA 등급 준수 (WCAG 2.1)
 * - 커피 테마 컬러 팔레트
 * - React Native Reanimated 기반 애니메이션
 * - TypeScript 완전 지원
 */

// Form Components
export * from './form';

// Layout Components  
export * from './layout';

// Feedback Components
export * from './feedback';

// Charts Components
export * from './charts';

// TastingFlow Components
export * from './tastingflow';

// Component Categories
import { FormComponents } from './form';
import { LayoutComponents } from './layout';
import { FeedbackComponents } from './feedback';
import { ChartComponents } from './charts';
import { TastingFlowComponents } from './tastingflow';

// All Components Registry
export const UIComponents = {
  ...FormComponents,
  ...LayoutComponents,
  ...FeedbackComponents,
  ...ChartComponents,
  ...TastingFlowComponents,
} as const;

// Component Categories
export const ComponentCategories = {
  Form: FormComponents,
  Layout: LayoutComponents,
  Feedback: FeedbackComponents,
  Charts: ChartComponents,
  TastingFlow: TastingFlowComponents,
} as const;

// Type Exports
export type UIComponentType = keyof typeof UIComponents;
export type ComponentCategoryType = keyof typeof ComponentCategories;

// Component Library Info
export const ComponentLibraryInfo = {
  name: 'CupNote v6 UI Components',
  version: '6.0.0',
  description: 'Korean UX optimized React Native component library for coffee tasting',
  theme: 'coffee',
  accessibility: 'AAA',
  i18n: 'Korean',
  animation: 'React Native Reanimated',
  totalComponents: Object.keys(UIComponents).length,
  categories: Object.keys(ComponentCategories),
} as const;