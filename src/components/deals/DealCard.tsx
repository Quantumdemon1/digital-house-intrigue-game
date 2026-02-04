/**
 * @file src/components/deals/DealCard.tsx
 * @description Individual deal display card with relationship and trust indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Deal, getDealTypeIcon, getDealTypeTitle } from '@/models/deal';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGame } from '@/contexts/GameContext';
import { StatusAvatar } from '@/components/ui/status-avatar';
import { CheckCircle2, XCircle, Clock, AlertCircle, Heart, Shield } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  showPartner?: boolean;
  compact?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, showPartner = true, compact = false }) => {
  const { game } = useGame();
  
  const player = game?.getHouseguestById(game.houseguests.find(h => h.isPlayer)?.id || '');
  const isProposer = deal.proposerId === player?.id;
  const partnerId = isProposer ? deal.recipientId : deal.proposerId;
  const partner = game?.getHouseguestById(partnerId);
  const target = deal.context?.targetHouseguestId 
    ? game?.getHouseguestById(deal.context.targetHouseguestId) 
    : null;
  
  // Get relationship and trust scores
  const relationship = game?.relationshipSystem?.getRelationship(player?.id || '', partnerId) ?? 0;
  const trustScore = game?.dealSystem?.calculateTrustScore(partnerId) ?? 50;

  const getStatusIcon = () => {
    switch (deal.status) {
      case 'fulfilled':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'broken':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'active':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (deal.status) {
      case 'fulfilled':
        return 'border-green-200 bg-green-50/50';
      case 'broken':
        return 'border-red-200 bg-red-50/50';
      case 'expired':
        return 'border-muted bg-muted/20';
      case 'active':
        return 'border-blue-200 bg-blue-50/50';
      default:
        return 'border-border';
    }
  };

  const getTrustImpactColor = () => {
    switch (deal.trustImpact) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
    }
  };

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 rounded-lg border',
        getStatusColor()
      )}>
        <span className="text-lg">{getDealTypeIcon(deal.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{getDealTypeTitle(deal.type)}</div>
          {partner && (
            <div className="text-xs text-muted-foreground">with {partner.name}</div>
          )}
        </div>
        {getStatusIcon()}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border p-4 space-y-3',
        getStatusColor()
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getDealTypeIcon(deal.type)}</span>
          <div>
            <h4 className="font-semibold">{getDealTypeTitle(deal.type)}</h4>
            {showPartner && partner && (
              <p className="text-sm text-muted-foreground">with {partner.name}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="flex items-center gap-1">
            {getStatusIcon()}
            <span className="capitalize">{deal.status}</span>
          </Badge>
          <Badge className={cn('text-xs', getTrustImpactColor())}>
            {deal.trustImpact.toUpperCase()} STAKES
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm">{deal.description}</p>

      {/* Target (for target agreements) */}
      {target && (
        <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
          <StatusAvatar 
            name={target.name} 
            avatarUrl={target.avatarUrl}
            size="sm" 
          />
          <div>
            <div className="text-xs text-muted-foreground">Target</div>
            <div className="text-sm font-medium">{target.name}</div>
          </div>
        </div>
      )}

      {/* Partner display with trust indicators */}
      {showPartner && partner && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <StatusAvatar 
              name={partner.name} 
              avatarUrl={partner.avatarUrl}
              size="sm"
              isPlayer={partner.isPlayer}
            />
            <div className="text-sm">
              <span className="text-muted-foreground">Partner: </span>
              <span className="font-medium">{partner.name}</span>
            </div>
          </div>
          
          {/* Relationship and trust indicators */}
          <div className="flex items-center gap-3 text-xs">
            <span className={cn(
              "flex items-center gap-1",
              relationship > 30 ? "text-green-600" : relationship < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
              <Heart className="h-3 w-3" />
              {relationship > 0 ? '+' : ''}{relationship}
            </span>
            <span className={cn(
              "flex items-center gap-1",
              trustScore >= 65 ? "text-green-600" : trustScore <= 35 ? "text-red-500" : "text-muted-foreground"
            )}>
              <Shield className="h-3 w-3" />
              {trustScore}%
            </span>
          </div>
        </div>
      )}

      {/* Week info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>Made in Week {deal.week}</span>
        {deal.expiresWeek && (
          <span>Expires: Week {deal.expiresWeek}</span>
        )}
      </div>
    </motion.div>
  );
};

export default DealCard;
