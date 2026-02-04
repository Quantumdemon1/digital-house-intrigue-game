/**
 * @file src/systems/ai/npc-intelligence.ts
 * @description Central export for NPC intelligence systems
 */

export { 
  getDecisionFactors,
  calculateDecisionScore,
  getTraitWeights,
  rankHouseguestsByScore,
  calculateAllianceLoyalty,
  calculateDealObligations,
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
