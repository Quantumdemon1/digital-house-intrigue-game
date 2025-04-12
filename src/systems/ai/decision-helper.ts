
/**
 * @file src/systems/ai/decision-helper.ts
 * @description Enhanced helper for AI decision making
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import { DecisionContextBuilder } from './decision/context-builder';
import { DecisionValidator } from './decision/validator';
import { ReplacementContextBuilder } from './decision/replacement-context-builder';
import { ReplacementValidator } from './decision/replacement-validator';
import { AIResponseParser, AIDecisionResponse } from './response-parser';

export class AIDecisionHelper {
  private logger: Logger;
  private contextBuilder: DecisionContextBuilder;
  private validator: DecisionValidator;
  private replacementContextBuilder: ReplacementContextBuilder;
  private replacementValidator: ReplacementValidator;
  
  constructor(logger: Logger) {
    this.logger = logger;
    this.contextBuilder = new DecisionContextBuilder(logger);
    this.validator = new DecisionValidator(logger);
    this.replacementContextBuilder = new ReplacementContextBuilder(logger);
    this.replacementValidator = new ReplacementValidator(logger);
  }

  /**
   * Builds appropriate context based on decision type
   */
  buildContext(
    decisionType: string, 
    houseguest: Houseguest, 
    game: BigBrotherGame,
    additionalParams?: Record<string, any>
  ): any {
    switch (decisionType) {
      case 'nomination':
        return this.contextBuilder.buildNominationContext(houseguest, game);
      case 'veto':
        return this.contextBuilder.buildVetoContext(houseguest, game);
      case 'replacement':
        if (!additionalParams?.savedNominee) {
          this.logger.error('Missing savedNominee for replacement context');
          return {};
        }
        return this.replacementContextBuilder.buildReplacementContext(
          houseguest, 
          additionalParams.savedNominee, 
          game
        );
      default:
        this.logger.warn(`Unknown decision type: ${decisionType}`);
        return {};
    }
  }

  /**
   * Validates decision based on type
   */
  validateDecision(
    decisionType: string, 
    decision: any, 
    game: BigBrotherGame,
    additionalParams?: Record<string, any>
  ): boolean {
    switch (decisionType) {
      case 'nomination':
        return this.validator.validateNominationDecision(decision, game);
      case 'veto':
        return this.validator.validateVetoDecision(decision, game);
      case 'replacement':
        if (!additionalParams?.savedNomineeId) {
          this.logger.error('Missing savedNomineeId for replacement validation');
          return false;
        }
        return this.replacementValidator.validateReplacementDecision(
          decision, 
          game, 
          additionalParams.savedNomineeId
        );
      default:
        this.logger.warn(`Unknown decision type: ${decisionType}`);
        return false;
    }
  }

  /**
   * Process the AI response into a structured decision
   */
  parseDecision(
    decisionType: string, 
    responseText: string
  ): any {
    const parser = new AIResponseParser(this.logger);
    return parser.parseAndValidateResponse(responseText, decisionType).decision;
  }
  
  /**
   * Sets up enhanced logging for AI decisions
   */
  setupEnhancedLogger(game: BigBrotherGame): void {
    // Configure any enhanced logging needed for the game instance
    this.logger.debug("Enhanced AI decision logging configured");
  }
  
  /**
   * Log AI decision with detailed information
   */
  logAIDecision(
    houseguest: Houseguest, 
    decisionType: string, 
    parsedResponse: AIDecisionResponse,
    game: BigBrotherGame
  ): void {
    this.logger.info(`AI Decision by ${houseguest.name}`, {
      type: decisionType,
      decision: parsedResponse.decision,
      reasoning: parsedResponse.reasoning ? parsedResponse.reasoning.substring(0, 100) + "..." : "No reasoning provided"
    });
    
    // Additional logging could be added here based on decision type
  }
}
