
import React from 'react';
import { Check } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';

interface HouseguestSelectionItemProps {
  houseguest: Houseguest;
  isSelected: boolean;
  relationshipScore: number;
  relationshipLevel: string;
  onToggle: () => void;
}

export const HouseguestSelectionItem: React.FC<HouseguestSelectionItemProps> = ({
  houseguest,
  isSelected,
  relationshipScore,
  relationshipLevel,
  onToggle
}) => {
  // Function to get color based on relationship score
  const getRelationshipColor = (score: number) => {
    if (score >= 60) return "text-green-600 dark:text-green-400";
    if (score >= 20) return "text-blue-600 dark:text-blue-400";
    if (score >= -20) return "text-gray-600 dark:text-gray-400";
    if (score >= -60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  // Function to get the likelihood of acceptance
  const getAcceptanceLikelihood = (score: number) => {
    if (score >= 60) return "Likely to accept";
    if (score >= 30) return "Might accept";
    if (score >= 0) return "Uncertain";
    if (score >= -30) return "Unlikely to accept";
    return "Would reject";
  };

  return (
    <div 
      className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isSelected ? 'bg-primary/10 border-primary border' : 'border border-transparent'}`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
          {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
        </div>
        <div>
          <div className="font-medium text-sm">{houseguest.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Traits: {houseguest.traits.slice(0, 2).join(", ")}</span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className={`font-medium text-sm ${getRelationshipColor(relationshipScore)}`}>
          {relationshipLevel}
        </div>
        <div className="text-xs text-muted-foreground">
          {getAcceptanceLikelihood(relationshipScore)}
        </div>
      </div>
    </div>
  );
};
