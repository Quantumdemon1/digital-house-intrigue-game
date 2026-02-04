/**
 * @file src/components/social-network/ConnectionLine.tsx
 * @description SVG component for relationship lines
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Position, getConnectionStyle } from './utils/graph-layout';
import { generateConnectionPath, generateStraightPath } from './utils/connection-renderer';

interface ConnectionLineProps {
  from: Position;
  to: Position;
  relationshipScore: number;
  isAlliance: boolean;
  isPlayerConnection: boolean;
  animated?: boolean;
  id: string;
}

const ConnectionLine: React.FC<ConnectionLineProps> = memo(({
  from,
  to,
  relationshipScore,
  isAlliance,
  isPlayerConnection,
  animated = false,
  id
}) => {
  const style = getConnectionStyle(relationshipScore);
  const absScore = Math.abs(relationshipScore);
  
  // Use straight lines for very strong relationships, curved for others
  const path = absScore > 80 
    ? generateStraightPath(from, to) 
    : generateConnectionPath(from, to, 0.15);
  
  // Calculate dash array for weaker relationships
  const strokeDasharray = absScore < 20 ? '5,5' : undefined;
  
  return (
    <g>
      {/* Glow effect for player connections */}
      {isPlayerConnection && (
        <motion.path
          d={path}
          fill="none"
          stroke={style.color}
          strokeWidth={style.width + 4}
          strokeLinecap="round"
          opacity={0.2}
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
      )}
      
      {/* Alliance highlight */}
      {isAlliance && (
        <path
          d={path}
          fill="none"
          stroke={style.color}
          strokeWidth={style.width + 2}
          strokeLinecap="round"
          opacity={0.15}
        />
      )}
      
      {/* Main connection line */}
      <motion.path
        d={path}
        fill="none"
        stroke={style.color}
        strokeWidth={style.width}
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        opacity={style.opacity}
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: style.opacity } : undefined}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      
      {/* Animated pulse for active relationships */}
      {animated && absScore > 50 && (
        <motion.circle
          r={3}
          fill={style.color}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            offsetDistance: ['0%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            offsetPath: `path('${path}')`,
            offsetRotate: '0deg'
          }}
        />
      )}
    </g>
  );
});

ConnectionLine.displayName = 'ConnectionLine';

export default ConnectionLine;
