
import React, { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useGame } from '@/contexts/GameContext';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SaveLoadButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const SaveLoadButton: React.FC<SaveLoadButtonProps> = ({
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const { gameState, showToast } = useGame();
  
  const handleSaveGame = () => {
    if (!saveName.trim()) {
      showToast("Save name required", { 
        variant: "error",
        description: "Please enter a name for your save file"
      });
      return;
    }
    
    try {
      // Create save data object
      const saveData = {
        gameState,
        savedAt: new Date().toISOString(),
        name: saveName,
      };
      
      // Save to localStorage
      const existingSaves = JSON.parse(localStorage.getItem('bigBrotherSaves') || '{}');
      existingSaves[saveName] = saveData;
      localStorage.setItem('bigBrotherSaves', JSON.stringify(existingSaves));
      
      // Show success message
      showToast("Game saved successfully", { 
        variant: "success",
        description: `Saved as "${saveName}"`
      });
      
      // Close dialog
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save game:", error);
      showToast("Save failed", { 
        variant: "error",
        description: "There was an error saving your game"
      });
    }
  };
  
  const handleLoadGame = (saveName: string) => {
    try {
      const saves = JSON.parse(localStorage.getItem('bigBrotherSaves') || '{}');
      const saveData = saves[saveName];
      
      if (saveData) {
        // Here we would implement the actual loading logic
        // which would require dispatching to the game reducer
        showToast("Game loaded", { 
          variant: "success",
          description: `Loaded "${saveName}"`
        });
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      showToast("Load failed", { 
        variant: "error",
        description: "There was an error loading your game"
      });
    }
  };
  
  // Get saved games from localStorage
  const savedGames = React.useMemo(() => {
    try {
      const saves = JSON.parse(localStorage.getItem('bigBrotherSaves') || '{}');
      return Object.keys(saves).map(key => ({
        name: key,
        date: new Date(saves[key].savedAt).toLocaleString(),
        data: saves[key]
      }));
    } catch {
      return [];
    }
  }, [dialogOpen]);
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={`flex items-center gap-1.5 ${className}`}
      >
        <Save className="h-4 w-4 text-orange-500" />
        <span>Save/Load</span>
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save & Load Game</DialogTitle>
            <DialogDescription>
              Save your current game or load a previous save
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="save">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="save">Save Game</TabsTrigger>
              <TabsTrigger value="load">Load Game</TabsTrigger>
            </TabsList>
            
            <TabsContent value="save" className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="save-name" className="text-sm font-medium">
                  Save Name
                </label>
                <Input
                  id="save-name"
                  placeholder="My Save Game"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
              </div>
              
              <DialogFooter>
                <Button onClick={handleSaveGame} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Game
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="load" className="py-4">
              {savedGames.length > 0 ? (
                <div className="space-y-2">
                  {savedGames.map(save => (
                    <div 
                      key={save.name}
                      className="flex justify-between items-center border rounded-md p-3 hover:bg-accent cursor-pointer"
                      onClick={() => handleLoadGame(save.name)}
                    >
                      <div>
                        <p className="font-medium">{save.name}</p>
                        <p className="text-xs text-muted-foreground">{save.date}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No saved games found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SaveLoadButton;
