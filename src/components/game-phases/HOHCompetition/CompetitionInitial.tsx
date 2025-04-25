
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Clock, Users } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { useAnimationState } from '@/hooks/useAnimationState';

interface CompetitionInitialProps {
  gameWeek: number;
  activeHouseguests: Houseguest[];
}

const CompetitionInitial: React.FC<CompetitionInitialProps> = ({ gameWeek, activeHouseguests }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const animation = useAnimationState({
    initialState: true,
    duration: 500
  });
  
  // Create randomized competition type spinner
  const competitionTypes = ['Physical', 'Mental', 'Endurance', 'Social', 'Luck'];
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
  
  useEffect(() => {
    // Create spinning animation through competition types
    const typeInterval = setInterval(() => {
      setCurrentTypeIndex(prev => (prev + 1) % competitionTypes.length);
    }, 200);
    
    // Hide the placeholder after 2 seconds
    const timer = setTimeout(() => {
      setShowPlaceholder(false);
    }, 2000);
    
    return () => {
      clearInterval(typeInterval);
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <Card className="shadow-lg border-bb-blue overflow-hidden">
      <CardHeader className="bg-bb-blue text-white">
        <CardTitle className="flex items-center">
          <Crown className="mr-2" /> Head of Household Competition
        </CardTitle>
        <CardDescription className="text-white/80">
          Week {gameWeek}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 animate-fade-in">
          <h3 className="text-lg font-medium mb-2">Competition Time</h3>
          <p>
            The Head of Household competition is about to begin. The winner will be safe for the week
            and will nominate two houseguests for eviction.
          </p>
        </div>
        
        <div className="mb-6 text-center">
          <h3 className="text-lg font-medium mb-4">Selecting Random Competition Type</h3>
          <div className="relative">
            <div className="animate-pulse mb-2">
              <Clock className="w-12 h-12 mx-auto" />
            </div>
            
            <div className="h-8 flex items-center justify-center overflow-hidden">
              {showPlaceholder ? (
                <p className="text-muted-foreground italic">
                  Selecting competition type...
                </p>
              ) : (
                <div className="relative h-full">
                  {competitionTypes.map((type, index) => (
                    <div
                      key={type}
                      className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
                      style={{
                        opacity: index === currentTypeIndex ? 1 : 0,
                        transform: index === currentTypeIndex ? 'translateY(0)' : 'translateY(10px)',
                      }}
                    >
                      <span className="font-bold text-lg">{type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">Please wait while the competition begins...</p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Users className="w-4 h-4 mr-1" />
            Current Houseguests ({activeHouseguests.length}):
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activeHouseguests.map((houseguest, index) => (
              <div 
                key={houseguest.id} 
                className="flex items-center text-sm bg-background p-1.5 rounded-md transition-all hover:bg-bb-blue/10"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 border border-gray-300">
                  {houseguest.name.charAt(0)}
                </div>
                <span className="truncate">
                  {houseguest.name}
                  {houseguest.isPlayer && <span className="text-bb-green text-xs ml-1">(You)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 bg-[#005a9a]">
        <div className="w-full">
          <p className="text-sm text-slate-50">
            The winner becomes the new HoH and will nominate two houseguests for eviction.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CompetitionInitial;
