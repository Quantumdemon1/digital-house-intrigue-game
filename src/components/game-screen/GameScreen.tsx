
import React, { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import GameHeader from './GameHeader';
import GameSidebar from './GameSidebar';
import PhaseContent from './PhaseContent';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useGameDialogs } from '@/hooks/useGameDialogs';
import RelationshipDialog from '@/components/relationship/RelationshipDialog';
import { PromiseDialog } from '@/components/promise';

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
    setIsPromiseDialogOpen
  } = useGameDialogs();
  
  // Log phase changes for debugging
  useEffect(() => {
    logger.info(`Current game phase: ${phase}`);
  }, [phase, logger]);
  
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
    </div>
  );
};

export default GameScreen;
