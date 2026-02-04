
/**
 * @file src/systems/ai/npc-social-behavior.ts
 * @description Autonomous NPC social behavior system
 */

import type { Houseguest } from '@/models/houseguest';
import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Logger } from '@/utils/logger';
import type { InteractionTracker } from './interaction-tracker';
import { config } from '@/config';
import type { PromiseType } from '@/models/promise';

// Config fallbacks for type safety
const NPC_ALLIANCE_MIN_RELATIONSHIP = (config as any).NPC_ALLIANCE_MIN_RELATIONSHIP ?? 25;
const NPC_ALLIANCE_MAX_PER_PERSON = (config as any).NPC_ALLIANCE_MAX_PER_PERSON ?? 3;
const NPC_PROMISE_THRESHOLD = (config as any).NPC_PROMISE_THRESHOLD ?? 30;
const NPC_ACTION_DELAY_MS = (config as any).NPC_ACTION_DELAY_MS ?? 1500;

export interface NPCAction {
  type: 'talk' | 'alliance_propose' | 'promise' | 'alliance_meeting' | 'spread_info';
  actor: Houseguest;
  target?: Houseguest;
  reasoning: string;
  priority: number;
  data?: Record<string, any>;
}

export interface NPCActionResult {
  action: NPCAction;
  success: boolean;
  description: string;
  relationshipChange?: number;
}

export interface NPCActivityItem {
  id: string;
  npcName: string;
  npcId: string;
  action: string;
  actionType: NPCAction['type'];
  targetName?: string;
  targetId?: string;
  timestamp: number;
  reasoning?: string;
}

/**
 * Get preferred actions based on personality trait
 */
function getTraitPreferences(trait: string): NPCAction['type'][] {
  switch (trait) {
    case 'Strategic':
      return ['alliance_propose', 'spread_info', 'talk'];
    case 'Loyal':
      return ['alliance_meeting', 'promise', 'talk'];
    case 'Sneaky':
      return ['spread_info', 'talk', 'alliance_propose'];
    case 'Social':
      return ['talk', 'alliance_meeting', 'promise'];
    case 'Competitive':
      return ['alliance_propose', 'talk', 'spread_info'];
    case 'Paranoid':
      return ['talk', 'spread_info'];
    case 'Emotional':
      return ['talk', 'promise', 'alliance_meeting'];
    case 'Floater':
      return ['talk', 'alliance_meeting'];
    case 'Confrontational':
      return ['talk', 'spread_info'];
    case 'Analytical':
      return ['alliance_propose', 'spread_info', 'talk'];
    default:
      return ['talk', 'alliance_propose', 'promise'];
  }
}

/**
 * Evaluate if an NPC wants to form an alliance with a target
 */
export function evaluateAllianceDesire(
  npc: Houseguest,
  target: Houseguest,
  game: BigBrotherGame,
  interactionTracker?: InteractionTracker
): { shouldPropose: boolean; score: number; reason: string } {
  // Get relationship
  const relationship = game.relationshipSystem?.getRelationship(npc.id, target.id) ?? 0;
  
  // Check current alliance count
  const npcAlliances = game.allianceSystem?.getAlliancesForHouseguest(npc.id) || [];
  const targetAlliances = game.allianceSystem?.getAlliancesForHouseguest(target.id) || [];
  
  // Already in same alliance?
  const alreadyAllied = game.allianceSystem?.areInSameAlliance(npc.id, target.id);
  if (alreadyAllied) {
    return { shouldPropose: false, score: 0, reason: 'Already allied' };
  }
  
  // Too many alliances
  if (npcAlliances.length >= NPC_ALLIANCE_MAX_PER_PERSON) {
    return { shouldPropose: false, score: 0, reason: 'Too many alliances' };
  }
  
  // Calculate shared threats (people they both have low relationships with)
  let sharedThreats = 0;
  const activeGuests = game.getActiveHouseguests();
  activeGuests.forEach(guest => {
    if (guest.id === npc.id || guest.id === target.id) return;
    const npcRel = game.relationshipSystem?.getRelationship(npc.id, guest.id) ?? 0;
    const targetRel = game.relationshipSystem?.getRelationship(target.id, guest.id) ?? 0;
    if (npcRel < -20 && targetRel < -20) {
      sharedThreats++;
    }
  });
  
  // Calculate strategic value
  const targetCompWins = (target.competitionsWon?.hoh || 0) + (target.competitionsWon?.pov || 0);
  const strategicValue = targetCompWins * 5 + target.stats.social * 3;
  
  // Get trust score from interaction history
  const trustScore = interactionTracker?.getTrustScore(npc.id, target.id) ?? 50;
  
  // Calculate overall score
  const score = 
    (relationship * 0.4) +
    (sharedThreats * 15) +
    (strategicValue * 0.15) +
    ((trustScore - 50) * 0.3) -
    (npcAlliances.length * 10);
  
  const shouldPropose = relationship >= NPC_ALLIANCE_MIN_RELATIONSHIP && score > 25;
  
  let reason = '';
  if (shouldPropose) {
    if (sharedThreats > 0) reason = `We share ${sharedThreats} common threats`;
    else if (strategicValue > 40) reason = `${target.name} is a strong competitor`;
    else reason = `Good relationship with ${target.name}`;
  } else {
    if (relationship < NPC_ALLIANCE_MIN_RELATIONSHIP) reason = 'Relationship too low';
    else reason = 'Not strategically beneficial';
  }
  
  return { shouldPropose, score, reason };
}

/**
 * Determine if an NPC should make a promise to a target
 */
export function shouldNPCMakePromise(
  npc: Houseguest,
  target: Houseguest,
  game: BigBrotherGame
): { shouldPromise: boolean; type: PromiseType; reason: string } {
  const relationship = game.relationshipSystem?.getRelationship(npc.id, target.id) ?? 0;
  
  // Check if NPC is on the block - desperate for votes
  if (npc.isNominated && !target.isNominated) {
    return { 
      shouldPromise: true, 
      type: 'vote', 
      reason: 'Seeking safety while on the block' 
    };
  }
  
  // Check if target is HoH and NPC isn't allied with them
  if (target.isHoH && !game.allianceSystem?.areInSameAlliance(npc.id, target.id)) {
    return { 
      shouldPromise: true, 
      type: 'safety', 
      reason: 'Securing safety with the HoH' 
    };
  }
  
  // Check for alliance formation opportunity (high relationship, not allied)
  if (relationship > NPC_PROMISE_THRESHOLD && 
      !game.allianceSystem?.areInSameAlliance(npc.id, target.id)) {
    return { 
      shouldPromise: true, 
      type: 'alliance_loyalty', 
      reason: 'Building foundation for alliance' 
    };
  }
  
  // Final 2 deal opportunity (very high relationship + late game)
  const activeCount = game.getActiveHouseguests().length;
  if (relationship > 60 && activeCount <= 6) {
    // Check if NPC already has a final 2 deal
    const existingF2 = game.promises?.find(p => 
      p.fromId === npc.id && 
      p.type === 'final_2' && 
      p.status === 'pending'
    );
    
    if (!existingF2) {
      return { 
        shouldPromise: true, 
        type: 'final_2', 
        reason: 'Forming final 2 alliance for endgame' 
      };
    }
  }
  
  return { shouldPromise: false, type: 'safety', reason: '' };
}

/**
 * Select the best target for a conversation
 */
function selectTalkTarget(npc: Houseguest, game: BigBrotherGame): Houseguest | null {
  const activeGuests = game.getActiveHouseguests().filter(g => g.id !== npc.id && !g.isPlayer);
  if (activeGuests.length === 0) return null;
  
  // Weight by relationship + some randomness
  const weighted = activeGuests.map(guest => {
    const relationship = game.relationshipSystem?.getRelationship(npc.id, guest.id) ?? 0;
    const weight = Math.max(1, relationship + 60); // Ensure positive weight
    return { guest, weight };
  });
  
  // Random selection weighted by relationship
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const { guest, weight } of weighted) {
    random -= weight;
    if (random <= 0) return guest;
  }
  
  return activeGuests[0];
}

/**
 * Generate a list of actions an NPC wants to take
 */
export function generateNPCActions(
  npc: Houseguest,
  game: BigBrotherGame,
  interactionTracker?: InteractionTracker
): NPCAction[] {
  const actions: NPCAction[] = [];
  const preferredActions = getTraitPreferences(npc.traits[0] || 'Balanced');
  const activeGuests = game.getActiveHouseguests().filter(g => g.id !== npc.id);
  
  // Check alliance opportunities
  activeGuests.forEach(target => {
    if (target.isPlayer) return; // Don't auto-ally with player
    
    const allianceEval = evaluateAllianceDesire(npc, target, game, interactionTracker);
    if (allianceEval.shouldPropose) {
      actions.push({
        type: 'alliance_propose',
        actor: npc,
        target,
        reasoning: allianceEval.reason,
        priority: 80 + (preferredActions.indexOf('alliance_propose') === 0 ? 10 : 0),
        data: { score: allianceEval.score }
      });
    }
  });
  
  // Check promise opportunities
  activeGuests.forEach(target => {
    if (target.isPlayer) return;
    
    const promiseEval = shouldNPCMakePromise(npc, target, game);
    if (promiseEval.shouldPromise) {
      actions.push({
        type: 'promise',
        actor: npc,
        target,
        reasoning: promiseEval.reason,
        priority: 70 + (promiseEval.type === 'vote' && npc.isNominated ? 20 : 0),
        data: { promiseType: promiseEval.type }
      });
    }
  });
  
  // Alliance meetings for existing alliances
  const npcAlliances = game.allianceSystem?.getAlliancesForHouseguest(npc.id) || [];
  npcAlliances.forEach(alliance => {
    // Check if meeting would be beneficial
    if (alliance.lastMeetingWeek === undefined || game.week - alliance.lastMeetingWeek >= 1) {
      actions.push({
        type: 'alliance_meeting',
        actor: npc,
        reasoning: `Touch base with ${alliance.name} alliance`,
        priority: 50,
        data: { allianceId: alliance.id, allianceName: alliance.name }
      });
    }
  });
  
  // General conversation
  const talkTarget = selectTalkTarget(npc, game);
  if (talkTarget) {
    actions.push({
      type: 'talk',
      actor: npc,
      target: talkTarget,
      reasoning: `Building relationship with ${talkTarget.name}`,
      priority: 30 + (preferredActions.indexOf('talk') === 0 ? 15 : 0)
    });
  }
  
  // Sort by priority (highest first)
  actions.sort((a, b) => b.priority - a.priority);
  
  return actions;
}

/**
 * Execute a single NPC action and return the result
 */
export function executeNPCAction(
  action: NPCAction,
  game: BigBrotherGame,
  logger: Logger,
  interactionTracker?: InteractionTracker
): NPCActionResult {
  const result: NPCActionResult = {
    action,
    success: false,
    description: ''
  };
  
  switch (action.type) {
    case 'talk': {
      if (!action.target) {
        result.description = 'No target for conversation';
        return result;
      }
      
      // Apply small relationship boost
      const boost = 3 + Math.floor(Math.random() * 3);
      game.relationshipSystem?.addRelationshipEvent(
        action.actor.id,
        action.target.id,
        'small_talk',
        `${action.actor.name} chatted with ${action.target.name}`,
        boost,
        true
      );
      
      // Track interaction
      interactionTracker?.trackInteraction(
        action.actor.id,
        action.target.id,
        'conversation',
        `${action.actor.name} had a conversation with ${action.target.name}`
      );
      
      result.success = true;
      result.description = `${action.actor.name} chatted with ${action.target.name}`;
      result.relationshipChange = boost;
      break;
    }
    
    case 'alliance_propose': {
      if (!action.target) {
        result.description = 'No target for alliance';
        return result;
      }
      
      // Check if target would accept
      const targetEval = evaluateAllianceDesire(action.target, action.actor, game, interactionTracker);
      
      if (targetEval.shouldPropose || targetEval.score > 15) {
        // Create the alliance
        const allianceName = generateAllianceName(action.actor, action.target);
        game.allianceSystem?.createAlliance(
          allianceName,
          [action.actor, action.target],
          action.actor,
          false // Secret alliance
        );
        
        // Track interaction
        interactionTracker?.trackInteraction(
          action.actor.id,
          action.target.id,
          'alliance_formed',
          `${action.actor.name} formed alliance "${allianceName}" with ${action.target.name}`
        );
        
        result.success = true;
        result.description = `${action.actor.name} formed an alliance "${allianceName}" with ${action.target.name}`;
        result.relationshipChange = 15;
      } else {
        result.description = `${action.target.name} declined ${action.actor.name}'s alliance proposal`;
      }
      break;
    }
    
    case 'promise': {
      if (!action.target || !action.data?.promiseType) {
        result.description = 'Invalid promise action';
        return result;
      }
      
      const promiseType = action.data.promiseType as PromiseType;
      const promiseDesc = getPromiseDescription(promiseType, action.actor, action.target);
      
      // Create the promise
      game.promiseSystem?.createPromise(
        action.actor.id,
        action.target.id,
        promiseType,
        promiseDesc
      );
      
      // Track interaction
      interactionTracker?.trackInteraction(
        action.actor.id,
        action.target.id,
        'promise_made',
        `${action.actor.name} promised ${action.target.name}: ${promiseDesc}`
      );
      
      result.success = true;
      result.description = `${action.actor.name} made a promise to ${action.target.name}: "${promiseDesc}"`;
      result.relationshipChange = 10;
      break;
    }
    
    case 'alliance_meeting': {
      const allianceId = action.data?.allianceId;
      const allianceName = action.data?.allianceName;
      
      if (!allianceId) {
        result.description = 'Invalid alliance meeting action';
        return result;
      }
      
      // Find the alliance and hold meeting
      const alliances = game.allianceSystem?.getAllAlliances() || [];
      const alliance = alliances.find(a => a.id === allianceId);
      
      if (alliance) {
        game.allianceSystem?.holdAllianceMeeting(alliance);
        
        result.success = true;
        result.description = `${action.actor.name} held a meeting with the ${allianceName} alliance`;
        result.relationshipChange = 3;
      } else {
        result.description = 'Alliance not found';
      }
      break;
    }
    
    case 'spread_info': {
      if (!action.target) {
        result.description = 'No target for information';
        return result;
      }
      
      // Find someone to gossip about
      const activeGuests = game.getActiveHouseguests().filter(g => 
        g.id !== action.actor.id && g.id !== action.target!.id
      );
      
      if (activeGuests.length === 0) {
        result.description = 'No one to gossip about';
        return result;
      }
      
      const gossipTarget = activeGuests[Math.floor(Math.random() * activeGuests.length)];
      
      // Track as rumor
      interactionTracker?.trackInteraction(
        action.actor.id,
        action.target.id,
        'rumor_spread',
        `${action.actor.name} shared information about ${gossipTarget.name} with ${action.target.name}`
      );
      
      result.success = true;
      result.description = `${action.actor.name} shared information about ${gossipTarget.name} with ${action.target.name}`;
      break;
    }
  }
  
  if (result.success) {
    logger.info(`NPC Action: ${result.description}`);
  }
  
  return result;
}

/**
 * Generate a creative alliance name
 */
function generateAllianceName(member1: Houseguest, member2: Houseguest): string {
  const prefixes = ['The', 'Team', 'Secret', 'Power', 'Silent'];
  const suffixes = ['Alliance', 'Duo', 'Pact', 'Squad', 'Connection'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  // Sometimes use initials
  if (Math.random() > 0.5) {
    return `${member1.name.charAt(0)}${member2.name.charAt(0)} ${suffix}`;
  }
  
  return `${prefix} ${suffix}`;
}

/**
 * Get a description for a promise type
 */
function getPromiseDescription(type: PromiseType, from: Houseguest, to: Houseguest): string {
  switch (type) {
    case 'safety':
      return `I won't nominate you if I win HoH`;
    case 'vote':
      return `I'll vote to keep you safe`;
    case 'final_2':
      return `I want to take you to the final 2`;
    case 'alliance_loyalty':
      return `I'll be loyal to our alliance`;
    case 'information':
      return `I'll share any game information I hear`;
    case 'veto_use':
      return `I'll use the veto on you if I win`;
    case 'hoh_protection':
      return `I'll protect you if I become HoH`;
    default:
      return `I'm making a commitment to you`;
  }
}

/**
 * Execute all NPC autonomous actions for a social phase
 */
export async function executeAllNPCActions(
  game: BigBrotherGame,
  logger: Logger,
  interactionTracker?: InteractionTracker,
  onActivityItem?: (item: NPCActivityItem) => void
): Promise<NPCActionResult[]> {
  const results: NPCActionResult[] = [];
  const npcs = game.getActiveHouseguests().filter(h => !h.isPlayer);
  const actionsPerNPC = config.NPC_ACTIONS_PER_SOCIAL_PHASE;
  
  for (const npc of npcs) {
    const actions = generateNPCActions(npc, game, interactionTracker);
    const topActions = actions.slice(0, actionsPerNPC);
    
    for (const action of topActions) {
      // Add delay between actions for visibility
      await new Promise(resolve => setTimeout(resolve, NPC_ACTION_DELAY_MS));
      
      const result = executeNPCAction(action, game, logger, interactionTracker);
      results.push(result);
      
      // Notify UI of activity
      if (onActivityItem && result.success) {
        onActivityItem({
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          npcName: action.actor.name,
          npcId: action.actor.id,
          action: result.description,
          actionType: action.type,
          targetName: action.target?.name,
          targetId: action.target?.id,
          timestamp: Date.now(),
          reasoning: action.reasoning
        });
      }
    }
  }
  
  return results;
}
