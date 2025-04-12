
import { config } from '@/config';
import { Houseguest } from '@/models/houseguest';
import { GameState } from '@/contexts/types/game-context-types';
import { RelationshipEventType } from '@/models/relationship-event';
import { Logger } from '@/utils/logger';
import { BestNomineeResult } from './types';

/**
 * Calculate the best nominee to save based on relationships
 */
export function calculateBestNomineeByRelationship(
  povHolder: Houseguest | null,
  nominees: Houseguest[],
  gameState: GameState,
  aiLogger: Logger
): BestNomineeResult | null {
  if (!povHolder || nominees.length === 0) return null;
  
  try {
    // For each nominee, check relationship scores and significant events
    const nomineeData = nominees.map(nominee => {
      const relMap = gameState.relationships.get(povHolder.id);
      const relationship = relMap?.get(nominee.id);
      
      // Base score
      let score = relationship?.score || 0;
      
      // Mental state impact (stress and mood)
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
          const averageModifier = groupDynamicsScore / relationsChecked * (config.GROUP_DYNAMICS_WEIGHT || 1) * 10;
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
    
    return bestNominee;
  } catch (error: any) {
    aiLogger.error(`Error calculating best nominee: ${error.message}`);
    return null;
  }
}

/**
 * Calculate the replacement nominee based on relationships
 */
export function calculateReplacementNomineeByRelationship(
  hoh: Houseguest | null,
  savedNominee: Houseguest | null,
  activeHouseguests: Houseguest[],
  gameState: GameState,
  aiLogger: Logger
): Houseguest | null {
  if (!hoh) return null;
  
  const eligibleReplacements = activeHouseguests.filter(houseguest => 
    !houseguest.isHoH && 
    !houseguest.isNominated && 
    houseguest.id !== savedNominee?.id && 
    !houseguest.isPovHolder
  );
  
  if (eligibleReplacements.length === 0) return null;
  
  try {
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
        switch (event.type as RelationshipEventType) {
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
      const reciprocityEffect = (theirRel - score) * (config.RECIPROCITY_FACTOR || 0.5);
      
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
    return replacementData[0]?.houseguest || null;
  } catch (error: any) {
    aiLogger.error(`Error calculating replacement nominee: ${error.message}`);
    
    // Fallback to random selection
    if (eligibleReplacements.length > 0) {
      const randomIndex = Math.floor(Math.random() * eligibleReplacements.length);
      return eligibleReplacements[randomIndex];
    }
    return null;
  }
}
