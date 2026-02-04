/**
 * @file src/hooks/useDealObligations.ts
 * @description Hook to detect active deals that may be violated by current game actions
 */

import { useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Deal, DealType, getDealTypeTitle, getDealTypeIcon } from '@/models/deal';
import { GamePhase } from '@/models/game-state';

export interface DealObligation {
  deal: Deal;
  partnerName: string;
  partnerId: string;
  warningMessage: string;
  consequence: string;
  severity: 'warning' | 'critical';
}

interface UseDealObligationsProps {
  phase: GamePhase;
  potentialTargetIds?: string[]; // IDs that might be affected (nominees, vote target, etc.)
}

export function useDealObligations({ phase, potentialTargetIds = [] }: UseDealObligationsProps): DealObligation[] {
  const { game, gameState } = useGame();
  
  return useMemo(() => {
    if (!game?.dealSystem) return [];
    
    const player = gameState.houseguests.find(h => h.isPlayer);
    if (!player) return [];
    
    const activeDeals = game.dealSystem.getActiveDeals(player.id);
    const obligations: DealObligation[] = [];
    
    for (const deal of activeDeals) {
      const partnerId = deal.proposerId === player.id ? deal.recipientId : deal.proposerId;
      const partner = gameState.houseguests.find(h => h.id === partnerId);
      if (!partner) continue;
      
      const obligation = checkDealForPhase(deal, phase, partnerId, partner.name, potentialTargetIds);
      if (obligation) {
        obligations.push(obligation);
      }
    }
    
    return obligations;
  }, [game?.dealSystem, gameState.houseguests, phase, potentialTargetIds]);
}

function checkDealForPhase(
  deal: Deal,
  phase: GamePhase,
  partnerId: string,
  partnerName: string,
  potentialTargetIds: string[]
): DealObligation | null {
  const icon = getDealTypeIcon(deal.type);
  const title = getDealTypeTitle(deal.type);
  
  switch (phase) {
    case 'Nomination':
      // Check safety_agreement - can't nominate partner
      if (deal.type === 'safety_agreement' && potentialTargetIds.includes(partnerId)) {
        return {
          deal,
          partnerId,
          partnerName,
          warningMessage: `${icon} You have a Safety Pact with ${partnerName}`,
          consequence: `Nominating them will break this deal and damage trust!`,
          severity: 'critical',
        };
      }
      
      // Check target_agreement - should nominate the agreed target
      if (deal.type === 'target_agreement' && deal.context?.targetHouseguestId) {
        const shouldTarget = deal.context.targetHouseguestId;
        if (!potentialTargetIds.includes(shouldTarget)) {
          return {
            deal,
            partnerId,
            partnerName,
            warningMessage: `${icon} You have a Target Agreement with ${partnerName}`,
            consequence: `You agreed to target a specific houseguest if you win HoH`,
            severity: 'warning',
          };
        }
      }
      break;
      
    case 'PoVMeeting':
      // Check veto_use - should use veto on partner if they're nominated
      if (deal.type === 'veto_use' && potentialTargetIds.includes(partnerId)) {
        return {
          deal,
          partnerId,
          partnerName,
          warningMessage: `${icon} You have a Veto Commitment with ${partnerName}`,
          consequence: `You promised to use the Veto on them if they're on the block`,
          severity: 'critical',
        };
      }
      break;
      
    case 'Eviction':
      // Check vote_together - should vote with partner
      if (deal.type === 'vote_together') {
        return {
          deal,
          partnerId,
          partnerName,
          warningMessage: `${icon} You have a Voting Block with ${partnerName}`,
          consequence: `You agreed to vote together this week`,
          severity: 'warning',
        };
      }
      break;
      
    case 'FinalHoH':
      // Check final_two - should take partner to final 2
      if (deal.type === 'final_two') {
        return {
          deal,
          partnerId,
          partnerName,
          warningMessage: `${icon} You have a Final Two deal with ${partnerName}`,
          consequence: `Breaking this deal would be a major betrayal!`,
          severity: 'critical',
        };
      }
      break;
  }
  
  return null;
}

export default useDealObligations;
