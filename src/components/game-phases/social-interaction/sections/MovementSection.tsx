
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';

interface MovementSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const MovementSection: React.FC<MovementSectionProps> = ({ actions, onActionClick }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
        <MapPin size={14} className="mr-1" /> MOVE TO LOCATION
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {actions.map(action => (
          <Button
            key={action.actionId + JSON.stringify(action.parameters)}
            variant="outline"
            size="sm"
            className="justify-start h-auto text-left"
            disabled={action.disabled}
            title={action.disabledReason}
            onClick={() => onActionClick(action.actionId, action.parameters)}
          >
            <MapPin size={14} className="mr-1 flex-shrink-0"/>
            <span className="flex-1 truncate">{action.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MovementSection;
