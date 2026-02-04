/**
 * @file avatar-3d/AvatarBody.tsx
 * @description Procedurally generated Sims-style body mesh
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Avatar3DConfig } from '@/models/avatar-config';
import { getBodyProportions } from './utils/avatar-generator';

interface AvatarBodyProps {
  config: Avatar3DConfig;
  segments?: number;
}

export const AvatarBody: React.FC<AvatarBodyProps> = ({ 
  config, 
  segments = 20 
}) => {
  const proportions = useMemo(() => 
    getBodyProportions(config.bodyType, config.height), 
    [config.bodyType, config.height]
  );
  
  const heightMult = proportions.heightMultiplier;
  
  // Clothing covers torso, so we use clothing color there
  const skinMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: config.skinTone,
      roughness: 0.7,
      metalness: 0.1
    }), 
    [config.skinTone]
  );
  
  const topMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: config.topColor,
      roughness: 0.8,
      metalness: 0.0
    }), 
    [config.topColor]
  );
  
  const bottomMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: config.bottomColor,
      roughness: 0.8,
      metalness: 0.0
    }), 
    [config.bottomColor]
  );

  return (
    <group position={[0, -0.15 * heightMult, 0]}>
      {/* Torso - covered by clothing */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[
          proportions.torsoWidth * 0.85,  // top (shoulders)
          proportions.torsoWidth,          // bottom (waist)
          0.35 * heightMult,              // height
          segments
        ]} />
        <primitive object={topMaterial} attach="material" />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.08, segments]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      
      {/* Shoulders/Upper Arms */}
      <group>
        {/* Left Arm */}
        <group position={[-proportions.shoulderWidth * 0.9, 0.18, 0]}>
          {/* Upper arm - short sleeve visible */}
          <mesh rotation={[0, 0, 0.15]}>
            <capsuleGeometry args={[
              proportions.armThickness,
              0.12 * heightMult,
              8,
              segments
            ]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
          {/* Lower arm - skin */}
          <mesh position={[-0.05, -0.15, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[
              proportions.armThickness * 0.9,
              0.1 * heightMult,
              8,
              segments
            ]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
          {/* Hand - mitten style */}
          <mesh position={[-0.08, -0.28, 0]}>
            <sphereGeometry args={[proportions.armThickness * 1.2, segments, segments]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
        </group>
        
        {/* Right Arm */}
        <group position={[proportions.shoulderWidth * 0.9, 0.18, 0]}>
          <mesh rotation={[0, 0, -0.15]}>
            <capsuleGeometry args={[
              proportions.armThickness,
              0.12 * heightMult,
              8,
              segments
            ]} />
            <primitive object={topMaterial} attach="material" />
          </mesh>
          <mesh position={[0.05, -0.15, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[
              proportions.armThickness * 0.9,
              0.1 * heightMult,
              8,
              segments
            ]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
          <mesh position={[0.08, -0.28, 0]}>
            <sphereGeometry args={[proportions.armThickness * 1.2, segments, segments]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
        </group>
      </group>
      
      {/* Hips/Lower body */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[
          proportions.torsoWidth,         // top (waist)
          proportions.torsoWidth * 0.95,  // bottom (hips)
          0.12 * heightMult,
          segments
        ]} />
        <primitive object={bottomMaterial} attach="material" />
      </mesh>
      
      {/* Legs */}
      <group>
        {/* Left Leg */}
        <group position={[-proportions.torsoWidth * 0.4, -0.35, 0]}>
          <mesh>
            <capsuleGeometry args={[
              proportions.legThickness,
              0.25 * heightMult,
              8,
              segments
            ]} />
            <primitive object={bottomMaterial} attach="material" />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.2, 0.03]}>
            <boxGeometry args={[
              proportions.legThickness * 1.8,
              0.05,
              proportions.legThickness * 2.5
            ]} />
            <meshStandardMaterial color="#2D2D2D" roughness={0.9} />
          </mesh>
        </group>
        
        {/* Right Leg */}
        <group position={[proportions.torsoWidth * 0.4, -0.35, 0]}>
          <mesh>
            <capsuleGeometry args={[
              proportions.legThickness,
              0.25 * heightMult,
              8,
              segments
            ]} />
            <primitive object={bottomMaterial} attach="material" />
          </mesh>
          <mesh position={[0, -0.2, 0.03]}>
            <boxGeometry args={[
              proportions.legThickness * 1.8,
              0.05,
              proportions.legThickness * 2.5
            ]} />
            <meshStandardMaterial color="#2D2D2D" roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default AvatarBody;
