
import { GameState, GamePhase, getOrCreateRelationship } from '../../../models/game-state';
import { GameAction } from '../../types/game-context-types';
import { Promise, PromiseType } from '../../../models/promise';

export interface PlayerActionPayload {
  actionId: string;
  params: any;
}

/**
 * Helper to update relationship in state
 */
function updateRelationshipInState(
  state: GameState, 
  playerId: string, 
  targetId: string, 
  change: number
): GameState {
  const newRelationships = new Map(state.relationships);
  
  // Get or create relationships
  const rel1 = getOrCreateRelationship(newRelationships, playerId, targetId);
  const rel2 = getOrCreateRelationship(newRelationships, targetId, playerId);
  
  // Update scores
  rel1.score = Math.max(-100, Math.min(100, rel1.score + change));
  rel1.lastInteractionWeek = state.week;
  
  // Reciprocal (slightly varied)
  const reciprocalChange = change * (0.8 + Math.random() * 0.4);
  rel2.score = Math.max(-100, Math.min(100, rel2.score + reciprocalChange));
  rel2.lastInteractionWeek = state.week;
  
  return {
    ...state,
    relationships: newRelationships
  };
}

export function playerActionReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'PLAYER_ACTION') {
    const payload = action.payload as PlayerActionPayload;
    
    // Log the player action for debugging
    console.log(`Player Action: ${payload.actionId}`, payload.params);
    
    // Handle specific player actions that need to be processed immediately
    // Note: Most of these will also be handled by the game state machine
    
    switch (payload.actionId) {
      // SOCIAL INTERACTION ACTIONS - Now directly update relationships
      case 'talk_to': {
        const playerId = state.houseguests.find(h => h.isPlayer)?.id;
        const targetId = payload.params?.targetId;
        
        if (playerId && targetId) {
          const improvement = Math.floor(Math.random() * 5) + 3; // 3-7 points
          console.log(`Talk to: ${targetId}, improvement: +${improvement}`);
          
          // Update state with relationship change
          const newState = updateRelationshipInState(state, playerId, targetId, improvement);
          
          // Log the event
          const targetName = state.houseguests.find(h => h.id === targetId)?.name || 'Unknown';
          const playerName = state.houseguests.find(h => h.isPlayer)?.name || 'Player';
          
          return {
            ...newState,
            gameLog: [
              ...newState.gameLog,
              {
                week: state.week,
                phase: 'SocialInteraction',
                type: 'CONVERSATION',
                description: `${playerName} had a conversation with ${targetName} (+${improvement} relationship)`,
                involvedHouseguests: [playerId, targetId],
                timestamp: Date.now()
              }
            ],
            // Store the last relationship impact for UI feedback
            lastRelationshipImpact: {
              targetId,
              targetName,
              value: improvement,
              timestamp: Date.now()
            }
          };
        }
        break;
      }
      
      case 'relationship_building': {
        const playerId = state.houseguests.find(h => h.isPlayer)?.id;
        const targetId = payload.params?.targetId;
        
        if (playerId && targetId) {
          const improvement = Math.floor(Math.random() * 8) + 5; // 5-12 points (stronger than talk_to)
          console.log(`Build relationship with: ${targetId}, improvement: +${improvement}`);
          
          const newState = updateRelationshipInState(state, playerId, targetId, improvement);
          
          const targetName = state.houseguests.find(h => h.id === targetId)?.name || 'Unknown';
          const playerName = state.houseguests.find(h => h.isPlayer)?.name || 'Player';
          
          return {
            ...newState,
            gameLog: [
              ...newState.gameLog,
              {
                week: state.week,
                phase: 'SocialInteraction',
                type: 'RELATIONSHIP_BUILDING',
                description: `${playerName} spent quality time with ${targetName} (+${improvement} relationship)`,
                involvedHouseguests: [playerId, targetId],
                timestamp: Date.now()
              }
            ],
            lastRelationshipImpact: {
              targetId,
              targetName,
              value: improvement,
              timestamp: Date.now()
            }
          };
        }
        break;
      }
      
      case 'strategic_discussion': {
        const playerId = state.houseguests.find(h => h.isPlayer)?.id;
        const targetId = payload.params?.targetId;
        
        if (playerId && targetId) {
          // Strategic discussion has moderate relationship impact
          const improvement = Math.floor(Math.random() * 4) + 2; // 2-5 points
          console.log(`Strategic discussion with: ${targetId}, improvement: +${improvement}`);
          
          const newState = updateRelationshipInState(state, playerId, targetId, improvement);
          
          const targetName = state.houseguests.find(h => h.id === targetId)?.name || 'Unknown';
          const playerName = state.houseguests.find(h => h.isPlayer)?.name || 'Player';
          
          return {
            ...newState,
            gameLog: [
              ...newState.gameLog,
              {
                week: state.week,
                phase: 'SocialInteraction',
                type: 'STRATEGIC_DISCUSSION',
                description: `${playerName} discussed strategy with ${targetName} (+${improvement} relationship)`,
                involvedHouseguests: [playerId, targetId],
                timestamp: Date.now()
              }
            ],
            lastRelationshipImpact: {
              targetId,
              targetName,
              value: improvement,
              timestamp: Date.now()
            }
          };
        }
        break;
      }

      case 'fast_forward':
        // Fast forward is handled by the game state machine
        // Just log it here for debugging
        console.log('Fast forwarding from phase:', payload.params.currentPhase);
        
        // For immediate UI feedback while the state machine processes
        // Always advance to the next phase
        if (payload.params.currentPhase === 'Nomination') {
          return {
            ...state,
            phase: 'PoV' as GamePhase  // Immediately update UI phase
          };
        }
        
        if (payload.params.currentPhase === 'Eviction') {
          console.log("Fast forwarding from Eviction - advancing week");
          const activeCountEviction = state.houseguests.filter(h => h.status === 'Active').length;
          
          // Check for final stages - only 2 remaining goes to jury questioning
          if (activeCountEviction === 2) {
            return {
              ...state,
              week: state.week + 1,
              phase: 'JuryQuestioning' as GamePhase,
              isFinalStage: true,
              nominees: [],
              evictionVotes: {}
            };
          }
          // Exactly 3 remaining goes to Final HoH
          if (activeCountEviction === 3) {
            return {
              ...state,
              week: state.week + 1,
              phase: 'FinalHoH' as GamePhase,
              isFinalStage: true,
              nominees: [],
              evictionVotes: {}
            };
          }
          
          // Normal week advancement
          return {
            ...state,
            week: state.week + 1,
            phase: 'HoH' as GamePhase,
            nominees: [],
            evictionVotes: {}
          };
        }
        
        // Handle FinalHoH fast-forward - simulate all 3 parts and evict 3rd place
        if (payload.params.currentPhase === 'FinalHoH') {
          console.log("Fast forwarding from FinalHoH - simulating all parts");
          const activeHouseguests = state.houseguests.filter(h => h.status === 'Active');
          
          // Validate we have enough active houseguests for Final HoH
          if (activeHouseguests.length < 2) {
            console.error('Not enough active houseguests for Final HoH:', activeHouseguests.length);
            // Skip directly to jury questioning if only 2 remain
            return {
              ...state,
              phase: 'JuryQuestioning' as GamePhase,
              isFinalStage: true
            };
          }
          
          if (activeHouseguests.length >= 2) {
            // Pick winners randomly weighted by stats
            const scoreHouseguest = (h: typeof activeHouseguests[0], type: 'endurance' | 'skill' | 'mental') => {
              const statMap = {
                endurance: h.stats.endurance * 1.5 + h.stats.physical * 0.5,
                skill: h.stats.physical + h.stats.mental * 0.5,
                mental: h.stats.mental * 1.5 + h.stats.social * 0.3
              };
              return statMap[type] * (0.75 + Math.random() * 0.5);
            };
            
            // Part 1: Endurance - all 3 compete
            const part1Scores = activeHouseguests.map(h => ({ h, score: scoreHouseguest(h, 'endurance') }));
            part1Scores.sort((a, b) => b.score - a.score);
            const part1Winner = part1Scores[0].h;
            const part1Losers = part1Scores.slice(1).map(s => s.h);
            
            // Part 2: Skill - 2 losers compete
            const part2Scores = part1Losers.map(h => ({ h, score: scoreHouseguest(h, 'skill') }));
            part2Scores.sort((a, b) => b.score - a.score);
            const part2Winner = part2Scores[0]?.h || part1Losers[0];
            
            // Part 3: Mental - Part 1 and Part 2 winners compete
            const part3Competitors = [part1Winner, part2Winner];
            const part3Scores = part3Competitors.map(h => ({ h, score: scoreHouseguest(h, 'mental') }));
            part3Scores.sort((a, b) => b.score - a.score);
            const finalHoH = part3Scores[0].h;
            
            // Final HoH picks finalist (pick randomly from the other two)
            const otherTwo = activeHouseguests.filter(h => h.id !== finalHoH.id);
            const finalist = otherTwo[Math.floor(Math.random() * otherTwo.length)];
            const evicted = otherTwo.find(h => h.id !== finalist.id);
            
            // Update houseguests
            const updatedHouseguests = state.houseguests.map(h => {
              if (evicted && h.id === evicted.id) {
                return { ...h, status: 'Jury' as const, isHoH: false, isNominated: false };
              }
              if (h.id === finalHoH.id) {
                return { ...h, isHoH: true };
              }
              return { ...h, isHoH: false };
            });
            
            return {
              ...state,
              houseguests: updatedHouseguests,
              finalHoHWinners: {
                part1: part1Winner.id,
                part2: part2Winner.id,
                part3: finalHoH.id
              },
              hohWinner: finalHoH,
              finalTwo: [finalHoH, finalist],
              juryMembers: evicted 
                ? [...(state.juryMembers || []), evicted.id]
                : state.juryMembers || [],
              phase: 'JuryQuestioning' as GamePhase,
              isFinalStage: true
            };
          }
        }
        break;
        
      case 'continue_to_pov':
        // For immediate UI feedback while the state machine processes
        console.log('Continue to PoV - updating UI phase');
        return {
          ...state,
          phase: 'PoV' as GamePhase  // Immediately update UI phase
        };
        
      case 'make_nominations':
        // This is typically handled in nomination-reducer, just for transparency
        console.log('Player nominated:', payload.params.nomineeIds);
        break;
        
      case 'cast_vote':
        if (payload.params.voterId && payload.params.nomineeId) {
          // Update the eviction votes record
          return {
            ...state,
            evictionVotes: {
              ...state.evictionVotes,
              [payload.params.voterId]: payload.params.nomineeId
            }
          };
        }
        break;
        
      case 'use_veto':
        console.log('Player decision on veto use:', payload.params.useVeto ? 'use' : 'not use');
        break;
        
      case 'select_replacement':
        console.log('Player selected replacement nominee:', payload.params.replacementId);
        break;
        
      case 'hoh_tiebreaker':
        if (payload.params.hohId && payload.params.nomineeId) {
          // Update the eviction votes record with the HoH's tiebreaker
          return {
            ...state,
            evictionVotes: {
              ...state.evictionVotes,
              [payload.params.hohId + '_tiebreaker']: payload.params.nomineeId
            }
          };
        }
        break;
        
      case 'evict_houseguest':
        console.log('Processing eviction for:', payload.params.evictedId);
        break;
        
      case 'eviction_complete':
      case 'advance_week': {
        const actionName = payload.actionId === 'eviction_complete' ? 'Eviction complete' : 'Advancing week';
        console.log(`${actionName}, checking houseguest count for final stages`);
        
        // Count active houseguests
        const activeCount = state.houseguests.filter(h => h.status === 'Active').length;
        console.log(`Active houseguests: ${activeCount}`);
        
        // If only 2 remain, go to Jury Questioning
        if (activeCount === 2) {
          console.log('Only 2 houseguests remain - advancing to Jury Questioning');
          return {
            ...state,
            week: state.week + 1,
            phase: 'JuryQuestioning' as GamePhase,
            isFinalStage: true,
            nominees: [],
            evictionVotes: {}
          };
        }
        
        // If exactly 3 remain, go to Final HoH (after Final 4 eviction)
        if (activeCount === 3) {
          console.log('3 houseguests remain - advancing to Final HoH');
          return {
            ...state,
            week: state.week + 1,
            phase: 'FinalHoH' as GamePhase,
            isFinalStage: true,
            nominees: [],
            evictionVotes: {}
          };
        }
        
        // If 4 remain (Final 4), continue normal week with isFinalStage flag for special voting
        if (activeCount === 4) {
          console.log('Final 4 - continuing normal week with single voter');
        }
        
        // Normal week advancement
        return {
          ...state,
          week: state.week + 1,
          phase: 'HoH' as GamePhase,
          nominees: [],
          evictionVotes: {}
        };
      }
        
      case 'make_promise':
        // Process a player-made promise
        if (payload.params.targetId && payload.params.promiseType) {
          // Create the promise object
          const newPromise: Promise = {
            id: `promise-${Date.now()}`,
            fromId: payload.params.voterId || state.houseguests.find(h => h.isPlayer)?.id || '',
            toId: payload.params.targetId,
            type: payload.params.promiseType as PromiseType,
            description: payload.params.promiseDescription || `Made a promise to ${payload.params.targetName}`,
            week: state.week,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            impactLevel: 'medium',
            context: {}
          };
          
          // Add to promises array
          const updatedPromises = state.promises ? [...state.promises, newPromise] : [newPromise];
          
          return {
            ...state,
            promises: updatedPromises
          };
        }
        break;
      
      case 'eavesdrop':
        // Eavesdrop doesn't change relationships
        break;
      
      case 'set_final_two':
        if (payload.params.finalist1Id && payload.params.finalist2Id) {
          const finalist1 = state.houseguests.find(h => h.id === payload.params.finalist1Id);
          const finalist2 = state.houseguests.find(h => h.id === payload.params.finalist2Id);
          if (finalist1 && finalist2) {
            return {
              ...state,
              finalTwo: [finalist1, finalist2]
            };
          }
        }
        break;
      
      case 'set_winner':
        if (payload.params.winnerId) {
          const winnerHg = state.houseguests.find(h => h.id === payload.params.winnerId);
          const runnerUpHg = state.finalTwo?.find(h => h.id !== payload.params.winnerId);
          if (winnerHg) {
            // Update houseguests with winner status
            const updatedHouseguests = state.houseguests.map(h => {
              if (h.id === winnerHg.id) {
                return { ...h, status: 'Winner' as const, isWinner: true };
              }
              if (runnerUpHg && h.id === runnerUpHg.id) {
                return { ...h, status: 'Runner-Up' as const };
              }
              return h;
            });
            return {
              ...state,
              houseguests: updatedHouseguests,
              winner: { ...winnerHg, status: 'Winner' as const, isWinner: true },
              runnerUp: runnerUpHg ? { ...runnerUpHg, status: 'Runner-Up' as const } : undefined,
              phase: 'GameOver' as GamePhase
            };
          }
        }
        break;
      
      case 'select_part1_winner':
      case 'select_part2_winner':
      case 'select_part3_winner':
        if (payload.params.winnerId) {
          const partKey = payload.actionId.replace('select_', '').replace('_winner', '') as 'part1' | 'part2' | 'part3';
          const updatedFinalHoHWinners = {
            ...state.finalHoHWinners,
            [partKey]: payload.params.winnerId
          };
          
          // If part3, also set HOH winner
          if (partKey === 'part3') {
            const partWinner = state.houseguests.find(h => h.id === payload.params.winnerId);
            if (partWinner) {
              return {
                ...state,
                finalHoHWinners: updatedFinalHoHWinners,
                hohWinner: partWinner,
                houseguests: state.houseguests.map(h => ({
                  ...h,
                  isHoH: h.id === payload.params.winnerId
                }))
              };
            }
          }
          
          return {
            ...state,
            finalHoHWinners: updatedFinalHoHWinners
          };
        }
        break;
        
      default:
        // No immediate state update needed
        break;
    }
  }
  
  // Return state unchanged if no specific handling
  return state;
}
