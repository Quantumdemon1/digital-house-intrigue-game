/**
 * @file HouseFurniture.tsx
 * @description Procedural furniture components for the Big Brother House 3D scene
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shared materials
const woodMaterial = new THREE.MeshStandardMaterial({ 
  color: '#3a2a1a', 
  roughness: 0.8, 
  metalness: 0.1 
});

const fabricMaterial = new THREE.MeshStandardMaterial({ 
  color: '#2a3a5a', 
  roughness: 0.9, 
  metalness: 0 
});

const metalMaterial = new THREE.MeshStandardMaterial({ 
  color: '#888888', 
  roughness: 0.3, 
  metalness: 0.8 
});

/**
 * Main floor/platform for the house
 */
export const HouseFloor: React.FC = () => {
  return (
    <group>
      {/* Main circular platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      
      {/* Decorative center ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[3.5, 4, 64]} />
        <meshStandardMaterial 
          color="#fbbf24"
          roughness={0.4}
          metalness={0.6}
          emissive="#fbbf24"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Outer decorative ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[9, 9.3, 64]} />
        <meshStandardMaterial 
          color="#fbbf24"
          roughness={0.4}
          metalness={0.6}
          emissive="#fbbf24"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* BB Logo in center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial 
          color="#0f172a"
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      
      {/* Eye logo accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshStandardMaterial 
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};

/**
 * Stylized couch
 */
export const Couch: React.FC<{ 
  position: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Base/seat */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.5, 1]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, 0.8, -0.35]} castShadow>
        <boxGeometry args={[2.5, 0.7, 0.3]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
      </mesh>
      
      {/* Left armrest */}
      <mesh position={[-1.1, 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 1]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
      </mesh>
      
      {/* Right armrest */}
      <mesh position={[1.1, 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 1]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
      </mesh>
      
      {/* Legs */}
      {[[-1, 0.1, 0.3], [1, 0.1, 0.3], [-1, 0.1, -0.3], [1, 0.1, -0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      
      {/* Cushion accent */}
      <mesh position={[0, 0.45, 0.1]}>
        <boxGeometry args={[0.5, 0.25, 0.4]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.85} />
      </mesh>
    </group>
  );
};

/**
 * Coffee table in center
 */
export const CoffeeTable: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Table top - glass effect */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.08, 32]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          roughness={0.1} 
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Metal rim */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[1.2, 0.02, 8, 32]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Center support */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.04, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
};

/**
 * Decorative plant
 */
export const Plant: React.FC<{ 
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  const leavesRef = useRef<THREE.Group>(null);
  
  // Subtle sway animation
  useFrame(({ clock }) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
  });
  
  // Generate random leaf positions
  const leaves = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 0.4,
        0.6 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.4
      ] as [number, number, number],
      rotation: [
        Math.random() * 0.5 - 0.25,
        (i / 8) * Math.PI * 2,
        Math.random() * 0.3
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.2
    }));
  }, []);
  
  return (
    <group position={position} scale={scale}>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.4, 16]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
      
      {/* Pot rim */}
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[0.25, 0.02, 8, 16]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
      </mesh>
      
      {/* Soil */}
      <mesh position={[0, 0.38, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      
      {/* Leaves */}
      <group ref={leavesRef}>
        {leaves.map((leaf, i) => (
          <mesh 
            key={i} 
            position={leaf.position} 
            rotation={leaf.rotation}
            scale={leaf.scale}
          >
            <coneGeometry args={[0.15, 0.4, 4]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? '#228b22' : '#2d9d2d'} 
              roughness={0.8} 
            />
          </mesh>
        ))}
        
        {/* Center stem/trunk */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Overhead light fixture
 */
export const LightFixture: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Cord */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      
      {/* Fixture base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.15, 0.2, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Light shade */}
      <mesh position={[0, -0.3, 0]}>
        <coneGeometry args={[0.6, 0.5, 16, 1, true]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          roughness={0.3} 
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#fff8e1" 
          emissive="#fbbf24"
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Point light for actual illumination */}
      <pointLight 
        position={[0, -0.5, 0]} 
        intensity={0.8} 
        color="#fbbf24" 
        distance={15}
        decay={2}
      />
    </group>
  );
};

/**
 * TV Stand with entertainment center and animated screen
 */
export const TVStand: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const screenRef = useRef<THREE.Mesh>(null);
  
  // Subtle screen flicker
  useFrame(({ clock }) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
    }
  });
  
  return (
    <group position={position}>
      {/* Entertainment unit base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.8, 0.8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Decorative drawers */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0.41]} castShadow>
          <boxGeometry args={[1.1, 0.6, 0.02]} />
          <meshStandardMaterial color="#2a2a3e" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
      
      {/* Drawer handles */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0.45]} castShadow>
          <boxGeometry args={[0.4, 0.05, 0.05]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      
      {/* TV mounting pole */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* TV screen frame */}
      <mesh position={[0, 2.2, 0.1]} castShadow>
        <boxGeometry args={[3.5, 2, 0.15]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* TV screen with BB logo/eye effect */}
      <mesh ref={screenRef} position={[0, 2.2, 0.2]}>
        <planeGeometry args={[3.2, 1.8]} />
        <meshStandardMaterial 
          color="#0f172a"
          emissive="#3b82f6"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      
      {/* BB Eye logo on screen */}
      <mesh position={[0, 2.2, 0.25]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Inner eye pupil */}
      <mesh position={[0, 2.2, 0.26]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial 
          color="#0f172a"
          emissive="#1e40af"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Screen glow light */}
      <pointLight position={[0, 2.2, 1]} intensity={0.3} color="#3b82f6" distance={5} />
    </group>
  );
};

/**
 * Bar stool component
 */
export const BarStool: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Seat cushion */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.9} />
      </mesh>
      
      {/* Center pole */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Base ring */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.2, 0.03, 8, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Footrest ring */}
      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
};

/**
 * Kitchen area with counter, cabinets, and bar stools
 */
export const KitchenArea: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Main counter */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 1.2]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.3} />
      </mesh>
      
      {/* Counter top (marble effect) */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[3.2, 0.08, 1.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Upper cabinets */}
      <mesh position={[0, 2.2, -0.3]} castShadow>
        <boxGeometry args={[3, 1, 0.5]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Cabinet doors */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} position={[x, 2.2, -0.04]} castShadow>
          <boxGeometry args={[0.9, 0.9, 0.02]} />
          <meshStandardMaterial color="#2a4a6f" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
      
      {/* Cabinet handles */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} position={[x, 2.2, 0]} castShadow>
          <boxGeometry args={[0.2, 0.04, 0.04]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      
      {/* Back wall panel */}
      <mesh position={[0, 1.6, -0.55]} receiveShadow>
        <boxGeometry args={[3.2, 1, 0.05]} />
        <meshStandardMaterial color="#334155" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Pendant lights */}
      {[-0.8, 0.8].map((x, i) => (
        <group key={i} position={[x, 3, 0.3]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <coneGeometry args={[0.15, 0.2, 16]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.5} />
          </mesh>
          <pointLight position={[0, -0.5, 0]} intensity={0.4} color="#fbbf24" distance={4} />
        </group>
      ))}
      
      {/* Bar stools */}
      <BarStool position={[-0.8, 0, 1.2]} />
      <BarStool position={[0.3, 0, 1.3]} />
      <BarStool position={[1.2, 0, 1.2]} />
    </group>
  );
};

/**
 * Diary Room Door - iconic Big Brother element
 */
export const DiaryRoomDoor: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Animated "on-air" light
  useFrame(({ clock }) => {
    const pulse = (Math.sin(clock.getElapsedTime() * 2) + 1) / 2;
    if (lightRef.current) {
      lightRef.current.intensity = 0.3 + pulse * 0.4;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1 + pulse * 1.5;
    }
  });
  
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Door frame */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[1.4, 2.8, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, 1.3, 0.12]} castShadow>
        <boxGeometry args={[1.1, 2.5, 0.1]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[0.4, 1.2, 0.2]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* "DIARY ROOM" sign background */}
      <mesh position={[0, 2.1, 0.2]}>
        <boxGeometry args={[0.9, 0.25, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
      </mesh>
      
      {/* Sign border */}
      <mesh position={[0, 2.1, 0.23]}>
        <boxGeometry args={[0.95, 0.3, 0.01]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* On-air light indicator */}
      <mesh ref={glowRef} position={[0, 2.8, 0.15]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial 
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Light bulb housing */}
      <mesh position={[0, 2.8, 0.1]}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      
      {/* Actual light */}
      <pointLight 
        ref={lightRef}
        position={[0, 2.8, 0.3]} 
        intensity={0.5} 
        color="#dc2626" 
        distance={3}
      />
      
      {/* Frame glow accent */}
      <mesh position={[0, 1.3, 0.25]}>
        <boxGeometry args={[1.2, 2.6, 0.01]} />
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

/**
 * Curved wall panel for room backdrop
 */
export const WallPanel: React.FC<{ 
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
}> = ({ position, rotation = [0, 0, 0], width = 4 }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Main wall panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 4, 0.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Decorative stripe */}
      <mesh position={[0, 1, 0.11]}>
        <boxGeometry args={[width - 0.2, 0.1, 0.02]} />
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* BB logo accent */}
      <mesh position={[0, 2.5, 0.11]}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshStandardMaterial 
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

export default { 
  HouseFloor, Couch, CoffeeTable, Plant, LightFixture,
  TVStand, BarStool, KitchenArea, DiaryRoomDoor, WallPanel 
};
