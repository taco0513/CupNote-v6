/**
 * TastingFlow Screens
 * 8-step coffee recording flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import useStore from '../store/useStore';

// Import new screens
import ModeSelect from './tasting/ModeSelect';
import CoffeeInfo from './tasting/CoffeeInfo';
import BrewSetup from './tasting/BrewSetup';
import FlavorSelection from './tasting/FlavorSelection';
import SensoryExpression from './tasting/SensoryExpression';
import SensoryMouthFeel from './tasting/SensoryMouthFeel';
import PersonalNotes from './tasting/PersonalNotes';
import Result from './tasting/Result';

// ========================================
// Type Definitions
// ========================================

export type TastingFlowStackParamList = {
  ModeSelect: undefined;
  CoffeeInfo: { mode: 'cafe' | 'homecafe' };
  BrewSetup: { mode: 'homecafe' };
  FlavorSelection: { mode: 'cafe' | 'homecafe' };
  SensoryExpression: { mode: 'cafe' | 'homecafe' };
  SensoryMouthFeel: { mode: 'cafe' | 'homecafe' };
  PersonalNotes: { mode: 'cafe' | 'homecafe' };
  Result: { mode: 'cafe' | 'homecafe' };
};

const Stack = createNativeStackNavigator<TastingFlowStackParamList>();

// ========================================
// Progress Header Component
// ========================================

const ProgressHeader: React.FC<{
  title: string;
  step: number;
  totalSteps: number;
  onBack: () => void;
  onClose: () => void;
}> = ({ title, step, totalSteps, onBack, onClose }) => {
  const progress = step / totalSteps;
  
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.header}>
        <TouchableOpacity onPress={onBack} style={progressStyles.backButton}>
          <Text style={progressStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={progressStyles.titleContainer}>
          <Text style={progressStyles.title}>{title}</Text>
          <Text style={progressStyles.subtitle}>
            {step} / {totalSteps}
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

// ========================================
// Screen Components
// ========================================

// 1. Mode Selection Screen
export function ModeSelectScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.modeHeader}>
          <Text style={styles.modeTitle}>☕ 기록 모드 선택</Text>
          <Text style={styles.modeSubtitle}>
            어디서 커피를 마시고 계신가요?
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.modeCard, styles.cafeCard]}
          onPress={() => navigation.navigate('CoffeeInfo', { mode: 'cafe' })}
          activeOpacity={0.8}
        >
          <View style={styles.modeBadgeContainer}>
            <Text style={[styles.modeBadge, styles.simpleBadge]}>빠르고 간편</Text>
          </View>
          <Text style={styles.modeIcon}>☕</Text>
          <Text style={styles.modeName}>카페 모드</Text>
          <Text style={styles.modeDescription}>
            카페에서 간단히 기록
          </Text>
          <Text style={styles.modeTime}>⏱ 8-12분</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modeCard, styles.homecafeCard]}
          onPress={() => navigation.navigate('CoffeeInfo', { mode: 'homecafe' })}
          activeOpacity={0.8}
        >
          <View style={styles.modeBadgeContainer}>
            <Text style={[styles.modeBadge, styles.detailedBadge]}>상세 기록</Text>
          </View>
          <Text style={styles.modeIcon}>🏠</Text>
          <Text style={styles.modeName}>홈카페 모드</Text>
          <Text style={styles.modeDescription}>
            집에서 내린 커피 + 레시피
          </Text>
          <Text style={styles.modeTime}>⏱ 20-35분</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// 2. Coffee Info Screen - Using new implementation
export const CoffeeInfoScreen = CoffeeInfo;

// Old CoffeeInfoScreen (commented out)
/*
export function CoffeeInfoScreen_OLD({ route, navigation }: any) {
  const { mode } = route.params;
  const [coffeeName, setCoffeeName] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [roastery, setRoastery] = useState('');
  
  const handleNext = () => {
    if (mode === 'homecafe') {
      navigation.navigate('BrewSetup', { mode });
    } else {
      navigation.navigate('FlavorSelection', { mode });
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader
        title="커피 정보"
        step={1}
        totalSteps={mode === 'cafe' ? 6 : 7}
        onBack={() => navigation.goBack()}
        onClose={() => navigation.navigate('ModeSelect')}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>
            {mode === 'cafe' ? '☕ 어떤 커피를 마셨나요?' : '☕ 어떤 원두를 사용했나요?'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>커피 이름 *</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 에티오피아 예가체프"
              value={coffeeName}
              onChangeText={setCoffeeName}
            />
          </View>
          
          {mode === 'cafe' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>카페 이름 *</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 블루보틀"
                value={cafeName}
                onChangeText={setCafeName}
              />
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>로스터리</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 커피몽타주"
              value={roastery}
              onChangeText={setRoastery}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
*/

// 3. Brew Setup Screen - Using new implementation
export const BrewSetupScreen = BrewSetup;

// Old BrewSetupScreen (commented out)
/*
export function BrewSetupScreen({ route, navigation }: any) {
  const { mode } = route.params;
  const [brewMethod, setBrewMethod] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [brewTime, setBrewTime] = useState('');
  
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader
        title="브루잉 설정"
        step={2}
        totalSteps={7}
        onBack={() => navigation.goBack()}
        onClose={() => navigation.navigate('ModeSelect')}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>☕ 어떻게 추출했나요?</Text>
          
          <View style={styles.brewMethodContainer}>
            {['핸드드립', '에스프레소', '프렌치프레스', '에어로프레스'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.brewMethodButton,
                  brewMethod === method && styles.brewMethodButtonActive,
                ]}
                onPress={() => setBrewMethod(method)}
              >
                <Text
                  style={[
                    styles.brewMethodText,
                    brewMethod === method && styles.brewMethodTextActive,
                  ]}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>물 온도 (°C)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 92"
              value={waterTemp}
              onChangeText={setWaterTemp}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>추출 시간</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 2분 30초"
              value={brewTime}
              onChangeText={setBrewTime}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('FlavorSelection', { mode })}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
*/

// 4. Flavor Selection Screen
export function FlavorSelectionScreen({ route, navigation }: any) {
  const { mode } = route.params;
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  
  const flavors = [
    { category: '과일', items: ['딸기', '블루베리', '레몬', '오렌지', '사과', '포도'] },
    { category: '달콤함', items: ['초콜릿', '캐러멜', '바닐라', '꿀', '흑설탕'] },
    { category: '꽃향', items: ['자스민', '장미', '라벤더', '오렌지꽃'] },
    { category: '견과류', items: ['아몬드', '헤이즐넛', '호두', '땅콩'] },
  ];
  
  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors(prev =>
      prev.includes(flavor)
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader
        title="향미 선택"
        step={mode === 'cafe' ? 2 : 3}
        totalSteps={mode === 'cafe' ? 6 : 7}
        onBack={() => navigation.goBack()}
        onClose={() => navigation.navigate('ModeSelect')}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>🌸 어떤 향미를 느꼈나요?</Text>
          <Text style={styles.sectionSubtitle}>최대 5개까지 선택 가능</Text>
          
          {flavors.map(category => (
            <View key={category.category} style={styles.flavorCategory}>
              <Text style={styles.flavorCategoryTitle}>{category.category}</Text>
              <View style={styles.flavorItems}>
                {category.items.map(flavor => (
                  <TouchableOpacity
                    key={flavor}
                    style={[
                      styles.flavorChip,
                      selectedFlavors.includes(flavor) && styles.flavorChipActive,
                    ]}
                    onPress={() => toggleFlavor(flavor)}
                  >
                    <Text
                      style={[
                        styles.flavorChipText,
                        selectedFlavors.includes(flavor) && styles.flavorChipTextActive,
                      ]}
                    >
                      {flavor}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SensoryExpression', { mode })}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 5. Sensory Expression Screen
export function SensoryExpressionScreen({ route, navigation }: any) {
  const { mode } = route.params;
  const [selectedExpressions, setSelectedExpressions] = useState<string[]>([]);
  
  const expressions = [
    '달콤한', '상큼한', '부드러운', '깔끔한', '진한', '가벼운',
    '고소한', '묵직한', '산뜻한', '풍부한', '균형잡힌', '복잡한',
    '깨끗한', '밝은', '따뜻한', '시원한', '신선한', '우아한',
  ];
  
  const toggleExpression = (expression: string) => {
    setSelectedExpressions(prev =>
      prev.includes(expression)
        ? prev.filter(e => e !== expression)
        : [...prev, expression]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader
        title="감각 표현"
        step={mode === 'cafe' ? 3 : 4}
        totalSteps={mode === 'cafe' ? 6 : 7}
        onBack={() => navigation.goBack()}
        onClose={() => navigation.navigate('ModeSelect')}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>✨ 어떤 느낌이었나요?</Text>
          <Text style={styles.sectionSubtitle}>한국어로 직관적으로 표현해보세요</Text>
          
          <View style={styles.expressionGrid}>
            {expressions.map(expression => (
              <TouchableOpacity
                key={expression}
                style={[
                  styles.expressionCard,
                  selectedExpressions.includes(expression) && styles.expressionCardActive,
                ]}
                onPress={() => toggleExpression(expression)}
              >
                <Text
                  style={[
                    styles.expressionText,
                    selectedExpressions.includes(expression) && styles.expressionTextActive,
                  ]}
                >
                  {expression}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SensoryMouthFeel', { mode })}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 6. Sensory MouthFeel Screen - Using new implementation
export const SensoryMouthFeelScreen = SensoryMouthFeel;

// Old SensoryMouthFeelScreen (commented out)
/*
export function SensoryMouthFeelScreen_OLD({ route, navigation }: any) {
  const { mode } = route.params;
  const [ratings, setRatings] = useState({
    acidity: 3,
    sweetness: 3,
    bitterness: 3,
    body: 3,
    balance: 3,
    cleanliness: 3,
    aftertaste: 3,
  });
  
  const updateRating = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };
  
  const ratingItems = [
    { key: 'acidity', label: '산미', icon: '🍋' },
    { key: 'sweetness', label: '단맛', icon: '🍯' },
    { key: 'bitterness', label: '쓴맛', icon: '🍫' },
    { key: 'body', label: '바디감', icon: '💪' },
    { key: 'balance', label: '균형감', icon: '⚖️' },
    { key: 'cleanliness', label: '깔끔함', icon: '✨' },
    { key: 'aftertaste', label: '여운', icon: '🌊' },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader
        title="수치 평가"
        step={mode === 'cafe' ? 4 : 5}
        totalSteps={mode === 'cafe' ? 6 : 7}
        onBack={() => navigation.goBack()}
        onClose={() => navigation.navigate('ModeSelect')}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>📊 수치로 평가해보세요</Text>
          <Text style={styles.sectionSubtitle}>선택 사항입니다</Text>
          
          {ratingItems.map(item => (
            <View key={item.key} style={styles.ratingItem}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingIcon}>{item.icon}</Text>
                <Text style={styles.ratingLabel}>{item.label}</Text>
                <Text style={styles.ratingValue}>{ratings[item.key as keyof typeof ratings]}</Text>
              </View>
              <View style={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.ratingButton,
                      ratings[item.key as keyof typeof ratings] === value && styles.ratingButtonActive,
                    ]}
                    onPress={() => updateRating(item.key, value)}
                  >
                    <Text
                      style={[
                        styles.ratingButtonText,
                        ratings[item.key as keyof typeof ratings] === value && styles.ratingButtonTextActive,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('PersonalNotes', { mode })}
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PersonalNotes', { mode })}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
*/

// 7. Personal Notes Screen - Using new implementation
export const PersonalNotesScreen = PersonalNotes;

// Old PersonalNotesScreen (commented out)
/*
export function PersonalNotesScreen_OLD({ route, navigation }: any) {
  const { mode } = route.params;
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [shareToCommnity, setShareToCommunity] = useState(true);
  
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader
        title="개인 노트"
        step={mode === 'cafe' ? 5 : 6}
        totalSteps={mode === 'cafe' ? 6 : 7}
        onBack={() => navigation.goBack()}
        onClose={() => navigation.navigate('ModeSelect')}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>✍️ 개인 기록</Text>
          
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>전체 평점</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Text style={styles.star}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>메모</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="자유롭게 기록해보세요..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <TouchableOpacity
            style={styles.shareOption}
            onPress={() => setShareToCommunity(!shareToCommnity)}
          >
            <Text style={styles.checkbox}>
              {shareToCommnity ? '☑️' : '☐'}
            </Text>
            <Text style={styles.shareText}>커뮤니티에 공유하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>이전</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Result', { mode })}
        >
          <Text style={styles.buttonText}>완료</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
*/

// 8. Result Screen - Using new implementation
export const ResultScreen = Result;

// Old ResultScreen (commented out)
/*
export function ResultScreen_OLD({ route, navigation }: any) {
  const { mode } = route.params;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultEmoji}>🎉</Text>
          <Text style={styles.resultTitle}>기록 완료!</Text>
          <Text style={styles.resultSubtitle}>
            커피 기록이 저장되었습니다
          </Text>
        </View>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultCardTitle}>🏆 획득한 업적</Text>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementEmoji}>☕</Text>
            <View>
              <Text style={styles.achievementName}>첫 번째 기록</Text>
              <Text style={styles.achievementDesc}>CupNote에 첫 커피를 기록했어요!</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultCardTitle}>🤝 커뮤니티 매치</Text>
          <Text style={styles.matchScore}>85%</Text>
          <Text style={styles.matchDesc}>
            비슷한 취향의 커피 애호가 12명과 매치되었어요
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // Navigate back to main screen
            navigation.getParent()?.goBack();
          }}
        >
          <Text style={styles.primaryButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryActionButton}
          onPress={() => navigation.navigate('ModeSelect')}
        >
          <Text style={styles.secondaryActionText}>다른 커피 기록하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
*/

// ========================================
// TastingFlow Navigator
// ========================================

export default function TastingFlowNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ModeSelect" component={ModeSelect} />
      <Stack.Screen name="CoffeeInfo" component={CoffeeInfo} />
      <Stack.Screen name="BrewSetup" component={BrewSetup} />
      <Stack.Screen name="FlavorSelection" component={FlavorSelection} />
      <Stack.Screen name="SensoryExpression" component={SensoryExpression} />
      <Stack.Screen name="SensoryMouthFeel" component={SensoryMouthFeel} />
      <Stack.Screen name="PersonalNotes" component={PersonalNotes} />
      <Stack.Screen name="Result" component={Result} />
    </Stack.Navigator>
  );
}

// ========================================
// Styles
// ========================================

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  
  // Mode Selection
  modeHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
  },
  modeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E1F0A',
    marginBottom: 8,
  },
  modeSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5E6D3',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cafeCard: {
    borderColor: '#E8F5E8',
    backgroundColor: '#F8FFF8',
  },
  homecafeCard: {
    borderColor: '#E8F0FF',
    backgroundColor: '#F8FBFF',
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  modeTime: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  modeBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modeBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  simpleBadge: {
    backgroundColor: '#E8F5E8',
    color: '#2D5016',
  },
  detailedBadge: {
    backgroundColor: '#E8F0FF',
    color: '#1E3A8A',
  },
  
  // Common
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  
  // Input
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3E1F0A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  // Brew Method
  brewMethodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  brewMethodButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  brewMethodButtonActive: {
    backgroundColor: '#8B4513',
  },
  brewMethodText: {
    fontSize: 14,
    color: '#666666',
  },
  brewMethodTextActive: {
    color: '#FFFFFF',
  },
  
  // Flavor
  flavorCategory: {
    marginBottom: 24,
  },
  flavorCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 12,
  },
  flavorItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flavorChip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  flavorChipActive: {
    backgroundColor: '#8B4513',
  },
  flavorChipText: {
    fontSize: 14,
    color: '#666666',
  },
  flavorChipTextActive: {
    color: '#FFFFFF',
  },
  
  // Expression
  expressionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  expressionCard: {
    width: '31%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: '1.5%',
    marginBottom: 12,
    alignItems: 'center',
  },
  expressionCardActive: {
    backgroundColor: '#8B4513',
  },
  expressionText: {
    fontSize: 14,
    color: '#666666',
  },
  expressionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Rating
  ratingItem: {
    marginBottom: 20,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  ratingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#3E1F0A',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#8B4513',
  },
  ratingButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  ratingButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Personal Notes
  ratingSection: {
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3E1F0A',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 32,
    marginRight: 8,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    fontSize: 24,
    marginRight: 8,
  },
  shareText: {
    fontSize: 16,
    color: '#3E1F0A',
  },
  
  // Result
  resultContent: {
    flexGrow: 1,
    padding: 24,
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E1F0A',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  resultCard: {
    backgroundColor: '#FDF8F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  resultCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3E1F0A',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666666',
  },
  matchScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 8,
  },
  matchDesc: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  
  // Buttons
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
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryActionText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '500',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  skipButtonText: {
    color: '#8B4513',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});