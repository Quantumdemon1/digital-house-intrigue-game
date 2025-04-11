
import { useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { GameState } from '@/contexts/types/game-context-types';
import { config } from '@/config';
import { RelationshipEventType } from '@/models/relationship-event';

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
      
      // Always use veto if nominated
      if (povHolder.isNominated) {
        decision = true;
        setTimeout(() => handleVetoDecision(decision), 2000);
        return;
      }
      
      // For each nominee, check relationship scores and significant events
      const nomineeData = nominees.map(nominee => {
        const relMap = gameState.relationships.get(povHolder.id);
        const relationship = relMap?.get(nominee.id);
        
        // Base score
        let score = relationship?.score || 0;
        
        // Check for mental state impact (stress and mood)
        let mentalStateModifier = 0;
        
        // Mental state affects decision-making
        if (povHolder.mood === 'Happy' || povHolder.mood === 'Content') {
          mentalStateModifier += 10; // More likely to use veto when in good mood
        } else if (povHolder.mood === 'Upset' || povHolder.mood === 'Angry') {
          mentalStateModifier -= 10; // Less likely to use veto when in bad mood
        }
        
        if (povHolder.stressLevel === 'Stressed' || povHolder.stressLevel === 'Overwhelmed') {
          mentalStateModifier -= 15; // Less likely to take risks when stressed
        } else if (povHolder.stressLevel === 'Relaxed') {
          mentalStateModifier += 10; // More likely to make power moves when relaxed
        }
        
        // Personality impact on decision
        if (povHolder.traits.includes('Loyal') && score > 0) {
          mentalStateModifier += 20; // Much more likely to save allies if loyal
        }
        
        if (povHolder.traits.includes('Strategic')) {
          // Strategic players weigh game considerations more heavily
          const isCompThreat = nominee.competitionsWon.hoh > 0 || nominee.competitionsWon.pov > 0;
          if (isCompThreat) {
            mentalStateModifier -= 15; // Less likely to save competition threats
          }
        }
        
        // Enhance with effective score (group dynamics)
        if (gameState.relationships.size > 0) {
          // Check for allies-of-allies or enemies-of-allies
          let groupDynamicsScore = 0;
          let relationsChecked = 0;
          
          relMap?.forEach((otherRel, otherId) => {
            if (otherId !== nominee.id) {
              const nomineeRelMap = gameState.relationships.get(nominee.id);
              const nomineeRelWithOther = nomineeRelMap?.get(otherId)?.score || 0;
              
              // If both have similar feelings toward a third person, strengthen relationship
              // If opposite feelings, weaken relationship
              const similarity = Math.sign(otherRel.score) === Math.sign(nomineeRelWithOther) ? 1 : -1;
              const magnitude = Math.min(Math.abs(otherRel.score), Math.abs(nomineeRelWithOther)) / 100;
              
              groupDynamicsScore += similarity * magnitude;
              relationsChecked++;
            }
          });
          
          // Apply group dynamics modifier
          if (relationsChecked > 0) {
            const averageModifier = groupDynamicsScore / relationsChecked * config.GROUP_DYNAMICS_WEIGHT * 10;
            score += averageModifier;
          }
        }
        
        // Check for significant events that might affect decision
        const events = relationship?.events || [];
        
        // Check if events exists and is an array before filtering
        const significantEvents = Array.isArray(events) ? 
          events.filter(e => 
            ['betrayal', 'saved', 'alliance_formed', 'alliance_betrayed'].includes(e.type)) : 
          [];
        
        // Extra score based on significant events
        const eventBonus = significantEvents.reduce((bonus, event) => {
          switch (event.type) {
            case 'betrayal':
              return bonus - 15; // Less likely to save someone who betrayed you
            case 'saved':
              return bonus + 15; // More likely to save someone who saved you
            case 'alliance_formed':
              return bonus + 20; // Much more likely to save an ally
            default:
              return bonus;
          }
        }, 0);
        
        const hasAlliance = Array.isArray(events) ? events.some(e => e.type === 'alliance_formed') : false;
        const wasBetrayed = Array.isArray(events) ? events.some(e => e.type === 'betrayal') : false;
        
        return {
          nominee,
          score: score + eventBonus + mentalStateModifier,
          hasAlliance,
          wasBetrayed
        };
      });
      
      // Find the nominee with best relationship
      const bestNominee = nomineeData.reduce(
        (best, current) => current.score > best.score ? current : best, 
        { nominee: null, score: -101, hasAlliance: false, wasBetrayed: false }
      );
      
      // Make decision based on relationship score and other factors
      if (bestNominee.nominee) {
        if (
          bestNominee.score > 30 || // Good relationship
          bestNominee.hasAlliance || // In alliance
          (povHolder.traits && povHolder.traits.includes('Loyal') && bestNominee.score > 10) // Loyal personality
        ) {
          decision = true;
          setTimeout(() => {
            handleVetoDecision(decision);
            setTimeout(() => handleSaveNominee(bestNominee.nominee!), 1500);
          }, 2000);
        } else {
          decision = false;
          setTimeout(() => handleVetoDecision(decision), 2000);
        }
      } else {
        // Fall back to default
        decision = Math.random() > 0.7; // 30% chance to use veto randomly  
        setTimeout(() => handleVetoDecision(decision), 2000);
      }
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
        // Calculate scores for each eligible replacement
        const replacementData = eligibleReplacements.map(houseguest => {
          const relMap = gameState.relationships.get(hoh.id);
          const relationship = relMap?.get(houseguest.id);
          
          // Base score (lower is worse, more likely to be nominated)
          let score = relationship?.score || 0;
          
          // Mental state impact
          let mentalStateModifier = 0;
          
          // Stress and mood affect decision-making
          if (hoh.mood === 'Angry' || hoh.mood === 'Upset') {
            mentalStateModifier -= 20; // More likely to make aggressive nominations when angry
          }
          
          if (hoh.stressLevel === 'Stressed' || hoh.stressLevel === 'Overwhelmed') {
            if (hoh.traits.includes('Emotional')) {
              mentalStateModifier -= 30; // Emotional players are strongly affected by stress
            } else {
              mentalStateModifier -= 15; // Others are still affected but less so
            }
          }
          
          // Check for significant events
          const events = relationship?.events || [];
          
          // Check if events exists and is an array before filtering
          const significantEvents = Array.isArray(events) ? 
            events.filter(e => 
              ['betrayal', 'saved', 'alliance_formed', 'alliance_betrayed'].includes(e.type)) : 
            [];
          
          // Extra score based on significant events
          const eventEffect = significantEvents.reduce((effect, event) => {
            switch (event.type) {
              case 'betrayal':
                return effect - 30; // Much more likely to nominate someone who betrayed you
              case 'saved':
                return effect + 20; // Less likely to nominate someone who saved you
              case 'alliance_formed':
                return effect + 40; // Much less likely to nominate an ally
              case 'deception':
                return effect - 20; // More likely to nominate someone who deceived you
              case 'positive_connection':
                return effect + 15; // Less likely to nominate someone you connected with
              case 'negative_interaction':
                return effect - 15; // More likely to nominate someone after a negative interaction
              default:
                return effect;
            }
          }, 0);
          
          // Calculate reciprocity - if they like you less than you like them, more likely to nominate
          const theirRelMap = gameState.relationships.get(houseguest.id);
          const theirRel = theirRelMap?.get(hoh.id)?.score || 0;
          const reciprocityEffect = (theirRel - score) * config.RECIPROCITY_FACTOR;
          
          // Personality-driven considerations
          let personalityModifier = 0;
          
          if (hoh.traits.includes('Strategic')) {
            // Strategic players target competition threats
            if (houseguest.competitionsWon.hoh > 0 || houseguest.competitionsWon.pov > 0) {
              personalityModifier -= 15; // More likely to target comp threats
            }
          }
          
          if (hoh.traits.includes('Confrontational')) {
            // Confrontational players are more likely to make bold moves
            personalityModifier -= 10; // More aggressive nominations
          }
          
          if (hoh.traits.includes('Loyal') && score > 30) {
            // Loyal players strongly protect those they like
            personalityModifier += 30; // Much less likely to nominate allies
          }
          
          return {
            houseguest,
            score: score + eventEffect + reciprocityEffect + mentalStateModifier + personalityModifier
          };
        });
        
        // Sort by score (lowest first = most likely to nominate)
        replacementData.sort((a, b) => a.score - b.score);
        const worstRelationship = replacementData[0];
        
        setTimeout(() => handleSelectReplacement(worstRelationship.houseguest), 2500);
      }
    }
  }, [meetingStage, savedNominee, hoh, replacementNominee, activeHouseguests, handleSelectReplacement, gameState.relationships]);
};
