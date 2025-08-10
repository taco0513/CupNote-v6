/**
 * CupNote v6 - Main App
 * Korean UX optimized coffee recording app
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import TastingFlowNavigator from './src/screens/TastingFlow';
import HomeScreen from './src/screens/Home';
import AchievementScreen from './src/screens/Achievement';
import useStore from './src/store/useStore';
import { colors, spacing, borderRadius, shadows, typography } from './src/styles/theme';

// Auth imports
import { supabase } from './src/lib/supabase';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

// ========================================
// Type Definitions
// ========================================

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TastingFlow: undefined;
};

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type MainTabParamList = {
  Home: undefined;
  MyRecords: undefined;
  AddRecord: undefined;
  Achievement: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ========================================
// Helper Functions
// ========================================

// Format date in Korean format
const formatKoreanDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

// Generate random match score for demo purposes
const generateMatchScore = (): number => {
  return Math.floor(Math.random() * (95 - 70 + 1)) + 70;
};

// ========================================
// Components
// ========================================

// Record Card Component
interface RecordCardProps {
  record: any;
  onPress?: () => void;
}

function RecordCard({ record, onPress }: RecordCardProps) {
  const matchScore = generateMatchScore();
  const displayFlavors = record.flavors?.slice(0, 3) || [];
  
  return (
    <TouchableOpacity 
      style={cardStyles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {record.coffeeImage && (
        <Image 
          source={{ uri: record.coffeeImage }} 
          style={cardStyles.coffeeImage}
        />
      )}
      
      <View style={cardStyles.content}>
        <View style={cardStyles.header}>
          <Text style={cardStyles.coffeeName} numberOfLines={1}>
            {record.coffeeName}
          </Text>
          <Text style={cardStyles.matchScore}>
            매치 {matchScore}%
          </Text>
        </View>
        
        <View style={cardStyles.subtitle}>
          <Text style={cardStyles.roasteryName} numberOfLines={1}>
            {record.cafeName || record.roastery}
          </Text>
          <Text style={cardStyles.separator}> · </Text>
          <Text style={cardStyles.date}>
            {formatKoreanDate(record.createdAt)}
          </Text>
        </View>
        
        <View style={cardStyles.rating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              style={[
                cardStyles.star,
                star <= record.overallRating && cardStyles.starFilled
              ]}
            >
              ★
            </Text>
          ))}
          <Text style={cardStyles.ratingText}>{record.overallRating.toFixed(1)}</Text>
        </View>
        
        {displayFlavors.length > 0 && (
          <View style={cardStyles.flavors}>
            {displayFlavors.map((flavor: string, index: number) => (
              <View key={index} style={cardStyles.flavorChip}>
                <Text style={cardStyles.flavorText}>{flavor}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ========================================
// Screen Components
// ========================================

// My Records Screen
function MyRecordsScreen() {
  const { records } = useStore();
  const [viewMode, setViewMode] = React.useState<'카드뷰' | '통계'>('카드뷰');
  
  // Sample data for demonstration when no records exist
  const sampleRecords = React.useMemo(() => [
    {
      id: '1',
      mode: 'cafe' as const,
      coffeeName: '케냐 키아냐가',
      cafeName: '블루보틀 카페',
      roastery: '블루보틀',
      flavors: ['베리', '초콜릿', '견과류'],
      overallRating: 4.5,
      createdAt: new Date(2024, 0, 15),
      coffeeImage: null,
    },
    {
      id: '2',
      mode: 'homecafe' as const,
      coffeeName: '에티오피아 구지',
      roastery: '테라로사',
      flavors: ['플로랄', '시트러스', '허니'],
      overallRating: 4.0,
      createdAt: new Date(2024, 0, 12),
      coffeeImage: null,
    },
    {
      id: '3',
      mode: 'cafe' as const,
      coffeeName: '콜롬비아 핑크 버번',
      cafeName: '커피리브레',
      roastery: '커피리브레',
      flavors: ['카라멜', '바닐라', '오렌지'],
      overallRating: 3.8,
      createdAt: new Date(2024, 0, 10),
      coffeeImage: null,
    },
    {
      id: '4',
      mode: 'homecafe' as const,
      coffeeName: '과테말라 안티구아',
      roastery: '프리츠',
      flavors: ['다크초콜릿', '스모키', '스파이시'],
      overallRating: 4.2,
      createdAt: new Date(2024, 0, 8),
      coffeeImage: null,
    },
  ], []);
  
  // Use sample data if no real records exist, otherwise use store records
  const displayRecords = records.length > 0 ? records : sampleRecords;
  const recordCount = displayRecords.length;
  
  const handleRecordPress = (record: any) => {
    console.log('Record pressed:', record.coffeeName);
    // TODO: Navigate to record detail
  };
  
  const renderEmptyState = () => (
    <View style={[styles.emptyState, { paddingHorizontal: 24 }]}>
      <Text style={styles.emptyStateEmoji}>📝</Text>
      <Text style={styles.emptyStateText}>아직 기록된 커피가 없습니다</Text>
      <Text style={styles.emptyStateSubtext}>첫 번째 커피를 기록해보세요!</Text>
    </View>
  );
  
  const renderRecordCard = ({ item }: { item: any }) => (
    <RecordCard 
      record={item} 
      onPress={() => handleRecordPress(item)} 
    />
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={recordsStyles.screenContainer}>
        <View style={recordsStyles.headerContainer}>
          <Text style={styles.screenTitle}>☕ 내 기록</Text>
          <Text style={styles.screenSubtitle}>총 {recordCount}개의 커피 기록</Text>
        </View>
        
        {/* View Mode Toggle */}
        <View style={[recordsStyles.viewModeContainer, recordsStyles.toggleContainer]}>
          {(['카드뷰', '통계'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                recordsStyles.viewModeButton,
                viewMode === mode && recordsStyles.viewModeButtonActive
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[
                recordsStyles.viewModeText,
                viewMode === mode && recordsStyles.viewModeTextActive
              ]}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Records List */}
        {viewMode === '카드뷰' && (
          <>
            {recordCount === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={displayRecords}
                renderItem={renderRecordCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={recordsStyles.listContainer}
                ItemSeparatorComponent={() => <View style={recordsStyles.separator} />}
              />
            )}
          </>
        )}
        
        {/* Statistics View Placeholder */}
        {viewMode === '통계' && (
          <View style={[styles.emptyState, { paddingHorizontal: 24 }]}>
            <Text style={styles.emptyStateEmoji}>📊</Text>
            <Text style={styles.emptyStateText}>통계 기능 준비 중</Text>
            <Text style={styles.emptyStateSubtext}>곧 만나보실 수 있습니다!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}


// Profile Screen
function ProfileScreen() {
  const { user, records, stats } = useStore();
  const { logout } = useStore();
  
  // Calculate statistics from real data
  const recordCount = records.length;
  const badgeCount = Math.min(stats.totalAchievements, 15); // Mock badge count
  const averageMatchRate = recordCount > 0 ? Math.round(Math.random() * (95 - 75) + 75) : 0; // Mock match rate
  const averageRating = recordCount > 0 ? (stats.averageRating || 0) : 0;
  
  // Calculate user title based on record count
  const getUserTitle = (count: number): string => {
    if (count >= 100) return 'Coffee Master';
    if (count >= 61) return 'Coffee Expert';
    if (count >= 31) return 'Coffee Enthusiast';
    if (count >= 11) return 'Coffee Explorer';
    if (count >= 1) return 'Coffee Beginner';
    return '커피 입문자';
  };
  
  // Calculate preferred flavors from records
  const getPreferredFlavors = (): string[] => {
    if (records.length === 0) return ['진단 중'];
    
    const flavorCounts: { [key: string]: number } = {};
    records.forEach(record => {
      record.flavors?.forEach(flavor => {
        flavorCounts[flavor] = (flavorCounts[flavor] || 0) + 1;
      });
    });
    
    return Object.entries(flavorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([flavor]) => flavor);
  };
  
  // Calculate preferred roasting level
  const getPreferredRoasting = (): string => {
    if (records.length === 0) return '분석 중';
    // Mock logic - in real app would analyze roasting data
    const roastingTypes = ['라이트', '미디움', '다크'];
    return roastingTypes[Math.floor(Math.random() * roastingTypes.length)];
  };
  
  // Calculate main activity area
  const getMainActivityArea = (): string => {
    if (records.length === 0) return '설정 필요';
    // Mock logic - in real app would use GPS data
    const areas = ['성수동', '홍대', '강남', '이태원', '연남동'];
    return areas[Math.floor(Math.random() * areas.length)];
  };
  
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };
  
  const handleMenuPress = (menuItem: string) => {
    switch (menuItem) {
      case '업적 & 뱃지':
        // Navigate to Achievement tab - handled by parent navigator
        console.log('Navigate to Achievement tab');
        break;
      case '알림 설정':
        console.log('Navigate to notification settings');
        break;
      case '계정 설정':
        console.log('Navigate to account settings');
        break;
      case '도움말':
        console.log('Navigate to help');
        break;
      case '약관 및 정책':
        console.log('Navigate to terms and policy');
        break;
      default:
        console.log('Menu item pressed:', menuItem);
    }
  };
  
  const preferredFlavors = getPreferredFlavors();
  const preferredRoasting = getPreferredRoasting();
  const mainActivityArea = getMainActivityArea();
  const userTitle = getUserTitle(recordCount);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Enhanced Profile Header with Gradient-like Background */}
        <View style={profileStyles.headerContainer}>
          <View style={profileStyles.profileHeader}>
            <TouchableOpacity style={profileStyles.profileAvatar}>
              <Text style={profileStyles.profileAvatarText}>☕</Text>
            </TouchableOpacity>
            
            <Text style={profileStyles.profileName}>
              {user?.username || '커피 애호가'}
            </Text>
            
            <Text style={profileStyles.profileUsername}>
              @{user?.username || 'username'}
            </Text>
            
            <Text style={profileStyles.profileTitle}>
              {userTitle}
            </Text>
          </View>
        </View>
        
        {/* Enhanced Statistics Bar */}
        <View style={profileStyles.statsContainer}>
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.statValue}>{recordCount}</Text>
            <Text style={profileStyles.statLabel}>기록</Text>
          </View>
          <View style={profileStyles.statDivider} />
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.statValue}>{badgeCount}</Text>
            <Text style={profileStyles.statLabel}>뱃지</Text>
          </View>
          <View style={profileStyles.statDivider} />
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.statValue}>{averageMatchRate}%</Text>
            <Text style={profileStyles.statLabel}>매치율</Text>
          </View>
        </View>
        
        {/* 나의 테이스팅 스타일 Section */}
        <View style={profileStyles.tastingStyleContainer}>
          <Text style={profileStyles.sectionTitle}>나의 테이스팅 스타일</Text>
          
          <View style={profileStyles.styleCard}>
            <View style={profileStyles.styleRow}>
              <Text style={profileStyles.styleLabel}>선호 플레이버</Text>
              <Text style={profileStyles.styleValue}>
                {preferredFlavors.join(', ')}
              </Text>
            </View>
            
            <View style={profileStyles.styleRow}>
              <Text style={profileStyles.styleLabel}>선호 로스팅</Text>
              <Text style={profileStyles.styleValue}>{preferredRoasting}</Text>
            </View>
            
            <View style={profileStyles.styleRow}>
              <Text style={profileStyles.styleLabel}>주 활동 지역</Text>
              <Text style={profileStyles.styleValue}>{mainActivityArea}</Text>
            </View>
            
            <View style={[profileStyles.styleRow, { borderBottomWidth: 0 }]}>
              <Text style={profileStyles.styleLabel}>평균 평점</Text>
              <View style={profileStyles.ratingContainer}>
                <Text style={profileStyles.ratingText}>★{averageRating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Menu List */}
        <View style={profileStyles.menuContainer}>
          {[
            '업적 & 뱃지',
            '알림 설정',
            '계정 설정',
            '도움말',
            '약관 및 정책'
          ].map((item, index) => (
            <TouchableOpacity
              key={item}
              style={profileStyles.menuItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <Text style={profileStyles.menuText}>{item}</Text>
              <Text style={profileStyles.menuArrow}>→</Text>
            </TouchableOpacity>
          ))}
          
          {/* Logout Button */}
          <TouchableOpacity
            style={[profileStyles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={profileStyles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Padding for FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ========================================
// Placeholder Component for Add Button
// ========================================

function AddRecordPlaceholder() {
  return null; // This component is never rendered
}

// ========================================
// Tab Navigator
// ========================================

function MainTabs() {
  const navigation = useNavigation<any>();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F0F0',
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 25, // Increased for home indicator
          height: 85, // Increased total height
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -5,
        },
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>🏠</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="MyRecords" 
        component={MyRecordsScreen}
        options={{
          title: '내 기록',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>☕</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="AddRecord" 
        component={AddRecordPlaceholder}
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.addButtonContainer}>
              <View style={[styles.addButton, focused && styles.addButtonFocused]}>
                <Text style={styles.addButtonText}>+</Text>
              </View>
            </View>
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('TastingFlow');
          },
        }}
      />
      <Tab.Screen 
        name="Achievement" 
        component={AchievementScreen}
        options={{
          title: '성취',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>🏆</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: '프로필',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>👤</Text>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// ========================================
// Main App Component
// ========================================

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

export default function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    checkAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    // You can add a splash screen here
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 24, color: colors.primary }}>☕</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="TastingFlow" 
              component={TastingFlowNavigator}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ========================================
// Styles
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
    padding: 24,
  },
  header: {
    padding: 24,
    backgroundColor: '#8B4513',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#F5E6D3',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E1F0A',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FDF8F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5E6D3',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#6B4423',
    marginBottom: 4,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  scrollContainer: {
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 14,
    color: '#8B4513',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  addButtonContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -15, // Raise the button above other tabs
    marginBottom: 5, // Add some bottom margin
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonFocused: {
    transform: [{ scale: 0.95 }],
  },
  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

// ========================================
// Card Styles
// ========================================

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: 0, // Remove horizontal margin
    ...shadows.md,
  },
  coffeeImage: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  coffeeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  matchScore: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
  },
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roasteryName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  separator: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  star: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[300],
    marginRight: 2,
  },
  starFilled: {
    color: '#FFD700', // Gold color for filled stars
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  flavors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  flavorChip: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.secondaryDark,
  },
  flavorText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
});

// ========================================
// Records Screen Styles
// ========================================

const recordsStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingTop: 24,
  },
  headerContainer: {
    paddingHorizontal: 24,
  },
  toggleContainer: {
    marginHorizontal: 24,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  viewModeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  viewModeTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  listContainer: {
    paddingHorizontal: 16, // Reduced padding for cards
    paddingBottom: spacing.huge,
  },
  separator: {
    height: spacing.md, // Reduced separator height
  },
});

// ========================================
// Profile Screen Styles
// ========================================

const profileStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: '#F5E6D3',
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatarText: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3E1F0A',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#8B4513',
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B4423',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginVertical: 16,
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 0.5,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4423',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636366',
  },
  tastingStyleContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 12,
  },
  styleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  styleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  styleLabel: {
    fontSize: 15,
    color: '#666666',
  },
  styleValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3E1F0A',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFD700',
  },
  menuContainer: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    fontSize: 16,
    color: '#3E1F0A',
  },
  menuArrow: {
    fontSize: 16,
    color: '#C7C7CC',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
});
