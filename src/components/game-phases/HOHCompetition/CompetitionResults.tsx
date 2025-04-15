
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, Crown } from 'lucide-react';
import { CompetitionType, Houseguest } from '@/models/houseguest';

interface CompetitionResultsProps {
  competitionType: CompetitionType | null;
  winner: Houseguest;
  results: { name: string; position: number }[];
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({ competitionType, winner, results }) => {
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2" /> Head of Household Results
        </CardTitle>
        <CardDescription className="text-white/80">
          {competitionType} Competition Complete
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center mb-6">
          <div className="camera-lens w-24 h-24 mb-2 border-4 border-bb-blue">
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-700">
              {winner.name.charAt(0)}
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold">{winner.name} wins!</h3>
            <p className="text-muted-foreground">New Head of Household</p>
          </div>
          
          <Crown className="text-bb-blue w-10 h-10 mb-4" />
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Final Results:</h4>
          <ol className="space-y-2">
            {results.map(result => (
              <li key={result.name} className="flex justify-between">
                <span className="font-medium">{result.position}. {result.name}</span>
                {result.position === 1 && <Crown className="text-bb-blue w-4 h-4" />}
              </li>
            ))}
          </ol>
        </div>
        
        <div className="mt-6 text-center text-muted-foreground">
          Continuing to Nominations...
          <div className="mt-2 animate-pulse">
            <Clock className="inline-block" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionResults;
