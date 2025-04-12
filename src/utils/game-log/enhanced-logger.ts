
import { BigBrotherGame } from '@/models/game/BigBrotherGame';
import { GamePhase } from '@/models/game-state';
import { Houseguest } from '@/models/houseguest';
import { Logger } from '@/utils/logger';

export interface EnhancedLogOptions {
  type: string;
  description: string;
  involvedHouseguests: string[];
  data?: Record<string, any>;
  reasoning?: string;
  significance?: 'minor' | 'normal' | 'major';
  relationships?: Array<{from: string, to: string, change: number, newStatus?: string}>;
}

/**
 * Enhanced logging utilities for more detailed game events
 */
export class EnhancedGameLogger {
  private game: BigBrotherGame;
  private logger: Logger;

  constructor(game: BigBrotherGame, logger: Logger) {
    this.game = game;
    this.logger = logger;
  }

  /**
   * Log an event with enhanced details
   */
  logEvent(options: EnhancedLogOptions): void {
    const { type, description, involvedHouseguests, data = {}, reasoning, significance = 'normal', relationships } = options;

    // Build enhanced data object
    const enhancedData = {
      ...data,
      significance,
      ...(reasoning ? { reasoning } : {}),
      ...(relationships ? { relationships } : {})
    };

    // Log to game event log
    this.game.dispatch({
      type: 'LOG_EVENT',
      payload: {
        week: this.game.week,
        phase: this.game.phase as GamePhase,
        type,
        description,
        involvedHouseguests,
        data: enhancedData
      }
    });

    // Output to console log as well for debugging
    this.logger.info(`[${type}] ${description}`, enhancedData);

    // If there are relationship changes, log those separately
    if (relationships && relationships.length > 0) {
      this.logRelationshipChanges(relationships);
    }
  }

  /**
   * Log relationship threshold changes 
   */
  private logRelationshipChanges(relationships: Array<{from: string, to: string, change: number, newStatus?: string}>): void {
    relationships.forEach(rel => {
      if (rel.newStatus) {
        const fromGuest = this.game.getHouseguestById(rel.from);
        const toGuest = this.game.getHouseguestById(rel.to);
        
        if (fromGuest && toGuest) {
          const statusChangeMsg = `${fromGuest.name} and ${toGuest.name} are now ${rel.newStatus}`;
          
          this.game.dispatch({
            type: 'LOG_EVENT',
            payload: {
              week: this.game.week,
              phase: this.game.phase as GamePhase,
              type: 'RELATIONSHIP_THRESHOLD',
              description: statusChangeMsg,
              involvedHouseguests: [rel.from, rel.to],
              data: { 
                relationshipStatus: rel.newStatus,
                change: rel.change
              }
            }
          });
          
          this.logger.info(`[RELATIONSHIP] ${statusChangeMsg}`, { change: rel.change });
        }
      }
    });
  }
  
  /**
   * Log AI decisions with reasoning
   */
  logAIDecision(houseguest: Houseguest, decision: string, reasoning: string, affectedHouseguests: string[] = []): void {
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
  }
  
  /**
   * Log alliance formations and changes
   */
  logAllianceEvent(allianceId: string, eventType: 'formed' | 'broken' | 'betrayed' | 'exposed', 
                  description: string, involvedHouseguests: string[], instigator?: string): void {
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
  }
  
  /**
   * Log major game moments
   */
  logGameMoment(type: string, description: string, involvedHouseguests: string[], 
               significance: 'minor' | 'normal' | 'major' = 'major'): void {
    this.logEvent({
      type: `GAME_MOMENT_${type}`,
      description,
      involvedHouseguests,
      significance,
      data: {
        momentType: type
      }
    });
  }
}
