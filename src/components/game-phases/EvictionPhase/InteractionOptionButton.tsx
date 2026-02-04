
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InteractionOption } from './types/interactions';
import { useGame } from '@/contexts/GameContext';
import { 
  calculateSuccessChance, 
  getSuccessCategory,
  meetsStatRequirement 
} from '@/utils/stat-checks';
import { AlertTriangle, Check, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractionOptionButtonProps {
  option: InteractionOption;
  onSelect: (option: InteractionOption) => void;
}

const InteractionOptionButton: React.FC<InteractionOptionButtonProps> = ({ option, onSelect }) => {
  const { gameState } = useGame();
  
  // Get player's social stat
  const player = gameState.houseguests.find(h => h.isPlayer);
  const playerSocialStat = player?.stats.social ?? 5;
  const requiredStat = option.requiredSocialStat ?? 3;
  
  // Calculate success chance
  const successChance = calculateSuccessChance(playerSocialStat, requiredStat);
  const successCategory = getSuccessCategory(successChance);
  const meetsRequirement = meetsStatRequirement(playerSocialStat, requiredStat);
  
  // Determine if this is a "risky" option
  const isRisky = successChance < 50;
  const isGuaranteed = successChance >= 95;
  
  return (
    <Button
      variant="outline" 
      className={cn(
        "w-full justify-start h-auto py-3 px-4 text-left flex-col items-start gap-2",
        "hover:bg-accent/50 transition-all",
        isRisky && "border-amber-500/30 hover:border-amber-500/50",
        isGuaranteed && "border-green-500/30 hover:border-green-500/50"
      )}
      onClick={() => onSelect(option)}
    >
      {/* Main content */}
      <span className="flex items-center w-full">
        {option.icon}
        <span className="flex-1">{option.text}</span>
      </span>
      
      {/* Stats line */}
      <div className="flex items-center justify-between w-full text-xs gap-2 pt-1 border-t border-border/50">
        {/* Stat requirement */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            Requires: <span className={meetsRequirement ? 'text-green-600' : 'text-amber-600'}>
              Social {requiredStat}
            </span>
          </span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-muted-foreground">
            Yours: <span className="font-medium text-foreground">{playerSocialStat}</span>
          </span>
        </div>
        
        {/* Success indicator */}
        <div className="flex items-center gap-2">
          {option.relationshipChange > 0 && (
            <span className="text-muted-foreground flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-green-500" />
              +{option.relationshipChange}
            </span>
          )}
          
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[10px] px-1.5 py-0",
              successCategory.bgColor,
              successCategory.color
            )}
          >
            {isRisky && <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />}
            {isGuaranteed && <Check className="w-2.5 h-2.5 mr-0.5" />}
            {successChance}%
          </Badge>
        </div>
      </div>
    </Button>
  );
};

export default InteractionOptionButton;
