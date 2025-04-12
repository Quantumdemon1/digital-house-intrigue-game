
/**
 * @file src/systems/ai/prompts/prompt-factory.ts
 * @description Factory that creates the appropriate prompt generator for each decision type
 */

import type { Logger } from '@/utils/logger';
import { BasePromptGenerator } from './base-prompt-generator';
import { 
  NominationPromptGenerator,
  VetoPromptGenerator,
  ReplacementPromptGenerator,
  EvictionVotePromptGenerator,
  JuryVotePromptGenerator
} from './game-decision-prompts';
import {
  DialoguePromptGenerator,
  AllianceProposalPromptGenerator,
  AllianceResponsePromptGenerator
} from './social-prompts';

export class PromptGeneratorFactory {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Creates the appropriate prompt generator based on decision type
   */
  createPromptGenerator(decisionType: string): BasePromptGenerator {
    switch (decisionType) {
      case 'nomination':
        return new NominationPromptGenerator(this.logger);
      case 'veto':
        return new VetoPromptGenerator(this.logger);
      case 'replacement':
        return new ReplacementPromptGenerator(this.logger);
      case 'eviction_vote':
        return new EvictionVotePromptGenerator(this.logger);
      case 'jury_vote':
        return new JuryVotePromptGenerator(this.logger);
      case 'dialogue':
        return new DialoguePromptGenerator(this.logger);
      case 'alliance_proposal':
        return new AllianceProposalPromptGenerator(this.logger);
      case 'alliance_response':
        return new AllianceResponsePromptGenerator(this.logger);
      default:
        this.logger.warn(`No specific prompt generator for ${decisionType}, using dialogue generator`);
        return new DialoguePromptGenerator(this.logger);
    }
  }
}
