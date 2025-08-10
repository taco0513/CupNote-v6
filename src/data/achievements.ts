import { Achievement } from '../types';

/**
 * Comprehensive Achievement System for CupNote v6
 * 8 Categories with progressive difficulty and rewards
 */

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // QUANTITY CATEGORY - Record Count Milestones
  {
    id: 'first_record',
    name: '첫 걸음',
    description: '첫 번째 커피 기록을 남겼습니다',
    icon: '☕',
    category: 'quantity',
    requirement: {
      type: 'count',
      target: 1,
      criteria: { field: 'totalRecords' },
    },
    points: 10,
    rarity: 'common',
  },
  {
    id: 'coffee_explorer',
    name: '커피 탐험가',
    description: '10잔의 커피를 기록했습니다',
    icon: '🗺️',
    category: 'quantity',
    requirement: {
      type: 'count',
      target: 10,
      criteria: { field: 'totalRecords' },
    },
    points: 50,
    rarity: 'common',
  },
  {
    id: 'coffee_enthusiast',
    name: '커피 애호가',
    description: '50잔의 커피를 기록했습니다',
    icon: '❤️',
    category: 'quantity',
    requirement: {
      type: 'count',
      target: 50,
      criteria: { field: 'totalRecords' },
    },
    points: 200,
    rarity: 'uncommon',
  },
  {
    id: 'coffee_master',
    name: '커피 마스터',
    description: '100잔의 커피를 기록했습니다',
    icon: '👑',
    category: 'quantity',
    requirement: {
      type: 'count',
      target: 100,
      criteria: { field: 'totalRecords' },
    },
    points: 500,
    rarity: 'rare',
  },
  {
    id: 'coffee_legend',
    name: '커피 전설',
    description: '500잔의 커피를 기록했습니다',
    icon: '🏆',
    category: 'quantity',
    requirement: {
      type: 'count',
      target: 500,
      criteria: { field: 'totalRecords' },
    },
    points: 2000,
    rarity: 'legendary',
  },

  // QUALITY CATEGORY - Rating and Consistency
  {
    id: 'perfectionist',
    name: '완벽주의자',
    description: '5점 만점을 5번 기록했습니다',
    icon: '⭐',
    category: 'quality',
    requirement: {
      type: 'count',
      target: 5,
      criteria: { field: 'perfectRatings', rating: 5 },
    },
    points: 100,
    rarity: 'uncommon',
  },
  {
    id: 'consistent_taster',
    name: '일관된 평가자',
    description: '평균 평점 4.0 이상을 유지했습니다',
    icon: '📊',
    category: 'quality',
    requirement: {
      type: 'rating',
      target: 40, // 4.0 * 10
      criteria: { field: 'averageRating' },
    },
    points: 150,
    rarity: 'rare',
  },
  {
    id: 'discerning_palate',
    name: '섬세한 입맛',
    description: '10가지 이상의 다른 향미를 감지했습니다',
    icon: '👅',
    category: 'quality',
    requirement: {
      type: 'unique',
      target: 10,
      criteria: { field: 'uniqueFlavors' },
    },
    points: 120,
    rarity: 'uncommon',
  },

  // VARIETY CATEGORY - Exploration and Diversity
  {
    id: 'origin_explorer',
    name: '원산지 탐험가',
    description: '5개 다른 원산지의 커피를 기록했습니다',
    icon: '🌍',
    category: 'variety',
    requirement: {
      type: 'unique',
      target: 5,
      criteria: { field: 'origins' },
    },
    points: 100,
    rarity: 'common',
  },
  {
    id: 'roastery_hunter',
    name: '로스터리 헌터',
    description: '10개 다른 로스터리의 커피를 기록했습니다',
    icon: '🏪',
    category: 'variety',
    requirement: {
      type: 'unique',
      target: 10,
      criteria: { field: 'roasteries' },
    },
    points: 200,
    rarity: 'uncommon',
  },
  {
    id: 'method_master',
    name: '추출 달인',
    description: '7가지 다른 추출 방법을 사용했습니다',
    icon: '⚗️',
    category: 'variety',
    requirement: {
      type: 'unique',
      target: 7,
      criteria: { field: 'methods' },
    },
    points: 250,
    rarity: 'rare',
  },
  {
    id: 'global_explorer',
    name: '글로벌 탐험가',
    description: '20개 다른 원산지의 커피를 기록했습니다',
    icon: '🗺️',
    category: 'variety',
    requirement: {
      type: 'unique',
      target: 20,
      criteria: { field: 'origins' },
    },
    points: 600,
    rarity: 'epic',
  },

  // SOCIAL CATEGORY - Community Engagement
  {
    id: 'first_share',
    name: '첫 공유',
    description: '커피 기록을 처음 공유했습니다',
    icon: '📱',
    category: 'social',
    requirement: {
      type: 'count',
      target: 1,
      criteria: { field: 'sharedRecords' },
    },
    points: 20,
    rarity: 'common',
  },
  {
    id: 'community_member',
    name: '커뮤니티 멤버',
    description: '10개의 기록을 커뮤니티와 공유했습니다',
    icon: '👥',
    category: 'social',
    requirement: {
      type: 'count',
      target: 10,
      criteria: { field: 'sharedRecords' },
    },
    points: 80,
    rarity: 'uncommon',
  },
  {
    id: 'taste_matcher',
    name: '취향 매치메이커',
    description: '다른 사용자와 10번 매치되었습니다',
    icon: '💕',
    category: 'social',
    requirement: {
      type: 'social',
      target: 10,
      criteria: { field: 'communityMatches' },
    },
    points: 120,
    rarity: 'rare',
  },

  // EXPERTISE CATEGORY - Advanced Knowledge
  {
    id: 'coffee_scientist',
    name: '커피 과학자',
    description: '추출 시간과 온도를 정확히 기록했습니다 (10회)',
    icon: '🧪',
    category: 'expertise',
    requirement: {
      type: 'count',
      target: 10,
      criteria: { field: 'preciseRecords', type: 'homecafe' },
    },
    points: 150,
    rarity: 'rare',
  },
  {
    id: 'cupping_expert',
    name: '커핑 전문가',
    description: '50가지 이상의 향미 노트를 사용했습니다',
    icon: '🍃',
    category: 'expertise',
    requirement: {
      type: 'unique',
      target: 50,
      criteria: { field: 'uniqueFlavors' },
    },
    points: 300,
    rarity: 'epic',
  },
  {
    id: 'sensory_master',
    name: '감각 마스터',
    description: '모든 감각 평가 항목을 100회 이상 사용했습니다',
    icon: '🎯',
    category: 'expertise',
    requirement: {
      type: 'count',
      target: 100,
      criteria: { field: 'detailedEvaluations' },
    },
    points: 400,
    rarity: 'epic',
  },

  // SPECIAL CATEGORY - Unique Achievements
  {
    id: 'early_bird',
    name: '얼리 버드',
    description: '오전 7시 이전에 커피를 기록했습니다',
    icon: '🌅',
    category: 'special',
    requirement: {
      type: 'special',
      target: 1,
      criteria: { field: 'earlyMorning', time: '07:00' },
    },
    points: 50,
    rarity: 'uncommon',
  },
  {
    id: 'night_owl',
    name: '밤 올빼미',
    description: '밤 10시 이후에 커피를 기록했습니다',
    icon: '🦉',
    category: 'special',
    requirement: {
      type: 'special',
      target: 1,
      criteria: { field: 'lateNight', time: '22:00' },
    },
    points: 50,
    rarity: 'uncommon',
  },
  {
    id: 'streak_warrior',
    name: '연속 기록 전사',
    description: '7일 연속으로 커피를 기록했습니다',
    icon: '🔥',
    category: 'special',
    requirement: {
      type: 'streak',
      target: 7,
      criteria: { field: 'currentStreak', type: 'daily' },
    },
    points: 200,
    rarity: 'rare',
  },
  {
    id: 'streak_champion',
    name: '연속 기록 챔피언',
    description: '30일 연속으로 커피를 기록했습니다',
    icon: '👑',
    category: 'special',
    requirement: {
      type: 'streak',
      target: 30,
      criteria: { field: 'longestStreak', type: 'daily' },
    },
    points: 1000,
    rarity: 'legendary',
  },
  {
    id: 'weekend_warrior',
    name: '주말 전사',
    description: '주말에만 10잔의 커피를 기록했습니다',
    icon: '🎉',
    category: 'special',
    requirement: {
      type: 'special',
      target: 10,
      criteria: { field: 'weekendRecords', day: 'weekend' },
    },
    points: 100,
    rarity: 'uncommon',
  },
  {
    id: 'seasons_explorer',
    name: '사계절 탐험가',
    description: '사계절 모두에서 커피를 기록했습니다',
    icon: '🌸',
    category: 'special',
    requirement: {
      type: 'special',
      target: 4,
      criteria: { field: 'seasons', type: 'unique' },
    },
    points: 150,
    rarity: 'rare',
  },

  // CONSISTENCY CATEGORY - Regular Activity
  {
    id: 'daily_sipper',
    name: '매일 한 잔',
    description: '한 달 동안 매일 커피를 기록했습니다',
    icon: '📅',
    category: 'special',
    requirement: {
      type: 'streak',
      target: 30,
      criteria: { field: 'currentStreak', type: 'daily' },
    },
    points: 500,
    rarity: 'epic',
  },
  {
    id: 'monthly_regular',
    name: '월간 단골',
    description: '연속 3개월 동안 기록을 남겼습니다',
    icon: '📆',
    category: 'special',
    requirement: {
      type: 'count',
      target: 3,
      criteria: { field: 'consecutiveMonths' },
    },
    points: 300,
    rarity: 'rare',
  },
];

// Helper function to get achievements by category
export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return ACHIEVEMENT_DEFINITIONS.filter(achievement => achievement.category === category);
};

// Helper function to get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENT_DEFINITIONS.find(achievement => achievement.id === id);
};

// Get all categories
export const getAllCategories = (): Achievement['category'][] => {
  return Array.from(new Set(ACHIEVEMENT_DEFINITIONS.map(a => a.category)));
};

// Get achievements by rarity
export const getAchievementsByRarity = (rarity: Achievement['rarity']): Achievement[] => {
  return ACHIEVEMENT_DEFINITIONS.filter(achievement => achievement.rarity === rarity);
};