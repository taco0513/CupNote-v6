import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography } from '../../styles/theme';
import useStore from '../../store/useStore';
import type { TastingFlowNavigationProp, TastingFlowRouteProp } from '../../types/navigation';

// SCA Flavor Wheel 완전판 데이터 구조
interface FlavorItem {
  id: string;
  level1: string;
  level2: string;
  level3?: string;
  nameKo: string;
  nameEn: string;
  description?: string;
  emoji?: string;
  frequency?: number;
}

// SCA Flavor Wheel 완전판 - 9개 대분류, 85개 향미
const SCA_FLAVOR_DATABASE: FlavorItem[] = [
  // 🍓 과일향/프루티 (Fruity) - 16개
  { id: 'f1', level1: '과일향/프루티', level2: '베리류', level3: '블랙베리', nameKo: '블랙베리', nameEn: 'Blackberry', description: '진하고 달콤한 검은 베리' },
  { id: 'f2', level1: '과일향/프루티', level2: '베리류', level3: '라즈베리', nameKo: '라즈베리', nameEn: 'Raspberry', description: '새콤달콤한 붉은 베리' },
  { id: 'f3', level1: '과일향/프루티', level2: '베리류', level3: '블루베리', nameKo: '블루베리', nameEn: 'Blueberry', description: '달콤하고 과즙이 많은 베리' },
  { id: 'f4', level1: '과일향/프루티', level2: '베리류', level3: '딸기', nameKo: '딸기', nameEn: 'Strawberry', description: '상큼하고 달콤한 붉은 베리' },
  { id: 'f5', level1: '과일향/프루티', level2: '건조 과일', level3: '건포도', nameKo: '건포도', nameEn: 'Raisin', description: '달콤하고 진한 말린 포도' },
  { id: 'f6', level1: '과일향/프루티', level2: '건조 과일', level3: '자두', nameKo: '자두', nameEn: 'Prune', description: '부드럽고 달콤한 과일' },
  { id: 'f7', level1: '과일향/프루티', level2: '기타 과일', level3: '코코넛', nameKo: '코코넛', nameEn: 'Coconut' },
  { id: 'f8', level1: '과일향/프루티', level2: '기타 과일', level3: '체리', nameKo: '체리', nameEn: 'Cherry' },
  { id: 'f9', level1: '과일향/프루티', level2: '기타 과일', level3: '석류', nameKo: '석류', nameEn: 'Pomegranate' },
  { id: 'f10', level1: '과일향/프루티', level2: '기타 과일', level3: '파인애플', nameKo: '파인애플', nameEn: 'Pineapple' },
  { id: 'f11', level1: '과일향/프루티', level2: '기타 과일', level3: '포도', nameKo: '포도', nameEn: 'Grape' },
  { id: 'f12', level1: '과일향/프루티', level2: '기타 과일', level3: '사과', nameKo: '사과', nameEn: 'Apple' },
  { id: 'f13', level1: '과일향/프루티', level2: '기타 과일', level3: '복숭아', nameKo: '복숭아', nameEn: 'Peach' },
  { id: 'f14', level1: '과일향/프루티', level2: '기타 과일', level3: '배', nameKo: '배', nameEn: 'Pear' },
  { id: 'f15', level1: '과일향/프루티', level2: '감귤향/시트러스', level3: '자몽', nameKo: '자몽', nameEn: 'Grapefruit' },
  { id: 'f16', level1: '과일향/프루티', level2: '감귤향/시트러스', level3: '오렌지', nameKo: '오렌지', nameEn: 'Orange' },
  { id: 'f17', level1: '과일향/프루티', level2: '감귤향/시트러스', level3: '레몬', nameKo: '레몬', nameEn: 'Lemon' },
  { id: 'f18', level1: '과일향/프루티', level2: '감귤향/시트러스', level3: '라임', nameKo: '라임', nameEn: 'Lime' },
  
  // 🍋 신맛/발효 (Sour/Fermented) - 11개
  { id: 's1', level1: '신맛/발효', level2: '신맛', level3: '신맛 아로마', nameKo: '신맛 아로마', nameEn: 'Sour Aromatics' },
  { id: 's2', level1: '신맛/발효', level2: '신맛', level3: '아세트산', nameKo: '아세트산', nameEn: 'Acetic Acid' },
  { id: 's3', level1: '신맛/발효', level2: '신맛', level3: '뷰티르산', nameKo: '뷰티르산', nameEn: 'Butyric Acid' },
  { id: 's4', level1: '신맛/발효', level2: '신맛', level3: '이소발러산', nameKo: '이소발러산', nameEn: 'Isovaleric Acid' },
  { id: 's5', level1: '신맛/발효', level2: '신맛', level3: '구연산', nameKo: '구연산', nameEn: 'Citric Acid' },
  { id: 's6', level1: '신맛/발효', level2: '신맛', level3: '사과산', nameKo: '사과산', nameEn: 'Malic Acid' },
  { id: 's7', level1: '신맛/발효', level2: '알코올/발효', level3: '와인향', nameKo: '와인향', nameEn: 'Winey' },
  { id: 's8', level1: '신맛/발효', level2: '알코올/발효', level3: '위스키향', nameKo: '위스키향', nameEn: 'Whiskey' },
  { id: 's9', level1: '신맛/발효', level2: '알코올/발효', level3: '발효', nameKo: '발효', nameEn: 'Fermented' },
  { id: 's10', level1: '신맛/발효', level2: '알코올/발효', level3: '과숙', nameKo: '과숙', nameEn: 'Overripe' },
  
  // 🌿 초록/식물성 (Green/Vegetative) - 11개
  { id: 'g1', level1: '초록/식물성', level2: '올리브 오일', nameKo: '올리브 오일', nameEn: 'Olive Oil' },
  { id: 'g2', level1: '초록/식물성', level2: '생것', nameKo: '생것', nameEn: 'Raw' },
  { id: 'g3', level1: '초록/식물성', level2: '허브/식물성', level3: '덜 익은', nameKo: '덜 익은', nameEn: 'Under-ripe' },
  { id: 'g4', level1: '초록/식물성', level2: '허브/식물성', level3: '완두콩 꼬투리', nameKo: '완두콩 꼬투리', nameEn: 'Peapod' },
  { id: 'g5', level1: '초록/식물성', level2: '허브/식물성', level3: '신선한', nameKo: '신선한', nameEn: 'Fresh' },
  { id: 'g6', level1: '초록/식물성', level2: '허브/식물성', level3: '진한 녹색', nameKo: '진한 녹색', nameEn: 'Dark Green' },
  { id: 'g7', level1: '초록/식물성', level2: '허브/식물성', level3: '식물성', nameKo: '식물성', nameEn: 'Vegetative' },
  { id: 'g8', level1: '초록/식물성', level2: '허브/식물성', level3: '건초', nameKo: '건초', nameEn: 'Hay-like' },
  { id: 'g9', level1: '초록/식물성', level2: '허브/식물성', level3: '허브', nameKo: '허브', nameEn: 'Herb-like' },
  { id: 'g10', level1: '초록/식물성', level2: '콩비린내', nameKo: '콩비린내', nameEn: 'Beany' },
  
  // 🔥 로스팅 (Roasted) - 8개
  { id: 'r1', level1: '로스팅', level2: '파이프 담배', nameKo: '파이프 담배', nameEn: 'Pipe Tobacco' },
  { id: 'r2', level1: '로스팅', level2: '담배', nameKo: '담배', nameEn: 'Tobacco' },
  { id: 'r3', level1: '로스팅', level2: '탄내/스모키', level3: '신랄한', nameKo: '신랄한', nameEn: 'Acrid' },
  { id: 'r4', level1: '로스팅', level2: '탄내/스모키', level3: '재 냄새', nameKo: '재 냄새', nameEn: 'Ashy' },
  { id: 'r5', level1: '로스팅', level2: '탄내/스모키', level3: '연기', nameKo: '연기', nameEn: 'Smoky' },
  { id: 'r6', level1: '로스팅', level2: '탄내/스모키', level3: '브라운 로스트', nameKo: '브라운 로스트', nameEn: 'Brown Roast' },
  { id: 'r7', level1: '로스팅', level2: '곡물 냄새', level3: '곡식', nameKo: '곡식', nameEn: 'Cereal' },
  { id: 'r8', level1: '로스팅', level2: '곡물 냄새', level3: '맥아', nameKo: '맥아', nameEn: 'Malt' },
  
  // 🌶️ 향신료 (Spices) - 6개
  { id: 'sp1', level1: '향신료', level2: '자극적', nameKo: '자극적', nameEn: 'Pungent' },
  { id: 'sp2', level1: '향신료', level2: '후추', nameKo: '후추', nameEn: 'Pepper' },
  { id: 'sp3', level1: '향신료', level2: '갈색 향신료', level3: '아니스', nameKo: '아니스', nameEn: 'Anise' },
  { id: 'sp4', level1: '향신료', level2: '갈색 향신료', level3: '육두구', nameKo: '육두구', nameEn: 'Nutmeg' },
  { id: 'sp5', level1: '향신료', level2: '갈색 향신료', level3: '계피', nameKo: '계피', nameEn: 'Cinnamon' },
  { id: 'sp6', level1: '향신료', level2: '갈색 향신료', level3: '정향', nameKo: '정향', nameEn: 'Clove' },
  
  // 🥜 견과류/코코아 (Nutty/Cocoa) - 5개
  { id: 'n1', level1: '견과류/코코아', level2: '견과류', level3: '아몬드', nameKo: '아몬드', nameEn: 'Almond' },
  { id: 'n2', level1: '견과류/코코아', level2: '견과류', level3: '헤이즐넛', nameKo: '헤이즐넛', nameEn: 'Hazelnut' },
  { id: 'n3', level1: '견과류/코코아', level2: '견과류', level3: '땅콩', nameKo: '땅콩', nameEn: 'Peanuts' },
  { id: 'n4', level1: '견과류/코코아', level2: '초콜릿향', level3: '초콜릿', nameKo: '초콜릿', nameEn: 'Chocolate' },
  { id: 'n5', level1: '견과류/코코아', level2: '초콜릿향', level3: '다크초콜릿', nameKo: '다크초콜릿', nameEn: 'Dark Chocolate' },
  
  // 🍯 단맛 (Sweet) - 9개
  { id: 'sw1', level1: '단맛', level2: '캐러멜향', level3: '당밀', nameKo: '당밀', nameEn: 'Molasses' },
  { id: 'sw2', level1: '단맛', level2: '캐러멜향', level3: '메이플시럽', nameKo: '메이플시럽', nameEn: 'Maple Syrup' },
  { id: 'sw3', level1: '단맛', level2: '캐러멜향', level3: '캐러멜', nameKo: '캐러멜', nameEn: 'Caramelized' },
  { id: 'sw4', level1: '단맛', level2: '캐러멜향', level3: '꿀', nameKo: '꿀', nameEn: 'Honey' },
  { id: 'sw5', level1: '단맛', level2: '바닐라', nameKo: '바닐라', nameEn: 'Vanilla' },
  { id: 'sw6', level1: '단맛', level2: '바닐린', nameKo: '바닐린', nameEn: 'Vanillin' },
  { id: 'sw7', level1: '단맛', level2: '전반적 단맛', nameKo: '전반적 단맛', nameEn: 'Overall Sweet' },
  { id: 'sw8', level1: '단맛', level2: '달콤한 아로마', nameKo: '달콤한 아로마', nameEn: 'Sweet Aromatics' },
  
  // 🌺 꽃향기 (Floral) - 4개
  { id: 'fl1', level1: '꽃향기', level2: '홍차', nameKo: '홍차', nameEn: 'Black Tea' },
  { id: 'fl2', level1: '꽃향기', level2: '꽃향기', level3: '카모마일', nameKo: '카모마일', nameEn: 'Chamomile' },
  { id: 'fl3', level1: '꽃향기', level2: '꽃향기', level3: '장미', nameKo: '장미', nameEn: 'Rose' },
  { id: 'fl4', level1: '꽃향기', level2: '꽃향기', level3: '자스민', nameKo: '자스민', nameEn: 'Jasmine' },
  
  // 📦 기타 (Other) - 14개
  { id: 'o1', level1: '기타', level2: '종이/곰팡이', level3: '묵은', nameKo: '묵은', nameEn: 'Stale' },
  { id: 'o2', level1: '기타', level2: '종이/곰팡이', level3: '판지', nameKo: '판지', nameEn: 'Cardboard' },
  { id: 'o3', level1: '기타', level2: '종이/곰팡이', level3: '종이', nameKo: '종이', nameEn: 'Papery' },
  { id: 'o4', level1: '기타', level2: '종이/곰팡이', level3: '목재', nameKo: '목재', nameEn: 'Woody' },
  { id: 'o5', level1: '기타', level2: '종이/곰팡이', level3: '곰팡이/습한', nameKo: '곰팡이/습한', nameEn: 'Moldy/Damp' },
  { id: 'o6', level1: '기타', level2: '종이/곰팡이', level3: '곰팡이/먼지', nameKo: '곰팡이/먼지', nameEn: 'Musty/Dusty' },
  { id: 'o7', level1: '기타', level2: '종이/곰팡이', level3: '곰팡이/흙냄새', nameKo: '곰팡이/흙냄새', nameEn: 'Musty/Earthy' },
  { id: 'o8', level1: '기타', level2: '종이/곰팡이', level3: '동물 냄새', nameKo: '동물 냄새', nameEn: 'Animalic' },
  { id: 'o9', level1: '기타', level2: '종이/곰팡이', level3: '고기/육수', nameKo: '고기/육수', nameEn: 'Meaty/Brothy' },
  { id: 'o10', level1: '기타', level2: '종이/곰팡이', level3: '페놀', nameKo: '페놀', nameEn: 'Phenolic' },
  { id: 'o11', level1: '기타', level2: '화학물질', level3: '쓴맛', nameKo: '쓴맛', nameEn: 'Bitter' },
  { id: 'o12', level1: '기타', level2: '화학물질', level3: '짠맛', nameKo: '짠맛', nameEn: 'Salty' },
  { id: 'o13', level1: '기타', level2: '화학물질', level3: '약품', nameKo: '약품', nameEn: 'Medicinal' },
  { id: 'o14', level1: '기타', level2: '화학물질', level3: '석유', nameKo: '석유', nameEn: 'Petroleum' },
];


// 카테고리별 이모지
const CATEGORY_EMOJIS: {[key: string]: string} = {
  '과일향/프루티': '🍓',
  '신맛/발효': '🍋',
  '초록/식물성': '🌿',
  '로스팅': '🔥',
  '향신료': '🌶️',
  '견과류/코코아': '🥜',
  '단맛': '🍯',
  '꽃향기': '🌺',
  '기타': '📦'
};

interface FlavorChoice {
  level1: string;
  level2: string;
  level3?: string[];
}

export const FlavorSelection: React.FC = () => {
  const navigation = useNavigation<TastingFlowNavigationProp>();
  const route = useRoute<TastingFlowRouteProp<'FlavorSelection'>>();
  const { mode } = route.params;
  const { setTastingFlowData } = useStore();

  const [selectedFlavors, setSelectedFlavors] = useState<FlavorChoice[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 카테고리별 그룹화
  const flavorsByCategory = useMemo(() => {
    const grouped: {[key: string]: {[key: string]: FlavorItem[]}} = {};
    
    SCA_FLAVOR_DATABASE.forEach(flavor => {
      if (!grouped[flavor.level1]) {
        grouped[flavor.level1] = {};
      }
      if (!grouped[flavor.level1][flavor.level2]) {
        grouped[flavor.level1][flavor.level2] = [];
      }
      if (flavor.level3) {
        grouped[flavor.level1][flavor.level2].push(flavor);
      }
    });
    
    return grouped;
  }, []);


  // 카테고리 토글
  const toggleCategory = useCallback((category: string) => {
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

  // Level 2 선택 처리
  const handleLevel2Select = useCallback((level1: string, level2: string) => {
    setSelectedFlavors(prev => {
      const existing = prev.findIndex(f => f.level1 === level1 && f.level2 === level2);
      
      if (existing >= 0) {
        // 이미 선택된 경우 제거
        return prev.filter((_, i) => i !== existing);
      } else {
        // 새로 선택
        return [...prev, { level1, level2 }];
      }
    });
  }, []);

  // Level 3 선택 처리
  const handleLevel3Select = useCallback((level1: string, level2: string, level3: string) => {
    setSelectedFlavors(prev => {
      const existing = prev.findIndex(f => f.level1 === level1 && f.level2 === level2);
      
      if (existing >= 0) {
        const current = prev[existing];
        const level3Array = current.level3 || [];
        
        if (level3Array.includes(level3)) {
          // Level 3 제거
          const newLevel3 = level3Array.filter(l => l !== level3);
          if (newLevel3.length === 0) {
            // Level 3가 모두 제거되면 항목 자체를 제거
            return prev.filter((_, i) => i !== existing);
          }
          return prev.map((f, i) => 
            i === existing ? { ...f, level3: newLevel3 } : f
          );
        } else {
          // Level 3 추가
          return prev.map((f, i) => 
            i === existing ? { ...f, level3: [...level3Array, level3] } : f
          );
        }
      } else {
        // 새로 선택 (Level 3만)
        return [...prev, { level1, level2, level3: [level3] }];
      }
    });
  }, []);

  // 선택 여부 확인
  const isLevel2Selected = useCallback((level1: string, level2: string) => {
    return selectedFlavors.some(f => 
      f.level1 === level1 && f.level2 === level2 && !f.level3
    );
  }, [selectedFlavors]);

  const isLevel3Selected = useCallback((level1: string, level2: string, level3: string) => {
    return selectedFlavors.some(f => 
      f.level1 === level1 && f.level2 === level2 && f.level3?.includes(level3)
    );
  }, [selectedFlavors]);

  const hasLevel3Selected = useCallback((level1: string, level2: string) => {
    return selectedFlavors.some(f => 
      f.level1 === level1 && f.level2 === level2 && f.level3 && f.level3.length > 0
    );
  }, [selectedFlavors]);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
    // FlavorChoice 객체를 문자열 배열로 변환
    const flavorStrings: string[] = [];
    selectedFlavors.forEach(flavor => {
      if (flavor.level3 && flavor.level3.length > 0) {
        // level3가 있으면 level3 항목들을 추가
        flavor.level3.forEach(l3 => {
          flavorStrings.push(l3);
        });
      } else {
        // level3가 없으면 level2를 추가
        flavorStrings.push(flavor.level2);
      }
    });
    
    setTastingFlowData({ flavors: flavorStrings });
    navigation.navigate('SensoryExpression', { mode });
  }, [selectedFlavors, navigation, mode, setTastingFlowData]);

  // 선택된 향미 개수 계산
  const selectedCount = useMemo(() => {
    return selectedFlavors.reduce((count, flavor) => {
      if (flavor.level3) {
        return count + flavor.level3.length;
      }
      return count + 1;
    }, 0);
  }, [selectedFlavors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>향미 선택</Text>
        <Text style={styles.stepIndicator}>
          {mode === 'cafe' ? '3/7' : '4/8'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>☕ 느껴지는 향미를 선택해주세요</Text>
          <Text style={styles.subtitle}>
            제한 없음 • 선택: {selectedCount}개
          </Text>

          {/* 선택된 향미 프리뷰 - 상단 이동 */}
          <View style={styles.selectedPreview}>
            <Text style={styles.selectedPreviewTitle}>선택된 향미 ({selectedCount}개)</Text>
            {selectedCount > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.selectedPreviewChips}>
                  {selectedFlavors.map((flavor, index) => {
                    if (flavor.level3) {
                      return flavor.level3.map(l3 => (
                        <View key={`${index}-${l3}`} style={styles.selectedChip}>
                          <Text style={styles.selectedChipText}>{l3}</Text>
                        </View>
                      ));
                    }
                    return (
                      <View key={index} style={styles.selectedChip}>
                        <Text style={styles.selectedChipText}>{flavor.level2}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>아직 선택된 향미가 없습니다</Text>
                <Text style={styles.emptyStateSubtext}>아래 카테고리에서 향미를 선택해주세요</Text>
              </View>
            )}
          </View>

          {/* 카테고리별 향미 선택 */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>📂 카테고리별 선택</Text>
              
              {Object.entries(flavorsByCategory).map(([level1, level2Groups]) => (
                <View key={level1} style={styles.categoryContainer}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(level1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>
                      {CATEGORY_EMOJIS[level1] || '📦'}
                    </Text>
                    <Text style={styles.categoryName}>{level1}</Text>
                    <Text style={styles.expandIcon}>
                      {expandedCategories.has(level1) ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>

                  {expandedCategories.has(level1) && (
                    <View style={styles.level2Container}>
                      {Object.entries(level2Groups).map(([level2, level3Items]) => (
                        <View key={level2} style={styles.level2Item}>
                          <TouchableOpacity
                            style={[
                              styles.level2Checkbox,
                              isLevel2Selected(level1, level2) && styles.level2Selected,
                              hasLevel3Selected(level1, level2) && styles.level2Disabled
                            ]}
                            onPress={() => !hasLevel3Selected(level1, level2) && handleLevel2Select(level1, level2)}
                            disabled={hasLevel3Selected(level1, level2)}
                          >
                            <Text style={[
                              styles.checkboxIcon,
                              (isLevel2Selected(level1, level2) || hasLevel3Selected(level1, level2)) && styles.checkboxIconSelected
                            ]}>
                              {isLevel2Selected(level1, level2) || hasLevel3Selected(level1, level2) ? '☑' : '□'}
                            </Text>
                            <Text style={[
                              styles.level2Text,
                              hasLevel3Selected(level1, level2) && styles.level2TextDisabled
                            ]}>
                              {level2}
                            </Text>
                          </TouchableOpacity>

                          {/* Level 3 옵션 */}
                          {level3Items.length > 0 && (
                            <View style={styles.level3Container}>
                              <Text style={styles.level3Label}>구체적으로:</Text>
                              <View style={styles.level3Options}>
                                {level3Items.map(item => (
                                  <TouchableOpacity
                                    key={item.id}
                                    style={[
                                      styles.level3Chip,
                                      isLevel3Selected(level1, level2, item.level3!) && styles.level3ChipSelected
                                    ]}
                                    onPress={() => handleLevel3Select(level1, level2, item.level3!)}
                                  >
                                    <Text style={[
                                      styles.level3ChipText,
                                      isLevel3Selected(level1, level2, item.level3!) && styles.level3ChipTextSelected
                                    ]}>
                                      {item.nameKo}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleNext}
          disabled={selectedCount === 0}
        >
          <Text style={styles.primaryButtonText}>
            {selectedCount > 0 ? '다음' : '향미를 선택해주세요'}
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
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoriesSection: {
    marginBottom: spacing.xl,
  },
  categoryContainer: {
    marginBottom: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  categoryName: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.gray500,
  },
  level2Container: {
    paddingLeft: spacing.lg,
    paddingTop: spacing.sm,
  },
  level2Item: {
    marginBottom: spacing.md,
  },
  level2Checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  level2Selected: {
    opacity: 1,
  },
  level2Disabled: {
    opacity: 0.6,
  },
  checkboxIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    color: colors.gray500,
  },
  checkboxIconSelected: {
    color: colors.primary,
  },
  level2Text: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  level2TextDisabled: {
    color: colors.gray400,
  },
  level3Container: {
    marginTop: spacing.sm,
    paddingLeft: spacing.xl,
  },
  level3Label: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  level3Options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  level3Chip: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  level3ChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  level3ChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray700,
  },
  level3ChipTextSelected: {
    color: colors.white,
  },
  selectedPreview: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  selectedPreviewTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  selectedPreviewChips: {
    flexDirection: 'row',
  },
  selectedChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.xs,
  },
  selectedChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
  },
  emptyStateContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray400,
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
});

export default FlavorSelection;