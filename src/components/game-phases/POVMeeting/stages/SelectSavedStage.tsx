
import React from 'react';
import { Button } from '@/components/ui/button';
import { Houseguest } from '@/models/houseguest';
import { useToast } from '@/components/ui/use-toast';

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
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Select a Nominee to Save</h3>
      <p className="text-muted-foreground mb-6">
        Choose one of the current nominees to remove from the block
      </p>
      
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {eligibleToSave.map(nominee => (
          <Button 
            key={nominee.id} 
            className="h-auto py-4 flex flex-col items-center"
            onClick={() => handleSave(nominee)}
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg mb-2">
              {nominee.name.charAt(0)}
            </div>
            <div>{nominee.name}</div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SelectSavedStage;
