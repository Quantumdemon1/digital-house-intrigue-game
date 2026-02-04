/**
 * @file avatar-3d/AvatarHead.tsx
 * @description Sims-style head with mood-reactive expressions
 */

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Avatar3DConfig } from '@/models/avatar-config';
import { MoodType } from '@/models/houseguest/types';
import { getMoodExpression } from './hooks/useMoodAnimation';
import { useBlinkAnimation } from './hooks/useIdleAnimation';

interface AvatarHeadProps {
  config: Avatar3DConfig;
  mood?: MoodType;
  segments?: number;
  animated?: boolean;
}

// Head shape scale factors
const HEAD_SHAPES: Record<string, { x: number; y: number; z: number }> = {
  round: { x: 1.0, y: 1.0, z: 1.0 },
  oval: { x: 0.92, y: 1.08, z: 0.95 },
  square: { x: 1.05, y: 0.95, z: 1.0 },
  heart: { x: 0.95, y: 1.03, z: 0.92 }
};

/**
 * Mouth component with mood-based curve
 */
const Mouth: React.FC<{ curve: number; mouthType: string }> = ({ curve, mouthType }) => {
  const widthMultiplier = mouthType === 'wide' ? 1.3 : mouthType === 'small' ? 0.7 : 1.0;
  const thickness = mouthType === 'full' ? 0.012 : mouthType === 'thin' ? 0.006 : 0.009;
  
  // Create curved mouth using a tube geometry
  const mouthGeometry = useMemo(() => {
    const points = [];
    const segments = 12;
    const width = 0.06 * widthMultiplier;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (t - 0.5) * width * 2;
      const y = -curve * 0.03 * Math.sin(t * Math.PI);
      points.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve3d = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve3d, segments, thickness, 8, false);
  }, [curve, widthMultiplier, thickness]);
  
  return (
    <mesh geometry={mouthGeometry} position={[0, -0.06, 0.16]}>
      <meshStandardMaterial color="#8B4513" roughness={0.5} />
    </mesh>
  );
};

export const AvatarHead: React.FC<AvatarHeadProps> = ({ 
  config, 
  mood = 'Neutral',
  segments = 24,
  animated = true
}) => {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  
  const headShape = HEAD_SHAPES[config.headShape] || HEAD_SHAPES.oval;
  const expression = getMoodExpression(mood);
  
  // Apply blinking animation
  useBlinkAnimation(leftEyeRef, rightEyeRef, animated);
  
  // Subtle head idle movement
  useFrame((state) => {
    if (!animated || !headRef.current) return;
    const time = state.clock.elapsedTime;
    headRef.current.rotation.y = Math.sin(time * 0.3) * 0.04;
    headRef.current.rotation.z = Math.sin(time * 0.25) * 0.02;
  });
  
  const skinMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: config.skinTone,
      roughness: 0.7,
      metalness: 0.1
    }), 
    [config.skinTone]
  );

  return (
    <group ref={headRef} position={[0, 0.28, 0]}>
      {/* Head base */}
      <mesh scale={[headShape.x, headShape.y, headShape.z]}>
        <sphereGeometry args={[0.16, segments, segments]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.15 * headShape.x, 0, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      <mesh position={[0.15 * headShape.x, 0, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      
      {/* Eyes */}
      <group position={[0, 0.03, 0.12]}>
        {/* Left Eye */}
        <group position={[-0.05, 0, 0]}>
          {/* Eye white */}
          <mesh ref={leftEyeRef} scale={[1, expression.eyeScale, 1]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color="white" roughness={0.3} />
          </mesh>
          {/* Iris */}
          <mesh position={[0, 0, 0.015]} scale={[1, expression.eyeScale, 1]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial color={config.eyeColor} roughness={0.4} />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.022]} scale={[1, expression.eyeScale, 1]}>
            <sphereGeometry args={[0.008, 12, 12]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
          </mesh>
          {/* Eye highlight */}
          <mesh position={[0.005, 0.005, 0.025]}>
            <sphereGeometry args={[0.004, 8, 8]} />
            <meshStandardMaterial color="white" roughness={0.1} emissive="white" emissiveIntensity={0.5} />
          </mesh>
        </group>
        
        {/* Right Eye */}
        <group position={[0.05, 0, 0]}>
          <mesh ref={rightEyeRef} scale={[1, expression.eyeScale, 1]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color="white" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.015]} scale={[1, expression.eyeScale, 1]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial color={config.eyeColor} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.022]} scale={[1, expression.eyeScale, 1]}>
            <sphereGeometry args={[0.008, 12, 12]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
          </mesh>
          <mesh position={[-0.005, 0.005, 0.025]}>
            <sphereGeometry args={[0.004, 8, 8]} />
            <meshStandardMaterial color="white" roughness={0.1} emissive="white" emissiveIntensity={0.5} />
          </mesh>
        </group>
        
        {/* Eyebrows */}
        <group position={[0, 0.045 + expression.browOffset, 0.01]}>
          {/* Left eyebrow */}
          <mesh position={[-0.05, 0, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.04, 0.008, 0.01]} />
            <meshStandardMaterial color={config.hairColor} roughness={0.8} />
          </mesh>
          {/* Right eyebrow */}
          <mesh position={[0.05, 0, 0]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.04, 0.008, 0.01]} />
            <meshStandardMaterial color={config.hairColor} roughness={0.8} />
          </mesh>
        </group>
      </group>
      
      {/* Nose */}
      <mesh position={[0, -0.01, 0.15]} rotation={[-0.3, 0, 0]}>
        <coneGeometry args={[
          config.noseType === 'large' ? 0.025 : config.noseType === 'small' ? 0.015 : 0.02,
          config.noseType === 'button' ? 0.015 : 0.03,
          8
        ]} />
        <primitive object={skinMaterial} attach="material" />
      </mesh>
      
      {/* Mouth */}
      <Mouth curve={expression.mouthCurve} mouthType={config.mouthType} />
    </group>
  );
};

export default AvatarHead;
