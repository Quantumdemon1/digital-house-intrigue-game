
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
        message = "If you ever need someone to have your back in this game, I'm here for you.";
        situationContext = `You offered to help ${targetName}.`;
        baseRelationshipChange = 4;
        break;
    }
    
    // Log the action
    this.getLogger().info(`${situationContext}`);
    
    // Create dialogue context for AI response
    const dialogueContext = {
      speakerId: player.id,
      speakerName: player.name,
      message: message,
      situation: situationContext,
      phase: this.game.phase as GamePhase,
      week: this.game.week
    };
    
    // Process the relationship building action
    setTimeout(async () => {
      try {
        if (this.controller.aiSystem) {
          // Generate AI response
          const response = await this.controller.aiSystem.generateDialogueResponse(
            targetId,
            dialogueContext,
            this.game
          );
          
          // Display the response
          this.getLogger().info(`${targetName} says: "${response.response}"`);
          
          // Calculate effect based on AI response and relationship
          let multiplier = 1.0;
          
          if (response.thoughts && response.thoughts.includes('suspicious')) {
            multiplier = 0.5; // They're suspicious of your motives
          } else if (response.thoughts && response.thoughts.includes('appreciative')) {
            multiplier = 1.5; // They really appreciate it
          }
          
          // Apply relationship change with appropriate multiplier
          const finalChange = baseRelationshipChange * multiplier;
          this.controller.relationshipSystem.updateRelationship(
            player.id,
            targetId,
            finalChange,
            situationContext
          );
          
          // Reciprocal effect is smaller
          this.controller.relationshipSystem.updateRelationship(
            targetId,
            player.id,
            finalChange * 0.7,
            `${targetName} felt ${finalChange > 3 ? 'good' : 'okay'} about your interaction.`
          );
          
        } else {
          // Fallback responses
          const responses = [
            "Thanks, I appreciate that.",
            "That's nice of you to say.",
            "Thanks for telling me."
          ];
          const response = responses[Math.floor(Math.random() * responses.length)];
          this.getLogger().info(`${targetName} says: "${response}"`);
          
          // Apply standard relationship changes without AI 
          this.controller.relationshipSystem.updateRelationship(
            player.id,
            targetId,
            baseRelationshipChange,
            situationContext
          );
          
          // Reciprocal effect
          this.controller.relationshipSystem.updateRelationship(
            targetId,
            player.id,
            baseRelationshipChange * 0.7,
            `${targetName} reacted to your ${actionType}.`
          );
        }
      } catch (error) {
        this.getLogger().error(`Error generating response for ${actionType}: ${error}`);
        this.getLogger().info(`${targetName} nods in response.`);
        
        // Apply minimal effect on error
        this.controller.relationshipSystem.updateRelationship(
          player.id,
          targetId,
          baseRelationshipChange * 0.5,
          situationContext
        );
      }
    }, 500);
  }
  
  /**
   * Handle making a promise to another houseguest
   */
  private async handleMakePromise(player: Houseguest, params: any): Promise<void> {
    // Implementation for promise handling would go here
    // We'll use the game.promises array to track promises
    
    const { targetId, targetName } = params;
    if (!targetId || !targetName) return;
    
    const targetGuest = this.game.getHouseguestById(targetId);
    if (!targetGuest) return;
    
    const promiseType = params.promiseType || 'safety';
    const promiseDescription = params.promiseDescription || `You promised ${targetName} some form of ${promiseType}.`;
    
    // Create the promise object
    const newPromise: GamePromise = {
      id: `promise-${Date.now()}`,
      fromId: player.id,
      toId: targetId,
      type: promiseType as PromiseType,
      description: promiseDescription,
      madeOnWeek: this.game.week,
      status: 'pending',
      context: {
        initiallyBelieved: Math.random() > 0.3 // 70% chance they believe you initially
      }
    };
    
    // Add to promises array if it exists
    if (this.game.promises) {
      this.game.promises.push(newPromise);
      this.getLogger().info(`You made a promise to ${targetName}: ${promiseDescription}`);
      
      // Log the promise creation
      this.game.logEvent(
        'promise_made',
        `${player.name} made a promise to ${targetName}.`,
        [player.id, targetId],
        { promiseId: newPromise.id, promiseType }
      );
      
      // Create dialogue context
      const dialogueContext = {
        speakerId: player.id,
        speakerName: player.name,
        message: `I promise you that ${promiseDescription.toLowerCase()}`,
        situation: `You made a promise to ${targetName}.`,
        phase: this.game.phase as GamePhase,
        week: this.game.week
      };
      
      // Generate target response
      setTimeout(async () => {
        try {
          if (this.controller.aiSystem) {
            // Use AI for response
            const response = await this.controller.aiSystem.generateDialogueResponse(
              targetId,
              dialogueContext,
              this.game
            );
            
            this.getLogger().info(`${targetName} says: "${response.response}"`);
            
            // Update whether they believe you based on response
            if (response.thoughts) {
              const believesPromise = !response.thoughts.includes('distrust') && 
                                     !response.thoughts.includes('skeptical');
              
              newPromise.context.initiallyBelieved = believesPromise;
              
              // Apply appropriate relationship effect
              const relationshipChange = believesPromise ? 8 : 2;
              this.controller.relationshipSystem.updateRelationship(
                player.id,
                targetId,
                relationshipChange,
                `You made a promise to ${targetName}.`
              );
            }
          } else {
            // Fallback response
            const responses = [
              "I'll remember that promise.",
              "We'll see if you keep your word.",
              "I appreciate the promise."
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            this.getLogger().info(`${targetName} says: "${response}"`);
            
            // Apply standard relationship change
            this.controller.relationshipSystem.updateRelationship(
              player.id,
              targetId,
              5,
              `You made a promise to ${targetName}.`
            );
          }
        } catch (error) {
          this.getLogger().error(`Error generating response for promise: ${error}`);
          this.getLogger().info(`${targetName} nods, acknowledging your promise.`);
        }
      }, 500);
    } else {
      this.getLogger().warn("Promises system not initialized.");
    }
  }
  
  /**
   * Handle eavesdropping on other houseguests
   */
  private async handleEavesdrop(player: Houseguest): Promise<void> {
    // Get active houseguests in the current location who aren't the player
    const otherGuests = this.game.getActiveHouseguests().filter(hg => !hg.isPlayer);
    
    if (otherGuests.length < 2) {
      this.getLogger().info("There aren't enough houseguests around to eavesdrop on.");
      return;
    }
    
    // Determine success chance based on player stats and traits
    let successChance = 0.7; // Base 70% success chance
    
    // Adjust based on player stats if available
    if (player.stats && player.stats.social) {
      // Social skill improves chance
      successChance += (player.stats.social - 5) * 0.03; // Each point above/below 5 adds/subtracts 3%
    }
    
    // Further adjust based on traits - if we could check for "Sneaky" trait
    // Unfortunately we can't check for "Paranoid" trait as it doesn't exist in PersonalityTrait type
    if (player.personalityTraits && player.personalityTraits.includes("Sneaky")) {
      successChance += 0.1; // +10% for sneaky players
    }
    
    // Cap the chance
    successChance = Math.min(Math.max(successChance, 0.3), 0.9); // Between 30% and 90%
    
    // Determine if successful
    const isSuccessful = Math.random() < successChance;
    
    this.getLogger().info("You attempt to eavesdrop on a conversation...");
    
    // Process the result after a short delay
    setTimeout(() => {
      if (isSuccessful) {
        // Choose two random houseguests
        const shuffled = [...otherGuests].sort(() => 0.5 - Math.random());
        const [guest1, guest2] = shuffled.slice(0, 2);
        
        // Generate a plausible conversation
        this.generateEavesdroppedConversation(guest1, guest2);
        
        // Small risk of being caught
        const caughtChance = 0.15; // 15% chance of being caught
        if (Math.random() < caughtChance) {
          this.getLogger().info(`${guest1.name} suddenly notices you listening in!`);
          this.controller.relationshipSystem.updateRelationship(
            guest1.id, 
            player.id, 
            -10, 
            `${guest1.name} caught you eavesdropping.`
          );
          
          // They might tell the other person too
          if (Math.random() < 0.7) {
            this.controller.relationshipSystem.updateRelationship(
              guest2.id, 
              player.id, 
              -5, 
              `${guest1.name} told ${guest2.name} that you were eavesdropping.`
            );
          }
        }
        
        // Record the eavesdrop event
        this.controller.relationshipSystem.addRelationshipEvent(
          player.id,
          guest1.id,
          'eavesdropped',
          `You eavesdropped on ${guest1.name}'s conversation.`,
          0, // No direct relationship impact
          true // This event decays quickly
        );
      } else {
        // Failed attempt
        this.getLogger().info("You couldn't get close enough to hear anything useful.");
      }
    }, 800);
  }
  
  /**
   * Generate a plausible conversation between two houseguests for eavesdropping
   */
  private generateEavesdroppedConversation(guest1: Houseguest, guest2: Houseguest): void {
    // Get game context for relevant conversation topics
    const hoh = this.game.hohWinner ? this.game.getHouseguestById(this.game.hohWinner) : null;
    const nominees = this.game.nominees.map(id => this.game.getHouseguestById(id)).filter(Boolean);
    const povHolder = this.game.povWinner ? this.game.getHouseguestById(this.game.povWinner) : null;
    const player = this.game.houseguests.find(h => h.isPlayer);
    
    if (!player) return;
    
    // Choose a conversation type based on game phase
    const conversationTypes = [
      'targetDiscussion', // Discussing who to target
      'allianceCheck',   // Checking in on their alliance
      'gameAnalysis',    // Analyzing the current game state
      'playerEvaluation' // Evaluating a specific player
    ];
    
    const conversationType = conversationTypes[Math.floor(Math.random() * conversationTypes.length)];
    
    // Generate the conversation
    this.getLogger().info(`You overhear ${guest1.name} and ${guest2.name} talking...`);
    
    switch (conversationType) {
      case 'targetDiscussion': {
        // Choose a potential target - either player or another houseguest
        let targetPool = this.game.getActiveHouseguests().filter(hg => 
          hg.id !== guest1.id && hg.id !== guest2.id
        );
        
        // Increase chance it's about the player
        const usePlayerAsTarget = Math.random() < 0.4; // 40% chance
        const target = usePlayerAsTarget && player ? player : 
                     targetPool[Math.floor(Math.random() * targetPool.length)];
        
        if (!target) return;
        
        // Determine sentiment (positive or negative)
        const relationshipToTarget1 = this.controller.relationshipSystem.getEffectiveRelationship(guest1.id, target.id);
        const relationshipToTarget2 = this.controller.relationshipSystem.getEffectiveRelationship(guest2.id, target.id);
        const averageRelationship = (relationshipToTarget1 + relationshipToTarget2) / 2;
        
        const isPositive = averageRelationship > 15; // Positive if relationship is good
        
        // Generate conversation
        if (isPositive) {
          this.getLogger().info(`${guest1.name}: "I think we should keep ${target.name} safe this week."`);
          this.getLogger().info(`${guest2.name}: "Yeah, they've been good to us. We need to make sure they stay."`);
          
          if (target.id === player.id) {
            // This is valuable info for the player - they're safe with these two
            this.game.logEvent(
              'eavesdrop_intel',
              `${player.name} learned that ${guest1.name} and ${guest2.name} want to keep them safe.`,
              [player.id, guest1.id, guest2.id]
            );
          }
        } else {
          this.getLogger().info(`${guest1.name}: "I'm thinking ${target.name} needs to go soon."`);
          this.getLogger().info(`${guest2.name}: "I wouldn't be upset if they left. They're a threat to our game."`);
          
          if (target.id === player.id) {
            // This is valuable intel - they're targeting the player
            this.game.logEvent(
              'eavesdrop_intel',
              `${player.name} learned that ${guest1.name} and ${guest2.name} are considering targeting them.`,
              [player.id, guest1.id, guest2.id]
            );
          }
        }
        break;
      }
      
      case 'allianceCheck': {
        // Check if these two are in an alliance
        const areInAlliance = this.controller.allianceSystem && 
                             this.controller.allianceSystem.areInSameAlliance(guest1.id, guest2.id);
        
        if (areInAlliance) {
          // They're discussing their alliance
          this.getLogger().info(`${guest1.name}: "How are you feeling about our alliance right now?"`);
          this.getLogger().info(`${guest2.name}: "I think we're in a good position, but we need to be careful about who we trust."`);
          
          // Potentially reveal another alliance member
          if (this.controller.allianceSystem) {
            const alliances = this.controller.allianceSystem.getAlliancesWithBothMembers(guest1.id, guest2.id);
            
            if (alliances.length > 0 && Math.random() < 0.5) {
              const alliance = alliances[0];
              const otherMembers = alliance.members.filter(m => 
                m.id !== guest1.id && m.id !== guest2.id && !m.isPlayer
              );
              
              if (otherMembers.length > 0) {
                const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
                this.getLogger().info(`${guest1.name}: "I spoke with ${randomMember.name} earlier, they're still with us."`);
                
                // Log this intelligence
                this.game.logEvent(
                  'eavesdrop_intel',
                  `${player.name} learned that ${guest1.name}, ${guest2.name}, and ${randomMember.name} may be in an alliance.`,
                  [player.id, guest1.id, guest2.id, randomMember.id]
                );
              }
            }
          }
        } else {
          // They're discussing forming an alliance
          this.getLogger().info(`${guest1.name}: "I've been thinking... we should work together more closely."`);
          this.getLogger().info(`${guest2.name}: "Like an alliance? I'd be interested in that."`);
          
          // Potentially discuss including/excluding the player
          if (Math.random() < 0.3) {
            const includePlayer = Math.random() < 0.4; // 40% chance they want to include player
            
            if (includePlayer) {
              this.getLogger().info(`${guest1.name}: "I was thinking we could bring in ${player.name} too."`);
            } else {
              this.getLogger().info(`${guest1.name}: "But I don't think we should include ${player.name}."`);
            }
            
            // Log this intelligence
            this.game.logEvent(
              'eavesdrop_intel',
              `${player.name} learned that ${guest1.name} and ${guest2.name} are discussing forming an alliance` + 
              (includePlayer ? " and might want to include them." : " but don't want to include them."),
              [player.id, guest1.id, guest2.id]
            );
          }
        }
        break;
      }
      
      case 'gameAnalysis': {
        // Discussion about the current game state
        if (hoh) {
          this.getLogger().info(`${guest1.name}: "With ${hoh.name} as HOH, we need to be careful."`);
          
          const hohRelationship1 = this.controller.relationshipSystem.getEffectiveRelationship(guest1.id, hoh.id);
          const hohRelationship2 = this.controller.relationshipSystem.getEffectiveRelationship(guest2.id, hoh.id);
          
          if (hohRelationship1 < 0 || hohRelationship2 < 0) {
            // They're worried about the HoH
            this.getLogger().info(`${guest2.name}: "I'm worried. I don't think we're safe this week."`);
          } else {
            // They're confident about the HoH
            this.getLogger().info(`${guest2.name}: "I think we're good. ${hoh.name} and I had a good talk earlier."`);
          }
        } else if (nominees.length > 0) {
          // Discussion about the nominees
          const nominee = nominees[0];
          this.getLogger().info(`${guest1.name}: "Do you think ${nominee.name} is going home?"`);
          
          if (Math.random() < 0.5) {
            this.getLogger().info(`${guest2.name}: "Most likely. The house seems pretty decided."`);
          } else {
            this.getLogger().info(`${guest2.name}: "I'm not sure. There might be enough votes to keep them."`);
          }
        } else {
          // General game discussion
          this.getLogger().info(`${guest1.name}: "The game is getting intense now."`);
          this.getLogger().info(`${guest2.name}: "Yeah, we need to start thinking about our end game."`);
        }
        break;
      }
      
      case 'playerEvaluation': {
        // Choose a player to evaluate
        let targetPool = this.game.getActiveHouseguests().filter(hg => 
          hg.id !== guest1.id && hg.id !== guest2.id
        );
        
        // 50% chance they're talking about the player
        const evaluatePlayer = Math.random() < 0.5;
        const target = evaluatePlayer && player ? player : 
                     targetPool[Math.floor(Math.random() * targetPool.length)];
        
        if (!target) return;
        
        // Determine sentiment based on relationship
        const relationshipToTarget1 = this.controller.relationshipSystem.getEffectiveRelationship(guest1.id, target.id);
        const relationshipToTarget2 = this.controller.relationshipSystem.getEffectiveRelationship(guest2.id, target.id);
        
        // Choose first speaker based on stronger feelings
        const firstSpeaker = Math.abs(relationshipToTarget1) > Math.abs(relationshipToTarget2) ? guest1 : guest2;
        const secondSpeaker = firstSpeaker === guest1 ? guest2 : guest1;
        
        const relationship = firstSpeaker === guest1 ? relationshipToTarget1 : relationshipToTarget2;
        
        if (relationship > 20) {
          // Very positive view
          this.getLogger().info(`${firstSpeaker.name}: "I really trust ${target.name}. They've been loyal."`);
          this.getLogger().info(`${secondSpeaker.name}: "Yeah, they're playing a good game."`);
        } else if (relationship > 0) {
          // Somewhat positive
          this.getLogger().info(`${firstSpeaker.name}: "What do you think about ${target.name}?"`);
          this.getLogger().info(`${secondSpeaker.name}: "They're okay. I don't have any issues with them right now."`);
        } else if (relationship > -20) {
          // Somewhat negative
          this.getLogger().info(`${firstSpeaker.name}: "I don't know if I can trust ${target.name}."`);
          this.getLogger().info(`${secondSpeaker.name}: "Be careful what you tell them."`);
        } else {
          // Very negative
          this.getLogger().info(`${firstSpeaker.name}: "I can't stand ${target.name}. They're playing everyone."`);
          this.getLogger().info(`${secondSpeaker.name}: "I know. We need to be strategic about this."`);
        }
        
        // Log this intelligence if it's about the player
        if (target.id === player.id) {
          this.game.logEvent(
            'eavesdrop_intel',
            `${player.name} overheard ${firstSpeaker.name} and ${secondSpeaker.name} discussing them.`,
            [player.id, firstSpeaker.id, secondSpeaker.id],
            { sentiment: relationship > 0 ? 'positive' : 'negative' }
          );
        }
        break;
      }
    }
  }
  
  /**
   * Apply relationship effects based on dialogue response
   */
  private applyDialogueRelationshipEffects(playerId: string, targetId: string, response: any): void {
    // Check if response has the necessary fields
    if (!response || !this.controller.relationshipSystem) return;
    
    // Default values
    let relationshipChange = 1; // Small positive effect by default
    
    // If we have AI-generated thoughts, use them for better effects
    if (response.thoughts) {
      if (response.thoughts.includes('hostile') || response.thoughts.includes('angry')) {
        relationshipChange = -5; // Strong negative
      } else if (response.thoughts.includes('suspicious') || response.thoughts.includes('distrustful')) {
        relationshipChange = -2; // Mild negative
      } else if (response.thoughts.includes('neutral')) {
        relationshipChange = 0; // No change
      } else if (response.thoughts.includes('friendly') || response.thoughts.includes('appreciative')) {
        relationshipChange = 3; // Positive
      } else if (response.thoughts.includes('very friendly') || response.thoughts.includes('trusted ally')) {
        relationshipChange = 5; // Strong positive
      }
    }
    
    // Apply the relationship change
    if (relationshipChange !== 0) {
      this.controller.relationshipSystem.updateRelationship(
        playerId,
        targetId,
        relationshipChange,
        `You had a conversation with ${this.game.getHouseguestById(targetId)?.name || 'someone'}.`
      );
      
      // Reciprocal effect - they also update relationship with player
      // Usually slightly less impactful to avoid rapid relationship build
      this.controller.relationshipSystem.updateRelationship(
        targetId,
        playerId,
        relationshipChange * 0.8,
        `Had a conversation with ${this.game.getHouseguestById(playerId)?.name || 'someone'}.`
      );
    }
  }
  
  /**
   * Handle post-discussion effects based on discussion type
   */
  private handlePostDiscussionEffects(
    playerId: string, 
    targetId: string, 
    discussionType: StrategicDiscussionType, 
    response: any
  ): void {
    if (!this.controller.relationshipSystem) return;
    
    // Get player and target
    const player = this.game.getHouseguestById(playerId);
    const target = this.game.getHouseguestById(targetId);
    if (!player || !target) return;
    
    switch (discussionType) {
      case 'final_two_deal': {
        // Check if they seemed to accept the deal
        const accepted = response.thoughts && 
                       (response.thoughts.includes('interested') || 
                        response.thoughts.includes('agree') || 
                        response.thoughts.includes('accept'));
        
        if (accepted) {
          // They accepted - create a promise for a final 2 deal
          if (this.game.promises) {
            const newPromise: GamePromise = {
              id: `promise-f2-${Date.now()}`,
              fromId: playerId,
              toId: targetId,
              type: 'final_2',
              description: `Take ${target.name} to final 2 if possible`,
              madeOnWeek: this.game.week,
              status: 'pending',
              context: {
                reciprocal: true, // Both players made the promise
                initiallyBelieved: true
              }
            };
            
            // Create the reciprocal promise
            const reciprocalPromise: GamePromise = {
              id: `promise-f2-recip-${Date.now()}`,
              fromId: targetId,
              toId: playerId,
              type: 'final_2',
              description: `Take ${player.name} to final 2 if possible`,
              madeOnWeek: this.game.week,
              status: 'pending',
              context: {
                reciprocal: true,
                relatedPromiseId: newPromise.id,
                initiallyBelieved: true
              }
            };
            
            // Link the promises
            newPromise.context.relatedPromiseId = reciprocalPromise.id;
            
            // Add both promises
            this.game.promises.push(newPromise, reciprocalPromise);
            
            // Log the alliance formation
            this.game.logEvent(
              'final_2_deal',
              `${player.name} and ${target.name} made a final 2 deal.`,
              [playerId, targetId],
              { promiseIds: [newPromise.id, reciprocalPromise.id] }
            );
            
            // Major relationship boost
            this.controller.relationshipSystem.addRelationshipEvent(
              playerId,
              targetId,
              'alliance_formed',
              `You made a final 2 deal with ${target.name}.`,
              15,
              false // This is a significant event that shouldn't decay
            );
            
            // Reciprocal effect
            this.controller.relationshipSystem.addRelationshipEvent(
              targetId,
              playerId,
              'alliance_formed',
              `${player.name} made a final 2 deal with you.`,
              15,
              false
            );
          }
        } else {
          // They rejected or were noncommittal
          this.controller.relationshipSystem.updateRelationship(
            playerId,
            targetId,
            -2,
            `${target.name} wasn't enthusiastic about your final 2 proposal.`
          );
        }
        break;
      }
      
      case 'suggest_target': {
        // Check if they agree with the target
        const agreed = response.thoughts && 
                     (response.thoughts.includes('agree') || 
                      response.thoughts.includes('good target'));
        
        if (agreed) {
          // Record alignment on targeting
          this.controller.relationshipSystem.addRelationshipEvent(
            playerId,
            targetId,
            'strategy_discussion',
            `${target.name} agreed with your targeting suggestion.`,
            5,
            true
          );
        }
        break;
      }
      
      case 'spread_rumor': {
        // Get the rumor target
        const rumorTargetId = response.params?.rumorTargetId;
        const rumorTarget = rumorTargetId ? this.game.getHouseguestById(rumorTargetId) : null;
        
        if (!rumorTarget) break;
        
        // Check if they believed the rumor
        const believedRumor = !response.thoughts || 
                            (!response.thoughts.includes('skeptical') && 
                             !response.thoughts.includes('doubt'));
        
        if (believedRumor) {
          // They believed it - damage relationship with rumor target
          this.controller.relationshipSystem.updateRelationship(
            targetId,
            rumorTargetId,
            -7,
            `${target.name} heard negative rumors about ${rumorTarget.name} from ${player.name}.`
          );
          
          // Log the rumor spread success
          this.game.logEvent(
            'rumor_spread',
            `${player.name} successfully spread a rumor about ${rumorTarget.name} to ${target.name}.`,
            [playerId, targetId, rumorTargetId],
            { success: true }
          );
          
          // 30% chance the rumor target finds out
          if (Math.random() < 0.3) {
            setTimeout(() => {
              this.getLogger().info(`${rumorTarget.name} found out you spread rumors about them to ${target.name}!`);
              this.controller.relationshipSystem.recordBetrayal(
                playerId,
                rumorTargetId,
                `${player.name} spread harmful rumors about ${rumorTarget.name}.`
              );
            }, 1000); // Delay this revelation
          }
        } else {
          // They didn't believe it - slight negative impact
          this.controller.relationshipSystem.updateRelationship(
            targetId,
            playerId,
            -3,
            `${target.name} was skeptical of rumors you spread.`
          );
          
          // Log the failed rumor
          this.game.logEvent(
            'rumor_spread',
            `${player.name} tried to spread a rumor about ${rumorTarget.name} but ${target.name} didn't believe it.`,
            [playerId, targetId, rumorTargetId],
            { success: false }
          );
        }
        break;
      }
    }
  }
  
  /**
   * Show dialogue options for player to respond
   * (Would be expanded in UI implementation)
   */
  private showDialogueOptions(playerId: string, targetId: string, response: any): void {
    // This is a stub for future implementation
    // In a complete implementation, this would show UI options for the player to respond
  }
  
  /**
   * Handle alliance meeting discussion
   */
  private handleAllianceMeetingDiscussion(alliance: any, members: Houseguest[]): void {
    if (members.length === 0) {
      this.getLogger().info("No other alliance members are present.");
      return;
    }
    
    // Choose a discussion topic for the alliance meeting
    const discussionTopics = [
      'target_discussion',   // Who to target
      'vote_coordination',   // How to vote
      'loyalty_check',       // Check for loyalty issues
      'competition_strategy' // Strategy for winning comps
    ];
    
    const topic = discussionTopics[Math.floor(Math.random() * discussionTopics.length)];
    const player = this.game.houseguests.find(h => h.isPlayer);
    if (!player) return;
    
    // Have alliance members discuss the topic
    this.getLogger().info(`The alliance discusses ${topic.replace('_', ' ')}.`);
    
    switch (topic) {
      case 'target_discussion': {
        // Choose a potential target
        const potentialTargets = this.game.getActiveHouseguests().filter(hg => 
          !alliance.members.some((m: any) => m.id === hg.id)
        );
        
        if (potentialTargets.length > 0) {
          const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
          
          // First alliance member suggests the target
          const firstMember = members[0];
          this.getLogger().info(`${firstMember.name} says: "I think we should target ${target.name} next week."`);
          
          // Get consensus from others
          const consensusMessages = [
            `"I agree, they're dangerous."`,
            `"That's a good target."`,
            `"They're a threat to our alliance."`
          ];
          
          members.slice(1).forEach(member => {
            const message = consensusMessages[Math.floor(Math.random() * consensusMessages.length)];
            this.getLogger().info(`${member.name} says: ${message}`);
          });
          
          // Update relationship between target and alliance members
          // This represents the alliance's intention to target them
          alliance.members.forEach((member: any) => {
            if (!member.isPlayer) {
              this.controller.relationshipSystem.updateRelationship(
                member.id,
                target.id,
                -3,
                `Alliance targeting intention.`
              );
            }
          });
          
          // Log the alliance targeting
          this.game.logEvent(
            'alliance_targeting',
            `${alliance.name} alliance plans to target ${target.name}.`,
            [...alliance.members.map((m: any) => m.id), target.id]
          );
        }
        break;
      }
      
      case 'vote_coordination': {
        if (this.game.nominees.length > 0) {
          // Discuss current nominees and voting plans
          const nominee1Id = this.game.nominees[0];
          const nominee2Id = this.game.nominees.length > 1 ? this.game.nominees[1] : null;
          
          const nominee1 = nominee1Id ? this.game.getHouseguestById(nominee1Id) : null;
          const nominee2 = nominee2Id ? this.game.getHouseguestById(nominee2Id) : null;
          
          if (nominee1) {
            // Check if either nominee is in alliance
            const nominee1InAlliance = alliance.members.some((m: any) => m.id === nominee1Id);
            const nominee2InAlliance = nominee2 && alliance.members.some((m: any) => m.id === nominee2Id);
            
            if (nominee1InAlliance || nominee2InAlliance) {
              // Alliance member nominated - discuss saving them
              const nominatedMember = nominee1InAlliance ? nominee1 : nominee2;
              const otherNominee = nominee1InAlliance ? nominee2 : nominee1;
              
              this.getLogger().info(`${members[0].name} says: "We need to save ${nominatedMember.name}. Everyone votes to evict ${otherNominee?.name}."`);
              members.slice(1).forEach(member => {
                this.getLogger().info(`${member.name} agrees.`);
              });
              
              // Log the vote coordination
              this.game.logEvent(
                'alliance_vote_coordination',
                `${alliance.name} alliance plans to save ${nominatedMember.name}.`,
                [...alliance.members.map((m: any) => m.id), nominatedMember.id]
              );
            } else {
              // Neither nominee in alliance - pick one to target
              const target = Math.random() < 0.5 ? nominee1 : (nominee2 || nominee1);
              
              this.getLogger().info(`${members[0].name} says: "I think we should all vote to evict ${target.name}."`);
              members.slice(1).forEach(member => {
                this.getLogger().info(`${member.name} nods in agreement.`);
              });
              
              // Log the vote coordination
              this.game.logEvent(
                'alliance_vote_coordination',
                `${alliance.name} alliance plans to evict ${target.name}.`,
                [...alliance.members.map((m: any) => m.id), target.id]
              );
            }
          }
        } else {
          // No nominees yet, general voting strategy
          this.getLogger().info(`${members[0].name} says: "We need to make sure we all vote together this week."`);
          members.slice(1).forEach(member => {
            this.getLogger().info(`${member.name} agrees.`);
          });
        }
        break;
      }
      
      case 'loyalty_check': {
        // Check if anyone in the alliance seems less loyal
        let leastLoyalMember = null;
        let lowestLoyalty = Infinity;
        
        // Calculate average relationship within alliance
        alliance.members.forEach((member: any) => {
          if (!member.isPlayer) {
            let totalRelationship = 0;
            let count = 0;
            
            alliance.members.forEach((otherMember: any) => {
              if (member.id !== otherMember.id) {
                const relationship = this.controller.relationshipSystem.getEffectiveRelationship(
                  member.id, 
                  otherMember.id
                );
                totalRelationship += relationship;
                count++;
              }
            });
            
            const averageRelationship = count > 0 ? totalRelationship / count : 0;
            
            // Find member with lowest average relationship to others
            if (averageRelationship < lowestLoyalty) {
              lowestLoyalty = averageRelationship;
              leastLoyalMember = member;
            }
          }
        });
        
        // Generate discussion based on loyalty check
        if (leastLoyalMember && lowestLoyalty < 15) { // If someone seems disloyal
          const firstSpeaker = members.find(m => m.id !== leastLoyalMember.id) || members[0];
          
          if (leastLoyalMember.isPlayer) {
            // If player seems least loyal, discuss behind their back
            this.getLogger().info(`${firstSpeaker.name} seems to be watching you carefully during the meeting.`);
            this.getLogger().info(`You notice ${members[0].name} and ${members[1]?.name || 'others'} whispering at one point.`);
            
            // Log suspicion
            this.game.logEvent(
              'alliance_loyalty_questioned',
              `${player.name}'s loyalty to ${alliance.name} seems to be in question.`,
              [player.id, ...members.map(m => m.id)]
            );
          } else if (!members.some(m => m.id === leastLoyalMember.id)) {
            // If least loyal member isn't present, discuss them
            this.getLogger().info(`${firstSpeaker.name} says: "Is everyone sure about ${leastLoyalMember.name}'s loyalty to us?"`);
            this.getLogger().info(`${members[0].name} says: "I've noticed they've been spending time with ${this.getRandomNonAllianceName(alliance)}."`);
            
            // Log suspicion
            this.game.logEvent(
              'alliance_loyalty_questioned',
              `${leastLoyalMember.name}'s loyalty to ${alliance.name} is being questioned.`,
              [leastLoyalMember.id, ...members.map(m => m.id)]
            );
          } else {
            // General loyalty discussion
            this.getLogger().info(`${firstSpeaker.name} says: "We need to stay loyal to each other. The other side is trying to split us up."`);
            members.forEach(member => {
              if (member.id !== firstSpeaker.id) {
                this.getLogger().info(`${member.name} says: "Absolutely, I'm with this alliance 100%."`);
              }
            });
          }
        } else {
          // Alliance seems solid
          this.getLogger().info(`${members[0].name} says: "Our alliance is strong. We need to keep it that way."`);
          members.slice(1).forEach(member => {
            this.getLogger().info(`${member.name} says: "I'm loyal to this group all the way."`);
          });
          
          // Log alliance strength
          this.game.logEvent(
            'alliance_loyalty_proven',
            `${alliance.name} alliance reaffirms their loyalty to each other.`,
            [...alliance.members.map((m: any) => m.id)]
          );
          
          // Slight boost to alliance stability
          if (typeof alliance.stability === 'number') {
            alliance.stability = Math.min(100, alliance.stability + 5);
          }
        }
        break;
      }
      
      case 'competition_strategy': {
        // Discuss competition strategy
        const nextCompType = this.game.phase === 'SocialInteraction' ? 'HOH' : 'POV';
        
        // Find strongest competitor in alliance for this comp type
        let strongestMember = members[0];
        let highestStat = 0;
        
        members.forEach(member => {
          const stat = member.stats ? 
            (nextCompType === 'HOH' ? 
              (member.stats.physical + member.stats.mental + member.stats.endurance) / 3 : 
              member.stats.competition) : 
            5; // Default if no stats
          
          if (stat > highestStat) {
            highestStat = stat;
            strongestMember = member;
          }
        });
        
        // Discuss who should win
        this.getLogger().info(`${members[0].name} says: "For the next ${nextCompType} competition, we need to make sure one of us wins."`);
        
        if (strongestMember.isPlayer) {
          // Player is strongest
          this.getLogger().info(`${members[0].name} looks at you and says: "You're good at competitions. We're counting on you."`);
        } else {
          // AI houseguest is strongest
          this.getLogger().info(`${members[0].name} says: "${strongestMember.name} has the best chance. If you win, use it to help the alliance."`);
        }
        
        // Discuss throwing competitions
        if (alliance.members.length > 3) {
          const shouldThrow = Math.random() < 0.4; // 40% chance of suggesting throwing
          
          if (shouldThrow) {
            const targetToAvoidHoH = alliance.members.find((m: any) => !m.isPlayer);
            
            if (targetToAvoidHoH) {
              this.getLogger().info(`${members[0].name} says: "It might be smart for ${targetToAvoidHoH.name} to lay low and not win this one."`);
            }
          }
        }
        
        // Log the strategy discussion
        this.game.logEvent(
          'alliance_competition_strategy',
          `${alliance.name} alliance discusses competition strategy.`,
          [...alliance.members.map((m: any) => m.id)]
        );
        break;
      }
    }
    
    // Strengthen alliance relationships after meeting
    alliance.members.forEach((member1: any) => {
      alliance.members.forEach((member2: any) => {
        if (member1.id !== member2.id) {
          this.controller.relationshipSystem.updateRelationship(
            member1.id,
            member2.id,
            2,
            `Alliance meeting strengthened relationship.`
          );
        }
      });
    });
    
    // Add strategic event for alliance members
    alliance.members.forEach((member: any) => {
      this.controller.relationshipSystem.addRelationshipEvent(
        player.id,
        member.id,
        'alliance_meeting',
        `You held an alliance meeting with ${alliance.name}.`,
        3,
        true
      );
    });
  }
  
  /**
   * Get promises between two houseguests (in either direction)
   */
  private getPromisesBetween(guest1Id: string, guest2Id: string): GamePromise[] {
    if (!this.game.promises) return [];
    
    return this.game.promises.filter(p => 
      (p.fromId === guest1Id && p.toId === guest2Id) ||
      (p.fromId === guest2Id && p.toId === guest1Id)
    );
  }
  
  /**
   * Display all promises related to a player
   */
  private displayPlayerPromises(playerId: string): void {
    if (!this.game.promises) {
      this.getLogger().info("No promises have been made yet.");
      return;
    }
    
    // Get promises made by the player
    const promisesMade = this.game.promises.filter(p => p.fromId === playerId);
    
    // Get promises made to the player
    const promisesReceived = this.game.promises.filter(p => p.toId === playerId);
    
    this.getLogger().info("--- Your Promises ---");
    
    if (promisesMade.length === 0) {
      this.getLogger().info("You haven't made any promises yet.");
    } else {
      this.getLogger().info("Promises you've made:");
      promisesMade.forEach(promise => {
        const targetName = this.game.getHouseguestById(promise.toId)?.name || 'Unknown';
        const status = promise.status === 'pending' ? 'Active' : 
                      promise.status === 'kept' ? 'Kept' : 'Broken';
                      
        this.getLogger().info(`- To ${targetName}: ${promise.description} (${status})`);
      });
    }
    
    if (promisesReceived.length === 0) {
      this.getLogger().info("\nNo one has made promises to you yet.");
    } else {
      this.getLogger().info("\nPromises made to you:");
      promisesReceived.forEach(promise => {
        const fromName = this.game.getHouseguestById(promise.fromId)?.name || 'Unknown';
        const status = promise.status === 'pending' ? 'Active' : 
                      promise.status === 'kept' ? 'Kept' : 'Broken';
                      
        this.getLogger().info(`- From ${fromName}: ${promise.description} (${status})`);
      });
    }
  }
  
  /**
   * Get a random name that's not in the alliance for narrative purposes
   */
  private getRandomNonAllianceName(alliance: any): string {
    const nonAllianceHouseguests = this.game.getActiveHouseguests().filter(
      houseguest => !alliance.members.some((m: any) => m.id === houseguest.id)
    );
    
    if (nonAllianceHouseguests.length > 0) {
      return nonAllianceHouseguests[Math.floor(Math.random() * nonAllianceHouseguests.length)].name;
    }
    
    return "someone else";
  }
  
  /**
   * Convert relationship score to a descriptive string
   */
  private describeRelationship(score: number): string {
    if (score >= 50) return "Close Ally";
    if (score >= 30) return "Trusted Friend";
    if (score >= 15) return "Friend";
    if (score >= 5) return "Friendly";
    if (score > -5) return "Neutral";
    if (score > -15) return "Wary";
    if (score > -30) return "Distrustful";
    if (score > -50) return "Enemy";
    return "Bitter Enemy";
  }
  
  /**
   * Helper for logging
   */
  private getHohName(): string {
    if (!this.game.hohWinner) return "Nobody";
    const hoh = this.game.getHouseguestById(this.game.hohWinner);
    return hoh ? hoh.name : "Unknown";
  }
  
  /**
   * Helper for logging
   */
  private getNomineeNames(): string[] {
    return this.game.nominees
      .map(id => {
        const houseguest = this.game.getHouseguestById(id);
        return houseguest ? houseguest.name : "Unknown";
      });
  }
  
  /**
   * Helper for logging
   */
  private getPovHolderName(): string {
    if (!this.game.povWinner) return "Nobody";
    const pov = this.game.getHouseguestById(this.game.povWinner);
    return pov ? pov.name : "Unknown";
  }
}
