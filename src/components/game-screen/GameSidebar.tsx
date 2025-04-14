
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { PromiseList } from '../promise';

const GameSidebar: React.FC = () => {
  const { gameState, game } = useGame();
  
  // Check if there are any promises
  const hasActivePromises = game?.promises?.some(p => p.status === 'pending' || p.status === 'active');
  
  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 text-slate-100 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Game Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-slate-400">Week</p>
            <p className="font-medium">{gameState.week}</p>
          </div>
          <Separator className="bg-slate-700" />
          <div>
            <p className="text-slate-400">Phase</p>
            <p className="font-medium">{gameState.phase}</p>
          </div>
          <Separator className="bg-slate-700" />
          <div>
            <p className="text-slate-400">Head of Household</p>
            <p className="font-medium">{gameState.hohWinner?.name || 'None'}</p>
          </div>
          <Separator className="bg-slate-700" />
          <div>
            <p className="text-slate-400">Power of Veto</p>
            <p className="font-medium">{gameState.povWinner?.name || 'Not played yet'}</p>
          </div>
          <Separator className="bg-slate-700" />
          <div>
            <p className="text-slate-400">Nominees</p>
            <p className="font-medium">
              {gameState.nominees.length > 0
                ? gameState.nominees.map(nom => nom.name).join(', ')
                : 'None yet'}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Promises Section */}
      {hasActivePromises && (
        <Card className="bg-slate-800 text-slate-100 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-400" />
              Active Promises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PromiseList className="bg-transparent border-none shadow-none" />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameSidebar;
