
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import { useGame } from '@/contexts/GameContext';
import { useAIThoughtsContext } from '@/components/ai-feedback';
import AIThoughtDisplay from '../AIThoughtDisplay';

interface ConversationsSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const ConversationsSection: React.FC<ConversationsSectionProps> = ({ actions, onActionClick }) => {
  const { game } = useGame();
  const { addThought } = useAIThoughtsContext();
  
  // Handle click with AI thought generation
  const handleActionClick = (actionId: string, params?: any) => {
    // Generate a random thought for the target houseguest
    if (params?.targetId) {
      const targetHouseguest = game?.getHouseguestById(params.targetId);
      if (targetHouseguest) {
        // Generate some sample thoughts based on their personality
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
    
    // Call the original click handler
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
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
        <MessageSquare size={14} className="mr-1" /> TALK TO HOUSEGUESTS
      </h3>
      
      <div className="space-y-4">
        {Object.entries(actionsByTarget).map(([targetId, targetActions]) => {
          const targetName = targetActions[0]?.parameters?.targetName || "Unknown";
          
          return (
            <div key={targetId} className="border rounded-md p-3 bg-card">
              <h4 className="text-sm font-medium mb-2">{targetName}</h4>
              
              {/* Show AI thought bubble for this houseguest */}
              <AIThoughtDisplay targetId={targetId} />
              
              <div className="grid grid-cols-1 gap-2 mt-2">
                {targetActions.map(action => (
                  <Button
                    key={action.actionId + JSON.stringify(action.parameters)}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto text-left"
                    disabled={action.disabled}
                    title={action.disabledReason}
                    onClick={() => handleActionClick(action.actionId, action.parameters)}
                  >
                    <MessageSquare size={14} className="mr-1 flex-shrink-0"/>
                    <span className="flex-1 truncate">{action.text}</span>
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
