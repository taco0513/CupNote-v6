/**
 * CupNote v6 Offline Data Manager
 * Handles offline data storage, caching, and background synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { configUtils } from './supabase-config';
import { TastingRecord, Achievement, UserStats, TastingFlowDraft } from '../types';

// Offline storage keys
const STORAGE_KEYS = {
  RECORDS: 'cupnote_offline_records',
  ACHIEVEMENTS: 'cupnote_offline_achievements',
  STATS: 'cupnote_offline_stats',
  DRAFTS: 'cupnote_offline_drafts',
  CACHE_METADATA: 'cupnote_cache_metadata',
  OFFLINE_ACTIONS: 'cupnote_offline_actions',
} as const;

// Cache metadata
interface CacheMetadata {
  lastUpdated: Date;
  version: number;
  expiresAt: Date;
  totalSize: number; // in bytes
  itemCounts: {
    records: number;
    achievements: number;
    stats: number;
    drafts: number;
  };
}

// Offline action for sync queue
interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: 'records' | 'achievements' | 'stats' | 'drafts';
  data: any;
  timestamp: Date;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

// Storage usage statistics
interface StorageStats {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  cacheSize: number;
  itemCounts: {
    records: number;
    achievements: number;
    stats: number;
    drafts: number;
    actions: number;
  };
}

/**
 * Offline Data Manager
 * Manages local data storage and offline capabilities
 */
class OfflineDataManager {
  private isInitialized = false;
  private cacheMetadata: CacheMetadata | null = null;
  private maxCacheSize: number;

  constructor() {
    this.maxCacheSize = configUtils.getPerformanceSetting('maxCacheSize') * 1024 * 1024; // Convert MB to bytes
    this.initialize();
  }

  /**
   * Initialize offline data manager
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadCacheMetadata();
      await this.cleanupExpiredCache();
      await this.validateCacheIntegrity();
      
      this.isInitialized = true;
      console.log('📱 Offline data manager initialized');
      
    } catch (error) {
      console.error('Failed to initialize offline data manager:', error);
    }
  }

  /**
   * Load cache metadata from storage
   */
  private async loadCacheMetadata(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CACHE_METADATA);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cacheMetadata = {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          expiresAt: new Date(parsed.expiresAt),
        };
      } else {
        // Initialize empty metadata
        this.cacheMetadata = {
          lastUpdated: new Date(),
          version: 1,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          totalSize: 0,
          itemCounts: {
            records: 0,
            achievements: 0,
            stats: 0,
            drafts: 0,
          },
        };
        await this.saveCacheMetadata();
      }
    } catch (error) {
      console.error('Failed to load cache metadata:', error);
    }
  }

  /**
   * Save cache metadata to storage
   */
  private async saveCacheMetadata(): Promise<void> {
    if (!this.cacheMetadata) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHE_METADATA, JSON.stringify(this.cacheMetadata));
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }

  /**
   * Update cache metadata
   */
  private async updateCacheMetadata(updates: Partial<CacheMetadata>): Promise<void> {
    if (!this.cacheMetadata) return;

    this.cacheMetadata = {
      ...this.cacheMetadata,
      ...updates,
      lastUpdated: new Date(),
    };

    await this.saveCacheMetadata();
  }

  /**
   * Clean up expired cache data
   */
  private async cleanupExpiredCache(): Promise<void> {
    if (!this.cacheMetadata) return;

    try {
      const now = new Date();
      
      if (this.cacheMetadata.expiresAt <= now) {
        console.log('🧹 Cache expired, clearing all offline data');
        await this.clearAllCache();
      } else {
        // Check individual item expiry
        await this.cleanupExpiredItems();
      }

    } catch (error) {
      console.error('Failed to cleanup expired cache:', error);
    }
  }

  /**
   * Clean up individual expired items
   */
  private async cleanupExpiredItems(): Promise<void> {
    const cacheTTL = configUtils.getPerformanceSetting('cacheTTL') * 1000; // seconds to ms
    const expiryTime = Date.now() - cacheTTL;

    try {
      // Clean expired records
      const records = await this.getRecordsFromCache();
      const validRecords = records.filter(record => 
        record.updatedAt.getTime() > expiryTime
      );
      
      if (validRecords.length !== records.length) {
        await this.storeRecordsToCache(validRecords);
        console.log(`🧹 Cleaned ${records.length - validRecords.length} expired records`);
      }

    } catch (error) {
      console.error('Failed to cleanup expired items:', error);
    }
  }

  /**
   * Validate cache integrity
   */
  private async validateCacheIntegrity(): Promise<boolean> {
    if (!this.cacheMetadata) return false;

    try {
      // Check if stored counts match actual data
      const [records, achievements, stats, drafts] = await Promise.all([
        this.getRecordsFromCache(),
        this.getAchievementsFromCache(),
        this.getStatsFromCache(),
        this.getDraftsFromCache(),
      ]);

      const actualCounts = {
        records: records.length,
        achievements: achievements.length,
        stats: stats ? 1 : 0,
        drafts: drafts.length,
      };

      const isValid = 
        actualCounts.records === this.cacheMetadata.itemCounts.records &&
        actualCounts.achievements === this.cacheMetadata.itemCounts.achievements &&
        actualCounts.stats === this.cacheMetadata.itemCounts.stats &&
        actualCounts.drafts === this.cacheMetadata.itemCounts.drafts;

      if (!isValid) {
        console.warn('⚠️ Cache integrity validation failed, updating metadata');
        await this.updateCacheMetadata({ itemCounts: actualCounts });
        await this.calculateCacheSize();
      }

      return isValid;

    } catch (error) {
      console.error('Cache integrity validation failed:', error);
      return false;
    }
  }

  /**
   * Calculate total cache size
   */
  private async calculateCacheSize(): Promise<number> {
    try {
      let totalSize = 0;
      
      for (const key of Object.values(STORAGE_KEYS)) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += Buffer.byteLength(data, 'utf8');
        }
      }

      if (this.cacheMetadata) {
        await this.updateCacheMetadata({ totalSize });
      }

      return totalSize;

    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }

  // ============================================================================
  // Public API - Records Management
  // ============================================================================

  /**
   * Store tasting records to offline cache
   */
  async storeRecordsToCache(records: TastingRecord[]): Promise<void> {
    await this.ensureInitialized();

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
      
      if (this.cacheMetadata) {
        this.cacheMetadata.itemCounts.records = records.length;
        await this.updateCacheMetadata({});
      }

      console.log(`💾 Stored ${records.length} records to offline cache`);

    } catch (error) {
      console.error('Failed to store records to cache:', error);
      throw error;
    }
  }

  /**
   * Get tasting records from offline cache
   */
  async getRecordsFromCache(): Promise<TastingRecord[]> {
    await this.ensureInitialized();

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
        }));
      }
      return [];

    } catch (error) {
      console.error('Failed to get records from cache:', error);
      return [];
    }
  }

  /**
   * Add single record to cache
   */
  async addRecordToCache(record: TastingRecord): Promise<void> {
    const records = await this.getRecordsFromCache();
    
    // Check if record already exists (update) or new (insert)
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record); // Add to beginning for recency
    }

    // Limit cache size to prevent excessive storage usage
    const maxRecords = 100;
    if (records.length > maxRecords) {
      records.splice(maxRecords);
    }

    await this.storeRecordsToCache(records);
  }

  /**
   * Remove record from cache
   */
  async removeRecordFromCache(recordId: string): Promise<void> {
    const records = await this.getRecordsFromCache();
    const filteredRecords = records.filter(r => r.id !== recordId);
    
    if (filteredRecords.length !== records.length) {
      await this.storeRecordsToCache(filteredRecords);
    }
  }

  // ============================================================================
  // Public API - Achievements Management
  // ============================================================================

  /**
   * Store achievements to offline cache
   */
  async storeAchievementsToCache(achievements: Achievement[]): Promise<void> {
    await this.ensureInitialized();

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      
      if (this.cacheMetadata) {
        this.cacheMetadata.itemCounts.achievements = achievements.length;
        await this.updateCacheMetadata({});
      }

      console.log(`🏆 Stored ${achievements.length} achievements to offline cache`);

    } catch (error) {
      console.error('Failed to store achievements to cache:', error);
      throw error;
    }
  }

  /**
   * Get achievements from offline cache
   */
  async getAchievementsFromCache(): Promise<Achievement[]> {
    await this.ensureInitialized();

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((achievement: any) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
        }));
      }
      return [];

    } catch (error) {
      console.error('Failed to get achievements from cache:', error);
      return [];
    }
  }

  // ============================================================================
  // Public API - Stats Management
  // ============================================================================

  /**
   * Store user stats to offline cache
   */
  async storeStatsToCache(stats: UserStats): Promise<void> {
    await this.ensureInitialized();

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
      
      if (this.cacheMetadata) {
        this.cacheMetadata.itemCounts.stats = 1;
        await this.updateCacheMetadata({});
      }

      console.log('📊 Stored user stats to offline cache');

    } catch (error) {
      console.error('Failed to store stats to cache:', error);
      throw error;
    }
  }

  /**
   * Get user stats from offline cache
   */
  async getStatsFromCache(): Promise<UserStats | null> {
    await this.ensureInitialized();

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        };
      }
      return null;

    } catch (error) {
      console.error('Failed to get stats from cache:', error);
      return null;
    }
  }

  // ============================================================================
  // Public API - Drafts Management
  // ============================================================================

  /**
   * Store drafts to offline cache
   */
  async storeDraftsToCache(drafts: TastingFlowDraft[]): Promise<void> {
    await this.ensureInitialized();

    try {
      // Filter out expired drafts
      const validDrafts = drafts.filter(draft => draft.expiresAt > new Date());
      
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(validDrafts));
      
      if (this.cacheMetadata) {
        this.cacheMetadata.itemCounts.drafts = validDrafts.length;
        await this.updateCacheMetadata({});
      }

      console.log(`📝 Stored ${validDrafts.length} drafts to offline cache`);

    } catch (error) {
      console.error('Failed to store drafts to cache:', error);
      throw error;
    }
  }

  /**
   * Get drafts from offline cache
   */
  async getDraftsFromCache(): Promise<TastingFlowDraft[]> {
    await this.ensureInitialized();

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed
          .map((draft: any) => ({
            ...draft,
            createdAt: new Date(draft.createdAt),
            updatedAt: new Date(draft.updatedAt),
            expiresAt: new Date(draft.expiresAt),
          }))
          .filter((draft: TastingFlowDraft) => draft.expiresAt > new Date()); // Filter expired
      }
      return [];

    } catch (error) {
      console.error('Failed to get drafts from cache:', error);
      return [];
    }
  }

  // ============================================================================
  // Public API - Offline Actions Queue
  // ============================================================================

  /**
   * Add action to offline queue
   */
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      
      const newAction: OfflineAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        retryCount: 0,
      };

      actions.push(newAction);
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(actions));

      console.log(`📤 Added offline action: ${newAction.type} ${newAction.table}`);

    } catch (error) {
      console.error('Failed to add offline action:', error);
    }
  }

  /**
   * Get offline actions queue
   */
  async getOfflineActions(): Promise<OfflineAction[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_ACTIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
      }
      return [];

    } catch (error) {
      console.error('Failed to get offline actions:', error);
      return [];
    }
  }

  /**
   * Remove offline action
   */
  async removeOfflineAction(actionId: string): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      const filteredActions = actions.filter(a => a.id !== actionId);
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(filteredActions));

    } catch (error) {
      console.error('Failed to remove offline action:', error);
    }
  }

  /**
   * Clear all offline actions
   */
  async clearOfflineActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_ACTIONS);
      console.log('🗑️ Cleared all offline actions');

    } catch (error) {
      console.error('Failed to clear offline actions:', error);
    }
  }

  // ============================================================================
  // Public API - Cache Management
  // ============================================================================

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    await this.ensureInitialized();

    try {
      const [records, achievements, stats, drafts, actions] = await Promise.all([
        this.getRecordsFromCache(),
        this.getAchievementsFromCache(),
        this.getStatsFromCache(),
        this.getDraftsFromCache(),
        this.getOfflineActions(),
      ]);

      const totalSize = await this.calculateCacheSize();
      
      return {
        totalSize: this.maxCacheSize,
        usedSize: totalSize,
        availableSize: this.maxCacheSize - totalSize,
        cacheSize: totalSize,
        itemCounts: {
          records: records.length,
          achievements: achievements.length,
          stats: stats ? 1 : 0,
          drafts: drafts.length,
          actions: actions.length,
        },
      };

    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalSize: this.maxCacheSize,
        usedSize: 0,
        availableSize: this.maxCacheSize,
        cacheSize: 0,
        itemCounts: {
          records: 0,
          achievements: 0,
          stats: 0,
          drafts: 0,
          actions: 0,
        },
      };
    }
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.RECORDS),
        AsyncStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS),
        AsyncStorage.removeItem(STORAGE_KEYS.STATS),
        AsyncStorage.removeItem(STORAGE_KEYS.DRAFTS),
        AsyncStorage.removeItem(STORAGE_KEYS.CACHE_METADATA),
      ]);

      // Reset metadata
      this.cacheMetadata = null;
      await this.loadCacheMetadata();

      console.log('🗑️ Cleared all cached data');

    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Optimize cache storage
   */
  async optimizeCache(): Promise<void> {
    console.log('🔧 Optimizing cache storage...');

    try {
      // Remove expired items
      await this.cleanupExpiredCache();

      // Limit record count to stay within size limits
      const stats = await this.getStorageStats();
      
      if (stats.usedSize > this.maxCacheSize * 0.9) { // 90% full
        console.log('💾 Cache nearly full, removing old records');
        
        const records = await this.getRecordsFromCache();
        // Keep only most recent 50 records
        const limitedRecords = records
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 50);
        
        await this.storeRecordsToCache(limitedRecords);
      }

      console.log('✅ Cache optimization completed');

    } catch (error) {
      console.error('Failed to optimize cache:', error);
    }
  }

  /**
   * Check if cache is available and valid
   */
  async isCacheValid(): Promise<boolean> {
    if (!this.cacheMetadata) return false;
    
    const now = new Date();
    return this.cacheMetadata.expiresAt > now;
  }

  /**
   * Ensure manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get cache health score (0-100)
   */
  async getCacheHealthScore(): Promise<number> {
    try {
      const stats = await this.getStorageStats();
      let score = 100;

      // Deduct for cache size usage
      const usagePercent = (stats.usedSize / stats.totalSize) * 100;
      if (usagePercent > 90) score -= 30;
      else if (usagePercent > 75) score -= 15;
      else if (usagePercent > 50) score -= 5;

      // Deduct for old cache
      if (this.cacheMetadata) {
        const ageHours = (Date.now() - this.cacheMetadata.lastUpdated.getTime()) / (1000 * 60 * 60);
        if (ageHours > 24) score -= 20;
        else if (ageHours > 6) score -= 10;
      }

      // Deduct for integrity issues
      const isValid = await this.validateCacheIntegrity();
      if (!isValid) score -= 25;

      return Math.max(0, score);

    } catch (error) {
      console.error('Failed to calculate cache health score:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const offlineManager = new OfflineDataManager();

// Export types
export type {
  CacheMetadata,
  OfflineAction,
  StorageStats,
};

// Export utilities
export const offlineUtils = {
  /**
   * Format storage size for display
   */
  formatStorageSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  /**
   * Get cache status summary
   */
  async getCacheStatusSummary(): Promise<{
    isHealthy: boolean;
    healthScore: number;
    usagePercent: number;
    totalItems: number;
    lastUpdated: Date | null;
  }> {
    const [healthScore, stats] = await Promise.all([
      offlineManager.getCacheHealthScore(),
      offlineManager.getStorageStats(),
    ]);

    const usagePercent = (stats.usedSize / stats.totalSize) * 100;
    const totalItems = Object.values(stats.itemCounts).reduce((sum, count) => sum + count, 0);

    return {
      isHealthy: healthScore >= 70,
      healthScore,
      usagePercent,
      totalItems,
      lastUpdated: offlineManager['cacheMetadata']?.lastUpdated || null,
    };
  },

  /**
   * Check if offline mode is available
   */
  isOfflineModeAvailable(): boolean {
    return configUtils.isFeatureEnabled('offlineMode');
  },
};

export default offlineManager;