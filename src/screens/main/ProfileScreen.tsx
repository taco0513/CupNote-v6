/**
 * ProfileScreen - 프로필 및 설정 화면
 * 
 * Features:
 * - 사용자 기본 정보 수정
 * - 프로필 사진 업로드
 * - 커피 취향 설정
 * - 앱 설정 (알림, 개인정보, 다크 모드 등)
 * - 데이터 관리 (내보내기, 계정 삭제)
 * - Foundation Team의 authStore 연동
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-picker';

// Foundation Team Assets
import { useAuthStore } from '../../../worktree-foundation/src/store/authStore';
import { useRecordStore } from '../../../worktree-foundation/src/store/recordStore';
import { useAchievementStore } from '../../../worktree-foundation/src/store/achievementStore';

// UI Components Team Assets
import {
  Container,
  Card,
  Button,
  TextInput,
  Select,
  Loading,
  Header,
  BottomSheet,
  theme,
  colors,
  spacing
} from '../../../worktree-ui-components/src';

// Types
import type { 
  ProfileSection, 
  ProfileItem, 
  UserPreferences,
  TastePreference,
  ScreenProps 
} from '../../types';

interface ProfileScreenProps extends ScreenProps {
  navigation: any;
}

const LANGUAGE_OPTIONS = [
  { label: '한국어', value: 'ko' },
  { label: 'English', value: 'en' },
];

const TEMPERATURE_UNIT_OPTIONS = [
  { label: '섭씨 (°C)', value: 'celsius' },
  { label: '화씨 (°F)', value: 'fahrenheit' },
];

const WEIGHT_UNIT_OPTIONS = [
  { label: '그램 (g)', value: 'grams' },
  { label: '온스 (oz)', value: 'ounces' },
];

const ROAST_LEVELS = [
  { label: '라이트 로스트', value: 'light' },
  { label: '미디엄 로스트', value: 'medium' },
  { label: '다크 로스트', value: 'dark' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  // Foundation Stores
  const { 
    user, 
    isLoading: authLoading,
    updateProfile, 
    logout,
    getUserDisplayName 
  } = useAuthStore();
  
  const { records } = useRecordStore();
  const { stats, getTotalPoints } = useAchievementStore();

  // Local State
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showTasteProfile, setShowTasteProfile] = useState(false);
  
  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  
  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>({
    darkMode: false,
    language: 'ko',
    notifications: {
      achievements: true,
      reminders: true,
      community: true,
    },
    privacy: {
      shareProfile: true,
      shareRecords: false,
      showInLeaderboard: true,
    },
    units: {
      temperature: 'celsius',
      weight: 'grams',
      volume: 'ml',
    },
  });

  // Taste Profile State
  const [tasteProfile, setTasteProfile] = useState<TastePreference>({
    acidity: 3,
    sweetness: 3,
    bitterness: 3,
    body: 3,
    roastLevel: 'medium',
    favoriteOrigins: [],
    favoriteMethods: [],
  });

  // Navigation Actions
  const handleLogout = useCallback(() => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Auth', { screen: 'Login' });
            } catch (error) {
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  }, [logout, navigation]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      '계정 삭제',
      '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('알림', '계정 삭제 기능은 준비 중입니다.');
          }
        }
      ]
    );
  }, []);

  const handleExportData = useCallback(() => {
    Alert.alert('알림', '데이터 내보내기 기능은 준비 중입니다.');
  }, []);

  // Profile Actions
  const handleAvatarPress = useCallback(() => {
    const options = ['사진 선택', '카메라', '취소'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            ImagePicker.launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 400,
                maxHeight: 400,
              },
              (response) => {
                if (response.assets?.[0]?.uri) {
                  setEditAvatar(response.assets[0].uri);
                }
              }
            );
          } else if (buttonIndex === 1) {
            ImagePicker.launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 400,
                maxHeight: 400,
              },
              (response) => {
                if (response.assets?.[0]?.uri) {
                  setEditAvatar(response.assets[0].uri);
                }
              }
            );
          }
        }
      );
    }
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile({
        name: editName,
        avatar: editAvatar !== user.avatar ? editAvatar : undefined,
      });
      setShowEditProfile(false);
    } catch (error) {
      Alert.alert('오류', '프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user, editName, editAvatar, updateProfile]);

  // Preference Handlers
  const updatePreference = useCallback((path: string, value: any) => {
    setPreferences(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  }, []);

  // Effects
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditAvatar(user.avatar || '');
    }
  }, [user]);

  // Profile Sections
  const profileSections: ProfileSection[] = [
    {
      id: 'account',
      title: '계정',
      items: [
        {
          id: 'edit-profile',
          title: '프로필 수정',
          subtitle: '이름, 사진 변경',
          icon: '👤',
          type: 'navigation',
          onPress: () => setShowEditProfile(true),
        },
        {
          id: 'taste-profile',
          title: '취향 프로필',
          subtitle: '커피 취향 설정',
          icon: '☕',
          type: 'navigation',
          onPress: () => setShowTasteProfile(true),
        },
      ],
    },
    {
      id: 'preferences',
      title: '환경설정',
      items: [
        {
          id: 'notifications',
          title: '알림 설정',
          subtitle: '푸시 알림 관리',
          icon: '🔔',
          type: 'navigation',
          onPress: () => setShowPreferences(true),
        },
        {
          id: 'language',
          title: '언어',
          value: preferences.language === 'ko' ? '한국어' : 'English',
          icon: '🌐',
          type: 'select',
        },
        {
          id: 'dark-mode',
          title: '다크 모드',
          icon: '🌙',
          type: 'switch',
        },
      ],
    },
    {
      id: 'data',
      title: '데이터',
      items: [
        {
          id: 'export',
          title: '데이터 내보내기',
          subtitle: '기록을 파일로 저장',
          icon: '📤',
          type: 'action',
          onPress: handleExportData,
        },
      ],
    },
    {
      id: 'account-actions',
      title: '계정 관리',
      items: [
        {
          id: 'logout',
          title: '로그아웃',
          icon: '🚪',
          type: 'action',
          onPress: handleLogout,
        },
        {
          id: 'delete',
          title: '계정 삭제',
          subtitle: '모든 데이터가 삭제됩니다',
          icon: '⚠️',
          type: 'action',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  // Render Functions
  const renderUserHeader = useCallback(() => (
    <Card style={styles.userHeader}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>👤</Text>
            </View>
          )}
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{getUserDisplayName()}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {stats && (
            <View style={styles.userStats}>
              <View style={styles.userStat}>
                <Text style={styles.userStatValue}>{records.length}</Text>
                <Text style={styles.userStatLabel}>기록</Text>
              </View>
              <View style={styles.userStat}>
                <Text style={styles.userStatValue}>Lv.{stats.level}</Text>
                <Text style={styles.userStatLabel}>레벨</Text>
              </View>
              <View style={styles.userStat}>
                <Text style={styles.userStatValue}>{getTotalPoints()}P</Text>
                <Text style={styles.userStatLabel}>포인트</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Card>
  ), [user, getUserDisplayName, stats, records.length, getTotalPoints]);

  const renderProfileItem = useCallback((item: ProfileItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.profileItem}
      onPress={item.onPress}
      disabled={item.disabled}
    >
      <View style={styles.profileItemLeft}>
        <Text style={styles.profileItemIcon}>{item.icon}</Text>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.profileItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.profileItemRight}>
        {item.type === 'switch' && (
          <Switch
            value={item.id === 'dark-mode' ? preferences.darkMode : false}
            onValueChange={(value) => {
              if (item.id === 'dark-mode') {
                updatePreference('darkMode', value);
              }
            }}
          />
        )}
        {item.type === 'select' && item.value && (
          <Text style={styles.profileItemValue}>{item.value}</Text>
        )}
        {(item.type === 'navigation' || item.type === 'action') && (
          <Text style={styles.profileItemArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  ), [preferences.darkMode, updatePreference]);

  const renderProfileSection = useCallback((section: ProfileSection) => (
    <Card key={section.id} style={styles.profileSection}>
      <Text style={styles.profileSectionTitle}>{section.title}</Text>
      {section.items.map(renderProfileItem)}
    </Card>
  ), [renderProfileItem]);

  const renderEditProfileModal = useCallback(() => (
    <BottomSheet
      isVisible={showEditProfile}
      onClose={() => setShowEditProfile(false)}
      title="프로필 수정"
    >
      <View style={styles.modalContent}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} style={styles.editAvatarContainer}>
            {editAvatar ? (
              <Image source={{ uri: editAvatar }} style={styles.editAvatar} />
            ) : (
              <View style={styles.editAvatarPlaceholder}>
                <Text style={styles.editAvatarPlaceholderText}>👤</Text>
              </View>
            )}
            <View style={styles.editAvatarOverlay}>
              <Text style={styles.editAvatarText}>변경</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TextInput
          label="이름"
          value={editName}
          onChangeText={setEditName}
          placeholder="이름을 입력하세요"
          style={styles.input}
        />

        <View style={styles.modalActions}>
          <Button
            title="취소"
            variant="outline"
            onPress={() => setShowEditProfile(false)}
            style={styles.modalButton}
          />
          <Button
            title="저장"
            onPress={handleSaveProfile}
            loading={loading}
            style={styles.modalButton}
          />
        </View>
      </View>
    </BottomSheet>
  ), [showEditProfile, editName, editAvatar, loading, handleAvatarPress, handleSaveProfile]);

  const renderPreferencesModal = useCallback(() => (
    <BottomSheet
      isVisible={showPreferences}
      onClose={() => setShowPreferences(false)}
      title="환경설정"
    >
      <View style={styles.modalContent}>
        <View style={styles.preferenceSection}>
          <Text style={styles.preferenceSectionTitle}>알림</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceItemTitle}>도전과제 알림</Text>
            <Switch
              value={preferences.notifications.achievements}
              onValueChange={(value) => updatePreference('notifications.achievements', value)}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceItemTitle}>기록 리마인더</Text>
            <Switch
              value={preferences.notifications.reminders}
              onValueChange={(value) => updatePreference('notifications.reminders', value)}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceItemTitle}>커뮤니티 알림</Text>
            <Switch
              value={preferences.notifications.community}
              onValueChange={(value) => updatePreference('notifications.community', value)}
            />
          </View>
        </View>

        <View style={styles.preferenceSection}>
          <Text style={styles.preferenceSectionTitle}>개인정보</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceItemTitle}>프로필 공개</Text>
            <Switch
              value={preferences.privacy.shareProfile}
              onValueChange={(value) => updatePreference('privacy.shareProfile', value)}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceItemTitle}>기록 공유</Text>
            <Switch
              value={preferences.privacy.shareRecords}
              onValueChange={(value) => updatePreference('privacy.shareRecords', value)}
            />
          </View>
        </View>

        <View style={styles.preferenceSection}>
          <Text style={styles.preferenceSectionTitle}>단위</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceItemTitle}>온도</Text>
            <Select
              value={preferences.units.temperature}
              options={TEMPERATURE_UNIT_OPTIONS}
              onValueChange={(value) => updatePreference('units.temperature', value)}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceItemTitle}>무게</Text>
            <Select
              value={preferences.units.weight}
              options={WEIGHT_UNIT_OPTIONS}
              onValueChange={(value) => updatePreference('units.weight', value)}
            />
          </View>
        </View>
      </View>
    </BottomSheet>
  ), [showPreferences, preferences, updatePreference]);

  // Loading State
  if (authLoading || !user) {
    return (
      <Container style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="프로필" />
        <Loading message="프로필을 불러오는 중..." />
      </Container>
    );
  }

  return (
    <Container style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="프로필" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 사용자 헤더 */}
        {renderUserHeader()}

        {/* 프로필 섹션들 */}
        {profileSections.map(renderProfileSection)}
      </ScrollView>

      {/* 프로필 수정 모달 */}
      {renderEditProfileModal()}

      {/* 환경설정 모달 */}
      {renderPreferencesModal()}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  userHeader: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    color: colors.text.tertiary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  userStat: {
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  userStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userStatLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  profileSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.light,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  profileItemSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  profileItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileItemValue: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  profileItemArrow: {
    fontSize: 18,
    color: colors.text.tertiary,
  },
  modalContent: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  editAvatarContainer: {
    position: 'relative',
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarPlaceholderText: {
    fontSize: 40,
    color: colors.text.tertiary,
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: {
    fontSize: 10,
    color: colors.surface.main,
    fontWeight: '600',
  },
  input: {
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  preferenceSection: {
    marginBottom: spacing.xl,
  },
  preferenceSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  preferenceItemTitle: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
});

export default ProfileScreen;