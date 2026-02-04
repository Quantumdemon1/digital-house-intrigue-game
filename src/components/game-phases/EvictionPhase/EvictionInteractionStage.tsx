import React, { useState } from 'react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import EvictionInteractionDialog from './EvictionInteractionDialog';
import { UserX, BrainCircuit, MessageCircle, ArrowRight, Check } from 'lucide-react';
import { AIThoughtBubble } from '@/components/ai-feedback';
import { useAIThoughts } from '@/hooks/useAIThoughts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { GameCard, GameCardHeader, GameCardContent, GameCardTitle, GameCardDescription } from '@/components/ui/game-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EvictionInteractionStageProps {
  nominees: Houseguest[];
  nonNominees: Houseguest[];
  playerIsNominee: boolean;
  onInteractionStageComplete: () => void;
}

const EvictionInteractionStage: React.FC<EvictionInteractionStageProps> = ({
  nominees,
  nonNominees,
  playerIsNominee,
  onInteractionStageComplete
}) => {
  const [remainingInteractions, setRemainingInteractions] = useState(3);
  const [selectedHouseguest, setSelectedHouseguest] = useState<Houseguest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [interactedWith, setInteractedWith] = useState<Set<string>>(new Set());
  const { thoughts, isVisible, addThought, toggleVisibility } = useAIThoughts();

  const { showToast } = useGame();

  const handleHouseguestHover = (houseguest: Houseguest) => {
    if (houseguest.isPlayer) return;
    
    if (!thoughts[houseguest.id]) {
      const isNominee = nominees.some(nominee => nominee.id === houseguest.id);
      const thoughtOptions = isNominee ? [
        `I need to convince people to keep me in the house...`,
        `I wonder if I have enough votes to stay?`,
        `I can't believe I got nominated this week.`
      ] : [
        `I think I'm voting for ${nominees[0]?.name} this time.`,
        `I should talk to the HoH before I decide my vote.`,
        `I need to be careful about who I align with after this eviction.`
      ];
      
      const randomThought = thoughtOptions[Math.floor(Math.random() * thoughtOptions.length)];
      addThought(houseguest, randomThought);
    }
  };

  const handleHouseguestSelect = (houseguest: Houseguest) => {
    setSelectedHouseguest(houseguest);
    setDialogOpen(true);
  };

  const handleInteractionComplete = () => {
    setDialogOpen(false);
    setRemainingInteractions(prev => prev - 1);

    if (selectedHouseguest) {
      setInteractedWith(prev => new Set(prev).add(selectedHouseguest.id));
      showToast(`Interaction with ${selectedHouseguest.name} complete`, {
        description: `You have ${remainingInteractions - 1} interactions remaining`,
        variant: 'info'
      });
    }
  };

  const handleProceed = () => {
    showToast("Moving to voting phase", {
      description: "Houseguests will now vote on who to evict",
      variant: 'info'
    });
    onInteractionStageComplete();
  };

  const availableHouseguests = playerIsNominee 
    ? nonNominees 
    : [...nonNominees.filter(hg => !hg.isPlayer), ...nominees];

  return (
    <div className="space-y-6">
      {/* Header */}
      <GameCard variant="danger" className="overflow-hidden">
        <GameCardHeader variant="danger" icon={UserX}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <GameCardTitle>Eviction Night</GameCardTitle>
              <GameCardDescription className="text-white/80">
                {playerIsNominee 
                  ? "You're nominated! This is your last chance to campaign." 
                  : "Talk with houseguests to influence the upcoming vote."}
              </GameCardDescription>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <Switch 
                id="show-thoughts" 
                checked={isVisible} 
                onCheckedChange={toggleVisibility}
                className="data-[state=checked]:bg-white/30"
              />
              <Label htmlFor="show-thoughts" className="flex items-center cursor-pointer text-white/90 text-sm">
                <BrainCircuit className="w-4 h-4 mr-1.5" />
                AI Thoughts
              </Label>
            </div>
          </div>
        </GameCardHeader>
      </GameCard>
      
      {/* Interaction Counter */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bb-blue/10 to-bb-blue/5 rounded-xl border border-bb-blue/20">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-bb-blue" />
          <div>
            <p className="font-medium text-sm">Remaining Interactions</p>
            <p className="text-xs text-muted-foreground">Use wisely to influence the vote</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300",
                  i < remainingInteractions 
                    ? "bg-bb-blue shadow-glow-primary" 
                    : "bg-muted border border-border"
                )}
              />
            ))}
          </div>
          <Badge variant="secondary" className="text-lg font-bold px-3">
            {remainingInteractions}
          </Badge>
        </div>
      </div>
      
      {/* Houseguest Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableHouseguests.map(houseguest => {
          const isNominee = nominees.some(n => n.id === houseguest.id);
          const hasInteracted = interactedWith.has(houseguest.id);
          const canInteract = remainingInteractions > 0 && !hasInteracted;
          
          return (
            <div 
              key={houseguest.id} 
              className="relative"
              onMouseEnter={() => handleHouseguestHover(houseguest)}
            >
              <div
                className={cn(
                  "game-card cursor-pointer transition-all duration-200 rounded-xl border overflow-hidden",
                  isNominee ? "border-bb-red" : "border-border",
                  canInteract && "hover-lift",
                  !canInteract && "opacity-50 cursor-not-allowed",
                  hasInteracted && "ring-2 ring-bb-green ring-offset-2 ring-offset-background"
                )}
                onClick={() => canInteract && handleHouseguestSelect(houseguest)}
              >
                <GameCardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <StatusAvatar
                        name={houseguest.name}
                        status={isNominee ? 'nominee' : 'none'}
                        size="md"
                        imageUrl={houseguest.imageUrl}
                      />
                      {hasInteracted && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-bb-green rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{houseguest.name}</p>
                        {isNominee && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            NOMINEE
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{houseguest.occupation}</p>
                    </div>
                  </div>
                  
                  {/* AI Thought - Integrated into card */}
                  {!houseguest.isPlayer && thoughts[houseguest.id] && isVisible && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <AIThoughtBubble
                        thought={thoughts[houseguest.id].thought}
                        isVisible={true}
                        character={houseguest.name}
                        className="w-full"
                      />
                    </div>
                  )}
                </GameCardContent>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Proceed Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleProceed} 
          size="lg"
          className={cn(
            "gap-2 transition-all duration-300",
            remainingInteractions === 0 
              ? "bg-bb-blue hover:bg-bb-blue/90 animate-pulse-slow" 
              : "bg-bb-red hover:bg-bb-red/90"
          )}
        >
          {remainingInteractions > 0 ? (
            <>Skip Remaining & Proceed</>
          ) : (
            <>Proceed to Voting</>
          )}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      
      {selectedHouseguest && (
        <EvictionInteractionDialog 
          houseguest={selectedHouseguest} 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          onInteractionComplete={handleInteractionComplete} 
        />
      )}
    </div>
  );
};

export default EvictionInteractionStage;
