import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { auth, users } from '../lib/supabase';
import { ErrorHandler, createNetworkError, createStorageError } from '../utils/errorHandler';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<User>;
  updateProfile: (updates: { name?: string; avatar?: string }) => Promise<User>;
  refreshUser: () => Promise<void>;
  clearError: () => void;

  // Computed
  isLoggedIn: () => boolean;
  getUserDisplayName: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Initialize auth state on app start
      initialize: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const session = await auth.getSession();
          
          if (session?.user) {
            // Get full user profile
            const user = await auth.getCurrentUser();
            if (user) {
              // Try to get additional profile data from users table
              try {
                const profile = await users.getProfile(user.id);
                if (profile) {
                  const fullUser: User = {
                    ...user,
                    name: profile.name || user.name,
                    avatar: profile.avatar || user.avatar,
                  };
                  set({
                    user: fullUser,
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true,
                  });
                  return;
                }
              } catch (profileError) {
                // Profile doesn't exist, use auth user data
                console.log('No user profile found, using auth data only');
              }
              
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
              });
            }
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            });
          }
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Auth initialization');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: appError.message,
          });
          ErrorHandler.logError(appError);
        }
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user: authUser } = await auth.signIn(email, password);
          
          if (!authUser) {
            throw new Error('Login failed - no user returned');
          }

          const user: User = {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || 'Coffee Lover',
            avatar: authUser.user_metadata?.avatar_url,
            createdAt: new Date(authUser.created_at),
            updatedAt: new Date(),
          };

          // Try to get/create user profile
          try {
            let profile = await users.getProfile(user.id);
            if (!profile) {
              // Create profile if it doesn't exist
              profile = await users.createProfile({
                email: user.email,
                name: user.name,
                avatar: user.avatar,
              });
            }
            
            const fullUser: User = {
              ...user,
              name: profile.name || user.name,
              avatar: profile.avatar || user.avatar,
            };

            set({
              user: fullUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return fullUser;
          } catch (profileError) {
            // If profile operations fail, still log in with auth data
            console.warn('Profile operations failed, using auth data only:', profileError);
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return user;
          }
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Login');
          set({ isLoading: false, error: appError.message });
          ErrorHandler.logError(appError);
          
          if (appError.type === 'NETWORK') {
            throw createNetworkError('로그인 중 네트워크 오류가 발생했습니다.');
          }
          
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await auth.signOut();
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Logout');
          set({ isLoading: false, error: appError.message });
          ErrorHandler.logError(appError);
          
          // Even if logout fails, clear local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          throw error;
        }
      },

      signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user: authUser } = await auth.signUp(email, password, name);
          
          if (!authUser) {
            throw new Error('Signup failed - no user returned');
          }

          const user: User = {
            id: authUser.id,
            email: authUser.email || '',
            name: name || 'New User',
            createdAt: new Date(authUser.created_at),
            updatedAt: new Date(),
          };

          // Create user profile
          try {
            const profile = await users.createProfile({
              email: user.email,
              name: user.name,
            });
            
            const fullUser: User = {
              ...user,
              name: profile.name || user.name,
              avatar: profile.avatar,
            };

            set({
              user: fullUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return fullUser;
          } catch (profileError) {
            console.warn('Profile creation failed, using auth data only:', profileError);
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return user;
          }
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Signup');
          set({ isLoading: false, error: appError.message });
          ErrorHandler.logError(appError);
          
          if (appError.type === 'NETWORK') {
            throw createNetworkError('회원가입 중 네트워크 오류가 발생했습니다.');
          }
          
          throw error;
        }
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) {
          throw new Error('No user logged in');
        }

        set({ isLoading: true, error: null });
        
        try {
          // Update auth profile
          await auth.updateProfile(updates);
          
          // Update users table
          const updatedProfile = await users.updateProfile(user.id, updates);
          
          const updatedUser: User = {
            ...user,
            name: updatedProfile.name || user.name,
            avatar: updatedProfile.avatar || user.avatar,
            updatedAt: new Date(),
          };

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });

          return updatedUser;
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Update profile');
          set({ isLoading: false, error: appError.message });
          ErrorHandler.logError(appError);
          
          if (appError.type === 'STORAGE') {
            throw createStorageError('프로필 업데이트 중 오류가 발생했습니다.');
          }
          
          throw error;
        }
      },

      refreshUser: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });
        
        try {
          const currentUser = await auth.getCurrentUser();
          if (currentUser) {
            // Get latest profile data
            try {
              const profile = await users.getProfile(currentUser.id);
              if (profile) {
                const refreshedUser: User = {
                  ...currentUser,
                  name: profile.name || currentUser.name,
                  avatar: profile.avatar || currentUser.avatar,
                };
                set({
                  user: refreshedUser,
                  isLoading: false,
                  error: null,
                });
              } else {
                set({
                  user: currentUser,
                  isLoading: false,
                  error: null,
                });
              }
            } catch (profileError) {
              // If profile fetch fails, use auth user
              set({
                user: currentUser,
                isLoading: false,
                error: null,
              });
            }
          } else {
            // User no longer authenticated
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Refresh user');
          set({ isLoading: false, error: appError.message });
          ErrorHandler.logError(appError);
        }
      },

      clearError: () => set({ error: null }),

      // Computed methods
      isLoggedIn: () => {
        const { isAuthenticated, user } = get();
        return isAuthenticated && !!user;
      },

      getUserDisplayName: () => {
        const { user } = get();
        return user?.name || user?.email?.split('@')[0] || 'Coffee Lover';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Custom rehydration to handle Date objects
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.user.createdAt = new Date(state.user.createdAt);
          state.user.updatedAt = new Date(state.user.updatedAt);
        }
      },
    }
  )
);