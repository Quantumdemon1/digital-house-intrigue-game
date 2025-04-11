
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
import { updateHouseguestMentalState, generateReflectionPrompt } from '@/models/houseguest';

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
      this.logger.info(`🤖 AI decision requested for ${botName} (${decisionType}), Mood: ${houseguest.mood}, Stress: ${houseguest.stressLevel}`);
      
      // Enhance context with relationship data and mental state
      this.enhanceContextWithHouseguestState(houseguest, decisionType, context, game);
      
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
   * Enhance the context with relationship data and houseguest mental state
   */
  private enhanceContextWithHouseguestState(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame
  ): void {
    // Add mental state information to context
    context.mentalState = {
      mood: houseguest.mood,
      stressLevel: houseguest.stressLevel,
      currentGoals: houseguest.currentGoals || [],
      internalThoughts: houseguest.internalThoughts || []
    };
    
    // Determine if personality-driven behavior should override normal logic
    // Higher stress increases chance of personality-driven (potentially irrational) behavior
    const stressLevelMap: Record<string, number> = {
      'Relaxed': 0.1,
      'Normal': 0.2,
      'Tense': 0.4,
      'Stressed': 0.6,
      'Overwhelmed': 0.8
    };
    
    const moodMap: Record<string, number> = {
      'Happy': 0.1,
      'Content': 0.2,
      'Neutral': 0.3,
      'Upset': 0.6,
      'Angry': 0.8
    };
    
    const stressInfluence = stressLevelMap[houseguest.stressLevel] || 0.3;
    const moodInfluence = moodMap[houseguest.mood] || 0.3;
    
    // Calculate how much personality/emotion should override strategic thinking
    const personalityDrivenFactor = (stressInfluence * config.STRESS_IMPACT_FACTOR) + 
                                   (moodInfluence * config.MOOD_IMPACT_FACTOR);
    
    context.personality = {
      traits: houseguest.traits,
      personalityDrivenFactor: Math.min(1, personalityDrivenFactor)
    };

    // Add relationship information if available
    if (this.relationshipSystem) {
      const enhancedContext = { ...context };
      
      // Add relationship information for eligible houseguests
      if (Array.isArray(context.eligible)) {
        const relationshipData: Record<string, any> = {};
        
        context.eligible.forEach((hgName: string) => {
          // Find the ID for this houseguest
          const targetHg = game.houseguests.find(h => h.name === hgName);
          
          if (targetHg) {
            // Get relationship data
            const baseScore = this.relationshipSystem!.getRelationship(houseguest.id, targetHg.id);
            const effectiveScore = this.relationshipSystem!.getEffectiveRelationship(houseguest.id, targetHg.id);
            const reciprocityFactor = this.relationshipSystem!.calculateReciprocityModifier(houseguest.id, targetHg.id);
            const level = this.relationshipSystem!.getRelationshipLevel(houseguest.id, targetHg.id);
            
            // Get significant events
            const events = this.relationshipSystem!.getRelationshipEvents(houseguest.id, targetHg.id)
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
  }

  /**
   * Generates a reflection for an AI houseguest based on their current state in the game
   * @param houseguestId ID of the houseguest to generate reflection for
   * @param game The current game state
   */
  async generateReflection(houseguestId: string, game: BigBrotherGame): Promise<boolean> {
    const houseguest = game.houseguests.find(h => h.id === houseguestId);
    if (!houseguest) {
      this.logger.error(`Cannot generate reflection: No houseguest with ID ${houseguestId} found.`);
      return false;
    }
    
    // Only generate reflections for AI houseguests
    if (houseguest.isPlayer) {
      this.logger.warn(`Cannot generate reflection for player character ${houseguest.name}.`);
      return false;
    }
    
    // Only generate reflection if it's time for a new one
    if (houseguest.lastReflectionWeek && game.week - houseguest.lastReflectionWeek < config.REFLECTION_INTERVAL) {
      this.logger.info(`Skipping reflection for ${houseguest.name} - not enough time has passed since last reflection`);
      return false;
    }
    
    this.logger.info(`🧠 Generating reflection for ${houseguest.name} (Week ${game.week})`);
    
    try {
      // Rate limit API calls
      await this.respectRateLimit();
      
      if (!this.apiKey) {
        this.logger.warn(`No API key, skipping reflection for ${houseguest.name}`);
        return this.generateFallbackReflection(houseguest, game);
      }
      
      // Generate the reflection prompt
      const prompt = generateReflectionPrompt(houseguest, game);
      
      // Call the API
      let response;
      try {
        response = await this.decisionMaker.callLLMAPI(prompt);
      } catch (error: any) {
        this.logger.error(`❌ Reflection API call failed: ${error.message}`);
        return this.generateFallbackReflection(houseguest, game);
      }
      
      // Parse the response
      try {
        const parsedResponse = JSON.parse(response);
        
        if (!parsedResponse.reflection || !parsedResponse.goals || !parsedResponse.strategy) {
          throw new Error("Invalid reflection format");
        }
        
        // Update the houseguest with the reflection results
        houseguest.internalThoughts = houseguest.internalThoughts || [];
        houseguest.internalThoughts.push(parsedResponse.reflection);
        
        // Cap internal thoughts at a reasonable number
        if (houseguest.internalThoughts.length > 10) {
          houseguest.internalThoughts = houseguest.internalThoughts.slice(-10);
        }
        
        houseguest.currentGoals = parsedResponse.goals;
        houseguest.lastReflectionWeek = game.week;
        
        // Add the strategy to memory
        this.memoryManager.addMemory(houseguest.id, `Week ${game.week} strategy: ${parsedResponse.strategy}`);
        
        this.logger.info(`✅ Generated reflection for ${houseguest.name}: ${parsedResponse.reflection.substring(0, 50)}...`);
        return true;
        
      } catch (error: any) {
        this.logger.error(`❌ Reflection parsing failed: ${error.message}`, { response });
        return this.generateFallbackReflection(houseguest, game);
      }
    } catch (error: any) {
      this.logger.error(`❌ Reflection generation failed: ${error.message}`);
      return this.generateFallbackReflection(houseguest, game);
    }
  }
  
  /**
   * Generate a simple fallback reflection when API is unavailable
   */
  private generateFallbackReflection(houseguest: Houseguest, game: BigBrotherGame): boolean {
    this.logger.info(`Generating fallback reflection for ${houseguest.name}`);
    
    const isNominated = houseguest.isNominated;
    const isHoH = houseguest.isHoH;
    const isPov = houseguest.isPovHolder;
    
    // Create personality-based reflections
    let reflection = "";
    let goals: string[] = [];
    
    // Base reflection on houseguest's status
    if (isNominated) {
      reflection = `I need to find a way to stay in this game. Being on the block is stressful, but I'm not giving up.`;
      goals = ["Win the veto competition", "Campaign to stay in the house", "Find out who I can trust"];
    } else if (isHoH) {
      reflection = `Having HoH power is a big responsibility. I need to make moves that benefit my game long-term.`;
      goals = ["Make strategic nominations", "Build stronger alliances", "Gather information about house dynamics"];
    } else if (isPov) {
      reflection = `The veto gives me some power this week. I need to decide how to use it wisely.`;
      goals = ["Decide whether to use the veto", "Position myself better for next week", "Strengthen key relationships"];
    } else {
      // General reflection based on primary trait
      const primaryTrait = houseguest.traits[0];
      
      switch(primaryTrait) {
        case 'Strategic':
          reflection = `I need to assess where I stand in the power structure of the house and make moves accordingly.`;
          goals = ["Identify the biggest threats", "Form strategic alliances", "Position myself better in the house"];
          break;
        case 'Social':
          reflection = `Building strong connections is key to my game. I should focus on strengthening my relationships.`;
          goals = ["Bond with more houseguests", "Be a social connector", "Stay out of drama"];
          break;
        case 'Competitive':
          reflection = `I need to win competitions to control my fate in this game. I can't rely on others.`;
          goals = ["Win the next competition", "Target other competition threats", "Build a competitive alliance"];
          break;
        case 'Loyal':
          reflection = `I need to stay true to my allies while watching out for my own game.`;
          goals = ["Protect my closest allies", "Identify potential betrayals", "Form stronger bonds"];
          break;
        case 'Sneaky':
          reflection = `The key to winning is manipulating the house dynamics from the shadows. Information is power.`;
          goals = ["Gather intel on other players", "Create subtle discord", "Position myself with multiple groups"];
          break;
        default:
          reflection = `I need to adapt to the changing dynamics of the game and find my path forward.`;
          goals = ["Assess house dynamics", "Build stronger relationships", "Position myself better"];
      }
    }
    
    // Factor in their mood and stress
    if (houseguest.mood === 'Happy' || houseguest.mood === 'Content') {
      reflection += ` I'm feeling good about my position right now.`;
    } else if (houseguest.mood === 'Upset' || houseguest.mood === 'Angry') {
      reflection += ` I'm really not happy with how things are going.`;
    }
    
    if (houseguest.stressLevel === 'Stressed' || houseguest.stressLevel === 'Overwhelmed') {
      reflection += ` The pressure is really getting to me.`;
    } else if (houseguest.stressLevel === 'Relaxed') {
      reflection += ` I feel relaxed and confident moving forward.`;
    }
    
    // Update the houseguest
    houseguest.internalThoughts = houseguest.internalThoughts || [];
    houseguest.internalThoughts.push(reflection);
    
    // Cap internal thoughts at a reasonable number
    if (houseguest.internalThoughts.length > 10) {
      houseguest.internalThoughts = houseguest.internalThoughts.slice(-10);
    }
    
    houseguest.currentGoals = goals;
    houseguest.lastReflectionWeek = game.week;
    
    return true;
  }

  /**
   * Add a memory for a specific houseguest
   */
  addMemory(houseguestId: string, memoryText: string): void {
    this.memoryManager.addMemory(houseguestId, memoryText);
  }
  
  /**
   * Updates a houseguest's mental state based on a game event
   */
  updateHouseguestMentalState(
    houseguestId: string,
    event: 'nominated' | 'saved' | 'competition_win' | 'competition_loss' | 'ally_evicted' | 'enemy_evicted' | 'betrayed' | 'positive_interaction' | 'negative_interaction'
  ): void {
    const game = this.relationshipSystem?.getGameRef();
    if (!game) return;
    
    const houseguest = game.houseguests.find(h => h.id === houseguestId);
    if (!houseguest) return;
    
    updateHouseguestMentalState(houseguest, event);
    this.logger.info(`Updated ${houseguest.name}'s mental state after ${event} event - now ${houseguest.mood}/${houseguest.stressLevel}`);
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
