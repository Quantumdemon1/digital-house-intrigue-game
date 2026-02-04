/**
 * @file avatar-3d/AvatarClothing.tsx
 * @description Toon-shaded clothing overlays for chibi avatars
 */

import React, { useMemo } from 'react';
import { Outlines } from '@react-three/drei';
import { Avatar3DConfig, TopStyle } from '@/models/avatar-config';
import { getBodyProportions } from './utils/avatar-generator';
import { useClothMaterial, CHIBI_PROPORTIONS, OUTLINE_COLOR, OUTLINE_THICKNESS } from './materials/ToonMaterials';

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
  segments = 24 
}) => {
  const proportions = useMemo(() => 
    getBodyProportions(config.bodyType, config.height), 
    [config.bodyType, config.height]
  );
  
  const topStyle = TOP_STYLES[config.topStyle];
  const heightMult = proportions.heightMultiplier * CHIBI_PROPORTIONS.bodyHeight;
  
  const topMaterial = useClothMaterial(config.topColor);
  
  // Button material for blazer
  const buttonMaterial = useMemo(() => {
    const { MeshBasicMaterial } = require('three');
    return new MeshBasicMaterial({ color: '#1a1a1a' });
  }, []);
  
  const isDress = config.topStyle === 'dress';

  return (
    <group position={[0, -0.2, 0]}>
      {/* Collar/Neckline detail */}
      {topStyle.neckline === 'high' && (
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.058, 0.062, 0.035, segments]} />
          <primitive object={topMaterial} attach="material" />
          <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
        </mesh>
      )}
      
      {/* V-neck detail for blazer */}
      {topStyle.neckline === 'v' && (
        <group position={[0, 0.18, proportions.torsoWidth * 0.7]}>
          {/* Lapels */}
          <mesh position={[-0.035, 0, 0]} rotation={[0.3, 0.15, 0]}>
            <boxGeometry args={[0.025, 0.06, 0.008]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
          <mesh position={[0.035, 0, 0]} rotation={[0.3, -0.15, 0]}>
            <boxGeometry args={[0.025, 0.06, 0.008]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
        </group>
      )}
      
      {/* Hoodie hood (behind head) */}
      {config.topStyle === 'hoodie' && (
        <mesh position={[0, 0.28, -0.07]}>
          <sphereGeometry args={[0.1, segments, segments, 0, Math.PI * 2, Math.PI * 0.25, Math.PI * 0.5]} />
          <primitive object={topMaterial} attach="material" />
          <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
        </mesh>
      )}
      
      {/* Long sleeves for blazer/hoodie */}
      {topStyle.sleeveLength === 'long' && (
        <group>
          {/* Left sleeve extension */}
          <mesh position={[-proportions.shoulderWidth * 0.75 - 0.02, 0.02, 0]} rotation={[0, 0, 0.15]}>
            <capsuleGeometry args={[
              proportions.armThickness * 1.15,
              0.06 * heightMult,
              8,
              segments
            ]} />
            <primitive object={topMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
          {/* Right sleeve extension */}
          <mesh position={[proportions.shoulderWidth * 0.75 + 0.02, 0.02, 0]} rotation={[0, 0, -0.15]}>
            <capsuleGeometry args={[
              proportions.armThickness * 1.15,
              0.06 * heightMult,
              8,
              segments
            ]} />
            <primitive object={topMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
        </group>
      )}
      
      {/* Dress skirt extension */}
      {isDress && (
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[
            proportions.torsoWidth * 0.7,   // top (waist)
            proportions.torsoWidth * 1.2,   // bottom (flared)
            0.15 * heightMult,
            segments
          ]} />
          <primitive object={topMaterial} attach="material" />
          <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
        </mesh>
      )}
      
      {/* Blazer/suit jacket buttons */}
      {config.topStyle === 'blazer' && (
        <group position={[0, 0.06, proportions.torsoWidth * 0.85 + 0.01]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.01, 12, 12]} />
            <primitive object={buttonMaterial} attach="material" />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <sphereGeometry args={[0.01, 12, 12]} />
            <primitive object={buttonMaterial} attach="material" />
          </mesh>
        </group>
      )}
      
      {/* Tank top straps */}
      {config.topStyle === 'tanktop' && (
        <group position={[0, 0.2, 0]}>
          <mesh position={[-0.05, 0, 0.05]} rotation={[0.15, 0, 0.12]}>
            <boxGeometry args={[0.02, 0.06, 0.008]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
          <mesh position={[0.05, 0, 0.05]} rotation={[0.15, 0, -0.12]}>
            <boxGeometry args={[0.02, 0.06, 0.008]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default AvatarClothing;
