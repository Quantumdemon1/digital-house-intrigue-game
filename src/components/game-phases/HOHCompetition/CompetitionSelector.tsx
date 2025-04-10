
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { GameState } from '@/models/game-state';

interface CompetitionSelectorProps {
  competitionTypes: CompetitionType[];
  activeHouseguests: Houseguest[];
  gameState: GameState;
  startCompetition: (type: CompetitionType) => void;
}

const CompetitionSelector: React.FC<CompetitionSelectorProps> = ({ 
  competitionTypes, 
  activeHouseguests, 
  gameState, 
  startCompetition 
}) => {
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Crown className="mr-2" /> Head of Household Competition
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameState.week}
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
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Choose a Competition Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {competitionTypes.map(type => (
              <Button
                key={type}
                variant="outline"
                className="h-auto py-3"
                onClick={() => startCompetition(type)}
              >
                {type}
              </Button>
            ))}
          </div>
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
      <CardFooter className="border-t p-4 bg-gray-50">
        <div className="w-full">
          <p className="text-sm text-muted-foreground">
            The winner becomes the new HoH and will nominate two houseguests for eviction.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CompetitionSelector;
