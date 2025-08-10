/**
 * Main Tab Navigator for CupNote v6
 * 
 * 메인 앱의 Bottom Tab Navigation
 * - Home, Records, Achievements, Profile 탭
 * - 각 탭은 독립적인 Stack Navigator
 * - Korean UX 최적화 및 접근성 지원
 */

import React from 'react';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { Platform, View, Text } from 'react-native';

// Types
import { 
  MainTabParamList,
  HomeStackParamList,
  RecordsStackParamList,
  AchievementsStackParamList,
  ProfileStackParamList
} from './types';

// Foundation Team Store 연동  
import { useAuthStore } from '../store';

// Placeholder Screens (실제 스크린은 Screen Team이 구현)
import {
  // Home Stack Screens
  HomeScreen,
  HomeRecordDetailScreen,
  CommunityMatchScreen,
  StatisticsScreen,
  
  // Records Stack Screens  
  RecordsScreen,
  RecordsRecordDetailScreen,
  EditRecordScreen,
  RecordFilterScreen,
  RecordSearchScreen,
  
  // Achievements Stack Screens
  AchievementsScreen,
  AchievementDetailScreen,
  LeaderBoardScreen,
  
  // Profile Stack Screens
  ProfileScreen,
  EditProfileScreen,
  SettingsScreen,
  AboutScreen,
  TermsScreen,
  PrivacyScreen,
  DataExportScreen,
} from '../screens/main/index';

// =====================================
// Stack Navigators 생성
// =====================================

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const RecordsStack = createStackNavigator<RecordsStackParamList>();
const AchievementsStack = createStackNavigator<AchievementsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// =====================================
// Stack Navigator Options
// =====================================

const defaultStackScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: '#ffffff',
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerTintColor: '#8B4513', // CupNote 브랜드 컬러
  gestureEnabled: true,
  cardStyle: {
    backgroundColor: '#ffffff',
  },
};

// =====================================
// Individual Stack Navigators
// =====================================

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      screenOptions={defaultStackScreenOptions}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '홈',
          headerShown: false, // 홈 화면은 커스텀 헤더 사용
        }}
      />
      <HomeStack.Screen
        name="RecordDetail"
        component={HomeRecordDetailScreen}
        options={{
          title: '기록 상세',
        }}
      />
      <HomeStack.Screen
        name="CommunityMatch"
        component={CommunityMatchScreen}
        options={{
          title: '커뮤니티 매치',
        }}
      />
      <HomeStack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: '통계',
        }}
      />
    </HomeStack.Navigator>
  );
}

function RecordsStackNavigator() {
  return (
    <RecordsStack.Navigator
      initialRouteName="Records"
      screenOptions={defaultStackScreenOptions}
    >
      <RecordsStack.Screen
        name="Records"
        component={RecordsScreen}
        options={{
          title: '내 기록',
        }}
      />
      <RecordsStack.Screen
        name="RecordDetail"
        component={RecordsRecordDetailScreen}
        options={{
          title: '기록 상세',
        }}
      />
      <RecordsStack.Screen
        name="EditRecord"
        component={EditRecordScreen}
        options={{
          title: '기록 편집',
        }}
      />
      <RecordsStack.Screen
        name="RecordFilter"
        component={RecordFilterScreen}
        options={{
          title: '필터',
          presentation: 'modal',
        }}
      />
      <RecordsStack.Screen
        name="RecordSearch"
        component={RecordSearchScreen}
        options={{
          title: '검색',
        }}
      />
    </RecordsStack.Navigator>
  );
}

function AchievementsStackNavigator() {
  return (
    <AchievementsStack.Navigator
      initialRouteName="Achievements"
      screenOptions={defaultStackScreenOptions}
    >
      <AchievementsStack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          title: '업적',
        }}
      />
      <AchievementsStack.Screen
        name="AchievementDetail"
        component={AchievementDetailScreen}
        options={{
          title: '업적 상세',
        }}
      />
      <AchievementsStack.Screen
        name="LeaderBoard"
        component={LeaderBoardScreen}
        options={{
          title: '리더보드',
        }}
      />
    </AchievementsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      initialRouteName="Profile"
      screenOptions={defaultStackScreenOptions}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '프로필',
        }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: '프로필 편집',
        }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '설정',
        }}
      />
      <ProfileStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: '앱 정보',
        }}
      />
      <ProfileStack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          title: '이용약관',
        }}
      />
      <ProfileStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          title: '개인정보처리방침',
        }}
      />
      <ProfileStack.Screen
        name="DataExport"
        component={DataExportScreen}
        options={{
          title: '데이터 내보내기',
        }}
      />
    </ProfileStack.Navigator>
  );
}

// =====================================
// Tab Bar Icons & Components
// =====================================

// Placeholder 아이콘 컴포넌트 (실제로는 아이콘 라이브러리 사용)
const TabIcon = ({ 
  name, 
  focused, 
  size = 24 
}: { 
  name: string; 
  focused: boolean; 
  size?: number; 
}) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: focused ? '#8B4513' : '#999999',
      borderRadius: size / 2,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        fontSize: 12,
        color: '#ffffff',
        fontWeight: focused ? '600' : '400',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Text>
  </View>
);

// =====================================
// Tab Navigation Options
// =====================================

const defaultTabScreenOptions: BottomTabNavigationOptions = {
  tabBarActiveTintColor: '#8B4513', // CupNote 브랜드 컬러
  tabBarInactiveTintColor: '#999999',
  tabBarStyle: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    height: Platform.OS === 'ios' ? 85 : 65,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  headerShown: false, // Stack Navigator에서 헤더 관리
  
  // 접근성 설정
  tabBarAccessibilityLabel: undefined, // 각 탭에서 개별 설정
  tabBarTestID: undefined, // 각 탭에서 개별 설정
};

// =====================================
// Main Tab Navigator Component
// =====================================

export function MainTabNavigator() {
  const authStore = useAuthStore();
  
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={defaultTabScreenOptions}
    >
      {/* 홈 탭 */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: '홈',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="home" focused={focused} size={size} />
          ),
          tabBarAccessibilityLabel: '홈 탭',
          tabBarTestID: 'home-tab',
        }}
      />
      
      {/* 기록 탭 */}
      <Tab.Screen
        name="RecordsTab"
        component={RecordsStackNavigator}
        options={{
          title: '내 기록',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="record" focused={focused} size={size} />
          ),
          tabBarAccessibilityLabel: '내 기록 탭',
          tabBarTestID: 'records-tab',
          // 뱃지 표시 (새로운 기록이 있을 때)
          tabBarBadge: undefined, // 동적으로 설정 가능
        }}
      />
      
      {/* 업적 탭 */}
      <Tab.Screen
        name="AchievementsTab"
        component={AchievementsStackNavigator}
        options={{
          title: '업적',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="achievement" focused={focused} size={size} />
          ),
          tabBarAccessibilityLabel: '업적 탭',
          tabBarTestID: 'achievements-tab',
          // 새로운 업적 획득 시 뱃지 표시
          tabBarBadge: undefined, // 동적으로 설정 가능
        }}
      />
      
      {/* 프로필 탭 */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: '프로필',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="profile" focused={focused} size={size} />
          ),
          tabBarAccessibilityLabel: '프로필 탭',
          tabBarTestID: 'profile-tab',
        }}
      />
    </Tab.Navigator>
  );
}

// =====================================
// Tab Bar Utilities
// =====================================

/**
 * 탭 뱃지 관리를 위한 유틸리티
 */
export const TabBadgeUtils = {
  // 새로운 기록 수에 따른 뱃지 설정
  getRecordsBadge: (newRecordsCount: number) => {
    return newRecordsCount > 0 ? (newRecordsCount > 99 ? '99+' : newRecordsCount.toString()) : undefined;
  },
  
  // 새로운 업적 수에 따른 뱃지 설정  
  getAchievementsBadge: (newAchievementsCount: number) => {
    return newAchievementsCount > 0 ? (newAchievementsCount > 9 ? '9+' : newAchievementsCount.toString()) : undefined;
  },
  
  // 프로필 관련 알림 뱃지 (설정 업데이트, 새 기능 등)
  getProfileBadge: (hasNotifications: boolean) => {
    return hasNotifications ? '!' : undefined;
  }
};

// =====================================
// Tab Bar Animation Configuration
// =====================================

/**
 * 한국 사용자 선호도를 고려한 탭 바 애니메이션 설정
 */
export const TabBarAnimationConfig = {
  // 탭 전환 시 부드러운 애니메이션
  tabBarTransition: {
    duration: 200,
    useNativeDriver: true,
  },
  
  // 뱃지 애니메이션
  badgeAnimation: {
    type: 'spring',
    damping: 15,
    stiffness: 150,
  },
  
  // 아이콘 활성화 애니메이션
  iconAnimation: {
    scale: {
      active: 1.1,
      inactive: 1.0,
      duration: 150,
    },
    color: {
      active: '#8B4513',
      inactive: '#999999',
      duration: 200,
    }
  },
  
  // 한국어 텍스트 렌더링 최적화
  textRendering: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    letterSpacing: -0.2, // 한국어 최적화
  }
};

// =====================================
// Accessibility Configuration
// =====================================

/**
 * 한국어 접근성을 위한 설정
 */
export const AccessibilityConfig = {
  // Screen Reader 지원
  screenReader: {
    homeTab: '홈 탭. 메인 화면으로 이동합니다.',
    recordsTab: '내 기록 탭. 작성한 커피 기록을 확인할 수 있습니다.',
    achievementsTab: '업적 탭. 획득한 업적과 레벨을 확인할 수 있습니다.',
    profileTab: '프로필 탭. 사용자 정보와 설정을 관리할 수 있습니다.',
  },
  
  // 제스처 힌트
  gestureHints: {
    doubleTapToTop: '탭을 두 번 누르면 상단으로 이동합니다.',
    longPressOptions: '길게 누르면 추가 옵션을 볼 수 있습니다.',
  },
  
  // 음성 피드백
  voiceFeedback: {
    tabSwitched: (tabName: string) => `${tabName}으로 이동했습니다.`,
    badgeUpdate: (count: number) => `새로운 알림이 ${count}개 있습니다.`,
  }
};

// =====================================
// Deep Link Support
// =====================================

/**
 * 탭 내비게이터에서 Deep Link 처리
 */
export const TabDeepLinkConfig = {
  // 각 탭의 Deep Link 경로 매핑
  linking: {
    config: {
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
  },
};