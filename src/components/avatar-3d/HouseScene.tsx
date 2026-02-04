/**
 * @file HouseScene.tsx
 * @description Big Brother House 3D environment with characters arranged in a circle
 */

import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterTemplate } from '@/data/character-templates';
import { RPMAvatar } from './RPMAvatar';
import { HouseFloor, Couch, CoffeeTable, Plant, LightFixture } from './HouseFurniture';

interface HouseSceneProps {
  characters: CharacterTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Calculate circular positions for characters
const getCharacterPositions = (count: number, radius: number = 5) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // Start from front
    return {
      position: [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ] as [number, number, number],
      rotation: [0, -angle + Math.PI, 0] as [number, number, number], // Face center
      angle
    };
  });
};

// Selection ring effect
const SelectionRing: React.FC<{ active: boolean }> = ({ active }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current && active) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.5;
      ringRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.05);
    }
  });
  
  if (!active) return null;
  
  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[0.6, 0.7, 32]} />
      <meshBasicMaterial color="#22c55e" transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Character spot with avatar
const CharacterSpot: React.FC<{
  template: CharacterTemplate;
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}> = ({ template, position, rotation, isSelected, isHovered, onSelect, onHover }) => {
  const groupRef = useRef<THREE.Group>(null);
  const modelUrl = template.avatar3DConfig?.modelUrl;
  
  useFrame(() => {
    if (groupRef.current) {
      // Subtle elevation for selected/hovered
      const targetY = isSelected ? 0.1 : isHovered ? 0.05 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1
      );
    }
  });
  
  return (
    <group position={position}>
      <group 
        ref={groupRef}
        rotation={rotation}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Character platform */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <cylinderGeometry args={[0.5, 0.6, 0.1, 32]} />
          <meshStandardMaterial 
            color={isSelected ? '#22c55e' : isHovered ? '#fbbf24' : '#1a1a2e'} 
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
        
        {/* Selection ring */}
        <SelectionRing active={isSelected} />
        
        {/* Avatar */}
        {modelUrl ? (
          <Suspense fallback={<AvatarPlaceholder />}>
            <RPMAvatar
              modelSrc={modelUrl}
              context="game"
              scale={1}
              position={[0, 0, 0]}
            />
          </Suspense>
        ) : (
          <AvatarPlaceholder />
        )}
        
        {/* Name label (visible on hover or selection) */}
        {(isHovered || isSelected) && (
          <Html
            position={[0, 2.2, 0]}
            center
            style={{
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <div className="px-3 py-1.5 rounded-full bg-black/80 border border-amber-500/50 backdrop-blur-sm">
              <span className="text-white text-sm font-bold">{template.name}</span>
              <span className="text-amber-400 text-xs ml-2">{template.tagline}</span>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

// Placeholder for loading avatars
const AvatarPlaceholder: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime();
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <capsuleGeometry args={[0.3, 0.8, 4, 16]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
};

// Loading indicator
const SceneLoader: React.FC = () => {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-black/80 backdrop-blur-sm border border-amber-500/30">
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-amber-400 text-sm font-medium">
          Loading House... {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
};

// Camera animation controller
const CameraController: React.FC<{ 
  focusPosition: [number, number, number] | null;
  defaultPosition: [number, number, number];
}> = ({ focusPosition, defaultPosition }) => {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  
  useFrame(() => {
    if (focusPosition) {
      targetRef.current.set(focusPosition[0] * 0.5, 1, focusPosition[2] * 0.5);
    } else {
      targetRef.current.set(0, 0, 0);
    }
    
    // Smooth camera look-at interpolation
    const currentTarget = new THREE.Vector3();
    camera.getWorldDirection(currentTarget);
  });
  
  return null;
};

// Main scene content
const SceneContent: React.FC<HouseSceneProps & { hoveredId: string | null; onHover: (id: string | null) => void }> = ({
  characters,
  selectedId,
  onSelect,
  hoveredId,
  onHover
}) => {
  const positions = getCharacterPositions(characters.length, 5);
  const selectedPosition = selectedId 
    ? positions[characters.findIndex(c => c.id === selectedId)]?.position 
    : null;
  
  return (
    <>
      {/* Environment lighting */}
      <Environment preset="apartment" />
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#fbbf24" />
      
      {/* Floor */}
      <HouseFloor />
      
      {/* Contact shadows for depth */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.5}
        scale={20}
        blur={2}
        far={10}
      />
      
      {/* Furniture arrangement */}
      <Couch position={[-7, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Couch position={[7, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Couch position={[0, 0, -7]} rotation={[0, 0, 0]} />
      <CoffeeTable position={[0, 0, 0]} />
      <Plant position={[-8, 0, 4]} scale={1.2} />
      <Plant position={[8, 0, 4]} scale={1} />
      <Plant position={[-8, 0, -4]} scale={0.8} />
      <Plant position={[8, 0, -4]} scale={1.1} />
      <LightFixture position={[0, 5, 0]} />
      
      {/* Characters in circle */}
      <Suspense fallback={<SceneLoader />}>
        {characters.map((char, i) => (
          <CharacterSpot
            key={char.id}
            template={char}
            position={positions[i].position}
            rotation={positions[i].rotation}
            isSelected={selectedId === char.id}
            isHovered={hoveredId === char.id}
            onSelect={() => onSelect(char.id)}
            onHover={(hovered) => onHover(hovered ? char.id : null)}
          />
        ))}
      </Suspense>
      
      {/* Camera animation */}
      <CameraController 
        focusPosition={selectedPosition || null} 
        defaultPosition={[0, 10, 15]}
      />
      
      {/* Orbit controls */}
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={25}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0.5, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
};

export const HouseScene: React.FC<HouseSceneProps> = ({
  characters,
  selectedId,
  onSelect
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ 
          position: [0, 10, 15], 
          fov: 45,
          near: 0.1,
          far: 100
        }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
      >
        <Suspense fallback={<SceneLoader />}>
          <SceneContent
            characters={characters}
            selectedId={selectedId}
            onSelect={onSelect}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        </Suspense>
      </Canvas>
      
      {/* Scene title overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-6 py-2 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30">
          <h2 className="text-amber-400 font-bold text-lg tracking-wide">
            🏠 THE BIG BROTHER HOUSE
          </h2>
        </div>
      </div>
      
      {/* Hint overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/60 text-sm">
          Drag to rotate • Scroll to zoom • Click to select
        </div>
      </div>
    </div>
  );
};

export default HouseScene;
