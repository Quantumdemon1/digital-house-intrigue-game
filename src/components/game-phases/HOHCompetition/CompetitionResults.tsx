
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, CircleCheckIcon } from 'lucide-react';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { animations } from '@/lib/animations';

interface CompetitionResult {
  id: string;
  name: string;
  position: number;
}

interface CompetitionResultsProps {
  competitionType: CompetitionType | null;
  winner: Houseguest;
  results: CompetitionResult[];
  onContinue: () => void;
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({
  competitionType,
  winner,
  results,
  onContinue
}) => {
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2" /> Head of Household Results
        </CardTitle>
        <CardDescription className="text-white/80">
          {competitionType ?? 'Random'} Competition
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`p-2 rounded-full bg-amber-100 mb-3 animate-celebrate-winner`}>
            <Crown className="w-12 h-12 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold mb-1">New Head of Household</h3>
          <p className="text-2xl font-extrabold text-bb-blue">{winner.name}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {winner.isPlayer 
              ? "You are the new Head of Household!" 
              : `${winner.name} is the new Head of Household!`}
          </p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-4 text-center">Competition Results</h4>
          <div className="space-y-2">
            {results.sort((a, b) => a.position - b.position).map((result, index) => (
              <div 
                key={result.id}
                className={`flex items-center justify-between p-2 rounded-md ${
                  index === 0 
                    ? 'bg-amber-50 border border-amber-200' 
                    : 'bg-background'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 border border-gray-200 text-sm font-bold">
                    {result.position}
                  </div>
                  <span>{result.name}</span>
                </div>
                {index === 0 && (
                  <CircleCheckIcon className="w-5 h-5 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 flex justify-end">
        <Button 
          onClick={onContinue}
          className="bg-bb-blue hover:bg-blue-700 text-white"
        >
          Continue to Nominations
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompetitionResults;
