
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';

interface InformationSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const InformationSection: React.FC<InformationSectionProps> = ({ actions, onActionClick }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
        <MessageSquare size={14} className="mr-1" /> INFORMATION SHARING
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {actions.map(action => (
          <Button
            key={action.actionId + JSON.stringify(action.parameters)}
            variant="outline"
            size="sm"
            className={cn(
              "justify-start h-auto text-left",
              action.parameters?.type === 'deceptive' && "text-orange-600 hover:text-orange-700"
            )}
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

export default InformationSection;
