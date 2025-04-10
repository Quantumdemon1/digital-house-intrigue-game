
/**
 * @file src/systems/ai/response-parser.ts
 * @description Parses and validates AI responses
 */

import type { Logger } from '@/utils/logger';

// Define standard response structure for AI decisions
export interface AIDecisionResponse {
  reasoning: string;
  decision: any; // Type varies based on decision type
  [key: string]: any; // Allow additional fields
}

export class AIResponseParser {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Parses and validates the API response
   */
  parseAndValidateResponse(response: string, decisionType: string): AIDecisionResponse {
    try {
      // Try to parse the response as JSON
      let data: AIDecisionResponse;
      
      try {
        data = JSON.parse(response);
      } catch (e) {
        // If it's not valid JSON, try to extract JSON from the text response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse JSON from response");
        }
      }
      
      // Validate that required fields exist
      if (!data.reasoning || !data.decision) {
        throw new Error("Response missing required fields");
      }
      
      // Validate decision structure based on type
      this.validateDecisionStructure(data.decision, decisionType);
      
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to parse API response: ${error.message}. Response: ${response}`);
      throw new Error(`Invalid API response format: ${error.message}`);
    }
  }
  
  /**
   * Validates the structure of the decision based on type
   */
  private validateDecisionStructure(decision: any, decisionType: string): void {
    switch (decisionType) {
      case 'nomination':
        if (!decision.nominee1 || !decision.nominee2) {
          throw new Error("Nomination decision must include nominee1 and nominee2");
        }
        break;
      case 'veto':
        if (typeof decision.useVeto !== 'boolean') {
          throw new Error("Veto decision must include useVeto (boolean)");
        }
        if (decision.useVeto && !decision.saveNominee) {
          throw new Error("When using veto, saveNominee must be provided");
        }
        break;
      case 'replacement':
        if (!decision.replacementNominee) {
          throw new Error("Replacement decision must include replacementNominee");
        }
        break;
      case 'eviction_vote':
        if (!decision.voteToEvict) {
          throw new Error("Eviction vote must include voteToEvict");
        }
        break;
      case 'jury_vote':
        if (!decision.voteForWinner) {
          throw new Error("Jury vote must include voteForWinner");
        }
        break;
    }
  }
}
