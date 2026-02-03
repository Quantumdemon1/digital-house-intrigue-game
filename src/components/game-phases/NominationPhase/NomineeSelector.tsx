
import React from 'react';
import { Houseguest } from '@/models/houseguest';
import { Button } from '@/components/ui/button';
import { Check, User } from 'lucide-react';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface NomineeSelectorProps {
  potentialNominees: Houseguest[];
  nominees: Houseguest[];
  onToggleNominee: (houseguest: Houseguest) => void;
}

const NomineeSelector: React.FC<NomineeSelectorProps> = ({
  potentialNominees,
  nominees,
  onToggleNominee
}) => {
  const isSelected = (houseguest: Houseguest) => {
    return nominees.some(nominee => nominee.id === houseguest.id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {potentialNominees.map(houseguest => {
        const selected = isSelected(houseguest);
        return (
          <Button
            key={houseguest.id}
            variant={selected ? "default" : "outline"}
            className={`
              h-auto py-4 px-4 justify-start transition-all duration-300
              ${selected 
                ? 'bg-bb-red hover:bg-bb-red/90 text-white border-bb-red shadow-game-md' 
                : 'hover:border-bb-red/50 hover:bg-bb-red/5'
              }
            `}
            onClick={() => onToggleNominee(houseguest)}
          >
            <div className="flex items-center w-full gap-3">
              <StatusAvatar
                name={houseguest.name}
                imageUrl={houseguest.imageUrl}
                status={selected ? 'nominee' : 'none'}
                size="sm"
                showBadge={false}
              />
              <div className="flex-grow text-left">
                <div className="font-semibold">{houseguest.name}</div>
                <div className={`text-xs ${selected ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {houseguest.occupation}
                </div>
              </div>
              {selected && (
                <div className="p-1 rounded-full bg-white/20">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default NomineeSelector;
