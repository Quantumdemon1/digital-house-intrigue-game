
import { BigBrotherGame } from '@/models/game/BigBrotherGame';
import { GamePhase } from '@/models/game-state';
import { Houseguest } from '@/models/houseguest';
import { Logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedLogOptions {
  type: string;
  description: string;
  involvedHouseguests: string[];
  data?: Record<string, any>;
  reasoning?: string;
  significance?: 'minor' | 'normal' | 'major';
  relationships?: Array<{from: string, to: string, change: number, newStatus?: string}>;
  error?: Error | string;
}

/**
 * Enhanced logging utilities for more detailed game events
 */
export class EnhancedGameLogger {
  private game: BigBrotherGame;
  private logger: Logger;
  private errorCount: number = 0;
  private readonly ERROR_THRESHOLD = 5;
  private lastErrorTime: number = 0;
  private readonly ERROR_COOLDOWN = 60000; // 1 minute cooldown for errors

  constructor(game: BigBrotherGame, logger: Logger) {
    this.game = game;
    this.logger = logger;
  }

  /**
   * Log an event with enhanced details
   */
  logEvent(options: EnhancedLogOptions): void {
    const { type, description, involvedHouseguests, data = {}, reasoning, significance = 'normal', relationships, error } = options;

    try {
      // Build enhanced data object
      const enhancedData = {
        ...data,
        significance,
        ...(reasoning ? { reasoning } : {}),
        ...(relationships ? { relationships } : {}),
        ...(error ? { error: error instanceof Error ? error.message : error } : {})
      };

      // Log to game event log
      this.game.logEvent(
        type,
        description,
        involvedHouseguests,
        enhancedData
      );

      // Output to console log as well for debugging
      this.logger.info(`[${type}] ${description}`, enhancedData);

      // If there are relationship changes, log those separately
      if (relationships && relationships.length > 0) {
        this.logRelationshipChanges(relationships);
      }
      
      // If there's an error, log it separately
      if (error) {
        this.logError(type, error, description);
      }
    } catch (err: any) {
      // Meta-error handling (errors in the logger itself)
      this.logger.error(`Error in enhanced logger: ${err.message}`, { originalEvent: type });
    }
  }

  /**
   * Log relationship threshold changes 
   */
  private logRelationshipChanges(relationships: Array<{from: string, to: string, change: number, newStatus?: string}>): void {
    try {
      relationships.forEach(rel => {
        if (rel.newStatus) {
          const fromGuest = this.game.getHouseguestById(rel.from);
          const toGuest = this.game.getHouseguestById(rel.to);
          
          if (fromGuest && toGuest) {
            const statusChangeMsg = `${fromGuest.name} and ${toGuest.name} are now ${rel.newStatus}`;
            
            this.game.logEvent(
              'RELATIONSHIP_THRESHOLD',
              statusChangeMsg,
              [rel.from, rel.to],
              { 
                relationshipStatus: rel.newStatus,
                change: rel.change
              }
            );
            
            this.logger.info(`[RELATIONSHIP] ${statusChangeMsg}`, { change: rel.change });
          }
        }
      });
    } catch (err: any) {
      this.logger.error(`Error in logRelationshipChanges: ${err.message}`);
    }
  }
  
  /**
   * Log AI decisions with reasoning
   */
  logAIDecision(houseguest: Houseguest, decision: string, reasoning: string, affectedHouseguests: string[] = []): void {
    try {
      const involvedIds = [houseguest.id, ...affectedHouseguests];
      
      this.logEvent({
        type: 'AI_DECISION',
        description: `${houseguest.name} decided to ${decision}`,
        involvedHouseguests: involvedIds,
        reasoning,
        data: {
          decisionMaker: houseguest.id,
          decisionType: decision.split(' ')[0], // Extract first word as decision type
        }
      });
    } catch (err: any) {
      this.logger.error(`Error in logAIDecision: ${err.message}`);
      // Continue game flow despite error in logging
    }
  }
  
  /**
   * Log alliance formations and changes
   */
  logAllianceEvent(allianceId: string, eventType: 'formed' | 'broken' | 'betrayed' | 'exposed', 
                  description: string, involvedHouseguests: string[], instigator?: string): void {
    try {
      this.logEvent({
        type: `ALLIANCE_${eventType.toUpperCase()}`,
        description,
        involvedHouseguests,
        significance: 'major',
        data: {
          allianceId,
          instigator
        }
      });
    } catch (err: any) {
      this.logger.error(`Error in logAllianceEvent: ${err.message}`);
    }
  }
  
  /**
   * Log major game moments
   */
  logGameMoment(type: string, description: string, involvedHouseguests: string[], 
               significance: 'minor' | 'normal' | 'major' = 'major'): void {
    try {
      this.logEvent({
        type: `GAME_MOMENT_${type}`,
        description,
        involvedHouseguests,
        significance,
        data: {
          momentType: type
        }
      });
    } catch (err: any) {
      this.logger.error(`Error in logGameMoment: ${err.message}`);
    }
  }

  /**
   * Log errors with rate limiting to prevent flooding
   */
  private logError(context: string, error: Error | string, description: string = ''): void {
    const now = Date.now();
    
    // Reset error count if cooldown has passed
    if (now - this.lastErrorTime > this.ERROR_COOLDOWN) {
      this.errorCount = 0;
    }
    
    this.lastErrorTime = now;
    this.errorCount++;
    
    const errorMsg = error instanceof Error ? error.message : error;
    
    // Log all errors to console but rate-limit game events
    this.logger.error(`[${context}] ${errorMsg}`, { description });
    
    // Only log to game events if under threshold to avoid filling the log with errors
    if (this.errorCount <= this.ERROR_THRESHOLD) {
      this.game.logEvent(
        'SYSTEM_ERROR',
        `Error in ${context}: ${description ? description + ' - ' : ''}${errorMsg.substring(0, 100)}`,
        [],
        { errorContext: context, errorMessage: errorMsg }
      );
    } else if (this.errorCount === this.ERROR_THRESHOLD + 1) {
      // Log that we're rate limiting
      this.game.logEvent(
        'SYSTEM_ERROR',
        'Multiple errors occurring, some will not be logged to prevent flooding',
        [],
        { rateLimit: true }
      );
    }
  }
}

