
/**
 * @file GameOverState.ts
 * @description Game over state
 */

import { GameStateBase } from './GameStateBase';

export class GameOverState extends GameStateBase {
  async enter(): Promise<void> {
    await super.enter();
    this.game.phase = 'GameOver';
    
    // Implementation will come in Phase 2
  }
}
