import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../../styles/theme';
import useStore from '../../store/useStore';
// Achievement store not yet implemented
import type { NavigationProp } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 로스터 노트 샘플 데이터 (실제로는 API에서 가져옴)
const ROASTER_NOTES = {
  flavors: ['Berry', 'Chocolate', 'Caramel', 'Citrus'],
  expressions: ['과일 같은', '달콤한', '깔끔한', '조화로운'],
  acidity: 4,
  sweetness: 4,
  body: 3,
  balance: 4,
};

export const Result: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const { 
    tastingFlowData,
    resetTastingFlowData,
    addRecord
  } = useStore();
  
  const coffeeInfo = tastingFlowData.coffeeInfo;
  const selectedFlavors = tastingFlowData.flavors || [];
  const sensoryExpressions = tastingFlowData.sensoryExpressions || [];
  const mouthFeel = tastingFlowData.ratings;
  const personalNotes = tastingFlowData.personalNotes;
  const mode = tastingFlowData.mode || 'cafe';
  // const { checkNewAchievements, getUserStats } = useAchievementStore();

  // 애니메이션 값
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);

  // 매치 스코어 계산
  const matchScore = useMemo(() => {
    if (!selectedFlavors || !sensoryExpressions) return 0;

    // 향미 매칭 (70% 가중치)
    const flavorMatches = selectedFlavors.filter(f => 
      ROASTER_NOTES.flavors.includes(f)
    ).length;
    const flavorScore = (flavorMatches / Math.max(selectedFlavors.length, ROASTER_NOTES.flavors.length)) * 70;

    // 감각 표현 매칭 (30% 가중치)
    const allExpressions = sensoryExpressions || [];
    const expressionMatches = allExpressions.filter(e => 
      ROASTER_NOTES.expressions.includes(e)
    ).length;
    const expressionScore = (expressionMatches / Math.max(allExpressions.length, ROASTER_NOTES.expressions.length)) * 30;

    return Math.round(flavorScore + expressionScore);
  }, [selectedFlavors, sensoryExpressions]);

  // 매치 레벨 결정
  const matchLevel = useMemo(() => {
    if (matchScore >= 85) return { text: '훌륭한 매치!', color: colors.success };
    if (matchScore >= 70) return { text: '좋은 매치!', color: colors.primary };
    if (matchScore >= 50) return { text: '괜찮은 매치', color: colors.warning };
    return { text: '독특한 감각', color: colors.info };
  }, [matchScore]);

  // 인사이트 생성
  const insights = useMemo(() => {
    const insights = [];
    
    // 향미 분석
    const commonFlavors = selectedFlavors?.filter(f => 
      ROASTER_NOTES.flavors.includes(f)
    ) || [];
    const uniqueFlavors = selectedFlavors?.filter(f => 
      !ROASTER_NOTES.flavors.includes(f)
    ) || [];
    
    if (commonFlavors.length > 2) {
      insights.push('🎯 로스터와 비슷한 향미를 잘 감지하셨어요!');
    }
    if (uniqueFlavors.length > 0) {
      insights.push(`✨ ${uniqueFlavors[0]} 향을 독특하게 느끼셨네요!`);
    }
    
    // 감각 표현 분석
    const allExpressions = sensoryExpressions || [];
    if (allExpressions.includes('과일 같은') && ROASTER_NOTES.expressions.includes('과일 같은')) {
      insights.push('🍓 과일향 감지 능력이 뛰어나시네요!');
    }
    if (mouthFeel && mouthFeel.acidity >= 4) {
      insights.push('🍋 산미를 섬세하게 평가하셨어요!');
    }
    
    return insights;
  }, [selectedFlavors, sensoryExpressions, mouthFeel]);

  // 애니메이션 실행
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 성취 확인
    checkAchievements();
  }, []);

  // 성취 확인
  const checkAchievements = async () => {
    // const achievements = await checkNewAchievements();
    const achievements = [];
    setNewAchievements(achievements);
    
    // const stats = await getUserStats();
    const stats = null;
    setUserStats(stats);
  };

  // 결과 저장
  const saveRecord = async () => {
    try {
      const record = {
        id: Date.now().toString(),
        mode,
        coffeeInfo,
        selectedFlavors,
        sensoryExpressions,
        mouthFeel,
        personalNotes,
        matchScore,
        createdAt: new Date().toISOString(),
      };
      
      // 기존 기록 불러오기
      const existingRecords = await AsyncStorage.getItem('@tasting_records');
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      
      // 새 기록 추가
      records.unshift(record);
      
      // 저장
      await AsyncStorage.setItem('@tasting_records', JSON.stringify(records));
      
      return true;
    } catch (error) {
      console.error('Failed to save record:', error);
      return false;
    }
  };

  // 공유 기능
  const handleShare = async () => {
    try {
      const message = `☕ CupNote 커피 기록\n\n` +
        `${coffeeInfo?.name || '커피'}\n` +
        `매치 스코어: ${matchScore}%\n` +
        `${matchLevel.text}\n\n` +
        `향미: ${selectedFlavors?.join(', ') || ''}\n` +
        `${personalNotes?.notes || ''}\n\n` +
        `#CupNote #커피기록 #스페셜티커피`;
      
      await Share.share({ message });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // 새 기록 시작
  const handleNewRecord = async () => {
    await saveRecord();
    resetTastingFlowData();
    navigation.navigate('TastingFlow' as never);
  };

  // 홈으로 이동
  const handleGoHome = async () => {
    await saveRecord();
    resetTastingFlowData();
    navigation.navigate('Home' as never);
  };

  // 로스터 비교 차트 렌더링
  const renderComparisonChart = () => {
    const userFlavors = new Set(selectedFlavors || []);
    const roasterFlavors = new Set(ROASTER_NOTES.flavors);
    
    const onlyUser = [...userFlavors].filter(f => !roasterFlavors.has(f));
    const common = [...userFlavors].filter(f => roasterFlavors.has(f));
    const onlyRoaster = [...roasterFlavors].filter(f => !userFlavors.has(f));
    
    return (
      <View style={styles.comparisonChart}>
        <View style={styles.chartRow}>
          <View style={[styles.chartSection, styles.userOnly]}>
            <Text style={styles.chartLabel}>나만 느낀</Text>
            <Text style={styles.chartCount}>{onlyUser.length}</Text>
            {onlyUser.slice(0, 2).map((f, i) => (
              <Text key={i} style={styles.chartItem}>{f}</Text>
            ))}
          </View>
          
          <View style={[styles.chartSection, styles.common]}>
            <Text style={styles.chartLabel}>공통</Text>
            <Text style={styles.chartCount}>{common.length}</Text>
            {common.slice(0, 2).map((f, i) => (
              <Text key={i} style={styles.chartItem}>{f}</Text>
            ))}
          </View>
          
          <View style={[styles.chartSection, styles.roasterOnly]}>
            <Text style={styles.chartLabel}>로스터</Text>
            <Text style={styles.chartCount}>{onlyRoaster.length}</Text>
            {onlyRoaster.slice(0, 2).map((f, i) => (
              <Text key={i} style={styles.chartItem}>{f}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 - 성공 애니메이션 */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.title}>테이스팅 완료!</Text>
          <Text style={styles.subtitle}>
            훌륭한 기록이에요! 커피의 맛을 잘 표현하셨네요.
          </Text>
        </Animated.View>

        {/* 커피 정보 요약 */}
        <View style={styles.section}>
          <View style={styles.coffeeInfo}>
            <Text style={styles.coffeeName}>{coffeeInfo?.name || '커피'}</Text>
            {coffeeInfo?.roastery && (
              <Text style={styles.coffeeRoastery}>{coffeeInfo.roastery}</Text>
            )}
            <Text style={styles.recordTime}>
              {new Date().toLocaleString('ko-KR', {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* 로스터 vs 나의 선택 비교 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 로스터 vs 나의 선택</Text>
          
          <View style={styles.matchScoreCard}>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreText, { color: matchLevel.color }]}>
                {matchScore}%
              </Text>
              <Text style={styles.scoreLabel}>매치 스코어</Text>
            </View>
            
            <View style={styles.scoreDetails}>
              <Text style={[styles.matchLevelText, { color: matchLevel.color }]}>
                ⭐ {matchLevel.text}
              </Text>
              <Text style={styles.scoreBreakdown}>
                향미 매칭: {selectedFlavors?.filter(f => ROASTER_NOTES.flavors.includes(f)).length}/{ROASTER_NOTES.flavors.length}개 일치
              </Text>
              <Text style={styles.scoreBreakdown}>
                로스터 노트와 {matchScore}% 일치
              </Text>
            </View>
          </View>

          {/* 비교 차트 */}
          {renderComparisonChart()}
          
          {/* 인사이트 */}
          {insights.length > 0 && (
            <View style={styles.insightsContainer}>
              {insights.map((insight, index) => (
                <Text key={index} style={styles.insightText}>{insight}</Text>
              ))}
            </View>
          )}
        </View>

        {/* 개인 테이스팅 요약 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 나의 테이스팅</Text>
          
          {selectedFlavors && selectedFlavors.length > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>선택한 향미</Text>
              <View style={styles.flavorTags}>
                {selectedFlavors.map((flavor, index) => (
                  <View key={index} style={styles.flavorTag}>
                    <Text style={styles.flavorTagText}>{flavor}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {personalNotes?.notes && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>개인 노트</Text>
              <Text style={styles.personalNote}>"{personalNotes.notes}"</Text>
            </View>
          )}
        </View>

        {/* 성장 인사이트 */}
        {newAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 새로운 성취!</Text>
            {newAchievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                <View>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 통계 */}
        {userStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 나의 커피 여정</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.totalRecords || 0}</Text>
                <Text style={styles.statLabel}>총 기록</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>연속 기록</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.uniqueCoffees || 0}</Text>
                <Text style={styles.statLabel}>다양한 커피</Text>
              </View>
            </View>
          </View>
        )}

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.shareButtonText}>📱 결과 공유하기</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNewRecord}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>새로운 커피 기록하기</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray600,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  coffeeInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  coffeeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  coffeeRoastery: {
    fontSize: typography.fontSize.md,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  recordTime: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
  },
  matchScoreCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  scoreText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    marginTop: 2,
  },
  scoreDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  matchLevelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    marginBottom: spacing.xs,
  },
  scoreBreakdown: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    marginBottom: 2,
  },
  comparisonChart: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartSection: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  userOnly: {
    backgroundColor: colors.infoLight,
  },
  common: {
    backgroundColor: colors.successLight,
  },
  roasterOnly: {
    backgroundColor: colors.warningLight,
  },
  chartLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  chartCount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chartItem: {
    fontSize: typography.fontSize.xs,
    color: colors.gray700,
  },
  insightsContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: spacing.md,
  },
  insightText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryItem: {
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  flavorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  flavorTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  flavorTagText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
  },
  personalNote: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontStyle: 'italic',
  },
  emotionTags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emotionTag: {
    fontSize: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  achievementEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  achievementName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text,
  },
  achievementDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.gray50,
    borderRadius: 8,
    padding: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  actionButtons: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  shareButton: {
    backgroundColor: colors.gray100,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.gray700,
    fontWeight: typography.fontWeight.medium as any,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold as any,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.gray300,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.gray700,
    fontWeight: typography.fontWeight.medium as any,
  },
});

export default Result;