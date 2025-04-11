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
import { RelationshipEventType } from '@/models/relationship-event';
import { GamePhase } from '@/models/game-state';

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
    const houseguests = this.relationshipSystem?.getAllRelationships() ? [] : [];
      
    const houseguest = houseguests.find(h => h.id === houseguestId);
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

  /**
   * Generate a dialogue response from an AI houseguest
   * @param houseguestId ID of the AI houseguest responding
   * @param context Dialogue context data
   * @param game Game state reference
   * @returns Promise resolving to a dialogue response object
   */
  async generateDialogueResponse(
    houseguestId: string,
    context: {
      speakerId: string;
      speakerName: string;
      message: string;
      situation: string;
      phase: GamePhase;
      week: number;
    },
    game: BigBrotherGame
  ): Promise<{
    response: string;
    tone: 'friendly' | 'strategic' | 'cautious' | 'deceptive' | 'aggressive' | 'dismissive' | 'neutral';
    thoughts: string;
  }> {
    this.totalDecisions++;
    
    // Find the houseguest
    const houseguest = game.houseguests.find(h => h.id === houseguestId);
    if (!houseguest) {
      this.logger.error(`Cannot generate dialogue: No houseguest with ID ${houseguestId} found.`);
      return this.getFallbackDialogue(context, game);
    }
    
    try {
      this.logger.info(`🗣️ Dialogue response requested from ${houseguest.name}, Mood: ${houseguest.mood}, Stress: ${houseguest.stressLevel}`);
      
      // Create an enhanced context with relationship data
      const enhancedContext = this.createEnhancedDialogueContext(houseguest, context, game);
      
      // Rate limit API calls
      await this.respectRateLimit();
      
      // If we're in development or testing mode without API key, use fallback
      if (!this.apiKey) {
        this.logger.warn(`No API key, using fallback for dialogue by ${houseguest.name}`);
        return this.getFallbackDialogue(context, game);
      }
      
      // Generate prompt based on dialogue context
      const memories = this.memoryManager.getMemoriesForHouseguest(houseguest.id);
      const prompt = this.decisionMaker.generatePrompt(houseguest, 'dialogue', enhancedContext, game, memories);
      
      // Make the API call
      let response;
      try {
        response = await this.decisionMaker.callLLMAPI(prompt);
        this.logger.debug(`Raw dialogue API response received: ${response?.substring(0, 100)}...`);
      } catch (error: any) {
        this.logger.error(`❌ Dialogue API call failed: ${error.message}`);
        return this.getFallbackDialogue(context, game);
      }
      
      // Parse and validate the response
      let decision;
      try {
        decision = this.responseParser.parseAndValidateResponse(response, 'dialogue');
        this.logger.info(`✅ AI Dialogue SUCCESS for ${houseguest.name}`);
      } catch (error: any) {
        this.logger.error(`❌ Dialogue response validation failed: ${error.message}`, { response });
        return this.getFallbackDialogue(context, game);
      }
      
      // Log the dialogue response
      this.logger.info(`✅ ${houseguest.name} responds: "${decision.decision.response}" (${decision.decision.tone})`);
      this.logger.debug(`${houseguest.name} thinks: "${decision.decision.thoughts}"`);
      
      // Add a memory of this conversation
      this.memoryManager.addMemory(
        houseguest.id, 
        `${context.speakerName} said to you: "${context.message}" and you responded: "${decision.decision.response}"`
      );
      
      // Update houseguest mental state based on this interaction
      this.updateMentalStateFromDialogue(houseguest, decision.decision, context);
      
      // Print fallback stats
      this.printFallbackStats();
      
      return decision.decision;
    } catch (error: any) {
      this.logger.error(`❌ Dialogue generation FAILED: ${error.message}`);
      return this.getFallbackDialogue(context, game);
    }
  }
  
  /**
   * Create an enhanced context for dialogue generation with rich relationship data
   */
  private createEnhancedDialogueContext(
    houseguest: Houseguest,
    context: any,
    game: BigBrotherGame
  ): any {
    const enhancedContext = { ...context };
    
    // Add speaker relationship data if available
    if (this.relationshipSystem && context.speakerId) {
      // Get relationship data in both directions
      const myRelationship = this.relationshipSystem.getEffectiveRelationship(
        houseguest.id, 
        context.speakerId
      );
      
      const theirRelationship = this.relationshipSystem.getEffectiveRelationship(
        context.speakerId, 
        houseguest.id
      );
      
      enhancedContext.relationship = {
        myFeelings: myRelationship,
        theirFeelings: theirRelationship,
        reciprocityFactor: this.relationshipSystem.calculateReciprocityModifier(
          houseguest.id,
          context.speakerId
        ),
        level: this.relationshipSystem.getRelationshipLevel(houseguest.id, context.speakerId)
      };
      
      // Get significant events between these houseguests
      const events = this.relationshipSystem.getRelationshipEvents(houseguest.id, context.speakerId)
        .filter(e => ['betrayal', 'saved', 'alliance_formed', 'alliance_betrayed'].includes(e.type) ||
                Math.abs(e.impactScore) >= 15)
        .map(e => e.description);
                
      enhancedContext.significantEvents = events;
    }
    
    // Add game state context
    enhancedContext.gameContext = {
      week: game.week,
      phase: game.phase,
      hohName: game.hohWinner?.name || "None",
      nominees: game.nominees.map(n => n.name),
      povWinner: game.povWinner?.name || "None"
    };
    
    // Add recent game events for context
    enhancedContext.recentEvents = game.gameLog
      .filter(log => log.week === game.week || log.week === game.week - 1)
      .filter(log => log.involvedHouseguests.includes(houseguest.id) || 
                     log.involvedHouseguests.includes(context.speakerId))
      .slice(-5)
      .map(log => log.description);
    
    return enhancedContext;
  }
  
  /**
   * Updates a houseguest's mental state based on dialogue outcomes
   */
  private updateMentalStateFromDialogue(
    houseguest: Houseguest, 
    dialogueResult: { response: string; tone: string; thoughts: string; },
    context: { speakerId: string; speakerName: string; message: string; }
  ): void {
    // Extract tone from dialogue
    const tone = dialogueResult.tone;
    const thoughts = dialogueResult.thoughts;
    
    // Update mental state based on tone and thoughts
    let eventType: 'positive_interaction' | 'negative_interaction' | null = null;
    
    // Analyze internal thoughts for emotional impact
    const negativeThoughtIndicators = [
      'annoyed', 'angry', 'upset', 'frustrated', 'suspicious', 'don\'t trust', 
      'bothering me', 'irritating', 'hate', 'dislike'
    ];
    
    const positiveThoughtIndicators = [
      'like', 'trust', 'friend', 'ally', 'happy', 'glad', 'appreciate', 
      'helpful', 'grateful', 'enjoy'
    ];
    
    // Check if thoughts contain negative indicators
    const hasNegativeThoughts = negativeThoughtIndicators.some(indicator => 
      thoughts.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Check if thoughts contain positive indicators
    const hasPositiveThoughts = positiveThoughtIndicators.some(indicator => 
      thoughts.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Determine event type based on thoughts and tone
    if ((tone === 'friendly' || tone === 'strategic') && hasPositiveThoughts) {
      eventType = 'positive_interaction';
    } else if ((tone === 'aggressive' || tone === 'dismissive' || tone === 'deceptive') && hasNegativeThoughts) {
      eventType = 'negative_interaction';
    }
    
    // Update houseguest mental state if needed
    if (eventType) {
      updateHouseguestMentalState(houseguest, eventType);
      this.logger.info(`Updated ${houseguest.name}'s mental state after dialogue (${eventType})`);
    }
    
    // Store the thought as an internal thought for the houseguest
    if (!houseguest.internalThoughts) {
      houseguest.internalThoughts = [];
    }
    houseguest.internalThoughts.push(`[About ${context.speakerName}]: ${thoughts}`);
    
    // Cap internal thoughts if needed
    if (houseguest.internalThoughts.length > 10) {
      houseguest.internalThoughts = houseguest.internalThoughts.slice(-10);
    }
  }
  
  /**
   * Fallback dialogue generation when API fails or isn't available
   */
  private getFallbackDialogue(
    context: { speakerName: string; message: string; },
    game: BigBrotherGame
  ): { response: string; tone: 'friendly' | 'strategic' | 'cautious' | 'deceptive' | 'aggressive' | 'dismissive' | 'neutral'; thoughts: string; } {
    this.fallbackCount++;
    
    // Generate simple response based on message
    const message = context.message.toLowerCase();
    let response = "I'm not sure what to say about that.";
    let tone: 'friendly' | 'strategic' | 'cautious' | 'deceptive' | 'aggressive' | 'dismissive' | 'neutral' = 'neutral';
    let thoughts = "I should be careful what I say.";
    
    // Very basic message parsing for fallback responses
    if (message.includes('alliance') || message.includes('work together')) {
      response = "I think that could be good for both of us. Let's discuss it more later.";
      tone = 'strategic';
      thoughts = "An alliance might be useful, but I need to be careful who I trust.";
    } else if (message.includes('vote') || message.includes('evict')) {
      response = "I'm still thinking about my vote. I want to make the right decision.";
      tone = 'cautious';
      thoughts = "I shouldn't reveal my voting plans so easily.";
    } else if (message.includes('nominee') || message.includes('block')) {
      response = "It's a tough situation for anyone on the block. Let's see how things play out.";
      tone = 'strategic';
      thoughts = "I need to be careful discussing nominations.";
    } else if (message.includes('hoh') || message.includes('head of household')) {
      response = "The HoH has a lot of power this week. It's important to stay on their good side.";
      tone = 'strategic';
      thoughts = "HoH discussions are always delicate.";
    } else if (message.includes('how are you') || message.includes('what\'s up')) {
      response = "I'm doing alright, just trying to navigate the game day by day.";
      tone = 'friendly';
      thoughts = "Basic small talk, but these connections matter.";
    } else if (message.includes('trust') || message.includes('promise')) {
      response = "Trust is earned in this game. I try to be straightforward when I can.";
      tone = 'cautious';
      thoughts = "Trust discussions are tricky in Big Brother.";
    } else {
      // Generic responses for anything else
      const genericResponses = [
        "That's an interesting point.",
        "I've been thinking the same thing.",
        "We should talk more about this later.",
        "I see where you're coming from.",
        "Let me think about that."
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      tone = 'neutral';
      thoughts = "Just keeping the conversation going without revealing too much.";
    }
    
    this.printFallbackStats();
    return { response, tone, thoughts };
  }
}
