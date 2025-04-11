
import React from 'react';
import { Heart, HeartOff } from 'lucide-react';
import CustomProgress from '../game-phases/NominationPhase/CustomProgress';

interface HouseguestRelationshipProps {
  relationshipScore: number;
  relationshipColor: string;
  showValue?: boolean;
}

const HouseguestRelationship: React.FC<HouseguestRelationshipProps> = ({ 
  relationshipScore, 
  relationshipColor,
  showValue = true
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span>Relationship</span>
        {showValue && (
          <span className={relationshipColor}>
            {relationshipScore > 0 ? (
              <Heart className="inline h-3 w-3 mr-1" />
            ) : (
              <HeartOff className="inline h-3 w-3 mr-1" />
            )}
            {relationshipScore}
          </span>
        )}
      </div>
      <CustomProgress 
        value={50 + relationshipScore/2} 
        className="h-1"
        indicatorClassName={
          relationshipScore > 0 
            ? 'bg-gradient-to-r from-green-300 to-green-600' 
            : 'bg-gradient-to-r from-red-300 to-red-600'
        }
      />
    </div>
  );
};

export default HouseguestRelationship;
