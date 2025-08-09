import { Alert } from 'react-native';

// Enhanced error types for different scenarios
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION', 
  STORAGE = 'STORAGE',
  PERMISSION = 'PERMISSION',
  AUTH = 'AUTH',
  TIMEOUT = 'TIMEOUT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: string;
  recoverable: boolean;
  timestamp: Date;
  userId?: string;
  retryCount?: number;
  metadata?: Record<string, any>;
}

// Create typed errors
export class CupNoteError extends Error {
  type: ErrorType;
  recoverable: boolean;
  context?: string;
  metadata?: Record<string, any>;

  constructor(
    type: ErrorType, 
    message: string, 
    recoverable: boolean = true, 
    context?: string,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'CupNoteError';
    this.type = type;
    this.recoverable = recoverable;
    this.context = context;
    this.metadata = metadata;
  }
}

// Error messages for user-friendly display
export const errorMessages = {
  [ErrorType.NETWORK]: {
    title: '네트워크 오류',
    message: '인터넷 연결을 확인하고 다시 시도해주세요.',
    recovery: '재시도',
    icon: '📶',
  },
  [ErrorType.VALIDATION]: {
    title: '입력 오류',
    message: '필수 정보를 모두 입력해주세요.',
    recovery: '수정하기',
    icon: '⚠️',
  },
  [ErrorType.STORAGE]: {
    title: '저장 오류', 
    message: '데이터 저장에 실패했습니다.',
    recovery: '다시 시도',
    icon: '💾',
  },
  [ErrorType.PERMISSION]: {
    title: '권한 필요',
    message: '기능 사용을 위해 권한이 필요합니다.',
    recovery: '설정 열기',
    icon: '🔒',
  },
  [ErrorType.AUTH]: {
    title: '인증 오류',
    message: '로그인이 필요하거나 세션이 만료되었습니다.',
    recovery: '로그인',
    icon: '🔐',
  },
  [ErrorType.TIMEOUT]: {
    title: '시간 초과',
    message: '요청 시간이 초과되었습니다.',
    recovery: '재시도',
    icon: '⏰',
  },
  [ErrorType.QUOTA_EXCEEDED]: {
    title: '용량 초과',
    message: '저장 공간이 부족합니다.',
    recovery: '정리하기',
    icon: '📦',
  },
  [ErrorType.UNKNOWN]: {
    title: '알 수 없는 오류',
    message: '예상치 못한 오류가 발생했습니다.',
    recovery: '다시 시도',
    icon: '❓',
  },
};

// Enhanced error handler class with analytics and retry logic
export class ErrorHandler {
  private static errorQueue: AppError[] = [];
  private static maxQueueSize = 50;
  private static retryAttempts = new Map<string, number>();

  static handle(error: unknown, context?: string, userId?: string): AppError {
    const timestamp = new Date();
    const errorKey = `${context || 'unknown'}-${timestamp.getTime()}`;
    
    console.error(`[ErrorHandler] ${context || 'Unknown context'}:`, error);

    let appError: AppError;

    // Convert to AppError
    if (error instanceof CupNoteError) {
      appError = {
        type: error.type,
        message: error.message,
        originalError: error,
        context: error.context || context,
        recoverable: error.recoverable,
        timestamp,
        userId,
        metadata: error.metadata,
      };
    } else if (error instanceof Error) {
      // Try to categorize the error
      const type = this.categorizeError(error);
      appError = {
        type,
        message: error.message,
        originalError: error,
        context,
        recoverable: type !== ErrorType.UNKNOWN,
        timestamp,
        userId,
      };
    } else {
      // Unknown error type
      appError = {
        type: ErrorType.UNKNOWN,
        message: String(error),
        context,
        recoverable: false,
        timestamp,
        userId,
      };
    }

    // Add retry count if this error has been retried
    const retryCount = this.retryAttempts.get(errorKey) || 0;
    appError.retryCount = retryCount;

    // Add to error queue for analytics
    this.addToQueue(appError);

    return appError;
  }

  private static categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Network errors
    if (
      message.includes('network') || 
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('dns') ||
      message.includes('offline') ||
      stack.includes('network')
    ) {
      return message.includes('timeout') ? ErrorType.TIMEOUT : ErrorType.NETWORK;
    }

    // Auth errors
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('authentication') ||
      message.includes('session') ||
      message.includes('token') ||
      message.includes('login') ||
      stack.includes('auth')
    ) {
      return ErrorType.AUTH;
    }

    // Storage errors
    if (
      message.includes('storage') ||
      message.includes('database') ||
      message.includes('save') ||
      message.includes('persist') ||
      message.includes('quota') ||
      message.includes('space') ||
      stack.includes('storage')
    ) {
      return message.includes('quota') || message.includes('space') 
        ? ErrorType.QUOTA_EXCEEDED 
        : ErrorType.STORAGE;
    }

    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('denied') ||
      message.includes('access') ||
      message.includes('not allowed')
    ) {
      return ErrorType.PERMISSION;
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('required') ||
      message.includes('invalid') ||
      message.includes('missing') ||
      message.includes('format')
    ) {
      return ErrorType.VALIDATION;
    }

    return ErrorType.UNKNOWN;
  }

  private static addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  static showError(
    appError: AppError, 
    onRetry?: () => void,
    onCancel?: () => void
  ): void {
    const errorConfig = errorMessages[appError.type];
    const title = `${errorConfig.icon} ${errorConfig.title}`;
    const message = appError.message || errorConfig.message;

    const buttons = [];

    // Cancel button
    if (onCancel) {
      buttons.push({
        text: '취소',
        style: 'cancel' as const,
        onPress: onCancel,
      });
    } else {
      buttons.push({
        text: '확인',
        style: 'cancel' as const,
      });
    }

    // Retry button for recoverable errors
    if (appError.recoverable && onRetry) {
      const retryLabel = appError.retryCount && appError.retryCount > 0 
        ? `${errorConfig.recovery} (${appError.retryCount + 1}회)`
        : errorConfig.recovery;
        
      buttons.push({
        text: retryLabel,
        onPress: () => {
          const errorKey = `${appError.context}-${appError.timestamp.getTime()}`;
          const currentRetries = this.retryAttempts.get(errorKey) || 0;
          this.retryAttempts.set(errorKey, currentRetries + 1);
          onRetry();
        },
      });
    }

    Alert.alert(title, message, buttons);
  }

  static logError(error: AppError): void {
    // Enhanced logging with more metadata
    const logData = {
      timestamp: error.timestamp.toISOString(),
      type: error.type,
      message: error.message,
      context: error.context,
      recoverable: error.recoverable,
      userId: error.userId,
      retryCount: error.retryCount,
      stack: error.originalError?.stack,
      metadata: error.metadata,
      // Device/app info would be added here in production
      platform: 'mobile',
      version: '1.0.0', // App version
    };

    console.error('[ErrorHandler] Enhanced Log:', logData);
    
    // In production, send to analytics/logging service
    // LoggingService.logError(logData);
    // Analytics.trackEvent('error_occurred', logData);
  }

  // Get error statistics for debugging
  static getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byType: {} as Record<ErrorType, number>,
      byContext: {} as Record<string, number>,
      recent: this.errorQueue.slice(-10),
      topErrors: [] as { error: string; count: number }[],
    };

    // Calculate statistics
    const errorCounts = new Map<string, number>();
    
    this.errorQueue.forEach(error => {
      // By type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      
      // By context
      if (error.context) {
        stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1;
      }
      
      // Error message frequency
      const key = error.message.substring(0, 100);
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });

    // Top errors
    stats.topErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  // Clear error history
  static clearErrorHistory(): void {
    this.errorQueue = [];
    this.retryAttempts.clear();
  }
}

// Specific error creators for common scenarios
export const createNetworkError = (message: string = '네트워크 연결을 확인해주세요.'): CupNoteError => {
  return new CupNoteError(ErrorType.NETWORK, message, true, 'Network');
};

export const createValidationError = (message: string, field?: string): CupNoteError => {
  return new CupNoteError(
    ErrorType.VALIDATION, 
    message, 
    true, 
    'Validation',
    { field }
  );
};

export const createStorageError = (message: string = '데이터 저장에 실패했습니다.'): CupNoteError => {
  return new CupNoteError(ErrorType.STORAGE, message, true, 'Storage');
};

export const createPermissionError = (message: string, permission?: string): CupNoteError => {
  return new CupNoteError(
    ErrorType.PERMISSION, 
    message, 
    true, 
    'Permission',
    { permission }
  );
};

export const createAuthError = (message: string): CupNoteError => {
  return new CupNoteError(ErrorType.AUTH, message, true, 'Auth');
};

export const createTimeoutError = (message: string, timeout?: number): CupNoteError => {
  return new CupNoteError(
    ErrorType.TIMEOUT, 
    message, 
    true, 
    'Timeout',
    { timeout }
  );
};

// Enhanced retry mechanism with exponential backoff
export class RetryHandler {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelayMs?: number;
      maxDelayMs?: number;
      backoffMultiplier?: number;
      retryCondition?: (error: Error, attempt: number) => boolean;
      onRetry?: (attempt: number, error: Error) => void;
      context?: string;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelayMs = 1000,
      maxDelayMs = 30000,
      backoffMultiplier = 2,
      retryCondition = (error) => !(error instanceof CupNoteError && error.type === ErrorType.VALIDATION),
      onRetry,
      context = 'Unknown operation'
    } = options;

    let lastError: Error;
    let totalDelay = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Log successful retry
        if (attempt > 1) {
          console.log(`[RetryHandler] ${context} succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        console.warn(`[RetryHandler] ${context} failed on attempt ${attempt}:`, lastError.message);
        
        if (attempt === maxAttempts) {
          break;
        }

        // Check if we should retry this error
        if (!retryCondition(lastError, attempt)) {
          console.log(`[RetryHandler] ${context} not retrying due to retry condition`);
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelayMs * Math.pow(backoffMultiplier, attempt - 1),
          maxDelayMs
        );
        
        // Add jitter (±25%)
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        const finalDelay = Math.max(100, delay + jitter);
        
        totalDelay += finalDelay;

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        console.log(`[RetryHandler] ${context} retrying in ${Math.round(finalDelay)}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await this.delay(finalDelay);
      }
    }

    // Log final failure
    console.error(`[RetryHandler] ${context} failed after ${maxAttempts} attempts (total delay: ${Math.round(totalDelay)}ms)`);
    throw lastError!;
  }
}

// Error boundary helper for React components
export const handleAsyncError = (error: unknown, context?: string, userId?: string): AppError => {
  const appError = ErrorHandler.handle(error, context, userId);
  ErrorHandler.logError(appError);
  
  // For critical errors, show immediately
  if (!appError.recoverable) {
    ErrorHandler.showError(appError);
  }
  
  return appError;
};

// HOC for error handling with enhanced retry logic
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string,
  retryOptions?: Parameters<typeof RetryHandler.withRetry>[1]
): T => {
  return ((...args: Parameters<T>) => {
    const operation = () => Promise.resolve(fn(...args));
    
    if (retryOptions) {
      return RetryHandler.withRetry(operation, {
        ...retryOptions,
        context: retryOptions.context || context,
      });
    }
    
    return operation().catch(error => {
      handleAsyncError(error, context);
      throw error; // Re-throw so caller can handle
    });
  }) as T;
};

// Performance monitoring for error-prone operations
export class PerformanceMonitor {
  private static metrics = new Map<string, {
    totalCalls: number;
    successCount: number;
    errorCount: number;
    avgDuration: number;
    lastError?: AppError;
    lastSuccess?: Date;
  }>();

  static async monitor<T>(
    operation: () => Promise<T>,
    name: string
  ): Promise<T> {
    const startTime = Date.now();
    const metric = this.metrics.get(name) || {
      totalCalls: 0,
      successCount: 0,
      errorCount: 0,
      avgDuration: 0,
    };

    metric.totalCalls++;

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      metric.successCount++;
      metric.avgDuration = ((metric.avgDuration * (metric.totalCalls - 1)) + duration) / metric.totalCalls;
      metric.lastSuccess = new Date();
      
      this.metrics.set(name, metric);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      metric.errorCount++;
      metric.avgDuration = ((metric.avgDuration * (metric.totalCalls - 1)) + duration) / metric.totalCalls;
      metric.lastError = handleAsyncError(error, name);
      
      this.metrics.set(name, metric);
      throw error;
    }
  }

  static getMetrics(name?: string) {
    if (name) {
      return this.metrics.get(name);
    }
    return Object.fromEntries(this.metrics.entries());
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

export default ErrorHandler;