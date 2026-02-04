
import React from 'react';
import { Eye, Users, Target, Vote, Crown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { 
  getStrategicIntelLevel, 
  getRelationshipSentiment,
  StrategicIntelLevel 
} from '@/utils/stat-checks';
import { cn } from '@/lib/utils';

interface StrategicIntelProps {
  houseguestId: string;
  houseguestName: string;
  compact?: boolean;
}

/**
 * Displays strategic intelligence about a houseguest based on player's Strategic stat
 */
const StrategicIntel: React.FC<StrategicIntelProps> = ({ 
  houseguestId, 
  houseguestName,
  compact = false 
}) => {
  const { gameState, getRelationship } = useGame();
  
  // Get player's Strategic stat
  const player = gameState.houseguests.find(h => h.isPlayer);
  if (!player || player.id === houseguestId) return null;
  
  const strategicStat = player.stats.strategic;
  const intelLevel = getStrategicIntelLevel(strategicStat);
  
  if (intelLevel === 'none') return null;
  
  // Get relationship from this houseguest TO the player
  const theirOpinionOfPlayer = getRelationship(houseguestId, player.id);
  const sentiment = getRelationshipSentiment(theirOpinionOfPlayer);
  
  // Build intel items based on Strategic level
  const intelItems: React.ReactNode[] = [];
  
  // Basic (3+): See their opinion of you
  if (['basic', 'advanced', 'expert', 'master'].includes(intelLevel)) {
    intelItems.push(
      <div key="sentiment" className="flex items-center gap-1.5">
        <span>{sentiment.emoji}</span>
        <span className={sentiment.color}>{sentiment.label}</span>
      </div>
    );
  }
  
  // Advanced (5+): See who they might target
  if (['advanced', 'expert', 'master'].includes(intelLevel)) {
    // Find who this houseguest likes least
    const houseguest = gameState.houseguests.find(h => h.id === houseguestId);
    if (houseguest && houseguest.status === 'Active') {
      const activeOthers = gameState.houseguests.filter(
        h => h.status === 'Active' && h.id !== houseguestId && h.id !== player.id
      );
      
      if (activeOthers.length > 0) {
        let lowestScore = Infinity;
        let likelyTarget = activeOthers[0];
        
        for (const other of activeOthers) {
          const score = getRelationship(houseguestId, other.id);
          if (score < lowestScore) {
            lowestScore = score;
            likelyTarget = other;
          }
        }
        
        intelItems.push(
          <div key="target" className="flex items-center gap-1.5 text-xs">
            <Target className="w-3 h-3 text-amber-500" />
            <span className="text-muted-foreground">Likely target:</span>
            <span className="text-amber-600">{likelyTarget.name}</span>
          </div>
        );
      }
    }
  }
  
  // Expert (7+): See vote prediction during eviction
  if (['expert', 'master'].includes(intelLevel) && gameState.phase === 'Eviction') {
    const nominees = gameState.nominees;
    if (nominees.length === 2) {
      const nominee1 = gameState.houseguests.find(h => h.id === nominees[0]);
      const nominee2 = gameState.houseguests.find(h => h.id === nominees[1]);
      
      if (nominee1 && nominee2) {
        const score1 = getRelationship(houseguestId, nominees[0]);
        const score2 = getRelationship(houseguestId, nominees[1]);
        
        // They'll vote to evict whoever they like less
        const likelyVote = score1 < score2 ? nominee1.name : nominee2.name;
        
        intelItems.push(
          <div key="vote" className="flex items-center gap-1.5 text-xs">
            <Vote className="w-3 h-3 text-red-500" />
            <span className="text-muted-foreground">Likely voting:</span>
            <span className="text-red-600">{likelyVote}</span>
          </div>
        );
      }
    }
  }
  
  // Master (9+): See alliance info
  if (intelLevel === 'master') {
    // Check if they're in any alliances
    const houseguestAlliances = gameState.alliances?.filter(
      a => a.memberIds.includes(houseguestId) && a.isActive
    ) || [];
    
    if (houseguestAlliances.length > 0) {
      intelItems.push(
        <div key="alliance" className="flex items-center gap-1.5 text-xs">
          <Crown className="w-3 h-3 text-purple-500" />
          <span className="text-muted-foreground">In alliance:</span>
          <span className="text-purple-600">{houseguestAlliances[0].name}</span>
        </div>
      );
    }
  }
  
  if (intelItems.length === 0) return null;
  
  if (compact) {
    // Show just the sentiment emoji with tooltip
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-0.5 cursor-help">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs">{sentiment.emoji}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-medium">
                <Eye className="w-3 h-3" />
                Strategic Intel on {houseguestName}
              </div>
              {intelItems}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Full display
  return (
    <div className="mt-2 p-2 rounded-md bg-slate-100/50 dark:bg-slate-800/50 border border-border/50">
      <div className="flex items-center gap-1 text-xs font-medium mb-1.5">
        <Eye className="w-3 h-3 text-bb-blue" />
        <span className="text-bb-blue">Strategic Intel</span>
      </div>
      <div className="space-y-1">
        {intelItems}
      </div>
    </div>
  );
};

export default StrategicIntel;
