/**
 * CupNote v6 Database Synchronization Manager
 * Handles data synchronization, migration, and consistency checks
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { realtimeManager } from './supabase-realtime';
import { supabaseConfig, configUtils } from './supabase-config';
import { Database } from '../types';

// Sync status and progress tracking
export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  lastSyncError: string | null;
  totalItems: number;
  syncedItems: number;
  failedItems: number;
}

// Data consistency check result
export interface ConsistencyCheckResult {
  isConsistent: boolean;
  inconsistencies: {
    table: string;
    localCount: number;
    remoteCount: number;
    issue: string;
  }[];
  lastCheckAt: Date;
  recommendedAction: 'none' | 'sync' | 'rebuild' | 'manual_review';
}

// Migration status
export interface MigrationStatus {
  currentVersion: number;
  targetVersion: number;
  isRequired: boolean;
  inProgress: boolean;
  completedSteps: number;
  totalSteps: number;
  error: string | null;
}

/**
 * Database Synchronization Manager
 * Handles bi-directional sync between local storage and Supabase
 */
class DatabaseSyncManager {
  private syncInProgress = false;
  private syncListeners = new Set<(status: SyncStatus) => void>();
  private currentStatus: SyncStatus = {
    isOnline: true,
    lastSyncAt: null,
    pendingChanges: 0,
    syncInProgress: false,
    lastSyncError: null,
    totalItems: 0,
    syncedItems: 0,
    failedItems: 0,
  };

  constructor() {
    this.initializeSync();
    this.setupNetworkMonitoring();
  }

  /**
   * Initialize synchronization system
   */
  private async initializeSync(): Promise<void> {
    try {
      // Load last sync status
      await this.loadSyncStatus();
      
      // Check for pending changes
      await this.checkPendingChanges();
      
      // Setup periodic sync
      this.setupPeriodicSync();
      
      console.log('🔄 Database sync manager initialized');
    } catch (error) {
      console.error('Failed to initialize sync manager:', error);
      this.updateSyncStatus({ lastSyncError: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    // Monitor real-time connection status
    realtimeManager.addConnectionListener((connectionState) => {
      this.updateSyncStatus({ isOnline: connectionState.connected });
      
      // Trigger sync when coming back online
      if (connectionState.connected && this.currentStatus.pendingChanges > 0) {
        this.performSync('automatic');
      }
    });
  }

  /**
   * Setup periodic sync (every 5 minutes when online)
   */
  private setupPeriodicSync(): void {
    setInterval(async () => {
      if (this.currentStatus.isOnline && !this.syncInProgress) {
        await this.performSync('periodic');
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Load sync status from storage
   */
  private async loadSyncStatus(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('cupnote_sync_status');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentStatus = {
          ...this.currentStatus,
          lastSyncAt: parsed.lastSyncAt ? new Date(parsed.lastSyncAt) : null,
          pendingChanges: parsed.pendingChanges || 0,
        };
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }

  /**
   * Save sync status to storage
   */
  private async saveSyncStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem('cupnote_sync_status', JSON.stringify(this.currentStatus));
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  }

  /**
   * Check for pending changes
   */
  private async checkPendingChanges(): Promise<void> {
    try {
      // Check offline queue
      const queueStatus = realtimeManager.getOfflineQueueStatus();
      this.updateSyncStatus({ 
        pendingChanges: queueStatus.items + queueStatus.highPriority 
      });
    } catch (error) {
      console.error('Failed to check pending changes:', error);
    }
  }

  /**
   * Perform full synchronization
   */
  async performSync(
    trigger: 'manual' | 'automatic' | 'periodic' | 'startup' = 'manual'
  ): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return false;
    }

    if (!this.currentStatus.isOnline) {
      console.log('Cannot sync while offline');
      return false;
    }

    this.syncInProgress = true;
    this.updateSyncStatus({ 
      syncInProgress: true,
      lastSyncError: null,
      syncedItems: 0,
      failedItems: 0 
    });

    console.log(`🔄 Starting ${trigger} sync...`);

    try {
      // Step 1: Sync offline queue (local → remote)
      await this.syncOfflineQueue();

      // Step 2: Pull remote changes (remote → local)  
      await this.pullRemoteChanges();

      // Step 3: Consistency check
      if (trigger === 'manual') {
        await this.performConsistencyCheck();
      }

      // Step 4: Update sync status
      this.updateSyncStatus({
        lastSyncAt: new Date(),
        pendingChanges: 0,
        lastSyncError: null,
      });

      console.log('✅ Sync completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.updateSyncStatus({
        lastSyncError: error instanceof Error ? error.message : 'Unknown sync error'
      });
      return false;

    } finally {
      this.syncInProgress = false;
      this.updateSyncStatus({ syncInProgress: false });
      await this.saveSyncStatus();
    }
  }

  /**
   * Sync offline queue to remote
   */
  private async syncOfflineQueue(): Promise<void> {
    console.log('📤 Syncing offline queue...');
    
    const queueStatus = realtimeManager.getOfflineQueueStatus();
    if (queueStatus.items === 0) {
      console.log('No offline items to sync');
      return;
    }

    this.updateSyncStatus({ totalItems: queueStatus.items });

    try {
      await realtimeManager.forceSyncOfflineQueue();
      
      // Check remaining items
      const remainingStatus = realtimeManager.getOfflineQueueStatus();
      this.updateSyncStatus({
        syncedItems: queueStatus.items - remainingStatus.items,
        failedItems: remainingStatus.items,
      });

    } catch (error) {
      console.error('Failed to sync offline queue:', error);
      throw error;
    }
  }

  /**
   * Pull remote changes to local
   */
  private async pullRemoteChanges(): Promise<void> {
    console.log('📥 Pulling remote changes...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Pull user's data changes since last sync
      const lastSyncTime = this.currentStatus.lastSyncAt;
      const syncThreshold = lastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      // Pull tasting records
      const { data: records, error: recordsError } = await supabase
        .from('tasting_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('updated_at', syncThreshold.toISOString())
        .order('updated_at', { ascending: false });

      if (recordsError) throw recordsError;

      // Pull user achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .gte('updated_at', syncThreshold.toISOString());

      if (achievementsError) throw achievementsError;

      // Pull user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('updated_at', syncThreshold.toISOString());

      if (statsError) throw statsError;

      // Pull drafts
      const { data: drafts, error: draftsError } = await supabase
        .from('drafts')
        .select('*')
        .eq('user_id', user.id)
        .gte('updated_at', syncThreshold.toISOString());

      if (draftsError) throw draftsError;

      console.log(`📊 Pulled ${records?.length || 0} records, ${achievements?.length || 0} achievements, ${stats?.length || 0} stats, ${drafts?.length || 0} drafts`);

      // Store pulled data locally (if using local cache)
      await this.storeLocalData({
        records: records || [],
        achievements: achievements || [],
        stats: stats || [],
        drafts: drafts || [],
      });

    } catch (error) {
      console.error('Failed to pull remote changes:', error);
      throw error;
    }
  }

  /**
   * Store data locally for offline access
   */
  private async storeLocalData(data: {
    records: any[];
    achievements: any[];
    stats: any[];
    drafts: any[];
  }): Promise<void> {
    try {
      // Store in AsyncStorage with expiry
      const cacheData = {
        ...data,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      await AsyncStorage.setItem('cupnote_sync_cache', JSON.stringify(cacheData));
      console.log('💾 Stored local cache');

    } catch (error) {
      console.error('Failed to store local data:', error);
    }
  }

  /**
   * Perform data consistency check
   */
  async performConsistencyCheck(): Promise<ConsistencyCheckResult> {
    console.log('🔍 Performing consistency check...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated for consistency check');
    }

    const inconsistencies: ConsistencyCheckResult['inconsistencies'] = [];

    try {
      // Check tasting records count
      const { count: remoteRecordsCount, error: recordsError } = await supabase
        .from('tasting_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (recordsError) throw recordsError;

      // Compare with local cache
      const localCache = await this.getLocalCache();
      const localRecordsCount = localCache?.records?.length || 0;

      if (Math.abs((remoteRecordsCount || 0) - localRecordsCount) > 5) {
        inconsistencies.push({
          table: 'tasting_records',
          localCount: localRecordsCount,
          remoteCount: remoteRecordsCount || 0,
          issue: 'Count mismatch exceeds threshold',
        });
      }

      // Check achievements count
      const { count: remoteAchievementsCount, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (achievementsError) throw achievementsError;

      const localAchievementsCount = localCache?.achievements?.length || 0;

      if (Math.abs((remoteAchievementsCount || 0) - localAchievementsCount) > 2) {
        inconsistencies.push({
          table: 'user_achievements',
          localCount: localAchievementsCount,
          remoteCount: remoteAchievementsCount || 0,
          issue: 'Achievement count mismatch',
        });
      }

      const result: ConsistencyCheckResult = {
        isConsistent: inconsistencies.length === 0,
        inconsistencies,
        lastCheckAt: new Date(),
        recommendedAction: inconsistencies.length === 0 ? 'none' :
                          inconsistencies.length > 2 ? 'rebuild' :
                          inconsistencies.some(i => Math.abs(i.localCount - i.remoteCount) > 10) ? 'manual_review' : 'sync',
      };

      console.log(`🎯 Consistency check completed: ${result.isConsistent ? 'CONSISTENT' : 'INCONSISTENT'} (${inconsistencies.length} issues)`);

      return result;

    } catch (error) {
      console.error('Consistency check failed:', error);
      throw error;
    }
  }

  /**
   * Get local cached data
   */
  private async getLocalCache(): Promise<any> {
    try {
      const stored = await AsyncStorage.getItem('cupnote_sync_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if cache is expired
        if (new Date(parsed.expiresAt) > new Date()) {
          return parsed;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get local cache:', error);
      return null;
    }
  }

  /**
   * Rebuild local data from remote
   */
  async rebuildLocalData(): Promise<boolean> {
    console.log('🔨 Rebuilding local data from remote...');

    try {
      // Clear local cache
      await AsyncStorage.removeItem('cupnote_sync_cache');
      
      // Clear offline queue (dangerous - use with caution)
      realtimeManager.clearOfflineQueue();

      // Force full sync
      this.updateSyncStatus({ lastSyncAt: null });
      
      const result = await this.performSync('manual');
      
      if (result) {
        console.log('✅ Local data rebuild completed');
      } else {
        console.log('❌ Local data rebuild failed');
      }

      return result;

    } catch (error) {
      console.error('Failed to rebuild local data:', error);
      return false;
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.currentStatus };
  }

  /**
   * Add sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    // Return unsubscribe function
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Update sync status and notify listeners
   */
  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...updates };
    this.syncListeners.forEach(listener => listener(this.currentStatus));
  }

  /**
   * Force sync now (manual trigger)
   */
  async forceSyncNow(): Promise<boolean> {
    return this.performSync('manual');
  }

  /**
   * Check if sync is needed
   */
  isSyncNeeded(): boolean {
    const lastSync = this.currentStatus.lastSyncAt;
    const threshold = Date.now() - configUtils.getPerformanceSetting('cacheTTL') * 1000;
    
    return !lastSync || lastSync.getTime() < threshold || this.currentStatus.pendingChanges > 0;
  }

  /**
   * Get sync statistics
   */
  getSyncStatistics(): {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageSyncTime: number;
    lastSyncDuration: number;
  } {
    // This would require storing sync history
    // For now, return basic stats
    return {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      lastSyncDuration: 0,
    };
  }

  /**
   * Cleanup old cached data
   */
  async cleanupOldCache(): Promise<void> {
    try {
      // Remove expired cache
      const cache = await this.getLocalCache();
      if (!cache) {
        await AsyncStorage.removeItem('cupnote_sync_cache');
      }

      console.log('🧹 Old cache cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup old cache:', error);
    }
  }

  /**
   * Export user data for backup
   */
  async exportUserData(): Promise<{
    records: any[];
    achievements: any[];
    stats: any;
    exportedAt: string;
  } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      // Get all user data
      const [recordsResponse, achievementsResponse, statsResponse] = await Promise.all([
        supabase.from('tasting_records').select('*').eq('user_id', user.id),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
        supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
      ]);

      return {
        records: recordsResponse.data || [],
        achievements: achievementsResponse.data || [],
        stats: statsResponse.data,
        exportedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Failed to export user data:', error);
      return null;
    }
  }

  /**
   * Destroy sync manager and cleanup
   */
  destroy(): void {
    this.syncListeners.clear();
    console.log('🔥 Database sync manager destroyed');
  }
}

// Export singleton instance
export const databaseSyncManager = new DatabaseSyncManager();

// Export types
export type {
  SyncStatus,
  ConsistencyCheckResult,
  MigrationStatus,
};

// Export utilities
export const syncUtils = {
  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return databaseSyncManager.getSyncStatus().isOnline;
  },

  /**
   * Get time since last sync
   */
  getTimeSinceLastSync(): number | null {
    const status = databaseSyncManager.getSyncStatus();
    return status.lastSyncAt ? Date.now() - status.lastSyncAt.getTime() : null;
  },

  /**
   * Get sync health score (0-100)
   */
  getSyncHealthScore(): number {
    const status = databaseSyncManager.getSyncStatus();
    let score = 100;

    // Deduct for offline status
    if (!status.isOnline) score -= 30;

    // Deduct for pending changes
    score -= Math.min(status.pendingChanges * 5, 40);

    // Deduct for old sync
    const timeSinceSync = syncUtils.getTimeSinceLastSync();
    if (timeSinceSync) {
      const hoursOld = timeSinceSync / (1000 * 60 * 60);
      if (hoursOld > 24) score -= 20;
      else if (hoursOld > 6) score -= 10;
    }

    // Deduct for errors
    if (status.lastSyncError) score -= 20;

    return Math.max(0, score);
  },

  /**
   * Format sync status for display
   */
  formatSyncStatus(status: SyncStatus): string {
    if (status.syncInProgress) return 'Syncing...';
    if (!status.isOnline) return 'Offline';
    if (status.lastSyncError) return 'Sync failed';
    if (status.pendingChanges > 0) return `${status.pendingChanges} pending`;
    if (status.lastSyncAt) {
      const minutes = Math.floor((Date.now() - status.lastSyncAt.getTime()) / (1000 * 60));
      if (minutes < 1) return 'Just synced';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
    return 'Never synced';
  },
};

export default databaseSyncManager;