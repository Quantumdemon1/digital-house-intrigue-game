
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/contexts/GameContext';
import { Clock, Info, AlertCircle, Award, UserCheck, UserX } from 'lucide-react';

const GameEventLog: React.FC = () => {
  const { gameState } = useGame();
  const { gameLog } = gameState;
  
  // Get only the last 10 events, in reverse chronological order (newest first)
  const recentEvents = [...gameLog].reverse().slice(0, 10);
  
  const getEventIcon = (type: string) => {
    switch(type) {
      case 'GAME_START':
        return <Info className="text-bb-blue" />;
      case 'COMPETITION':
        return <Award className="text-bb-green" />;
      case 'NOMINATION':
        return <AlertCircle className="text-bb-red" />;
      case 'EVICTION':
        return <UserX className="text-bb-red" />;
      case 'ALLIANCE':
        return <UserCheck className="text-bb-blue" />;
      default:
        return <Clock className="text-gray-400" />;
    }
  };
  
  if (gameLog.length === 0) {
    return (
      <div className="border rounded-lg p-4 text-center text-muted-foreground">
        No game events yet.
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-3 py-2 border-b">
        <h3 className="font-medium">Recent Events</h3>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="p-0">
          {recentEvents.map((event, index) => (
            <div 
              key={index} 
              className="flex items-start p-3 border-b last:border-0"
            >
              <div className="mt-0.5 mr-3">
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium">
                  Week {event.week}: {event.type.toLowerCase().replace('_', ' ')}
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GameEventLog;
