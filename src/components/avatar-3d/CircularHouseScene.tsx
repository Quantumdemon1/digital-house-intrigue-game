 /**
  * @file CircularHouseScene.tsx
  * @description Simple circular house layout for character selection screen
  */
 
 import React, { Suspense, useRef, useState, useEffect } from 'react';
 import { Canvas, useFrame, useThree } from '@react-three/fiber';
 import { Environment, OrbitControls, ContactShadows, Html, useProgress } from '@react-three/drei';
 import * as THREE from 'three';
 import { CharacterTemplate, Archetype } from '@/data/character-templates';
 import { RPMAvatar, PoseType } from './RPMAvatar';
 import { HouseFloor, Couch, CoffeeTable, Plant, LightFixture, TVStand, KitchenArea, DiaryRoomDoor } from './HouseFurniture';
 import { useIsMobile } from '@/hooks/use-mobile';
 import { useTouchGestures } from './hooks/useTouchGestures';
import { SceneEffectsOverlay } from './SceneEffectsOverlay';
 
 // Easing function for smooth camera transitions
 const easeInOutCubic = (t: number): number => {
   return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
 };
 
 interface CircularHouseSceneProps {
   characters: CharacterTemplate[];
   selectedId: string | null;
   onSelect: (id: string) => void;
 }
 
 // Circle radius for character positioning
 const CIRCLE_RADIUS = 5;
 
 // Get circular positions for characters
 const getCirclePositions = (count: number) => {
   return Array.from({ length: count }, (_, i) => {
     const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
     return {
       position: [
         Math.cos(angle) * CIRCLE_RADIUS,
         0,
         Math.sin(angle) * CIRCLE_RADIUS
       ] as [number, number, number],
       rotation: [0, -angle + Math.PI, 0] as [number, number, number],
       angle
     };
   });
 };
 
// Map archetype to pose types - all use relaxed pose for consistency
const ARCHETYPE_POSES: Record<Archetype, PoseType[]> = {
  strategist: ['relaxed'],
  competitor: ['relaxed'],
  socialite: ['relaxed'],
  wildcard: ['relaxed'],
  underdog: ['relaxed'],
};
 
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
 
 // Character spot component
 const CharacterSpot: React.FC<{
   template: CharacterTemplate;
   position: [number, number, number];
   rotation: [number, number, number];
   isSelected: boolean;
   isHovered: boolean;
   index: number;
   onSelect: () => void;
   onHover: (hovered: boolean) => void;
 }> = ({ template, position, rotation, isSelected, isHovered, index, onSelect, onHover }) => {
   const groupRef = useRef<THREE.Group>(null);
   const modelUrl = template.avatar3DConfig?.modelUrl;
   const poseType = getPoseForCharacter(template.archetype, index);
   
   // Simplified animation - remove duplicate idle animation (handled by AnimationController)
   useFrame(() => {
     if (groupRef.current) {
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
         
         <SelectionRing active={isSelected} />
         
         <group>
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
                  characterName={template.name}
                />
             </Suspense>
           ) : (
             <AvatarPlaceholder />
           )}
         </group>
         
         {(isHovered || isSelected) && (
           <Html
             position={[0, 2.2, 0]}
             center
             style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
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
 
 // Placeholder
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
           Loading... {Math.round(progress)}%
         </p>
       </div>
     </Html>
   );
 };
 
 // Camera controller for smooth fly-to
 const CameraController: React.FC<{ 
   focusPosition: [number, number, number] | null;
   defaultPosition: [number, number, number];
   controlsRef: React.RefObject<any>;
 }> = ({ focusPosition, defaultPosition, controlsRef }) => {
   const { camera } = useThree();
   
   const animating = useRef(false);
   const progress = useRef(0);
   const startCameraPos = useRef(new THREE.Vector3());
   const targetCameraPos = useRef(new THREE.Vector3());
   const startLookAt = useRef(new THREE.Vector3());
   const targetLookAt = useRef(new THREE.Vector3());
   const lastFocusPosition = useRef<[number, number, number] | null>(null);
   
   useEffect(() => {
     const focusChanged = 
       (focusPosition === null && lastFocusPosition.current !== null) ||
       (focusPosition !== null && lastFocusPosition.current === null) ||
       (focusPosition && lastFocusPosition.current && 
         (focusPosition[0] !== lastFocusPosition.current[0] ||
          focusPosition[2] !== lastFocusPosition.current[2]));
     
     if (focusChanged) {
       startCameraPos.current.copy(camera.position);
       
       if (controlsRef.current) {
         startLookAt.current.copy(controlsRef.current.target);
       }
       
       if (focusPosition) {
         const charX = focusPosition[0];
         const charZ = focusPosition[2];
         const angle = Math.atan2(charZ, charX);
         const distance = 4;
         targetCameraPos.current.set(
           charX + Math.cos(angle) * distance,
           3,
           charZ + Math.sin(angle) * distance
         );
         targetLookAt.current.set(charX, 1.2, charZ);
       } else {
         targetCameraPos.current.set(defaultPosition[0], defaultPosition[1], defaultPosition[2]);
         targetLookAt.current.set(0, 0.5, 0);
       }
       
       progress.current = 0;
       animating.current = true;
       lastFocusPosition.current = focusPosition;
     }
   }, [focusPosition, camera, defaultPosition, controlsRef]);
   
   useFrame((_, delta) => {
     if (!animating.current) return;
     
     progress.current = Math.min(progress.current + delta * 1.2, 1);
     const t = easeInOutCubic(progress.current);
     
     camera.position.lerpVectors(startCameraPos.current, targetCameraPos.current, t);
     
     if (controlsRef.current) {
       controlsRef.current.target.lerpVectors(startLookAt.current, targetLookAt.current, t);
       controlsRef.current.update();
     }
     
     if (progress.current >= 1) {
       animating.current = false;
     }
   });
   
   return null;
 };
 
 // Main scene content
 const SceneContent: React.FC<CircularHouseSceneProps & { 
   hoveredId: string | null; 
   onHover: (id: string | null) => void;
 }> = ({ characters, selectedId, onSelect, hoveredId, onHover }) => {
   const positions = getCirclePositions(characters.length);
   const selectedPosition = selectedId 
     ? positions[characters.findIndex(c => c.id === selectedId)]?.position 
     : null;
   
   const controlsRef = useRef<any>(null);
   
   return (
     <>
       <Environment preset="apartment" />
       <ambientLight intensity={0.4} />
       <directionalLight 
         position={[10, 15, 5]} 
         intensity={1} 
         castShadow
         shadow-mapSize={[2048, 2048]}
       />
       <pointLight position={[0, 8, 0]} intensity={0.5} color="#fbbf24" />
       
       {/* Original circular floor */}
       <HouseFloor />
       
       {/* Simple furniture arrangement */}
       <Couch position={[-5, 0, -4]} rotation={[0, Math.PI / 4, 0]} />
       <Couch position={[5, 0, -4]} rotation={[0, -Math.PI / 4, 0]} />
       <CoffeeTable position={[0, 0, -3]} />
       <TVStand position={[0, 0, -7]} />
       <KitchenArea position={[6, 0, 2]} />
       <DiaryRoomDoor position={[-7, 0, 0]} />
       <Plant position={[-4, 0, 3]} />
       <Plant position={[4, 0, 3]} />
       <LightFixture position={[0, 4, 0]} />
       
       {/* Contact shadows */}
       <ContactShadows
         position={[0, 0, 0]}
         opacity={0.5}
         scale={25}
         blur={2}
         far={10}
       />
       
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
             onSelect={() => onSelect(char.id)}
             onHover={(hovered) => onHover(hovered ? char.id : null)}
           />
         ))}
       </Suspense>
       
       <CameraController 
         focusPosition={selectedPosition || null} 
         defaultPosition={[0, 12, 16]}
         controlsRef={controlsRef}
       />
       
       <OrbitControls
         ref={controlsRef}
         enablePan={false}
         minDistance={5}
         maxDistance={25}
         minPolarAngle={Math.PI / 6}
         maxPolarAngle={Math.PI / 2.2}
         target={[0, 0.5, 0]}
         enableDamping
         dampingFactor={0.05}
        // Touch settings
        rotateSpeed={0.5}
        zoomSpeed={0.8}
       />
     </>
   );
 };
 
 export const CircularHouseScene: React.FC<CircularHouseSceneProps> = ({
   characters,
   selectedId,
   onSelect,
 }) => {
   const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isMobile = useIsMobile();
   
  // Touch gesture callbacks
  const touchCallbacks = React.useMemo(() => ({
    onDoubleTap: () => {
      // Deselect on double-tap
      if (selectedId) {
        onSelect(selectedId);
      }
    },
  }), [selectedId, onSelect]);
   
  const { handlers: touchHandlers } = useTouchGestures(touchCallbacks, isMobile);
   
   return (
    <div className="w-full h-full relative" {...touchHandlers}>
       <Canvas
         camera={{ 
           position: [0, 12, 16], 
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
       
        {/* CSS-based visual effects overlay */}
        <SceneEffectsOverlay 
          enableBloom={!isMobile} 
          enableVignette={true}
          bloomIntensity={0.35}
          vignetteIntensity={0.4}
        />
        
       {/* Scene title overlay */}
       <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
         <div className="px-6 py-2 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30">
           <h2 className="text-amber-400 font-bold text-lg tracking-wide">
             🏠 SELECT YOUR HOUSEGUEST
           </h2>
         </div>
       </div>
       
      {/* Mobile hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden">
        <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/60 text-xs">
          Drag to rotate • Pinch to zoom • Tap to select
        </div>
      </div>
      {/* Desktop hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none hidden sm:block">
        <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/60 text-sm">
          Drag to rotate • Scroll to zoom • Click to select
         </div>
       </div>
     </div>
   );
 };
 
 export default CircularHouseScene;