
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
      // First, try direct JSON parsing
      try {
        const data = JSON.parse(response);
        this.logger.debug("Direct JSON parsing succeeded");
        
        // Validate that required fields exist
        if (!data.reasoning || !data.decision) {
          throw new Error("Response missing required fields");
        }
        
        // Validate decision structure based on type
        this.validateDecisionStructure(data.decision, decisionType);
        return data;
      } catch (e) {
        this.logger.debug("Direct JSON parsing failed, attempting to extract JSON from text");
        
        // If direct parsing fails, try to extract JSON from the text response
        const jsonRegex = /\{[\s\S]*\}/g;
        const jsonMatches = response.match(jsonRegex);
        
        if (!jsonMatches || jsonMatches.length === 0) {
          throw new Error("No JSON object found in response");
        }
        
        // Try each match until we find valid JSON
        let validData: AIDecisionResponse | null = null;
        let lastError: Error | null = null;
        
        for (const jsonStr of jsonMatches) {
          try {
            const parsedData = JSON.parse(jsonStr);
            
            // Check if it has the expected structure
            if (parsedData.reasoning && parsedData.decision) {
              this.validateDecisionStructure(parsedData.decision, decisionType);
              validData = parsedData;
              break;
            }
          } catch (err: any) {
            lastError = err;
            continue;
          }
        }
        
        if (validData) {
          this.logger.debug("Successfully extracted valid JSON from response");
          return validData;
        }
        
        throw lastError || new Error("Failed to parse extracted JSON");
      }
    } catch (error: any) {
      this.logger.error(`Failed to parse API response: ${error.message}`, { 
        response: response.substring(0, 500) + (response.length > 500 ? "..." : "") 
      });
      throw new Error(`Invalid API response format: ${error.message}`);
    }
  }
  
  /**
   * Parses the API response into a structured decision
   */
  parseDecision(responseText: string, decisionType: string): any {
    try {
      const parsedResponse = this.parseAndValidateResponse(responseText, decisionType);
      return parsedResponse.decision;
    } catch (error) {
      this.logger.error(`Failed to parse decision: ${error}`);
      // Return a default empty decision object
      return {};
    }
  }
  
  /**
   * Validates the structure of the decision based on type
   */
  private validateDecisionStructure(decision: any, decisionType: string): void {
    this.logger.debug(`Validating decision structure for ${decisionType}`, decision);
    
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
      case 'dialogue':
        if (!decision.response) {
          throw new Error("Dialogue decision must include response");
        }
        if (!decision.tone) {
          throw new Error("Dialogue decision must include tone");
        }
        if (!decision.thoughts) {
          throw new Error("Dialogue decision must include thoughts");
        }
        // Validate tone is one of the acceptable values
        const validTones = ['friendly', 'strategic', 'cautious', 'deceptive', 'aggressive', 'dismissive', 'neutral'];
        if (!validTones.includes(decision.tone)) {
          this.logger.warn(`Invalid tone '${decision.tone}', defaulting to 'neutral'`);
          decision.tone = 'neutral';
        }
        break;
    }
    
    this.logger.debug(`Decision validation passed for ${decisionType}`);
  }
}
