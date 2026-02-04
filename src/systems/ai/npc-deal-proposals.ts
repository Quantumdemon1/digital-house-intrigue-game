/**
 * @file src/systems/ai/npc-deal-proposals.ts
 * @description Generate NPC deal proposals for the player
 */

import type { BigBrotherGame } from '@/models/game/BigBrotherGame';
import type { Houseguest } from '@/models/houseguest';
import { NPCProposal, DealType, DEAL_TYPE_INFO } from '@/models/deal';

/**
 * Find a common threat between two houseguests
 */
function findCommonThreat(npc: Houseguest, player: Houseguest, game: BigBrotherGame): Houseguest | null {
  const activeGuests = game.getActiveHouseguests().filter(g => 
    g.id !== npc.id && g.id !== player.id
  );
  
  // Find someone both have negative relationships with
  for (const guest of activeGuests) {
    const npcRel = game.relationshipSystem?.getRelationship(npc.id, guest.id) ?? 0;
    const playerRel = game.relationshipSystem?.getRelationship(player.id, guest.id) ?? 0;
    
    // Both have somewhat negative relationships
    if (npcRel < -10 && playerRel < -5) {
      return guest;
    }
    
    // Or the guest is a competition threat
    const compWins = (guest.competitionsWon?.hoh || 0) + (guest.competitionsWon?.pov || 0);
    if (compWins >= 2 && (npcRel < 20 || playerRel < 20)) {
      return guest;
    }
  }
  
  return null;
}

/**
 * Create an NPC proposal
 */
function createProposal(
  npc: Houseguest,
  player: Houseguest,
  type: DealType,
  reasoning: string,
  game: BigBrotherGame,
  context?: { targetHouseguestId?: string }
): NPCProposal {
  const typeInfo = DEAL_TYPE_INFO[type];
  const target = context?.targetHouseguestId 
    ? game.getHouseguestById(context.targetHouseguestId) 
    : null;

  let description = typeInfo.description;
  if (target && type === 'target_agreement') {
    description = `Target ${target.name} if either wins HoH`;
  }

  return {
    id: `proposal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fromNPCId: npc.id,
    fromNPCName: npc.name,
    toPlayerId: player.id,
    deal: {
      type,
      title: typeInfo.title,
      description,
      proposerId: npc.id,
      recipientId: player.id,
      week: game.week,
      trustImpact: typeInfo.defaultTrustImpact,
      context
    },
    reasoning,
    timestamp: Date.now(),
    response: 'pending'
  };
}

/**
 * Generate proposals from a single NPC to the player
 */
function generateNPCProposals(
  npc: Houseguest,
  player: Houseguest,
  game: BigBrotherGame
): NPCProposal[] {
  const proposals: NPCProposal[] = [];
  const relationship = game.relationshipSystem?.getRelationship(npc.id, player.id) ?? 0;
  
  // Only propose if relationship is decent (at least neutral-ish)
  if (relationship < 10) return proposals;
  
  // Check various conditions for proposals
  
  // If NPC is on the block - desperate for votes
  if (npc.isNominated && relationship > 15) {
    proposals.push(createProposal(
      npc, player, 'vote_together',
      `I need your vote to stay. In return, I'll have your back next week.`,
      game
    ));
  }
  
  // If there's a common threat and relationship is good
  const commonThreat = findCommonThreat(npc, player, game);
  if (commonThreat && relationship > 25) {
    proposals.push(createProposal(
      npc, player, 'target_agreement',
      `${commonThreat.name} is getting too powerful. We should work together to get them out.`,
      game,
      { targetHouseguestId: commonThreat.id }
    ));
  }
  
  // Safety pact opportunity - if player is HoH or NPC is worried
  if (relationship > 35 && !game.allianceSystem?.areInSameAlliance(npc.id, player.id)) {
    if (player.isHoH) {
      proposals.push(createProposal(
        npc, player, 'safety_agreement',
        `Congratulations on HoH! How about we agree not to put each other up in the future?`,
        game
      ));
    }
  }
  
  // Partnership opportunity - good relationship, not allied
  if (relationship > 40 && !game.allianceSystem?.areInSameAlliance(npc.id, player.id)) {
    proposals.push(createProposal(
      npc, player, 'partnership',
      `I think we work well together. Want to officially partner up?`,
      game
    ));
  }
  
  // Late game final 2 deals
  const activeCount = game.getActiveHouseguests().length;
  if (relationship > 55 && activeCount <= 6) {
    // Check if NPC already has a final 2 deal with player
    const existingF2 = game.deals?.some(d => 
      d.type === 'final_two' && 
      d.status === 'active' &&
      ((d.proposerId === npc.id && d.recipientId === player.id) ||
       (d.proposerId === player.id && d.recipientId === npc.id))
    );
    
    if (!existingF2) {
      proposals.push(createProposal(
        npc, player, 'final_two',
        `We're getting close to the end. I want you with me in the final 2.`,
        game
      ));
    }
  }
  
  // Information sharing - sneaky or strategic NPCs
  if (npc.traits.includes('Sneaky') || npc.traits.includes('Strategic')) {
    if (relationship > 30) {
      proposals.push(createProposal(
        npc, player, 'information_sharing',
        `Let's share what we hear around the house. Information is power in this game.`,
        game
      ));
    }
  }
  
  return proposals;
}

/**
 * Generate all NPC proposals for the player this social phase
 * Limited to prevent overwhelming the player
 */
export function generateNPCProposalsForPlayer(game: BigBrotherGame): NPCProposal[] {
  const player = game.getActiveHouseguests().find(h => h.isPlayer);
  if (!player) return [];
  
  const allProposals: NPCProposal[] = [];
  const activeNPCs = game.getActiveHouseguests().filter(h => !h.isPlayer);
  
  // Generate proposals from each NPC
  for (const npc of activeNPCs) {
    const npcProposals = generateNPCProposals(npc, player, game);
    allProposals.push(...npcProposals);
  }
  
  // Sort by priority (based on relationship and type importance)
  allProposals.sort((a, b) => {
    const aRel = game.relationshipSystem?.getRelationship(a.fromNPCId, player.id) ?? 0;
    const bRel = game.relationshipSystem?.getRelationship(b.fromNPCId, player.id) ?? 0;
    
    // Prioritize urgent deals (vote_together when nominated)
    const aUrgent = a.deal.type === 'vote_together' ? 100 : 0;
    const bUrgent = b.deal.type === 'vote_together' ? 100 : 0;
    
    return (bRel + bUrgent) - (aRel + aUrgent);
  });
  
  // Limit to 2-3 proposals per social phase to prevent overwhelm
  const maxProposals = Math.min(3, Math.max(1, Math.floor(allProposals.length / 2)));
  
  // Select diverse proposal types
  const selectedProposals: NPCProposal[] = [];
  const usedTypes = new Set<DealType>();
  const usedNPCs = new Set<string>();
  
  for (const proposal of allProposals) {
    if (selectedProposals.length >= maxProposals) break;
    
    // Prefer variety in proposal types and NPCs
    if (!usedTypes.has(proposal.deal.type) || selectedProposals.length < 1) {
      if (!usedNPCs.has(proposal.fromNPCId) || allProposals.length <= maxProposals) {
        selectedProposals.push(proposal);
        usedTypes.add(proposal.deal.type);
        usedNPCs.add(proposal.fromNPCId);
      }
    }
  }
  
  return selectedProposals;
}
