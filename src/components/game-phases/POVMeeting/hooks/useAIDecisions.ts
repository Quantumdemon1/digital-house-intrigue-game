
import { useEffect, useCallback, useRef } from 'react';
import { Houseguest } from '@/models/houseguest';
import { GameState } from '@/contexts/types/game-context-types';
import { config } from '@/config';
import { RelationshipEventType } from '@/models/relationship-event';
import { Logger, LogLevel } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/GameContext';

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
  const { toast } = useToast();
  const { aiSystem, game } = useGame();
  const processingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create a stable logger instance
  const aiLogger = useRef(new Logger({
    logLevel: LogLevel.DEBUG,
    prefix: "AI-POV",
    enableTimestamp: true
  })).current;

  // Fast forward handler - memoized to prevent recreation
  const handleFastForward = useCallback(() => {
    const fastForwardHandler = () => {
      if (meetingStage === 'initial' && povHolder && !povHolder.isPlayer && !processingRef.current) {
        processingRef.current = true;
        
        try {
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
        } catch (error: any) {
          aiLogger.error(`Error in fast forward handler: ${error.message}`);
          // Fallback to not using veto
          handleVetoDecision(false);
        } finally {
          processingRef.current = false;
        }
      }
    };
    
    document.addEventListener('game:fastForward', fastForwardHandler);
    return () => document.removeEventListener('game:fastForward', fastForwardHandler);
  }, [meetingStage, povHolder, nominees, gameState.relationships, handleVetoDecision, aiLogger]);

  // Effect to handle the fast forward events
  useEffect(handleFastForward, [handleFastForward]);

  // Memoize calculation of best nominee based on relationships
  const calculateBestNominee = useCallback(() => {
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
  }, [povHolder, nominees, gameState.relationships, aiLogger]);

  // Effect for AI veto decision logic
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (
      meetingStage === 'initial' && 
      povHolder && 
      !povHolder.isPlayer && 
      useVeto === null && 
      !processingRef.current
    ) {
      processingRef.current = true;
      
      // Show thinking toast
      toast({
        title: `${povHolder.name} is deciding...`,
        description: "The Power of Veto holder is making their decision."
      });
      
      // Try to use AI system if available
      const useAIDecision = async () => {
        try {
          if (game && aiSystem) {
            // Self-nominations always use veto
            if (povHolder.isNominated) {
              aiLogger.info(`${povHolder.name} is nominated, automatically using veto`);
              
              timeoutRef.current = setTimeout(() => {
                handleVetoDecision(true);
                timeoutRef.current = setTimeout(() => {
                  handleSaveNominee(povHolder);
                }, 1500);
              }, 2000);
              
              return;
            }
            
            // Prepare context for AI decision
            const vetoContext = {
              povHolder: povHolder.name,
              isNominated: povHolder.isNominated,
              nominees: nominees.map(n => n.name),
              relationships: nominees.reduce((acc, nominee) => {
                const relScore = gameState.relationships.get(povHolder.id)?.get(nominee.id)?.score || 0;
                acc[nominee.name] = relScore;
                return acc;
              }, {} as Record<string, number>)
            };
            
            // Get AI decision
            const decision = await aiSystem.makeDecision(
              povHolder.name,
              'veto',
              vetoContext,
              game
            );
            
            if (decision.useVeto) {
              aiLogger.info(`AI decision: Use veto to save ${decision.saveNominee}`);
              
              const nomineeToSave = nominees.find(n => n.name === decision.saveNominee);
              if (nomineeToSave) {
                timeoutRef.current = setTimeout(() => {
                  handleVetoDecision(true);
                  timeoutRef.current = setTimeout(() => {
                    handleSaveNominee(nomineeToSave);
                  }, 1500);
                }, 2000);
              } else {
                throw new Error(`Could not find nominee: ${decision.saveNominee}`);
              }
            } else {
              aiLogger.info(`AI decision: Do not use veto`);
              timeoutRef.current = setTimeout(() => {
                handleVetoDecision(false);
              }, 2000);
            }
          } else {
            throw new Error("Game or AI system not available");
          }
        } catch (error: any) {
          // Fallback to relationship-based decision
          aiLogger.warn(`AI decision failed, using fallback: ${error.message}`);
          fallbackVetoDecision();
        } finally {
          processingRef.current = false;
        }
      };
      
      // Fallback decision logic
      const fallbackVetoDecision = () => {
        try {
          // Always use veto if nominated
          if (povHolder.isNominated) {
            timeoutRef.current = setTimeout(() => {
              handleVetoDecision(true);
              timeoutRef.current = setTimeout(() => {
                handleSaveNominee(povHolder);
              }, 1500);
            }, 2000);
            return;
          }
          
          // Use relationship calculation
          const bestNominee = calculateBestNominee();
          
          if (bestNominee && bestNominee.nominee) {
            // Make decision based on relationship score and other factors
            if (
              bestNominee.score > 30 || // Good relationship
              bestNominee.hasAlliance || // In alliance
              (povHolder.traits && povHolder.traits.includes('Loyal') && bestNominee.score > 10) // Loyal personality
            ) {
              timeoutRef.current = setTimeout(() => {
                handleVetoDecision(true);
                timeoutRef.current = setTimeout(() => {
                  handleSaveNominee(bestNominee.nominee!);
                }, 1500);
              }, 2000);
            } else {
              timeoutRef.current = setTimeout(() => {
                handleVetoDecision(false);
              }, 2000);
            }
          } else {
            // Fall back to random decision with 30% chance to use veto
            const decision = Math.random() > 0.7;
            timeoutRef.current = setTimeout(() => {
              handleVetoDecision(decision);
              
              // If using veto, pick a random nominee
              if (decision && nominees.length > 0) {
                const randomNominee = nominees[Math.floor(Math.random() * nominees.length)];
                timeoutRef.current = setTimeout(() => {
                  handleSaveNominee(randomNominee);
                }, 1500);
              }
            }, 2000);
          }
        } catch (error: any) {
          aiLogger.error(`Error in fallback veto decision: ${error.message}`);
          // Ultimate fallback - don't use veto
          timeoutRef.current = setTimeout(() => {
            handleVetoDecision(false);
          }, 2000);
        } finally {
          processingRef.current = false;
        }
      };
      
      // Start the decision process
      useAIDecision();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    meetingStage, 
    povHolder, 
    nominees, 
    useVeto, 
    handleVetoDecision, 
    handleSaveNominee,
    gameState.relationships,
    calculateBestNominee,
    aiLogger,
    toast,
    game,
    aiSystem
  ]);
  
  // Memoized function for calculating replacement nominee
  const calculateReplacementNominee = useCallback(() => {
    if (!hoh || !replacementNominee) {
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
    return null;
  }, [hoh, savedNominee, replacementNominee, activeHouseguests, gameState.relationships, aiLogger]);
  
  // AI decision logic for non-player HOH selecting replacement nominee
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (
      meetingStage === 'selectReplacement' && 
      savedNominee && 
      hoh && 
      !hoh.isPlayer && 
      !replacementNominee &&
      !processingRef.current
    ) {
      processingRef.current = true;
      
      // Show thinking toast
      toast({
        title: `${hoh.name} is deciding...`,
        description: "The HoH is selecting a replacement nominee."
      });
      
      // Try to use AI system if available
      const useAIDecision = async () => {
        try {
          if (game && aiSystem) {
            const eligibleReplacements = activeHouseguests.filter(houseguest => 
              !houseguest.isHoH && 
              !houseguest.isNominated && 
              houseguest.id !== savedNominee.id && 
              !houseguest.isPovHolder
            );
            
            if (eligibleReplacements.length === 0) {
              throw new Error("No eligible replacements");
            }
            
            // Prepare context for AI decision
            const replacementContext = {
              hohName: hoh.name,
              savedNominee: savedNominee.name,
              eligible: eligibleReplacements.map(hg => hg.name),
              relationships: eligibleReplacements.reduce((acc, hg) => {
                const relScore = gameState.relationships.get(hoh.id)?.get(hg.id)?.score || 0;
                acc[hg.name] = relScore;
                return acc;
              }, {} as Record<string, number>)
            };
            
            // Get AI decision
            const decision = await aiSystem.makeDecision(
              hoh.name,
              'replacement',
              replacementContext,
              game
            );
            
            const replacementName = decision.replacementNominee;
            const replacementHg = eligibleReplacements.find(hg => hg.name === replacementName);
            
            if (replacementHg) {
              aiLogger.info(`AI decision: Replace with ${replacementHg.name}`);
              timeoutRef.current = setTimeout(() => {
                handleSelectReplacement(replacementHg);
              }, 2500);
            } else {
              throw new Error(`Could not find replacement: ${replacementName}`);
            }
          } else {
            throw new Error("Game or AI system not available");
          }
        } catch (error: any) {
          // Fallback to relationship-based decision
          aiLogger.warn(`AI decision failed, using fallback: ${error.message}`);
          fallbackReplacementDecision();
        } finally {
          processingRef.current = false;
        }
      };
      
      // Fallback decision logic
      const fallbackReplacementDecision = () => {
        try {
          const worstRelationship = calculateReplacementNominee();
          
          if (worstRelationship) {
            timeoutRef.current = setTimeout(() => {
              handleSelectReplacement(worstRelationship);
            }, 2500);
          } else {
            // Ultimate fallback - random selection
            const eligibleReplacements = activeHouseguests.filter(houseguest => 
              !houseguest.isHoH && 
              !houseguest.isNominated && 
              houseguest.id !== savedNominee?.id && 
              !houseguest.isPovHolder
            );
            
            if (eligibleReplacements.length > 0) {
              const randomIdx = Math.floor(Math.random() * eligibleReplacements.length);
              timeoutRef.current = setTimeout(() => {
                handleSelectReplacement(eligibleReplacements[randomIdx]);
              }, 2500);
            }
          }
        } catch (error: any) {
          aiLogger.error(`Error in fallback replacement decision: ${error.message}`);
          
          // Ultimate fallback - first eligible
          const firstEligible = activeHouseguests.find(houseguest => 
            !houseguest.isHoH && 
            !houseguest.isNominated && 
            houseguest.id !== savedNominee?.id && 
            !houseguest.isPovHolder
          );
          
          if (firstEligible) {
            timeoutRef.current = setTimeout(() => {
              handleSelectReplacement(firstEligible);
            }, 2500);
          }
        } finally {
          processingRef.current = false;
        }
      };
      
      // Start the decision process
      useAIDecision();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    meetingStage,
    savedNominee, 
    hoh, 
    replacementNominee,
    activeHouseguests, 
    handleSelectReplacement,
    calculateReplacementNominee,
    gameState.relationships,
    aiLogger,
    toast,
    game,
    aiSystem
  ]);
  
  // Return empty object - all logic is in effects
  return {};
};

