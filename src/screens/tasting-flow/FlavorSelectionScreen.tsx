/**
 * FlavorSelectionScreen - SCA 85개 향미 선택
 * 
 * CupNote v6 TastingFlow의 향미 선택 스크린
 * - SCA 85개 향미 휠 기반
 * - UI Components Team의 FlavorSelector 활용
 * - 다중 선택 및 강도 조절
 * - 주요 향미 자동 추출
 * - Foundation Team의 FlavorSelectionData 타입 사용
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types & Utils
import { 
  TastingFlowScreenProps,
  RecordMode,
  CoffeeInfoData,
  BrewSetupData,
  FlavorSelectionData,
  TastingFlowValidationUtils,
  TastingFlowProgressUtils,
  SCA_FLAVOR_CATEGORIES
} from '../../utils';

// Components (UI Components Team)
import { 
  Container,
  ProgressHeader,
  FlavorSelector,
  Button,
  Card,
  Slider,
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
  useDraftAutoSave
} from '../../hooks';

interface FlavorSelectionScreenProps extends TastingFlowScreenProps<{
  mode: RecordMode;
  coffeeData: CoffeeInfoData;
  brewSetupData?: BrewSetupData; // HomeCafe only
}> {}

const FlavorSelectionScreen: React.FC<FlavorSelectionScreenProps> = ({
  navigation,
  route
}) => {
  const { mode, coffeeData, brewSetupData } = route.params;
  
  // State
  const [flavorData, setFlavorData] = useState<FlavorSelectionData>({
    selectedFlavors: [],
    flavorIntensity: 3,
    customNotes: '',
    primaryFlavors: [],
    secondaryFlavors: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Store
  const { 
    setHasUnsavedChanges,
    setError 
  } = useTastingFlowStore();
  const { saveDraft } = useRecordStore();
  
  // Progress tracking
  const progress = useTastingFlowProgress(mode, 'FlavorSelection');
  
  // Draft auto-save
  const { isSaving } = useDraftAutoSave({
    coffeeData,
    brewSetupData,
    flavorData,
    mode,
    currentStep: 'FlavorSelection'
  }, true);
  
  // =====================================
  // Computed Values
  // =====================================
  
  // SCA 향미 카테고리별 정리
  const flavorCategories = useMemo(() => {
    return Object.entries(SCA_FLAVOR_CATEGORIES).map(([category, flavors]) => ({
      id: category,
      name: getCategoryKoreanName(category),
      flavors: flavors.map(flavor => ({
        id: flavor,
        name: flavor,
        koreanName: getFlavorKoreanName(flavor),
        selected: flavorData.selectedFlavors.includes(flavor)
      }))
    }));
  }, [flavorData.selectedFlavors]);
  
  // 선택된 향미 통계
  const flavorStats = useMemo(() => {
    const totalSelected = flavorData.selectedFlavors.length;
    const categoryStats = Object.keys(SCA_FLAVOR_CATEGORIES).reduce((acc, category) => {
      const categoryFlavors = SCA_FLAVOR_CATEGORIES[category as keyof typeof SCA_FLAVOR_CATEGORIES];
      const selectedInCategory = flavorData.selectedFlavors.filter(flavor => 
        categoryFlavors.includes(flavor)
      ).length;
      
      acc[category] = selectedInCategory;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalSelected, categoryStats };
  }, [flavorData.selectedFlavors]);
  
  // =====================================
  // Helper Functions
  // =====================================
  
  function getCategoryKoreanName(category: string): string {
    const categoryNames: Record<string, string> = {
      fruity: '과일향',
      sweet: '단맛',
      floral: '꽃향',
      spicy: '스파이시',
      nutty: '견과류',
      cereal: '곡물',
      other: '기타'
    };
    return categoryNames[category] || category;
  }
  
  function getFlavorKoreanName(flavor: string): string {
    const flavorNames: Record<string, string> = {
      // Fruity
      'Berry': '베리',
      'Dried Fruit': '건과일',
      'Other Fruit': '기타 과일',
      'Citrus Fruit': '감귤류',
      
      // Sweet
      'Chocolate': '초콜릿',
      'Vanilla': '바닐라',
      'Overall Sweet': '전체 단맛',
      'Sweet Aromatics': '달콤한 향',
      
      // Floral
      'Black Tea': '홍차',
      'Floral': '꽃향',
      
      // Spicy
      'Pungent': '톡 쏘는',
      'Pepper': '후추',
      'Brown Spice': '갈색 향신료',
      
      // Nutty
      'Nutty': '견과류',
      'Cocoa': '코코아',
      
      // Cereal
      'Cereal': '곡물',
      
      // Other
      'Green/Vegetative': '채소/식물',
      'Other': '기타',
      'Roasted': '로스팅',
      'Sour/Fermented': '신맛/발효'
    };
    return flavorNames[flavor] || flavor;
  }
  
  // =====================================
  // Event Handlers
  // =====================================
  
  const updateFlavorData = useCallback((key: keyof FlavorSelectionData, value: any) => {
    setFlavorData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
    
    // Clear validation error
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, [validationErrors, setHasUnsavedChanges]);
  
  const handleFlavorToggle = useCallback((flavor: string) => {
    const isSelected = flavorData.selectedFlavors.includes(flavor);
    let newSelectedFlavors: string[];
    
    if (isSelected) {
      newSelectedFlavors = flavorData.selectedFlavors.filter(f => f !== flavor);
    } else {
      if (flavorData.selectedFlavors.length >= 10) {
        Alert.alert(
          '선택 제한',
          '향미는 최대 10개까지 선택할 수 있습니다.',
          [{ text: '확인' }]
        );
        return;
      }
      newSelectedFlavors = [...flavorData.selectedFlavors, flavor];
    }
    
    updateFlavorData('selectedFlavors', newSelectedFlavors);
    
    // 주요 향미 자동 추출 (상위 3개)
    const primaryFlavors = newSelectedFlavors.slice(0, 3);
    const secondaryFlavors = newSelectedFlavors.slice(3);
    
    updateFlavorData('primaryFlavors', primaryFlavors);
    updateFlavorData('secondaryFlavors', secondaryFlavors);
  }, [flavorData.selectedFlavors, updateFlavorData]);
  
  const handleClearAll = useCallback(() => {
    Alert.alert(
      '전체 선택 해제',
      '선택한 모든 향미를 해제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '해제',
          style: 'destructive',
          onPress: () => {
            updateFlavorData('selectedFlavors', []);
            updateFlavorData('primaryFlavors', []);
            updateFlavorData('secondaryFlavors', []);
          }
        }
      ]
    );
  }, [updateFlavorData]);
  
  const handleQuickSelect = useCallback((category: string) => {
    const categoryFlavors = SCA_FLAVOR_CATEGORIES[category as keyof typeof SCA_FLAVOR_CATEGORIES];
    const notSelectedFlavors = categoryFlavors.filter(flavor => 
      !flavorData.selectedFlavors.includes(flavor)
    );
    
    if (flavorData.selectedFlavors.length + notSelectedFlavors.length > 10) {
      Alert.alert(
        '선택 제한',
        '향미는 최대 10개까지 선택할 수 있습니다.',
        [{ text: '확인' }]
      );
      return;
    }
    
    const newSelectedFlavors = [...flavorData.selectedFlavors, ...notSelectedFlavors];
    updateFlavorData('selectedFlavors', newSelectedFlavors);
    
    // 주요 향미 자동 추출
    const primaryFlavors = newSelectedFlavors.slice(0, 3);
    const secondaryFlavors = newSelectedFlavors.slice(3);
    
    updateFlavorData('primaryFlavors', primaryFlavors);
    updateFlavorData('secondaryFlavors', secondaryFlavors);
  }, [flavorData.selectedFlavors, updateFlavorData]);
  
  // =====================================
  // Navigation Handlers
  // =====================================
  
  const handleValidation = useCallback(() => {
    const result = TastingFlowValidationUtils.validateFlavorSelection(flavorData);
    setValidationErrors(result.errors);
    return result.isValid;
  }, [flavorData]);
  
  const handleNext = useCallback(async () => {
    if (!handleValidation()) {
      Alert.alert('향미 선택', '최소 1개의 향미를 선택해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Draft 저장
      await saveDraft({
        mode,
        currentStep: 'FlavorSelection',
        coffeeData,
        brewSetupData,
        flavorData
      });
      
      // 다음 화면으로 이동
      navigation.navigate('SensoryExpression', {
        mode,
        coffeeData,
        brewSetupData,
        flavorData
      });
      
    } catch (error) {
      console.error('Save failed:', error);
      setError('저장 중 오류가 발생했습니다.');
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [handleValidation, saveDraft, mode, coffeeData, brewSetupData, flavorData, navigation, setError]);
  
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // =====================================
  // Render Helpers
  // =====================================
  
  const renderFlavorStats = useCallback(() => (
    <Card title="📊 선택한 향미" style={styles.section}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{flavorStats.totalSelected}</Text>
          <Text style={styles.statLabel}>개 선택됨</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>10</Text>
          <Text style={styles.statLabel}>개 까지</Text>
        </View>
      </View>
      
      {flavorData.selectedFlavors.length > 0 && (
        <View style={styles.selectedFlavorsContainer}>
          <Text style={styles.selectedFlavorsTitle}>선택된 향미:</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedFlavorsScroll}
          >
            {flavorData.selectedFlavors.map((flavor, index) => (
              <View key={flavor} style={styles.selectedFlavorTag}>
                <Text style={styles.selectedFlavorText}>
                  {getFlavorKoreanName(flavor)}
                </Text>
                {index < 3 && (
                  <Text style={styles.primaryBadge}>주요</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      {flavorData.selectedFlavors.length > 0 && (
        <Button
          title="전체 선택 해제"
          onPress={handleClearAll}
          variant="outline"
          size="small"
          style={styles.clearButton}
        />
      )}
    </Card>
  ), [flavorStats, flavorData.selectedFlavors, handleClearAll]);
  
  const renderFlavorSelector = useCallback(() => (
    <Card title="🌸 SCA 향미 휠" style={styles.section}>
      <Text style={styles.instructionText}>
        커피에서 느꼈던 향미를 선택해주세요. (최대 10개)
      </Text>
      
      <FlavorSelector
        categories={flavorCategories}
        selectedFlavors={flavorData.selectedFlavors}
        onFlavorToggle={handleFlavorToggle}
        onQuickSelect={handleQuickSelect}
        maxSelection={10}
        korean
        showCategoryStats
        accessible
      />
      
      {validationErrors.selectedFlavors && (
        <Text style={styles.errorText}>{validationErrors.selectedFlavors}</Text>
      )}
    </Card>
  ), [flavorCategories, flavorData.selectedFlavors, handleFlavorToggle, handleQuickSelect, validationErrors]);
  
  const renderIntensitySettings = useCallback(() => (
    <Card title="💪 향미 강도" style={styles.section}>
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>
          전체 향미 강도: {flavorData.flavorIntensity}/5
        </Text>
        <Slider
          value={flavorData.flavorIntensity}
          onValueChange={(value) => updateFlavorData('flavorIntensity', Math.round(value))}
          minimumValue={1}
          maximumValue={5}
          step={1}
          style={styles.intensitySlider}
          minimumTrackTintColor="#8B7355"
          maximumTrackTintColor="#E5E5E5"
          thumbTintColor="#8B7355"
        />
        <View style={styles.intensityLabels}>
          <Text style={styles.intensityLabelText}>약함</Text>
          <Text style={styles.intensityLabelText}>보통</Text>
          <Text style={styles.intensityLabelText}>강함</Text>
        </View>
      </View>
      
      <Text style={styles.intensityDescription}>
        {flavorData.flavorIntensity === 1 ? '향미가 거의 느껴지지 않음' :
         flavorData.flavorIntensity === 2 ? '은은하게 향미가 느껴짐' :
         flavorData.flavorIntensity === 3 ? '적당한 강도의 향미' :
         flavorData.flavorIntensity === 4 ? '뚜렷하게 향미가 느껴짐' :
         '매우 강한 향미가 느껴짐'}
      </Text>
    </Card>
  ), [flavorData.flavorIntensity, updateFlavorData]);
  
  const renderCustomNotes = useCallback(() => (
    <Card title="📝 향미 노트" style={styles.section}>
      <TextInput
        label="추가 향미 설명"
        value={flavorData.customNotes}
        onChangeText={(text) => updateFlavorData('customNotes', text)}
        placeholder="다른 향미나 느낌을 자유롭게 적어보세요..."
        multiline
        numberOfLines={3}
        korean
        maxLength={300}
        helperText="예: '달콤한 오렌지 향과 함께 견과류 뒷맛이 남음'"
      />
    </Card>
  ), [flavorData.customNotes, updateFlavorData]);
  
  // =====================================
  // Main Render
  // =====================================
  
  if (isLoading) {
    return <Loading text="향미 데이터를 저장하는 중..." korean />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {/* Progress Header */}
        <ProgressHeader
          progress={progress}
          title={progress.stepName}
          subtitle="SCA 향미 휠 · 85개 향미"
          onBack={handleBack}
          showDraftButton={isSaving}
          showProgressBar
          korean
        />
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderFlavorStats()}
          {renderFlavorSelector()}
          {renderIntensitySettings()}
          {renderCustomNotes()}
          
          {/* Helpful Tips */}
          <Card title="💡 향미 선택 팁" style={[styles.section, styles.tipsSection]}>
            <Text style={styles.tipText}>
              • 첫인상부터 뒷맛까지 느꼈던 모든 향미를 선택하세요{'\n'}
              • 확실하지 않은 향미보다는 분명히 느꼈던 것을 선택하세요{'\n'}
              • 상위 3개가 주요 향미로 자동 설정됩니다{'\n'}
              • 카테고리별 일괄 선택도 가능합니다
            </Text>
          </Card>
        </ScrollView>
        
        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="다음 단계"
            onPress={handleNext}
            disabled={isLoading || flavorData.selectedFlavors.length === 0}
            loading={isLoading}
            variant="primary"
            size="large"
            korean
            accessible
            accessibilityLabel="다음 단계로 이동"
          />
          
          <Text style={styles.nextStepHint}>
            다음: 감각 표현 (44개 한국어 표현)
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
  selectedFlavorsContainer: {
    marginBottom: 16
  },
  selectedFlavorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8
  },
  selectedFlavorsScroll: {
    flexDirection: 'row'
  },
  selectedFlavorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F4FD',
    borderRadius: 16,
    marginRight: 8
  },
  selectedFlavorText: {
    fontSize: 14,
    color: '#2C5282',
    fontWeight: '500'
  },
  primaryBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FFB020',
    borderRadius: 8,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  clearButton: {
    alignSelf: 'center',
    paddingHorizontal: 20
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center'
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FF3B30'
  },
  intensityContainer: {
    marginBottom: 16
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center'
  },
  intensitySlider: {
    width: '100%',
    height: 40,
    marginBottom: 8
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },
  intensityLabelText: {
    fontSize: 12,
    color: '#888888'
  },
  intensityDescription: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    fontWeight: '500'
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

export default FlavorSelectionScreen;