
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { CompetitionType } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';

interface CompetitionInProgressProps {
  competitionType: CompetitionType | null;
}

const CompetitionInProgress: React.FC<CompetitionInProgressProps> = ({ competitionType }) => {
  const [dots, setDots] = useState('');
  const { logger } = useGame();
  
  useEffect(() => {
    logger?.info(`CompetitionInProgress rendered with type: ${competitionType}`);
    
    // Log more detailed debugging info
    return () => {
      logger?.info('CompetitionInProgress component unmounting');
    };
  }, [competitionType, logger]);
  
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
  
  // Progress bar animation that helps show activity
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 5;
      });
    }, 150);
    
    // Add completion message when progress reaches 100%
    if (progress === 100) {
      logger?.info('Competition progress animation completed one cycle');
    }
    
    return () => clearInterval(interval);
  }, [progress, logger]);
  
  // Display the competition phases
  const [phase, setPhase] = useState('Starting');
  useEffect(() => {
    const phases = ['Starting', 'Round 1', 'Round 2', 'Final Round', 'Determining Winner'];
    let currentIndex = 0;
    
    const phaseInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setPhase(phases[currentIndex]);
      logger?.info(`Competition phase changed to: ${phases[currentIndex]}`);
    }, 1500);
    
    return () => clearInterval(phaseInterval);
  }, [logger]);
  
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
            Phase: <span className="font-medium">{phase}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Houseguests are competing for Head of Household
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Competition type: <span className="font-medium">{competitionType}</span>
          </p>
          
          <div className="mt-6 w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-bb-blue h-2.5 rounded-full transition-all duration-150 ease-in-out" 
              style={{width: `${progress}%`}}
            ></div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-3">
            Results coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionInProgress;
