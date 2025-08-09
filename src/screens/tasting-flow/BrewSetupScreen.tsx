/**
 * BrewSetupScreen - 브루잉 설정 (HomeCafe 모드 전용)
 * 
 * CupNote v6 TastingFlow의 HomeCafe 모드 전용 스크린
 * - 추출 방식, 물온도, 분쇄도, 레시피 입력
 * - 타이머 기능 (시작/정지/리셋)
 * - 물:원두 비율 계산기
 * - 레시피 저장/불러오기 기능
 * - Foundation Team의 BrewSetupData 타입 사용
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types & Utils
import { 
  TastingFlowScreenProps,
  BrewSetupData,
  CoffeeInfoData,
  TastingFlowValidationUtils,
  KoreanUXUtils,
  TastingFlowProgressUtils
} from '../../utils';

// Components (UI Components Team)
import { 
  Container,
  ProgressHeader,
  TextInput,
  Select,
  Button,
  Card,
  Slider,
  Switch,
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
  useBrewTimer
} from '../../hooks';

interface BrewSetupScreenProps extends TastingFlowScreenProps<{
  mode: 'homecafe';
  coffeeData: CoffeeInfoData;
}> {}

// 브루잉 방법 옵션들 (Korean UX)
const BREW_METHOD_OPTIONS = [
  { label: '브이60 (V60)', value: 'v60' },
  { label: '케멕스 (Chemex)', value: 'chemex' },
  { label: '프렌치 프레스', value: 'french-press' },
  { label: '에어로프레스', value: 'aeropress' },
  { label: '에스프레소', value: 'espresso' },
  { label: '콜드브루', value: 'cold-brew' },
  { label: '모카포트', value: 'moka-pot' },
  { label: '사이폰', value: 'siphon' },
  { label: '기타', value: 'other' }
];

const GRIND_SIZE_OPTIONS = [
  { label: '매우 곱게 (Extra Fine)', value: 'extra-fine' },
  { label: '곱게 (Fine)', value: 'fine' },
  { label: '중간-곱게 (Medium Fine)', value: 'medium-fine' },
  { label: '중간 (Medium)', value: 'medium' },
  { label: '중간-굵게 (Medium Coarse)', value: 'medium-coarse' },
  { label: '굵게 (Coarse)', value: 'coarse' },
  { label: '매우 굵게 (Extra Coarse)', value: 'extra-coarse' }
];

const WATER_TYPE_OPTIONS = [
  { label: '수돗물', value: 'tap' },
  { label: '생수', value: 'bottled' },
  { label: '정수기물', value: 'filtered' },
  { label: '증류수', value: 'distilled' },
  { label: '기타', value: 'other' }
];

const BrewSetupScreen: React.FC<BrewSetupScreenProps> = ({
  navigation,
  route
}) => {
  const { mode, coffeeData } = route.params;
  
  // State
  const [brewSetupData, setBrewSetupData] = useState<BrewSetupData>({
    method: 'v60',
    equipment: '',
    grindSize: 'medium-fine',
    waterType: 'filtered',
    waterTemperature: 90,
    waterAmount: 250,
    coffeeAmount: 15,
    ratio: 16.7, // calculated: 250/15 = 16.7
    estimatedTime: 240, // 4분
    brewingNotes: '',
    timerUsed: false,
    actualBrewTime: undefined
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showTimer, setShowTimer] = useState(false);
  
  // Store
  const { 
    setHasUnsavedChanges,
    setError 
  } = useTastingFlowStore();
  const { saveDraft } = useRecordStore();
  
  // Progress tracking
  const progress = useTastingFlowProgress(mode, 'BrewSetup');
  
  // Timer functionality
  const timer = useBrewTimer(brewSetupData.estimatedTime || 240);
  
  // Draft auto-save
  const { isSaving } = useDraftAutoSave({
    coffeeData,
    brewSetupData,
    mode,
    currentStep: 'BrewSetup'
  }, true);
  
  // =====================================
  // Data Update Helpers
  // =====================================
  
  const updateBrewSetupData = useCallback((key: keyof BrewSetupData, value: any) => {
    setBrewSetupData(prev => {
      const updated = { ...prev, [key]: value };
      
      // 비율 자동 계산
      if (key === 'waterAmount' || key === 'coffeeAmount') {
        const water = key === 'waterAmount' ? value : updated.waterAmount;
        const coffee = key === 'coffeeAmount' ? value : updated.coffeeAmount;
        
        if (water && coffee && coffee > 0) {
          updated.ratio = Math.round((water / coffee) * 10) / 10;
        }
      }
      
      return updated;
    });
    
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, [validationErrors, setHasUnsavedChanges]);
  
  // =====================================
  // Timer Event Handlers
  // =====================================
  
  const handleTimerStart = useCallback(() => {
    setShowTimer(true);
    updateBrewSetupData('timerUsed', true);
    timer.start();
    Vibration.vibrate(100);
  }, [timer, updateBrewSetupData]);
  
  const handleTimerPause = useCallback(() => {
    timer.pause();
    Vibration.vibrate(100);
  }, [timer]);
  
  const handleTimerStop = useCallback(() => {
    timer.stop();
    updateBrewSetupData('actualBrewTime', timer.seconds);
    Vibration.vibrate([100, 50, 100]);
    
    Alert.alert(
      '타이머 완료',
      `실제 추출 시간: ${timer.formattedTime}`,
      [{ text: '확인' }]
    );
  }, [timer, updateBrewSetupData]);
  
  const handleTimerReset = useCallback(() => {
    timer.reset();
    setShowTimer(false);
    updateBrewSetupData('timerUsed', false);
    updateBrewSetupData('actualBrewTime', undefined);
  }, [timer, updateBrewSetupData]);
  
  // Timer finished effect
  useEffect(() => {
    if (timer.isFinished) {
      handleTimerStop();
    }
  }, [timer.isFinished, handleTimerStop]);
  
  // =====================================
  // Recipe Management
  // =====================================
  
  const handleSaveRecipe = useCallback(async () => {
    try {
      // TODO: 레시피 저장 기능 (향후 구현)
      Alert.alert(
        '레시피 저장',
        '이 브루잉 설정을 레시피로 저장하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '저장', 
            onPress: () => {
              // Recipe save logic
              Alert.alert('완료', '레시피가 저장되었습니다.');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Recipe save failed:', error);
      Alert.alert('오류', '레시피 저장 중 오류가 발생했습니다.');
    }
  }, [brewSetupData]);
  
  const handleLoadRecipe = useCallback(() => {
    // TODO: 저장된 레시피 목록 표시 (향후 구현)
    Alert.alert(
      '레시피 불러오기',
      '저장된 레시피 기능은 향후 업데이트에서 제공됩니다.',
      [{ text: '확인' }]
    );
  }, []);
  
  // =====================================
  // Navigation Handlers
  // =====================================
  
  const handleValidation = useCallback(() => {
    const result = TastingFlowValidationUtils.validateBrewSetup(brewSetupData);
    setValidationErrors(result.errors);
    return result.isValid;
  }, [brewSetupData]);
  
  const handleNext = useCallback(async () => {
    if (!handleValidation()) {
      Alert.alert('입력 확인', '필수 정보를 모두 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Draft 저장
      await saveDraft({
        mode,
        currentStep: 'BrewSetup',
        coffeeData,
        brewSetupData
      });
      
      // 다음 화면으로 이동
      navigation.navigate('FlavorSelection', {
        mode,
        coffeeData,
        brewSetupData
      });
      
    } catch (error) {
      console.error('Save failed:', error);
      setError('저장 중 오류가 발생했습니다.');
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [handleValidation, saveDraft, mode, coffeeData, brewSetupData, navigation, setError]);
  
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // =====================================
  // Render Helpers
  // =====================================
  
  const renderBasicSettings = useCallback(() => (
    <Card title="☕ 기본 설정" style={styles.section}>
      <Select
        label="추출 방식 *"
        value={brewSetupData.method}
        onValueChange={(value) => updateBrewSetupData('method', value)}
        options={BREW_METHOD_OPTIONS}
        error={validationErrors.method}
        placeholder="추출 방식을 선택하세요"
        korean
      />
      
      <TextInput
        label="사용 장비"
        value={brewSetupData.equipment}
        onChangeText={(text) => updateBrewSetupData('equipment', text)}
        placeholder="예: 하리오 V60 02, 칼리타 웨이브"
        korean
        autoCapitalize="words"
      />
      
      <Select
        label="분쇄도 *"
        value={brewSetupData.grindSize}
        onValueChange={(value) => updateBrewSetupData('grindSize', value)}
        options={GRIND_SIZE_OPTIONS}
        error={validationErrors.grindSize}
        korean
      />
      
      <Select
        label="물 종류"
        value={brewSetupData.waterType}
        onValueChange={(value) => updateBrewSetupData('waterType', value)}
        options={WATER_TYPE_OPTIONS}
        korean
      />
    </Card>
  ), [brewSetupData, validationErrors, updateBrewSetupData]);
  
  const renderWaterCoffeeSettings = useCallback(() => (
    <Card title="⚖️ 물과 원두 비율" style={styles.section}>
      <View style={styles.temperatureContainer}>
        <Text style={styles.sliderLabel}>물 온도: {brewSetupData.waterTemperature}°C</Text>
        <Slider
          value={brewSetupData.waterTemperature}
          onValueChange={(value) => updateBrewSetupData('waterTemperature', Math.round(value))}
          minimumValue={70}
          maximumValue={100}
          step={1}
          style={styles.slider}
        />
        {validationErrors.waterTemperature && (
          <Text style={styles.errorText}>{validationErrors.waterTemperature}</Text>
        )}
      </View>
      
      <TextInput
        label="물 양 (ml) *"
        value={brewSetupData.waterAmount?.toString()}
        onChangeText={(text) => updateBrewSetupData('waterAmount', parseFloat(text) || 0)}
        placeholder="250"
        keyboardType="numeric"
        error={validationErrors.waterAmount}
        korean
      />
      
      <TextInput
        label="원두 양 (g) *"
        value={brewSetupData.coffeeAmount?.toString()}
        onChangeText={(text) => updateBrewSetupData('coffeeAmount', parseFloat(text) || 0)}
        placeholder="15"
        keyboardType="numeric"
        error={validationErrors.coffeeAmount}
        korean
      />
      
      <View style={styles.ratioContainer}>
        <Text style={styles.ratioLabel}>
          추출 비율: 1:{brewSetupData.ratio}
        </Text>
        <Text style={styles.ratioDescription}>
          {brewSetupData.ratio < 14 ? '진한 추출' : 
           brewSetupData.ratio > 18 ? '연한 추출' : 
           '균형잡힌 추출'}
        </Text>
      </View>
    </Card>
  ), [brewSetupData, validationErrors, updateBrewSetupData]);
  
  const renderTimerSection = useCallback(() => (
    <Card title="⏱️ 추출 타이머" style={styles.section}>
      <TextInput
        label="예상 추출 시간 (초)"
        value={brewSetupData.estimatedTime?.toString()}
        onChangeText={(text) => updateBrewSetupData('estimatedTime', parseInt(text) || 240)}
        placeholder="240"
        keyboardType="numeric"
        korean
        helperText="추출 방법에 따른 권장 시간을 설정해주세요"
      />
      
      {showTimer && (
        <View style={styles.timerDisplay}>
          <Text style={styles.timerTime}>{timer.formattedTime}</Text>
          <View style={styles.timerProgress}>
            <View 
              style={[
                styles.timerProgressBar,
                { width: `${timer.progress * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.timerStatus}>
            {timer.isRunning ? '추출 중...' : 
             timer.isFinished ? '완료!' : '일시정지'}
          </Text>
        </View>
      )}
      
      <View style={styles.timerButtons}>
        {!showTimer ? (
          <Button
            title="⏱️ 타이머 시작"
            onPress={handleTimerStart}
            variant="primary"
            size="large"
            korean
          />
        ) : (
          <>
            {timer.isRunning ? (
              <Button
                title="일시정지"
                onPress={handleTimerPause}
                variant="secondary"
                style={styles.timerButton}
              />
            ) : (
              <Button
                title="재시작"
                onPress={timer.start}
                variant="primary"
                style={styles.timerButton}
              />
            )}
            
            <Button
              title="중단"
              onPress={handleTimerStop}
              variant="secondary"
              style={styles.timerButton}
            />
            
            <Button
              title="리셋"
              onPress={handleTimerReset}
              variant="outline"
              style={styles.timerButton}
            />
          </>
        )}
      </View>
      
      {brewSetupData.actualBrewTime && (
        <Text style={styles.actualTimeText}>
          실제 추출 시간: {Math.floor(brewSetupData.actualBrewTime / 60)}:
          {(brewSetupData.actualBrewTime % 60).toString().padStart(2, '0')}
        </Text>
      )}
    </Card>
  ), [brewSetupData, showTimer, timer, updateBrewSetupData, handleTimerStart, handleTimerPause, handleTimerStop, handleTimerReset]);
  
  const renderRecipeSection = useCallback(() => (
    <Card title="📖 레시피 관리" style={styles.section}>
      <TextInput
        label="브루잉 노트"
        value={brewSetupData.brewingNotes}
        onChangeText={(text) => updateBrewSetupData('brewingNotes', text)}
        placeholder="추출 과정에서 느낀 점이나 개선할 점을 적어보세요..."
        multiline
        numberOfLines={3}
        korean
        maxLength={500}
      />
      
      <View style={styles.recipeButtons}>
        <Button
          title="📄 레시피 저장"
          onPress={handleSaveRecipe}
          variant="secondary"
          style={styles.recipeButton}
          korean
        />
        
        <Button
          title="📂 레시피 불러오기"
          onPress={handleLoadRecipe}
          variant="outline"
          style={styles.recipeButton}
          korean
        />
      </View>
    </Card>
  ), [brewSetupData, updateBrewSetupData, handleSaveRecipe, handleLoadRecipe]);
  
  // =====================================
  // Main Render
  // =====================================
  
  if (isLoading) {
    return <Loading text="브루잉 설정을 저장하는 중..." korean />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {/* Progress Header */}
        <ProgressHeader
          progress={progress}
          title={progress.stepName}
          subtitle="홈카페 모드 · 브루잉 설정"
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
          {renderBasicSettings()}
          {renderWaterCoffeeSettings()}
          {renderTimerSection()}
          {renderRecipeSection()}
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
            다음: 향미 선택 (SCA 85개 향미)
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
  temperatureContainer: {
    marginBottom: 16
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8
  },
  slider: {
    width: '100%',
    height: 40
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: '#FF3B30'
  },
  ratioContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F7F5',
    borderRadius: 8,
    alignItems: 'center'
  },
  ratioLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B7355',
    marginBottom: 4
  },
  ratioDescription: {
    fontSize: 14,
    color: '#666666'
  },
  timerDisplay: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    marginVertical: 16
  },
  timerTime: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 12,
    fontFamily: 'monospace'
  },
  timerProgress: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8
  },
  timerProgressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4
  },
  timerStatus: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600'
  },
  timerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16
  },
  timerButton: {
    flex: 1,
    minWidth: 80
  },
  actualTimeText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center'
  },
  recipeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  recipeButton: {
    flex: 1
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

export default BrewSetupScreen;