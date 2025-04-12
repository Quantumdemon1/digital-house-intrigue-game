
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapPin, MessageSquare, Handshake, BarChart, ArrowRight, Target, VenetianMask, Award, ClipboardCheck, Users, Info } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import MovementSection from './sections/MovementSection';
import ConversationsSection from './sections/ConversationsSection';
import StrategicSection from './sections/StrategicSection';
import RelationshipSection from './sections/RelationshipSection';
import InformationSection from './sections/InformationSection';
import AllianceSection from './sections/AllianceSection';
import StatusSection from './sections/StatusSection';
import AdvanceSection from './sections/AdvanceSection';

interface ActionSectionsProps {
  availableActions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const ActionSections: React.FC<ActionSectionsProps> = ({ availableActions, onActionClick }) => {
  // Group actions by category for better organization
  const groupedActions = useMemo(() => {
    const groups: {[key: string]: SocialActionChoice[]} = {
      movement: [],
      conversations: [],
      strategic: [],
      relationship: [],
      information: [],
      alliance: [],
      status: [],
      advance: []
    };
    
    availableActions.forEach(action => {
      if (action.actionId === 'move_location') {
        groups.movement.push(action);
      } else if (action.actionId === 'talk_to') {
        groups.conversations.push(action);
      } else if (['strategic_discussion', 'eavesdrop'].includes(action.actionId)) {
        groups.strategic.push(action);
      } else if (['relationship_building', 'make_promise'].includes(action.actionId)) {
        groups.relationship.push(action);
      } else if (['share_info'].includes(action.actionId)) {
        groups.information.push(action);
      } else if (['propose_alliance', 'call_alliance_meeting', 'check_alliances'].includes(action.actionId)) {
        groups.alliance.push(action);
      } else if (['check_relationships', 'check_promises'].includes(action.actionId)) {
        groups.status.push(action);
      } else if (action.actionId === 'advance_phase') {
        groups.advance.push(action);
      }
    });
    
    return groups;
  }, [availableActions]);

  return (
    <div className="space-y-5">
      {/* Movement Section */}
      {groupedActions.movement.length > 0 && (
        <MovementSection 
          actions={groupedActions.movement} 
          onActionClick={onActionClick} 
        />
      )}
      
      {/* Conversations Section */}
      {groupedActions.conversations.length > 0 && (
        <ConversationsSection 
          actions={groupedActions.conversations} 
          onActionClick={onActionClick} 
        />
      )}
      
      {/* Strategic Actions */}
      {groupedActions.strategic.length > 0 && (
        <StrategicSection 
          actions={groupedActions.strategic} 
          onActionClick={onActionClick} 
        />
      )}
      
      {/* Relationship Building */}
      {groupedActions.relationship.length > 0 && (
        <RelationshipSection 
          actions={groupedActions.relationship} 
          onActionClick={onActionClick} 
        />
      )}
      
      {/* Information Sharing */}
      {groupedActions.information.length > 0 && (
        <InformationSection 
          actions={groupedActions.information} 
          onActionClick={onActionClick} 
        />
      )}
      
      {/* Alliance Management */}
      {groupedActions.alliance.length > 0 && (
        <AllianceSection 
          actions={groupedActions.alliance} 
          onActionClick={onActionClick} 
        />
      )}
      
      {/* Status Checks */}
      {groupedActions.status.length > 0 && (
        <StatusSection 
          actions={groupedActions.status} 
          onActionClick={onActionClick} 
        />
      )}
      
      {/* Advance Phase Button */}
      {groupedActions.advance.length > 0 && (
        <AdvanceSection 
          action={groupedActions.advance[0]} 
          onActionClick={onActionClick} 
        />
      )}
    </div>
  );
};

export default ActionSections;
