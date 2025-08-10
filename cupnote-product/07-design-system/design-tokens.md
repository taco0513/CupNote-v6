# CupNote 디자인 토큰 시스템

## 디자인 철학
**"Minimal Structure + Premium Visual Quality"**
- 구조적 미니멀리즘과 시각적 풍부함의 균형
- 커피의 따뜻함과 디지털의 정교함 결합

## 컬러 시스템

### 브랜드 컬러
```css
/* Primary - Coffee Brown */
--color-coffee-50: #FAF5F0;
--color-coffee-100: #F5E6D3;
--color-coffee-200: #E6C9A8;
--color-coffee-300: #D4A574;
--color-coffee-400: #BC7F3F;
--color-coffee-500: #8B5A2B; /* Main */
--color-coffee-600: #704722;
--color-coffee-700: #5A3A1C;
--color-coffee-800: #3D2817;
--color-coffee-900: #2D1810;

/* Accent - Amber */
--color-amber-50: #FFFBEB;
--color-amber-100: #FEF3C7;
--color-amber-200: #FDE68A;
--color-amber-300: #FCD34D;
--color-amber-400: #FBBF24;
--color-amber-500: #F59E0B;
--color-amber-600: #D97706;
```

### 시맨틱 컬러
```css
/* Status Colors */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;

/* Text Colors */
--color-text-primary: #1F2937;
--color-text-secondary: #6B7280;
--color-text-muted: #9CA3AF;
--color-text-inverse: #FFFFFF;

/* Background Colors */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F9FAFB;
--color-bg-tertiary: #F3F4F6;
--color-bg-inverse: #111827;
```

### 그라데이션
```css
/* Premium Gradients */
--gradient-coffee: linear-gradient(135deg, #BC7F3F 0%, #8B5A2B 100%);
--gradient-sunrise: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
--gradient-premium: linear-gradient(135deg, #F59E0B 0%, #8B5A2B 100%);
--gradient-soft: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%);
```

## 타이포그래피

### 폰트 패밀리
```css
--font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
```

### 폰트 크기
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 폰트 웨이트
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 줄 높이
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## 간격 시스템

### 기본 간격
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 레이아웃

### 컨테이너
```css
--container-xs: 320px;
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

### 브레이크포인트
```css
--breakpoint-mobile: 320px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;
```

## 효과

### 그림자
```css
/* Elevation Shadows */
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 2px 4px rgba(0,0,0,0.06);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1);
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.15);

/* Colored Shadows */
--shadow-coffee: 0 4px 14px rgba(139,90,43,0.15);
--shadow-amber: 0 4px 14px rgba(245,158,11,0.15);
```

### 블러
```css
--blur-sm: 4px;
--blur-md: 8px;
--blur-lg: 16px;
--blur-xl: 24px;
```

### 투명도
```css
--opacity-0: 0;
--opacity-25: 0.25;
--opacity-50: 0.5;
--opacity-75: 0.75;
--opacity-90: 0.9;
--opacity-100: 1;
```

## 모서리 반경

```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

## 애니메이션

### 지속 시간
```css
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
```

### 이징 함수
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## 컴포넌트별 토큰

### 버튼
```css
/* Primary Button */
--btn-primary-bg: var(--gradient-coffee);
--btn-primary-text: var(--color-text-inverse);
--btn-primary-shadow: var(--shadow-md);

/* Secondary Button */
--btn-secondary-bg: var(--color-bg-secondary);
--btn-secondary-text: var(--color-coffee-600);
--btn-secondary-border: var(--color-coffee-200);
```

### 카드
```css
/* Card Variants */
--card-default-bg: rgba(255,255,255,0.8);
--card-default-border: var(--color-coffee-200);
--card-default-shadow: var(--shadow-sm);

--card-elevated-bg: rgba(255,255,255,0.9);
--card-elevated-shadow: var(--shadow-lg);
```

### 입력 필드
```css
--input-bg: var(--color-bg-primary);
--input-border: var(--color-coffee-200);
--input-focus-border: var(--color-coffee-400);
--input-focus-shadow: 0 0 0 3px rgba(139,90,43,0.1);
```

## 글래스모피즘
```css
/* Glass Effect */
--glass-bg: rgba(255,255,255,0.7);
--glass-blur: blur(10px);
--glass-border: rgba(255,255,255,0.3);
--glass-shadow: 0 8px 32px rgba(0,0,0,0.1);
```

## 다크모드 (향후)
```css
/* Dark Mode Variables */
[data-theme="dark"] {
  --color-bg-primary: #1F2937;
  --color-bg-secondary: #111827;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  /* ... */
}
```

## 적용 예시

### 프리미엄 카드
```css
.premium-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--space-6);
}
```

### 그라데이션 버튼
```css
.gradient-button {
  background: var(--gradient-coffee);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-coffee);
  transition: all var(--duration-normal) var(--ease-out);
}
```