/**
 * @file src/components/deals/DealsPanel.tsx
 * @description Main deals overview panel showing active deals, proposals, and alliances
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import DealCard from './DealCard';
import { Handshake, Clock, CheckCircle, XCircle, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DealsPanel: React.FC<DealsPanelProps> = ({ open, onOpenChange }) => {
  const { game } = useGame();
  const [activeTab, setActiveTab] = useState('active');

  const player = game?.houseguests.find(h => h.isPlayer);
  const playerId = player?.id || '';

  // Get deals organized by status
  const { activeDeals, fulfilledDeals, brokenDeals, allDeals } = useMemo(() => {
    const deals = game?.deals || [];
    const playerDeals = deals.filter(d => 
      d.proposerId === playerId || d.recipientId === playerId
    );

    return {
      activeDeals: playerDeals.filter(d => d.status === 'active'),
      fulfilledDeals: playerDeals.filter(d => d.status === 'fulfilled'),
      brokenDeals: playerDeals.filter(d => d.status === 'broken'),
      allDeals: playerDeals
    };
  }, [game?.deals, playerId]);

  // Get pending NPC proposals
  const pendingProposals = game?.pendingNPCProposals?.filter(p => 
    p.response === 'pending'
  ) || [];

  // Get alliances
  const playerAlliances = useMemo(() => {
    if (!game?.allianceSystem || !playerId) return [];
    return game.allianceSystem.getAlliancesForHouseguest(playerId);
  }, [game?.allianceSystem, playerId]);

  // Calculate trust score
  const trustScore = game?.dealSystem?.calculateTrustScore(playerId) ?? 50;
  const trustReputation = game?.dealSystem?.getTrustReputation(playerId) ?? 'neutral';

  const getTrustColor = () => {
    if (trustScore >= 65) return 'text-green-600';
    if (trustScore <= 35) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Handshake className="h-5 w-5 text-amber-600" />
            Deals & Alliances
          </DialogTitle>
          
          {/* Trust Score */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Your Trust Score:</span>
              <Badge variant="outline" className={cn('font-bold', getTrustColor())}>
                {trustScore}/100
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {trustReputation}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="active" className="flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Active ({activeDeals.length})
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Proposals ({pendingProposals.length})
            </TabsTrigger>
            <TabsTrigger value="alliances" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Alliances ({playerAlliances.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              History ({fulfilledDeals.length + brokenDeals.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 pb-6">
            <TabsContent value="active" className="mt-4 space-y-3">
              {activeDeals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Handshake className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No active deals</p>
                  <p className="text-sm">Make deals during the Social Phase!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {activeDeals.map(deal => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <DealCard deal={deal} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </TabsContent>

            <TabsContent value="proposals" className="mt-4 space-y-3">
              {pendingProposals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No pending proposals</p>
                  <p className="text-sm">NPCs may propose deals during Social Phases</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingProposals.map(proposal => {
                    const npc = game?.getHouseguestById(proposal.fromNPCId);
                    return (
                      <div key={proposal.id} className="border rounded-lg p-4 bg-amber-50/50">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{proposal.deal.type}</span>
                          <div>
                            <h4 className="font-semibold">{proposal.fromNPCName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Wants to make a {proposal.deal.title}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm italic">"{proposal.reasoning}"</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="alliances" className="mt-4 space-y-3">
              {playerAlliances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No alliances yet</p>
                  <p className="text-sm">Form partnerships that can evolve into alliances!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {playerAlliances.map((alliance: any) => (
                    <div key={alliance.id} className="border rounded-lg p-4 bg-blue-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          {alliance.name}
                        </h4>
                        <Badge variant="outline">
                          {alliance.members.length} members
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {alliance.members.map((memberId: string) => {
                          const member = game?.getHouseguestById(memberId);
                          return member ? (
                            <Badge key={memberId} variant="secondary" className="text-xs">
                              {member.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      {alliance.foundedWeek && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Founded Week {alliance.foundedWeek}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-3">
              {fulfilledDeals.length + brokenDeals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No deal history yet</p>
                  <p className="text-sm">Your fulfilled and broken deals will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fulfilledDeals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Fulfilled Deals ({fulfilledDeals.length})
                      </h4>
                      <div className="space-y-2">
                        {fulfilledDeals.map(deal => (
                          <DealCard key={deal.id} deal={deal} compact />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {brokenDeals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Broken Deals ({brokenDeals.length})
                      </h4>
                      <div className="space-y-2">
                        {brokenDeals.map(deal => (
                          <DealCard key={deal.id} deal={deal} compact />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DealsPanel;
