/**
 * Mode Selection Screen
 * Uses design system components
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, HeaderBar } from '../../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import type { TastingFlowNavigationProp } from '../../types/navigation';

export const ModeSelect: React.FC = () => {
  const navigation = useNavigation<TastingFlowNavigationProp>();

  const handleModeSelect = (mode: 'cafe' | 'homecafe') => {
    navigation.navigate('CoffeeInfo', { mode });
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
});

export default ModeSelect;