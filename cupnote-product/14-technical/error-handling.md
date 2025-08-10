# CupNote 에러 처리 매트릭스

## 개요
CupNote 애플리케이션에서 발생 가능한 모든 에러 시나리오와 대응 전략을 정의한 종합 에러 처리 가이드

---

## 1. 에러 분류 체계

### 1.1 에러 카테고리

```typescript
enum ErrorCategory {
  NETWORK = 'NETWORK',           // 네트워크 관련
  VALIDATION = 'VALIDATION',     // 입력 검증
  AUTHENTICATION = 'AUTH',       // 인증/인가
  BUSINESS = 'BUSINESS',         // 비즈니스 로직
  SYSTEM = 'SYSTEM',            // 시스템/서버
  CLIENT = 'CLIENT',            // 클라이언트
  EXTERNAL = 'EXTERNAL',        // 외부 서비스
  DATA = 'DATA'                 // 데이터 무결성
}

enum ErrorSeverity {
  CRITICAL = 1,   // 서비스 중단 수준
  HIGH = 2,       // 주요 기능 실패
  MEDIUM = 3,     // 일부 기능 제한
  LOW = 4,        // 사용자 경험 저하
  INFO = 5        // 정보성 메시지
}
```

### 1.2 에러 구조

```typescript
interface CupNoteError {
  // 식별 정보
  id: string;
  code: string;                    // 에러 코드 (예: "NETWORK_TIMEOUT")
  category: ErrorCategory;
  severity: ErrorSeverity;
  
  // 에러 내용
  message: string;                 // 사용자 메시지
  technicalMessage?: string;       // 기술적 상세 (개발자용)
  
  // 컨텍스트
  context: {
    userId?: string;
    action: string;               // 발생 액션
    component: string;            // 발생 컴포넌트
    timestamp: Date;
    stackTrace?: string;
    metadata?: Record<string, any>;
  };
  
  // 복구 정보
  recovery: {
    retryable: boolean;
    retryCount?: number;
    maxRetries?: number;
    fallbackAction?: string;
    userActions?: UserAction[];
  };
}
```

---

## 2. 네트워크 에러 처리

### 2.1 네트워크 에러 매트릭스

| 에러 타입 | 코드 | 사용자 메시지 | 복구 전략 |
|----------|------|--------------|-----------|
| **타임아웃** | NETWORK_TIMEOUT | "연결 시간이 초과되었습니다" | 자동 재시도 (3회) |
| **연결 실패** | NETWORK_UNAVAILABLE | "네트워크에 연결할 수 없습니다" | 오프라인 모드 전환 |
| **서버 오류** | SERVER_ERROR | "서버에 일시적인 문제가 있습니다" | 지수 백오프 재시도 |
| **요청 취소** | REQUEST_CANCELLED | "요청이 취소되었습니다" | 사용자 재시도 옵션 |
| **느린 연결** | SLOW_CONNECTION | "연결 속도가 느립니다" | 경량 모드 제안 |

### 2.2 네트워크 에러 핸들러

```typescript
class NetworkErrorHandler {
  async handle(error: NetworkError): Promise<ErrorResolution> {
    switch (error.code) {
      case 'NETWORK_TIMEOUT':
        return await this.handleTimeout(error);
        
      case 'NETWORK_UNAVAILABLE':
        return this.switchToOfflineMode();
        
      case 'SERVER_ERROR':
        return await this.retryWithBackoff(error);
        
      case 'SLOW_CONNECTION':
        return this.suggestLightMode();
        
      default:
        return this.defaultNetworkError(error);
    }
  }
  
  private async handleTimeout(error: NetworkError) {
    const { retryCount = 0, maxRetries = 3 } = error.recovery;
    
    if (retryCount < maxRetries) {
      // 재시도
      showToast('연결 재시도 중...', 'info');
      
      await delay(1000 * Math.pow(2, retryCount)); // 지수 백오프
      
      return {
        action: 'RETRY',
        newRetryCount: retryCount + 1
      };
    }
    
    // 최대 재시도 초과
    return {
      action: 'FALLBACK',
      message: '연결할 수 없습니다. 나중에 다시 시도해주세요.',
      fallback: () => this.switchToOfflineMode()
    };
  }
  
  private switchToOfflineMode() {
    store.dispatch({ type: 'SET_OFFLINE_MODE', payload: true });
    
    showNotification({
      title: '오프라인 모드',
      message: '인터넷 연결이 복구되면 자동으로 동기화됩니다.',
      type: 'info',
      duration: 5000
    });
    
    return { action: 'OFFLINE_MODE' };
  }
}
```

---

## 3. 검증 에러 처리

### 3.1 검증 에러 매트릭스

| 필드 | 에러 타입 | 메시지 | UI 처리 |
|------|----------|--------|---------|
| **커피명** | REQUIRED | "커피 이름을 입력해주세요" | 빨간 테두리 + 에러 메시지 |
| **커피명** | TOO_LONG | "50자 이내로 입력해주세요" | 글자수 표시 + 초과분 강조 |
| **로스터리** | NOT_FOUND | "등록되지 않은 로스터리입니다" | 새로 추가 옵션 제공 |
| **온도** | INVALID_RANGE | "80-100°C 사이로 입력해주세요" | 유효 범위 힌트 |
| **향미** | TOO_MANY | "최대 10개까지 선택 가능합니다" | 선택 비활성화 |

### 3.2 검증 에러 핸들러

```typescript
class ValidationErrorHandler {
  private errorMessages = {
    required: (field: string) => `${field}을(를) 입력해주세요`,
    minLength: (field: string, min: number) => `${field}은(는) 최소 ${min}자 이상이어야 합니다`,
    maxLength: (field: string, max: number) => `${field}은(는) ${max}자를 초과할 수 없습니다`,
    pattern: (field: string) => `올바른 ${field} 형식이 아닙니다`,
    range: (field: string, min: number, max: number) => `${field}은(는) ${min}에서 ${max} 사이여야 합니다`
  };
  
  handle(errors: ValidationError[]): ValidationResult {
    const fieldErrors: Record<string, FieldError> = {};
    
    errors.forEach(error => {
      const { field, rule, params } = error;
      
      fieldErrors[field] = {
        message: this.getErrorMessage(field, rule, params),
        type: rule,
        showError: true,
        shake: true, // 흔들림 애니메이션
        focus: errors[0].field === field // 첫 에러 필드에 포커스
      };
    });
    
    // UI 업데이트
    this.updateUI(fieldErrors);
    
    // 접근성 알림
    this.announceErrors(fieldErrors);
    
    return {
      valid: false,
      errors: fieldErrors,
      focusField: errors[0].field
    };
  }
  
  private updateUI(fieldErrors: Record<string, FieldError>) {
    Object.entries(fieldErrors).forEach(([field, error]) => {
      const element = document.querySelector(`[name="${field}"]`);
      if (element) {
        // 에러 스타일 적용
        element.classList.add('error');
        
        // 에러 메시지 표시
        const errorElement = document.querySelector(`#${field}-error`);
        if (errorElement) {
          errorElement.textContent = error.message;
          errorElement.classList.add('visible');
        }
        
        // 흔들림 애니메이션
        if (error.shake) {
          element.classList.add('shake');
          setTimeout(() => element.classList.remove('shake'), 500);
        }
      }
    });
  }
}
```

---

## 4. 인증/인가 에러

### 4.1 인증 에러 매트릭스

| 에러 | 코드 | 메시지 | 액션 |
|------|------|--------|------|
| **미인증** | AUTH_REQUIRED | "로그인이 필요합니다" | 로그인 화면 이동 |
| **토큰 만료** | TOKEN_EXPIRED | "세션이 만료되었습니다" | 자동 토큰 갱신 |
| **권한 없음** | FORBIDDEN | "접근 권한이 없습니다" | 이전 페이지로 |
| **계정 잠김** | ACCOUNT_LOCKED | "계정이 일시적으로 잠겼습니다" | 잠금 해제 안내 |
| **잘못된 인증** | INVALID_CREDENTIALS | "아이디 또는 비밀번호가 올바르지 않습니다" | 재입력 요청 |

### 4.2 인증 에러 핸들러

```typescript
class AuthErrorHandler {
  async handle(error: AuthError): Promise<void> {
    switch (error.code) {
      case 'TOKEN_EXPIRED':
        await this.refreshToken();
        break;
        
      case 'AUTH_REQUIRED':
        this.redirectToLogin();
        break;
        
      case 'FORBIDDEN':
        this.showForbiddenMessage();
        break;
        
      case 'ACCOUNT_LOCKED':
        this.showAccountLockedDialog();
        break;
        
      default:
        this.handleGenericAuthError(error);
    }
  }
  
  private async refreshToken() {
    try {
      const newToken = await authService.refreshToken();
      
      if (newToken) {
        // 토큰 갱신 성공 - 원래 요청 재시도
        return { action: 'RETRY_REQUEST' };
      }
    } catch (error) {
      // 갱신 실패 - 재로그인 필요
      this.redirectToLogin();
    }
  }
  
  private redirectToLogin() {
    // 현재 경로 저장
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    showToast('로그인이 필요합니다', 'info');
    router.push('/login');
  }
  
  private showAccountLockedDialog() {
    showModal({
      title: '계정 잠김',
      message: '비정상적인 활동이 감지되어 계정이 일시적으로 잠겼습니다.',
      actions: [
        {
          label: '비밀번호 재설정',
          action: () => router.push('/reset-password')
        },
        {
          label: '고객센터 문의',
          action: () => router.push('/support')
        }
      ]
    });
  }
}
```

---

## 5. 비즈니스 로직 에러

### 5.1 비즈니스 에러 매트릭스

| 시나리오 | 코드 | 메시지 | 해결 방법 |
|---------|------|--------|-----------|
| **중복 기록** | DUPLICATE_RECORD | "이미 기록한 커피입니다" | 수정 또는 새 기록 선택 |
| **일일 한도** | DAILY_LIMIT | "오늘의 기록 한도에 도달했습니다" | 프리미엄 안내 |
| **데이터 불일치** | DATA_MISMATCH | "데이터가 일치하지 않습니다" | 새로고침 제안 |
| **만료된 쿠폰** | EXPIRED_COUPON | "만료된 쿠폰입니다" | 다른 쿠폰 선택 |
| **재고 없음** | OUT_OF_STOCK | "재고가 없습니다" | 알림 신청 제안 |

### 5.2 비즈니스 에러 핸들러

```typescript
class BusinessErrorHandler {
  handle(error: BusinessError): BusinessErrorResolution {
    const handlers: Record<string, () => BusinessErrorResolution> = {
      DUPLICATE_RECORD: () => this.handleDuplicate(error),
      DAILY_LIMIT: () => this.handleDailyLimit(error),
      DATA_MISMATCH: () => this.handleDataMismatch(error),
      EXPIRED_COUPON: () => this.handleExpiredCoupon(error),
      OUT_OF_STOCK: () => this.handleOutOfStock(error)
    };
    
    const handler = handlers[error.code];
    return handler ? handler() : this.defaultBusinessError(error);
  }
  
  private handleDuplicate(error: BusinessError) {
    const { existingRecordId } = error.metadata;
    
    return showActionDialog({
      title: '중복 기록 발견',
      message: '이미 이 커피를 기록하셨습니다.',
      actions: [
        {
          label: '기존 기록 수정',
          action: () => router.push(`/tasting/${existingRecordId}/edit`),
          primary: true
        },
        {
          label: '새로 기록하기',
          action: () => continueWithNewRecord(),
          secondary: true
        },
        {
          label: '취소',
          action: () => router.back()
        }
      ]
    });
  }
  
  private handleDailyLimit(error: BusinessError) {
    const { currentLimit, premiumLimit } = error.metadata;
    
    return showUpgradeDialog({
      title: '일일 기록 한도 도달',
      message: `무료 플랜은 하루 ${currentLimit}개까지 기록 가능합니다.`,
      features: [
        `프리미엄: 하루 ${premiumLimit}개 기록`,
        '광고 제거',
        '고급 통계'
      ],
      actions: [
        {
          label: '프리미엄 업그레이드',
          action: () => router.push('/premium'),
          highlight: true
        },
        {
          label: '내일 다시 하기',
          action: () => router.push('/home')
        }
      ]
    });
  }
}
```

---

## 6. 시스템 에러

### 6.1 시스템 에러 매트릭스

| 에러 | 심각도 | 메시지 | 대응 |
|------|--------|--------|------|
| **메모리 부족** | HIGH | "메모리가 부족합니다" | 캐시 정리 + 앱 재시작 제안 |
| **저장공간 부족** | HIGH | "저장 공간이 부족합니다" | 오래된 데이터 정리 제안 |
| **앱 충돌** | CRITICAL | "예기치 않은 오류가 발생했습니다" | 자동 복구 + 오류 보고 |
| **DB 에러** | HIGH | "데이터 접근 오류" | 재시도 + 백업 복원 |
| **권한 없음** | MEDIUM | "필요한 권한이 없습니다" | 권한 요청 다이얼로그 |

### 6.2 시스템 에러 핸들러

```typescript
class SystemErrorHandler {
  async handle(error: SystemError): Promise<void> {
    // 에러 로깅
    await this.logError(error);
    
    // 심각도별 처리
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        await this.handleCriticalError(error);
        break;
        
      case ErrorSeverity.HIGH:
        await this.handleHighSeverityError(error);
        break;
        
      default:
        await this.handleNormalError(error);
    }
  }
  
  private async handleCriticalError(error: SystemError) {
    // 1. 현재 상태 저장
    await this.saveCurrentState();
    
    // 2. 오류 보고
    await this.reportToCrashlytics(error);
    
    // 3. 복구 시도
    const recovered = await this.attemptRecovery();
    
    if (recovered) {
      showToast('문제가 해결되었습니다', 'success');
    } else {
      // 4. 앱 재시작 필요
      showModal({
        title: '앱 재시작 필요',
        message: '문제를 해결하기 위해 앱을 재시작해주세요.',
        actions: [
          {
            label: '재시작',
            action: () => window.location.reload()
          }
        ],
        dismissible: false
      });
    }
  }
  
  private async saveCurrentState() {
    try {
      const state = store.getState();
      await localforage.setItem('crash_recovery_state', {
        state,
        timestamp: new Date(),
        version: APP_VERSION
      });
    } catch (error) {
      console.error('Failed to save crash state:', error);
    }
  }
}
```

---

## 7. 외부 서비스 에러

### 7.1 외부 서비스 에러 매트릭스

| 서비스 | 에러 | 메시지 | 폴백 |
|--------|------|--------|-------|
| **GPS** | LOCATION_DENIED | "위치 권한이 필요합니다" | 수동 카페 검색 |
| **카메라** | CAMERA_UNAVAILABLE | "카메라를 사용할 수 없습니다" | 갤러리 선택 |
| **OCR** | OCR_FAILED | "텍스트 인식 실패" | 수동 입력 |
| **지도 API** | MAP_LOAD_ERROR | "지도를 불러올 수 없습니다" | 리스트 뷰 제공 |
| **결제** | PAYMENT_FAILED | "결제 처리 실패" | 다른 결제 수단 제안 |

### 7.2 외부 서비스 에러 핸들러

```typescript
class ExternalServiceErrorHandler {
  async handle(error: ExternalServiceError): Promise<void> {
    const service = error.service;
    const fallbackStrategies = {
      GPS: () => this.handleGPSError(error),
      CAMERA: () => this.handleCameraError(error),
      OCR: () => this.handleOCRError(error),
      MAP: () => this.handleMapError(error),
      PAYMENT: () => this.handlePaymentError(error)
    };
    
    const strategy = fallbackStrategies[service];
    if (strategy) {
      await strategy();
    } else {
      await this.handleGenericExternalError(error);
    }
  }
  
  private async handleGPSError(error: ExternalServiceError) {
    if (error.code === 'PERMISSION_DENIED') {
      const granted = await this.requestLocationPermission();
      
      if (granted) {
        return { action: 'RETRY' };
      }
    }
    
    // 폴백: 수동 카페 검색
    showToast('위치를 사용할 수 없어 수동으로 검색합니다', 'info');
    
    return {
      action: 'FALLBACK',
      fallback: () => this.showManualCafeSearch()
    };
  }
  
  private async handleOCRError(error: ExternalServiceError) {
    // OCR 실패 시 재시도 옵션과 수동 입력 제공
    return showActionSheet({
      title: '메뉴 인식 실패',
      message: '메뉴를 인식할 수 없습니다.',
      actions: [
        {
          label: '다시 촬영',
          icon: 'camera',
          action: () => this.retryOCR()
        },
        {
          label: '갤러리에서 선택',
          icon: 'photo',
          action: () => this.selectFromGallery()
        },
        {
          label: '직접 입력',
          icon: 'edit',
          action: () => this.manualInput()
        }
      ]
    });
  }
}
```

---

## 8. 글로벌 에러 바운더리

### 8.1 React Error Boundary

```tsx
class GlobalErrorBoundary extends React.Component<Props, State> {
  state = {
    hasError: false,
    error: null,
    errorInfo: null
  };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    errorLogger.log({
      error: error.toString(),
      stack: errorInfo.componentStack,
      timestamp: new Date(),
      userAgent: navigator.userAgent
    });
    
    // Sentry로 전송
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
    
    this.setState({
      error,
      errorInfo
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}

// 에러 폴백 컴포넌트
const ErrorFallback: React.FC<{error: Error, resetError: () => void}> = ({
  error,
  resetError
}) => {
  return (
    <div className="error-fallback">
      <img src="/error-illustration.svg" alt="Error" />
      <h2>앗! 문제가 발생했습니다</h2>
      <p>일시적인 오류가 발생했습니다. 불편을 드려 죄송합니다.</p>
      
      <div className="error-actions">
        <button onClick={resetError} className="btn-primary">
          다시 시도
        </button>
        <button onClick={() => window.location.href = '/'} className="btn-secondary">
          홈으로
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="error-details">
          <summary>에러 상세 (개발 모드)</summary>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
};
```

### 8.2 비동기 에러 핸들링

```typescript
// 전역 비동기 에러 핸들러
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // 에러 분류 및 처리
  const error = classifyError(event.reason);
  const handler = getErrorHandler(error.category);
  
  handler.handle(error);
  
  // 기본 동작 방지
  event.preventDefault();
});

// Axios 인터셉터
axios.interceptors.response.use(
  response => response,
  error => {
    const handler = new NetworkErrorHandler();
    
    if (error.response) {
      // 서버 응답 있음
      switch (error.response.status) {
        case 401:
          return new AuthErrorHandler().handle(error);
        case 403:
          return new AuthErrorHandler().handle(error);
        case 404:
          showToast('요청한 정보를 찾을 수 없습니다', 'error');
          break;
        case 500:
          return handler.handle({
            code: 'SERVER_ERROR',
            message: '서버 오류가 발생했습니다'
          });
        default:
          return handler.handle(error);
      }
    } else if (error.request) {
      // 요청 전송했으나 응답 없음
      return handler.handle({
        code: 'NETWORK_UNAVAILABLE',
        message: '네트워크 연결을 확인해주세요'
      });
    }
    
    return Promise.reject(error);
  }
);
```

---

## 9. 에러 로깅 및 모니터링

### 9.1 에러 로거

```typescript
class ErrorLogger {
  private queue: ErrorLog[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5초
  
  log(error: CupNoteError) {
    const log: ErrorLog = {
      ...error,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      deviceInfo: this.getDeviceInfo(),
      appVersion: APP_VERSION
    };
    
    // 로컬 저장
    this.saveLocal(log);
    
    // 큐에 추가
    this.queue.push(log);
    
    // 배치 전송
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }
  
  private async flush() {
    if (this.queue.length === 0) return;
    
    const logs = [...this.queue];
    this.queue = [];
    
    try {
      await api.post('/logs/errors', { logs });
    } catch (error) {
      // 전송 실패 시 로컬에 보관
      this.saveFailedLogs(logs);
    }
  }
  
  private saveLocal(log: ErrorLog) {
    // IndexedDB에 저장
    const db = await openDB('ErrorLogs', 1);
    await db.add('logs', log);
    
    // 오래된 로그 정리 (7일 이상)
    this.cleanOldLogs();
  }
}
```

### 9.2 에러 분석 대시보드

```typescript
interface ErrorMetrics {
  // 에러 빈도
  frequency: {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    byTime: TimeSeriesData[];
  };
  
  // 영향 범위
  impact: {
    affectedUsers: number;
    affectedSessions: number;
    crashRate: number;
  };
  
  // 복구 성공률
  recovery: {
    autoRecovered: number;
    userRecovered: number;
    unrecovered: number;
    averageRecoveryTime: number;
  };
  
  // 상위 에러
  topErrors: Array<{
    code: string;
    count: number;
    lastOccurred: Date;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
}
```

---

## 10. 사용자 친화적 에러 메시지

### 10.1 메시지 톤 가이드

```typescript
const errorMessageGuidelines = {
  // 친근한 톤 사용
  tone: 'friendly',
  
  // 구조
  structure: {
    problem: '무엇이 잘못되었는지',
    impact: '사용자에게 미치는 영향',
    solution: '해결 방법 또는 대안',
    action: '사용자가 할 수 있는 행동'
  },
  
  // 피해야 할 표현
  avoid: [
    '오류', '에러', '실패',     // 기술적 용어
    '잘못된', '불가능',          // 부정적 표현
    '죄송합니다'                 // 과도한 사과
  ],
  
  // 권장 표현
  prefer: [
    '문제가 발생했어요',
    '잠시 후 다시 시도해주세요',
    '다른 방법을 사용해보세요'
  ]
};

// 예시
const userFriendlyMessages = {
  NETWORK_ERROR: {
    title: '연결이 불안정해요',
    message: '네트워크 상태를 확인하고 다시 시도해주세요',
    icon: '📡',
    action: '다시 시도'
  },
  
  VALIDATION_ERROR: {
    title: '입력 내용을 확인해주세요',
    message: '빨간색으로 표시된 부분을 수정해주세요',
    icon: '✏️',
    action: '수정하기'
  }
};
```

---

## 11. 테스트 시나리오

### 11.1 에러 처리 테스트

```typescript
describe('Error Handling', () => {
  test('네트워크 타임아웃 처리', async () => {
    // 타임아웃 시뮬레이션
    mockAPI.onGet('/api/coffees').timeout();
    
    const result = await fetchCoffees();
    
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe('NETWORK_TIMEOUT');
    expect(mockRetry).toHaveBeenCalledTimes(3);
  });
  
  test('검증 에러 UI 표시', () => {
    const { getByLabelText, getByText } = render(<CoffeeForm />);
    
    const input = getByLabelText('커피 이름');
    fireEvent.blur(input); // 빈 값으로 포커스 아웃
    
    expect(getByText('커피 이름을 입력해주세요')).toBeInTheDocument();
    expect(input).toHaveClass('error');
  });
  
  test('에러 복구 시나리오', async () => {
    const errorBoundary = render(
      <GlobalErrorBoundary>
        <BrokenComponent />
      </GlobalErrorBoundary>
    );
    
    expect(errorBoundary.getByText('문제가 발생했습니다')).toBeInTheDocument();
    
    const retryButton = errorBoundary.getByText('다시 시도');
    fireEvent.click(retryButton);
    
    expect(errorBoundary.queryByText('문제가 발생했습니다')).not.toBeInTheDocument();
  });
});
```

---

## 12. 구현 우선순위

### Phase 1: Core (2일)
1. 에러 분류 체계
2. 글로벌 에러 바운더리
3. 네트워크 에러 핸들러

### Phase 2: Enhanced (3일)
4. 검증 에러 처리
5. 비즈니스 로직 에러
6. 에러 로깅 시스템

### Phase 3: Advanced (3일)
7. 에러 복구 메커니즘
8. 사용자 친화적 메시지
9. 모니터링 대시보드

---

*작성일: 2025-08-08*