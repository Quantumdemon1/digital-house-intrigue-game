
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import HouseguestCard from '../../HouseguestCard';

interface PlayerCampaignSectionProps {
  nonNominees: Houseguest[];
  remainingInteractions: number;
  onHouseguestSelect: (houseguest: Houseguest) => void;
}

const PlayerCampaignSection: React.FC<PlayerCampaignSectionProps> = ({
  nonNominees,
  remainingInteractions,
  onHouseguestSelect
}) => {
  return (
    <Card className="bg-white/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-2">
        <CardTitle>Campaign for Votes</CardTitle>
        <CardDescription>
          You've been nominated for eviction. Talk to houseguests to gain their support.
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
  );
};

export default PlayerCampaignSection;
