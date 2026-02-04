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

export default { HouseFloor, Couch, CoffeeTable, Plant, LightFixture };
