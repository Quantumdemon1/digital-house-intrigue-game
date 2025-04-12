
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';

interface ConversationsSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const ConversationsSection: React.FC<ConversationsSectionProps> = ({ actions, onActionClick }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
        <MessageSquare size={14} className="mr-1" /> TALK TO HOUSEGUESTS
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            <MessageSquare size={14} className="mr-1 flex-shrink-0"/>
            <span className="flex-1 truncate">{action.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ConversationsSection;
