/**
 * @file src/systems/ai-integration.ts
 * @description Provides AI decision-making capabilities using API integrations.
 */

import { Houseguest } from '@/models/houseguest';
import type { Logger } from '@/utils/logger';
import type { BigBrotherGame } from '@/models/BigBrotherGame';

// Define standard response structure for AI decisions
interface AIDecisionResponse {
  reasoning: string;
  decision: any; // Type varies based on decision type
  [key: string]: any; // Allow additional fields
}

export class AIIntegrationSystem {
  private logger: Logger;
  private apiKey: string;
  private memories: Map<string, string[]> = new Map(); // Store memories by houseguest ID
  private lastApiCall: number = 0;
  private readonly minCallInterval: number = 1000; // Minimum time between API calls (1s)

  constructor(logger: Logger, apiKey: string = '') {
    if (!logger) throw new Error("AIIntegrationSystem requires a logger instance.");
    this.logger = logger;
    this.apiKey = apiKey;
    if (!apiKey) this.logger.warn("No API key provided for AIIntegrationSystem. AI features will be limited.");
  }

  /**
   * Initializes bot memories (persona information) for each AI houseguest
   * @param houseguests List of all houseguests in the game
   */
  initializeMemories(houseguests: Houseguest[]): void {
    this.memories.clear();
    const aiHouseguests = houseguests.filter(h => !h.isPlayer);
    
    aiHouseguests.forEach(hg => {
      const baseMemory = [
        `You are ${hg.name}, a houseguest on Big Brother.`,
        `Your personality trait is ${hg.personality}.`,
        `You are ${hg.personality === 'Strategic' ? 'very strategic' : 
                  hg.personality === 'Social' ? 'very social and outgoing' : 
                  hg.personality === 'Competitive' ? 'extremely competitive' : 
                  hg.personality === 'Loyal' ? 'loyal to your allies' :
                  hg.personality === 'Sneaky' ? 'sneaky and deceptive' :
                  hg.personality === 'Confrontational' ? 'confrontational and direct' :
                  hg.personality === 'Emotional' ? 'emotional and reactive' : 
                  hg.personality === 'Paranoid' ? 'paranoid and suspicious' :
                  hg.personality === 'Floater' ? 'a floater who avoids taking sides' :
                  'a normal houseguest'}.`,
        `Your current mood is ${hg.mood}.`,
        `Your stats: Intelligence ${hg.attributes.intelligence}/10, Social ${hg.attributes.social}/10, Endurance ${hg.attributes.endurance}/10, Dexterity ${hg.attributes.dexterity}/10.`
      ];
      this.memories.set(hg.id, baseMemory);
      this.logger.debug(`Initialized memories for ${hg.name}`);
    });
    
    this.logger.info(`AI system initialized memories for ${aiHouseguests.length} AI houseguests.`);
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
    // Find the houseguest
    const houseguest = game.houseguests.find(h => h.name === botName);
    if (!houseguest) {
      this.logger.error(`Cannot make decision: No houseguest named ${botName} found.`);
      return this.getFallbackDecision(decisionType, context);
    }
    
    if (houseguest.isPlayer) {
      this.logger.error(`Cannot make AI decision for player character ${botName}.`);
      return this.getFallbackDecision(decisionType, context);
    }

    try {
      // Rate limit API calls
      await this.respectRateLimit();
      
      // If we're in development or testing mode without an API key, use fallback
      if (!this.apiKey) {
        this.logger.warn(`No API key, using fallback for ${decisionType} decision by ${botName}`);
        return this.getFallbackDecision(decisionType, context);
      }
      
      // Generate prompt based on decision type
      const prompt = this.generatePrompt(houseguest, decisionType, context, game);
      
      // Make the API call
      const response = await this.callLLMAPI(prompt);
      
      // Parse and validate the response
      const decision = this.parseAndValidateResponse(response, decisionType);
      
      // Log the decision
      this.logger.info(`AI Decision (${decisionType}): ${botName} decided: ${JSON.stringify(decision)}`);
      
      // Update memories with this decision
      this.addMemory(houseguest.id, `You made a ${decisionType} decision: ${JSON.stringify(decision.decision)}`);
      
      return decision.decision;
    } catch (error: any) {
      this.logger.error(`Error in AI decision (${decisionType}): ${error.message}`);
      return this.getFallbackDecision(decisionType, context);
    }
  }
  
  /**
   * Generates a prompt for the API based on the decision type and context
   */
  private generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame
  ): string {
    // Get memories for this houseguest
    const memories = this.memories.get(houseguest.id) || [];
    
    // Base system message
    let prompt = `You are ${houseguest.name}, a houseguest on Big Brother with a ${houseguest.personality} personality.
Your current mood is ${houseguest.mood}.
You are making a ${decisionType} decision.
Context: ${JSON.stringify(context)}

Your memories:
${memories.join("\n")}

Instructions:
- Based on your personality and the context, make a strategic decision.
- Respond with ONLY a valid JSON object containing 'reasoning' (string) and 'decision' (object).
- The 'decision' object must have exactly the fields needed for ${decisionType}.

`;
    
    // Add specific instructions based on decision type
    switch (decisionType) {
      case 'nomination':
        prompt += `For nominations, your decision object must include:
{
  "nominee1": "[name of first nominee]",
  "nominee2": "[name of second nominee]",
  "reasoning": "[explain your reasoning]"
}
Choose from the eligible houseguests: ${context.eligible?.join(', ')}
`;
        break;
        
      case 'veto':
        prompt += `For veto decision, your decision object must include:
{
  "useVeto": true/false,
  "saveNominee": "[name of nominee to save, if using veto]",
  "reasoning": "[explain your reasoning]"
}`;
        break;
        
      case 'replacement':
        prompt += `For replacement nominee, your decision object must include:
{
  "replacementNominee": "[name of replacement]",
  "reasoning": "[explain your reasoning]"
}
Choose from the eligible houseguests: ${context.eligible?.join(', ')}`;
        break;
        
      case 'eviction_vote':
        prompt += `For eviction vote, your decision object must include:
{
  "voteToEvict": "[name of nominee you're voting to evict]",
  "reasoning": "[explain your reasoning]"
}
The nominees are: ${context.nominees?.join(', ')}`;
        break;
        
      case 'jury_vote':
        prompt += `For jury vote, your decision object must include:
{
  "voteForWinner": "[name of finalist you're voting for]",
  "reasoning": "[explain your reasoning]"
}
The finalists are: ${context.finalists?.join(', ')}`;
        break;
    }
    
    return prompt;
  }
  
  /**
   * Makes the actual API call to the LLM
   */
  private async callLLMAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("No API key provided for LLM call");
    }
    
    this.logger.debug(`Making API call to Gemini API...`);
    
    try {
      // Real Gemini API call would go here
      // For Phase 1, we'll use a placeholder implementation
      // that will be replaced in Phase 2 with the actual API call
      
      // Basic placeholder for testing
      return JSON.stringify({
        reasoning: "This is a placeholder response during Phase 1 implementation.",
        decision: { placeholder: true }
      });
      
      // Actual implementation would look like:
      /*
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API call failed: ${data.error?.message || 'Unknown error'}`);
      }
      
      return data.candidates[0].content.parts[0].text;
      */
    } catch (error: any) {
      this.logger.error(`API call error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Parses and validates the API response
   */
  private parseAndValidateResponse(response: string, decisionType: string): AIDecisionResponse {
    try {
      // Try to parse the response as JSON
      let data: AIDecisionResponse;
      
      try {
        data = JSON.parse(response);
      } catch (e) {
        // If it's not valid JSON, try to extract JSON from the text response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse JSON from response");
        }
      }
      
      // Validate that required fields exist
      if (!data.reasoning || !data.decision) {
        throw new Error("Response missing required fields");
      }
      
      // Validate decision structure based on type
      this.validateDecisionStructure(data.decision, decisionType);
      
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to parse API response: ${error.message}. Response: ${response}`);
      throw new Error(`Invalid API response format: ${error.message}`);
    }
  }
  
  /**
   * Validates the structure of the decision based on type
   */
  private validateDecisionStructure(decision: any, decisionType: string): void {
    switch (decisionType) {
      case 'nomination':
        if (!decision.nominee1 || !decision.nominee2) {
          throw new Error("Nomination decision must include nominee1 and nominee2");
        }
        break;
      case 'veto':
        if (typeof decision.useVeto !== 'boolean') {
          throw new Error("Veto decision must include useVeto (boolean)");
        }
        if (decision.useVeto && !decision.saveNominee) {
          throw new Error("When using veto, saveNominee must be provided");
        }
        break;
      case 'replacement':
        if (!decision.replacementNominee) {
          throw new Error("Replacement decision must include replacementNominee");
        }
        break;
      case 'eviction_vote':
        if (!decision.voteToEvict) {
          throw new Error("Eviction vote must include voteToEvict");
        }
        break;
      case 'jury_vote':
        if (!decision.voteForWinner) {
          throw new Error("Jury vote must include voteForWinner");
        }
        break;
    }
  }
  
  /**
   * Provides fallback decisions when the API fails
   */
  private getFallbackDecision(decisionType: string, context: any): any {
    this.logger.warn(`Using fallback decision for ${decisionType}`);
    
    switch (decisionType) {
      case 'nomination': {
        // Randomly pick two nominees from eligible list
        if (!context.eligible || context.eligible.length < 2) {
          return { nominee1: "Unknown1", nominee2: "Unknown2" };
        }
        const shuffled = [...context.eligible].sort(() => 0.5 - Math.random());
        return { nominee1: shuffled[0], nominee2: shuffled[1] };
      }
      
      case 'veto': {
        // 50% chance to use veto
        const useVeto = Math.random() > 0.5;
        return {
          useVeto,
          saveNominee: useVeto && context.nominees?.length ? context.nominees[0] : null
        };
      }
      
      case 'replacement': {
        // Randomly pick a replacement
        if (!context.eligible || context.eligible.length < 1) {
          return { replacementNominee: "Unknown" };
        }
        return { replacementNominee: context.eligible[Math.floor(Math.random() * context.eligible.length)] };
      }
      
      case 'eviction_vote': {
        // Randomly vote to evict one nominee
        if (!context.nominees || context.nominees.length < 1) {
          return { voteToEvict: "Unknown" };
        }
        return { voteToEvict: context.nominees[Math.floor(Math.random() * context.nominees.length)] };
      }
      
      case 'jury_vote': {
        // Randomly vote for one finalist
        if (!context.finalists || context.finalists.length < 1) {
          return { voteForWinner: "Unknown" };
        }
        return { voteForWinner: context.finalists[Math.floor(Math.random() * context.finalists.length)] };
      }
      
      default:
        return { error: "Unknown decision type" };
    }
  }
  
  /**
   * Adds a memory for a houseguest
   */
  addMemory(houseguestId: string, memoryText: string): void {
    if (!this.memories.has(houseguestId)) {
      this.memories.set(houseguestId, []);
    }
    
    const memories = this.memories.get(houseguestId)!;
    memories.push(memoryText);
    
    // Keep memory array at a reasonable size
    const maxMemories = 10;
    if (memories.length > maxMemories) {
      memories.shift(); // Remove oldest memory
    }
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
}
