-- Create a test user for development
-- This bypasses email confirmation for testing purposes
-- Run this in Supabase SQL Editor

-- Create auth user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'test@cupnote.com',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  jsonb_build_object('name', 'Test User'),
  false,
  'authenticated'
) ON CONFLICT (email) DO UPDATE
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
RETURNING id, email;

-- Get the user ID for creating profile
WITH test_user AS (
  SELECT id, email FROM auth.users WHERE email = 'test@cupnote.com'
)
-- Create user profile
INSERT INTO public.users (
  id,
  email,
  name,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Test User',
  NOW(),
  NOW()
FROM test_user
ON CONFLICT (id) DO UPDATE
SET 
  updated_at = NOW();

-- Create initial user stats
WITH test_user AS (
  SELECT id FROM auth.users WHERE email = 'test@cupnote.com'
)
INSERT INTO public.user_stats (
  user_id,
  stats_data,
  last_updated
)
SELECT 
  id,
  jsonb_build_object(
    'totalRecords', 0,
    'cafeRecords', 0,
    'homeCafeRecords', 0,
    'uniqueCafes', 0,
    'uniqueBeans', 0,
    'favoriteRoaster', null,
    'totalCupsConsumed', 0,
    'averageRating', 0,
    'mostUsedBrewMethod', null,
    'totalBrewTime', 0,
    'achievementPoints', 0,
    'level', 1,
    'currentStreak', 0,
    'longestStreak', 0,
    'joinedDate', NOW()
  ),
  NOW()
FROM test_user
ON CONFLICT (user_id) DO UPDATE
SET 
  last_updated = NOW();

-- Output test user credentials
SELECT 
  'Test User Created!' as status,
  'test@cupnote.com' as email,
  'TestPassword123!' as password,
  'Email is pre-confirmed for testing' as note;