
/**
 * @file PovPlayerSelectionState.ts
 * @description PoV player selection state - selects 6 players to compete in PoV competition
 */

import { GameStateBase, SocialActionChoice } from './GameStateBase';

export class PovPlayerSelectionState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'PoVPlayerSelection';
    
    // If automatic selection, select the players immediately
    this.selectDefaultPlayers();
  }
  
  // Select the default 6 players for PoV competition (HoH, 2 nominees, 3 random)
  private selectDefaultPlayers(): void {
    const hohId = this.game.hohWinner;
    const nominees = this.game.nominees || [];
    const allHouseguests = this.game.getActiveHouseguests();
    
    // Start with HoH and nominees
    const povPlayers = [hohId];
    nominees.forEach(nomineeId => {
      if (nomineeId && !povPlayers.includes(nomineeId)) {
        povPlayers.push(nomineeId);
      }
    });
    
    // Add random houseguests until we have 6 players
    const eligibleHouseguests = allHouseguests
      .filter(hg => !povPlayers.includes(hg.id))
      .map(hg => hg.id);
    
    // Shuffle the eligible houseguests
    const shuffledEligible = [...eligibleHouseguests].sort(() => 0.5 - Math.random());
    
    // Add up to 3 more players (or whatever we need to reach 6)
    const neededCount = Math.min(6 - povPlayers.length, shuffledEligible.length);
    for (let i = 0; i < neededCount; i++) {
      povPlayers.push(shuffledEligible[i]);
    }
    
    // Set the PoV players
    this.game.povPlayers = povPlayers.filter(Boolean);
    this.getLogger()?.info(`Selected ${this.game.povPlayers.length} players for PoV competition: ${this.game.povPlayers.join(', ')}`);
    
    // Sync to reducer state
    if (this.controller && this.controller.dispatch) {
      this.controller.dispatch({
        type: 'SET_POV_PLAYERS',
        payload: this.game.povPlayers
      });
    }
    
    // Immediately advance to PoV competition
    this.controller.changeState('PovCompetitionState');
  }
  
  getAvailableActions(): SocialActionChoice[] {
    return [
      {
        actionId: 'select_pov_players',
        text: 'Select PoV Players',
        parameters: { povPlayerIds: [] }
      },
      {
        actionId: 'continue_to_pov_competition',
        text: 'Continue to PoV Competition'
      }
    ];
  }
  
  async handleAction(actionId: string, params: any): Promise<boolean> {
    switch (actionId) {
      case 'select_pov_players':
        if (params && params.povPlayerIds && params.povPlayerIds.length <= 6) {
          this.getLogger().info(`Manually selected PoV players: ${params.povPlayerIds.join(', ')}`);
          this.game.povPlayers = params.povPlayerIds;
          return true;
        }
        return false;
        
      case 'continue_to_pov_competition':
        // If povPlayers isn't set yet, select them automatically
        if (!this.game.povPlayers || this.game.povPlayers.length === 0) {
          this.selectDefaultPlayers();
        }
        
        this.controller.changeState('PovCompetitionState');
        return true;
        
      default:
        return false;
    }
  }
}
