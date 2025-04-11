
/**
 * @file src/systems/ai/api-client.ts
 * @description Handles API calls to LLM providers
 */

import type { Logger } from '@/utils/logger';
import { config } from '@/config';

export class AIApiClient {
  private logger: Logger;
  private apiKey: string;
  
  constructor(logger: Logger, apiKey: string) {
    this.logger = logger;
    this.apiKey = apiKey;
  }
  
  /**
   * Makes the actual API call to the LLM
   */
  async callLLMAPI(prompt: string): Promise<string> {
    // Use fallback for testing/development environments
    if (!this.apiKey || config.FORCE_FALLBACK_MODE) {
      this.logger.warn("No API key provided or fallback mode active. Using fallback decision generator");
      throw new Error("Using fallback decision generator");
    }
    
    this.logger.info(`AI Request PREPARED for Gemini API`);
    
    try {
      const endpoint = config.GEMINI_API_ENDPOINT;
      
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
      
      // Log request details for debugging
      this.logger.debug("API request payload", {
        endpoint: endpoint
      });
      
      const response = await fetch(`${endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API Error: ${response.status} ${response.statusText}`, { errorText });
        throw new Error(`API call failed: ${response.statusText} (${response.status})`);
      }
      
      const data = await response.json();
      this.logger.info(`AI Raw Response Received from Gemini API`);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        this.logger.error("Unexpected API response structure", data);
        throw new Error("Invalid API response structure");
      }
      
      const textContent = data.candidates[0].content.parts[0].text;
      this.logger.debug("API response text", { text: textContent.substring(0, 200) + "..." });
      
      return textContent;
    } catch (error: any) {
      this.logger.error(`API call error: ${error.message}`);
      throw error;
    }
  }
}
