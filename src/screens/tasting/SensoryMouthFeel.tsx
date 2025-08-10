import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../styles/theme';
import { Card, Button, ProgressBar, Badge, Slider, HeaderBar } from '../../components/common';
import useStore from '../../store/useStore';
import type { TastingFlowNavigationProp, TastingFlowRouteProp } from '../../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 6개 평가 항목 정의 (SCA 기준 적응)
const EVALUATION_ITEMS = {
  body: {
    name: '바디감',
    emoji: '💧',
    description: '커피의 무게감과 질감',
    color: '#2196F3',
    labels: {
      1: '물 같이 가벼움',
      2: '약간 가벼운 바디감',
      3: '적당한 바디감',
      4: '충실한 바디감',
      5: '크리미하고 묵직함'
    }
  },
  acidity: {
    name: '산미',
    emoji: '🍋',
    description: '밝고 상쾌한 산미의 강도',
    color: '#4CAF50',
    labels: {
      1: '산미 거의 없음',
      2: '약한 산미',
      3: '적당한 산미',
      4: '좋은 산미',
      5: '강하고 복잡한 산미'
    }
  },
  sweetness: {
    name: '단맛',
    emoji: '🍯',
    description: '자연스러운 단맛의 정도',
    color: '#FF9800',
    labels: {
      1: '단맛 부족',
      2: '약한 단맛',
      3: '은은한 자연 단맛',
      4: '풍부한 단맛',
      5: '매우 풍부한 단맛'
    }
  },
  finish: {
    name: '여운',
    emoji: '🌬️',
    description: '맛이 지속되는 시간과 품질',
    color: '#9C27B0',
    labels: {
      1: '여운이 짧음',
      2: '짧은 여운',
      3: '적당한 여운',
      4: '길고 좋은 여운',
      5: '매우 길고 복합적인 여운'
    }
  },
  bitterness: {
    name: '쓴맛',
    emoji: '🌰',
    description: '쓴맛의 강도와 품질',
    color: '#795548',
    labels: {
      1: '쓴맛 거의 없음',
      2: '약한 쓴맛',
      3: '균형잡힌 쓴맛',
      4: '좋은 쓴맛',
      5: '강하지만 고급스러운 쓴맛'
    }
  },
  balance: {
    name: '밸런스',
    emoji: '⚖️',
    description: '전체적인 조화와 균형',
    color: '#FFC107',
    labels: {
      1: '불균형',
      2: '약간 불균형',
      3: '무난한 균형감',
      4: '좋은 균형감',
      5: '완벽한 조화'
    }
  }
};

// 기본값 설정
const DEFAULT_SCORES = {
  body: 3,
  acidity: 3,
  sweetness: 3,
  finish: 3,
  bitterness: 3,
  balance: 3,
};


export const SensoryMouthFeel: React.FC = () => {
  const navigation = useNavigation<TastingFlowNavigationProp>();
  const route = useRoute<TastingFlowRouteProp<'SensoryMouthFeel'>>();
  const { setTastingFlowData } = useStore();
  
  // Safe params with fallback
  const params = route.params || { mode: 'cafe' as const };
  
  // 현재 스크린 저장
  useEffect(() => {
    setTastingFlowData({ currentScreen: 'SensoryMouthFeel' });
  }, []);

  // 상태 관리
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [skippedItems, setSkippedItems] = useState<Set<keyof typeof scores>>(new Set());

  // 점수 업데이트 핸들러
  const handleScoreChange = useCallback((category: keyof typeof scores, value: number) => {
    setScores(prev => ({
      ...prev,
      [category]: Math.round(value) // 정수값으로만 저장
    }));
    // 슬라이더를 조작하면 스킵 상태 해제
    setSkippedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(category);
      return newSet;
    });
  }, []);

  // 개별 항목 스킵 토글
  const toggleSkipItem = useCallback((category: keyof typeof scores) => {
    setSkippedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);


  // 건너뛰기 핸들러
  const handleSkip = useCallback(() => {
    setTastingFlowData({ ratings: {
      acidity: 0,
      sweetness: 0,
      bitterness: 0,
      body: 0,
      balance: 0,
      cleanliness: 0,
      aftertaste: 0,
    }});
    navigation.navigate('PersonalNotes', params);
  }, [navigation, params, setTastingFlowData]);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
    setTastingFlowData({ ratings: {
      acidity: skippedItems.has('acidity') ? 0 : scores.acidity,
      sweetness: skippedItems.has('sweetness') ? 0 : scores.sweetness,
      bitterness: skippedItems.has('bitterness') ? 0 : scores.bitterness,
      body: skippedItems.has('body') ? 0 : scores.body,
      balance: skippedItems.has('balance') ? 0 : scores.balance,
      cleanliness: skippedItems.has('finish') ? 0 : scores.finish,
      aftertaste: skippedItems.has('finish') ? 0 : scores.finish,
    }});
    navigation.navigate('PersonalNotes', params);
  }, [scores, skippedItems, navigation, params, setTastingFlowData]);


  // 슬라이더 아이템 렌더링
  const renderSliderItem = (key: keyof typeof scores) => {
    const item = EVALUATION_ITEMS[key];
    const value = scores[key];
    const isSkipped = skippedItems.has(key);
    
    // Safe value display for Badge
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 3;
    const displayValue = isSkipped ? '스킵' : safeValue.toString();

    return (
      <Card key={key} style={[styles.sliderContainer, isSkipped && styles.sliderContainerSkipped]}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderTitle}>
            <Text style={[styles.sliderEmoji, isSkipped && styles.textSkipped]}>{item.emoji}</Text>
            <Text style={[styles.sliderName, isSkipped && styles.textSkipped]}>{item.name}</Text>
          </View>
          <View style={styles.sliderActions}>
            {!isSkipped && (
              <Badge 
                text={displayValue} 
                variant={item.color === colors.primary ? 'primary' : 'default'}
              />
            )}
            <TouchableOpacity
              onPress={() => toggleSkipItem(key)}
              style={[styles.skipButton, isSkipped && styles.skipButtonActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.skipButtonText, isSkipped && styles.skipButtonTextActive]}>
                {isSkipped ? '평가하기' : '스킵'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {!isSkipped && (
          <>
            <Text style={styles.sliderDescription}>{item.description}</Text>
            <Slider
              value={safeValue}
              onValueChange={(val) => handleScoreChange(key, val)}
              min={1}
              max={5}
              step={1}
              color={item.color}
              style={styles.slider}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelMin}>약함</Text>
              <Text style={styles.sliderLabelCurrent}>
                {item.labels[safeValue] || item.labels[3]}
              </Text>
              <Text style={styles.sliderLabelMax}>강함</Text>
            </View>
          </>
        )}
        
        {isSkipped && (
          <View style={styles.skippedMessage}>
            <Text style={styles.skippedMessageText}>이 항목은 평가하지 않습니다</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar
        title="수치 평가"
        subtitle={params.mode === 'cafe' ? '☕ 카페 모드' : '🏠 홈카페 모드'}
        onBack={() => navigation.goBack()}
        progress={params.mode === 'cafe' ? 0.71 : 0.75}
        showProgress={true}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* 안내 메시지 */}
        <Card style={styles.guideSection}>
          <Text style={styles.guideTitle}>☕ 커피의 마우스필을 평가해주세요</Text>
          <Text style={styles.guideSubtitle}>
            1점(약함) ~ 5점(강함) • 평가: {6 - skippedItems.size}/6개
          </Text>
        </Card>

        {/* 슬라이더 섹션 */}
        <View style={styles.slidersSection}>
          {Object.keys(scores).map((key) => renderSliderItem(key as keyof typeof scores))}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Button
            title="건너뛰기"
            onPress={handleSkip}
            variant="secondary"
            size="medium"
            style={styles.skipFooterButton}
          />
          <Button
            title="다음"
            onPress={handleNext}
            variant="primary"
            size="large"
            style={styles.nextFooterButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  guideSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  guideTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  guideSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  slidersSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  sliderContainer: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sliderContainerSkipped: {
    backgroundColor: colors.gray[50],
    opacity: 0.8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sliderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sliderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sliderEmoji: {
    fontSize: 20,
  },
  sliderName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
  },
  sliderDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  slider: {
    marginBottom: spacing.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  sliderLabelMin: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    flex: 1,
    textAlign: 'left',
  },
  sliderLabelCurrent: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium as any,
    flex: 2,
    textAlign: 'center',
  },
  sliderLabelMax: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  skipFooterButton: {
    flex: 1,
  },
  nextFooterButton: {
    flex: 2,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  skipButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    fontWeight: typography.fontWeight.medium as any,
  },
  skipButtonTextActive: {
    color: colors.white,
  },
  textSkipped: {
    opacity: 0.5,
  },
  skippedMessage: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skippedMessageText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
});

export default SensoryMouthFeel;