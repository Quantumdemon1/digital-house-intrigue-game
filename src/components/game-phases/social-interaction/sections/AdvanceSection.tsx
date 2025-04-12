
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';

interface AdvanceSectionProps {
  action: SocialActionChoice;
  onActionClick: (actionId: string, params?: any) => void;
}

const AdvanceSection: React.FC<AdvanceSectionProps> = ({ action, onActionClick }) => {
  return (
    <div className="pt-3">
      <Button
        variant="default"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => onActionClick('advance_phase')}
      >
        <ArrowRight size={16} className="mr-2"/>
        {action.text}
      </Button>
    </div>
  );
};

export default AdvanceSection;
