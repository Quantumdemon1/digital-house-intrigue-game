
import { Houseguest, HouseguestStatus, createHouseguest } from './houseguest';
import { Alliance, createAlliance } from './alliance';
import { RelationshipSystem } from '../systems/relationship-system';
import { CompetitionSystem } from '../systems/competition-system';
import { AIIntegrationSystem } from '../systems/ai-integration';
import { GameStateBase } from '../game-states';
import { InitializationState } from '../game-states';
import { v4 as uuidv4 } from 'uuid';

export interface BigBrotherGameOptions {
  relationshipSystem: RelationshipSystem;
  competitionSystem: CompetitionSystem;
  aiSystem: AIIntegrationSystem;
  logger: any;
  gameController: any;
  uiManager?: any;
}

export interface GameEvent {
  week: number;
  phase: string;
  type: string;
  description: string;
  involvedHouseguests: string[]; // Houseguest IDs
  timestamp: number;
}

export class BigBrotherGame {
  public houseguests: Houseguest[] = [];
  public alliances: Alliance[] = [];
  public week: number = 1;
  public phase: string = 'Setup';
  public hohWinner: Houseguest | null = null;
  public povWinner: Houseguest | null = null;
  public nominees: Houseguest[] = [];
  public juryMembers: Houseguest[] = [];
  public winner: Houseguest | null = null;
  public runnerUp: Houseguest | null = null;
  public gameLog: GameEvent[] = [];
  public currentState: GameStateBase | null = null;

  // Systems
  public relationshipSystem: RelationshipSystem;
  public competitionSystem: CompetitionSystem;
  public aiSystem: AIIntegrationSystem;
  
  // Services
  private logger: any;
  private gameController: any;
  private uiManager: any;

  constructor(playerName: string = 'Player', options: BigBrotherGameOptions) {
    this.relationshipSystem = options.relationshipSystem;
    this.competitionSystem = options.competitionSystem;
    this.aiSystem = options.aiSystem;
    this.logger = options.logger;
    this.gameController = options.gameController;
    this.uiManager = options.uiManager || null;

    // Initialize with empty arrays and default values
    this.houseguests = [];
    this.alliances = [];
    this.week = 1;
    this.phase = 'Setup';
    this.hohWinner = null;
    this.povWinner = null;
    this.nominees = [];
    this.juryMembers = [];
    this.winner = null;
    this.runnerUp = null;
    this.gameLog = [];
  }

  async start(gameController: any): Promise<void> {
    this.logger.info('Starting new Big Brother game');
    
    // Initialize the game with the first state
    this.currentState = new InitializationState(this, gameController);
    await this.currentState.enter();
    
    return Promise.resolve();
  }

  logEvent(event: Partial<GameEvent>): void {
    const fullEvent: GameEvent = {
      week: this.week,
      phase: this.phase,
      type: event.type || 'UNKNOWN',
      description: event.description || '',
      involvedHouseguests: event.involvedHouseguests || [],
      timestamp: Date.now(),
    };
    
    this.gameLog.push(fullEvent);
    this.logger.info(`Game Event: ${fullEvent.description}`);
  }

  getActiveHouseguests(): Houseguest[] {
    return this.houseguests.filter(h => h.status === 'Active');
  }

  getHouseguestById(id: string): Houseguest | undefined {
    return this.houseguests.find(h => h.id === id);
  }

  advanceWeek(): void {
    this.week++;
    this.phase = 'HoH'; // Reset to HoH phase
    
    // Reset HoH and PoV statuses
    this.houseguests = this.houseguests.map(guest => ({
      ...guest,
      isHoH: false,
      isPovHolder: false,
      isNominated: false
    }));
    
    this.hohWinner = null;
    this.povWinner = null;
    this.nominees = [];

    this.logEvent({
      type: 'WEEK_ADVANCE',
      description: `Week ${this.week} has begun!`,
      involvedHouseguests: []
    });
  }

  saveGame(): any {
    // Prepare data for serialization
    const gameData = {
      houseguests: this.houseguests,
      alliances: this.alliances,
      week: this.week,
      phase: this.phase,
      hohWinnerId: this.hohWinner?.id || null,
      povWinnerId: this.povWinner?.id || null,
      nomineeIds: this.nominees.map(n => n.id),
      juryMemberIds: this.juryMembers.map(j => j.id),
      winnerId: this.winner?.id || null,
      runnerUpId: this.runnerUp?.id || null,
      gameLog: this.gameLog,
      // State is handled in restoreState after loading
      currentStateName: this.currentState?.constructor.name || 'InitializationState'
    };

    return gameData;
  }

  loadGame(gameData: any): void {
    // Restore basic data
    this.houseguests = gameData.houseguests;
    this.alliances = gameData.alliances;
    this.week = gameData.week;
    this.phase = gameData.phase;
    this.gameLog = gameData.gameLog;
    
    // Restore references to objects
    this.hohWinner = gameData.hohWinnerId ? this.getHouseguestById(gameData.hohWinnerId) || null : null;
    this.povWinner = gameData.povWinnerId ? this.getHouseguestById(gameData.povWinnerId) || null : null;
    this.nominees = gameData.nomineeIds.map((id: string) => this.getHouseguestById(id)).filter(Boolean) as Houseguest[];
    this.juryMembers = gameData.juryMemberIds.map((id: string) => this.getHouseguestById(id)).filter(Boolean) as Houseguest[];
    this.winner = gameData.winnerId ? this.getHouseguestById(gameData.winnerId) || null : null;
    this.runnerUp = gameData.runnerUpId ? this.getHouseguestById(gameData.runnerUpId) || null : null;
    
    // State will be restored separately with restoreState
  }
  
  async restoreState(gameController: any, stateName: string): Promise<void> {
    // This would recreate the appropriate state object based on the saved state name
    // Import and instantiate the correct state class
    // Example implementation to be expanded
    try {
      // Note: This is a simplified implementation 
      // In a full implementation, you'd need to dynamically import the correct state class
      this.currentState = new InitializationState(this, gameController);
      await this.currentState.enter();
      return Promise.resolve();
    } catch (error) {
      this.logger.error(`Failed to restore game state: ${error}`);
      return Promise.reject(error);
    }
  }
}
