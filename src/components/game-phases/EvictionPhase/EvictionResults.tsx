
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserX, DoorOpen } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import confetti from 'canvas-confetti';

// Create a simple custom progress component since we can't modify the original
const Progress = ({ 
  value, 
  className 
}: { 
  value: number; 
  className?: string 
}) => {
  return (
    <div 
      className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className || ''}`}
    >
      <div 
        className="h-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

interface EvictionResultsProps {
  nominees: Houseguest[];
  votes: Record<string, string>;
  onComplete: (evictedHouseguest: Houseguest) => void;
}

const EvictionResults: React.FC<EvictionResultsProps> = ({
  nominees,
  votes,
  onComplete,
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [evictedHouseguest, setEvictedHouseguest] = useState<Houseguest | null>(null);
  const [savedHouseguest, setSavedHouseguest] = useState<Houseguest | null>(null);
  
  // Count votes for each nominee
  const voteCounts = Object.values(votes).reduce((counts, nomineeId) => {
    counts[nomineeId] = (counts[nomineeId] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const totalVotes = Object.values(votes).length;
  
  // Determine who's evicted
  useEffect(() => {
    if (!nominees || nominees.length !== 2) return;
    
    const nominee1Votes = voteCounts[nominees[0].id] || 0;
    const nominee2Votes = voteCounts[nominees[1].id] || 0;
    
    if (nominee1Votes > nominee2Votes) {
      setEvictedHouseguest(nominees[0]);
      setSavedHouseguest(nominees[1]);
    } else {
      setEvictedHouseguest(nominees[1]);
      setSavedHouseguest(nominees[0]);
    }
  }, [nominees, voteCounts]);
  
  // Gradually reveal votes for dramatic effect
  useEffect(() => {
    if (revealedCount >= totalVotes) {
      const timer = setTimeout(() => {
        setShowFinalResult(true);
        
        // If player is saved, celebrate with confetti
        if (savedHouseguest?.isPlayer) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 500);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    const timer = setTimeout(() => {
      setRevealedCount(prev => prev + 1);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [revealedCount, totalVotes, savedHouseguest]);
  
  const handleCompleteEviction = () => {
    if (evictedHouseguest) {
      onComplete(evictedHouseguest);
    }
  };
  
  // Add early return to handle case when nominees array is invalid or empty
  if (!nominees || nominees.length !== 2 || !evictedHouseguest || !savedHouseguest) {
    return (
      <div className="p-4 text-center">
        <p>Calculating results...</p>
      </div>
    );
  }
  
  const nominee1Progress = (voteCounts[nominees[0].id] || 0) / totalVotes * 100;
  const nominee2Progress = (voteCounts[nominees[1].id] || 0) / totalVotes * 100;
  
  return (
    <div className="space-y-6 text-center">
      <h3 className="text-xl font-bold">
        Eviction Results
      </h3>
      
      {!showFinalResult ? (
        <div className="space-y-8">
          <p className="text-muted-foreground">
            Revealing votes: {revealedCount} of {totalVotes}
          </p>
          
          <div className="space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{nominees[0].name}</span>
                <span className="font-medium">
                  {Math.min(voteCounts[nominees[0].id] || 0, revealedCount)} votes
                </span>
              </div>
              <Progress value={nominee1Progress} className="bg-gray-200" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{nominees[1].name}</span>
                <span className="font-medium">
                  {Math.min(voteCounts[nominees[1].id] || 0, revealedCount)} votes
                </span>
              </div>
              <Progress value={nominee2Progress} className="bg-gray-200" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="p-6 bg-bb-red bg-opacity-10 rounded-lg border border-bb-red">
            <div className="flex items-center justify-center mb-4">
              <UserX className="h-12 w-12 text-bb-red mr-4" />
              <h3 className="text-2xl font-bold">Eviction Result</h3>
            </div>
            
            <p className="text-xl mb-2">
              By a vote of <span className="font-bold">{voteCounts[evictedHouseguest.id] || 0}</span> to <span className="font-bold">{voteCounts[savedHouseguest.id] || 0}</span>
            </p>
            
            <p className="text-2xl font-bold mt-4">
              {evictedHouseguest.name} has been evicted from the house
            </p>
            
            {evictedHouseguest.isPlayer ? (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="font-bold text-red-700">
                  You have been evicted from the Big Brother house.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <Button 
                  onClick={handleCompleteEviction} 
                  className="bg-bb-red hover:bg-red-700"
                  size="lg"
                >
                  <DoorOpen className="mr-2 h-5 w-5" />
                  Continue
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvictionResults;
