
import React, { useState, useEffect } from 'react';
import { Save, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useGame } from '@/contexts/game';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { saveGame, loadGame, deleteSavedGame, getSavedGames, showToast } = useGame();
  
  // State to store saved games list
  const [savedGames, setSavedGames] = useState<Array<{ name: string; date: string; data: any }>>([]);
  
  // Load saved games list when dialog opens or refresh key changes
  useEffect(() => {
    if (dialogOpen) {
      const loadGames = async () => {
        try {
          const games = await getSavedGames();
          setSavedGames(games);
        } catch (error) {
          console.error("Error loading saved games:", error);
          setSavedGames([]);
        }
      };
      
      loadGames();
    }
  }, [dialogOpen, getSavedGames, refreshKey]);
  
  const handleSaveGame = async () => {
    if (!saveName.trim()) {
      showToast("Save name required", { 
        variant: "error",
        description: "Please enter a name for your save file"
      });
      return;
    }
    
    try {
      await saveGame(saveName);
      // Refresh saved games list
      setRefreshKey(prev => prev + 1);
      setSaveName("");
      showToast("Game saved", { variant: "success" });
    } catch (error) {
      showToast("Failed to save game", { variant: "error" });
    }
  };
  
  const handleLoadGame = async (saveName: string) => {
    try {
      await loadGame(saveName);
      setDialogOpen(false);
      showToast("Game loaded", { variant: "success" });
    } catch (error) {
      showToast("Failed to load game", { variant: "error" });
    }
  };
  
  const handleOpenDeleteDialog = (saveName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteTarget(saveName);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteSave = async () => {
    if (deleteTarget) {
      try {
        await deleteSavedGame(deleteTarget);
        // Refresh saved games list
        setRefreshKey(prev => prev + 1);
        showToast("Save deleted", { variant: "success" });
      } catch (error) {
        showToast("Failed to delete save", { variant: "error" });
      }
      
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };
  
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
                  {savedGames.map(save => {
                    // Extract user-entered name (before timestamp)
                    const displayName = save.name.includes('_') 
                      ? save.name.split('_').slice(0, -1).join('_') 
                      : save.name;
                    
                    // Format date nicely
                    const displayDate = new Date(save.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    return (
                      <div 
                        key={save.name}
                        className="flex justify-between items-center border rounded-md p-3 hover:bg-accent cursor-pointer"
                        onClick={() => handleLoadGame(save.name)}
                      >
                        <div>
                          <p className="font-medium">{displayName}</p>
                          <p className="text-xs text-muted-foreground">{displayDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleOpenDeleteDialog(save.name, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Save</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSave} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SaveLoadButton;
