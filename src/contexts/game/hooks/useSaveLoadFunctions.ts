
import { toast } from "sonner";
import { GameState } from "../../../models/game-state";

export function useSaveLoadFunctions(user: any, gameState: GameState) {
  const saveGame = (saveName: string): boolean => {
    try {
      if (!gameState) {
        return false;
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
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      toast.error('Failed to save game');
      return false;
    }
  };

  const loadGame = (saveName: string): boolean => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      const existingSaves = JSON.parse(existingSavesStr);
      
      const saveToLoad = existingSaves.find((save: any) => save.name === saveName);
      
      if (!saveToLoad) {
        toast.error(`Save '${saveName}' not found`);
        return false;
      }
      
      // Note: dispatch is handled by the caller
      
      toast.success(`Game loaded: ${saveName}`);
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      toast.error('Failed to load game');
      return false;
    }
  };

  const deleteSavedGame = (saveName: string): boolean => {
    try {
      const userId = user?.id || 'guest';
      const saveKey = `bb_save_${userId}`;
      
      const existingSavesStr = localStorage.getItem(saveKey) || '[]';
      let existingSaves = JSON.parse(existingSavesStr);
      
      existingSaves = existingSaves.filter((save: any) => save.name !== saveName);
      
      localStorage.setItem(saveKey, JSON.stringify(existingSaves));
      
      toast.success(`Save '${saveName}' deleted`);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      toast.error('Failed to delete save');
      return false;
    }
  };

  const getSavedGames = (): Array<{ name: string; date: string; data: any }> => {
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
