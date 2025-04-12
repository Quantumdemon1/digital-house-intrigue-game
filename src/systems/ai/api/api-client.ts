
/**
 * @file src/systems/ai/api/api-client.ts
 * @description Streamlined API client for making LLM API calls
 */

import type { Logger } from '@/utils/logger';
import { config } from '@/config';
import { RequestBuilder } from './request-builder';
import { ResponseParser } from './response-parser';

export class AIApiClient {
  private logger: Logger;
  private apiKey: string;
  private requestBuilder: RequestBuilder;
  private responseParser: ResponseParser;
  
  constructor(logger: Logger, apiKey: string) {
    this.logger = logger;
    this.apiKey = apiKey;
    this.requestBuilder = new RequestBuilder(logger);
    this.responseParser = new ResponseParser(logger);
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
      
      // Use the request builder to create the payload
      const payload = this.requestBuilder.buildGeminiPayload(prompt);
      
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
      
      // Use the response parser to extract the text content
      const textContent = this.responseParser.parseGeminiResponse(data);
      this.logger.debug("API response text", { text: textContent.substring(0, 200) + "..." });
      
      return textContent;
    } catch (error: any) {
      this.logger.error(`API call error: ${error.message}`);
      throw error;
    }
  }
}
