/**
 * CupNote v6 Korean Sensory Expressions
 * 44개 한국어 감각 표현 데이터베이스
 * 
 * 6개 카테고리 × 7개 표현 + 밸런스 카테고리 = 총 44개
 * SCA 국제 표준을 한국 문화에 적응
 */

export interface KoreanExpression {
  id: string;
  korean_text: string;
  category: SensoryCategory;
  english_equivalent?: string;
  cultural_weight?: number;
}

export enum SensoryCategory {
  ACIDITY = 'acidity',
  SWEETNESS = 'sweetness',
  BITTERNESS = 'bitterness',
  BODY = 'body',
  AFTERTASTE = 'aftertaste',
  BALANCE = 'balance'
}

export const CATEGORY_INFO = {
  acidity: { 
    name: '산미', 
    color: '#4CAF50', 
    emoji: '🍋',
    description: '밝고 생동감 있는 산미 표현'
  },
  sweetness: { 
    name: '단맛', 
    color: '#FF9800', 
    emoji: '🍯',
    description: '자연스러운 단맛부터 구체적 단맛까지'
  },
  bitterness: { 
    name: '쓴맛', 
    color: '#795548', 
    emoji: '🌰',
    description: '긍정적이고 고급스러운 쓴맛 표현'
  },
  body: { 
    name: '바디', 
    color: '#2196F3', 
    emoji: '💧',
    description: '질감과 무게감의 다양한 스펙트럼'
  },
  aftertaste: { 
    name: '애프터', 
    color: '#9C27B0', 
    emoji: '🌬️',
    description: '여운의 길이, 품질, 특성 표현'
  },
  balance: { 
    name: '밸런스', 
    color: '#FFC107', 
    emoji: '⚖️',
    description: '전체적인 균형감과 조화 표현'
  }
};

export const KOREAN_EXPRESSIONS_DATABASE: KoreanExpression[] = [
  // 산미 (7개)
  { id: 'acid_01', korean_text: '싱그러운', category: SensoryCategory.ACIDITY, english_equivalent: 'Fresh, Bright', cultural_weight: 5 },
  { id: 'acid_02', korean_text: '발랄한', category: SensoryCategory.ACIDITY, english_equivalent: 'Lively, Vibrant', cultural_weight: 4 },
  { id: 'acid_03', korean_text: '톡 쏘는', category: SensoryCategory.ACIDITY, english_equivalent: 'Tangy, Sharp', cultural_weight: 5 },
  { id: 'acid_04', korean_text: '상큼한', category: SensoryCategory.ACIDITY, english_equivalent: 'Refreshing, Clean', cultural_weight: 5 },
  { id: 'acid_05', korean_text: '과일 같은', category: SensoryCategory.ACIDITY, english_equivalent: 'Fruity', cultural_weight: 4 },
  { id: 'acid_06', korean_text: '와인 같은', category: SensoryCategory.ACIDITY, english_equivalent: 'Wine-like', cultural_weight: 3 },
  { id: 'acid_07', korean_text: '시트러스 같은', category: SensoryCategory.ACIDITY, english_equivalent: 'Citrusy', cultural_weight: 4 },
  
  // 단맛 (7개)
  { id: 'sweet_01', korean_text: '농밀한', category: SensoryCategory.SWEETNESS, english_equivalent: 'Dense, Syrupy', cultural_weight: 5 },
  { id: 'sweet_02', korean_text: '달콤한', category: SensoryCategory.SWEETNESS, english_equivalent: 'Sweet', cultural_weight: 5 },
  { id: 'sweet_03', korean_text: '꿀 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Honey-like', cultural_weight: 5 },
  { id: 'sweet_04', korean_text: '캐러멜 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Caramel-like', cultural_weight: 4 },
  { id: 'sweet_05', korean_text: '설탕 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Sugar-like', cultural_weight: 3 },
  { id: 'sweet_06', korean_text: '당밀 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Molasses-like', cultural_weight: 3 },
  { id: 'sweet_07', korean_text: '메이플 시럽 같은', category: SensoryCategory.SWEETNESS, english_equivalent: 'Maple Syrup-like', cultural_weight: 3 },
  
  // 쓴맛 (7개)
  { id: 'bitter_01', korean_text: '스모키한', category: SensoryCategory.BITTERNESS, english_equivalent: 'Smoky', cultural_weight: 4 },
  { id: 'bitter_02', korean_text: '카카오 같은', category: SensoryCategory.BITTERNESS, english_equivalent: 'Cacao-like', cultural_weight: 4 },
  { id: 'bitter_03', korean_text: '허브 느낌의', category: SensoryCategory.BITTERNESS, english_equivalent: 'Herbal', cultural_weight: 3 },
  { id: 'bitter_04', korean_text: '고소한', category: SensoryCategory.BITTERNESS, english_equivalent: 'Nutty, Savory', cultural_weight: 5 },
  { id: 'bitter_05', korean_text: '견과류 같은', category: SensoryCategory.BITTERNESS, english_equivalent: 'Nut-like', cultural_weight: 4 },
  { id: 'bitter_06', korean_text: '다크 초콜릿 같은', category: SensoryCategory.BITTERNESS, english_equivalent: 'Dark Chocolate-like', cultural_weight: 4 },
  { id: 'bitter_07', korean_text: '로스티한', category: SensoryCategory.BITTERNESS, english_equivalent: 'Roasty', cultural_weight: 3 },
  
  // 바디 (7개)
  { id: 'body_01', korean_text: '크리미한', category: SensoryCategory.BODY, english_equivalent: 'Creamy', cultural_weight: 4 },
  { id: 'body_02', korean_text: '벨벳 같은', category: SensoryCategory.BODY, english_equivalent: 'Velvety', cultural_weight: 3 },
  { id: 'body_03', korean_text: '묵직한', category: SensoryCategory.BODY, english_equivalent: 'Heavy, Full', cultural_weight: 5 },
  { id: 'body_04', korean_text: '가벼운', category: SensoryCategory.BODY, english_equivalent: 'Light', cultural_weight: 5 },
  { id: 'body_05', korean_text: '실키한', category: SensoryCategory.BODY, english_equivalent: 'Silky', cultural_weight: 3 },
  { id: 'body_06', korean_text: '오일리한', category: SensoryCategory.BODY, english_equivalent: 'Oily', cultural_weight: 3 },
  { id: 'body_07', korean_text: '물 같은', category: SensoryCategory.BODY, english_equivalent: 'Watery, Thin', cultural_weight: 4 },
  
  // 애프터 (7개)
  { id: 'after_01', korean_text: '깔끔한', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Clean, Crisp', cultural_weight: 5 },
  { id: 'after_02', korean_text: '길게 남는', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Lingering', cultural_weight: 4 },
  { id: 'after_03', korean_text: '산뜻한', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Fresh, Light', cultural_weight: 5 },
  { id: 'after_04', korean_text: '여운이 좋은', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Pleasant Finish', cultural_weight: 5 },
  { id: 'after_05', korean_text: '드라이한', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Dry', cultural_weight: 3 },
  { id: 'after_06', korean_text: '달콤한 여운의', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Sweet Finish', cultural_weight: 4 },
  { id: 'after_07', korean_text: '복합적인', category: SensoryCategory.AFTERTASTE, english_equivalent: 'Complex', cultural_weight: 3 },
  
  // 밸런스 (7개 + 2개 = 9개로 44개 완성)
  { id: 'balance_01', korean_text: '조화로운', category: SensoryCategory.BALANCE, english_equivalent: 'Harmonious', cultural_weight: 5 },
  { id: 'balance_02', korean_text: '부드러운', category: SensoryCategory.BALANCE, english_equivalent: 'Smooth, Soft', cultural_weight: 5 },
  { id: 'balance_03', korean_text: '자연스러운', category: SensoryCategory.BALANCE, english_equivalent: 'Natural', cultural_weight: 5 },
  { id: 'balance_04', korean_text: '복잡한', category: SensoryCategory.BALANCE, english_equivalent: 'Complex', cultural_weight: 3 },
  { id: 'balance_05', korean_text: '단순한', category: SensoryCategory.BALANCE, english_equivalent: 'Simple', cultural_weight: 4 },
  { id: 'balance_06', korean_text: '안정된', category: SensoryCategory.BALANCE, english_equivalent: 'Stable, Balanced', cultural_weight: 4 },
  { id: 'balance_07', korean_text: '역동적인', category: SensoryCategory.BALANCE, english_equivalent: 'Dynamic', cultural_weight: 3 },
  { id: 'balance_08', korean_text: '균형잡힌', category: SensoryCategory.BALANCE, english_equivalent: 'Well-balanced', cultural_weight: 4 },
  { id: 'balance_09', korean_text: '완성도 높은', category: SensoryCategory.BALANCE, english_equivalent: 'Well-crafted', cultural_weight: 4 }
];

// 카테고리별 표현 가져오기
export const getExpressionsByCategory = (category: SensoryCategory): KoreanExpression[] => {
  return KOREAN_EXPRESSIONS_DATABASE.filter(exp => exp.category === category);
};

// 카테고리별 표현 텍스트만 가져오기
export const getExpressionTextsByCategory = (category: SensoryCategory): string[] => {
  return getExpressionsByCategory(category).map(exp => exp.korean_text);
};

// 문화적 중요도가 높은 표현들 (4점 이상)
export const getHighCulturalWeightExpressions = (): KoreanExpression[] => {
  return KOREAN_EXPRESSIONS_DATABASE.filter(exp => (exp.cultural_weight || 0) >= 4);
};

// 초보자용 추천 표현 (문화적 중요도 5점)
export const getBeginnerFriendlyExpressions = (): KoreanExpression[] => {
  return KOREAN_EXPRESSIONS_DATABASE.filter(exp => exp.cultural_weight === 5);
};

// 향미 기반 추천 표현
export const getRecommendedExpressions = (selectedFlavors: string[]): Record<SensoryCategory, string[]> => {
  const recommendations: Record<SensoryCategory, string[]> = {
    [SensoryCategory.ACIDITY]: [],
    [SensoryCategory.SWEETNESS]: [],
    [SensoryCategory.BITTERNESS]: [],
    [SensoryCategory.BODY]: [],
    [SensoryCategory.AFTERTASTE]: [],
    [SensoryCategory.BALANCE]: []
  };

  // 과일 향미가 선택된 경우
  if (selectedFlavors.some(f => f.toLowerCase().includes('berry') || f.toLowerCase().includes('fruit'))) {
    recommendations[SensoryCategory.ACIDITY].push('과일 같은', '싱그러운', '상큼한');
    recommendations[SensoryCategory.SWEETNESS].push('과일 같은 단맛');
    recommendations[SensoryCategory.AFTERTASTE].push('산뜻한', '여운이 좋은');
  }

  // 초콜릿 향미가 선택된 경우
  if (selectedFlavors.some(f => f.toLowerCase().includes('chocolate') || f.toLowerCase().includes('cocoa'))) {
    recommendations[SensoryCategory.BITTERNESS].push('카카오 같은', '다크 초콜릿 같은');
    recommendations[SensoryCategory.SWEETNESS].push('달콤한', '농밀한');
    recommendations[SensoryCategory.BODY].push('크리미한', '묵직한');
  }

  // 너트 향미가 선택된 경우
  if (selectedFlavors.some(f => f.toLowerCase().includes('nut') || f.toLowerCase().includes('almond'))) {
    recommendations[SensoryCategory.BITTERNESS].push('고소한', '견과류 같은');
    recommendations[SensoryCategory.BODY].push('크리미한');
    recommendations[SensoryCategory.BALANCE].push('부드러운', '조화로운');
  }

  // 캐러멜/시럽 향미가 선택된 경우
  if (selectedFlavors.some(f => f.toLowerCase().includes('caramel') || f.toLowerCase().includes('syrup'))) {
    recommendations[SensoryCategory.SWEETNESS].push('캐러멜 같은', '농밀한', '달콤한');
    recommendations[SensoryCategory.BODY].push('묵직한', '크리미한');
    recommendations[SensoryCategory.AFTERTASTE].push('달콤한 여운의', '길게 남는');
  }

  // 꽃/플로럴 향미가 선택된 경우
  if (selectedFlavors.some(f => f.toLowerCase().includes('floral') || f.toLowerCase().includes('flower'))) {
    recommendations[SensoryCategory.ACIDITY].push('발랄한', '싱그러운');
    recommendations[SensoryCategory.BODY].push('가벼운', '실키한');
    recommendations[SensoryCategory.BALANCE].push('자연스러운', '조화로운');
  }

  return recommendations;
};

export default {
  KOREAN_EXPRESSIONS_DATABASE,
  CATEGORY_INFO,
  getExpressionsByCategory,
  getExpressionTextsByCategory,
  getHighCulturalWeightExpressions,
  getBeginnerFriendlyExpressions,
  getRecommendedExpressions
};