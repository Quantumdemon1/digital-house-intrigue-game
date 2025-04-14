
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AIThoughtToggle } from '@/components/ai-feedback';
import { FastForwardButton } from './FastForwardButton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';
import { RelationshipButton } from '@/components/relationship';
import { PromiseButton } from '@/components/promise';
import GameRecapButton from './GameRecapButton';
import SaveLoadButton from './SaveLoadButton';

const GameHeader: React.FC = () => {
  const { gameState } = useGame();
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b sticky top-0 z-40 w-full py-2 px-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">
            Big Brother: Digital House
          </h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Season 1
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* AI Thoughts Toggle */}
          <AIThoughtToggle variant="small" className="mr-2" />
          
          {/* Fast Forward Button */}
          <FastForwardButton />
          
          {/* Relationship Button */}
          <RelationshipButton />
          
          {/* Promises Button */}
          <PromiseButton />
          
          {/* Game History Button */}
          <GameRecapButton />
          
          {/* Save/Load Button */}
          <SaveLoadButton />
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Home Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">Home</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
