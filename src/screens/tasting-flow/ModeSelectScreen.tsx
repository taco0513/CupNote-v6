/**
 * ModeSelectScreen - 테이스팅 모드 선택
 * 
 * CupNote v6 TastingFlow의 첫 번째 스크린
 * - 카페 모드 vs 홈카페 모드 선택
 * - Foundation Team의 RecordMode 타입 사용
 * - UI Components Team의 ModeCard 활용
 * - Korean UX 최적화
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types & Utils
import { 
  TastingFlowScreenProps, 
  RecordMode,
  TastingFlowProgressUtils,
  KoreanUXUtils 
} from '../../utils';

// Components (UI Components Team)
import { 
  Container,
  Header,
  ModeCard,
  Button,
  Loading,
  type ModeInfo
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ModeSelectScreenProps extends TastingFlowScreenProps<undefined> {}

// 모드 정보 (Korean UX 최적화)
const MODE_INFO: Record<RecordMode, ModeInfo> = {
  cafe: {
    id: 'cafe',
    title: '카페 모드',
    subtitle: '카페에서의 커피 경험 기록',
    description: [
      '📍 방문한 카페 정보와 분위기',
      '☕ 주문한 커피와 서비스 평가', 
      '📸 카페 사진과 메뉴 스캔',
      '👥 함께한 사람들과 상황'
    ],
    estimatedTime: '5-7분',
    steps: 6,
    icon: '🏪',
    color: '#8B7355',
    features: [
      'GPS 카페 자동 감지',
      'OCR 메뉴 스캔',
      '분위기 및 서비스 평가',
      '사진 업로드'
    ]
  },
  homecafe: {
    id: 'homecafe', 
    title: '홈카페 모드',
    subtitle: '집에서의 커피 추출 경험 기록',
    description: [
      '☕ 사용한 원두와 장비 정보',
      '⏱️ 추출 과정과 타이머 기능',
      '📊 물온도, 분쇄도, 비율 기록',
      '📝 추출 노트와 개선점'
    ],
    estimatedTime: '8-12분',
    steps: 7,
    icon: '🏠',
    color: '#6B4E3D',
    features: [
      '타이머 기능',
      '추출 레시피 저장',
      '비율 계산기',
      '상세 브루잉 노트'
    ]
  }
};

const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  navigation,
  route
}) => {
  // State
  const [selectedMode, setSelectedMode] = useState<RecordMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Store
  const { 
    setCurrentMode,
    setError,
    currentDraft 
  } = useTastingFlowStore();
  const { createDraft } = useRecordStore();
  
  // Progress tracking
  const progress = useTastingFlowProgress('cafe', 'ModeSelect');
  
  // Draft auto-save (disabled on mode select)
  const { isSaving } = useDraftAutoSave({}, false);
  
  // =====================================
  // Event Handlers
  // =====================================
  
  const handleModeSelect = useCallback((mode: RecordMode) => {
    setSelectedMode(mode);
  }, []);
  
  const handleNext = useCallback(async () => {
    if (!selectedMode) {
      Alert.alert('모드 선택', '테이스팅 모드를 선택해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 모드 설정
      setCurrentMode(selectedMode);
      
      // Draft 생성 (Foundation Team recordStore 사용)
      await createDraft({
        mode: selectedMode,
        currentStep: 'ModeSelect'
      });
      
      // 다음 화면으로 이동
      navigation.navigate('CoffeeInfo', {
        mode: selectedMode,
        editMode: false
      });
      
    } catch (error) {
      console.error('Mode selection failed:', error);
      setError('모드 설정 중 오류가 발생했습니다.');
      Alert.alert('오류', '모드 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMode, setCurrentMode, createDraft, navigation, setError]);
  
  const handleBack = useCallback(() => {
    // 메인 화면으로 나가기
    navigation.goBack();
  }, [navigation]);
  
  // =====================================
  // Render Helpers
  // =====================================
  
  const renderModeCard = useCallback((mode: RecordMode) => {
    const modeInfo = MODE_INFO[mode];
    const isSelected = selectedMode === mode;
    
    return (
      <ModeCard
        key={mode}
        mode={modeInfo}
        isSelected={isSelected}
        onPress={() => handleModeSelect(mode)}
        style={[
          styles.modeCard,
          isSelected && styles.selectedModeCard
        ]}
        disabled={isLoading}
        showEstimatedTime
        showFeatures
        accessible
        accessibilityLabel={`${modeInfo.title} 선택`}
        accessibilityHint={modeInfo.subtitle}
      />
    );
  }, [selectedMode, handleModeSelect, isLoading]);
  
  const renderSelectedModeDetails = useCallback(() => {
    if (!selectedMode) return null;
    
    const modeInfo = MODE_INFO[selectedMode];
    
    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>선택한 모드 상세</Text>
        <Text style={styles.detailsText}>
          {modeInfo.subtitle}
        </Text>
        <Text style={styles.detailsTime}>
          예상 소요시간: {modeInfo.estimatedTime}
        </Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>포함 기능:</Text>
          {modeInfo.features.map((feature, index) => (
            <Text key={index} style={styles.featureItem}>
              • {feature}
            </Text>
          ))}
        </View>
      </View>
    );
  }, [selectedMode]);
  
  // =====================================
  // Main Render
  // =====================================
  
  if (isLoading || isSaving) {
    return (
      <Loading 
        text="모드를 설정하고 있습니다..."
        korean 
      />
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {/* Header */}
        <Header
          title="테이스팅 모드 선택"
          subtitle="어떤 환경에서 커피를 마시고 계신가요?"
          onBack={handleBack}
          showBackButton
          korean
          accessible
          accessibilityLabel="테이스팅 모드 선택 화면"
        />
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Introduction */}
          <View style={styles.introContainer}>
            <Text style={styles.introText}>
              커피를 마시는 환경에 따라 다른 기록 방식을 제공합니다.
            </Text>
            <Text style={styles.introSubtext}>
              각 모드는 상황에 맞는 최적화된 기록 과정을 제공해요.
            </Text>
          </View>
          
          {/* Mode Cards */}
          <View style={styles.modesContainer}>
            {renderModeCard('cafe')}
            {renderModeCard('homecafe')}
          </View>
          
          {/* Selected Mode Details */}
          {renderSelectedModeDetails()}
          
          {/* Draft Recovery Notice (if exists) */}
          {currentDraft && (
            <View style={styles.draftNotice}>
              <Text style={styles.draftNoticeTitle}>
                💾 임시저장된 기록이 있습니다
              </Text>
              <Text style={styles.draftNoticeText}>
                이전에 작성하던 {currentDraft.mode} 모드 기록을 계속하거나 새로 시작할 수 있습니다.
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="다음 단계"
            onPress={handleNext}
            disabled={!selectedMode || isLoading}
            loading={isLoading}
            style={[
              styles.nextButton,
              !selectedMode && styles.disabledButton
            ]}
            variant="primary"
            size="large"
            korean
            accessible
            accessibilityLabel="다음 단계로 이동"
            accessibilityHint={selectedMode ? `${MODE_INFO[selectedMode].title}으로 계속` : '모드를 선택해주세요'}
          />
          
          <Text style={styles.helpText}>
            {KoreanUXUtils.getKoreanHelpText('modeSelect')}
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
  scrollContent: {
    paddingBottom: 20
  },
  introContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F7F5',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C2C2C',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  introSubtext: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    textAlign: 'center'
  },
  modesContainer: {
    paddingHorizontal: 20,
    gap: 16
  },
  modeCard: {
    marginBottom: 0
  },
  selectedModeCard: {
    borderWidth: 2,
    borderColor: '#8B7355',
    backgroundColor: '#FFF8F0'
  },
  detailsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2'
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8
  },
  detailsText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
    marginBottom: 8
  },
  detailsTime: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '600',
    marginBottom: 16
  },
  featuresContainer: {
    marginTop: 8
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
    marginBottom: 4,
    paddingLeft: 8
  },
  draftNotice: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB020'
  },
  draftNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B6914',
    marginBottom: 6
  },
  draftNoticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8B6914'
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8'
  },
  nextButton: {
    marginBottom: 12
  },
  disabledButton: {
    opacity: 0.5
  },
  helpText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#888888',
    textAlign: 'center'
  }
});

export default ModeSelectScreen;