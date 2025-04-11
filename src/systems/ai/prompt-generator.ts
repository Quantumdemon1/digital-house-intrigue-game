
/**
 * @file src/systems/ai/prompt-generator.ts
 * @description Generates AI prompts based on game context
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
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
    // Get personality and mental state information
    const traits = houseguest.traits.join(", ");
    const mood = houseguest.mood || 'Neutral';
    const stressLevel = houseguest.stressLevel || 'Normal';
    const goals = houseguest.currentGoals?.join(", ") || "Playing a strategic game";
    
    // Base system message with enhanced personality and mental state
    let prompt = `You are ${houseguest.name}, a houseguest on Big Brother with a ${traits} personality.
Your current mood is ${mood} and your stress level is ${stressLevel}.
Your current goals are: ${goals}
You are making a ${decisionType} decision in week ${game.week}.

Context: ${JSON.stringify(context)}

Your memories:
${memories.length > 0 ? memories.join("\n") : "This is your first major decision in the game."}

Your internal thoughts:
${houseguest.internalThoughts && houseguest.internalThoughts.length > 0 
  ? houseguest.internalThoughts.slice(-3).join("\n") 
  : "I need to make smart decisions to advance in this game."}

Instructions:
- Based on your personality (${traits}), mood (${mood}), stress level (${stressLevel}), and the context, make a decision.
- Your mood and stress should significantly impact your decision making.
- Respond with ONLY a valid JSON object containing 'reasoning' (string) and 'decision' (object).
- The 'decision' object must have exactly the fields needed for ${decisionType}.

`;
    
    // Add mental state guidance based on mood and stress
    if (mood === 'Angry' || mood === 'Upset') {
      prompt += `Since you're ${mood}, you might be inclined to make more emotional or reactive decisions.
`;
    } else if (mood === 'Happy' || mood === 'Content') {
      prompt += `Since you're ${mood}, you might be more willing to take social risks or make generous decisions.
`;
    }
    
    if (stressLevel === 'Stressed' || stressLevel === 'Overwhelmed') {
      prompt += `Being ${stressLevel}, you're more likely to make defensive or protective decisions rather than optimal strategic ones.
`;
    } else if (stressLevel === 'Relaxed') {
      prompt += `Being ${stressLevel}, you have clarity to make well-thought-out strategic decisions.
`;
    }
    
    // Add personality-specific guidance
    houseguest.traits.forEach(trait => {
      switch (trait) {
        case 'Strategic':
          prompt += `As a Strategic player, you value making long-term game moves over emotional decisions.
`;
          break;
        case 'Social':
          prompt += `As a Social player, you prioritize building and maintaining relationships in your decisions.
`;
          break;
        case 'Competitive':
          prompt += `As a Competitive player, you're driven to win competitions and target other strong competitors.
`;
          break;
        case 'Loyal':
          prompt += `As a Loyal player, you highly value keeping your promises and protecting your allies.
`;
          break;
        case 'Sneaky':
          prompt += `As a Sneaky player, you're comfortable with deception if it advances your game.
`;
          break;
        case 'Confrontational':
          prompt += `As a Confrontational player, you're not afraid of making big moves that might create conflict.
`;
          break;
        case 'Emotional':
          prompt += `As an Emotional player, your feelings strongly influence your game decisions.
`;
          break;
        case 'Analytical':
          prompt += `As an Analytical player, you carefully weigh options and consider consequences before deciding.
`;
          break;
      }
    });

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
Your relationships with these houseguests: ${JSON.stringify(context.relationships || {})}
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
}
Your relationships with the nominees: ${JSON.stringify(context.relationships || {})}
`;
        break;
        
      case 'replacement':
        prompt += `For replacement nominee, your decision object must include:
{
  "decision": {
    "replacementNominee": "[name of replacement]"
  },
  "reasoning": "[explain your reasoning]"
}
Choose from the eligible houseguests: ${context.eligible?.join(', ')}
Your relationships with these houseguests: ${JSON.stringify(context.relationships || {})}`;
        break;
        
      case 'eviction_vote':
        prompt += `For eviction vote, your decision object must include:
{
  "decision": {
    "voteToEvict": "[name of nominee you're voting to evict]"
  },
  "reasoning": "[explain your reasoning]"
}
The nominees are: ${context.nominees?.join(', ')}
Your relationships with these nominees: ${JSON.stringify(context.relationships || {})}`;
        break;
        
      case 'jury_vote':
        prompt += `For jury vote, your decision object must include:
{
  "decision": {
    "voteForWinner": "[name of finalist you're voting for]"
  },
  "reasoning": "[explain your reasoning]"
}
The finalists are: ${context.finalists?.join(', ')}
Your relationships with these finalists: ${JSON.stringify(context.relationships || {})}`;
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
- Your response should reflect your ${traits} personality
- Your current mood (${mood}) and stress level (${stressLevel}) should significantly influence your tone
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
Consider these potential alliance members: ${context.eligibleNames?.join(', ')}
Your relationships with these potential members: ${JSON.stringify(context.relationships || {})}`;
        break;
        
      case 'alliance_response':
        prompt += `For alliance response, your decision object must include:
{
  "decision": {
    "accept": true/false
  },
  "reasoning": "[explain your decision]"
}
${context.proposer} has invited you to join alliance "${context.allianceName}" with ${context.memberNames?.join(', ')}
Your relationships with these people: ${JSON.stringify(context.relationships || {})}`;
        break;
    }
    
    this.logger.debug("Generated prompt for AI", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}
