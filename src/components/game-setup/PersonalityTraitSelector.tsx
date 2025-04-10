import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PersonalityTrait } from '@/models/houseguest';
import { CheckCircle } from 'lucide-react';
interface PersonalityTraitSelectorProps {
  selectedTraits: PersonalityTrait[];
  onToggleTrait: (trait: PersonalityTrait) => void;
  personalityTraits: PersonalityTrait[];
}
const PersonalityTraitSelector: React.FC<PersonalityTraitSelectorProps> = ({
  selectedTraits,
  onToggleTrait,
  personalityTraits
}) => {
  return <div className="space-y-3">
      
      <div className="grid grid-cols-2 gap-2">
        {personalityTraits.map(trait => <Button key={trait} variant={selectedTraits.includes(trait) ? "default" : "outline"} className={selectedTraits.includes(trait) ? "bg-bb-blue" : ""} onClick={() => onToggleTrait(trait)}>
            {trait}
            {selectedTraits.includes(trait) && <CheckCircle className="ml-2 h-4 w-4" />}
          </Button>)}
      </div>
    </div>;
};
export default PersonalityTraitSelector;