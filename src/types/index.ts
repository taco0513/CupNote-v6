// Core User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Coffee Types
export interface Coffee {
  id: string;
  name: string;
  roastery?: string;
  origin?: string;
  process?: 'washed' | 'natural' | 'honey' | 'other';
  variety?: string;
  altitude?: string;
  roastDate?: Date;
  roastLevel?: 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
  harvestDate?: string;
  price?: number;
  notes?: string;
}

// Record Types
export type RecordMode = 'cafe' | 'homecafe';
export type RecordStatus = 'draft' | 'completed';

export interface TastingRecord {
  id: string;
  userId: string;
  mode: RecordMode;
  status: RecordStatus;

  // Coffee Info
  coffee: Coffee;

  // Cafe Mode specific
  cafe?: {
    name: string;
    address?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    visitDate: Date;
    visitTime?: string;
    accompaniedBy?: 'alone' | 'friends' | 'family' | 'date' | 'business';
    discoveryMethod?: 'recommendation' | 'search' | 'passing-by' | 'social-media';
    gpsDetected?: boolean;
  };

  // HomeCafe Mode specific
  brew?: {
    method: 'v60' | 'chemex' | 'french-press' | 'aeropress' | 'espresso' | 'cold-brew' | 'moka-pot' | 'siphon' | 'other';
    equipment?: string;
    grindSize: 'extra-fine' | 'fine' | 'medium-fine' | 'medium' | 'medium-coarse' | 'coarse' | 'extra-coarse';
    waterType?: 'tap' | 'bottled' | 'filtered' | 'distilled' | 'other';
    waterTemperature: number; // Celsius
    waterAmount: number; // ml
    coffeeAmount: number; // grams
    ratio: number; // calculated water:coffee ratio
    brewTime?: number; // seconds
    recipe?: string;
    brewingNotes?: string;
  };

  // Taste Evaluation (Traditional 5-point scale)
  taste: {
    acidity: number; // 1-5
    sweetness: number; // 1-5
    bitterness: number; // 1-5
    body: number; // 1-5
    balance: number; // 1-5
    cleanness: number; // 1-5
    aftertaste: number; // 1-5
  };

  // Flavor Notes (SCA 85 flavors)
  flavors: string[];
  flavorIntensity?: number; // 1-5

  // Sensory Expression (Korean 44 expressions)
  sensoryExpression?: {
    sweetness?: string[];
    acidity?: string[];
    bitterness?: string[];
    body?: string[];
    flavor?: string[];
    aftertaste?: string[];
    overall?: string[];
    customExpression?: string;
  };

  // Personal Notes
  notes?: string;
  rating: number; // 1-5 stars
  mood?: string;
  context?: string;
  tags?: string[];
  photos?: string[];
  shareWithCommunity: boolean;
  repurchaseIntent?: number; // 1-5

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quantity' | 'quality' | 'variety' | 'social' | 'expertise' | 'special';
  requirement: {
    type: 'count' | 'streak' | 'unique' | 'special' | 'rating' | 'social';
    target: number;
    current?: number;
    criteria?: Record<string, any>;
  };
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

// User Stats & Progress
export interface UserStats {
  // Basic counts
  totalRecords: number;
  weeklyRecords: number;
  monthlyRecords: number;
  yearlyRecords: number;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  weeklyStreak: number;

  // Variety tracking
  uniqueCoffees: number;
  uniqueRoasteries: number;
  uniqueOrigins: number;
  uniqueMethods: number; // HomeCafe brewing methods

  // Favorites
  favoriteRoastery?: string;
  favoriteOrigin?: string;
  favoriteMethod?: string;
  averageRating: number;

  // Gamification
  level: number;
  experience: number;
  nextLevelExp: number;
  totalPoints: number;

  // Achievements
  totalAchievements: number;
  recentAchievements: Achievement[];

  // Community
  communityMatches: number;
  sharedRecords: number;
  helpfulReviews: number;

  // Preferences (calculated)
  preferredTasteProfile: {
    acidity: number;
    sweetness: number;
    bitterness: number;
    body: number;
  };
  preferredFlavors: string[];
  preferredOrigins: string[];

  lastUpdated: Date;
}

// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  TastingFlow: { mode?: RecordMode; draftId?: string };
  RecordDetail: { recordId: string };
  Login: undefined;
  Onboarding: undefined;
  Achievement: { achievementId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Records: undefined;
  Achievements: undefined;
  Profile: undefined;
};

// Database Types (for Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name?: string;
          avatar?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      
      tasting_records: {
        Row: {
          id: string;
          user_id: string;
          mode: RecordMode;
          status: RecordStatus;
          coffee_data: any; // JSON
          cafe_data?: any; // JSON
          brew_data?: any; // JSON
          taste_data: any; // JSON
          flavors: string[];
          flavor_intensity?: number;
          sensory_expression?: any; // JSON
          notes?: string;
          rating: number;
          mood?: string;
          context?: string;
          tags?: string[];
          photos?: string[];
          share_with_community: boolean;
          repurchase_intent?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasting_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasting_records']['Insert']>;
      };

      drafts: {
        Row: {
          id: string;
          user_id: string;
          mode: RecordMode;
          current_step: string;
          data: any; // JSON
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['drafts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['drafts']['Insert']>;
      };

      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          requirement: any; // JSON
          points: number;
          rarity: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };

      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          progress?: any; // JSON
        };
        Insert: Omit<Database['public']['Tables']['user_achievements']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['user_achievements']['Insert']>;
      };

      user_stats: {
        Row: {
          user_id: string;
          stats_data: any; // JSON - UserStats
          last_updated: string;
        };
        Insert: Database['public']['Tables']['user_stats']['Row'];
        Update: Partial<Database['public']['Tables']['user_stats']['Row']>;
      };
    };
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Home Screen Types (referenced in Home.tsx but missing)
export interface HomeStats {
  totalRecords: number;
  monthlyRecords: number;
  averageRating: number;
  uniqueOrigins: number;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}

export interface RecentActivity {
  id: string;
  type: 'record' | 'achievement';
  title: string;
  timestamp: Date;
  icon?: string;
}

// Records Screen Types (referenced in RecordsScreen.tsx)
export interface RecordFilter {
  mode?: RecordMode | 'all';
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  rating?: {
    min: number;
    max: number;
  };
  roastery?: string;
  origin?: string;
  tags?: string[];
}

export interface RecordSort {
  field: 'created_at' | 'updated_at' | 'rating' | 'name';
  order: 'asc' | 'desc';
}

export interface RecordListItem {
  id: string;
  name: string;
  roastery?: string;
  rating: number;
  mode: RecordMode;
  recordedAt: Date;
  thumbnail?: string;
  tags: string[];
}

// Store State Types
export interface RecordState {
  // Records data
  records: TastingRecord[];
  currentRecord: TastingRecord | null;
  totalRecords: number;
  
  // Pagination & Loading
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  isLoadingRecords: boolean;
  isLoadingMore: boolean;
  
  // Search & Filter
  searchQuery: string;
  activeFilters: RecordFilter;
  sortBy: RecordSort['field'];
  sortOrder: RecordSort['order'];
  filterMode: 'all' | RecordMode;
  
  // Drafts
  draftsList: RecordDraft[];
  currentDraft: RecordDraft | null;
  
  // UI State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncAt: Date | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AchievementState {
  allAchievements: Achievement[];
  userAchievements: Achievement[];
  achievementProgress: Record<string, any>;
  stats: UserStats | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  lastSyncAt: Date | null;
  recentUnlocks: Achievement[];
  newUnlocksCount: number;
}

// Draft Types
export interface RecordDraft {
  id: string;
  mode: RecordMode;
  currentStep: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Screen Props Types
export interface ScreenProps {
  navigation: any;
  route?: any;
}

// Re-export TastingFlow types
export * from './tastingFlow';