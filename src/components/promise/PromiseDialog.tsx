
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PromiseList from './PromiseList';
import PromiseCard from './PromiseCard';
import { useGame } from '@/contexts/GameContext';
import { Promise } from '@/models/promise';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface PromiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPromiseId?: string;
}

const PromiseDialog: React.FC<PromiseDialogProps> = ({
  open,
  onOpenChange,
  initialPromiseId
}) => {
  const { gameState } = useGame();
  const [selectedPromise, setSelectedPromise] = useState<Promise | null>(
    initialPromiseId && gameState.promises 
      ? gameState.promises.find(p => p.id === initialPromiseId) || null 
      : null
  );
  
  const handlePromiseClick = (promise: Promise) => {
    setSelectedPromise(promise);
  };
  
  const handleBack = () => {
    setSelectedPromise(null);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {selectedPromise ? (
              <>
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 mr-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                Promise Details
              </>
            ) : (
              "Promises"
            )}
          </DialogTitle>
        </DialogHeader>
        
        {selectedPromise ? (
          <PromiseCard promise={selectedPromise} />
        ) : (
          <PromiseList 
            showAll={true} 
            onPromiseClick={handlePromiseClick} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PromiseDialog;
