
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
  "decision": {
    "nominee1": "[name of first nominee]",
    "nominee2": "[name of second nominee]"
  },
  "reasoning": "[explain your reasoning]"
}
Choose from the eligible houseguests: ${context.eligible?.join(', ')}
`;
        break;
        
      case 'veto':
        prompt += `For veto decision, your decision object must include:
{
  "decision": {
    "useVeto": true/false,
    "saveNominee": "[name of nominee to save, if using veto]"
  },
  "reasoning": "[explain your reasoning]"
}`;
        break;
        
      case 'replacement':
        prompt += `For replacement nominee, your decision object must include:
{
  "decision": {
    "replacementNominee": "[name of replacement]"
  },
  "reasoning": "[explain your reasoning]"
}
Choose from the eligible houseguests: ${context.eligible?.join(', ')}`;
        break;
        
      case 'eviction_vote':
        prompt += `For eviction vote, your decision object must include:
{
  "decision": {
    "voteToEvict": "[name of nominee you're voting to evict]"
  },
  "reasoning": "[explain your reasoning]"
}
The nominees are: ${context.nominees?.join(', ')}`;
        break;
        
      case 'jury_vote':
        prompt += `For jury vote, your decision object must include:
{
  "decision": {
    "voteForWinner": "[name of finalist you're voting for]"
  },
  "reasoning": "[explain your reasoning]"
}
The finalists are: ${context.finalists?.join(', ')}`;
        break;
        
      case 'dialogue':
        prompt += `For dialogue response, your decision object must include:
{
  "decision": {
    "response": "[what you say out loud]",
    "tone": "[friendly/strategic/cautious/deceptive/aggressive/dismissive/neutral]",
    "thoughts": "[your private thoughts about this interaction]"
  },
  "reasoning": "[explain your response choices]"
}
The conversation context: ${context.situation}
The speaker just said: "${context.message}"`;
        break;
        
      case 'alliance_proposal':
        prompt += `For alliance proposal, your decision object must include:
{
  "decision": {
    "propose": true/false,
    "allianceName": "[creative alliance name if proposing]",
    "targetMemberNames": ["[name1]", "[name2]", ...] or null if not proposing
  },
  "reasoning": "[explain your decision]"
}
Consider these potential alliance members: ${context.eligibleNames?.join(', ')}`;
        break;
        
      case 'alliance_response':
        prompt += `For alliance response, your decision object must include:
{
  "decision": {
    "accept": true/false
  },
  "reasoning": "[explain your decision]"
}
${context.proposer} has invited you to join alliance "${context.allianceName}" with ${context.memberNames?.join(', ')}`;
        break;
    }
    
    this.logger.debug("Generated prompt for AI", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
  
  /**
   * Makes the actual API call to the LLM
   */
  async callLLMAPI(prompt: string): Promise<string> {
    // SIMULATE API FAILURE FOR TESTING
    this.logger.warn("⚠️ SIMULATING API FAILURE FOR TESTING FALLBACK LOGIC ⚠️");
    throw new Error("Simulated API Fail - Testing Fallback Logic");
    
    /* Original implementation - commented out for testing
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
        endpoint: endpoint
      });
      
      const response = await fetch(`${endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API Error: ${response.status} ${response.statusText}`, { errorText });
        throw new Error(`API call failed: ${response.statusText} (${response.status})`);
      }
      
      const data = await response.json();
      this.logger.info(`AI Raw Response Received from Gemini API`);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        this.logger.error("Unexpected API response structure", data);
        throw new Error("Invalid API response structure");
      }
      
      const textContent = data.candidates[0].content.parts[0].text;
      this.logger.debug("API response text", { text: textContent.substring(0, 200) + "..." });
      
      return textContent;
    } catch (error: any) {
      this.logger.error(`API call error: ${error.message}`);
      throw error;
    }
    */
  }
}
