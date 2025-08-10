import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';
import { Achievement } from '../../types';

interface AchievementCategoryProps {
  categories: Achievement['category'][];
  selectedCategory?: Achievement['category'] | 'all';
  onCategorySelect: (category: Achievement['category'] | 'all') => void;
  achievementCounts?: Record<Achievement['category'] | 'all', { total: number; unlocked: number }>;
}

const getCategoryInfo = (category: Achievement['category'] | 'all') => {
  switch (category) {
    case 'all':
      return {
        name: '전체',
        icon: '🏆',
        color: colors.primary,
        description: '모든 성취',
      };
    case 'quantity':
      return {
        name: '기록 수량',
        icon: '📊',
        color: colors.info,
        description: '기록 개수 관련 성취',
      };
    case 'quality':
      return {
        name: '품질 평가',
        icon: '⭐',
        color: colors.warning,
        description: '평점과 품질 관련 성취',
      };
    case 'variety':
      return {
        name: '다양성 탐험',
        icon: '🌍',
        color: colors.success,
        description: '다양한 커피 탐험 성취',
      };
    case 'social':
      return {
        name: '커뮤니티',
        icon: '👥',
        color: colors.secondary,
        description: '커뮤니티 활동 성취',
      };
    case 'expertise':
      return {
        name: '전문성',
        icon: '🎓',
        color: colors.error,
        description: '커피 전문성 성취',
      };
    case 'special':
      return {
        name: '특별 성취',
        icon: '✨',
        color: colors.purple,
        description: '특별한 조건의 성취',
      };
    default:
      return {
        name: category,
        icon: '🏆',
        color: colors.gray[500],
        description: '',
      };
  }
};

export const AchievementCategory: React.FC<AchievementCategoryProps> = ({
  categories,
  selectedCategory = 'all',
  onCategorySelect,
  achievementCounts,
}) => {
  const allCategories: (Achievement['category'] | 'all')[] = ['all', ...categories];

  const renderCategory = (category: Achievement['category'] | 'all') => {
    const categoryInfo = getCategoryInfo(category);
    const isSelected = selectedCategory === category;
    const counts = achievementCounts?.[category];

    const buttonStyle = [
      styles.categoryButton,
      isSelected && [styles.selectedCategoryButton, { borderColor: categoryInfo.color }],
    ];

    const textStyle = [
      styles.categoryName,
      isSelected && [styles.selectedCategoryName, { color: categoryInfo.color }],
    ];

    const iconStyle = [
      styles.categoryIcon,
      isSelected && styles.selectedCategoryIcon,
    ];

    return (
      <TouchableOpacity
        key={category}
        style={buttonStyle}
        onPress={() => onCategorySelect(category)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
          <Text style={iconStyle}>{categoryInfo.icon}</Text>
          <Text style={textStyle} numberOfLines={1}>
            {categoryInfo.name}
          </Text>
          
          {counts && (
            <View style={styles.countContainer}>
              <Text style={[styles.countText, isSelected && { color: categoryInfo.color }]}>
                {counts.unlocked}/{counts.total}
              </Text>
              {counts.unlocked > 0 && (
                <View style={[styles.progressBar, { backgroundColor: colors.gray[200] }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(counts.unlocked / counts.total) * 100}%`,
                        backgroundColor: isSelected ? categoryInfo.color : colors.primary,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: categoryInfo.color }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      {allCategories.map(renderCategory)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  scrollContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryButton: {
    minWidth: 120,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    padding: spacing.md,
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryContent: {
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  selectedCategoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  selectedCategoryName: {
    fontWeight: typography.fontWeight.semibold as any,
  },
  countContainer: {
    width: '100%',
    alignItems: 'center',
  },
  countText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[600],
    fontWeight: typography.fontWeight.medium as any,
    marginBottom: 2,
  },
  progressBar: {
    width: '80%',
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
});

export default AchievementCategory;