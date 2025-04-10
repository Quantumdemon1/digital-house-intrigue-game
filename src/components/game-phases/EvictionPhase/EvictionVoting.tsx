
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VoteIcon, User, Clock } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';

interface EvictionVotingProps {
  nominees: Houseguest[];
  voters: Houseguest[];
  hoh: Houseguest | null;
  votes: Record<string, string>;
  onVoteSubmit: (voterId: string, nomineeId: string) => void;
}

const EvictionVoting: React.FC<EvictionVotingProps> = ({
  nominees,
  voters,
  hoh,
  votes,
  onVoteSubmit,
}) => {
  const { getRelationship } = useGame();
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [showVote, setShowVote] = useState(false);
  
  // Check if the current voter is the player
  const currentVoter = voters[currentVoterIndex];
  const isPlayerVoting = currentVoter?.isPlayer;
  
  // Process AI votes
  useEffect(() => {
    if (!currentVoter || isPlayerVoting || isVoting || Object.keys(votes).includes(currentVoter.id)) {
      return;
    }
    
    setIsVoting(true);
    
    // Simulate AI thinking time
    const timer = setTimeout(() => {
      // AI voting logic based on relationships
      let nominee1Relationship = getRelationship(currentVoter.id, nominees[0].id);
      let nominee2Relationship = getRelationship(currentVoter.id, nominees[1].id);
      
      // AI votes to evict the houseguest they like less
      const voteForId = nominee1Relationship < nominee2Relationship ? nominees[0].id : nominees[1].id;
      
      onVoteSubmit(currentVoter.id, voteForId);
      setShowVote(true);
      
      // Show the vote for a moment, then move to next voter
      setTimeout(() => {
        setShowVote(false);
        setIsVoting(false);
        setCurrentVoterIndex(prev => prev + 1);
      }, 2000);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [currentVoter, isPlayerVoting, isVoting, nominees, votes]);
  
  const handlePlayerVote = (nomineeId: string) => {
    if (!currentVoter) return;
    
    setIsVoting(true);
    onVoteSubmit(currentVoter.id, nomineeId);
    setShowVote(true);
    
    // Show the vote for a moment, then move to next voter
    setTimeout(() => {
      setShowVote(false);
      setIsVoting(false);
      setCurrentVoterIndex(prev => prev + 1);
    }, 2000);
  };
  
  // Check if all votes are in
  const allVotesIn = Object.keys(votes).length >= voters.length;
  
  // If HOH needs to break tie, check if we have the same number of votes for each nominee
  let hohNeedsTieBreaker = false;
  if (allVotesIn && hoh) {
    const votesForNominee1 = Object.values(votes).filter(v => v === nominees[0].id).length;
    const votesForNominee2 = Object.values(votes).filter(v => v === nominees[1].id).length;
    hohNeedsTieBreaker = votesForNominee1 === votesForNominee2;
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">House Vote</h3>
        <p className="text-muted-foreground">
          Houseguests will vote one by one to evict a nominee.
        </p>
      </div>
      
      <div className="flex justify-center items-center gap-10 my-6">
        {nominees.map(nominee => (
          <div key={nominee.id} className="text-center">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
              {nominee.name.charAt(0)}
            </div>
            <p className="font-semibold">{nominee.name}</p>
          </div>
        ))}
      </div>
      
      {!allVotesIn && currentVoter && (
        <div className="bg-gray-100 p-4 rounded-md text-center">
          <p className="font-medium mb-2">
            <span className="text-bb-red">Current Voter:</span> {currentVoter.name}
            {currentVoter.isPlayer ? " (You)" : ""}
          </p>
          
          {isVoting && (
            <div className="flex items-center justify-center">
              <Clock className="animate-pulse mr-2" />
              <span>{showVote ? "Vote cast!" : "Thinking..."}</span>
            </div>
          )}
          
          {isPlayerVoting && !isVoting && (
            <div className="mt-4 space-y-2">
              <p>Vote to evict:</p>
              <div className="flex justify-center gap-4">
                {nominees.map(nominee => (
                  <Button
                    key={nominee.id}
                    variant="destructive"
                    className="flex items-center"
                    onClick={() => handlePlayerVote(nominee.id)}
                  >
                    <User className="mr-1 h-4 w-4" />
                    {nominee.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {hohNeedsTieBreaker && hoh && (
        <div className="bg-yellow-50 p-4 rounded-md text-center border border-yellow-200">
          <p className="font-medium mb-2">
            There's a tie! Head of Household {hoh.name} must break the tie.
          </p>
          
          {hoh.isPlayer && (
            <div className="mt-4 space-y-2">
              <p>As HoH, vote to evict:</p>
              <div className="flex justify-center gap-4">
                {nominees.map(nominee => (
                  <Button
                    key={nominee.id}
                    variant="destructive"
                    className="flex items-center"
                    onClick={() => onVoteSubmit(hoh.id, nominee.id)}
                  >
                    <User className="mr-1 h-4 w-4" />
                    {nominee.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Voting Status:</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {voters.map(voter => (
            <div 
              key={voter.id} 
              className={`text-center p-2 rounded-md ${
                votes[voter.id] ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-sm mb-1">
                {voter.name.charAt(0)}
              </div>
              <p className="text-xs font-medium">{voter.name}</p>
              {votes[voter.id] && (
                <VoteIcon className="h-3 w-3 mx-auto mt-1 text-green-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvictionVoting;
