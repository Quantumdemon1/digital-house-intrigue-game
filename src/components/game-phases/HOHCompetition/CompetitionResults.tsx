
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Crown, Confetti } from 'lucide-react';
import { CompetitionType, Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { celebrateWinner } from '@/lib/animations';

interface CompetitionResultsProps {
  competitionType: CompetitionType | null;
  winner: Houseguest;
  results: { name: string; position: number; id: string }[];
  onContinue?: () => void; // Add optional continue handler
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({ 
  competitionType, 
  winner, 
  results,
  onContinue 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealedResults, setRevealedResults] = useState<string[]>([]);
  
  // Trigger animations and effects when the component mounts
  useEffect(() => {
    // Show confetti effect
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    
    // Gradually reveal results
    const revealInterval = setInterval(() => {
      setRevealedResults(prev => {
        if (prev.length >= results.length) {
          clearInterval(revealInterval);
          return prev;
        }
        const nextResult = results[prev.length];
        return [...prev, nextResult.id];
      });
    }, 300);
    
    return () => {
      clearTimeout(timer);
      clearInterval(revealInterval);
    };
  }, [results]);

  return (
    <Card className="shadow-lg border-bb-blue overflow-hidden">
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
          <div 
            className="camera-lens w-24 h-24 mb-2 border-4 border-bb-blue relative"
            style={{
              animation: `${celebrateWinner} 2s ease-in-out`
            }}
          >
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-700">
              {winner.name.charAt(0)}
            </div>
            {showConfetti && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🎉</span>
              </div>
            )}
          </div>
          
          <div className="text-center mb-4 animate-fade-in">
            <h3 className="text-2xl font-bold">{winner.name} wins!</h3>
            <p className="text-muted-foreground">New Head of Household</p>
          </div>
          
          <Crown className="text-bb-blue w-10 h-10 mb-4 animate-bounce" />
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Final Results:</h4>
          <ol className="space-y-2">
            {results.map((result, index) => (
              <li 
                key={result.id} 
                className={`flex justify-between transition-all duration-300 ${
                  revealedResults.includes(result.id) 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <span className="font-medium">{result.position}. {result.name}</span>
                {result.position === 1 && <Crown className="text-bb-blue w-4 h-4" />}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-center">
        <Button 
          onClick={onContinue}
          className="bg-bb-blue hover:bg-bb-blue/80 transition-colors animate-pulse"
          disabled={revealedResults.length < results.length}
        >
          Continue to Nominations
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompetitionResults;
