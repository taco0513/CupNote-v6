/**
 * App Navigator for CupNote v6
 * 
 * 앱의 루트 네비게이터
 * - Foundation Team의 authStore와 완벽하게 연동된 인증 상태 기반 라우팅
 * - Auth Navigator, Main Tab Navigator, TastingFlow Modal 통합
 * - Deep Link 지원
 * - Onboarding 플로우
 * - Korean UX 최적화
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform, Linking, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Foundation Team Store 연동  
import { useAuthStore } from '../../../worktree-foundation/src/store';

// Navigation Components
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { TastingFlowNavigator } from './TastingFlowNavigator';

// Types
import { RootStackParamList } from './types';

// Placeholder Screens
import { OnboardingScreen } from '../screens/onboarding/index';
import { LoadingScreen } from '../screens/loading/index';

// Navigation Hooks
import { useDeepLinkParams } from './hooks/useRoute';

const Stack = createNativeStackNavigator<RootStackParamList>();

// =====================================
// Theme Configuration
// =====================================

const CupNoteTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#8B4513', // CupNote 브랜드 컬러 (커피 브라운)
    background: '#ffffff',
    card: '#ffffff',
    text: '#333333',
    border: '#e1e5e9',
    notification: '#ff6b6b',
  },
};

const CupNoteDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#D2B48C', // 밝은 브라운
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    border: '#444444',
    notification: '#ff6b6b',
  },
};

// =====================================
// Deep Link Configuration
// =====================================

const linking = {
  prefixes: ['cupnote://', 'https://cupnote.com', 'http://cupnote.com'],
  config: {
    screens: {
      // Auth 플로우
      Auth: {
        screens: {
          Login: 'login',
          SignUp: 'signup',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
        },
      },
      
      // Onboarding
      Onboarding: 'onboarding',
      
      // Main App
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
              RecordDetail: 'home/record/:recordId',
              CommunityMatch: 'home/community/:recordId',
              Statistics: 'home/statistics',
            },
          },
          RecordsTab: {
            screens: {
              Records: 'records',
              RecordDetail: 'records/detail/:recordId',
              EditRecord: 'records/edit/:recordId',
              RecordFilter: 'records/filter',
              RecordSearch: 'records/search',
            },
          },
          AchievementsTab: {
            screens: {
              Achievements: 'achievements',
              AchievementDetail: 'achievements/:achievementId',
              LeaderBoard: 'achievements/leaderboard',
            },
          },
          ProfileTab: {
            screens: {
              Profile: 'profile',
              EditProfile: 'profile/edit',
              Settings: 'profile/settings',
              About: 'profile/about',
              Terms: 'profile/terms',
              Privacy: 'profile/privacy',
              DataExport: 'profile/data-export',
            },
          },
        },
      },
      
      // TastingFlow Modal
      TastingFlow: {
        path: 'tasting-flow/:mode?',
        parse: {
          mode: (mode: string) => mode as 'cafe' | 'homecafe' | undefined,
        },
      },
      
      // Direct Modals
      RecordDetail: 'record/:recordId',
      Achievement: 'achievement/:achievementId',
      Settings: 'settings',
      EditProfile: 'edit-profile',
    },
  },
};

// =====================================
// App State Management
// =====================================

interface AppState {
  isLoading: boolean;
  isReady: boolean;
  showOnboarding: boolean;
  theme: 'light' | 'dark' | 'auto';
  deepLinkUrl: string | null;
}

const initialAppState: AppState = {
  isLoading: true,
  isReady: false,
  showOnboarding: false,
  theme: 'light',
  deepLinkUrl: null,
};

// =====================================
// App Navigator Component
// =====================================

export function AppNavigator() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const authStore = useAuthStore();
  
  // =====================================
  // Initialization Effect
  // =====================================
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppState(prev => ({ ...prev, isLoading: true }));
        
        // 인증 상태 확인
        await authStore.initialize();
        
        // 온보딩 상태 확인
        const hasCompletedOnboarding = authStore.user?.hasCompletedOnboarding ?? false;
        
        // Deep Link 처리
        const initialUrl = await Linking.getInitialURL();
        
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isReady: true,
          showOnboarding: authStore.isAuthenticated && !hasCompletedOnboarding,
          deepLinkUrl: initialUrl,
        }));
        
      } catch (error) {
        console.error('App initialization error:', error);
        setAppState(prev => ({ 
          ...prev, 
          isLoading: false,
          isReady: true 
        }));
      }
    };
    
    initializeApp();
  }, []);
  
  // =====================================
  // Deep Link Handling
  // =====================================
  
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      // 인증이 필요한 링크 체크
      if (url.includes('/record/') || url.includes('/achievements/') || url.includes('/tasting-flow')) {
        if (!authStore.isAuthenticated) {
          Alert.alert(
            '로그인 필요',
            '이 링크에 접근하려면 로그인이 필요합니다.',
            [
              { text: '취소', style: 'cancel' },
              { text: '로그인', onPress: () => {
                // 로그인 후 원래 URL로 이동하도록 저장
                setAppState(prev => ({ ...prev, deepLinkUrl: url }));
              }}
            ]
          );
          return;
        }
      }
      
      setAppState(prev => ({ ...prev, deepLinkUrl: url }));
    };
    
    // Deep Link 리스너 등록
    const linkingListener = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });
    
    return () => {
      linkingListener.remove();
    };
  }, [authStore.isAuthenticated]);
  
  // =====================================
  // Theme Selection
  // =====================================
  
  const getTheme = () => {
    switch (appState.theme) {
      case 'dark':
        return CupNoteDarkTheme;
      case 'light':
        return CupNoteTheme;
      case 'auto':
        // TODO: 시스템 테마 감지
        return CupNoteTheme;
      default:
        return CupNoteTheme;
    }
  };
  
  // =====================================
  // Navigation State Handler
  // =====================================
  
  const handleNavigationStateChange = (state: any) => {
    // 네비게이션 상태 변경 로깅 (분석용)
    const currentRouteName = getCurrentRouteName(state);
    console.log('Navigation changed to:', currentRouteName);
    
    // TODO: Analytics 이벤트 발송
  };
  
  const getCurrentRouteName = (state: any): string | undefined => {
    if (!state) return undefined;
    
    const route = state.routes[state.index];
    
    if (route.state) {
      return getCurrentRouteName(route.state);
    }
    
    return route.name;
  };
  
  // =====================================
  // Error Boundary Handler
  // =====================================
  
  const handleNavigationError = (error: any) => {
    console.error('Navigation error:', error);
    
    Alert.alert(
      '페이지 이동 오류',
      '요청한 페이지로 이동할 수 없습니다.',
      [{ text: '확인' }]
    );
  };
  
  // =====================================
  // Render Logic
  // =====================================
  
  if (!appState.isReady) {
    return <LoadingScreen />;
  }
  
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={appState.theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={getTheme().colors.background}
      />
      
      <NavigationContainer
        theme={getTheme()}
        linking={linking}
        onStateChange={handleNavigationStateChange}
        onUnhandledAction={handleNavigationError}
        fallback={<LoadingScreen />}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}
        >
          {/* 초기 로딩 중 */}
          {appState.isLoading ? (
            <Stack.Screen
              name="Loading"
              component={LoadingScreen}
              options={{ gestureEnabled: false }}
            />
          ) : authStore.isAuthenticated ? (
            // 인증된 사용자 플로우
            <>
              {/* 온보딩 체크 */}
              {appState.showOnboarding ? (
                <Stack.Screen
                  name="Onboarding"
                  component={OnboardingScreen}
                  options={{ gestureEnabled: false }}
                />
              ) : (
                <>
                  {/* 메인 앱 */}
                  <Stack.Screen
                    name="Main"
                    component={MainTabNavigator}
                  />
                  
                  {/* TastingFlow Modal */}
                  <Stack.Screen
                    name="TastingFlow"
                    component={TastingFlowNavigator}
                    options={{
                      presentation: 'fullScreenModal',
                      gestureEnabled: false,
                    }}
                  />
                  
                  {/* 기타 Modal 화면들은 MainTabNavigator 내부에서 처리 */}
                </>
              )}
            </>
          ) : (
            // 비인증 사용자 - Auth 플로우
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{ gestureEnabled: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// =====================================
// App Navigator HOC with Error Boundary
// =====================================

/**
 * Error Boundary를 포함한 App Navigator 래퍼
 */
export function AppNavigatorWithErrorBoundary() {
  return (
    <AppNavigatorErrorBoundary>
      <AppNavigator />
    </AppNavigatorErrorBoundary>
  );
}

// =====================================
// Error Boundary Component
// =====================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppNavigatorErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Navigation Error Boundary caught an error:', error, errorInfo);
    
    // TODO: Error reporting service에 전송
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <LoadingScreen 
            error={this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
            onRetry={() => {
              this.setState({ hasError: false, error: null });
            }}
          />
        </SafeAreaProvider>
      );
    }
    
    return this.props.children;
  }
}

// =====================================
// App Navigator Utils
// =====================================

/**
 * App Navigator 유틸리티 함수들
 */
export const AppNavigatorUtils = {
  // 인증 상태에 따른 초기 라우트 결정
  getInitialRoute: (
    isAuthenticated: boolean, 
    hasCompletedOnboarding: boolean
  ): keyof RootStackParamList => {
    if (!isAuthenticated) {
      return 'Auth';
    }
    
    if (!hasCompletedOnboarding) {
      return 'Onboarding';
    }
    
    return 'Main';
  },
  
  // Deep Link URL 파싱
  parseDeepLink: (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      
      return {
        scheme: urlObj.protocol.replace(':', ''),
        host: urlObj.host,
        path: pathSegments,
        params: Object.fromEntries(urlObj.searchParams.entries()),
      };
    } catch {
      return null;
    }
  },
  
  // 네비게이션 스택 리셋 (앱 초기화 시 사용)
  resetNavigationStack: (routeName: keyof RootStackParamList) => {
    // NavigationContainer ref를 통해 사용
    return {
      index: 0,
      routes: [{ name: routeName }],
    };
  },
  
  // 에러 처리
  handleNavigationError: (error: any) => {
    console.error('Navigation error:', error);
    
    const errorMessage = error.message || '페이지 이동 중 오류가 발생했습니다.';
    
    Alert.alert(
      '오류',
      errorMessage,
      [{ text: '확인' }]
    );
  }
};

// Default export
export default AppNavigator;