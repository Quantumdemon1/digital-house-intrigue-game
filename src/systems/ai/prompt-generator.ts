
/**
 * @file src/systems/ai/prompt-generator.ts
 * @description Main prompt generator that delegates to specialized generators
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import { PromptGeneratorFactory } from './prompts/prompt-factory';

export class PromptGenerator {
  private logger: Logger;
  private factory: PromptGeneratorFactory;
  
  constructor(logger: Logger) {
    this.logger = logger;
    this.factory = new PromptGeneratorFactory(logger);
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
    // Create the appropriate prompt generator for this decision type
    const generator = this.factory.createPromptGenerator(decisionType);
    
    // Generate the prompt using the specialized generator
    const prompt = generator.generatePrompt(
      houseguest,
      decisionType,
      context,
      game,
      memories
    );
    
    this.logger.debug("Generated prompt for AI", { prompt: prompt.substring(0, 200) + "..." });
    return prompt;
  }
}
