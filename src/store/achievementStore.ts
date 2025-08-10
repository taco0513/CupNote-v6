import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, UserStats } from '../types';
import { ACHIEVEMENT_DEFINITIONS } from '../data/achievements';

interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
  canUnlock: boolean;
  unlockedAt?: Date;
}

// Simple stats interface based on current store structure
interface CoffeeStats {
  totalRecords: number;
  cafeRecords: number;
  homecafeRecords: number;
  averageRating: number;
  uniqueCoffees: number;
  uniqueRoasteries: number;
  uniqueOrigins: number;
  uniqueMethods: number;
  uniqueFlavors: number;
  sharedRecords: number;
  communityMatches: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  nextLevelExp: number;
  totalPoints: number;
}

interface AchievementState {
  // Achievements data
  allAchievements: Achievement[];
  userAchievements: Achievement[];
  achievementProgress: Record<string, AchievementProgress>;
  
  // User stats
  stats: CoffeeStats | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  lastSyncAt: Date | null;
  
  // Recent activity
  recentUnlocks: Achievement[];
  newUnlocksCount: number;
  
  // Actions
  initializeAchievements: () => void;
  calculateStatsFromRecords: (records: any[]) => CoffeeStats;
  checkForNewAchievements: (newStats: CoffeeStats) => Achievement[];
  updateStatsAfterRecord: () => Promise<Achievement[] | undefined>;
  markAchievementAsSeen: (achievementId: string) => void;
  markAllAchievementsAsSeen: () => void;
  updateAchievementProgress: (stats: CoffeeStats) => void;
  
  // Computed getters
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementsByCategory: (category: Achievement['category']) => Achievement[];
  getTotalPoints: () => number;
  getCompletionPercentage: () => number;
}

const calculateLevel = (points: number): { level: number; experience: number; nextLevelExp: number } => {
  // Level calculation: level = floor(sqrt(points/100))
  const level = Math.max(1, Math.floor(Math.sqrt(points / 100)));
  const currentLevelPoints = (level - 1) * (level - 1) * 100;
  const nextLevelPoints = level * level * 100;
  const experience = points - currentLevelPoints;
  const nextLevelExp = nextLevelPoints - currentLevelPoints;
  
  return { level, experience, nextLevelExp };
};

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      // Initial State
      allAchievements: [],
      userAchievements: [],
      achievementProgress: {},
      stats: null,
      isLoading: false,
      error: null,
      lastSyncAt: null,
      recentUnlocks: [],
      newUnlocksCount: 0,

      // Initialize achievements from static data
      initializeAchievements: () => {
        set({ 
          allAchievements: ACHIEVEMENT_DEFINITIONS,
          isLoading: false,
        });
      },

      // Calculate stats from records array (from main store)
      calculateStatsFromRecords: (records) => {
        if (!records || records.length === 0) {
          return {
            totalRecords: 0,
            cafeRecords: 0,
            homecafeRecords: 0,
            averageRating: 0,
            uniqueCoffees: 0,
            uniqueRoasteries: 0,
            uniqueOrigins: 0,
            uniqueMethods: 0,
            uniqueFlavors: 0,
            sharedRecords: 0,
            communityMatches: 0,
            currentStreak: 0,
            longestStreak: 0,
            level: 1,
            experience: 0,
            nextLevelExp: 100,
            totalPoints: 0,
          };
        }

        const totalRecords = records.length;
        const cafeRecords = records.filter(r => r.mode === 'cafe').length;
        const homecafeRecords = records.filter(r => r.mode === 'homecafe').length;
        
        // Calculate average rating
        const ratings = records.map(r => r.overallRating).filter(r => r > 0);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
        // Calculate unique counts
        const uniqueCoffees = new Set(records.map(r => r.coffeeName)).size;
        const uniqueRoasteries = new Set(records.map(r => r.roastery).filter(Boolean)).size;
        const uniqueOrigins = new Set(records.map(r => r.origin).filter(Boolean)).size;
        const uniqueMethods = new Set(records.map(r => r.brewMethod).filter(Boolean)).size;
        
        // Calculate unique flavors
        const allFlavors = records.flatMap(r => r.flavors || []);
        const uniqueFlavors = new Set(allFlavors).size;
        
        // Social stats (placeholder for now)
        const sharedRecords = records.filter(r => r.isPublic).length;
        const communityMatches = 0; // TODO: Implement community matching
        
        // Streak calculation (basic implementation)
        const currentStreak = records.length > 0 ? 1 : 0; // TODO: Implement proper streak calculation
        const longestStreak = currentStreak; // TODO: Implement proper longest streak
        
        return {
          totalRecords,
          cafeRecords,
          homecafeRecords,
          averageRating,
          uniqueCoffees,
          uniqueRoasteries,
          uniqueOrigins,
          uniqueMethods,
          uniqueFlavors,
          sharedRecords,
          communityMatches,
          currentStreak,
          longestStreak,
          level: 1,
          experience: 0,
          nextLevelExp: 100,
          totalPoints: 0,
        };
      },

      // Check for new achievements based on stats
      checkForNewAchievements: (newStats) => {
        const { userAchievements, allAchievements } = get();
        const unlockedIds = new Set(userAchievements.map(a => a.id));
        const newlyUnlocked: Achievement[] = [];

        for (const achievement of allAchievements) {
          if (unlockedIds.has(achievement.id)) continue;

          let current = 0;
          const target = achievement.requirement.target;

          // Calculate current progress
          switch (achievement.requirement.type) {
            case 'count':
              const field = achievement.requirement.criteria?.field;
              switch (field) {
                case 'totalRecords':
                  current = newStats.totalRecords;
                  break;
                case 'sharedRecords':
                  current = newStats.sharedRecords;
                  break;
                default:
                  current = newStats.totalRecords;
              }
              break;
            case 'unique':
              const uniqueField = achievement.requirement.criteria?.field;
              switch (uniqueField) {
                case 'roasteries':
                  current = newStats.uniqueRoasteries;
                  break;
                case 'origins':
                  current = newStats.uniqueOrigins;
                  break;
                case 'methods':
                  current = newStats.uniqueMethods;
                  break;
                case 'uniqueFlavors':
                  current = newStats.uniqueFlavors;
                  break;
                default:
                  current = newStats.uniqueCoffees;
              }
              break;
            case 'rating':
              current = Math.round(newStats.averageRating * 10);
              break;
            case 'streak':
              current = newStats.currentStreak;
              break;
            case 'social':
              current = newStats.communityMatches;
              break;
            default:
              current = 0;
          }

          if (current >= target) {
            const unlockedAchievement = {
              ...achievement,
              unlockedAt: new Date(),
            };
            newlyUnlocked.push(unlockedAchievement);
          }
        }

        return newlyUnlocked;
      },

      // Main function called after adding a record
      updateStatsAfterRecord: async () => {
        try {
          // Get records from main store
          const mainStoreData = JSON.parse(await AsyncStorage.getItem('cupnote-storage') || '{}');
          const records = mainStoreData?.state?.records || [];
          
          // Calculate new stats
          const newStats = get().calculateStatsFromRecords(records);
          
          // Check for new achievements
          const newAchievements = get().checkForNewAchievements(newStats);
          
          if (newAchievements.length > 0) {
            // Calculate total points including new achievements
            const existingPoints = get().getTotalPoints();
            const newPoints = newAchievements.reduce((sum, a) => sum + a.points, 0);
            const totalPoints = existingPoints + newPoints;
            const levelInfo = calculateLevel(totalPoints);

            // Update user achievements and stats
            set(state => ({
              userAchievements: [...state.userAchievements, ...newAchievements],
              recentUnlocks: [...state.recentUnlocks, ...newAchievements],
              newUnlocksCount: state.newUnlocksCount + newAchievements.length,
              stats: {
                ...newStats,
                ...levelInfo,
                totalPoints,
              },
              lastSyncAt: new Date(),
            }));

            // Update achievement progress
            get().updateAchievementProgress(get().stats!);
          } else {
            // Update stats without new achievements
            const totalPoints = get().getTotalPoints();
            const levelInfo = calculateLevel(totalPoints);
            
            set({
              stats: {
                ...newStats,
                ...levelInfo,
                totalPoints,
              },
              lastSyncAt: new Date(),
            });

            get().updateAchievementProgress(newStats);
          }

          return newAchievements;
        } catch (error) {
          console.error('Failed to update stats:', error);
          set({ error: 'Failed to update achievement stats' });
          return [];
        }
      },

      // Mark achievement as seen
      markAchievementAsSeen: (achievementId) => {
        set(state => ({
          recentUnlocks: state.recentUnlocks.filter(a => a.id !== achievementId),
          newUnlocksCount: Math.max(0, state.newUnlocksCount - 1),
        }));
      },

      // Mark all achievements as seen
      markAllAchievementsAsSeen: () => {
        set({
          recentUnlocks: [],
          newUnlocksCount: 0,
        });
      },

      // Update achievement progress
      updateAchievementProgress: (stats) => {
        const { allAchievements, userAchievements } = get();
        const progress: Record<string, AchievementProgress> = {};
        const unlockedIds = new Set(userAchievements.map(a => a.id));

        allAchievements.forEach(achievement => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const unlockedAchievement = userAchievements.find(a => a.id === achievement.id);
          
          let current = 0;
          const target = achievement.requirement.target;

          // Calculate current progress
          switch (achievement.requirement.type) {
            case 'count':
              const field = achievement.requirement.criteria?.field;
              switch (field) {
                case 'totalRecords':
                  current = stats.totalRecords;
                  break;
                case 'sharedRecords':
                  current = stats.sharedRecords;
                  break;
                default:
                  current = stats.totalRecords;
              }
              break;
            case 'unique':
              const uniqueField = achievement.requirement.criteria?.field;
              switch (uniqueField) {
                case 'roasteries':
                  current = stats.uniqueRoasteries;
                  break;
                case 'origins':
                  current = stats.uniqueOrigins;
                  break;
                case 'methods':
                  current = stats.uniqueMethods;
                  break;
                case 'uniqueFlavors':
                  current = stats.uniqueFlavors;
                  break;
                default:
                  current = stats.uniqueCoffees;
              }
              break;
            case 'rating':
              current = Math.round(stats.averageRating * 10);
              break;
            case 'streak':
              current = stats.currentStreak;
              break;
            case 'social':
              current = stats.communityMatches;
              break;
            default:
              current = 0;
          }

          progress[achievement.id] = {
            achievementId: achievement.id,
            current: Math.min(current, target),
            target,
            percentage: Math.min(100, Math.round((current / target) * 100)),
            isUnlocked,
            canUnlock: current >= target && !isUnlocked,
            unlockedAt: unlockedAchievement?.unlockedAt,
          };
        });

        set({ achievementProgress: progress });
      },

      // Computed getters
      getUnlockedAchievements: () => {
        const { userAchievements } = get();
        return userAchievements.sort((a, b) => {
          if (!a.unlockedAt || !b.unlockedAt) return 0;
          return b.unlockedAt.getTime() - a.unlockedAt.getTime();
        });
      },

      getLockedAchievements: () => {
        const { allAchievements, userAchievements } = get();
        const unlockedIds = new Set(userAchievements.map(a => a.id));
        return allAchievements.filter(a => !unlockedIds.has(a.id));
      },

      getAchievementsByCategory: (category) => {
        const { allAchievements } = get();
        return allAchievements.filter(a => a.category === category);
      },

      getTotalPoints: () => {
        const { userAchievements } = get();
        return userAchievements.reduce((total, achievement) => total + achievement.points, 0);
      },

      getCompletionPercentage: () => {
        const { allAchievements, userAchievements } = get();
        if (allAchievements.length === 0) return 0;
        return Math.round((userAchievements.length / allAchievements.length) * 100);
      },
    }),
    {
      name: 'achievement-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        allAchievements: state.allAchievements,
        userAchievements: state.userAchievements,
        stats: state.stats,
        achievementProgress: state.achievementProgress,
        lastSyncAt: state.lastSyncAt,
        recentUnlocks: state.recentUnlocks.slice(0, 10),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize achievements if not loaded
          if (!state.allAchievements || state.allAchievements.length === 0) {
            state.allAchievements = ACHIEVEMENT_DEFINITIONS;
          }
          
          // Rehydrate dates
          if (state.userAchievements) {
            state.userAchievements = state.userAchievements.map(achievement => ({
              ...achievement,
              unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
            }));
          }
          if (state.lastSyncAt) {
            state.lastSyncAt = new Date(state.lastSyncAt);
          }
          if (state.recentUnlocks) {
            state.recentUnlocks = state.recentUnlocks.map(achievement => ({
              ...achievement,
              unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
            }));
          }
        }
      },
    }
  )
);