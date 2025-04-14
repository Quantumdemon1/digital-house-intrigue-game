
import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, VenetianMask, Handshake } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';

interface StrategicSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const StrategicSection: React.FC<StrategicSectionProps> = ({ actions, onActionClick }) => {
  // Filter strategic actions
  const strategicActions = actions.filter(action => 
    action.actionId === 'strategic_discussion' || 
    action.actionId === 'eavesdrop'
  );
  
  // Filter alliance actions
  const allianceActions = actions.filter(action => 
    action.actionId === 'propose_alliance' || 
    action.actionId === 'discuss_alliance'
  );
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
          <Target size={14} className="mr-1" /> STRATEGIC ACTIONS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {strategicActions.map(action => (
            <Button
              key={action.actionId + JSON.stringify(action.parameters)}
              variant="outline"
              size="sm"
              className="justify-start h-auto text-left"
              disabled={action.disabled}
              title={action.disabledReason}
              onClick={() => onActionClick(action.actionId, action.parameters)}
            >
              {action.actionId === 'strategic_discussion' && <Target size={14} className="mr-1 flex-shrink-0"/>}
              {action.actionId === 'eavesdrop' && <VenetianMask size={14} className="mr-1 flex-shrink-0"/>}
              <span className="flex-1 truncate">{action.text}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {allianceActions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
            <Handshake size={14} className="mr-1" /> ALLIANCE ACTIONS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allianceActions.map(action => (
              <Button
                key={action.actionId + JSON.stringify(action.parameters)}
                variant="outline"
                size="sm"
                className="justify-start h-auto text-left bg-purple-50 hover:bg-purple-100 border-purple-200"
                disabled={action.disabled}
                title={action.disabledReason}
                onClick={() => onActionClick(action.actionId, action.parameters)}
              >
                <Handshake size={14} className="mr-1 flex-shrink-0 text-purple-600"/>
                <span className="flex-1 truncate">{action.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategicSection;
