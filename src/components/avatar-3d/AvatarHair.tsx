/**
 * @file avatar-3d/AvatarHair.tsx
 * @description Hair mesh variations for Sims-style avatars
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Avatar3DConfig, HairStyle } from '@/models/avatar-config';

interface AvatarHairProps {
  config: Avatar3DConfig;
  segments?: number;
}

// Head shape affects hair position
const HEAD_OFFSETS: Record<string, { y: number; scale: number }> = {
  round: { y: 0, scale: 1.0 },
  oval: { y: 0.01, scale: 0.98 },
  square: { y: -0.005, scale: 1.02 },
  heart: { y: 0.005, scale: 0.97 }
};

export const AvatarHair: React.FC<AvatarHairProps> = ({ 
  config, 
  segments = 24 
}) => {
  const headOffset = HEAD_OFFSETS[config.headShape] || HEAD_OFFSETS.oval;
  
  const hairMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: config.hairColor,
      roughness: 0.85,
      metalness: 0.05
    }), 
    [config.hairColor]
  );

  const renderHair = () => {
    switch (config.hairStyle) {
      case 'bald':
        return null;
        
      case 'buzz':
        // Very short, close to head
        return (
          <mesh 
            position={[0, 0.28 + headOffset.y, 0]} 
            scale={headOffset.scale}
          >
            <sphereGeometry args={[0.165, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <primitive object={hairMaterial} attach="material" />
          </mesh>
        );
        
      case 'short':
        // Fuller short hair
        return (
          <group position={[0, 0.28 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Main hair volume */}
            <mesh position={[0, 0.03, -0.01]}>
              <sphereGeometry args={[0.175, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Side volume */}
            <mesh position={[-0.08, -0.02, 0]} scale={[0.7, 0.6, 0.8]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            <mesh position={[0.08, -0.02, 0]} scale={[0.7, 0.6, 0.8]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
          </group>
        );
        
      case 'medium':
        // Shoulder-length hair
        return (
          <group position={[0, 0.28 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Top volume */}
            <mesh position={[0, 0.04, -0.01]}>
              <sphereGeometry args={[0.18, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Side hair extending down */}
            <mesh position={[-0.12, -0.08, -0.02]}>
              <capsuleGeometry args={[0.06, 0.15, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            <mesh position={[0.12, -0.08, -0.02]}>
              <capsuleGeometry args={[0.06, 0.15, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Back hair */}
            <mesh position={[0, -0.05, -0.1]} scale={[1.2, 1, 0.6]}>
              <capsuleGeometry args={[0.1, 0.12, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
          </group>
        );
        
      case 'long':
        // Long flowing hair
        return (
          <group position={[0, 0.28 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Top volume */}
            <mesh position={[0, 0.04, -0.01]}>
              <sphereGeometry args={[0.18, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Left side - long */}
            <mesh position={[-0.12, -0.15, -0.02]} rotation={[0, 0, 0.1]}>
              <capsuleGeometry args={[0.055, 0.25, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Right side - long */}
            <mesh position={[0.12, -0.15, -0.02]} rotation={[0, 0, -0.1]}>
              <capsuleGeometry args={[0.055, 0.25, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Back - long flowing */}
            <mesh position={[0, -0.18, -0.08]} scale={[1.4, 1, 0.5]}>
              <capsuleGeometry args={[0.08, 0.3, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
          </group>
        );
        
      case 'ponytail':
        // Hair pulled back with tail
        return (
          <group position={[0, 0.28 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Pulled back top */}
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.17, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Ponytail base */}
            <mesh position={[0, 0, -0.14]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Ponytail length */}
            <mesh position={[0, -0.12, -0.16]} rotation={[0.3, 0, 0]}>
              <capsuleGeometry args={[0.04, 0.18, 8, 16]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
          </group>
        );
        
      case 'bun':
        // Hair in a bun on top
        return (
          <group position={[0, 0.28 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Slicked back base */}
            <mesh position={[0, 0.03, 0]}>
              <sphereGeometry args={[0.168, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Bun on top */}
            <mesh position={[0, 0.12, -0.05]}>
              <sphereGeometry args={[0.07, 20, 20]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
          </group>
        );
        
      case 'curly':
        // Voluminous curly hair
        return (
          <group position={[0, 0.28 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Main volume - larger and more textured */}
            <mesh position={[0, 0.05, -0.01]}>
              <sphereGeometry args={[0.21, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            {/* Extra curl clusters */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = Math.cos(angle) * 0.15;
              const z = Math.sin(angle) * 0.12 - 0.02;
              const y = -0.02 + Math.random() * 0.04;
              return (
                <mesh 
                  key={i}
                  position={[x, y, z]}
                  scale={[0.8, 0.7, 0.8]}
                >
                  <sphereGeometry args={[0.06, 12, 12]} />
                  <primitive object={hairMaterial} attach="material" />
                </mesh>
              );
            })}
          </group>
        );
        
      default:
        return null;
    }
  };

  return <>{renderHair()}</>;
};

export default AvatarHair;
