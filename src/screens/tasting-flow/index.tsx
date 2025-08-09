/**
 * TastingFlow Screens Export
 * 
 * 테이스팅 플로우 스크린들 - Placeholder 컴포넌트들
 * Foundation Team의 타입 시스템과 완전히 통합
 * 실제 구현은 Screen Team이 담당
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TastingFlowScreenProps } from '../../navigation/types';
import { 
  TASTING_FLOW_STEPS, 
  TASTING_FLOW_STEP_NAMES,
  RecordMode 
} from '../../../../worktree-foundation/src/types/tastingFlow';

// =====================================
// Progress Component
// =====================================

const ProgressHeader: React.FC<{
  mode?: RecordMode;
  currentScreen: string;
  onBack: () => void;
  onClose: () => void;
}> = ({ mode, currentScreen, onBack, onClose }) => {
  if (!mode) return null;
  
  const steps = TASTING_FLOW_STEPS[mode];
  const currentIndex = steps.indexOf(currentScreen as any);
  const progress = (currentIndex + 1) / steps.length;
  
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.header}>
        <TouchableOpacity onPress={onBack} style={progressStyles.backButton}>
          <Text style={progressStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={progressStyles.titleContainer}>
          <Text style={progressStyles.title}>
            {TASTING_FLOW_STEP_NAMES[currentScreen as keyof typeof TASTING_FLOW_STEP_NAMES]}
          </Text>
          <Text style={progressStyles.subtitle}>
            {currentIndex + 1} / {steps.length} • {mode === 'cafe' ? '카페 모드' : '홈카페 모드'}
          </Text>
        </View>
        
        <TouchableOpacity onPress={onClose} style={progressStyles.closeButton}>
          <Text style={progressStyles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={progressStyles.progressBarContainer}>
        <View style={[progressStyles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const progressStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#8B4513',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 1.5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 1.5,
  },
});

// =====================================
// Placeholder Screen Component Factory
// =====================================

const createTastingFlowScreenPlaceholder = <T extends any>(
  screenName: string,
  additionalContent?: (props: T) => React.ReactElement,
  additionalActions?: (props: T) => React.ReactElement[]
) => {
  return function TastingFlowScreenPlaceholder(props: T) {
    const route = (props as any).route;
    const navigation = (props as any).navigation;
    const mode = route.params?.mode;
    
    const handleNext = () => {
      console.log(`${screenName} - Next 버튼 클릭됨`);
      // 실제로는 데이터 검증 후 다음 스크린으로 이동
    };
    
    const handleBack = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    };
    
    const handleClose = () => {
      Alert.alert(
        '기록 중단',
        '작성 중인 내용이 있습니다. 정말로 나가시겠습니까?',
        [
          { text: '계속 작성', style: 'cancel' },
          { text: '임시저장', onPress: () => navigation.goBack() },
          { text: '나가기', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    };
    
    return (
      <View style={styles.container}>
        {mode && (
          <ProgressHeader
            mode={mode}
            currentScreen={route.name}
            onBack={handleBack}
            onClose={handleClose}
          />
        )}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{screenName}</Text>
            <Text style={styles.subtitle}>Screen Team 구현 예정</Text>
            
            <Text style={styles.description}>
              이 화면은 Navigation Team에서 생성한 Placeholder입니다.{'\n'}
              실제 UI는 Screen Team에서 구현합니다.
            </Text>
            
            <View style={styles.routeInfo}>
              <Text style={styles.routeTitle}>네비게이션 정보:</Text>
              <Text style={styles.routeText}>Route: {route.name}</Text>
              {route.params && (
                <Text style={styles.routeText}>
                  Params: {JSON.stringify(route.params, null, 2)}
                </Text>
              )}
            </View>
            
            {/* 추가 컨텐츠 */}
            {additionalContent && additionalContent(props)}
            
            {/* 추가 액션들 */}
            {additionalActions && (
              <View style={styles.additionalActions}>
                {additionalActions(props)}
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleBack}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              이전
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
};

// =====================================
// TastingFlow Screen Components
// =====================================

export const ModeSelectScreen = createTastingFlowScreenPlaceholder<TastingFlowScreenProps<'ModeSelect'>>(
  '모드 선택',
  (props) => (
    <View style={styles.modeSelection}>
      <TouchableOpacity 
        style={styles.modeButton}
        onPress={() => {
          console.log('카페 모드 선택됨');
          props.navigation.navigate('CoffeeInfo', { 
            mode: 'cafe',
            editMode: false
          });
        }}
      >
        <Text style={styles.modeTitle}>🏪 카페 모드</Text>
        <Text style={styles.modeDescription}>카페에서 마신 커피 기록 (5-7분)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.modeButton}
        onPress={() => {
          console.log('홈카페 모드 선택됨');
          props.navigation.navigate('CoffeeInfo', { 
            mode: 'homecafe',
            editMode: false
          });
        }}
      >
        <Text style={styles.modeTitle}>🏠 홈카페 모드</Text>
        <Text style={styles.modeDescription}>집에서 내린 커피 기록 (8-12분)</Text>
      </TouchableOpacity>
    </View>
  )
);

export const CoffeeInfoScreen = createTastingFlowScreenPlaceholder<TastingFlowScreenProps<'CoffeeInfo'>>(
  '커피 정보',
  (props) => {
    const mode = props.route.params?.mode;
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>
          {mode === 'cafe' 
            ? '마신 커피와 카페 정보를 입력해주세요.'
            : '사용한 커피 원두 정보를 입력해주세요.'
          }
        </Text>
        {mode === 'cafe' && (
          <Text style={styles.stepHint}>💡 GPS 카페 감지 및 OCR 메뉴 스캔 기능 포함</Text>
        )}
      </View>
    );
  }
);

export const BrewSetupScreen = createTastingFlowScreenPlaceholder<TastingFlowScreenProps<'BrewSetup'>>(
  '브루잉 설정',
  (props) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        브루잉 방법과 추출 조건을 설정해주세요.
      </Text>
      <Text style={styles.stepHint}>💡 타이머 기능과 레시피 저장 기능 포함</Text>
    </View>
  )
);

export const FlavorSelectionScreen = createTastingFlowScreenPlaceholder<TastingFlowScreenProps<'FlavorSelection'>>(
  '향미 선택',
  (props) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        SCA 85개 향미 중 감지된 향미를 선택해주세요.
      </Text>
      <Text style={styles.stepHint}>💡 과일, 달콤함, 꽃향, 견과류 등 카테고리별 선택</Text>
    </View>
  )
);

export const SensoryExpressionScreen = createTastingFlowScreenPlaceholder<TastingFlowScreenProps<'SensoryExpression'>>(
  '감각 표현',
  (props) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        한국어 44개 감각 표현 중 느낌을 선택해주세요.
      </Text>
      <Text style={styles.stepHint}>💡 달콤한, 상큼한, 부드러운 등 직관적인 한국어 표현</Text>
    </View>
  )
);

export const SensoryMouthFeelScreen = createTastingFlowScreenPlaceholder<TastingFlowScreenProps<'SensoryMouthFeel'>>(
  '수치 평가',
  (props) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        7가지 항목을 1-5점으로 평가해주세요. (선택 사항)
      </Text>
      <Text style={styles.stepHint}>💡 산미, 단맛, 쓴맛, 바디감, 균형감, 깔끔함, 여운</Text>
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => console.log('수치 평가 건너뛰기')}
      >
        <Text style={styles.skipButtonText}>건너뛰기</Text>
      </TouchableOpacity>
    </View>
  )
);

export const PersonalNotesScreen = createTastingFlowScreenPlaceholder<TastingFlowScreenProps<'PersonalNotes'>>(
  '개인 노트',
  (props) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        개인적인 느낌과 평점을 기록해주세요.
      </Text>
      <Text style={styles.stepHint}>💡 별점, 개인 메모, 태그, 사진 첨부, 커뮤니티 공유 여부</Text>
    </View>
  )
);

export const ResultScreen = createTastingFlowScreenPlaceholder<TastingFlowScreenProps<'Result'>>(
  '기록 완료',
  (props) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        커피 기록이 완성되었습니다! 🎉
      </Text>
      <Text style={styles.stepHint}>💡 커뮤니티 매치 점수 확인 및 업적 획득</Text>
      <TouchableOpacity 
        style={styles.completeButton}
        onPress={() => {
          console.log('TastingFlow 완료 - 메인으로 이동');
          props.navigation.goBack();
        }}
      >
        <Text style={styles.completeButtonText}>완료</Text>
      </TouchableOpacity>
    </View>
  )
);

// =====================================
// Styles
// =====================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  content: {
    flex: 1,
    minHeight: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  routeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  additionalActions: {
    marginTop: 24,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    height: 48,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  secondaryButtonText: {
    color: '#8B4513',
  },
  
  // Mode Selection Specific
  modeSelection: {
    marginTop: 32,
  },
  modeButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  
  // Step Content
  stepContent: {
    marginTop: 32,
    alignItems: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  stepHint: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    backgroundColor: '#fff8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  completeButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 24,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});