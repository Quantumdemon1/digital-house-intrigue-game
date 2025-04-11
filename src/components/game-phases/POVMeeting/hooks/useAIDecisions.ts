
import { useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { GameState } from '@/contexts/types/game-context-types';

interface UseAIDecisionsProps {
  meetingStage: 'initial' | 'selectSaved' | 'selectReplacement' | 'complete';
  povHolder: Houseguest | null;
  nominees: Houseguest[];
  hoh: Houseguest | null;
  useVeto: boolean | null;
  savedNominee: Houseguest | null;
  replacementNominee: Houseguest | null;
  handleVetoDecision: (decision: boolean) => void;
  handleSaveNominee: (nominee: Houseguest) => void;
  handleSelectReplacement: (replacement: Houseguest) => void;
  activeHouseguests: Houseguest[];
  gameState: GameState;
}

export const useAIDecisions = ({
  meetingStage,
  povHolder,
  nominees,
  hoh,
  useVeto,
  savedNominee,
  replacementNominee,
  handleVetoDecision,
  handleSaveNominee,
  handleSelectReplacement,
  activeHouseguests,
  gameState
}: UseAIDecisionsProps) => {
  // Fast forward handler
  useEffect(() => {
    const handleFastForward = () => {
      const unsubscribe = document.addEventListener('game:fastForward', () => {
        if (meetingStage === 'initial' && povHolder && !povHolder.isPlayer) {
          // Simulate POV holder decision
          let decision = false;
          
          // POV holder saves self if nominated
          if (povHolder.isNominated) {
            decision = true;
            handleVetoDecision(true);
          } else {
            // Decide based on relationship with nominees
            const relationships = nominees.map(nominee => {
              const relationshipsForGuest = gameState.relationships.get(povHolder.id);
              if (relationshipsForGuest) {
                const relation = relationshipsForGuest.get(nominee.id);
                return relation ? relation.score : 0;
              }
              return 0;
            });
            
            // If any relationship is > 30, use veto
            const bestRelationship = Math.max(...relationships);
            if (bestRelationship > 30) {
              decision = true;
              handleVetoDecision(true);
            } else {
              decision = false;
              handleVetoDecision(false);
            }
          }
        }
      });
      
      return () => document.removeEventListener('game:fastForward', unsubscribe as any);
    };
    
    return handleFastForward();
  }, [meetingStage, povHolder, nominees, gameState.relationships, handleVetoDecision]);

  // AI decision logic for non-player POV holder
  useEffect(() => {
    if (
      meetingStage === 'initial' && 
      povHolder && 
      !povHolder.isPlayer && 
      useVeto === null
    ) {
      let decision = false;
      
      if (povHolder.isNominated) {
        decision = true;
      } else {
        const getRelationshipWithNominees = () => {
          let bestRelationship = -101;
          let bestNominee = null;
          
          for (const nominee of nominees) {
            if (gameState.relationships.has(povHolder.id)) {
              const relMap = gameState.relationships.get(povHolder.id);
              if (relMap && relMap.has(nominee.id)) {
                const rel = relMap.get(nominee.id)?.score || 0;
                if (rel > bestRelationship) {
                  bestRelationship = rel;
                  bestNominee = nominee;
                }
              }
            }
          }
          
          return { bestNominee, bestRelationship };
        };
        
        const { bestNominee, bestRelationship } = getRelationshipWithNominees();
        
        if (bestRelationship > 30 && bestNominee) {
          decision = true;
          setTimeout(() => handleSaveNominee(bestNominee), 1500);
        } else {
          decision = false;
        }
      }
      
      setTimeout(() => handleVetoDecision(decision), 2000);
    }
  }, [meetingStage, povHolder, useVeto, nominees, handleSaveNominee, handleVetoDecision, gameState.relationships]);
  
  // AI decision logic for non-player HOH selecting replacement nominee
  useEffect(() => {
    if (
      meetingStage === 'selectReplacement' && 
      savedNominee && 
      hoh && 
      !hoh.isPlayer && 
      !replacementNominee
    ) {
      const eligibleReplacements = activeHouseguests.filter(houseguest => 
        !houseguest.isHoH && 
        !houseguest.isNominated && 
        houseguest.id !== savedNominee.id && 
        !houseguest.isPovHolder
      );
      
      if (eligibleReplacements.length > 0) {
        let worstRelationship = 101;
        let worstHouseguest = eligibleReplacements[0];
        
        for (const houseguest of eligibleReplacements) {
          if (gameState.relationships.has(hoh.id)) {
            const relMap = gameState.relationships.get(hoh.id);
            if (relMap && relMap.has(houseguest.id)) {
              const rel = relMap.get(houseguest.id)?.score || 0;
              if (rel < worstRelationship) {
                worstRelationship = rel;
                worstHouseguest = houseguest;
              }
            }
          }
        }
        
        setTimeout(() => handleSelectReplacement(worstHouseguest), 2500);
      }
    }
  }, [meetingStage, savedNominee, hoh, replacementNominee, activeHouseguests, handleSelectReplacement, gameState.relationships]);
};
