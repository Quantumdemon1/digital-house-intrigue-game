/**
 * @file DeLorean.tsx
 * @description Stylized DeLorean time machine built with Three.js primitives
 */

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface DeLoreanProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/** Single wheel with dark rim and rubber tire */
const Wheel: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position} rotation={[0, 0, Math.PI / 2]}>
    {/* Tire */}
    <mesh>
      <cylinderGeometry args={[0.28, 0.28, 0.18, 16]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
    {/* Rim */}
    <mesh>
      <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
      <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
    </mesh>
  </group>
);

/** Gullwing door */
const GullwingDoor: React.FC<{ position: [number, number, number]; side: 'left' | 'right' }> = ({ position, side }) => {
  const flip = side === 'left' ? -1 : 1;
  return (
    <group position={position} rotation={[0, 0, flip * 0.35]}>
      <mesh>
        <boxGeometry args={[0.05, 0.55, 1.1]} />
        <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.2} />
      </mesh>
      {/* Door window */}
      <mesh position={[flip * 0.01, 0.12, 0]}>
        <boxGeometry args={[0.02, 0.25, 0.8]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

export const DeLorean: React.FC<DeLoreanProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Subtle hover animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 1.5) * 0.03;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });

  const bodyMaterial = useMemo(() => ({
    color: '#C0C0C0' as const,
    metalness: 1,
    roughness: 0.2,
  }), []);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* === BODY === */}
      {/* Main body block */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.7, 0.45, 3.6]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* Upper cabin */}
      <mesh position={[0, 0.82, -0.2]}>
        <boxGeometry args={[1.5, 0.35, 1.8]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* Front hood – tapered */}
      <mesh position={[0, 0.5, 1.6]}>
        <boxGeometry args={[1.5, 0.25, 0.8]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* Rear trunk */}
      <mesh position={[0, 0.55, -1.6]}>
        <boxGeometry args={[1.5, 0.3, 0.6]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* === WINDSHIELD === */}
      <mesh position={[0, 0.88, 0.65]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[1.35, 0.02, 0.7]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.45} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.88, -1.0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.35, 0.02, 0.55]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.45} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* === GULLWING DOORS (slightly open) === */}
      <GullwingDoor position={[-0.85, 0.95, -0.2]} side="left" />
      <GullwingDoor position={[0.85, 0.95, -0.2]} side="right" />

      {/* === WHEELS === */}
      <Wheel position={[-0.85, 0.28, 1.15]} />
      <Wheel position={[0.85, 0.28, 1.15]} />
      <Wheel position={[-0.85, 0.28, -1.15]} />
      <Wheel position={[0.85, 0.28, -1.15]} />

      {/* === HEADLIGHTS === */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 2.01]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* === TAIL LIGHTS === */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -1.91]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* === FLUX CAPACITOR GLOW (rear) === */}
      <pointLight position={[0, 0.6, -2.0]} intensity={1.5} color="#3b82f6" distance={4} />

      {/* Flux housing on rear */}
      <mesh position={[0, 0.65, -1.92]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.05]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
      </mesh>

      {/* === TIME CIRCUIT DISPLAY (roof) === */}
      <mesh position={[0, 1.01, -0.4]}>
        <boxGeometry args={[0.4, 0.04, 0.25]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 1.03, -0.4]}>
        <boxGeometry args={[0.35, 0.02, 0.2]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} />
      </mesh>

      {/* === GROUND GLOW (time-travel effect) === */}
      <mesh ref={glowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 4.2]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.4}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Ground light */}
      <pointLight position={[0, 0.1, 0]} intensity={0.6} color="#3b82f6" distance={3} />
    </group>
  );
};

export default DeLorean;
