
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, Handshake, AlertCircle, Heart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { NPCActivityItem } from '@/systems/ai/npc-social-behavior';

interface NPCActivityFeedProps {
  activities: NPCActivityItem[];
  maxItems?: number;
}

const getActivityIcon = (actionType: NPCActivityItem['actionType']) => {
  switch (actionType) {
    case 'talk':
      return <MessageCircle className="h-4 w-4" />;
    case 'alliance_propose':
      return <Users className="h-4 w-4" />;
    case 'promise':
      return <Handshake className="h-4 w-4" />;
    case 'alliance_meeting':
      return <Heart className="h-4 w-4" />;
    case 'spread_info':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <MessageCircle className="h-4 w-4" />;
  }
};

const getActivityColor = (actionType: NPCActivityItem['actionType']) => {
  switch (actionType) {
    case 'talk':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'alliance_propose':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'promise':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'alliance_meeting':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
    case 'spread_info':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    default:
      return 'bg-muted/50 text-muted-foreground border-border';
  }
};

const getActivityLabel = (actionType: NPCActivityItem['actionType']) => {
  switch (actionType) {
    case 'talk':
      return 'Conversation';
    case 'alliance_propose':
      return 'New Alliance';
    case 'promise':
      return 'Promise Made';
    case 'alliance_meeting':
      return 'Alliance Meeting';
    case 'spread_info':
      return 'Gossip';
    default:
      return 'Activity';
  }
};

const NPCActivityFeed: React.FC<NPCActivityFeedProps> = ({ 
  activities, 
  maxItems = 10 
}) => {
  const displayedActivities = activities.slice(-maxItems).reverse();

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border bg-card/50 p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <Users className="h-4 w-4" />
          House Activity
        </h3>
        <p className="text-sm text-muted-foreground/70 italic">
          Houseguests are still settling in...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card/50 p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" />
        House Activity
        <Badge variant="secondary" className="ml-auto">
          {activities.length} events
        </Badge>
      </h3>
      
      <ScrollArea className="h-[200px] pr-2">
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {displayedActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`rounded-md border p-3 ${getActivityColor(activity.actionType)}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.actionType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs py-0 h-5"
                      >
                        {getActivityLabel(activity.actionType)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {activity.action}
                    </p>
                    {activity.reasoning && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{activity.reasoning}"
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};

export default NPCActivityFeed;
