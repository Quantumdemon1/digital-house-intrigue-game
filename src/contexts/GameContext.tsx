
// Re-export from new modular location
import { GameContext } from './game/GameContext';
import { GameProvider } from './game/GameProvider';
import { useGame } from './game/useGame';

// Legacy exports for backward compatibility
export { GameContext, GameProvider, useGame };
export default GameContext;
