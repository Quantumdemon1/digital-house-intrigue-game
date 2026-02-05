/**
 * @file HouseScene.tsx
 * @description Big Brother House 3D environment with characters arranged in a circle
 */

import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react';
 import { useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterTemplate } from '@/data/character-templates';
 import { RPMAvatar, preloadRPMAvatar, PoseType, GestureType } from './RPMAvatar';
 import { Archetype } from '@/data/character-templates';
import { LivingRoom, HOHSuite, Bedroom, BathroomArea, KitchenExpanded, NominationLounge, GameRoom, DiaryRoomInterior, Hallway } from './HouseRooms';
import { GlassWall, LEDCoveLighting } from './HouseFurnitureExpanded';
 import { Backyard } from './BackyardArea';
 import DynamicRoomLighting from './DynamicRoomLighting';
 import { RoomNavigator, ROOM_CAMERA_POSITIONS } from './RoomNavigator';
 import { useEventLighting } from './hooks/useEventLighting';

// Easing function for smooth camera transitions
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

interface HouseSceneProps {
  characters: CharacterTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  playerId?: string;
  playerGesture?: GestureType | null;
  onGestureComplete?: () => void;
  /** Relationship data for reactive expressions: characterId -> score */
  relationships?: Record<string, number>;
   /** Current game phase for event-based lighting */
   gamePhase?: string;
   /** Show room navigation UI */
   showRoomNav?: boolean;
}

// Living room conversation cluster positions for natural groupings
const LIVING_ROOM_POSITIONS = [
  // Main sofa group (living room center)
  { position: [-3, 0, 1] as [number, number, number], rotation: [0, Math.PI / 4, 0] as [number, number, number] },
  { position: [-1, 0, 2] as [number, number, number], rotation: [0, Math.PI / 6, 0] as [number, number, number] },
  { position: [1, 0, 2] as [number, number, number], rotation: [0, -Math.PI / 6, 0] as [number, number, number] },
  { position: [3, 0, 1] as [number, number, number], rotation: [0, -Math.PI / 4, 0] as [number, number, number] },
  // Kitchen area
  { position: [10, 0, 0] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] },
  { position: [10, 0, 2] as [number, number, number], rotation: [0, -Math.PI / 3, 0] as [number, number, number] },
  // Near nomination lounge
  { position: [-2, 0, 8] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] },
  { position: [0, 0, 9] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] },
  { position: [2, 0, 8] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] },
  // Standing by memory wall
  { position: [-6, 0, -2] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
  { position: [-6, 0, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
  { position: [-6, 0, 2] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
];

// Get positions for characters based on count
const getCharacterPositions = (count: number) => {
  // Use living room positions, cycling if we have more characters
  return Array.from({ length: count }, (_, i) => {
    const posData = LIVING_ROOM_POSITIONS[i % LIVING_ROOM_POSITIONS.length];
    return {
      position: posData.position,
      rotation: posData.rotation,
      angle: posData.rotation[1]
    };
  });
};

/**
 * Expanded rectangular floor with room zones
 */
const ExpandedHouseFloor: React.FC = () => {
  return (
    <group>
      {/* Main floor - dark polished concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
        <planeGeometry args={[35, 30]} />
        <meshStandardMaterial 
          color="#0f172a"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      
      {/* Living room area highlight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      
      {/* Center BB logo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[1.8, 2.2, 64]} />
        <meshStandardMaterial 
          color="#fbbf24"
          roughness={0.4}
          metalness={0.6}
          emissive="#fbbf24"
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Eye center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[0.6, 1, 32]} />
        <meshStandardMaterial 
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      
      {/* Outer decorative border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[3.5, 3.7, 64]} />
        <meshStandardMaterial 
          color="#fbbf24"
          roughness={0.4}
          metalness={0.6}
          emissive="#fbbf24"
          emissiveIntensity={0.08}
        />
      </mesh>
      
      {/* Kitchen floor - marble effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.04, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial 
          color="#e2e8f0"
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
      
      {/* HOH Suite floor - carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -0.04, -10]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial 
          color="#4a1a4a"
          roughness={0.98}
          metalness={0}
        />
      </mesh>
      
      {/* Bedroom floors - dark wood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -0.04, -10]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial 
          color="#2a1810"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -10]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial 
          color="#2a1810"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Bathroom floor - geometric tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, -0.04, 3]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial 
          color="#94a3b8"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Nomination area floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 10]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial 
          color="#1e1e2e"
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      
      {/* Game room floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.04, 8]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};

/**
 * Exterior walls surrounding the house
 */
const HouseWalls: React.FC = () => {
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#0a0f1a',
    roughness: 0.9,
    metalness: 0.1
  });
  
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 2, -14]} castShadow receiveShadow>
        <boxGeometry args={[36, 4, 0.3]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      {/* Front wall sections */}
      <mesh position={[-14, 2, 14]} castShadow receiveShadow>
        <boxGeometry args={[8, 4, 0.3]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      <mesh position={[14, 2, 14]} castShadow receiveShadow>
        <boxGeometry args={[8, 4, 0.3]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-17, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 4, 28]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[17, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 4, 28]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      {/* Decorative wall stripes */}
      {[-17, 17].map((x, i) => (
        <mesh key={i} position={[x + (i === 0 ? 0.2 : -0.2), 1.5, 0]}>
          <boxGeometry args={[0.02, 0.1, 27]} />
          <meshStandardMaterial 
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* Back wall accent stripe */}
      <mesh position={[0, 1.5, -13.85]}>
        <boxGeometry args={[35, 0.1, 0.02]} />
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* BB Eye logos on walls */}
      <mesh position={[0, 3, -13.8]}>
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshStandardMaterial 
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

/**
 * Interior wall partitions
 */
const InteriorWalls: React.FC = () => {
  return (
    <group>
      {/* Bedroom divider wall */}
      <mesh position={[-5, 1.5, -10]} castShadow>
        <boxGeometry args={[0.15, 3, 6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      
      {/* Bedroom to HOH divider */}
      <mesh position={[5, 1.5, -10]} castShadow>
        <boxGeometry args={[0.15, 3, 6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      
      {/* Hallway back wall */}
      <mesh position={[0, 1.5, -6]} castShadow>
        <boxGeometry args={[30, 3, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      
      {/* Bathroom wall */}
      <mesh position={[-9, 1.5, 3]} castShadow>
        <boxGeometry args={[0.15, 3, 5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      
      {/* Kitchen divider (partial) */}
      <mesh position={[8, 1.5, -2]} castShadow>
        <boxGeometry args={[0.15, 3, 4]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      
      {/* Game room divider */}
      <mesh position={[9, 1.5, 5]} castShadow>
        <boxGeometry args={[0.15, 3, 2]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      
      {/* Nomination area partial wall */}
      <mesh position={[-5, 1.5, 8]} castShadow>
        <boxGeometry args={[4, 3, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh position={[5, 1.5, 8]} castShadow>
        <boxGeometry args={[4, 3, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
    </group>
  );
};

 // Map archetype to pose types - all use relaxed pose for consistency
 const ARCHETYPE_POSES: Record<Archetype, PoseType[]> = {
   strategist: ['relaxed'],
   competitor: ['relaxed'],
   socialite: ['relaxed'],
   wildcard: ['relaxed'],
   underdog: ['relaxed'],
 };
 
 // Get pose for a character based on their archetype and index
 const getPoseForCharacter = (archetype: Archetype, index: number): PoseType => {
   const poses = ARCHETYPE_POSES[archetype];
   return poses[index % poses.length];
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

// Character spot with avatar and idle animations
const CharacterSpot: React.FC<{
  template: CharacterTemplate;
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  index: number;
   selectedPosition: [number, number, number] | null;
   selectedId: string | null;
   isPlayer?: boolean;
   playerGesture?: GestureType | null;
   onGestureComplete?: () => void;
   relationshipToSelected?: number;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
 }> = ({ 
   template, position, rotation, isSelected, isHovered, index, 
   selectedPosition, selectedId, isPlayer, playerGesture, onGestureComplete,
   relationshipToSelected, onSelect, onHover 
 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const idleGroupRef = useRef<THREE.Group>(null);
  const modelUrl = template.avatar3DConfig?.modelUrl;
   
   // Get pose type based on archetype
   const poseType = getPoseForCharacter(template.archetype, index);
   
   // Calculate look-at target
   const lookAtTarget = React.useMemo(() => {
     if (isSelected) {
       // Selected character looks straight ahead (no special target)
       return null;
     } else if (selectedId && selectedPosition) {
       // Other characters look at selected character
       return new THREE.Vector3(selectedPosition[0], 1.5, selectedPosition[2]);
     }
     // Default: no specific target (look forward)
     return null;
   }, [isSelected, selectedId, selectedPosition]);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle elevation for selected/hovered
      const targetY = isSelected ? 0.1 : isHovered ? 0.05 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1
      );
    }
    
    // Idle animation - staggered per character
    if (idleGroupRef.current) {
      const time = clock.getElapsedTime();
      const phase = index * 0.5; // Offset per character for variety
      
      // Breathing animation (subtle scale)
      const breath = Math.sin(time * 1.5 + phase) * 0.008;
      idleGroupRef.current.scale.set(1 + breath, 1, 1 + breath * 0.5);
      
      // Weight shift sway (subtle rotation)
      const sway = Math.sin(time * 0.5 + phase) * 0.012;
      idleGroupRef.current.rotation.z = sway;
      
      // Very subtle forward/back lean
      const lean = Math.sin(time * 0.3 + phase * 1.5) * 0.005;
      idleGroupRef.current.rotation.x = lean;
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
        
        {/* Avatar with idle animation wrapper */}
        <group ref={idleGroupRef}>
          {modelUrl ? (
            <Suspense fallback={<AvatarPlaceholder />}>
              <RPMAvatar
                modelSrc={modelUrl}
                context="game"
                scale={1}
                position={[0, 0, 0]}
                applyIdlePose={true}
                phaseOffset={index * 0.7}
                poseType={poseType}
                lookAtTarget={lookAtTarget}
                worldPosition={position}
                worldRotationY={rotation[1]}
                isPlayer={isPlayer}
                enableGestures={isPlayer}
                gestureToPlay={isPlayer ? playerGesture : null}
                onGestureComplete={isPlayer ? onGestureComplete : undefined}
                relationshipToSelected={relationshipToSelected ?? 0}
                selectedIsNominee={false}
                selectedIsHoH={false}
                hasSelection={!!selectedId}
              />
            </Suspense>
          ) : (
            <AvatarPlaceholder />
          )}
        </group>
        
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

// Camera fly-to animation controller
const CameraController: React.FC<{ 
  focusPosition: [number, number, number] | null;
   roomTarget: { camera: [number, number, number]; target: [number, number, number] } | null;
  defaultPosition: [number, number, number];
  controlsRef: React.RefObject<any>;
 }> = ({ focusPosition, roomTarget, defaultPosition, controlsRef }) => {
  const { camera } = useThree();
  
  // Animation state
  const animating = useRef(false);
  const progress = useRef(0);
  const startCameraPos = useRef(new THREE.Vector3());
  const targetCameraPos = useRef(new THREE.Vector3());
  const startLookAt = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const lastFocusPosition = useRef<[number, number, number] | null>(null);
  
  // Detect focus changes and start animation
  useEffect(() => {
     // Room navigation takes priority
     if (roomTarget) {
       startCameraPos.current.copy(camera.position);
       if (controlsRef.current) {
         startLookAt.current.copy(controlsRef.current.target);
       }
       targetCameraPos.current.set(...roomTarget.camera);
       targetLookAt.current.set(...roomTarget.target);
       progress.current = 0;
       animating.current = true;
       return;
     }
     
    const focusChanged = 
      (focusPosition === null && lastFocusPosition.current !== null) ||
      (focusPosition !== null && lastFocusPosition.current === null) ||
      (focusPosition && lastFocusPosition.current && 
        (focusPosition[0] !== lastFocusPosition.current[0] ||
         focusPosition[2] !== lastFocusPosition.current[2]));
    
    if (focusChanged) {
      // Store current camera position
      startCameraPos.current.copy(camera.position);
      
      // Store current look-at (from controls target)
      if (controlsRef.current) {
        startLookAt.current.copy(controlsRef.current.target);
      }
      
      if (focusPosition) {
        // Calculate target position: behind and above character, looking at them
        const charX = focusPosition[0];
        const charZ = focusPosition[2];
        
        // Position camera behind character relative to center
        const angle = Math.atan2(charZ, charX);
        const distance = 4;
        targetCameraPos.current.set(
          charX + Math.cos(angle) * distance,
          3,
          charZ + Math.sin(angle) * distance
        );
        
        // Look at character position
        targetLookAt.current.set(charX, 1.2, charZ);
      } else {
        // Return to default overview
        targetCameraPos.current.set(defaultPosition[0], defaultPosition[1], defaultPosition[2]);
        targetLookAt.current.set(0, 0.5, 0);
      }
      
      // Start animation
      progress.current = 0;
      animating.current = true;
      lastFocusPosition.current = focusPosition;
    }
  }, [focusPosition, roomTarget, camera, defaultPosition, controlsRef]);
  
  useFrame((_, delta) => {
    if (!animating.current) return;
    
    // Advance animation
    progress.current = Math.min(progress.current + delta * 1.2, 1);
    const t = easeInOutCubic(progress.current);
    
    // Interpolate camera position
    camera.position.lerpVectors(startCameraPos.current, targetCameraPos.current, t);
    
    // Interpolate look-at target
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(startLookAt.current, targetLookAt.current, t);
      controlsRef.current.update();
    }
    
    // End animation
    if (progress.current >= 1) {
      animating.current = false;
    }
  });
  
  return null;
};

// Main scene content
const SceneContent: React.FC<HouseSceneProps & { 
  hoveredId: string | null; 
  onHover: (id: string | null) => void;
   roomTarget: { camera: [number, number, number]; target: [number, number, number] } | null;
   lightingState: ReturnType<typeof useEventLighting>;
}> = ({
  characters,
  selectedId,
  onSelect,
  playerId,
  playerGesture,
  onGestureComplete,
  relationships = {},
  hoveredId,
   onHover,
   roomTarget,
   lightingState,
}) => {
  const positions = getCharacterPositions(characters.length);
  const selectedPosition = selectedId 
    ? positions[characters.findIndex(c => c.id === selectedId)]?.position 
    : null;
  
  // Ref for OrbitControls to allow programmatic updates
  const controlsRef = useRef<any>(null);
  
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
      <ExpandedHouseFloor />
      
      {/* Exterior walls */}
      <HouseWalls />
      
      {/* Interior partitions */}
      <InteriorWalls />
      
      {/* Contact shadows for depth */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.5}
        scale={40}
        blur={2}
        far={15}
      />
      
      {/* === ROOM SECTIONS === */}
      
      {/* Living Room - Center */}
      <LivingRoom position={[0, 0, 0]} />
      
      {/* HOH Suite - Top Right */}
      <HOHSuite position={[10, 0, -10]} />
      
      {/* Bedrooms - Top Left and Center */}
      <Bedroom position={[-10, 0, -10]} variant="regular" />
      <Bedroom position={[0, 0, -10]} variant="havenot" />
      
      {/* Kitchen - Right Side */}
      <KitchenExpanded position={[12, 0, 0]} />
      
      {/* Bathroom - Left Side */}
      <BathroomArea position={[-12, 0, 3]} />
      
      {/* Nomination/Lounge - Front Center */}
      <NominationLounge position={[0, 0, 11]} />
       
       {/* Backyard Area - extends from back of house */}
       <Backyard position={[0, 0, -22]} eventColor={lightingState.colors.primary} />
       
       {/* Dynamic room lighting based on game phase */}
       <DynamicRoomLighting
         event={lightingState.event}
         colors={lightingState.colors}
         pulseSpeed={lightingState.pulseSpeed}
         transitionProgress={lightingState.transitionProgress}
       />
      
      {/* Game Room - Front Right */}
      <GameRoom position={[12, 0, 9]} />
      
      {/* Diary Room Interior - Left Side */}
      <DiaryRoomInterior position={[-14, 0, -3]} />
      
      {/* Hallway connecting rooms */}
      <Hallway position={[0, 0, -6]} length={28} />
      
      {/* === GLASS PARTITIONS === */}
      
      {/* Living room to nomination glass */}
      <GlassWall position={[0, 1.5, 5.5]} width={8} height={3} />
      
      {/* Kitchen glass partition */}
      <GlassWall position={[8, 1.5, 2]} rotation={[0, Math.PI / 2, 0]} width={4} height={3} />
      
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
            index={i}
            selectedPosition={selectedPosition || null}
            selectedId={selectedId}
            isPlayer={char.id === playerId}
            playerGesture={char.id === playerId ? playerGesture : null}
            onGestureComplete={char.id === playerId ? onGestureComplete : undefined}
            relationshipToSelected={selectedId ? relationships[selectedId] : 0}
            onSelect={() => onSelect(char.id)}
            onHover={(hovered) => onHover(hovered ? char.id : null)}
          />
        ))}
      </Suspense>
      
      {/* Camera fly-to animation */}
      <CameraController 
        focusPosition={selectedPosition || null} 
         roomTarget={roomTarget}
        defaultPosition={[0, 18, 25]}
        controlsRef={controlsRef}
      />
      
      {/* Orbit controls with ref for programmatic access */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={5}
        maxDistance={40}
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
  onSelect,
  playerId,
  playerGesture,
  onGestureComplete,
  relationships,
   gamePhase,
   showRoomNav = true,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
   const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
   
   // Event-based lighting
   const lightingState = useEventLighting(gamePhase);
   
   // Get room camera target
   const roomTarget = useMemo(() => {
     if (!selectedRoom || !ROOM_CAMERA_POSITIONS[selectedRoom]) return null;
     return ROOM_CAMERA_POSITIONS[selectedRoom];
   }, [selectedRoom]);
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ 
          position: [0, 18, 25], 
          fov: 45,
          near: 0.1,
          far: 150
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
            playerId={playerId}
            playerGesture={playerGesture}
            onGestureComplete={onGestureComplete}
            relationships={relationships}
            hoveredId={hoveredId}
            onHover={setHoveredId}
           roomTarget={roomTarget}
           lightingState={lightingState}
          />
        </Suspense>
      </Canvas>
     
     {/* Room Navigator UI */}
     {showRoomNav && (
       <div className="absolute top-16 left-4 z-10">
         <RoomNavigator
           currentRoom={selectedRoom}
           onNavigate={(roomId) => {
             setSelectedRoom(roomId);
             // Clear room selection after animation completes
             setTimeout(() => setSelectedRoom(null), 2500);
           }}
         />
       </div>
     )}
      
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
