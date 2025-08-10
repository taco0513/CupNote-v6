/**
 * CupNote v6 Real-time Subscriptions & Offline Sync Manager
 * Comprehensive real-time data synchronization with offline support
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { supabaseConfig, configUtils } from './supabase-config';
import { Database } from '../types';

// Real-time event types
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

// Real-time payload wrapper
export interface RealtimePayload<T = any> {
  eventType: RealtimeEventType;
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

// Subscription configuration
export interface SubscriptionConfig {
  table: string;
  schema?: string;
  filter?: string;
  event?: RealtimeEventType | '*';
  callback: (payload: RealtimePayload) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

// Connection state
export interface ConnectionState {
  status: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';
  connected: boolean;
  lastConnected?: Date;
  reconnectCount: number;
  error?: string;
}

// Offline sync queue item
export interface OfflineSyncItem {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: Date;
  retries: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Real-time Subscription Manager
 * Handles all real-time subscriptions with automatic reconnection and offline support
 */
class RealtimeManager {
  private subscriptions = new Map<string, RealtimeChannel>();
  private connectionState: ConnectionState = {
    status: 'CLOSED',
    connected: false,
    reconnectCount: 0,
  };
  private reconnectTimeout?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Interval;
  private offlineQueue: OfflineSyncItem[] = [];
  private syncInProgress = false;
  private connectionListeners = new Set<(state: ConnectionState) => void>();

  constructor() {
    this.setupConnectionMonitoring();
    this.setupOfflineSync();
  }

  /**
   * Setup connection monitoring and heartbeat
   */
  private setupConnectionMonitoring() {
    if (!configUtils.isFeatureEnabled('realTime')) {
      console.log('📡 Real-time sync is disabled');
      return;
    }

    // Monitor connection status
    supabase.realtime.onConnected(() => {
      this.updateConnectionState({
        status: 'OPEN',
        connected: true,
        lastConnected: new Date(),
        error: undefined,
      });
      this.triggerOfflineSync();
    });

    supabase.realtime.onDisconnect(() => {
      this.updateConnectionState({
        status: 'CLOSED',
        connected: false,
      });
      this.scheduleReconnect();
    });

    supabase.realtime.onError((error) => {
      console.error('Real-time connection error:', error);
      this.updateConnectionState({
        status: 'CLOSED',
        connected: false,
        error: error.message,
      });
      this.scheduleReconnect();
    });

    // Heartbeat to detect connection issues
    this.startHeartbeat();
  }

  /**
   * Setup offline sync capabilities
   */
  private setupOfflineSync() {
    if (!configUtils.isFeatureEnabled('offlineMode')) {
      console.log('📴 Offline mode is disabled');
      return;
    }

    // Load offline queue from storage on startup
    this.loadOfflineQueue();

    // Save queue periodically
    setInterval(() => {
      this.saveOfflineQueue();
    }, 30000); // Every 30 seconds
  }

  /**
   * Subscribe to real-time changes for a table
   */
  subscribe<T = any>(subscriptionId: string, config: SubscriptionConfig): () => void {
    if (!configUtils.isFeatureEnabled('realTime')) {
      console.warn('Real-time subscriptions are disabled');
      return () => {};
    }

    // Remove existing subscription if it exists
    this.unsubscribe(subscriptionId);

    const channel = supabase
      .channel(subscriptionId)
      .on(
        'postgres_changes',
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          const wrappedPayload: RealtimePayload<T> = {\n            eventType: payload.eventType as RealtimeEventType,\n            new: payload.new as T,\n            old: payload.old as T,\n            schema: payload.schema,\n            table: payload.table,\n            commit_timestamp: payload.commit_timestamp,\n          };\n          \n          try {\n            config.callback(wrappedPayload);\n          } catch (error) {\n            console.error(`Subscription callback error for ${subscriptionId}:`, error);\n            config.onError?.(error instanceof Error ? error.message : 'Unknown error');\n          }\n        }\n      )\n      .subscribe((status) => {\n        switch (status) {\n          case 'SUBSCRIBED':\n            console.log(`✅ Subscribed to ${subscriptionId}`);\n            config.onConnected?.();\n            break;\n          case 'CHANNEL_ERROR':\n            console.error(`❌ Subscription error for ${subscriptionId}`);\n            config.onError?.('Channel error');\n            break;\n          case 'TIMED_OUT':\n            console.warn(`⏰ Subscription timeout for ${subscriptionId}`);\n            config.onError?.('Subscription timed out');\n            break;\n          case 'CLOSED':\n            console.log(`🚪 Subscription closed for ${subscriptionId}`);\n            config.onDisconnected?.();\n            break;\n        }\n      });\n\n    this.subscriptions.set(subscriptionId, channel);\n\n    // Return unsubscribe function\n    return () => this.unsubscribe(subscriptionId);\n  }\n\n  /**\n   * Unsubscribe from a real-time channel\n   */\n  unsubscribe(subscriptionId: string): void {\n    const channel = this.subscriptions.get(subscriptionId);\n    if (channel) {\n      supabase.removeChannel(channel);\n      this.subscriptions.delete(subscriptionId);\n      console.log(`🔌 Unsubscribed from ${subscriptionId}`);\n    }\n  }\n\n  /**\n   * Unsubscribe from all channels\n   */\n  unsubscribeAll(): void {\n    this.subscriptions.forEach((_, id) => this.unsubscribe(id));\n  }\n\n  /**\n   * Add operation to offline sync queue\n   */\n  addToOfflineQueue(\n    table: string,\n    operation: OfflineSyncItem['operation'],\n    data: any,\n    priority: OfflineSyncItem['priority'] = 'medium'\n  ): void {\n    if (!configUtils.isFeatureEnabled('offlineMode')) {\n      return;\n    }\n\n    const item: OfflineSyncItem = {\n      id: `${table}_${operation}_${Date.now()}_${Math.random()}`,\n      table,\n      operation,\n      data,\n      timestamp: new Date(),\n      retries: 0,\n      maxRetries: priority === 'high' ? 10 : priority === 'medium' ? 5 : 3,\n      priority,\n    };\n\n    this.offlineQueue.push(item);\n    console.log(`📥 Added to offline queue: ${item.id}`);\n\n    // Trigger sync if online\n    if (this.connectionState.connected) {\n      this.triggerOfflineSync();\n    }\n  }\n\n  /**\n   * Process offline sync queue\n   */\n  private async triggerOfflineSync(): Promise<void> {\n    if (!configUtils.isFeatureEnabled('offlineMode') || this.syncInProgress || this.offlineQueue.length === 0) {\n      return;\n    }\n\n    this.syncInProgress = true;\n    console.log(`🔄 Starting offline sync (${this.offlineQueue.length} items)`);\n\n    // Sort by priority and timestamp\n    const sortedQueue = [...this.offlineQueue].sort((a, b) => {\n      const priorityOrder = { high: 3, medium: 2, low: 1 };\n      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];\n      return priorityDiff !== 0 ? priorityDiff : a.timestamp.getTime() - b.timestamp.getTime();\n    });\n\n    const processedIds: string[] = [];\n    const failedItems: OfflineSyncItem[] = [];\n\n    for (const item of sortedQueue) {\n      try {\n        await this.processOfflineItem(item);\n        processedIds.push(item.id);\n        console.log(`✅ Synced offline item: ${item.id}`);\n      } catch (error) {\n        console.error(`❌ Failed to sync offline item: ${item.id}`, error);\n        \n        item.retries++;\n        if (item.retries >= item.maxRetries) {\n          console.error(`💀 Max retries exceeded for item: ${item.id}`);\n          processedIds.push(item.id); // Remove from queue\n        } else {\n          failedItems.push(item);\n        }\n      }\n    }\n\n    // Remove processed items from queue\n    this.offlineQueue = this.offlineQueue.filter(item => !processedIds.includes(item.id));\n    \n    // Re-add failed items with updated retry count\n    this.offlineQueue.push(...failedItems);\n\n    this.syncInProgress = false;\n    this.saveOfflineQueue();\n\n    console.log(`🏁 Offline sync completed. ${processedIds.length} synced, ${failedItems.length} failed, ${this.offlineQueue.length} remaining`);\n  }\n\n  /**\n   * Process a single offline sync item\n   */\n  private async processOfflineItem(item: OfflineSyncItem): Promise<void> {\n    const { table, operation, data } = item;\n\n    switch (operation) {\n      case 'INSERT':\n        await supabase.from(table).insert(data);\n        break;\n      case 'UPDATE':\n        if (!data.id) throw new Error('Update requires id');\n        await supabase.from(table).update(data).eq('id', data.id);\n        break;\n      case 'DELETE':\n        if (!data.id) throw new Error('Delete requires id');\n        await supabase.from(table).delete().eq('id', data.id);\n        break;\n      default:\n        throw new Error(`Unknown operation: ${operation}`);\n    }\n  }\n\n  /**\n   * Load offline queue from storage\n   */\n  private async loadOfflineQueue(): Promise<void> {\n    try {\n      const AsyncStorage = await import('@react-native-async-storage/async-storage');\n      const stored = await AsyncStorage.default.getItem('cupnote_offline_queue');\n      if (stored) {\n        const parsed = JSON.parse(stored);\n        this.offlineQueue = parsed.map((item: any) => ({\n          ...item,\n          timestamp: new Date(item.timestamp),\n        }));\n        console.log(`📂 Loaded ${this.offlineQueue.length} items from offline queue`);\n      }\n    } catch (error) {\n      console.error('Failed to load offline queue:', error);\n    }\n  }\n\n  /**\n   * Save offline queue to storage\n   */\n  private async saveOfflineQueue(): Promise<void> {\n    try {\n      const AsyncStorage = await import('@react-native-async-storage/async-storage');\n      await AsyncStorage.default.setItem('cupnote_offline_queue', JSON.stringify(this.offlineQueue));\n    } catch (error) {\n      console.error('Failed to save offline queue:', error);\n    }\n  }\n\n  /**\n   * Update connection state and notify listeners\n   */\n  private updateConnectionState(updates: Partial<ConnectionState>): void {\n    this.connectionState = { ...this.connectionState, ...updates };\n    this.connectionListeners.forEach(listener => listener(this.connectionState));\n  }\n\n  /**\n   * Schedule reconnection with exponential backoff\n   */\n  private scheduleReconnect(): void {\n    if (this.reconnectTimeout) {\n      clearTimeout(this.reconnectTimeout);\n    }\n\n    const delay = Math.min(1000 * Math.pow(2, this.connectionState.reconnectCount), 30000);\n    console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${this.connectionState.reconnectCount + 1})`);\n\n    this.reconnectTimeout = setTimeout(() => {\n      this.connectionState.reconnectCount++;\n      supabase.realtime.connect();\n    }, delay);\n  }\n\n  /**\n   * Start heartbeat monitoring\n   */\n  private startHeartbeat(): void {\n    this.heartbeatInterval = setInterval(() => {\n      if (this.connectionState.connected) {\n        // Simple ping to check connection\n        supabase.from('system_settings').select('key').limit(1).then(\n          () => {}, // Success - connection is good\n          () => {\n            // Failed - connection might be dead\n            this.updateConnectionState({ connected: false });\n            this.scheduleReconnect();\n          }\n        );\n      }\n    }, 30000); // Every 30 seconds\n  }\n\n  /**\n   * Get current connection state\n   */\n  getConnectionState(): ConnectionState {\n    return { ...this.connectionState };\n  }\n\n  /**\n   * Add connection state listener\n   */\n  addConnectionListener(listener: (state: ConnectionState) => void): () => void {\n    this.connectionListeners.add(listener);\n    // Return unsubscribe function\n    return () => this.connectionListeners.delete(listener);\n  }\n\n  /**\n   * Get offline queue status\n   */\n  getOfflineQueueStatus(): {\n    items: number;\n    highPriority: number;\n    oldestItem?: Date;\n    syncInProgress: boolean;\n  } {\n    const highPriority = this.offlineQueue.filter(item => item.priority === 'high').length;\n    const oldestItem = this.offlineQueue.length > 0 \n      ? new Date(Math.min(...this.offlineQueue.map(item => item.timestamp.getTime())))\n      : undefined;\n\n    return {\n      items: this.offlineQueue.length,\n      highPriority,\n      oldestItem,\n      syncInProgress: this.syncInProgress,\n    };\n  }\n\n  /**\n   * Force sync offline queue\n   */\n  forceSyncOfflineQueue(): Promise<void> {\n    return this.triggerOfflineSync();\n  }\n\n  /**\n   * Clear offline queue (use with caution)\n   */\n  clearOfflineQueue(): void {\n    this.offlineQueue = [];\n    this.saveOfflineQueue();\n    console.log('🗑️ Offline queue cleared');\n  }\n\n  /**\n   * Cleanup resources\n   */\n  destroy(): void {\n    this.unsubscribeAll();\n    \n    if (this.reconnectTimeout) {\n      clearTimeout(this.reconnectTimeout);\n    }\n    \n    if (this.heartbeatInterval) {\n      clearInterval(this.heartbeatInterval);\n    }\n    \n    this.connectionListeners.clear();\n    this.saveOfflineQueue();\n  }\n}\n\n// Export singleton instance\nexport const realtimeManager = new RealtimeManager();\n\n// Convenience functions for common subscriptions\nexport const subscriptions = {\n  /**\n   * Subscribe to user's tasting records changes\n   */\n  subscribeToUserRecords(\n    userId: string,\n    callback: (payload: RealtimePayload<Database['public']['Tables']['tasting_records']['Row']>) => void\n  ) {\n    return realtimeManager.subscribe(`user_records_${userId}`, {\n      table: 'tasting_records',\n      filter: `user_id=eq.${userId}`,\n      callback,\n    });\n  },\n\n  /**\n   * Subscribe to user's achievement progress\n   */\n  subscribeToUserAchievements(\n    userId: string,\n    callback: (payload: RealtimePayload<Database['public']['Tables']['user_achievements']['Row']>) => void\n  ) {\n    return realtimeManager.subscribe(`user_achievements_${userId}`, {\n      table: 'user_achievements',\n      filter: `user_id=eq.${userId}`,\n      callback,\n    });\n  },\n\n  /**\n   * Subscribe to user's stats updates\n   */\n  subscribeToUserStats(\n    userId: string,\n    callback: (payload: RealtimePayload<Database['public']['Tables']['user_stats']['Row']>) => void\n  ) {\n    return realtimeManager.subscribe(`user_stats_${userId}`, {\n      table: 'user_stats',\n      filter: `user_id=eq.${userId}`,\n      callback,\n    });\n  },\n\n  /**\n   * Subscribe to user's drafts\n   */\n  subscribeToUserDrafts(\n    userId: string,\n    callback: (payload: RealtimePayload<Database['public']['Tables']['drafts']['Row']>) => void\n  ) {\n    return realtimeManager.subscribe(`user_drafts_${userId}`, {\n      table: 'drafts',\n      filter: `user_id=eq.${userId}`,\n      callback,\n    });\n  },\n\n  /**\n   * Subscribe to community taste matches\n   */\n  subscribeToTasteMatches(\n    userId: string,\n    callback: (payload: RealtimePayload<Database['public']['Tables']['taste_matches']['Row']>) => void\n  ) {\n    return realtimeManager.subscribe(`taste_matches_${userId}`, {\n      table: 'taste_matches',\n      filter: `user_id=eq.${userId}`,\n      callback,\n    });\n  },\n};\n\n// Export types\nexport type {\n  RealtimeEventType,\n  RealtimePayload,\n  SubscriptionConfig,\n  ConnectionState,\n  OfflineSyncItem,\n};