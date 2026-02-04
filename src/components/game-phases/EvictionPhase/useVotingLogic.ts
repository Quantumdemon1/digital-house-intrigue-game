
import { useState, useEffect } from 'react';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/components/ui/use-toast';
import { useGame } from '@/contexts/game';
import { 
  getDecisionFactors, 
  calculateDecisionScore, 
  getTraitWeights 
} from '@/systems/ai/npc-decision-engine';
import { assessThreat } from '@/systems/ai/threat-assessment';

interface VotingLogicProps {
  nominees: Houseguest[];
  voters: Houseguest[];
  getRelationship: (voterId: string, nomineeId: string) => number;
  onVoteSubmit: (voterId: string, nomineeId: string) => void;
  externalVotes?: Record<string, string>;
}

/**
 * Calculate a comprehensive vote score for a nominee
 * Higher score = want to KEEP this person (less likely to vote to evict)
 */
function calculateVoteScore(
  voter: Houseguest,
  nominee: Houseguest,
  gameState: any,
  getRelationship: (voterId: string, nomineeId: string) => number
): number {
  // Get trait-specific weights for this voter
  const weights = getTraitWeights(voter.traits);
  
  // Get relationship system from game state if available
  const relationshipSystem = gameState?.relationshipSystem ?? null;
  
  // Get all decision factors
  const factors = getDecisionFactors(
    voter,
    nominee,
    gameState,
    relationshipSystem,
    assessThreat
  );
  
  // If we don't have the full game state, fall back to simple relationship
  if (!gameState) {
    return getRelationship(voter.id, nominee.id);
  }
  
  // Calculate weighted score
  return calculateDecisionScore(factors, weights);
}

export const useVotingLogic = ({
  nominees,
  voters,
  getRelationship,
  onVoteSubmit,
  externalVotes = {}
}: VotingLogicProps) => {
  const { toast } = useToast();
  const { gameState } = useGame();
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [showVote, setShowVote] = useState(false);
  const [votes, setVotes] = useState<Record<string, string>>(externalVotes);
  
  // Current voter
  const currentVoter = voters[currentVoterIndex];
  const isPlayerVoting = currentVoter?.isPlayer;
  
  // Process AI votes using enhanced multi-factor decision making
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
    
    // Calculate scores for both nominees using the new decision engine
    const nominee1Score = calculateVoteScore(
      currentVoter, 
      nominees[0], 
      gameState, 
      getRelationship
    );
    const nominee2Score = calculateVoteScore(
      currentVoter, 
      nominees[1], 
      gameState, 
      getRelationship
    );
    
    // Vote to evict the nominee with LOWER score (less desire to keep them)
    const voteForId = nominee1Score < nominee2Score ? nominees[0].id : nominees[1].id;
    
    const updatedVotes = { ...votes, [currentVoter.id]: voteForId };
    setVotes(updatedVotes);
    onVoteSubmit(currentVoter.id, voteForId);
    setShowVote(true);
    
    // Show the vote briefly, then move to next voter immediately
    setTimeout(() => {
      setShowVote(false);
      setIsVoting(false);
      nextVoter();
    }, 300); // Fast voting for AI players
    
  }, [currentVoter, isPlayerVoting, isVoting, nominees, votes, getRelationship, onVoteSubmit, gameState]);
  
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
