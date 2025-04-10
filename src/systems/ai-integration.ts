
import { Houseguest } from '../models/houseguest';

export class AIIntegrationSystem {
  private logger: any;
  private apiKey: string;

  constructor(logger: any, apiKey: string) {
    this.logger = logger;
    this.apiKey = apiKey || '';
    
    if (!apiKey) {
      this.logger.error('No API key provided for AI Integration System!');
    }
  }

  async makeDecision(
    agentName: string,
    decisionType: string,
    context: any,
    gameState: any
  ): Promise<any> {
    this.logger.info(`AI ${agentName} making ${decisionType} decision`);
    
    // Basic validation
    if (!this.apiKey) {
      this.logger.error('Cannot make AI decisions: Missing API key');
      return this.generateFallbackDecision(decisionType, context);
    }
    
    try {
      // Build prompt based on decision type
      const prompt = this.buildPrompt(decisionType, context, gameState);
      
      // Call Gemini API
      const response = await this.callGeminiAPI(prompt);
      
      // Parse and validate the response
      const parsedResponse = this.parseResponse(response, decisionType);
      
      return parsedResponse;
    } catch (error: any) {
      this.logger.error(`AI decision error: ${error.message}`);
      
      // Fall back to deterministic algorithm
      return this.generateFallbackDecision(decisionType, context);
    }
  }
  
  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('No API key available for Gemini');
    }
    
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      // Extract the generated text from the response
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (error: any) {
      this.logger.error(`Gemini API call failed: ${error.message}`);
      throw error;
    }
  }
  
  private buildPrompt(decisionType: string, context: any, gameState: any): string {
    let basePrompt = '';
    
    switch (decisionType) {
      case 'nomination': {
        // Nomination prompt
        basePrompt = `
You are ${context.botName}, the Head of Household in Big Brother. You must nominate two houseguests for eviction.

CONTEXT:
- You are playing competitively to win the game
- Eligible houseguests: ${context.eligible.join(', ')}

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT with the following structure:
{
  "nominee1": "[first houseguest name]",
  "nominee2": "[second houseguest name]",
  "reasoning": "[brief explanation of your decision]"
}

Give only the JSON object in your response, nothing else.
`;
        break;
      }
      
      case 'veto': {
        // Veto decision prompt
        basePrompt = `
You are ${context.botName}, the holder of the Power of Veto in Big Brother.

CONTEXT:
- You are playing competitively to win
- Current nominees: ${context.nominees.join(', ')}
- You ${context.isNominated ? 'ARE' : 'are NOT'} currently nominated
- Possible replacement nominees if you use the veto: ${context.possibleReplacements.join(', ')}

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT with the following structure:
{
  "useVeto": true/false,
  "vetoTarget": "[name of houseguest to remove from block, only if useVeto is true]",
  "replacementNominee": "[name of replacement, only needed if you're the HoH and useVeto is true]",
  "reasoning": "[brief explanation of your decision]"
}

Give only the JSON object in your response, nothing else.
`;
        break;
      }
      
      case 'eviction': {
        // Eviction vote prompt
        basePrompt = `
You are ${context.botName}, a houseguest voting in the Big Brother eviction ceremony.

CONTEXT:
- You are playing competitively to win
- Nominees on the block: ${context.nominees.join(', ')}

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT with the following structure:
{
  "vote": "[name of houseguest you want to EVICT]",
  "reasoning": "[brief explanation of your decision]"
}

Give only the JSON object in your response, nothing else.
`;
        break;
      }
      
      // Add other decision types as needed
      
      default:
        basePrompt = `
You are ${context.botName}, a houseguest in Big Brother making a ${decisionType} decision.
Consider the context and make a strategic choice.

CONTEXT:
${JSON.stringify(context, null, 2)}

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT appropriate for this decision type.
`;
    }
    
    return basePrompt;
  }
  
  private parseResponse(responseText: string, decisionType: string): any {
    try {
      // Extract JSON from the response (handle cases where there might be text before/after the JSON)
      const jsonPattern = /\{[\s\S]*\}/;
      const match = responseText.match(jsonPattern);
      
      if (!match) {
        throw new Error('No valid JSON found in the response');
      }
      
      const jsonStr = match[0];
      const result = JSON.parse(jsonStr);
      
      // Validate the result based on decision type
      this.validateDecision(result, decisionType);
      
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to parse AI response: ${error.message}`);
      this.logger.debug('Response text:', responseText);
      throw error;
    }
  }
  
  private validateDecision(decision: any, decisionType: string): void {
    switch (decisionType) {
      case 'nomination':
        if (!decision.nominee1 || !decision.nominee2) {
          throw new Error('Nomination decision missing nominees');
        }
        if (decision.nominee1 === decision.nominee2) {
          throw new Error('Cannot nominate the same houseguest twice');
        }
        break;
        
      case 'veto':
        if (typeof decision.useVeto !== 'boolean') {
          throw new Error('Veto decision missing useVeto field');
        }
        if (decision.useVeto && !decision.vetoTarget) {
          throw new Error('Veto decision missing vetoTarget');
        }
        break;
        
      case 'eviction':
        if (!decision.vote) {
          throw new Error('Eviction decision missing vote');
        }
        break;
        
      // Add validations for other decision types
    }
  }
  
  private generateFallbackDecision(decisionType: string, context: any): any {
    this.logger.warn(`Using fallback for ${decisionType} decision`);
    
    switch (decisionType) {
      case 'nomination': {
        // Simple fallback: nominate two random eligible houseguests
        const eligible = context.eligible || [];
        if (eligible.length < 2) {
          return { nominee1: null, nominee2: null, reasoning: 'Not enough eligible houseguests' };
        }
        
        // Randomly select two different houseguests
        const shuffled = [...eligible].sort(() => 0.5 - Math.random());
        return {
          nominee1: shuffled[0],
          nominee2: shuffled[1],
          reasoning: 'Fallback random nomination'
        };
      }
      
      case 'veto': {
        // Simple fallback: don't use veto unless self-preservation
        const isNominated = context.isNominated || false;
        return {
          useVeto: isNominated,
          vetoTarget: isNominated ? context.botName : null,
          replacementNominee: isNominated ? (context.possibleReplacements?.[0] || null) : null,
          reasoning: isNominated ? 'Self-preservation' : 'No strategic reason to use the veto'
        };
      }
      
      case 'eviction': {
        // Simple fallback: randomly vote for one of the nominees
        const nominees = context.nominees || [];
        if (nominees.length === 0) return { vote: null, reasoning: 'No nominees to vote for' };
        
        const randomNominee = nominees[Math.floor(Math.random() * nominees.length)];
        return {
          vote: randomNominee,
          reasoning: 'Fallback random vote'
        };
      }
      
      default:
        return { error: 'Unsupported decision type for fallback' };
    }
  }
}
