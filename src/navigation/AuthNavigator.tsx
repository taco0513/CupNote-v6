/**
 * Auth Navigator for CupNote v6
 * 
 * 인증 플로우를 위한 Stack Navigator
 * - Login, SignUp, ForgotPassword, ResetPassword 화면 관리
 * - Foundation Team의 authStore와 완전히 연동
 */

import React from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { Platform } from 'react-native';

// Types
import { AuthStackParamList } from './types';

// Placeholder Screens (실제 스크린은 Screen Team이 구현)
import { 
  LoginScreen, 
  SignUpScreen, 
  ForgotPasswordScreen, 
  ResetPasswordScreen 
} from '../screens/auth/index';

const Stack = createStackNavigator<AuthStackParamList>();

// =====================================
// Stack Navigator Options
// =====================================

const defaultScreenOptions: StackNavigationOptions = {
  // Korean UX 최적화
  headerShown: false, // Auth 화면들은 보통 커스텀 헤더 사용
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  
  // iOS 스타일 네비게이션
  ...Platform.select({
    ios: {
      cardStyleInterpolator: ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      }),
    },
    android: {
      cardStyleInterpolator: ({ current }) => ({
        cardStyle: {
          opacity: current.progress,
        },
      }),
    },
  }),
  
  // 성능 최적화
  cardStyle: {
    backgroundColor: '#ffffff', // 기본 배경색
  },
  
  // Animation 설정
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
      },
    },
  },
};

// =====================================
// Screen-specific Options
// =====================================

const loginScreenOptions: StackNavigationOptions = {
  ...defaultScreenOptions,
  title: '로그인',
  // 로그인 화면에서는 뒤로가기 비활성화
  gestureEnabled: false,
  headerLeft: () => null,
};

const signUpScreenOptions: StackNavigationOptions = {
  ...defaultScreenOptions,
  title: '회원가입',
  // 회원가입에서 로그인으로 돌아갈 수 있도록
  gestureEnabled: true,
};

const forgotPasswordScreenOptions: StackNavigationOptions = {
  ...defaultScreenOptions,
  title: '비밀번호 찾기',
  gestureEnabled: true,
};

const resetPasswordScreenOptions: StackNavigationOptions = {
  ...defaultScreenOptions,
  title: '비밀번호 재설정',
  gestureEnabled: false, // 토큰 기반이므로 뒤로가기 제한
};

// =====================================
// Auth Navigator Component
// =====================================

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={defaultScreenOptions}
    >
      {/* 로그인 화면 */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={loginScreenOptions}
      />
      
      {/* 회원가입 화면 */}
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={signUpScreenOptions}
      />
      
      {/* 비밀번호 찾기 화면 */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={forgotPasswordScreenOptions}
      />
      
      {/* 비밀번호 재설정 화면 */}
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={resetPasswordScreenOptions}
      />
    </Stack.Navigator>
  );
}

// =====================================
// Auth Navigator HOC (옵션)
// =====================================

/**
 * Auth Navigator를 감싸는 HOC
 * 추가적인 인증 로직이나 상태 관리가 필요한 경우 사용
 */
export function withAuthNavigator<P extends object>(Component: React.ComponentType<P>) {
  return function AuthNavigatorWrapper(props: P) {
    // 여기서 추가적인 인증 관련 로직 처리 가능
    // 예: 자동 로그인 체크, 토큰 검증 등
    
    return <Component {...props} />;
  };
}

// =====================================
// Auth Flow Utilities
// =====================================

/**
 * 인증 플로우 관련 유틸리티 함수들
 */
export const AuthFlowUtils = {
  // 로그인 후 리다이렉트 경로 결정
  getPostLoginRoute: (user: any, returnUrl?: string) => {
    if (returnUrl) {
      return returnUrl;
    }
    
    // 신규 사용자인 경우 온보딩으로
    if (user && !user.hasCompletedOnboarding) {
      return 'Onboarding';
    }
    
    // 기존 사용자는 메인 앱으로
    return 'Main';
  },
  
  // 회원가입 후 처리
  getPostSignUpRoute: (user: any) => {
    // 이메일 인증이 필요한 경우
    if (user && !user.emailVerified) {
      return 'EmailVerification'; // 추후 추가 가능
    }
    
    // 온보딩으로 이동
    return 'Onboarding';
  },
  
  // 에러 메시지 한국어 변환
  getKoreanErrorMessage: (error: string): string => {
    const errorMap: Record<string, string> = {
      'auth/user-not-found': '등록되지 않은 이메일입니다.',
      'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
      'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
      'auth/user-disabled': '비활성화된 계정입니다.',
      'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
      'auth/weak-password': '비밀번호가 너무 약합니다.',
      'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
      'auth/internal-error': '내부 오류가 발생했습니다.',
    };
    
    return errorMap[error] || '알 수 없는 오류가 발생했습니다.';
  },
  
  // 비밀번호 강도 검사
  validatePasswordStrength: (password: string) => {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    
    return {
      ...checks,
      strength, // 0-5
      isStrong: strength >= 4,
      message: strength < 2 ? '매우 약함' : 
               strength < 3 ? '약함' : 
               strength < 4 ? '보통' : 
               strength < 5 ? '강함' : '매우 강함'
    };
  },
  
  // 이메일 형식 검증
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // 한국 휴대폰 번호 검증
  validateKoreanPhone: (phone: string): boolean => {
    const phoneRegex = /^01[016789]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone);
  }
};

// =====================================
// Auth Screen Layout Configuration
// =====================================

/**
 * Auth 화면들의 공통 레이아웃 설정
 */
export const AuthScreenConfig = {
  // 공통 스타일링
  containerStyle: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  
  // 로고/브랜딩 영역
  headerStyle: {
    alignItems: 'center' as const,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // 입력 폼 영역
  formStyle: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  
  // 하단 액션 영역
  footerStyle: {
    paddingBottom: 40,
  },
  
  // 입력 필드 스타일
  inputStyle: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  
  // 버튼 스타일
  buttonStyle: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  
  // 주요 버튼 스타일 (로그인, 회원가입)
  primaryButtonStyle: {
    backgroundColor: '#8B4513', // CupNote 브랜드 컬러
  },
  
  // 보조 버튼 스타일
  secondaryButtonStyle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  
  // 텍스트 스타일
  textStyle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center' as const,
  },
  
  // 링크 텍스트 스타일
  linkStyle: {
    color: '#8B4513',
    fontWeight: '600' as const,
  },
  
  // 에러 텍스트 스타일
  errorStyle: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  
  // 성공 텍스트 스타일
  successStyle: {
    color: '#27ae60',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center' as const,
  }
};