/**
 * CupNote v6 Migration Manager
 * Handles database schema migrations and data transformations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { supabaseConfig } from './supabase-config';

// Migration version and metadata
export interface MigrationInfo {
  version: number;
  name: string;
  description: string;
  requiredBefore: Date;
  isBreaking: boolean;
  estimatedDuration: number; // in seconds
  dependencies: number[]; // other migration versions required
}

// Migration result
export interface MigrationResult {
  success: boolean;
  version: number;
  startedAt: Date;
  completedAt?: Date;
  duration: number;
  error?: string;
  rollbackAvailable: boolean;
}

// App migration state
export interface MigrationState {
  currentVersion: number;
  targetVersion: number;
  pendingMigrations: MigrationInfo[];
  completedMigrations: number[];
  inProgress: boolean;
  lastCheckAt: Date;
  requiresUserAction: boolean;
  canUseApp: boolean;
}

/**
 * Migration Manager
 * Handles app and data migrations between versions
 */
class MigrationManager {
  private static readonly STORAGE_KEY = 'cupnote_migration_state';
  private static readonly CURRENT_VERSION = 6; // CupNote v6
  
  private migrationState: MigrationState | null = null;
  private isInitialized = false;

  // Define all migrations
  private readonly migrations: Map<number, MigrationInfo> = new Map([
    [1, {
      version: 1,
      name: 'initial_setup',
      description: 'Initial database setup and user profile creation',
      requiredBefore: new Date('2024-12-31'),
      isBreaking: false,
      estimatedDuration: 5,
      dependencies: [],
    }],
    [2, {
      version: 2,
      name: 'achievements_system',
      description: 'Add achievements system and user stats tracking',
      requiredBefore: new Date('2025-01-31'),
      isBreaking: false,
      estimatedDuration: 10,
      dependencies: [1],
    }],
    [3, {
      version: 3,
      name: 'korean_expressions',
      description: 'Add Korean sensory expressions support',
      requiredBefore: new Date('2025-02-28'),
      isBreaking: false,
      estimatedDuration: 7,
      dependencies: [1, 2],
    }],
    [4, {
      version: 4,
      name: 'community_matching',
      description: 'Add community taste matching features',
      requiredBefore: new Date('2025-03-31'),
      isBreaking: false,
      estimatedDuration: 15,
      dependencies: [1, 2, 3],
    }],
    [5, {
      version: 5,
      name: 'offline_support',
      description: 'Add offline data support and sync capabilities',
      requiredBefore: new Date('2025-04-30'),
      isBreaking: true,
      estimatedDuration: 20,
      dependencies: [1, 2, 3, 4],
    }],
    [6, {
      version: 6,
      name: 'enhanced_features',
      description: 'Enhanced UI, performance improvements, and new features',
      requiredBefore: new Date('2025-06-30'),
      isBreaking: false,
      estimatedDuration: 12,
      dependencies: [1, 2, 3, 4, 5],
    }],
  ]);

  /**
   * Initialize migration manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadMigrationState();
      await this.checkMigrationRequirements();
      this.isInitialized = true;
      
      console.log('🔄 Migration manager initialized');
      
    } catch (error) {
      console.error('Failed to initialize migration manager:', error);
      throw error;
    }
  }

  /**
   * Load migration state from storage
   */
  private async loadMigrationState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(MigrationManager.STORAGE_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        this.migrationState = {
          ...parsed,
          lastCheckAt: new Date(parsed.lastCheckAt),
        };
      } else {
        // Initialize default state
        this.migrationState = {
          currentVersion: 0,
          targetVersion: MigrationManager.CURRENT_VERSION,
          pendingMigrations: Array.from(this.migrations.values()),
          completedMigrations: [],
          inProgress: false,
          lastCheckAt: new Date(),
          requiresUserAction: false,
          canUseApp: false,
        };
        
        await this.saveMigrationState();
      }
      
    } catch (error) {
      console.error('Failed to load migration state:', error);
    }
  }

  /**
   * Save migration state to storage
   */
  private async saveMigrationState(): Promise<void> {
    if (!this.migrationState) return;

    try {
      await AsyncStorage.setItem(MigrationManager.STORAGE_KEY, JSON.stringify(this.migrationState));
    } catch (error) {
      console.error('Failed to save migration state:', error);
    }
  }

  /**
   * Update migration state
   */
  private async updateMigrationState(updates: Partial<MigrationState>): Promise<void> {
    if (!this.migrationState) return;

    this.migrationState = {
      ...this.migrationState,
      ...updates,
      lastCheckAt: new Date(),
    };

    await this.saveMigrationState();
  }

  /**
   * Check migration requirements
   */
  private async checkMigrationRequirements(): Promise<void> {
    if (!this.migrationState) return;

    try {
      // Check if we need to run any migrations
      const pendingMigrations = this.getPendingMigrations();
      const hasBreakingChanges = pendingMigrations.some(m => m.isBreaking);
      const hasExpiredMigrations = pendingMigrations.some(m => m.requiredBefore <= new Date());

      await this.updateMigrationState({
        pendingMigrations,
        requiresUserAction: hasBreakingChanges,
        canUseApp: !hasExpiredMigrations,
      });

      if (hasExpiredMigrations) {
        console.warn('⚠️ Required migrations have expired - app may not function correctly');
      }

    } catch (error) {
      console.error('Failed to check migration requirements:', error);
    }
  }

  /**
   * Get pending migrations in dependency order
   */
  private getPendingMigrations(): MigrationInfo[] {
    if (!this.migrationState) return [];

    const allMigrations = Array.from(this.migrations.values());
    const pendingMigrations = allMigrations.filter(migration => 
      !this.migrationState!.completedMigrations.includes(migration.version)
    );

    // Sort by dependencies and version
    return pendingMigrations.sort((a, b) => {
      // If a depends on b, b should come first
      if (a.dependencies.includes(b.version)) return 1;
      if (b.dependencies.includes(a.version)) return -1;
      
      // Otherwise sort by version
      return a.version - b.version;
    });
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(options: {
    forceBreaking?: boolean;
    skipUserConfirmation?: boolean;
  } = {}): Promise<MigrationResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.migrationState) {
      throw new Error('Migration state not initialized');
    }

    if (this.migrationState.inProgress) {
      throw new Error('Migration already in progress');
    }

    const pendingMigrations = this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No migrations needed');
      return [];
    }

    // Check for breaking changes
    const breakingMigrations = pendingMigrations.filter(m => m.isBreaking);
    if (breakingMigrations.length > 0 && !options.forceBreaking && !options.skipUserConfirmation) {
      throw new Error(`Breaking migrations require user confirmation: ${breakingMigrations.map(m => m.name).join(', ')}`);
    }

    console.log(`🔄 Starting ${pendingMigrations.length} migrations...`);

    await this.updateMigrationState({ inProgress: true });
    const results: MigrationResult[] = [];

    try {
      for (const migration of pendingMigrations) {
        console.log(`⚡ Running migration ${migration.version}: ${migration.name}`);
        
        const result = await this.runSingleMigration(migration);
        results.push(result);
        
        if (result.success) {
          // Add to completed migrations
          this.migrationState.completedMigrations.push(migration.version);
          this.migrationState.currentVersion = Math.max(this.migrationState.currentVersion, migration.version);
          
          await this.updateMigrationState({
            completedMigrations: this.migrationState.completedMigrations,
            currentVersion: this.migrationState.currentVersion,
          });
          
          console.log(`✅ Migration ${migration.version} completed successfully`);
        } else {
          console.error(`❌ Migration ${migration.version} failed: ${result.error}`);
          
          // Stop on first failure
          break;
        }
      }

      // Update final state
      await this.checkMigrationRequirements();
      
      return results;

    } catch (error) {
      console.error('Migration process failed:', error);
      throw error;
      
    } finally {
      await this.updateMigrationState({ inProgress: false });
    }
  }

  /**
   * Run a single migration
   */
  private async runSingleMigration(migration: MigrationInfo): Promise<MigrationResult> {
    const startedAt = new Date();
    
    try {
      // Check dependencies
      for (const depVersion of migration.dependencies) {
        if (!this.migrationState!.completedMigrations.includes(depVersion)) {
          throw new Error(`Missing dependency: migration ${depVersion}`);
        }
      }

      // Run migration based on version
      await this.executeMigration(migration);
      
      const completedAt = new Date();
      const duration = completedAt.getTime() - startedAt.getTime();
      
      return {
        success: true,
        version: migration.version,
        startedAt,
        completedAt,
        duration,
        rollbackAvailable: true,
      };

    } catch (error) {
      const completedAt = new Date();
      const duration = completedAt.getTime() - startedAt.getTime();
      
      return {
        success: false,
        version: migration.version,
        startedAt,
        completedAt,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        rollbackAvailable: false,
      };
    }
  }

  /**
   * Execute specific migration logic
   */
  private async executeMigration(migration: MigrationInfo): Promise<void> {
    switch (migration.version) {
      case 1:
        await this.migrationV1_InitialSetup();
        break;
      case 2:
        await this.migrationV2_AchievementsSystem();
        break;
      case 3:
        await this.migrationV3_KoreanExpressions();
        break;
      case 4:
        await this.migrationV4_CommunityMatching();
        break;
      case 5:
        await this.migrationV5_OfflineSupport();
        break;
      case 6:
        await this.migrationV6_EnhancedFeatures();
        break;
      default:
        throw new Error(`Unknown migration version: ${migration.version}`);
    }
  }

  // ============================================================================
  // Individual Migration Implementations
  // ============================================================================

  /**
   * Migration V1: Initial Setup
   */
  private async migrationV1_InitialSetup(): Promise<void> {
    console.log('🔧 Running initial setup migration...');
    
    try {
      // Check if user has a profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, trigger creation
          console.log('Creating user profile...');
          await supabase.rpc('handle_new_user');
        }
      }
      
      // Initialize local storage structure
      await AsyncStorage.setItem('cupnote_app_initialized', 'true');
      
    } catch (error) {
      console.error('Initial setup migration failed:', error);
      throw error;
    }
  }

  /**
   * Migration V2: Achievements System
   */
  private async migrationV2_AchievementsSystem(): Promise<void> {
    console.log('🏆 Running achievements system migration...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Initialize user achievements
        await supabase.rpc('initialize_user_achievements', { target_user_id: user.id });
        
        // Update user stats
        await supabase.rpc('update_user_stats', { target_user_id: user.id });
      }
      
    } catch (error) {
      console.error('Achievements system migration failed:', error);
      throw error;
    }
  }

  /**
   * Migration V3: Korean Expressions
   */
  private async migrationV3_KoreanExpressions(): Promise<void> {
    console.log('🇰🇷 Running Korean expressions migration...');
    
    try {
      // Check if sensory expressions are populated
      const { count, error } = await supabase
        .from('sensory_expressions')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      
      if ((count || 0) === 0) {
        console.log('Sensory expressions table is empty - data should be seeded');
      }
      
      // Update app settings for Korean support
      await AsyncStorage.setItem('cupnote_korean_expressions_enabled', 'true');
      
    } catch (error) {
      console.error('Korean expressions migration failed:', error);
      throw error;
    }
  }

  /**
   * Migration V4: Community Matching
   */
  private async migrationV4_CommunityMatching(): Promise<void> {
    console.log('👥 Running community matching migration...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update profile to enable community features by default
        await supabase
          .from('profiles')
          .update({ 
            allow_match_requests: true,
            share_profile_public: false // Keep private by default
          })
          .eq('id', user.id);
      }
      
      // Enable community features
      await AsyncStorage.setItem('cupnote_community_enabled', 'true');
      
    } catch (error) {
      console.error('Community matching migration failed:', error);
      throw error;
    }
  }

  /**
   * Migration V5: Offline Support
   */
  private async migrationV5_OfflineSupport(): Promise<void> {
    console.log('📱 Running offline support migration...');
    
    try {
      // Initialize offline storage structure
      await AsyncStorage.setItem('cupnote_offline_enabled', 'true');
      await AsyncStorage.setItem('cupnote_cache_version', '1');
      
      // This is a breaking change - clear any old cache format
      const oldCacheKeys = [
        'cupnote_old_records',
        'cupnote_old_achievements',
        'cupnote_old_cache',
      ];
      
      for (const key of oldCacheKeys) {
        await AsyncStorage.removeItem(key);
      }
      
      console.log('Offline support migration completed - old cache cleared');
      
    } catch (error) {
      console.error('Offline support migration failed:', error);
      throw error;
    }
  }

  /**
   * Migration V6: Enhanced Features
   */
  private async migrationV6_EnhancedFeatures(): Promise<void> {
    console.log('✨ Running enhanced features migration...');
    
    try {
      // Update app version
      await AsyncStorage.setItem('cupnote_app_version', '6.0.0');
      
      // Enable all new features
      const features = {
        'cupnote_real_time_sync': 'true',
        'cupnote_advanced_analytics': 'true',
        'cupnote_enhanced_ui': 'true',
      };
      
      for (const [key, value] of Object.entries(features)) {
        await AsyncStorage.setItem(key, value);
      }
      
    } catch (error) {
      console.error('Enhanced features migration failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get current migration state
   */
  getMigrationState(): MigrationState | null {
    return this.migrationState;
  }

  /**
   * Check if migrations are needed
   */
  async hasPendingMigrations(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return this.migrationState?.pendingMigrations.length ?? 0 > 0;
  }

  /**
   * Check if app can be used (no critical migrations pending)
   */
  async canUseApp(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return this.migrationState?.canUseApp ?? false;
  }

  /**
   * Get migration summary for UI
   */
  async getMigrationSummary(): Promise<{
    pendingCount: number;
    hasBreakingChanges: boolean;
    estimatedDuration: number;
    requiresUserAction: boolean;
    nextMigration: MigrationInfo | null;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.migrationState) {
      return {
        pendingCount: 0,
        hasBreakingChanges: false,
        estimatedDuration: 0,
        requiresUserAction: false,
        nextMigration: null,
      };
    }

    const pendingMigrations = this.migrationState.pendingMigrations;
    const hasBreakingChanges = pendingMigrations.some(m => m.isBreaking);
    const estimatedDuration = pendingMigrations.reduce((sum, m) => sum + m.estimatedDuration, 0);
    const nextMigration = pendingMigrations[0] || null;

    return {
      pendingCount: pendingMigrations.length,
      hasBreakingChanges,
      estimatedDuration,
      requiresUserAction: this.migrationState.requiresUserAction,
      nextMigration,
    };
  }

  /**
   * Reset migration state (for development/testing)
   */
  async resetMigrationState(): Promise<void> {
    await AsyncStorage.removeItem(MigrationManager.STORAGE_KEY);
    this.migrationState = null;
    this.isInitialized = false;
    
    console.log('🔄 Migration state reset');
  }
}

// Export singleton instance
export const migrationManager = new MigrationManager();

// Export types
export type {
  MigrationInfo,
  MigrationResult,
  MigrationState,
};

// Export utilities
export const migrationUtils = {
  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  },

  /**
   * Get migration priority level
   */
  getMigrationPriority(migration: MigrationInfo): 'critical' | 'high' | 'medium' | 'low' {
    const now = new Date();
    const daysUntilRequired = Math.ceil((migration.requiredBefore.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRequired <= 0) return 'critical';
    if (migration.isBreaking) return 'high';
    if (daysUntilRequired <= 7) return 'high';
    if (daysUntilRequired <= 30) return 'medium';
    return 'low';
  },

  /**
   * Check if migration manager is available
   */
  isAvailable(): boolean {
    return true; // Migration manager is always available
  },
};

export default migrationManager;