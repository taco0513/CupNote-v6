import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography } from '../../styles/theme';
import useStore from '../../store/useStore';
import type { TastingFlowNavigationProp, TastingFlowRouteProp } from '../../types/navigation';

// 한국어 감각 표현 시스템 - SCA 기반 문화적 적응
enum SensoryCategory {
  ACIDITY = 'acidity',       // 산미
  SWEETNESS = 'sweetness',   // 단맛
  BITTERNESS = 'bitterness', // 쓴맛
  BODY = 'body',             // 바디
  AFTERTASTE = 'aftertaste', // 애프터
  BALANCE = 'balance'        // 밸런스
}

interface KoreanExpression {
  id: string;
  korean_text: string;
  category: SensoryCategory;
  english_equivalent?: string;
  cultural_weight?: number;
}

// 44개 한국어 표현 데이터베이스 (6 × 7 + 2 추가)
const KOREAN_EXPRESSIONS_DATABASE: KoreanExpression[] = [
  // 🍋 산미 (Acidity) - 7개
  { id: 'acid_01', korean_text: '싱그러운', category: SensoryCategory.ACIDITY, english_equivalent: 'Fresh, Bright' },
  { id: 'acid_02', korean_text: '발랄한', category: SensoryCategory.ACIDITY, english_equivalent: 'Lively, Vibrant' },
  { id: 'acid_03', korean_text: '톡 쏘는', category: SensoryCategory.ACIDITY, english_equivalent: 'Tangy, Sharp' },
  { id: 'acid_04', korean_text: '상큼한', category: SensoryCategory.ACIDITY, english_equivalent: 'Refreshing, Clean' },
  { id: 'acid_05', korean_text: '과일 같은', category: SensoryCategory.ACIDITY, english_equivalent: 'Fruity' },
  { id: 'acid_06', korean_text: '와인 같은', category: SensoryCategory.ACIDITY, english_equivalent: 'Wine-like' },
  { id: 'acid_07', korean_text: '시트러스 같은', category: SensoryCategory.ACIDITY, english_equivalent: 'Citrusy' },
  
  // 🍯 단맛 (Sweetness) - 7개
  { id: 'sweet_01', korean_text: '농밀한', category: SensoryCategory.SWEETNESS, english_equivalent: 'Dense, Syrupy' },
  { id: 'sweet_02', korean_text: '달콤한', category: SensoryCategory.SWEETNESS, english_equivalent: 'Sweet' },
  { id: 'sweet_03', korean_text: '꿀 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Honey-like' },
  { id: 'sweet_04', korean_text: '캐러멜 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Caramel-like' },
  { id: 'sweet_05', korean_text: '설탕 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Sugar-like' },
  { id: 'sweet_06', korean_text: '당밀 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Molasses-like' },
  { id: 'sweet_07', korean_text: '메이플 시럽 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Maple Syrup-like' },
  
  // 🌰 쓴맛 (Bitterness) - 7개
  { id: 'bitter_01', korean_text: '스모키한', category: SensoryCategory.BITTERNESS, english_equivalent: 'Smoky' },
  { id: 'bitter_02', korean_text: '카카오 같은', category: SensoryCategory.BITTERNESS, english_equivalent: 'Cocoa-like' },
  { id: 'bitter_03', korean_text: '허브 느낌의', category: SensoryCategory.BITTERNESS, english_equivalent: 'Herbal' },
  { id: 'bitter_04', korean_text: '고소한', category: SensoryCategory.BITTERNESS, english_equivalent: 'Nutty, Savory' },
  { id: 'bitter_05', korean_text: '견과류 같은', category: SensoryCategory.BITTERNESS, english_equivalent: 'Nutty' },
  { id: 'bitter_06', korean_text: '다크 초콜릿 같은', category: SensoryCategory.BITTERNESS, english_equivalent: 'Dark Chocolate-like' },
  { id: 'bitter_07', korean_text: '로스티한', category: SensoryCategory.BITTERNESS, english_equivalent: 'Roasty' },
  
  // 💧 바디 (Body) - 7개
  { id: 'body_01', korean_text: '크리미한', category: SensoryCategory.BODY, english_equivalent: 'Creamy' },
  { id: 'body_02', korean_text: '벨벳 같은', category: SensoryCategory.BODY, english_equivalent: 'Velvety' },
  { id: 'body_03', korean_text: '묵직한', category: SensoryCategory.BODY, english_equivalent: 'Heavy, Full' },
  { id: 'body_04', korean_text: '가벼운', category: SensoryCategory.BODY, english_equivalent: 'Light' },
  { id: 'body_05', korean_text: '실키한', category: SensoryCategory.BODY, english_equivalent: 'Silky' },
  { id: 'body_06', korean_text: '오일리한', category: SensoryCategory.BODY, english_equivalent: 'Oily' },
  { id: 'body_07', korean_text: '물 같은', category: SensoryCategory.BODY, english_equivalent: 'Watery' },
  
  // 🌬️ 애프터 (Aftertaste) - 7개
  { id: 'after_01', korean_text: '깔끔한', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Clean' },
  { id: 'after_02', korean_text: '길게 남는', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Long-lasting' },
  { id: 'after_03', korean_text: '산뜻한', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Crisp' },
  { id: 'after_04', korean_text: '여운이 좋은', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Pleasant finish' },
  { id: 'after_05', korean_text: '드라이한', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Dry' },
  { id: 'after_06', korean_text: '달콤한 여운의', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Sweet finish' },
  { id: 'after_07', korean_text: '복합적인', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Complex' },
  
  // ⚖️ 밸런스 (Balance) - 7개
  { id: 'balance_01', korean_text: '조화로운', category: SensoryCategory.BALANCE, english_equivalent: 'Harmonious' },
  { id: 'balance_02', korean_text: '부드러운', category: SensoryCategory.BALANCE, english_equivalent: 'Smooth' },
  { id: 'balance_03', korean_text: '자연스러운', category: SensoryCategory.BALANCE, english_equivalent: 'Natural' },
  { id: 'balance_04', korean_text: '복잡한', category: SensoryCategory.BALANCE, english_equivalent: 'Complex' },
  { id: 'balance_05', korean_text: '단순한', category: SensoryCategory.BALANCE, english_equivalent: 'Simple' },
  { id: 'balance_06', korean_text: '안정된', category: SensoryCategory.BALANCE, english_equivalent: 'Stable' },
  { id: 'balance_07', korean_text: '역동적인', category: SensoryCategory.BALANCE, english_equivalent: 'Dynamic' },
];

// 카테고리별 메타 정보
const CATEGORY_META = {
  [SensoryCategory.ACIDITY]: {
    emoji: '🍋',
    name: '산미',
    description: '밝고 생동감 있는 산미 표현',
    color: {
      primary: colors.success,
      background: colors.successLight,
    }
  },
  [SensoryCategory.SWEETNESS]: {
    emoji: '🍯',
    name: '단맛',
    description: '자연스러운 단맛부터 구체적 단맛까지',
    color: {
      primary: colors.warning,
      background: colors.warningLight,
    }
  },
  [SensoryCategory.BITTERNESS]: {
    emoji: '🌰',
    name: '쓴맛',
    description: '부정적이지 않은 긍정적 쓴맛 표현',
    color: {
      primary: '#8B4513',
      background: '#F5E6D3',
    }
  },
  [SensoryCategory.BODY]: {
    emoji: '💧',
    name: '바디',
    description: '질감과 무게감의 다양한 스펙트럼',
    color: {
      primary: colors.info,
      background: colors.infoLight,
    }
  },
  [SensoryCategory.AFTERTASTE]: {
    emoji: '🌬️',
    name: '애프터',
    description: '여운의 길이, 품질, 특성 표현',
    color: {
      primary: '#9370DB',
      background: '#F3E8FF',
    }
  },
  [SensoryCategory.BALANCE]: {
    emoji: '⚖️',
    name: '밸런스',
    description: '전체적인 균형감과 조화 표현',
    color: {
      primary: '#DAA520',
      background: '#FFF8DC',
    }
  }
};

interface SensoryExpressionData {
  expressions: {
    [key in SensoryCategory]: KoreanExpression[];
  };
  total_selected: number;
  categories_used: number;
  category_distribution: {
    [key in SensoryCategory]: number;
  };
  selection_time: number;
  selection_timestamp: Date;
  evaluation_method: 'korean_cata';
}

export const SensoryExpression: React.FC = () => {
  const navigation = useNavigation<TastingFlowNavigationProp>();
  const route = useRoute<TastingFlowRouteProp<'SensoryExpression'>>();
  const { mode } = route.params;
  const { setTastingFlowData } = useStore();

  // 선택 상태 관리 (카테고리별로 최대 3개)
  const [selections, setSelections] = useState<Record<SensoryCategory, string[]>>({
    [SensoryCategory.ACIDITY]: [],
    [SensoryCategory.SWEETNESS]: [],
    [SensoryCategory.BITTERNESS]: [],
    [SensoryCategory.BODY]: [],
    [SensoryCategory.AFTERTASTE]: [],
    [SensoryCategory.BALANCE]: [],
  });

  // Progressive Disclosure 상태 (펼쳐진 카테고리)
  const [expandedCategories, setExpandedCategories] = useState<Set<SensoryCategory>>(
    new Set([SensoryCategory.ACIDITY]) // 기본적으로 첫 번째 카테고리 펼침
  );

  const [startTime] = useState(Date.now());

  // 카테고리별 표현 그룹화
  const expressionsByCategory = useMemo(() => {
    const grouped: Record<SensoryCategory, KoreanExpression[]> = {
      [SensoryCategory.ACIDITY]: [],
      [SensoryCategory.SWEETNESS]: [],
      [SensoryCategory.BITTERNESS]: [],
      [SensoryCategory.BODY]: [],
      [SensoryCategory.AFTERTASTE]: [],
      [SensoryCategory.BALANCE]: [],
    };

    KOREAN_EXPRESSIONS_DATABASE.forEach(expression => {
      grouped[expression.category].push(expression);
    });

    return grouped;
  }, []);

  // 전체 선택 통계
  const selectionStats = useMemo(() => {
    const total = Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);
    const categoriesUsed = Object.values(selections).filter(arr => arr.length > 0).length;
    const distribution = Object.entries(selections).reduce((acc, [category, selected]) => {
      acc[category as SensoryCategory] = selected.length;
      return acc;
    }, {} as Record<SensoryCategory, number>);

    return { total, categoriesUsed, distribution };
  }, [selections]);

  // 카테고리 펼치기/접기
  const toggleCategory = useCallback((category: SensoryCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // 표현 선택/해제 (CATA 방법론 - 최대 3개/카테고리)
  const toggleExpression = useCallback((category: SensoryCategory, expressionId: string) => {
    setSelections(prev => {
      const categorySelections = prev[category];
      const isSelected = categorySelections.includes(expressionId);

      if (isSelected) {
        // 선택 해제
        return {
          ...prev,
          [category]: categorySelections.filter(id => id !== expressionId)
        };
      } else if (categorySelections.length < 3) {
        // 새로 선택 (3개 제한)
        return {
          ...prev,
          [category]: [...categorySelections, expressionId]
        };
      }

      return prev; // 3개 초과 시 변경 없음
    });
  }, []);

  // 다음 화면으로 이동
  const handleNext = useCallback(() => {
    // 선택된 표현들을 문자열 배열로 변환
    const selectedExpressionTexts: string[] = [];

    Object.entries(selections).forEach(([category, selectedIds]) => {
      selectedIds.forEach(id => {
        const expression = KOREAN_EXPRESSIONS_DATABASE.find(expr => expr.id === id);
        if (expression) {
          selectedExpressionTexts.push(expression.korean_text);
        }
      });
    });

    setTastingFlowData({ sensoryExpressions: selectedExpressionTexts });
    navigation.navigate('SensoryMouthFeel', { mode });
  }, [selections, navigation, mode, setTastingFlowData]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>감각 표현</Text>
        <Text style={styles.stepIndicator}>
          {mode === 'cafe' ? '4/6' : '5/7'} (75%)
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 안내 메시지 */}
          <Text style={styles.title}>💬 느껴지는 감각을 자유롭게 선택해주세요</Text>
          <Text style={styles.subtitle}>각 카테고리에서 최대 3개까지 선택 가능</Text>

          {/* 선택 현황 요약 */}
          <View style={styles.selectionSummary}>
            <Text style={styles.summaryText}>
              총 {selectionStats.total}개 선택됨 ({selectionStats.categoriesUsed}개 카테고리 중 {Object.keys(CATEGORY_META).length}개 사용)
            </Text>
          </View>

          {/* 선택된 표현 요약 (가로 스크롤) */}
          {selectionStats.total > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedExpressionsScroll}>
              <View style={styles.selectedExpressions}>
                {Object.entries(selections).map(([category, selectedIds]) => 
                  selectedIds.map(id => {
                    const expression = KOREAN_EXPRESSIONS_DATABASE.find(e => e.id === id);
                    const categoryMeta = CATEGORY_META[category as SensoryCategory];
                    return (
                      <View 
                        key={id} 
                        style={[styles.selectedChip, { backgroundColor: categoryMeta.color.primary }]}
                      >
                        <Text style={styles.selectedChipText}>{expression?.korean_text}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          )}

          {/* 6개 카테고리 (Progressive Disclosure) */}
          <View style={styles.categoriesContainer}>
            {Object.values(SensoryCategory).map(category => {
              const meta = CATEGORY_META[category];
              const expressions = expressionsByCategory[category];
              const isExpanded = expandedCategories.has(category);
              const selectedCount = selections[category].length;
              const maxReached = selectedCount >= 3;

              return (
                <View key={category} style={styles.categorySection}>
                  {/* 카테고리 헤더 */}
                  <TouchableOpacity
                    style={[styles.categoryHeader, { backgroundColor: meta.color.background }]}
                    onPress={() => toggleCategory(category)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryHeaderLeft}>
                      <Text style={styles.categoryEmoji}>{meta.emoji}</Text>
                      <Text style={[styles.categoryName, { color: meta.color.primary }]}>
                        {meta.name}
                      </Text>
                    </View>
                    <View style={styles.categoryHeaderRight}>
                      <Text style={[styles.categoryCount, { color: meta.color.primary }]}>
                        {selectedCount}/3
                      </Text>
                      <Text style={[styles.expandIcon, { color: meta.color.primary }]}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* 표현 목록 (펼쳐진 상태일 때만) */}
                  {isExpanded && (
                    <View style={styles.expressionsList}>
                      {expressions.map(expression => {
                        const isSelected = selections[category].includes(expression.id);
                        const isDisabled = maxReached && !isSelected;

                        return (
                          <TouchableOpacity
                            key={expression.id}
                            style={[
                              styles.expressionButton,
                              isSelected && [styles.expressionButtonSelected, { 
                                backgroundColor: meta.color.primary,
                                borderColor: meta.color.primary 
                              }],
                              isDisabled && styles.expressionButtonDisabled
                            ]}
                            onPress={() => toggleExpression(category, expression.id)}
                            disabled={isDisabled}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.expressionButtonText,
                              isSelected && styles.expressionButtonTextSelected,
                              isDisabled && styles.expressionButtonTextDisabled
                            ]}>
                              {expression.korean_text}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, selectionStats.total === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, selectionStats.total === 0 && styles.nextButtonTextDisabled]}>
            {selectionStats.total === 0 ? '자유 선택 (건너뛰기 가능)' : '다음'}
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text,
  },
  stepIndicator: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  selectionSummary: {
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium as any,
  },
  selectedExpressionsScroll: {
    marginBottom: spacing.lg,
  },
  selectedExpressions: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  selectedChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  selectedChipText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
  },
  categoriesContainer: {
    gap: spacing.md,
  },
  categorySection: {
    borderRadius: 12,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryCount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
  },
  expandIcon: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold as any,
  },
  expressionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.xs,
  },
  expressionButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray300,
    minWidth: '28%',
    alignItems: 'center',
  },
  expressionButtonSelected: {
    borderWidth: 2,
  },
  expressionButtonDisabled: {
    backgroundColor: colors.gray100,
    opacity: 0.5,
  },
  expressionButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  expressionButtonTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium as any,
  },
  expressionButtonTextDisabled: {
    color: colors.gray400,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
  nextButtonTextDisabled: {
    color: colors.gray500,
  },
});

export default SensoryExpression;