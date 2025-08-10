import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, User, TastingRecord, Achievement, UserStats, TastingFlowDraft } from '../types';
import { supabaseConfig, configUtils } from './supabase-config';

// Create Supabase client with enhanced configuration
export const supabase: SupabaseClient<Database> = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    ...supabaseConfig.clientOptions,
    auth: {
      ...supabaseConfig.clientOptions.auth,
      storage: AsyncStorage,
    },
  }
);

// Validate configuration on startup
if (!configUtils.validateConfig()) {
  console.warn('⚠️  Supabase configuration validation failed. Please check your .env.local file.');
}

// Auth Service
export class AuthService {
  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (!user) return null;

      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'Coffee Lover',
        avatar: user.user_metadata?.avatar_url,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get current session
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    
    if (error) throw error;
    return data;
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Reset password via email
  static async resetPasswordForEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'cupnote://reset-password',
    });
    
    if (error) throw error;
  }

  // Update user profile
  static async updateProfile(updates: { name?: string; avatar?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    
    if (error) throw error;
    return data;
  }
}

// Users Service
export class UsersService {
  // Create user profile
  static async createProfile(user: Partial<Database['public']['Tables']['users']['Insert']>) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  // Get user profile
  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

// Records Service
export class RecordsService {
  // Create a new tasting record
  static async createRecord(record: Database['public']['Tables']['tasting_records']['Insert']): Promise<TastingRecord> {
    const { data, error } = await supabase
      .from('tasting_records')
      .insert(record)
      .select()
      .single();
      
    if (error) throw error;
    return this.mapDbRecordToTastingRecord(data);
  }

  // Get records for a user
  static async getRecords(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      mode?: 'cafe' | 'homecafe' | 'all';
      sortBy?: 'created_at' | 'rating' | 'updated_at';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ records: TastingRecord[]; total: number }> {
    const { page = 1, limit = 20, mode = 'all', sortBy = 'created_at', sortOrder = 'desc' } = options;
    
    let query = supabase
      .from('tasting_records')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'completed');
      
    if (mode !== 'all') {
      query = query.eq('mode', mode);
    }
    
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      records: (data || []).map(this.mapDbRecordToTastingRecord),
      total: count || 0,
    };
  }

  // Get a specific record
  static async getRecord(recordId: string): Promise<TastingRecord | null> {
    const { data, error } = await supabase
      .from('tasting_records')
      .select('*')
      .eq('id', recordId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return this.mapDbRecordToTastingRecord(data);
  }

  // Update a record
  static async updateRecord(recordId: string, updates: Database['public']['Tables']['tasting_records']['Update']): Promise<TastingRecord> {
    const { data, error } = await supabase
      .from('tasting_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', recordId)
      .select()
      .single();
      
    if (error) throw error;
    return this.mapDbRecordToTastingRecord(data);
  }

  // Delete a record
  static async deleteRecord(recordId: string): Promise<void> {
    const { error } = await supabase
      .from('tasting_records')
      .delete()
      .eq('id', recordId);
      
    if (error) throw error;
  }

  // Search records
  static async searchRecords(
    userId: string,
    query: string,
    options: { limit?: number } = {}
  ): Promise<TastingRecord[]> {
    const { limit = 20 } = options;
    
    const { data, error } = await supabase
      .from('tasting_records')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .or(`coffee_data->>name.ilike.%${query}%,notes.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return (data || []).map(this.mapDbRecordToTastingRecord);
  }

  // Get user statistics
  static async getRecordStats(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_record_stats', { user_id: userId });
      
    if (error) throw error;
    return data;
  }

  // Helper method to map database record to TastingRecord type
  private static mapDbRecordToTastingRecord(dbRecord: Database['public']['Tables']['tasting_records']['Row']): TastingRecord {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      mode: dbRecord.mode,
      status: dbRecord.status,
      coffee: dbRecord.coffee_data,
      cafe: dbRecord.cafe_data,
      brew: dbRecord.brew_data,
      taste: dbRecord.taste_data,
      flavors: dbRecord.flavors,
      flavorIntensity: dbRecord.flavor_intensity,
      sensoryExpression: dbRecord.sensory_expression,
      notes: dbRecord.notes,
      rating: dbRecord.rating,
      mood: dbRecord.mood,
      context: dbRecord.context,
      tags: dbRecord.tags || [],
      photos: dbRecord.photos || [],
      shareWithCommunity: dbRecord.share_with_community,
      repurchaseIntent: dbRecord.repurchase_intent,
      createdAt: new Date(dbRecord.created_at),
      updatedAt: new Date(dbRecord.updated_at),
    };
  }
}

// Drafts Service
export class DraftsService {
  // Create or update a draft
  static async saveDraft(draft: TastingFlowDraft): Promise<TastingFlowDraft> {
    const draftData: Database['public']['Tables']['drafts']['Insert'] = {
      user_id: draft.userId,
      mode: draft.mode,
      current_step: draft.currentStep,
      data: {
        coffeeData: draft.coffeeData,
        brewSetupData: draft.brewSetupData,
        flavorData: draft.flavorData,
        sensoryExpressionData: draft.sensoryExpressionData,
        sensoryMouthFeelData: draft.sensoryMouthFeelData,
        personalNotesData: draft.personalNotesData,
      },
      expires_at: draft.expiresAt.toISOString(),
    };

    const { data, error } = await supabase
      .from('drafts')
      .upsert(draftData)
      .select()
      .single();
      
    if (error) throw error;
    return this.mapDbDraftToTastingFlowDraft(data);
  }

  // Get drafts for a user
  static async getDrafts(userId: string): Promise<TastingFlowDraft[]> {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    return (data || []).map(this.mapDbDraftToTastingFlowDraft);
  }

  // Get a specific draft
  static async getDraft(draftId: string): Promise<TastingFlowDraft | null> {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    // Check if expired
    if (new Date(data.expires_at) <= new Date()) {
      await this.deleteDraft(draftId);
      return null;
    }
    
    return this.mapDbDraftToTastingFlowDraft(data);
  }

  // Delete a draft
  static async deleteDraft(draftId: string): Promise<void> {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId);
      
    if (error) throw error;
  }

  // Clean up expired drafts
  static async cleanupExpiredDrafts(userId: string): Promise<void> {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString());
      
    if (error) throw error;
  }

  // Helper method to map database draft to TastingFlowDraft type
  private static mapDbDraftToTastingFlowDraft(dbDraft: Database['public']['Tables']['drafts']['Row']): TastingFlowDraft {
    const data = dbDraft.data || {};
    return {
      id: dbDraft.id,
      userId: dbDraft.user_id,
      mode: dbDraft.mode,
      currentStep: dbDraft.current_step as keyof import('../types/tastingFlow').TastingFlowStackParamList,
      coffeeData: data.coffeeData,
      brewSetupData: data.brewSetupData,
      flavorData: data.flavorData,
      sensoryExpressionData: data.sensoryExpressionData,
      sensoryMouthFeelData: data.sensoryMouthFeelData,
      personalNotesData: data.personalNotesData,
      createdAt: new Date(dbDraft.created_at),
      updatedAt: new Date(dbDraft.updated_at),
      expiresAt: new Date(dbDraft.expires_at),
      version: data.version || 1,
    };
  }
}

// Achievements Service
export class AchievementsService {
  // Get all achievements
  static async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true });
      
    if (error) throw error;
    
    return (data || []).map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category as Achievement['category'],
      requirement: achievement.requirement,
      points: achievement.points,
      rarity: achievement.rarity as Achievement['rarity'],
    }));
  }

  // Get user achievements
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return (data || []).map(userAchievement => ({
      id: userAchievement.achievements.id,
      name: userAchievement.achievements.name,
      description: userAchievement.achievements.description,
      icon: userAchievement.achievements.icon,
      category: userAchievement.achievements.category as Achievement['category'],
      requirement: userAchievement.achievements.requirement,
      points: userAchievement.achievements.points,
      rarity: userAchievement.achievements.rarity as Achievement['rarity'],
      unlockedAt: new Date(userAchievement.unlocked_at),
    }));
  }

  // Unlock achievement for user
  static async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      });
      
    if (error) throw error;
  }

  // Check and unlock achievements based on user activity
  static async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    // This would typically call a server function that checks all achievement criteria
    const { data, error } = await supabase
      .rpc('check_and_unlock_achievements', { user_id: userId });
      
    if (error) throw error;
    return data || [];
  }
}

// User Stats Service
export class UserStatsService {
  // Get user stats
  static async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return {
      ...data.stats_data,
      lastUpdated: new Date(data.last_updated),
    } as UserStats;
  }

  // Update user stats
  static async updateUserStats(userId: string, stats: UserStats): Promise<void> {
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        stats_data: stats,
        last_updated: new Date().toISOString(),
      });
      
    if (error) throw error;
  }

  // Calculate and update user stats
  static async calculateAndUpdateStats(userId: string): Promise<UserStats> {
    const { data, error } = await supabase
      .rpc('calculate_user_stats', { user_id: userId });
      
    if (error) throw error;
    return data;
  }
}

// Real-time subscriptions
export class RealtimeService {
  // Subscribe to record changes
  static subscribeToRecords(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('records')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasting_records',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  // Subscribe to achievement unlocks
  static subscribeToAchievements(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
}

// Export the main client and services
export {
  AuthService as auth,
  UsersService as users,
  RecordsService as records,
  DraftsService as drafts,
  AchievementsService as achievements,
  UserStatsService as userStats,
  RealtimeService as realtime,
};

export default supabase;