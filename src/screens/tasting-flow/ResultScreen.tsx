/**
 * ResultScreen - 기록 완료 및 결과 화면
 * 
 * CupNote v6 TastingFlow의 최종 결과 스크린
 * - 전체 기록 요약 표시
 * - UI Components Team의 RadarChart로 맛 프로필 시각화
 * - 커뮤니티 공유 옵션
 * - 로컬/클라우드 저장 처리
 * - 새 기록 시작 또는 메인으로 이동
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types & Utils
import { 
  TastingFlowScreenProps,
  RecordMode,
  TastingFlowProgressUtils
} from '../../utils';

// Components (UI Components Team)
import { 
  Container,
  Header,
  RadarChart,
  Button,
  Card,
  Loading
} from '../../components';

// Store & Hooks
import { 
  useTastingFlowStore,
  useRecordStore,
  useAchievementStore
} from '../../store';
import { 
  useTastingFlowProgress
} from '../../hooks';

interface ResultScreenProps extends TastingFlowScreenProps<{
  recordId: string;
  mode: RecordMode;
}> {}

const ResultScreen: React.FC<ResultScreenProps> = ({
  navigation,
  route
}) => {
  const { recordId, mode } = route.params;
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [recordData, setRecordData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Store
  const { 
    currentDraft,
    resetFlow 
  } = useTastingFlowStore();
  const { 
    saveRecord, 
    getRecord, 
    deleteDraft 
  } = useRecordStore();
  const { checkAchievements } = useAchievementStore();
  
  // Progress tracking
  const progress = useTastingFlowProgress(mode, 'Result');
  
  // =====================================
  // Load and Save Record
  // =====================================
  
  useEffect(() => {
    loadAndSaveRecord();
  }, []);
  
  const loadAndSaveRecord = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (!currentDraft) {
        throw new Error('No draft data found');
      }
      
      setIsSaving(true);
      
      // Convert draft to final record
      const finalRecord = {
        id: recordId,
        userId: currentDraft.userId,
        mode: currentDraft.mode,
        
        // All the collected data
        coffeeData: currentDraft.coffeeData,
        brewSetupData: currentDraft.brewSetupData,
        flavorData: currentDraft.flavorData,
        sensoryExpressionData: currentDraft.sensoryExpressionData,
        sensoryMouthFeelData: currentDraft.sensoryMouthFeelData,
        personalNotesData: currentDraft.personalNotesData,
        
        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
        version: 1
      };
      
      // Save to database (Foundation Team's recordStore)
      const savedRecord = await saveRecord(finalRecord);
      setRecordData(savedRecord);
      
      // Check for new achievements
      const newAchievements = await checkAchievements(savedRecord);
      setAchievements(newAchievements);
      
      // Clean up draft
      if (currentDraft.id) {
        await deleteDraft(currentDraft.id);
      }
      
      setIsSaving(false);
      
    } catch (error) {
      console.error('Record save failed:', error);
      Alert.alert(
        '저장 오류',
        '기록 저장 중 오류가 발생했습니다. 다시 시도하시겠습니까?',
        [
          { text: '나중에', style: 'cancel' },
          { text: '다시 시도', onPress: loadAndSaveRecord }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentDraft, recordId, saveRecord, checkAchievements, deleteDraft]);
  
  // =====================================
  // Computed Values
  // =====================================
  
  const radarChartData = useCallback(() => {
    if (!recordData?.sensoryMouthFeelData || recordData.sensoryMouthFeelData.skipped) {
      return [];
    }
    
    const data = recordData.sensoryMouthFeelData;
    return [
      { category: '산미', value: data.acidity, fullMark: 10, color: '#FF6B6B' },
      { category: '단맛', value: data.sweetness, fullMark: 10, color: '#FFB020' },
      { category: '쓴맛', value: data.bitterness, fullMark: 10, color: '#8B4513' },
      { category: '바디감', value: data.body, fullMark: 10, color: '#6B4E3D' },
      { category: '균형감', value: data.balance, fullMark: 10, color: '#4ECDC4' },
      { category: '깔끔함', value: data.cleanness, fullMark: 10, color: '#45B7D1' },
      { category: '여운', value: data.aftertaste, fullMark: 10, color: '#96CEB4' }
    ];
  }, [recordData]);
  
  const recordSummary = useCallback(() => {
    if (!recordData) return null;
    
    const { coffeeData, flavorData, sensoryExpressionData, personalNotesData } = recordData;
    
    return {
      coffeeInfo: {
        name: coffeeData?.name,
        roastery: coffeeData?.roastery,
        origin: coffeeData?.origin,
        cafe: mode === 'cafe' ? coffeeData?.cafe?.name : null
      },
      flavors: {
        count: flavorData?.selectedFlavors?.length || 0,
        primary: flavorData?.primaryFlavors || [],
        intensity: flavorData?.flavorIntensity || 0
      },
      expressions: {
        categories: Object.keys(sensoryExpressionData || {}).filter(key => 
          key !== 'customExpression' && 
          Array.isArray(sensoryExpressionData[key]) && 
          sensoryExpressionData[key].length > 0
        ).length,
        total: Object.values(sensoryExpressionData || {})
          .filter(value => Array.isArray(value))
          .reduce((sum, arr) => sum + (arr as string[]).length, 0),
        custom: sensoryExpressionData?.customExpression
      },
      rating: personalNotesData?.rating || 0,
      wouldRecommend: personalNotesData?.wouldRecommend,
      shareWithCommunity: personalNotesData?.shareWithCommunity
    };
  }, [recordData, mode]);
  
  // =====================================
  // Event Handlers
  // =====================================
  
  const handleShare = useCallback(async () => {
    if (!recordData) return;
    
    const summary = recordSummary();
    if (!summary) return;
    
    try {
      const shareText = `
☕ ${summary.coffeeInfo.name}
${summary.coffeeInfo.roastery ? `🏪 ${summary.coffeeInfo.roastery}` : ''}
${summary.coffeeInfo.cafe ? `📍 ${summary.coffeeInfo.cafe}` : ''}
⭐ ${summary.rating}/5점

🌸 ${summary.flavors.count}개 향미 선택
🇰🇷 ${summary.expressions.total}개 감각 표현
${summary.wouldRecommend ? '👍 추천' : '👎 비추천'}

#CupNote #커피기록 #${mode === 'cafe' ? '카페' : '홈카페'}
      `.trim();
      
      await Share.share({
        message: shareText,
        title: 'CupNote 커피 기록'
      });
      
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [recordData, recordSummary, mode]);
  
  const handleNewRecord = useCallback(() => {
    Alert.alert(
      '새 기록 시작',
      '새로운 커피 기록을 시작하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '시작',
          onPress: () => {
            resetFlow();
            navigation.navigate('ModeSelect');
          }
        }
      ]
    );
  }, [resetFlow, navigation]);
  
  const handleGoHome = useCallback(() => {
    resetFlow();
    navigation.navigate('Home'); // Assuming there's a Home screen
  }, [resetFlow, navigation]);
  
  const handleViewRecord = useCallback(() => {
    // Navigate to record detail screen
    navigation.navigate('RecordDetail', { recordId });
  }, [navigation, recordId]);
  
  // =====================================
  // Render Helpers
  // =====================================
  
  const renderAchievements = useCallback(() => {
    if (achievements.length === 0) return null;
    
    return (
      <Card title="🏆 새로운 업적!" style={[styles.section, styles.achievementSection]}>
        {achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
          </View>
        ))}
      </Card>
    );
  }, [achievements]);
  
  const renderRecordSummary = useCallback(() => {
    const summary = recordSummary();
    if (!summary) return null;
    
    return (
      <Card title="📋 기록 요약" style={styles.section}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>커피</Text>
            <Text style={styles.summaryValue}>{summary.coffeeInfo.name}</Text>
            {summary.coffeeInfo.roastery && (
              <Text style={styles.summarySubValue}>{summary.coffeeInfo.roastery}</Text>
            )}
            {summary.coffeeInfo.cafe && (
              <Text style={styles.summarySubValue}>@ {summary.coffeeInfo.cafe}</Text>
            )}
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>모드</Text>
            <Text style={styles.summaryValue}>
              {mode === 'cafe' ? '🏪 카페 모드' : '🏠 홈카페 모드'}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>향미</Text>
            <Text style={styles.summaryValue}>{summary.flavors.count}개 선택</Text>
            <Text style={styles.summarySubValue}>강도: {summary.flavors.intensity}/5</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>감각 표현</Text>
            <Text style={styles.summaryValue}>{summary.expressions.total}개</Text>
            <Text style={styles.summarySubValue}>
              {summary.expressions.categories}개 카테고리
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>평점</Text>
            <Text style={styles.summaryValue}>⭐ {summary.rating}/5</Text>
            <Text style={[
              styles.summarySubValue,
              { color: summary.wouldRecommend ? '#4CAF50' : '#FF5722' }
            ]}>
              {summary.wouldRecommend ? '👍 추천' : '👎 비추천'}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>공유</Text>
            <Text style={styles.summaryValue}>
              {summary.shareWithCommunity ? '🌐 공개' : '🔒 비공개'}
            </Text>
          </View>
        </View>
        
        {summary.expressions.custom && (
          <View style={styles.customExpressionContainer}>
            <Text style={styles.customExpressionLabel}>직접 입력한 표현:</Text>
            <Text style={styles.customExpressionText}>
              "{summary.expressions.custom}"
            </Text>
          </View>
        )}
      </Card>
    );
  }, [recordSummary, mode]);
  
  const renderTasteProfile = useCallback(() => {
    const chartData = radarChartData();
    if (chartData.length === 0) {
      return (
        <Card title="🍽️ 맛 프로필" style={styles.section}>
          <View style={styles.noChartContainer}>
            <Text style={styles.noChartText}>
              수치 평가를 건너뛰어서{'\n'}맛 프로필 차트를 표시할 수 없습니다.
            </Text>
          </View>
        </Card>
      );
    }
    
    return (
      <Card title="🍽️ 맛 프로필" style={styles.section}>
        <View style={styles.chartContainer}>
          <RadarChart
            data={chartData}
            width={300}
            height={250}
            showGrid
            showLabels
            korean
            accessible
            accessibilityLabel="최종 커피 맛 프로필 차트"
          />
        </View>
        
        <View style={styles.chartLegend}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.category}: {item.value}/10
              </Text>
            </View>
          ))}
        </View>
      </Card>
    );
  }, [radarChartData]);
  
  const renderActionButtons = useCallback(() => (
    <View style={styles.actionButtons}>
      <Button
        title="📱 공유하기"
        onPress={handleShare}
        variant="secondary"
        size="large"
        style={styles.actionButton}
        korean
      />
      
      <Button
        title="📖 상세 보기"
        onPress={handleViewRecord}
        variant="outline"
        size="large"
        style={styles.actionButton}
        korean
      />
    </View>
  ), [handleShare, handleViewRecord]);
  
  // =====================================
  // Main Render
  // =====================================
  
  if (isLoading) {
    return <Loading text="기록을 저장하고 있습니다..." korean />;
  }
  
  if (isSaving) {
    return <Loading text="거의 완료되었습니다..." korean />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {/* Header */}
        <Header
          title="🎉 기록 완료!"
          subtitle={`${mode === 'cafe' ? '카페' : '홈카페'} 커피 기록이 저장되었습니다`}
          korean
          style={styles.header}
        />
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderAchievements()}
          {renderRecordSummary()}
          {renderTasteProfile()}
          
          {/* Success Message */}
          <Card style={[styles.section, styles.successSection]}>
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={styles.successTitle}>저장 완료</Text>
              <Text style={styles.successDescription}>
                커피 기록이 성공적으로 저장되었습니다.{'\n'}
                언제든지 내 기록에서 다시 볼 수 있어요!
              </Text>
            </View>
          </Card>
          
          {renderActionButtons()}
        </ScrollView>
        
        {/* Bottom Navigation */}
        <View style={styles.bottomActions}>
          <Button
            title="🔄 새 기록 시작"
            onPress={handleNewRecord}
            variant="primary"
            size="large"
            style={styles.bottomButton}
            korean
          />
          
          <Button
            title="🏠 홈으로"
            onPress={handleGoHome}
            variant="outline"
            size="large" 
            style={styles.bottomButton}
            korean
          />
        </View>
      </Container>
    </SafeAreaView>
  );
};

// =====================================
// Styles
// =====================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    backgroundColor: '#F0F8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD'
  },
  content: {
    flex: 1
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16
  },
  achievementSection: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFD54F'
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
    marginBottom: 8,
    lastChild: {
      borderBottomWidth: 0,
      marginBottom: 0
    }
  },
  achievementEmoji: {
    fontSize: 32,
    marginRight: 16
  },
  achievementText: {
    flex: 1
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#F57C00'
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  summaryItem: {
    width: '45%',
    minWidth: 120
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2
  },
  summarySubValue: {
    fontSize: 12,
    color: '#888888'
  },
  customExpressionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8B7355'
  },
  customExpressionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 4
  },
  customExpressionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
    fontStyle: 'italic'
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  noChartContainer: {
    alignItems: 'center',
    paddingVertical: 32
  },
  noChartText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#888888',
    textAlign: 'center'
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%'
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  legendText: {
    fontSize: 12,
    color: '#666666'
  },
  successSection: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8
  },
  successDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#15803D',
    textAlign: 'center'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16
  },
  actionButton: {
    flex: 1
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8'
  },
  bottomButton: {
    flex: 1
  }
});

export default ResultScreen;