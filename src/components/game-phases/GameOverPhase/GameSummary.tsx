
import React, { useMemo } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGame } from '@/contexts/GameContext';
import { NominationCount } from '@/models/houseguest';
import { GameEvent, GameState } from '@/models/game-state';
import { FileText, Calendar, Trophy, User, Users, Award } from 'lucide-react';

interface GameSummaryProps {
  gameState: GameState;
}

const GameSummary: React.FC<GameSummaryProps> = ({ gameState: propGameState }) => {
  const { gameState } = useGame();
  
  // Use propGameState instead of gameState from useGame() to respect the component API
  const stateToUse = propGameState || gameState;
  
  // Calculate derived values that might not be directly on the gameState
  const totalHouseguests = stateToUse.houseguests?.length || 0;
  const totalWeeks = stateToUse.week || 0;
  const totalEvictions = stateToUse.houseguests?.filter(h => h.status === 'Evicted' || h.status === 'Jury').length || 0;
  const jurySize = stateToUse.juryMembers?.length || 0;
  
  const playerHouseguest = stateToUse.houseguests.find(hg => hg.isPlayer);
  const winnerHoHWins = stateToUse.winner?.competitionsWon.hoh || 0;
  const winnerPovWins = stateToUse.winner?.competitionsWon.pov || 0;

  const getNominationsCount = (nominations: NominationCount | number | undefined): number => {
    if (typeof nominations === 'object' && nominations !== null) {
      return nominations.times;
    }
    return typeof nominations === 'number' ? nominations : 0;
  };

  const winnerNominations = getNominationsCount(stateToUse.winner?.nominations);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="h-5 w-5" /> Season Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Season Stats
            </CardTitle>
            
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Season Length:</span>
                <span className="font-medium">{totalWeeks} weeks</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total Houseguests:</span>
                <span className="font-medium">{totalHouseguests}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total Evictions:</span>
                <span className="font-medium">{totalEvictions}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Jury Size:</span>
                <span className="font-medium">{jurySize}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {gameState.winner && (
          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" /> Winner's Journey
              </CardTitle>
              
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Winner:</span>
                  <span className="font-medium">{gameState.winner.name}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">HoH Wins:</span>
                  <span className="font-medium">{winnerHoHWins}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">PoV Wins:</span>
                  <span className="font-medium">{winnerPovWins}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Times Nominated:</span>
                  <span className="font-medium">{winnerNominations}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
      
      {playerHouseguest && (
        <Card className={playerHouseguest.status === 'Winner' ? 
          "border-2 border-yellow-400" : 
          playerHouseguest.status === 'Runner-Up' ? 
          "border-2 border-gray-400" : ""
        }>
          <CardContent className="pt-6">
            <CardTitle className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" /> Your Journey
            </CardTitle>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl overflow-hidden">
                  {playerHouseguest.avatarUrl ? (
                    <img 
                      src={playerHouseguest.avatarUrl} 
                      alt={playerHouseguest.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    playerHouseguest.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{playerHouseguest.name}</h3>
                  <div className="flex items-center gap-1">
                    {playerHouseguest.status === 'Winner' && (
                      <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> Winner
                      </span>
                    )}
                    {playerHouseguest.status === 'Runner-Up' && (
                      <span className="text-sm bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="h-3 w-3" /> Runner-Up
                      </span>
                    )}
                    {playerHouseguest.status === 'Jury' && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Users className="h-3 w-3" /> Jury Member
                      </span>
                    )}
                    {playerHouseguest.status === 'Evicted' && (
                      <span className="text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                        Evicted
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">HoH Wins:</span>
                  <span className="font-medium">{playerHouseguest.competitionsWon.hoh}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">PoV Wins:</span>
                  <span className="font-medium">{playerHouseguest.competitionsWon.pov}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Total Competitions:</span>
                  <span className="font-medium">
                    {playerHouseguest.competitionsWon.hoh + 
                     playerHouseguest.competitionsWon.pov + 
                     (playerHouseguest.competitionsWon.other || 0)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Times Nominated:</span>
                  <span className="font-medium">
                    {getNominationsCount(playerHouseguest.nominations)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Final Placement:</span>
                  <span className="font-medium">
                    {playerHouseguest.status === 'Winner' && '1st Place 🏆'}
                    {playerHouseguest.status === 'Runner-Up' && '2nd Place 🥈'}
                    {playerHouseguest.status === 'Jury' && 'Jury Member'}
                    {playerHouseguest.status === 'Evicted' && 'Pre-Jury'}
                  </span>
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md border text-sm">
                {playerHouseguest.status === 'Winner' && (
                  <p>Congratulations on your victory! You masterfully navigated the social dynamics and competition challenges to claim the title of Big Brother champion!</p>
                )}
                {playerHouseguest.status === 'Runner-Up' && (
                  <p>So close! You made it all the way to the final 2, but couldn't quite secure enough jury votes for the win. An impressive game nonetheless!</p>
                )}
                {playerHouseguest.status === 'Jury' && (
                  <p>You played a solid game and made it to the jury phase, where you helped decide the winner of the season.</p>
                )}
                {playerHouseguest.status === 'Evicted' && (
                  <p>Your journey was cut short, but there's always next season! Learn from this experience and come back stronger.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <CardTitle className="mb-4">Final Standings</CardTitle>
          
          <ol className="list-decimal list-inside space-y-4 pl-2">
            {gameState.houseguests
              .filter(hg => hg.status === 'Winner')
              .map(hg => (
                <li key={hg.id} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                      {hg.avatarUrl ? (
                        <img src={hg.avatarUrl} alt={hg.name} className="w-full h-full object-cover" />
                      ) : (
                        hg.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{hg.name}</span>
                      {hg.isPlayer && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                    </div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1 text-sm">
                    <Trophy className="h-3 w-3" /> Winner
                  </span>
                </li>
              ))}
              
            {gameState.houseguests
              .filter(hg => hg.status === 'Runner-Up')
              .map(hg => (
                <li key={hg.id} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                      {hg.avatarUrl ? (
                        <img src={hg.avatarUrl} alt={hg.name} className="w-full h-full object-cover" />
                      ) : (
                        hg.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{hg.name}</span>
                      {hg.isPlayer && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1 text-sm">
                    <Award className="h-3 w-3" /> Runner-Up
                  </span>
                </li>
              ))}
              
            {gameState.juryMembers.map((hg, index) => (
              <li key={hg.id} className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                    {hg.avatarUrl ? (
                      <img src={hg.avatarUrl} alt={hg.name} className="w-full h-full object-cover" />
                    ) : (
                      hg.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{hg.name}</span>
                    {hg.isPlayer && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm">
                  Jury Member #{index + 1}
                </span>
              </li>
            ))}
            
            {gameState.houseguests
              .filter(hg => hg.status === 'Evicted')
              .map(hg => (
                <li key={hg.id} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                      {hg.avatarUrl ? (
                        <img src={hg.avatarUrl} alt={hg.name} className="w-full h-full object-cover" />
                      ) : (
                        hg.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{hg.name}</span>
                      {hg.isPlayer && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-sm">
                    Pre-Jury
                  </span>
                </li>
              ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSummary;
