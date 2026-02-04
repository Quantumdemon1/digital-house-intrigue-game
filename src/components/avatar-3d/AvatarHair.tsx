/**
 * @file avatar-3d/AvatarHair.tsx
 * @description Modern toon-shaded hair for chibi avatars
 */

import React, { useMemo } from 'react';
import { Outlines } from '@react-three/drei';
import { Avatar3DConfig } from '@/models/avatar-config';
import { useHairMaterial, CHIBI_PROPORTIONS, OUTLINE_COLOR, OUTLINE_THICKNESS } from './materials/ToonMaterials';

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
  segments = 28 
}) => {
  const headOffset = HEAD_OFFSETS[config.headShape] || HEAD_OFFSETS.round;
  const hairMaterial = useHairMaterial(config.hairColor);
  
  // Chibi head is larger
  const headScale = CHIBI_PROPORTIONS.headScale;
  const baseRadius = 0.18 * headScale;

  const renderHair = () => {
    switch (config.hairStyle) {
      case 'bald':
        return null;
        
      case 'buzz':
        // Very short, close to head
        return (
          <mesh 
            position={[0, 0.32 + headOffset.y, 0]} 
            scale={headOffset.scale}
          >
            <sphereGeometry args={[baseRadius * 1.02, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <primitive object={hairMaterial} attach="material" />
            <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
          </mesh>
        );
        
      case 'short':
        // Fuller short hair with volume
        return (
          <group position={[0, 0.32 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Main hair volume */}
            <mesh position={[0, 0.04, -0.01]}>
              <sphereGeometry args={[baseRadius * 1.08, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Cute bangs/fringe */}
            <mesh position={[0, 0.02, baseRadius * 0.8]} rotation={[0.4, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
          </group>
        );
        
      case 'medium':
        // Shoulder-length fluffy hair
        return (
          <group position={[0, 0.32 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Top volume */}
            <mesh position={[0, 0.05, -0.01]}>
              <sphereGeometry args={[baseRadius * 1.1, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Side hair - fluffy */}
            <mesh position={[-0.15, -0.06, -0.02]}>
              <capsuleGeometry args={[0.07, 0.12, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            <mesh position={[0.15, -0.06, -0.02]}>
              <capsuleGeometry args={[0.07, 0.12, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Back volume */}
            <mesh position={[0, -0.04, -0.1]} scale={[1.3, 1, 0.7]}>
              <capsuleGeometry args={[0.1, 0.1, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Cute bangs */}
            <mesh position={[0, 0.03, baseRadius * 0.75]} rotation={[0.35, 0, 0]}>
              <sphereGeometry args={[0.09, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
          </group>
        );
        
      case 'long':
        // Long flowing anime hair
        return (
          <group position={[0, 0.32 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Top volume */}
            <mesh position={[0, 0.05, -0.01]}>
              <sphereGeometry args={[baseRadius * 1.08, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Left side - long flowing */}
            <mesh position={[-0.14, -0.15, -0.02]} rotation={[0, 0, 0.08]}>
              <capsuleGeometry args={[0.06, 0.2, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Right side - long flowing */}
            <mesh position={[0.14, -0.15, -0.02]} rotation={[0, 0, -0.08]}>
              <capsuleGeometry args={[0.06, 0.2, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Back - long */}
            <mesh position={[0, -0.18, -0.08]} scale={[1.5, 1, 0.5]}>
              <capsuleGeometry args={[0.08, 0.25, 8, segments]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Anime bangs - swept */}
            <mesh position={[-0.04, 0.04, baseRadius * 0.78]} rotation={[0.3, 0.1, 0.1]}>
              <sphereGeometry args={[0.07, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            <mesh position={[0.04, 0.03, baseRadius * 0.78]} rotation={[0.3, -0.1, -0.1]}>
              <sphereGeometry args={[0.06, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
          </group>
        );
        
      case 'ponytail':
        // Cute high ponytail
        return (
          <group position={[0, 0.32 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Pulled back top */}
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[baseRadius * 1.05, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Ponytail base/scrunchie */}
            <mesh position={[0, 0.08, -baseRadius * 0.85]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Ponytail - bouncy */}
            <mesh position={[0, -0.05, -baseRadius * 0.95]} rotation={[0.4, 0, 0]}>
              <capsuleGeometry args={[0.045, 0.18, 8, 16]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Cute side bangs */}
            <mesh position={[-0.08, 0.02, baseRadius * 0.7]} rotation={[0.3, 0.2, 0.1]}>
              <sphereGeometry args={[0.045, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            <mesh position={[0.08, 0.02, baseRadius * 0.7]} rotation={[0.3, -0.2, -0.1]}>
              <sphereGeometry args={[0.045, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
          </group>
        );
        
      case 'bun':
        // Cute top bun
        return (
          <group position={[0, 0.32 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Slicked back base */}
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[baseRadius * 1.03, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Cute round bun on top */}
            <mesh position={[0, 0.16, -0.04]}>
              <sphereGeometry args={[0.08, 20, 20]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Side pieces */}
            <mesh position={[-0.12, -0.02, 0.06]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
            <mesh position={[0.12, -0.02, 0.06]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <primitive object={hairMaterial} attach="material" />
            </mesh>
          </group>
        );
        
      case 'curly':
        // Voluminous cute curly hair
        return (
          <group position={[0, 0.32 + headOffset.y, 0]} scale={headOffset.scale}>
            {/* Main volume - big and fluffy */}
            <mesh position={[0, 0.06, -0.01]}>
              <sphereGeometry args={[baseRadius * 1.22, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
            {/* Extra curl clusters */}
            {[...Array(10)].map((_, i) => {
              const angle = (i / 10) * Math.PI * 2;
              const x = Math.cos(angle) * 0.18;
              const z = Math.sin(angle) * 0.14 - 0.02;
              const y = -0.02 + (i % 2) * 0.03;
              return (
                <mesh 
                  key={i}
                  position={[x, y, z]}
                  scale={[0.9, 0.8, 0.9]}
                >
                  <sphereGeometry args={[0.055, 12, 12]} />
                  <primitive object={hairMaterial} attach="material" />
                  <Outlines thickness={OUTLINE_THICKNESS * 0.8} color={OUTLINE_COLOR} />
                </mesh>
              );
            })}
            {/* Curly bangs */}
            <mesh position={[0, 0.04, baseRadius * 0.7]} rotation={[0.35, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
              <primitive object={hairMaterial} attach="material" />
              <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
            </mesh>
          </group>
        );
        
      default:
        return null;
    }
  };

  return <>{renderHair()}</>;
};

export default AvatarHair;
