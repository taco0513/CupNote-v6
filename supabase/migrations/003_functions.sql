-- ============================================================================
-- CupNote v6 Database Functions
-- ============================================================================
-- 비즈니스 로직과 성능 최적화를 위한 PostgreSQL 함수들
-- 통계 계산, 도전과제 처리, 커뮤니티 매치 알고리즘 포함

-- ============================================================================
-- 사용자 관리 함수
-- ============================================================================

-- 새 사용자 가입 처리
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- raw_user_meta_data에서 이름 추출
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- 프로필 생성
  INSERT INTO public.profiles (
    id, 
    display_name, 
    experience_level,
    onboarding_completed
  ) VALUES (
    NEW.id, 
    user_name, 
    'beginner',
    false
  );
  
  -- 초기 통계 생성
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id);
  
  -- 기본 도전과제 시작
  PERFORM public.initialize_user_achievements(NEW.id);
  
  -- 보안 로그
  PERFORM public.log_security_event('user_signup', jsonb_build_object('user_id', NEW.id));
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 에러 로그
    PERFORM public.log_security_event('user_signup_error', jsonb_build_object(
      'user_id', NEW.id,
      'error', SQLERRM
    ));
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 사용자 삭제 처리 (GDPR 준수)
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 사용자 데이터 익명화 (완전 삭제 대신)
  UPDATE public.tasting_records 
  SET 
    personal_notes = '[삭제된 사용자의 기록]',
    photos = '{}',
    is_public = false,
    share_with_community = false
  WHERE user_id = OLD.id;
  
  -- 커뮤니티 매치 정리
  DELETE FROM public.taste_matches 
  WHERE user_id = OLD.id OR target_user_id = OLD.id;
  
  -- 보안 로그
  PERFORM public.log_security_event('user_deletion', jsonb_build_object('user_id', OLD.id));
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- ============================================================================
-- 통계 계산 함수
-- ============================================================================

-- 사용자 통계 업데이트 (메인 함수)
CREATE OR REPLACE FUNCTION public.update_user_stats(target_user_id UUID)
RETURNS void AS $$
DECLARE
  stats_record RECORD;
  taste_profile_data JSONB;
BEGIN
  -- 기본 카운트 통계 계산
  SELECT
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE mode = 'cafe') as cafe_records,
    COUNT(*) FILTER (WHERE mode = 'homecafe') as homecafe_records,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as daily_records,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as weekly_records,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as monthly_records,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '365 days') as yearly_records,
    COUNT(DISTINCT coffee_id) FILTER (WHERE coffee_id IS NOT NULL) as unique_coffees,
    COUNT(DISTINCT cafe_id) FILTER (WHERE cafe_id IS NOT NULL) as unique_cafes,
    COUNT(*) FILTER (WHERE overall_rating = 5.0) as perfect_ratings,
    COUNT(*) FILTER (WHERE char_length(personal_notes) >= 500) as detailed_notes_count,
    COUNT(*) FILTER (WHERE array_length(photos, 1) > 0) as photos_shared,
    COUNT(*) FILTER (WHERE recorded_at::time < '09:00:00') as morning_records,
    COUNT(*) FILTER (WHERE recorded_at::time >= '18:00:00') as evening_records,
    AVG(overall_rating) as average_rating,
    MAX(recorded_at::date) as last_record_date
  INTO stats_record
  FROM public.tasting_records
  WHERE user_id = target_user_id AND status = 'completed';

  -- 연속 기록 계산
  WITH date_series AS (
    SELECT DISTINCT recorded_at::date as record_date
    FROM public.tasting_records
    WHERE user_id = target_user_id AND status = 'completed'
    ORDER BY record_date DESC
  ),
  streak_calc AS (
    SELECT 
      record_date,
      record_date - ROW_NUMBER() OVER (ORDER BY record_date DESC)::integer as streak_group
    FROM date_series
  ),
  current_streak_calc AS (
    SELECT COUNT(*) as streak_length
    FROM streak_calc
    WHERE streak_group = (
      SELECT streak_group FROM streak_calc 
      WHERE record_date = CURRENT_DATE - INTERVAL '0 days'
      LIMIT 1
    )
  )
  SELECT COALESCE(streak_length, 0) INTO stats_record.current_streak
  FROM current_streak_calc;

  -- 맛 프로필 계산 (평균값)
  SELECT jsonb_build_object(
    'acidity', COALESCE(AVG((taste_scores->>'acidity')::numeric), 0),
    'sweetness', COALESCE(AVG((taste_scores->>'sweetness')::numeric), 0),
    'bitterness', COALESCE(AVG((taste_scores->>'bitterness')::numeric), 0),
    'body', COALESCE(AVG((taste_scores->>'body')::numeric), 0),
    'balance', COALESCE(AVG((taste_scores->>'balance')::numeric), 0),
    'cleanness', COALESCE(AVG((taste_scores->>'cleanness')::numeric), 0),
    'aftertaste', COALESCE(AVG((taste_scores->>'aftertaste')::numeric), 0)
  ) INTO taste_profile_data
  FROM public.tasting_records
  WHERE user_id = target_user_id AND status = 'completed';

  -- 레벨 및 경험치 계산
  DECLARE
    total_exp INTEGER := stats_record.total_records * 10; -- 기본 10점/기록
    achievement_points INTEGER;
    user_level INTEGER := 1;
    next_level_exp INTEGER := 100;
  BEGIN
    -- 도전과제 점수 추가
    SELECT COALESCE(SUM(a.points), 0) INTO achievement_points
    FROM public.user_achievements ua
    JOIN public.achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = target_user_id AND ua.is_completed = true;
    
    total_exp := total_exp + achievement_points;
    
    -- 레벨 계산 (100, 300, 600, 1000, 1500, ...)
    WHILE total_exp >= next_level_exp LOOP
      total_exp := total_exp - next_level_exp;
      user_level := user_level + 1;
      next_level_exp := 100 + (user_level - 1) * 200;
    END LOOP;
    
    -- 통계 업데이트
    INSERT INTO public.user_stats (
      user_id,
      total_records,
      cafe_records, 
      homecafe_records,
      daily_records,
      weekly_records,
      monthly_records,
      yearly_records,
      current_streak,
      unique_coffees,
      unique_cafes,
      perfect_ratings,
      detailed_notes_count,
      photos_shared,
      morning_records,
      evening_records,
      average_rating,
      last_record_date,
      taste_profile,
      level,
      experience_points,
      next_level_exp,
      total_achievement_points,
      last_calculated_at
    ) VALUES (
      target_user_id,
      stats_record.total_records,
      stats_record.cafe_records,
      stats_record.homecafe_records,
      stats_record.daily_records,
      stats_record.weekly_records,
      stats_record.monthly_records,
      stats_record.yearly_records,
      stats_record.current_streak,
      stats_record.unique_coffees,
      stats_record.unique_cafes,
      stats_record.perfect_ratings,
      stats_record.detailed_notes_count,
      stats_record.photos_shared,
      stats_record.morning_records,
      stats_record.evening_records,
      stats_record.average_rating,
      stats_record.last_record_date,
      taste_profile_data,
      user_level,
      total_exp,
      next_level_exp,
      achievement_points,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_records = EXCLUDED.total_records,
      cafe_records = EXCLUDED.cafe_records,
      homecafe_records = EXCLUDED.homecafe_records,
      daily_records = EXCLUDED.daily_records,
      weekly_records = EXCLUDED.weekly_records,
      monthly_records = EXCLUDED.monthly_records,
      yearly_records = EXCLUDED.yearly_records,
      current_streak = EXCLUDED.current_streak,
      unique_coffees = EXCLUDED.unique_coffees,
      unique_cafes = EXCLUDED.unique_cafes,
      perfect_ratings = EXCLUDED.perfect_ratings,
      detailed_notes_count = EXCLUDED.detailed_notes_count,
      photos_shared = EXCLUDED.photos_shared,
      morning_records = EXCLUDED.morning_records,
      evening_records = EXCLUDED.evening_records,
      average_rating = EXCLUDED.average_rating,
      last_record_date = EXCLUDED.last_record_date,
      taste_profile = EXCLUDED.taste_profile,
      level = EXCLUDED.level,
      experience_points = EXCLUDED.experience_points,
      next_level_exp = EXCLUDED.next_level_exp,
      total_achievement_points = EXCLUDED.total_achievement_points,
      last_calculated_at = EXCLUDED.last_calculated_at,
      updated_at = NOW();
  END;
END;
$$ LANGUAGE plpgsql;

-- 테이스팅 기록 생성/업데이트 시 통계 자동 업데이트
CREATE OR REPLACE FUNCTION public.handle_record_stats_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 비동기로 통계 업데이트 (성능 최적화)
  PERFORM pg_notify('update_user_stats', NEW.user_id::text);
  
  -- 도전과제 진행상황 체크
  PERFORM public.check_achievement_progress(NEW.user_id, 'record_created');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_stats_on_record_change
  AFTER INSERT OR UPDATE ON public.tasting_records
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.handle_record_stats_update();

-- ============================================================================
-- 도전과제 시스템 함수
-- ============================================================================

-- 사용자 도전과제 초기화
CREATE OR REPLACE FUNCTION public.initialize_user_achievements(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- 활성화된 모든 도전과제에 대해 초기 진행상황 생성
  INSERT INTO public.user_achievements (
    user_id,
    achievement_id,
    target_progress
  )
  SELECT 
    target_user_id,
    a.id,
    (a.requirement->>'target')::integer
  FROM public.achievements a
  WHERE a.is_active = true
    AND NOT a.is_hidden
    AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      WHERE ua.user_id = target_user_id AND ua.achievement_id = a.id
    );
END;
$$ LANGUAGE plpgsql;

-- 도전과제 진행상황 체크
CREATE OR REPLACE FUNCTION public.check_achievement_progress(
  target_user_id UUID, 
  event_type TEXT,
  event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
  achievement_record RECORD;
  current_progress INTEGER;
  is_completed BOOLEAN := false;
BEGIN
  -- 모든 미완료 도전과제를 체크
  FOR achievement_record IN 
    SELECT ua.*, a.requirement, a.points, a.name
    FROM public.user_achievements ua
    JOIN public.achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = target_user_id 
      AND ua.is_completed = false
      AND a.is_active = true
  LOOP
    current_progress := 0;
    is_completed := false;
    
    -- 요구사항 타입별 진행상황 계산
    CASE achievement_record.requirement->>'type'
      WHEN 'count' THEN
        -- 단순 카운트 도전과제
        SELECT COUNT(*) INTO current_progress
        FROM public.tasting_records
        WHERE user_id = target_user_id AND status = 'completed';
        
      WHEN 'streak' THEN
        -- 연속 기록 도전과제
        SELECT current_streak INTO current_progress
        FROM public.user_stats
        WHERE user_id = target_user_id;
        
      WHEN 'unique' THEN
        -- 고유 항목 도전과제
        CASE achievement_record.requirement->>'criteria'
          WHEN 'coffees' THEN
            SELECT unique_coffees INTO current_progress
            FROM public.user_stats WHERE user_id = target_user_id;
          WHEN 'origins' THEN
            SELECT COUNT(DISTINCT coffee_data->>'origin_country') INTO current_progress
            FROM public.tasting_records 
            WHERE user_id = target_user_id AND status = 'completed';
          WHEN 'roasteries' THEN
            SELECT COUNT(DISTINCT coffee_data->>'roastery') INTO current_progress
            FROM public.tasting_records 
            WHERE user_id = target_user_id AND status = 'completed';
        END CASE;
        
      WHEN 'special' THEN
        -- 특별 조건 도전과제
        CASE achievement_record.requirement->>'criteria'
          WHEN 'perfect_ratings' THEN
            SELECT perfect_ratings INTO current_progress
            FROM public.user_stats WHERE user_id = target_user_id;
          WHEN 'morning_records' THEN
            SELECT morning_records INTO current_progress
            FROM public.user_stats WHERE user_id = target_user_id;
          WHEN 'evening_records' THEN
            SELECT evening_records INTO current_progress
            FROM public.user_stats WHERE user_id = target_user_id;
          WHEN 'detailed_notes' THEN
            SELECT detailed_notes_count INTO current_progress
            FROM public.user_stats WHERE user_id = target_user_id;
          WHEN 'photos' THEN
            SELECT photos_shared INTO current_progress
            FROM public.user_stats WHERE user_id = target_user_id;
        END CASE;
    END CASE;
    
    -- 완료 조건 체크
    is_completed := current_progress >= achievement_record.target_progress;
    
    -- 진행상황 업데이트
    UPDATE public.user_achievements
    SET 
      current_progress = GREATEST(current_progress, achievement_record.current_progress),
      is_completed = is_completed,
      completed_at = CASE WHEN is_completed THEN NOW() ELSE NULL END,
      updated_at = NOW()
    WHERE id = achievement_record.id;
    
    -- 새로 완료된 도전과제 알림
    IF is_completed AND NOT achievement_record.is_completed THEN
      PERFORM pg_notify('achievement_unlocked', jsonb_build_object(
        'user_id', target_user_id,
        'achievement_id', achievement_record.achievement_id,
        'achievement_name', achievement_record.name,
        'points', achievement_record.points
      )::text);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 커뮤니티 매치 알고리즘
-- ============================================================================

-- 맛 유사도 계산 함수
CREATE OR REPLACE FUNCTION public.calculate_taste_similarity(
  user1_profile JSONB,
  user2_profile JSONB
)
RETURNS DECIMAL AS $$
DECLARE
  similarity_score DECIMAL := 0.0;
  total_weight INTEGER := 7;
  taste_categories TEXT[] := ARRAY['acidity', 'sweetness', 'bitterness', 'body', 'balance', 'cleanness', 'aftertaste'];
  category TEXT;
  user1_score DECIMAL;
  user2_score DECIMAL;
  difference DECIMAL;
BEGIN
  -- 각 맛 카테고리별 유사도 계산
  FOREACH category IN ARRAY taste_categories
  LOOP
    user1_score := (user1_profile->>category)::DECIMAL;
    user2_score := (user2_profile->>category)::DECIMAL;
    
    -- 둘 다 값이 있는 경우만 계산
    IF user1_score IS NOT NULL AND user2_score IS NOT NULL THEN
      difference := ABS(user1_score - user2_score);
      -- 5점 척도에서 차이를 유사도로 변환 (차이가 적을수록 유사도 높음)
      similarity_score := similarity_score + (5.0 - difference) / 5.0;
    ELSE
      total_weight := total_weight - 1;
    END IF;
  END LOOP;
  
  -- 평균 유사도 반환 (0.0 ~ 1.0)
  IF total_weight > 0 THEN
    RETURN similarity_score / total_weight;
  ELSE
    RETURN 0.0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 커뮤니티 매치 찾기
CREATE OR REPLACE FUNCTION public.find_taste_matches(target_user_id UUID, coffee_id UUID)
RETURNS void AS $$
DECLARE
  target_user_record RECORD;
  potential_match RECORD;
  similarity_score DECIMAL;
BEGIN
  -- 타겟 사용자의 해당 커피에 대한 기록 조회
  SELECT tr.*, us.taste_profile
  INTO target_user_record
  FROM public.tasting_records tr
  JOIN public.user_stats us ON tr.user_id = us.user_id
  WHERE tr.user_id = target_user_id 
    AND tr.coffee_id = coffee_id 
    AND tr.status = 'completed'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- 같은 커피를 마신 다른 사용자들과 매치
  FOR potential_match IN
    SELECT DISTINCT tr.user_id, us.taste_profile, p.allow_match_requests
    FROM public.tasting_records tr
    JOIN public.user_stats us ON tr.user_id = us.user_id
    JOIN public.profiles p ON tr.user_id = p.id
    WHERE tr.coffee_id = coffee_id 
      AND tr.user_id != target_user_id
      AND tr.status = 'completed'
      AND p.allow_match_requests = true
      AND NOT EXISTS (
        SELECT 1 FROM public.taste_matches tm
        WHERE tm.coffee_id = coffee_id
          AND ((tm.user_id = target_user_id AND tm.target_user_id = tr.user_id)
               OR (tm.user_id = tr.user_id AND tm.target_user_id = target_user_id))
      )
  LOOP
    -- 맛 유사도 계산
    similarity_score := public.calculate_taste_similarity(
      target_user_record.taste_profile,
      potential_match.taste_profile
    );
    
    -- 유사도가 70% 이상인 경우만 매치 생성
    IF similarity_score >= 0.7 THEN
      INSERT INTO public.taste_matches (
        user_id,
        target_user_id,
        coffee_id,
        match_type,
        similarity_score,
        taste_correlation,
        matching_aspects
      ) VALUES (
        target_user_id,
        potential_match.user_id,
        coffee_id,
        'same_coffee',
        similarity_score,
        similarity_score,
        jsonb_build_object(
          'taste_similarity', similarity_score,
          'coffee_match', true
        )
      );
      
      -- 매치 알림
      PERFORM pg_notify('taste_match_found', jsonb_build_object(
        'user_id', target_user_id,
        'match_user_id', potential_match.user_id,
        'coffee_id', coffee_id,
        'similarity_score', similarity_score
      )::text);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 검색 최적화 함수
-- ============================================================================

-- 커피 검색 함수
CREATE OR REPLACE FUNCTION public.search_coffees(
  search_query TEXT,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  roastery TEXT,
  origin_country TEXT,
  origin_region TEXT,
  roast_level INTEGER,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.roastery,
    c.origin_country,
    c.origin_region,
    c.roast_level,
    ts_rank(c.search_vector, plainto_tsquery('korean', search_query)) as similarity
  FROM public.coffees c
  WHERE c.search_vector @@ plainto_tsquery('korean', search_query)
  ORDER BY similarity DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 카페 검색 함수
CREATE OR REPLACE FUNCTION public.search_cafes(
  search_query TEXT,
  lat DECIMAL DEFAULT NULL,
  lng DECIMAL DEFAULT NULL,
  radius_km INTEGER DEFAULT 5,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  district TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km REAL,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.address,
    c.district,
    c.latitude,
    c.longitude,
    CASE 
      WHEN lat IS NOT NULL AND lng IS NOT NULL AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN
        ST_Distance(
          ST_Point(lng, lat)::geography,
          ST_Point(c.longitude, c.latitude)::geography
        ) / 1000.0 -- meters to km
      ELSE NULL
    END as distance_km,
    ts_rank(c.search_vector, plainto_tsquery('korean', search_query)) as similarity
  FROM public.cafes c
  WHERE c.search_vector @@ plainto_tsquery('korean', search_query)
    AND (
      lat IS NULL OR lng IS NULL OR c.latitude IS NULL OR c.longitude IS NULL
      OR ST_DWithin(
        ST_Point(lng, lat)::geography,
        ST_Point(c.longitude, c.latitude)::geography,
        radius_km * 1000
      )
    )
  ORDER BY 
    CASE WHEN distance_km IS NOT NULL THEN distance_km ELSE 999999 END ASC,
    similarity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 데이터 정리 및 유지보수 함수
-- ============================================================================

-- 만료된 Draft 정리
CREATE OR REPLACE FUNCTION public.cleanup_expired_drafts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 만료된 Draft 삭제
  DELETE FROM public.drafts
  WHERE expires_at < NOW() OR is_expired = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- 로그 기록
  PERFORM public.log_security_event('cleanup_expired_drafts', jsonb_build_object(
    'deleted_count', deleted_count
  ));
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 통계 전체 재계산 (배치 작업용)
CREATE OR REPLACE FUNCTION public.recalculate_all_user_stats()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id FROM public.tasting_records
  LOOP
    PERFORM public.update_user_stats(user_record.user_id);
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 알림 및 이벤트 처리 함수
-- ============================================================================

-- 주간 요약 데이터 생성
CREATE OR REPLACE FUNCTION public.generate_weekly_summary(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  summary_data JSONB;
  week_records INTEGER;
  week_achievements INTEGER;
  popular_flavors TEXT[];
BEGIN
  -- 이번 주 기록 수
  SELECT COUNT(*) INTO week_records
  FROM public.tasting_records
  WHERE user_id = target_user_id 
    AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND status = 'completed';
  
  -- 이번 주 새 도전과제
  SELECT COUNT(*) INTO week_achievements
  FROM public.user_achievements
  WHERE user_id = target_user_id 
    AND completed_at >= CURRENT_DATE - INTERVAL '7 days';
  
  -- 이번 주 인기 플레이버
  SELECT ARRAY_AGG(DISTINCT flavor ORDER BY flavor_count DESC) INTO popular_flavors
  FROM (
    SELECT unnest(flavor_notes) as flavor, COUNT(*) as flavor_count
    FROM public.tasting_records
    WHERE user_id = target_user_id 
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      AND status = 'completed'
    GROUP BY flavor
    LIMIT 5
  ) flavor_stats;
  
  summary_data := jsonb_build_object(
    'week_records', week_records,
    'week_achievements', week_achievements,
    'popular_flavors', popular_flavors,
    'generated_at', NOW()
  );
  
  RETURN summary_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 성능 모니터링 함수
-- ============================================================================

-- 느린 쿼리 분석
CREATE OR REPLACE FUNCTION public.analyze_query_performance()
RETURNS TABLE (
  query_type TEXT,
  avg_duration INTERVAL,
  call_count BIGINT,
  total_duration INTERVAL
) AS $$
BEGIN
  -- PostgreSQL의 pg_stat_statements 확장이 필요
  RETURN QUERY
  SELECT 
    CASE 
      WHEN query ILIKE '%tasting_records%' THEN 'tasting_records'
      WHEN query ILIKE '%user_stats%' THEN 'user_stats'
      WHEN query ILIKE '%achievements%' THEN 'achievements'
      ELSE 'other'
    END as query_type,
    (total_exec_time / calls * INTERVAL '1 millisecond') as avg_duration,
    calls as call_count,
    (total_exec_time * INTERVAL '1 millisecond') as total_duration
  FROM pg_stat_statements
  WHERE query LIKE '%public.%'
    AND calls > 10
  ORDER BY total_exec_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 함수 권한 설정
-- ============================================================================

-- 인증된 사용자가 호출 가능한 함수들
GRANT EXECUTE ON FUNCTION public.update_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_achievement_progress(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_taste_matches(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_coffees(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_cafes(TEXT, DECIMAL, DECIMAL, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_weekly_summary(UUID) TO authenticated;

-- 시스템 전용 함수들
GRANT EXECUTE ON FUNCTION public.cleanup_expired_drafts() TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_all_user_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.analyze_query_performance() TO service_role;