/**
 * @file src/components/houseguest/RelationshipTierBadge.tsx
 * @description Badge component showing relationship tier with icon
 */

import React from 'react';
import { getTierForScore, TierInfo } from '@/models/relationship-tier';
import { cn } from '@/lib/utils';

interface RelationshipTierBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RelationshipTierBadge: React.FC<RelationshipTierBadgeProps> = ({
  score,
  showLabel = true,
  size = 'sm',
  className,
}) => {
  const tierInfo = getTierForScore(score);
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        tierInfo.bgColor,
        tierInfo.color,
        sizeClasses[size],
        className
      )}
      title={`${tierInfo.label} (${score})`}
    >
      <span className={iconSizes[size]}>{tierInfo.icon}</span>
      {showLabel && <span>{tierInfo.label}</span>}
    </span>
  );
};

export default RelationshipTierBadge;
