
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Trophy, Loader } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';

interface CompetitionResultsProps {
  winner: Houseguest;
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({ winner }) => {
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <ShieldCheck className="mr-2" /> Power of Veto Results
        </CardTitle>
        <CardDescription className="text-white/80">
          Competition Complete
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
            <p className="text-muted-foreground">New Power of Veto Holder</p>
          </div>
          
          <Trophy className="text-bb-blue w-10 h-10 mb-4" />
        </div>
        
        <div className="mt-6 text-center text-muted-foreground">
          Continuing to PoV Meeting...
          <div className="mt-2 animate-pulse">
            <Loader className="inline-block" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionResults;
