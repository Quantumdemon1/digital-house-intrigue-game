
import React, { useState, useEffect } from 'react';
import { CircleDot, Shuffle, SkipForward, Check } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { cn } from '@/lib/utils';

interface ChipDrawProps {
  eligiblePlayers: Houseguest[];
  mandatoryPlayers: Houseguest[];
  numToDraw: number;
  onDrawComplete: (drawnPlayers: string[]) => void;
  onSkip: () => void;
}

type DrawState = 'idle' | 'shaking' | 'drawing' | 'revealed' | 'placed';

const ChipDraw: React.FC<ChipDrawProps> = ({
  eligiblePlayers,
  mandatoryPlayers,
  numToDraw,
  onDrawComplete,
  onSkip
}) => {
  const [drawnPlayers, setDrawnPlayers] = useState<Houseguest[]>([]);
  const [currentDraw, setCurrentDraw] = useState<Houseguest | null>(null);
  const [drawState, setDrawState] = useState<DrawState>('idle');
  const [remainingEligible, setRemainingEligible] = useState<Houseguest[]>(eligiblePlayers);
  
  const isDrawComplete = drawnPlayers.length >= numToDraw;
  
  // Handle draw animation sequence
  useEffect(() => {
    if (drawState === 'shaking') {
      const timer = setTimeout(() => setDrawState('drawing'), 600);
      return () => clearTimeout(timer);
    }
    
    if (drawState === 'drawing') {
      // Pick a random player
      const randomIndex = Math.floor(Math.random() * remainingEligible.length);
      const selectedPlayer = remainingEligible[randomIndex];
      setCurrentDraw(selectedPlayer);
      
      const timer = setTimeout(() => setDrawState('revealed'), 800);
      return () => clearTimeout(timer);
    }
    
    if (drawState === 'revealed') {
      const timer = setTimeout(() => setDrawState('placed'), 1500);
      return () => clearTimeout(timer);
    }
    
    if (drawState === 'placed' && currentDraw) {
      // Add to drawn players and remove from eligible
      setDrawnPlayers(prev => [...prev, currentDraw]);
      setRemainingEligible(prev => prev.filter(p => p.id !== currentDraw.id));
      setCurrentDraw(null);
      setDrawState('idle');
    }
  }, [drawState, remainingEligible, currentDraw]);
  
  // Check if draw is complete
  useEffect(() => {
    if (isDrawComplete) {
      const drawnIds = drawnPlayers.map(p => p.id);
      onDrawComplete(drawnIds);
    }
  }, [isDrawComplete, drawnPlayers, onDrawComplete]);
  
  const handleDrawChip = () => {
    if (drawState !== 'idle' || isDrawComplete) return;
    setDrawState('shaking');
  };
  
  const handleDrawAll = () => {
    // Instantly draw all remaining
    const shuffled = [...remainingEligible].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numToDraw - drawnPlayers.length);
    setDrawnPlayers(prev => [...prev, ...selected]);
    setRemainingEligible(prev => prev.filter(p => !selected.some(s => s.id === p.id)));
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-display font-bold text-foreground">
          Veto Player Draw
        </h3>
        <p className="text-sm text-muted-foreground">
          {isDrawComplete 
            ? 'All players have been drawn!' 
            : `Draw ${numToDraw - drawnPlayers.length} more chip${numToDraw - drawnPlayers.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>
      
      {/* Chip Bag */}
      {!isDrawComplete && (
        <div className="flex flex-col items-center">
          <div 
            className={cn(
              "relative w-32 h-40 rounded-b-[50%] rounded-t-lg",
              "bg-gradient-to-b from-amber-700 to-amber-900",
              "border-4 border-amber-600 shadow-lg",
              "flex items-center justify-center",
              "transition-transform",
              drawState === 'shaking' && "animate-[shake_0.5s_ease-in-out]"
            )}
          >
            {/* Bag opening */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-amber-950 rounded-b-lg" />
            
            {/* Chips inside */}
            <div className="flex flex-wrap justify-center gap-1 p-2">
              {remainingEligible.slice(0, 6).map((_, i) => (
                <div 
                  key={i}
                  className="w-4 h-4 rounded-full bg-gradient-to-br from-bb-blue to-bb-blue/70 border border-white/30"
                />
              ))}
            </div>
            
            {/* Drawing chip animation */}
            {(drawState === 'drawing' || drawState === 'revealed') && currentDraw && (
              <div 
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 transition-all duration-500",
                  drawState === 'drawing' && "top-0 opacity-0",
                  drawState === 'revealed' && "-top-20 opacity-100"
                )}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bb-gold to-amber-500 border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs text-center px-1">
                      {currentDraw.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Draw buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleDrawChip}
              disabled={drawState !== 'idle' || isDrawComplete}
              className="bg-bb-blue hover:bg-bb-blue/90 text-white"
            >
              <CircleDot className="h-4 w-4 mr-2" />
              Draw Chip
            </Button>
            <Button
              variant="outline"
              onClick={handleDrawAll}
              disabled={drawState !== 'idle' || isDrawComplete}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Draw All
            </Button>
          </div>
        </div>
      )}
      
      {/* Players Grid */}
      <div className="space-y-4">
        {/* Mandatory Players */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-bb-green" />
            Mandatory Players
          </h4>
          <div className="flex flex-wrap gap-3">
            {mandatoryPlayers.map(player => (
              <div 
                key={player.id}
                className="flex flex-col items-center p-3 rounded-lg bg-bb-green/10 border border-bb-green/30"
              >
                <StatusAvatar
                  name={player.name}
                  imageUrl={player.imageUrl}
                  size="md"
                  isPlayer={player.isPlayer}
                />
                <span className="text-xs font-medium mt-2 text-foreground">{player.name}</span>
                <span className="text-xs text-bb-green mt-0.5">
                  {player.id === mandatoryPlayers[0]?.id ? 'HoH' : 'Nominee'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Drawn Players */}
        {drawnPlayers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-bb-gold" />
              Drawn Players ({drawnPlayers.length}/{numToDraw})
            </h4>
            <div className="flex flex-wrap gap-3">
              {drawnPlayers.map((player, index) => (
                <div 
                  key={player.id}
                  className="flex flex-col items-center p-3 rounded-lg bg-bb-gold/10 border border-bb-gold/30 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <StatusAvatar
                    name={player.name}
                    imageUrl={player.imageUrl}
                    size="md"
                    isPlayer={player.isPlayer}
                  />
                  <span className="text-xs font-medium mt-2 text-foreground">{player.name}</span>
                  <span className="text-xs text-bb-gold mt-0.5">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Skip button */}
      <div className="flex justify-center">
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-muted-foreground"
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Skip Draw Animation
        </Button>
      </div>
    </div>
  );
};

export default ChipDraw;
