/**
 * @file avatar-3d/AvatarClothing.tsx
 * @description Clothing overlay for Sims-style avatars
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Avatar3DConfig, TopStyle, BottomStyle } from '@/models/avatar-config';
import { getBodyProportions } from './utils/avatar-generator';

interface AvatarClothingProps {
  config: Avatar3DConfig;
  segments?: number;
}

// Clothing style parameters
const TOP_STYLES: Record<TopStyle, {
  collarHeight: number;
  sleeveLength: 'short' | 'long' | 'none';
  neckline: 'crew' | 'v' | 'high';
}> = {
  tshirt: { collarHeight: 0.02, sleeveLength: 'short', neckline: 'crew' },
  tanktop: { collarHeight: 0, sleeveLength: 'none', neckline: 'crew' },
  blazer: { collarHeight: 0.03, sleeveLength: 'long', neckline: 'v' },
  hoodie: { collarHeight: 0.04, sleeveLength: 'long', neckline: 'high' },
  dress: { collarHeight: 0.01, sleeveLength: 'short', neckline: 'crew' }
};

export const AvatarClothing: React.FC<AvatarClothingProps> = ({ 
  config, 
  segments = 20 
}) => {
  const proportions = useMemo(() => 
    getBodyProportions(config.bodyType, config.height), 
    [config.bodyType, config.height]
  );
  
  const topStyle = TOP_STYLES[config.topStyle];
  const heightMult = proportions.heightMultiplier;
  
  const topMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: config.topColor,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide
    }), 
    [config.topColor]
  );
  
  // Dress extends lower
  const isDress = config.topStyle === 'dress';

  return (
    <group position={[0, -0.15 * heightMult, 0]}>
      {/* Collar/Neckline detail */}
      {topStyle.neckline === 'high' && (
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.065, 0.07, 0.04, segments]} />
          <primitive object={topMaterial} attach="material" />
        </mesh>
      )}
      
      {/* V-neck detail for blazer */}
      {topStyle.neckline === 'v' && (
        <group position={[0, 0.22, 0.08]}>
          {/* Lapels */}
          <mesh position={[-0.04, 0, 0]} rotation={[0.3, 0.2, 0]}>
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
          <mesh position={[0.04, 0, 0]} rotation={[0.3, -0.2, 0]}>
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
        </group>
      )}
      
      {/* Hoodie hood (behind head) */}
      {config.topStyle === 'hoodie' && (
        <mesh position={[0, 0.32, -0.08]}>
          <sphereGeometry args={[0.12, segments, segments, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.5]} />
          <primitive object={topMaterial} attach="material" />
        </mesh>
      )}
      
      {/* Long sleeves for blazer/hoodie */}
      {topStyle.sleeveLength === 'long' && (
        <group>
          {/* Left sleeve extension */}
          <mesh position={[-proportions.shoulderWidth * 0.9 - 0.03, 0.05, 0]} rotation={[0, 0, 0.12]}>
            <capsuleGeometry args={[
              proportions.armThickness * 1.1,
              0.08 * heightMult,
              8,
              segments
            ]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
          {/* Right sleeve extension */}
          <mesh position={[proportions.shoulderWidth * 0.9 + 0.03, 0.05, 0]} rotation={[0, 0, -0.12]}>
            <capsuleGeometry args={[
              proportions.armThickness * 1.1,
              0.08 * heightMult,
              8,
              segments
            ]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
        </group>
      )}
      
      {/* Dress skirt extension */}
      {isDress && (
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[
            proportions.torsoWidth * 0.8,  // top (waist)
            proportions.torsoWidth * 1.4,  // bottom (flared)
            0.2 * heightMult,
            segments
          ]} />
          <primitive object={topMaterial} attach="material" />
        </mesh>
      )}
      
      {/* Blazer/suit jacket buttons */}
      {config.topStyle === 'blazer' && (
        <group position={[0, 0.08, proportions.torsoDepth + 0.01]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.012, 12, 12]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.012, 12, 12]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      )}
      
      {/* Tank top straps */}
      {config.topStyle === 'tanktop' && (
        <group position={[0, 0.24, 0]}>
          <mesh position={[-0.06, 0, 0.06]} rotation={[0.2, 0, 0.15]}>
            <boxGeometry args={[0.025, 0.08, 0.01]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
          <mesh position={[0.06, 0, 0.06]} rotation={[0.2, 0, -0.15]}>
            <boxGeometry args={[0.025, 0.08, 0.01]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default AvatarClothing;
