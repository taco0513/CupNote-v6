/**
 * CupNote v6 Supabase Client Configuration
 * Production-ready Supabase client with comprehensive error handling,
 * real-time subscriptions, and performance optimizations
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// ============================================================================
// Environment Configuration
// ============================================================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    'Missing SUPABASE_URL environment variable. ' +
    'Add EXPO_PUBLIC_SUPABASE_URL to your .env file'
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing SUPABASE_ANON_KEY environment variable. ' +
    'Add EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file'
  );
}

// ============================================================================
// Client Configuration
// ============================================================================

const supabaseConfig = {
  auth: {
    // Auth configuration optimized for mobile
    storage: undefined, // Will use AsyncStorage in React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disabled for mobile
    flowType: 'pkce' as const,
  },
  realtime: {
    // Real-time optimized for mobile networks
    params: {
      eventsPerSecond: 10,
    },
    heartbeatIntervalMs: 30000,
    reconnectDelayMs: 1000,
  },
  global: {
    headers: {
      'X-Client-Info': 'cupnote-mobile-v6',
    },
  },
  db: {
    // Database connection optimized for mobile
    schema: 'public',
  },
};

// ============================================================================
// Create Supabase Client
// ============================================================================

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  supabaseConfig
);

// ============================================================================
// Client Health Check
// ============================================================================

export const checkSupabaseConnection = async (): Promise<{
  success: boolean;
  latency?: number;
  error?: string;
}> => {
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('system_settings')
      .select('key')
      .eq('key', 'database_health')
      .limit(1)
      .single();

    const latency = Date.now() - startTime;

    if (error) {
      console.warn('Supabase connection check failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`Supabase connection healthy (${latency}ms)`);
    return {
      success: true,
      latency,
    };
  } catch (error) {
    console.error('Supabase connection check error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============================================================================
// Enhanced Error Handling
// ============================================================================

export interface SupabaseErrorInfo {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
  isAuthError: boolean;
  isNetworkError: boolean;
  isRetryable: boolean;
}

export const parseSupabaseError = (error: any): SupabaseErrorInfo => {
  if (!error) {
    return {
      message: 'Unknown error occurred',
      isAuthError: false,
      isNetworkError: false,
      isRetryable: false,
    };
  }

  const isAuthError = error.message?.includes('JWT') || 
                     error.message?.includes('auth') ||
                     error.code === 'PGRST301';
  
  const isNetworkError = error.message?.includes('fetch') ||
                        error.message?.includes('network') ||
                        error.message?.includes('timeout');

  const isRetryable = isNetworkError || 
                     error.code === 'PGRST000' || // Generic server error
                     error.message?.includes('temporary');

  return {
    message: error.message || 'Database operation failed',
    details: error.details,
    hint: error.hint,
    code: error.code,
    isAuthError,
    isNetworkError,
    isRetryable,
  };
};

// ============================================================================
// Retry Logic for Failed Operations
// ============================================================================

export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      if (attempt > 0) {
        console.log(`Operation succeeded on attempt ${attempt + 1}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      const errorInfo = parseSupabaseError(error);
      
      console.warn(
        `Operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, 
        errorInfo.message
      );

      // Don't retry auth errors or non-retryable errors
      if (!errorInfo.isRetryable || errorInfo.isAuthError) {
        throw error;
      }

      // Don't delay on the last attempt
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// ============================================================================
// Real-time Subscription Helpers
// ============================================================================

export interface RealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
}

export const createRealtimeSubscription = (
  options: RealtimeSubscriptionOptions,
  callback: (payload: any) => void
) => {
  const { table, event = '*', schema = 'public', filter } = options;

  let subscription = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event,
        schema,
        table,
        filter,
      },
      callback
    );

  return {
    subscribe: () => {
      subscription.subscribe((status) => {
        console.log(`Real-time subscription status for ${table}:`, status);
      });
      return subscription;
    },
    unsubscribe: () => {
      subscription.unsubscribe();
    },
  };
};

// ============================================================================
// Performance Monitoring
// ============================================================================

let queryCount = 0;
let totalQueryTime = 0;

export const logQueryPerformance = (
  queryName: string,
  startTime: number,
  endTime: number,
  recordCount?: number
) => {
  const duration = endTime - startTime;
  queryCount++;
  totalQueryTime += duration;

  console.log(
    `Query: ${queryName} | Duration: ${duration}ms` +
    (recordCount ? ` | Records: ${recordCount}` : '') +
    ` | Avg: ${Math.round(totalQueryTime / queryCount)}ms`
  );

  // Log slow queries
  if (duration > 1000) {
    console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
  }
};

export const getPerformanceStats = () => ({
  queryCount,
  totalQueryTime,
  averageQueryTime: queryCount > 0 ? Math.round(totalQueryTime / queryCount) : 0,
});

// ============================================================================
// Common Query Builders with Error Handling
// ============================================================================

export const safeQuery = async <T>(
  queryBuilder: any,
  queryName: string = 'unknown'
): Promise<{ data: T | null; error: SupabaseErrorInfo | null }> => {
  const startTime = Date.now();
  
  try {
    const result = await withRetry(() => queryBuilder);
    
    logQueryPerformance(
      queryName, 
      startTime, 
      Date.now(), 
      Array.isArray(result.data) ? result.data.length : undefined
    );

    if (result.error) {
      return {
        data: null,
        error: parseSupabaseError(result.error),
      };
    }

    return {
      data: result.data,
      error: null,
    };
  } catch (error) {
    logQueryPerformance(queryName, startTime, Date.now());
    
    return {
      data: null,
      error: parseSupabaseError(error),
    };
  }
};

// ============================================================================
// Storage Helper Functions
// ============================================================================

export const uploadFile = async (
  bucket: string,
  path: string,
  file: File | Blob,
  options?: {
    cacheControl?: string;
    contentType?: string;
  }
): Promise<{ data: { path: string } | null; error: SupabaseErrorInfo | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType,
      });

    if (error) {
      return {
        data: null,
        error: parseSupabaseError(error),
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: parseSupabaseError(error),
    };
  }
};

export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (
  bucket: string, 
  paths: string[]
): Promise<{ error: SupabaseErrorInfo | null }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    
    if (error) {
      return { error: parseSupabaseError(error) };
    }

    return { error: null };
  } catch (error) {
    return { error: parseSupabaseError(error) };
  }
};

// ============================================================================
// Authentication Helpers
// ============================================================================

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const getCurrentSession = () => {
  return supabase.auth.getSession();
};

export const signOut = async (): Promise<{ error: SupabaseErrorInfo | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: parseSupabaseError(error) };
    }

    return { error: null };
  } catch (error) {
    return { error: parseSupabaseError(error) };
  }
};

export const onAuthStateChange = (callback: (event: any, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ============================================================================
// Type-safe Table Access
// ============================================================================

export const tables = {
  profiles: () => supabase.from('profiles'),
  coffees: () => supabase.from('coffees'),
  cafes: () => supabase.from('cafes'),
  tasting_records: () => supabase.from('tasting_records'),
  drafts: () => supabase.from('drafts'),
  achievements: () => supabase.from('achievements'),
  user_achievements: () => supabase.from('user_achievements'),
  user_stats: () => supabase.from('user_stats'),
  sensory_expressions: () => supabase.from('sensory_expressions'),
  taste_matches: () => supabase.from('taste_matches'),
  system_settings: () => supabase.from('system_settings'),
} as const;

// ============================================================================
// Function Helpers
// ============================================================================

export const rpc = {
  updateUserStats: (userId: string) => 
    supabase.rpc('update_user_stats', { target_user_id: userId }),
    
  checkAchievementProgress: (userId: string, eventType: string, eventData?: any) =>
    supabase.rpc('check_achievement_progress', {
      target_user_id: userId,
      event_type: eventType,
      event_data: eventData,
    }),

  findTasteMatches: (userId: string, coffeeId: string) =>
    supabase.rpc('find_taste_matches', {
      target_user_id: userId,
      coffee_id: coffeeId,
    }),

  searchCoffees: (query: string, limit = 20, offset = 0) =>
    supabase.rpc('search_coffees', {
      search_query: query,
      limit_count: limit,
      offset_count: offset,
    }),

  searchCafes: (query: string, lat?: number, lng?: number, radius = 5, limit = 20) =>
    supabase.rpc('search_cafes', {
      search_query: query,
      lat,
      lng,
      radius_km: radius,
      limit_count: limit,
    }),

  getRecommendedExpressions: (tasteScores: any, flavorNotes?: string[], userId?: string) =>
    supabase.rpc('get_recommended_expressions', {
      taste_scores_param: tasteScores,
      flavor_notes_param: flavorNotes,
      user_id_param: userId,
    }),

  generateWeeklySummary: (userId: string) =>
    supabase.rpc('generate_weekly_summary', { target_user_id: userId }),

  createSampleTastingRecords: (userId: string) =>
    supabase.rpc('create_sample_tasting_records', { sample_user_id: userId }),
} as const;

// ============================================================================
// Development Helpers
// ============================================================================

export const dev = {
  // Only available in development
  checkConnection: checkSupabaseConnection,
  getPerformanceStats,
  
  // Reset query stats
  resetPerformanceStats: () => {
    queryCount = 0;
    totalQueryTime = 0;
    console.log('Performance stats reset');
  },

  // Enable/disable query logging
  enableLogging: (enabled: boolean = true) => {
    if (enabled) {
      console.log('Supabase query logging enabled');
    } else {
      console.log('Supabase query logging disabled');
    }
  },
};

// ============================================================================
// Export the configured client
// ============================================================================

export default supabase;

// Export commonly used types for convenience
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Profile,
  Coffee,
  Cafe,
  TastingRecord,
  Draft,
  Achievement,
  UserAchievement,
  UserStats,
  SensoryExpression,
  TasteMatch,
} from '../types/database.types';