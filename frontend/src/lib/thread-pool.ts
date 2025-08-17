/**
 * Thread Pool for Concurrent API Operations
 * 
 * This utility provides a thread pool implementation for running concurrent
 * async operations with configurable concurrency limits.
 */

export interface ThreadPoolTask<T = unknown> {
  id: string;
  name: string;
  execute: () => Promise<T>;
  onComplete?: (result: T) => void;
  onError?: (error: Error) => void;
  priority?: number;
}

export interface ThreadPoolOptions {
  maxThreads?: number;
  retryCount?: number;
  retryDelay?: number;
  onProgress?: (completed: number, total: number) => void;
}

export interface ThreadPoolResult<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
}

export class ThreadPool {
  private maxThreads: number;
  private retryCount: number;
  private retryDelay: number;
  private onProgress?: (completed: number, total: number) => void;
  
  private activeThreads = 0;
  private queue: ThreadPoolTask<unknown>[] = [];
  private results: Map<string, ThreadPoolResult<unknown>> = new Map();
  private isRunning = false;

  constructor(options: ThreadPoolOptions = {}) {
    this.maxThreads = Math.max(1, options.maxThreads || 5);
    this.retryCount = Math.max(0, options.retryCount || 2);
    this.retryDelay = Math.max(100, options.retryDelay || 1000);
    this.onProgress = options.onProgress;
  }

  /**
   * Add a task to the thread pool
   */
  addTask<T>(task: ThreadPoolTask<T>): void {
    this.queue.push(task as ThreadPoolTask<unknown>);
  }

  /**
   * Add multiple tasks to the thread pool
   */
  addTasks<T>(tasks: ThreadPoolTask<T>[]): void {
    this.queue.push(...(tasks as ThreadPoolTask<unknown>[]));
  }

  /**
   * Start executing all tasks in the queue
   */
  async executeAll<T = unknown>(): Promise<ThreadPoolResult<T>[]> {
    if (this.isRunning) {
      throw new Error('Thread pool is already running');
    }

    this.isRunning = true;
    this.activeThreads = 0;
    this.results.clear();

    const totalTasks = this.queue.length;
    if (totalTasks === 0) {
      this.isRunning = false;
      return [];
    }

    // Sort tasks by priority (higher priority first)
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Create worker promises
    const workers = Array.from({ length: Math.min(this.maxThreads, this.queue.length) }, () => 
      this.worker()
    );

    try {
      await Promise.all(workers);
    } finally {
      this.isRunning = false;
      this.queue = []; // Clear the queue
    }

    return Array.from(this.results.values()) as ThreadPoolResult<T>[];
  }

  /**
   * Get current progress
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.queue.length + this.activeThreads + this.results.size;
    const completed = this.results.size;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * Worker function that processes tasks from the queue
   */
  private async worker(): Promise<void> {
    while (this.queue.length > 0 && this.isRunning) {
      const task = this.queue.shift();
      if (!task) continue;

      this.activeThreads++;
      const startTime = Date.now();

      try {
        const result = await this.executeWithRetry(task as ThreadPoolTask);
        const duration = Date.now() - startTime;
        
        this.results.set(task.id, {
          id: task.id,
          success: true,
          data: result,
          duration
        });

        if (task.onComplete) {
          try {
            task.onComplete(result);
          } catch (callbackError) {
            console.warn('Task onComplete callback error:', callbackError);
          }
        }

      } catch (error) {
        const duration = Date.now() - startTime;
        const taskError = error instanceof Error ? error : new Error(String(error));
        
        this.results.set(task.id, {
          id: task.id,
          success: false,
          error: taskError,
          duration
        });

        if (task.onError) {
          try {
            task.onError(taskError);
          } catch (callbackError) {
            console.warn('Task onError callback error:', callbackError);
          }
        }
      }

      this.activeThreads--;
      
      // Update progress
      if (this.onProgress) {
        const total = this.queue.length + this.activeThreads + this.results.size;
        const completed = this.results.size;
        this.onProgress(completed, total);
      }
    }
  }

  /**
   * Execute a task with retry logic
   */
  private async executeWithRetry(task: ThreadPoolTask): Promise<unknown> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        return await task.execute();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.retryCount) {
          // Wait before retry
          await this.delay(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get results for a specific task
   */
  getResult<T>(taskId: string): ThreadPoolResult<T> | undefined {
    return this.results.get(taskId) as ThreadPoolResult<T> | undefined;
  }

  /**
   * Get all results
   */
  getAllResults<T>(): ThreadPoolResult<T>[] {
    return Array.from(this.results.values()) as ThreadPoolResult<T>[];
  }

  /**
   * Check if thread pool is running
   */
  isActive(): boolean {
    return this.isRunning || this.activeThreads > 0;
  }

  /**
   * Stop all operations
   */
  stop(): void {
    this.isRunning = false;
    this.queue = [];
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get active thread count
   */
  getActiveThreadCount(): number {
    return this.activeThreads;
  }

  /**
   * Update max threads (can be changed during execution)
   */
  setMaxThreads(maxThreads: number): void {
    this.maxThreads = Math.max(1, maxThreads);
  }
}

/**
 * Create a simple thread pool for one-time use
 */
export async function runConcurrent<T>(
  tasks: ThreadPoolTask<T>[],
  maxThreads: number = 5,
  onProgress?: (completed: number, total: number) => void
): Promise<ThreadPoolResult<T>[]> {
  const pool = new ThreadPool({ maxThreads, onProgress });
  pool.addTasks(tasks);
  return await pool.executeAll<T>();
}

/**
 * Batch processor for API requests with rate limiting
 */
export class BatchProcessor {
  private threadPool: ThreadPool;
  private rateLimitDelay: number;

  constructor(maxThreads: number = 3, rateLimitDelay: number = 300) {
    this.threadPool = new ThreadPool({ maxThreads });
    this.rateLimitDelay = rateLimitDelay;
  }

  /**
   * Process a batch of API requests with rate limiting
   */
  async processBatch<T>(
    requests: Array<() => Promise<T>>  ): Promise<ThreadPoolResult<T>[]> {
    const tasks = requests.map((request, index) => ({
      id: `batch-${index}`,
      name: `Request ${index}`,
      execute: async () => {
        // Add rate limiting delay
        if (this.rateLimitDelay > 0 && index > 0) {
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }
        return await request();
      }
    }));

    this.threadPool.addTasks(tasks);
    return await this.threadPool.executeAll<T>();
  }

  /**
   * Set rate limit delay
   */
  setRateLimitDelay(delay: number): void {
    this.rateLimitDelay = Math.max(0, delay);
  }

  /**
   * Set max threads
   */
  setMaxThreads(maxThreads: number): void {
    this.threadPool.setMaxThreads(maxThreads);
  }
}