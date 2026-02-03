
import React from 'react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/components/ui/use-toast';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { UserPlus, ArrowRight } from 'lucide-react';

interface SelectSavedStageProps {
  eligibleToSave: Houseguest[];
  onSaveNominee: (nominee: Houseguest) => void;
}

const SelectSavedStage: React.FC<SelectSavedStageProps> = ({ eligibleToSave, onSaveNominee }) => {
  const { toast } = useToast();
  
  const handleSave = (nominee: Houseguest) => {
    toast({
      title: "Nominee Saved",
      description: `${nominee.name} has been removed from the block.`,
    });
    
    onSaveNominee(nominee);
  };
  
  return (
    <div className="text-center space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-bb-green/10">
          <UserPlus className="h-8 w-8 text-bb-green" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground">Select a Nominee to Save</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Choose one of the current nominees to remove from the block using the Power of Veto.
        </p>
      </div>
      
      {/* Nominee Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
        {eligibleToSave.map(nominee => (
          <button 
            key={nominee.id} 
            onClick={() => handleSave(nominee)}
            className="group p-6 rounded-xl bg-gradient-to-b from-card to-muted/20 border border-border hover:border-bb-green/50 hover:shadow-game-lg transition-all duration-300 flex flex-col items-center"
          >
            <StatusAvatar
              name={nominee.name}
              imageUrl={nominee.imageUrl}
              status="nominee"
              size="lg"
              className="mb-4 group-hover:scale-105 transition-transform"
            />
            <div className="font-semibold text-lg text-foreground mb-1">{nominee.name}</div>
            <div className="text-sm text-muted-foreground mb-4">{nominee.occupation}</div>
            
            <div className="flex items-center gap-2 text-bb-green font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Save <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectSavedStage;
