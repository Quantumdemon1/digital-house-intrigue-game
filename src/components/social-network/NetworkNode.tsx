/**
 * @file src/components/social-network/NetworkNode.tsx
 * @description Individual houseguest node in the social network graph
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Target, Star } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { PlayerPerception, RelationshipLevel } from '@/models/player-perception';
import { Position, getRelationshipLevelInfo } from './utils/graph-layout';

interface NetworkNodeProps {
  houseguest: Houseguest;
  position: Position;
  isPlayer: boolean;
  isSelected: boolean;
  perception?: PlayerPerception;
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
}

const SIZE_MAP = {
  small: { node: 40, ring: 44, fontSize: 10, iconSize: 12 },
  medium: { node: 56, ring: 62, fontSize: 12, iconSize: 14 },
  large: { node: 72, ring: 80, fontSize: 14, iconSize: 16 }
};

const NetworkNode: React.FC<NetworkNodeProps> = memo(({
  houseguest,
  position,
  isPlayer,
  isSelected,
  perception,
  size = 'medium',
  onClick
}) => {
  const sizeConfig = SIZE_MAP[size];
  const isHoH = houseguest.isHoH;
  const isNominated = houseguest.isNominated;
  const isPovHolder = houseguest.isPovHolder;
  const isEvicted = houseguest.status === 'Evicted' || houseguest.status === 'Jury';
  
  // Get perception-based styling
  const relationshipInfo = perception?.customRelationshipLevel 
    ? getRelationshipLevelInfo(perception.customRelationshipLevel)
    : null;
  
  // Border color based on status/perception
  const getBorderColor = () => {
    if (isPlayer) return 'hsl(var(--bb-blue))';
    if (relationshipInfo) return relationshipInfo.color;
    if (isHoH) return 'hsl(var(--bb-gold))';
    if (isNominated) return 'hsl(var(--bb-red))';
    if (isPovHolder) return 'hsl(var(--bb-gold))';
    return 'hsl(var(--border))';
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: isEvicted ? 0.5 : 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Selection ring */}
      {isSelected && (
        <motion.circle
          cx={position.x}
          cy={position.y}
          r={sizeConfig.ring + 8}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          strokeDasharray="4,4"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ rotate: { repeat: Infinity, duration: 10, ease: 'linear' } }}
        />
      )}
      
      {/* Player highlight ring */}
      {isPlayer && (
        <motion.circle
          cx={position.x}
          cy={position.y}
          r={sizeConfig.ring + 4}
          fill="none"
          stroke="hsl(var(--bb-blue))"
          strokeWidth={2}
          opacity={0.6}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
      
      {/* Metallic border ring */}
      <defs>
        <linearGradient id={`border-gradient-${houseguest.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={getBorderColor()} stopOpacity={1} />
          <stop offset="50%" stopColor="hsl(0, 0%, 90%)" stopOpacity={0.9} />
          <stop offset="100%" stopColor={getBorderColor()} stopOpacity={1} />
        </linearGradient>
      </defs>
      
      <circle
        cx={position.x}
        cy={position.y}
        r={sizeConfig.ring / 2}
        fill={`url(#border-gradient-${houseguest.id})`}
        stroke="none"
      />
      
      {/* Avatar circle */}
      <clipPath id={`avatar-clip-${houseguest.id}`}>
        <circle cx={position.x} cy={position.y} r={sizeConfig.node / 2} />
      </clipPath>
      
      {/* Avatar background */}
      <circle
        cx={position.x}
        cy={position.y}
        r={sizeConfig.node / 2}
        fill="hsl(var(--muted))"
      />
      
      {/* Avatar image or initials */}
      {houseguest.avatarUrl ? (
        <image
          href={houseguest.avatarUrl}
          x={position.x - sizeConfig.node / 2}
          y={position.y - sizeConfig.node / 2}
          width={sizeConfig.node}
          height={sizeConfig.node}
          clipPath={`url(#avatar-clip-${houseguest.id})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <text
          x={position.x}
          y={position.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={sizeConfig.fontSize + 4}
          fontWeight="bold"
          fill="hsl(var(--muted-foreground))"
        >
          {getInitials(houseguest.name)}
        </text>
      )}
      
      {/* Status badges */}
      {isHoH && (
        <g transform={`translate(${position.x + sizeConfig.node / 2 - 8}, ${position.y - sizeConfig.node / 2 - 4})`}>
          <circle cx={0} cy={0} r={10} fill="hsl(var(--bb-gold))" />
          <Crown className="text-background" x={-6} y={-6} width={12} height={12} />
        </g>
      )}
      
      {isPovHolder && !isHoH && (
        <g transform={`translate(${position.x + sizeConfig.node / 2 - 8}, ${position.y - sizeConfig.node / 2 - 4})`}>
          <circle cx={0} cy={0} r={10} fill="hsl(var(--bb-gold))" />
          <Shield className="text-background" x={-6} y={-6} width={12} height={12} />
        </g>
      )}
      
      {isNominated && (
        <g transform={`translate(${position.x - sizeConfig.node / 2 + 8}, ${position.y - sizeConfig.node / 2 - 4})`}>
          <circle cx={0} cy={0} r={10} fill="hsl(var(--bb-red))" />
          <Target className="text-background" x={-6} y={-6} width={12} height={12} />
        </g>
      )}
      
      {/* Perception badge */}
      {perception?.customRelationshipLevel && relationshipInfo && (
        <g transform={`translate(${position.x}, ${position.y + sizeConfig.node / 2 + 8})`}>
          <rect
            x={-24}
            y={-8}
            width={48}
            height={16}
            rx={8}
            fill={relationshipInfo.color}
            opacity={0.9}
          />
          <text
            x={0}
            y={1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight="600"
            fill="white"
          >
            {relationshipInfo.label}
          </text>
        </g>
      )}
      
      {/* Name plate */}
      <text
        x={position.x}
        y={position.y + sizeConfig.ring / 2 + (perception?.customRelationshipLevel ? 22 : 14)}
        textAnchor="middle"
        fontSize={sizeConfig.fontSize}
        fontWeight={isPlayer ? '700' : '500'}
        fill="hsl(var(--foreground))"
      >
        {houseguest.name.split(' ')[0]}
      </text>
      
      {/* "YOU" label for player */}
      {isPlayer && (
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <rect
            x={position.x - 16}
            y={position.y - sizeConfig.node / 2 - 18}
            width={32}
            height={14}
            rx={7}
            fill="hsl(var(--bb-blue))"
          />
          <text
            x={position.x}
            y={position.y - sizeConfig.node / 2 - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight="700"
            fill="white"
          >
            YOU
          </text>
        </motion.g>
      )}
    </motion.g>
  );
});

NetworkNode.displayName = 'NetworkNode';

export default NetworkNode;
