
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import GamePhaseHeader from '../GamePhaseHeader';
import GameSidebar from './GameSidebar';
import PhaseContent from './PhaseContent';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const GameScreen: React.FC = () => {
  const { gameState } = useGame();
  const { phase } = gameState;

  return (
    <div className="container mx-auto p-4 flex flex-col h-full surveillance-bg">
      <GamePhaseHeader />
      
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg overflow-hidden"
      >
        <ResizablePanel defaultSize={65} minSize={50} className="bg-background">
          <div className="p-4 space-y-6 h-full overflow-y-auto">
            <PhaseContent phase={phase} />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-border" />
        
        <ResizablePanel defaultSize={35} minSize={25} maxSize={45} className="bg-sidebar">
          <div className="p-4 h-full overflow-y-auto">
            <GameSidebar />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default GameScreen;
