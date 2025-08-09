-- ============================================================================
-- CupNote v6 Achievement Seed Data
-- ============================================================================
-- 30+ 도전과제로 구성된 완전한 게임화 시스템
-- 한국 커피 문화에 최적화된 도전과제들

-- ============================================================================
-- 1. 기본 시작 도전과제 (quantity - 수량 기반)
-- ============================================================================

INSERT INTO public.achievements (
  name, name_en, description, description_en, icon_emoji, category, requirement, points, rarity, sort_order
) VALUES 
  -- 첫 걸음 시리즈
  (
    '첫 발걸음', 'First Steps',
    '첫 번째 커피 기록을 완성했어요! 커피 여행의 시작입니다.', 'Completed your first coffee record! Your coffee journey begins.',
    '👶', 'quantity',
    jsonb_build_object('type', 'count', 'target', 1, 'criteria', 'total_records'),
    10, 'common', 1
  ),
  (
    '커피 애호가', 'Coffee Enthusiast', 
    '10잔의 커피를 기록했어요. 진정한 커피 애호가네요!', 'Recorded 10 cups of coffee. You''re a true coffee enthusiast!',
    '☕', 'quantity',
    jsonb_build_object('type', 'count', 'target', 10, 'criteria', 'total_records'),
    50, 'common', 2
  ),
  (
    '커피 중독자', 'Coffee Addict',
    '50잔의 커피를 기록했어요. 이제 진짜 중독이군요!', 'Recorded 50 cups of coffee. Now you''re truly addicted!',
    '🤤', 'quantity', 
    jsonb_build_object('type', 'count', 'target', 50, 'criteria', 'total_records'),
    150, 'uncommon', 3
  ),
  (
    '커피 마스터', 'Coffee Master',
    '100잔의 커피를 기록했어요. 당신은 진정한 커피 마스터입니다!', 'Recorded 100 cups of coffee. You are a true Coffee Master!',
    '🏆', 'quantity',
    jsonb_build_object('type', 'count', 'target', 100, 'criteria', 'total_records'),
    300, 'rare', 4
  ),
  (
    '커피 전설', 'Coffee Legend',
    '500잔의 커피를 기록했어요. 전설이 되셨습니다!', 'Recorded 500 cups of coffee. You''ve become a legend!',
    '👑', 'quantity',
    jsonb_build_object('type', 'count', 'target', 500, 'criteria', 'total_records'),
    1000, 'legendary', 5
  ),

-- ============================================================================  
-- 2. 연속 기록 도전과제 (streak - 습관 형성)
-- ============================================================================

  -- 연속 기록 시리즈
  (
    '3일 연속', '3 Day Streak',
    '3일 연속으로 커피를 기록했어요. 좋은 습관이에요!', 'Recorded coffee for 3 consecutive days. Great habit!',
    '🔥', 'quantity',
    jsonb_build_object('type', 'streak', 'target', 3, 'criteria', 'daily_streak'),
    20, 'common', 10
  ),
  (
    '일주일 연속', '7 Day Streak', 
    '일주일 연속으로 커피를 기록했어요. 꾸준함이 최고!', 'Recorded coffee for 7 consecutive days. Consistency is key!',
    '📅', 'quantity',
    jsonb_build_object('type', 'streak', 'target', 7, 'criteria', 'daily_streak'),
    50, 'uncommon', 11
  ),
  (
    '한 달 연속', '30 Day Streak',
    '30일 연속으로 커피를 기록했어요. 놀라운 꾸준함입니다!', 'Recorded coffee for 30 consecutive days. Amazing consistency!',
    '🏃', 'quantity',
    jsonb_build_object('type', 'streak', 'target', 30, 'criteria', 'daily_streak'),
    200, 'rare', 12
  ),
  (
    '백일장', '100 Day Streak',
    '100일 연속 기록! 이제 커피는 당신의 일상이 되었어요.', '100 days straight! Coffee has become part of your daily routine.',
    '💪', 'quantity',
    jsonb_build_object('type', 'streak', 'target', 100, 'criteria', 'daily_streak'),
    500, 'epic', 13
  ),

-- ============================================================================
-- 3. 다양성 탐험 도전과제 (variety - 탐험가 정신)
-- ============================================================================

  -- 다양한 커피 경험
  (
    '커피 탐험가', 'Coffee Explorer',
    '10종류의 서로 다른 커피를 마셨어요. 탐험가 정신이 훌륭해요!', 'Tried 10 different types of coffee. Great explorer spirit!',
    '🗺️', 'variety',
    jsonb_build_object('type', 'unique', 'target', 10, 'criteria', 'coffees'),
    60, 'uncommon', 20
  ),
  (
    '세계 여행자', 'World Traveler',
    '5개 이상의 서로 다른 원산지 커피를 마셨어요. 세계 여행 중이신가요?', 'Tried coffee from 5+ different origins. Are you traveling the world?',
    '🌍', 'variety',
    jsonb_build_object('type', 'unique', 'target', 5, 'criteria', 'origins'),
    80, 'uncommon', 21
  ),
  (
    '로스터리 헌터', 'Roastery Hunter',
    '10개 이상의 로스터리를 경험했어요. 진정한 로스터리 헌터!', 'Experienced 10+ roasteries. A true roastery hunter!',
    '🏭', 'variety', 
    jsonb_build_object('type', 'unique', 'target', 10, 'criteria', 'roasteries'),
    100, 'rare', 22
  ),
  (
    '브루잉 마스터', 'Brewing Master',
    '5가지 이상의 추출 방법을 시도했어요. 브루잉 마스터네요!', 'Tried 5+ brewing methods. You''re a brewing master!',
    '⚗️', 'variety',
    jsonb_build_object('type', 'unique', 'target', 5, 'criteria', 'brew_methods'),
    120, 'rare', 23
  ),
  (
    '플레이버 헌터', 'Flavor Hunter', 
    '30가지 이상의 플레이버를 발견했어요. 놀라운 미각이에요!', 'Discovered 30+ flavors. Amazing palate!',
    '👃', 'variety',
    jsonb_build_object('type', 'unique', 'target', 30, 'criteria', 'flavors'),
    150, 'epic', 24
  ),

-- ============================================================================
-- 4. 모드별 특화 도전과제 (expertise - 전문성)
-- ============================================================================

  -- 홈카페 전문가
  (
    '홈바리스타', 'Home Barista',
    '홈카페 모드로 20회 기록했어요. 집에서도 프로급이네요!', 'Recorded 20 times in Home Cafe mode. Pro-level at home!',
    '🏠', 'expertise',
    jsonb_build_object('type', 'count', 'target', 20, 'criteria', 'homecafe_records'),
    80, 'uncommon', 30
  ),
  (
    '정밀 추출사', 'Precision Brewer',
    '홈카페에서 추출 시간, 온도, 비율을 모두 기록한 완벽한 기록 10회!', '10 perfect records with all brewing details in Home Cafe!',
    '⏱️', 'expertise',
    jsonb_build_object('type', 'special', 'target', 10, 'criteria', 'detailed_brew_records'),
    120, 'rare', 31
  ),
  
  -- 카페 전문가
  (
    '카페 호퍼', 'Cafe Hopper',
    '카페 모드로 20회 기록했어요. 진정한 카페 호퍼군요!', 'Recorded 20 times in Cafe mode. A true cafe hopper!',
    '🏪', 'expertise',
    jsonb_build_object('type', 'count', 'target', 20, 'criteria', 'cafe_records'),
    80, 'uncommon', 32
  ),
  (
    '서울 카페 지도', 'Seoul Cafe Map',
    '20개 이상의 서로 다른 카페를 방문했어요. 서울의 카페 지도가 되었군요!', 'Visited 20+ different cafes. You''ve become Seoul''s cafe map!',
    '🗾', 'expertise',
    jsonb_build_object('type', 'unique', 'target', 20, 'criteria', 'cafes'),
    150, 'rare', 33
  ),

-- ============================================================================
-- 5. 품질 중심 도전과제 (quality - 높은 기준)
-- ============================================================================

  (
    '까다로운 입맛', 'Discerning Palate',
    '평점 4점 이상만 10회 기록했어요. 까다로운 입맛이시군요!', 'Recorded 10 times with 4+ star ratings only. Discerning palate!',
    '⭐', 'quality',
    jsonb_build_object('type', 'special', 'target', 10, 'criteria', 'high_ratings'),
    60, 'uncommon', 40
  ),
  (
    '완벽주의자', 'Perfectionist',
    '만점 5점을 10회 기록했어요. 완벽주의자시군요!', 'Recorded 10 perfect 5-star ratings. You''re a perfectionist!',
    '💯', 'quality',
    jsonb_build_object('type', 'special', 'target', 10, 'criteria', 'perfect_ratings'),
    100, 'rare', 41
  ),
  (
    '디테일 마스터', 'Detail Master',
    '500자 이상의 상세한 노트를 10회 작성했어요. 디테일의 달인!', 'Wrote 10 detailed notes with 500+ characters. Detail master!',
    '📝', 'quality',
    jsonb_build_object('type', 'special', 'target', 10, 'criteria', 'detailed_notes'),
    120, 'rare', 42
  ),

-- ============================================================================
-- 6. 시간대별 특별 도전과제 (special - 특별한 순간)
-- ============================================================================

  (
    '아침형 인간', 'Morning Person',
    '오전 9시 이전에 10회 기록했어요. 진정한 아침형 인간!', 'Recorded 10 times before 9 AM. True morning person!',
    '🌅', 'special',
    jsonb_build_object('type', 'special', 'target', 10, 'criteria', 'morning_records'),
    70, 'uncommon', 50
  ),
  (
    '야행성 커피러', 'Night Coffee Lover', 
    '오후 6시 이후에 10회 기록했어요. 밤에도 커피를 사랑하시는군요!', 'Recorded 10 times after 6 PM. You love coffee even at night!',
    '🌙', 'special',
    jsonb_build_object('type', 'special', 'target', 10, 'criteria', 'evening_records'),
    70, 'uncommon', 51
  ),
  (
    '새벽 카페인', 'Dawn Caffeine',
    '새벽 6시 이전에 커피를 마신 용감한 기록 5회!', '5 brave records of drinking coffee before 6 AM!',
    '🌃', 'special',
    jsonb_build_object('type', 'special', 'target', 5, 'criteria', 'dawn_records'),
    100, 'rare', 52
  ),

-- ============================================================================
-- 7. 소셜 및 커뮤니티 도전과제 (social - 함께하는 즐거움)
-- ============================================================================

  (
    '사진작가', 'Photographer',
    '사진과 함께 20회 기록했어요. 아름다운 순간들을 기록하는 사진작가!', 'Recorded 20 times with photos. A photographer capturing beautiful moments!',
    '📸', 'social',
    jsonb_build_object('type', 'special', 'target', 20, 'criteria', 'photos_shared'),
    80, 'uncommon', 60
  ),
  (
    '커뮤니티 리더', 'Community Leader',
    '10개의 기록을 커뮤니티와 공유했어요. 커뮤니티 리더네요!', 'Shared 10 records with the community. You''re a community leader!',
    '👥', 'social',
    jsonb_build_object('type', 'special', 'target', 10, 'criteria', 'shared_records'),
    90, 'uncommon', 61
  ),
  (
    '맛의 소통자', 'Taste Communicator',
    '5명과 맛 매치가 성사되었어요. 맛의 소통자!', 'Matched with 5 people on taste preferences. Taste communicator!',
    '🤝', 'social',
    jsonb_build_object('type', 'special', 'target', 5, 'criteria', 'taste_matches'),
    150, 'rare', 62
  ),

-- ============================================================================
-- 8. 계절별/특별한 순간 도전과제 (seasonal - 특별함)
-- ============================================================================

  (
    '첫눈과 커피', 'First Snow Coffee',
    '12월~2월 겨울철에 야외 카페에서 커피를 마셨어요!', 'Enjoyed coffee at an outdoor cafe during winter (Dec-Feb)!',
    '❄️', 'special',
    jsonb_build_object('type', 'special', 'target', 1, 'criteria', 'winter_outdoor_cafe'),
    50, 'uncommon', 70
  ),
  (
    '벚꽃과 함께', 'Cherry Blossom Companion',
    '4월 벚꽃 시즌에 야외에서 커피를 즐겼어요!', 'Enjoyed coffee outdoors during cherry blossom season in April!',
    '🌸', 'special',
    jsonb_build_object('type', 'special', 'target', 1, 'criteria', 'spring_outdoor_coffee'),
    50, 'uncommon', 71
  ),
  (
    '한강 커피', 'Han River Coffee',
    '한강 근처에서 커피를 마셨어요. 서울의 낭만!', 'Enjoyed coffee near Han River. Seoul''s romance!',
    '🌊', 'special',
    jsonb_build_object('type', 'special', 'target', 1, 'criteria', 'hanriver_coffee'),
    60, 'uncommon', 72
  ),

-- ============================================================================
-- 9. 전문가 레벨 도전과제 (expertise - 고급 단계)
-- ============================================================================

  (
    '커핑 스페셜리스트', 'Cupping Specialist',
    '산미, 단맛, 쓴맛, 바디감을 모두 정확히 평가한 기록 20회!', '20 records with detailed evaluation of acidity, sweetness, bitterness, and body!',
    '👨‍🔬', 'expertise',
    jsonb_build_object('type', 'special', 'target', 20, 'criteria', 'detailed_tasting_notes'),
    200, 'epic', 80
  ),
  (
    '감각 표현 마스터', 'Sensory Expression Master',
    '한국어 감각 표현을 20개 이상 사용했어요. 표현의 달인!', 'Used 20+ Korean sensory expressions. Master of expression!',
    '🗣️', 'expertise',
    jsonb_build_object('type', 'unique', 'target', 20, 'criteria', 'sensory_expressions'),
    180, 'epic', 81
  ),
  (
    '추출 사이언티스트', 'Extraction Scientist',
    '물:커피 비율, 추출시간, 온도를 정확히 기록한 완벽한 홈카페 기록 50회!', '50 perfect home cafe records with precise ratios, timing, and temperature!',
    '⚛️', 'expertise',
    jsonb_build_object('type', 'special', 'target', 50, 'criteria', 'scientific_brewing'),
    300, 'legendary', 82
  ),

-- ============================================================================
-- 10. 히든 도전과제 (hidden - 발견하는 재미)
-- ============================================================================

  (
    '새벽 3시의 커피', '3 AM Coffee',
    '새벽 3시에 커피를 마신 특별한 경험! 숨겨진 도전과제를 발견했어요!', 'Special experience of drinking coffee at 3 AM! Found a hidden achievement!',
    '🦉', 'special',
    jsonb_build_object('type', 'special', 'target', 1, 'criteria', '3am_coffee'),
    200, 'legendary', 90
  ),
  (
    '365일의 기록', '365 Days Record',
    '일 년 동안 매일 커피를 기록했어요. 전설적인 성취!', 'Recorded coffee every day for a full year. Legendary achievement!',
    '📅', 'special',
    jsonb_build_object('type', 'streak', 'target', 365, 'criteria', 'daily_streak'),
    1000, 'legendary', 91
  ),
  (
    '커피 신', 'Coffee God',
    '모든 기본 도전과제를 완료했어요. 당신은 커피의 신입니다!', 'Completed all basic achievements. You are the Coffee God!',
    '☄️', 'special',
    jsonb_build_object('type', 'special', 'target', 25, 'criteria', 'achievements_completed'),
    2000, 'legendary', 92
  );

-- ============================================================================
-- 시스템 설정 - 도전과제 관련
-- ============================================================================

-- 도전과제 시스템 설정 저장
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES 
  (
    'achievement_system',
    jsonb_build_object(
      'version', '1.0.0',
      'total_achievements', (SELECT COUNT(*) FROM public.achievements),
      'categories', jsonb_build_array('quantity', 'quality', 'variety', 'social', 'expertise', 'special'),
      'rarities', jsonb_build_array('common', 'uncommon', 'rare', 'epic', 'legendary'),
      'point_multipliers', jsonb_build_object(
        'common', 1.0,
        'uncommon', 1.5, 
        'rare', 2.0,
        'epic', 3.0,
        'legendary', 5.0
      ),
      'level_calculation', jsonb_build_object(
        'base_exp', 100,
        'exp_per_level', 200,
        'max_level', 100
      )
    ),
    'Achievement system configuration and metadata',
    'gamification',
    true
  ),
  (
    'achievement_notifications',
    jsonb_build_object(
      'enabled', true,
      'sound_enabled', true,
      'push_notifications', true,
      'community_sharing', true,
      'celebration_animation', true
    ),
    'Achievement notification preferences',
    'gamification',
    false
  );

-- ============================================================================
-- 도전과제 통계 뷰 생성
-- ============================================================================

-- 도전과제 완료율 통계
CREATE OR REPLACE VIEW public.achievement_completion_stats AS
SELECT 
  a.category,
  a.rarity,
  COUNT(*) as total_achievements,
  COUNT(ua.id) FILTER (WHERE ua.is_completed = true) as completed_count,
  ROUND(
    COUNT(ua.id) FILTER (WHERE ua.is_completed = true)::DECIMAL / 
    GREATEST(COUNT(ua.id), 1) * 100, 
    2
  ) as completion_percentage,
  AVG(a.points) as avg_points
FROM public.achievements a
LEFT JOIN public.user_achievements ua ON a.id = ua.achievement_id
WHERE a.is_active = true
GROUP BY a.category, a.rarity
ORDER BY a.category, 
  CASE a.rarity 
    WHEN 'common' THEN 1 
    WHEN 'uncommon' THEN 2 
    WHEN 'rare' THEN 3 
    WHEN 'epic' THEN 4 
    WHEN 'legendary' THEN 5 
  END;

-- 사용자별 도전과제 진행률 요약
CREATE OR REPLACE VIEW public.user_achievement_summary AS
SELECT 
  ua.user_id,
  COUNT(*) as total_started,
  COUNT(*) FILTER (WHERE ua.is_completed = true) as completed,
  COUNT(*) FILTER (WHERE ua.is_completed = false) as in_progress,
  SUM(a.points) FILTER (WHERE ua.is_completed = true) as total_points,
  ROUND(
    COUNT(*) FILTER (WHERE ua.is_completed = true)::DECIMAL / 
    GREATEST(COUNT(*), 1) * 100, 
    2
  ) as completion_percentage,
  array_agg(
    CASE WHEN ua.is_completed = true THEN a.name END
    ORDER BY ua.completed_at DESC
  ) FILTER (WHERE ua.is_completed = true AND ua.completed_at >= NOW() - INTERVAL '7 days') as recent_achievements
FROM public.user_achievements ua
JOIN public.achievements a ON ua.achievement_id = a.id
WHERE a.is_active = true
GROUP BY ua.user_id;

-- ============================================================================
-- 도전과제 진행 업데이트 트리거
-- ============================================================================

-- 새 기록 생성 시 관련 도전과제 자동 체크
CREATE OR REPLACE FUNCTION public.trigger_achievement_check()
RETURNS TRIGGER AS $$
BEGIN
  -- 비동기로 도전과제 체크 (성능 최적화)
  PERFORM pg_notify('check_achievements', jsonb_build_object(
    'user_id', NEW.user_id,
    'event_type', 'record_completed',
    'event_data', jsonb_build_object(
      'record_id', NEW.id,
      'mode', NEW.mode,
      'rating', NEW.overall_rating,
      'recorded_at', NEW.recorded_at
    )
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 설치
DROP TRIGGER IF EXISTS check_achievements_on_record_complete ON public.tasting_records;
CREATE TRIGGER check_achievements_on_record_complete
  AFTER INSERT OR UPDATE ON public.tasting_records
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.trigger_achievement_check();

-- ============================================================================
-- 권한 설정
-- ============================================================================

-- 인증된 사용자가 도전과제 관련 뷰 조회 가능
GRANT SELECT ON public.achievement_completion_stats TO authenticated;
GRANT SELECT ON public.user_achievement_summary TO authenticated;

-- 완료 확인
SELECT 
  COUNT(*) as total_achievements,
  COUNT(*) FILTER (WHERE is_active = true) as active_achievements,
  COUNT(*) FILTER (WHERE is_hidden = true) as hidden_achievements,
  string_agg(DISTINCT category, ', ' ORDER BY category) as categories,
  string_agg(DISTINCT rarity, ', ' ORDER BY rarity) as rarities
FROM public.achievements;