
import { createContext } from 'react';
import { GameContextType } from '../types/game-context-types';

export const GameContext = createContext<GameContextType | null>(null);
