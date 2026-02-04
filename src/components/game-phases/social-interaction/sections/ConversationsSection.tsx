
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Heart } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import { useGame } from '@/contexts/GameContext';
import { useAIThoughtsContext } from '@/components/ai-feedback';
import AIThoughtDisplay from '../AIThoughtDisplay';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConversationsSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const ConversationsSection: React.FC<ConversationsSectionProps> = ({ actions, onActionClick }) => {
  const { gameState, getRelationship } = useGame();
  const { addThought } = useAIThoughtsContext();
  const [recentInteraction, setRecentInteraction] = useState<{
    targetId: string;
    change: number;
  } | null>(null);
  
  const player = gameState.houseguests.find(h => h.isPlayer);
  
  // Watch for relationship impact changes
  useEffect(() => {
    if (gameState.lastRelationshipImpact) {
      const { targetId, value, timestamp } = gameState.lastRelationshipImpact;
      // Only show if it's a recent change (within 5 seconds)
      if (Date.now() - timestamp < 5000) {
        setRecentInteraction({ targetId, change: value });
        // Clear after animation
        const timer = setTimeout(() => setRecentInteraction(null), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.lastRelationshipImpact]);
  
  const handleActionClick = (actionId: string, params?: any) => {
    if (params?.targetId) {
      const targetHouseguest = gameState.houseguests.find(h => h.id === params.targetId);
      if (targetHouseguest) {
        const personalities = [
          "I wonder what they want to talk about...",
          "This could be an opportunity to build trust.",
          "I hope they're not trying to get information from me.",
          "I need to be careful what I say here.",
          "Maybe we can form an alliance?"
        ];
        const randomThought = personalities[Math.floor(Math.random() * personalities.length)];
        addThought(targetHouseguest, randomThought);
      }
    }
    
    onActionClick(actionId, params);
  };
  
  // Group actions by target for better organization
  const actionsByTarget = actions.reduce((grouped, action) => {
    const targetId = action.parameters?.targetId;
    if (!targetId) return grouped;
    
    if (!grouped[targetId]) {
      grouped[targetId] = [];
    }
    grouped[targetId].push(action);
    return grouped;
  }, {} as Record<string, SocialActionChoice[]>);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-bb-blue/10">
          <MessageSquare className="h-4 w-4 text-bb-blue" />
        </div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Talk to Houseguests
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(actionsByTarget).map(([targetId, targetActions]) => {
          const targetName = targetActions[0]?.parameters?.targetName || "Unknown";
          const targetHouseguest = gameState.houseguests.find(h => h.id === targetId);
          const relationship = player ? getRelationship(player.id, targetId) : 0;
          
          return (
            <div 
              key={targetId} 
              className="rounded-xl border border-border bg-card p-4 hover:border-bb-blue/30 transition-colors"
            >
              {/* Target Header */}
              <div className="flex items-center gap-3 mb-3">
                {targetHouseguest ? (
                  <StatusAvatar
                    name={targetHouseguest.name}
                    imageUrl={targetHouseguest.imageUrl}
                    size="sm"
                    showBadge={false}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">{targetName}</h4>
                  {targetHouseguest?.occupation && (
                    <p className="text-xs text-muted-foreground">{targetHouseguest.occupation}</p>
                  )}
                </div>
                {/* Relationship Score */}
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  relationship > 30 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                  relationship > 0 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  relationship > -20 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : 
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  <Heart className="h-3 w-3" />
                  {relationship >= 0 ? '+' : ''}{relationship}
                </div>
              </div>
              
              {/* Relationship Feedback Animation */}
              <AnimatePresence>
                {recentInteraction?.targetId === targetId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="mb-3 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <span className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-current" />
                      +{recentInteraction.change} relationship
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* AI Thought Display */}
              <AIThoughtDisplay targetId={targetId} />
              
              {/* Action Buttons */}
              <div className="space-y-2 mt-3">
                {targetActions.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-auto py-2 text-left hover:bg-bb-blue/5 hover:border-bb-blue/30"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationsSection;
