/**
 * SensoryMouthFeelScreen - 마우스필 평가 (선택적)
 * 
 * CupNote v6 TastingFlow의 수치 평가 스크린
 * - 7개 항목: 산미, 단맛, 쓴맛, 바디감, 균형감, 깔끔함, 여운
 * - UI Components Team의 TasteSlider 활용
 * - 1-10점 스케일 평가
 * - 실시간 레이더 차트 표시
 * - 건너뛰기 옵션 제공
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types & Utils
import { 
  TastingFlowScreenProps,
  RecordMode,
  CoffeeInfoData,
  BrewSetupData,
  FlavorSelectionData,
  SensoryExpressionData,
  SensoryMouthFeelData,
  TastingFlowProgressUtils
} from '../../utils';

// Components (UI Components Team)
import { 
  Container,
  ProgressHeader,
  TasteSlider,
  MultipleTasteSliders,
  RadarChart,
  Button,
  Card,
  Loading
} from '../../components';

// Store & Hooks
import { 
  useTastingFlowStore,
  useRecordStore 
} from '../../store';
import { 
  useTastingFlowProgress,
  useDraftAutoSave
} from '../../hooks';

interface SensoryMouthFeelScreenProps extends TastingFlowScreenProps<{
  mode: RecordMode;
  coffeeData: CoffeeInfoData;
  brewSetupData?: BrewSetupData;
  flavorData: FlavorSelectionData;
  sensoryExpressionData: SensoryExpressionData;
}> {}

// 평가 항목 정의 (Korean UX)
const TASTE_CATEGORIES = {
  acidity: {
    name: '산미',
    description: '신맛의 강도와 품질',
    emoji: '🍋',
    color: '#FF6B6B',
    scale: {
      1: '전혀 없음',
      3: '은은함',
      5: '적당함', 
      7: '뚜렷함',
      10: '매우 강함'
    }
  },
  sweetness: {
    name: '단맛',
    description: '단맛의 강도와 품질',
    emoji: '🍯',
    color: '#FFB020',
    scale: {
      1: '전혀 없음',
      3: '은은함',
      5: '적당함',
      7: '뚜렷함', 
      10: '매우 달콤'
    }
  },
  bitterness: {
    name: '쓴맛',
    description: '쓴맛의 강도와 품질',
    emoji: '☕',
    color: '#8B4513',
    scale: {
      1: '전혀 없음',
      3: '은은함',
      5: '적당함',
      7: '뚜렷함',
      10: '매우 쓴맛'
    }
  },
  body: {
    name: '바디감',
    description: '입 안의 무게감과 질감',
    emoji: '🥛',
    color: '#6B4E3D',
    scale: {
      1: '매우 가벼움',
      3: '가벼움',
      5: '중간',
      7: '풀바디',
      10: '매우 진함'
    }
  },
  balance: {
    name: '균형감',
    description: '전체적인 맛의 조화',
    emoji: '⚖️',
    color: '#4ECDC4',
    scale: {
      1: '불균형',
      3: '약간 치우침',
      5: '균형',
      7: '잘 조화',
      10: '완벽한 균형'
    }
  },
  cleanness: {
    name: '깔끔함',
    description: '뒷맛의 깔끔함',
    emoji: '✨',
    color: '#45B7D1',
    scale: {
      1: '탁함',
      3: '약간 탁함',
      5: '보통',
      7: '깔끔함',
      10: '매우 깔끔'
    }
  },
  aftertaste: {
    name: '여운',
    description: '뒷맛의 지속성과 품질',
    emoji: '🌅',
    color: '#96CEB4',
    scale: {
      1: '매우 짧음',
      3: '짧음',
      5: '적당함',
      7: '긴 여운',
      10: '매우 긴 여운'
    }
  }
};

const SensoryMouthFeelScreen: React.FC<SensoryMouthFeelScreenProps> = ({
  navigation,
  route
}) => {
  const { mode, coffeeData, brewSetupData, flavorData, sensoryExpressionData } = route.params;
  
  // State
  const [sensoryMouthFeelData, setSensoryMouthFeelData] = useState<SensoryMouthFeelData>({
    acidity: 5,
    sweetness: 5,
    bitterness: 5,
    body: 5,
    balance: 5,
    cleanness: 5,
    aftertaste: 5,
    skipped: false
  });
  
  const [isSkipped, setIsSkipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Store
  const { 
    setHasUnsavedChanges,
    setError 
  } = useTastingFlowStore();
  const { saveDraft } = useRecordStore();
  
  // Progress tracking
  const progress = useTastingFlowProgress(mode, 'SensoryMouthFeel');
  
  // Draft auto-save
  const { isSaving } = useDraftAutoSave({
    coffeeData,
    brewSetupData,
    flavorData,
    sensoryExpressionData,
    sensoryMouthFeelData,
    mode,
    currentStep: 'SensoryMouthFeel'
  }, true);
  
  // =====================================
  // Computed Values
  // =====================================
  
  // 레이더 차트 데이터
  const radarChartData = useMemo(() => {
    if (isSkipped) return [];
    
    return Object.entries(TASTE_CATEGORIES).map(([key, category]) => ({
      category: category.name,
      value: sensoryMouthFeelData[key as keyof SensoryMouthFeelData] as number,
      fullMark: 10,
      color: category.color
    }));
  }, [sensoryMouthFeelData, isSkipped]);
  
  // 전체 점수 계산
  const overallScore = useMemo(() => {
    if (isSkipped) return null;
    
    const scores = Object.values(sensoryMouthFeelData).filter(value => 
      typeof value === 'number'
    ) as number[];
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average * 10) / 10;
  }, [sensoryMouthFeelData, isSkipped]);
  
  // 점수 분석
  const scoreAnalysis = useMemo(() => {
    if (isSkipped || !overallScore) return null;
    
    if (overallScore >= 8) return { level: '훌륭함', description: '매우 만족스러운 커피', color: '#4CAF50' };
    if (overallScore >= 6) return { level: '좋음', description: '만족스러운 커피', color: '#8BC34A' };
    if (overallScore >= 4) return { level: '보통', description: '평범한 커피', color: '#FFC107' };
    return { level: '아쉬움', description: '개선이 필요한 커피', color: '#FF5722' };
  }, [overallScore, isSkipped]);
  
  // =====================================
  // Event Handlers
  // =====================================
  
  const updateMouthFeelData = useCallback((key: keyof SensoryMouthFeelData, value: number) => {
    setSensoryMouthFeelData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges]);
  
  const handleSkipToggle = useCallback((skip: boolean) => {
    setIsSkipped(skip);
    setSensoryMouthFeelData(prev => ({ ...prev, skipped: skip }));
    setHasUnsavedChanges(true);
    
    if (skip) {
      Alert.alert(
        '수치 평가 건너뛰기',
        '이 단계를 건너뛰고 다음으로 진행하시겠습니까?',
        [
          { text: '취소', style: 'cancel', onPress: () => {
            setIsSkipped(false);
            setSensoryMouthFeelData(prev => ({ ...prev, skipped: false }));
          }},
          { text: '건너뛰기', onPress: () => {
            // Keep skipped state
          }}
        ]
      );
    }
  }, [setHasUnsavedChanges]);
  
  const handleResetAll = useCallback(() => {
    Alert.alert(
      '평가 초기화',
      '모든 평가를 5점(중간값)으로 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '초기화',
          onPress: () => {
            setSensoryMouthFeelData({
              acidity: 5,
              sweetness: 5,
              bitterness: 5,
              body: 5,
              balance: 5,
              cleanness: 5,
              aftertaste: 5,
              skipped: false
            });
            setIsSkipped(false);
            setHasUnsavedChanges(true);
          }
        }
      ]
    );
  }, [setHasUnsavedChanges]);
  
  // =====================================
  // Navigation Handlers
  // =====================================
  
  const handleNext = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Draft 저장
      await saveDraft({
        mode,
        currentStep: 'SensoryMouthFeel',
        coffeeData,
        brewSetupData,
        flavorData,
        sensoryExpressionData,
        sensoryMouthFeelData
      });
      
      // 다음 화면으로 이동
      navigation.navigate('PersonalNotes', {
        mode,
        coffeeData,
        brewSetupData,
        flavorData,
        sensoryExpressionData,
        sensoryMouthFeelData
      });
      
    } catch (error) {
      console.error('Save failed:', error);
      setError('저장 중 오류가 발생했습니다.');
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [saveDraft, mode, coffeeData, brewSetupData, flavorData, sensoryExpressionData, sensoryMouthFeelData, navigation, setError]);
  
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // =====================================
  // Render Helpers
  // =====================================
  
  const renderSkipOption = useCallback(() => (
    <Card style={styles.section}>
      <View style={styles.skipContainer}>
        <View style={styles.skipTextContainer}>
          <Text style={styles.skipTitle}>수치 평가 건너뛰기</Text>
          <Text style={styles.skipDescription}>
            숫자로 평가하기 어렵다면 이 단계를 건너뛸 수 있습니다.
          </Text>
        </View>
        <Switch
          value={isSkipped}
          onValueChange={handleSkipToggle}
          trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
          thumbColor={isSkipped ? '#FFFFFF' : '#FFFFFF'}
          style={styles.skipSwitch}
        />
      </View>
    </Card>
  ), [isSkipped, handleSkipToggle]);
  
  const renderRadarChart = useCallback(() => {
    if (isSkipped) return null;
    
    return (
      <Card title="📊 맛 프로필 차트" style={styles.section}>
        <View style={styles.radarContainer}>
          <RadarChart
            data={radarChartData}
            width={300}
            height={250}
            showGrid
            showLabels
            korean
            accessible
            accessibilityLabel="커피 맛 프로필 레이더 차트"
          />
        </View>
        
        {overallScore && scoreAnalysis && (
          <View style={styles.scoreContainer}>
            <Text style={styles.overallScore}>
              전체 평점: {overallScore}/10
            </Text>
            <View style={[styles.scoreBadge, { backgroundColor: scoreAnalysis.color }]}>
              <Text style={styles.scoreBadgeText}>{scoreAnalysis.level}</Text>
            </View>
            <Text style={styles.scoreDescription}>
              {scoreAnalysis.description}
            </Text>
          </View>
        )}
      </Card>
    );
  }, [isSkipped, radarChartData, overallScore, scoreAnalysis]);
  
  const renderTasteSliders = useCallback(() => {
    if (isSkipped) return null;
    
    return (
      <Card title="🎚️ 맛 평가" style={styles.section}>
        <Text style={styles.slidersDescription}>
          각 항목별로 1-10점 사이의 점수를 매겨주세요.
        </Text>
        
        <MultipleTasteSliders
          categories={TASTE_CATEGORIES}
          values={sensoryMouthFeelData}
          onValueChange={updateMouthFeelData}
          showDescriptions
          korean
          accessible
        />
        
        <Button
          title="전체 초기화 (5점)"
          onPress={handleResetAll}
          variant="outline"
          size="small"
          style={styles.resetButton}
        />
      </Card>
    );
  }, [isSkipped, sensoryMouthFeelData, updateMouthFeelData, handleResetAll]);
  
  const renderInstructions = useCallback(() => (
    <Card title="📋 평가 가이드" style={[styles.section, styles.instructionsSection]}>
      <Text style={styles.instructionsText}>
        <Text style={styles.instructionBold}>• 산미: </Text>
        상큼함의 정도 (레몬, 오렌지 같은 느낌){'\n'}
        
        <Text style={styles.instructionBold}>• 단맛: </Text>
        자연스러운 단맛의 강도{'\n'}
        
        <Text style={styles.instructionBold}>• 쓴맛: </Text>
        커피다운 쓴맛의 정도{'\n'}
        
        <Text style={styles.instructionBold}>• 바디감: </Text>
        입 안의 무게감 (가벼움 ↔ 묵직함){'\n'}
        
        <Text style={styles.instructionBold}>• 균형감: </Text>
        모든 맛의 조화로운 정도{'\n'}
        
        <Text style={styles.instructionBold}>• 깔끔함: </Text>
        뒷맛의 깔끔한 정도{'\n'}
        
        <Text style={styles.instructionBold}>• 여운: </Text>
        맛이 지속되는 시간과 품질
      </Text>
    </Card>
  ), []);
  
  // =====================================
  // Main Render
  // =====================================
  
  if (isLoading) {
    return <Loading text="평가 데이터를 저장하는 중..." korean />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {/* Progress Header */}
        <ProgressHeader
          progress={progress}
          title={progress.stepName}
          subtitle="7항목 수치 평가 (선택사항)"
          onBack={handleBack}
          showDraftButton={isSaving}
          showProgressBar
          korean
        />
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderSkipOption()}
          
          {!isSkipped && (
            <>
              {renderRadarChart()}
              {renderTasteSliders()}
              {renderInstructions()}
            </>
          )}
          
          {isSkipped && (
            <Card style={[styles.section, styles.skippedSection]}>
              <Text style={styles.skippedText}>
                ✅ 수치 평가를 건너뛰었습니다.{'\n'}
                언제든지 위의 토글을 다시 켜서 평가할 수 있어요.
              </Text>
            </Card>
          )}
        </ScrollView>
        
        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="다음 단계"
            onPress={handleNext}
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            size="large"
            korean
            accessible
            accessibilityLabel="다음 단계로 이동"
          />
          
          <Text style={styles.nextStepHint}>
            다음: 개인 노트 및 평점
          </Text>
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
  content: {
    flex: 1
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16
  },
  skipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16
  },
  skipTextContainer: {
    flex: 1,
    marginRight: 16
  },
  skipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4
  },
  skipDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666'
  },
  skipSwitch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }]
  },
  radarContainer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12
  },
  overallScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center'
  },
  slidersDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20
  },
  resetButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 24
  },
  instructionsSection: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2'
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2C5282'
  },
  instructionBold: {
    fontWeight: '600',
    color: '#1E3A8A'
  },
  skippedSection: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#B3D4FC',
    alignItems: 'center',
    paddingVertical: 32
  },
  skippedText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1E40AF',
    textAlign: 'center'
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8'
  },
  nextStepHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#888888',
    textAlign: 'center'
  }
});

export default SensoryMouthFeelScreen;