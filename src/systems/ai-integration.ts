
/**
 * @file src/systems/ai-integration.ts
 * @description Re-exports AI integration system for backward compatibility
 */

export { AIIntegrationSystem } from './ai/ai-integration-system';
export type { AIDecisionResponse } from './ai/response-parser';
export { AIErrorHandler } from './ai/error-handler';
export { AIDecisionHelper } from './ai/decision-helper';
export { FallbackCoordinator } from './ai/fallback-coordinator';
