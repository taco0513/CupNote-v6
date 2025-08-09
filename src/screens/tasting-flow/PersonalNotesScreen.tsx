/**
 * PersonalNotesScreen - 개인 노트 및 최종 평가
 * 
 * CupNote v6 TastingFlow의 마지막 입력 스크린
 * - 자유 텍스트 입력 (한글 IME 최적화)
 * - 총평 별점 (1-5점)
 * - 사진 추가 기능
 * - 음성 메모 (선택사항)
 * - 커뮤니티 공유 설정
 * - Foundation Team의 PersonalNotesData 타입 사용
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity
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
  PersonalNotesData,
  TastingFlowValidationUtils,
  TastingFlowProgressUtils,
  KoreanUXUtils
} from '../../utils';

// Components (UI Components Team)
import { 
  Container,
  ProgressHeader,
  TextInput,
  Button,
  Card,
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
  useKoreanInput,
  useImagePicker
} from '../../hooks';

interface PersonalNotesScreenProps extends TastingFlowScreenProps<{
  mode: RecordMode;
  coffeeData: CoffeeInfoData;
  brewSetupData?: BrewSetupData;
  flavorData: FlavorSelectionData;
  sensoryExpressionData: SensoryExpressionData;
  sensoryMouthFeelData?: SensoryMouthFeelData;
}> {}

// 별점 컴포넌트
const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}> = ({ rating, onRatingChange, size = 32, disabled = false }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          accessible
          accessibilityLabel={`${star}점 평가`}
          accessibilityHint={`현재 ${rating}점 중 ${star}점`}
        >
          <Text 
            style={[
              styles.star, 
              { fontSize: size, color: star <= rating ? '#FFD700' : '#D1D5DB' }
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 사진 그리드 컴포넌트
const PhotoGrid: React.FC<{
  photos: string[];
  onPhotoPress: (photo: string) => void;
  onRemovePhoto: (photo: string) => void;
}> = ({ photos, onPhotoPress, onRemovePhoto }) => {
  if (photos.length === 0) return null;
  
  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.photoGrid}
    >
      {photos.map((photo, index) => (
        <View key={index} style={styles.photoContainer}>
          <TouchableOpacity onPress={() => onPhotoPress(photo)}>
            <Image source={{ uri: photo }} style={styles.photo} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.photoRemoveButton}
            onPress={() => onRemovePhoto(photo)}
            accessible
            accessibilityLabel="사진 삭제"
          >
            <Text style={styles.photoRemoveText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const PersonalNotesScreen: React.FC<PersonalNotesScreenProps> = ({
  navigation,
  route
}) => {
  const { mode, coffeeData, brewSetupData, flavorData, sensoryExpressionData, sensoryMouthFeelData } = route.params;
  
  // State
  const [personalNotesData, setPersonalNotesData] = useState<PersonalNotesData>({
    rating: 3,
    personalNotes: '',
    mood: '',
    context: '',
    photos: [],
    shareWithCommunity: true,
    tags: [],
    weather: '',
    price: coffeeData.price,
    repurchaseIntent: 3,
    wouldRecommend: true,
    publicReview: ''
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
  const progress = useTastingFlowProgress(mode, 'PersonalNotes');
  
  // Korean input optimization
  const personalNotesInput = useKoreanInput(
    personalNotesData.personalNotes || '',
    (text) => updatePersonalNotesData('personalNotes', text)
  );
  
  const publicReviewInput = useKoreanInput(
    personalNotesData.publicReview || '',
    (text) => updatePersonalNotesData('publicReview', text)
  );
  
  const moodInput = useKoreanInput(
    personalNotesData.mood || '',
    (text) => updatePersonalNotesData('mood', text)
  );
  
  // Image picker
  const { selectImage, isLoading: imageLoading } = useImagePicker();
  
  // Draft auto-save
  const { isSaving } = useDraftAutoSave({
    coffeeData,
    brewSetupData,
    flavorData,
    sensoryExpressionData,
    sensoryMouthFeelData,
    personalNotesData,
    mode,
    currentStep: 'PersonalNotes'
  }, true);
  
  // =====================================
  // Event Handlers
  // =====================================
  
  const updatePersonalNotesData = useCallback((key: keyof PersonalNotesData, value: any) => {
    setPersonalNotesData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
    
    // Clear validation error
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, [validationErrors, setHasUnsavedChanges]);
  
  const handleAddPhoto = useCallback(async () => {
    try {
      const photoUri = await selectImage({
        maxWidth: 1200,
        quality: 0.8,
        allowsEditing: true
      });
      
      if (photoUri) {
        const currentPhotos = personalNotesData.photos || [];
        if (currentPhotos.length >= 5) {
          Alert.alert(
            '사진 제한',
            '최대 5장까지 추가할 수 있습니다.',
            [{ text: '확인' }]
          );
          return;
        }
        
        updatePersonalNotesData('photos', [...currentPhotos, photoUri]);
      }
    } catch (error) {
      console.error('Photo selection failed:', error);
      Alert.alert('오류', '사진 선택 중 오류가 발생했습니다.');
    }
  }, [selectImage, personalNotesData.photos, updatePersonalNotesData]);
  
  const handleRemovePhoto = useCallback((photoUri: string) => {
    Alert.alert(
      '사진 삭제',
      '이 사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            const currentPhotos = personalNotesData.photos || [];
            updatePersonalNotesData('photos', currentPhotos.filter(p => p !== photoUri));
          }
        }
      ]
    );
  }, [personalNotesData.photos, updatePersonalNotesData]);
  
  const handlePhotoPress = useCallback((photoUri: string) => {
    // TODO: 사진 확대 보기 모달 (향후 구현)
    Alert.alert(
      '사진 보기',
      '사진 확대 보기 기능은 향후 업데이트에서 제공됩니다.',
      [{ text: '확인' }]
    );
  }, []);
  
  const handleVoiceMemo = useCallback(() => {
    // TODO: 음성 메모 기능 (향후 구현)
    Alert.alert(
      '음성 메모',
      '음성 메모 기능은 향후 업데이트에서 제공됩니다.',
      [{ text: '확인' }]
    );
  }, []);
  
  // =====================================
  // Navigation Handlers
  // =====================================
  
  const handleValidation = useCallback(() => {
    const result = TastingFlowValidationUtils.validatePersonalNotes(personalNotesData);
    setValidationErrors(result.errors);
    return result.isValid;
  }, [personalNotesData]);
  
  const handleNext = useCallback(async () => {
    if (!handleValidation()) {
      Alert.alert('평점 입력', '1-5점 사이의 평점을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Final Draft 저장
      await saveDraft({
        mode,
        currentStep: 'PersonalNotes',
        coffeeData,
        brewSetupData,
        flavorData,
        sensoryExpressionData,
        sensoryMouthFeelData,
        personalNotesData
      });
      
      // 결과 화면으로 이동 (실제 기록 저장)
      navigation.navigate('Result', {
        recordId: `record_${Date.now()}`, // 임시 ID
        mode
      });
      
    } catch (error) {
      console.error('Save failed:', error);
      setError('저장 중 오류가 발생했습니다.');
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [handleValidation, saveDraft, mode, coffeeData, brewSetupData, flavorData, sensoryExpressionData, sensoryMouthFeelData, personalNotesData, navigation, setError]);
  
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // =====================================
  // Render Helpers
  // =====================================
  
  const renderRatingSection = useCallback(() => (
    <Card title="⭐ 총평 및 평점" style={styles.section}>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>이 커피에 대한 전체적인 평가는?</Text>
        <StarRating
          rating={personalNotesData.rating}
          onRatingChange={(rating) => updatePersonalNotesData('rating', rating)}
          size={36}
        />
        <Text style={styles.ratingDescription}>
          {personalNotesData.rating === 1 ? '매우 불만족' :
           personalNotesData.rating === 2 ? '불만족' :
           personalNotesData.rating === 3 ? '보통' :
           personalNotesData.rating === 4 ? '만족' : '매우 만족'}
        </Text>
        {validationErrors.rating && (
          <Text style={styles.errorText}>{validationErrors.rating}</Text>
        )}
      </View>
      
      <View style={styles.repurchaseContainer}>
        <Text style={styles.repurchaseLabel}>다시 마실 의향은?</Text>
        <StarRating
          rating={personalNotesData.repurchaseIntent || 3}
          onRatingChange={(rating) => updatePersonalNotesData('repurchaseIntent', rating)}
          size={28}
        />
      </View>
      
      <View style={styles.recommendContainer}>
        <Text style={styles.recommendLabel}>다른 사람에게 추천하시겠습니까?</Text>
        <View style={styles.recommendButtons}>
          <TouchableOpacity
            style={[
              styles.recommendButton,
              personalNotesData.wouldRecommend && styles.recommendButtonYes
            ]}
            onPress={() => updatePersonalNotesData('wouldRecommend', true)}
          >
            <Text style={[
              styles.recommendButtonText,
              personalNotesData.wouldRecommend && styles.recommendButtonTextYes
            ]}>
              👍 추천
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.recommendButton,
              !personalNotesData.wouldRecommend && styles.recommendButtonNo
            ]}
            onPress={() => updatePersonalNotesData('wouldRecommend', false)}
          >
            <Text style={[
              styles.recommendButtonText,
              !personalNotesData.wouldRecommend && styles.recommendButtonTextNo
            ]}>
              👎 비추천
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  ), [personalNotesData, validationErrors, updatePersonalNotesData]);
  
  const renderNotesSection = useCallback(() => (
    <Card title="📝 개인 메모" style={styles.section}>
      <TextInput
        label="개인 노트"
        value={personalNotesInput.value}
        onChangeText={personalNotesInput.handleChangeText}
        placeholder={KoreanUXUtils.getKoreanPlaceholder('personalNotes')}
        multiline
        numberOfLines={4}
        korean
        maxLength={1000}
        helperText="이 커피에 대한 솔직한 생각을 적어보세요"
        showCharacterCount
      />
      
      <TextInput
        label="마신 상황 및 기분"
        value={moodInput.value}
        onChangeText={moodInput.handleChangeText}
        placeholder="예: 오후 휴식 시간, 기분 좋았음"
        korean
        maxLength={200}
      />
      
      <TextInput
        label="날씨"
        value={personalNotesData.weather}
        onChangeText={(text) => updatePersonalNotesData('weather', text)}
        placeholder="예: 맑음, 비, 흐림"
        korean
        maxLength={100}
      />
    </Card>
  ), [personalNotesInput, moodInput, personalNotesData.weather, updatePersonalNotesData]);
  
  const renderPhotosSection = useCallback(() => (
    <Card title="📸 사진 추가" style={styles.section}>
      <Text style={styles.photoDescription}>
        커피나 카페 사진을 추가해보세요 (최대 5장)
      </Text>
      
      <PhotoGrid
        photos={personalNotesData.photos || []}
        onPhotoPress={handlePhotoPress}
        onRemovePhoto={handleRemovePhoto}
      />
      
      <View style={styles.photoButtons}>
        <Button
          title="📷 사진 추가"
          onPress={handleAddPhoto}
          disabled={imageLoading || (personalNotesData.photos?.length || 0) >= 5}
          loading={imageLoading}
          variant="secondary"
          size="medium"
          korean
        />
        
        <Button
          title="🎤 음성 메모"
          onPress={handleVoiceMemo}
          variant="outline"
          size="medium"
          korean
        />
      </View>
    </Card>
  ), [personalNotesData.photos, handlePhotoPress, handleRemovePhoto, handleAddPhoto, handleVoiceMemo, imageLoading]);
  
  const renderSharingSection = useCallback(() => (
    <Card title="🌐 커뮤니티 공유" style={styles.section}>
      <View style={styles.shareContainer}>
        <View style={styles.shareTextContainer}>
          <Text style={styles.shareTitle}>커뮤니티에 공유하기</Text>
          <Text style={styles.shareDescription}>
            다른 사용자들과 커피 경험을 공유하세요
          </Text>
        </View>
        <Switch
          value={personalNotesData.shareWithCommunity}
          onValueChange={(value) => updatePersonalNotesData('shareWithCommunity', value)}
          trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
          thumbColor="#FFFFFF"
        />
      </View>
      
      {personalNotesData.shareWithCommunity && (
        <TextInput
          label="공개 리뷰"
          value={publicReviewInput.value}
          onChangeText={publicReviewInput.handleChangeText}
          placeholder="다른 사용자들에게 보여질 리뷰를 작성하세요..."
          multiline
          numberOfLines={3}
          korean
          maxLength={300}
          helperText="공개 리뷰는 커뮤니티에서 다른 사용자들이 볼 수 있습니다"
          showCharacterCount
        />
      )}
    </Card>
  ), [personalNotesData.shareWithCommunity, publicReviewInput, updatePersonalNotesData]);
  
  // =====================================
  // Main Render
  // =====================================
  
  if (isLoading) {
    return <Loading text="최종 저장 중..." korean />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {/* Progress Header */}
        <ProgressHeader
          progress={progress}
          title={progress.stepName}
          subtitle="마지막 단계 · 개인 평가"
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
          {renderRatingSection()}
          {renderNotesSection()}
          {renderPhotosSection()}
          {renderSharingSection()}
          
          {/* Final Summary */}
          <Card title="📋 기록 요약" style={[styles.section, styles.summarySection]}>
            <Text style={styles.summaryText}>
              • 커피: {coffeeData.name}{'\n'}
              • 모드: {mode === 'cafe' ? '카페 모드' : '홈카페 모드'}{'\n'}
              • 향미: {flavorData.selectedFlavors.length}개 선택{'\n'}
              • 감각 표현: 한국어 표현 사용{'\n'}
              • 평점: {personalNotesData.rating}/5점{'\n'}
              • 공유: {personalNotesData.shareWithCommunity ? '공개' : '비공개'}
            </Text>
          </Card>
        </ScrollView>
        
        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="기록 완료"
            onPress={handleNext}
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            size="large"
            korean
            accessible
            accessibilityLabel="커피 기록 완료"
          />
          
          <Text style={styles.nextStepHint}>
            다음: 기록 완료 및 결과 확인
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
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center'
  },
  starContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  star: {
    fontSize: 32
  },
  ratingDescription: {
    fontSize: 16,
    color: '#8B7355',
    fontWeight: '600'
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FF3B30'
  },
  repurchaseContainer: {
    alignItems: 'center',
    paddingTop: 24,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF'
  },
  repurchaseLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12
  },
  recommendContainer: {
    alignItems: 'center',
    paddingTop: 24,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF'
  },
  recommendLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16
  },
  recommendButtons: {
    flexDirection: 'row',
    gap: 12
  },
  recommendButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFFFFF'
  },
  recommendButtonYes: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50'
  },
  recommendButtonNo: {
    borderColor: '#FF5722',
    backgroundColor: '#FF5722'
  },
  recommendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666'
  },
  recommendButtonTextYes: {
    color: '#FFFFFF'
  },
  recommendButtonTextNo: {
    color: '#FFFFFF'
  },
  photoDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center'
  },
  photoGrid: {
    marginBottom: 16
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8F9FA'
  },
  photoRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoRemoveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16
  },
  shareTextContainer: {
    flex: 1,
    marginRight: 16
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4
  },
  shareDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666'
  },
  summarySection: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4,
    borderLeftColor: '#8B7355'
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555555'
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

export default PersonalNotesScreen;