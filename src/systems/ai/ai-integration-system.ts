/**
 * @file src/systems/ai/ai-integration-system.ts
 * @description Main AI integration system that orchestrates all AI components
 */

import type { Houseguest } from '@/models/houseguest';
import type { Logger } from '@/utils/logger';
import type { BigBrotherGame } from '@/models/BigBrotherGame';
import { AIMemoryManager } from './memory-manager';
import { AIDecisionMaker } from './decision-maker';
import { AIResponseParser } from './response-parser';
import { AIFallbackGenerator } from './fallback-generator';
import { RelationshipSystem } from '../relationship-system';
import { config } from '@/config';

export class AIIntegrationSystem {
  private logger: Logger;
  private apiKey: string;
  private memoryManager: AIMemoryManager;
  private decisionMaker: AIDecisionMaker;
  private responseParser: AIResponseParser;
  private fallbackGenerator: AIFallbackGenerator;
  private relationshipSystem: RelationshipSystem | null = null;
  private lastApiCall: number = 0;
  private readonly minCallInterval: number = config.AI_REQUEST_INTERVAL || 1000;
  private fallbackCount: number = 0;
  private totalDecisions: number = 0;

  constructor(logger: Logger, apiKey: string = '') {
    if (!logger) throw new Error("AIIntegrationSystem requires a logger instance.");
    this.logger = logger;
    this.apiKey = apiKey;
    
    if (!apiKey) this.logger.warn("No API key provided for AIIntegrationSystem. AI features will use fallback logic.");
    else this.logger.info("AI system initialized with API key");
    
    this.memoryManager = new AIMemoryManager(logger);
    this.decisionMaker = new AIDecisionMaker(logger, this.apiKey);
    this.responseParser = new AIResponseParser(logger);
    this.fallbackGenerator = new AIFallbackGenerator(logger);
  }

  /**
   * Set the relationship system reference
   */
  setRelationshipSystem(relationshipSystem: RelationshipSystem): void {
    this.relationshipSystem = relationshipSystem;
    this.memoryManager.setRelationshipSystem(relationshipSystem);
    this.logger.info("Relationship system connected to AI integration");
  }

  /**
   * Initializes bot memories (persona information) for each AI houseguest
   * @param houseguests List of all houseguests in the game
   */
  initializeMemories(houseguests: Houseguest[]): void {
    this.memoryManager.initializeMemories(houseguests);
  }

  /**
   * Makes an AI decision for a houseguest
   * @param botName Name of the houseguest making the decision
   * @param decisionType Type of decision (nomination, veto, etc.)
   * @param context Contextual information for the decision
   * @param game Reference to the game state
   * @returns Promise resolving to a decision object
   */
  async makeDecision(
    botName: string,
    decisionType: string,
    context: any,
    game: BigBrotherGame
  ): Promise<any> {
    this.totalDecisions++;
    
    // Find the houseguest
    const houseguest = game.houseguests.find(h => h.name === botName);
    if (!houseguest) {
      this.logger.error(`Cannot make decision: No houseguest named ${botName} found.`);
      return this.useFallback(decisionType, context);
    }
    
    if (houseguest.isPlayer) {
      this.logger.error(`Cannot make AI decision for player character ${botName}.`);
      return this.useFallback(decisionType, context);
    }

    try {
      this.logger.info(`🤖 AI decision requested for ${botName} (${decisionType})`);
      
      // Enhance context with relationship data
      this.enhanceContextWithRelationships(houseguest, decisionType, context);
      
      // Rate limit API calls
      await this.respectRateLimit();
      
      // If we're in development or testing mode without an API key, use fallback
      if (!this.apiKey) {
        this.logger.warn(`No API key, using fallback for ${decisionType} decision by ${botName}`);
        return this.useFallback(decisionType, context, houseguest.id);
      }
      
      // Generate prompt based on decision type
      const memories = this.memoryManager.getMemoriesForHouseguest(houseguest.id);
      const prompt = this.decisionMaker.generatePrompt(houseguest, decisionType, context, game, memories);
      
      // Make the API call
      let response;
      try {
        response = await this.decisionMaker.callLLMAPI(prompt);
        this.logger.debug(`Raw API response received: ${response?.substring(0, 100)}...`);
      } catch (error: any) {
        this.logger.error(`❌ AI API call failed: ${error.message}`);
        return this.useFallback(decisionType, context, houseguest.id);
      }
      
      // Parse and validate the response
      let decision;
      try {
        decision = this.responseParser.parseAndValidateResponse(response, decisionType);
        this.logger.info(`✅ AI Decision SUCCESS for ${botName} (${decisionType})`);
      } catch (error: any) {
        this.logger.error(`❌ AI Response validation failed: ${error.message}`, { response });
        return this.useFallback(decisionType, context, houseguest.id);
      }
      
      // Log the decision
      this.logger.info(`✅ AI Decision (${decisionType}): ${botName} decided: ${JSON.stringify(decision.decision)}`);
      
      // Update memories with this decision
      this.memoryManager.addMemory(houseguest.id, `You made a ${decisionType} decision: ${JSON.stringify(decision.decision)}`);
      
      // Print fallback stats
      this.printFallbackStats();
      
      return decision.decision;
    } catch (error: any) {
      this.logger.error(`❌ AI decision overall processing FAILED (${decisionType}): ${error.message}`);
      return this.useFallback(decisionType, context, houseguest.id);
    }
  }

  /**
   * Enhance the context with relationship data
   */
  private enhanceContextWithRelationships(
    houseguest: Houseguest,
    decisionType: string,
    context: any
  ): void {
    if (!this.relationshipSystem) return;
    
    // Add relationship data to the context
    const enhancedContext = { ...context };
    
    // Add relationship information for eligible houseguests
    if (Array.isArray(context.eligible)) {
      const relationshipData: Record<string, any> = {};
      
      context.eligible.forEach((hgName: string) => {
        // Find the ID for this houseguest
        // In a real implementation, we would have a proper lookup method
        const targetHg = houseguest.id; // Simplified for this example
        
        if (targetHg) {
          // Get relationship data
          const baseScore = this.relationshipSystem!.getRelationship(houseguest.id, targetHg);
          const effectiveScore = this.relationshipSystem!.getEffectiveRelationship(houseguest.id, targetHg);
          const reciprocityFactor = this.relationshipSystem!.calculateReciprocityModifier(houseguest.id, targetHg);
          const level = this.relationshipSystem!.getRelationshipLevel(houseguest.id, targetHg);
          
          // Get significant events
          const events = this.relationshipSystem!.getRelationshipEvents(houseguest.id, targetHg)
            .filter(e => ['betrayal', 'saved', 'alliance_formed', 'alliance_betrayed'].includes(e.type) ||
                    Math.abs(e.impactScore) >= 15)
            .map(e => e.description);
          
          relationshipData[hgName] = {
            score: baseScore,
            effectiveScore,
            reciprocityFactor,
            level,
            significantEvents: events
          };
        }
      });
      
      enhancedContext.relationships = relationshipData;
    }
    
    // Replace the context with our enhanced version
    Object.assign(context, enhancedContext);
  }

  /**
   * Add a memory for a specific houseguest
   */
  addMemory(houseguestId: string, memoryText: string): void {
    this.memoryManager.addMemory(houseguestId, memoryText);
  }
  
  /**
   * Provides fallback decisions when the API fails
   * - Direct access for useAINomination hook
   */
  getFallbackDecision(botId: string, decisionType: string, context: any, game: any) {
    return this.useFallback(decisionType, context, botId);
  }
  
  /**
   * Helper method to use fallback and track metrics
   */
  private useFallback(decisionType: string, context: any, houseguestId?: string): any {
    this.fallbackCount++;
    
    // Use relationship-aware fallback if we have a houseguest ID and relationship system
    if (houseguestId && this.relationshipSystem) {
      const decision = this.fallbackGenerator.getRelationshipAwareFallbackDecision(
        decisionType, 
        context, 
        houseguestId, 
        this.relationshipSystem
      );
      this.printFallbackStats();
      return decision;
    }
    
    // Otherwise use standard fallback
    const decision = this.fallbackGenerator.getFallbackDecision(decisionType, context);
    this.printFallbackStats();
    return decision;
  }
  
  /**
   * Print fallback usage statistics
   */
  private printFallbackStats(): void {
    const fallbackRate = (this.fallbackCount / this.totalDecisions * 100).toFixed(1);
    this.logger.info(`📊 FALLBACK STATS: ${this.fallbackCount}/${this.totalDecisions} decisions (${fallbackRate}%)`);
  }
  
  /**
   * Enforces rate limiting for API calls
   */
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastApiCall;
    
    if (elapsed < this.minCallInterval) {
      const delay = this.minCallInterval - elapsed;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastApiCall = Date.now();
  }
  
  /**
   * Helper method to describe relationship scores
   */
  describeRelationship(score: number): string {
    return this.fallbackGenerator.describeRelationship(score);
  }
}
