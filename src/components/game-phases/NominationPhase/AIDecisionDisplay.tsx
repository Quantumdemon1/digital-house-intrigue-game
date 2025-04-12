
import React from 'react';
import { Target, User, Brain } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import AIDecisionCard from '@/components/ai-feedback/AIDecisionCard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AIDecisionDisplayProps {
  hohName: string;
  nominees: Array<{id: string, name: string}>;
  reasoning: string;
  isVisible: boolean;
  onClose: () => void;
}

const AIDecisionDisplay: React.FC<AIDecisionDisplayProps> = ({
  hohName,
  nominees,
  reasoning,
  isVisible,
  onClose
}) => {
  const { getRelationship, game } = useGame();
  
  // Calculate approximate relationship changes (in a real implementation,
  // this would come from the actual relationship system)
  const relationshipImpacts = nominees.map(nominee => ({
    name: nominee.name,
    change: -3.0 // Nomination typically causes negative relationship impact
  }));
  
  const nomineeNames = nominees.map(n => n.name).join(' and ');
  const outcome = `Nominated ${nomineeNames} for eviction`;
  
  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0">
        <div className="p-4 flex flex-col items-center space-y-4">
          <div className="rounded-full bg-red-100 p-2 mb-1">
            <Target className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-lg font-semibold">AI Nomination Decision</h3>
          
          <AIDecisionCard
            decisionMaker={hohName}
            decisionType="Nomination"
            reasoning={reasoning}
            outcome={outcome}
            relationshipImpacts={relationshipImpacts}
          />
          
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onClose}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIDecisionDisplay;
