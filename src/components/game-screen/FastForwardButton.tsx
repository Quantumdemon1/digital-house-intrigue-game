import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFastForward } from '@/hooks/useFastForward';
export const FastForwardButton: React.FC = () => {
  const {
    handleFastForward,
    isProcessing
  } = useFastForward();
  const {
    toast
  } = useToast();
  const onFastForwardClick = () => {
    handleFastForward();
    toast({
      title: "Fast forwarding...",
      description: "Skipping to next event"
    });
  };
  return <Button onClick={onFastForwardClick} variant="secondary" disabled={isProcessing} className="bg-bb-blue text-white">
      <SkipForward className="w-4 h-4" />
      Fast Forward
    </Button>;
};