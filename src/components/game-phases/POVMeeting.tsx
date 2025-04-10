import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, UserMinus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useGame } from '@/contexts/GameContext';
import { Houseguest } from '@/models/houseguest';
import ReplacementNomineeSelector from './POVMeeting/ReplacementNomineeSelector';

const POVMeeting: React.FC = () => {
  const { gameState, dispatch, getActiveHouseguests } = useGame();
  const { toast } = useToast();
  const [useVeto, setUseVeto] = useState<boolean | null>(null);
  const [savedNominee, setSavedNominee] = useState<Houseguest | null>(null);
  const [replacementNominee, setReplacementNominee] = useState<Houseguest | null>(null);
  const [meetingStage, setMeetingStage] = useState<'initial' | 'selectSaved' | 'selectReplacement' | 'complete'>('initial');
  
  const povHolder = gameState.povWinner;
  const nominees = gameState.nominees;
  const hoh = gameState.hohWinner;
  const activeHouseguests = getActiveHouseguests();
  
  const handleVetoDecision = (decision: boolean) => {
    setUseVeto(decision);
    
    if (decision) {
      if (povHolder && povHolder.isNominated) {
        handleSaveNominee(povHolder);
      } else {
        setMeetingStage('selectSaved');
      }
    } else {
      completeVetoMeeting(false);
    }
    
    toast({
      title: decision ? "Veto Will Be Used" : "Veto Will Not Be Used",
      description: decision 
        ? "The Power of Veto holder has decided to use the veto."
        : "The Power of Veto holder has decided not to use the veto.",
    });
  };
  
  const handleSaveNominee = (nominee: Houseguest) => {
    setSavedNominee(nominee);
    setMeetingStage('selectReplacement');
    
    toast({
      title: "Nominee Saved",
      description: `${nominee.name} has been removed from the block.`,
    });
  };
  
  const handleSelectReplacement = (replacement: Houseguest) => {
    setReplacementNominee(replacement);
    
    toast({
      title: "Replacement Nominated",
      description: `${replacement.name} has been placed on the block as a replacement nominee.`,
    });
    
    completeVetoMeeting(true, savedNominee, replacement);
  };
  
  const completeVetoMeeting = (
    vetoUsed: boolean, 
    saved: Houseguest | null = null, 
    replacement: Houseguest | null = null
  ) => {
    if (vetoUsed && saved && replacement) {
      const updatedNominees = nominees
        .filter(nom => nom.id !== saved.id)
        .concat(replacement);
      
      dispatch({ type: 'SET_NOMINEES', payload: updatedNominees });
      
      if (povHolder) {
        dispatch({
          type: 'UPDATE_RELATIONSHIPS',
          payload: {
            guestId1: saved.id,
            guestId2: povHolder.id,
            change: 25,
            note: `${povHolder.name} used POV to save ${saved.name}`
          }
        });
        
        if (hoh) {
          dispatch({
            type: 'UPDATE_RELATIONSHIPS',
            payload: {
              guestId1: replacement.id,
              guestId2: hoh.id,
              change: -20,
              note: `${hoh.name} named ${replacement.name} as replacement nominee`
            }
          });
        }
        
        if (povHolder.id !== hoh?.id) {
          dispatch({
            type: 'UPDATE_RELATIONSHIPS',
            payload: {
              guestId1: replacement.id,
              guestId2: povHolder.id,
              change: -15,
              note: `${povHolder.name} used POV forcing ${replacement.name} on the block`
            }
          });
        }
      }
      
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'PoVMeeting',
          type: 'VETO_USED',
          description: `${povHolder?.name} used the Power of Veto on ${saved.name}. ${hoh?.name} named ${replacement.name} as the replacement nominee.`,
          involvedHouseguests: [povHolder?.id || '', saved.id, hoh?.id || '', replacement.id],
        }
      });
    } else {
      dispatch({
        type: 'LOG_EVENT',
        payload: {
          week: gameState.week,
          phase: 'PoVMeeting',
          type: 'VETO_NOT_USED',
          description: `${povHolder?.name} decided not to use the Power of Veto. The nominations remain the same.`,
          involvedHouseguests: [povHolder?.id || '', ...nominees.map(n => n.id)],
        }
      });
    }
    
    setMeetingStage('complete');
    
    setTimeout(() => {
      dispatch({ type: 'SET_PHASE', payload: 'Eviction' });
    }, 5000);
  };
  
  useEffect(() => {
    if (
      meetingStage === 'initial' && 
      povHolder && 
      !povHolder.isPlayer && 
      useVeto === null
    ) {
      let decision = false;
      
      if (povHolder.isNominated) {
        decision = true;
      } else {
        const getRelationshipWithNominees = () => {
          let bestRelationship = -101;
          let bestNominee = null;
          
          for (const nominee of nominees) {
            if (gameState.relationships.has(povHolder.id)) {
              const relMap = gameState.relationships.get(povHolder.id);
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
        
        const { bestNominee, bestRelationship } = getRelationshipWithNominees();
        
        if (bestRelationship > 30 && bestNominee) {
          decision = true;
          setTimeout(() => handleSaveNominee(bestNominee), 1500);
        } else {
          decision = false;
        }
      }
      
      setTimeout(() => handleVetoDecision(decision), 2000);
    }
  }, [meetingStage, povHolder, useVeto, nominees]);
  
  useEffect(() => {
    if (
      meetingStage === 'selectReplacement' && 
      savedNominee && 
      hoh && 
      !hoh.isPlayer && 
      !replacementNominee
    ) {
      const eligibleReplacements = activeHouseguests.filter(houseguest => 
        !houseguest.isHoH && 
        !houseguest.isNominated && 
        houseguest.id !== savedNominee.id && 
        !houseguest.isPovHolder
      );
      
      if (eligibleReplacements.length > 0) {
        let worstRelationship = 101;
        let worstHouseguest = eligibleReplacements[0];
        
        for (const houseguest of eligibleReplacements) {
          if (gameState.relationships.has(hoh.id)) {
            const relMap = gameState.relationships.get(hoh.id);
            if (relMap && relMap.has(houseguest.id)) {
              const rel = relMap.get(houseguest.id)?.score || 0;
              if (rel < worstRelationship) {
                worstRelationship = rel;
                worstHouseguest = houseguest;
              }
            }
          }
        }
        
        setTimeout(() => handleSelectReplacement(worstHouseguest), 2500);
      }
    }
  }, [meetingStage, savedNominee, hoh, replacementNominee, activeHouseguests]);
  
  const getEligibleToSave = () => nominees;
  
  const getEligibleReplacements = () => {
    return activeHouseguests.filter(houseguest => 
      !houseguest.isHoH && 
      !houseguest.isNominated && 
      houseguest.id !== savedNominee?.id &&
      !houseguest.isPovHolder
    );
  };

  return (
    <Card className="shadow-lg border-bb-green">
      <CardHeader className="bg-bb-green text-bb-dark">
        <CardTitle className="flex items-center">
          <Shield className="mr-2" /> Power of Veto Meeting
        </CardTitle>
        <CardDescription className="text-bb-dark/80">
          Week {gameState.week}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {meetingStage === 'initial' && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Power of Veto Meeting</h3>
            
            {povHolder && (
              <div className="max-w-md mx-auto border rounded-lg p-4 mb-6">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-xl mb-2">
                  {povHolder.name.charAt(0)}
                </div>
                <div className="font-semibold">{povHolder.name} has the Power of Veto</div>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Current Nominees:</h4>
              <div className="flex justify-center gap-4">
                {nominees.map(nominee => (
                  <div key={nominee.id} className="text-center">
                    <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center text-lg mb-1">
                      {nominee.name.charAt(0)}
                    </div>
                    <div>{nominee.name}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {povHolder?.isPlayer && (
              <div className="space-x-4">
                <Button 
                  className="bg-bb-green hover:bg-bb-green/80 text-bb-dark" 
                  onClick={() => handleVetoDecision(true)}
                >
                  Use Veto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleVetoDecision(false)}
                >
                  Don't Use Veto
                </Button>
              </div>
            )}
          </div>
        )}
        
        {meetingStage === 'selectSaved' && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Select a Nominee to Save</h3>
            <p className="text-muted-foreground mb-6">
              Choose one of the current nominees to remove from the block
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {getEligibleToSave().map(nominee => (
                <Button 
                  key={nominee.id} 
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => handleSaveNominee(nominee)}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg mb-2">
                    {nominee.name.charAt(0)}
                  </div>
                  <div>{nominee.name}</div>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {meetingStage === 'selectReplacement' && hoh?.isPlayer && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Select a Replacement Nominee</h3>
            <p className="mb-4">
              As HoH, you must choose a replacement nominee.
            </p>
            
            <ReplacementNomineeSelector 
              eligibleHouseguests={getEligibleReplacements()}
              onSelect={handleSelectReplacement}
            />
          </div>
        )}
        
        {meetingStage === 'complete' && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Veto Meeting Results</h3>
            
            {useVeto ? (
              <>
                <div className="mb-6">
                  <p className="mb-2">
                    <span className="font-semibold">{povHolder?.name}</span> used the Power of Veto on{' '}
                    <span className="font-semibold">{savedNominee?.name}</span>
                  </p>
                  
                  <p>
                    <span className="font-semibold">{hoh?.name}</span> named{' '}
                    <span className="font-semibold">{replacementNominee?.name}</span> as the replacement nominee
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-6">
                  <div>
                    <h4 className="font-semibold mb-2">Current Nominees</h4>
                    <div className="flex flex-col items-center gap-4">
                      {nominees.filter(nom => nom.id !== savedNominee?.id).map(nominee => (
                        <div key={nominee.id} className="text-center">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-lg mb-1">
                            {nominee.name.charAt(0)}
                          </div>
                          <div>{nominee.name}</div>
                        </div>
                      ))}
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-lg mb-1">
                          {replacementNominee?.name.charAt(0)}
                        </div>
                        <div>{replacementNominee?.name}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Saved</h4>
                    <div className="flex flex-col items-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg mb-1">
                          {savedNominee?.name.charAt(0)}
                        </div>
                        <div>{savedNominee?.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="mb-6">
                  <span className="font-semibold">{povHolder?.name}</span> decided not to use the Power of Veto.
                  The nominations remain the same.
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Current Nominees:</h4>
                  <div className="flex justify-center gap-4">
                    {nominees.map(nominee => (
                      <div key={nominee.id} className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-lg mb-1">
                          {nominee.name.charAt(0)}
                        </div>
                        <div>{nominee.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-muted-foreground mt-6">
              <p>Moving to the Eviction Phase...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default POVMeeting;
