
import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGame } from '@/contexts/GameContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import GameLog from '../GameEventLog';
import SeasonRecap from '../game-phases/GameOverPhase/SeasonRecap';

interface GameRecapButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const GameRecapButton: React.FC<GameRecapButtonProps> = ({
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { gameState } = useGame();
  
  // Placeholder recap data structure
  const recapData = {
    season: {
      winner: gameState.winner?.name || "TBD",
      runnerUp: gameState.runnerUp?.name || "TBD",
      weeks: gameState.week,
      events: gameState.gameLog
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
        <BookOpen className="h-4 w-4 text-purple-500" />
        <span>Game History</span>
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Game History</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="log" className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="log">Event Log</TabsTrigger>
              <TabsTrigger value="recap">Season Recap</TabsTrigger>
            </TabsList>
            
            <TabsContent value="log" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[60vh]">
                <GameLog />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="recap" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[60vh]">
                <div className="p-4">
                  <SeasonRecap recap={recapData} />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameRecapButton;
