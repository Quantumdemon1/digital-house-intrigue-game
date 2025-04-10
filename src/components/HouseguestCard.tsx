
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CustomProgress from './game-phases/NominationPhase/CustomProgress';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { Crown, Award, Target, Heart, HeartOff } from 'lucide-react';

interface HouseguestCardProps {
  houseguest: Houseguest;
  showRelationship?: boolean;
}

const HouseguestCard: React.FC<HouseguestCardProps> = ({ houseguest, showRelationship = false }) => {
  const { gameState, getRelationship } = useGame();
  const player = gameState.houseguests.find(h => h.isPlayer);
  
  let relationshipScore = 0;
  let relationshipColor = '';
  
  if (player && showRelationship && !houseguest.isPlayer) {
    relationshipScore = getRelationship(player.id, houseguest.id);
    
    if (relationshipScore > 50) relationshipColor = 'text-green-600';
    else if (relationshipScore > 0) relationshipColor = 'text-green-400';
    else if (relationshipScore > -50) relationshipColor = 'text-red-400';
    else relationshipColor = 'text-red-600';
  }

  return (
    <Card className={`relative shadow-md ${houseguest.isPlayer ? 'border-bb-green' : ''}`}>
      <div className="absolute top-2 right-2 flex gap-1">
        {houseguest.isHoH && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="default" className="bg-bb-blue">
                  <Crown className="h-4 w-4 mr-1" />
                  HoH
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Head of Household</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {houseguest.isPovHolder && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="bg-bb-green text-bb-dark">
                  <Award className="h-4 w-4 mr-1" />
                  PoV
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Power of Veto holder</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {houseguest.isNominated && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive" className="bg-bb-red">
                  <Target className="h-4 w-4 mr-1" />
                  Nom
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nominated for eviction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <CardContent className="pt-4">
        <div className="flex flex-col items-center">
          <div className="camera-lens w-16 h-16 mb-2">
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
              {houseguest.name.charAt(0)}
            </div>
          </div>
          
          <h3 className="font-bold text-center">
            {houseguest.name}
            {houseguest.isPlayer && <span className="text-bb-green text-sm ml-1">(You)</span>}
          </h3>
          
          <p className="text-xs text-muted-foreground text-center">
            {houseguest.age} • {houseguest.occupation}
          </p>
          
          {showRelationship && !houseguest.isPlayer && player && (
            <div className="mt-2 w-full">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Relationship</span>
                <span className={relationshipColor}>
                  {relationshipScore > 0 ? (
                    <Heart className="inline h-3 w-3 mr-1" />
                  ) : (
                    <HeartOff className="inline h-3 w-3 mr-1" />
                  )}
                  {relationshipScore}
                </span>
              </div>
              <CustomProgress 
                value={50 + relationshipScore/2} 
                className="h-1"
                indicatorClassName={relationshipScore > 0 ? 'bg-gradient-to-r from-green-300 to-green-600' : 'bg-gradient-to-r from-red-300 to-red-600'}
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-2 text-xs flex justify-center">
        <div className="flex space-x-2">
          {houseguest.traits.map(trait => (
            <Badge key={trait} variant="secondary" className="text-[10px]">
              {trait}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default HouseguestCard;
