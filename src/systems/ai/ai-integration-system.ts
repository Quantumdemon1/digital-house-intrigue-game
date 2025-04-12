
/**
 * @file src/systems/ai/ai-integration-system.ts
 * @description Core AI integration system with enhanced error handling and fallbacks
 */

import { BigBrotherGame } from '@/models/game/BigBrotherGame';
import { Houseguest } from '@/models/houseguest';
import { Logger } from '@/utils/logger';
import { DecisionMaker } from './decision/decision-maker';
import { AIResponseParser, AIDecisionResponse } from './response-parser';
import { AIMemoryManager } from './memory-manager';
import { AIErrorHandler } from './error-handler';
import { AIDecisionHelper } from './decision-helper';
import { FallbackCoordinator } from './fallback-coordinator';

export class AIIntegrationSystem {
  private logger: Logger;
  private decisionMaker: DecisionMaker;
  private responseParser: AIResponseParser;
  private apiKey: string;
  private errorHandler: AIErrorHandler;
  private decisionHelper: AIDecisionHelper;
  private fallbackCoordinator: FallbackCoordinator;
  private memoryManager: AIMemoryManager;

  constructor(logger: Logger, apiKey: string) {
    this.logger = logger;
    this.apiKey = apiKey;
    this.decisionMaker = new DecisionMaker(logger, apiKey);
    this.responseParser = new AIResponseParser(logger);
    this.errorHandler = new AIErrorHandler(logger);
    this.decisionHelper = new AIDecisionHelper(logger);
    this.fallbackCoordinator = new FallbackCoordinator(logger);
    this.memoryManager = new AIMemoryManager(logger);
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
      this.decisionHelper.setupEnhancedLogger(game);
      
      // Check for API error threshold - switch to fallback if too many recent errors
      this.errorHandler.checkAndResetErrorCount();
      if (this.errorHandler.isErrorThresholdExceeded()) {
        this.logger.warn("API error threshold reached, using fallback directly");
        return this.getFallbackDecision(houseguestName, decisionType, context, game);
      }

      // Find the houseguest ID from name
      const houseguest = game.houseguests.find(h => h.name === houseguestName);
      if (!houseguest) {
        throw new Error(`Houseguest "${houseguestName}" not found`);
      }

      // Get memories for this houseguest
      let memoryTexts: string[] = [];
      // Initialize memories if needed
      if (game.houseguests.length > 0) {
        this.memoryManager.initializeMemories(game.houseguests);
      }
      memoryTexts = this.memoryManager.getMemoriesForHouseguest(houseguest.id) || [];

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
        this.errorHandler.trackApiError(error);
        
        // Log the error
        this.logger.error(`API call failed: ${error.message}`);
        
        // Show user-facing error only on first occurrence
        this.errorHandler.showErrorNotification(this.errorHandler.getErrorCount() === 1);
        
        // Use fallback
        return this.getFallbackDecision(houseguest.name, decisionType, context, game);
      }

      // Parse the response
      let parsedResponse: AIDecisionResponse;
      try {
        parsedResponse = this.responseParser.parseAndValidateResponse(apiResponse, decisionType);
      } catch (parseError: any) {
        this.logger.error(`Failed to parse API response: ${parseError.message}`);
        return this.getFallbackDecision(houseguest.name, decisionType, context, game);
      }

      // Log AI decision with reasoning
      this.decisionHelper.logAIDecision(houseguest, decisionType, parsedResponse, game);

      // Reset error tracking on success
      this.errorHandler.resetErrorCount();
      
      return parsedResponse.decision;
    } catch (error: any) {
      // Catch any other errors in the process
      this.logger.error(`Error in AI decision process: ${error.message}`);
      
      // Use fallback as last resort
      return this.getFallbackDecision(houseguestName, decisionType, context, game);
    }
  }

  /**
   * Get fallback decisions when AI fails - delegates to fallback coordinator
   */
  getFallbackDecision(houseguestName: string, decisionType: string, context: any, game: BigBrotherGame): any {
    return this.fallbackCoordinator.getFallbackDecision(houseguestName, decisionType, context, game);
  }
}
