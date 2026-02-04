/**
 * @file src/components/dialogs/ConversationTopicDialog.tsx
 * @description Dialog for selecting conversation topics when talking to houseguests
 */

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { 
  ConversationTopicType, 
  CONVERSATION_TOPICS, 
  getRiskColor, 
  getRiskLabel 
} from '@/models/conversation-topic';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { cn } from '@/lib/utils';

interface ConversationTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetName: string;
  onTopicSelected: (topic: ConversationTopicType, ventTargetId?: string) => void;
}

const ConversationTopicDialog: React.FC<ConversationTopicDialogProps> = ({
  open,
  onOpenChange,
  targetId,
  targetName,
  onTopicSelected,
}) => {
  const { gameState, getRelationship } = useGame();
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopicType>('small_talk');
  const [ventTargetId, setVentTargetId] = useState<string>('');
  
  const player = gameState.houseguests.find(h => h.isPlayer);
  const target = gameState.houseguests.find(h => h.id === targetId);
  const relationship = player ? getRelationship(player.id, targetId) : 0;
  
  // Get potential vent targets (everyone except player and conversation partner)
  const ventTargets = useMemo(() => {
    return gameState.houseguests.filter(h => 
      h.status === 'Active' && 
      !h.isPlayer && 
      h.id !== targetId
    );
  }, [gameState.houseguests, targetId]);
  
  const selectedTopicInfo = CONVERSATION_TOPICS[selectedTopic];
  const needsVentTarget = selectedTopic === 'vent_about';
  
  const handleConfirm = () => {
    if (needsVentTarget && !ventTargetId) return;
    onTopicSelected(selectedTopic, needsVentTarget ? ventTargetId : undefined);
    onOpenChange(false);
    // Reset state
    setSelectedTopic('small_talk');
    setVentTargetId('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-bb-blue" />
            Talk to {targetName}
          </DialogTitle>
          <DialogDescription>
            Choose what to talk about. Different topics have different risks and rewards.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Target Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {target && (
              <StatusAvatar
                name={target.name}
                avatarUrl={target.avatarUrl}
                size="sm"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{targetName}</p>
              <p className="text-xs text-muted-foreground">
                Relationship: <span className={relationship >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {relationship >= 0 ? '+' : ''}{relationship}
                </span>
              </p>
            </div>
          </div>
          
          {/* Topic Selection */}
          <div className="space-y-3">
            {Object.values(CONVERSATION_TOPICS).map(topic => (
              <button
                key={topic.type}
                onClick={() => setSelectedTopic(topic.type)}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-all',
                  selectedTopic === topic.type
                    ? 'border-bb-blue bg-bb-blue/5 ring-1 ring-bb-blue'
                    : 'border-border hover:border-bb-blue/50 hover:bg-muted/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{topic.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{topic.label}</span>
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full',
                        getRiskColor(topic.risk)
                      )}>
                        {getRiskLabel(topic.risk)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {topic.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-green-600">
                        +{topic.baseReward.min}-{topic.baseReward.max}
                      </span>
                      {topic.failurePenalty < 0 && (
                        <>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-red-600">{topic.failurePenalty}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Vent Target Selection */}
          {needsVentTarget && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Who do you want to vent about?
              </Label>
              <Select value={ventTargetId} onValueChange={setVentTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select houseguest..." />
                </SelectTrigger>
                <SelectContent>
                  {ventTargets.map(hg => (
                    <SelectItem key={hg.id} value={hg.id}>
                      <div className="flex items-center gap-2">
                        <StatusAvatar name={hg.name} avatarUrl={hg.avatarUrl} size="sm" />
                        <span>{hg.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-amber-600">
                ⚠️ If {targetName} is allied with this person, it could backfire!
              </p>
            </div>
          )}
          
          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={needsVentTarget && !ventTargetId}
            className="w-full"
          >
            <span>{selectedTopicInfo.icon}</span>
            <span className="ml-2">Start Conversation</span>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationTopicDialog;
