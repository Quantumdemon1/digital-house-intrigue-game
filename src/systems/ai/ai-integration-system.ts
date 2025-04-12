
/**
 * @file src/systems/ai/ai-integration-system.ts
 * @description Core AI integration system with enhanced error handling and fallbacks
 */

import { BigBrotherGame } from '@/models/game/BigBrotherGame';
import { Houseguest } from '@/models/houseguest';
import { Logger } from '@/utils/logger';
import { AIDecisionMaker } from './decision-maker';
import { AIResponseParser, AIDecisionResponse } from './response-parser';
import { AIFallbackGenerator } from './fallback-generator';
import { EnhancedGameLogger } from '@/utils/game-log';
import { toast } from '@/hooks/use-toast';

export class AIIntegrationSystem {
  private logger: Logger;
  private decisionMaker: AIDecisionMaker;
  private responseParser: AIResponseParser;
  private fallbackGenerator: AIFallbackGenerator;
  private apiKey: string;
  private apiErrorCount: number = 0;
  private readonly API_ERROR_THRESHOLD = 3;
  private lastApiErrorTime: number = 0;
  private readonly ERROR_RESET_TIME = 300000; // 5 minutes
  private enhancedLogger: EnhancedGameLogger | null = null;

  constructor(logger: Logger, apiKey: string) {
    this.logger = logger;
    this.apiKey = apiKey;
    this.decisionMaker = new AIDecisionMaker(logger, apiKey);
    this.responseParser = new AIResponseParser(logger);
    this.fallbackGenerator = new AIFallbackGenerator(logger);
  }

  /**
   * Setup enhanced logger if available
   */
  setupEnhancedLogger(game: BigBrotherGame): void {
    if (!this.enhancedLogger && game) {
      this.enhancedLogger = new EnhancedGameLogger(game, this.logger);
    }
  }

  /**
   * Make an AI decision with multiple fallback layers
   */
  async makeDecision(
    houseguestName: string,
    decisionType: string, 
    context: any,
    game: BigBrotherGame
  ): Promise<any> {
    try {
      this.setupEnhancedLogger(game);
      
      // Check for API error threshold - switch to fallback if too many recent errors
      const now = Date.now();
      if (this.apiErrorCount >= this.API_ERROR_THRESHOLD && 
          now - this.lastApiErrorTime < this.ERROR_RESET_TIME) {
        this.logger.warn("API error threshold reached, using fallback directly");
        return this.getFallbackDecision(houseguestName, decisionType, context, game);
      }

      // Reset error count if enough time has passed
      if (now - this.lastApiErrorTime > this.ERROR_RESET_TIME) {
        this.apiErrorCount = 0;
      }

      // Find the houseguest ID from name
      const houseguest = game.houseguests.find(h => h.name === houseguestName);
      if (!houseguest) {
        throw new Error(`Houseguest "${houseguestName}" not found`);
      }

      // Get memories for this houseguest
      const memories = game.memorySystem?.getRecentMemories(houseguest.id, 5) || [];
      const memoryTexts = memories.map(m => m.content);

      // Generate prompt for the decision
      const prompt = this.decisionMaker.generatePrompt(
        houseguest,
        decisionType,
        context,
        game,
        memoryTexts
      );

      // Set timeout for API call
      const timeoutMs = 10000; // 10 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Make the API call with timeout
      let apiResponse;
      try {
        apiResponse = await Promise.race([
          this.decisionMaker.callLLMAPI(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API request timed out')), timeoutMs)
          )
        ]) as string;
        
        clearTimeout(timeoutId);
      } catch (error: any) {
        // Handle API timeout or other fetch errors
        clearTimeout(timeoutId);
        this.trackApiError(error);
        
        // Log the error
        this.logger.error(`API call failed: ${error.message}`);
        if (this.enhancedLogger) {
          this.enhancedLogger.logEvent({
            type: 'AI_API_ERROR',
            description: `AI API error during ${decisionType} for ${houseguest.name}`,
            involvedHouseguests: [houseguest.id],
            error: error,
            significance: 'normal',
            data: {
              decisionType,
              errorType: error.name || 'FetchError'
            }
          });
        }
        
        // Show user-facing error only on first occurrence
        if (this.apiErrorCount === 1) {
          toast({
            title: "AI System Notice",
            description: "AI service temporarily unavailable. Using fallback logic for decisions.",
            variant: "default"
          });
        }
        
        // Use fallback
        return this.getFallbackDecision(houseguest.name, decisionType, context, game);
      }

      // Parse the response
      let parsedResponse: AIDecisionResponse;
      try {
        parsedResponse = this.responseParser.parseAndValidateResponse(apiResponse, decisionType);
      } catch (parseError: any) {
        this.logger.error(`Failed to parse API response: ${parseError.message}`);
        
        if (this.enhancedLogger) {
          this.enhancedLogger.logEvent({
            type: 'AI_PARSE_ERROR',
            description: `Failed to parse AI response for ${houseguest.name}'s ${decisionType}`,
            involvedHouseguests: [houseguest.id],
            error: parseError,
            significance: 'normal',
            data: {
              decisionType,
              responsePreview: apiResponse.substring(0, 100) + (apiResponse.length > 100 ? '...' : '')
            }
          });
        }
        
        return this.getFallbackDecision(houseguest.name, decisionType, context, game);
      }

      // Log AI decision with reasoning if available
      if (parsedResponse.reasoning && this.enhancedLogger) {
        this.enhancedLogger.logAIDecision(
          houseguest, 
          `make ${decisionType} decision`, 
          parsedResponse.reasoning,
          this.getAffectedHouseguests(parsedResponse.decision, decisionType)
        );
      }

      // Reset error tracking on success
      this.apiErrorCount = 0;
      
      return parsedResponse.decision;
    } catch (error: any) {
      // Catch any other errors in the process
      this.logger.error(`Error in AI decision process: ${error.message}`);
      
      // Use fallback as last resort
      return this.getFallbackDecision(houseguestName, decisionType, context, game);
    }
  }

  /**
   * Track API errors for rate limiting
   */
  private trackApiError(error: Error): void {
    this.apiErrorCount++;
    this.lastApiErrorTime = Date.now();
    
    // Log detailed error info
    this.logger.error(`API Error #${this.apiErrorCount}: ${error.message}`, { 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Extract affected houseguests from a decision
   */
  private getAffectedHouseguests(decision: any, decisionType: string): string[] {
    const affected: string[] = [];
    
    switch (decisionType) {
      case 'nomination':
        if (decision.nominee1) affected.push(decision.nominee1);
        if (decision.nominee2) affected.push(decision.nominee2);
        break;
      case 'veto':
        if (decision.saveNominee) affected.push(decision.saveNominee);
        break;
      case 'replacement':
        if (decision.replacementNominee) affected.push(decision.replacementNominee);
        break;
      case 'eviction_vote':
        if (decision.voteToEvict) affected.push(decision.voteToEvict);
        break;
    }
    
    return affected;
  }
  
  /**
   * Get fallback decisions when AI fails
   */
  getFallbackDecision(houseguestName: string, decisionType: string, context: any, game: BigBrotherGame): any {
    try {
      // Find houseguest by name
      const houseguest = game.houseguests.find(h => h.name === houseguestName);
      if (!houseguest) {
        this.logger.error(`Houseguest "${houseguestName}" not found for fallback decision`);
        // Return basic fallback if houseguest not found
        return this.fallbackGenerator.getFallbackDecision(decisionType, context);
      }
      
      // Get relationship-aware fallback if relationship system is available
      if (game.relationshipSystem) {
        return this.fallbackGenerator.getRelationshipAwareFallbackDecision(
          decisionType, 
          context, 
          houseguest.id,
          game.relationshipSystem
        );
      } else {
        // Use basic fallback
        return this.fallbackGenerator.getFallbackDecision(decisionType, context);
      }
    } catch (error: any) {
      // Last resort error handling - return something that won't break the game
      this.logger.error(`Critical error in fallback decision generator: ${error.message}`);
      
      // Return the most basic possible decision that won't crash the game
      switch (decisionType) {
        case 'nomination':
          const eligibleNames = (context.eligible || []).slice(0, 2);
          return { 
            nominee1: eligibleNames[0] || "Unknown", 
            nominee2: eligibleNames[1] || "Unknown" 
          };
        case 'veto':
          return { useVeto: false, saveNominee: null };
        case 'replacement':
          return { replacementNominee: (context.eligible || [])[0] || "Unknown" };
        case 'eviction_vote':
          return { voteToEvict: (context.nominees || [])[0] || "Unknown" };
        case 'jury_vote':
          return { voteForWinner: (context.finalists || [])[0] || "Unknown" };
        case 'dialogue':
          return { 
            response: "I need to think about the game situation.", 
            tone: "neutral",
            thoughts: "I should be careful with what I say."
          };
        default:
          return {};
      }
    }
  }
}

