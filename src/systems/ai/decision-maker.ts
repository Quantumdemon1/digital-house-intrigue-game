
/**
 * @file src/systems/ai/decision-maker.ts
 * @description Handles AI decision making logic and API calls
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import { config } from '@/config';

export class AIDecisionMaker {
  private logger: Logger;
  private apiKey: string;
  
  constructor(logger: Logger, apiKey: string) {
    this.logger = logger;
    this.apiKey = apiKey;
  }

  /**
   * Generates a prompt for the API based on the decision type and context
   */
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // Base system message
    let prompt = `You are ${houseguest.name}, a houseguest on Big Brother with a ${houseguest.traits[0] || 'balanced'} personality.
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
  async callLLMAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      this.logger.warn("No API key provided for LLM call. Using fallback decision.");
      throw new Error("No API key provided for LLM call");
    }
    
    this.logger.info(`AI Request PREPARED for Gemini API`);
    
    try {
      const endpoint = config.GEMINI_API_ENDPOINT;
      
      const payload = {
        contents: [{ 
          role: 'user', 
          parts: [{ text: prompt }] 
        }],
        generationConfig: {
          temperature: config.GEMINI_TEMPERATURE,
          maxOutputTokens: config.GEMINI_MAX_OUTPUT_TOKENS,
        }
      };
      
      // Log request details for debugging
      this.logger.debug("API request payload", {
        endpoint: endpoint,
        payload: payload
      });
      
      const response = await fetch(`${endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error(`Gemini API Error: ${response.status} ${response.statusText}`, errorData);
        throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.logger.info(`AI Raw Response Received from Gemini API`);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        this.logger.error("Unexpected API response structure", data);
        throw new Error("Invalid API response structure");
      }
      
      const textContent = data.candidates[0].content.parts[0].text;
      this.logger.debug("API response text", { text: textContent });
      
      return textContent;
    } catch (error: any) {
      this.logger.error(`API call error: ${error.message}`);
      throw error;
    }
  }
}
