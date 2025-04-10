
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/contexts/GameContext';
import { Clock, Info, AlertCircle, Award, UserCheck, UserX, Trophy, Key, Shield, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const GameEventLog: React.FC = () => {
  const { gameState } = useGame();
  const { gameLog } = gameState;
  
  // Get only the last 15 events, in reverse chronological order (newest first)
  const recentEvents = [...gameLog].reverse().slice(0, 15);
  
  const getEventIcon = (type: string) => {
    switch(type) {
      case 'GAME_START':
        return <Info className="text-blue-500" />;
      case 'HOH_COMPETITION':
        return <Key className="text-bb-gold" />;
      case 'POV_COMPETITION':
        return <Shield className="text-bb-green" />;
      case 'COMPETITION':
        return <Award className="text-bb-green" />;
      case 'NOMINATION':
        return <AlertCircle className="text-bb-red" />;
      case 'EVICTION':
        return <UserX className="text-bb-red" />;
      case 'ALLIANCE':
        return <UserCheck className="text-blue-500" />;
      case 'FINALE':
        return <Trophy className="text-yellow-500" />;
      default:
        return <Clock className="text-gray-400" />;
    }
  };
  
  const getEventBackground = (type: string) => {
    switch(type) {
      case 'EVICTION':
        return 'bg-red-500/10 border-l-red-500';
      case 'NOMINATION':
        return 'bg-red-400/5 border-l-red-400';
      case 'HOH_COMPETITION':
      case 'POV_COMPETITION':
      case 'COMPETITION':
        return 'bg-green-500/10 border-l-green-500';
      case 'ALLIANCE':
        return 'bg-blue-500/10 border-l-blue-500';
      case 'FINALE':
        return 'bg-yellow-500/10 border-l-yellow-500';
      case 'GAME_START':
        return 'bg-blue-500/10 border-l-blue-500';
      case 'SOCIAL_INTERACTION':
        return 'bg-purple-500/10 border-l-purple-500';
      default:
        return 'bg-gray-100 border-l-gray-400';
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
    <ScrollArea className="h-[350px] border rounded-lg overflow-hidden">
      <div className="p-0">
        {recentEvents.map((event, index) => {
          const timestamp = new Date(event.timestamp);
          const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-start p-3 border-b last:border-0 border-l-2",
                getEventBackground(event.type)
              )}
            >
              <div className={cn(
                "mt-0.5 mr-3 p-1 rounded-full bg-white/50 dark:bg-black/20",
                event.type.includes("EVICT") || event.type === "NOMINATION" ? "text-bb-red" :
                event.type.includes("COMPETITION") ? "text-bb-green" :
                event.type === "ALLIANCE" ? "text-bb-blue" : "text-muted-foreground"
              )}>
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Week {event.week}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {event.type.toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm mt-1">
                  {event.description}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {timeString}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default GameEventLog;
