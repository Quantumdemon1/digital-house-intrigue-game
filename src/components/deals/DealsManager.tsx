/**
 * @file src/components/deals/DealsManager.tsx
 * @description Compact deals display for the sidebar
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/contexts/GameContext';
import DealsPanel from './DealsPanel';
import DealCard from './DealCard';
import { Handshake, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { cardVariants } from '@/lib/motion-variants';

const DealsManager: React.FC = () => {
  const { game, gameState } = useGame();
  const [showDealsPanel, setShowDealsPanel] = useState(false);
  
  const playerId = game?.houseguests.find(h => h.isPlayer)?.id || '';
  
  // Get active deals for player
  const activeDeals = useMemo(() => {
    const deals = game?.deals || [];
    return deals.filter(d => 
      d.status === 'active' && 
      (d.proposerId === playerId || d.recipientId === playerId)
    );
  }, [game?.deals, playerId]);
  
  // Get pending proposals
  const pendingProposals = useMemo(() => {
    return game?.pendingNPCProposals?.filter(p => p.response === 'pending') || [];
  }, [game?.pendingNPCProposals]);
  
  // Get alliances
  const playerAlliances = useMemo(() => {
    if (!game?.allianceSystem || !playerId) return [];
    return game.allianceSystem.getAlliancesForHouseguest(playerId);
  }, [game?.allianceSystem, playerId]);
  
  const totalCount = activeDeals.length + pendingProposals.length;
  
  return (
    <>
      <motion.div variants={cardVariants}>
        <Card className="game-card overflow-hidden backdrop-blur-sm bg-card/95">
          <CardHeader className="pb-2 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10 border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <motion.div 
                  className="p-1.5 rounded-lg bg-amber-500/10"
                  whileHover={{ scale: 1.1 }}
                >
                  <Handshake className="h-4 w-4 text-amber-500" />
                </motion.div>
                Deals & Alliances
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={() => setShowDealsPanel(true)}
              >
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-3 pb-3">
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {/* Pending Proposals Alert */}
                {pendingProposals.length > 0 && (
                  <motion.div 
                    className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {pendingProposals.length} pending proposal{pendingProposals.length > 1 ? 's' : ''}
                    </span>
                  </motion.div>
                )}
                
                {/* Active Deals */}
                <AnimatePresence>
                  {activeDeals.slice(0, 3).map((deal, index) => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DealCard deal={deal} compact />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {activeDeals.length > 3 && (
                  <div className="text-xs text-center text-muted-foreground py-1">
                    +{activeDeals.length - 3} more deal{activeDeals.length - 3 > 1 ? 's' : ''}
                  </div>
                )}
                
                {/* Alliances Summary */}
                {playerAlliances.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Alliances</div>
                    {playerAlliances.slice(0, 2).map((alliance: any) => (
                      <div 
                        key={alliance.id} 
                        className="flex items-center gap-2 p-1.5 rounded bg-blue-50/50 border border-blue-100 mb-1"
                      >
                        <Badge variant="outline" className="text-[10px] h-4">
                          {alliance.members.length}
                        </Badge>
                        <span className="text-xs font-medium truncate">{alliance.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Empty State */}
                {totalCount === 0 && playerAlliances.length === 0 && (
                  <motion.div 
                    className="text-center py-6 text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Handshake className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No active deals</p>
                    <p className="text-[10px]">Make deals during Social Phase</p>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Full Deals Panel */}
      <DealsPanel 
        open={showDealsPanel} 
        onOpenChange={setShowDealsPanel} 
      />
    </>
  );
};

export default DealsManager;
