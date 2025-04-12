
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Target, TrendingUp, Vote, Users, MessageSquare } from 'lucide-react';

interface StrategicDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  params: {
    targetId: string;
    targetName: string;
    discussionType?: string;
  };
}

const StrategicDiscussionDialog: React.FC<StrategicDiscussionDialogProps> = ({
  open,
  onOpenChange,
  params
}) => {
  const { game, dispatch, getActiveHouseguests } = useGame();
  const [selectedDiscussionType, setSelectedDiscussionType] = useState(params.discussionType || 'general_strategy');
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [status, setStatus] = useState<'selecting' | 'processing'>('selecting');

  // If this is a rumor spread, show houseguest selection
  const isRumorSpread = selectedDiscussionType === 'spread_rumor';
  const possibleTargets = getActiveHouseguests().filter(hg => 
    hg.id !== params.targetId && !hg.isPlayer
  );

  const handleStartDiscussion = () => {
    setStatus('processing');
    
    const discussionParams = {
      ...params,
      discussionType: selectedDiscussionType
    };
    
    // Add target for rumors if needed
    if (isRumorSpread && selectedTargetId) {
      // Use spread operator to add these properties properly
      const enhancedParams = {
        ...discussionParams,
        rumorTargetId: selectedTargetId,
        rumorTargetName: game?.getHouseguestById(selectedTargetId)?.name
      };
      
      // Dispatch the action with enhanced params
      dispatch({
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'strategic_discussion',
          params: enhancedParams
        }
      });
    } else {
      // Regular dispatch for non-rumor discussions
      dispatch({
        type: 'PLAYER_ACTION',
        payload: {
          actionId: 'strategic_discussion',
          params: discussionParams
        }
      });
    }
    
    // Close the dialog after a short delay
    setTimeout(() => {
      onOpenChange(false);
    }, 500);
  };

  const getDiscussionTypeIcon = (type: string) => {
    switch (type) {
      case 'suggest_target': return <Target size={16} />;
      case 'general_strategy': return <TrendingUp size={16} />;
      case 'vote_intentions': return <Vote size={16} />;
      case 'final_two_deal': return <Users size={16} />;
      case 'spread_rumor': return <MessageSquare size={16} />;
      default: return <TrendingUp size={16} />;
    }
  };

  const getDiscussionTypeDescription = (type: string) => {
    switch (type) {
      case 'suggest_target':
        return `Suggest someone that ${params.targetName} should target.`;
      case 'general_strategy':
        return `Discuss general game strategy with ${params.targetName}.`;
      case 'vote_intentions':
        return `Ask ${params.targetName} about their voting plans.`;
      case 'final_two_deal':
        return `Propose a final 2 deal with ${params.targetName}.`;
      case 'spread_rumor':
        return `Spread a rumor about someone to ${params.targetName}.`;
      default:
        return 'Discuss strategy.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="text-blue-600" size={18} />
              Strategic Discussion
            </CardTitle>
            <CardDescription>
              Discuss strategy with {params.targetName}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4 pb-4">
            {status === 'selecting' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">What do you want to discuss?</h3>
                  <div className="grid gap-2">
                    {['general_strategy', 'suggest_target', 'vote_intentions', 'final_two_deal', 'spread_rumor'].map(type => (
                      <Button
                        key={type}
                        variant={selectedDiscussionType === type ? "default" : "outline"}
                        className="justify-start text-left"
                        onClick={() => setSelectedDiscussionType(type)}
                      >
                        <span className="mr-2">{getDiscussionTypeIcon(type)}</span>
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {getDiscussionTypeDescription(selectedDiscussionType)}
                  </p>
                </div>
                
                {isRumorSpread && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Who is the rumor about?</h3>
                    <div className="grid gap-2">
                      {possibleTargets.map(target => (
                        <Button
                          key={target.id}
                          variant={selectedTargetId === target.id ? "default" : "outline"}
                          className="justify-start text-left"
                          onClick={() => setSelectedTargetId(target.id)}
                        >
                          {target.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button
                    onClick={handleStartDiscussion}
                    disabled={isRumorSpread && !selectedTargetId}
                    className="w-full"
                  >
                    Start Discussion
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p>Starting discussion with {params.targetName}...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default StrategicDiscussionDialog;
