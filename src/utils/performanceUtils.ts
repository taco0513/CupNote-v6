import { InteractionManager } from 'react-native';

// Performance monitoring and optimization utilities
export class PerformanceUtils {
  private static measurements = new Map<string, {
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, any>;
  }>();

  private static metrics = new Map<string, {
    count: number;
    totalDuration: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    lastMeasurement: Date;
  }>();

  // Start measuring performance
  static startMeasurement(name: string, metadata?: Record<string, any>): void {
    this.measurements.set(name, {
      startTime: performance.now(),
      metadata,
    });
  }

  // End measurement and calculate duration
  static endMeasurement(name: string): number {
    const measurement = this.measurements.get(name);
    if (!measurement) {
      console.warn(`[PerformanceUtils] No measurement found for: ${name}`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - measurement.startTime;

    // Update measurement
    measurement.endTime = endTime;
    measurement.duration = duration;

    // Update metrics
    this.updateMetrics(name, duration);

    console.log(`[PerformanceUtils] ${name}: ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  // Measure a function execution
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMeasurement(name, metadata);
    try {
      const result = await fn();
      this.endMeasurement(name);
      return result;
    } catch (error) {
      this.endMeasurement(name);
      throw error;
    }
  }

  // Measure synchronous function
  static measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startMeasurement(name, metadata);
    try {
      const result = fn();
      this.endMeasurement(name);
      return result;
    } catch (error) {
      this.endMeasurement(name);
      throw error;
    }
  }

  private static updateMetrics(name: string, duration: number): void {
    const existing = this.metrics.get(name);
    
    if (existing) {
      existing.count++;
      existing.totalDuration += duration;
      existing.avgDuration = existing.totalDuration / existing.count;
      existing.minDuration = Math.min(existing.minDuration, duration);
      existing.maxDuration = Math.max(existing.maxDuration, duration);
      existing.lastMeasurement = new Date();
    } else {
      this.metrics.set(name, {
        count: 1,
        totalDuration: duration,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        lastMeasurement: new Date(),
      });
    }
  }

  // Get performance metrics
  static getMetrics(name?: string) {
    if (name) {
      return this.metrics.get(name);
    }
    return Object.fromEntries(this.metrics.entries());
  }

  // Get top slowest operations
  static getSlowOperations(limit: number = 10) {
    return Array.from(this.metrics.entries())
      .map(([name, metrics]) => ({ name, ...metrics }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  // Clear all measurements and metrics
  static clear(): void {
    this.measurements.clear();
    this.metrics.clear();
  }

  // Memory usage monitoring
  static logMemoryUsage(context?: string): void {
    if (__DEV__ && global.performance) {
      // Type assertion for memory property which may not exist in all environments
      const memory = (global.performance as any).memory;
      if (memory) {
        console.log(`[Memory] ${context || 'Current'}: ${JSON.stringify({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        })} MB`);
      } else {
        console.log(`[Memory] ${context || 'Current'}: Memory info not available`);
      }
    }
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let lastCall = 0;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  }) as T;
}

// Batch operations to improve performance
export class BatchProcessor<T> {
  private queue: T[] = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private processor: (items: T[]) => Promise<void> | void,
    private batchSize: number = 10,
    private delay: number = 100
  ) {}

  add(item: T): void {
    this.queue.push(item);
    this.scheduleProcessing();
  }

  addMany(items: T[]): void {
    this.queue.push(...items);
    this.scheduleProcessing();
  }

  private scheduleProcessing(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.process();
    }, this.delay);
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        await this.processor(batch);
      }
    } catch (error) {
      console.error('[BatchProcessor] Error processing batch:', error);
    } finally {
      this.isProcessing = false;
      this.timeoutId = null;
    }
  }

  flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    return this.process();
  }

  clear(): void {
    this.queue = [];
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  get queueSize(): number {
    return this.queue.length;
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static getOptimizedDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number = 1080,
    maxHeight: number = 1080
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    // Scale down if too large
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  static getCompressedSize(originalSize: number, targetSizeKB: number = 500): number {
    const targetBytes = targetSizeKB * 1024;
    if (originalSize <= targetBytes) {
      return 1.0; // No compression needed
    }
    
    // Calculate compression ratio
    const ratio = targetBytes / originalSize;
    return Math.max(0.1, Math.min(0.9, ratio));
  }
}

// React Native specific performance optimizations
export class RNPerformanceUtils {
  // Run after interactions complete (smoother animations)
  static runAfterInteractions<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          const result = await callback();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Batch state updates using InteractionManager
  static scheduleUpdate(callback: () => void): void {
    InteractionManager.runAfterInteractions(callback);
  }

  // Optimize large list rendering
  static getOptimizedListConfig(itemCount: number) {
    const initialNumToRender = Math.min(10, itemCount);
    const maxToRenderPerBatch = Math.max(5, Math.min(10, Math.ceil(itemCount / 10)));
    const windowSize = Math.max(10, Math.min(21, Math.ceil(itemCount / 5)));

    return {
      initialNumToRender,
      maxToRenderPerBatch,
      windowSize,
      removeClippedSubviews: itemCount > 50,
      getItemLayout: itemCount > 100 ? (data: any, index: number) => ({
        length: 60, // Estimated item height
        offset: 60 * index,
        index,
      }) : undefined,
    };
  }

  // Optimize image loading for lists
  static getImageLoadingConfig() {
    return {
      progressiveRenderingEnabled: true,
      fadeDuration: 200,
      resizeMode: 'cover' as const,
      cache: 'default' as const,
    };
  }
}

// Memory management utilities
export class MemoryManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static maxCacheSize = 100;
  private static cleanupInterval: NodeJS.Timeout | null = null;

  // Initialize memory management
  static initialize(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  // Cache data with TTL
  static setCache(key: string, data: any, ttlMs: number = 10 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  // Get cached data
  static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  // Clear specific cache entry
  static clearCache(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache
  static clearAllCache(): void {
    this.cache.clear();
  }

  // Clean up expired cache entries
  static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (__DEV__ && keysToDelete.length > 0) {
      console.log(`[MemoryManager] Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  // Get cache statistics
  static getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const cached of this.cache.values()) {
      if (now - cached.timestamp > cached.ttl) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
      totalSize += JSON.stringify(cached.data).length;
    }

    return {
      total: this.cache.size,
      active: activeEntries,
      expired: expiredEntries,
      estimatedSizeBytes: totalSize,
      maxSize: this.maxCacheSize,
    };
  }

  // Cleanup on app close
  static dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clearAllCache();
  }
}

// Network optimization utilities
export class NetworkOptimizer {
  private static requestQueue: Array<{
    id: string;
    request: () => Promise<any>;
    priority: number;
    timestamp: number;
  }> = [];

  private static isProcessing = false;
  private static maxConcurrentRequests = 3;
  private static activeRequests = 0;

  // Add request to queue with priority
  static queueRequest<T>(
    id: string,
    request: () => Promise<T>,
    priority: number = 1
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        id,
        request: async () => {
          try {
            const result = await request();
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        },
        priority,
        timestamp: Date.now(),
      });

      // Sort by priority (higher priority first)
      this.requestQueue.sort((a, b) => b.priority - a.priority);
      
      this.processQueue();
    });
  }

  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.activeRequests >= this.maxConcurrentRequests) {
      return;
    }

    const nextRequest = this.requestQueue.shift();
    if (!nextRequest) {
      return;
    }

    this.activeRequests++;
    
    try {
      await nextRequest.request();
    } catch (error) {
      console.error(`[NetworkOptimizer] Request ${nextRequest.id} failed:`, error);
    } finally {
      this.activeRequests--;
      this.processQueue(); // Process next request
    }
  }

  // Get queue status
  static getQueueStatus() {
    return {
      pending: this.requestQueue.length,
      active: this.activeRequests,
      maxConcurrent: this.maxConcurrentRequests,
    };
  }

  // Clear queue
  static clearQueue(): void {
    this.requestQueue = [];
  }
}

// Initialize memory manager on import
MemoryManager.initialize();