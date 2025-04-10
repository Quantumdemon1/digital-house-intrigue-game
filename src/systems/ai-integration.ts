/**
 * @file src/systems/ai-integration.ts
 * @description Manages AI decision-making and natural language interactions using Gemini API.
 */

import { Houseguest } from '@/models/houseguest';
import { config } from '@/config';
import type { Logger } from '@/utils/logger';

// Types for AI responses
interface AIResponse {
  text: string;
  json?: any;
}

// Decision-making interfaces
interface NominationDecision {
  nominee1: string;
  nominee2: string;
  reasoning: string;
}

interface VetoDecision {
  useVeto: boolean;
  reasoning: string;
  replacement?: string; // If veto used
}

interface VotingDecision {
  voteToEvict: string;
  reasoning: string;
}

// Mapping HG memory and motivation
interface HouseguestMemory {
  id: string;
  name: string;
  traits: string[]; // Using traits since personality is a single value in Houseguest
  key_events: string[];
  relationships: {[key: string]: string}; // Map of name -> relationship description
  strategy: string;
}

export class AIIntegrationSystem {
  private apiKey: string;
  private logger: Logger;
  private memories: Map<string, HouseguestMemory> = new Map();
  private cachedResponses: Map<string, any> = new Map();

  constructor(logger: Logger, apiKey: string = "") {
    if (!logger) throw new Error("AIIntegrationSystem requires a logger instance.");
    this.logger = logger;
    this.apiKey = apiKey;
    
    if (!this.apiKey) {
      this.logger.warn("No Gemini API key provided. Using fallback deterministic AI responses.");
    } else {
      this.logger.info("AI Integration System initialized with API key.");
    }
  }

  initializeMemories(houseguests: Houseguest[]): void {
    this.memories.clear();
    if (!Array.isArray(houseguests)) {
      this.logger.error("Could not initialize AI memories - invalid houseguests array");
      return;
    }
    
    for (const houseguest of houseguests) {
      if (houseguest.isPlayer) continue; // Skip player
      
      const traits = houseguest.traits || [];
      
      this.memories.set(houseguest.id, {
        id: houseguest.id,
        name: houseguest.name,
        traits: traits.map(t => t.toString()),
        key_events: [],
        relationships: {},
        strategy: this.generateStrategy(houseguest)
      });
    }
    
    this.logger.info(`Initialized memories for ${this.memories.size} AI houseguests.`);
  }

  private generateStrategy(houseguest: Houseguest): string {
    // Generate a basic strategy based on traits
    if (houseguest.traits.includes('Strategic')) {
      return "Make calculated moves to advance in the game. Form small alliances with strong players.";
    } else if (houseguest.traits.includes('Social')) {
      return "Build strong relationships with everyone. Avoid being seen as a threat.";
    } else if (houseguest.traits.includes('Competitive')) {
      return "Win competitions and control the game directly. Target strong competitors.";
    } else if (houseguest.traits.includes('Loyal')) {
      return "Form a core alliance and stick to it. Prioritize alliance members over others.";
    } else if (houseguest.traits.includes('Sneaky')) {
      return "Play both sides. Gather information and use it strategically.";
    } else if (houseguest.traits.includes('Confrontational')) {
      return "Be direct about targets. Challenge strong players openly.";
    } else if (houseguest.traits.includes('Emotional')) {
      return "Form genuine connections. React strongly to betrayal.";
    } else if (houseguest.traits.includes('Analytical')) {
      return "Observe patterns in the house. Make logical decisions based on game state.";
    } else {
      return "Adapt to the house dynamics. Balance social and competitive gameplay.";
    }
  }

  updateHouseguestMemory(
    houseguestId: string, 
    event: string, 
    relationships?: {[key: string]: string}
  ): void {
    const memory = this.memories.get(houseguestId);
    if (!memory) {
      this.logger.warn(`Cannot update memory for unknown houseguest ID: ${houseguestId}`);
      return;
    }
    
    memory.key_events.push(event);
    // Keep only recent events (last 10)
    if (memory.key_events.length > 10) {
      memory.key_events = memory.key_events.slice(-10);
    }
    
    if (relationships) {
      memory.relationships = {...memory.relationships, ...relationships};
    }
  }

  async makeDecision(
    actorId: string,
    decisionType: 'nomination' | 'veto' | 'voting' | 'finale',
    context: any,
    game: any
  ): Promise<any> {
    const actor = game.getHouseguestById(actorId);
    if (!actor) {
      this.logger.error(`Cannot make decision: Houseguest with ID ${actorId} not found`);
      return null;
    }
    
    const actorName = actor.name;
    const cacheKey = `${actorId}-${decisionType}-${JSON.stringify(context)}`;
    const deadline = Date.now() + 10000; // 10 second timeout
    
    if (this.cachedResponses.has(cacheKey)) {
      this.logger.debug(`Using cached decision for ${actorName} (${decisionType})`);
      return this.cachedResponses.get(cacheKey);
    }

    try {
      if (!this.apiKey) {
        // Fallback: Generate deterministic AI responses
        const result = this.generateFallbackDecision(actor, decisionType, context, game);
        this.cachedResponses.set(cacheKey, result);
        return result;
      }
      
      // Construct prompt based on decision type and context
      const prompt = this.constructPrompt(actor, decisionType, context, game);
      
      // Call the Gemini API
      const response = await this.callGeminiAPI(prompt, deadline);
      
      // Parse and validate the response
      const decision = this.parseAndValidateResponse(response, decisionType, context);
      
      // Cache the valid response
      this.cachedResponses.set(cacheKey, decision);
      return decision;
      
    } catch (error: any) {
      this.logger.error(`AI decision error for ${actorName} (${decisionType}): ${error.message}`);
      
      // Fallback on error
      const fallbackDecision = this.generateFallbackDecision(actor, decisionType, context, game);
      this.cachedResponses.set(cacheKey, fallbackDecision);
      return fallbackDecision;
    }
  }

  private constructPrompt(
    actor: Houseguest,
    decisionType: string,
    context: any,
    game: any
  ): string {
    // Base prompt with role definition
    let prompt = `You are ${actor.name}, a houseguest on Big Brother. `;
    
    // Add traits context
    if (actor.traits && actor.traits.length > 0) {
      prompt += `Your personality traits are: ${actor.traits.join(', ')}. `;
      
      // Add memory if available
      const memory = this.memories.get(actor.id);
      if (memory) {
        prompt += `Your general strategy is: ${memory.strategy}\n\n`;
        
        if (memory.key_events.length > 0) {
          prompt += "Recent events:\n";
          memory.key_events.forEach(event => prompt += `- ${event}\n`);
          prompt += "\n";
        }
        
        if (Object.keys(memory.relationships).length > 0) {
          prompt += "Your relationships:\n";
          Object.entries(memory.relationships).forEach(([name, rel]) => {
            prompt += `- ${name}: ${rel}\n`;
          });
          prompt += "\n";
        }
      }
    }
    
    // Add situation-specific context
    prompt += `\n${context.situation || 'You need to make a decision.'}\n\n`;
    
    // Add instructions based on decision type
    switch (decisionType) {
      case 'nomination':
        prompt += `You need to nominate two houseguests for eviction from these eligible houseguests: ${context.eligible.join(', ')}.\n\n`;
        prompt += `Respond ONLY with a JSON object in this exact format:
{
  "nominee1": "[FIRST NOMINEE NAME]",
  "nominee2": "[SECOND NOMINEE NAME - DIFFERENT FROM FIRST]",
  "reasoning": "[YOUR STRATEGIC REASONING IN 1-2 SENTENCES]"
}`;
        break;
        
      case 'veto':
        prompt += `You won the Power of Veto. The current nominees are ${context.nominees.join(' and ')}. ${context.hohName} is the HOH.\n\n`;
        prompt += `Respond ONLY with a JSON object in this exact format:
{
  "useVeto": true/false,
  "reasoning": "[YOUR STRATEGIC REASONING IN 1-2 SENTENCES]"
  ${context.replacement ? ',"replacement": "[NAME OF REPLACEMENT NOMINEE]"' : ''}
}`;
        break;
        
      case 'voting':
        prompt += `You must vote to evict either ${context.nominees[0]} or ${context.nominees[1]}.\n\n`;
        prompt += `Respond ONLY with a JSON object in this exact format:
{
  "voteToEvict": "[NAME OF HOUSEGUEST YOU VOTE TO EVICT]",
  "reasoning": "[YOUR STRATEGIC REASONING IN 1-2 SENTENCES]"
}`;
        break;
        
      case 'finale':
        prompt += `You are a jury member deciding between finalists ${context.finalists.join(' and ')}. Consider their gameplay throughout the season.\n\n`;
        prompt += `Respond ONLY with a JSON object in this exact format:
{
  "vote": "[NAME OF FINALIST YOU VOTE TO WIN]",
  "reasoning": "[YOUR REASONING WHY THEY DESERVE TO WIN IN 1-2 SENTENCES]"
}`;
        break;
    }
    
    return prompt;
  }

  private async callGeminiAPI(prompt: string, deadline: number): Promise<AIResponse> {
    try {
      // Check if we've exceeded the deadline
      if (Date.now() > deadline) {
        throw new Error("API call timeout exceeded before request was made");
      }
      
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
      
      const response = await fetch(`${apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
            topP: 0.95
          }
        }),
        signal: AbortSignal.timeout(deadline - Date.now())
      });
      
      const result = await response.json();
      
      // Check if the response has the expected structure
      if (!result.candidates || !result.candidates[0]?.content?.parts || !result.candidates[0]?.content?.parts[0]?.text) {
        throw new Error(`Invalid API response structure: ${JSON.stringify(result)}`);
      }
      
      const text = result.candidates[0].content.parts[0].text;
      return { text };
      
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error("API call timed out");
      }
      throw error;
    }
  }

  private parseAndValidateResponse(response: AIResponse, decisionType: string, context: any): any {
    let text = response.text.trim();
    
    // Attempt to extract JSON from the response text
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from response");
    }
    
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate based on decision type
      switch (decisionType) {
        case 'nomination':
          if (!parsed.nominee1 || !parsed.nominee2 || !parsed.reasoning) {
            throw new Error("Missing required fields in nomination decision");
          }
          if (parsed.nominee1 === parsed.nominee2) {
            throw new Error("Nominees cannot be the same person");
          }
          if (!context.eligible.includes(parsed.nominee1) || !context.eligible.includes(parsed.nominee2)) {
            throw new Error("Nominated ineligible houseguest");
          }
          break;
          
        case 'veto':
          if (parsed.useVeto === undefined || !parsed.reasoning) {
            throw new Error("Missing required fields in veto decision");
          }
          if (parsed.useVeto && context.replacement && !parsed.replacement) {
            throw new Error("Missing replacement nominee");
          }
          break;
          
        case 'voting':
          if (!parsed.voteToEvict || !parsed.reasoning) {
            throw new Error("Missing required fields in voting decision");
          }
          if (!context.nominees.includes(parsed.voteToEvict)) {
            throw new Error("Voted for non-nominee");
          }
          break;
          
        case 'finale':
          if (!parsed.vote || !parsed.reasoning) {
            throw new Error("Missing required fields in finale vote");
          }
          if (!context.finalists.includes(parsed.vote)) {
            throw new Error("Voted for non-finalist");
          }
          break;
      }
      
      return parsed;
      
    } catch (error: any) {
      throw new Error(`JSON parsing/validation error: ${error.message}`);
    }
  }

  private generateFallbackDecision(
    actor: Houseguest,
    decisionType: string,
    context: any,
    game: any
  ): any {
    // Create a deterministic but somewhat random choice based on actor name
    this.logger.warn(`Using fallback decision generation for ${actor.name} (${decisionType})`);
    
    // Create a simple hash of the name for deterministic "randomness"
    const nameHash = actor.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    switch (decisionType) {
      case 'nomination': {
        // Deterministically pick two different nominees based on name hash
        const { eligible = [] } = context;
        if (eligible.length < 2) {
          throw new Error("Not enough eligible houseguests for nomination");
        }
        
        const sortedEligible = [...eligible].sort();
        const idx1 = nameHash % sortedEligible.length;
        let idx2 = (nameHash + 1) % sortedEligible.length;
        if (idx1 === idx2) idx2 = (idx2 + 1) % sortedEligible.length;
        
        return {
          nominee1: sortedEligible[idx1],
          nominee2: sortedEligible[idx2],
          reasoning: `I think these houseguests are the biggest threats to my game right now.`
        };
      }
      
      case 'veto': {
        // Determine veto use based on hash
        const useVeto = nameHash % 2 === 0;
        let result: any = {
          useVeto,
          reasoning: useVeto 
            ? "I think using the veto is the best move for my game right now." 
            : "I think keeping the nominations the same is best for my game."
        };
        
        // Add replacement if needed
        if (useVeto && context.replacement) {
          const replacements = context.replacement.split(',').map((s: string) => s.trim());
          result.replacement = replacements[nameHash % replacements.length];
        }
        
        return result;
      }
      
      case 'voting': {
        const nominee = context.nominees[nameHash % context.nominees.length];
        return {
          voteToEvict: nominee,
          reasoning: `I'm voting to evict ${nominee} because they're a bigger threat to my game.`
        };
      }
      
      case 'finale': {
        const finalist = context.finalists[nameHash % context.finalists.length];
        return {
          vote: finalist,
          reasoning: `I believe ${finalist} played the better game overall.`
        };
      }
      
      default:
        return { error: "Unknown decision type" };
    }
  }
}
