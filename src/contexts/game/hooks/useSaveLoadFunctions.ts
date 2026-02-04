
import { toast } from "sonner";
import { GameState } from "../../../models/game-state";
import { GameAction } from "../../types/game-context-types";

export function useSaveLoadFunctions(
  user: any, 
  gameState: GameState, 
  dispatch: React.Dispatch<GameAction>
) {
  const saveGame = async (saveName: string): Promise<void> => {
    try {
      if (!gameState) {
        throw new Error("No game state to save");
      }

      const timestamp = new Date().toISOString();
      const saveNameWithTimestamp = `${saveName}_${timestamp}`;
      
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      let existingSaves = JSON.parse(existingSavesStr);
      
      existingSaves.push({
        name: saveNameWithTimestamp,
        date: timestamp,
        data: gameState
      });
      
      localStorage.setItem(saveKey, JSON.stringify(existingSaves));
      
      toast.success(`Game saved as ${saveName}`);
    } catch (error) {
      console.error('Failed to save game:', error);
      toast.error('Failed to save game');
      throw error;
    }
  };

  const loadGame = async (saveName: string): Promise<void> => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      const existingSaves = JSON.parse(existingSavesStr);
      
      const saveToLoad = existingSaves.find((save: any) => save.name === saveName);
      
      if (!saveToLoad) {
        toast.error(`Save '${saveName}' not found`);
        throw new Error(`Save '${saveName}' not found`);
      }
      
      // Dispatch the loaded state to the reducer
      dispatch({
        type: 'LOAD_GAME',
        payload: saveToLoad.data
      });
      
      toast.success(`Game loaded: ${saveName}`);
    } catch (error) {
      console.error('Failed to load game:', error);
      toast.error('Failed to load game');
      throw error;
    }
  };

  const deleteSavedGame = async (saveName: string): Promise<void> => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      let existingSaves = JSON.parse(existingSavesStr);
      
      existingSaves = existingSaves.filter((save: any) => save.name !== saveName);
      
      localStorage.setItem(saveKey, JSON.stringify(existingSaves));
      
      toast.success(`Save '${saveName}' deleted`);
    } catch (error) {
      console.error('Failed to delete save:', error);
      toast.error('Failed to delete save');
      throw error;
    }
  };

  const getSavedGames = async (): Promise<Array<{ name: string; date: string; data: any }>> => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      return JSON.parse(existingSavesStr);
    } catch (error) {
      console.error('Failed to get saved games:', error);
      return [];
    }
  };

  return {
    saveGame,
    loadGame,
    deleteSavedGame,
    getSavedGames
  };
}
