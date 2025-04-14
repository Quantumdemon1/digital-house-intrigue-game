
import React, { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import GameHeader from './GameHeader';
import GameSidebar from './GameSidebar';
import PhaseContent from './PhaseContent';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useGameDialogs } from '@/hooks/useGameDialogs';
import RelationshipDialog from '@/components/relationship/RelationshipDialog';
import { PromiseDialog } from '@/components/promise';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import GameLog from '../GameEventLog';
import SeasonRecap from '../game-phases/GameOverPhase/SeasonRecap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GameScreen: React.FC = () => {
  const {
    gameState,
    logger
  } = useGame();
  
  const {
    phase
  } = gameState;
  
  const {
    isRelationshipDialogOpen,
    setIsRelationshipDialogOpen,
    isPromiseDialogOpen,
    setIsPromiseDialogOpen,
    isGameHistoryDialogOpen,
    setIsGameHistoryDialogOpen,
    isSaveLoadDialogOpen,
    setIsSaveLoadDialogOpen
  } = useGameDialogs();
  
  // Log phase changes for debugging
  useEffect(() => {
    logger.info(`Current game phase: ${phase}`);
  }, [phase, logger]);
  
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
    <div className="container mx-auto p-4 flex flex-col h-full surveillance-bg">
      <GameHeader />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg overflow-hidden">
        <ResizablePanel defaultSize={65} minSize={50} className="bg-background">
          <div className="p-4 space-y-6 h-full overflow-y-auto">
            <PhaseContent phase={phase} />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-border" />
        
        <ResizablePanel defaultSize={35} minSize={25} maxSize={45} className="bg-sidebar">
          <div className="p-4 h-full overflow-y-auto bg-slate-500">
            <GameSidebar />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Relationship Dialog */}
      <RelationshipDialog 
        open={isRelationshipDialogOpen} 
        onOpenChange={setIsRelationshipDialogOpen} 
      />
      
      {/* Promise Dialog */}
      <PromiseDialog 
        open={isPromiseDialogOpen} 
        onOpenChange={setIsPromiseDialogOpen} 
      />
      
      {/* Game History Dialog */}
      <Dialog open={isGameHistoryDialogOpen} onOpenChange={setIsGameHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
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
    </div>
  );
};

export default GameScreen;
