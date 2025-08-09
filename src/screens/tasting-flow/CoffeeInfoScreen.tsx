/**
 * CoffeeInfoScreen - 커피 정보 입력 (카페 정보 통합)
 * 
 * CupNote v6 TastingFlow의 두 번째 스크린
 * - 커피 기본 정보 입력
 * - 카페 모드: 카페 정보 통합 입력
 * - HomeCafe 모드: 커피 정보만 입력
 * - Foundation Team의 CoffeeInfoData 타입 사용
 * - Korean UX 최적화 및 입력 검증
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types & Utils
import { 
  TastingFlowScreenProps,
  RecordMode,
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
  Switch,
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
  useDraftAutoSave,
  useKoreanInput,
  useImagePicker,
  useLocation
} from '../../hooks';

interface CoffeeInfoScreenProps extends TastingFlowScreenProps<{
  mode: RecordMode;
  editMode?: boolean;
  draftData?: Partial<CoffeeInfoData>;
}> {}

// 선택 옵션들 (Korean UX)
const PROCESS_OPTIONS = [
  { label: '워시드 (Washed)', value: 'washed' },
  { label: '내추럴 (Natural)', value: 'natural' },
  { label: '허니 (Honey)', value: 'honey' },
  { label: '기타', value: 'other' }
];

const ROAST_LEVEL_OPTIONS = [
  { label: '라이트 로스트', value: 'light' },
  { label: '미디엄 라이트', value: 'medium-light' },
  { label: '미디엄', value: 'medium' },
  { label: '미디엄 다크', value: 'medium-dark' },
  { label: '다크 로스트', value: 'dark' }
];

const ACCOMPANIMENT_OPTIONS = [
  { label: '혼자', value: 'alone' },
  { label: '친구들과', value: 'friends' },
  { label: '가족과', value: 'family' },
  { label: '데이트', value: 'date' },
  { label: '비즈니스', value: 'business' }
];

const DISCOVERY_METHOD_OPTIONS = [
  { label: '지인 추천', value: 'recommendation' },
  { label: '검색으로', value: 'search' },
  { label: '지나가다가', value: 'passing-by' },
  { label: 'SNS에서', value: 'social-media' }
];

const CoffeeInfoScreen: React.FC<CoffeeInfoScreenProps> = ({
  navigation,
  route
}) => {
  const { mode, editMode = false, draftData } = route.params;
  
  // State
  const [coffeeData, setCoffeeData] = useState<CoffeeInfoData>({
    name: draftData?.name || '',
    roastery: draftData?.roastery || '',
    origin: draftData?.origin || '',
    process: draftData?.process || undefined,
    variety: draftData?.variety || '',
    altitude: draftData?.altitude || '',
    roastLevel: draftData?.roastLevel || undefined,
    roastDate: draftData?.roastDate || undefined,
    price: draftData?.price || undefined,
    notes: draftData?.notes || '',
    scannedFromMenu: false,
    menuImage: undefined,
    
    // 카페 정보 (카페 모드일 때만)
    cafe: mode === 'cafe' ? {
      name: draftData?.cafe?.name || '',
      address: draftData?.cafe?.address || '',
      location: draftData?.cafe?.location || undefined,
      visitDate: draftData?.cafe?.visitDate || new Date(),
      visitTime: draftData?.cafe?.visitTime || new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      accompaniedBy: draftData?.cafe?.accompaniedBy || undefined,
      discoveryMethod: draftData?.cafe?.discoveryMethod || undefined,
      gpsDetected: false
    } : undefined
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
  const progress = useTastingFlowProgress(mode, 'CoffeeInfo');
  
  // Korean input optimization
  const coffeeNameInput = useKoreanInput(coffeeData.name, (text) => {
    updateCoffeeData('name', text);
  });
  
  const cafeNameInput = useKoreanInput(coffeeData.cafe?.name || '', (text) => {
    if (mode === 'cafe') {
      updateCoffeeData('cafe', { ...coffeeData.cafe!, name: text });
    }
  });
  
  // Image picker for menu scanning
  const { images, isLoading: imageLoading, selectImage } = useImagePicker();
  
  // Location for GPS cafe detection
  const { location, isLoading: locationLoading, getCurrentLocation } = useLocation();
  
  // Draft auto-save
  const { isSaving } = useDraftAutoSave({
    coffeeData,
    mode,
    currentStep: 'CoffeeInfo'
  }, true);
  
  // =====================================
  // Data Update Helpers
  // =====================================
  
  const updateCoffeeData = useCallback((key: keyof CoffeeInfoData, value: any) => {
    setCoffeeData(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, [validationErrors, setHasUnsavedChanges]);
  
  const updateCafeData = useCallback((key: string, value: any) => {
    if (mode !== 'cafe') return;
    
    setCoffeeData(prev => ({
      ...prev,
      cafe: {
        ...prev.cafe!,
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  }, [mode, setHasUnsavedChanges]);
  
  // =====================================
  // Event Handlers
  // =====================================
  
  const handleMenuScan = useCallback(async () => {
    try {
      const imageUri = await selectImage({
        maxWidth: 1200,
        quality: 0.9,
        allowsEditing: true
      });
      
      if (imageUri) {
        updateCoffeeData('menuImage', imageUri);
        updateCoffeeData('scannedFromMenu', true);
        
        // TODO: OCR 처리 (향후 구현)
        Alert.alert(
          '메뉴 스캔 완료',
          '메뉴 이미지가 저장되었습니다. OCR 기능은 향후 업데이트에서 제공됩니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('Menu scan failed:', error);
      Alert.alert('오류', '메뉴 스캔 중 오류가 발생했습니다.');
    }
  }, [selectImage, updateCoffeeData]);
  
  const handleGPSDetection = useCallback(async () => {
    try {
      const coords = await getCurrentLocation();
      
      if (coords && mode === 'cafe') {
        updateCafeData('location', coords);
        updateCafeData('gpsDetected', true);
        
        // TODO: 역지오코딩으로 주소 가져오기 (향후 구현)
        Alert.alert(
          'GPS 위치 확인',
          '현재 위치가 저장되었습니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('GPS detection failed:', error);
      Alert.alert('위치 오류', '위치를 가져올 수 없습니다. 수동으로 입력해주세요.');
    }
  }, [getCurrentLocation, mode, updateCafeData]);
  
  const handleValidation = useCallback(() => {
    const result = TastingFlowValidationUtils.validateCoffeeInfo(coffeeData, mode);
    setValidationErrors(result.errors);
    return result.isValid;
  }, [coffeeData, mode]);
  
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
        currentStep: 'CoffeeInfo',
        coffeeData
      });
      
      // 다음 화면으로 이동 (모드에 따라 분기)
      if (mode === 'homecafe') {
        navigation.navigate('BrewSetup', {
          mode,
          coffeeData
        });
      } else {
        navigation.navigate('FlavorSelection', {
          mode,
          coffeeData
        });
      }
      
    } catch (error) {
      console.error('Save failed:', error);
      setError('저장 중 오류가 발생했습니다.');
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [handleValidation, saveDraft, mode, coffeeData, navigation, setError]);
  
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // =====================================
  // Render Helpers
  // =====================================
  
  const renderCoffeeInfoSection = useCallback(() => (
    <Card title="☕ 커피 정보" style={styles.section}>
      <TextInput
        label="커피 이름 *"
        value={coffeeNameInput.value}
        onChangeText={coffeeNameInput.handleChangeText}
        placeholder={KoreanUXUtils.getKoreanPlaceholder('coffeeName')}
        error={validationErrors.name}
        helperText={KoreanUXUtils.getKoreanHelpText('coffeeName')}
        korean
        autoCapitalize="words"
        returnKeyType="next"
        accessible
        accessibilityLabel="커피 이름 입력"
      />
      
      <TextInput
        label="로스터리"
        value={coffeeData.roastery}
        onChangeText={(text) => updateCoffeeData('roastery', text)}
        placeholder={KoreanUXUtils.getKoreanPlaceholder('roastery')}
        helperText={KoreanUXUtils.getKoreanHelpText('roastery')}
        korean
        autoCapitalize="words"
        returnKeyType="next"
      />
      
      <TextInput
        label="원산지"
        value={coffeeData.origin}
        onChangeText={(text) => updateCoffeeData('origin', text)}
        placeholder={KoreanUXUtils.getKoreanPlaceholder('origin')}
        helperText={KoreanUXUtils.getKoreanHelpText('origin')}
        korean
        autoCapitalize="words"
        returnKeyType="next"
      />
      
      <Select
        label="가공 방식"
        value={coffeeData.process}
        onValueChange={(value) => updateCoffeeData('process', value)}
        options={PROCESS_OPTIONS}
        placeholder="가공 방식을 선택하세요"
        korean
      />
      
      <Select
        label="로스팅 레벨"
        value={coffeeData.roastLevel}
        onValueChange={(value) => updateCoffeeData('roastLevel', value)}
        options={ROAST_LEVEL_OPTIONS}
        placeholder="로스팅 레벨을 선택하세요"
        korean
      />
      
      <TextInput
        label="가격 (원)"
        value={coffeeData.price?.toString()}
        onChangeText={(text) => updateCoffeeData('price', parseInt(text) || undefined)}
        placeholder="커피 가격을 입력하세요"
        keyboardType="numeric"
        returnKeyType="next"
      />
      
      <View style={styles.menuScanContainer}>
        <Button
          title="📸 메뉴 스캔하기"
          onPress={handleMenuScan}
          disabled={imageLoading}
          loading={imageLoading}
          variant="secondary"
          size="medium"
          style={styles.menuScanButton}
        />
        {coffeeData.scannedFromMenu && (
          <Text style={styles.scannedText}>✅ 메뉴 스캔 완료</Text>
        )}
      </View>
    </Card>
  ), [coffeeNameInput, coffeeData, validationErrors, updateCoffeeData, handleMenuScan, imageLoading]);
  
  const renderCafeInfoSection = useCallback(() => {
    if (mode !== 'cafe') return null;
    
    return (
      <Card title="🏪 카페 정보" style={styles.section}>
        <TextInput
          label="카페 이름 *"
          value={cafeNameInput.value}
          onChangeText={cafeNameInput.handleChangeText}
          placeholder="방문한 카페 이름을 입력하세요"
          error={validationErrors.cafeName}
          korean
          autoCapitalize="words"
          returnKeyType="next"
          accessible
          accessibilityLabel="카페 이름 입력"
        />
        
        <TextInput
          label="주소"
          value={coffeeData.cafe?.address}
          onChangeText={(text) => updateCafeData('address', text)}
          placeholder="카페 주소를 입력하세요"
          korean
          returnKeyType="next"
          multiline
        />
        
        <View style={styles.gpsContainer}>
          <Button
            title="📍 현재 위치로 설정"
            onPress={handleGPSDetection}
            disabled={locationLoading}
            loading={locationLoading}
            variant="secondary"
            size="medium"
            style={styles.gpsButton}
          />
          {coffeeData.cafe?.gpsDetected && (
            <Text style={styles.gpsText}>✅ GPS 위치 확인</Text>
          )}
        </View>
        
        <Select
          label="함께 온 사람"
          value={coffeeData.cafe?.accompaniedBy}
          onValueChange={(value) => updateCafeData('accompaniedBy', value)}
          options={ACCOMPANIMENT_OPTIONS}
          placeholder="누구와 함께 왔는지 선택하세요"
          korean
        />
        
        <Select
          label="발견 경로"
          value={coffeeData.cafe?.discoveryMethod}
          onValueChange={(value) => updateCafeData('discoveryMethod', value)}
          options={DISCOVERY_METHOD_OPTIONS}
          placeholder="이 카페를 어떻게 알게 되었나요?"
          korean
        />
        
        <TextInput
          label="방문 시간"
          value={coffeeData.cafe?.visitTime}
          onChangeText={(text) => updateCafeData('visitTime', text)}
          placeholder="방문한 시간을 입력하세요"
          korean
        />
      </Card>
    );
  }, [mode, cafeNameInput, coffeeData.cafe, validationErrors, updateCafeData, handleGPSDetection, locationLoading]);
  
  // =====================================
  // Main Render
  // =====================================
  
  if (isLoading) {
    return <Loading text="저장하는 중..." korean />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Container>
          {/* Progress Header */}
          <ProgressHeader
            progress={progress}
            title={progress.stepName}
            subtitle={`${mode === 'cafe' ? '카페' : '홈카페'} 모드`}
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
            {renderCoffeeInfoSection()}
            {renderCafeInfoSection()}
            
            {/* Additional Notes */}
            <Card title="📝 추가 메모" style={styles.section}>
              <TextInput
                label="메모"
                value={coffeeData.notes}
                onChangeText={(text) => updateCoffeeData('notes', text)}
                placeholder="추가로 기록하고 싶은 내용이 있다면..."
                multiline
                numberOfLines={3}
                korean
                maxLength={500}
              />
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
              다음: {mode === 'homecafe' ? '브루잉 설정' : '향미 선택'}
            </Text>
          </View>
        </Container>
      </KeyboardAvoidingView>
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
  menuScanContainer: {
    marginTop: 16,
    alignItems: 'center'
  },
  menuScanButton: {
    width: '100%'
  },
  scannedText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600'
  },
  gpsContainer: {
    marginTop: 16,
    alignItems: 'center'
  },
  gpsButton: {
    width: '100%'
  },
  gpsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600'
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

export default CoffeeInfoScreen;