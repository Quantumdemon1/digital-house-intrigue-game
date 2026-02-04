/**
 * @file avatar-3d/AvatarBody.tsx
 * @description Modern chibi-style body with toon shading
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Outlines } from '@react-three/drei';
import { Avatar3DConfig } from '@/models/avatar-config';
import { getBodyProportions } from './utils/avatar-generator';
import { useSkinMaterial, useClothMaterial, CHIBI_PROPORTIONS, OUTLINE_COLOR, OUTLINE_THICKNESS } from './materials/ToonMaterials';

interface AvatarBodyProps {
  config: Avatar3DConfig;
  segments?: number;
}

export const AvatarBody: React.FC<AvatarBodyProps> = ({ 
  config, 
  segments = 24 
}) => {
  // Defensive: handle undefined or partial config
  const proportions = useMemo(() => 
    getBodyProportions(config?.bodyType ?? 'average', config?.height ?? 'average'), 
    [config?.bodyType, config?.height]
  );
  
  // Apply chibi scaling - shorter, stubbier body
  const heightMult = proportions.heightMultiplier * CHIBI_PROPORTIONS.bodyHeight;
  const limbScale = CHIBI_PROPORTIONS.armLength;
  
  // Toon materials with defensive defaults
  const skinMaterial = useSkinMaterial(config?.skinTone ?? '#E8BEAC');
  const topMaterial = useClothMaterial(config?.topColor ?? '#3B82F6');
  const bottomMaterial = useClothMaterial(config?.bottomColor ?? '#1E3A5F');
  
  // Shoe material - darker toon
  const shoeMaterial = useMemo(() => 
    new THREE.MeshToonMaterial({ color: '#2D2D2D' }), 
    []
  );

  return (
    <group position={[0, -0.2, 0]}>
      {/* Torso - rounder, cuter shape */}
      <mesh position={[0, 0.08, 0]}>
        <capsuleGeometry args={[
          proportions.torsoWidth * 0.85,
          0.2 * heightMult,
          8,
          segments
        ]} />
        <primitive object={topMaterial} attach="material" />
        <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
      </mesh>
      
      {/* Neck - shorter, cuter */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.05, segments]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      
      {/* Arms - stubby and round */}
      <group>
        {/* Left Arm */}
        <group position={[-proportions.shoulderWidth * 0.75, 0.12, 0]}>
          {/* Upper arm */}
          <mesh rotation={[0, 0, 0.25]}>
            <capsuleGeometry args={[
              proportions.armThickness * 1.1,
              0.08 * limbScale,
              8,
              segments
            ]} />
            <primitive object={topMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
          {/* Lower arm - skin */}
          <mesh position={[-0.04, -0.1, 0]} rotation={[0, 0, 0.15]}>
            <capsuleGeometry args={[
              proportions.armThickness * 1.0,
              0.06 * limbScale,
              8,
              segments
            ]} />
            <primitive object={skinMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
          {/* Hand - bigger, cuter mitten */}
          <mesh position={[-0.06, -0.18, 0]}>
            <sphereGeometry args={[proportions.armThickness * CHIBI_PROPORTIONS.handScale, segments, segments]} />
            <primitive object={skinMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
        </group>
        
        {/* Right Arm */}
        <group position={[proportions.shoulderWidth * 0.75, 0.12, 0]}>
          <mesh rotation={[0, 0, -0.25]}>
            <capsuleGeometry args={[
              proportions.armThickness * 1.1,
              0.08 * limbScale,
              8,
              segments
            ]} />
            <primitive object={topMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
          <mesh position={[0.04, -0.1, 0]} rotation={[0, 0, -0.15]}>
            <capsuleGeometry args={[
              proportions.armThickness * 1.0,
              0.06 * limbScale,
              8,
              segments
            ]} />
            <primitive object={skinMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
          <mesh position={[0.06, -0.18, 0]}>
            <sphereGeometry args={[proportions.armThickness * CHIBI_PROPORTIONS.handScale, segments, segments]} />
            <primitive object={skinMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
        </group>
      </group>
      
      {/* Hips/Lower body - rounder */}
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[
          proportions.torsoWidth * 0.75,
          segments,
          segments,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.6
        ]} />
        <primitive object={bottomMaterial} attach="material" />
        <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
      </mesh>
      
      {/* Legs - short and stubby */}
      <group>
        {/* Left Leg */}
        <group position={[-proportions.torsoWidth * 0.35, -0.22, 0]}>
          <mesh>
            <capsuleGeometry args={[
              proportions.legThickness * 1.1,
              0.12 * CHIBI_PROPORTIONS.legLength,
              8,
              segments
            ]} />
            <primitive object={bottomMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
          {/* Foot - rounder shoe */}
          <mesh position={[0, -0.12, 0.02]}>
            <sphereGeometry args={[proportions.legThickness * 1.4, segments, segments]} />
            <primitive object={shoeMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
        </group>
        
        {/* Right Leg */}
        <group position={[proportions.torsoWidth * 0.35, -0.22, 0]}>
          <mesh>
            <capsuleGeometry args={[
              proportions.legThickness * 1.1,
              0.12 * CHIBI_PROPORTIONS.legLength,
              8,
              segments
            ]} />
            <primitive object={bottomMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
          <mesh position={[0, -0.12, 0.02]}>
            <sphereGeometry args={[proportions.legThickness * 1.4, segments, segments]} />
            <primitive object={shoeMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default AvatarBody;
