
/**
 * @file src/systems/ai/error-handler.ts
 * @description Handles API errors and provides error tracking functionality
 */

import { Logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

export class AIErrorHandler {
  private apiErrorCount: number = 0;
  private lastApiErrorTime: number = 0;
  private readonly API_ERROR_THRESHOLD = 3;
  private readonly ERROR_RESET_TIME = 300000; // 5 minutes
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Track API errors for rate limiting
   */
  trackApiError(error: Error): void {
    this.apiErrorCount++;
    this.lastApiErrorTime = Date.now();
    
    // Log detailed error info
    this.logger.error(`API Error #${this.apiErrorCount}: ${error.message}`, { 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Check if error threshold is exceeded
   */
  isErrorThresholdExceeded(): boolean {
    const now = Date.now();
    // Check if we've had too many errors in the recent time window
    return this.apiErrorCount >= this.API_ERROR_THRESHOLD && 
      now - this.lastApiErrorTime < this.ERROR_RESET_TIME;
  }
  
  /**
   * Reset error count if enough time has passed
   */
  checkAndResetErrorCount(): void {
    const now = Date.now();
    if (now - this.lastApiErrorTime > this.ERROR_RESET_TIME) {
      this.apiErrorCount = 0;
    }
  }
  
  /**
   * Display a user-facing error notification
   */
  showErrorNotification(firstOccurrence: boolean = false): void {
    // Only show user-facing error on first occurrence
    if (firstOccurrence) {
      toast({
        title: "AI System Notice",
        description: "AI service temporarily unavailable. Using fallback logic for decisions.",
        variant: "default"
      });
    }
  }
  
  /**
   * Reset error tracking on success
   */
  resetErrorCount(): void {
    this.apiErrorCount = 0;
  }
  
  /**
   * Get the current error count
   */
  getErrorCount(): number {
    return this.apiErrorCount;
  }
}
