 /**
  * @file FloorSpotMarker.tsx
  * @description Floor spot markers for tap-to-move avatar functionality
  */
 
 import React, { useMemo } from 'react';
 import * as THREE from 'three';
 import { MoveTargetIndicator } from './TouchFeedback';
 
 export interface FloorSpot {
   id: string;
   position: [number, number, number];
   zone: 'living' | 'kitchen' | 'bedroom' | 'hoh' | 'nomination' | 'backyard' | 'bathroom' | 'game';
   label?: string;
 }
 
 // Predefined floor spots throughout the house
 export const FLOOR_SPOTS: FloorSpot[] = [
   // Living Room
   { id: 'living-1', position: [-3, 0.01, 1], zone: 'living', label: 'Sofa Left' },
   { id: 'living-2', position: [0, 0.01, 2], zone: 'living', label: 'Center' },
   { id: 'living-3', position: [3, 0.01, 1], zone: 'living', label: 'Sofa Right' },
   { id: 'living-4', position: [-1, 0.01, -1], zone: 'living', label: 'Coffee Table' },
   { id: 'living-5', position: [1, 0.01, -1], zone: 'living', label: 'TV Area' },
   
   // Kitchen
   { id: 'kitchen-1', position: [10, 0.01, 0], zone: 'kitchen', label: 'Counter' },
   { id: 'kitchen-2', position: [10, 0.01, 2], zone: 'kitchen', label: 'Island' },
   { id: 'kitchen-3', position: [12, 0.01, -1], zone: 'kitchen', label: 'Sink' },
   
   // HOH Suite
   { id: 'hoh-1', position: [10, 0.01, -10], zone: 'hoh', label: 'HOH Bed' },
   { id: 'hoh-2', position: [8, 0.01, -9], zone: 'hoh', label: 'HOH Lounge' },
   
   // Bedrooms
   { id: 'bedroom-1', position: [-10, 0.01, -10], zone: 'bedroom', label: 'Bed 1' },
   { id: 'bedroom-2', position: [-8, 0.01, -10], zone: 'bedroom', label: 'Bed 2' },
   { id: 'bedroom-3', position: [0, 0.01, -10], zone: 'bedroom', label: 'Have-Not Bed' },
   
   // Nomination Lounge
   { id: 'nom-1', position: [-2, 0.01, 10], zone: 'nomination', label: 'Nom Chair Left' },
   { id: 'nom-2', position: [0, 0.01, 11], zone: 'nomination', label: 'Nom Center' },
   { id: 'nom-3', position: [2, 0.01, 10], zone: 'nomination', label: 'Nom Chair Right' },
   
   // Game Room
   { id: 'game-1', position: [12, 0.01, 9], zone: 'game', label: 'Game Table' },
   { id: 'game-2', position: [11, 0.01, 7], zone: 'game', label: 'Arcade' },
   
   // Bathroom
   { id: 'bath-1', position: [-12, 0.01, 3], zone: 'bathroom', label: 'Bathroom' },
   
   // Backyard
   { id: 'yard-1', position: [-5, 0.01, -18], zone: 'backyard', label: 'Pool Side' },
   { id: 'yard-2', position: [5, 0.01, -18], zone: 'backyard', label: 'Hot Tub' },
   { id: 'yard-3', position: [0, 0.01, -20], zone: 'backyard', label: 'Lounge' },
 ];
 
 interface FloorSpotMarkersProps {
   active: boolean;
   occupiedSpots?: string[]; // IDs of spots with characters
   currentPlayerSpot?: string;
   onSpotSelect?: (spotId: string, position: [number, number, number]) => void;
   visibleZones?: FloorSpot['zone'][];
 }
 
 /**
  * Renders all floor spot markers when move mode is active
  */
 export const FloorSpotMarkers: React.FC<FloorSpotMarkersProps> = ({
   active,
   occupiedSpots = [],
   currentPlayerSpot,
   onSpotSelect,
   visibleZones,
 }) => {
   // Filter spots by zone if specified
   const visibleSpots = useMemo(() => {
     if (!visibleZones || visibleZones.length === 0) {
       return FLOOR_SPOTS;
     }
     return FLOOR_SPOTS.filter(spot => visibleZones.includes(spot.zone));
   }, [visibleZones]);
   
   if (!active) return null;
   
   return (
     <group name="floor-spot-markers">
       {visibleSpots.map((spot) => {
         const isOccupied = occupiedSpots.includes(spot.id);
         const isCurrent = spot.id === currentPlayerSpot;
         const isAvailable = !isOccupied && !isCurrent;
         
         return (
           <MoveTargetIndicator
             key={spot.id}
             position={spot.position}
             active={true}
             available={isAvailable}
             occupied={isOccupied}
             onClick={() => {
               if (isAvailable && onSpotSelect) {
                 onSpotSelect(spot.id, spot.position);
               }
             }}
           />
         );
       })}
     </group>
   );
 };
 
 /**
  * Get the nearest floor spot to a world position
  */
 export const getNearestFloorSpot = (
   worldPosition: THREE.Vector3,
   excludeIds: string[] = []
 ): FloorSpot | null => {
   let nearest: FloorSpot | null = null;
   let nearestDistance = Infinity;
   
   for (const spot of FLOOR_SPOTS) {
     if (excludeIds.includes(spot.id)) continue;
     
     const spotVec = new THREE.Vector3(...spot.position);
     const distance = worldPosition.distanceTo(spotVec);
     
     if (distance < nearestDistance) {
       nearestDistance = distance;
       nearest = spot;
     }
   }
   
   return nearest;
 };
 
 /**
  * Get floor spot by ID
  */
 export const getFloorSpotById = (id: string): FloorSpot | undefined => {
   return FLOOR_SPOTS.find(spot => spot.id === id);
 };
 
 export default FloorSpotMarkers;