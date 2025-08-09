-- ============================================================================
-- CupNote v6 Performance Optimization Indexes
-- ============================================================================
-- 쿼리 성능을 100ms 이하로 보장하는 최적화된 인덱스 모음
-- 실제 사용 패턴을 기반으로 설계됨

-- ============================================================================
-- 기본 성능 모니터링 설정
-- ============================================================================

-- 쿼리 통계 수집 활성화 (개발환경)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 인덱스 사용률 모니터링 뷰
CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 100 THEN 'LOW_USAGE'
    WHEN idx_scan < 1000 THEN 'MODERATE_USAGE'
    ELSE 'HIGH_USAGE'
  END as usage_level
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================================================
-- 1. 테이스팅 기록 (tasting_records) - 가장 중요한 성능 최적화
-- ============================================================================

-- 사용자별 최신 기록 조회 (가장 자주 사용되는 쿼리)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_user_recent
  ON public.tasting_records(user_id, recorded_at DESC, status)
  WHERE status = 'completed';

-- 사용자별 모드별 기록 조회
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_user_mode_recent  
  ON public.tasting_records(user_id, mode, recorded_at DESC)
  WHERE status = 'completed';

-- 공개 기록 조회 (커뮤니티 피드용)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_public_feed
  ON public.tasting_records(is_public, share_with_community, recorded_at DESC)
  WHERE is_public = true AND share_with_community = true AND status = 'completed';

-- 커피별 기록 조회 (커뮤니티 매치용)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_coffee_community
  ON public.tasting_records(coffee_id, share_with_community, user_id)
  WHERE coffee_id IS NOT NULL AND share_with_community = true AND status = 'completed';

-- 평점별 검색 (고평점 커피 찾기)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_rating_public
  ON public.tasting_records(overall_rating DESC, recorded_at DESC)
  WHERE is_public = true AND status = 'completed';

-- 태그 기반 검색 (GIN 인덱스)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_tags_gin
  ON public.tasting_records USING GIN(tags)
  WHERE array_length(tags, 1) > 0;

-- 향미 노트 검색 (GIN 인덱스) 
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_flavors_gin
  ON public.tasting_records USING GIN(flavor_notes)
  WHERE array_length(flavor_notes, 1) > 0;

-- 감각 표현 검색 (GIN 인덱스)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_sensory_gin
  ON public.tasting_records USING GIN(sensory_expressions)
  WHERE sensory_expressions IS NOT NULL;

-- Draft 상태 기록 (임시저장 관리)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_draft
  ON public.tasting_records(user_id, status, updated_at DESC)
  WHERE status IN ('draft', 'in_progress');

-- 시간대별 분석용 (통계 계산 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_time_analysis
  ON public.tasting_records(user_id, extract(hour from recorded_at), recorded_at)
  WHERE status = 'completed';

-- ============================================================================
-- 2. 사용자 통계 (user_stats) - 리더보드 및 랭킹 최적화
-- ============================================================================

-- 총 기록 수 기준 랭킹
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_total_records_rank
  ON public.user_stats(total_records DESC, user_id);

-- 레벨 기준 랭킹
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_level_rank
  ON public.user_stats(level DESC, experience_points DESC, user_id);

-- 연속 기록 기준 랭킹
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_streak_rank
  ON public.user_stats(current_streak DESC, total_records DESC, user_id);

-- 도전과제 포인트 기준 랭킹
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_achievement_rank
  ON public.user_stats(total_achievement_points DESC, level DESC, user_id);

-- 평균 평점 기준 (품질 중심 랭킹)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_rating_rank
  ON public.user_stats(average_rating DESC, total_records DESC)
  WHERE total_records >= 10; -- 최소 10개 기록이 있는 사용자만

-- 최근 활동 기준 (활성 사용자 식별)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_last_activity
  ON public.user_stats(last_record_date DESC NULLS LAST, total_records DESC);

-- 맛 프로필 분석용 (GIN 인덱스)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_taste_profile_gin
  ON public.user_stats USING GIN(taste_profile);

-- ============================================================================
-- 3. 도전과제 시스템 (achievements, user_achievements) 최적화
-- ============================================================================

-- 활성 도전과제 조회
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_active_category
  ON public.achievements(is_active, category, sort_order)
  WHERE is_active = true;

-- 희귀도별 도전과제
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_rarity
  ON public.achievements(rarity, points DESC, sort_order);

-- 사용자별 도전과제 진행상황 (가장 중요)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_progress
  ON public.user_achievements(user_id, is_completed, current_progress DESC);

-- 완료된 도전과제 조회 (최신순)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_completed
  ON public.user_achievements(user_id, completed_at DESC)
  WHERE is_completed = true;

-- 미완료 도전과제 (진행률 높은 순)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_incomplete
  ON public.user_achievements(user_id, current_progress DESC, target_progress)
  WHERE is_completed = false;

-- 도전과제별 완료 통계 (관리자용)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_stats
  ON public.user_achievements(achievement_id, is_completed, completed_at);

-- ============================================================================
-- 4. 커뮤니티 매치 (taste_matches) 최적화
-- ============================================================================

-- 사용자별 매치 조회 (양방향)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_user_bidirectional
  ON public.taste_matches(user_id, status, similarity_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_target_bidirectional
  ON public.taste_matches(target_user_id, status, similarity_score DESC);

-- 커피별 매치 조회
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_coffee
  ON public.taste_matches(coffee_id, similarity_score DESC, calculated_at DESC);

-- 높은 유사도 매치 조회
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_high_similarity
  ON public.taste_matches(similarity_score DESC, calculated_at DESC)
  WHERE similarity_score >= 0.8;

-- 상호 매치 조회 (mutual matches)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_mutual
  ON public.taste_matches(is_mutual, similarity_score DESC)
  WHERE is_mutual = true;

-- 만료 관리
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_expiry
  ON public.taste_matches(expires_at)
  WHERE status = 'pending';

-- ============================================================================
-- 5. 커피/카페 마스터 데이터 최적화
-- ============================================================================

-- 커피 검색 최적화 (기존 search_vector 인덱스 보강)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coffees_roastery_origin
  ON public.coffees(roastery, origin_country, roast_level);

-- 인기 커피 조회 (통계 기반)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coffees_popularity
  ON public.coffees(is_verified DESC, created_at DESC);

-- 로스트 레벨별 검색
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coffees_roast_level_name
  ON public.coffees(roast_level, name);

-- 원산지별 검색
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coffees_origin_detailed
  ON public.coffees(origin_country, origin_region, variety);

-- 카페 위치 기반 검색 (PostGIS 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafes_location_gist
  ON public.cafes USING GIST(ST_Point(longitude, latitude))
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 카페 지역별 검색
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafes_district_name
  ON public.cafes(district, neighborhood, name);

-- 인기 카페 (방문 수 기준)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafes_popularity
  ON public.cafes(total_visits DESC, average_atmosphere DESC);

-- ============================================================================
-- 6. 프로필 및 사용자 관련 최적화
-- ============================================================================

-- 공개 프로필 검색
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_public_search
  ON public.profiles(share_profile_public, experience_level, created_at DESC)
  WHERE share_profile_public = true;

-- 매치 허용 사용자
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_match_enabled
  ON public.profiles(allow_match_requests, experience_level)
  WHERE allow_match_requests = true;

-- 경험 레벨별 분류
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_experience_level
  ON public.profiles(experience_level, coffee_journey_start_date);

-- ============================================================================
-- 7. 임시저장 (drafts) 최적화  
-- ============================================================================

-- 사용자별 임시저장 조회 (최신순)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drafts_user_recent
  ON public.drafts(user_id, updated_at DESC)
  WHERE is_expired = false;

-- 만료 관리 (배치 작업용)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drafts_expiry_management
  ON public.drafts(expires_at, is_expired)
  WHERE is_expired = false;

-- 모드별 Draft
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drafts_mode
  ON public.drafts(user_id, mode, updated_at DESC);

-- ============================================================================
-- 8. 감각 표현 (sensory_expressions) 최적화
-- ============================================================================

-- 카테고리별 표현 조회
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensory_expressions_category_usage
  ON public.sensory_expressions(category, usage_count DESC, sort_order);

-- 사용 빈도별 정렬
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensory_expressions_popularity
  ON public.sensory_expressions(usage_count DESC, category)
  WHERE is_active = true;

-- 강도별 정렬
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensory_expressions_intensity
  ON public.sensory_expressions(category, intensity_level, sort_order);

-- ============================================================================
-- 9. 보안 및 감사 로그 최적화
-- ============================================================================

-- 보안 이벤트 로그 (시간 기반 조회)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_time_event
  ON public.security_logs(created_at DESC, event_type, user_id);

-- 사용자별 보안 이벤트
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_user
  ON public.security_logs(user_id, created_at DESC, event_type);

-- 이벤트 타입별 분석
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_event_type
  ON public.security_logs(event_type, created_at DESC);

-- ============================================================================
-- 10. 복합 인덱스 (실제 쿼리 패턴 기반)
-- ============================================================================

-- 사용자의 최근 카페/홈카페 기록 혼합 조회
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_user_mixed_recent
  ON public.tasting_records(user_id, recorded_at DESC, mode, status)
  WHERE status = 'completed';

-- 공개 기록의 평점과 태그 기반 필터링
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_public_filter
  ON public.tasting_records(is_public, overall_rating DESC, recorded_at DESC)
  WHERE is_public = true AND status = 'completed' AND array_length(tags, 1) > 0;

-- 커뮤니티 매치를 위한 복합 조회
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_community_match
  ON public.tasting_records(coffee_id, share_with_community, user_id, status)
  WHERE coffee_id IS NOT NULL AND share_with_community = true;

-- 사용자 통계와 프로필 조인 최적화 (리더보드용)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_profile_join
  ON public.user_stats(total_achievement_points DESC, level DESC, user_id)
  INCLUDE (total_records, current_streak, average_rating);

-- ============================================================================
-- 11. 파티셔닝 준비 (대용량 데이터 대비)
-- ============================================================================

-- 테이스팅 기록 월별 파티셔닝을 위한 인덱스 (미래 확장용)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_partition_key
--   ON public.tasting_records(date_trunc('month', recorded_at), user_id);

-- 보안 로그 일별 파티셔닝을 위한 인덱스
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_partition_key
--   ON public.security_logs(date_trunc('day', created_at), user_id);

-- ============================================================================
-- 12. 성능 모니터링 및 최적화 뷰
-- ============================================================================

-- 테이블별 인덱스 히트율 모니터링
CREATE OR REPLACE VIEW public.table_index_efficiency AS
SELECT 
  schemaname,
  tablename,
  seq_scan + idx_scan as total_scans,
  CASE 
    WHEN seq_scan + idx_scan > 0 THEN
      ROUND((idx_scan::REAL / (seq_scan + idx_scan)) * 100, 2)
    ELSE 0
  END as index_hit_ratio,
  seq_scan,
  idx_scan,
  n_tup_ins + n_tup_upd + n_tup_del as total_writes,
  n_live_tup as estimated_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY index_hit_ratio ASC;

-- 느린 쿼리 패턴 분석
CREATE OR REPLACE VIEW public.slow_query_patterns AS
SELECT 
  CASE 
    WHEN query ILIKE '%tasting_records%user_id%ORDER BY%recorded_at%' THEN 'User Recent Records'
    WHEN query ILIKE '%tasting_records%is_public%share_with_community%' THEN 'Public Feed Query'
    WHEN query ILIKE '%user_stats%ORDER BY%total_records%' THEN 'Leaderboard Query'
    WHEN query ILIKE '%taste_matches%user_id%similarity_score%' THEN 'Taste Match Query'
    WHEN query ILIKE '%achievements%user_achievements%' THEN 'Achievement Query'
    ELSE 'Other'
  END as query_pattern,
  COUNT(*) as query_count,
  ROUND(AVG(total_exec_time), 2) as avg_exec_time_ms,
  ROUND(AVG(rows), 0) as avg_rows_returned
FROM pg_stat_statements
WHERE query LIKE '%public.%'
  AND calls > 5
GROUP BY query_pattern
ORDER BY avg_exec_time_ms DESC;

-- 인덱스 크기 및 효율성 모니터링  
CREATE OR REPLACE VIEW public.index_size_efficiency AS
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan,
  idx_tup_read,
  CASE 
    WHEN idx_scan > 0 THEN ROUND(idx_tup_read::REAL / idx_scan, 2)
    ELSE 0
  END as avg_tuples_per_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- 13. 인덱스 유지보수 함수
-- ============================================================================

-- 미사용 인덱스 식별
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
    s.schemaname,
    s.tablename, 
    s.indexname,
    pg_size_pretty(pg_relation_size(s.indexrelid)) as index_size,
    s.idx_scan as scan_count
  FROM pg_stat_user_indexes s
  WHERE s.schemaname = 'public'
    AND s.idx_scan < 100  -- 100번 미만 사용된 인덱스
    AND s.indexname NOT LIKE '%_pkey'  -- Primary key 제외
  ORDER BY s.idx_scan ASC, pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 인덱스 재구성 권장사항
CREATE OR REPLACE FUNCTION public.recommend_index_maintenance()
RETURNS TABLE (
  table_name TEXT,
  recommendation TEXT,
  priority TEXT,
  details TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH index_stats AS (
    SELECT 
      schemaname,
      tablename,
      indexname,
      idx_scan,
      pg_relation_size(indexrelid) as index_size,
      CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 50 THEN 'RARELY_USED'
        ELSE 'WELL_USED'
      END as usage_category
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
  )
  SELECT 
    i.tablename::TEXT,
    CASE 
      WHEN i.usage_category = 'UNUSED' THEN 'Consider dropping unused index'
      WHEN i.usage_category = 'RARELY_USED' THEN 'Review index necessity'
      WHEN i.index_size > 100 * 1024 * 1024 THEN 'Monitor large index performance'
      ELSE 'Index is performing well'
    END::TEXT as recommendation,
    CASE 
      WHEN i.usage_category = 'UNUSED' AND i.index_size > 10 * 1024 * 1024 THEN 'HIGH'
      WHEN i.usage_category = 'RARELY_USED' THEN 'MEDIUM' 
      ELSE 'LOW'
    END::TEXT as priority,
    format('Index: %s, Size: %s, Scans: %s', 
           i.indexname, 
           pg_size_pretty(i.index_size), 
           i.idx_scan)::TEXT as details
  FROM index_stats i
  WHERE i.usage_category IN ('UNUSED', 'RARELY_USED')
     OR i.index_size > 100 * 1024 * 1024
  ORDER BY 
    CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
    i.index_size DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 권한 설정
-- ============================================================================

-- 인증된 사용자가 성능 통계 조회 가능
GRANT SELECT ON public.index_usage_stats TO authenticated;
GRANT SELECT ON public.table_index_efficiency TO authenticated;
GRANT SELECT ON public.slow_query_patterns TO authenticated;
GRANT SELECT ON public.index_size_efficiency TO authenticated;

-- 시스템 관리자만 유지보수 함수 실행 가능
GRANT EXECUTE ON FUNCTION public.identify_unused_indexes() TO service_role;
GRANT EXECUTE ON FUNCTION public.recommend_index_maintenance() TO service_role;

-- ============================================================================
-- 인덱스 생성 완료 로그
-- ============================================================================

-- 인덱스 생성 완료를 시스템 설정에 기록
INSERT INTO public.system_settings (key, value, description, category) 
VALUES (
  'indexes_optimized',
  jsonb_build_object(
    'version', '1.0.0',
    'created_at', NOW(),
    'total_indexes', (
      SELECT COUNT(*) FROM pg_indexes 
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
    ),
    'performance_target', '< 100ms for 95% of queries'
  ),
  'Database performance optimization indexes applied',
  'performance'
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 성능 최적화 완료 알림
SELECT 'CupNote v6 Database Indexes Optimized Successfully' as status;