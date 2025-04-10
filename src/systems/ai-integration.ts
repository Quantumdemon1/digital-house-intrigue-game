import { Houseguest } from '../models/houseguest';

export class AIIntegrationSystem {
  private logger: any;
  private apiKey: string;
  private memories: Map<string, string[]> = new Map();
  private lastApiCall: number = 0;
  private apiRateLimit: number = 500; // ms between calls

  constructor(logger: any, apiKey: string) {
    this.logger = logger;
    this.apiKey = apiKey;
    
    if (!this.apiKey || this.apiKey === 'MISSING_API_KEY') {
      this.logger.error('Gemini API key is missing. AI functionality will not work.');
    }
  }

  initializeMemories(houseguests: Houseguest[]): void {
    // Create or reset memory for each houseguest
    houseguests.forEach(guest => {
      if (!guest.isPlayer) {
        this.memories.set(guest.id, [
          `You are ${guest.name}, a contestant on Big Brother.`,
          `Your personality is ${guest.personality}.`,
          `You have these attributes - Intelligence: ${guest.stats?.mental || 5}, Social: ${guest.stats?.social || 5}, Physical: ${guest.stats?.physical || 5}, Endurance: ${guest.stats?.endurance || 5}.`
        ]);
      }
    });
    this.logger.info(`Initialized memories for ${this.memories.size} AI houseguests.`);
  }
  
  async makeDecision(
    botName: string,
    decisionType: string,
    context: Record<string, any>,
    gameState: any
  ): Promise<any> {
    if (!this.apiKey || this.apiKey === 'MISSING_API_KEY') {
      this.logger.error(`Cannot make AI decision for ${botName}: API key missing`);
      return null;
    }
    
    const bot = gameState.houseguests.find((h: Houseguest) => h.name === botName && !h.isPlayer);
    if (!bot) {
      this.logger.error(`Cannot make AI decision: Bot "${botName}" not found`);
      return null;
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    if (timeSinceLastCall < this.apiRateLimit) {
      const delay = this.apiRateLimit - timeSinceLastCall;
      this.logger.debug(`Rate limiting API call, waiting ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastApiCall = Date.now();

    // Get bot's memories
    const memories = this.memories.get(bot.id) || [];
    
    try {
      // Create prompt based on decision type
      let prompt = '';
      let temperature = 0.2; // Default temperature
      
      // Structure prompts by decision type
      switch (decisionType) {
        case 'nomination':
          prompt = this.createNominationPrompt(bot, context, memories);
          temperature = 0.2; // Low temperature for strategic decisions
          break;
        case 'veto':
          prompt = this.createVetoPrompt(bot, context, memories);
          temperature = 0.2;
          break;
        case 'vote':
          prompt = this.createVotePrompt(bot, context, memories);
          temperature = 0.3;
          break;
        case 'dialogue':
          prompt = this.createDialoguePrompt(bot, context, memories);
          temperature = 0.7; // Higher temperature for creative dialogues
          break;
        default:
          this.logger.error(`Unknown decision type: ${decisionType}`);
          return null;
      }
      
      this.logger.debug(`Making AI ${decisionType} decision for ${botName} with prompt length: ${prompt.length}`);
      
      // Make the actual API call to Gemini
      const response = await this.callGeminiAPI(prompt, temperature);
      
      if (!response) {
        this.logger.error(`Empty response from Gemini API for ${botName}'s ${decisionType} decision`);
        return null;
      }
      
      // Process response based on decision type
      let decision;
      try {
        if (decisionType === 'dialogue') {
          // For dialogue, just return the text response
          decision = response.trim();
        } else {
          // For game decisions, expect JSON responses
          decision = this.parseJsonResponse(response);
          this.logger.debug(`AI ${decisionType} decision for ${botName}:`, decision);
        }
        
        // Add to bot's memory if it's significant
        if (decisionType !== 'dialogue') {
          this.addToMemory(bot.id, `You made a ${decisionType} decision: ${JSON.stringify(decision)}`);
        }
        
        return decision;
      } catch (parseError) {
        this.logger.error(`Failed to parse ${decisionType} decision for ${botName}:`, parseError);
        this.logger.error(`Raw response was:`, response);
        return null;
      }
    } catch (error) {
      this.logger.error(`AI decision error for ${botName}:`, error);
      return null;
    }
  }
  
  private addToMemory(botId: string, memoryText: string): void {
    const memories = this.memories.get(botId) || [];
    memories.push(memoryText);
    
    // Keep memory size limited
    if (memories.length > 20) {
      memories.shift(); // Remove oldest memory
    }
    
    this.memories.set(botId, memories);
  }
  
  private createNominationPrompt(bot: Houseguest, context: any, memories: string[]): string {
    return `You are ${bot.name}, the Head of Household in Big Brother. You need to nominate two houseguests for eviction.

Your memories:
${memories.join('\n')}

Current game situation:
${context.situation}

Eligible houseguests you can nominate:
${context.eligible.join(', ')}

Think strategically. Consider your relationships, alliances, and who is a threat to your game.

Respond in JSON format only:
{"nominee1": "HouseguestName1", "nominee2": "HouseguestName2", "reasoning": "Your strategic thinking for these choices"}

Choose two different names from the eligible list. You cannot nominate yourself.`;
  }
  
  private createVetoPrompt(bot: Houseguest, context: any, memories: string[]): string {
    return `You are ${bot.name}, the Power of Veto holder in Big Brother. You need to decide whether to use the veto, and if so, on whom.

Your memories:
${memories.join('\n')}

Current game situation:
${context.situation}

Nominated houseguests:
${context.nominees.join(', ')}

Think strategically. Consider your relationships, alliances, and your own game position.

Respond in JSON format only:
{"useVeto": true/false, "vetoTarget": "HouseguestName", "reasoning": "Your strategic thinking for this choice"}

If you choose not to use the veto, set "useVeto": false and "vetoTarget": null.`;
  }
  
  private createVotePrompt(bot: Houseguest, context: any, memories: string[]): string {
    return `You are ${bot.name}, a houseguest in Big Brother. You need to vote to evict one of the nominees.

Your memories:
${memories.join('\n')}

Current game situation:
${context.situation}

Nominees:
${context.nominees.join(', ')}

Think strategically. Consider your relationships, alliances, and your own game position.

Respond in JSON format only:
{"vote": "HouseguestToEvict", "reasoning": "Your strategic thinking for this choice"}

Your vote must be for one of the nominees listed.`;
  }
  
  private createDialoguePrompt(bot: Houseguest, context: any, memories: string[]): string {
    return `You are ${bot.name}, a houseguest in Big Brother. You need to respond to the following situation.

Your memories:
${memories.join('\n')}

Current situation:
${context.situation}

Speak in your voice and personality. Be concise and natural. Your response should be authentic to your character.

No need for JSON format - just respond directly with what you would say.`;
  }
  
  private async callGeminiAPI(prompt: string, temperature: number): Promise<string> {
    try {
      this.logger.debug('Calling Gemini API...');
      
      // Production API call (uncomment when API key is set)
      if (!this.apiKey || this.apiKey === 'MISSING_API_KEY') {
        throw new Error('API key not configured');
      }
      
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
      const response = await fetch(`${url}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: 800,
            topK: 40,
            topP: 0.95
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      // Extract text from the Gemini response structure
      if (data.candidates && data.candidates[0] && data.candidates[0].content && 
          data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      }
      
      this.logger.error('Unexpected Gemini API response structure:', data);
      throw new Error('Invalid API response format');
    } catch (error) {
      this.logger.error('Gemini API call failed:', error);
      
      // Fallback mock response for testing/demo
      this.logger.warn('Using fallback mock response');
      switch (true) {
        case prompt.includes('nominate'):
          return '{"nominee1": "Alex", "nominee2": "Bailey", "reasoning": "Strategic decision based on threat level"}';
        case prompt.includes('veto'):
          return '{"useVeto": false, "vetoTarget": null, "reasoning": "Current nominations are good for my game"}';
        case prompt.includes('vote'):
          return '{"vote": "Alex", "reasoning": "Alex is a bigger threat to my game"}';
        default:
          return 'I\'ll need to consider my options carefully.';
      }
    }
  }
  
  private parseJsonResponse(response: string): any {
    try {
      // First, try straightforward JSON parsing
      return JSON.parse(response);
    } catch (e) {
      // If that fails, try to extract JSON from a larger text response
      const jsonMatch = response.match(/(\{.*\})/s);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e2) {
          throw new Error(`Could not parse JSON from response: ${response}`);
        }
      } else {
        throw new Error(`Response does not contain valid JSON: ${response}`);
      }
    }
  }
}
