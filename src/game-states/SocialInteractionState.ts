/**
 * @file SocialInteractionState.ts
 * @description Social interaction state with enhanced player actions
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';
import { NominationState } from './NominationState';
import type { IGameControllerFacade } from '../types/interfaces';
import { Houseguest } from '../models/houseguest';
import { RelationshipEventType } from '../models/relationship-event';
import { GamePhase } from '../models/game-state';
import { Promise as GamePromise, PromiseType, PromiseStatus } from '../models/promise';

// Define possible locations
export const LOCATIONS = ['living-room', 'kitchen', 'bedroom', 'backyard', 'hoh-room', 'diary-room'];

// Strategic discussion types
export type StrategicDiscussionType = 
  | 'suggest_target' 
  | 'vote_intentions'
  | 'final_two_deal'
  | 'spread_rumor'
  | 'general_strategy';

export class SocialInteractionState extends GameStateBase {
  private interactionsRemaining: number = 3; // Allow 3 interactions per state entry
  private targetPhase: typeof GameStateBase; // Which state to go to next

  constructor(controller: IGameControllerFacade, targetPhase: typeof GameStateBase = NominationState) {
    super(controller);
    this.targetPhase = targetPhase; // The state to transition to when done
  }

  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'SocialInteraction';
    this.interactionsRemaining = 3; // Reset interactions on entry
    this.getLogger().info(`Entering social phase. Target: ${this.targetPhase.name}. Interactions left: ${this.interactionsRemaining}`);
    
    // Notify the player
    this.getLogger().info(`You are in the ${this.game.currentLocation.replace('-', ' ')}.`);
    
    // Trigger UI to show choices
    this.controller.promptNextAction();
  }

  getAvailableActions(): SocialActionChoice[] {
    const actions: SocialActionChoice[] = [];
    const currentLocation = this.game.currentLocation;
    const activeGuests = this.game.getActiveHouseguests();
    const player = this.game.houseguests.find(h => h.isPlayer);
    
    if (!player) return [];
    
    // 1. Move Actions
    LOCATIONS.forEach(loc => {
      if (loc !== currentLocation) {
        actions.push({
          text: `Go to ${loc.replace('-', ' ')}`,
          actionId: 'move_location',
          parameters: { locationId: loc }
        });
      }
    });

    // Determine who is 'present'
    const presentGuests = activeGuests.filter(hg => {
      // Simple random presence for now
      return Math.random() > 0.3; // ~70% chance present
    });

    // 2. Talk Actions - Enhanced with specific types
    if (presentGuests.length > 0) {
      // Basic conversation
      presentGuests.forEach(guest => {
        actions.push({
          text: `Talk to ${guest.name}`,
          actionId: 'talk_to',
          parameters: { targetId: guest.id, targetName: guest.name },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
        
        // Strategic discussions
        actions.push({
          text: `Discuss strategy with ${guest.name}`,
          actionId: 'strategic_discussion',
          parameters: { 
            targetId: guest.id, 
            targetName: guest.name,
            discussionType: 'general_strategy'
          },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
        
        actions.push({
          text: `Suggest target to ${guest.name}`,
          actionId: 'strategic_discussion',
          parameters: { 
            targetId: guest.id, 
            targetName: guest.name,
            discussionType: 'suggest_target'
          },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
        
        actions.push({
          text: `Ask ${guest.name} about voting plans`,
          actionId: 'strategic_discussion',
          parameters: { 
            targetId: guest.id, 
            targetName: guest.name,
            discussionType: 'vote_intentions'
          },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
        
        // Relationship building actions
        actions.push({
          text: `Compliment ${guest.name}`,
          actionId: 'relationship_building',
          parameters: { 
            targetId: guest.id, 
            targetName: guest.name,
            actionType: 'compliment'
          },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
        
        actions.push({
          text: `Apologize to ${guest.name}`,
          actionId: 'relationship_building',
          parameters: { 
            targetId: guest.id, 
            targetName: guest.name,
            actionType: 'apologize'
          },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
        
        // Promise system
        actions.push({
          text: `Make promise to ${guest.name}`,
          actionId: 'make_promise',
          parameters: { 
            targetId: guest.id, 
            targetName: guest.name,
          },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
        
        // Final 2 deal is special
        actions.push({
          text: `Propose final 2 deal to ${guest.name}`,
          actionId: 'strategic_discussion',
          parameters: { 
            targetId: guest.id, 
            targetName: guest.name,
            discussionType: 'final_two_deal'
          },
          disabled: this.interactionsRemaining <= 0,
          disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
        });
      });
    } else {
      actions.push({ 
        text: "Nobody else here right now...", 
        actionId: 'look_around', 
        disabled: true 
      });
    }
    
    // 3. Information gathering
    if (currentLocation !== 'diary-room' && presentGuests.length > 1) {
      actions.push({
        text: "Eavesdrop on conversation",
        actionId: 'eavesdrop',
        disabled: this.interactionsRemaining <= 0,
        disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
      });
    }

    // 4. Check Relationships
    actions.push({ 
      text: "Check Relationships", 
      actionId: 'check_relationships' 
    });
    
    // 5. Check Promises
    actions.push({
      text: "Check Promises",
      actionId: 'check_promises'
    });
    
    // 6. Alliance Management Actions
    actions.push({
      text: "Propose Alliance",
      actionId: 'propose_alliance',
      disabled: this.interactionsRemaining <= 0,
      disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
    });

    // Check for existing alliances
    if (this.controller.allianceSystem) {
      const playerAlliances = this.controller.allianceSystem.getAlliancesForHouseguest(player.id);
      
      // Add action to check alliances
      actions.push({ 
        text: "Check My Alliances", 
        actionId: 'check_alliances' 
      });
      
      // If player has alliances, add alliance meeting action
      if (playerAlliances.length > 0) {
        playerAlliances.forEach(alliance => {
          actions.push({
            text: `Call ${alliance.name} Meeting`,
            actionId: 'call_alliance_meeting',
            parameters: { allianceId: alliance.id },
            disabled: this.interactionsRemaining <= 0,
            disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
          });
        });
      }
    }
    
    // 7. Share Information Actions
    if (presentGuests.length > 0) {
      actions.push({
        text: "Share Game Information",
        actionId: 'share_info',
        parameters: { type: 'honest' },
        disabled: this.interactionsRemaining <= 0,
        disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
      });
      
      actions.push({
        text: "Spread Misinformation",
        actionId: 'share_info',
        parameters: { type: 'deceptive' },
        disabled: this.interactionsRemaining <= 0,
        disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
      });
      
      // Spread specific rumor
      actions.push({
        text: "Spread Rumor",
        actionId: 'strategic_discussion',
        parameters: { 
          targetId: presentGuests[0].id,
          targetName: presentGuests[0].name,
          discussionType: 'spread_rumor'
        },
        disabled: this.interactionsRemaining <= 0,
        disabledReason: this.interactionsRemaining <= 0 ? "No interactions left" : undefined
      });
    }

    // 8. Advance Phase Action
    actions.push({
      text: `Proceed to ${this.targetPhase.name.replace('State', '')}`,
      actionId: 'advance_phase'
    });

    return actions;
  }

  async handleAction(actionId: string, params: any): Promise<boolean> {
    this.getLogger().debug(`Social Interaction Action: ${actionId}`, params);
    
    // Decrement interactions for most actions except checking status or advancing
    if (!['check_relationships', 'check_alliances', 'check_promises', 'advance_phase', 'move_location'].includes(actionId) && this.interactionsRemaining > 0) {
      this.interactionsRemaining--;
      this.getLogger().info(`Interactions remaining: ${this.interactionsRemaining}`);
    }

    const player = this.game.houseguests.find(h => h.isPlayer);
    if (!player) {
      this.getLogger().error("Player not found");
      return false;
    }

    switch (actionId) {
      case 'move_location':
        const newLocation = params?.locationId;
        if (LOCATIONS.includes(newLocation)) {
          this.game.currentLocation = newLocation;
          this.getLogger().info(`You moved to the ${newLocation.replace('-', ' ')}.`);
        } else {
          this.getLogger().warn("Invalid move location:", newLocation);
        }
        break;

      case 'talk_to':
        const targetId = params?.targetId;
        const targetName = params?.targetName;
        if (targetId && targetName) {
          this.getLogger().info(`You approach ${targetName} to talk...`);
          
          // Get the target AI houseguest
          const targetGuest = this.game.getHouseguestById(targetId);
          if (!targetGuest) break;
          
          // Create a dialogue context that will be displayed to the player
          const dialogueContext = {
            speakerId: player.id,
            speakerName: player.name,
            message: "Hey, I wanted to talk to you for a bit.",  // Initial greeting
            situation: `You approached ${targetName} for a conversation.`,
            phase: this.game.phase as GamePhase,
            week: this.game.week
          };
          
          // Generate AI response using the enhanced dialogue system
          setTimeout(async () => {
            try {
              if (this.controller.aiSystem) {
                // Use the improved AI dialogue system
                const response = await this.controller.aiSystem.generateDialogueResponse(
                  targetId,
                  dialogueContext,
                  this.game
                );
                
                // Display the response to the player
                this.getLogger().info(`${targetName} says: "${response.response}"`);
                
                // Apply relationship changes based on the tone and thoughts
                this.applyDialogueRelationshipEffects(player.id, targetId, response);
                
                // Optionally show dialogue options for the player to respond
                this.showDialogueOptions(player.id, targetId, response);
              } else {
                // Fallback if AI system not available
                const responses = [
                  "Hey there! What's up?",
                  "Good to see you!",
                  "How's your game going?",
                  "Want to talk strategy?"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.getLogger().info(`${targetName} says: "${randomResponse}"`);
                
                // Apply basic relationship change
                this.controller.relationshipSystem.updateRelationship(
                  player.id,
                  targetId,
                  2,
                  `You had a conversation with ${targetName}.`
                );
              }
            } catch (error) {
              this.getLogger().error(`Error generating dialogue: ${error}`);
              this.getLogger().info(`${targetName} says: "Sorry, I need to go do something real quick."`);
            }
          }, 500);
        }
        break;

      case 'strategic_discussion':
        await this.handleStrategicDiscussion(player, params);
        break;
        
      case 'relationship_building':
        await this.handleRelationshipBuilding(player, params);
        break;
        
      case 'make_promise':
        await this.handleMakePromise(player, params);
        break;
        
      case 'eavesdrop':
        await this.handleEavesdrop(player);
        break;
        
      case 'share_info':
        const infoType = params?.type;
        const presentGuests = this.game.getActiveHouseguests().filter(hg => !hg.isPlayer);
        const randomTarget = presentGuests[Math.floor(Math.random() * presentGuests.length)];
        
        if (!randomTarget) break;
        
        if (infoType === 'honest') {
          // Sharing honest information builds trust
          this.getLogger().info(`You share honest game information with ${randomTarget.name}.`);
          
          setTimeout(() => {
            this.getLogger().info(`${randomTarget.name} appreciates your honesty!`);
            
            // Record as significant event - builds trust
            this.controller.relationshipSystem.addRelationshipEvent(
              player.id,
              randomTarget.id,
              'shared_info',
              `You shared valuable game information with ${randomTarget.name}.`,
              5,
              false // Trust building is remembered
            );
            
            // Reciprocal effect - they trust you more
            this.controller.relationshipSystem.addRelationshipEvent(
              randomTarget.id,
              player.id,
              'shared_info',
              `${player.name} shared valuable game information with you.`,
              7,
              false // Trust building is remembered
            );
          }, 500);
        } else if (infoType === 'deceptive') {
          // Lying can damage relationships if caught
          this.getLogger().info(`You spread misinformation to ${randomTarget.name}.`);
          
          // 40% chance of getting caught
          const caughtLying = Math.random() < 0.4;
          
          setTimeout(() => {
            if (caughtLying) {
              this.getLogger().info(`${randomTarget.name} caught you in a lie!`);
              
              // Record as significant betrayal event
              this.controller.relationshipSystem.recordBetrayal(
                player.id,
                randomTarget.id,
                `${player.name} lied to you about game information.`
              );
              
              // Other houseguests may hear about this
              const witnesses = this.game.getActiveHouseguests()
                .filter(hg => !hg.isPlayer && hg.id !== randomTarget.id)
                .slice(0, 2); // Up to 2 other houseguests find out
                
              witnesses.forEach(witness => {
                this.controller.relationshipSystem.updateRelationship(
                  witness.id,
                  player.id,
                  -5,
                  `${witness.name} heard that you lied to ${randomTarget.name}.`
                );
              });
            } else {
              this.getLogger().info(`${randomTarget.name} believes your misinformation!`);
              
              // Short-term boost but potential for future damage
              this.controller.relationshipSystem.updateRelationship(
                randomTarget.id,
                player.id,
                3,
                `${randomTarget.name} trusts your information.`
              );
            }
          }, 500);
        }
        break;
        
      case 'propose_alliance':
        // Open alliance proposal UI through controller
        this.controller.openAllianceProposalUI();
        break;

      case 'check_alliances':
        // Get player alliances
        if (!this.controller.allianceSystem) {
          this.getLogger().info("Alliance system not available.");
          break;
        }
        
        const alliances = this.controller.allianceSystem.getAlliancesForHouseguest(player.id);
        
        if (alliances.length === 0) {
          this.getLogger().info("You are not currently in any alliances.");
        } else {
          this.getLogger().info("--- Your Alliances ---");
          
          alliances.forEach(alliance => {
            const memberNames = alliance.members.map(m => m.name).join(", ");
            const stability = alliance.stability.toFixed(0);
            const secrecy = alliance.isPublic ? "Public" : "Secret";
            const status = `${alliance.status} (${stability}% stable)`;
            
            this.getLogger().info(`${alliance.name}: ${memberNames}`);
            this.getLogger().info(`  Status: ${status} | ${secrecy}`);
            this.getLogger().info(`  Founded: Week ${alliance.createdOnWeek}`);
            
            // Check for at-risk alliances
            if (alliance.stability < 40) {
              this.getLogger().info(`  Warning: This alliance seems unstable!`);
            }
          });
        }
        
        break;
      
      case 'call_alliance_meeting':
        if (!this.controller.allianceSystem) {
          this.getLogger().info("Alliance system not available.");
          break;
        }
        
        const allianceId = params?.allianceId;
        if (!allianceId) break;
        
        const allAlliances = this.controller.allianceSystem.getAllAlliances();
        const alliance = allAlliances.find(a => a.id === allianceId);
        
        if (!alliance) {
          this.getLogger().warn("Alliance not found");
          break;
        }
        
        // Hold the meeting
        this.controller.allianceSystem.holdAllianceMeeting(alliance);
        
        // Get present alliance members (who are in the same location)
        const presentMembers = alliance.members.filter(m => !m.isPlayer);
        
        // Start alliance meeting dialogue
        this.getLogger().info(`You call a meeting with your ${alliance.name} alliance.`);
        
        setTimeout(() => {
          // Show which members are present
          const memberList = presentMembers.map(m => m.name).join(", ");
          this.getLogger().info(`Present for the meeting: ${memberList}`);
          
          // Discuss alliance strategy
          this.handleAllianceMeetingDiscussion(alliance, presentMembers);
        }, 800);
        
        break;
        
      case 'check_relationships':
        // Expanded relationship checking that includes significant events
        this.getLogger().info("--- Your Relationships ---");

        // Check if alliance system is available
        const allianceSystem = this.controller.allianceSystem;
        const playerAllies = allianceSystem ? 
          allianceSystem.getAllAlliesForHouseguest(player.id) : [];
        
        this.game.houseguests.forEach(guest => {
          if (guest.id !== player.id && guest.status !== 'Evicted') {
            const baseScore = this.controller.relationshipSystem.getRelationship(player.id, guest.id);
            const effectiveScore = this.controller.relationshipSystem.getEffectiveRelationship(player.id, guest.id);
            const description = this.describeRelationship(effectiveScore);
            
            // Check alliance status
            const isAlly = playerAllies.includes(guest.id);
            const allyStatus = isAlly ? " (ALLY)" : "";
            
            this.getLogger().info(`${guest.name}${allyStatus}: ${description} (${effectiveScore.toFixed(1)})`);
            
            // Get significant events
            if (this.controller.relationshipSystem.getRelationshipEvents) {
              const events = this.controller.relationshipSystem.getRelationshipEvents(player.id, guest.id)
                .filter(e => ['betrayal', 'saved', 'alliance_formed', 'alliance_betrayed'].includes(e.type) ||
                      Math.abs(e.impactScore) >= 15);
                      
              // Display significant events
              if (events.length > 0) {
                this.getLogger().info(`  Significant events with ${guest.name}:`);
                events.forEach(event => {
                  this.getLogger().info(`  - ${event.description}`);
                });
              }
              
              // Show reciprocity factor
              const reciprocity = this.controller.relationshipSystem.calculateReciprocityModifier(guest.id, player.id);
              if (Math.abs(reciprocity) > 0.1) {
                const reciprocityDesc = reciprocity > 0 
                  ? `${guest.name} likes you more than you like them.`
                  : `You like ${guest.name} more than they like you.`;
                this.getLogger().info(`  * ${reciprocityDesc}`);
              }
            }
            
            // Check for promises between player and this houseguest
            const promises = this.getPromisesBetween(player.id, guest.id);
            if (promises.length > 0) {
              this.getLogger().info(`  Promises with ${guest.name}:`);
              promises.forEach(promise => {
                const statusText = promise.status === 'pending' ? 'Active' : 
                                  promise.status === 'kept' ? 'Kept' : 'Broken';
                const directionText = promise.fromId === player.id ? 
                                     `You promised ${guest.name}` : 
                                     `${guest.name} promised you`;
                this.getLogger().info(`  - ${directionText}: ${promise.description} (${statusText})`);
              });
            }
          }
        });
        break;

      case 'check_promises':
        this.displayPlayerPromises(player.id);
        break;
        
      case 'advance_phase':
        this.getLogger().info(`Advancing phase from Social Interaction to ${this.targetPhase.name}`);
        await this.transitionTo(this.targetPhase);
        return true; // Transition initiated

      default:
        this.getLogger().warn(`Unhandled social action: ${actionId}`);
        return false;
    }

    // After handling an action, re-prompt the player with updated choices
    this.controller.promptNextAction();
    return true; // Action was handled
  }
  
  /**
   * Handle strategic discussion with another houseguest
   */
  private async handleStrategicDiscussion(player: Houseguest, params: any): Promise<void> {
    const { targetId, targetName, discussionType } = params;
    if (!targetId || !targetName) return;
    
    const targetGuest = this.game.getHouseguestById(targetId);
    if (!targetGuest) return;
    
    let message = "";
    let situationContext = "";
    
    switch (discussionType as StrategicDiscussionType) {
      case 'general_strategy':
        message = "I'd like to talk some strategy with you.";
        situationContext = `You approached ${targetName} to discuss general strategy.`;
        break;
        
      case 'suggest_target':
        // Get a potential target that isn't the player or the current conversation partner
        const potentialTargets = this.game.getActiveHouseguests()
          .filter(hg => hg.id !== player.id && hg.id !== targetId);
        
        if (potentialTargets.length === 0) {
          this.getLogger().info("There's no one else to target in the game.");
          return;
        }
        
        // Find someone with lowest relationship to the player
        potentialTargets.sort((a, b) => {
          const relationshipA = this.controller.relationshipSystem.getEffectiveRelationship(player.id, a.id);
          const relationshipB = this.controller.relationshipSystem.getEffectiveRelationship(player.id, b.id);
          return relationshipA - relationshipB;
        });
        
        const suggestedTarget = potentialTargets[0];
        message = `I think we should target ${suggestedTarget.name} next.`;
        situationContext = `You suggested targeting ${suggestedTarget.name} to ${targetName}.`;
        break;
        
      case 'vote_intentions':
        message = "How are you thinking of voting this week?";
        situationContext = `You asked ${targetName} about their voting plans.`;
        break;
        
      case 'final_two_deal':
        message = "I wanted to talk about potentially going to the final 2 together.";
        situationContext = `You proposed a final 2 deal to ${targetName}.`;
        break;
        
      case 'spread_rumor':
        // Get another houseguest to spread a rumor about
        const otherHouseguests = this.game.getActiveHouseguests()
          .filter(hg => hg.id !== player.id && hg.id !== targetId);
        
        if (otherHouseguests.length === 0) {
          this.getLogger().info("There's no one to spread rumors about.");
          return;
        }
        
        const rumorTarget = otherHouseguests[Math.floor(Math.random() * otherHouseguests.length)];
        
        // Generate a plausible rumor
        const rumors = [
          `${rumorTarget.name} mentioned targeting you soon.`,
          `${rumorTarget.name} doesn't trust you and has been talking about you behind your back.`,
          `${rumorTarget.name} is in a secret alliance with others.`,
          `${rumorTarget.name} told me they're going to nominate you if they win HoH.`
        ];
        
        const rumor = rumors[Math.floor(Math.random() * rumors.length)];
        message = `Just so you know, ${rumor}`;
        situationContext = `You spread a rumor to ${targetName} about ${rumorTarget.name}.`;
        break;
    }
    
    // Log the start of the conversation
    this.getLogger().info(`${situationContext}`);
    
    // Create dialogue context
    const dialogueContext = {
      speakerId: player.id,
      speakerName: player.name,
      message: message,
      situation: situationContext,
      phase: this.game.phase as GamePhase,
      week: this.game.week,
      gameContext: {
        hohName: this.getHohName(),
        nominees: this.getNomineeNames(),
        povWinner: this.getPovHolderName()
      },
      discussionType
    };
    
    // Send to AI system for response
    setTimeout(async () => {
      try {
        if (this.controller.aiSystem) {
          // Use the AI dialogue system
          const response = await this.controller.aiSystem.generateDialogueResponse(
            targetId,
            dialogueContext,
            this.game
          );
          
          // Display the response to the player
          this.getLogger().info(`${targetName} says: "${response.response}"`);
          
          // Handle special actions based on discussion type
          this.handlePostDiscussionEffects(player.id, targetId, discussionType as StrategicDiscussionType, response);
          
          // Apply relationship effects
          this.applyDialogueRelationshipEffects(player.id, targetId, response);
        } else {
          // Fallback generic responses by discussion type
          let response = "";
          
          switch (discussionType as StrategicDiscussionType) {
            case 'general_strategy':
              response = "I think we need to be careful about who's building power in the house.";
              break;
            case 'suggest_target':
              response = "Interesting suggestion. I'll think about it.";
              break;
            case 'vote_intentions':
              response = "I haven't fully decided yet, but I'm leaning toward voting with the house.";
              break;
            case 'final_two_deal':
              response = "I'd be open to that. Let's see how things develop.";
              break;
            case 'spread_rumor':
              response = "Really? That's concerning. Thanks for letting me know.";
              break;
          }
          
          this.getLogger().info(`${targetName} says: "${response}"`);
          
          // Apply basic relationship change
          this.controller.relationshipSystem.updateRelationship(
            player.id,
            targetId,
            1,
            `You had a strategic conversation with ${targetName}.`
          );
        }
      } catch (error) {
        this.getLogger().error(`Error generating dialogue: ${error}`);
        this.getLogger().info(`${targetName} says: "Let me think about that."`);
      }
    }, 500);
  }
  
  /**
   * Handle relationship building actions (compliment, apologize, etc.)
   */
  private async handleRelationshipBuilding(player: Houseguest, params: any): Promise<void> {
    const { targetId, targetName, actionType } = params;
    if (!targetId || !targetName || !actionType) return;
    
    const targetGuest = this.game.getHouseguestById(targetId);
    if (!targetGuest) return;
    
    let message = "";
    let situationContext = "";
    let baseRelationshipChange = 0;
    
    switch (actionType) {
      case 'compliment':
        message = "I just wanted to say that I really appreciate how you've been playing the game.";
        situationContext = `You complimented ${targetName}.`;
        baseRelationshipChange = 5;
        break;
        
      case 'apologize':
        message = "I wanted to apologize if I've done anything to upset you.";
        situationContext = `You apologized to ${targetName}.`;
        baseRelationshipChange = 3;
        break;
        
      case 'offer_help':
        message = "If you ever need someone to have your back in this game, I'm here
