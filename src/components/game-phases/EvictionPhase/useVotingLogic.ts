
import { useState, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/components/ui/use-toast';

interface VotingLogicProps {
  nominees: Houseguest[];
  voters: Houseguest[];
  getRelationship: (voterId: string, nomineeId: string) => number;
  onVoteSubmit: (voterId: string, nomineeId: string) => void;
}

const VOTING_TIME_LIMIT = 30; // 30 seconds for each vote

export const useVotingLogic = ({
  nominees,
  voters,
  getRelationship,
  onVoteSubmit
}: VotingLogicProps) => {
  const { toast } = useToast();
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [showVote, setShowVote] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(VOTING_TIME_LIMIT);
  const [timerActive, setTimerActive] = useState(true);
  const [votes, setVotes] = useState<Record<string, string>>({});
  
  // Current voter
  const currentVoter = voters[currentVoterIndex];
  const isPlayerVoting = currentVoter?.isPlayer;
  
  // Process AI votes or handle timer expiration
  useEffect(() => {
    if (!currentVoter || isVoting || Object.keys(votes).includes(currentVoter.id)) {
      return;
    }
    
    // If it's the player's turn, let the timer run
    if (isPlayerVoting) {
      return;
    }
    
    // For AI players, start voting process
    setIsVoting(true);
    setTimerActive(false); // Pause the timer during AI thinking
    
    // Simulate AI thinking time
    const timer = setTimeout(() => {
      // AI voting logic based on relationships
      let nominee1Relationship = getRelationship(currentVoter.id, nominees[0].id);
      let nominee2Relationship = getRelationship(currentVoter.id, nominees[1].id);
      
      // AI votes to evict the houseguest they like less
      const voteForId = nominee1Relationship < nominee2Relationship ? nominees[0].id : nominees[1].id;
      
      const updatedVotes = { ...votes, [currentVoter.id]: voteForId };
      setVotes(updatedVotes);
      onVoteSubmit(currentVoter.id, voteForId);
      setShowVote(true);
      
      // Show the vote for a moment, then move to next voter
      setTimeout(() => {
        setShowVote(false);
        setIsVoting(false);
        nextVoter();
      }, 2000);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [currentVoter, isPlayerVoting, isVoting, nominees, votes]);
  
  // Timer countdown for player votes
  useEffect(() => {
    if (!timerActive || !isPlayerVoting || isVoting || timeRemaining <= 0) {
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, timerActive, isPlayerVoting, isVoting]);
  
  // Reset timer when moving to a new voter
  useEffect(() => {
    if (currentVoter) {
      setTimeRemaining(VOTING_TIME_LIMIT);
      setTimerActive(!isVoting && isPlayerVoting);
    }
  }, [currentVoterIndex, currentVoter, isPlayerVoting, isVoting]);
  
  const handlePlayerVote = (nomineeId: string) => {
    if (!currentVoter) return;
    
    setIsVoting(true);
    setTimerActive(false); // Stop timer when vote is cast
    const updatedVotes = { ...votes, [currentVoter.id]: nomineeId };
    setVotes(updatedVotes);
    onVoteSubmit(currentVoter.id, nomineeId);
    setShowVote(true);
    
    // Show the vote for a moment, then move to next voter
    setTimeout(() => {
      setShowVote(false);
      setIsVoting(false);
      nextVoter();
    }, 2000);
  };
  
  const nextVoter = () => {
    setCurrentVoterIndex(prev => prev + 1);
    setTimerActive(true);
  };
  
  // Handle timer expiration - cast random vote
  const handleTimeExpired = () => {
    if (!currentVoter || isVoting || !isPlayerVoting) return;
    
    toast({
      title: "Time Expired!",
      description: "Your voting time has expired, a random vote has been cast.",
      variant: "destructive",
    });
    
    // Randomly select one of the nominees
    const randomIndex = Math.floor(Math.random() * nominees.length);
    const randomNomineeId = nominees[randomIndex].id;
    
    // Submit the random vote and continue
    handlePlayerVote(randomNomineeId);
  };
  
  return {
    votes,
    currentVoter,
    isPlayerVoting,
    isVoting,
    showVote,
    timeRemaining,
    timerActive,
    handlePlayerVote,
    handleTimeExpired,
    VOTING_TIME_LIMIT
  };
};
