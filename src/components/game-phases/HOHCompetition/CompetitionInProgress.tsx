
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Activity } from 'lucide-react';
import { CompetitionType } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { animations } from '@/lib/animations';

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
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phases = ['Starting', 'Round 1', 'Round 2', 'Final Round', 'Determining Winner'];
  
  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhaseIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % phases.length;
        setPhase(phases[nextIndex]);
        logger?.info(`Competition phase changed to: ${phases[nextIndex]}`);
        return nextIndex;
      });
    }, 1500);
    
    return () => clearInterval(phaseInterval);
  }, [logger]);
  
  // Competition specific visuals based on type
  const getCompetitionTypeIcon = () => {
    switch (competitionType) {
      case 'physical':
        return <Activity className="w-16 h-16 text-yellow-500" />;
      case 'mental':
        return <span className="text-4xl">🧠</span>;
      case 'endurance':
        return <span className="text-4xl">⏱️</span>;
      case 'social':
        return <span className="text-4xl">👥</span>;
      case 'luck':
        return <span className="text-4xl">🎲</span>;
      default:
        return <Clock className="w-16 h-16" />;
    }
  };
  
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
          <div className="animate-pulse mb-4">
            {getCompetitionTypeIcon()}
          </div>
          
          <h3 className="text-xl font-bold mt-4">Competition in Progress{dots}</h3>
          
          <div className="mt-4 bg-gray-100 p-3 rounded-lg w-full max-w-xs">
            <p className="text-sm text-center font-medium mb-2">
              Phase: <span className="font-bold">{phase}</span>
            </p>
            
            <div className="flex justify-center space-x-2 mb-3">
              {phases.map((p, i) => (
                <span 
                  key={p} 
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    i === phaseIndex ? 'bg-bb-blue' : 'bg-gray-300'
                  }`}
                ></span>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 mb-2">
            Houseguests are competing for Head of Household
          </p>
          
          <div className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 mb-4">
            {competitionType} competition
          </div>
          
          <div className="mt-2 w-full max-w-xs bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-bb-blue h-2.5 rounded-full transition-all duration-150 ease-in-out animate-competition-progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between w-full max-w-xs px-1 mt-1">
            <span className="text-xs text-muted-foreground">Competition start</span>
            <span className="text-xs text-muted-foreground">Results</span>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6 italic">
            Results coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionInProgress;
