
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CustomProgress from './game-phases/NominationPhase/CustomProgress';
import { Houseguest } from '@/models/houseguest';
import { useGame } from '@/contexts/GameContext';
import { Crown, Award, Target, Heart, HeartOff, Info } from 'lucide-react';

interface HouseguestCardProps {
  houseguest: Houseguest;
  showRelationship?: boolean;
}

const HouseguestCard: React.FC<HouseguestCardProps> = ({ houseguest, showRelationship = false }) => {
  const { gameState, getRelationship } = useGame();
  const player = gameState.houseguests.find(h => h.isPlayer);
  
  let relationshipScore = 0;
  let relationshipColor = '';
  let relationshipBorderStyle = '';
  
  if (player && showRelationship && !houseguest.isPlayer) {
    relationshipScore = getRelationship(player.id, houseguest.id);
    
    if (relationshipScore > 50) {
      relationshipColor = 'text-green-600';
      relationshipBorderStyle = 'border-green-600/50';
    } else if (relationshipScore > 0) {
      relationshipColor = 'text-green-400';
      relationshipBorderStyle = 'border-green-400/40';
    } else if (relationshipScore > -50) {
      relationshipColor = 'text-red-400';
      relationshipBorderStyle = 'border-red-400/40';
    } else {
      relationshipColor = 'text-red-600';
      relationshipBorderStyle = 'border-red-600/50';
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card 
          className={`relative shadow-md hover:shadow-lg transition-shadow ${
            houseguest.isPlayer ? 'border-bb-green border-2' : showRelationship ? relationshipBorderStyle : ''
          } cursor-pointer`}
        >
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            {houseguest.isHoH && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="default" className="bg-bb-gold border-none">
                      <Crown className="h-3 w-3 mr-1" />
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
                    <Badge variant="outline" className="bg-bb-green text-bb-dark border-none">
                      <Award className="h-3 w-3 mr-1" />
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
                    <Badge variant="destructive" className="bg-bb-red border-none">
                      <Target className="h-3 w-3 mr-1" />
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
          
          <CardContent className="pt-5">
            <div className="flex flex-col items-center">
              <Avatar className="w-16 h-16 mb-2 shadow-md">
                <AvatarFallback className="camera-lens bg-gray-200">
                  {houseguest.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
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
          
          <CardFooter className="p-2 text-xs flex justify-between items-center">
            <div className="flex space-x-1 flex-wrap">
              {houseguest.traits.slice(0, 2).map(trait => (
                <Badge key={trait} variant="secondary" className="text-[10px] mb-1">
                  {trait}
                </Badge>
              ))}
              {houseguest.traits.length > 2 && (
                <Badge variant="outline" className="text-[10px]">
                  +{houseguest.traits.length - 2}
                </Badge>
              )}
            </div>
            <Info className="h-3 w-3 text-muted-foreground" />
          </CardFooter>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="mr-2">{houseguest.name}</span>
            {houseguest.isHoH && <Crown className="h-4 w-4 text-bb-gold" />}
            {houseguest.isPovHolder && <Award className="h-4 w-4 text-bb-green" />}
            {houseguest.isNominated && <Target className="h-4 w-4 text-bb-red" />}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Avatar className="w-24 h-24 rounded-md shadow-md mx-auto sm:mx-0">
              <AvatarFallback className="text-3xl bg-gradient-to-br from-slate-200 to-slate-400 rounded-md">
                {houseguest.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <p className="text-sm">Age: {houseguest.age}</p>
              <p className="text-sm">Occupation: {houseguest.occupation}</p>
              <p className="text-sm">Status: {houseguest.status}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {houseguest.traits.map(trait => (
                  <Badge key={trait} variant="secondary" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {player && !houseguest.isPlayer && (
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Relationship with you:</h4>
              <div className="flex items-center gap-2">
                {relationshipScore > 0 ? (
                  <Heart className="h-4 w-4 text-green-500" />
                ) : (
                  <HeartOff className="h-4 w-4 text-red-500" />
                )}
                <CustomProgress 
                  value={50 + relationshipScore/2} 
                  className="h-2 flex-1"
                  indicatorClassName={relationshipScore > 0 ? 'bg-gradient-to-r from-green-300 to-green-600' : 'bg-gradient-to-r from-red-300 to-red-600'}
                />
                <span className={`font-bold ${relationshipColor}`}>{relationshipScore}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HouseguestCard;
