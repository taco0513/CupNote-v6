// Re-export all stores for easy importing
export { useAuthStore } from './authStore';
export { useRecordStore } from './recordStore';
export { useAchievementStore } from './achievementStore';

// Export store types for other teams
export type { 
  RecordState, 
  AuthState, 
  AchievementState,
  RecordFilter,
  RecordSort,
  RecordListItem,
  RecordDraft
} from '../types';

// Store initialization function
export const initializeStores = async () => {
  try {
    // Initialize auth store first
    const { initialize: initAuth, isAuthenticated } = useAuthStore.getState();
    await initAuth();

    // Initialize other stores after auth
    const { loadRecords, loadDrafts, cleanupExpiredDrafts } = useRecordStore.getState();
    const { refreshAll } = useAchievementStore.getState();

    // Load user data if authenticated
    if (isAuthenticated) {
      // Load records and achievements in parallel
      await Promise.all([
        loadRecords(true),
        loadDrafts(),
        cleanupExpiredDrafts(),
        refreshAll(),
      ]);
    }

    console.log('✅ Stores initialized successfully');
  } catch (error) {
    console.error('❌ Store initialization failed:', error);
    // Don't throw - app should still work in offline mode
  }
};

// Store reset function for logout
export const resetStores = () => {
  // Clear all persisted data
  const authStore = useAuthStore;
  const recordStore = useRecordStore;
  const achievementStore = useAchievementStore;
  
  authStore.persist.clearStorage();
  recordStore.persist.clearStorage();
  achievementStore.persist.clearStorage();

  // Reset store states to initial values
  authStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  recordStore.setState({
    records: [],
    currentRecord: null,
    totalRecords: 0,
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    isLoadingRecords: false,
    isLoadingMore: false,
    searchQuery: '',
    activeFilters: {},
    sortBy: 'created_at',
    sortOrder: 'desc',
    filterMode: 'all',
    draftsList: [],
    currentDraft: null,
    isLoading: false,
    isSaving: false,
    error: null,
    lastSyncAt: null,
  });

  achievementStore.setState({
    allAchievements: [],
    userAchievements: [],
    achievementProgress: {},
    stats: null,
    isLoading: false,
    isLoadingStats: false,
    error: null,
    lastSyncAt: null,
    recentUnlocks: [],
    newUnlocksCount: 0,
  });

  console.log('✅ Stores reset successfully');
};

// Sync stores with server data
export const syncStores = async () => {
  try {
    const { isAuthenticated, refreshUser } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping sync');
      return;
    }

    const { loadRecords } = useRecordStore.getState();
    const { refreshAll } = useAchievementStore.getState();

    // Refresh user profile
    await refreshUser();

    // Sync records and achievements
    await Promise.all([
      loadRecords(true),
      refreshAll(),
    ]);

    console.log('✅ Store sync completed');
  } catch (error) {
    console.error('❌ Store sync failed:', error);
    throw error;
  }
};

// Get combined app state for debugging
export const getAppState = () => {
  const authState = useAuthStore.getState();
  const recordState = useRecordStore.getState();
  const achievementState = useAchievementStore.getState();

  return {
    auth: {
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      isLoading: authState.isLoading,
      error: authState.error,
    },
    records: {
      total: recordState.records.length,
      drafts: recordState.draftsList.length,
      currentRecord: !!recordState.currentRecord,
      isLoading: recordState.isLoadingRecords,
      error: recordState.error,
      lastSync: recordState.lastSyncAt,
    },
    achievements: {
      total: achievementState.allAchievements.length,
      unlocked: achievementState.userAchievements.length,
      newUnlocks: achievementState.newUnlocksCount,
      isLoading: achievementState.isLoading,
      error: achievementState.error,
      lastSync: achievementState.lastSyncAt,
    },
  };
};

// Store health check
export const checkStoreHealth = () => {
  const appState = getAppState();
  const issues: string[] = [];

  // Check for errors
  if (appState.auth.error) issues.push(`Auth error: ${appState.auth.error}`);
  if (appState.records.error) issues.push(`Records error: ${appState.records.error}`);
  if (appState.achievements.error) issues.push(`Achievements error: ${appState.achievements.error}`);

  // Check for stale data
  const now = new Date().getTime();
  const oneHourAgo = now - (60 * 60 * 1000);

  if (appState.records.lastSync && appState.records.lastSync.getTime() < oneHourAgo) {
    issues.push('Records data is stale (>1 hour)');
  }

  if (appState.achievements.lastSync && appState.achievements.lastSync.getTime() < oneHourAgo) {
    issues.push('Achievements data is stale (>1 hour)');
  }

  return {
    healthy: issues.length === 0,
    issues,
    state: appState,
  };
};