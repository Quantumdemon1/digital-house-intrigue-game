
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';

const CompetitionInProgress: React.FC = () => {
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle>Power of Veto Competition</CardTitle>
        <CardDescription className="text-white/80">
          Competition in Progress
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="animate-pulse">
            <Loader className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-bold mt-4">Competition in Progress...</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Selected houseguests are competing for the Power of Veto
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionInProgress;
