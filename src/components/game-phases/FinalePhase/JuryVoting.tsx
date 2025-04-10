
import React, { useState, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { Trophy } from 'lucide-react';
import JuryTimer from './JuryTimer';

interface JuryVotingProps {
  finalist1: Houseguest;
  finalist2: Houseguest;
  jury: Houseguest[];
  onVotingComplete: (winner: Houseguest, runnerUp: Houseguest) => void;
  getRelationship: (guest1Id: string, guest2Id: string) => number;
}

const JuryVoting: React.FC<JuryVotingProps> = ({
  finalist1,
  finalist2,
  jury,
  onVotingComplete,
  getRelationship
}) => {
  const [currentJurorIndex, setCurrentJurorIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [votingComplete, setVotingComplete] = useState(false);
  
  const currentJuror = jury[currentJurorIndex];
  const votingFinished = Object.keys(votes).length === jury.length || votingComplete;

  // Timer countdown effect
  useEffect(() => {
    if (votingFinished || !currentJuror) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Cast random vote if time expires
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentJurorIndex, votingFinished]);
  
  // Reset timer when moving to next juror
  useEffect(() => {
    if (currentJuror) {
      setTimeRemaining(30);
    }
  }, [currentJurorIndex]);
  
  // Process votes when all jurors have voted
  useEffect(() => {
    if (votingFinished && !votingComplete) {
      const votesFor1 = Object.values(votes).filter(id => id === finalist1.id).length;
      const votesFor2 = Object.values(votes).filter(id => id === finalist2.id).length;
      
      const winner = votesFor1 > votesFor2 ? finalist1 : finalist2;
      const runnerUp = votesFor1 > votesFor2 ? finalist2 : finalist1;
      
      setVotingComplete(true);
      setTimeout(() => {
        onVotingComplete(winner, runnerUp);
      }, 3000);
    }
  }, [votes, votingFinished, votingComplete]);
  
  const handleVote = (finalistId: string) => {
    if (!currentJuror) return;
    
    // Record the vote
    const newVotes = { ...votes, [currentJuror.id]: finalistId };
    setVotes(newVotes);
    
    // Move to next juror after a brief delay
    setTimeout(() => {
      if (currentJurorIndex < jury.length - 1) {
        setCurrentJurorIndex(prev => prev + 1);
      } else {
        // All jurors have voted
        setVotingComplete(true);
      }
    }, 1500);
  };
  
  const handleTimeExpired = () => {
    if (!currentJuror) return;
    
    // Cast vote based on relationship
    const rel1 = getRelationship(currentJuror.id, finalist1.id);
    const rel2 = getRelationship(currentJuror.id, finalist2.id);
    
    // Add some randomness to the vote
    const adjustedRel1 = rel1 + (Math.random() * 20 - 10);
    const adjustedRel2 = rel2 + (Math.random() * 20 - 10);
    
    // Vote for finalist with better relationship
    const voteForId = adjustedRel1 > adjustedRel2 ? finalist1.id : finalist2.id;
    handleVote(voteForId);
  };
  
  // AI voting logic
  useEffect(() => {
    if (!currentJuror || votingComplete) return;
    
    // If it's an AI juror, have them vote automatically with a delay
    if (!currentJuror.isPlayer) {
      const timer = setTimeout(() => {
        const rel1 = getRelationship(currentJuror.id, finalist1.id);
        const rel2 = getRelationship(currentJuror.id, finalist2.id);
        
        // Add some randomness to the vote
        const adjustedRel1 = rel1 + (Math.random() * 20 - 10);
        const adjustedRel2 = rel2 + (Math.random() * 20 - 10);
        
        // Vote for finalist with better relationship
        const voteForId = adjustedRel1 > adjustedRel2 ? finalist1.id : finalist2.id;
        handleVote(voteForId);
      }, 2000 + Math.random() * 1000); // Random delay between 2-3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [currentJuror]);
  
  if (votingComplete) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold">Jury Vote Complete</h3>
        <p className="text-muted-foreground">All jurors have cast their votes!</p>
        <div className="animate-pulse">
          <Trophy className="mx-auto h-10 w-10 text-yellow-500" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <JuryTimer 
        timeRemaining={timeRemaining} 
        onTimeExpired={handleTimeExpired}
      />
      
      {currentJuror && (
        <div className="text-center space-y-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="font-semibold">
              {currentJuror.name} is voting
              {currentJuror.isPlayer && " (You)"}
            </p>
          </div>
          
          <p className="text-muted-foreground">
            Who deserves to win Big Brother?
          </p>
          
          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
            {[finalist1, finalist2].map(finalist => (
              <div key={finalist.id} className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-3">
                  {finalist.name.charAt(0)}
                </div>
                <p className="font-semibold mb-3">{finalist.name}</p>
                {currentJuror.isPlayer && (
                  <button
                    className="px-4 py-2 bg-bb-blue text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => handleVote(finalist.id)}
                  >
                    Vote to Win
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h4 className="font-semibold mb-2">Votes Cast:</h4>
        <div className="grid grid-cols-2 gap-2">
          {jury.map(juror => (
            <div 
              key={juror.id} 
              className={`p-2 border rounded flex items-center ${
                votes[juror.id] ? "bg-gray-50" : "opacity-50"
              }`}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                {juror.name.charAt(0)}
              </div>
              <span>{juror.name}</span>
              {votes[juror.id] && (
                <span className="ml-auto text-xs font-medium">
                  Voted
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JuryVoting;
