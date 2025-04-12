
/**
 * @file src/systems/ai/api/response-parser.ts
 * @description Parses API responses from different LLM providers
 */

import type { Logger } from '@/utils/logger';

export class ResponseParser {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Extracts text content from a Gemini API response
   */
  parseGeminiResponse(data: any): string {
    if (!data.candidates || 
        !data.candidates[0] || 
        !data.candidates[0].content || 
        !data.candidates[0].content.parts || 
        !data.candidates[0].content.parts[0]) {
      this.logger.error("Unexpected API response structure", data);
      throw new Error("Invalid API response structure");
    }
    
    return data.candidates[0].content.parts[0].text;
  }
  
  /**
   * Extracts text content from an OpenAI API response (for future compatibility)
   */
  parseOpenAIResponse(data: any): string {
    // Placeholder for future OpenAI implementation
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response structure");
    }
    
    return data.choices[0].message.content;
  }
}
