
import React from 'react';
import { Target, ArrowRight, Check, Users, Shield } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface NominationCeremonyResultProps {
  nominees: Houseguest[];
  hoh?: Houseguest | null;
  hohName?: string;
  onContinue?: () => void;
}

const NominationCeremonyResult: React.FC<NominationCeremonyResultProps> = ({
  nominees,
  hoh,
  hohName,
  onContinue
}) => {
  const { dispatch } = useGame();
  
  const nominatorName = hoh?.name || hohName || "The HOH";
  
  const handleContinue = () => {
    console.log("NominationCeremonyResult: Continue button clicked");
    if (onContinue) {
      console.log("NominationCeremonyResult: Calling onContinue function");
      onContinue();
    } else {
      console.log("NominationCeremonyResult: No onContinue function provided, dispatching directly");
      dispatch({
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'continue_to_pov',
          params: {}
        }
      });
    }
  };
  
  const handleCampaign = () => {
    dispatch({
      type: 'SET_PHASE',
      payload: 'SocialInteraction'
    });
  };
  
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-4 animate-fade-in">
      {/* Success Icon */}
      <div className="relative">
        <div className="p-4 rounded-full bg-gradient-to-br from-bb-red/20 to-bb-gold/10">
          <Target className="w-10 h-10 text-bb-red" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-bb-green">
          <Check className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* Title */}
      <div className="space-y-2">
        <h3 className="text-2xl font-display font-bold text-foreground">
          Nominations Complete
        </h3>
        <p className="text-muted-foreground">
          {nominatorName} has nominated:
        </p>
      </div>
      
      {/* Nominees Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        {nominees.map((nominee, index) => (
          <div 
            key={nominee.id} 
            className="animate-reveal flex flex-col items-center p-6 rounded-xl bg-gradient-to-b from-bb-red/10 to-card border border-bb-red/20 shadow-game-md"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <StatusAvatar
              name={nominee.name}
              imageUrl={nominee.imageUrl}
              status="nominee"
              size="lg"
              className="mb-3"
            />
            <div className="font-bold text-lg text-foreground">{nominee.name}</div>
            <div className="text-sm text-muted-foreground">{nominee.occupation}</div>
          </div>
        ))}
      </div>
      
      {/* Info Text */}
      <p className="text-sm text-muted-foreground max-w-md">
        These houseguests will compete in the Power of Veto competition 
        for a chance to save themselves from eviction.
      </p>
      
      {/* Navigation Options */}
      <div className="space-y-3 w-full max-w-md">
        <p className="text-center text-sm text-muted-foreground">
          Choose your next action:
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button 
            variant="outline"
            onClick={handleCampaign}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Campaign Period
          </Button>
          <Button 
            onClick={handleContinue} 
            size="lg"
            className="bg-bb-blue hover:bg-bb-blue/90 text-white font-semibold px-8 gap-2"
          >
            <Shield className="h-4 w-4" />
            Continue to PoV
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NominationCeremonyResult;
