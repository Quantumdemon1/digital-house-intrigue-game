
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';

export type EvictionStage = 'interaction' | 'voting' | 'results';

export function useEvictionStages() {
  const [stage, setStage] = useState<EvictionStage>('interaction');
  const { toast } = useToast();
  
  // Handle when interaction stage completes
  const handleProceedToVoting = useCallback(() => {
    setStage('voting');
    
    toast({
      title: "Voting Phase",
      description: "Houseguests will now cast their votes to evict.",
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
    progressToResults
  };
}
