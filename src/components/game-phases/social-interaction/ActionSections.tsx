
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import StatusSection from './sections/StatusSection';
import MovementSection from './sections/MovementSection';
import ConversationsSection from './sections/ConversationsSection';
import RelationshipSection from './sections/RelationshipSection';
import StrategicSection from './sections/StrategicSection';
import InformationSection from './sections/InformationSection';
import AdvanceSection from './sections/AdvanceSection';
import AllianceSection from './sections/AllianceSection';
import PromiseSection from './sections/PromiseSection';

interface ActionSectionsProps {
  availableActions: {
    [key: string]: SocialActionChoice[];
  };
  onActionClick: (actionId: string, params?: any) => void;
}

const ActionSections: React.FC<ActionSectionsProps> = ({
  availableActions,
  onActionClick
}) => {
  // Divide promise-related actions into their own group
  const promiseActions = [
    ...(availableActions.relationship?.filter(a => a.actionId === 'make_promise') || []),
    ...(availableActions.status?.filter(a => a.actionId === 'check_promises') || [])
  ];
  
  // Remove promise actions from their original categories
  const relationshipActions = availableActions.relationship?.filter(a => a.actionId !== 'make_promise') || [];
  const statusActions = availableActions.status?.filter(a => a.actionId !== 'check_promises') || [];
  
  return (
    <div className="space-y-6">
      {/* Status Actions */}
      {statusActions.length > 0 && (
        <>
          <StatusSection
            actions={statusActions}
            onActionClick={onActionClick}
          />
          <Separator />
        </>
      )}
      
      {/* Movement Actions */}
      {availableActions.movement?.length > 0 && (
        <>
          <MovementSection
            actions={availableActions.movement}
            onActionClick={onActionClick}
          />
          <Separator />
        </>
      )}
      
      {/* Conversation Actions */}
      {availableActions.conversations?.length > 0 && (
        <>
          <ConversationsSection
            actions={availableActions.conversations}
            onActionClick={onActionClick}
          />
          <Separator />
        </>
      )}
      
      {/* Promise Actions */}
      {promiseActions.length > 0 && (
        <>
          <PromiseSection
            actions={promiseActions}
            onActionClick={onActionClick}
          />
          <Separator />
        </>
      )}
      
      {/* Relationship Actions */}
      {relationshipActions.length > 0 && (
        <>
          <RelationshipSection
            actions={relationshipActions}
            onActionClick={onActionClick}
          />
          <Separator />
        </>
      )}
      
      {/* Strategic Actions */}
      {availableActions.strategic?.length > 0 && (
        <>
          <StrategicSection
            actions={availableActions.strategic}
            onActionClick={onActionClick}
          />
          <Separator />
        </>
      )}
      
      {/* Alliance Actions */}
      {availableActions.alliance?.length > 0 && (
        <>
          <AllianceSection
            actions={availableActions.alliance}
            onActionClick={onActionClick}
          />
          <Separator />
        </>
      )}
      
      {/* Information Actions */}
      {availableActions.information?.length > 0 && (
        <>
          <InformationSection
            actions={availableActions.information}
            onActionClick={onActionClick}
          />
          <Separator />
        </>
      )}
      
      {/* Advance Actions */}
      {availableActions.advance?.length > 0 && (
        <AdvanceSection
          action={availableActions.advance[0]}
          onActionClick={onActionClick}
        />
      )}
    </div>
  );
};

export default ActionSections;
