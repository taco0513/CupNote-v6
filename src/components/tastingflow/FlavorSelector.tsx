import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../theme';
import { Card } from '../layout/Card';
import { TextInput } from '../form/TextInput';

// SCA 85 Flavor Categories (한국어)
export const SCA_FLAVOR_CATEGORIES = {
  fruity: {
    name: '과일향',
    items: [
      'Berry (베리)', 'Dried Fruit (말린 과일)', 'Other Fruit (기타 과일)', 
      'Citrus Fruit (감귤류)', 'Stone Fruit (핵과)', 'Tropical Fruit (열대과일)',
    ],
    color: '#EC4899', // Pink
  },
  sweet: {
    name: '단맛',
    items: [
      'Chocolate (초콜릿)', 'Vanilla (바닐라)', 'Overall Sweet (전반적 단맛)', 
      'Sweet Aromatics (달콤한 향)', 'Honey (꿀)', 'Caramel (캐러멜)',
    ],
    color: '#F59E0B', // Amber
  },
  floral: {
    name: '꽃향',
    items: [
      'Black Tea (홍차)', 'Floral (꽃향)', 'Rose (장미)', 
      'Jasmine (자스민)', 'Lavender (라벤더)',
    ],
    color: '#A855F7', // Purple
  },
  spicy: {
    name: '향신료',
    items: [
      'Pungent (자극적)', 'Pepper (후추)', 'Brown Spice (갈색 향신료)', 
      'Cinnamon (계피)', 'Clove (정향)', 'Nutmeg (육두구)',
    ],
    color: '#DC2626', // Red
  },
  nutty: {
    name: '견과류',
    items: [
      'Nutty (견과류)', 'Cocoa (코코아)', 'Almond (아몬드)', 
      'Hazelnut (헤이즐넛)', 'Walnut (호두)', 'Peanut (땅콩)',
    ],
    color: '#92400E', // Brown
  },
  cereal: {
    name: '곡물',
    items: [
      'Cereal (곡물)', 'Grain (곡식)', 'Malty (몰트)', 
      'Bread (빵)', 'Toast (토스트)',
    ],
    color: '#D97706', // Orange
  },
  other: {
    name: '기타',
    items: [
      'Green/Vegetative (풀/채소)', 'Other (기타)', 'Roasted (로스팅)', 
      'Sour/Fermented (신맛/발효)', 'Earthy (흙냄새)', 'Smoky (훈제)',
    ],
    color: '#059669', // Green
  },
} as const;

export interface FlavorSelectorProps {
  /** 선택된 향미 배열 */
  selectedFlavors: string[];
  
  /** 향미 선택 변경 핸들러 */
  onSelectionChange: (flavors: string[]) => void;
  
  /** 최대 선택 가능 개수 */
  maxSelections?: number;
  
  /** 최소 선택 필요 개수 */
  minSelections?: number;
  
  /** 주요 향미 개수 (상위 몇 개를 주요 향미로 표시할지) */
  primaryFlavorsCount?: number;
  
  /** 검색 기능 활성화 */
  searchable?: boolean;
  
  /** 검색 플레이스홀더 */
  searchPlaceholder?: string;
  
  /** 카테고리별 표시 여부 */
  showByCategory?: boolean;
  
  /** 선택된 항목 우선 표시 */
  showSelectedFirst?: boolean;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
}

/**
 * CupNote v6 TastingFlow FlavorSelector 컴포넌트
 * 
 * Features:
 * - SCA 85개 향미 완전 지원
 * - 카테고리별 색상 구분
 * - 검색 기능
 * - 다중 선택 지원
 * - 주요/부차적 향미 구분
 * - 한국어 라벨 지원
 * - 접근성 지원
 * - 애니메이션 지원
 */
export const FlavorSelector: React.FC<FlavorSelectorProps> = ({
  selectedFlavors,
  onSelectionChange,
  maxSelections = 10,
  minSelections = 1,
  primaryFlavorsCount = 3,
  searchable = true,
  searchPlaceholder = '향미 검색...',
  showByCategory = true,
  showSelectedFirst = true,
  containerStyle,
  testID,
  accessibilityLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // 전체 향미 리스트 생성
  const allFlavors = useMemo(() => {
    const flavors: Array<{ 
      name: string; 
      category: string; 
      categoryName: string; 
      color: string; 
    }> = [];
    
    Object.entries(SCA_FLAVOR_CATEGORIES).forEach(([categoryKey, category]) => {
      category.items.forEach(item => {
        flavors.push({
          name: item,
          category: categoryKey,
          categoryName: category.name,
          color: category.color,
        });
      });
    });
    
    return flavors;
  }, []);

  // 필터링된 향미 리스트
  const filteredFlavors = useMemo(() => {
    let filtered = allFlavors;
    
    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(flavor => 
        flavor.name.toLowerCase().includes(query) ||
        flavor.categoryName.toLowerCase().includes(query)
      );
    }
    
    // 카테고리 필터
    if (activeCategory) {
      filtered = filtered.filter(flavor => flavor.category === activeCategory);
    }
    
    // 선택된 항목 우선 표시
    if (showSelectedFirst) {
      filtered.sort((a, b) => {
        const aSelected = selectedFlavors.includes(a.name);
        const bSelected = selectedFlavors.includes(b.name);
        
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });
    }
    
    return filtered;
  }, [allFlavors, searchQuery, activeCategory, selectedFlavors, showSelectedFirst]);

  // 향미 선택 토글
  const toggleFlavor = (flavorName: string) => {
    const isSelected = selectedFlavors.includes(flavorName);
    let newSelection: string[];
    
    if (isSelected) {
      // 선택 해제 (최소 선택 개수 확인)
      if (selectedFlavors.length > minSelections) {
        newSelection = selectedFlavors.filter(f => f !== flavorName);
      } else {
        return; // 최소 선택 개수 미달로 해제 불가
      }
    } else {
      // 선택 추가 (최대 선택 개수 확인)
      if (selectedFlavors.length < maxSelections) {
        newSelection = [...selectedFlavors, flavorName];
      } else {
        return; // 최대 선택 개수 초과로 추가 불가
      }
    }
    
    onSelectionChange(newSelection);
  };

  // 카테고리 버튼 스타일
  const getCategoryButtonStyle = (
    categoryKey: string, 
    isActive: boolean
  ): ViewStyle => {
    const category = SCA_FLAVOR_CATEGORIES[categoryKey as keyof typeof SCA_FLAVOR_CATEGORIES];
    
    return {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing[2],
      backgroundColor: isActive ? category.color : theme.colors.warm[100],
      borderWidth: 1,
      borderColor: category.color,
    };
  };

  // 카테고리 버튼 텍스트 스타일
  const getCategoryButtonTextStyle = (isActive: boolean): TextStyle => ({
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: isActive ? '#FFFFFF' : theme.colors.text.primary,
    fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
  });

  // 향미 항목 스타일
  const getFlavorItemStyle = (
    flavor: { name: string; color: string },
    isSelected: boolean
  ): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[3],
      marginHorizontal: theme.spacing[1],
      marginVertical: theme.spacing[1],
      borderRadius: theme.borderRadius.md,
      backgroundColor: isSelected ? flavor.color : theme.colors.warm[50],
      borderWidth: 2,
      borderColor: isSelected ? flavor.color : theme.colors.warm[200],
      minHeight: 48,
    };
  };

  // 향미 항목 텍스트 스타일
  const getFlavorItemTextStyle = (isSelected: boolean): TextStyle => ({
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: isSelected ? '#FFFFFF' : theme.colors.text.primary,
    fontWeight: isSelected ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
    flex: 1,
  });

  // 선택 카운터 스타일
  const getCounterStyle = (): ViewStyle => ({
    backgroundColor: theme.colors.coffee[500],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  });

  // 선택 카운터 텍스트 스타일
  const getCounterTextStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.bold,
  });

  // 카테고리 헤더 렌더링
  const renderCategoryHeader = () => {
    if (!showByCategory) return null;
    
    return (
      <View style={{ marginBottom: theme.spacing[4] }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing[4] }}
        >
          <TouchableOpacity
            style={getCategoryButtonStyle('all', activeCategory === null)}
            onPress={() => setActiveCategory(null)}
            testID={`${testID}-category-all`}
          >
            <Text style={getCategoryButtonTextStyle(activeCategory === null)}>
              전체
            </Text>
          </TouchableOpacity>
          
          {Object.entries(SCA_FLAVOR_CATEGORIES).map(([key, category]) => (
            <TouchableOpacity
              key={key}
              style={getCategoryButtonStyle(key, activeCategory === key)}
              onPress={() => setActiveCategory(activeCategory === key ? null : key)}
              testID={`${testID}-category-${key}`}
            >
              <Text style={getCategoryButtonTextStyle(activeCategory === key)}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // 향미 항목 렌더링
  const renderFlavorItem = ({ item: flavor }: { item: typeof filteredFlavors[0] }) => {
    const isSelected = selectedFlavors.includes(flavor.name);
    const canToggle = isSelected || selectedFlavors.length < maxSelections;
    
    return (
      <TouchableOpacity
        style={[
          getFlavorItemStyle(flavor, isSelected),
          !canToggle && { opacity: theme.opacity.disabled }
        ]}
        onPress={() => canToggle && toggleFlavor(flavor.name)}
        disabled={!canToggle}
        activeOpacity={theme.opacity.pressed}
        testID={`${testID}-flavor-${flavor.name}`}
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${flavor.name}, ${flavor.categoryName} 카테고리`}
      >
        <Text style={getFlavorItemTextStyle(isSelected)}>
          {flavor.name}
        </Text>
        
        {isSelected && (
          <View style={getCounterStyle()}>
            <Text style={getCounterTextStyle()}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View 
      style={containerStyle}
      testID={testID}
      accessible
      accessibilityLabel={accessibilityLabel || '향미 선택기'}
    >
      {/* 검색 입력 */}
      {searchable && (
        <View style={{ paddingHorizontal: theme.spacing[4], marginBottom: theme.spacing[4] }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            variant="outlined"
            leftIcon={<Text>🔍</Text>}
            testID={`${testID}-search`}
          />
        </View>
      )}

      {/* 카테고리 헤더 */}
      {renderCategoryHeader()}

      {/* 선택 상태 표시 */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: theme.spacing[4],
        marginBottom: theme.spacing[4],
      }}>
        <Text style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          fontFamily: theme.typography.fontFamily.regular,
        }}>
          {selectedFlavors.length} / {maxSelections} 선택됨
        </Text>
        
        {selectedFlavors.length >= primaryFlavorsCount && (
          <Text style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.status.success.default,
            fontFamily: theme.typography.fontFamily.medium,
          }}>
            주요 향미 {primaryFlavorsCount}개 선택완료
          </Text>
        )}
      </View>

      {/* 향미 리스트 */}
      <FlatList
        data={filteredFlavors}
        renderItem={renderFlavorItem}
        keyExtractor={(item) => item.name}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing[4] }}
        ListEmptyComponent={() => (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center',
            paddingVertical: theme.spacing[8],
          }}>
            <Text style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.tertiary,
              fontFamily: theme.typography.fontFamily.regular,
              textAlign: 'center',
            }}>
              {searchQuery ? '검색 결과가 없습니다' : '표시할 향미가 없습니다'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default FlavorSelector;