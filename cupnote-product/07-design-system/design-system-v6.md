# CupNote v6 Design System

## 📋 Overview
CupNote v6의 새로운 디자인 시스템입니다. TastingFlow 중심으로 재구성되었습니다.

---

## 🎯 Design Principles

### 1. Coffee-First Design
- 커피 경험을 중심으로 한 디자인
- 따뜻하고 친근한 브라운 톤
- 커피 관련 메타포 활용

### 2. Progressive Disclosure  
- 필수 정보 우선
- 선택 정보는 접기/펼치기
- 사용자 레벨별 정보 제공

### 3. Mobile Optimized
- 엄지 친화적 터치 타겟 (최소 44pt)
- 단손 조작 가능한 레이아웃
- 빠른 입력 최적화

---

## 🎨 Foundation (준비 중)

### Colors
*새로운 컬러 시스템 정의 예정*

### Typography  
*폰트 시스템 정의 예정*

### Spacing
*간격 시스템 정의 예정*

### Elevation
*그림자 시스템 정의 예정*

---

## 🧩 Core Components

### TastingFlow Components (신규)

#### 1. Cascade Autocomplete
- **Cafe Mode**: 3단계 (카페 → 로스터 → 커피)
- **HomeCafe Mode**: 2단계 (로스터 → 커피)
- GPS 기반 카페 추천
- 검색 및 자동완성

#### 2. Progressive Disclosure Section
```
▼ 선택 정보 (접힘 상태)
▲ 선택 정보 (펼침 상태)
```
- 부가 정보 숨김/표시
- 애니메이션 전환
- 사용자 부담 최소화

#### 3. SCA Flavor Wheel Selector
- 9개 대분류
- 85개 향미
- 3단계 계층 구조
- 시각적 그룹핑

#### 4. Korean Sensory Expression Grid
- 6개 카테고리 × 7개 표현 = 44개
- CATA (Check All That Apply) 방식
- 카테고리별 최대 3개 선택
- 색상 코딩 시스템

#### 5. Mouthfeel Slider
- 6개 항목 (Body, Acidity, Sweetness, Finish, Bitterness, Balance)
- 1-5점 스케일
- 기본값 3점
- 실시간 피드백

#### 6. Brew Setup Components (HomeCafe 전용)
- 드리퍼 선택 (V60, Kalita Wave, Origami, April)
- 비율 프리셋 (1:15 ~ 1:18)
- 키패드 입력
- 타이머 인터페이스

#### 7. Progress Indicator
- 단계별 진행률 표시
- Cafe Mode: 6단계
- HomeCafe Mode: 7단계
- 퍼센트 표시

#### 8. Result Comparison Chart
- 로스터 노트 vs 나의 선택
- 매치 점수 시각화
- 벤다이어그램 또는 레이더 차트

---

## 📱 Screen Templates

### TastingFlow Screens

#### CoffeeInfo Screen
- Cascade Autocomplete
- Progressive Disclosure
- OCR 스캔 버튼

#### FlavorSelection Screen  
- SCA Flavor Wheel
- 검색 기능
- 인기 향미 빠른 선택

#### SensoryExpression Screen
- 44개 한국어 표현 그리드
- 카테고리별 접기/펼치기
- 선택 카운터

#### SensoryMouthFeel Screen
- 6개 슬라이더
- 건너뛰기 옵션
- 실시간 총점 계산

#### PersonalNotes Screen
- 텍스트 입력 (200자)
- 빠른 입력 칩
- 감정 태그

#### Result Screen
- 매치 점수
- 비교 차트
- 액션 버튼

---

## 🚧 To Be Defined

### Design Tokens
- [ ] Color Palette
- [ ] Typography Scale  
- [ ] Spacing System
- [ ] Border Radius
- [ ] Shadow/Elevation

### Additional Components
- [ ] Bottom Navigation
- [ ] FAB (Floating Action Button)
- [ ] Cards & Lists
- [ ] Forms & Inputs
- [ ] Modals & Sheets

### Interaction Patterns
- [ ] Animations
- [ ] Transitions
- [ ] Gestures
- [ ] Feedback

---

## 📝 Change Log

### 2025-08-08
- 구버전 디자인 시스템 아카이브
- TastingFlow 컴포넌트 정의
- v6 디자인 시스템 초기 구조 수립

---

*이 문서는 지속적으로 업데이트됩니다.*