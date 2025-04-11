
import { useState, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/components/ui/use-toast';

interface VotingLogicProps {
  nominees: Houseguest[];
  voters: Houseguest[];
  getRelationship: (voterId: string, nomineeId: string) => number;
  onVoteSubmit: (voterId: string, nomineeId: string) => void;
  externalVotes?: Record<string, string>;
}

export const useVotingLogic = ({
  nominees,
  voters,
  getRelationship,
  onVoteSubmit,
  externalVotes = {}
}: VotingLogicProps) => {
  const { toast } = useToast();
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [showVote, setShowVote] = useState(false);
  const [votes, setVotes] = useState<Record<string, string>>(externalVotes);
  
  // Current voter
  const currentVoter = voters[currentVoterIndex];
  const isPlayerVoting = currentVoter?.isPlayer;
  
  // Process AI votes
  useEffect(() => {
    if (!currentVoter || isVoting || Object.keys(votes).includes(currentVoter.id)) {
      return;
    }
    
    // If it's the player's turn, let them vote
    if (isPlayerVoting) {
      return;
    }
    
    // For AI players, start voting process immediately
    setIsVoting(true);
    
    // Reduced AI thinking time for faster gameplay
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
      
      // Show the vote briefly, then move to next voter quickly
      setTimeout(() => {
        setShowVote(false);
        setIsVoting(false);
        nextVoter();
      }, 800); // Reduced from 2000ms to 800ms for faster progression
    }, 500); // Reduced from 1500ms to 500ms for faster thinking time
    
    return () => clearTimeout(timer);
  }, [currentVoter, isPlayerVoting, isVoting, nominees, votes, getRelationship, onVoteSubmit]);
  
  const handlePlayerVote = (nomineeId: string) => {
    if (!currentVoter) return;
    
    setIsVoting(true);
    const updatedVotes = { ...votes, [currentVoter.id]: nomineeId };
    setVotes(updatedVotes);
    onVoteSubmit(currentVoter.id, nomineeId);
    setShowVote(true);
    
    // Show the vote for a moment, then move to next voter
    setTimeout(() => {
      setShowVote(false);
      setIsVoting(false);
      nextVoter();
    }, 1000); // Still give player votes a reasonable display time
  };
  
  const nextVoter = () => {
    setCurrentVoterIndex(prev => prev + 1);
  };
  
  return {
    votes,
    currentVoter,
    isPlayerVoting,
    isVoting,
    showVote,
    handlePlayerVote
  };
};
