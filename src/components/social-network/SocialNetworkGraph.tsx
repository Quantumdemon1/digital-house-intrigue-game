/**
 * @file src/components/social-network/SocialNetworkGraph.tsx
 * @description Main interactive SVG-based social network visualization
 */

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Houseguest } from '@/models/houseguest';
import { PlayerPerceptions, CustomAlliance } from '@/models/player-perception';
import { Alliance } from '@/models/alliance';
import { RelationshipMap } from '@/systems/relationship/types';
import NetworkNode from './NetworkNode';
import ConnectionLine from './ConnectionLine';
import { 
  calculateCircularLayout, 
  calculateAllianceCircles,
  Position 
} from './utils/graph-layout';
import { generateAllianceEnclosure } from './utils/connection-renderer';

interface SocialNetworkGraphProps {
  houseguests: Houseguest[];
  playerId: string;
  relationships: RelationshipMap;
  playerPerceptions?: PlayerPerceptions;
  gameAlliances: Alliance[];
  onHouseguestClick?: (houseguest: Houseguest) => void;
  onEditPerception?: (houseguestId: string) => void;
  showOnlyPlayerConnections?: boolean;
  showOnlyAlliances?: boolean;
}

const SocialNetworkGraph: React.FC<SocialNetworkGraphProps> = ({
  houseguests,
  playerId,
  relationships,
  playerPerceptions,
  gameAlliances,
  onHouseguestClick,
  onEditPerception,
  showOnlyPlayerConnections = false,
  showOnlyAlliances = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Track container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: Math.max(rect.height, 500) });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Filter active houseguests
  const activeHouseguests = useMemo(() => 
    houseguests.filter(h => h.status === 'Active' || h.status === 'Jury'),
    [houseguests]
  );
  
  // Calculate positions
  const positions = useMemo(() => 
    calculateCircularLayout(activeHouseguests, playerId, containerSize),
    [activeHouseguests, playerId, containerSize]
  );
  
  // Get custom alliances from player perceptions
  const customAlliances = playerPerceptions?.customAlliances || [];
  
  // Calculate alliance circles
  const allianceCircles = useMemo(() => 
    calculateAllianceCircles(customAlliances, positions),
    [customAlliances, positions]
  );
  
  // Get relationship score between two houseguests
  const getRelationshipScore = useCallback((id1: string, id2: string): number => {
    const guestRelationships = relationships.get(id1);
    if (guestRelationships) {
      const relationship = guestRelationships.get(id2);
      if (relationship) {
        return relationship.score;
      }
    }
    return 0;
  }, [relationships]);
  
  // Check if two houseguests are in the same game alliance
  const areInSameAlliance = useCallback((id1: string, id2: string): boolean => {
    return gameAlliances.some(alliance => 
      alliance.members.some(m => m.id === id1) && alliance.members.some(m => m.id === id2)
    );
  }, [gameAlliances]);
  
  // Generate connection pairs
  const connections = useMemo(() => {
    const pairs: Array<{
      from: string;
      to: string;
      fromPos: Position;
      toPos: Position;
      score: number;
      isAlliance: boolean;
      isPlayerConnection: boolean;
    }> = [];
    
    const processed = new Set<string>();
    
    for (const guest1 of activeHouseguests) {
      for (const guest2 of activeHouseguests) {
        if (guest1.id === guest2.id) continue;
        
        const key = [guest1.id, guest2.id].sort().join('-');
        if (processed.has(key)) continue;
        processed.add(key);
        
        const pos1 = positions.get(guest1.id);
        const pos2 = positions.get(guest2.id);
        if (!pos1 || !pos2) continue;
        
        const score = getRelationshipScore(guest1.id, guest2.id);
        const isPlayerConnection = guest1.id === playerId || guest2.id === playerId;
        const isAlliance = areInSameAlliance(guest1.id, guest2.id);
        
        // Filter based on view mode
        if (showOnlyPlayerConnections && !isPlayerConnection) continue;
        if (showOnlyAlliances && !isAlliance) continue;
        
        pairs.push({
          from: guest1.id,
          to: guest2.id,
          fromPos: pos1,
          toPos: pos2,
          score,
          isAlliance,
          isPlayerConnection
        });
      }
    }
    
    // Sort so player connections render on top
    return pairs.sort((a, b) => {
      if (a.isPlayerConnection && !b.isPlayerConnection) return 1;
      if (!a.isPlayerConnection && b.isPlayerConnection) return -1;
      return Math.abs(b.score) - Math.abs(a.score);
    });
  }, [activeHouseguests, positions, getRelationshipScore, areInSameAlliance, playerId, showOnlyPlayerConnections, showOnlyAlliances]);
  
  // Handle node click
  const handleNodeClick = useCallback((houseguest: Houseguest) => {
    setSelectedId(houseguest.id);
    if (houseguest.id !== playerId) {
      onEditPerception?.(houseguest.id);
    }
    onHouseguestClick?.(houseguest);
  }, [playerId, onEditPerception, onHouseguestClick]);
  
  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative">
      <svg
        width={containerSize.width}
        height={containerSize.height}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        className="overflow-visible"
      >
        {/* Definitions for filters and gradients */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>
        
        {/* Alliance enclosures (background layer) */}
        <g className="alliance-enclosures">
          {allianceCircles.map((circle, index) => {
            if (circle.radius === 0) return null;
            
            const memberPositions = circle.alliance.memberIds
              .map(id => positions.get(id))
              .filter((pos): pos is Position => pos !== undefined);
            
            const path = generateAllianceEnclosure(memberPositions, 45);
            
            return (
              <motion.path
                key={circle.alliance.id}
                d={path}
                fill={circle.alliance.color}
                fillOpacity={0.1}
                stroke={circle.alliance.color}
                strokeWidth={2}
                strokeDasharray="8,4"
                strokeOpacity={0.6}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            );
          })}
        </g>
        
        {/* Connection lines (middle layer) */}
        <g className="connections">
          {connections.map((conn) => (
            <ConnectionLine
              key={`${conn.from}-${conn.to}`}
              id={`${conn.from}-${conn.to}`}
              from={conn.fromPos}
              to={conn.toPos}
              relationshipScore={conn.score}
              isAlliance={conn.isAlliance}
              isPlayerConnection={conn.isPlayerConnection}
              animated={conn.isPlayerConnection}
            />
          ))}
        </g>
        
        {/* Nodes (top layer) */}
        <g className="nodes" filter="url(#shadow)">
          {activeHouseguests.map((houseguest) => {
            const position = positions.get(houseguest.id);
            if (!position) return null;
            
            const perception = playerPerceptions?.perceptions[houseguest.id];
            const isPlayer = houseguest.id === playerId;
            
            return (
              <NetworkNode
                key={houseguest.id}
                houseguest={houseguest}
                position={position}
                isPlayer={isPlayer}
                isSelected={selectedId === houseguest.id}
                perception={perception}
                size={isPlayer ? 'large' : 'medium'}
                onClick={() => handleNodeClick(houseguest)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default SocialNetworkGraph;
