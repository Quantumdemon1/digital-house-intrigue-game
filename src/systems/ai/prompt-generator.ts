
/**
 * @file src/systems/ai/prompt-generator.ts
 * @description Generates AI prompts based on game context
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/BigBrotherGame';
import type { Logger } from '@/utils/logger';

export class PromptGenerator {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
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
}
