
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Trophy, Crown, UserX, Calendar, Clock,
  Award, Star, User
} from 'lucide-react';
import { 
  Timeline, 
  TimelineItem, 
  TimelineConnector, 
  TimelineHeader, 
  TimelineIcon, 
  TimelineBody 
} from './Timeline';

interface RecapSeason {
  winner: string;
  runnerUp: string;
  weeks: number;
  events: any[];
}

interface RecapProps {
  recap: {
    season: RecapSeason;
  };
}

const SeasonRecap: React.FC<RecapProps> = ({ recap }) => {
  const { gameState } = useGame();
  
  // Group events by week
  const eventsByWeek = gameState.gameLog.reduce((acc, event) => {
    if (!acc[event.week]) {
      acc[event.week] = [];
    }
    acc[event.week].push(event);
    return acc;
  }, {} as Record<number, typeof gameState.gameLog>);
  
  const weeks = Object.keys(eventsByWeek).map(Number).sort((a, b) => a - b);
  
  // Helper function to get the appropriate icon for an event
  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'competition_win':
      case 'hoh_win':
        return <Trophy className="h-4 w-4" />;
      case 'pov_win':
        return <Award className="h-4 w-4" />;
      case 'eviction':
        return <UserX className="h-4 w-4" />;
      case 'nomination':
        return <User className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  // Helper function to format timestamp
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="h-5 w-5" /> Season Timeline
      </h2>
      
      {weeks.length > 0 ? (
        weeks.map(week => (
          <div key={week} className="space-y-3">
            <h3 className="text-xl font-semibold">
              Week {week}
            </h3>
            
            <Timeline>
              {eventsByWeek[week]
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((event, index) => (
                  <TimelineItem key={`${event.timestamp}-${index}`}>
                    {index < eventsByWeek[week].length - 1 && <TimelineConnector />}
                    <TimelineHeader>
                      <TimelineIcon className={
                        event.type.toLowerCase().includes('eviction') ? 'bg-red-100 text-red-600' :
                        event.type.toLowerCase().includes('win') ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }>
                        {getEventIcon(event.type)}
                      </TimelineIcon>
                      <div className="flex justify-between items-center w-full">
                        <span className="font-medium">{event.description}</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatTime(event.timestamp)}
                        </Badge>
                      </div>
                    </TimelineHeader>
                    
                    <TimelineBody>
                      <div className="text-sm text-muted-foreground">
                        <Badge variant="secondary" className="mr-2">
                          Phase: {event.phase}
                        </Badge>
                        {event.involvedHouseguests.length > 0 && (
                          <Badge variant="outline">
                            {event.involvedHouseguests.length} houseguest{event.involvedHouseguests.length !== 1 ? 's' : ''} involved
                          </Badge>
                        )}
                      </div>
                    </TimelineBody>
                  </TimelineItem>
                ))}
            </Timeline>
          </div>
        ))
      ) : (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">No events recorded for this season.</p>
        </div>
      )}
    </div>
  );
};

export default SeasonRecap;
