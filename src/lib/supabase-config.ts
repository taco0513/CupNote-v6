/**
 * CupNote v6 Supabase Configuration Manager
 * Centralized configuration management with environment-based settings
 */

import { SupabaseClientOptions } from '@supabase/supabase-js';
import { getEnv } from '../config/env';

// Environment validation
const validateRequiredEnvVars = () => {
  const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !getEnv(key as any) || getEnv(key as any) === 'your-supabase-url-here' || getEnv(key as any) === 'your-supabase-anon-key-here');
  
  if (missing.length > 0) {
    console.warn(
      '⚠️  Missing Supabase configuration:',
      missing.join(', '),
      '\nPlease update your .env.local file with actual values.'
    );
  }
  
  return missing.length === 0;
};

// Configuration interface
export interface CupNoteSupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
  clientOptions: SupabaseClientOptions<'public'>;
  features: {
    realTime: boolean;
    offlineMode: boolean;
    achievements: boolean;
    communityMatch: boolean;
    debugMode: boolean;
  };
  performance: {
    cacheTTL: number;
    maxCacheSize: number;
    persistentCache: boolean;
    pageSize: number;
    maxPageSize: number;
  };
  security: {
    sessionTimeout: number;
    refreshThreshold: number;
    rateLimit: number;
  };
}

// Default configuration
const getDefaultConfig = (): Partial<CupNoteSupabaseConfig> => ({
  clientOptions: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      debug: getEnv('DEBUG_MODE') === 'true',
    },
    global: {
      headers: {
        'x-application-name': 'CupNote v6',
        'x-application-version': getEnv('APP_VERSION') || '6.0.0',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 2, // Rate limit for real-time events
      },
    },
  },
  features: {
    realTime: getEnv('FEATURE_REAL_TIME_SYNC_ENABLED') === 'true',
    offlineMode: getEnv('FEATURE_OFFLINE_MODE_ENABLED') === 'true',
    achievements: getEnv('FEATURE_ACHIEVEMENTS_ENABLED') === 'true',
    communityMatch: getEnv('FEATURE_COMMUNITY_MATCH_ENABLED') === 'true',
    debugMode: getEnv('FEATURE_DEBUG_MODE_ENABLED') === 'true',
  },
  performance: {
    cacheTTL: parseInt(getEnv('CACHE_TTL_SECONDS') || '3600', 10),
    maxCacheSize: parseInt(getEnv('MAX_CACHE_SIZE_MB') || '50', 10),
    persistentCache: getEnv('ENABLE_PERSISTENT_CACHE') === 'true',
    pageSize: parseInt(getEnv('DEFAULT_PAGE_SIZE') || '20', 10),
    maxPageSize: parseInt(getEnv('MAX_PAGE_SIZE') || '100', 10),
  },
  security: {
    sessionTimeout: parseInt(getEnv('SESSION_TIMEOUT_HOURS') || '24', 10) * 60 * 60 * 1000,
    refreshThreshold: parseInt(getEnv('REFRESH_TOKEN_THRESHOLD_MINUTES') || '5', 10) * 60 * 1000,
    rateLimit: parseInt(getEnv('API_RATE_LIMIT_PER_MINUTE') || '60', 10),
  },
});

// Create configuration
export const createSupabaseConfig = (): CupNoteSupabaseConfig => {
  const isValidated = validateRequiredEnvVars();
  const defaultConfig = getDefaultConfig();
  
  const config: CupNoteSupabaseConfig = {
    url: getEnv('EXPO_PUBLIC_SUPABASE_URL') || 'https://localhost:54321',
    anonKey: getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY') || 'dummy-key',
    serviceKey: undefined, // Don't use service key in client
    ...defaultConfig,
  } as CupNoteSupabaseConfig;

  // Environment-specific overrides
  if (getEnv('APP_ENV') === 'development') {
    config.clientOptions.auth!.debug = true;
    config.performance.cacheTTL = 1800; // 30 minutes for dev
    config.security.sessionTimeout = 72 * 60 * 60 * 1000; // 72 hours for dev
  }

  if (getEnv('APP_ENV') === 'production') {
    config.features.debugMode = false;
    config.clientOptions.auth!.debug = false;
    config.performance.cacheTTL = 7200; // 2 hours for prod
  }

  return config;
};

// Export the config instance
export const supabaseConfig = createSupabaseConfig();

// Configuration utilities
export const configUtils = {
  // Check if a feature is enabled
  isFeatureEnabled: (feature: keyof CupNoteSupabaseConfig['features']): boolean => {
    return supabaseConfig.features[feature];
  },

  // Get performance setting
  getPerformanceSetting: <K extends keyof CupNoteSupabaseConfig['performance']>(
    key: K
  ): CupNoteSupabaseConfig['performance'][K] => {
    return supabaseConfig.performance[key];
  },

  // Get security setting
  getSecuritySetting: <K extends keyof CupNoteSupabaseConfig['security']>(
    key: K
  ): CupNoteSupabaseConfig['security'][K] => {
    return supabaseConfig.security[key];
  },

  // Dynamic configuration updates (for runtime feature toggles)
  updateFeature: (feature: keyof CupNoteSupabaseConfig['features'], enabled: boolean) => {
    supabaseConfig.features[feature] = enabled;
    console.log(`Feature ${feature} ${enabled ? 'enabled' : 'disabled'}`);
  },

  // Validate configuration
  validateConfig: (): boolean => {
    const issues: string[] = [];

    // Check URL format
    if (!supabaseConfig.url.startsWith('https://') && !supabaseConfig.url.startsWith('http://localhost')) {
      issues.push('Invalid Supabase URL format');
    }

    // Check key format (Supabase keys are typically JWT-like)
    if (!supabaseConfig.anonKey.startsWith('eyJ') && supabaseConfig.anonKey !== 'dummy-key') {
      issues.push('Invalid anon key format');
    }

    // Check performance settings
    if (supabaseConfig.performance.pageSize > supabaseConfig.performance.maxPageSize) {
      issues.push('Default page size exceeds maximum page size');
    }

    if (issues.length > 0) {
      console.error('Configuration validation failed:', issues);
      return false;
    }

    return true;
  },

  // Get environment info
  getEnvironmentInfo: () => ({
    environment: getEnv('APP_ENV') || 'development',
    version: getEnv('APP_VERSION') || '6.0.0',
    buildNumber: getEnv('APP_BUILD_NUMBER') || '1',
    debugMode: supabaseConfig.features.debugMode,
    url: supabaseConfig.url,
    features: supabaseConfig.features,
  }),

  // Rate limiting helper
  checkRateLimit: (() => {
    const requests = new Map<string, number[]>();
    
    return (key: string = 'default'): boolean => {
      const now = Date.now();
      const windowStart = now - 60000; // 1 minute window
      
      if (!requests.has(key)) {
        requests.set(key, []);
      }
      
      const userRequests = requests.get(key)!;
      // Remove old requests
      requests.set(key, userRequests.filter(time => time > windowStart));
      
      const currentCount = userRequests.length;
      if (currentCount >= supabaseConfig.security.rateLimit) {
        console.warn(`Rate limit exceeded for ${key}: ${currentCount}/${supabaseConfig.security.rateLimit}`);
        return false;
      }
      
      userRequests.push(now);
      return true;
    };
  })(),
};

// Development helpers
if (getEnv('APP_ENV') === 'development' && supabaseConfig.features.debugMode) {
  // Log configuration on startup
  console.log('🔧 Supabase Configuration:', {
    url: supabaseConfig.url,
    features: supabaseConfig.features,
    performance: supabaseConfig.performance,
    valid: configUtils.validateConfig(),
  });

  // Make config available globally for debugging
  (global as any).__CUPNOTE_CONFIG__ = supabaseConfig;
}

// Export types for use in other files
export type { CupNoteSupabaseConfig };
export default supabaseConfig;