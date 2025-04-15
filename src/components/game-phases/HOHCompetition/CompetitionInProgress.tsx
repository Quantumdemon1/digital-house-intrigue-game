
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { CompetitionType } from '@/models/houseguest';

interface CompetitionInProgressProps {
  competitionType: CompetitionType | null;
}

const CompetitionInProgress: React.FC<CompetitionInProgressProps> = ({ competitionType }) => {
  const [dots, setDots] = useState('');
  
  // Create animated dots for the loading indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="shadow-lg border-bb-blue">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle>Head of Household Competition</CardTitle>
        <CardDescription className="text-white/80">
          {competitionType ?? 'Random'} Competition in Progress
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="animate-pulse">
            <Clock className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-bold mt-4">Competition in Progress{dots}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Houseguests are competing for Head of Household
          </p>
          <div className="mt-6 w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-bb-blue h-2.5 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{width: '45%'}}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionInProgress;
