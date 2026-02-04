
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Target, VenetianMask, Heart } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import { useGame } from '@/contexts/GameContext';
import { useAIThoughtsContext } from '@/components/ai-feedback';
import AIThoughtDisplay from '../AIThoughtDisplay';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StrategicSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const StrategicSection: React.FC<StrategicSectionProps> = ({ actions, onActionClick }) => {
  const { gameState, getRelationship } = useGame();
  const { addStrategy } = useAIThoughtsContext();
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
  
  // Handle click with AI thought generation
  const handleActionClick = (actionId: string, params?: any) => {
    // Generate a strategic thought for the target houseguest
    if (params?.targetId) {
      const targetHouseguest = gameState.houseguests.find(h => h.id === params.targetId);
      if (targetHouseguest) {
        // Generate some sample strategic thoughts
        const strategies = [
          "They want to talk strategy? This could be interesting...",
          "I need to be careful about revealing my true targets.",
          "Maybe I can use this conversation to my advantage.",
          "I should try to figure out what their game plan is.",
          "This might be a good time to suggest a potential target."
        ];
        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        addStrategy(targetHouseguest, randomStrategy);
      }
    }
    
    // Call the original click handler
    onActionClick(actionId, params);
  };
  
  // Group actions by target for better organization
  const actionsByTarget = actions.reduce((grouped, action) => {
    if (action.actionId === 'eavesdrop') {
      if (!grouped['eavesdrop']) {
        grouped['eavesdrop'] = [];
      }
      grouped['eavesdrop'].push(action);
      return grouped;
    }
    
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
        <div className="p-1.5 rounded-lg bg-purple-500/10">
          <Target className="h-4 w-4 text-purple-600" />
        </div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Strategic Actions
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(actionsByTarget).map(([targetId, targetActions]) => {
          if (targetId === 'eavesdrop') {
            return (
              <div key={targetId} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-gray-500/10">
                    <VenetianMask className="h-4 w-4 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-foreground">Eavesdrop</h4>
                </div>
                
                <div className="space-y-2">
                  {targetActions.map(action => (
                    <Button
                      key={action.actionId + JSON.stringify(action.parameters)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-auto py-2 text-left"
                      disabled={action.disabled}
                      title={action.disabledReason}
                      onClick={() => handleActionClick(action.actionId, action.parameters)}
                    >
                      <VenetianMask className="h-4 w-4 mr-2 flex-shrink-0 text-gray-600" />
                      <span className="flex-1 truncate text-sm">{action.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            );
          }
          
          const target = gameState.houseguests.find(h => h.id === targetId);
          if (!target) return null;
          
          const targetName = targetActions[0]?.parameters?.targetName || target.name;
          const relationship = player ? getRelationship(player.id, targetId) : 0;
          
          return (
            <div key={targetId} className="rounded-xl border border-border bg-card p-4 hover:border-purple-500/30 transition-colors">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <StatusAvatar
                  name={target.name}
                  imageUrl={target.imageUrl}
                  size="sm"
                  showBadge={false}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{targetName}</h4>
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
              
              {/* AI Thought Display */}
              <AIThoughtDisplay targetId={targetId} />
              
              {/* Actions */}
              <div className="space-y-2 mt-3">
                {targetActions.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-auto py-2 text-left hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    <Target className="h-4 w-4 mr-2 flex-shrink-0 text-purple-600" />
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

export default StrategicSection;
