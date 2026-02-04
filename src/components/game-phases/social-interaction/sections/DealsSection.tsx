
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Handshake, Heart, Shield, User } from 'lucide-react';
import { SocialActionChoice } from '@/game-states/GameStateBase';
import { useGame } from '@/contexts/GameContext';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DealsSectionProps {
  actions: SocialActionChoice[];
  onActionClick: (actionId: string, params?: any) => void;
}

const DealsSection: React.FC<DealsSectionProps> = ({ actions, onActionClick }) => {
  const { gameState, getRelationship } = useGame();
  const player = gameState.houseguests.find(h => h.isPlayer);
  
  // Get all active deals for the player
  const playerDeals = gameState.deals?.filter(d => 
    d.status === 'active' && 
    (d.proposerId === player?.id || d.recipientId === player?.id)
  ) || [];
  
  // Group actions by target houseguest
  const actionsByTarget = actions.reduce((grouped, action) => {
    const targetId = action.parameters?.targetId;
    if (!targetId) return grouped;
    
    if (!grouped[targetId]) {
      grouped[targetId] = [];
    }
    grouped[targetId].push(action);
    return grouped;
  }, {} as Record<string, SocialActionChoice[]>);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Handshake className="h-4 w-4 text-amber-600" />
        </div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Deals & Agreements
        </h3>
      </div>
      
      {/* Active Deals Summary */}
      {playerDeals.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
            Active Deals: {playerDeals.length}
          </div>
          <div className="space-y-1">
            {playerDeals.slice(0, 3).map(deal => {
              const partnerId = deal.proposerId === player?.id ? deal.recipientId : deal.proposerId;
              const partner = gameState.houseguests.find(h => h.id === partnerId);
              return (
                <div key={deal.id} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-base">{getDealIcon(deal.type)}</span>
                  <span>{deal.title}</span>
                  {partner && <span className="text-muted-foreground">with {partner.name}</span>}
                </div>
              );
            })}
            {playerDeals.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{playerDeals.length - 3} more deals...
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Deal Proposal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(actionsByTarget).map(([targetId, targetActions]) => {
          const target = gameState.houseguests.find(h => h.id === targetId);
          if (!target) return null;
          
          const relationship = player ? getRelationship(player.id, targetId) : 0;
          const existingDeals = playerDeals.filter(d => 
            d.recipientId === targetId || d.proposerId === targetId
          );
          const trustScore = calculateSimpleTrust(existingDeals.length, relationship);
          
          return (
            <DealCard 
              key={targetId}
              target={target}
              relationship={relationship}
              trustScore={trustScore}
              existingDeals={existingDeals.length}
              onProposeDeal={() => {
                const action = targetActions[0];
                if (action) {
                  onActionClick(action.actionId, action.parameters);
                }
              }}
            />
          );
        })}
      </div>
      
      {Object.keys(actionsByTarget).length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No houseguests available for deals right now.
        </div>
      )}
    </div>
  );
};

interface DealCardProps {
  target: any;
  relationship: number;
  trustScore: number;
  existingDeals: number;
  onProposeDeal: () => void;
}

const DealCard: React.FC<DealCardProps> = ({
  target,
  relationship,
  trustScore,
  existingDeals,
  onProposeDeal
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:border-amber-500/30 transition-colors">
      {/* Target Header */}
      <div className="flex items-center gap-3 mb-3">
        <StatusAvatar
          name={target.name}
          imageUrl={target.imageUrl}
          size="sm"
          showBadge={false}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{target.name}</h4>
          {target.occupation && (
            <p className="text-xs text-muted-foreground truncate">{target.occupation}</p>
          )}
        </div>
        {existingDeals > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {existingDeals} deal{existingDeals > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      {/* Relationship & Trust Indicators */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <span className={cn(
          "flex items-center gap-1",
          relationship > 30 ? "text-green-600" : 
          relationship > 0 ? "text-blue-500" :
          relationship > -20 ? "text-muted-foreground" : "text-red-500"
        )}>
          <Heart className="h-3 w-3" />
          {relationship >= 0 ? '+' : ''}{relationship}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Shield className="h-3 w-3" />
          Trust: {trustScore}%
        </span>
      </div>
      
      {/* Propose Deal Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-800"
        onClick={onProposeDeal}
      >
        <Handshake className="h-4 w-4 mr-2" />
        Propose a Deal
      </Button>
    </div>
  );
};

// Helper functions
function getDealIcon(type: string): string {
  const icons: Record<string, string> = {
    target_agreement: '🎯',
    safety_agreement: '🛡️',
    vote_together: '🗳️',
    veto_use: '🏆',
    information_sharing: '💬',
    final_two: '🤝',
    partnership: '👥',
    alliance_invite: '⭐'
  };
  return icons[type] || '📋';
}

function calculateSimpleTrust(dealCount: number, relationship: number): number {
  // Simple trust calculation based on existing deals and relationship
  let trust = 50; // Baseline
  trust += dealCount * 10; // Each active deal adds trust
  trust += Math.floor(relationship / 5); // Relationship contributes
  return Math.max(0, Math.min(100, trust));
}

export default DealsSection;
