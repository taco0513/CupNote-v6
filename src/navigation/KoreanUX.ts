/**
 * Korean UX Optimization for CupNote Navigation
 * 
 * 한국 사용자를 위한 UX 최적화 및 접근성 설정
 * - 한국어 네비게이션 패턴
 * - 제스처 최적화
 * - 접근성 지원
 * - 텍스트 렌더링 최적화
 */

import { Platform, I18nManager, AccessibilityInfo } from 'react-native';
import { StackNavigationOptions } from '@react-navigation/stack';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

// =====================================
// Korean Text Rendering Optimization
// =====================================

/**
 * 한국어 텍스트 렌더링 최적화 설정
 */
export const KoreanTextConfig = {
  // 한국어 폰트 설정
  fonts: {
    ios: {
      regular: 'SF Pro Text',
      medium: 'SF Pro Text Medium',
      bold: 'SF Pro Text Bold',
      // 한국어 전용 폰트 (필요시)
      korean: 'Apple SD Gothic Neo',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto Medium', 
      bold: 'Roboto Bold',
      // 한국어 전용 폰트
      korean: 'NotoSansCJK-Regular',
    }
  },
  
  // 한국어 텍스트 스타일 최적화
  textStyle: {
    // 한국어는 영어보다 높은 line-height가 필요
    lineHeight: 1.5,
    // 자간 조절 (한국어는 약간 더 좁게)
    letterSpacing: -0.2,
    // 문장 간격
    paragraphSpacing: 8,
  },
  
  // 길이에 따른 폰트 크기 조절
  getFontSize: (textLength: number, baseSize: number = 16): number => {
    // 한국어는 한 글자당 영어 2글자 정도의 시각적 공간 차지
    if (textLength > 20) return Math.max(baseSize - 2, 12);
    if (textLength > 15) return Math.max(baseSize - 1, 13);
    return baseSize;
  },
  
  // 한국어 텍스트 잘림 방지
  numberOfLines: (text: string, maxLines: number = 2): number => {
    const koreanCharCount = (text.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g) || []).length;
    const avgCharsPerLine = 15; // 한국어 평균 글자 수
    const estimatedLines = Math.ceil((koreanCharCount + (text.length - koreanCharCount) * 0.5) / avgCharsPerLine);
    return Math.min(estimatedLines, maxLines);
  }
};

// =====================================
// Korean Navigation Patterns
// =====================================

/**
 * 한국 사용자 친화적인 네비게이션 패턴
 */
export const KoreanNavigationPatterns = {
  // 헤더 설정
  header: {
    // 한국어 제목이 길 때 대응
    getTitleStyle: (title: string) => ({
      fontSize: KoreanTextConfig.getFontSize(title.length, 18),
      fontWeight: '600' as const,
      color: '#333333',
      // 한국어는 중앙 정렬이 더 자연스러움
      textAlign: 'center' as const,
      letterSpacing: KoreanTextConfig.textStyle.letterSpacing,
    }),
    
    // 뒤로가기 버튼 텍스트 (iOS)
    backTitle: '뒤로',
    backTitleStyle: {
      fontSize: 14,
      color: '#8B4513',
    },
    
    // 헤더 높이 (한국어 텍스트 고려)
    headerHeight: Platform.OS === 'ios' ? 94 : 70,
  },
  
  // 탭 바 설정
  tabBar: {
    // 탭 레이블 스타일
    labelStyle: {
      fontSize: 12,
      fontWeight: '500' as const,
      letterSpacing: -0.1,
      marginTop: 4,
      // 한국어는 약간 더 높은 line-height 필요
      lineHeight: 16,
    },
    
    // 탭 높이 (한국어 텍스트 고려)
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
  },
  
  // 모달 설정
  modal: {
    // 한국어 제목이 긴 경우를 고려한 헤더 높이
    headerHeight: 60,
    // 모달 닫기 버튼 텍스트
    closeButtonText: '닫기',
    // 완료 버튼 텍스트
    doneButtonText: '완료',
  }
};

// =====================================
// Gesture Optimization for Korean Users
// =====================================

/**
 * 한국 사용자를 위한 제스처 최적화
 */
export const KoreanGestureConfig = {
  // iOS 스타일 뒤로가기 제스처 (한국 사용자 선호)
  gestureSettings: {
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
    // 제스처 감도 조절 (한국 사용자는 약간 더 민감한 것을 선호)
    gestureResponseDistance: Platform.OS === 'ios' ? 25 : 35,
    // 제스처 완료 임계값
    gestureVelocityImpact: 0.3,
  },
  
  // 스와이프 제스처 설정
  swipeGestures: {
    // 탭 간 스와이프 (한국 앱에서 일반적)
    tabSwipeEnabled: true,
    swipeVelocityThreshold: 500,
    // 카드 스와이프
    cardSwipeEnabled: true,
  },
  
  // 터치 영역 최적화 (한국 사용자 손가락 크기 고려)
  touchTargets: {
    minimumSize: 44, // iOS 권장사항
    androidMinimumSize: 48, // Android 권장사항
    padding: 12,
    // 버튼 간 최소 간격
    buttonSpacing: 16,
  }
};

// =====================================
// Accessibility for Korean Users
// =====================================

/**
 * 한국어 접근성 지원
 */
export const KoreanAccessibilityConfig = {
  // Screen Reader 설정
  screenReader: {
    // VoiceOver/TalkBack 한국어 설정
    enabled: true,
    announceScreenChanges: true,
    
    // 한국어 Screen Reader 레이블
    labels: {
      navigation: {
        back: '뒤로 가기',
        close: '닫기',
        home: '홈으로 이동',
        menu: '메뉴 열기',
        search: '검색',
        settings: '설정',
      },
      tabs: {
        home: '홈 탭. 메인 화면으로 이동합니다.',
        records: '기록 탭. 커피 기록을 확인할 수 있습니다.',
        achievements: '업적 탭. 업적과 레벨을 확인할 수 있습니다.',
        profile: '프로필 탭. 사용자 정보를 관리할 수 있습니다.',
      },
      actions: {
        doubleTap: '두 번 탭하여 실행',
        longPress: '길게 눌러서 더 보기',
        swipeUp: '위로 쓸어서 더 보기',
        swipeDown: '아래로 쓸어서 이전으로',
      }
    },
    
    // 음성 안내 설정
    voiceGuidance: {
      navigationChange: (screenName: string) => `${screenName} 화면으로 이동했습니다.`,
      buttonPress: (buttonName: string) => `${buttonName} 버튼을 눌렀습니다.`,
      errorMessage: (error: string) => `오류: ${error}`,
      successMessage: (message: string) => `완료: ${message}`,
    }
  },
  
  // 색상 대비 (한국 웹 접근성 지침 준수)
  colorContrast: {
    // WCAG AA 준수 (4.5:1 이상)
    textBackground: 4.7,
    // 큰 텍스트 (3:1 이상)
    largeTextBackground: 3.2,
    // UI 구성요소 (3:1 이상)
    uiComponents: 3.1,
  },
  
  // 터치 영역 (한국 웹 접근성 지침)
  touchTargetSize: {
    minimum: 44,
    recommended: 48,
    // 인접 터치 영역 간 최소 간격
    spacing: 8,
  }
};

// =====================================
// Korean UX Stack Options
// =====================================

/**
 * 한국 UX에 최적화된 Stack Navigation 옵션
 */
export const getKoreanStackOptions = (title: string): StackNavigationOptions => ({
  headerShown: true,
  headerStyle: {
    backgroundColor: '#ffffff',
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: KoreanNavigationPatterns.header.headerHeight,
  },
  headerTitleStyle: KoreanNavigationPatterns.header.getTitleStyle(title),
  headerTintColor: '#8B4513',
  headerBackTitle: KoreanNavigationPatterns.header.backTitle,
  headerBackTitleStyle: KoreanNavigationPatterns.header.backTitleStyle,
  
  // 제스처 설정
  gestureEnabled: KoreanGestureConfig.gestureSettings.gestureEnabled,
  gestureDirection: KoreanGestureConfig.gestureSettings.gestureDirection,
  gestureResponseDistance: KoreanGestureConfig.gestureSettings.gestureResponseDistance,
  
  // 애니메이션 최적화 (한국 사용자 선호도)
  animationEnabled: true,
  animationTypeForReplace: 'push',
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300, // 약간 빠른 애니메이션
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
      },
    },
  },
  
  // 접근성
  headerAccessibilityLabel: `${title} 화면`,
  headerBackAccessibilityLabel: '이전 화면으로 돌아가기',
});

/**
 * 한국 UX에 최적화된 Tab Navigation 옵션
 */
export const getKoreanTabOptions = (title: string, accessibilityLabel: string): BottomTabNavigationOptions => ({
  title,
  tabBarActiveTintColor: '#8B4513',
  tabBarInactiveTintColor: '#999999',
  tabBarStyle: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: KoreanNavigationPatterns.tabBar.paddingBottom,
    paddingTop: KoreanNavigationPatterns.tabBar.paddingTop,
    height: KoreanNavigationPatterns.tabBar.height,
  },
  tabBarLabelStyle: KoreanNavigationPatterns.tabBar.labelStyle,
  
  // 접근성
  tabBarAccessibilityLabel: accessibilityLabel,
  tabBarAllowFontScaling: true, // 시스템 폰트 크기 설정 반영
  
  // 한국어 폰트 최적화
  tabBarLabelPosition: 'below-icon', // 한국어는 아이콘 아래가 더 읽기 좋음
});

// =====================================
// Korean Input Optimization
// =====================================

/**
 * 한국어 입력 최적화
 */
export const KoreanInputConfig = {
  // 키보드 설정
  keyboard: {
    // 한국어 키보드 타입
    keyboardType: 'default' as const,
    // 자동 완성 (한국어 IME 고려)
    autoComplete: 'off' as const,
    autoCorrect: false, // 한국어 자동 수정은 부정확할 수 있음
    spellCheck: false,
    
    // 키보드 회피 설정
    keyboardVerticalOffset: Platform.OS === 'ios' ? 64 : 0,
  },
  
  // 텍스트 입력 필드 설정
  textInput: {
    // 한국어 텍스트에 적합한 높이
    minHeight: 44,
    // 여러 줄 텍스트의 경우 더 많은 공간 필요
    multilineMinHeight: 88,
    // 패딩 (한국어 텍스트 렌더링 고려)
    paddingHorizontal: 16,
    paddingVertical: 12,
    
    // 폰트 설정
    fontSize: 16, // 한국어 가독성을 위한 최적 크기
    lineHeight: 22,
    
    // 테두리
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e1e5e9',
    
    // 포커스 상태
    focusBorderColor: '#8B4513',
    focusBorderWidth: 2,
  }
};

// =====================================
// Korean Haptic Feedback
// =====================================

/**
 * 한국 사용자를 위한 햅틱 피드백 설정
 */
export const KoreanHapticConfig = {
  // 햅틱 피드백 설정 (한국 사용자는 적당한 강도 선호)
  intensity: 'medium' as const,
  
  // 상황별 햅틱 패턴
  patterns: {
    // 네비게이션 이동 시
    navigation: {
      type: 'impactLight',
      enabled: true,
    },
    // 버튼 터치 시
    buttonPress: {
      type: 'impactLight',
      enabled: true,
    },
    // 에러 발생 시
    error: {
      type: 'notificationError',
      enabled: true,
    },
    // 성공 시
    success: {
      type: 'notificationSuccess',
      enabled: true,
    },
    // 중요한 액션 (삭제 등)
    warning: {
      type: 'impactHeavy',
      enabled: true,
    }
  }
};

// =====================================
// Korean Date/Time Format
// =====================================

/**
 * 한국어 날짜/시간 형식
 */
export const KoreanDateTimeConfig = {
  // 날짜 형식
  dateFormats: {
    short: 'YY.MM.DD',           // 23.03.15
    medium: 'YYYY.MM.DD',        // 2023.03.15
    long: 'YYYY년 M월 D일',        // 2023년 3월 15일
    full: 'YYYY년 M월 D일 (ddd)', // 2023년 3월 15일 (수)
  },
  
  // 시간 형식
  timeFormats: {
    short: 'HH:mm',              // 14:30
    medium: 'A h:mm',            // 오후 2:30
    long: 'A h시 mm분',           // 오후 2시 30분
  },
  
  // 상대적 시간 (소셜 미디어 스타일)
  relativeTime: {
    now: '방금',
    minutesAgo: (minutes: number) => `${minutes}분 전`,
    hoursAgo: (hours: number) => `${hours}시간 전`,
    daysAgo: (days: number) => `${days}일 전`,
    weeksAgo: (weeks: number) => `${weeks}주 전`,
    monthsAgo: (months: number) => `${months}개월 전`,
    yearsAgo: (years: number) => `${years}년 전`,
  }
};

// =====================================
// Export Korean UX Configuration
// =====================================

export default {
  text: KoreanTextConfig,
  navigation: KoreanNavigationPatterns,
  gesture: KoreanGestureConfig,
  accessibility: KoreanAccessibilityConfig,
  input: KoreanInputConfig,
  haptic: KoreanHapticConfig,
  dateTime: KoreanDateTimeConfig,
  getStackOptions: getKoreanStackOptions,
  getTabOptions: getKoreanTabOptions,
};