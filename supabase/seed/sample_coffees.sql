-- ============================================================================
-- CupNote v6 Sample Coffee & Cafe Data 
-- ============================================================================
-- 한국 사용자를 위한 실제적인 샘플 데이터
-- 유명 로스터리, 카페, 커피 정보로 구성된 현실적인 테스트 데이터

-- ============================================================================
-- 1. 유명 한국 로스터리의 커피들
-- ============================================================================

INSERT INTO public.coffees (
  name, roastery, roastery_location, origin_country, origin_region, origin_farm,
  variety, process_method, roast_level, altitude_meters, price_krw, weight_grams,
  roast_date, package_type, is_verified
) VALUES 

  -- 빈브라더스 (Bean Brothers)
  (
    '에티오피아 예가체프 코체레', 'Bean Brothers', '서울 강남구',
    'Ethiopia', 'Yirgacheffe', 'Kochere Washing Station',
    ARRAY['Heirloom'], 'washed', 2, 1850, 18000, 200,
    CURRENT_DATE - INTERVAL '5 days', 'Valve Bag', true
  ),
  (
    '콜롬비아 핑크 버번', 'Bean Brothers', '서울 강남구', 
    'Colombia', 'Huila', 'La Esperanza Farm',
    ARRAY['Pink Bourbon'], 'washed', 2, 1600, 22000, 200,
    CURRENT_DATE - INTERVAL '3 days', 'Valve Bag', true
  ),
  (
    '과테말라 안티구아', 'Bean Brothers', '서울 강남구',
    'Guatemala', 'Antigua', 'San Sebastian Farm', 
    ARRAY['Bourbon', 'Caturra'], 'washed', 3, 1200, 19000, 200,
    CURRENT_DATE - INTERVAL '7 days', 'Valve Bag', true
  ),

  -- 프릳츠 커피 컴퍼니 (Fritz Coffee Company)
  (
    '케냐 키암부 AA', 'Fritz Coffee Company', '서울 마포구',
    'Kenya', 'Kiambu', 'Kiambu Cooperative',
    ARRAY['SL28', 'SL34'], 'washed', 2, 1700, 21000, 250,
    CURRENT_DATE - INTERVAL '2 days', 'Valve Bag', true  
  ),
  (
    '브라질 세하도 아마렐로', 'Fritz Coffee Company', '서울 마포구',
    'Brazil', 'Minas Gerais', 'Fazenda Rainha',
    ARRAY['Yellow Catuai'], 'natural', 3, 1100, 17000, 250,
    CURRENT_DATE - INTERVAL '4 days', 'Valve Bag', true
  ),

  -- 디저트리 커피로스터스 (Dessert.Tree Coffee Roasters)
  (
    '파나마 게이샤', 'Dessert.Tree Coffee Roasters', '서울 용산구',
    'Panama', 'Boquete', 'Hacienda La Esmeralda',
    ARRAY['Geisha'], 'washed', 1, 1600, 45000, 100,
    CURRENT_DATE - INTERVAL '1 day', 'Valve Bag', true
  ),
  (
    '온두라스 파카마라', 'Dessert.Tree Coffee Roasters', '서울 용산구', 
    'Honduras', 'Santa Barbara', 'Finca El Puente',
    ARRAY['Pacamara'], 'honey', 2, 1400, 25000, 200,
    CURRENT_DATE - INTERVAL '6 days', 'Valve Bag', true
  ),

  -- 테라로사 (Terarosa)
  (
    '에티오피아 시다마', 'Terarosa', '경기 성남시',
    'Ethiopia', 'Sidama', 'Sidama Union',
    ARRAY['Heirloom'], 'natural', 2, 1900, 16000, 250,
    CURRENT_DATE - INTERVAL '3 days', 'Valve Bag', true
  ),
  (
    '코스타리카 타라주', 'Terarosa', '경기 성남시',
    'Costa Rica', 'Tarrazú', 'La Minita Farm',
    ARRAY['Caturra'], 'honey', 3, 1200, 20000, 250, 
    CURRENT_DATE - INTERVAL '5 days', 'Valve Bag', true
  ),

  -- 안트러사이트 커피 (Anthracite Coffee)
  (
    '르완다 후예 마운틴', 'Anthracite Coffee', '서울 강남구',
    'Rwanda', 'Western Province', 'Huye Mountain Coffee',
    ARRAY['Red Bourbon'], 'washed', 2, 2000, 18500, 200,
    CURRENT_DATE - INTERVAL '4 days', 'Valve Bag', true
  ),
  (
    '자메이카 블루 마운틴', 'Anthracite Coffee', '서울 강남구',
    'Jamaica', 'Blue Mountain', 'Wallenford Estate',
    ARRAY['Typica'], 'washed', 3, 1200, 65000, 113,
    CURRENT_DATE - INTERVAL '2 days', 'Valve Bag', true
  ),

  -- 모모스 커피 (Momos Coffee)
  (
    '니카라과 라 콘셉시온', 'Momos Coffee', '서울 마포구',
    'Nicaragua', 'Nueva Segovia', 'Finca La Concepcion', 
    ARRAY['Maracaturra'], 'honey', 2, 1350, 19500, 200,
    CURRENT_DATE - INTERVAL '3 days', 'Valve Bag', true
  ),
  (
    '페루 산 이그나시오', 'Momos Coffee', '서울 마포구',
    'Peru', 'Cajamarca', 'San Ignacio Cooperative',
    ARRAY['Caturra', 'Typica'], 'washed', 2, 1650, 17500, 200,
    CURRENT_DATE - INTERVAL '6 days', 'Valve Bag', true
  ),

-- ============================================================================
-- 2. 상업적 커피 (테스트용)
-- ============================================================================

  -- 스타벅스 
  (
    '파이크 플레이스 로스트', '스타벅스', '서울 전국',
    'Multi-Origin', 'Various', 'Various Farms',
    ARRAY['Arabica Blend'], 'washed', 3, 1200, 12000, 250,
    CURRENT_DATE - INTERVAL '10 days', 'Valve Bag', true
  ),
  (
    '하우스 블렌드', '스타벅스', '서울 전국',
    'Multi-Origin', 'Latin America', 'Various Farms', 
    ARRAY['Arabica Blend'], 'washed', 3, 1300, 12000, 250,
    CURRENT_DATE - INTERVAL '8 days', 'Valve Bag', true
  ),

  -- 폴 바셋 (Paul Bassett)
  (
    '시그니처 블렌드', '폴 바셋', '서울 전국', 
    'Multi-Origin', 'Central America', 'Various Farms',
    ARRAY['Arabica Blend'], 'washed', 3, 1400, 15000, 250,
    CURRENT_DATE - INTERVAL '5 days', 'Valve Bag', true
  ),

  -- 이디야 커피 (Ediya Coffee)
  (
    '오리지널 블렌드', '이디야 커피', '서울 전국',
    'Multi-Origin', 'Brazil, Colombia', 'Various Farms',
    ARRAY['Arabica Blend'], 'washed', 3, 1200, 8000, 200,
    CURRENT_DATE - INTERVAL '12 days', 'Valve Bag', true
  ),

-- ============================================================================
-- 3. 디카페인 및 특수 가공 커피
-- ============================================================================

  (
    '디카페인 콜롬비아', 'Fritz Coffee Company', '서울 마포구',
    'Colombia', 'Huila', 'Various Farms',
    ARRAY['Caturra'], 'washed', 2, 1500, 19000, 250,
    CURRENT_DATE - INTERVAL '3 days', 'Valve Bag', true
  ),
  (
    '애너로빅 발효 에티오피아', 'Dessert.Tree Coffee Roasters', '서울 용산구',
    'Ethiopia', 'Yirgacheffe', 'Aricha Washing Station', 
    ARRAY['Heirloom'], 'anaerobic', 1, 2000, 28000, 200,
    CURRENT_DATE - INTERVAL '2 days', 'Valve Bag', true
  ),

-- ============================================================================
-- 4. 계절한정/스페셜티 커피
-- ============================================================================

  (
    '2024 COE 우승작 - 파나마', 'Bean Brothers', '서울 강남구',
    'Panama', 'Chiriqui', 'Finca Don Pachi',
    ARRAY['Geisha'], 'natural', 1, 1650, 85000, 100,
    CURRENT_DATE - INTERVAL '1 day', 'Special Packaging', true
  ),
  (
    '크리스마스 블렌드', 'Terarosa', '경기 성남시',
    'Multi-Origin', 'Ethiopia, Guatemala', 'Various Farms',
    ARRAY['Heirloom', 'Bourbon'], 'washed', 2, 1600, 22000, 250,
    CURRENT_DATE - INTERVAL '7 days', 'Limited Edition', true  
  );

-- ============================================================================
-- 5. 유명 서울 카페 정보
-- ============================================================================

INSERT INTO public.cafes (
  name, name_english, address, address_detail, latitude, longitude,
  district, neighborhood, phone, website, instagram,
  operating_hours, wifi_available, parking_available, pet_friendly,
  group_friendly, study_friendly, price_range, specialty_coffee,
  roasting_onsite, is_verified
) VALUES 

  -- 강남구
  (
    '빈브라더스 강남점', 'Bean Brothers Gangnam',
    '서울 강남구 테헤란로 152', '강남파이낸스센터 1층',
    37.5013, 127.0268, '강남구', '역삼동',
    '02-1234-5678', 'https://beanbrothers.co.kr', '@beanbrothers_official',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'tuesday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'wednesday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'thursday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'friday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'saturday', jsonb_build_object('open', '08:00', 'close', '22:00', 'closed', false),
      'sunday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false)
    ),
    true, false, false, true, false, 3, true, true, true
  ),
  (
    '안트러사이트 압구정', 'Anthracite Apgujeong', 
    '서울 강남구 압구정로 175', '현대백화점 앞',
    37.5269, 127.0288, '강남구', '압구정동',
    '02-2345-6789', 'https://anthracitecoffee.com', '@anthracite_coffee',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '07:30', 'close', '22:30', 'closed', false),
      'tuesday', jsonb_build_object('open', '07:30', 'close', '22:30', 'closed', false),
      'wednesday', jsonb_build_object('open', '07:30', 'close', '22:30', 'closed', false),
      'thursday', jsonb_build_object('open', '07:30', 'close', '22:30', 'closed', false),
      'friday', jsonb_build_object('open', '07:30', 'close', '22:30', 'closed', false),
      'saturday', jsonb_build_object('open', '08:00', 'close', '22:30', 'closed', false),
      'sunday', jsonb_build_object('open', '08:00', 'close', '21:30', 'closed', false)
    ),
    true, true, false, true, false, 4, true, false, true
  ),

  -- 마포구  
  (
    '프릳츠 커피 본점', 'Fritz Coffee Company HQ',
    '서울 마포구 동교로 47', '연트럴파크 B1',
    37.5563, 126.9239, '마포구', '연남동',
    '02-3456-7890', 'https://fritzcoffee.co.kr', '@fritzcoffee_company',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'tuesday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'wednesday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'thursday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'friday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'saturday', jsonb_build_object('open', '09:00', 'close', '21:00', 'closed', false),
      'sunday', jsonb_build_object('open', '09:00', 'close', '20:00', 'closed', false)
    ),
    true, false, false, true, true, 3, true, true, true
  ),
  (
    '모모스 커피 홍대점', 'Momos Coffee Hongdae',
    '서울 마포구 와우산로 94', '홍대입구역 7번출구',
    37.5563, 126.9215, '마포구', '서교동', 
    '02-4567-8901', 'https://momoscoffee.com', '@momos_coffee',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '08:00', 'close', '22:00', 'closed', false),
      'tuesday', jsonb_build_object('open', '08:00', 'close', '22:00', 'closed', false),
      'wednesday', jsonb_build_object('open', '08:00', 'close', '22:00', 'closed', false),
      'thursday', jsonb_build_object('open', '08:00', 'close', '22:00', 'closed', false),
      'friday', jsonb_build_object('open', '08:00', 'close', '23:00', 'closed', false),
      'saturday', jsonb_build_object('open', '09:00', 'close', '23:00', 'closed', false),
      'sunday', jsonb_build_object('open', '09:00', 'close', '21:00', 'closed', false)
    ),
    true, false, false, true, true, 3, true, false, true
  ),

  -- 용산구
  (
    '디저트리 커피로스터스', 'Dessert.Tree Coffee Roasters',
    '서울 용산구 이태원로 210', '이태원역 3번출구', 
    37.5349, 126.9947, '용산구', '이태원동',
    '02-5678-9012', NULL, '@deserttree_coffee',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '09:00', 'close', '21:00', 'closed', false),
      'tuesday', jsonb_build_object('open', '09:00', 'close', '21:00', 'closed', false),
      'wednesday', jsonb_build_object('open', '09:00', 'close', '21:00', 'closed', false),
      'thursday', jsonb_build_object('open', '09:00', 'close', '21:00', 'closed', false),
      'friday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
      'saturday', jsonb_build_object('open', '10:00', 'close', '22:00', 'closed', false),
      'sunday', jsonb_build_object('open', '10:00', 'close', '20:00', 'closed', false)
    ),
    true, false, true, true, true, 4, true, true, true
  ),

  -- 성동구
  (
    '어니언 성수', 'Onion Seongsu',
    '서울 성동구 왕십리로 115', '성수동 카페거리',
    37.5445, 127.0557, '성동구', '성수동',
    '02-6789-0123', 'https://onion.co.kr', '@onion_seongsu',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'tuesday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'wednesday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'thursday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'friday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'saturday', jsonb_build_object('open', '09:00', 'close', '21:00', 'closed', false),
      'sunday', jsonb_build_object('open', '09:00', 'close', '20:00', 'closed', false)
    ),
    true, false, false, true, false, 3, true, false, true
  ),

  -- 종로구
  (
    '커피리브레 종로점', 'Coffee Libre Jongno',
    '서울 종로구 인사동길 35', '인사동 문화거리',
    37.5719, 126.9856, '종로구', '인사동',
    '02-7890-1234', NULL, '@coffeelibre_jongno',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '08:30', 'close', '21:30', 'closed', false),
      'tuesday', jsonb_build_object('open', '08:30', 'close', '21:30', 'closed', false),
      'wednesday', jsonb_build_object('open', '08:30', 'close', '21:30', 'closed', false),
      'thursday', jsonb_build_object('open', '08:30', 'close', '21:30', 'closed', false),
      'friday', jsonb_build_object('open', '08:30', 'close', '21:30', 'closed', false),
      'saturday', jsonb_build_object('open', '09:00', 'close', '21:30', 'closed', false),
      'sunday', jsonb_build_object('open', '09:00', 'close', '20:30', 'closed', false)
    ),
    true, false, false, true, true, 2, true, false, true
  ),

  -- 서초구  
  (
    '테라로사 서초점', 'Terarosa Seocho',
    '서울 서초구 반포대로 58', '교보타워 1층',
    37.5038, 127.0102, '서초구', '서초동',
    '02-8901-2345', 'https://terarosa.com', '@terarosa_coffee',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'tuesday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'wednesday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'thursday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'friday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false),
      'saturday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false),
      'sunday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false)
    ),
    true, true, false, true, false, 3, true, false, true
  ),

-- ============================================================================
-- 6. 체인카페들 (주요 지점들)
-- ============================================================================

  -- 스타벅스 대표 매장들
  (
    '스타벅스 강남역점', 'Starbucks Gangnam Station',
    '서울 강남구 강남대로 390', '강남역 2번출구', 
    37.4979, 127.0276, '강남구', '역삼동',
    '1522-3232', 'https://starbucks.co.kr', '@starbucks_korea',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '06:30', 'close', '22:30', 'closed', false),
      'tuesday', jsonb_build_object('open', '06:30', 'close', '22:30', 'closed', false),
      'wednesday', jsonb_build_object('open', '06:30', 'close', '22:30', 'closed', false),
      'thursday', jsonb_build_object('open', '06:30', 'close', '22:30', 'closed', false),
      'friday', jsonb_build_object('open', '06:30', 'close', '23:00', 'closed', false),
      'saturday', jsonb_build_object('open', '07:00', 'close', '23:00', 'closed', false),
      'sunday', jsonb_build_object('open', '07:00', 'close', '22:00', 'closed', false)
    ),
    true, false, false, true, true, 3, false, false, true
  ),
  (
    '폴 바셋 여의도점', 'Paul Bassett Yeouido',
    '서울 영등포구 여의도동 23-3', 'IFC몰 지하2층',
    37.5255, 126.9265, '영등포구', '여의도동',
    '02-0123-4567', 'https://paulbassett.co.kr', '@paulbassett_kr',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '07:00', 'close', '21:30', 'closed', false),
      'tuesday', jsonb_build_object('open', '07:00', 'close', '21:30', 'closed', false),
      'wednesday', jsonb_build_object('open', '07:00', 'close', '21:30', 'closed', false),
      'thursday', jsonb_build_object('open', '07:00', 'close', '21:30', 'closed', false),
      'friday', jsonb_build_object('open', '07:00', 'close', '21:30', 'closed', false),
      'saturday', jsonb_build_object('open', '08:00', 'close', '21:30', 'closed', false),
      'sunday', jsonb_build_object('open', '08:00', 'close', '21:00', 'closed', false)
    ),
    true, true, false, true, false, 3, false, false, true
  ),

-- ============================================================================
-- 7. 독립 카페들 (개성있는 카페들)
-- ============================================================================

  (
    '카페 수카라', 'Cafe Sukara',
    '서울 성북구 성북로 166', '성북동 한옥카페',
    37.5894, 127.0167, '성북구', '성북동',
    '02-1357-9024', NULL, '@cafe_sukara',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'tuesday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'wednesday', jsonb_build_object('closed', true),
      'thursday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'friday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'saturday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'sunday', jsonb_build_object('open', '10:00', 'close', '20:00', 'closed', false)
    ),
    true, false, false, false, true, 4, true, false, true
  ),
  (
    '북촌다방', 'Bukchon Dabang',
    '서울 종로구 북촌로 58', '북촌한옥마을',
    37.5816, 126.9850, '종로구', '계동',
    '02-2468-1357', NULL, '@bukchon_dabang',
    jsonb_build_object(
      'monday', jsonb_build_object('open', '09:00', 'close', '20:00', 'closed', false),
      'tuesday', jsonb_build_object('open', '09:00', 'close', '20:00', 'closed', false),
      'wednesday', jsonb_build_object('open', '09:00', 'close', '20:00', 'closed', false),
      'thursday', jsonb_build_object('open', '09:00', 'close', '20:00', 'closed', false),
      'friday', jsonb_build_object('open', '09:00', 'close', '20:00', 'closed', false),
      'saturday', jsonb_build_object('open', '09:00', 'close', '20:00', 'closed', false),
      'sunday', jsonb_build_object('open', '09:00', 'close', '19:00', 'closed', false)
    ),
    true, false, false, false, false, 2, true, false, true
  ),
  (
    '망원동 카페거리 - 로스팅옆', 'Roasting Yeop',
    '서울 마포구 포은로 103', '망원동 카페거리', 
    37.5560, 126.9048, '마포구', '망원동',
    '070-1234-5678', NULL, '@roasting_yeop',
    jsonb_build_object(
      'monday', jsonb_build_object('closed', true),
      'tuesday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'wednesday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'thursday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'friday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'saturday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false),
      'sunday', jsonb_build_object('open', '10:00', 'close', '20:00', 'closed', false)
    ),
    true, false, false, true, true, 3, true, true, true
  );

-- ============================================================================
-- 8. 샘플 테이스팅 기록 (테스트용)
-- ============================================================================

-- 샘플 사용자가 없으므로 테스트 계정 생성 후 기록 추가하는 함수 제공
CREATE OR REPLACE FUNCTION public.create_sample_tasting_records(sample_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  coffee_record RECORD;
  cafe_record RECORD;
  inserted_count INTEGER := 0;
BEGIN
  -- 에티오피아 예가체프 홈카페 기록
  SELECT id INTO coffee_record FROM public.coffees WHERE name = '에티오피아 예가체프 코체레' LIMIT 1;
  
  IF FOUND THEN
    INSERT INTO public.tasting_records (
      user_id, mode, status, coffee_id,
      brew_data, taste_scores, flavor_notes, sensory_expressions,
      overall_rating, personal_notes, recorded_at
    ) VALUES (
      sample_user_id, 'homecafe', 'completed', coffee_record.id,
      jsonb_build_object(
        'method', 'v60',
        'grind_size', 'medium-fine',
        'water_temperature', 93,
        'water_amount', 250,
        'coffee_amount', 15,
        'brew_time', 180
      ),
      jsonb_build_object(
        'acidity', 4, 'sweetness', 4, 'bitterness', 2, 
        'body', 3, 'balance', 4, 'cleanness', 5, 'aftertaste', 4
      ),
      ARRAY['citrus', 'floral', 'tea-like'],
      jsonb_build_object(
        'sweetness', ARRAY['과일 같은'],
        'acidity', ARRAY['상큼한', '시트러스한'],
        'overall', ARRAY['균형 잡힌']
      ),
      4.5, '정말 좋은 에티오피아 커피! 시트러스한 산미와 꽃향기가 일품이에요.',
      NOW() - INTERVAL '2 days'
    );
    inserted_count := inserted_count + 1;
  END IF;

  -- 프릳츠 커피 본점 카페 기록
  SELECT c.id as coffee_id, cf.id as cafe_id 
  INTO coffee_record
  FROM public.coffees c, public.cafes cf 
  WHERE c.name = '케냐 키암부 AA' AND cf.name = '프릳츠 커피 본점'
  LIMIT 1;
  
  IF FOUND THEN
    INSERT INTO public.tasting_records (
      user_id, mode, status, coffee_id, cafe_id,
      cafe_data, taste_scores, flavor_notes, sensory_expressions,
      overall_rating, personal_notes, recorded_at, is_public, share_with_community
    ) VALUES (
      sample_user_id, 'cafe', 'completed', coffee_record.coffee_id, coffee_record.cafe_id,
      jsonb_build_object(
        'visit_time', '14:30',
        'atmosphere_rating', 4,
        'service_rating', 5,
        'accompaniedBy', 'friends'
      ),
      jsonb_build_object(
        'acidity', 4, 'sweetness', 3, 'bitterness', 3,
        'body', 4, 'balance', 4, 'cleanness', 4, 'aftertaste', 4
      ),
      ARRAY['blackcurrant', 'wine-like', 'bright'],
      jsonb_build_object(
        'acidity', ARRAY['와인 같은', '상큼한'],
        'body', ARRAY['진한'],
        'overall', ARRAY['복잡하고 풍부한']
      ),
      4.0, '프릳츠 본점의 분위기도 좋고 케냐 커피도 정말 맛있어요! 친구들과 대화하기 좋은 곳.',
      NOW() - INTERVAL '1 day', true, true
    );
    inserted_count := inserted_count + 1;
  END IF;

  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. 데이터 완성도 검증 및 통계
-- ============================================================================

-- 생성된 데이터 요약
CREATE OR REPLACE VIEW public.sample_data_summary AS
SELECT 
  'Coffees' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count,
  COUNT(DISTINCT roastery) as unique_roasteries,
  COUNT(DISTINCT origin_country) as unique_origins,
  string_agg(DISTINCT roastery, ', ' ORDER BY roastery) as roasteries
FROM public.coffees
UNION ALL
SELECT 
  'Cafes' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count,
  COUNT(DISTINCT district) as unique_districts,
  COUNT(DISTINCT neighborhood) as unique_neighborhoods,
  string_agg(DISTINCT district, ', ' ORDER BY district) as districts
FROM public.cafes
UNION ALL
SELECT
  'Achievements' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(DISTINCT category) as unique_categories,
  COUNT(DISTINCT rarity) as unique_rarities,
  string_agg(DISTINCT category, ', ' ORDER BY category) as categories
FROM public.achievements
UNION ALL
SELECT
  'Sensory Expressions' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(DISTINCT category) as unique_categories,
  COUNT(*) FILTER (WHERE is_positive = true) as positive_count,
  string_agg(DISTINCT category, ', ' ORDER BY category) as categories
FROM public.sensory_expressions;

-- ============================================================================
-- 시스템 설정 업데이트
-- ============================================================================

INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES 
  (
    'sample_data_loaded',
    jsonb_build_object(
      'version', '1.0.0',
      'loaded_at', NOW(),
      'coffees_count', (SELECT COUNT(*) FROM public.coffees),
      'cafes_count', (SELECT COUNT(*) FROM public.cafes),
      'achievements_count', (SELECT COUNT(*) FROM public.achievements),
      'expressions_count', (SELECT COUNT(*) FROM public.sensory_expressions),
      'data_quality', 'production_ready',
      'korean_optimized', true
    ),
    'Sample data loading status and statistics',
    'system',
    false
  ) ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- ============================================================================
-- 권한 설정
-- ============================================================================

-- 샘플 데이터 요약 뷰는 인증된 사용자가 조회 가능
GRANT SELECT ON public.sample_data_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sample_tasting_records(UUID) TO authenticated;

-- ============================================================================
-- 완료 확인 및 데이터 검증
-- ============================================================================

-- 샘플 데이터 로딩 완료 확인
SELECT 
  'CupNote v6 샘플 데이터 로딩 완료!' as status,
  (SELECT COUNT(*) FROM public.coffees) as total_coffees,
  (SELECT COUNT(*) FROM public.cafes) as total_cafes,
  (SELECT COUNT(DISTINCT district) FROM public.cafes) as seoul_districts,
  (SELECT COUNT(*) FILTER (WHERE specialty_coffee = true) FROM public.cafes) as specialty_cafes,
  (SELECT COUNT(*) FILTER (WHERE roasting_onsite = true) FROM public.cafes) as roastery_cafes,
  (SELECT COUNT(DISTINCT roastery) FROM public.coffees) as total_roasteries,
  (SELECT COUNT(*) FILTER (WHERE price_krw > 30000) FROM public.coffees) as premium_coffees;