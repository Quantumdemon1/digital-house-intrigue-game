
/**
 * @file src/systems/ai/prompts/base-prompt-generator.ts
 * @description Base class for prompt generation
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';

export abstract class BasePromptGenerator {
  protected logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Generates personality-specific guidance based on houseguest traits
   */
  protected generatePersonalityGuidance(houseguest: Houseguest): string {
    let guidance = '';
    
    houseguest.traits.forEach(trait => {
      switch (trait) {
        case 'Strategic':
          guidance += `As a Strategic player, you value making long-term game moves over emotional decisions.\n`;
          break;
        case 'Social':
          guidance += `As a Social player, you prioritize building and maintaining relationships in your decisions.\n`;
          break;
        case 'Competitive':
          guidance += `As a Competitive player, you're driven to win competitions and target other strong competitors.\n`;
          break;
        case 'Loyal':
          guidance += `As a Loyal player, you highly value keeping your promises and protecting your allies.\n`;
          break;
        case 'Sneaky':
          guidance += `As a Sneaky player, you're comfortable with deception if it advances your game.\n`;
          break;
        case 'Confrontational':
          guidance += `As a Confrontational player, you're not afraid of making big moves that might create conflict.\n`;
          break;
        case 'Emotional':
          guidance += `As an Emotional player, your feelings strongly influence your game decisions.\n`;
          break;
        case 'Analytical':
          guidance += `As an Analytical player, you carefully weigh options and consider consequences before deciding.\n`;
          break;
      }
    });
    
    return guidance;
  }

  /**
   * Generates mental state guidance based on houseguest mood and stress
   */
  protected generateMentalStateGuidance(houseguest: Houseguest): string {
    let guidance = '';
    const mood = houseguest.mood || 'Neutral';
    const stressLevel = houseguest.stressLevel || 'Normal';
    
    if (mood === 'Angry' || mood === 'Upset') {
      guidance += `Since you're ${mood}, you might be inclined to make more emotional or reactive decisions.\n`;
    } else if (mood === 'Happy' || mood === 'Content') {
      guidance += `Since you're ${mood}, you might be more willing to take social risks or make generous decisions.\n`;
    }
    
    if (stressLevel === 'Stressed' || stressLevel === 'Overwhelmed') {
      guidance += `Being ${stressLevel}, you're more likely to make defensive or protective decisions rather than optimal strategic ones.\n`;
    } else if (stressLevel === 'Relaxed') {
      guidance += `Being ${stressLevel}, you have clarity to make well-thought-out strategic decisions.\n`;
    }
    
    return guidance;
  }

  /**
   * Creates a base prompt with houseguest context
   */
  protected createBasePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string {
    const traits = houseguest.traits.join(", ");
    const mood = houseguest.mood || 'Neutral';
    const stressLevel = houseguest.stressLevel || 'Normal';
    const goals = houseguest.currentGoals?.join(", ") || "Playing a strategic game";
    
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

    // Add mental state and personality guidance
    prompt += this.generateMentalStateGuidance(houseguest);
    prompt += this.generatePersonalityGuidance(houseguest);
    
    return prompt;
  }

  /**
   * Abstract method that must be implemented by each specific prompt generator
   */
  abstract generatePrompt(
    houseguest: Houseguest,
    decisionType: string,
    context: any,
    game: BigBrotherGame,
    memories: string[]
  ): string;
}
