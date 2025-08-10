/**
 * Environment Configuration
 * Hardcoded for now until we set up proper env variable loading
 */

export const ENV = {
  EXPO_PUBLIC_SUPABASE_URL: 'https://jflohrifzegmuaukfvyh.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbG9ocmlmemVnbXVhdWtmdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjcxNTYsImV4cCI6MjA3MDI0MzE1Nn0.KF5oriksR25BxrqWdbAIXaOwKAry63A_N1-yNatpdYA',
  
  // App Configuration
  APP_ENV: 'development',
  APP_VERSION: '6.0.0',
  APP_BUILD_NUMBER: '1',
  DEBUG_MODE: 'true',
  
  // Feature Flags
  FEATURE_REAL_TIME_SYNC_ENABLED: 'true',
  FEATURE_OFFLINE_MODE_ENABLED: 'true',
  FEATURE_ACHIEVEMENTS_ENABLED: 'true',
  FEATURE_COMMUNITY_MATCH_ENABLED: 'true',
  FEATURE_DEBUG_MODE_ENABLED: 'true',
  
  // Performance Settings
  CACHE_TTL_SECONDS: '3600',
  MAX_CACHE_SIZE_MB: '50',
  ENABLE_PERSISTENT_CACHE: 'true',
  DEFAULT_PAGE_SIZE: '20',
  MAX_PAGE_SIZE: '100',
  
  // Security Settings
  SESSION_TIMEOUT_HOURS: '24',
  REFRESH_TOKEN_THRESHOLD_MINUTES: '5',
  API_RATE_LIMIT_PER_MINUTE: '60',
};

// Helper to get env value with fallback
export const getEnv = (key: keyof typeof ENV): string => {
  // Try to get from process.env first (for when proper env loading is set up)
  const processValue = (process.env as any)[key];
  if (processValue && processValue !== 'your-supabase-url-here' && processValue !== 'your-supabase-anon-key-here') {
    return processValue;
  }
  
  // Fall back to hardcoded values
  return ENV[key] || '';
};