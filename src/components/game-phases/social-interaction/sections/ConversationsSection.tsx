
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, User } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import { useGame } from '@/contexts/GameContext';
import { useAIThoughtsContext } from '@/components/ai-feedback';
import AIThoughtDisplay from '../AIThoughtDisplay';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface ConversationsSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const ConversationsSection: React.FC<ConversationsSectionProps> = ({ actions, onActionClick }) => {
  const { game } = useGame();
  const { addThought } = useAIThoughtsContext();
  
  const handleActionClick = (actionId: string, params?: any) => {
    if (params?.targetId) {
      const targetHouseguest = game?.getHouseguestById(params.targetId);
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
          const targetHouseguest = game?.getHouseguestById(targetId);
          
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
                <div>
                  <h4 className="font-semibold text-foreground">{targetName}</h4>
                  {targetHouseguest?.occupation && (
                    <p className="text-xs text-muted-foreground">{targetHouseguest.occupation}</p>
                  )}
                </div>
              </div>
              
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
