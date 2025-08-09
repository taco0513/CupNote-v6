/**
 * SensoryExpressionScreen - 44개 한국어 감각 표현
 * 
 * CupNote v6 TastingFlow의 핵심 한국 UX 스크린
 * - Database Team의 44개 한국어 감각 표현 활용
 * - 7개 카테고리별 그룹화 표시
 * - 다중 선택 및 강도 조절
 * - 한국 커피 문화에 특화된 UX
 * - Foundation Team의 SensoryExpressionData 타입 사용
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
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
  TastingFlowProgressUtils,
  SENSORY_EXPRESSIONS,
  KoreanSensoryUtils
} from '../../utils';

// Components (UI Components Team)
import { 
  Container,
  ProgressHeader,
  Button,
  Card,
  TextInput,
  Loading
} from '../../components';

// Store & Hooks
import { 
  useTastingFlowStore,
  useRecordStore 
} from '../../store';
import { 
  useTastingFlowProgress,
  useDraftAutoSave,
  useKoreanInput
} from '../../hooks';

interface SensoryExpressionScreenProps extends TastingFlowScreenProps<{
  mode: RecordMode;
  coffeeData: CoffeeInfoData;
  brewSetupData?: BrewSetupData;
  flavorData: FlavorSelectionData;
}> {}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 카테고리별 한국어 이름과 색상
const CATEGORY_INFO = {
  sweetness: { name: '단맛', color: '#FFB020', emoji: '🍯' },
  acidity: { name: '산미', color: '#FF6B6B', emoji: '🍋' },
  bitterness: { name: '쓴맛', color: '#8B4513', emoji: '☕' },
  body: { name: '바디감', color: '#6B4E3D', emoji: '🥛' },
  flavor: { name: '향미', color: '#4ECDC4', emoji: '🌸' },
  aftertaste: { name: '여운', color: '#45B7D1', emoji: '✨' },
  overall: { name: '전체 느낌', color: '#96CEB4', emoji: '⭐' }
};

const SensoryExpressionScreen: React.FC<SensoryExpressionScreenProps> = ({
  navigation,
  route
}) => {
  const { mode, coffeeData, brewSetupData, flavorData } = route.params;
  
  // State
  const [sensoryExpressionData, setSensoryExpressionData] = useState<SensoryExpressionData>({
    sweetness: [],
    acidity: [],
    bitterness: [],
    body: [],
    flavor: [],
    aftertaste: [],
    overall: [],
    customExpression: ''
  });
  
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof SENSORY_EXPRESSIONS>('sweetness');
  const [isLoading, setIsLoading] = useState(false);
  
  // Store
  const { 
    setHasUnsavedChanges,
    setError 
  } = useTastingFlowStore();
  const { saveDraft } = useRecordStore();
  
  // Progress tracking
  const progress = useTastingFlowProgress(mode, 'SensoryExpression');
  
  // Korean input for custom expression
  const customExpressionInput = useKoreanInput(
    sensoryExpressionData.customExpression || '',
    (text) => updateSensoryData('customExpression', text)
  );
  
  // Draft auto-save
  const { isSaving } = useDraftAutoSave({
    coffeeData,
    brewSetupData,
    flavorData,
    sensoryExpressionData,
    mode,
    currentStep: 'SensoryExpression'
  }, true);
  
  // =====================================
  // Computed Values
  // =====================================
  
  // 선택된 표현들 통계
  const expressionStats = useMemo(() => {
    const totalSelected = Object.values(sensoryExpressionData)
      .filter((value): value is string[] => Array.isArray(value))
      .reduce((sum, arr) => sum + arr.length, 0);
    
    const categoryStats = Object.entries(sensoryExpressionData)
      .filter(([key, value]) => key !== 'customExpression' && Array.isArray(value))
      .reduce((acc, [category, expressions]) => {
        acc[category] = (expressions as string[]).length;
        return acc;
      }, {} as Record<string, number>);
    
    return { totalSelected, categoryStats };
  }, [sensoryExpressionData]);
  
  // 추천 표현들 (향미 선택 기반)
  const recommendedExpressions = useMemo(() => {
    // 선택된 향미를 기반으로 관련 한국어 표현 추천
    const recommendations: Record<string, string[]> = {
      sweetness: [],
      acidity: [],
      bitterness: [],
      body: [],
      flavor: [],
      aftertaste: [],
      overall: []
    };
    
    // 과일향이 선택된 경우
    if (flavorData.selectedFlavors.some(f => f.includes('Berry') || f.includes('Fruit'))) {
      recommendations.sweetness.push('과일 같은');
      recommendations.acidity.push('과일 산미');
      recommendations.flavor.push('베리 향');
    }
    
    // 초콜릿이 선택된 경우
    if (flavorData.selectedFlavors.includes('Chocolate')) {
      recommendations.sweetness.push('초콜릿 같은');
      recommendations.bitterness.push('다크초콜릿 같은');
      recommendations.flavor.push('초콜릿 향');
    }
    
    return recommendations;
  }, [flavorData.selectedFlavors]);
  
  // =====================================
  // Event Handlers
  // =====================================
  
  const updateSensoryData = useCallback((key: keyof SensoryExpressionData, value: any) => {
    setSensoryExpressionData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges]);
  
  const handleExpressionToggle = useCallback((category: keyof typeof SENSORY_EXPRESSIONS, expression: string) => {
    const currentExpressions = sensoryExpressionData[category] as string[] || [];
    const isSelected = currentExpressions.includes(expression);
    
    let newExpressions: string[];
    if (isSelected) {
      newExpressions = currentExpressions.filter(e => e !== expression);
    } else {
      if (currentExpressions.length >= 5) {
        Alert.alert(
          '선택 제한',
          '카테고리당 최대 5개까지 선택할 수 있습니다.',
          [{ text: '확인' }]
        );
        return;
      }
      newExpressions = [...currentExpressions, expression];
    }
    
    updateSensoryData(category, newExpressions);
  }, [sensoryExpressionData, updateSensoryData]);
  
  const handleCategoryClear = useCallback((category: keyof typeof SENSORY_EXPRESSIONS) => {
    Alert.alert(
      '카테고리 선택 해제',
      `${CATEGORY_INFO[category].name} 카테고리의 모든 선택을 해제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '해제',
          style: 'destructive',
          onPress: () => updateSensoryData(category, [])
        }
      ]
    );
  }, [updateSensoryData]);
  
  const handleAllClear = useCallback(() => {
    Alert.alert(
      '전체 선택 해제',
      '모든 감각 표현 선택을 해제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '해제',
          style: 'destructive',
          onPress: () => {
            setSensoryExpressionData({
              sweetness: [],
              acidity: [],
              bitterness: [],
              body: [],
              flavor: [],
              aftertaste: [],
              overall: [],
              customExpression: ''
            });
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
    // 최소 1개 표현 선택 체크
    const hasSelections = Object.values(sensoryExpressionData).some(value => 
      Array.isArray(value) && value.length > 0
    ) || !!sensoryExpressionData.customExpression?.trim();
    
    if (!hasSelections) {
      Alert.alert(
        '감각 표현 선택',
        '최소 1개의 감각 표현을 선택하거나 직접 입력해주세요.',
        [{ text: '확인' }]
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Draft 저장
      await saveDraft({
        mode,
        currentStep: 'SensoryExpression',
        coffeeData,
        brewSetupData,
        flavorData,
        sensoryExpressionData
      });
      
      // 다음 화면으로 이동
      navigation.navigate('SensoryMouthFeel', {
        mode,
        coffeeData,
        brewSetupData,
        flavorData,
        sensoryExpressionData
      });
      
    } catch (error) {
      console.error('Save failed:', error);
      setError('저장 중 오류가 발생했습니다.');
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [sensoryExpressionData, saveDraft, mode, coffeeData, brewSetupData, flavorData, navigation, setError]);
  
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // =====================================
  // Render Helpers
  // =====================================
  
  const renderCategoryTabs = useCallback(() => (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabs}
      contentContainerStyle={styles.categoryTabsContent}
    >
      {Object.entries(CATEGORY_INFO).map(([category, info]) => {
        const isSelected = selectedCategory === category;
        const count = expressionStats.categoryStats[category] || 0;
        
        return (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              isSelected && styles.selectedCategoryTab,
              { borderBottomColor: info.color }
            ]}
            onPress={() => setSelectedCategory(category as keyof typeof SENSORY_EXPRESSIONS)}
            accessible
            accessibilityLabel={`${info.name} 카테고리 선택`}
            accessibilityHint={`${count}개 선택됨`}
          >
            <Text style={styles.categoryEmoji}>{info.emoji}</Text>
            <Text style={[
              styles.categoryTabText,
              isSelected && styles.selectedCategoryTabText
            ]}>
              {info.name}
            </Text>
            {count > 0 && (
              <View style={[styles.categoryBadge, { backgroundColor: info.color }]}>
                <Text style={styles.categoryBadgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  ), [selectedCategory, expressionStats.categoryStats]);
  
  const renderExpressionGrid = useCallback(() => {
    const categoryExpressions = KoreanSensoryUtils.getExpressionsByCategory(selectedCategory);
    const selectedExpressions = sensoryExpressionData[selectedCategory] as string[] || [];
    const categoryInfo = CATEGORY_INFO[selectedCategory];
    const recommendations = recommendedExpressions[selectedCategory] || [];
    
    return (
      <Card 
        title={`${categoryInfo.emoji} ${categoryInfo.name} 표현`}
        style={styles.section}
      >
        <Text style={styles.categoryDescription}>
          이 커피의 {categoryInfo.name}에 대해 어떻게 느끼셨나요?
        </Text>
        
        {selectedExpressions.length > 0 && (
          <View style={styles.selectedExpressionsContainer}>
            <Text style={styles.selectedExpressionsTitle}>선택된 표현:</Text>
            <View style={styles.selectedExpressions}>
              {selectedExpressions.map(expression => (
                <View key={expression} style={[styles.selectedExpressionTag, { backgroundColor: categoryInfo.color + '20' }]}>
                  <Text style={[styles.selectedExpressionText, { color: categoryInfo.color }]}>
                    {expression}
                  </Text>
                </View>
              ))}
            </View>
            <Button
              title="카테고리 선택 해제"
              onPress={() => handleCategoryClear(selectedCategory)}
              variant="outline"
              size="small"
              style={styles.clearCategoryButton}
            />
          </View>
        )}
        
        {recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>💡 추천 표현:</Text>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {recommendations.map(expression => (
                <TouchableOpacity
                  key={expression}
                  style={[
                    styles.recommendedExpressionChip,
                    { backgroundColor: categoryInfo.color + '10', borderColor: categoryInfo.color }
                  ]}
                  onPress={() => handleExpressionToggle(selectedCategory, expression)}
                >
                  <Text style={[styles.recommendedExpressionText, { color: categoryInfo.color }]}>
                    {expression}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.expressionsGrid}>
          {categoryExpressions.map(expression => {
            const isSelected = selectedExpressions.includes(expression);
            
            return (
              <TouchableOpacity
                key={expression}
                style={[
                  styles.expressionChip,
                  isSelected && [styles.selectedExpressionChip, { backgroundColor: categoryInfo.color }]
                ]}
                onPress={() => handleExpressionToggle(selectedCategory, expression)}
                disabled={!isSelected && selectedExpressions.length >= 5}
                accessible
                accessibilityLabel={expression}
                accessibilityHint={isSelected ? '선택됨' : '선택하기'}
              >
                <Text style={[
                  styles.expressionChipText,
                  isSelected && styles.selectedExpressionChipText
                ]}>
                  {expression}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        <Text style={styles.categoryHint}>
          {selectedExpressions.length}/5개 선택됨 • 탭해서 선택/해제
        </Text>
      </Card>
    );
  }, [selectedCategory, sensoryExpressionData, recommendedExpressions, handleExpressionToggle, handleCategoryClear]);
  
  const renderStats = useCallback(() => (
    <Card title="📊 선택 현황" style={styles.section}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{expressionStats.totalSelected}</Text>
          <Text style={styles.statLabel}>개 선택됨</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Object.keys(expressionStats.categoryStats).filter(cat => 
              expressionStats.categoryStats[cat] > 0
            ).length}
          </Text>
          <Text style={styles.statLabel}>개 카테고리</Text>
        </View>
      </View>
      
      {expressionStats.totalSelected > 0 && (
        <Button
          title="전체 선택 해제"
          onPress={handleAllClear}
          variant="outline"
          size="small"
          style={styles.clearAllButton}
        />
      )}
    </Card>
  ), [expressionStats, handleAllClear]);
  
  const renderCustomExpression = useCallback(() => (
    <Card title="✍️ 직접 표현하기" style={styles.section}>
      <TextInput
        label="나만의 감각 표현"
        value={customExpressionInput.value}
        onChangeText={customExpressionInput.handleChangeText}
        placeholder="다른 표현이나 느낌을 자유롭게 적어보세요..."
        multiline
        numberOfLines={3}
        korean
        maxLength={200}
        helperText="예: '어머니가 끓여주신 커피처럼 따뜻하고 포근한 느낌'"
        style={styles.customExpressionInput}
      />
      
      {customExpressionInput.isComposing && (
        <Text style={styles.composingText}>입력 중...</Text>
      )}
    </Card>
  ), [customExpressionInput]);
  
  // =====================================
  // Main Render
  // =====================================
  
  if (isLoading) {
    return <Loading text="감각 표현을 저장하는 중..." korean />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {/* Progress Header */}
        <ProgressHeader
          progress={progress}
          title={progress.stepName}
          subtitle="44개 한국어 감각 표현"
          onBack={handleBack}
          showDraftButton={isSaving}
          showProgressBar
          korean
        />
        
        {/* Category Tabs */}
        {renderCategoryTabs()}
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStats()}
          {renderExpressionGrid()}
          {renderCustomExpression()}
          
          {/* Usage Tips */}
          <Card title="💡 감각 표현 팁" style={[styles.section, styles.tipsSection]}>
            <Text style={styles.tipText}>
              • 각 카테고리별로 최대 5개씩 선택할 수 있어요{'\n'}
              • 확실하게 느꼈던 표현만 선택하세요{'\n'}
              • 선택된 향미를 기반으로 추천 표현을 제공해요{'\n'}
              • 적절한 표현이 없다면 직접 입력해보세요
            </Text>
          </Card>
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
            다음: 수치 평가 (7항목 슬라이더)
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
  categoryTabs: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF'
  },
  categoryTabsContent: {
    paddingHorizontal: 20
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  selectedCategoryTab: {
    borderBottomWidth: 3
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500'
  },
  selectedCategoryTabText: {
    color: '#333333',
    fontWeight: '600'
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  content: {
    flex: 1
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16
  },
  categoryDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 20
  },
  selectedExpressionsContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8
  },
  selectedExpressionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8
  },
  selectedExpressions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  selectedExpressionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  selectedExpressionText: {
    fontSize: 14,
    fontWeight: '500'
  },
  clearCategoryButton: {
    alignSelf: 'center',
    paddingHorizontal: 20
  },
  recommendationsContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD54F'
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 8
  },
  recommendedExpressionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8
  },
  recommendedExpressionText: {
    fontSize: 14,
    fontWeight: '500'
  },
  expressionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  expressionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: (SCREEN_WIDTH - 80) / 3
  },
  selectedExpressionChip: {
    borderColor: 'transparent'
  },
  expressionChipText: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
    fontWeight: '500'
  },
  selectedExpressionChipText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  categoryHint: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8F7F5',
    borderRadius: 8,
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B7355',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#666666'
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#D0D0D0'
  },
  clearAllButton: {
    alignSelf: 'center',
    paddingHorizontal: 20
  },
  customExpressionInput: {
    minHeight: 100
  },
  composingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#4A90E2',
    fontStyle: 'italic'
  },
  tipsSection: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2'
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2C5282'
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

export default SensoryExpressionScreen;