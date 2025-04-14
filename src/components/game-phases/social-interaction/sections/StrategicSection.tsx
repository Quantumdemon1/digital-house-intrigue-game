
import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, VenetianMask } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import { useGame } from '@/contexts/GameContext';
import { useAIThoughtsContext } from '@/components/ai-feedback';
import AIThoughtDisplay from '../AIThoughtDisplay';

interface StrategicSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const StrategicSection: React.FC<StrategicSectionProps> = ({ actions, onActionClick }) => {
  const { game } = useGame();
  const { addStrategy } = useAIThoughtsContext();
  
  // Handle click with AI thought generation
  const handleActionClick = (actionId: string, params?: any) => {
    // Generate a strategic thought for the target houseguest
    if (params?.targetId) {
      const targetHouseguest = game?.getHouseguestById(params.targetId);
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
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
        <Target size={14} className="mr-1" /> STRATEGIC ACTIONS
      </h3>
      
      <div className="space-y-4">
        {Object.entries(actionsByTarget).map(([targetId, targetActions]) => {
          if (targetId === 'eavesdrop') {
            return (
              <div key={targetId} className="border rounded-md p-3 bg-card">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <VenetianMask size={14} className="mr-1" /> Eavesdrop
                </h4>
                
                <div className="grid grid-cols-1 gap-2">
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
                      <VenetianMask size={14} className="mr-1 flex-shrink-0"/>
                      <span className="flex-1 truncate">{action.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            );
          }
          
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
                    <Target size={14} className="mr-1 flex-shrink-0"/>
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

export default StrategicSection;
