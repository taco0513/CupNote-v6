-- ============================================================================
-- CupNote v6 Korean Sensory Expressions Seed Data
-- ============================================================================
-- 한국 사용자를 위한 44개 감각 표현 완전 데이터베이스
-- 커피 전문가와 일반인 모두 사용할 수 있는 직관적인 한국어 표현

-- ============================================================================
-- 1. 단맛 (Sweetness) 관련 표현 - 7개
-- ============================================================================

INSERT INTO public.sensory_expressions (
  expression, expression_en, category, description, description_en, 
  intensity_level, is_positive, sort_order, usage_count
) VALUES 
  -- 단맛 표현들
  (
    '달콤한', 'Sweet',
    'sweetness', 
    '설탕이나 꿀 같은 자연스러운 단맛이 느껴져요', 'Natural sweetness like sugar or honey',
    3, true, 1, 0
  ),
  (
    '부드럽게 단', 'Gently Sweet',
    'sweetness',
    '강하지 않고 은은하게 느껴지는 단맛이에요', 'Mild and subtle sweetness',
    2, true, 2, 0
  ),
  (
    '진하게 단', 'Richly Sweet', 
    'sweetness',
    '깊고 풍부한 단맛이 입 안을 가득 채워요', 'Deep and rich sweetness that fills the mouth',
    4, true, 3, 0
  ),
  (
    '과일 같은', 'Fruity Sweet',
    'sweetness',
    '신선한 과일을 먹는 듯한 자연스러운 단맛', 'Natural sweetness like fresh fruit',
    3, true, 4, 0
  ),
  (
    '캐러멜 같은', 'Caramel-like',
    'sweetness',
    '캐러멜이나 설탕을 태운 듯한 구수한 단맛', 'Nutty sweetness like caramel or burnt sugar',
    4, true, 5, 0
  ),
  (
    '꿀 같은', 'Honey-like',
    'sweetness', 
    '꿀처럼 끈적하고 진한 단맛이 느껴져요', 'Thick and rich sweetness like honey',
    4, true, 6, 0
  ),
  (
    '단맛이 부족한', 'Lacking Sweetness',
    'sweetness',
    '단맛이 거의 느껴지지 않거나 부족해요', 'Little to no sweetness detected',
    1, false, 7, 0
  ),

-- ============================================================================
-- 2. 산미 (Acidity) 관련 표현 - 8개  
-- ============================================================================

  -- 산미 표현들
  (
    '상큼한', 'Fresh & Bright',
    'acidity',
    '레몬이나 오렌지 같은 상쾌하고 밝은 산미', 'Fresh and bright acidity like lemon or orange',
    3, true, 10, 0
  ),
  (
    '톡 쏘는', 'Tangy',
    'acidity', 
    '혀끝을 톡 쏘는 듯한 강한 산미가 느껴져요', 'Strong acidity that tingles the tongue',
    4, true, 11, 0
  ),
  (
    '은은한 산미', 'Mild Acidity',
    'acidity',
    '부드럽고 은은하게 느껴지는 산미예요', 'Soft and subtle acidity',
    2, true, 12, 0
  ),
  (
    '과일 산미', 'Fruit Acidity',
    'acidity',
    '사과나 포도 같은 과일의 자연스러운 산미', 'Natural fruit acidity like apple or grape',
    3, true, 13, 0
  ),
  (
    '시트러스한', 'Citrusy',
    'acidity',
    '감귤류 특유의 상쾌하고 깔끔한 산미', 'Refreshing and clean citrus acidity',
    3, true, 14, 0
  ),
  (
    '와인 같은', 'Wine-like',
    'acidity',
    '와인처럼 복잡하고 우아한 산미가 느껴져요', 'Complex and elegant acidity like wine',
    4, true, 15, 0
  ),
  (
    '신맛이 강한', 'Too Sour',
    'acidity',
    '신맛이 너무 강해서 불편할 정도예요', 'Acidity is too strong and uncomfortable',
    5, false, 16, 0
  ),
  (
    '산미가 부족한', 'Lacking Acidity',
    'acidity',
    '산미가 거의 느껴지지 않아 밋밋해요', 'Little acidity, tastes flat',
    1, false, 17, 0
  ),

-- ============================================================================
-- 3. 쓴맛 (Bitterness) 관련 표현 - 6개
-- ============================================================================

  -- 쓴맛 표현들
  (
    '적당히 쓴', 'Pleasantly Bitter',
    'bitterness',
    '커피다운 적당한 쓴맛이 균형 있게 느껴져요', 'Well-balanced pleasant bitterness typical of coffee',
    3, true, 20, 0
  ),
  (
    '깔끔하게 쓴', 'Clean Bitter',
    'bitterness', 
    '깔끔하고 뒷맛 없는 좋은 쓴맛이에요', 'Clean bitterness without unpleasant aftertaste',
    3, true, 21, 0
  ),
  (
    '다크초콜릿 같은', 'Dark Chocolate-like',
    'bitterness',
    '다크초콜릿처럼 진하고 고급스러운 쓴맛', 'Rich and sophisticated bitterness like dark chocolate',
    4, true, 22, 0
  ),
  (
    '너무 쓴', 'Too Bitter',
    'bitterness',
    '쓴맛이 너무 강해서 마시기 어려워요', 'Bitterness is too strong, hard to drink',
    5, false, 23, 0
  ),
  (
    '타는 맛', 'Burnt Taste',
    'bitterness',
    '원두가 탄 듯한 불쾌한 쓴맛이 나요', 'Unpleasant bitter taste like burnt beans',
    5, false, 24, 0
  ),
  (
    '쓴맛이 부족한', 'Lacking Bitterness',
    'bitterness',
    '커피다운 쓴맛이 부족해서 밍밍해요', 'Lacks coffee-like bitterness, tastes bland',
    1, false, 25, 0
  ),

-- ============================================================================
-- 4. 바디감 (Body/Mouthfeel) 관련 표현 - 7개
-- ============================================================================

  -- 바디감 표현들
  (
    '부드러운', 'Smooth',
    'body',
    '입 안에서 부드럽게 넘어가는 실크 같은 질감', 'Silk-like texture that goes down smoothly',
    3, true, 30, 0
  ),
  (
    '진한', 'Full-bodied',
    'body',
    '묵직하고 진한 바디감이 입 안을 채워요', 'Heavy and full body that fills the mouth',
    4, true, 31, 0
  ),
  (
    '가벼운', 'Light-bodied',
    'body', 
    '물처럼 가볍고 깔끔한 바디감이에요', 'Light and clean body like water',
    2, true, 32, 0
  ),
  (
    '크리미한', 'Creamy',
    'body',
    '크림처럼 부드럽고 풍부한 질감이 느껴져요', 'Creamy and rich texture',
    4, true, 33, 0
  ),
  (
    '벨벳 같은', 'Velvety',
    'body',
    '벨벳처럼 매끈하고 고급스러운 질감', 'Smooth and luxurious texture like velvet',
    4, true, 34, 0
  ),
  (
    '거친', 'Rough',
    'body',
    '입 안에서 거칠게 느껴지는 불편한 질감', 'Rough and uncomfortable texture in the mouth',
    2, false, 35, 0
  ),
  (
    '밋밋한', 'Thin',
    'body',
    '바디감이 부족해서 물 같이 밋밋해요', 'Lacks body, watery and thin',
    1, false, 36, 0
  ),

-- ============================================================================
-- 5. 향미/플레이버 (Flavor) 관련 표현 - 8개
-- ============================================================================

  -- 향미 표현들
  (
    '견과류 향', 'Nutty Flavor',
    'flavor',
    '아몬드나 헤이즐넛 같은 고소한 견과류 향미', 'Savory nutty flavor like almonds or hazelnuts',
    3, true, 40, 0
  ),
  (
    '꽃향기', 'Floral',
    'flavor',
    '자스민이나 장미 같은 우아한 꽃향기', 'Elegant floral notes like jasmine or rose',
    3, true, 41, 0
  ),
  (
    '초콜릿 향', 'Chocolate Notes',
    'flavor',
    '밀크초콜릿이나 코코아 같은 달콤한 향미', 'Sweet chocolate or cocoa-like flavor',
    3, true, 42, 0
  ),
  (
    '캐러멜 향', 'Caramel Notes',
    'flavor', 
    '구수하고 달콤한 캐러멜 향미가 느껴져요', 'Nutty and sweet caramel flavor',
    3, true, 43, 0
  ),
  (
    '베리 향', 'Berry Notes',
    'flavor',
    '블루베리나 딸기 같은 상큼한 베리 향미', 'Fresh berry flavors like blueberry or strawberry',
    3, true, 44, 0
  ),
  (
    '바닐라 향', 'Vanilla Notes',
    'flavor',
    '부드럽고 달콤한 바닐라 향이 은은해요', 'Soft and sweet vanilla aroma',
    2, true, 45, 0
  ),
  (
    '스모키한', 'Smoky',
    'flavor',
    '훈제나 로스팅 과정에서 나는 스모키한 향', 'Smoky aroma from roasting process',
    3, true, 46, 0
  ),
  (
    '향이 부족한', 'Lacking Aroma',
    'flavor',
    '특별한 향미가 거의 느껴지지 않아요', 'Little to no distinctive flavor notes',
    1, false, 47, 0
  ),

-- ============================================================================
-- 6. 후미/여운 (Aftertaste) 관련 표현 - 5개
-- ============================================================================

  -- 후미 표현들
  (
    '깔끔한 후미', 'Clean Finish',
    'aftertaste',
    '마신 후에 깔끔하게 사라지는 좋은 여운', 'Clean finish that fades nicely after drinking',
    3, true, 50, 0
  ),
  (
    '긴 여운', 'Long Finish',
    'aftertaste',
    '오랫동안 입 안에 남는 좋은 커피 맛', 'Pleasant coffee taste that lingers long',
    4, true, 51, 0
  ),
  (
    '달콤한 여운', 'Sweet Aftertaste',
    'aftertaste',
    '마신 후에도 달콤함이 계속 느껴져요', 'Sweetness continues to be felt after drinking',
    3, true, 52, 0
  ),
  (
    '쓴 뒷맛', 'Bitter Aftertaste',
    'aftertaste',
    '마신 후에 불쾌한 쓴맛이 남아있어요', 'Unpleasant bitterness remains after drinking',
    2, false, 53, 0
  ),
  (
    '여운이 짧은', 'Short Finish',
    'aftertaste',
    '마신 후에 맛이 금방 사라져버려요', 'Flavor disappears quickly after drinking',
    1, false, 54, 0
  ),

-- ============================================================================
-- 7. 전체적인 느낌 (Overall) 관련 표현 - 3개
-- ============================================================================

  -- 전체 평가 표현들
  (
    '균형 잡힌', 'Well-balanced',
    'overall',
    '모든 맛이 조화롭게 어우러진 완벽한 밸런스', 'Perfect balance where all flavors harmonize',
    4, true, 60, 0
  ),
  (
    '복잡하고 풍부한', 'Complex & Rich',
    'overall',
    '다양한 맛과 향이 층층이 느껴지는 복잡함', 'Multiple layers of flavors and aromas',
    5, true, 61, 0
  ),
  (
    '단조로운', 'One-dimensional',
    'overall',
    '특별함이 없고 단조로운 평범한 맛이에요', 'Plain and uninteresting without special character',
    2, false, 62, 0
  );

-- ============================================================================
-- 감각 표현 카테고리별 통계 뷰
-- ============================================================================

CREATE OR REPLACE VIEW public.sensory_expression_stats AS
SELECT 
  category,
  COUNT(*) as total_expressions,
  COUNT(*) FILTER (WHERE is_positive = true) as positive_expressions,
  COUNT(*) FILTER (WHERE is_positive = false) as negative_expressions,
  ROUND(AVG(intensity_level), 2) as avg_intensity,
  SUM(usage_count) as total_usage,
  array_agg(expression ORDER BY sort_order) as expressions_list
FROM public.sensory_expressions
WHERE is_active = true
GROUP BY category
ORDER BY 
  CASE category 
    WHEN 'sweetness' THEN 1
    WHEN 'acidity' THEN 2  
    WHEN 'bitterness' THEN 3
    WHEN 'body' THEN 4
    WHEN 'flavor' THEN 5
    WHEN 'aftertaste' THEN 6
    WHEN 'overall' THEN 7
  END;

-- ============================================================================
-- 사용 빈도 업데이트 함수
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_expression_usage(expression_text TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.sensory_expressions 
  SET 
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE expression = expression_text AND is_active = true;
  
  -- 사용된 표현이 없으면 로그 기록
  IF NOT FOUND THEN
    PERFORM public.log_security_event('unknown_expression_used', jsonb_build_object(
      'expression', expression_text,
      'user_id', auth.uid()
    ));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 감각 표현 사용 통계 트리거
-- ============================================================================

-- 테이스팅 기록에 감각 표현이 사용될 때마다 카운트 증가
CREATE OR REPLACE FUNCTION public.update_sensory_expression_usage()
RETURNS TRIGGER AS $$
DECLARE
  expression_key TEXT;
  expression_array TEXT[];
BEGIN
  -- sensory_expressions JSON에서 모든 표현 추출하여 사용 카운트 증가
  IF NEW.sensory_expressions IS NOT NULL THEN
    -- 각 카테고리의 표현들 처리
    FOR expression_key IN SELECT jsonb_object_keys(NEW.sensory_expressions)
    LOOP
      IF jsonb_typeof(NEW.sensory_expressions->expression_key) = 'array' THEN
        SELECT array_agg(value::text) INTO expression_array
        FROM jsonb_array_elements_text(NEW.sensory_expressions->expression_key);
        
        -- 배열의 각 표현에 대해 사용량 업데이트
        IF expression_array IS NOT NULL THEN
          PERFORM public.increment_expression_usage(unnest)
          FROM unnest(expression_array);
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_expression_usage_on_record ON public.tasting_records;
CREATE TRIGGER update_expression_usage_on_record
  AFTER INSERT OR UPDATE ON public.tasting_records
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND NEW.sensory_expressions IS NOT NULL)
  EXECUTE FUNCTION public.update_sensory_expression_usage();

-- ============================================================================
-- 추천 감각 표현 함수 (AI/ML 연동 준비)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_recommended_expressions(
  taste_scores_param JSONB,
  flavor_notes_param TEXT[] DEFAULT '{}',
  user_id_param UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  category TEXT,
  expression TEXT,
  description TEXT,
  confidence_score DECIMAL
) AS $$
DECLARE
  rec_record RECORD;
BEGIN
  -- 맛 점수를 기반으로 추천 감각 표현 반환
  RETURN QUERY
  WITH taste_analysis AS (
    SELECT 
      'sweetness' as category, 
      COALESCE((taste_scores_param->>'sweetness')::DECIMAL, 0) as score
    UNION ALL
    SELECT 
      'acidity' as category, 
      COALESCE((taste_scores_param->>'acidity')::DECIMAL, 0) as score
    UNION ALL  
    SELECT 
      'bitterness' as category,
      COALESCE((taste_scores_param->>'bitterness')::DECIMAL, 0) as score
    UNION ALL
    SELECT 
      'body' as category,
      COALESCE((taste_scores_param->>'body')::DECIMAL, 0) as score
  ),
  recommended AS (
    SELECT DISTINCT
      se.category,
      se.expression,
      se.description,
      CASE 
        -- 점수가 높으면 긍정적 표현, 낮으면 부정적 표현 추천
        WHEN ta.score >= 4 AND se.is_positive = true AND se.intensity_level >= 3 THEN 0.9
        WHEN ta.score >= 3 AND se.is_positive = true AND se.intensity_level >= 2 THEN 0.8
        WHEN ta.score <= 2 AND se.is_positive = false THEN 0.7
        WHEN ta.score = 3 AND se.intensity_level = 3 THEN 0.6
        ELSE 0.3
      END as confidence_score
    FROM taste_analysis ta
    JOIN public.sensory_expressions se ON ta.category = se.category
    WHERE se.is_active = true
      AND ta.score > 0
  )
  SELECT 
    r.category,
    r.expression, 
    r.description,
    r.confidence_score
  FROM recommended r
  WHERE r.confidence_score >= 0.5
  ORDER BY r.confidence_score DESC, random()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 시스템 설정 - 감각 표현 관련
-- ============================================================================

INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES 
  (
    'korean_sensory_expressions',
    jsonb_build_object(
      'version', '1.0.0',
      'total_expressions', (SELECT COUNT(*) FROM public.sensory_expressions),
      'categories', (
        SELECT jsonb_agg(DISTINCT category ORDER BY category) 
        FROM public.sensory_expressions
      ),
      'usage_tracking', true,
      'recommendation_enabled', true,
      'auto_suggestion', true,
      'cultural_adaptation', 'korean'
    ),
    'Korean sensory expressions system configuration',
    'localization',
    true
  ) ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- ============================================================================
-- 권한 설정
-- ============================================================================

-- 인증된 사용자가 감각 표현 조회 및 추천 함수 사용
GRANT SELECT ON public.sensory_expression_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recommended_expressions(JSONB, TEXT[], UUID, INTEGER) TO authenticated;

-- 사용량 업데이트는 시스템에서만
GRANT EXECUTE ON FUNCTION public.increment_expression_usage(TEXT) TO service_role;

-- ============================================================================
-- 완료 확인 쿼리
-- ============================================================================

-- 생성된 감각 표현 요약
SELECT 
  '한국어 감각 표현 데이터 생성 완료' as status,
  COUNT(*) as total_expressions,
  COUNT(*) FILTER (WHERE is_positive = true) as positive_expressions,
  COUNT(*) FILTER (WHERE is_positive = false) as negative_expressions,
  string_agg(
    category || '(' || COUNT(*) OVER (PARTITION BY category) || '개)', 
    ', ' ORDER BY category
  ) as category_breakdown
FROM public.sensory_expressions
WHERE is_active = true;