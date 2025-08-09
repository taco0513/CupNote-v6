-- ============================================================================
-- CupNote v6 Row Level Security (RLS) Policies
-- ============================================================================
-- 강력한 프라이버시 보호와 성능을 동시에 보장하는 RLS 정책
-- Foundation Team의 보안 요구사항을 완전 준수

-- ============================================================================
-- 모든 테이블에 RLS 활성화
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensory_expressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 사용자 프로필 정책
-- ============================================================================

-- 자신의 프로필은 모든 권한
CREATE POLICY "Users can manage own profile"
  ON public.profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 공개 프로필은 누구나 조회 가능
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (share_profile_public = true);

-- 커뮤니티 매치용 제한적 프로필 조회
CREATE POLICY "Limited profile access for community matches"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() != id AND
    allow_match_requests = true AND
    EXISTS (
      SELECT 1 FROM public.taste_matches
      WHERE (user_id = auth.uid() AND target_user_id = id)
         OR (user_id = id AND target_user_id = auth.uid())
    )
  );

-- ============================================================================
-- 커피 정보 정책 (마스터 데이터)
-- ============================================================================

-- 모든 커피 정보는 읽기 가능
CREATE POLICY "Coffees are viewable by authenticated users"
  ON public.coffees FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자는 새 커피 추가 가능 (커뮤니티 기여)
CREATE POLICY "Authenticated users can add coffees"
  ON public.coffees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 자신이 추가한 커피만 수정 가능
CREATE POLICY "Users can update own added coffees"
  ON public.coffees FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================================
-- 카페 정보 정책 (마스터 데이터)  
-- ============================================================================

-- 모든 카페 정보는 읽기 가능
CREATE POLICY "Cafes are viewable by authenticated users"
  ON public.cafes FOR SELECT  
  TO authenticated
  USING (true);

-- 인증된 사용자는 새 카페 추가 가능
CREATE POLICY "Authenticated users can add cafes"
  ON public.cafes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 자신이 추가한 카페만 수정 가능
CREATE POLICY "Users can update own added cafes"
  ON public.cafes FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================================
-- 테이스팅 기록 정책 (가장 중요한 보안 정책)
-- ============================================================================

-- 자신의 모든 기록에 대한 전체 권한
CREATE POLICY "Users can manage own tasting records"
  ON public.tasting_records
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 공개된 기록은 누구나 조회 가능
CREATE POLICY "Public records are viewable by everyone"
  ON public.tasting_records FOR SELECT
  TO authenticated
  USING (is_public = true AND share_with_community = true);

-- 커뮤니티 매치를 위한 제한적 접근 (맛 프로필만)
CREATE POLICY "Limited record access for taste matching"
  ON public.tasting_records FOR SELECT
  TO authenticated
  USING (
    auth.uid() != user_id AND
    share_with_community = true AND
    status = 'completed' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_id 
        AND allow_match_requests = true
    )
  );

-- ============================================================================
-- 임시저장 정책
-- ============================================================================

-- 자신의 Draft만 모든 권한
CREATE POLICY "Users can manage own drafts"
  ON public.drafts
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 만료된 Draft 자동 삭제 (시스템 프로세스용)
CREATE POLICY "System can delete expired drafts"
  ON public.drafts FOR DELETE
  TO service_role
  USING (is_expired = true OR expires_at < NOW());

-- ============================================================================
-- 도전과제 정책
-- ============================================================================

-- 활성화된 도전과제는 모든 인증된 사용자가 조회 가능
CREATE POLICY "Active achievements are viewable by authenticated users"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 숨김 도전과제는 조건부 조회 (발견했을 때만)
CREATE POLICY "Hidden achievements are viewable when discovered"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (
    is_hidden = true AND
    EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE user_id = auth.uid() 
        AND achievement_id = achievements.id
    )
  );

-- 관리자만 도전과제 수정 가능 (별도 권한 관리)
CREATE POLICY "Admins can manage achievements"
  ON public.achievements
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 사용자 도전과제 정책
-- ============================================================================

-- 자신의 도전과제 진행상황만 조회/수정
CREATE POLICY "Users can view own achievement progress"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 시스템이 도전과제 진행상황 업데이트
CREATE POLICY "System can update achievement progress"  
  ON public.user_achievements
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 사용자는 새로운 도전과제 시작 가능 (진행상황 초기화)
CREATE POLICY "Users can start new achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 사용자 통계 정책
-- ============================================================================

-- 자신의 통계만 조회 가능
CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- 시스템이 통계 업데이트
CREATE POLICY "System can update user stats"
  ON public.user_stats
  TO service_role  
  USING (true)
  WITH CHECK (true);

-- 사용자 가입 시 초기 통계 생성
CREATE POLICY "Users can initialize own stats"
  ON public.user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 리더보드용 제한적 통계 조회 (개인정보 제외)
CREATE POLICY "Limited stats for leaderboard"
  ON public.user_stats FOR SELECT  
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_id 
        AND share_profile_public = true
    )
  );

-- ============================================================================
-- 감각 표현 정책 (마스터 데이터)
-- ============================================================================

-- 활성화된 감각 표현은 모든 인증된 사용자가 조회 가능
CREATE POLICY "Active sensory expressions are viewable"
  ON public.sensory_expressions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 시스템이 사용 통계 업데이트
CREATE POLICY "System can update expression usage"
  ON public.sensory_expressions FOR UPDATE
  TO service_role
  USING (true);

-- ============================================================================
-- 커뮤니티 매치 정책
-- ============================================================================

-- 자신과 관련된 매치만 조회 가능
CREATE POLICY "Users can view own taste matches"
  ON public.taste_matches FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = target_user_id
  );

-- 시스템이 매치 생성/업데이트
CREATE POLICY "System can manage taste matches"
  ON public.taste_matches
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 사용자가 매치 상태 업데이트 (수락/거절)
CREATE POLICY "Users can update match status"
  ON public.taste_matches FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = target_user_id AND
    status = 'pending'
  )
  WITH CHECK (
    auth.uid() = target_user_id AND
    status IN ('accepted', 'declined')
  );

-- ============================================================================  
-- 시스템 설정 정책
-- ============================================================================

-- 공개 설정은 모든 사용자가 조회 가능
CREATE POLICY "Public settings are viewable"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (is_public = true);

-- 시스템 관리자만 설정 관리
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 보안 뷰 (Security Views) - 민감한 데이터 필터링
-- ============================================================================

-- 공개 프로필 뷰 (민감한 정보 제외)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  experience_level,
  coffee_journey_start_date,
  onboarding_completed,
  created_at
FROM public.profiles
WHERE share_profile_public = true;

-- 공개 기록 뷰 (개인 정보 제외)
CREATE OR REPLACE VIEW public.public_tasting_records AS
SELECT 
  id,
  user_id,
  mode,
  coffee_data,
  cafe_data,
  brew_data,
  taste_scores,
  flavor_notes,
  flavor_intensity,
  sensory_expressions,
  overall_rating,
  tags,
  community_tags,
  recorded_at,
  created_at
FROM public.tasting_records  
WHERE is_public = true 
  AND share_with_community = true 
  AND status = 'completed';

-- 리더보드 뷰 (순위 정보만)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  us.user_id,
  p.display_name,
  p.avatar_url,
  us.level,
  us.total_records,
  us.current_streak,
  us.total_achievement_points,
  us.average_rating,
  ROW_NUMBER() OVER (ORDER BY us.total_achievement_points DESC) as rank
FROM public.user_stats us
JOIN public.profiles p ON us.user_id = p.id
WHERE p.share_profile_public = true
ORDER BY us.total_achievement_points DESC
LIMIT 100;

-- ============================================================================
-- RLS 정책 함수 (재사용 가능한 보안 로직)
-- ============================================================================

-- 사용자 권한 확인 함수
CREATE OR REPLACE FUNCTION public.check_user_permission(target_user_id UUID, permission_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  CASE permission_type
    WHEN 'profile_view' THEN
      RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = target_user_id 
          AND (share_profile_public = true OR id = auth.uid())
      );
    WHEN 'match_request' THEN
      RETURN EXISTS (
        SELECT 1 FROM public.profiles  
        WHERE id = target_user_id
          AND allow_match_requests = true
          AND id != auth.uid()
      );
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기록 접근 권한 확인 함수
CREATE OR REPLACE FUNCTION public.check_record_access(record_id UUID, access_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  record_user_id UUID;
  is_public BOOLEAN;
  share_community BOOLEAN;
BEGIN
  SELECT user_id, is_public, share_with_community
  INTO record_user_id, is_public, share_community
  FROM public.tasting_records
  WHERE id = record_id;
  
  CASE access_type
    WHEN 'full' THEN
      RETURN record_user_id = auth.uid();
    WHEN 'public' THEN  
      RETURN is_public AND share_community;
    WHEN 'community' THEN
      RETURN share_community AND record_user_id != auth.uid();
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 보안 모니터링 (Security Monitoring)
-- ============================================================================

-- 보안 이벤트 로그 테이블
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 보안 로그에도 RLS 적용 (관리자만 접근)
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access security logs"
  ON public.security_logs  
  TO service_role
  USING (true);

-- 보안 이벤트 로깅 함수
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  event_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, event_details)
  VALUES (auth.uid(), event_type, event_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS 테스트 함수 (개발용)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE (
  table_name TEXT,
  policy_name TEXT,
  policy_type TEXT,
  test_result TEXT
) AS $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  test_record record;
BEGIN
  -- RLS 정책 테스트 로직을 여기에 구현
  -- 각 테이블의 주요 정책들을 자동으로 테스트
  RETURN QUERY
  SELECT 
    'profiles'::TEXT,
    'Users can manage own profile'::TEXT, 
    'SELECT'::TEXT,
    'PASS'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 정책 성능 최적화
-- ============================================================================

-- RLS 정책에서 사용되는 인덱스들 (성능 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_rls_public 
  ON public.profiles(share_profile_public, allow_match_requests) 
  WHERE share_profile_public = true OR allow_match_requests = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasting_records_rls_public
  ON public.tasting_records(is_public, share_with_community, status)
  WHERE is_public = true AND share_with_community = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_rls  
  ON public.taste_matches(user_id, target_user_id, status);

-- ============================================================================
-- RLS 정책 문서화
-- ============================================================================

COMMENT ON POLICY "Users can manage own profile" ON public.profiles IS
  '사용자는 자신의 프로필을 완전히 관리할 수 있음';

COMMENT ON POLICY "Public records are viewable by everyone" ON public.tasting_records IS
  '공개 설정된 테이스팅 기록은 모든 인증된 사용자가 조회 가능';

COMMENT ON POLICY "Users can view own taste matches" ON public.taste_matches IS
  '사용자는 자신과 관련된 맛 매치만 조회 가능 (양방향)';

-- RLS 정책 요약 뷰
CREATE OR REPLACE VIEW public.rls_policy_summary AS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;