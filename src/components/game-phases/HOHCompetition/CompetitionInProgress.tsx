
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { CompetitionType } from '@/models/houseguest';

interface CompetitionInProgressProps {
  competitionType: CompetitionType | null;
}

const CompetitionInProgress: React.FC<CompetitionInProgressProps> = ({ competitionType }) => {
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle>Head of Household Competition</CardTitle>
        <CardDescription className="text-white/80">
          {competitionType} Competition
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="animate-pulse">
            <Clock className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-bold mt-4">Competition in Progress...</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Houseguests are competing for Head of Household
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionInProgress;
