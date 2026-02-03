
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type EvictionStage = 'interaction' | 'speeches' | 'voting' | 'tiebreaker' | 'results';

export function useEvictionStages() {
  const [stage, setStage] = useState<EvictionStage>('interaction');
  const { toast } = useToast();
  
  // Handle when interaction stage completes - now goes to speeches
  const handleProceedToVoting = useCallback(() => {
    setStage('speeches');
    
    toast({
      title: "Final Pleas",
      description: "Nominees will now address the house before the vote.",
    });
  }, [toast]);

  // Handle when speeches complete - move to voting
  const handleSpeechesComplete = useCallback(() => {
    setStage('voting');
    
    toast({
      title: "Voting Phase",
      description: "Houseguests will now cast their votes to evict.",
    });
  }, [toast]);

  // Progress to tiebreaker stage
  const progressToTiebreaker = useCallback(() => {
    setStage('tiebreaker');
    
    toast({
      title: "Tie Vote!",
      description: "The Head of Household must cast the deciding vote.",
      variant: "destructive"
    });
  }, [toast]);

  // Progress to results stage
  const progressToResults = useCallback(() => {
    setStage('results');
  }, []);
  
  return {
    stage,
    setStage,
    handleProceedToVoting,
    handleSpeechesComplete,
    progressToTiebreaker,
    progressToResults
  };
}
