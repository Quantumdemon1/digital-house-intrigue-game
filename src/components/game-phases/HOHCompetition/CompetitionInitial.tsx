
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Clock } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';

interface CompetitionInitialProps {
  gameWeek: number;
  activeHouseguests: Houseguest[];
}

const CompetitionInitial: React.FC<CompetitionInitialProps> = ({ gameWeek, activeHouseguests }) => {
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Crown className="mr-2" /> Head of Household Competition
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameWeek}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Competition Time</h3>
          <p>
            The Head of Household competition is about to begin. The winner will be safe for the week
            and will nominate two houseguests for eviction.
          </p>
        </div>
        
        <div className="mb-6 text-center">
          <h3 className="text-lg font-medium mb-4">Selecting Random Competition Type</h3>
          <div className="animate-pulse">
            <Clock className="w-12 h-12 mx-auto" />
          </div>
          <p className="mt-2 text-muted-foreground">Please wait while the competition type is selected...</p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current Houseguests:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activeHouseguests.map(houseguest => (
              <div key={houseguest.id} className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  {houseguest.name.charAt(0)}
                </div>
                <span>
                  {houseguest.name}
                  {houseguest.isPlayer && <span className="text-bb-green text-xs ml-1">(You)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 bg-[#005a9a]">
        <div className="w-full">
          <p className="text-sm text-slate-50">
            The winner becomes the new HoH and will nominate two houseguests for eviction.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CompetitionInitial;
