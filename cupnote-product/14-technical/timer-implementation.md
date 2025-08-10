# HomeCafe Mode 타이머 구현 명세

## 개요
HomeCafe Mode의 BrewSetup 단계에서 사용되는 브루잉 타이머 기능의 상세 구현 명세

---

## 1. 타이머 시스템 아키텍처

### 1.1 타이머 상태 관리

```typescript
interface TimerState {
  // 타이머 상태
  status: 'idle' | 'running' | 'paused' | 'completed';
  
  // 시간 데이터
  startTime: Date | null;
  currentTime: number; // milliseconds
  elapsedTime: number; // milliseconds
  
  // 페이즈 관리
  currentPhase: number;
  phases: BrewPhase[];
  lapTimes: LapTime[];
  
  // 설정
  settings: TimerSettings;
  
  // 알림
  notifications: NotificationQueue[];
}

interface BrewPhase {
  id: string;
  name: string;
  targetDuration: number; // seconds
  waterAmount: number; // ml
  instructions: string;
  completed: boolean;
  actualDuration?: number;
}
```

### 1.2 타이머 액션

```typescript
interface TimerActions {
  // 기본 컨트롤
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  
  // 페이즈 관리
  nextPhase: () => void;
  skipPhase: () => void;
  markPhaseComplete: (phaseId: string) => void;
  
  // 랩타임
  recordLap: (label?: string) => void;
  deleteLap: (lapId: string) => void;
  
  // 설정
  updateSettings: (settings: Partial<TimerSettings>) => void;
  loadPreset: (presetId: string) => void;
  saveAsPreset: (name: string) => void;
}
```

---

## 2. 브루잉 페이즈 시스템

### 2.1 기본 페이즈 템플릿

```typescript
const defaultBrewPhases = {
  v60: [
    {
      id: 'bloom',
      name: '블룸 (Bloom)',
      targetDuration: 30,
      waterAmount: 40,
      instructions: '원두량의 2배 물을 부어 적시기',
      vibrationPattern: [200, 100, 200] // 진동 패턴
    },
    {
      id: 'first_pour',
      name: '1차 푸어 (First Pour)',
      targetDuration: 30,
      waterAmount: 120,
      instructions: '천천히 원을 그리며 붓기',
      vibrationPattern: [200]
    },
    {
      id: 'second_pour',
      name: '2차 푸어 (Second Pour)',
      targetDuration: 45,
      waterAmount: 100,
      instructions: '중심에서 바깥쪽으로 붓기',
      vibrationPattern: [200]
    },
    {
      id: 'final_pour',
      name: '마지막 푸어 (Final)',
      targetDuration: 30,
      waterAmount: 60,
      instructions: '남은 물량 마무리',
      vibrationPattern: [200, 100, 200, 100, 200]
    }
  ],
  
  kalita: [
    // Kalita Wave 전용 페이즈
    {
      id: 'bloom',
      name: '블룸',
      targetDuration: 45,
      waterAmount: 50,
      instructions: '평평하게 적시기'
    },
    {
      id: 'pulse_1',
      name: '펄스 1',
      targetDuration: 30,
      waterAmount: 100,
      instructions: '중앙에 집중'
    },
    {
      id: 'pulse_2',
      name: '펄스 2',
      targetDuration: 30,
      waterAmount: 100,
      instructions: '일정한 속도로'
    },
    {
      id: 'pulse_3',
      name: '펄스 3',
      targetDuration: 30,
      waterAmount: 70,
      instructions: '마무리'
    }
  ]
};
```

### 2.2 페이즈 전환 로직

```typescript
const phaseTransitionLogic = {
  // 자동 전환 조건
  autoAdvance: {
    enabled: false, // 기본값: 수동
    conditions: {
      timeElapsed: true,
      userConfirmation: false,
      waterAmountReached: false
    }
  },
  
  // 전환 시 액션
  onPhaseComplete: async (phase: BrewPhase) => {
    // 1. 진동 알림
    await triggerVibration(phase.vibrationPattern);
    
    // 2. 소리 알림
    await playSound('phase_complete.mp3');
    
    // 3. 시각 알림
    showNotification(`${phase.name} 완료!`);
    
    // 4. 데이터 저장
    saveLapTime({
      phaseId: phase.id,
      duration: phase.actualDuration,
      timestamp: new Date()
    });
    
    // 5. 다음 페이즈 준비
    if (hasNextPhase()) {
      prepareNextPhase();
    } else {
      completeTimer();
    }
  }
};
```

---

## 3. 시간 추적 시스템

### 3.1 정밀 시간 측정

```typescript
class PrecisionTimer {
  private startTime: number = 0;
  private pausedTime: number = 0;
  private intervals: number[] = [];
  
  start(): void {
    this.startTime = performance.now();
    this.tick();
  }
  
  private tick(): void {
    const interval = requestAnimationFrame(() => {
      if (this.isRunning) {
        this.updateDisplay();
        this.checkPhaseCompletion();
        this.tick();
      }
    });
    this.intervals.push(interval);
  }
  
  pause(): void {
    this.pausedTime = performance.now();
    this.cancelAnimationFrames();
  }
  
  resume(): void {
    const pauseDuration = performance.now() - this.pausedTime;
    this.startTime += pauseDuration;
    this.tick();
  }
  
  getElapsedTime(): number {
    return Math.floor(performance.now() - this.startTime);
  }
  
  private cancelAnimationFrames(): void {
    this.intervals.forEach(id => cancelAnimationFrame(id));
    this.intervals = [];
  }
}
```

### 3.2 랩타임 기록

```typescript
interface LapTime {
  id: string;
  label: string;
  timestamp: Date;
  elapsedTime: number; // milliseconds from start
  splitTime: number;   // milliseconds from previous lap
  phaseId?: string;
  notes?: string;
}

class LapTimeManager {
  private lapTimes: LapTime[] = [];
  
  recordLap(label: string, elapsedTime: number): LapTime {
    const previousLap = this.lapTimes[this.lapTimes.length - 1];
    const splitTime = previousLap 
      ? elapsedTime - previousLap.elapsedTime 
      : elapsedTime;
    
    const lap: LapTime = {
      id: generateId(),
      label,
      timestamp: new Date(),
      elapsedTime,
      splitTime
    };
    
    this.lapTimes.push(lap);
    return lap;
  }
  
  formatLapTime(lap: LapTime): string {
    const elapsed = this.formatTime(lap.elapsedTime);
    const split = this.formatTime(lap.splitTime);
    return `${lap.label}: ${elapsed} (+${split})`;
  }
  
  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
```

---

## 4. 알림 시스템

### 4.1 알림 타입 정의

```typescript
interface TimerNotification {
  type: 'phase_start' | 'phase_end' | 'time_milestone' | 'countdown' | 'completion';
  
  // 알림 채널
  channels: {
    vibration: boolean;
    sound: boolean;
    visual: boolean;
    voice: boolean; // TTS
  };
  
  // 알림 내용
  content: {
    title: string;
    message: string;
    countdown?: number; // 카운트다운 초
  };
  
  // 알림 패턴
  patterns: {
    vibration: number[]; // [진동, 멈춤, 진동, ...]
    sound: string; // 사운드 파일명
    voice: string; // TTS 텍스트
  };
}
```

### 4.2 알림 트리거

```typescript
class NotificationManager {
  // 페이즈 시작 알림
  async notifyPhaseStart(phase: BrewPhase): Promise<void> {
    const notification: TimerNotification = {
      type: 'phase_start',
      channels: {
        vibration: true,
        sound: true,
        visual: true,
        voice: false
      },
      content: {
        title: phase.name,
        message: phase.instructions
      },
      patterns: {
        vibration: [200],
        sound: 'bell.mp3',
        voice: `${phase.name} 시작`
      }
    };
    
    await this.trigger(notification);
  }
  
  // 카운트다운 알림
  async notifyCountdown(seconds: number): Promise<void> {
    if (seconds <= 5 && seconds > 0) {
      await this.trigger({
        type: 'countdown',
        channels: { sound: true, visual: true },
        content: {
          title: '카운트다운',
          message: `${seconds}초`,
          countdown: seconds
        },
        patterns: {
          sound: 'tick.mp3'
        }
      });
    }
  }
  
  // 진동 트리거
  private async triggerVibration(pattern: number[]): Promise<void> {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
  
  // 소리 재생
  private async playSound(filename: string): Promise<void> {
    const audio = new Audio(`/sounds/${filename}`);
    audio.volume = this.settings.soundVolume;
    await audio.play();
  }
}
```

---

## 5. UI 컴포넌트

### 5.1 타이머 디스플레이

```typescript
interface TimerDisplay {
  // 메인 타이머
  mainTimer: {
    format: 'MM:SS' | 'M:SS' | 'HH:MM:SS';
    fontSize: 'large' | 'medium' | 'small';
    showMilliseconds: boolean;
  };
  
  // 페이즈 진행률
  phaseProgress: {
    type: 'circular' | 'linear' | 'both';
    showPercentage: boolean;
    animateTransition: boolean;
  };
  
  // 물 붓기 가이드
  pourGuide: {
    currentAmount: number;
    targetAmount: number;
    pourRate: number; // ml/s
    visualIndicator: 'bar' | 'circle' | 'number';
  };
}
```

### 5.2 React 컴포넌트

```tsx
const BrewTimer: React.FC = () => {
  const [timer, setTimer] = useState<TimerState>(initialTimerState);
  const [display, setDisplay] = useState('00:00');
  
  // 타이머 업데이트 (60fps)
  useEffect(() => {
    let animationId: number;
    
    const updateTimer = () => {
      if (timer.status === 'running') {
        const elapsed = performance.now() - timer.startTime;
        setDisplay(formatTime(elapsed));
        
        // 페이즈 체크
        checkPhaseCompletion(elapsed);
        
        animationId = requestAnimationFrame(updateTimer);
      }
    };
    
    if (timer.status === 'running') {
      updateTimer();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [timer.status]);
  
  return (
    <div className="brew-timer">
      {/* 메인 디스플레이 */}
      <div className="timer-display">
        <h1>{display}</h1>
      </div>
      
      {/* 페이즈 인디케이터 */}
      <div className="phase-indicator">
        {timer.phases.map((phase, index) => (
          <PhaseBlock
            key={phase.id}
            phase={phase}
            active={index === timer.currentPhase}
            completed={phase.completed}
          />
        ))}
      </div>
      
      {/* 컨트롤 버튼 */}
      <div className="timer-controls">
        {timer.status === 'idle' && (
          <button onClick={handleStart}>시작</button>
        )}
        {timer.status === 'running' && (
          <>
            <button onClick={handlePause}>일시정지</button>
            <button onClick={handleLap}>랩타임</button>
          </>
        )}
        {timer.status === 'paused' && (
          <>
            <button onClick={handleResume}>재개</button>
            <button onClick={handleReset}>리셋</button>
          </>
        )}
      </div>
      
      {/* 랩타임 리스트 */}
      <div className="lap-times">
        {timer.lapTimes.map(lap => (
          <LapTimeRow key={lap.id} lap={lap} />
        ))}
      </div>
    </div>
  );
};
```

---

## 6. 데이터 저장

### 6.1 타이머 데이터 구조

```typescript
interface BrewTimerData {
  // 기본 정보
  brewId: string;
  coffeeId: string;
  dripperId: string;
  timestamp: Date;
  
  // 시간 데이터
  totalTime: number; // milliseconds
  bloomTime: number;
  phases: CompletedPhase[];
  lapTimes: LapTime[];
  
  // 설정값
  settings: {
    dripper: string;
    ratio: string;
    coffeeAmount: number;
    waterAmount: number;
    waterTemperature: number;
    grindSize?: string;
  };
  
  // 메타데이터
  metadata: {
    appVersion: string;
    deviceInfo: string;
    timerVersion: string;
  };
}
```

### 6.2 저장 로직

```typescript
const saveTimerData = async (timerData: BrewTimerData): Promise<void> => {
  try {
    // 1. 로컬 저장 (즉시)
    await localforage.setItem(`timer_${timerData.brewId}`, timerData);
    
    // 2. 서버 동기화 (비동기)
    syncToServer(timerData).catch(error => {
      console.error('Sync failed:', error);
      // 재시도 큐에 추가
      addToRetryQueue(timerData);
    });
    
    // 3. 분석 데이터 전송
    trackTimerAnalytics({
      totalTime: timerData.totalTime,
      phaseCount: timerData.phases.length,
      dripper: timerData.settings.dripper
    });
    
  } catch (error) {
    console.error('Failed to save timer data:', error);
    showError('타이머 데이터 저장 실패');
  }
};
```

---

## 7. 설정 및 프리셋

### 7.1 타이머 설정

```typescript
interface TimerSettings {
  // 알림 설정
  notifications: {
    vibrationEnabled: boolean;
    soundEnabled: boolean;
    soundVolume: number; // 0-1
    voiceEnabled: boolean;
    countdownSeconds: number; // 마지막 N초 카운트다운
  };
  
  // 자동화 설정
  automation: {
    autoAdvancePhases: boolean;
    pauseBetweenPhases: boolean;
    pauseDuration: number; // seconds
  };
  
  // 디스플레이 설정
  display: {
    keepScreenOn: boolean;
    showMilliseconds: boolean;
    phaseIndicatorStyle: 'minimal' | 'detailed';
    theme: 'light' | 'dark' | 'auto';
  };
  
  // 정밀도 설정
  precision: {
    updateFrequency: 60 | 30 | 10; // fps
    lapTimePrecision: 'seconds' | 'milliseconds';
  };
}
```

### 7.2 프리셋 관리

```typescript
interface TimerPreset {
  id: string;
  name: string;
  dripper: string;
  phases: BrewPhase[];
  settings: Partial<TimerSettings>;
  createdAt: Date;
  usageCount: number;
  
  // 메타데이터
  tags: string[];
  coffeeType?: 'light' | 'medium' | 'dark';
  description?: string;
}

const presetManager = {
  // 기본 프리셋
  defaultPresets: [
    {
      name: 'V60 스탠다드',
      dripper: 'v60',
      phases: defaultBrewPhases.v60,
      coffeeType: 'light'
    },
    {
      name: 'Kalita 웨이브',
      dripper: 'kalita',
      phases: defaultBrewPhases.kalita,
      coffeeType: 'medium'
    }
  ],
  
  // 프리셋 저장
  savePreset: async (name: string, currentTimer: TimerState) => {
    const preset: TimerPreset = {
      id: generateId(),
      name,
      dripper: currentTimer.dripper,
      phases: currentTimer.phases,
      settings: currentTimer.settings,
      createdAt: new Date(),
      usageCount: 0
    };
    
    await saveToPresets(preset);
    return preset;
  },
  
  // 프리셋 로드
  loadPreset: async (presetId: string): Promise<TimerState> => {
    const preset = await getPreset(presetId);
    
    // 사용 횟수 증가
    preset.usageCount++;
    await updatePreset(preset);
    
    return {
      ...initialTimerState,
      phases: preset.phases,
      settings: { ...initialTimerState.settings, ...preset.settings }
    };
  }
};
```

---

## 8. 오프라인 지원

### 8.1 오프라인 타이머

```typescript
class OfflineTimer {
  private worker: Worker;
  
  constructor() {
    // Web Worker에서 타이머 실행 (백그라운드)
    this.worker = new Worker('/timer-worker.js');
    
    this.worker.onmessage = (e) => {
      if (e.data.type === 'tick') {
        this.updateDisplay(e.data.elapsed);
      }
    };
  }
  
  start(): void {
    this.worker.postMessage({ action: 'start' });
  }
  
  pause(): void {
    this.worker.postMessage({ action: 'pause' });
  }
  
  // 백그라운드에서도 정확한 시간 유지
  private maintainAccuracy(): void {
    // Service Worker 사용
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        reg.active?.postMessage({
          type: 'timer',
          action: 'maintain'
        });
      });
    }
  }
}
```

### 8.2 로컬 데이터 관리

```typescript
const offlineDataManager = {
  // IndexedDB에 저장
  saveOffline: async (timerData: BrewTimerData) => {
    const db = await openDB('CupNoteDB', 1);
    const tx = db.transaction('timers', 'readwrite');
    await tx.objectStore('timers').add(timerData);
    await tx.done;
  },
  
  // 온라인 복귀 시 동기화
  syncOnReconnect: async () => {
    const db = await openDB('CupNoteDB', 1);
    const unsyncedTimers = await db.getAllFromIndex('timers', 'synced', false);
    
    for (const timer of unsyncedTimers) {
      try {
        await syncToServer(timer);
        timer.synced = true;
        await db.put('timers', timer);
      } catch (error) {
        console.error('Sync failed for timer:', timer.brewId);
      }
    }
  }
};
```

---

## 9. 성능 최적화

### 9.1 렌더링 최적화

```typescript
const optimizations = {
  // 디바운싱
  debouncedUpdate: debounce((time: number) => {
    updateDisplay(time);
  }, 16), // ~60fps
  
  // 메모이제이션
  memoizedFormatTime: memoize((ms: number) => {
    return formatTime(ms);
  }),
  
  // 가상화
  virtualizedLapList: {
    itemHeight: 40,
    visibleItems: 10,
    bufferSize: 3
  },
  
  // 애니메이션 최적화
  useGPU: {
    transform: 'translateZ(0)', // GPU 레이어 강제
    willChange: 'transform'
  }
};
```

### 9.2 배터리 최적화

```typescript
const batteryOptimization = {
  // 배터리 상태 모니터링
  monitorBattery: async () => {
    const battery = await navigator.getBattery();
    
    battery.addEventListener('levelchange', () => {
      if (battery.level < 0.15) {
        // 저전력 모드
        reducePowerConsumption();
      }
    });
  },
  
  // 저전력 모드
  reducePowerConsumption: () => {
    // FPS 감소
    settings.precision.updateFrequency = 10;
    
    // 애니메이션 비활성화
    settings.display.animateTransitions = false;
    
    // 화면 밝기 감소 제안
    suggestReduceBrightness();
  }
};
```

---

## 10. 테스트 시나리오

### 10.1 단위 테스트

```typescript
describe('BrewTimer', () => {
  test('타이머 정확도', async () => {
    const timer = new PrecisionTimer();
    timer.start();
    
    await sleep(1000);
    const elapsed = timer.getElapsedTime();
    
    expect(elapsed).toBeGreaterThanOrEqual(995);
    expect(elapsed).toBeLessThanOrEqual(1005);
  });
  
  test('페이즈 전환', () => {
    const timer = createTimer();
    timer.start();
    timer.nextPhase();
    
    expect(timer.currentPhase).toBe(1);
    expect(timer.phases[0].completed).toBe(true);
  });
  
  test('랩타임 기록', () => {
    const manager = new LapTimeManager();
    const lap = manager.recordLap('First Pour', 30000);
    
    expect(lap.splitTime).toBe(30000);
    expect(lap.label).toBe('First Pour');
  });
});
```

---

## 11. 구현 우선순위

### Phase 1: Core (2일)
1. 기본 타이머 기능
2. 시작/정지/리셋
3. 시간 표시

### Phase 2: Enhanced (3일)
4. 페이즈 시스템
5. 랩타임 기록
6. 알림 기능

### Phase 3: Advanced (3일)
7. 프리셋 관리
8. 오프라인 지원
9. 데이터 동기화

---

*작성일: 2025-08-08*