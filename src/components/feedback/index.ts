/**
 * CupNote v6 Feedback Components
 * 
 * Korean UX 최적화 피드백 컴포넌트 라이브러리
 * - 다양한 상태 표시 컴포넌트
 * - 에러 처리 및 복구 메커니즘
 * - 접근성 AAA 등급 준수
 * - 커피 테마 통합
 */

export { 
  Toast, 
  type ToastProps, 
  type ToastType, 
  type ToastPosition 
} from './Toast';

export { 
  Loading, 
  type LoadingProps, 
  type LoadingSize, 
  type LoadingVariant 
} from './Loading';

export { 
  EmptyState, 
  EmptyRecords,
  EmptySearch,
  NetworkError,
  ServerError,
  type EmptyStateProps 
} from './EmptyState';

export { 
  ErrorBoundary, 
  type ErrorBoundaryProps 
} from './ErrorBoundary';

// Feedback component utilities
export const FeedbackComponents = {
  Toast,
  Loading,
  EmptyState,
  ErrorBoundary,
  // Preset components
  EmptyRecords,
  EmptySearch,
  NetworkError,
  ServerError,
} as const;

export type FeedbackComponentType = keyof typeof FeedbackComponents;