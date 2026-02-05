/**
 * @file DeLorean.tsx
 * @description Enhanced stylized DeLorean time machine built with Three.js primitives
 */

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface DeLoreanProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/* ─── WHEEL ─── */
const Wheel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const wheelRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x = clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <group ref={wheelRef}>
        {/* Tire */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 20]} />
          <meshStandardMaterial color="#111111" roughness={0.95} />
        </mesh>
        {/* Brake disc */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 20]} />
          <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Hub cap */}
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
          <meshStandardMaterial color="#999999" metalness={1} roughness={0.1} />
        </mesh>
        {/* 5 Spokes */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 0.1, 0]} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
            <boxGeometry args={[0.04, 0.02, 0.35]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.15} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ─── GULLWING DOOR ─── */
const GullwingDoor: React.FC<{ position: [number, number, number]; side: 'left' | 'right' }> = ({ position, side }) => {
  const flip = side === 'left' ? -1 : 1;
  return (
    <group position={position} rotation={[0, 0, flip * 0.4]}>
      <mesh>
        <boxGeometry args={[0.04, 0.55, 1.15]} />
        <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.18} />
      </mesh>
      {/* Door window */}
      <mesh position={[flip * 0.01, 0.12, 0]}>
        <boxGeometry args={[0.02, 0.22, 0.75]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.45} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Door handle */}
      <mesh position={[flip * 0.03, -0.05, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

/* ─── SIDE MIRROR ─── */
const SideMirror: React.FC<{ position: [number, number, number]; side: 'left' | 'right' }> = ({ position, side }) => {
  const flip = side === 'left' ? -1 : 1;
  return (
    <group position={position}>
      {/* Arm */}
      <mesh rotation={[0, 0, flip * 0.3]}>
        <boxGeometry args={[0.25, 0.03, 0.03]} />
        <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.2} />
      </mesh>
      {/* Mirror head */}
      <mesh position={[flip * 0.14, 0, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.12]} />
        <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
};

/* ─── REAR LOUVERS ─── */
const RearLouvers: React.FC = () => {
  const slats = 8;
  return (
    <group position={[0, 0.92, -1.05]}>
      {Array.from({ length: slats }).map((_, i) => (
        <mesh key={i} position={[0, 0.02 * i, -0.04 * i]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[1.3, 0.015, 0.06]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
};

/* ─── ELECTRICITY ARC ─── */
const ElectricityArc: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.visible = Math.random() > 0.6;
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <boxGeometry args={[0.02, 0.5, 0.02]} />
      <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={2} transparent opacity={0.8} />
    </mesh>
  );
};

/* ─── FLUX CAPACITOR Y-SHAPE ─── */
const FluxCapacitorY: React.FC = () => (
  <group position={[0, 0.75, -0.5]}>
    {/* Center vertical */}
    <mesh position={[0, -0.08, 0]}>
      <boxGeometry args={[0.03, 0.18, 0.03]} />
      <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1.2} />
    </mesh>
    {/* Left arm */}
    <mesh position={[-0.06, 0.06, 0]} rotation={[0, 0, 0.5]}>
      <boxGeometry args={[0.03, 0.16, 0.03]} />
      <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1.2} />
    </mesh>
    {/* Right arm */}
    <mesh position={[0.06, 0.06, 0]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.03, 0.16, 0.03]} />
      <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1.2} />
    </mesh>
  </group>
);

/* ─── MR. FUSION ─── */
const MrFusion: React.FC = () => (
  <group position={[0, 0.85, -1.65]}>
    {/* Base cylinder */}
    <mesh>
      <cylinderGeometry args={[0.12, 0.15, 0.2, 12]} />
      <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
    </mesh>
    {/* Top cylinder */}
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.08, 0.12, 0.12, 12]} />
      <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
    </mesh>
    {/* Lid */}
    <mesh position={[0, 0.23, 0]}>
      <cylinderGeometry args={[0.09, 0.08, 0.04, 12]} />
      <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);

/* ─── MAIN DELOREAN ─── */
export const DeLorean: React.FC<DeLoreanProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const fusionGlowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.05;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(t * 2.5) * 0.3;
    }
    if (fusionGlowRef.current) {
      const mat = fusionGlowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(t * 3) * 0.2;
    }
  });

  const bodyMat = useMemo(() => ({
    color: '#C0C0C0' as const,
    metalness: 1,
    roughness: 0.18,
  }), []);

  const darkTrim = useMemo(() => ({
    color: '#333333' as const,
    metalness: 0.5,
    roughness: 0.6,
  }), []);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* ═══ BODY ═══ */}
      {/* Main body */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.7, 0.45, 3.6]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* Upper cabin */}
      <mesh position={[0, 0.82, -0.2]}>
        <boxGeometry args={[1.5, 0.35, 1.8]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* Front wedge (angled hood) */}
      <mesh position={[0, 0.48, 1.6]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.5, 0.2, 0.9]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* Front wedge lower taper */}
      <mesh position={[0, 0.35, 1.85]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[1.4, 0.12, 0.4]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* Rear trunk */}
      <mesh position={[0, 0.55, -1.6]}>
        <boxGeometry args={[1.5, 0.3, 0.6]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* Rear taper */}
      <mesh position={[0, 0.5, -1.85]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.4, 0.15, 0.3]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* ═══ FENDER FLARES ═══ */}
      {[-0.9, 0.9].map((x, i) => (
        <React.Fragment key={`fender-${i}`}>
          {/* Front fender */}
          <mesh position={[x, 0.35, 1.15]}>
            <boxGeometry args={[0.15, 0.35, 0.65]} />
            <meshStandardMaterial {...bodyMat} />
          </mesh>
          {/* Rear fender */}
          <mesh position={[x, 0.35, -1.15]}>
            <boxGeometry args={[0.15, 0.35, 0.65]} />
            <meshStandardMaterial {...bodyMat} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ═══ BUMPERS ═══ */}
      {/* Front bumper */}
      <mesh position={[0, 0.3, 2.05]}>
        <boxGeometry args={[1.6, 0.12, 0.08]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Rear bumper */}
      <mesh position={[0, 0.3, -1.98]}>
        <boxGeometry args={[1.6, 0.12, 0.08]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* ═══ SIDE BODY LINES ═══ */}
      {[-0.86, 0.86].map((x, i) => (
        <mesh key={`line-${i}`} position={[x, 0.5, 0]}>
          <boxGeometry args={[0.02, 0.04, 3.2]} />
          <meshStandardMaterial {...darkTrim} />
        </mesh>
      ))}

      {/* ═══ HOOD VENTS ═══ */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={`vent-${i}`} position={[x, 0.59, 1.5]}>
          <boxGeometry args={[0.15, 0.01, 0.5]} />
          <meshStandardMaterial color="#222222" roughness={0.8} />
        </mesh>
      ))}

      {/* ═══ WINDSHIELD ═══ */}
      <mesh position={[0, 0.88, 0.65]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[1.35, 0.02, 0.7]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.88, -1.0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.35, 0.02, 0.55]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ═══ REAR LOUVERS ═══ */}
      <RearLouvers />

      {/* ═══ GULLWING DOORS ═══ */}
      <GullwingDoor position={[-0.85, 0.95, -0.2]} side="left" />
      <GullwingDoor position={[0.85, 0.95, -0.2]} side="right" />

      {/* ═══ SIDE MIRRORS ═══ */}
      <SideMirror position={[-0.9, 0.7, 0.5]} side="left" />
      <SideMirror position={[0.9, 0.7, 0.5]} side="right" />

      {/* ═══ WHEELS ═══ */}
      <Wheel position={[-0.88, 0.3, 1.15]} />
      <Wheel position={[0.88, 0.3, 1.15]} />
      <Wheel position={[-0.88, 0.3, -1.15]} />
      <Wheel position={[0.88, 0.3, -1.15]} />

      {/* ═══ HEADLIGHTS ═══ */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={`hl-${i}`} position={[x, 0.45, 2.06]}>
          <circleGeometry args={[0.12, 16]} />
          <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* ═══ TAIL LIGHTS ═══ */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, 0.45, -1.99]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* ═══ LICENSE PLATE ═══ */}
      <mesh position={[0, 0.32, -2.0]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.35, 0.12, 0.01]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>
      <mesh position={[0, 0.32, -2.01]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.3, 0.06, 0.005]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* ═══ ANTENNA / LIGHTNING ROD ═══ */}
      <mesh position={[0.3, 1.4, -1.5]}>
        <cylinderGeometry args={[0.01, 0.015, 0.8, 6]} />
        <meshStandardMaterial color="#999999" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Lightning rod tip */}
      <mesh position={[0.3, 1.82, -1.5]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1} />
      </mesh>

      {/* ═══ FLUX CAPACITOR Y-SHAPE ═══ */}
      <FluxCapacitorY />

      {/* ═══ MR. FUSION ═══ */}
      <MrFusion />

      {/* ═══ 88 MPH SPEEDOMETER ═══ */}
      <mesh position={[0, 1.01, -0.4]}>
        <boxGeometry args={[0.45, 0.04, 0.28]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 1.03, -0.4]}>
        <boxGeometry args={[0.4, 0.02, 0.22]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      {/* 88 indicator */}
      <mesh position={[0.12, 1.04, -0.35]}>
        <boxGeometry args={[0.08, 0.015, 0.06]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>

      {/* ═══ FLUX CAPACITOR REAR GLOW ═══ */}
      <pointLight position={[0, 0.6, -2.1]} intensity={2} color="#3b82f6" distance={5} />
      <mesh position={[0, 0.65, -1.95]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.04]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.7} />
      </mesh>

      {/* ═══ ELECTRICITY ARCS ═══ */}
      <ElectricityArc position={[-0.6, 0.8, -1.7]} rotation={[0.3, 0.5, 0.8]} />
      <ElectricityArc position={[0.5, 0.9, -1.6]} rotation={[-0.2, 0.3, -0.6]} />
      <ElectricityArc position={[0, 1.1, -1.5]} rotation={[0.5, -0.4, 0.3]} />
      <ElectricityArc position={[-0.3, 1.2, -1.8]} rotation={[-0.6, 0.2, 0.4]} />
      <ElectricityArc position={[0.4, 0.7, -1.9]} rotation={[0.1, -0.5, 0.7]} />

      {/* ═══ FIRE TRAILS ═══ */}
      {[-0.88, 0.88].map((x, i) => (
        <mesh key={`fire-${i}`} position={[x, 0.08, -2.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.35, 0.8]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#ef4444"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* ═══ MR. FUSION UNDERGLOW ═══ */}
      <mesh ref={fusionGlowRef} position={[0, 0.05, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#f97316"
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ═══ GROUND GLOW (layered) ═══ */}
      <mesh ref={glowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 4.6]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.2}
        />
      </mesh>
      {/* Inner glow layer */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 3.2]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#60a5fa"
          emissiveIntensity={0.6}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Ground lights */}
      <pointLight position={[0, 0.1, 0]} intensity={0.8} color="#3b82f6" distance={4} />
      <pointLight position={[0, 0.1, -1.5]} intensity={0.4} color="#f97316" distance={2.5} />
    </group>
  );
};

export default DeLorean;
