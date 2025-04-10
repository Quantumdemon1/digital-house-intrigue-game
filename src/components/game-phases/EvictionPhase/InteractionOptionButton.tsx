
import React from 'react';
import { Button } from '@/components/ui/button';
import { InteractionOption } from './types/interactions';

interface InteractionOptionButtonProps {
  option: InteractionOption;
  onSelect: (option: InteractionOption) => void;
}

const InteractionOptionButton: React.FC<InteractionOptionButtonProps> = ({ option, onSelect }) => {
  return (
    <Button
      variant="outline" 
      className="w-full justify-start h-auto py-3 px-4 text-left"
      onClick={() => onSelect(option)}
    >
      <span className="flex items-center">
        {option.icon}
        {option.text}
      </span>
    </Button>
  );
};

export default InteractionOptionButton;
