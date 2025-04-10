
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

interface NominationHeaderProps {
  hohName?: string;
}

const NominationHeader: React.FC<NominationHeaderProps> = ({ hohName }) => {
  const { gameState } = useGame();
  
  return (
    <CardHeader className="bg-bb-red text-white">
      <CardTitle className="flex items-center">
        <Target className="mr-2" /> Nomination Ceremony
      </CardTitle>
      <CardDescription className="text-white/80">
        Week {gameState.week}
      </CardDescription>
    </CardHeader>
  );
};

export default NominationHeader;
