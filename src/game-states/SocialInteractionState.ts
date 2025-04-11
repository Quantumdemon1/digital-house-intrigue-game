
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
import { Promise, PromiseType, PromiseStatus } from '../models/promise';

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
        message = "If you ever need someone to have your back in this game, I'm here.";
        situationContext = `You offered help to ${targetName}.`;
        baseRelationshipChange = 4;
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
      week: this.game.week
    };
    
    // Apply immediate relationship boost (will be further modified by response)
    this.controller.relationshipSystem.updateRelationship(
      player.id,
      targetId,
      baseRelationshipChange,
      situationContext
    );
    
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
          
          // Apply additional relationship effects based on tone
          this.applyDialogueRelationshipEffects(player.id, targetId, response);
        } else {
          // Fallback generic responses by action type
          let response = "";
          
          switch (actionType) {
            case 'compliment':
              response = "That means a lot to me. Thank you for saying that.";
              break;
            case 'apologize':
              response = "I appreciate the apology. It's all good between us.";
              break;
            case 'offer_help':
              response = "I appreciate that. It's good to know I have people I can count on.";
              break;
          }
          
          this.getLogger().info(`${targetName} says: "${response}"`);
          
          // Apply reciprocal relationship change
          this.controller.relationshipSystem.updateRelationship(
            targetId,
            player.id,
            Math.floor(baseRelationshipChange * 0.8), // Slightly less than what player gave
            `${targetName} appreciated your ${actionType}.`
          );
        }
      } catch (error) {
        this.getLogger().error(`Error generating dialogue: ${error}`);
        this.getLogger().info(`${targetName} nods but doesn't say much.`);
      }
    }, 500);
  }
  
  /**
   * Handle making promises to other houseguests
   */
  private async handleMakePromise(player: Houseguest, params: any): Promise<void> {
    const { targetId, targetName } = params;
    if (!targetId || !targetName) return;
    
    const targetGuest = this.game.getHouseguestById(targetId);
    if (!targetGuest) return;
    
    // Define promise types
    const promiseTypes = [
      { 
        type: 'safety', 
        description: `I promise not to nominate you next time I'm HoH.`,
        gameImpact: 'high' 
      },
      { 
        type: 'vote', 
        description: `I promise to vote how you want this week.`,
        gameImpact: 'medium' 
      },
      { 
        type: 'final_2', 
        description: `I promise to take you to the final 2 if I get the chance.`,
        gameImpact: 'high' 
      },
      { 
        type: 'alliance_loyalty', 
        description: `I promise to stay loyal to our alliance.`,
        gameImpact: 'medium' 
      },
      { 
        type: 'information', 
        description: `I promise to share any information I learn with you.`,
        gameImpact: 'low' 
      }
    ];
    
    // Log promise options
    this.getLogger().info(`What type of promise do you want to make to ${targetName}?`);
    promiseTypes.forEach((promise, index) => {
      this.getLogger().info(`${index + 1}. ${promise.description} (${promise.gameImpact} impact)`);
    });
    
    // In a real implementation, this would be a UI choice
    // For now, simulate a choice with the first option
    const selectedPromise = promiseTypes[0];
    
    setTimeout(() => {
      this.getLogger().info(`You tell ${targetName}: "${selectedPromise.description}"`);
      
      // Create the promise object
      const newPromise: Promise = {
        id: `promise-${Date.now()}`,
        fromId: player.id,
        toId: targetId,
        type: selectedPromise.type as PromiseType,
        description: selectedPromise.description,
        madeOnWeek: this.game.week,
        status: 'pending',
        context: {}
      };
      
      // Add promise to game state
      this.addPromise(newPromise);
      
      // Get AI response to the promise
      setTimeout(async () => {
        try {
          if (this.controller.aiSystem) {
            // Create dialogue context for promise
            const dialogueContext = {
              speakerId: player.id,
              speakerName: player.name,
              message: selectedPromise.description,
              situation: `You made a promise to ${targetName}.`,
              phase: this.game.phase as GamePhase,
              week: this.game.week,
              promiseType: selectedPromise.type
            };
            
            // Get AI response
            const response = await this.controller.aiSystem.generateDialogueResponse(
              targetId,
              dialogueContext, 
              this.game
            );
            
            // Display the response
            this.getLogger().info(`${targetName} says: "${response.response}"`);
            
            // Check if they believe you based on internal thoughts
            const believesPromise = !response.thoughts.toLowerCase().includes("don't trust") && 
                                  !response.thoughts.toLowerCase().includes("lying") &&
                                  !response.thoughts.toLowerCase().includes("doubt");
            
            // Apply relationship effect based on whether they believe you
            const relationshipChange = believesPromise ? 5 : 2;
            
            // Record the belief in the promise context
            newPromise.context.initiallyBelieved = believesPromise;
            
            this.controller.relationshipSystem.updateRelationship(
              player.id,
              targetId,
              relationshipChange,
              `You made a promise to ${targetName}.`
            );
            
            if (believesPromise) {
              this.getLogger().info(`${targetName} seems to trust your promise.`);
            } else {
              this.getLogger().info(`${targetName} seems skeptical of your promise.`);
            }
          } else {
            // Fallback without AI
            const responses = [
              "I appreciate that. I'll remember it.",
              "That means a lot to me.",
              "I'm counting on you to keep your word."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.getLogger().info(`${targetName} says: "${randomResponse}"`);
            
            // Apply relationship effect
            this.controller.relationshipSystem.updateRelationship(
              player.id,
              targetId,
              4,
              `You made a promise to ${targetName}.`
            );
          }
        } catch (error) {
          this.getLogger().error(`Error in promise dialogue: ${error}`);
          this.getLogger().info(`${targetName} nods silently, considering your promise.`);
        }
      }, 800);
    }, 500);
  }
  
  /**
   * Handle eavesdropping on conversations
   */
  private async handleEavesdrop(player: Houseguest): Promise<void> {
    this.getLogger().info("You try to eavesdrop on nearby conversations...");
    
    // Get houseguests in the current location (excluding player)
    const presentGuests = this.game.getActiveHouseguests().filter(hg => !hg.isPlayer);
    
    if (presentGuests.length < 2) {
      this.getLogger().info("There aren't enough people here having conversations to eavesdrop on.");
      return;
    }
    
    // Calculate success chance based on player's stats
    // If we had a stealth stat, we'd use it here
    // For now, use a combination of social and mental
    const baseStealth = (player.stats.social + player.stats.mental) / 2;
    const stealthModifier = baseStealth / 10; // 0.1 to 1.0
    
    // Base chance is 50%, modified by stealth
    const successChance = 0.5 + (stealthModifier * 0.3); // 50-80% based on stats
    
    // Select random pair of houseguests
    const guest1 = presentGuests[Math.floor(Math.random() * presentGuests.length)];
    let guest2;
    do {
      guest2 = presentGuests[Math.floor(Math.random() * presentGuests.length)];
    } while (guest2.id === guest1.id);
    
    // Check for paranoid trait which increases detection chance
    const isParanoid = guest1.traits.includes('Paranoid') || guest2.traits.includes('Paranoid');
    const detectionChance = isParanoid ? 0.4 : 0.2;
    
    setTimeout(() => {
      // Check if player succeeds at eavesdropping
      if (Math.random() <= successChance) {
        // Success - player overhears something valuable
        const conversationTypes = [
          {
            type: 'nomination_target',
            message: `I'm thinking of putting ${this.getRandomNonAllyName(guest1.id)} on the block if I win HoH.`
          },
          {
            type: 'alliance_discussion',
            message: `I think we need to make sure our alliance stays solid. We can't trust ${this.getRandomNonAllyName(guest1.id)}.`
          },
          {
            type: 'vote_plans',
            message: `I'm planning to vote out ${this.getRandomNomineeName()} this week.`
          },
          {
            type: 'player_assessment',
            message: `I don't trust ${player.name}. I think we need to watch out for them.`
          }
        ];
        
        const conversation = conversationTypes[Math.floor(Math.random() * conversationTypes.length)];
        
        this.getLogger().info(`You overhear ${guest1.name} telling ${guest2.name}: "${conversation.message}"`);
        
        // Record this information as a game event
        this.game.logEvent(
          'INTELLIGENCE',
          `You overheard ${guest1.name} talking about game plans.`,
          [player.id, guest1.id, guest2.id]
        );
        
        // Check if you're detected despite success
        if (Math.random() <= detectionChance) {
          setTimeout(() => {
            this.getLogger().info(`${guest1.name} notices you eavesdropping: "Were you listening to us?"`);
            
            // Negative relationship impact for being caught
            this.controller.relationshipSystem.updateRelationship(
              guest1.id,
              player.id,
              -7,
              `Caught ${player.name} eavesdropping on a private conversation.`
            );
            
            this.controller.relationshipSystem.updateRelationship(
              guest2.id,
              player.id,
              -7,
              `Caught ${player.name} eavesdropping on a private conversation.`
            );
          }, 700);
        }
      } else {
        // Failure - player doesn't get useful information
        // Check if detected while failing
        if (Math.random() <= detectionChance * 1.5) { // Higher detection chance when failing
          this.getLogger().info(`${guest1.name} catches you trying to eavesdrop: "What are you doing over there?"`);
          
          // Larger negative relationship impact for failing and being caught
          this.controller.relationshipSystem.updateRelationship(
            guest1.id,
            player.id,
            -10,
            `Caught ${player.name} trying to spy on a conversation.`
          );
          
          this.controller.relationshipSystem.updateRelationship(
            guest2.id,
            player.id,
            -10,
            `Caught ${player.name} trying to spy on a conversation.`
          );
          
          // This could spread to others too
          const otherGuest = presentGuests.find(g => g.id !== guest1.id && g.id !== guest2.id);
          if (otherGuest) {
            this.controller.relationshipSystem.updateRelationship(
              otherGuest.id,
              player.id,
              -5,
              `Heard that ${player.name} was caught spying on others.`
            );
          }
        } else {
          // Not detected, but didn't hear anything useful
          this.getLogger().info("You couldn't make out what they were saying.");
        }
      }
    }, 800);
  }
  
  /**
   * Handle alliance meeting discussion
   */
  private handleAllianceMeetingDiscussion(
    alliance: any, 
    presentMembers: Houseguest[]
  ): void {
    if (presentMembers.length === 0) {
      this.getLogger().info("None of your alliance members are available right now.");
      return;
    }
    
    // Get targets that are not in the alliance
    const nonMembers = this.game.getActiveHouseguests().filter(
      hg => !alliance.members.some((m: any) => m.id === hg.id)
    );
    
    if (nonMembers.length === 0) {
      this.getLogger().info("Your alliance includes everyone still in the house!");
      return;
    }

    // Choose a random alliance member to lead discussion
    const leadMember = presentMembers[Math.floor(Math.random() * presentMembers.length)];
    
    // Identify potential targets based on relationship scores
    const potentialTargets = nonMembers.sort((a, b) => {
      // Average relationship between alliance members and this person
      let aScore = 0;
      let bScore = 0;
      
      alliance.members.forEach((member: Houseguest) => {
        if (!member.isPlayer) {
          aScore += this.controller.relationshipSystem.getEffectiveRelationship(member.id, a.id);
          bScore += this.controller.relationshipSystem.getEffectiveRelationship(member.id, b.id);
        }
      });
      
      return aScore - bScore; // Sort from lowest (biggest threat) to highest
    });
    
    // Target the lowest-scored person (usually most threatening to alliance)
    const primaryTarget = potentialTargets[0];
    const secondaryTarget = potentialTargets[1] || potentialTargets[0];
    
    // Lead member suggests targets
    setTimeout(() => {
      this.getLogger().info(`${leadMember.name}: "I think we should target ${primaryTarget.name} next. They're a threat to our alliance."`);
      
      // Record strategy discussion
      alliance.members.forEach((member: Houseguest) => {
        if (!member.isPlayer) {
          this.controller.relationshipSystem.addRelationshipEvent(
            member.id,
            primaryTarget.id,
            'alliance_target_discussion' as RelationshipEventType,
            `Your alliance discussed targeting ${primaryTarget.name}`,
            -5,
            true
          );
        }
      });
      
      // Second member agrees and suggests backup
      if (presentMembers.length > 1) {
        const secondMember = presentMembers.find(m => m.id !== leadMember.id) || presentMembers[0];
        
        setTimeout(() => {
          this.getLogger().info(`${secondMember.name}: "Agreed. And if that doesn't work, we should look at ${secondaryTarget.name} as a backup."`);
          
          // Coordinate voting strategy
          setTimeout(() => {
            this.getLogger().info(`Your alliance agrees to coordinate votes against ${primaryTarget.name} if they end up nominated.`);
            
            // Record vote coordination
            alliance.members.forEach((member: Houseguest) => {
              if (!member.isPlayer) {
                this.controller.relationshipSystem.addRelationshipEvent(
                  member.id,
                  member.id,
                  'alliance_vote_coordination' as RelationshipEventType,
                  `Your alliance agreed to vote together`,
                  3,
                  true
                );
              }
            });
          }, 500);
        }, 700);
      }
    }, 800);
  }
  
  /**
   * Apply relationship effects based on AI dialogue response
   */
  private applyDialogueRelationshipEffects(
    playerId: string,
    aiId: string,
    response: { response: string; tone: string; thoughts: string; }
  ): void {
    const { tone, thoughts } = response;
    
    // Base relationship change based on tone
    let baseChange = 0;
    let eventType: RelationshipEventType = 'general_interaction';
    let note = "";
    
    // Determine relationship change based on tone
    switch (tone) {
      case 'friendly':
        baseChange = 4;
        note = `${this.game.getHouseguestById(aiId)?.name} was friendly during your conversation.`;
        break;
      case 'strategic':
        baseChange = 3;
        note = `${this.game.getHouseguestById(aiId)?.name} discussed strategy with you.`;
        eventType = 'strategy_discussion' as RelationshipEventType;
        break;
      case 'cautious':
        baseChange = 1;
        note = `${this.game.getHouseguestById(aiId)?.name} was cautious during your conversation.`;
        break;
      case 'deceptive':
        // Deception isn't immediately apparent, might have a negative effect later
        baseChange = 2; // Seems positive initially
        note = `${this.game.getHouseguestById(aiId)?.name} seemed agreeable, but was being deceptive.`;
        eventType = 'deception' as RelationshipEventType;
        break;
      case 'aggressive':
        baseChange = -3;
        note = `${this.game.getHouseguestById(aiId)?.name} was aggressive toward you.`;
        eventType = 'confrontation' as RelationshipEventType;
        break;
      case 'dismissive':
        baseChange = -2;
        note = `${this.game.getHouseguestById(aiId)?.name} dismissed your conversation.`;
        break;
      default: // neutral
        baseChange = 1;
        note = `You had a conversation with ${this.game.getHouseguestById(aiId)?.name}.`;
        break;
    }
    
    // Check internal thoughts for alignment or misalignment with spoken words
    const positiveThoughtIndicators = ['like', 'trust', 'friend', 'ally', 'appreciate', 'helpful'];
    const negativeThoughtIndicators = ['annoyed', 'angry', 'upset', 'suspicious', 'don\'t trust', 'irritating'];
    
    const hasPositiveThoughts = positiveThoughtIndicators.some(indicator => 
      thoughts.toLowerCase().includes(indicator.toLowerCase())
    );
    
    const hasNegativeThoughts = negativeThoughtIndicators.some(indicator => 
      thoughts.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Modify relationship change based on thoughts
    let thoughtModifier = 0;
    
    if ((tone === 'friendly' || tone === 'strategic') && hasPositiveThoughts) {
      // Genuine positive interaction
      thoughtModifier = 2;
      eventType = 'positive_connection' as RelationshipEventType;
    } else if ((tone === 'friendly' || tone === 'strategic') && hasNegativeThoughts) {
      // Superficially nice but actually negative - this is deception
      thoughtModifier = -1;
      eventType = 'deception' as RelationshipEventType;
      note += " (Their internal thoughts don't match their friendly words)";
    } else if ((tone === 'aggressive' || tone === 'dismissive') && hasNegativeThoughts) {
      // Genuine negativity
      thoughtModifier = -1;
      eventType = 'negative_interaction' as RelationshipEventType;
    }
    
    // Calculate final relationship change
    const finalChange = baseChange + thoughtModifier;
    
    // Apply the relationship change with the event type
    this.controller.relationshipSystem.addRelationshipEvent(
      playerId,
      aiId,
      eventType,
      note,
      finalChange,
      true // Decayable over time
    );
    
    // Apply reciprocal effect from AI to player (may be different)
    const reciprocalChange = finalChange * (0.8 + Math.random() * 0.4); // 80-120%
    
    // Add relationship event in the other direction
    this.controller.relationshipSystem.addRelationshipEvent(
      aiId,
      playerId,
      eventType,
      `You had a conversation with ${this.game.getHouseguestById(playerId)?.name}.`,
      reciprocalChange,
      true
    );
    
    this.getLogger().info(`Relationship with ${this.game.getHouseguestById(aiId)?.name} changed by ${finalChange.toFixed(1)} (${eventType})`);
  }

  /**
   * Handle post-discussion special effects
   */
  private handlePostDiscussionEffects(
    playerId: string,
    targetId: string,
    discussionType: StrategicDiscussionType,
    response: any
  ): void {
    const targetGuest = this.game.getHouseguestById(targetId);
    if (!targetGuest) return;
    
    // Handle special effects based on discussion type
    switch (discussionType) {
      case 'final_two_deal':
        // Check if AI accepted the final 2 deal
        const acceptedDeal = response.response.toLowerCase().includes('agree') || 
                            response.response.toLowerCase().includes('accept') || 
                            response.response.toLowerCase().includes('deal') || 
                            response.thoughts.toLowerCase().includes('good deal');
                            
        if (acceptedDeal) {
          this.getLogger().info(`${targetGuest.name} accepted your final 2 deal!`);
          
          // Create a promise for this deal
          const finalTwoPromise: Promise = {
            id: `promise-final2-${Date.now()}`,
            fromId: playerId,
            toId: targetId,
            type: 'final_2',
            description: `You promised to take ${targetGuest.name} to the final 2.`,
            madeOnWeek: this.game.week,
            status: 'pending',
            context: {
              reciprocal: true // This is a mutual promise
            }
          };
          
          // Create the reciprocal promise
          const reciprocalPromise: Promise = {
            id: `promise-final2-recip-${Date.now()}`,
            fromId: targetId,
            toId: playerId,
            type: 'final_2',
            description: `${targetGuest.name} promised to take you to the final 2.`,
            madeOnWeek: this.game.week,
            status: 'pending',
            context: {
              reciprocal: true,
              relatedPromiseId: finalTwoPromise.id
            }
          };
          
          // Add both promises to the game state
          this.addPromise(finalTwoPromise);
          this.addPromise(reciprocalPromise);
          
          // Add significant relationship boost
          this.controller.relationshipSystem.addRelationshipEvent(
            playerId,
            targetId,
            'alliance_formed',
            `You formed a final 2 deal with ${targetGuest.name}`,
            15,
            false // This shouldn't decay easily
          );
          
          this.controller.relationshipSystem.addRelationshipEvent(
            targetId,
            playerId,
            'alliance_formed',
            `${this.game.getHouseguestById(playerId)?.name} formed a final 2 deal with you`,
            15,
            false
          );
        } else {
          this.getLogger().info(`${targetGuest.name} seems hesitant about a final 2 deal.`);
        }
        break;
        
      case 'suggest_target':
        // Check if they've agreed to the target
        const agreedToTarget = response.response.toLowerCase().includes('agree') || 
                             response.response.toLowerCase().includes('good idea') ||
                             !response.thoughts.toLowerCase().includes('disagree');
                             
        if (agreedToTarget) {
          this.getLogger().info(`${targetGuest.name} seems to agree with your target suggestion.`);
          
          // This creates alignment between player and AI
          this.controller.relationshipSystem.addRelationshipEvent(
            playerId,
            targetId,
            'strategy_alignment',
            `${targetGuest.name} agreed with your target suggestion`,
            7,
            true
          );
        }
        break;
        
      case 'spread_rumor':
        // Check if they believed the rumor
        const believedRumor = !response.thoughts.toLowerCase().includes("don't believe") &&
                             !response.thoughts.toLowerCase().includes("skeptical") &&
                             !response.thoughts.toLowerCase().includes("lying");
                             
        if (believedRumor) {
          this.getLogger().info(`${targetGuest.name} seems to have believed your rumor.`);
          
          // Extract who the rumor was about from the response or context
          // This is a simplification - in a real implementation, we'd track this better
          const rumorSubject = this.extractRumorSubject(response.response);
          if (rumorSubject) {
            this.getLogger().info(`This might affect ${targetGuest.name}'s relationship with ${rumorSubject}.`);
            
            // Find the rumor subject in houseguests
            const rumorSubjectHg = this.game.houseguests.find(hg => 
              hg.name.toLowerCase().includes(rumorSubject.toLowerCase())
            );
            
            if (rumorSubjectHg) {
              // Damage the relationship between target and rumor subject
              this.controller.relationshipSystem.updateRelationship(
                targetId,
                rumorSubjectHg.id,
                -8,
                `${targetGuest.name} heard a rumor about ${rumorSubjectHg.name}`
              );
            }
          }
        } else {
          this.getLogger().info(`${targetGuest.name} seems skeptical of what you told them.`);
        }
        break;
    }
  }
  
  /**
   * Extract the subject of a rumor from text
   * This is a simple implementation - would be more sophisticated in practice
   */
  private extractRumorSubject(text: string): string | null {
    // Look for names of houseguests in the text
    for (const houseguest of this.game.houseguests) {
      if (text.includes(houseguest.name) && !houseguest.isPlayer) {
        return houseguest.name;
      }
    }
    return null;
  }
  
  /**
   * Show dialogue options for the player to respond to the AI
   * (In a real implementation, this would integrate with a UI)
   */
  private showDialogueOptions(
    playerId: string,
    aiId: string,
    aiResponse: { response: string; tone: string; thoughts: string; }
  ): void {
    // TODO: For a future enhancement, implement a full dialogue system with player response options
    // For now, just print a message that the conversation concluded
    const aiName = this.game.getHouseguestById(aiId)?.name;
    setTimeout(() => {
      this.getLogger().info(`Your conversation with ${aiName} comes to a natural conclusion.`);
    }, 2000);
  }

  async exit(): Promise<void> {
    await super.exit();
    // Cleanup if needed
  }

  // Helper to describe relationship scores in words
  private describeRelationship(score: number): string {
    if (score >= 80) return "Best Friends";
    if (score >= 60) return "Close Allies";
    if (score >= 40) return "Friends";
    if (score >= 20) return "Friendly";
    if (score >= 0) return "Neutral";
    if (score >= -20) return "Wary";
    if (score >= -40) return "Distrustful";
    if (score >= -60) return "Enemies";
    return "Bitter Rivals";
  }
  
  // Helper methods for promise system
  
  /**
   * Add a promise to the game state
   */
  private addPromise(promise: Promise): void {
    if (!this.game.promises) {
      this.game.promises = [];
    }
    this.game.promises.push(promise);
  }
  
  /**
   * Get promises involving a specific houseguest
   */
  private getPromisesForHouseguest(houseguestId: string): Promise[] {
    if (!this.game.promises) {
      return [];
    }
    
    return this.game.promises.filter(p => 
      p.fromId === houseguestId || p.toId === houseguestId
    );
  }
  
  /**
   * Get promises between two specific houseguests
   */
  private getPromisesBetween(guest1Id: string, guest2Id: string): Promise[] {
    if (!this.game.promises) {
      return [];
    }
    
    return this.game.promises.filter(p => 
      (p.fromId === guest1Id && p.toId === guest2Id) || 
      (p.fromId === guest2Id && p.toId === guest1Id)
    );
  }
  
  /**
   * Display active promises for a player
   */
  private displayPlayerPromises(playerId: string): void {
    const promises = this.getPromisesForHouseguest(playerId);
    
    if (promises.length === 0) {
      this.getLogger().info("You currently have no active promises.");
      return;
    }
    
    this.getLogger().info("--- Your Promises ---");
    
    // Group by promises made by player vs to player
    const promisesMade = promises.filter(p => p.fromId === playerId);
    const promisesReceived = promises.filter(p => p.toId === playerId);
    
    if (promisesMade.length > 0) {
      this.getLogger().info("Promises you've made:");
      promisesMade.forEach(promise => {
        const targetName = this.game.getHouseguestById(promise.toId)?.name || "Unknown";
        const statusText = promise.status === 'pending' ? 'Active' : 
                          promise.status === 'kept' ? 'Kept ✓' : 'Broken ✗';
        this.getLogger().info(`- To ${targetName}: ${promise.description} (${statusText})`);
      });
    }
    
    if (promisesReceived.length > 0) {
      this.getLogger().info("Promises made to you:");
      promisesReceived.forEach(promise => {
        const fromName = this.game.getHouseguestById(promise.fromId)?.name || "Unknown";
        const statusText = promise.status === 'pending' ? 'Active' : 
                          promise.status === 'kept' ? 'Kept ✓' : 'Broken ✗';
        this.getLogger().info(`- From ${fromName}: ${promise.description} (${statusText})`);
      });
    }
  }
  
  // Helper methods for getting game state info
  
  private getHohName(): string {
    const hoh = this.game.houseguests.find(hg => hg.isHoH);
    return hoh ? hg.name : 'None';
  }
  
  private getNomineeNames(): string[] {
    return this.game.nominees.map(id => {
      const hg = this.game.getHouseguestById(id);
      return hg ? hg.name : 'Unknown';
    });
  }
  
  private getPovHolderName(): string | null {
    const pov = this.game.houseguests.find(hg => hg.isPovHolder);
    return pov ? pov.name : null;
  }
  
  private getRandomNonAllyName(houseguestId: string): string {
    // Get a non-ally of the given houseguest
    const allianceSystem = this.controller.allianceSystem;
    
    if (!allianceSystem) {
      // Fallback to random active houseguest
      const active = this.game.getActiveHouseguests();
      const random = active[Math.floor(Math.random() * active.length)];
      return random.name;
    }
    
    const allies = allianceSystem.getAllAlliesForHouseguest(houseguestId);
    const nonAllies = this.game.getActiveHouseguests().filter(hg => 
      hg.id !== houseguestId && !allies.includes(hg.id)
    );
    
    if (nonAllies.length === 0) {
      // No non-allies, fall back to random houseguest
      const active = this.game.getActiveHouseguests();
      const random = active[Math.floor(Math.random() * active.length)];
      return random.name;
    }
    
    return nonAllies[Math.floor(Math.random() * nonAllies.length)].name;
  }
  
  private getRandomNomineeName(): string {
    // Get a random current nominee
    if (this.game.nominees.length === 0) {
      // No nominees, return generic response
      return "someone";
    }
    
    const nomineeId = this.game.nominees[Math.floor(Math.random() * this.game.nominees.length)];
    const nominee = this.game.getHouseguestById(nomineeId);
    
    return nominee ? nominee.name : "someone";
  }
}
