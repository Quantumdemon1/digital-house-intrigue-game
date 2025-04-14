
import React from 'react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import ConversationsSection from './sections/ConversationsSection';
import RelationshipSection from './sections/RelationshipSection';
import StrategicSection from './sections/StrategicSection';
import StatusSection from './sections/StatusSection';
import MovementSection from './sections/MovementSection';
import AdvanceSection from './sections/AdvanceSection';
import AllianceSection from './sections/AllianceSection';
import InformationSection from './sections/InformationSection';
import PromiseSection from './sections/PromiseSection';

interface ActionSectionsProps {
  availableActions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const ActionSections: React.FC<ActionSectionsProps> = ({ availableActions, onActionClick }) => {
  // Filter actions by category
  const conversationActions = availableActions.filter(action => 
    action.category === 'conversation'
  );
  
  const relationshipActions = availableActions.filter(action => 
    action.category === 'relationship'
  );
  
  const strategicActions = availableActions.filter(action => 
    action.category === 'strategic'
  );
  
  const statusActions = availableActions.filter(action => 
    action.category === 'status'
  );
  
  const movementActions = availableActions.filter(action => 
    action.category === 'movement'
  );
  
  const allianceActions = availableActions.filter(action => 
    action.category === 'alliance'
  );
  
  const promiseActions = availableActions.filter(action => 
    action.category === 'promise' || action.actionId === 'make_promise' || action.actionId === 'check_promises'
  );
  
  const informationActions = availableActions.filter(action => 
    action.category === 'information'
  );
  
  const phaseActions = availableActions.filter(action => 
    action.category === 'phase'
  );

  return (
    <div className="space-y-6">
      {conversationActions.length > 0 && (
        <ConversationsSection
          actions={conversationActions}
          onActionClick={onActionClick}
        />
      )}
      
      {relationshipActions.length > 0 && (
        <RelationshipSection
          actions={relationshipActions}
          onActionClick={onActionClick}
        />
      )}
      
      {strategicActions.length > 0 && (
        <StrategicSection
          actions={strategicActions}
          onActionClick={onActionClick}
        />
      )}
      
      {promiseActions.length > 0 && (
        <PromiseSection
          actions={promiseActions}
          onActionClick={onActionClick}
        />
      )}
      
      {allianceActions.length > 0 && (
        <AllianceSection
          actions={allianceActions}
          onActionClick={onActionClick}
        />
      )}
      
      {informationActions.length > 0 && (
        <InformationSection
          actions={informationActions}
          onActionClick={onActionClick}
        />
      )}
      
      {statusActions.length > 0 && (
        <StatusSection
          actions={statusActions}
          onActionClick={onActionClick}
        />
      )}
      
      {movementActions.length > 0 && (
        <MovementSection
          actions={movementActions}
          onActionClick={onActionClick}
        />
      )}
      
      {phaseActions.length > 0 && (
        <AdvanceSection
          actions={phaseActions}
          onActionClick={onActionClick}
        />
      )}
    </div>
  );
};

export default ActionSections;
