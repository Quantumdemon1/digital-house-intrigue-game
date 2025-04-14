
import React from 'react';
import { useRelationshipImpact } from '@/contexts/RelationshipImpactContext';
import RelationshipImpact from './RelationshipImpact';

const RelationshipImpactDisplay: React.FC = () => {
  const { impacts } = useRelationshipImpact();
  
  if (impacts.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {impacts.map(impact => (
        <RelationshipImpact
          key={impact.id}
          houseguestName={impact.houseguestName}
          impactValue={impact.impactValue}
        />
      ))}
    </div>
  );
};

export default RelationshipImpactDisplay;
