
/**
 * @file src/systems/ai/prompts/game-decision-prompts.ts
 * @description Prompt generators for game decisions (nominations, veto, etc.)
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import { BasePromptGenerator } from './base-prompt-generator';

export class NominationPromptGenerator extends BasePromptGenerator {
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // First get the base prompt
    let prompt = this.createBasePrompt(houseguest, decisionType, context, game, memories);
    
    // Add nomination-specific instructions
    prompt += `For nominations, your decision object must include:
{
  "decision": {
    "nominee1": "[name of first nominee]",
    "nominee2": "[name of second nominee]"
  },
  "reasoning": "[explain your reasoning]"
}
Choose from the eligible houseguests: ${context.eligible?.join(', ')}
Your relationships with these houseguests: ${JSON.stringify(context.relationships || {})}
`;
    
    this.logger.debug("Generated nomination prompt", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}

export class VetoPromptGenerator extends BasePromptGenerator {
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // First get the base prompt
    let prompt = this.createBasePrompt(houseguest, decisionType, context, game, memories);
    
    // Add veto-specific instructions
    prompt += `For veto decision, your decision object must include:
{
  "decision": {
    "useVeto": true/false,
    "saveNominee": "[name of nominee to save, if using veto]"
  },
  "reasoning": "[explain your reasoning]"
}
Your relationships with the nominees: ${JSON.stringify(context.relationships || {})}
`;
    
    this.logger.debug("Generated veto prompt", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}

export class ReplacementPromptGenerator extends BasePromptGenerator {
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // First get the base prompt
    let prompt = this.createBasePrompt(houseguest, decisionType, context, game, memories);
    
    // Add replacement nominee-specific instructions
    prompt += `For replacement nominee, your decision object must include:
{
  "decision": {
    "replacementNominee": "[name of replacement]"
  },
  "reasoning": "[explain your reasoning]"
}
Choose from the eligible houseguests: ${context.eligible?.join(', ')}
Your relationships with these houseguests: ${JSON.stringify(context.relationships || {})}`;
    
    this.logger.debug("Generated replacement prompt", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}

export class EvictionVotePromptGenerator extends BasePromptGenerator {
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // First get the base prompt
    let prompt = this.createBasePrompt(houseguest, decisionType, context, game, memories);
    
    // Add eviction vote-specific instructions
    prompt += `For eviction vote, your decision object must include:
{
  "decision": {
    "voteToEvict": "[name of nominee you're voting to evict]"
  },
  "reasoning": "[explain your reasoning]"
}
The nominees are: ${context.nominees?.join(', ')}
Your relationships with these nominees: ${JSON.stringify(context.relationships || {})}`;
    
    this.logger.debug("Generated eviction vote prompt", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}

export class JuryVotePromptGenerator extends BasePromptGenerator {
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // First get the base prompt
    let prompt = this.createBasePrompt(houseguest, decisionType, context, game, memories);
    
    // Add jury vote-specific instructions
    prompt += `For jury vote, your decision object must include:
{
  "decision": {
    "voteForWinner": "[name of finalist you're voting for]"
  },
  "reasoning": "[explain your reasoning]"
}
The finalists are: ${context.finalists?.join(', ')}
Your relationships with these finalists: ${JSON.stringify(context.relationships || {})}`;
    
    this.logger.debug("Generated jury vote prompt", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}
