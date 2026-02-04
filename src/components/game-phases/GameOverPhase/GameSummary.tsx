
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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> 
        <span className="truncate">Season Summary</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card className="overflow-hidden">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <CardTitle className="mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-bb-blue flex-shrink-0" /> 
              <span className="truncate">Season Stats</span>
            </CardTitle>
            
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">Season Length:</span>
                <span className="font-medium flex-shrink-0">{totalWeeks} weeks</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">Total Houseguests:</span>
                <span className="font-medium flex-shrink-0">{totalHouseguests}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">Total Evictions:</span>
                <span className="font-medium flex-shrink-0">{totalEvictions}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">Jury Size:</span>
                <span className="font-medium flex-shrink-0">{jurySize}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {gameState.winner && (
          <Card className="overflow-hidden">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <CardTitle className="mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-bb-gold flex-shrink-0" /> 
                <span className="truncate">Winner's Journey</span>
              </CardTitle>
              
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">Winner:</span>
                  <span className="font-medium truncate max-w-[120px] sm:max-w-none">{gameState.winner.name}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">HoH Wins:</span>
                  <span className="font-medium flex-shrink-0">{winnerHoHWins}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">PoV Wins:</span>
                  <span className="font-medium flex-shrink-0">{winnerPovWins}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">Times Nominated:</span>
                  <span className="font-medium flex-shrink-0">{winnerNominations}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
      
      {playerHouseguest && (
        <Card className={`overflow-hidden ${playerHouseguest.status === 'Winner' ? 
          "border-2 border-bb-gold" : 
          playerHouseguest.status === 'Runner-Up' ? 
          "border-2 border-muted-foreground" : ""
        }`}>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <CardTitle className="mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-bb-green flex-shrink-0" /> 
              <span className="truncate">Your Journey</span>
            </CardTitle>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center text-lg sm:text-xl overflow-hidden flex-shrink-0">
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
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{playerHouseguest.name}</h3>
                  <div className="flex items-center gap-1 flex-wrap">
                    {playerHouseguest.status === 'Winner' && (
                      <span className="text-xs sm:text-sm bg-bb-gold/20 text-bb-gold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> Winner
                      </span>
                    )}
                    {playerHouseguest.status === 'Runner-Up' && (
                      <span className="text-xs sm:text-sm bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="h-3 w-3" /> Runner-Up
                      </span>
                    )}
                    {playerHouseguest.status === 'Jury' && (
                      <span className="text-xs sm:text-sm bg-bb-blue/20 text-bb-blue px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Users className="h-3 w-3" /> Jury Member
                      </span>
                    )}
                    {playerHouseguest.status === 'Evicted' && (
                      <span className="text-xs sm:text-sm bg-bb-red/20 text-bb-red px-2 py-0.5 rounded-full">
                        Evicted
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">HoH Wins:</span>
                  <span className="font-medium flex-shrink-0">{playerHouseguest.competitionsWon.hoh}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">PoV Wins:</span>
                  <span className="font-medium flex-shrink-0">{playerHouseguest.competitionsWon.pov}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">Total Competitions:</span>
                  <span className="font-medium flex-shrink-0">
                    {playerHouseguest.competitionsWon.hoh + 
                     playerHouseguest.competitionsWon.pov + 
                     (playerHouseguest.competitionsWon.other || 0)}
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">Times Nominated:</span>
                  <span className="font-medium flex-shrink-0">
                    {getNominationsCount(playerHouseguest.nominations)}
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">Final Placement:</span>
                  <span className="font-medium flex-shrink-0">
                    {playerHouseguest.status === 'Winner' && '1st Place 🏆'}
                    {playerHouseguest.status === 'Runner-Up' && '2nd Place 🥈'}
                    {playerHouseguest.status === 'Jury' && 'Jury Member'}
                    {playerHouseguest.status === 'Evicted' && 'Pre-Jury'}
                  </span>
                </li>
              </ul>
              
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-muted/50 rounded-md border text-xs sm:text-sm">
                {playerHouseguest.status === 'Winner' && (
                  <p className="line-clamp-3 sm:line-clamp-none">Congratulations on your victory! You masterfully navigated the social dynamics and competition challenges to claim the title of Big Brother champion!</p>
                )}
                {playerHouseguest.status === 'Runner-Up' && (
                  <p className="line-clamp-3 sm:line-clamp-none">So close! You made it all the way to the final 2, but couldn't quite secure enough jury votes for the win. An impressive game nonetheless!</p>
                )}
                {playerHouseguest.status === 'Jury' && (
                  <p className="line-clamp-3 sm:line-clamp-none">You played a solid game and made it to the jury phase, where you helped decide the winner of the season.</p>
                )}
                {playerHouseguest.status === 'Evicted' && (
                  <p className="line-clamp-3 sm:line-clamp-none">Your journey was cut short, but there's always next season! Learn from this experience and come back stronger.</p>
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
              
            {gameState.juryMembers?.filter(hg => hg && hg.name).map((hg, index) => (
              <li key={hg.id || `jury-${index}`} className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                    {hg.avatarUrl ? (
                      <img src={hg.avatarUrl} alt={hg.name} className="w-full h-full object-cover" />
                    ) : (
                      hg.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{hg.name || 'Unknown'}</span>
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
