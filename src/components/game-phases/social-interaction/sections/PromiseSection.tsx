
import React from 'react';
import { Button } from '@/components/ui/button';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import { Shield, CheckCircle } from 'lucide-react';

interface PromiseSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const PromiseSection: React.FC<PromiseSectionProps> = ({ actions, onActionClick }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
          <Shield size={14} className="mr-1" /> PROMISES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {actions.map(action => (
            <Button
              key={action.actionId + JSON.stringify(action.parameters)}
              variant="outline"
              size="sm"
              className="justify-start h-auto text-left bg-green-50 hover:bg-green-100 border-green-200"
              disabled={action.disabled}
              title={action.disabledReason}
              onClick={() => onActionClick(action.actionId, action.parameters)}
            >
              {action.actionId === 'check_promises' && <CheckCircle size={14} className="mr-1 flex-shrink-0 text-green-600" />}
              {action.actionId === 'make_promise' && <Shield size={14} className="mr-1 flex-shrink-0 text-green-600" />}
              <span className="flex-1 truncate">{action.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromiseSection;
