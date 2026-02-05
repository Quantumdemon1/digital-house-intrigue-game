 /**
  * @file utils/conversationGrouping.ts
  * @description Dynamic character positioning based on alliances and relationships
  */
 
 // ============ Types ============
 
 export interface Alliance {
   id: string;
   name: string;
   memberIds: string[];
   isActive: boolean;
 }
 
 export interface CharacterPosition {
   position: [number, number, number];
   rotation: [number, number, number];
 }
 
 interface ClusterGroup {
   characterIds: string[];
   centerPosition: [number, number, number];
   priority: number; // Higher = placed first
 }
 
 // ============ Constants ============
 
 // Minimum space between characters in a cluster
 const PERSONAL_SPACE = 1.2;
 
 // Radius for cluster semicircle
 const CLUSTER_RADIUS = 1.5;
 
 // Threshold for considering characters "friendly"
 const FRIENDLY_THRESHOLD = 50;
 
 // Threshold for considering characters "hostile"  
 const HOSTILE_THRESHOLD = -30;
 
 // Base positions for cluster centers (living room area)
 const CLUSTER_CENTERS: [number, number, number][] = [
   // Main sofa area
   [0, 0, 1],
   // Near memory wall
   [-5, 0, 0],
   // Kitchen adjacent
   [6, 0, 1],
   // Nomination lounge edge
   [0, 0, 7],
   // Standing area
   [3, 0, -2],
 ];
 
 // Individual positions for non-grouped characters
 const SOLO_POSITIONS: CharacterPosition[] = [
   { position: [-6, 0, 2], rotation: [0, Math.PI / 2, 0] },
   { position: [10, 0, 0], rotation: [0, -Math.PI / 2, 0] },
   { position: [-2, 0, 8], rotation: [0, Math.PI, 0] },
   { position: [10, 0, 2], rotation: [0, -Math.PI / 3, 0] },
   { position: [-6, 0, -2], rotation: [0, Math.PI / 2, 0] },
   { position: [2, 0, 8], rotation: [0, Math.PI, 0] },
 ];
 
 // ============ Helper Functions ============
 
 /**
  * Calculate position on a semicircle for cluster members
  */
 const getClusterMemberPosition = (
   centerPosition: [number, number, number],
   memberIndex: number,
   totalMembers: number
 ): CharacterPosition => {
   if (totalMembers === 1) {
     return {
       position: centerPosition,
       rotation: [0, 0, 0],
     };
   }
   
   // Spread members in a semicircle facing inward
   const angleStep = Math.PI / Math.max(totalMembers - 1, 1);
   const startAngle = -Math.PI / 2;
   const angle = startAngle + angleStep * memberIndex;
   
   const x = centerPosition[0] + Math.cos(angle) * CLUSTER_RADIUS;
   const z = centerPosition[2] + Math.sin(angle) * CLUSTER_RADIUS;
   
   // Face toward cluster center
   const facingAngle = Math.atan2(
     centerPosition[2] - z,
     centerPosition[0] - x
   );
   
   return {
     position: [x, 0, z],
     rotation: [0, facingAngle, 0],
   };
 };
 
 /**
  * Get relationship score between two characters
  */
 const getRelationshipScore = (
   relationships: Map<string, Map<string, { score: number }>>,
   id1: string,
   id2: string
 ): number => {
   return relationships.get(id1)?.get(id2)?.score ?? 0;
 };
 
 /**
  * Find shared alliance members present in character list
  */
 const findAllianceMembers = (
   characterIds: string[],
   alliances: Alliance[]
 ): ClusterGroup[] => {
   const clusters: ClusterGroup[] = [];
   const assignedIds = new Set<string>();
   
   // Sort alliances by member count (larger first)
   const sortedAlliances = [...alliances]
     .filter(a => a.isActive)
     .sort((a, b) => b.memberIds.length - a.memberIds.length);
   
   sortedAlliances.forEach((alliance, idx) => {
     // Find members of this alliance that are present and not yet assigned
     const presentMembers = alliance.memberIds.filter(
       id => characterIds.includes(id) && !assignedIds.has(id)
     );
     
     // Need at least 2 members to form a cluster
     if (presentMembers.length >= 2) {
       presentMembers.forEach(id => assignedIds.add(id));
       
       clusters.push({
         characterIds: presentMembers,
         centerPosition: CLUSTER_CENTERS[idx % CLUSTER_CENTERS.length],
         priority: presentMembers.length, // Larger groups have higher priority
       });
     }
   });
   
   return clusters;
 };
 
 /**
  * Find pairs of friendly non-allied characters
  */
 const findFriendlyPairs = (
   remainingIds: string[],
   relationships: Map<string, Map<string, { score: number }>>,
   usedCenters: number
 ): ClusterGroup[] => {
   const pairs: ClusterGroup[] = [];
   const paired = new Set<string>();
   
   for (let i = 0; i < remainingIds.length; i++) {
     if (paired.has(remainingIds[i])) continue;
     
     for (let j = i + 1; j < remainingIds.length; j++) {
       if (paired.has(remainingIds[j])) continue;
       
       const score = getRelationshipScore(relationships, remainingIds[i], remainingIds[j]);
       
       if (score >= FRIENDLY_THRESHOLD) {
         paired.add(remainingIds[i]);
         paired.add(remainingIds[j]);
         
         const centerIdx = (usedCenters + pairs.length) % CLUSTER_CENTERS.length;
         
         pairs.push({
           characterIds: [remainingIds[i], remainingIds[j]],
           centerPosition: CLUSTER_CENTERS[centerIdx],
           priority: 1,
         });
         break;
       }
     }
   }
   
   return pairs;
 };
 
 // ============ Main Function ============
 
 /**
  * Calculate character positions based on alliances and relationships
  * 
  * @param characterIds List of character IDs to position
  * @param alliances Active alliances in the game
  * @param relationships Relationship map between characters
  * @returns Map of character ID to their position and rotation
  */
 export const calculateConversationGroups = (
   characterIds: string[],
   alliances: Alliance[] = [],
   relationships: Map<string, Map<string, { score: number }>> = new Map()
 ): Map<string, CharacterPosition> => {
   const result = new Map<string, CharacterPosition>();
   
   // If no alliances or relationships, use simple distribution
   if (alliances.length === 0 && relationships.size === 0) {
     return calculateSimpleDistribution(characterIds);
   }
   
   // Step 1: Find alliance clusters
   const allianceClusters = findAllianceMembers(characterIds, alliances);
   
   // Track which characters are already positioned
   const positioned = new Set<string>();
   
   // Step 2: Position alliance clusters
   allianceClusters.forEach(cluster => {
     cluster.characterIds.forEach((id, idx) => {
       const pos = getClusterMemberPosition(
         cluster.centerPosition,
         idx,
         cluster.characterIds.length
       );
       result.set(id, pos);
       positioned.add(id);
     });
   });
   
   // Step 3: Find remaining characters
   const remaining = characterIds.filter(id => !positioned.has(id));
   
   // Step 4: Find friendly pairs among remaining
   const friendlyPairs = findFriendlyPairs(
     remaining,
     relationships,
     allianceClusters.length
   );
   
   friendlyPairs.forEach(pair => {
     pair.characterIds.forEach((id, idx) => {
       const pos = getClusterMemberPosition(
         pair.centerPosition,
         idx,
         pair.characterIds.length
       );
       result.set(id, pos);
       positioned.add(id);
     });
   });
   
   // Step 5: Position remaining solo characters
   const soloRemaining = characterIds.filter(id => !positioned.has(id));
   
   soloRemaining.forEach((id, idx) => {
     const soloPos = SOLO_POSITIONS[idx % SOLO_POSITIONS.length];
     result.set(id, {
       position: [...soloPos.position],
       rotation: [...soloPos.rotation],
     });
   });
   
   return result;
 };
 
 /**
  * Simple distribution for when no social data is available
  */
 const calculateSimpleDistribution = (
   characterIds: string[]
 ): Map<string, CharacterPosition> => {
   const result = new Map<string, CharacterPosition>();
   
   // Use predefined positions
   const allPositions: CharacterPosition[] = [
     // Main sofa group
     { position: [-3, 0, 1], rotation: [0, Math.PI / 4, 0] },
     { position: [-1, 0, 2], rotation: [0, Math.PI / 6, 0] },
     { position: [1, 0, 2], rotation: [0, -Math.PI / 6, 0] },
     { position: [3, 0, 1], rotation: [0, -Math.PI / 4, 0] },
     // Kitchen area
     { position: [10, 0, 0], rotation: [0, -Math.PI / 2, 0] },
     { position: [10, 0, 2], rotation: [0, -Math.PI / 3, 0] },
     // Near nomination lounge
     { position: [-2, 0, 8], rotation: [0, Math.PI, 0] },
     { position: [0, 0, 9], rotation: [0, Math.PI, 0] },
     { position: [2, 0, 8], rotation: [0, Math.PI, 0] },
     // Standing by memory wall
     { position: [-6, 0, -2], rotation: [0, Math.PI / 2, 0] },
     { position: [-6, 0, 0], rotation: [0, Math.PI / 2, 0] },
     { position: [-6, 0, 2], rotation: [0, Math.PI / 2, 0] },
   ];
   
   characterIds.forEach((id, idx) => {
     const pos = allPositions[idx % allPositions.length];
     result.set(id, {
       position: [...pos.position],
       rotation: [...pos.rotation],
     });
   });
   
   return result;
 };
 
 /**
  * Get character position or fallback to default
  */
 export const getCharacterPosition = (
   positionMap: Map<string, CharacterPosition>,
   characterId: string,
   fallbackIndex: number
 ): CharacterPosition => {
   const pos = positionMap.get(characterId);
   if (pos) return pos;
   
   // Fallback to simple positions
   const simplePositions: CharacterPosition[] = [
     { position: [-3, 0, 1], rotation: [0, Math.PI / 4, 0] },
     { position: [-1, 0, 2], rotation: [0, Math.PI / 6, 0] },
     { position: [1, 0, 2], rotation: [0, -Math.PI / 6, 0] },
     { position: [3, 0, 1], rotation: [0, -Math.PI / 4, 0] },
   ];
   
   return simplePositions[fallbackIndex % simplePositions.length];
 };