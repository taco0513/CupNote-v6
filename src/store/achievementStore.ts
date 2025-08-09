import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, UserStats } from '../types';
import { achievements, userStats } from '../lib/supabase';
import { ErrorHandler, createNetworkError } from '../utils/errorHandler';

interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
  canUnlock: boolean;
  unlockedAt?: Date;
}

interface AchievementState {
  // Achievements data
  allAchievements: Achievement[];
  userAchievements: Achievement[];
  achievementProgress: Record<string, AchievementProgress>;
  
  // User stats
  stats: UserStats | null;
  
  // UI state
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  lastSyncAt: Date | null;
  
  // Recent activity
  recentUnlocks: Achievement[];
  newUnlocksCount: number;
  
  // Actions - Data Loading
  loadAchievements: () => Promise<void>;
  loadUserAchievements: () => Promise<void>;
  loadUserStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Actions - Achievement Management
  checkAndUnlockAchievements: () => Promise<Achievement[]>;
  markAchievementAsSeen: (achievementId: string) => void;
  markAllAchievementsAsSeen: () => void;
  updateAchievementProgress: () => void;
  
  // Actions - Stats Updates
  updateStatsAfterRecord: () => Promise<Achievement[] | undefined>;
  recalculateStats: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
  
  // Computed getters
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementsByCategory: (category: Achievement['category']) => Achievement[];
  getProgressByCategory: (category: Achievement['category']) => AchievementProgress[];
  getTotalPoints: () => number;
  getCompletionPercentage: () => number;
  getNextAchievements: (limit?: number) => AchievementProgress[];
  canLevelUp: () => boolean;
  getPointsToNextLevel: () => number;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      // Initial State
      allAchievements: [],
      userAchievements: [],
      achievementProgress: {},
      stats: null,
      
      // UI state
      isLoading: false,
      isLoadingStats: false,
      error: null,
      lastSyncAt: null,
      
      // Recent activity
      recentUnlocks: [],
      newUnlocksCount: 0,

      // Load all achievements from database
      loadAchievements: async () => {
        set({ isLoading: true, error: null });

        try {
          const allAchievements = await achievements.getAchievements();
          
          set({ 
            allAchievements,
            isLoading: false,
          });

          // Update progress for all achievements
          get().updateAchievementProgress();

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load achievements');
          set({ 
            isLoading: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
          
          if (appError.type === 'NETWORK') {
            throw createNetworkError('업적 정보를 불러오는 중 오류가 발생했습니다.');
          }
        }
      },

      // Load user's unlocked achievements
      loadUserAchievements: async () => {
        try {
          const userId = 'current-user'; // TODO: Get from auth store
          const userAchievements = await achievements.getUserAchievements(userId);
          
          set({ userAchievements });
          get().updateAchievementProgress();

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load user achievements');
          set({ error: appError.message });
          ErrorHandler.logError(appError);
        }
      },

      // Load user statistics
      loadUserStats: async () => {
        set({ isLoadingStats: true, error: null });

        try {
          const userId = 'current-user'; // TODO: Get from auth store
          const stats = await userStats.getUserStats(userId);
          
          set({ 
            stats,
            isLoadingStats: false,
            lastSyncAt: new Date(),
          });

          // Update achievement progress based on new stats
          get().updateAchievementProgress();

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load user stats');
          set({ 
            isLoadingStats: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
        }
      },

      // Refresh all data
      refreshAll: async () => {
        set({ isLoading: true, error: null });

        try {
          await Promise.all([
            get().loadAchievements(),
            get().loadUserAchievements(),
            get().loadUserStats(),
          ]);

          set({ isLoading: false });

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Refresh all data');
          set({ 
            isLoading: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
        }
      },

      // Check for new achievements and unlock them
      checkAndUnlockAchievements: async () => {
        try {
          const userId = 'current-user'; // TODO: Get from auth store
          const newAchievements = await achievements.checkAndUnlockAchievements(userId);
          
          if (newAchievements.length > 0) {
            set(state => ({
              userAchievements: [...state.userAchievements, ...newAchievements],
              recentUnlocks: [...state.recentUnlocks, ...newAchievements],
              newUnlocksCount: state.newUnlocksCount + newAchievements.length,
            }));

            get().updateAchievementProgress();
          }

          return newAchievements;

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Check achievements');
          set({ error: appError.message });
          ErrorHandler.logError(appError);
          return [];
        }
      },

      // Mark achievement notification as seen
      markAchievementAsSeen: (achievementId) => {
        set(state => ({
          recentUnlocks: state.recentUnlocks.filter(a => a.id !== achievementId),
          newUnlocksCount: Math.max(0, state.newUnlocksCount - 1),
        }));
      },

      // Mark all achievement notifications as seen
      markAllAchievementsAsSeen: () => {
        set({
          recentUnlocks: [],
          newUnlocksCount: 0,
        });
      },

      // Update stats after a new record is created
      updateStatsAfterRecord: async () => {
        try {
          const userId = 'current-user'; // TODO: Get from auth store
          const updatedStats = await userStats.calculateAndUpdateStats(userId);
          
          set({ 
            stats: updatedStats,
            lastSyncAt: new Date(),
          });

          // Check for new achievements
          const newAchievements = await get().checkAndUnlockAchievements();
          
          return newAchievements;

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Update stats');
          set({ error: appError.message });
          ErrorHandler.logError(appError);
        }
      },

      // Recalculate all user stats
      recalculateStats: async () => {
        set({ isLoadingStats: true, error: null });

        try {
          const userId = 'current-user'; // TODO: Get from auth store
          const recalculatedStats = await userStats.calculateAndUpdateStats(userId);
          
          set({ 
            stats: recalculatedStats,
            isLoadingStats: false,
            lastSyncAt: new Date(),
          });

          get().updateAchievementProgress();

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Recalculate stats');
          set({ 
            isLoadingStats: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
        }
      },

      // Update achievement progress based on current stats
      updateAchievementProgress: () => {
        const { allAchievements, userAchievements, stats } = get();
        if (!stats) return;

        const progress: Record<string, AchievementProgress> = {};
        const unlockedIds = new Set(userAchievements.map(a => a.id));

        allAchievements.forEach(achievement => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const unlockedAchievement = userAchievements.find(a => a.id === achievement.id);
          
          let current = 0;
          const target = achievement.requirement.target;

          // Calculate current progress based on requirement type
          switch (achievement.requirement.type) {
            case 'count':
              // Map achievement categories to stat fields
              switch (achievement.category) {
                case 'quantity':
                  current = stats.totalRecords;
                  break;
                case 'social':
                  current = stats.sharedRecords || 0;
                  break;
                case 'variety':
                  current = stats.uniqueCoffees;
                  break;
                default:
                  current = stats.totalRecords;
              }
              break;
              
            case 'streak':
              current = achievement.requirement.criteria?.type === 'longest' 
                ? stats.longestStreak 
                : stats.currentStreak;
              break;
              
            case 'unique':
              switch (achievement.requirement.criteria?.field) {
                case 'roasteries':
                  current = stats.uniqueRoasteries;
                  break;
                case 'origins':
                  current = stats.uniqueOrigins;
                  break;
                case 'methods':
                  current = stats.uniqueMethods || 0;
                  break;
                default:
                  current = stats.uniqueCoffees;
              }
              break;
              
            case 'rating':
              current = Math.round(stats.averageRating * 10); // Convert to scale of 10
              break;
              
            case 'social':
              current = stats.communityMatches || 0;
              break;
              
            case 'special':
              // Special achievements have custom logic
              current = achievement.requirement.current || 0;
              break;
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

      // Clear error state
      clearError: () => set({ error: null }),

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

      getProgressByCategory: (category) => {
        const { achievementProgress } = get();
        const categoryAchievements = get().getAchievementsByCategory(category);
        return categoryAchievements.map(a => achievementProgress[a.id]).filter(Boolean);
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

      getNextAchievements: (limit = 5) => {
        const { achievementProgress, allAchievements } = get();
        
        return Object.values(achievementProgress)
          .filter(p => !p.isUnlocked)
          .sort((a, b) => {
            // Sort by completion percentage (closest to completion first)
            if (b.percentage !== a.percentage) {
              return b.percentage - a.percentage;
            }
            // If equal percentage, sort by rarity (common first)
            const achievementA = allAchievements.find(ach => ach.id === a.achievementId);
            const achievementB = allAchievements.find(ach => ach.id === b.achievementId);
            
            const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
            const rarityA = achievementA ? rarityOrder[achievementA.rarity] : 5;
            const rarityB = achievementB ? rarityOrder[achievementB.rarity] : 5;
            
            return rarityA - rarityB;
          })
          .slice(0, limit);
      },

      canLevelUp: () => {
        const { stats } = get();
        if (!stats) return false;
        return stats.experience >= stats.nextLevelExp;
      },

      getPointsToNextLevel: () => {
        const { stats } = get();
        if (!stats) return 0;
        return Math.max(0, stats.nextLevelExp - stats.experience);
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
        recentUnlocks: state.recentUnlocks.slice(0, 10), // Limit stored recent unlocks
      }),
      // Handle Date object rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.userAchievements) {
          state.userAchievements = state.userAchievements.map(achievement => ({
            ...achievement,
            unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
          }));
        }
        if (state?.stats?.lastUpdated) {
          state.stats.lastUpdated = new Date(state.stats.lastUpdated);
        }
        if (state?.lastSyncAt) {
          state.lastSyncAt = new Date(state.lastSyncAt);
        }
        if (state?.recentUnlocks) {
          state.recentUnlocks = state.recentUnlocks.map(achievement => ({
            ...achievement,
            unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
          }));
        }
      },
    }
  )
);