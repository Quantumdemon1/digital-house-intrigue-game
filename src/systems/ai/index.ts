
/**
 * @file src/systems/ai/index.ts
 * @description Exports all AI-related modules
 */

export { AIIntegrationSystem } from './ai-integration-system';
export { AIMemoryManager } from './memory-manager';
export { DecisionMaker } from './decision';
export { AIResponseParser, type AIDecisionResponse } from './response-parser';
export { AIFallbackGenerator } from './fallback-generator';
export { AIApiClient } from './api/api-client';
export { PromptGenerator } from './prompts/prompt-generator';
export { AIErrorHandler } from './error-handler';
export { AIDecisionHelper } from './decision-helper';
export { FallbackCoordinator } from './fallback-coordinator';

// NPC Intelligence System
export {
  getDecisionFactors,
  calculateDecisionScore,
  getTraitWeights,
  rankHouseguestsByScore,
  calculateAllianceLoyalty,
  calculatePromiseObligations,
  calculateStrategicValue,
  calculatePersonalityBias,
} from './npc-decision-engine';

export type { DecisionFactors, TraitWeights } from './npc-decision-engine';

export {
  calculateThreatLevel,
  getThreatBreakdown,
  rankByThreat,
  isMajorThreat,
  getThreatDescription,
  assessThreat,
} from './threat-assessment';

export type { ThreatBreakdown } from './threat-assessment';
