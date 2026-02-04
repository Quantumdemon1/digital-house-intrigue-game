
import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff, Minus, Sparkles, AlertTriangle } from 'lucide-react';
import { InteractionOption } from './types/interactions';
import { Houseguest } from '@/models/houseguest';
import { useRelationshipImpact } from '@/contexts/RelationshipImpactContext';
import { useGame } from '@/contexts/GameContext';
import { 
  calculateSuccessChance, 
  rollStatCheck, 
  getFailedInteractionPenalty 
} from '@/utils/stat-checks';

interface InteractionResultsProps {
  selectedOption: InteractionOption;
  houseguest: Houseguest;
  onComplete: () => void;
}

const InteractionResults: React.FC<InteractionResultsProps> = ({
  selectedOption,
  houseguest,
  onComplete
}) => {
  const { gameState } = useGame();
  const { addImpact } = useRelationshipImpact();
  
  // Get player's social stat for the roll
  const player = gameState.houseguests.find(h => h.isPlayer);
  const playerSocialStat = player?.stats.social ?? 5;
  const requiredStat = selectedOption.requiredSocialStat ?? 3;
  
  // Calculate and roll for success - memoize so it doesn't re-roll on re-renders
  const { succeeded, successChance, actualChange, responseText, wasCloseCall } = useMemo(() => {
    const chance = calculateSuccessChance(playerSocialStat, requiredStat);
    const roll = Math.random() * 100;
    const success = roll < chance;
    
    // Determine actual relationship change based on success/failure
    let change = selectedOption.relationshipChange;
    let text = selectedOption.responseText;
    
    if (!success) {
      // Failed interaction - backfire!
      change = getFailedInteractionPenalty(selectedOption.relationshipChange);
      text = generateFailureResponse(houseguest.name, selectedOption.id);
    }
    
    // Check if it was a close call (within 10% of threshold)
    const closeCall = Math.abs(roll - chance) < 10;
    
    return {
      succeeded: success,
      successChance: chance,
      actualChange: change,
      responseText: text,
      wasCloseCall: closeCall && success
    };
  }, [playerSocialStat, requiredStat, selectedOption, houseguest.name]);
  
  // Show relationship impact when component mounts
  useEffect(() => {
    if (actualChange !== 0) {
      addImpact(houseguest.id, houseguest.name, actualChange);
    }
  }, [houseguest.id, houseguest.name, actualChange, addImpact]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Success/Failure indicator */}
      {!succeeded && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">Your approach backfired!</p>
            <p className="text-xs text-red-600/80 dark:text-red-400/60">
              Success chance was {successChance}% - better luck next time
            </p>
          </div>
        </div>
      )}
      
      {wasCloseCall && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-400">Close call!</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/60">
              Your Social stat helped you succeed where others might have failed
            </p>
          </div>
        </div>
      )}

      {/* Display the outcome text */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md border border-border">
         <p className="font-medium text-foreground mb-2">Their Response:</p>
         <p className="text-sm italic text-muted-foreground">"{responseText}"</p>
      </div>

      {/* Display relationship change */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center font-medium">
          <span className="mr-2">Relationship Change:</span>
          {actualChange > 0 ? (
            <span className="flex items-center text-green-600">
              <Heart className="w-4 h-4 mr-1 fill-current" />
              +{actualChange}
            </span>
          ) : actualChange < 0 ? (
             <span className="flex items-center text-red-600">
                 <HeartOff className="w-4 h-4 mr-1" />
                 {actualChange}
             </span>
           ) : (
              <span className="flex items-center text-muted-foreground">
                  <Minus className="w-4 h-4 mr-1" />
                  No Change
              </span>
           )}
        </div>
        <Button onClick={onComplete}>Continue</Button>
      </div>
    </div>
  );
};

/**
 * Generate a contextual failure response
 */
function generateFailureResponse(name: string, optionId: string): string {
  const failureResponses: Record<string, string[]> = {
    emotional: [
      `${name} seems uncomfortable with your emotional appeal and excuses themselves.`,
      `${name} doesn't buy your sincerity and looks skeptical.`,
    ],
    logical: [
      `${name} pokes holes in your strategic argument and seems unconvinced.`,
      `${name} questions your logic and wonders if you're just desperate.`,
    ],
    loyalty: [
      `${name} scoffs at your promise of loyalty, clearly not believing you.`,
      `${name} reminds you of past actions that contradict your claims of loyalty.`,
    ],
    casual: [
      `${name} seems distracted and the conversation falls flat.`,
      `${name} politely disengages from your small talk attempt.`,
    ],
    competitive: [
      `${name} is unimpressed by your bravado and walks away.`,
    ],
    info: [
      `${name} suspects you're making things up and loses trust in you.`,
    ],
    direct: [
      `${name} finds your directness abrasive and shuts down.`,
    ],
    analyze: [
      `${name} thinks you're overthinking things and tunes out.`,
    ],
  };
  
  const responses = failureResponses[optionId] || [
    `${name} doesn't respond well to your approach.`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export default InteractionResults;
