# Feature Specifications (기능 상세 명세)

CupNote v6.0.0 MVP의 핵심 기능 기술 명세서

## 1. OCR 메뉴판 스캔

### 개요
카페 메뉴판을 촬영하여 커피 정보를 자동으로 추출하는 기능

### 기술 스택
```yaml
Options:
  1. Google Cloud Vision API
     - 장점: 높은 정확도, 한글 지원 우수
     - 단점: 유료 (월 1000건 무료)
     
  2. Tesseract.js
     - 장점: 무료, 오프라인 가능
     - 단점: 정확도 낮음, 파일 크기 큼
     
  3. Naver Clova OCR
     - 장점: 한글 최적화
     - 단점: API 키 필요

MVP 추천: Google Cloud Vision API
```

### 구현 플로우
```typescript
interface OCRProcess {
  // 1. 이미지 캡처
  captureImage(): Promise<File>;
  
  // 2. 이미지 전처리
  preprocessImage(file: File): Promise<Blob>;
  
  // 3. OCR 요청
  extractText(image: Blob): Promise<OCRResult>;
  
  // 4. 텍스트 파싱
  parseMenuText(text: string): MenuData;
  
  // 5. 필드 매핑
  mapToFormFields(data: MenuData): CoffeeInfo;
}

interface OCRResult {
  fullText: string;
  confidence: number;
  detectedItems: Array<{
    text: string;
    boundingBox: Rectangle;
    confidence: number;
  }>;
}

interface MenuData {
  coffeeName?: string;
  origin?: string;
  roastery?: string;
  price?: number;
  description?: string;
}
```

### 파싱 규칙
```javascript
// 커피 이름 패턴
const coffeePatterns = [
  /에티오피아\s+[\w\s]+/,
  /콜롬비아\s+[\w\s]+/,
  /케냐\s+[\w\s]+/,
  /브라질\s+[\w\s]+/
];

// 가격 패턴
const pricePattern = /₩?\s*(\d{1,2},?\d{3})\s*원?/;

// 로스팅 레벨
const roastPatterns = {
  light: /라이트|Light|연한/,
  medium: /미디엄|Medium|중간/,
  dark: /다크|Dark|진한/
};
```

### UX 고려사항
- 로딩 시간: 평균 2-3초
- 실패 시 수동 입력 폴백
- 결과 수정 가능한 UI
- 프로그레스 인디케이터 필수

### 촬영 가이드 UI
```
┌─────────────────────────────┐
│  📷 메뉴판 촬영              │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│                             │
│ │  메뉴판을 프레임에    │    │
│    맞춰주세요               │
│ │                       │    │
│                             │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                             │
│ 💡 밝은 곳에서 촬영하세요     │
└─────────────────────────────┘
```

### 결과 확인 UI
```
┌─────────────────────────────┐
│ ✅ 텍스트 추출 완료          │
├─────────────────────────────┤
│ 감지된 커피:                │
│ • 에티오피아 예가체페 ✏️     │
│ • 콜롬비아 수프리모 ✏️       │
│ • 케냐 AA ✏️                │
├─────────────────────────────┤
│ 가격: ₩5,500 (확인필요)     │
│ 로스터: 프릳츠커피           │
└─────────────────────────────┘
```

---

## 2. Brew Timer (추출 타이머)

### 개요
홈카페 추출 과정을 단계별로 가이드하는 인터랙티브 타이머

### 기술 구현
```typescript
interface BrewTimer {
  // 타이머 상태
  state: 'idle' | 'running' | 'paused' | 'completed';
  currentTime: number; // milliseconds
  targetTime: number;
  
  // 단계 관리
  currentPhase: BrewPhase;
  phases: BrewPhase[];
  
  // 컨트롤
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  lap(): void;
  
  // 알림
  notifications: NotificationSettings;
}

interface BrewPhase {
  name: string;
  startTime: number;
  endTime: number;
  targetWater: number; // ml
  instruction: string;
  alert?: {
    type: 'sound' | 'vibration' | 'both';
    pattern?: number[];
  };
}

// 기본 V60 레시피 예시
const v60Recipe: BrewPhase[] = [
  {
    name: "블루밍",
    startTime: 0,
    endTime: 30000,
    targetWater: 30,
    instruction: "30g까지 부어주세요",
    alert: { type: 'vibration', pattern: [200] }
  },
  {
    name: "1차 푸어",
    startTime: 30000,
    endTime: 75000,
    targetWater: 125,
    instruction: "125g까지 나선형으로",
    alert: { type: 'vibration', pattern: [200, 100, 200] }
  },
  // ...
];
```

### 백그라운드 실행
```javascript
// Service Worker 활용
self.addEventListener('message', (event) => {
  if (event.data.type === 'START_TIMER') {
    startBackgroundTimer();
  }
});

// Wake Lock API
async function keepScreenOn() {
  try {
    const wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    console.error('Wake Lock failed:', err);
  }
}
```

### 실시간 피드백
```typescript
interface ExtractionFeedback {
  currentRate: number; // g/s
  targetRate: number;
  
  getRecommendation(): string {
  // "추출이 너무 빠릅니다. 그라인더를 더 곱게 조절하세요"
  }
}
```

### Visual Timer Patterns

#### Circular Progress Timer (권장)
```
      ┌─────────────┐
      │   02:15     │
      │  ╱─────╲    │
      │ ╱       ╲   │
      ││    ☕   │  │
      │ ╲  60%  ╱   │
      │  ╲─────╱    │
      └─────────────┘
```

#### Flow Rate Visualization
```
  g/s ┊ Target: 2.0g/s
   3.0├─────────────
   2.5├  ╱╲    
   2.0├─╱──╲───── (목표선)
   1.5├     ╲╱
   1.0└─────────────
      0   30  60  90s
```

### Multi-sensory Feedback
```javascript
const vibrationPatterns = {
  phaseStart: [200],           // 단일 진동
  phaseEnd: [100, 50, 100],   // 더블 탭
  targetReached: [50, 50, 50], // 트리플 탭
  warning: [500, 100, 500]     // 긴-짧은-긴
};

const soundCues = {
  phaseStart: 'soft-bell.mp3',
  targetReached: 'success-chime.mp3',
  warning: 'short-beep.mp3'
};
```

### Adaptive Guidance System
```typescript
interface SmartGuidance {
  beginnerMode: {
    showVisualCues: true,
    voiceGuidance: true,
    stepByStepAnimation: true,
    autoNextStep: false
  },
  
  intermediateMode: {
    showVisualCues: true,
    voiceGuidance: false,
    showTips: true,
    customizable: true
  },
  
  expertMode: {
    showMinimalUI: true,
    showAdvancedMetrics: true,
    fullCustomization: true,
    flowRateGraph: true
  }
}
```

---

## 3. GPS 카페 감지

### 개요
사용자 위치 기반으로 현재 카페를 자동 감지하고 추천

### 기술 스택
```yaml
Options:
  1. Google Places API
     - 장점: 정확도 높음, 풍부한 데이터
     - 단점: 유료
     
  2. Kakao Local API
     - 장점: 한국 최적화, 무료 쿼터 충분
     - 단점: 해외 데이터 부족
     
  3. Custom Database
     - 장점: 비용 절감
     - 단점: 데이터 수집/관리 필요

MVP 추천: Kakao Local API
```

### 구현
```typescript
interface CafeDetection {
  // 현재 위치 획득
  getCurrentLocation(): Promise<Coordinates>;
  
  // 주변 카페 검색
  searchNearbyCafes(
    coords: Coordinates,
    radius: number
  ): Promise<Cafe[]>;
  
  // 자동 매칭
  autoMatchCafe(cafes: Cafe[]): Cafe | null;
  
  // 방문 이력 기반 추천
  getSuggestedCafe(
    location: Coordinates,
    history: VisitHistory[]
  ): Cafe | null;
}

interface Cafe {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  distance: number; // meters
  category: string[];
  phone?: string;
  hours?: BusinessHours;
}
```

### 위치 권한 처리 (Privacy-First)
```javascript
async function requestLocationPermission() {
  const permission = await navigator.permissions.query({
    name: 'geolocation'
  });
  
  if (permission.state === 'granted') {
    return getCurrentPosition();
  } else if (permission.state === 'prompt') {
    // 권한 요청 UI 표시
  } else {
    // 수동 입력 폴백
  }
}
```

### Privacy-First UI
```
┌─────────────────────────────┐
│ 📍 현재 위치 사용            │
├─────────────────────────────┤
│ CupNote는 카페 기록 시에만   │
│ 위치를 사용합니다.           │
│                             │
│ • 위치 데이터는 저장안됨      │
│ • 언제든 끌 수 있음          │
│ • 수동 입력 가능             │
│                             │
│ [위치 사용] [수동 입력]      │
└─────────────────────────────┘
```

### Geofencing for Auto Check-in
```typescript
interface GeofenceConfig {
  radius: number; // meters (default: 50)
  dwellTime: number; // milliseconds (default: 60000)
  
  onEnter(cafe: Cafe): void {
    // 자동 체크인 제안
    showNotification(`${cafe.name}에 오셨나요?`);
  }
  
  onExit(): void {
    // 기록 작성 리마인더
    if (!hasRecordedToday) {
      showReminder('커피 기록을 남겨주세요!');
    }
  }
}
```

---

## 4. SCA Flavor Wheel Integration

### 개요
SCA(Specialty Coffee Association) Flavor Wheel을 활용한 맛 평가

### 데이터 구조
```typescript
interface FlavorWheel {
  categories: FlavorCategory[];
}

interface FlavorCategory {
  level: 1 | 2 | 3;
  name: string;
  nameKo: string;
  color: string;
  parent?: string;
  children?: FlavorCategory[];
}

// 계층 구조 예시
const flavorData = {
  "fruity": {
    level: 1,
    nameKo: "과일향",
    color: "#FF6B6B",
    children: {
      "berry": {
        level: 2,
        nameKo: "베리류",
        children: {
          "blackberry": { level: 3, nameKo: "블랙베리" },
          "raspberry": { level: 3, nameKo: "라즈베리" },
          "blueberry": { level: 3, nameKo: "블루베리" },
          "strawberry": { level: 3, nameKo: "딸기" }
        }
      },
      "citrus": {
        level: 2,
        nameKo: "시트러스",
        children: {
          "lemon": { level: 3, nameKo: "레몬" },
          "lime": { level: 3, nameKo: "라임" },
          "grapefruit": { level: 3, nameKo: "자몽" },
          "orange": { level: 3, nameKo: "오렌지" }
        }
      }
    }
  }
};
```

### UI 구현
```typescript
interface FlavorSelector {
  // 3단계 선택 프로세스
  selectedLevel1: string[];
  selectedLevel2: string[];
  selectedLevel3: string[];
  
  // 시각화
  renderWheel(): ReactElement;
  renderChips(): ReactElement[];
  
  // 추천
  getSuggestions(origin: string): string[];
}
```

### 계층적 선택 UI
```
┌─────────────────────────────┐
│ Flavor Selection            │
├─────────────────────────────┤
│ Level 1: Main Category      │
│ [🍓 Fruity] [🌿 Green]      │
│ [🍫 Nutty] [🌸 Floral]      │
│                             │
│ Level 2: Sub Category       │
│ [🫐 Berry] [🍊 Citrus]      │
│ [🍑 Stone Fruit]            │
│                             │
│ Level 3: Specific           │
│ [Blueberry] [Raspberry]     │
│ [Blackberry] [Strawberry]   │
├─────────────────────────────┤
│ Selected: 🫐 Blueberry      │
└─────────────────────────────┘
```

### Interactive Wheel Navigation
```typescript
interface WheelInteraction {
  // 터치 제스처
  onTap(segment: FlavorSegment): void;
  onPinchZoom(level: 1 | 2 | 3): void;
  onRotate(degrees: number): void;
  
  // 시각적 피드백
  highlightPath(flavor: string): void;
  showTooltip(flavor: string): string;
  animateSelection(flavor: string): void;
  
  // 관계 표시
  showRelatedFlavors(selected: string): string[];
  showOpposites(selected: string): string[];
}
```

---

## 5. 감각 표현 도우미

### 개요
맛 평가 시 적절한 표현을 제안하는 도우미 기능

### 데이터
```typescript
interface SensoryExpression {
  category: 'acidity' | 'sweetness' | 'bitterness' | 'body' | 'aftertaste';
  level: 1 | 2 | 3 | 4 | 5;
  expressions: {
    ko: string[];
    en?: string[];
  };
}

const expressions: SensoryExpression[] = [
  {
    category: 'acidity',
    level: 5,
    expressions: {
      ko: ['레몬즙 같은', '톡 쏘는', '밝고 생기있는', '과일 주스같은'],
      en: ['Lemon-like', 'Bright', 'Juicy', 'Vibrant']
    }
  },
  {
    category: 'acidity',
    level: 4,
    expressions: {
      ko: ['사과 같은', '상큼한', '청량한', '기분 좋은 산미'],
      en: ['Apple-like', 'Crisp', 'Refreshing', 'Pleasant']
    }
  },
  // ...
];
```

### 원산지별 힌트
```typescript
const originHints = {
  "에티오피아": {
    typical: ['과일향', '꽃향기', '밝은 산미'],
    common: ['블루베리', '와인', '복잡한']
  },
  "콜롬비아": {
    typical: ['균형잡힌', '초콜릿', '캐러멜'],
    common: ['부드러운', '견과류', '단맛']
  },
  "케냐": {
    typical: ['블랙커런트', '와인같은', '진한'],
    common: ['토마토', '시럽같은', '복잡한']
  }
};
```

---

## 6. Achievement System

### 개요
사용자 참여를 유도하는 게이미피케이션 시스템

### 배지 정의
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: AchievementRequirement;
  points: number;
  unlockedAt?: Date;
}

interface AchievementRequirement {
  type: 'count' | 'streak' | 'unique' | 'special';
  target: number;
  current?: number;
}

const achievements: Achievement[] = [
  {
    id: 'first_step',
    name: '첫 발걸음',
    description: '첫 커피를 기록했어요',
    icon: '🥉',
    requirement: { type: 'count', target: 1 },
    points: 10
  },
  {
    id: 'coffee_lover',
    name: '커피 애호가',
    description: '10잔의 커피를 기록했어요',
    icon: '🥈',
    requirement: { type: 'count', target: 10 },
    points: 50
  },
  // ...
];
```

### 달성 체크 로직
```typescript
class AchievementChecker {
  checkAfterRecord(record: CoffeeRecord, userStats: UserStats) {
    const newAchievements: Achievement[] = [];
    
    // 기록 수 체크
    if (userStats.totalRecords === 1) {
      newAchievements.push(unlock('first_step'));
    }
    
    // 연속 기록 체크
    if (userStats.currentStreak === 7) {
      newAchievements.push(unlock('week_streak'));
    }
    
    // 고유 커피 체크
    if (userStats.uniqueCoffees === 10) {
      newAchievements.push(unlock('explorer'));
    }
    
    return newAchievements;
  }
}
```

---

## 7. 데이터 동기화

### 오프라인 지원
```typescript
interface OfflineSync {
  // 로컬 스토리지
  localDB: IndexedDB;
  
  // 동기화 큐
  syncQueue: SyncOperation[];
  
  // 동기화 실행
  sync(): Promise<SyncResult>;
  
  // 충돌 해결
  resolveConflict(
    local: Record,
    remote: Record
  ): Record;
}

// PWA Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-records') {
    event.waitUntil(syncRecords());
  }
});
```

---

## 성능 목표

### 응답 시간
- 화면 전환: < 300ms
- OCR 처리: < 3s
- GPS 검색: < 2s
- 데이터 저장: < 500ms

### 리소스 사용
- 앱 크기: < 10MB (초기)
- 메모리: < 100MB
- 배터리: 최소 영향

### 신뢰성
- 오프라인 모드 지원
- 자동 재시도
- 데이터 무결성 보장