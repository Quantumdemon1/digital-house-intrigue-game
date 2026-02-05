
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { Check, Target, Eye } from 'lucide-react';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { useGame } from '@/contexts/GameContext';
import { getStrategicIntelLevel, getRelationshipSentiment } from '@/utils/stat-checks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NomineeSelectorProps {
  potentialNominees: Houseguest[];
  nominees: Houseguest[];
  onToggleNominee: (houseguest: Houseguest) => void;
}

const NomineeSelector: React.FC<NomineeSelectorProps> = ({
  potentialNominees,
  nominees,
  onToggleNominee
}) => {
  const { gameState, getRelationship } = useGame();
  
  const player = gameState.houseguests.find(h => h.isPlayer);
  const strategicStat = player?.stats.strategic ?? 0;
  const intelLevel = getStrategicIntelLevel(strategicStat);
  
  const isSelected = (houseguest: Houseguest) => {
    return nominees.some(nominee => nominee.id === houseguest.id);
  };

  // Calculate threat level for Strategic 5+ display
  const getThreatInfo = (houseguest: Houseguest) => {
    if (!['advanced', 'expert', 'master'].includes(intelLevel)) return null;
    
    // Calculate how many houseguests dislike this person
    const activeHouseguests = gameState.houseguests.filter(
      h => h.status === 'Active' && h.id !== houseguest.id && h.id !== player?.id
    );
    
    let negativeOpinions = 0;
    let totalScore = 0;
    
    for (const hg of activeHouseguests) {
      const score = getRelationship(hg.id, houseguest.id);
      totalScore += score;
      if (score < -10) negativeOpinions++;
    }
    
    const avgOpinion = activeHouseguests.length > 0 
      ? totalScore / activeHouseguests.length 
      : 0;
    
    if (negativeOpinions >= 3 || avgOpinion < -20) {
      return { label: 'Easy target', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
    if (avgOpinion > 30) {
      return { label: 'Popular', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
    return { label: 'Neutral standing', color: 'text-amber-600', bgColor: 'bg-amber-100' };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {potentialNominees.map(houseguest => {
        const selected = isSelected(houseguest);
        const threatInfo = getThreatInfo(houseguest);
        const theirOpinion = player ? getRelationship(houseguest.id, player.id) : 0;
        const sentiment = getRelationshipSentiment(theirOpinion);
        
        return (
          <Button
            key={houseguest.id}
            variant={selected ? "default" : "outline"}
            className={cn(
              "h-auto py-4 px-4 justify-start transition-all duration-300 flex-col items-start",
              selected 
                ? 'bg-bb-red hover:bg-bb-red/90 text-white border-bb-red shadow-game-md' 
                : 'hover:border-bb-red/50 hover:bg-bb-red/5'
            )}
            onClick={() => onToggleNominee(houseguest)}
          >
            <div className="flex items-center w-full gap-3">
              <StatusAvatar
                name={houseguest.name}
                avatarUrl={houseguest.avatarUrl}
                status={selected ? 'nominee' : 'none'}
                size="sm"
                showBadge={false}
              />
              <div className="flex-grow text-left">
                <div className="font-semibold">{houseguest.name}</div>
                <div className={`text-xs ${selected ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {houseguest.occupation}
                </div>
              </div>
              {selected && (
                <div className="p-1 rounded-full bg-white/20">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            
            {/* Strategic Intel Display */}
            {intelLevel !== 'none' && (
              <div className={cn(
                "w-full mt-2 pt-2 border-t flex items-center justify-between text-xs",
                selected ? 'border-white/20' : 'border-border/50'
              )}>
                {/* Opinion of you (Strategic 3+) */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-1 cursor-help",
                        selected ? 'text-white/80' : sentiment.color
                      )}>
                        <Eye className="w-3 h-3" />
                        <span>{sentiment.emoji}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">{houseguest.name} {sentiment.label.toLowerCase()} you</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Threat level (Strategic 5+) */}
                {threatInfo && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded cursor-help",
                          selected ? 'bg-white/10 text-white/80' : threatInfo.bgColor + ' ' + threatInfo.color
                        )}>
                          <Target className="w-3 h-3" />
                          <span>{threatInfo.label}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">House sentiment toward {houseguest.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default NomineeSelector;
