
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, FastForward } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';

interface AdvanceSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const AdvanceSection: React.FC<AdvanceSectionProps> = ({ actions, onActionClick }) => {
  const action = actions[0];
  
  return (
    <div className="pt-4 border-t border-border">
      <Button
        size="lg"
        className="w-full bg-gradient-to-r from-bb-blue to-bb-blue/80 hover:from-bb-blue/90 hover:to-bb-blue/70 text-white font-semibold shadow-game-md hover:shadow-game-lg transition-all"
        onClick={() => onActionClick('advance_phase')}
      >
        <FastForward className="h-5 w-5 mr-2" />
        {action.text}
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
};

export default AdvanceSection;
