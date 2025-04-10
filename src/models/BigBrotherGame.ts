
import { Houseguest } from './houseguest';
import { Alliance } from './alliance';
import { RelationshipSystem } from '../systems/relationship-system';
import { CompetitionSystem } from '../systems/competition-system';
import { AIIntegrationSystem } from '../systems/ai-integration';
import { GameStateBase } from '../game-states';
import { InitializationState } from '../game-states';
import { v4 as uuidv4 } from 'uuid';
import { HouseguestStatus } from './houseguest'; // Import as a type

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
  data?: any; // Additional event data
}

export class BigBrotherGame {
  public houseguests: Houseguest[] = [];
  public alliances: Alliance[] = [];
  public week: number = 1;
  public phase: string = 'Setup';
  public hohWinner: string | null = null;
  public povWinner: string | null = null;
  public nominees: string[] = [];
  public juryMembers: string[] = [];
  public winner: string | null = null;
  public runnerUp: string | null = null;
  public finalTwo: string[] | null = null;
  public eventLog: GameEvent[] = [];
  public currentState: GameStateBase | null = null;
  public currentWeek: number = 1;

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
    this.currentWeek = 1;
    this.phase = 'Setup';
    this.hohWinner = null;
    this.povWinner = null;
    this.nominees = [];
    this.juryMembers = [];
    this.winner = null;
    this.runnerUp = null;
    this.finalTwo = null;
    this.eventLog = [];
  }

  async start(gameController: any): Promise<void> {
    this.logger.info('Starting new Big Brother game');
    
    // Initialize the game with the first state
    this.currentState = new InitializationState(gameController);
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
      data: event.data || {}
    };
    
    this.eventLog.push(fullEvent);
    this.logger.info(`Game Event: ${fullEvent.description}`);
  }

  getActiveHouseguests(): Houseguest[] {
    // Use type assertion to ensure this works correctly
    return this.houseguests.filter(h => h.status === HouseguestStatus.Active);
  }

  getHouseguestById(id: string): Houseguest | undefined {
    return this.houseguests.find(h => h.id === id);
  }

  advanceWeek(): void {
    this.week++;
    this.currentWeek++;
    this.phase = 'HoH'; // Reset to HoH phase
    
    // Reset HoH and PoV statuses
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
      currentWeek: this.currentWeek,
      phase: this.phase,
      hohWinner: this.hohWinner,
      povWinner: this.povWinner,
      nominees: this.nominees,
      juryMembers: this.juryMembers,
      winner: this.winner,
      runnerUp: this.runnerUp,
      finalTwo: this.finalTwo,
      eventLog: this.eventLog,
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
    this.currentWeek = gameData.currentWeek || gameData.week;
    this.phase = gameData.phase;
    this.eventLog = gameData.eventLog || [];
    
    // Restore references to objects
    this.hohWinner = gameData.hohWinner;
    this.povWinner = gameData.povWinner;
    this.nominees = gameData.nominees || [];
    this.juryMembers = gameData.juryMembers || [];
    this.winner = gameData.winner;
    this.runnerUp = gameData.runnerUp;
    this.finalTwo = gameData.finalTwo;
    
    // State will be restored separately with restoreState
  }
  
  async restoreState(gameController: any, stateName: string): Promise<void> {
    // This would recreate the appropriate state object based on the saved state name
    // Import and instantiate the correct state class
    // Example implementation to be expanded
    try {
      // Note: This is a simplified implementation 
      // In a full implementation, you'd need to dynamically import the correct state class
      this.currentState = new InitializationState(gameController);
      await this.currentState.enter();
      return Promise.resolve();
    } catch (error) {
      this.logger.error(`Failed to restore game state: ${error}`);
      return Promise.reject(error);
    }
  }
}
