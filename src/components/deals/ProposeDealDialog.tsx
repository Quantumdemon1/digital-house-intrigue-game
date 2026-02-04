/**
 * @file src/components/deals/ProposeDealDialog.tsx
 * @description Dialog for player to propose deals to NPCs
 */

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGame } from '@/contexts/GameContext';
import { DealType, DEAL_TYPE_INFO, getDealTypeIcon, getDealTypeTitle } from '@/models/deal';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Handshake, Target, Shield, Vote, Trophy, MessageSquare, Users, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProposeDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  params: {
    targetId: string;
    targetName: string;
  };
}

const DEAL_OPTIONS: { type: DealType; requiresTarget?: boolean }[] = [
  { type: 'target_agreement', requiresTarget: true },
  { type: 'safety_agreement' },
  { type: 'vote_together' },
  { type: 'veto_use' },
  { type: 'information_sharing' },
  { type: 'final_two' },
  { type: 'partnership' },
  { type: 'alliance_invite' },
];

const ProposeDealDialog: React.FC<ProposeDealDialogProps> = ({
  open,
  onOpenChange,
  params
}) => {
  const { game, dispatch } = useGame();
  const [selectedDealType, setSelectedDealType] = useState<DealType>('safety_agreement');
  const [targetHouseguestId, setTargetHouseguestId] = useState<string>('');
  const [status, setStatus] = useState<'selecting' | 'proposing' | 'response' | 'counter_offer'>('selecting');
  const [npcResponse, setNpcResponse] = useState<{ accepted: boolean; reasoning: string } | null>(null);
  const [counterOffer, setCounterOffer] = useState<{
    counterType: DealType;
    reasoning: string;
  } | null>(null);

  const targetNPC = game?.getHouseguestById(params.targetId);
  const player = game?.getHouseguestById(game?.houseguests.find(h => h.isPlayer)?.id || '');
  
  const relationship = game?.relationshipSystem?.getRelationship(
    player?.id || '', 
    params.targetId
  ) ?? 0;

  // Get potential targets for target agreements (everyone except player and the deal partner)
  const potentialTargets = useMemo(() => {
    if (!game) return [];
    return game.getActiveHouseguests().filter(h => 
      !h.isPlayer && h.id !== params.targetId
    );
  }, [game, params.targetId]);

  const selectedOption = DEAL_OPTIONS.find(o => o.type === selectedDealType);
  const needsTarget = selectedOption?.requiresTarget;

  const getTrustImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleProposeDeal = () => {
    if (needsTarget && !targetHouseguestId) {
      toast.error('Please select a target for this deal');
      return;
    }

    setStatus('proposing');

    // Evaluate if NPC would accept
    const evaluation = game?.dealSystem?.evaluatePlayerDeal(
      targetNPC!,
      player!,
      selectedDealType,
      needsTarget ? { targetHouseguestId } : undefined
    );

    // Simulate thinking time
    setTimeout(() => {
      if (evaluation?.wouldAccept) {
        // Create the deal
        game?.dealSystem?.createDeal(
          player!.id,
          params.targetId,
          selectedDealType,
          needsTarget ? { targetHouseguestId } : undefined
        );
        
        setNpcResponse({ accepted: true, reasoning: evaluation.reasoning });
        toast.success(`${params.targetName} accepted your deal!`);
        setStatus('response');
      } else {
        // Check for counter-offer
        const counter = game?.dealSystem?.generateCounterOffer(
          targetNPC!,
          player!,
          selectedDealType,
          needsTarget ? { targetHouseguestId } : undefined
        );

        if (counter) {
          setCounterOffer({
            counterType: counter.counterType,
            reasoning: counter.reasoning,
          });
          setStatus('counter_offer');
        } else {
          setNpcResponse({ 
            accepted: false, 
            reasoning: evaluation?.reasoning || "I don't think that's a good idea." 
          });
          toast.error(`${params.targetName} declined your deal`);
          setStatus('response');
        }
      }
    }, 1500);
  };

  const handleAcceptCounter = () => {
    if (!counterOffer) return;

    // Create the counter-offer deal
    game?.dealSystem?.createDeal(
      player!.id,
      params.targetId,
      counterOffer.counterType,
      needsTarget ? { targetHouseguestId } : undefined
    );

    toast.success(`You and ${params.targetName} agreed on ${DEAL_TYPE_INFO[counterOffer.counterType].title}!`);
    
    // Close after showing success
    setTimeout(() => {
      onOpenChange(false);
      resetState();
    }, 1500);
  };

  const handleDeclineCounter = () => {
    setNpcResponse({
      accepted: false,
      reasoning: "We couldn't come to an agreement."
    });
    setStatus('response');
    
    setTimeout(() => {
      onOpenChange(false);
      resetState();
    }, 2000);
  };

  const resetState = () => {
    setStatus('selecting');
    setNpcResponse(null);
    setCounterOffer(null);
    setTargetHouseguestId('');
  };

  // Close dialog cleanup
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 max-w-lg max-h-[90vh] overflow-y-auto">
        <Card className="shadow-lg border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              {targetNPC && (
                <StatusAvatar
                  name={targetNPC.name}
                  avatarUrl={targetNPC.avatarUrl}
                  size="md"
                />
              )}
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Handshake className="text-amber-600" size={20} />
                  Propose a Deal
                </CardTitle>
                <CardDescription>
                  Make a deal with {params.targetName} (Relationship: {relationship >= 0 ? '+' : ''}{relationship})
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 pb-4">
            {status === 'selecting' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">What kind of deal do you want to propose?</h3>
                  <RadioGroup 
                    value={selectedDealType} 
                    onValueChange={(v) => setSelectedDealType(v as DealType)}
                    className="space-y-2"
                  >
                    {DEAL_OPTIONS.map(option => {
                      const info = DEAL_TYPE_INFO[option.type];
                      return (
                        <div key={option.type} className={cn(
                          "flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors",
                          selectedDealType === option.type ? "border-amber-400 bg-amber-50" : "hover:bg-muted/50"
                        )}>
                          <RadioGroupItem value={option.type} id={`deal-${option.type}`} />
                          <Label htmlFor={`deal-${option.type}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{info.icon}</span>
                              <span className="font-medium">{info.title}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{info.description}</div>
                            <div className={cn(
                              "text-xs font-semibold mt-1",
                              getTrustImpactColor(info.defaultTrustImpact)
                            )}>
                              {info.defaultTrustImpact.toUpperCase()} STAKES
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Target selection for target agreements */}
                {needsTarget && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-sm font-medium">Who should you target together?</Label>
                    <Select value={targetHouseguestId} onValueChange={setTargetHouseguestId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target..." />
                      </SelectTrigger>
                      <SelectContent>
                        {potentialTargets.map(hg => (
                          <SelectItem key={hg.id} value={hg.id}>
                            <div className="flex items-center gap-2">
                              <StatusAvatar name={hg.name} avatarUrl={hg.avatarUrl} size="sm" />
                              <span>{hg.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="text-sm text-muted-foreground border-t pt-3">
                  <p className="mb-1">
                    <span className="font-semibold">Note:</span> {params.targetName} may accept or decline based on:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-0.5">
                    <li>Your current relationship</li>
                    <li>Their personality traits</li>
                    <li>Your trust reputation</li>
                    <li>Strategic value of the deal</li>
                  </ul>
                </div>
                
                <Button
                  onClick={handleProposeDeal}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={needsTarget && !targetHouseguestId}
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  Propose This Deal
                </Button>
              </div>
            )}

            {status === 'proposing' && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600" />
                <p className="text-muted-foreground">
                  {params.targetName} is considering your offer...
                </p>
              </div>
            )}

            {status === 'response' && npcResponse && (
              <div className="text-center py-6 space-y-4">
                {npcResponse.accepted ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <Handshake className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-700">Deal Accepted!</h3>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                      <Handshake className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-700">Deal Declined</h3>
                  </>
                )}
                <p className="text-muted-foreground italic">
                  "{npcResponse.reasoning}"
                </p>
              </div>
            )}

            {status === 'counter_offer' && counterOffer && (
              <div className="py-4 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                    <Handshake className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-700">Counter-Offer!</h3>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 italic mb-3">
                    "{counterOffer.reasoning}"
                  </p>
                  
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-amber-200">
                    <span className="text-xl">{DEAL_TYPE_INFO[counterOffer.counterType].icon}</span>
                    <div>
                      <span className="font-medium">{DEAL_TYPE_INFO[counterOffer.counterType].title}</span>
                      <p className="text-xs text-muted-foreground">
                        {DEAL_TYPE_INFO[counterOffer.counterType].description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleAcceptCounter}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Handshake className="h-4 w-4 mr-2" />
                    Accept Counter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeclineCounter}
                    className="flex-1"
                  >
                    Walk Away
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ProposeDealDialog;
