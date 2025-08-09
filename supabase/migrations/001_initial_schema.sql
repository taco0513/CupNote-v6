-- ============================================================================
-- CupNote v6 Database Schema - Initial Migration
-- ============================================================================
-- 한국 사용자를 위한 특화된 커피 기록 플랫폼 데이터베이스 스키마
-- Foundation Team의 타입과 완전 호환되도록 설계됨

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext"; -- Case insensitive text

-- ============================================================================
-- 사용자 프로필 테이블 (Supabase auth.users 확장)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 프로필 정보
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- 커피 경험 정보
  experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
  coffee_journey_start_date DATE,
  
  -- 개인화 설정
  preferred_units JSONB DEFAULT '{
    "temperature": "celsius",
    "weight": "grams", 
    "volume": "ml"
  }'::jsonb,
  
  -- 커뮤니티 설정
  share_profile_public BOOLEAN DEFAULT false,
  allow_match_requests BOOLEAN DEFAULT true,
  
  -- 알림 설정
  notification_settings JSONB DEFAULT '{
    "achievements": true,
    "community_matches": true,
    "weekly_summary": true,
    "new_features": true
  }'::jsonb,
  
  -- 메타데이터
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step TEXT DEFAULT 'welcome',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 커피 정보 테이블 (표준화된 커피 데이터)
-- ============================================================================
CREATE TABLE public.coffees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  name TEXT NOT NULL,
  roastery TEXT,
  roastery_location TEXT,
  
  -- 원산지 정보
  origin_country TEXT,
  origin_region TEXT,
  origin_farm TEXT,
  altitude_meters INTEGER,
  
  -- 가공 정보
  variety TEXT[], -- ['Geisha', 'Bourbon', 'Typica'] 등
  process_method TEXT CHECK (process_method IN ('washed', 'natural', 'honey', 'anaerobic', 'carbonic_maceration', 'other')),
  fermentation_time_hours INTEGER,
  drying_method TEXT,
  
  -- 로스팅 정보
  roast_level INTEGER CHECK (roast_level >= 1 AND roast_level <= 5), -- 1: Light ~ 5: Dark
  roast_date DATE,
  roast_notes TEXT,
  
  -- 상품 정보
  price_krw INTEGER,
  weight_grams INTEGER,
  package_type TEXT,
  purchase_link TEXT,
  
  -- 메타데이터
  is_verified BOOLEAN DEFAULT false, -- 로스터리 인증 여부
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 검색 최적화
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('korean', 
      COALESCE(name, '') || ' ' || 
      COALESCE(roastery, '') || ' ' || 
      COALESCE(origin_country, '') || ' ' ||
      COALESCE(origin_region, '')
    )
  ) STORED
);

-- ============================================================================
-- 카페 정보 테이블 (Cafe Mode용)
-- ============================================================================
CREATE TABLE public.cafes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  name TEXT NOT NULL,
  name_english TEXT,
  
  -- 위치 정보
  address TEXT NOT NULL,
  address_detail TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  district TEXT, -- 강남구, 서초구 등
  neighborhood TEXT, -- 역삼동, 논현동 등
  
  -- 영업 정보
  phone TEXT,
  website TEXT,
  instagram TEXT,
  operating_hours JSONB, -- {"monday": {"open": "08:00", "close": "22:00", "closed": false}, ...}
  
  -- 카페 특성
  wifi_available BOOLEAN DEFAULT true,
  parking_available BOOLEAN DEFAULT false,
  pet_friendly BOOLEAN DEFAULT false,
  group_friendly BOOLEAN DEFAULT true,
  study_friendly BOOLEAN DEFAULT true,
  
  -- 메뉴 및 가격대
  price_range INTEGER CHECK (price_range >= 1 AND price_range <= 4), -- 1: 저렴 ~ 4: 비쌈
  specialty_coffee BOOLEAN DEFAULT true,
  roasting_onsite BOOLEAN DEFAULT false,
  
  -- 평점 (집계)
  average_atmosphere DECIMAL(3,2) DEFAULT 0.0,
  average_service DECIMAL(3,2) DEFAULT 0.0,
  total_visits INTEGER DEFAULT 0,
  
  -- 메타데이터
  is_verified BOOLEAN DEFAULT false,
  verification_source TEXT, -- 'google_places', 'naver_places', 'manual' 등
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 검색 최적화
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('korean', 
      COALESCE(name, '') || ' ' || 
      COALESCE(name_english, '') || ' ' ||
      COALESCE(address, '') || ' ' ||
      COALESCE(district, '') || ' ' ||
      COALESCE(neighborhood, '')
    )
  ) STORED
);

-- ============================================================================
-- 테이스팅 기록 테이블 (핵심 테이블)
-- ============================================================================
CREATE TABLE public.tasting_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  mode TEXT NOT NULL CHECK (mode IN ('cafe', 'homecafe')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  
  -- 커피 정보 (정규화 또는 JSON)
  coffee_id UUID REFERENCES public.coffees(id),
  coffee_data JSONB, -- coffee_id가 없는 경우 JSON으로 저장
  
  -- 카페 정보 (Cafe Mode용)
  cafe_id UUID REFERENCES public.cafes(id),
  cafe_data JSONB, -- { name, address, location, visit_info, atmosphere, service }
  
  -- 홈카페 정보 (HomeCafe Mode용)  
  brew_data JSONB, -- { method, equipment, grind_size, water_temp, water_amount, coffee_amount, brew_time, recipe }
  
  -- 맛 평가 (Traditional 7-point scale)
  taste_scores JSONB NOT NULL DEFAULT '{
    "acidity": null,
    "sweetness": null, 
    "bitterness": null,
    "body": null,
    "balance": null,
    "cleanness": null,
    "aftertaste": null
  }'::jsonb,
  
  -- 향미 노트 (SCA Flavor Wheel 기반)
  flavor_notes TEXT[] DEFAULT '{}',
  flavor_intensity INTEGER CHECK (flavor_intensity >= 1 AND flavor_intensity <= 5),
  
  -- 한국어 감각 표현 (44개 표현)
  sensory_expressions JSONB DEFAULT '{
    "sweetness": [],
    "acidity": [], 
    "bitterness": [],
    "body": [],
    "flavor": [],
    "aftertaste": [],
    "overall": [],
    "custom": null
  }'::jsonb,
  
  -- 개인 평가
  overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
  personal_notes TEXT,
  mood TEXT,
  context TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- 미디어 
  photos TEXT[] DEFAULT '{}', -- Supabase Storage URLs
  
  -- 커뮤니티
  share_with_community BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  community_tags TEXT[] DEFAULT '{}',
  
  -- 재구매 의향
  repurchase_intent INTEGER CHECK (repurchase_intent >= 1 AND repurchase_intent <= 5),
  
  -- 추천 시스템용 데이터
  taste_vector VECTOR(7), -- 맛 프로필 벡터 (ML 추천용)
  
  -- 메타데이터
  recorded_at TIMESTAMPTZ DEFAULT NOW(), -- 실제 커피를 마신 시간
  draft_saved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 임시저장 (Draft) 테이블
-- ============================================================================
CREATE TABLE public.drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Draft 정보
  mode TEXT NOT NULL CHECK (mode IN ('cafe', 'homecafe')),
  current_step TEXT NOT NULL,
  step_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  
  -- 만료 관리
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  is_expired BOOLEAN DEFAULT false,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 도전과제 테이블
-- ============================================================================
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  icon_emoji TEXT NOT NULL,
  icon_url TEXT,
  
  -- 분류
  category TEXT NOT NULL CHECK (category IN ('quantity', 'quality', 'variety', 'social', 'expertise', 'special')),
  subcategory TEXT,
  
  -- 요구사항
  requirement JSONB NOT NULL, -- { type, target, criteria }
  
  -- 보상
  points INTEGER NOT NULL DEFAULT 10,
  badge_color TEXT DEFAULT '#3B82F6',
  
  -- 희귀도
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  
  -- 활성화 상태
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false, -- 숨김 도전과제 (발견형)
  
  -- 순서 및 그룹화
  sort_order INTEGER DEFAULT 0,
  prerequisite_achievement_ids UUID[] DEFAULT '{}',
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 사용자 도전과제 (User Achievements)
-- ============================================================================
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  
  -- 진행 상황
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  progress_data JSONB DEFAULT '{}'::jsonb, -- 세부 진행 데이터
  
  -- 완료 상태
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- 알림 상태
  is_notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  
  -- 메타데이터
  first_progress_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- 사용자 통계 테이블
-- ============================================================================
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 카운트
  total_records INTEGER DEFAULT 0,
  cafe_records INTEGER DEFAULT 0,
  homecafe_records INTEGER DEFAULT 0,
  
  -- 기간별 통계
  daily_records INTEGER DEFAULT 0,
  weekly_records INTEGER DEFAULT 0, 
  monthly_records INTEGER DEFAULT 0,
  yearly_records INTEGER DEFAULT 0,
  
  -- 연속 기록 (Streak)
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  weekly_streak INTEGER DEFAULT 0,
  last_record_date DATE,
  
  -- 다양성 통계
  unique_coffees INTEGER DEFAULT 0,
  unique_roasteries INTEGER DEFAULT 0,
  unique_origins INTEGER DEFAULT 0,
  unique_cafes INTEGER DEFAULT 0,
  unique_brew_methods INTEGER DEFAULT 0,
  
  -- 선호도 통계 (계산된 값)
  favorite_roastery TEXT,
  favorite_origin TEXT,
  favorite_brew_method TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  
  -- 맛 프로필 (평균값)
  taste_profile JSONB DEFAULT '{
    "acidity": 0.0,
    "sweetness": 0.0,
    "bitterness": 0.0,
    "body": 0.0,
    "balance": 0.0,
    "cleanness": 0.0,
    "aftertaste": 0.0
  }'::jsonb,
  
  preferred_flavors TEXT[] DEFAULT '{}',
  preferred_origins TEXT[] DEFAULT '{}',
  
  -- 게임화 요소
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  next_level_exp INTEGER DEFAULT 100,
  total_achievement_points INTEGER DEFAULT 0,
  
  -- 커뮤니티 통계
  community_matches INTEGER DEFAULT 0,
  shared_records INTEGER DEFAULT 0,
  helpful_reviews INTEGER DEFAULT 0,
  
  -- 특별 통계
  morning_records INTEGER DEFAULT 0, -- 9시 이전
  evening_records INTEGER DEFAULT 0, -- 18시 이후
  perfect_ratings INTEGER DEFAULT 0, -- 5점 만점
  detailed_notes_count INTEGER DEFAULT 0, -- 500자 이상 노트
  photos_shared INTEGER DEFAULT 0,
  
  -- 업데이트 추적
  stats_version INTEGER DEFAULT 1,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 한국어 감각 표현 마스터 테이블 (44개 표현)
-- ============================================================================
CREATE TABLE public.sensory_expressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 표현 정보
  expression TEXT NOT NULL UNIQUE,
  expression_en TEXT,
  category TEXT NOT NULL CHECK (category IN ('sweetness', 'acidity', 'bitterness', 'body', 'flavor', 'aftertaste', 'overall')),
  
  -- 설명
  description TEXT,
  description_en TEXT,
  
  -- 사용 통계
  usage_count INTEGER DEFAULT 0,
  
  -- 분류
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),
  is_positive BOOLEAN DEFAULT true,
  
  -- 메타데이터
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 커뮤니티 매치 시스템
-- ============================================================================
CREATE TABLE public.taste_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 매치 대상
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 매치 기준
  coffee_id UUID REFERENCES public.coffees(id),
  match_type TEXT NOT NULL CHECK (match_type IN ('same_coffee', 'taste_similarity', 'preference_match')),
  
  -- 매치 점수 
  similarity_score DECIMAL(3,2) CHECK (similarity_score >= 0.0 AND similarity_score <= 1.0),
  taste_correlation DECIMAL(3,2),
  preference_overlap DECIMAL(3,2),
  
  -- 매치 상세
  matching_aspects JSONB, -- 어떤 부분에서 매치되었는지
  differences JSONB, -- 차이점
  
  -- 상태
  is_mutual BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  
  -- 메타데이터
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  UNIQUE(user_id, target_user_id, coffee_id)
);

-- ============================================================================
-- 시스템 설정 테이블 
-- ============================================================================
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 기본 인덱스 생성
-- ============================================================================

-- 사용자 프로필
CREATE INDEX idx_profiles_experience_level ON public.profiles(experience_level);
CREATE INDEX idx_profiles_share_public ON public.profiles(share_profile_public) WHERE share_profile_public = true;

-- 커피 정보
CREATE INDEX idx_coffees_search ON public.coffees USING GIN(search_vector);
CREATE INDEX idx_coffees_roastery ON public.coffees(roastery);
CREATE INDEX idx_coffees_origin ON public.coffees(origin_country, origin_region);
CREATE INDEX idx_coffees_roast_level ON public.coffees(roast_level);

-- 카페 정보  
CREATE INDEX idx_cafes_search ON public.cafes USING GIN(search_vector);
CREATE INDEX idx_cafes_location ON public.cafes(latitude, longitude);
CREATE INDEX idx_cafes_district ON public.cafes(district);

-- 테이스팅 기록 (가장 중요한 인덱스들)
CREATE INDEX idx_tasting_records_user_id ON public.tasting_records(user_id);
CREATE INDEX idx_tasting_records_user_created ON public.tasting_records(user_id, created_at DESC);
CREATE INDEX idx_tasting_records_user_mode ON public.tasting_records(user_id, mode);
CREATE INDEX idx_tasting_records_status ON public.tasting_records(status);
CREATE INDEX idx_tasting_records_coffee_id ON public.tasting_records(coffee_id);
CREATE INDEX idx_tasting_records_cafe_id ON public.tasting_records(cafe_id);
CREATE INDEX idx_tasting_records_rating ON public.tasting_records(overall_rating);
CREATE INDEX idx_tasting_records_public ON public.tasting_records(is_public, share_with_community) WHERE is_public = true;
CREATE INDEX idx_tasting_records_recorded_at ON public.tasting_records(recorded_at DESC);

-- Draft 관리
CREATE INDEX idx_drafts_user_id ON public.drafts(user_id);
CREATE INDEX idx_drafts_expires_at ON public.drafts(expires_at) WHERE is_expired = false;

-- 도전과제
CREATE INDEX idx_achievements_category ON public.achievements(category);
CREATE INDEX idx_achievements_active ON public.achievements(is_active) WHERE is_active = true;
CREATE INDEX idx_achievements_sort ON public.achievements(category, sort_order);

-- 사용자 도전과제
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON public.user_achievements(user_id, is_completed);
CREATE INDEX idx_user_achievements_progress ON public.user_achievements(achievement_id, current_progress);

-- 통계
CREATE INDEX idx_user_stats_level ON public.user_stats(level DESC);
CREATE INDEX idx_user_stats_streak ON public.user_stats(current_streak DESC);
CREATE INDEX idx_user_stats_total_records ON public.user_stats(total_records DESC);

-- 감각 표현
CREATE INDEX idx_sensory_expressions_category ON public.sensory_expressions(category);
CREATE INDEX idx_sensory_expressions_usage ON public.sensory_expressions(usage_count DESC);

-- 커뮤니티 매치
CREATE INDEX idx_taste_matches_user ON public.taste_matches(user_id, status);
CREATE INDEX idx_taste_matches_coffee ON public.taste_matches(coffee_id, similarity_score DESC);
CREATE INDEX idx_taste_matches_score ON public.taste_matches(similarity_score DESC);

-- ============================================================================
-- 업데이트 트리거 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 적용
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_coffees  
  BEFORE UPDATE ON public.coffees
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_cafes
  BEFORE UPDATE ON public.cafes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tasting_records
  BEFORE UPDATE ON public.tasting_records  
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_drafts
  BEFORE UPDATE ON public.drafts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_achievements
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_achievements
  BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_stats
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 테이블 코멘트 (문서화)
-- ============================================================================

COMMENT ON TABLE public.profiles IS '사용자 프로필 정보 (auth.users 확장)';
COMMENT ON TABLE public.coffees IS '표준화된 커피 정보 마스터 데이터';  
COMMENT ON TABLE public.cafes IS '카페 정보 마스터 데이터';
COMMENT ON TABLE public.tasting_records IS '사용자 테이스팅 기록 (핵심 테이블)';
COMMENT ON TABLE public.drafts IS '임시저장된 테이스팅 기록';
COMMENT ON TABLE public.achievements IS '도전과제 마스터 데이터';
COMMENT ON TABLE public.user_achievements IS '사용자별 도전과제 진행/완료 상황';
COMMENT ON TABLE public.user_stats IS '사용자별 통계 및 게임화 데이터';
COMMENT ON TABLE public.sensory_expressions IS '한국어 감각 표현 마스터 데이터 (44개)';
COMMENT ON TABLE public.taste_matches IS '커뮤니티 맛 매치 시스템';
COMMENT ON TABLE public.system_settings IS '시스템 전역 설정';