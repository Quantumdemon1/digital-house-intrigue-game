
import { Houseguest } from '@/models/houseguest';
import { RelationshipMap } from '@/models/game-state';

export const getBestRelationshipWithNominees = (
  povHolder: Houseguest,
  nominees: Houseguest[],
  relationships: RelationshipMap
) => {
  let bestRelationship = -101;
  let bestNominee = null;
  
  for (const nominee of nominees) {
    if (relationships.has(povHolder.id)) {
      const relMap = relationships.get(povHolder.id);
      if (relMap && relMap.has(nominee.id)) {
        const rel = relMap.get(nominee.id)?.score || 0;
        if (rel > bestRelationship) {
          bestRelationship = rel;
          bestNominee = nominee;
        }
      }
    }
  }
  
  return { bestNominee, bestRelationship };
};

export const getWorstRelationshipHouseguest = (
  hoh: Houseguest,
  eligibleReplacements: Houseguest[],
  relationships: RelationshipMap
) => {
  let worstRelationship = 101;
  let worstHouseguest = eligibleReplacements[0];
  
  for (const houseguest of eligibleReplacements) {
    if (relationships.has(hoh.id)) {
      const relMap = relationships.get(hoh.id);
      if (relMap && relMap.has(houseguest.id)) {
        const rel = relMap.get(houseguest.id)?.score || 0;
        if (rel < worstRelationship) {
          worstRelationship = rel;
          worstHouseguest = houseguest;
        }
      }
    }
  }
  
  return worstHouseguest;
};
