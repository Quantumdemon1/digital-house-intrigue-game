
import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipForward, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFastForward } from '@/hooks/useFastForward';

export const FastForwardButton: React.FC = () => {
  const { handleFastForward, isProcessing } = useFastForward();
  
  const onFastForwardClick = () => {
    handleFastForward();
    toast.info("Fast forwarding to next event");
  };
  
  return (
    <Button 
      onClick={onFastForwardClick} 
      variant="secondary" 
      size="sm"
      disabled={isProcessing} 
      className="flex items-center gap-1"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <SkipForward className="h-4 w-4" />
      )}
      <span className="hidden md:inline">Fast Forward</span>
    </Button>
  );
};

export default FastForwardButton;
