
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Clock } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import HouseguestCard from '../../HouseguestCard';

interface NominationCeremonyResultProps {
  nominees: Houseguest[];
  hohName?: string;
}

const NominationCeremonyResult: React.FC<NominationCeremonyResultProps> = ({ nominees, hohName }) => {
  return (
    <Card className="shadow-lg border-bb-red">
      <CardHeader className="bg-bb-red text-white">
        <CardTitle className="flex items-center">
          <Target className="mr-2" /> Nomination Results
        </CardTitle>
        <CardDescription className="text-white/80">
          Two houseguests have been nominated for eviction
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold">
            {hohName} has nominated:
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {nominees.map(nominee => (
            <HouseguestCard key={nominee.id} houseguest={nominee} />
          ))}
        </div>
        
        <div className="mt-6 text-center text-muted-foreground">
          Continuing to Power of Veto Competition...
          <div className="mt-2 animate-pulse">
            <Clock className="inline-block" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NominationCeremonyResult;
