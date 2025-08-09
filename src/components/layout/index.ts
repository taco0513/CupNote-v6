/**
 * CupNote v6 Layout Components
 * 
 * Korean UX 최적화 레이아웃 컴포넌트 라이브러리
 * - SafeArea 자동 지원
 * - iOS/Android 일관성 보장
 * - 접근성 AAA 등급 준수
 * - 커피 테마 통합
 */

export { Container, type ContainerProps } from './Container';
export { Card, type CardProps } from './Card';
export { Header, type HeaderProps, type HeaderAction } from './Header';
export { BottomSheet, type BottomSheetProps } from './BottomSheet';

// Layout component utilities
export const LayoutComponents = {
  Container,
  Card,
  Header,
  BottomSheet,
} as const;

export type LayoutComponentType = keyof typeof LayoutComponents;