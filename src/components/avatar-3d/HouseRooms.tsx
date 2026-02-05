 /**
  * @file HouseRooms.tsx
  * @description Room presets for the Big Brother House multi-room layout
  */
 
 import React from 'react';
 import * as THREE from 'three';
 import {
   SectionalSofa, MemoryWall, CrystalChandelier, GlassCoffeeTable, LEDCoveLighting,
   HOHPlatform, HOHBed, HOHThrone, MiniFridge, PrivateTV,
   BunkBed, WardrobeCloset, FloatingNightstand,
   VanityCounter, ShowerStall, BathroomMirror,
   KitchenIslandLarge, ModernRefrigerator, CommercialStove, OpenShelving, BreakfastNook,
   NominationPodium, CurvedSofa, SpotLight, BBEyeDisplay, GlassWall,
   PoolTable, ArcadeCabinet, DartBoard, GamingChair, NeonSign,
   DiaryChair, CameraRig, SoundPanels
 } from './HouseFurnitureExpanded';
 
 interface RoomProps {
   position: [number, number, number];
 }
 
 /**
  * Living Room - Main gathering area for houseguests
  */
 export const LivingRoom: React.FC<RoomProps> = ({ position }) => {
   return (
     <group position={position}>
       {/* L-shaped sectional */}
       <SectionalSofa position={[-3, 0, 2]} rotation={[0, 0, 0]} />
       
       {/* Memory Wall - All houseguest photos */}
       <MemoryWall position={[-6, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />
       
       {/* Statement chandelier */}
       <CrystalChandelier position={[0, 5, 0]} />
       
       {/* Glass coffee table */}
       <GlassCoffeeTable position={[0, 0, 1]} />
       
       {/* LED cove lighting around room */}
       <LEDCoveLighting position={[0, 3.8, 0]} width={12} depth={10} color="#3b82f6" />
       
       {/* Accent plants */}
       <group position={[-5.5, 0, 4]}>
         <mesh position={[0, 0.3, 0]}>
           <cylinderGeometry args={[0.3, 0.25, 0.6, 16]} />
           <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
         </mesh>
         {[...Array(6)].map((_, i) => (
           <mesh key={i} position={[0, 0.8 + Math.random() * 0.3, 0]} rotation={[0, (i / 6) * Math.PI * 2, 0.3]}>
             <coneGeometry args={[0.15, 0.5, 4]} />
             <meshStandardMaterial color="#22c55e" roughness={0.8} />
           </mesh>
         ))}
       </group>
     </group>
   );
 };
 
 /**
  * HOH Suite - Elevated Head of Household room with luxurious furnishings
  */
 export const HOHSuite: React.FC<RoomProps> = ({ position }) => {
   return (
     <group position={position}>
       {/* Elevated platform with LED edge */}
       <HOHPlatform position={[0, 0, 0]} />
       
       {/* Luxurious king bed */}
       <HOHBed position={[0, 0.35, -2]} />
       
       {/* HOH Throne chair */}
       <HOHThrone position={[3, 0.35, -2]} rotation={[0, -Math.PI / 4, 0]} />
       
       {/* Mini fridge */}
       <MiniFridge position={[3.5, 0.35, 1]} />
       
       {/* Private TV */}
       <PrivateTV position={[0, 1.5, 2.5]} rotation={[0, Math.PI, 0]} />
       
       {/* Gold accent lighting */}
       <LEDCoveLighting position={[0, 3.5, 0]} width={8} depth={8} color="#fbbf24" />
       
       {/* Frosted glass partition/door area */}
       <GlassWall position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} width={6} height={3} />
     </group>
   );
 };
 
 /**
  * Bedroom - Standard bedroom with bunk beds
  */
 export const Bedroom: React.FC<RoomProps & { variant: 'regular' | 'havenot' }> = ({ position, variant }) => {
   const isHaveNot = variant === 'havenot';
   
   return (
     <group position={position}>
       {/* Two sets of bunk beds */}
       <BunkBed position={[-2.5, 0, -1.5]} isHaveNot={isHaveNot} />
       <BunkBed position={[2.5, 0, -1.5]} isHaveNot={isHaveNot} />
       
       {/* Wardrobe closets */}
       <WardrobeCloset position={[-3.5, 0, 2]} rotation={[0, Math.PI, 0]} />
       <WardrobeCloset position={[3.5, 0, 2]} rotation={[0, Math.PI, 0]} />
       
       {/* Floating nightstands */}
       <FloatingNightstand position={[0, 0.8, -2]} />
       
       {/* Under-bed LED glow */}
       <LEDCoveLighting 
         position={[0, 0.1, -1.5]} 
         width={6} 
         depth={4} 
         color={isHaveNot ? '#6b7280' : '#8b5cf6'} 
       />
       
       {/* Room light */}
       <pointLight position={[0, 3.5, 0]} intensity={0.4} color={isHaveNot ? '#9ca3af' : '#fbbf24'} distance={8} />
     </group>
   );
 };
 
 /**
  * Bathroom/Vanity Area
  */
 export const BathroomArea: React.FC<RoomProps> = ({ position }) => {
   return (
     <group position={position}>
       {/* Long vanity counter */}
       <VanityCounter position={[0, 0, -2]} />
       
       {/* Hollywood-style mirrors */}
       <BathroomMirror position={[-1.5, 1.5, -2.4]} />
       <BathroomMirror position={[1.5, 1.5, -2.4]} />
       
       {/* Shower stalls */}
       <ShowerStall position={[2.5, 0, 0]} />
       <ShowerStall position={[-2.5, 0, 0]} />
       
       {/* Bright bathroom lighting */}
       <pointLight position={[0, 3, 0]} intensity={0.8} color="#ffffff" distance={8} />
       <pointLight position={[0, 2, -2]} intensity={0.5} color="#fef3c7" distance={4} />
     </group>
   );
 };
 
 /**
  * Expanded Kitchen
  */
 export const KitchenExpanded: React.FC<RoomProps> = ({ position }) => {
   return (
     <group position={position}>
       {/* Large kitchen island with waterfall edge */}
       <KitchenIslandLarge position={[0, 0, 0]} />
       
       {/* Modern refrigerator */}
       <ModernRefrigerator position={[-3, 0, -3.5]} />
       
       {/* Commercial stove */}
       <CommercialStove position={[0, 0, -3.5]} />
       
       {/* Open shelving */}
       <OpenShelving position={[3, 2, -3.5]} />
       
       {/* Breakfast nook */}
       <BreakfastNook position={[3, 0, 2]} />
       
       {/* Pendant lights over island */}
       {[-1, 0, 1].map((x, i) => (
         <group key={i} position={[x * 1.2, 3.5, 0]}>
           <mesh>
             <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
             <meshStandardMaterial color="#1a1a1a" />
           </mesh>
           <mesh position={[0, -0.5, 0]}>
             <sphereGeometry args={[0.2, 16, 16]} />
             <meshStandardMaterial 
               color="#fef3c7" 
               emissive="#fbbf24"
               emissiveIntensity={0.5}
               transparent
               opacity={0.9}
             />
           </mesh>
           <pointLight position={[0, -0.6, 0]} intensity={0.4} color="#fbbf24" distance={5} />
         </group>
       ))}
     </group>
   );
 };
 
 /**
  * Nomination/Lounge Area
  */
 export const NominationLounge: React.FC<RoomProps> = ({ position }) => {
   return (
     <group position={position}>
       {/* Nomination box/podium */}
       <NominationPodium position={[0, 0, -2]} />
       
       {/* Semi-circular seating */}
       <CurvedSofa position={[0, 0, 2]} rotation={[0, Math.PI, 0]} />
       
       {/* Dramatic spotlight */}
       <SpotLight position={[0, 5, -2]} targetPosition={[0, 1, -2]} color="#dc2626" />
       
       {/* BB Eye display behind podium */}
       <BBEyeDisplay position={[0, 2.5, -4]} />
       
       {/* Glass partition to living room */}
       <GlassWall position={[0, 1.5, 4.5]} width={10} height={3} />
       
       {/* Red accent LED */}
       <LEDCoveLighting position={[0, 3.8, 0]} width={10} depth={6} color="#dc2626" />
     </group>
   );
 };
 
 /**
  * Game Room
  */
 export const GameRoom: React.FC<RoomProps> = ({ position }) => {
   return (
     <group position={position}>
       {/* Pool table with LED edge */}
       <PoolTable position={[0, 0, 0]} />
       
       {/* Arcade cabinet */}
       <ArcadeCabinet position={[-2.5, 0, -2.5]} rotation={[0, Math.PI / 4, 0]} />
       
       {/* Dart board */}
       <DartBoard position={[2.8, 1.5, -2.5]} />
       
       {/* Gaming chairs */}
       <GamingChair position={[-2, 0, 2]} rotation={[0, Math.PI / 6, 0]} />
       <GamingChair position={[2, 0, 2]} rotation={[0, -Math.PI / 6, 0]} />
       
       {/* Neon signs */}
       <NeonSign position={[0, 2.8, -2.8]} text="GAME ON" color="#22c55e" />
       <NeonSign position={[-2.8, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} text="BB" color="#3b82f6" />
       
       {/* Ambient game room lighting */}
       <pointLight position={[0, 3.5, 0]} intensity={0.4} color="#8b5cf6" distance={8} />
     </group>
   );
 };
 
 /**
  * Diary Room Interior
  */
 export const DiaryRoomInterior: React.FC<RoomProps> = ({ position }) => {
   return (
     <group position={position}>
       {/* Iconic diary chair */}
       <DiaryChair position={[0, 0, 0]} />
       
       {/* Camera rig */}
       <CameraRig position={[0, 2.5, 2]} />
       
       {/* Acoustic wall panels */}
       <SoundPanels position={[-1.8, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />
       <SoundPanels position={[1.8, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} />
       <SoundPanels position={[0, 1.5, -1.8]} />
       
       {/* Dramatic spotlight on chair */}
       <SpotLight position={[0, 3.5, 0]} targetPosition={[0, 1, 0]} color="#fbbf24" intensity={2} />
       
       {/* Ambient red glow */}
       <pointLight position={[0, 0.5, -1.5]} intensity={0.3} color="#dc2626" distance={3} />
     </group>
   );
 };
 
 /**
  * Hallway connecting rooms
  */
 export const Hallway: React.FC<RoomProps & { length: number }> = ({ position, length }) => {
   return (
     <group position={position}>
       {/* Floor */}
       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
         <planeGeometry args={[length, 3]} />
         <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
       </mesh>
       
       {/* Floor accent stripe */}
       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
         <planeGeometry args={[length - 0.5, 0.1]} />
         <meshStandardMaterial 
           color="#fbbf24" 
           emissive="#fbbf24"
           emissiveIntensity={0.2}
         />
       </mesh>
       
       {/* Ceiling LED strips */}
       <LEDCoveLighting position={[0, 2.9, 0]} width={length} depth={2.5} color="#3b82f6" />
       
       {/* Hallway lights */}
       {Array.from({ length: Math.floor(length / 3) }, (_, i) => (
         <pointLight 
           key={i} 
           position={[(i - Math.floor(length / 6)) * 3, 2.8, 0]} 
           intensity={0.3} 
           color="#fef3c7" 
           distance={4} 
         />
       ))}
     </group>
   );
 };
 
 export default {
   LivingRoom,
   HOHSuite,
   Bedroom,
   BathroomArea,
   KitchenExpanded,
   NominationLounge,
   GameRoom,
   DiaryRoomInterior,
   Hallway
 };