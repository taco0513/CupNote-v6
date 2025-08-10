import React, { useState, useCallback, useMemo, useRef } from 'react';
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
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '../../styles/theme';
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

  // 상태 관리
  const [scores, setScores] = useState(DEFAULT_SCORES);

  // 점수 업데이트 핸들러
  const handleScoreChange = useCallback((category: keyof typeof scores, value: number) => {
    setScores(prev => ({
      ...prev,
      [category]: Math.round(value) // 정수값으로만 저장
    }));
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
    navigation.navigate('PersonalNotes', route.params);
  }, [navigation, route.params, setTastingFlowData]);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
    setTastingFlowData({ ratings: {
      acidity: scores.acidity || 0,
      sweetness: scores.sweetness || 0,
      bitterness: scores.bitterness || 0,
      body: scores.body || 0,
      balance: scores.balance || 0,
      cleanliness: scores.finish || 0,
      aftertaste: scores.finish || 0,
    }});
    navigation.navigate('PersonalNotes', route.params);
  }, [scores, navigation, route.params, setTastingFlowData]);


  // 슬라이더 아이템 렌더링
  const renderSliderItem = (key: keyof typeof scores) => {
    const item = EVALUATION_ITEMS[key];
    const value = scores[key];

    return (
      <View key={key} style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderTitle}>
            <Text style={styles.sliderEmoji}>{item.emoji}</Text>
            <Text style={styles.sliderName}>{item.name}</Text>
          </View>
          <Text style={[styles.sliderValue, { color: item.color }]}>{value}</Text>
        </View>

        <View style={styles.sliderContent}>
          <Slider
            style={styles.slider}
            value={value}
            onValueChange={(val) => handleScoreChange(key, val)}
            minimumValue={1}
            maximumValue={5}
            step={1}
            minimumTrackTintColor={item.color}
            maximumTrackTintColor={colors.gray300}
            thumbTintColor={item.color}
          />
          
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelMin}>약함</Text>
            <Text style={styles.sliderLabelMax}>강함</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '85%' }]} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>수치 평가</Text>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>건너뛰기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.guideSection}>
          <Text style={styles.guideTitle}>☕ 커피의 마우스필을 평가해주세요</Text>
          <Text style={styles.guideSubtitle}>1점(약함) ~ 5점(강함)</Text>
        </View>

        {/* 슬라이더 섹션 */}
        <View style={styles.slidersSection}>
          {Object.keys(scores).map((key) => renderSliderItem(key as keyof typeof scores))}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
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
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray200,
    borderRadius: 8,
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
    fontWeight: typography.fontWeight.medium as any,
  },
  guideSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  guideTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  guideSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  slidersSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  sliderContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sliderTitle: {
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
    color: colors.text,
  },
  sliderContent: {
    marginBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  sliderLabelMin: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
  },
  sliderValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
  },
  sliderLabelMax: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
});

export default SensoryMouthFeel;