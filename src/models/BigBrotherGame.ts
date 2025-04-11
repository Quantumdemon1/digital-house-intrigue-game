
import { v4 as uuidv4 } from 'uuid';
import { GameState, GamePhase, createInitialGameState } from './game-state';
import { createHouseguest, Houseguest, HouseguestStatus } from './houseguest';
import { Logger } from '../utils/logger';
import { GameStateBase } from '../game-states/GameStateBase';
import { NominationState } from '../game-states/NominationState';
import { HohCompetitionState } from '../game-states/HohCompetitionState';
import { PovCompetitionState } from '../game-states/PovCompetitionState';
import { PovMeetingState } from '../game-states/PovMeetingState';
import { EvictionState } from '../game-states/EvictionState';
import { SocialInteractionState } from '../game-states/SocialInteractionState';
import { RelationshipSystem } from '../systems/relationship-system';
import { AIIntegrationSystem } from '../systems/ai/ai-integration-system';
import { AllianceSystem } from '../systems/alliance-system';
import type { IGameControllerFacade } from '../types/interfaces';

export class BigBrotherGame implements IGameControllerFacade {
  // Game state
  private gameState: GameState;
  
  // Current game phase state
  currentState?: GameStateBase;
  
  // Systems
  logger: Logger;
  relationshipSystem: RelationshipSystem;
  aiSystem?: AIIntegrationSystem;
  allianceSystem?: AllianceSystem;
  
  // Helper properties
  currentLocation: string = 'living-room';
  
  constructor(logger: Logger, initialState?: GameState) {
    this.logger = logger;
    this.relationshipSystem = new RelationshipSystem(logger);
    
    if (initialState) {
      this.gameState = initialState;
      this.logger.info("Game initialized with provided state");
    } else {
      this.gameState = createInitialGameState();
      this.logger.info("Game initialized with default state");
    }
    
    // Initialize the alliance system
    this.allianceSystem = new AllianceSystem(this.relationshipSystem, logger);
    
    // Expose game state properties
    if (this.gameState.relationships) {
      this.relationshipSystem.setRelationships(this.gameState.relationships);
    }
  }
  
  // Initialize AI system with API key
  initializeAI(apiKey: string): void {
    this.aiSystem = new AIIntegrationSystem(this.logger, apiKey);
    this.aiSystem.setRelationshipSystem(this.relationshipSystem);
    this.logger.info("AI system initialized");
    
    // Initialize AI memories for houseguests
    this.aiSystem.initializeMemories(this.gameState.houseguests);
  }
  
  // Required method from IGameControllerFacade
  promptNextAction(): void {
    // Implementation depends on UI integration
    // Typically dispatches an action to React component
    this.logger.debug("Prompt for next action requested");
  }
  
  // Required method from IGameControllerFacade
  saveGame(): void {
    // Implementation for saving game state
    this.logger.info("Game save requested");
  }
  
  // Required method from IGameControllerFacade
  loadGame(): void {
    // Implementation for loading game state
    this.logger.info("Game load requested");
  }
  
  // Required method from IGameControllerFacade - called by SocialInteractionState
  openAllianceProposalUI(): void {
    // Default implementation - will be overridden by UI component
    this.logger.info("Alliance proposal UI requested");
  }
  
  // Get active houseguests (not evicted)
  getActiveHouseguests(): Houseguest[] {
    return this.houseguests.filter(hg => hg.status !== 'Evicted');
  }
  
  // Find a houseguest by ID
  getHouseguestById(id: string): Houseguest | undefined {
    return this.houseguests.find(hg => hg.id === id);
  }
  
  // Initialize the game with houseguests
  async initializeGame(playerName: string, playerAvatar: string, aiHouseguests: Houseguest[]): Promise<void> {
    // Create player houseguest
    const playerHouseguest = createHouseguest(playerName, true);
    playerHouseguest.avatarUrl = playerAvatar || '';
    
    // Combine player with AI houseguests
    const allHouseguests = [playerHouseguest, ...aiHouseguests];
    
    // Save to game state
    this.gameState.houseguests = allHouseguests;
    this.gameState.phase = 'HoH';
    
    // Initialize systems
    this.relationshipSystem.initialize(allHouseguests);
    
    if (this.aiSystem) {
      this.aiSystem.initializeMemories(allHouseguests);
    }
    
    this.logger.info(`Game initialized with ${allHouseguests.length} houseguests`);
    
    // Start initial game state
    await this.transitionToState(HohCompetitionState);
  }
  
  // Transition to a new game state
  async transitionToState(StateConstructor: typeof GameStateBase): Promise<void> {
    // Exit current state if it exists
    if (this.currentState) {
      await this.currentState.exit();
    }
    
    // Create and enter new state
    this.currentState = new StateConstructor(this);
    await this.currentState.enter();
    
    this.logger.info(`Transitioned to ${StateConstructor.name}`);
  }
  
  // Advance to the next week
  advanceWeek(): void {
    this.gameState.week += 1;
    this.relationshipSystem.setCurrentWeek(this.gameState.week);
    if (this.allianceSystem) {
      this.allianceSystem.setCurrentWeek(this.gameState.week);
      this.allianceSystem.checkForAllianceExposure();
    }
    this.logger.info(`Advanced to week ${this.gameState.week}`);
  }
  
  // Add an event to the game log
  addToGameLog(type: string, description: string, involvedHouseguests: string[] = []): void {
    const event = {
      week: this.gameState.week,
      phase: this.gameState.phase,
      type,
      description,
      involvedHouseguests,
      timestamp: Date.now()
    };
    
    this.gameState.gameLog.push(event);
    this.logger.info(`Game event logged: ${description}`);
  }
  
  // Handle player eviction
  handleEviction(evictedId: string): void {
    const evictedGuest = this.getHouseguestById(evictedId);
    if (!evictedGuest) return;
    
    // Update status
    evictedGuest.status = 'Evicted';
    
    // Handle alliance changes
    if (this.allianceSystem) {
      this.allianceSystem.handleHouseguestEvicted(evictedId);
    }
    
    this.logger.info(`${evictedGuest.name} has been evicted`);
  }
  
  // Get/Set properties that map to gameState
  get phase(): GamePhase {
    return this.gameState.phase;
  }
  
  set phase(newPhase: GamePhase) {
    this.gameState.phase = newPhase;
  }
  
  get week(): number {
    return this.gameState.week;
  }
  
  set week(newWeek: number) {
    this.gameState.week = newWeek;
  }
  
  get houseguests(): Houseguest[] {
    return this.gameState.houseguests;
  }
  
  get hohWinner(): Houseguest | null {
    return this.gameState.hohWinner;
  }
  
  set hohWinner(houseguest: Houseguest | null) {
    this.gameState.hohWinner = houseguest;
    
    // Update houseguest status
    if (houseguest) {
      this.gameState.houseguests.forEach(hg => {
        hg.isHoH = hg.id === houseguest.id;
      });
    }
  }
  
  get povWinner(): Houseguest | null {
    return this.gameState.povWinner;
  }
  
  set povWinner(houseguest: Houseguest | null) {
    this.gameState.povWinner = houseguest;
    
    // Update houseguest status
    if (houseguest) {
      this.gameState.houseguests.forEach(hg => {
        hg.isPovHolder = hg.id === houseguest.id;
      });
    }
  }
  
  get nominees(): Houseguest[] {
    return this.gameState.nominees;
  }
  
  set nominees(nominees: Houseguest[]) {
    this.gameState.nominees = nominees;
    
    // Update houseguest status
    const nomineeIds = nominees.map(n => n.id);
    this.gameState.houseguests.forEach(hg => {
      hg.isNominated = nomineeIds.includes(hg.id);
    });
  }
  
  get evictionVotes(): Record<string, string> {
    return this.gameState.evictionVotes;
  }
  
  set evictionVotes(votes: Record<string, string>) {
    this.gameState.evictionVotes = votes;
  }
  
  get juryMembers(): Houseguest[] {
    return this.gameState.juryMembers;
  }
  
  get winner(): Houseguest | null {
    return this.gameState.winner;
  }
  
  set winner(winner: Houseguest | null) {
    this.gameState.winner = winner;
  }
  
  get runnerUp(): Houseguest | null {
    return this.gameState.runnerUp;
  }
  
  set runnerUp(runnerUp: Houseguest | null) {
    this.gameState.runnerUp = runnerUp;
  }
}
