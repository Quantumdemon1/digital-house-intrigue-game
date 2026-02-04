/**
 * @file src/components/alliances/AllianceMemberCard.tsx
 * @description Card component for displaying alliance member info
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Heart, UserX, User } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { StatusAvatar } from '@/components/ui/status-avatar';
import RelationshipTierBadge from '@/components/houseguest/RelationshipTierBadge';
import { cn } from '@/lib/utils';

interface AllianceMemberCardProps {
  member: Houseguest;
  isFounder: boolean;
  isPlayer: boolean;
  relationshipScore?: number;
  canKick?: boolean;
  onKick?: () => void;
}

const AllianceMemberCard: React.FC<AllianceMemberCardProps> = ({
  member,
  isFounder,
  isPlayer,
  relationshipScore,
  canKick,
  onKick,
}) => {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border',
      isPlayer ? 'bg-bb-blue/5 border-bb-blue/20' : 'bg-background'
    )}>
      {/* Avatar */}
      <StatusAvatar
        name={member.name}
        avatarUrl={member.avatarUrl}
        size="sm"
      />
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{member.name}</span>
          {isFounder && (
            <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1">
              <Crown className="h-3 w-3 text-bb-gold" />
              Founder
            </Badge>
          )}
          {isPlayer && (
            <Badge variant="secondary" className="text-xs py-0 px-1.5">
              You
            </Badge>
          )}
        </div>
        
        {/* Relationship Score (not shown for player) */}
        {relationshipScore !== undefined && (
          <div className="flex items-center gap-2 mt-1">
            <RelationshipTierBadge score={relationshipScore} size="sm" showLabel={true} />
          </div>
        )}
      </div>
      
      {/* Kick Button */}
      {canKick && onKick && (
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onKick}
        >
          <UserX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default AllianceMemberCard;
