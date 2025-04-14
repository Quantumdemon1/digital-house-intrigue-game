
import React from 'react';
import { PromiseDisplay } from './index';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Promise, PromiseStatus } from '@/models/promise';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PromiseListProps {
  showAll?: boolean;
  className?: string;
}

const PromiseList: React.FC<PromiseListProps> = ({
  showAll = false,
  className
}) => {
  const { game, gameState } = useGame();
  const playerHouseguest = gameState.houseguests.find(hg => hg.isPlayer);
  
  if (!game?.promises || !playerHouseguest) {
    return <div className="text-center text-muted-foreground">No promises found</div>;
  }
  
  // Filter promises related to the player
  const playerPromises = game.promises.filter(p => 
    p.fromId === playerHouseguest.id || p.toId === playerHouseguest.id
  );
  
  // Filter promises by their status
  const pendingPromises = playerPromises.filter(p => p.status === 'pending' || p.status === 'active');
  const fulfilledPromises = playerPromises.filter(p => p.status === 'fulfilled');
  const brokenPromises = playerPromises.filter(p => p.status === 'broken');
  const expiredPromises = playerPromises.filter(p => p.status === 'expired');
  
  // Get names for display
  const getHouseguestName = (id: string): string => {
    return game.getHouseguestById(id)?.name || 'Unknown';
  };
  
  // Render a section of promises
  const renderPromisesList = (promises: Promise[]) => {
    if (promises.length === 0) {
      return <div className="text-center py-4 text-muted-foreground">No promises in this category</div>;
    }
    
    return (
      <ScrollArea className="max-h-[300px]">
        <div className="space-y-3 p-1">
          {promises.map(promise => (
            <PromiseDisplay
              key={promise.id}
              promiser={getHouseguestName(promise.fromId)}
              promisee={getHouseguestName(promise.toId)}
              description={promise.description}
              promiseType={promise.type}
              status={promise.status}
              week={promise.week}
              currentWeek={game.week}
              className="hover:shadow-md transition-shadow"
            />
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card className={className}>
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active ({pendingPromises.length})</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled ({fulfilledPromises.length})</TabsTrigger>
          <TabsTrigger value="broken">Broken ({brokenPromises.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredPromises.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="p-4">
          {renderPromisesList(pendingPromises)}
        </TabsContent>
        <TabsContent value="fulfilled" className="p-4">
          {renderPromisesList(fulfilledPromises)}
        </TabsContent>
        <TabsContent value="broken" className="p-4">
          {renderPromisesList(brokenPromises)}
        </TabsContent>
        <TabsContent value="expired" className="p-4">
          {renderPromisesList(expiredPromises)}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PromiseList;
