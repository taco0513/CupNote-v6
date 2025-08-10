-- ============================================================================
-- CupNote v6 Enhanced Database Functions
-- ============================================================================
-- Additional business logic functions for enhanced features
-- Korean sensory expressions, advanced recommendations, and data analytics

-- ============================================================================
-- Korean Sensory Expression Functions
-- ============================================================================

-- Get recommended Korean expressions based on taste scores
CREATE OR REPLACE FUNCTION public.get_recommended_expressions(
  taste_scores_param JSONB,
  flavor_notes_param TEXT[] DEFAULT NULL,
  user_id_param UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  category TEXT,
  expression TEXT,
  description TEXT,
  confidence_score DECIMAL
) AS $$
DECLARE
  acidity_score DECIMAL := (taste_scores_param->>'acidity')::DECIMAL;
  sweetness_score DECIMAL := (taste_scores_param->>'sweetness')::DECIMAL;
  bitterness_score DECIMAL := (taste_scores_param->>'bitterness')::DECIMAL;
  body_score DECIMAL := (taste_scores_param->>'body')::DECIMAL;
BEGIN
  RETURN QUERY
  WITH expression_scores AS (
    SELECT 
      se.category,
      se.expression,
      se.description,
      -- Calculate confidence based on taste scores and expression characteristics
      CASE 
        WHEN se.category = 'sweetness' AND sweetness_score IS NOT NULL THEN
          GREATEST(0.0, (sweetness_score - 2.5) / 2.5)
        WHEN se.category = 'acidity' AND acidity_score IS NOT NULL THEN
          GREATEST(0.0, (acidity_score - 2.5) / 2.5)
        WHEN se.category = 'bitterness' AND bitterness_score IS NOT NULL THEN
          GREATEST(0.0, (bitterness_score - 2.5) / 2.5)
        WHEN se.category = 'body' AND body_score IS NOT NULL THEN
          GREATEST(0.0, (body_score - 2.5) / 2.5)
        ELSE 0.3 -- Base confidence for flavor/aftertaste/overall
      END * 
      -- Boost popular expressions
      (1.0 + LEAST(se.usage_count::DECIMAL / 1000.0, 0.3)) *
      -- Boost positive expressions slightly
      (CASE WHEN se.is_positive THEN 1.1 ELSE 1.0 END) as confidence_score
    FROM public.sensory_expressions se
    WHERE se.is_active = true
  )
  SELECT 
    es.category,
    es.expression,
    es.description,
    es.confidence_score
  FROM expression_scores es
  WHERE es.confidence_score > 0.2
  ORDER BY 
    es.confidence_score DESC,
    es.category,
    random() -- Add some variety
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Increment usage count for expressions
CREATE OR REPLACE FUNCTION public.increment_expression_usage(expression_text TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.sensory_expressions
  SET usage_count = usage_count + 1
  WHERE expression = expression_text;
  
  -- If expression doesn't exist, this could be a custom one
  -- Log for potential addition to the database
  IF NOT FOUND THEN
    PERFORM public.log_security_event('custom_expression_used', jsonb_build_object(
      'expression', expression_text,
      'user_id', auth.uid()
    ));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Advanced Recommendation Functions
-- ============================================================================

-- Get coffee recommendations based on user's taste profile
CREATE OR REPLACE FUNCTION public.get_coffee_recommendations(
  target_user_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  coffee_id UUID,
  coffee_name TEXT,
  roastery TEXT,
  similarity_score DECIMAL,
  reason TEXT
) AS $$
DECLARE
  user_taste_profile JSONB;
  user_preferred_origins TEXT[];
BEGIN
  -- Get user's taste profile and preferences
  SELECT taste_profile, preferred_origins
  INTO user_taste_profile, user_preferred_origins
  FROM public.user_stats
  WHERE user_id = target_user_id;
  
  IF user_taste_profile IS NULL THEN
    -- New user - return popular coffees
    RETURN QUERY
    SELECT 
      c.id,
      c.name,
      c.roastery,
      0.5::DECIMAL as similarity_score,
      '인기 있는 커피' as reason
    FROM public.coffees c
    WHERE c.is_verified = true
    ORDER BY random()
    LIMIT limit_count;
    RETURN;
  END IF;
  
  RETURN QUERY
  WITH coffee_scores AS (
    SELECT 
      c.id,
      c.name,
      c.roastery,
      c.origin_country,
      -- Calculate similarity based on average taste scores of other users
      COALESCE((
        SELECT public.calculate_taste_similarity(
          user_taste_profile,
          jsonb_build_object(
            'acidity', AVG((tr.taste_scores->>'acidity')::DECIMAL),
            'sweetness', AVG((tr.taste_scores->>'sweetness')::DECIMAL),
            'bitterness', AVG((tr.taste_scores->>'bitterness')::DECIMAL),
            'body', AVG((tr.taste_scores->>'body')::DECIMAL),
            'balance', AVG((tr.taste_scores->>'balance')::DECIMAL),
            'cleanness', AVG((tr.taste_scores->>'cleanness')::DECIMAL),
            'aftertaste', AVG((tr.taste_scores->>'aftertaste')::DECIMAL)
          )
        )
        FROM public.tasting_records tr 
        WHERE tr.coffee_id = c.id AND tr.status = 'completed'
        HAVING COUNT(*) >= 3
      ), 0.3) as base_similarity,
      -- Boost if origin is in user's preferred list
      CASE 
        WHEN c.origin_country = ANY(user_preferred_origins) THEN 0.2
        ELSE 0.0
      END as origin_boost
    FROM public.coffees c
    WHERE c.is_verified = true
      -- Exclude coffees already tried by user
      AND NOT EXISTS (
        SELECT 1 FROM public.tasting_records tr
        WHERE tr.user_id = target_user_id AND tr.coffee_id = c.id
      )
  )
  SELECT 
    cs.id,
    cs.name,
    cs.roastery,
    cs.base_similarity + cs.origin_boost as similarity_score,
    CASE 
      WHEN cs.origin_boost > 0 THEN '좋아하는 원산지: ' || cs.origin_country
      ELSE '맛 선호도 기반 추천'
    END as reason
  FROM coffee_scores cs
  WHERE cs.base_similarity + cs.origin_boost > 0.4
  ORDER BY similarity_score DESC, random()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get cafe recommendations based on user's preferences and location
CREATE OR REPLACE FUNCTION public.get_cafe_recommendations(
  target_user_id UUID,
  user_lat DECIMAL DEFAULT NULL,
  user_lng DECIMAL DEFAULT NULL,
  radius_km INTEGER DEFAULT 10,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  cafe_id UUID,
  cafe_name TEXT,
  address TEXT,
  distance_km REAL,
  recommendation_score DECIMAL,
  reason TEXT
) AS $$
DECLARE
  user_cafe_preferences RECORD;
BEGIN
  -- Get user's cafe visit patterns
  SELECT 
    COUNT(*) as total_cafe_visits,
    AVG(COALESCE((cafe_data->>'atmosphere_rating')::DECIMAL, 0)) as avg_atmosphere_preference,
    AVG(COALESCE((cafe_data->>'service_rating')::DECIMAL, 0)) as avg_service_preference,
    mode() WITHIN GROUP (ORDER BY cafe_data->>'accompaniedBy') as preferred_company,
    ARRAY_AGG(DISTINCT cafe_id) as visited_cafes
  INTO user_cafe_preferences
  FROM public.tasting_records
  WHERE user_id = target_user_id 
    AND mode = 'cafe' 
    AND status = 'completed'
    AND cafe_id IS NOT NULL;
  
  RETURN QUERY
  WITH cafe_scores AS (
    SELECT 
      c.id,
      c.name,
      c.address,
      CASE 
        WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL 
             AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN
          ST_Distance(
            ST_Point(user_lng, user_lat)::geography,
            ST_Point(c.longitude, c.latitude)::geography
          ) / 1000.0
        ELSE NULL
      END as distance_km,
      -- Base score from cafe ratings
      GREATEST(c.average_atmosphere, c.average_service) as base_score,
      -- Distance penalty (closer is better)
      CASE 
        WHEN user_lat IS NOT NULL AND c.latitude IS NOT NULL THEN
          GREATEST(0.0, 1.0 - (ST_Distance(
            ST_Point(user_lng, user_lat)::geography,
            ST_Point(c.longitude, c.latitude)::geography
          ) / 1000.0) / radius_km)
        ELSE 0.5
      END as distance_score,
      -- Specialty coffee bonus
      CASE WHEN c.specialty_coffee THEN 0.1 ELSE 0.0 END as specialty_bonus
    FROM public.cafes c
    WHERE c.is_verified = true
      -- Filter by distance if location provided
      AND (user_lat IS NULL OR user_lng IS NULL OR c.latitude IS NULL OR c.longitude IS NULL
           OR ST_DWithin(
             ST_Point(user_lng, user_lat)::geography,
             ST_Point(c.longitude, c.latitude)::geography,
             radius_km * 1000
           ))
      -- Exclude already visited cafes
      AND (user_cafe_preferences.visited_cafes IS NULL 
           OR c.id != ALL(user_cafe_preferences.visited_cafes))
  )
  SELECT 
    cs.id,
    cs.name,
    cs.address,
    cs.distance_km,
    (cs.base_score * 0.4 + cs.distance_score * 0.4 + cs.specialty_bonus + 0.2) as recommendation_score,
    CASE 
      WHEN cs.distance_km IS NOT NULL AND cs.distance_km <= 1.0 THEN '가까운 거리'
      WHEN cs.base_score >= 4.0 THEN '높은 평점'
      WHEN cs.specialty_bonus > 0 THEN '스페셜티 커피'
      ELSE '새로운 경험'
    END as reason
  FROM cafe_scores cs
  WHERE cs.base_score > 0.0
  ORDER BY recommendation_score DESC, cs.distance_km ASC NULLS LAST
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Data Analytics Functions
-- ============================================================================

-- Get user's coffee journey insights
CREATE OR REPLACE FUNCTION public.get_coffee_journey_insights(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  insights_data JSONB;
  total_records INTEGER;
  journey_start_date DATE;
  taste_evolution JSONB;
  favorite_categories JSONB;
BEGIN
  -- Get basic journey stats
  SELECT 
    COUNT(*),
    MIN(recorded_at::DATE),
    jsonb_build_object(
      'early_avg', AVG(overall_rating) FILTER (WHERE recorded_at < (MIN(recorded_at) + INTERVAL '3 months')),
      'recent_avg', AVG(overall_rating) FILTER (WHERE recorded_at >= (MAX(recorded_at) - INTERVAL '3 months'))
    )
  INTO total_records, journey_start_date, taste_evolution
  FROM public.tasting_records
  WHERE user_id = target_user_id AND status = 'completed';
  
  -- Get favorite categories
  WITH category_stats AS (
    SELECT 
      CASE 
        WHEN coffee_data->>'process_method' IS NOT NULL THEN 'process'
        WHEN coffee_data->>'origin_country' IS NOT NULL THEN 'origin'
        WHEN coffee_data->>'roastery' IS NOT NULL THEN 'roastery'
        ELSE 'other'
      END as category_type,
      COALESCE(
        coffee_data->>'process_method',
        coffee_data->>'origin_country', 
        coffee_data->>'roastery',
        'unknown'
      ) as category_value,
      COUNT(*) as count,
      AVG(overall_rating) as avg_rating
    FROM public.tasting_records
    WHERE user_id = target_user_id AND status = 'completed'
    GROUP BY category_type, category_value
    HAVING COUNT(*) >= 2
  )
  SELECT jsonb_object_agg(category_type, category_data)
  INTO favorite_categories
  FROM (
    SELECT 
      category_type,
      jsonb_build_object(
        'favorite', category_value,
        'count', count,
        'rating', avg_rating
      ) as category_data
    FROM (
      SELECT DISTINCT ON (category_type) *
      FROM category_stats
      ORDER BY category_type, count DESC, avg_rating DESC
    ) ranked_categories
  ) aggregated;
  
  insights_data := jsonb_build_object(
    'total_records', total_records,
    'journey_start_date', journey_start_date,
    'days_active', EXTRACT(DAY FROM (CURRENT_DATE - journey_start_date)),
    'taste_evolution', taste_evolution,
    'favorite_categories', COALESCE(favorite_categories, '{}'::jsonb),
    'generated_at', NOW()
  );
  
  RETURN insights_data;
END;
$$ LANGUAGE plpgsql;

-- Get trending coffees and cafes
CREATE OR REPLACE FUNCTION public.get_trending_items(
  item_type TEXT DEFAULT 'coffee', -- 'coffee' or 'cafe'
  time_period TEXT DEFAULT 'week', -- 'week', 'month', 'year'
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  item_id UUID,
  item_name TEXT,
  item_details JSONB,
  record_count BIGINT,
  avg_rating DECIMAL,
  trend_score DECIMAL
) AS $$
DECLARE
  time_interval INTERVAL;
BEGIN
  -- Set time interval based on period
  time_interval := CASE 
    WHEN time_period = 'week' THEN INTERVAL '7 days'
    WHEN time_period = 'month' THEN INTERVAL '30 days'
    WHEN time_period = 'year' THEN INTERVAL '365 days'
    ELSE INTERVAL '7 days'
  END;
  
  IF item_type = 'coffee' THEN
    RETURN QUERY
    WITH coffee_trends AS (
      SELECT 
        tr.coffee_id,
        c.name,
        jsonb_build_object(
          'roastery', c.roastery,
          'origin_country', c.origin_country,
          'roast_level', c.roast_level
        ) as details,
        COUNT(*) as record_count,
        AVG(tr.overall_rating) as avg_rating,
        -- Trend score: combines recency, count, and rating
        (COUNT(*) * AVG(tr.overall_rating) * 
         EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MIN(tr.created_at))) / 86400.0
        ) as trend_score
      FROM public.tasting_records tr
      JOIN public.coffees c ON tr.coffee_id = c.id
      WHERE tr.coffee_id IS NOT NULL
        AND tr.status = 'completed'
        AND tr.created_at >= CURRENT_TIMESTAMP - time_interval
        AND c.is_verified = true
      GROUP BY tr.coffee_id, c.name, c.roastery, c.origin_country, c.roast_level
      HAVING COUNT(*) >= 3
    )
    SELECT 
      ct.coffee_id,
      ct.name,
      ct.details,
      ct.record_count,
      ct.avg_rating,
      ct.trend_score
    FROM coffee_trends ct
    ORDER BY ct.trend_score DESC
    LIMIT limit_count;
    
  ELSIF item_type = 'cafe' THEN
    RETURN QUERY
    WITH cafe_trends AS (
      SELECT 
        tr.cafe_id,
        c.name,
        jsonb_build_object(
          'address', c.address,
          'district', c.district,
          'atmosphere', c.average_atmosphere,
          'service', c.average_service
        ) as details,
        COUNT(*) as record_count,
        AVG(tr.overall_rating) as avg_rating,
        (COUNT(*) * AVG(tr.overall_rating) * 
         EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MIN(tr.created_at))) / 86400.0
        ) as trend_score
      FROM public.tasting_records tr
      JOIN public.cafes c ON tr.cafe_id = c.id
      WHERE tr.cafe_id IS NOT NULL
        AND tr.status = 'completed'
        AND tr.created_at >= CURRENT_TIMESTAMP - time_interval
        AND c.is_verified = true
      GROUP BY tr.cafe_id, c.name, c.address, c.district, c.average_atmosphere, c.average_service
      HAVING COUNT(*) >= 2
    )
    SELECT 
      ct.cafe_id,
      ct.name,
      ct.details,
      ct.record_count,
      ct.avg_rating,
      ct.trend_score
    FROM cafe_trends ct
    ORDER BY ct.trend_score DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Sample Data Generation Functions
-- ============================================================================

-- Create sample tasting records for testing
CREATE OR REPLACE FUNCTION public.create_sample_tasting_records(sample_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  coffee_record RECORD;
  cafe_record RECORD;
  record_count INTEGER := 0;
  sample_modes TEXT[] := ARRAY['cafe', 'homecafe'];
  sample_mode TEXT;
  sample_rating DECIMAL;
  sample_date TIMESTAMPTZ;
BEGIN
  -- Create 20 sample records over the past 3 months
  FOR i IN 1..20 LOOP
    -- Random mode
    sample_mode := sample_modes[1 + floor(random() * 2)];
    sample_rating := 2.5 + (random() * 2.5);
    sample_date := NOW() - (random() * INTERVAL '90 days');
    
    -- Get random coffee
    SELECT * INTO coffee_record
    FROM public.coffees
    WHERE is_verified = true
    ORDER BY random()
    LIMIT 1;
    
    IF sample_mode = 'cafe' THEN
      -- Get random cafe
      SELECT * INTO cafe_record
      FROM public.cafes
      WHERE is_verified = true
      ORDER BY random()
      LIMIT 1;
      
      INSERT INTO public.tasting_records (
        user_id,
        mode,
        status,
        coffee_id,
        cafe_id,
        taste_scores,
        flavor_notes,
        overall_rating,
        personal_notes,
        share_with_community,
        recorded_at,
        created_at
      ) VALUES (
        sample_user_id,
        'cafe',
        'completed',
        coffee_record.id,
        cafe_record.id,
        jsonb_build_object(
          'acidity', 2 + floor(random() * 4),
          'sweetness', 2 + floor(random() * 4),
          'bitterness', 2 + floor(random() * 4),
          'body', 2 + floor(random() * 4),
          'balance', 2 + floor(random() * 4),
          'cleanness', 2 + floor(random() * 4),
          'aftertaste', 2 + floor(random() * 4)
        ),
        ARRAY['fruity', 'chocolate', 'nutty'],
        sample_rating,
        '샘플 기록입니다. 테스트용으로 생성되었습니다.',
        random() > 0.7,
        sample_date,
        sample_date
      );
    ELSE
      INSERT INTO public.tasting_records (
        user_id,
        mode,
        status,
        coffee_id,
        taste_scores,
        brew_data,
        flavor_notes,
        overall_rating,
        personal_notes,
        share_with_community,
        recorded_at,
        created_at
      ) VALUES (
        sample_user_id,
        'homecafe',
        'completed',
        coffee_record.id,
        jsonb_build_object(
          'acidity', 2 + floor(random() * 4),
          'sweetness', 2 + floor(random() * 4),
          'bitterness', 2 + floor(random() * 4),
          'body', 2 + floor(random() * 4),
          'balance', 2 + floor(random() * 4),
          'cleanness', 2 + floor(random() * 4),
          'aftertaste', 2 + floor(random() * 4)
        ),
        jsonb_build_object(
          'method', 'v60',
          'water_temperature', 90 + floor(random() * 10),
          'coffee_amount', 15 + floor(random() * 10),
          'water_amount', 250 + floor(random() * 100),
          'brew_time', 180 + floor(random() * 120)
        ),
        ARRAY['berry', 'floral', 'citrus'],
        sample_rating,
        '홈카페 샘플 기록입니다.',
        random() > 0.5,
        sample_date,
        sample_date
      );
    END IF;
    
    record_count := record_count + 1;
  END LOOP;
  
  -- Update user stats
  PERFORM public.update_user_stats(sample_user_id);
  
  RETURN record_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Performance Optimization Functions  
-- ============================================================================

-- Identify unused indexes
CREATE OR REPLACE FUNCTION public.identify_unused_indexes()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  indexname TEXT,
  index_size TEXT,
  scan_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    indexname::TEXT,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as scan_count
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
    AND idx_scan < 50  -- Less than 50 scans
    AND pg_relation_size(indexrelid) > 1024 * 1024  -- Larger than 1MB
  ORDER BY pg_relation_size(indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get index maintenance recommendations
CREATE OR REPLACE FUNCTION public.recommend_index_maintenance()
RETURNS TABLE (
  table_name TEXT,
  recommendation TEXT,
  priority TEXT,
  details TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH table_stats AS (
    SELECT 
      schemaname,
      tablename,
      n_tup_ins + n_tup_upd + n_tup_del as total_modifications,
      n_tup_ins,
      n_tup_upd,
      n_tup_del,
      last_vacuum,
      last_analyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
  )
  SELECT 
    ts.tablename::TEXT,
    CASE 
      WHEN ts.last_analyze < NOW() - INTERVAL '7 days' THEN 'ANALYZE needed'
      WHEN ts.last_vacuum < NOW() - INTERVAL '7 days' AND ts.total_modifications > 1000 THEN 'VACUUM needed'
      WHEN ts.n_tup_upd > ts.n_tup_ins * 2 THEN 'Consider REINDEX'
      ELSE 'OK'
    END as recommendation,
    CASE 
      WHEN ts.total_modifications > 10000 THEN 'HIGH'
      WHEN ts.total_modifications > 1000 THEN 'MEDIUM'
      ELSE 'LOW'
    END as priority,
    format('Modifications: %s, Last vacuum: %s, Last analyze: %s', 
           ts.total_modifications, ts.last_vacuum, ts.last_analyze) as details
  FROM table_stats ts
  WHERE ts.total_modifications > 100
  ORDER BY ts.total_modifications DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Data Summary Views
-- ============================================================================

-- Create a view for sample data summary
CREATE OR REPLACE VIEW public.sample_data_summary AS
SELECT 
  'coffees' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count,
  COUNT(DISTINCT roastery) as unique_roasteries,
  COUNT(DISTINCT origin_country) as unique_origins,
  string_agg(DISTINCT roastery, ', ' ORDER BY roastery) as roasteries
FROM public.coffees
WHERE roastery IS NOT NULL
UNION ALL
SELECT 
  'cafes' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count,
  COUNT(DISTINCT district) as unique_roasteries,
  COUNT(DISTINCT neighborhood) as unique_origins,
  string_agg(DISTINCT district, ', ' ORDER BY district) as roasteries
FROM public.cafes
WHERE district IS NOT NULL
UNION ALL
SELECT 
  'achievements' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as verified_count,
  COUNT(DISTINCT category) as unique_roasteries,
  COUNT(DISTINCT rarity) as unique_origins,
  string_agg(DISTINCT category, ', ' ORDER BY category) as roasteries
FROM public.achievements
UNION ALL
SELECT 
  'expressions' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as verified_count,
  COUNT(DISTINCT category) as unique_roasteries,
  0 as unique_origins,
  string_agg(DISTINCT category, ', ' ORDER BY category) as roasteries
FROM public.sensory_expressions;

-- ============================================================================
-- Function Permissions
-- ============================================================================

-- Grant permissions for authenticated users
GRANT EXECUTE ON FUNCTION public.get_recommended_expressions(JSONB, TEXT[], UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_expression_usage(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_coffee_recommendations(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cafe_recommendations(UUID, DECIMAL, DECIMAL, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_coffee_journey_insights(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_items(TEXT, TEXT, INTEGER) TO authenticated;

-- Grant permissions for service role (admin functions)
GRANT EXECUTE ON FUNCTION public.create_sample_tasting_records(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.identify_unused_indexes() TO service_role;
GRANT EXECUTE ON FUNCTION public.recommend_index_maintenance() TO service_role;

-- Grant view access
GRANT SELECT ON public.sample_data_summary TO authenticated;

-- ============================================================================
-- Function Documentation
-- ============================================================================

COMMENT ON FUNCTION public.get_recommended_expressions(JSONB, TEXT[], UUID, INTEGER) IS
  '사용자의 맛 평가를 바탕으로 한국어 감각 표현을 추천';

COMMENT ON FUNCTION public.get_coffee_recommendations(UUID, INTEGER) IS
  '사용자의 취향 프로필을 바탕으로 커피 추천';

COMMENT ON FUNCTION public.get_cafe_recommendations(UUID, DECIMAL, DECIMAL, INTEGER, INTEGER) IS
  '사용자 위치와 선호도를 바탕으로 카페 추천';

COMMENT ON FUNCTION public.get_coffee_journey_insights(UUID) IS
  '사용자의 커피 여행 인사이트 및 성장 분석';

COMMENT ON FUNCTION public.get_trending_items(TEXT, TEXT, INTEGER) IS
  '트렌딩 커피 및 카페 목록 조회';

COMMENT ON VIEW public.sample_data_summary IS
  '샘플 데이터 현황 요약';