
/**
 * @file src/systems/ai/decision/decision-maker.ts
 * @description Main decision maker that coordinates the prompt generation and API calls
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import { AIApiClient } from '../api/api-client';
import { PromptGenerator } from '../prompts/prompt-generator';

export class DecisionMaker {
  private logger: Logger;
  private apiClient: AIApiClient;
  private promptGenerator: PromptGenerator;
  
  constructor(logger: Logger, apiKey: string) {
    this.logger = logger;
    this.apiClient = new AIApiClient(logger, apiKey);
    this.promptGenerator = new PromptGenerator(logger);
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
    return this.promptGenerator.generatePrompt(
      houseguest,
      decisionType,
      context,
      game,
      memories
    );
  }
  
  /**
   * Makes the actual API call to the LLM
   */
  async callLLMAPI(prompt: string): Promise<string> {
    return this.apiClient.callLLMAPI(prompt);
  }
}
