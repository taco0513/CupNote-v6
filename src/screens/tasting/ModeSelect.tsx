/**
 * Mode Selection Screen
 * Uses design system components
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, HeaderBar } from '../../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import useStore from '../../store/useStore';
import type { TastingFlowNavigationProp } from '../../types/navigation';

// 스크린 이름을 한글로 변환하는 헬퍼 함수
const getScreenDisplayName = (screenName?: string): string => {
  const screenNames: Record<string, string> = {
    'CoffeeInfo': '커피 정보',
    'BrewSetup': '브루잉 설정',
    'FlavorSelection': '향미 선택',
    'SensoryExpression': '감각 표현',
    'SensoryMouthFeel': '수치 평가',
    'PersonalNotes': '개인 노트',
    'Result': '결과',
  };
  return screenNames[screenName || ''] || '알 수 없음';
};

export const ModeSelect: React.FC = () => {
  const navigation = useNavigation<TastingFlowNavigationProp>();
  const { tastingFlowData, resetTastingFlowData, setTastingFlowData } = useStore();
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    // 저장된 진행 상황이 있는지 확인 (24시간 이내)
    if (tastingFlowData?.lastUpdated && tastingFlowData?.currentScreen) {
      const lastUpdate = new Date(tastingFlowData.lastUpdated);
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 24) {
        setHasSavedProgress(true);
      } else {
        // 24시간이 지났으면 자동으로 리셋
        resetTastingFlowData();
      }
    }
  }, [tastingFlowData]);

  const handleModeSelect = (mode: 'cafe' | 'homecafe') => {
    resetTastingFlowData();
    setTastingFlowData({ mode, currentScreen: 'CoffeeInfo' });
    navigation.navigate('CoffeeInfo', { mode });
  };

  const handleContinue = () => {
    if (!tastingFlowData?.currentScreen || !tastingFlowData?.mode) return;
    
    const mode = tastingFlowData.mode;
    const screen = tastingFlowData.currentScreen as any;
    
    // 저장된 스크린으로 네비게이션
    navigation.navigate(screen, { mode });
  };

  const handleResetAndStart = () => {
    Alert.alert(
      '새로 시작',
      '저장된 진행 상황을 삭제하고 새로 시작하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '새로 시작',
          onPress: () => {
            resetTastingFlowData();
            setHasSavedProgress(false);
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="기록 모드 선택"
        onClose={() => navigation.getParent()?.goBack()}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.emoji}>☕</Text>
          <Text style={styles.title}>어디서 커피를 마시고 계신가요?</Text>
          <Text style={styles.subtitle}>
            상황에 맞는 기록 방식을 선택해주세요
          </Text>
        </View>

        {/* Continue Card - 저장된 진행 상황이 있을 때만 표시 */}
        {hasSavedProgress && tastingFlowData && (
          <Card variant="elevated" style={styles.continueCard}>
            <View style={styles.continueHeader}>
              <View style={styles.continueIconContainer}>
                <Text style={styles.continueIcon}>📝</Text>
              </View>
              <View style={styles.continueContent}>
                <Text style={styles.continueTitle}>이어서 기록하기</Text>
                <Text style={styles.continueSubtitle}>
                  {tastingFlowData.mode === 'cafe' ? '☕ 카페 모드' : '🏠 홈카페 모드'} • {' '}
                  {tastingFlowData.coffeeInfo?.coffeeName || '진행 중'}
                </Text>
                <Text style={styles.continueProgress}>
                  마지막 작업: {getScreenDisplayName(tastingFlowData.currentScreen)}
                </Text>
              </View>
            </View>
            <View style={styles.continueActions}>
              <Button
                title="이어가기"
                onPress={handleContinue}
                variant="primary"
                size="medium"
                fullWidth
              />
              <TouchableOpacity
                onPress={handleResetAndStart}
                style={styles.resetButton}
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>새로 시작</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Mode Cards */}
        <View style={styles.cardsContainer}>
          {/* Cafe Mode */}
          <TouchableOpacity
            onPress={() => handleModeSelect('cafe')}
            activeOpacity={0.9}
          >
            <Card variant="elevated" style={styles.modeCard}>
              <View style={styles.modeIconContainer}>
                <Text style={styles.modeIcon}>☕</Text>
              </View>
              <View style={styles.modeContent}>
                <Text style={styles.modeTitle}>카페에서</Text>
                <Text style={styles.modeDescription}>
                  카페에서 마시는 커피를 간단하게 기록
                </Text>
                <View style={styles.modeFeatures}>
                  <Text style={styles.featureItem}>• 5-7분 소요</Text>
                  <Text style={styles.featureItem}>• 향미와 감각 중심</Text>
                  <Text style={styles.featureItem}>• 카페 정보 저장</Text>
                </View>
              </View>
              <View style={styles.modeArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </Card>
          </TouchableOpacity>

          {/* HomeCafe Mode */}
          <TouchableOpacity
            onPress={() => handleModeSelect('homecafe')}
            activeOpacity={0.9}
          >
            <Card variant="elevated" style={styles.modeCard}>
              <View style={styles.modeIconContainer}>
                <Text style={styles.modeIcon}>🏠</Text>
              </View>
              <View style={styles.modeContent}>
                <Text style={styles.modeTitle}>홈카페</Text>
                <Text style={styles.modeDescription}>
                  집에서 추출한 커피를 상세하게 기록
                </Text>
                <View style={styles.modeFeatures}>
                  <Text style={styles.featureItem}>• 8-12분 소요</Text>
                  <Text style={styles.featureItem}>• 추출 정보 포함</Text>
                  <Text style={styles.featureItem}>• 레시피 저장</Text>
                </View>
              </View>
              <View style={styles.modeArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 선택 가이드</Text>
          <Text style={styles.tipsText}>
            카페 모드는 빠르고 간단한 기록을 원할 때,{'\n'}
            홈카페 모드는 추출 과정까지 기록하고 싶을 때 선택하세요.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  modeIcon: {
    fontSize: 28,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  modeFeatures: {
    gap: spacing.xs,
  },
  featureItem: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
  },
  modeArrow: {
    marginLeft: spacing.md,
  },
  arrowText: {
    fontSize: 24,
    color: colors.gray[400],
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.secondaryLight,
    borderWidth: 0,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  continueCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  continueHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  continueIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  continueIcon: {
    fontSize: 24,
  },
  continueContent: {
    flex: 1,
  },
  continueTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  continueSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  continueProgress: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  continueActions: {
    gap: spacing.sm,
  },
  resetButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
});

export default ModeSelect;