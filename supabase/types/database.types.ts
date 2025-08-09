/**
 * CupNote v6 Database Types
 * Generated from Supabase Database Schema
 * Fully compatible with Foundation Team's type definitions
 */

export interface Database {
  public: {
    Tables: {
      // ============================================================================
      // User Profile & Authentication
      // ============================================================================
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          experience_level: 'beginner' | 'intermediate' | 'expert';
          coffee_journey_start_date: string | null;
          preferred_units: Json;
          share_profile_public: boolean;
          allow_match_requests: boolean;
          notification_settings: Json;
          onboarding_completed: boolean;
          onboarding_step: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          experience_level?: 'beginner' | 'intermediate' | 'expert';
          coffee_journey_start_date?: string | null;
          preferred_units?: Json;
          share_profile_public?: boolean;
          allow_match_requests?: boolean;
          notification_settings?: Json;
          onboarding_completed?: boolean;
          onboarding_step?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          experience_level?: 'beginner' | 'intermediate' | 'expert';
          coffee_journey_start_date?: string | null;
          preferred_units?: Json;
          share_profile_public?: boolean;
          allow_match_requests?: boolean;
          notification_settings?: Json;
          onboarding_completed?: boolean;
          onboarding_step?: string;
        };
      };

      // ============================================================================
      // Coffee Master Data
      // ============================================================================
      coffees: {
        Row: {
          id: string;
          name: string;
          roastery: string | null;
          roastery_location: string | null;
          origin_country: string | null;
          origin_region: string | null;
          origin_farm: string | null;
          altitude_meters: number | null;
          variety: string[] | null;
          process_method: 'washed' | 'natural' | 'honey' | 'anaerobic' | 'carbonic_maceration' | 'other' | null;
          fermentation_time_hours: number | null;
          drying_method: string | null;
          roast_level: number | null;
          roast_date: string | null;
          roast_notes: string | null;
          price_krw: number | null;
          weight_grams: number | null;
          package_type: string | null;
          purchase_link: string | null;
          is_verified: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          roastery?: string | null;
          roastery_location?: string | null;
          origin_country?: string | null;
          origin_region?: string | null;
          origin_farm?: string | null;
          altitude_meters?: number | null;
          variety?: string[] | null;
          process_method?: 'washed' | 'natural' | 'honey' | 'anaerobic' | 'carbonic_maceration' | 'other' | null;
          fermentation_time_hours?: number | null;
          drying_method?: string | null;
          roast_level?: number | null;
          roast_date?: string | null;
          roast_notes?: string | null;
          price_krw?: number | null;
          weight_grams?: number | null;
          package_type?: string | null;
          purchase_link?: string | null;
          is_verified?: boolean;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          roastery?: string | null;
          roastery_location?: string | null;
          origin_country?: string | null;
          origin_region?: string | null;
          origin_farm?: string | null;
          altitude_meters?: number | null;
          variety?: string[] | null;
          process_method?: 'washed' | 'natural' | 'honey' | 'anaerobic' | 'carbonic_maceration' | 'other' | null;
          fermentation_time_hours?: number | null;
          drying_method?: string | null;
          roast_level?: number | null;
          roast_date?: string | null;
          roast_notes?: string | null;
          price_krw?: number | null;
          weight_grams?: number | null;
          package_type?: string | null;
          purchase_link?: string | null;
          is_verified?: boolean;
          created_by?: string | null;
        };
      };

      // ============================================================================
      // Cafe Master Data
      // ============================================================================
      cafes: {
        Row: {
          id: string;
          name: string;
          name_english: string | null;
          address: string;
          address_detail: string | null;
          latitude: number | null;
          longitude: number | null;
          district: string | null;
          neighborhood: string | null;
          phone: string | null;
          website: string | null;
          instagram: string | null;
          operating_hours: Json | null;
          wifi_available: boolean;
          parking_available: boolean;
          pet_friendly: boolean;
          group_friendly: boolean;
          study_friendly: boolean;
          price_range: number | null;
          specialty_coffee: boolean;
          roasting_onsite: boolean;
          average_atmosphere: number;
          average_service: number;
          total_visits: number;
          is_verified: boolean;
          verification_source: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_english?: string | null;
          address: string;
          address_detail?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          district?: string | null;
          neighborhood?: string | null;
          phone?: string | null;
          website?: string | null;
          instagram?: string | null;
          operating_hours?: Json | null;
          wifi_available?: boolean;
          parking_available?: boolean;
          pet_friendly?: boolean;
          group_friendly?: boolean;
          study_friendly?: boolean;
          price_range?: number | null;
          specialty_coffee?: boolean;
          roasting_onsite?: boolean;
          average_atmosphere?: number;
          average_service?: number;
          total_visits?: number;
          is_verified?: boolean;
          verification_source?: string | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          name_english?: string | null;
          address?: string;
          address_detail?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          district?: string | null;
          neighborhood?: string | null;
          phone?: string | null;
          website?: string | null;
          instagram?: string | null;
          operating_hours?: Json | null;
          wifi_available?: boolean;
          parking_available?: boolean;
          pet_friendly?: boolean;
          group_friendly?: boolean;
          study_friendly?: boolean;
          price_range?: number | null;
          specialty_coffee?: boolean;
          roasting_onsite?: boolean;
          average_atmosphere?: number;
          average_service?: number;
          total_visits?: number;
          is_verified?: boolean;
          verification_source?: string | null;
          created_by?: string | null;
        };
      };

      // ============================================================================
      // Tasting Records (Core Table)
      // ============================================================================
      tasting_records: {
        Row: {
          id: string;
          user_id: string;
          mode: 'cafe' | 'homecafe';
          status: 'draft' | 'in_progress' | 'completed';
          coffee_id: string | null;
          coffee_data: Json | null;
          cafe_id: string | null;
          cafe_data: Json | null;
          brew_data: Json | null;
          taste_scores: Json;
          flavor_notes: string[];
          flavor_intensity: number | null;
          sensory_expressions: Json;
          overall_rating: number;
          personal_notes: string | null;
          mood: string | null;
          context: string | null;
          tags: string[];
          photos: string[];
          share_with_community: boolean;
          is_public: boolean;
          community_tags: string[];
          repurchase_intent: number | null;
          taste_vector: number[] | null;
          recorded_at: string;
          draft_saved_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: 'cafe' | 'homecafe';
          status?: 'draft' | 'in_progress' | 'completed';
          coffee_id?: string | null;
          coffee_data?: Json | null;
          cafe_id?: string | null;
          cafe_data?: Json | null;
          brew_data?: Json | null;
          taste_scores: Json;
          flavor_notes?: string[];
          flavor_intensity?: number | null;
          sensory_expressions?: Json;
          overall_rating: number;
          personal_notes?: string | null;
          mood?: string | null;
          context?: string | null;
          tags?: string[];
          photos?: string[];
          share_with_community?: boolean;
          is_public?: boolean;
          community_tags?: string[];
          repurchase_intent?: number | null;
          taste_vector?: number[] | null;
          recorded_at?: string;
          draft_saved_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          mode?: 'cafe' | 'homecafe';
          status?: 'draft' | 'in_progress' | 'completed';
          coffee_id?: string | null;
          coffee_data?: Json | null;
          cafe_id?: string | null;
          cafe_data?: Json | null;
          brew_data?: Json | null;
          taste_scores?: Json;
          flavor_notes?: string[];
          flavor_intensity?: number | null;
          sensory_expressions?: Json;
          overall_rating?: number;
          personal_notes?: string | null;
          mood?: string | null;
          context?: string | null;
          tags?: string[];
          photos?: string[];
          share_with_community?: boolean;
          is_public?: boolean;
          community_tags?: string[];
          repurchase_intent?: number | null;
          taste_vector?: number[] | null;
          recorded_at?: string;
          draft_saved_at?: string | null;
          completed_at?: string | null;
        };
      };

      // ============================================================================
      // Draft Management
      // ============================================================================
      drafts: {
        Row: {
          id: string;
          user_id: string;
          mode: 'cafe' | 'homecafe';
          current_step: string;
          step_data: Json;
          progress_percentage: number;
          expires_at: string;
          is_expired: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: 'cafe' | 'homecafe';
          current_step: string;
          step_data?: Json;
          progress_percentage?: number;
          expires_at?: string;
          is_expired?: boolean;
        };
        Update: {
          mode?: 'cafe' | 'homecafe';
          current_step?: string;
          step_data?: Json;
          progress_percentage?: number;
          expires_at?: string;
          is_expired?: boolean;
        };
      };

      // ============================================================================
      // Achievement System
      // ============================================================================
      achievements: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          description: string;
          description_en: string | null;
          icon_emoji: string;
          icon_url: string | null;
          category: 'quantity' | 'quality' | 'variety' | 'social' | 'expertise' | 'special';
          subcategory: string | null;
          requirement: Json;
          points: number;
          badge_color: string;
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          is_active: boolean;
          is_hidden: boolean;
          sort_order: number;
          prerequisite_achievement_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          description: string;
          description_en?: string | null;
          icon_emoji: string;
          icon_url?: string | null;
          category: 'quantity' | 'quality' | 'variety' | 'social' | 'expertise' | 'special';
          subcategory?: string | null;
          requirement: Json;
          points?: number;
          badge_color?: string;
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          is_active?: boolean;
          is_hidden?: boolean;
          sort_order?: number;
          prerequisite_achievement_ids?: string[];
        };
        Update: {
          name?: string;
          name_en?: string | null;
          description?: string;
          description_en?: string | null;
          icon_emoji?: string;
          icon_url?: string | null;
          category?: 'quantity' | 'quality' | 'variety' | 'social' | 'expertise' | 'special';
          subcategory?: string | null;
          requirement?: Json;
          points?: number;
          badge_color?: string;
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          is_active?: boolean;
          is_hidden?: boolean;
          sort_order?: number;
          prerequisite_achievement_ids?: string[];
        };
      };

      // ============================================================================
      // User Achievement Progress
      // ============================================================================
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          current_progress: number;
          target_progress: number;
          progress_data: Json;
          is_completed: boolean;
          completed_at: string | null;
          is_notified: boolean;
          notified_at: string | null;
          first_progress_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          current_progress?: number;
          target_progress: number;
          progress_data?: Json;
          is_completed?: boolean;
          completed_at?: string | null;
          is_notified?: boolean;
          notified_at?: string | null;
          first_progress_at?: string;
        };
        Update: {
          current_progress?: number;
          target_progress?: number;
          progress_data?: Json;
          is_completed?: boolean;
          completed_at?: string | null;
          is_notified?: boolean;
          notified_at?: string | null;
          first_progress_at?: string;
        };
      };

      // ============================================================================
      // User Statistics
      // ============================================================================
      user_stats: {
        Row: {
          user_id: string;
          total_records: number;
          cafe_records: number;
          homecafe_records: number;
          daily_records: number;
          weekly_records: number;
          monthly_records: number;
          yearly_records: number;
          current_streak: number;
          longest_streak: number;
          weekly_streak: number;
          last_record_date: string | null;
          unique_coffees: number;
          unique_roasteries: number;
          unique_origins: number;
          unique_cafes: number;
          unique_brew_methods: number;
          favorite_roastery: string | null;
          favorite_origin: string | null;
          favorite_brew_method: string | null;
          average_rating: number;
          taste_profile: Json;
          preferred_flavors: string[];
          preferred_origins: string[];
          level: number;
          experience_points: number;
          next_level_exp: number;
          total_achievement_points: number;
          community_matches: number;
          shared_records: number;
          helpful_reviews: number;
          morning_records: number;
          evening_records: number;
          perfect_ratings: number;
          detailed_notes_count: number;
          photos_shared: number;
          stats_version: number;
          last_calculated_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_records?: number;
          cafe_records?: number;
          homecafe_records?: number;
          daily_records?: number;
          weekly_records?: number;
          monthly_records?: number;
          yearly_records?: number;
          current_streak?: number;
          longest_streak?: number;
          weekly_streak?: number;
          last_record_date?: string | null;
          unique_coffees?: number;
          unique_roasteries?: number;
          unique_origins?: number;
          unique_cafes?: number;
          unique_brew_methods?: number;
          favorite_roastery?: string | null;
          favorite_origin?: string | null;
          favorite_brew_method?: string | null;
          average_rating?: number;
          taste_profile?: Json;
          preferred_flavors?: string[];
          preferred_origins?: string[];
          level?: number;
          experience_points?: number;
          next_level_exp?: number;
          total_achievement_points?: number;
          community_matches?: number;
          shared_records?: number;
          helpful_reviews?: number;
          morning_records?: number;
          evening_records?: number;
          perfect_ratings?: number;
          detailed_notes_count?: number;
          photos_shared?: number;
          stats_version?: number;
          last_calculated_at?: string;
        };
        Update: {
          total_records?: number;
          cafe_records?: number;
          homecafe_records?: number;
          daily_records?: number;
          weekly_records?: number;
          monthly_records?: number;
          yearly_records?: number;
          current_streak?: number;
          longest_streak?: number;
          weekly_streak?: number;
          last_record_date?: string | null;
          unique_coffees?: number;
          unique_roasteries?: number;
          unique_origins?: number;
          unique_cafes?: number;
          unique_brew_methods?: number;
          favorite_roastery?: string | null;
          favorite_origin?: string | null;
          favorite_brew_method?: string | null;
          average_rating?: number;
          taste_profile?: Json;
          preferred_flavors?: string[];
          preferred_origins?: string[];
          level?: number;
          experience_points?: number;
          next_level_exp?: number;
          total_achievement_points?: number;
          community_matches?: number;
          shared_records?: number;
          helpful_reviews?: number;
          morning_records?: number;
          evening_records?: number;
          perfect_ratings?: number;
          detailed_notes_count?: number;
          photos_shared?: number;
          stats_version?: number;
          last_calculated_at?: string;
        };
      };

      // ============================================================================
      // Korean Sensory Expressions
      // ============================================================================
      sensory_expressions: {
        Row: {
          id: string;
          expression: string;
          expression_en: string | null;
          category: 'sweetness' | 'acidity' | 'bitterness' | 'body' | 'flavor' | 'aftertaste' | 'overall';
          description: string | null;
          description_en: string | null;
          usage_count: number;
          intensity_level: number | null;
          is_positive: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          expression: string;
          expression_en?: string | null;
          category: 'sweetness' | 'acidity' | 'bitterness' | 'body' | 'flavor' | 'aftertaste' | 'overall';
          description?: string | null;
          description_en?: string | null;
          usage_count?: number;
          intensity_level?: number | null;
          is_positive?: boolean;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          expression?: string;
          expression_en?: string | null;
          category?: 'sweetness' | 'acidity' | 'bitterness' | 'body' | 'flavor' | 'aftertaste' | 'overall';
          description?: string | null;
          description_en?: string | null;
          usage_count?: number;
          intensity_level?: number | null;
          is_positive?: boolean;
          sort_order?: number;
          is_active?: boolean;
        };
      };

      // ============================================================================
      // Community Taste Matches
      // ============================================================================
      taste_matches: {
        Row: {
          id: string;
          user_id: string;
          target_user_id: string;
          coffee_id: string | null;
          match_type: 'same_coffee' | 'taste_similarity' | 'preference_match';
          similarity_score: number | null;
          taste_correlation: number | null;
          preference_overlap: number | null;
          matching_aspects: Json | null;
          differences: Json | null;
          is_mutual: boolean;
          status: 'pending' | 'accepted' | 'declined' | 'expired';
          calculated_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_user_id: string;
          coffee_id?: string | null;
          match_type: 'same_coffee' | 'taste_similarity' | 'preference_match';
          similarity_score?: number | null;
          taste_correlation?: number | null;
          preference_overlap?: number | null;
          matching_aspects?: Json | null;
          differences?: Json | null;
          is_mutual?: boolean;
          status?: 'pending' | 'accepted' | 'declined' | 'expired';
          calculated_at?: string;
          expires_at?: string;
        };
        Update: {
          coffee_id?: string | null;
          match_type?: 'same_coffee' | 'taste_similarity' | 'preference_match';
          similarity_score?: number | null;
          taste_correlation?: number | null;
          preference_overlap?: number | null;
          matching_aspects?: Json | null;
          differences?: Json | null;
          is_mutual?: boolean;
          status?: 'pending' | 'accepted' | 'declined' | 'expired';
          calculated_at?: string;
          expires_at?: string;
        };
      };

      // ============================================================================
      // System Settings
      // ============================================================================
      system_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          category: string;
          is_public: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          category?: string;
          is_public?: boolean;
          updated_by?: string | null;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          category?: string;
          is_public?: boolean;
          updated_by?: string | null;
        };
      };

      // ============================================================================
      // Security Logs
      // ============================================================================
      security_logs: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          event_details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          event_details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          user_id?: string | null;
          event_type?: string;
          event_details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
    };

    // ============================================================================
    // Views
    // ============================================================================
    Views: {
      public_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          experience_level: 'beginner' | 'intermediate' | 'expert';
          coffee_journey_start_date: string | null;
          onboarding_completed: boolean;
          created_at: string;
        };
      };
      
      public_tasting_records: {
        Row: {
          id: string;
          user_id: string;
          mode: 'cafe' | 'homecafe';
          coffee_data: Json | null;
          cafe_data: Json | null;
          brew_data: Json | null;
          taste_scores: Json;
          flavor_notes: string[];
          flavor_intensity: number | null;
          sensory_expressions: Json;
          overall_rating: number;
          tags: string[];
          community_tags: string[];
          recorded_at: string;
          created_at: string;
        };
      };
      
      leaderboard: {
        Row: {
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          level: number;
          total_records: number;
          current_streak: number;
          total_achievement_points: number;
          average_rating: number;
          rank: number;
        };
      };

      sample_data_summary: {
        Row: {
          data_type: string;
          total_count: number;
          verified_count: number;
          unique_roasteries: number;
          unique_origins: number;
          roasteries: string;
        };
      };
    };

    // ============================================================================
    // Functions
    // ============================================================================
    Functions: {
      // User Management
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };

      // Statistics
      update_user_stats: {
        Args: { target_user_id: string };
        Returns: undefined;
      };

      // Achievements
      check_achievement_progress: {
        Args: { 
          target_user_id: string; 
          event_type: string;
          event_data?: Json;
        };
        Returns: undefined;
      };

      initialize_user_achievements: {
        Args: { target_user_id: string };
        Returns: undefined;
      };

      // Community Features
      find_taste_matches: {
        Args: { target_user_id: string; coffee_id: string };
        Returns: undefined;
      };

      calculate_taste_similarity: {
        Args: { user1_profile: Json; user2_profile: Json };
        Returns: number;
      };

      // Search Functions
      search_coffees: {
        Args: { 
          search_query: string; 
          limit_count?: number; 
          offset_count?: number;
        };
        Returns: {
          id: string;
          name: string;
          roastery: string | null;
          origin_country: string | null;
          origin_region: string | null;
          roast_level: number | null;
          similarity: number;
        }[];
      };

      search_cafes: {
        Args: {
          search_query: string;
          lat?: number;
          lng?: number;
          radius_km?: number;
          limit_count?: number;
        };
        Returns: {
          id: string;
          name: string;
          address: string;
          district: string | null;
          latitude: number | null;
          longitude: number | null;
          distance_km: number | null;
          similarity: number;
        }[];
      };

      // Sensory Expressions
      get_recommended_expressions: {
        Args: {
          taste_scores_param: Json;
          flavor_notes_param?: string[];
          user_id_param?: string;
          limit_count?: number;
        };
        Returns: {
          category: string;
          expression: string;
          description: string;
          confidence_score: number;
        }[];
      };

      increment_expression_usage: {
        Args: { expression_text: string };
        Returns: undefined;
      };

      // Analytics & Reports
      generate_weekly_summary: {
        Args: { target_user_id: string };
        Returns: Json;
      };

      // Maintenance
      cleanup_expired_drafts: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };

      recalculate_all_user_stats: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };

      // Sample Data
      create_sample_tasting_records: {
        Args: { sample_user_id: string };
        Returns: number;
      };

      // Security & Monitoring
      log_security_event: {
        Args: { event_type: string; event_details?: Json };
        Returns: undefined;
      };

      analyze_query_performance: {
        Args: Record<PropertyKey, never>;
        Returns: {
          query_type: string;
          avg_duration: string;
          call_count: number;
          total_duration: string;
        }[];
      };

      // Performance Analysis
      identify_unused_indexes: {
        Args: Record<PropertyKey, never>;
        Returns: {
          schemaname: string;
          tablename: string;
          indexname: string;
          index_size: string;
          scan_count: number;
        }[];
      };

      recommend_index_maintenance: {
        Args: Record<PropertyKey, never>;
        Returns: {
          table_name: string;
          recommendation: string;
          priority: string;
          details: string;
        }[];
      };

      // RLS & Security Testing
      check_user_permission: {
        Args: { target_user_id: string; permission_type: string };
        Returns: boolean;
      };

      check_record_access: {
        Args: { record_id: string; access_type: string };
        Returns: boolean;
      };

      test_rls_policies: {
        Args: Record<PropertyKey, never>;
        Returns: {
          table_name: string;
          policy_name: string;
          policy_type: string;
          test_result: string;
        }[];
      };
    };

    // ============================================================================
    // Enums
    // ============================================================================
    Enums: {
      experience_level: 'beginner' | 'intermediate' | 'expert';
      record_mode: 'cafe' | 'homecafe';
      record_status: 'draft' | 'in_progress' | 'completed';
      process_method: 'washed' | 'natural' | 'honey' | 'anaerobic' | 'carbonic_maceration' | 'other';
      achievement_category: 'quantity' | 'quality' | 'variety' | 'social' | 'expertise' | 'special';
      achievement_rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
      sensory_category: 'sweetness' | 'acidity' | 'bitterness' | 'body' | 'flavor' | 'aftertaste' | 'overall';
      match_type: 'same_coffee' | 'taste_similarity' | 'preference_match';
      match_status: 'pending' | 'accepted' | 'declined' | 'expired';
    };
  };
}

// ============================================================================
// Additional Type Definitions (Foundation Team Compatibility)
// ============================================================================

export type Json = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Utility types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific type aliases for common usage
export type Profile = Tables<'profiles'>;
export type Coffee = Tables<'coffees'>;
export type Cafe = Tables<'cafes'>;
export type TastingRecord = Tables<'tasting_records'>;
export type Draft = Tables<'drafts'>;
export type Achievement = Tables<'achievements'>;
export type UserAchievement = Tables<'user_achievements'>;
export type UserStats = Tables<'user_stats'>;
export type SensoryExpression = Tables<'sensory_expressions'>;
export type TasteMatch = Tables<'taste_matches'>;

// Insert types
export type ProfileInsert = TablesInsert<'profiles'>;
export type CoffeeInsert = TablesInsert<'coffees'>;
export type CafeInsert = TablesInsert<'cafes'>;
export type TastingRecordInsert = TablesInsert<'tasting_records'>;
export type DraftInsert = TablesInsert<'drafts'>;

// Update types
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type TastingRecordUpdate = TablesUpdate<'tasting_records'>;
export type DraftUpdate = TablesUpdate<'drafts'>;

// Business Logic Types (matching Foundation Team's types)
export type RecordMode = Database['public']['Enums']['record_mode'];
export type RecordStatus = Database['public']['Enums']['record_status'];
export type ExperienceLevel = Database['public']['Enums']['experience_level'];
export type ProcessMethod = Database['public']['Enums']['process_method'];
export type AchievementCategory = Database['public']['Enums']['achievement_category'];
export type AchievementRarity = Database['public']['Enums']['achievement_rarity'];

// Taste Profile Structure
export interface TasteProfile {
  acidity: number;
  sweetness: number;
  bitterness: number;
  body: number;
  balance: number;
  cleanness: number;
  aftertaste: number;
}

// Korean Sensory Expression Structure  
export interface KoreanSensoryExpressions {
  sweetness?: string[];
  acidity?: string[];
  bitterness?: string[];
  body?: string[];
  flavor?: string[];
  aftertaste?: string[];
  overall?: string[];
  custom?: string;
}

// Brew Data Structure (HomeCafe Mode)
export interface BrewData {
  method: 'v60' | 'chemex' | 'french-press' | 'aeropress' | 'espresso' | 'cold-brew' | 'moka-pot' | 'siphon' | 'other';
  equipment?: string;
  grind_size: 'extra-fine' | 'fine' | 'medium-fine' | 'medium' | 'medium-coarse' | 'coarse' | 'extra-coarse';
  water_temperature: number;
  water_amount: number;
  coffee_amount: number;
  brew_time?: number;
  recipe?: string;
  brewing_notes?: string;
}

// Cafe Data Structure (Cafe Mode)
export interface CafeData {
  visit_time?: string;
  atmosphere_rating?: number;
  service_rating?: number;
  accompaniedBy?: 'alone' | 'friends' | 'family' | 'date' | 'business';
  discoveryMethod?: 'recommendation' | 'search' | 'passing-by' | 'social-media';
  gpsDetected?: boolean;
}

// Operating Hours Structure
export interface OperatingHours {
  [key: string]: {
    open?: string;
    close?: string;
    closed: boolean;
  };
}

// Notification Settings
export interface NotificationSettings {
  achievements: boolean;
  community_matches: boolean;
  weekly_summary: boolean;
  new_features: boolean;
}

// User Preferences
export interface UserPreferences {
  temperature: 'celsius' | 'fahrenheit';
  weight: 'grams' | 'ounces';
  volume: 'ml' | 'fl_oz';
}

// Achievement Requirement Structure
export interface AchievementRequirement {
  type: 'count' | 'streak' | 'unique' | 'special' | 'rating' | 'social';
  target: number;
  criteria?: string;
  [key: string]: any;
}

// Search Result Types
export interface CoffeeSearchResult {
  id: string;
  name: string;
  roastery: string | null;
  origin_country: string | null;
  origin_region: string | null;
  roast_level: number | null;
  similarity: number;
}

export interface CafeSearchResult {
  id: string;
  name: string;
  address: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
  similarity: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
  status: number;
  statusText: string;
}

// Real-time Subscription Types
export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}