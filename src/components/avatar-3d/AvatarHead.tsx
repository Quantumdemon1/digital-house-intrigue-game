/**
 * @file avatar-3d/AvatarHead.tsx
 * @description Modern chibi-style head with anime eyes and toon shading
 */

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Outlines } from '@react-three/drei';
import { Avatar3DConfig } from '@/models/avatar-config';
import { MoodType } from '@/models/houseguest/types';
import { getMoodExpression } from './hooks/useMoodAnimation';
import { useBlinkAnimation } from './hooks/useIdleAnimation';
import { useSkinMaterial, CHIBI_PROPORTIONS, OUTLINE_COLOR, OUTLINE_THICKNESS } from './materials/ToonMaterials';

interface AvatarHeadProps {
  config: Avatar3DConfig;
  mood?: MoodType;
  segments?: number;
  animated?: boolean;
}

// Head shape scale factors
const HEAD_SHAPES: Record<string, { x: number; y: number; z: number }> = {
  round: { x: 1.0, y: 1.0, z: 1.0 },
  oval: { x: 0.95, y: 1.05, z: 0.97 },
  square: { x: 1.03, y: 0.97, z: 1.0 },
  heart: { x: 0.97, y: 1.02, z: 0.95 }
};

/**
 * Anime-style eye component with multiple highlights
 */
const AnimeEye: React.FC<{
  position: [number, number, number];
  eyeColor: string;
  eyeScale: number;
  isLeft?: boolean;
  eyeRef?: React.RefObject<THREE.Group | null>;
}> = ({ position, eyeColor, eyeScale, isLeft = false, eyeRef }) => {
  const highlightOffset = isLeft ? 0.012 : -0.012;
  
  return (
    <group position={position} ref={eyeRef} scale={[1, eyeScale, 1]}>
      {/* Eye white - larger for anime style */}
      <mesh>
        <sphereGeometry args={[0.042, 24, 24]} />
        <meshBasicMaterial color="white" />
        <Outlines thickness={0.008} color={OUTLINE_COLOR} />
      </mesh>
      
      {/* Iris - larger, more colorful */}
      <mesh position={[0, -0.005, 0.02]}>
        <circleGeometry args={[0.032, 32]} />
        <meshToonMaterial color={eyeColor} />
      </mesh>
      
      {/* Pupil - darker center */}
      <mesh position={[0, -0.008, 0.025]}>
        <circleGeometry args={[0.016, 24]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      
      {/* Main highlight - big anime sparkle */}
      <mesh position={[highlightOffset, 0.01, 0.03]}>
        <circleGeometry args={[0.012, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
      
      {/* Secondary highlight - smaller */}
      <mesh position={[highlightOffset * 0.5, -0.008, 0.03]}>
        <circleGeometry args={[0.006, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
};

/**
 * Cute mouth component with mood-based expression
 */
const CuteMouth: React.FC<{ curve: number; mouthType: string }> = ({ curve, mouthType }) => {
  const widthMultiplier = mouthType === 'wide' ? 1.2 : mouthType === 'small' ? 0.8 : 1.0;
  
  // Simple curved line for mouth
  const mouthGeometry = useMemo(() => {
    const points = [];
    const segments = 16;
    const width = 0.04 * widthMultiplier;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (t - 0.5) * width * 2;
      const y = -curve * 0.025 * Math.sin(t * Math.PI);
      points.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve3d = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve3d, segments, 0.008, 8, false);
  }, [curve, widthMultiplier]);
  
  return (
    <mesh geometry={mouthGeometry} position={[0, -0.05, 0.18]}>
      <meshBasicMaterial color="#6B4423" />
    </mesh>
  );
};

/**
 * Optional blush spots for extra cuteness
 */
const BlushSpots: React.FC<{ skinTone: string }> = ({ skinTone }) => {
  // Create a slightly pink tint
  const blushMaterial = useMemo(() => 
    new THREE.MeshBasicMaterial({ 
      color: '#FFB6C1',
      transparent: true,
      opacity: 0.35
    }), 
    []
  );
  
  return (
    <group>
      {/* Left blush */}
      <mesh position={[-0.1, -0.02, 0.12]} rotation={[0, 0.3, 0]}>
        <circleGeometry args={[0.025, 16]} />
        <primitive object={blushMaterial} attach="material" />
      </mesh>
      {/* Right blush */}
      <mesh position={[0.1, -0.02, 0.12]} rotation={[0, -0.3, 0]}>
        <circleGeometry args={[0.025, 16]} />
        <primitive object={blushMaterial} attach="material" />
      </mesh>
    </group>
  );
};

export const AvatarHead: React.FC<AvatarHeadProps> = ({ 
  config, 
  mood = 'Neutral',
  segments = 32,
  animated = true
}) => {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  
  const headShape = HEAD_SHAPES[config.headShape] || HEAD_SHAPES.round;
  const expression = getMoodExpression(mood);
  
  // Toon skin material
  const skinMaterial = useSkinMaterial(config.skinTone);
  
  // Hair color for eyebrows
  const browMaterial = useMemo(() => 
    new THREE.MeshBasicMaterial({ color: config.hairColor }), 
    [config.hairColor]
  );
  
  // Apply blinking animation
  useBlinkAnimation(leftEyeRef as any, rightEyeRef as any, animated);
  
  // Subtle head idle movement
  useFrame((state) => {
    if (!animated || !headRef.current) return;
    const time = state.clock.elapsedTime;
    headRef.current.rotation.y = Math.sin(time * 0.3) * 0.03;
    headRef.current.rotation.z = Math.sin(time * 0.25) * 0.015;
  });

  // Chibi-scaled head size (40% larger)
  const headRadius = 0.18 * CHIBI_PROPORTIONS.headScale;

  return (
    <group ref={headRef} position={[0, 0.32, 0]}>
      {/* Head base - rounder, bigger for chibi look */}
      <mesh scale={[headShape.x, headShape.y, headShape.z]}>
        <sphereGeometry args={[headRadius, segments, segments]} />
        <primitive object={skinMaterial} attach="material" />
        <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
      </mesh>
      
      {/* Ears - smaller, cuter */}
      <mesh position={[-headRadius * headShape.x * 0.95, 0, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      <mesh position={[headRadius * headShape.x * 0.95, 0, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      
      {/* Anime-style Eyes - bigger, more expressive */}
      <group position={[0, 0.02, headRadius * 0.7]}>
        <AnimeEye 
          position={[-0.06, 0, 0]}
          eyeColor={config.eyeColor}
          eyeScale={expression.eyeScale}
          isLeft={true}
          eyeRef={leftEyeRef as any}
        />
        <AnimeEye 
          position={[0.06, 0, 0]}
          eyeColor={config.eyeColor}
          eyeScale={expression.eyeScale}
          isLeft={false}
          eyeRef={rightEyeRef as any}
        />
        
        {/* Eyebrows - simpler, more expressive */}
        <group position={[0, 0.055 + expression.browOffset, -0.01]}>
          <mesh position={[-0.055, 0, 0]} rotation={[0, 0, 0.15]}>
            <capsuleGeometry args={[0.006, 0.025, 4, 8]} />
            <primitive object={browMaterial} attach="material" />
          </mesh>
          <mesh position={[0.055, 0, 0]} rotation={[0, 0, -0.15]}>
            <capsuleGeometry args={[0.006, 0.025, 4, 8]} />
            <primitive object={browMaterial} attach="material" />
          </mesh>
        </group>
      </group>
      
      {/* Cute button nose */}
      <mesh position={[0, -0.01, headRadius * 0.9]}>
        <sphereGeometry args={[
          config.noseType === 'large' ? 0.018 : config.noseType === 'small' ? 0.01 : 0.014,
          16, 16
        ]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      
      {/* Cute mouth */}
      <CuteMouth curve={expression.mouthCurve} mouthType={config.mouthType} />
      
      {/* Blush spots for extra cuteness */}
      <BlushSpots skinTone={config.skinTone} />
    </group>
  );
};

export default AvatarHead;
