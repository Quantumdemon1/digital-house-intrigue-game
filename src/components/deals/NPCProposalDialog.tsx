/**
 * @file src/components/deals/NPCProposalDialog.tsx
 * @description Dialog for NPC deal proposals to the player
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NPCProposal, getDealTypeIcon, getDealTypeTitle } from '@/models/deal';
import { useGame } from '@/contexts/GameContext';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { cn } from '@/lib/utils';
import { Handshake, ThumbsDown, ThumbsUp, AlertTriangle } from 'lucide-react';

interface NPCProposalDialogProps {
  proposal: NPCProposal | null;
  onRespond: (proposalId: string, response: 'accepted' | 'declined') => void;
  onClose: () => void;
}

const NPCProposalDialog: React.FC<NPCProposalDialogProps> = ({
  proposal,
  onRespond,
  onClose
}) => {
  const { game } = useGame();

  if (!proposal) return null;

  const npc = game?.getHouseguestById(proposal.fromNPCId);
  const relationship = game?.relationshipSystem?.getRelationship(
    proposal.toPlayerId, 
    proposal.fromNPCId
  ) ?? 0;
  const target = proposal.deal.context?.targetHouseguestId 
    ? game?.getHouseguestById(proposal.deal.context.targetHouseguestId) 
    : null;

  const getRelationshipLabel = () => {
    if (relationship >= 50) return { label: 'Close Ally', color: 'text-green-600' };
    if (relationship >= 25) return { label: 'Friendly', color: 'text-green-500' };
    if (relationship >= 0) return { label: 'Neutral', color: 'text-gray-500' };
    if (relationship >= -25) return { label: 'Cool', color: 'text-orange-500' };
    return { label: 'Hostile', color: 'text-red-500' };
  };

  const getTrustImpactColor = () => {
    switch (proposal.deal.trustImpact) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const handleAccept = () => {
    onRespond(proposal.id, 'accepted');
    onClose();
  };

  const handleDecline = () => {
    onRespond(proposal.id, 'declined');
    onClose();
  };

  const relInfo = getRelationshipLabel();

  return (
    <Dialog open={!!proposal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 max-w-lg overflow-hidden">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
              <div className="flex items-center gap-4">
                <StatusAvatar
                  name={proposal.fromNPCName}
                  avatarUrl={npc?.avatarUrl}
                  size="lg"
                />
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Handshake className="h-5 w-5" />
                    {proposal.fromNPCName} wants to make a deal!
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Your relationship: <span className={cn('font-semibold', relInfo.color.replace('text-', 'text-white/'))}>{relInfo.label}</span> ({relationship >= 0 ? '+' : ''}{relationship})
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* NPC's reasoning */}
              <div className="bg-muted/50 rounded-lg p-4 italic">
                <p className="text-foreground">
                  "{proposal.reasoning}"
                </p>
              </div>

              {/* Deal details */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getDealTypeIcon(proposal.deal.type)}</span>
                  <div>
                    <h3 className="font-bold text-lg">{getDealTypeTitle(proposal.deal.type)}</h3>
                    <p className="text-sm text-muted-foreground">{proposal.deal.description}</p>
                  </div>
                </div>

                {/* Target display */}
                {target && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md border border-red-200">
                    <StatusAvatar 
                      name={target.name} 
                      avatarUrl={target.avatarUrl}
                      size="sm" 
                    />
                    <div>
                      <div className="text-xs text-red-600 font-medium">TARGET</div>
                      <div className="text-sm font-semibold">{target.name}</div>
                    </div>
                  </div>
                )}

                {/* Trust impact warning */}
                <div className={cn(
                  'flex items-center gap-2 p-2 rounded-md border text-sm',
                  getTrustImpactColor()
                )}>
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    <strong>{proposal.deal.trustImpact.toUpperCase()}</strong> stakes - 
                    {proposal.deal.trustImpact === 'critical' && ' Breaking this will severely damage trust'}
                    {proposal.deal.trustImpact === 'high' && ' Breaking this will significantly damage trust'}
                    {proposal.deal.trustImpact === 'medium' && ' Breaking this will hurt your relationship'}
                    {proposal.deal.trustImpact === 'low' && ' Minor impact if broken'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDecline}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleAccept}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Accept Deal
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Declining may slightly affect your relationship with {proposal.fromNPCName}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default NPCProposalDialog;
