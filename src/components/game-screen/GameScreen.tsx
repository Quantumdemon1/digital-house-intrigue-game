
import React, { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import GameHeader from './GameHeader';
import GameSidebar from './GameSidebar';
import PhaseContent from './PhaseContent';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const GameScreen: React.FC = () => {
  const {
    gameState,
    logger
  } = useGame();
  
  const {
    phase
  } = gameState;
  
  // Log phase changes for debugging
  useEffect(() => {
    logger.info(`Current game phase: ${phase}`);
  }, [phase, logger]);
  
  return <div className="container mx-auto p-4 flex flex-col h-full surveillance-bg">
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
    </div>;
};

export default GameScreen;
