
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { ScrollArea } from '@/components/ui/scroll-area';

const GameLog: React.FC = () => {
  const { game } = useGame();
  
  if (!game) {
    return <p>No game data available.</p>;
  }
  
  const events = game.eventLog || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground">No events recorded yet.</p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {events.map((event, index) => (
                <div 
                  key={index} 
                  className="border-l-2 pl-3 py-1 border-l-blue-500 mb-3"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    Week {event.week} - {event.phase} Phase
                  </div>
                  <p className="text-sm">{event.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default GameLog;
