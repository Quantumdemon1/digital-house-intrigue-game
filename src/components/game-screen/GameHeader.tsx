
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AIThoughtToggle } from '@/components/ai-feedback/AIThoughtToggle';
import { FastForwardButton } from './FastForwardButton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, BarChart, Shield } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';

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
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => document.dispatchEvent(new CustomEvent('game:showRelationships'))}
          >
            <BarChart className="h-4 w-4" />
            <span className="hidden md:inline">Relationships</span>
          </Button>
          
          {/* Promises Button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => document.dispatchEvent(new CustomEvent('game:showPromises'))}
          >
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Promises</span>
          </Button>
          
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
