
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import HouseguestCard from '../../HouseguestCard';
import NomineeDisplay from './NomineeDisplay';

interface NonPlayerSectionProps {
  nominees: Houseguest[];
  nonNominees: Houseguest[]; // Non-nominees excluding the player
  remainingInteractions: number;
  onHouseguestSelect: (houseguest: Houseguest) => void;
}

const NonPlayerSection: React.FC<NonPlayerSectionProps> = ({
  nominees,
  nonNominees,
  remainingInteractions,
  onHouseguestSelect
}) => {
  return (
    <>
      <Card className="bg-white/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle>Nominees</CardTitle>
          <CardDescription>
            These houseguests have been nominated for eviction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nominees.map(nominee => (
              <NomineeDisplay key={nominee.id} nominee={nominee} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle>Influence Voting</CardTitle>
          <CardDescription>
            Talk to other houseguests to influence their votes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm">
            Choose up to <strong>{remainingInteractions}</strong> houseguests to interact with:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {nonNominees.map(houseguest => (
              <div 
                key={houseguest.id} 
                className="cursor-pointer transform transition duration-200 hover:scale-105"
                onClick={() => onHouseguestSelect(houseguest)}
              >
                <HouseguestCard 
                  houseguest={houseguest}
                  isDisabled={remainingInteractions <= 0}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default NonPlayerSection;
