/**
 * Home Screen with Polished UI
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Badge, Avatar } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import useStore from '../store/useStore';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, stats, records } = useStore();
  
  const recentRecords = records.slice(0, 3);
  
  // Get best coffee of current month
  const bestCoffeeThisMonth = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthRecords = records.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    if (thisMonthRecords.length === 0) return null;
    
    // Sort by rating (highest first), then by date (most recent first)
    return thisMonthRecords.sort((a, b) => {
      if (b.overallRating !== a.overallRating) {
        return b.overallRating - a.overallRating;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })[0];
  }, [records]);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>안녕하세요! ☀️</Text>
              <Text style={styles.title}>오늘의 커피 어떠셨나요?</Text>
            </View>
            <Avatar
              name={user?.username || 'User'}
              size="medium"
            />
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalRecords}</Text>
            <Text style={styles.statLabel}>총 기록</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalAchievements}</Text>
            <Text style={styles.statLabel}>업적</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.averageRating ? stats.averageRating.toFixed(1) : '0'}
            </Text>
            <Text style={styles.statLabel}>평균 평점</Text>
          </Card>
        </View>
        
        {/* Main CTA */}
        <Card variant="elevated" style={styles.ctaCard}>
          <Text style={styles.ctaEmoji}>☕</Text>
          <Text style={styles.ctaTitle}>오늘의 커피를 기록해보세요</Text>
          <Text style={styles.ctaSubtitle}>
            당신만의 특별한 커피 이야기를 남겨보세요
          </Text>
          <Button
            title="커피 기록하기"
            onPress={() => navigation.navigate('TastingFlow')}
            size="large"
            icon="☕"
            style={styles.ctaButton}
          />
        </Card>
        
        {/* Best Coffee This Month */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ 이번 달의 베스트</Text>
          </View>
          {bestCoffeeThisMonth ? (
            <TouchableOpacity 
              onPress={() => console.log('Best coffee pressed:', bestCoffeeThisMonth.coffeeName)}
              activeOpacity={0.7}
            >
              <Card style={styles.bestCoffeeCard}>
                <View style={styles.bestCoffeeHeader}>
                <View style={styles.bestCoffeeImagePlaceholder}>
                  <Text style={styles.bestCoffeeImageEmoji}>☕</Text>
                </View>
                <View style={styles.bestCoffeeInfo}>
                  <Text style={styles.bestCoffeeTitle}>{bestCoffeeThisMonth.coffeeName}</Text>
                  <Text style={styles.bestCoffeeSubtitle}>
                    {bestCoffeeThisMonth.cafeName || bestCoffeeThisMonth.roastery || '로스터리'}
                  </Text>
                </View>
              </View>
              <View style={styles.bestCoffeeFooter}>
                <Text style={styles.bestCoffeeRating}>⭐ {bestCoffeeThisMonth.overallRating.toFixed(1)}</Text>
                <Text style={styles.bestCoffeeDate}>
                  {new Date(bestCoffeeThisMonth.createdAt).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            </Card>
            </TouchableOpacity>
          ) : (
            <Card style={styles.bestCoffeeEmptyCard}>
              <Text style={styles.bestCoffeeEmptyIcon}>🏆</Text>
              <Text style={styles.bestCoffeeEmptyTitle}>이번 달 베스트 커피가 없어요</Text>
              <Text style={styles.bestCoffeeEmptySubtitle}>
                커피를 기록하고 이번 달의{'\n'}최고 평점 커피를 만나보세요!
              </Text>
            </Card>
          )}
        </View>
        
        {/* Recent Records */}
        {recentRecords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 기록</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyRecords')}>
                <Text style={styles.sectionLink}>모두 보기 →</Text>
              </TouchableOpacity>
            </View>
            
            {recentRecords.map((record) => (
              <Card key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>{record.coffeeName}</Text>
                  <Badge
                    text={record.mode === 'cafe' ? '카페' : '홈카페'}
                    variant={record.mode === 'cafe' ? 'primary' : 'info'}
                    size="small"
                  />
                </View>
                {record.cafeName && (
                  <Text style={styles.recordSubtitle}>📍 {record.cafeName}</Text>
                )}
                <View style={styles.recordFooter}>
                  <Text style={styles.recordDate}>
                    {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                  </Text>
                  <Text style={styles.recordRating}>⭐ {record.overallRating}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
        
        {/* Tips */}
        <Card style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>오늘의 팁</Text>
            <Text style={styles.tipText}>
              커피의 향미를 더 잘 느끼려면 한 모금 마신 후 
              코로 숨을 내쉬어보세요. 후각을 통해 더 많은 향을 느낄 수 있어요!
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: -spacing.xxl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  ctaCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  ctaEmoji: {
    fontSize: typography.fontSize.display + 16, // 48px
    marginBottom: spacing.lg,
  },
  ctaTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  ctaButton: {
    minWidth: 200,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  recordCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recordTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  recordSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  recordRating: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  },
  tipCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '30',
    borderWidth: 1,
  },
  tipIcon: {
    fontSize: typography.fontSize.xxl,
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  // Best of the Month styles
  bestCoffeeCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  bestCoffeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestCoffeeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bestCoffeeImageEmoji: {
    fontSize: typography.fontSize.xxl,
  },
  bestCoffeeInfo: {
    flex: 1,
  },
  bestCoffeeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bestCoffeeSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  bestCoffeeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bestCoffeeRating: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  bestCoffeeDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  bestCoffeeEmptyCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  bestCoffeeEmptyIcon: {
    fontSize: typography.fontSize.display,
    marginBottom: spacing.md,
  },
  bestCoffeeEmptyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bestCoffeeEmptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  // Recent Records horizontal scroll styles
  recentRecordsContainer: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.lg + spacing.md, // Extra padding for last card
  },
  recentRecordCard: {
    width: spacing.lg * 10, // 160px (spacing.lg = 16px)
    marginRight: spacing.md,
    padding: spacing.md,
  },
  recentRecordImagePlaceholder: {
    width: '100%',
    height: spacing.lg * 5, // 80px (spacing.lg = 16px)
    borderRadius: borderRadius.sm,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  recentRecordImageEmoji: {
    fontSize: typography.fontSize.xxl,
  },
  recentRecordContent: {
    flex: 1,
  },
  recentRecordTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.sm * 1.2,
  },
  recentRecordSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  recentRecordBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  recentRecordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  recentRecordRating: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.warning,
  },
  recentRecordDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});