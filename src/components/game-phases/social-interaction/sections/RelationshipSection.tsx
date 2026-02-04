
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Award, Heart, User } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import { useGame } from '@/contexts/GameContext';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RelationshipSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const RelationshipSection: React.FC<RelationshipSectionProps> = ({ actions, onActionClick }) => {
  const { gameState, getRelationship } = useGame();
  const [recentInteraction, setRecentInteraction] = useState<{
    targetId: string;
    change: number;
  } | null>(null);
  
  const player = gameState.houseguests.find(h => h.isPlayer);
  
  // Watch for relationship impact changes
  useEffect(() => {
    if (gameState.lastRelationshipImpact) {
      const { targetId, value, timestamp } = gameState.lastRelationshipImpact;
      if (Date.now() - timestamp < 5000) {
        setRecentInteraction({ targetId, change: value });
        const timer = setTimeout(() => setRecentInteraction(null), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.lastRelationshipImpact]);
  
  // Group actions by target
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
        <div className="p-1.5 rounded-lg bg-pink-500/10">
          <Award className="h-4 w-4 text-pink-600" />
        </div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Relationship Building
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(actionsByTarget).map(([targetId, targetActions]) => {
          const target = gameState.houseguests.find(h => h.id === targetId);
          if (!target) return null;
          
          const relationship = player ? getRelationship(player.id, targetId) : 0;
          
          return (
            <div 
              key={targetId}
              className="rounded-xl border border-border bg-card p-4 hover:border-pink-500/30 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <StatusAvatar
                  name={target.name}
                  imageUrl={target.imageUrl}
                  size="sm"
                  showBadge={false}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{target.name}</h4>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  relationship > 30 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                  relationship > 0 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  <Heart className="h-3 w-3" />
                  {relationship >= 0 ? '+' : ''}{relationship}
                </div>
              </div>
              
              {/* Feedback Animation */}
              <AnimatePresence>
                {recentInteraction?.targetId === targetId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-3 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <span className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-current" />
                      +{recentInteraction.change} relationship
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Action */}
              {targetActions.map(action => (
                <Button
                  key={action.actionId + JSON.stringify(action.parameters)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-auto py-2 text-left hover:bg-pink-50 hover:border-pink-300 dark:hover:bg-pink-900/20"
                  disabled={action.disabled}
                  title={action.disabledReason}
                  onClick={() => onActionClick(action.actionId, action.parameters)}
                >
                  <Award className="h-4 w-4 mr-2 flex-shrink-0 text-pink-600" />
                  <span className="flex-1 truncate text-sm">{action.text}</span>
                </Button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelationshipSection;
