
import { useReducer } from 'react';
import { gameReducer } from '../../reducers/game-reducer';
import { initialGameState } from '../../../models/game-state';

export function useGameReducer() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  return { gameState, dispatch };
}
