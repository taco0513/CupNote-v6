/**
 * CupNote v6 Form Components
 * 
 * Korean UX 최적화 폼 컴포넌트 라이브러리
 * - iOS Human Interface Guidelines 준수
 * - 한국인 터치 패턴 최적화
 * - 접근성 AAA 등급 지원
 * - 커피 테마 컬러 적용
 */

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { TextInput, type TextInputProps, type TextInputRef } from './TextInput';
export { Select, type SelectProps, type SelectOption } from './Select';
export { Slider, type SliderProps } from './Slider';
export { Switch, type SwitchProps } from './Switch';

// Form component utilities
export const FormComponents = {
  Button,
  TextInput,
  Select, 
  Slider,
  Switch,
} as const;

export type FormComponentType = keyof typeof FormComponents;