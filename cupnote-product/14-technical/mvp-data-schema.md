# MVP Data Schema (데이터 스키마)

CupNote v6.0.0 MVP를 위한 통합 데이터베이스 스키마

## Database: PostgreSQL (Supabase)

### Core Tables

#### 1. users (사용자)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2. coffee_records (커피 기록)
```sql
CREATE TABLE coffee_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Mode
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('cafe', 'homecafe')),
  
  -- Coffee Info
  coffee_name VARCHAR(200) NOT NULL,
  roastery VARCHAR(200),
  origin VARCHAR(100),
  
  -- Cafe Mode Specific
  cafe_name VARCHAR(200),
  cafe_location VARCHAR(200),
  with_whom VARCHAR(200),
  
  -- HomeCafe Mode Specific
  bean_amount DECIMAL(4,1),  -- grams
  water_amount INTEGER,       -- ml
  water_temp INTEGER,         -- celsius
  extraction_time INTEGER,    -- seconds
  brewing_method VARCHAR(50),
  grind_size VARCHAR(50),
  
  -- Taste Evaluation (Common)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  acidity INTEGER CHECK (acidity >= 1 AND acidity <= 5),
  sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 5),
  bitterness INTEGER CHECK (bitterness >= 1 AND bitterness <= 5),
  body INTEGER CHECK (body >= 1 AND body <= 5),
  aftertaste INTEGER CHECK (aftertaste >= 1 AND aftertaste <= 5),
  
  -- Flavor Notes (SCA Flavor Wheel)
  flavor_notes JSONB DEFAULT '[]',  -- Array of flavor tags
  
  -- Meta
  notes TEXT,
  photo_urls JSONB DEFAULT '[]',  -- Array of photo URLs
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_records_user_id ON coffee_records(user_id);
CREATE INDEX idx_records_coffee_name ON coffee_records(coffee_name);
CREATE INDEX idx_records_cafe_name ON coffee_records(cafe_name);
CREATE INDEX idx_records_is_public ON coffee_records(is_public);
CREATE INDEX idx_records_created_at ON coffee_records(created_at);
CREATE INDEX idx_records_mode ON coffee_records(mode);
```

#### 3. coffee_stats (커피 통계 - 캐시)
```sql
CREATE TABLE coffee_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifier (unique combination)
  coffee_identifier VARCHAR(400) UNIQUE NOT NULL,  -- "coffee_name|roastery|cafe_name"
  
  -- Stats
  total_count INTEGER DEFAULT 0,
  total_rating_sum INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  
  -- First Recorder
  first_recorder_id UUID REFERENCES users(id),
  first_recorded_at TIMESTAMP WITH TIME ZONE,
  
  -- Meta
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_coffee_stats_identifier ON coffee_stats(coffee_identifier);
```

#### 4. user_stats (사용자 통계)
```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Record Counts
  total_records INTEGER DEFAULT 0,
  cafe_records INTEGER DEFAULT 0,
  homecafe_records INTEGER DEFAULT 0,
  public_records INTEGER DEFAULT 0,
  
  -- Ratings
  total_rating_sum INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_record_date DATE,
  
  -- Unique Counts
  unique_coffees INTEGER DEFAULT 0,
  unique_cafes INTEGER DEFAULT 0,
  unique_origins INTEGER DEFAULT 0,
  
  -- Meta
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. achievements (성취/배지)
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  achievement_type VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(100) NOT NULL,
  achievement_icon VARCHAR(10),
  
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_type)
);

-- Index
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
```

### Helper Tables

#### 6. flavor_wheel (SCA Flavor Wheel 데이터)
```sql
CREATE TABLE flavor_wheel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  level1 VARCHAR(50) NOT NULL,     -- Main category
  level2 VARCHAR(50) NOT NULL,     -- Sub category
  level3 VARCHAR(50),               -- Specific flavor
  
  name_ko VARCHAR(50) NOT NULL,    -- Korean name
  name_en VARCHAR(50) NOT NULL,    -- English name
  
  color_hex VARCHAR(7),            -- Display color
  
  UNIQUE(level1, level2, level3)
);

-- Sample data
INSERT INTO flavor_wheel (level1, level2, level3, name_ko, name_en, color_hex) VALUES
('fruity', 'berry', 'blackberry', '블랙베리', 'Blackberry', '#4A148C'),
('fruity', 'berry', 'raspberry', '라즈베리', 'Raspberry', '#C2185B'),
('fruity', 'citrus', 'lemon', '레몬', 'Lemon', '#FFC107'),
('floral', 'floral', 'jasmine', '자스민', 'Jasmine', '#E91E63');
```

#### 7. coffee_expressions (감각 표현 도우미)
```sql
CREATE TABLE coffee_expressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  category VARCHAR(50) NOT NULL,   -- acidity, sweetness, etc.
  level INTEGER NOT NULL,          -- 1-5
  
  expression_ko VARCHAR(100) NOT NULL,
  expression_en VARCHAR(100),
  
  UNIQUE(category, level, expression_ko)
);

-- Sample data
INSERT INTO coffee_expressions (category, level, expression_ko) VALUES
('acidity', 5, '레몬즙 같은'),
('acidity', 4, '사과 같은'),
('sweetness', 5, '꿀 같은'),
('body', 4, '크리미한');
```

### Database Functions

#### Update Coffee Stats (Trigger Function)
```sql
CREATE OR REPLACE FUNCTION update_coffee_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Build identifier
  DECLARE
    coffee_id TEXT;
  BEGIN
    IF NEW.mode = 'cafe' THEN
      coffee_id := NEW.coffee_name || '|' || COALESCE(NEW.roastery, '') || '|' || NEW.cafe_name;
    ELSE
      coffee_id := NEW.coffee_name || '|' || COALESCE(NEW.roastery, '') || '|';
    END IF;
    
    -- Update or insert stats
    INSERT INTO coffee_stats (
      coffee_identifier,
      total_count,
      total_rating_sum,
      average_rating,
      first_recorder_id,
      first_recorded_at
    ) VALUES (
      coffee_id,
      1,
      NEW.rating,
      NEW.rating,
      NEW.user_id,
      NEW.created_at
    )
    ON CONFLICT (coffee_identifier) DO UPDATE
    SET
      total_count = coffee_stats.total_count + 1,
      total_rating_sum = coffee_stats.total_rating_sum + NEW.rating,
      average_rating = (coffee_stats.total_rating_sum + NEW.rating)::DECIMAL / (coffee_stats.total_count + 1),
      last_updated = NOW();
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_coffee_stats_trigger
AFTER INSERT ON coffee_records
FOR EACH ROW
WHEN (NEW.is_public = true)
EXECUTE FUNCTION update_coffee_stats();
```

#### Update User Stats (Trigger Function)
```sql
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user stats
  INSERT INTO user_stats (user_id, total_records, average_rating)
  VALUES (NEW.user_id, 1, NEW.rating)
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_records = user_stats.total_records + 1,
    cafe_records = CASE WHEN NEW.mode = 'cafe' 
      THEN user_stats.cafe_records + 1 
      ELSE user_stats.cafe_records 
    END,
    homecafe_records = CASE WHEN NEW.mode = 'homecafe' 
      THEN user_stats.homecafe_records + 1 
      ELSE user_stats.homecafe_records 
    END,
    public_records = CASE WHEN NEW.is_public 
      THEN user_stats.public_records + 1 
      ELSE user_stats.public_records 
    END,
    total_rating_sum = user_stats.total_rating_sum + NEW.rating,
    average_rating = (user_stats.total_rating_sum + NEW.rating)::DECIMAL / (user_stats.total_records + 1),
    last_record_date = CURRENT_DATE,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_stats_trigger
AFTER INSERT ON coffee_records
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Anyone can view public profiles" ON users
  FOR SELECT USING (true);

-- Coffee records policies  
CREATE POLICY "Users can manage own records" ON coffee_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public records" ON coffee_records
  FOR SELECT USING (is_public = true);

-- User stats policies
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public stats" ON user_stats
  FOR SELECT USING (true);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);
```

## API Endpoints (Conceptual)

### Records
- `POST /api/records` - Create new record
- `GET /api/records` - Get user's records
- `GET /api/records/public` - Get public records
- `GET /api/records/:id` - Get specific record

### Stats
- `GET /api/coffee/:identifier/stats` - Get coffee stats
- `GET /api/users/:id/stats` - Get user stats
- `GET /api/users/:id/achievements` - Get achievements

### Search
- `GET /api/search/coffee` - Search coffees
- `GET /api/search/cafe` - Search cafes
- `GET /api/search/users` - Search users

## Migration Strategy

### Phase 1 (MVP)
- All tables above
- Basic triggers
- Simple RLS policies

### Phase 2
- Add follow system tables
- Add activity feed tables
- Enhanced RLS for social features

### Phase 3
- Add recipe sharing tables
- Add challenge/event tables
- Add notification tables