
/**
 * @file src/systems/ai/prompts/social-prompts.ts
 * @description Prompt generators for social interactions and alliance decisions
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import { BasePromptGenerator } from './base-prompt-generator';

export class DialoguePromptGenerator extends BasePromptGenerator {
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // First get the base prompt
    let prompt = this.createBasePrompt(houseguest, decisionType, context, game, memories);
    
    // Add dialogue-specific instructions
    prompt += `For dialogue response, your decision object must include:
{
  "decision": {
    "response": "[what you say out loud]",
    "tone": "[friendly/strategic/cautious/deceptive/aggressive/dismissive/neutral]",
    "thoughts": "[your private thoughts about this interaction]"
  },
  "reasoning": "[explain your response choices]"
}

DIALOGUE CONTEXT:
You are in game phase: ${context.phase} during Week ${context.week}
The speaker is ${context.speakerName} who just said: "${context.message}"
Situation: ${context.situation || "A general conversation"}

${context.relationship ? `RELATIONSHIP WITH SPEAKER:
- Your feelings toward them: ${context.relationship.myFeelings} (${context.relationship.level})
- Their feelings toward you: ${context.relationship.theirFeelings}
- Reciprocity factor: ${context.relationship.reciprocityFactor} (higher means they like you more than you like them)`: ''}

${context.significantEvents && context.significantEvents.length > 0 ? `SIGNIFICANT EVENTS WITH SPEAKER:
${context.significantEvents.join('\n')}` : ''}

${context.recentEvents && context.recentEvents.length > 0 ? `RECENT GAME EVENTS:
${context.recentEvents.join('\n')}` : ''}

${context.gameContext ? `CURRENT GAME STATE:
- HoH: ${context.gameContext.hohName}
- Nominees: ${context.gameContext.nominees.join(', ')}
- POV Holder: ${context.gameContext.povWinner}` : ''}

DIALOGUE RESPONSE INSTRUCTIONS:
- Your response should reflect your ${houseguest.traits.join(', ')} personality
- Your current mood (${houseguest.mood || 'Neutral'}) and stress level (${houseguest.stressLevel || 'Normal'}) should significantly influence your tone
- Consider your relationship history with the speaker
- Your response MUST align with your game strategy and goals
- Consider being deceptive if it helps your game, especially if you have the 'Sneaky' trait
- Reference specific game events or past conversations where relevant
- Your "thoughts" should reveal your true feelings/strategy, which may differ from what you say
- Choose a tone that matches your personality, mood, and the situation:
  * friendly - warm, open, positive
  * strategic - game-focused, alliance-building
  * cautious - guarded, non-committal
  * deceptive - intentionally misleading
  * aggressive - confrontational, challenging
  * dismissive - uninterested, brushing off
  * neutral - balanced, even-toned`;
    
    this.logger.debug("Generated dialogue prompt", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}

export class AllianceProposalPromptGenerator extends BasePromptGenerator {
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // First get the base prompt
    let prompt = this.createBasePrompt(houseguest, decisionType, context, game, memories);
    
    // Add alliance proposal-specific instructions
    prompt += `For alliance proposal, your decision object must include:
{
  "decision": {
    "propose": true/false,
    "allianceName": "[creative alliance name if proposing]",
    "targetMemberNames": ["[name1]", "[name2]", ...] or null if not proposing
  },
  "reasoning": "[explain your decision]"
}
Consider these potential alliance members: ${context.eligibleNames?.join(', ')}
Your relationships with these potential members: ${JSON.stringify(context.relationships || {})}`;
    
    this.logger.debug("Generated alliance proposal prompt", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}

export class AllianceResponsePromptGenerator extends BasePromptGenerator {
  generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    // First get the base prompt
    let prompt = this.createBasePrompt(houseguest, decisionType, context, game, memories);
    
    // Add alliance response-specific instructions
    prompt += `For alliance response, your decision object must include:
{
  "decision": {
    "accept": true/false
  },
  "reasoning": "[explain your decision]"
}
${context.proposer} has invited you to join alliance "${context.allianceName}" with ${context.memberNames?.join(', ')}
Your relationships with these people: ${JSON.stringify(context.relationships || {})}`;
    
    this.logger.debug("Generated alliance response prompt", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}
