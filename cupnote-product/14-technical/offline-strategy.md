# CupNote 오프라인 모드 전략

## 개요
네트워크 연결이 불안정하거나 없는 환경에서도 CupNote의 핵심 기능을 사용할 수 있도록 하는 오프라인 우선(Offline-First) 전략

---

## 1. 오프라인 우선 아키텍처

### 1.1 기술 스택

```typescript
interface OfflineArchitecture {
  // 로컬 저장소
  storage: {
    primary: 'IndexedDB',      // 메인 데이터 저장소
    cache: 'localStorage',      // 빠른 접근용 캐시
    binary: 'Cache API',        // 이미지, 파일 저장
    temporary: 'sessionStorage' // 임시 데이터
  };
  
  // 동기화 전략
  sync: {
    method: 'Background Sync API',
    fallback: 'Periodic Sync',
    conflict: 'Last-Write-Wins + Merge'
  };
  
  // 서비스 워커
  serviceWorker: {
    strategy: 'Cache-First',
    version: '1.0.0',
    scope: '/'
  };
}
```

### 1.2 데이터 우선순위

```typescript
enum DataPriority {
  CRITICAL = 1,    // 즉시 동기화 필요
  HIGH = 2,        // 가능한 빨리 동기화
  NORMAL = 3,      // 일반 동기화
  LOW = 4,         // 유휴 시간 동기화
  OPTIONAL = 5     // 선택적 동기화
}

interface DataClassification {
  // Critical - 즉시 동기화
  critical: [
    'user_authentication',
    'payment_transactions',
    'security_settings'
  ];
  
  // High - 높은 우선순위
  high: [
    'tasting_records',
    'coffee_ratings',
    'community_matches'
  ];
  
  // Normal - 일반 우선순위
  normal: [
    'user_preferences',
    'draft_records',
    'local_settings'
  ];
  
  // Low - 낮은 우선순위
  low: [
    'analytics_data',
    'usage_metrics',
    'debug_logs'
  ];
}
```

---

## 2. IndexedDB 스키마

### 2.1 데이터베이스 구조

```typescript
interface CupNoteDB {
  version: 1;
  stores: {
    // 테이스팅 기록
    tastings: {
      keyPath: 'id';
      indexes: [
        'userId',
        'coffeeId',
        'createdAt',
        'syncStatus',
        'mode'
      ];
    };
    
    // 임시저장
    drafts: {
      keyPath: 'id';
      indexes: [
        'userId',
        'lastModified',
        'mode',
        'step'
      ];
    };
    
    // 커피 정보 캐시
    coffees: {
      keyPath: 'id';
      indexes: [
        'roasteryId',
        'name',
        'lastAccessed'
      ];
    };
    
    // 동기화 큐
    syncQueue: {
      keyPath: 'id';
      indexes: [
        'priority',
        'createdAt',
        'retryCount',
        'status'
      ];
    };
    
    // 이미지 캐시
    images: {
      keyPath: 'url';
      indexes: [
        'type',
        'size',
        'lastAccessed',
        'expiresAt'
      ];
    };
  };
}
```

### 2.2 데이터 모델

```typescript
interface OfflineTasting {
  id: string;
  userId: string;
  mode: 'cafe' | 'homecafe';
  
  // 데이터
  data: {
    coffeeInfo: CoffeeInfo;
    brewSetup?: BrewSetup;
    flavorSelection: string[];
    sensoryExpression: SensoryExpression;
    sensoryMouthFeel?: SensoryMouthFeel;
    personalNotes: PersonalNotes;
  };
  
  // 메타데이터
  metadata: {
    createdAt: Date;
    modifiedAt: Date;
    syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error';
    syncedAt?: Date;
    version: number;
    deviceId: string;
  };
  
  // 충돌 해결
  conflicts?: {
    serverVersion?: OfflineTasting;
    resolution?: 'local' | 'server' | 'merged';
    resolvedAt?: Date;
  };
}
```

---

## 3. Service Worker 구현

### 3.1 캐싱 전략

```javascript
// sw.js
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`
};

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/css/app.css',
  '/js/app.js',
  '/icons/icon-192.png'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  }
  // 이미지 요청 처리
  else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  }
  // 정적 리소스 처리
  else {
    event.respondWith(handleStaticRequest(request));
  }
});
```

### 3.2 API 요청 처리

```javascript
async function handleApiRequest(request) {
  // 1. 캐시 우선 확인
  const cachedResponse = await caches.match(request);
  
  // 2. 네트워크 연결 확인
  if (navigator.onLine) {
    try {
      // 네트워크 요청
      const networkResponse = await fetch(request);
      
      // 성공 시 캐시 업데이트
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAMES.api);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      // 네트워크 실패 시 캐시 반환
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 오프라인 폴백
      return createOfflineResponse(request);
    }
  }
  
  // 3. 오프라인 시 캐시 반환
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 4. 오프라인 응답 생성
  return createOfflineResponse(request);
}
```

### 3.3 백그라운드 동기화

```javascript
// Background Sync 등록
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tastings') {
    event.waitUntil(syncTastings());
  } else if (event.tag === 'sync-images') {
    event.waitUntil(syncImages());
  }
});

async function syncTastings() {
  const db = await openDB('CupNoteDB', 1);
  const tx = db.transaction('syncQueue', 'readonly');
  const queue = await tx.objectStore('syncQueue').getAll();
  
  for (const item of queue) {
    try {
      // 우선순위별 처리
      if (item.priority === DataPriority.CRITICAL) {
        await syncImmediately(item);
      } else {
        await syncWithRetry(item);
      }
    } catch (error) {
      await handleSyncError(item, error);
    }
  }
}
```

---

## 4. 동기화 전략

### 4.1 동기화 매니저

```typescript
class SyncManager {
  private queue: SyncQueue;
  private isOnline: boolean;
  private syncInProgress: boolean = false;
  
  constructor() {
    this.queue = new SyncQueue();
    this.isOnline = navigator.onLine;
    
    // 온라인 상태 모니터링
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  // 데이터 추가
  async addToSync(data: any, priority: DataPriority = DataPriority.NORMAL) {
    const syncItem: SyncItem = {
      id: generateId(),
      data,
      priority,
      createdAt: new Date(),
      retryCount: 0,
      status: 'pending'
    };
    
    await this.queue.add(syncItem);
    
    // Critical 데이터는 즉시 동기화 시도
    if (priority === DataPriority.CRITICAL && this.isOnline) {
      await this.syncItem(syncItem);
    }
  }
  
  // 온라인 복귀 시 처리
  private async handleOnline() {
    this.isOnline = true;
    showNotification('온라인 상태로 전환되었습니다. 동기화를 시작합니다.');
    
    // 대기 중인 항목 동기화
    await this.syncAll();
  }
  
  // 오프라인 전환 시 처리
  private handleOffline() {
    this.isOnline = false;
    showNotification('오프라인 모드로 전환되었습니다. 데이터는 로컬에 저장됩니다.');
  }
  
  // 전체 동기화
  async syncAll() {
    if (this.syncInProgress || !this.isOnline) return;
    
    this.syncInProgress = true;
    const items = await this.queue.getPending();
    
    // 우선순위별 그룹화
    const grouped = this.groupByPriority(items);
    
    // 우선순위 순서대로 처리
    for (const priority of [1, 2, 3, 4, 5]) {
      const group = grouped[priority] || [];
      await this.syncBatch(group);
    }
    
    this.syncInProgress = false;
  }
  
  // 배치 동기화
  private async syncBatch(items: SyncItem[]) {
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(
        batch.map(item => this.syncItem(item))
      );
    }
  }
  
  // 개별 항목 동기화
  private async syncItem(item: SyncItem) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        await this.queue.markSynced(item.id);
      } else if (response.status === 409) {
        // 충돌 처리
        await this.handleConflict(item, await response.json());
      } else {
        throw new Error(`Sync failed: ${response.status}`);
      }
    } catch (error) {
      await this.handleSyncError(item, error);
    }
  }
}
```

### 4.2 충돌 해결

```typescript
interface ConflictResolution {
  strategy: 'last-write-wins' | 'server-wins' | 'client-wins' | 'merge';
  
  resolve: async (local: any, server: any) => {
    switch (this.strategy) {
      case 'last-write-wins':
        return local.modifiedAt > server.modifiedAt ? local : server;
        
      case 'server-wins':
        return server;
        
      case 'client-wins':
        return local;
        
      case 'merge':
        return this.mergeConflicts(local, server);
    }
  };
  
  mergeConflicts: (local: any, server: any) => {
    // 필드별 병합 규칙
    const merged = {
      ...server,
      // 로컬 우선 필드
      personalNotes: local.personalNotes || server.personalNotes,
      // 서버 우선 필드
      matchScore: server.matchScore,
      // 병합 필드 (배열)
      flavorSelection: [...new Set([
        ...local.flavorSelection,
        ...server.flavorSelection
      ])],
      // 타임스탬프
      modifiedAt: new Date(),
      mergedAt: new Date()
    };
    
    return merged;
  };
}
```

---

## 5. 오프라인 UI/UX

### 5.1 오프라인 인디케이터

```typescript
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline && syncStatus === 'idle') {
    return null; // 온라인이고 동기화 중이 아니면 숨김
  }
  
  return (
    <div className={`offline-indicator ${isOnline ? 'syncing' : 'offline'}`}>
      {!isOnline && (
        <>
          <Icon name="wifi-off" />
          <span>오프라인 모드</span>
        </>
      )}
      
      {isOnline && syncStatus === 'syncing' && (
        <>
          <Spinner />
          <span>동기화 중...</span>
        </>
      )}
      
      {isOnline && syncStatus === 'complete' && (
        <>
          <Icon name="check" />
          <span>동기화 완료</span>
        </>
      )}
    </div>
  );
};
```

### 5.2 오프라인 기능 제한

```typescript
interface OfflineFeatures {
  // 사용 가능한 기능
  available: [
    'tasting_record',      // 테이스팅 기록
    'view_history',        // 기록 보기
    'draft_management',    // 임시저장 관리
    'timer_function',      // 타이머 기능
    'local_search'         // 로컬 검색
  ];
  
  // 제한된 기능
  limited: {
    community_match: {
      available: false,
      message: '온라인 연결 후 매치 점수를 확인할 수 있습니다'
    },
    cafe_search: {
      available: true,
      limitation: '캐시된 카페 정보만 사용 가능'
    },
    image_upload: {
      available: true,
      limitation: '온라인 연결 후 업로드됩니다'
    }
  };
  
  // 불가능한 기능
  unavailable: [
    'social_features',     // 소셜 기능
    'real_time_sync',      // 실시간 동기화
    'payment_processing',  // 결제 처리
    'external_api_calls'   // 외부 API 호출
  ];
}
```

---

## 6. 캐시 관리

### 6.1 캐시 전략

```typescript
class CacheManager {
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly CACHE_DURATION = {
    images: 7 * 24 * 60 * 60 * 1000,      // 7일
    api: 24 * 60 * 60 * 1000,             // 1일
    static: 30 * 24 * 60 * 60 * 1000,     // 30일
    coffeeData: 3 * 24 * 60 * 60 * 1000   // 3일
  };
  
  // 캐시 정리
  async cleanupCache() {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const cacheTime = response.headers.get('sw-cache-time');
          if (cacheTime && this.isExpired(cacheTime, cacheName)) {
            await cache.delete(request);
          }
        }
      }
    }
  }
  
  // 캐시 크기 관리
  async manageCacheSize() {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    
    if (usage > this.MAX_CACHE_SIZE) {
      // LRU 방식으로 오래된 캐시 삭제
      await this.evictLRU();
    }
  }
  
  // LRU 캐시 제거
  private async evictLRU() {
    const db = await openDB('CupNoteDB', 1);
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    
    // lastAccessed 기준 정렬
    const images = await store.index('lastAccessed').getAll();
    
    // 오래된 순서대로 삭제
    const deleteCount = Math.floor(images.length * 0.2); // 20% 삭제
    
    for (let i = 0; i < deleteCount; i++) {
      await store.delete(images[i].url);
      await caches.delete(images[i].url);
    }
  }
}
```

### 6.2 프리캐싱

```typescript
class PreCacheManager {
  // 사용자 패턴 기반 프리캐싱
  async preCacheUserPattern() {
    const userPattern = await this.analyzeUserPattern();
    
    // 자주 방문하는 카페 데이터
    if (userPattern.frequentCafes) {
      await this.preCacheCafes(userPattern.frequentCafes);
    }
    
    // 자주 사용하는 로스터리
    if (userPattern.frequentRoasteries) {
      await this.preCacheRoasteries(userPattern.frequentRoasteries);
    }
    
    // 최근 본 커피
    if (userPattern.recentCoffees) {
      await this.preCacheCoffees(userPattern.recentCoffees);
    }
  }
  
  // 카페 데이터 프리캐싱
  private async preCacheCafes(cafeIds: string[]) {
    const cache = await caches.open(CACHE_NAMES.api);
    
    for (const cafeId of cafeIds) {
      const url = `/api/cafes/${cafeId}`;
      
      if (!(await cache.match(url))) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.error('Failed to pre-cache cafe:', cafeId);
        }
      }
    }
  }
}
```

---

## 7. 데이터 압축

### 7.1 압축 전략

```typescript
class DataCompressor {
  // 텍스트 압축 (CompressionStream API)
  async compressText(text: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(data);
    writer.close();
    
    const compressed = [];
    const reader = stream.readable.getReader();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      compressed.push(...value);
    }
    
    return new Uint8Array(compressed);
  }
  
  // 이미지 압축
  async compressImage(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 최대 크기 제한
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;
    
    let { width, height } = bitmap;
    
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width *= ratio;
      height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bitmap, 0, 0, width, height);
    
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        0.85 // 85% 품질
      );
    });
  }
}
```

---

## 8. 오프라인 분석

### 8.1 로컬 분석

```typescript
class OfflineAnalytics {
  private events: AnalyticsEvent[] = [];
  
  // 이벤트 기록
  track(event: string, properties?: any) {
    this.events.push({
      event,
      properties,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
      offline: !navigator.onLine
    });
    
    // 로컬 저장
    this.saveToLocal();
    
    // 온라인이면 즉시 전송
    if (navigator.onLine) {
      this.flush();
    }
  }
  
  // 로컬 저장
  private async saveToLocal() {
    const db = await openDB('CupNoteDB', 1);
    const tx = db.transaction('analytics', 'readwrite');
    
    for (const event of this.events) {
      await tx.objectStore('analytics').add(event);
    }
    
    this.events = [];
  }
  
  // 배치 전송
  async flush() {
    const db = await openDB('CupNoteDB', 1);
    const events = await db.getAll('analytics');
    
    if (events.length === 0) return;
    
    try {
      const response = await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
      
      if (response.ok) {
        // 전송 성공 시 로컬 데이터 삭제
        const tx = db.transaction('analytics', 'readwrite');
        await tx.objectStore('analytics').clear();
      }
    } catch (error) {
      console.error('Failed to flush analytics:', error);
    }
  }
}
```

---

## 9. 오프라인 테스트

### 9.1 테스트 시나리오

```typescript
describe('Offline Functionality', () => {
  beforeEach(() => {
    // 오프라인 상태 시뮬레이션
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.navigator, 'onLine').value(false);
      }
    });
  });
  
  test('오프라인에서 테이스팅 기록 가능', () => {
    // 테이스팅 플로우 진행
    cy.get('[data-cy=start-tasting]').click();
    cy.get('[data-cy=mode-cafe]').click();
    
    // 데이터 입력
    fillTastingForm();
    
    // 저장
    cy.get('[data-cy=save]').click();
    
    // IndexedDB 확인
    cy.window().then(async (win) => {
      const db = await win.indexedDB.open('CupNoteDB');
      const tx = db.transaction('tastings', 'readonly');
      const count = await tx.objectStore('tastings').count();
      expect(count).toBe(1);
    });
  });
  
  test('온라인 복귀 시 자동 동기화', () => {
    // 오프라인에서 데이터 생성
    createOfflineData();
    
    // 온라인 전환
    cy.window().then((win) => {
      win.navigator.onLine = true;
      win.dispatchEvent(new Event('online'));
    });
    
    // 동기화 확인
    cy.wait('@syncRequest');
    cy.get('[data-cy=sync-indicator]').should('contain', '동기화 완료');
  });
});
```

---

## 10. 모니터링 및 로깅

### 10.1 오프라인 메트릭

```typescript
interface OfflineMetrics {
  // 사용 통계
  usage: {
    offlineDuration: number;        // 오프라인 사용 시간
    offlineActionCount: number;     // 오프라인 액션 수
    dataCreatedOffline: number;     // 오프라인 생성 데이터
    syncSuccessRate: number;        // 동기화 성공률
  };
  
  // 성능 지표
  performance: {
    cacheHitRate: number;           // 캐시 적중률
    averageSyncTime: number;        // 평균 동기화 시간
    conflictRate: number;           // 충돌 발생률
    dataLossRate: number;           // 데이터 손실률
  };
  
  // 에러 추적
  errors: {
    syncFailures: SyncError[];
    cacheErrors: CacheError[];
    storageErrors: StorageError[];
  };
}

// 메트릭 수집
const collectOfflineMetrics = async (): Promise<OfflineMetrics> => {
  const db = await openDB('CupNoteDB', 1);
  
  // 오프라인 생성 데이터 수
  const offlineData = await db.getAllFromIndex(
    'tastings',
    'syncStatus',
    'pending'
  );
  
  // 동기화 성공률 계산
  const syncQueue = await db.getAll('syncQueue');
  const successCount = syncQueue.filter(s => s.status === 'synced').length;
  const successRate = successCount / syncQueue.length;
  
  return {
    usage: {
      offlineDuration: getOfflineDuration(),
      offlineActionCount: offlineData.length,
      dataCreatedOffline: offlineData.length,
      syncSuccessRate: successRate
    },
    // ... 기타 메트릭
  };
};
```

---

## 11. 구현 우선순위

### Phase 1: Core Offline (3일)
1. IndexedDB 설정
2. Service Worker 기본 구현
3. 오프라인 인디케이터

### Phase 2: Sync System (4일)
4. 동기화 매니저
5. 충돌 해결
6. Background Sync

### Phase 3: Optimization (5일)
7. 캐시 최적화
8. 데이터 압축
9. 프리캐싱
10. 성능 모니터링

---

## 12. 주의사항

### 보안 고려사항
- 민감한 데이터는 암호화하여 저장
- 로컬 저장소 크기 제한 준수
- 사용자 동의 후 데이터 저장

### 사용자 경험
- 오프라인 상태 명확히 표시
- 동기화 진행 상황 표시
- 충돌 해결 시 사용자 선택 옵션 제공

### 성능 최적화
- 배경 동기화로 UX 방해 최소화
- 점진적 동기화로 부하 분산
- 효율적인 캐시 관리

---

*작성일: 2025-08-08*