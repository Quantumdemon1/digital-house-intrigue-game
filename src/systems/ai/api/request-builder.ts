
/**
 * @file src/systems/ai/api/request-builder.ts
 * @description Builds API requests for different LLM providers
 */

import type { Logger } from '@/utils/logger';
import { config } from '@/config';

export class RequestBuilder {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Builds a request payload for Gemini API
   */
  buildGeminiPayload(prompt: string): any {
    const payload = {
      contents: [{ 
        role: 'user', 
        parts: [{ text: prompt }] 
      }],
      generationConfig: {
        temperature: config.GEMINI_TEMPERATURE,
        maxOutputTokens: config.GEMINI_MAX_OUTPUT_TOKENS,
      }
    };
    
    this.logger.debug("Built Gemini payload", {
      temperature: config.GEMINI_TEMPERATURE,
      maxTokens: config.GEMINI_MAX_OUTPUT_TOKENS
    });
    
    return payload;
  }
  
  /**
   * Builds a request payload for OpenAI API (for future compatibility)
   */
  buildOpenAIPayload(prompt: string): any {
    // Placeholder for future OpenAI implementation
    return {
      model: "gpt-4o",
      messages: [
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
  }
}
