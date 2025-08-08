# Document Design Tokens (문서 디자인 토큰)

문서 전체에서 일관성을 유지하기 위한 핵심 값들의 중앙 관리 시스템

## 🔢 Core Values (핵심 값)

### App Version
```yaml
version: v6.0.0
phase: MVP
release_date: 2025-09
```

### Recording Modes
```yaml
cafe_mode:
  steps: 6
  duration: "5-7분"
  screens:
    - mode_selection
    - coffee_info
    - cafe_info
    - taste_evaluation
    - final_review
    - save
  result_screen: community_match  # 단계가 아닌 결과 화면

homecafe_mode:
  steps: 5
  duration: "8-12분"
  screens:
    - bean_info
    - recipe_setup
    - extraction
    - taste_evaluation
    - save
```

### Community Features (MVP)
```yaml
mvp_features:
  - public_profile: true
  - record_visibility: public/private
  - community_stats: true
  - follow_system: false      # Phase 2
  - like_comment: false       # Phase 2
  - recipe_share: false       # Phase 3
  - challenges: false         # Phase 3
```

### Gamification (MVP)
```yaml
achievements:
  first_step:
    name: "첫 발걸음"
    requirement: 1
    icon: "🥉"
  
  coffee_lover:
    name: "커피 애호가"
    requirement: 10
    icon: "🥈"
  
  coffee_master:
    name: "커피 마스터"
    requirement: 50
    icon: "🥇"
  
  coffee_expert:
    name: "커피 전문가"
    requirement: 100
    icon: "💎"

streaks:
  day_3: "꾸준한 시작"
  day_7: "주간 루틴"
  day_30: "월간 달성"
```

### Tech Stack
```yaml
frontend:
  framework: "Next.js 14"
  language: "TypeScript"
  styling: "Tailwind CSS"
  state: "Zustand"
  pwa: "next-pwa"
  ios: "Capacitor"

backend:
  database: "Supabase (PostgreSQL)"
  auth: "Supabase Auth"
  storage: "Supabase Storage"
  api: "Next.js API Routes"

deployment:
  hosting: "Vercel"
  domains:
    marketing: "mycupnote.com"
    admin: "mycupnote.com/admin"
    app: "app.mycupnote.com"
```

### Development Timeline
```yaml
mvp_phase1:
  duration: "1-2개월"
  features:
    - basic_recording
    - minimal_community
    - simple_gamification

phase2:
  duration: "3-4개월"
  features:
    - social_features
    - improved_matching
    - level_system

phase3:
  duration: "6개월"
  features:
    - recipe_sharing
    - challenges
    - advanced_analytics
```

## 📐 Usage Rules

1. **Single Source**: 이 파일이 모든 값의 유일한 출처
2. **No Magic Numbers**: 문서에서 직접 숫자 사용 금지
3. **Reference Format**: `[Token: cafe_mode.steps]` 형식으로 참조
4. **Update Process**: 값 변경 시 이 파일만 수정
5. **Validation**: 정기적으로 전체 문서 검증

## 🔄 Change Log

### 2025-08-08
- Initial token system created
- Cafe Mode steps: 7 → 6 (환경 평가 제거)
- Community features simplified for MVP
- Tech stack defined

---

**Note**: 모든 문서는 이 토큰을 참조해야 하며, 직접 값을 하드코딩하지 않습니다.