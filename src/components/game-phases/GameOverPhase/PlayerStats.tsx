import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { ChartBar, Trophy, Award, User, UserX } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Houseguest } from '@/models/houseguest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NominationCount } from '@/contexts/reducers/reducers/nomination-reducer';

type SortField = 'name' | 'competitions' | 'nominations' | 'status';
type SortDirection = 'asc' | 'desc';

const statusOrder: Record<string, number> = {
  'Winner': 1,
  'Runner-Up': 2,
  'Jury': 3,
  'Evicted': 4,
  'Active': 5 // This shouldn't exist at game over, but including for completeness
};

// Helper function to safely get nominations count
const getNominationsCount = (nominations: NominationCount | number | undefined): number => {
  if (typeof nominations === 'object' && nominations !== null) {
    return nominations.times;
  }
  return typeof nominations === 'number' ? nominations : 0;
};

const PlayerStats: React.FC = () => {
  const { gameState } = useGame();
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [playerFilter, setPlayerFilter] = useState<string>('all');
  
  const totalWeeks = gameState.week;
  
  // Sort houseguests based on current sort field and direction
  const sortedHouseguests = [...gameState.houseguests].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'competitions':
        const aTotal = a.competitionsWon.hoh + a.competitionsWon.pov + (a.competitionsWon.other || 0);
        const bTotal = b.competitionsWon.hoh + b.competitionsWon.pov + (b.competitionsWon.other || 0);
        comparison = aTotal - bTotal;
        break;
      case 'nominations':
        const aNoms = getNominationsCount(a.nominations);
        const bNoms = getNominationsCount(b.nominations);
        comparison = aNoms - bNoms;
        break;
      case 'status':
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Filter houseguests based on selected filter
  const filteredHouseguests = sortedHouseguests.filter(hg => {
    if (playerFilter === 'all') return true;
    if (playerFilter === 'jury') return hg.status === 'Jury' || hg.status === 'Winner' || hg.status === 'Runner-Up';
    if (playerFilter === 'winner') return hg.status === 'Winner' || hg.status === 'Runner-Up';
    if (playerFilter === 'player') return hg.isPlayer;
    return true;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default direction
      setSortField(field);
      setSortDirection('desc'); // Default to descending for most stats
    }
  };

  // Calculate total competitions for a houseguest
  const getTotalCompetitions = (hg: Houseguest): number => {
    return hg.competitionsWon.hoh + hg.competitionsWon.pov + (hg.competitionsWon.other || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ChartBar className="h-5 w-5" /> Player Statistics
        </h2>
        
        <Select
          value={playerFilter}
          onValueChange={setPlayerFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter players" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Players</SelectItem>
            <SelectItem value="jury">Jury Members</SelectItem>
            <SelectItem value="winner">Finalists</SelectItem>
            <SelectItem value="player">Your Character</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <button 
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort('name')}
                >
                  Player
                  {sortField === 'name' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button 
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort('competitions')}
                >
                  Competitions
                  {sortField === 'competitions' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort('nominations')}
                >
                  Nominations
                  {sortField === 'nominations' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHouseguests.map((hg) => (
              <TableRow key={hg.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm overflow-hidden">
                      {hg.avatarUrl ? (
                        <img src={hg.avatarUrl} alt={hg.name} className="w-full h-full object-cover" />
                      ) : (
                        hg.name.charAt(0)
                      )}
                    </div>
                    <span>{hg.name}</span>
                    {hg.isPlayer && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {hg.status === 'Winner' && (
                    <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs">
                      <Trophy size={12} /> Winner
                    </div>
                  )}
                  {hg.status === 'Runner-Up' && (
                    <div className="inline-flex items-center gap-1 bg-silver-100 text-gray-800 rounded-full px-2 py-0.5 text-xs">
                      <Award size={12} /> Runner-Up
                    </div>
                  )}
                  {hg.status === 'Jury' && (
                    <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                      <User size={12} /> Jury
                    </div>
                  )}
                  {hg.status === 'Evicted' && (
                    <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs">
                      <UserX size={12} /> Evicted
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{getTotalCompetitions(hg)} total</span>
                    <span className="text-xs text-muted-foreground">
                      {hg.competitionsWon.hoh} HoH, {hg.competitionsWon.pov} PoV
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span>
                    {getNominationsCount(hg.nominations)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col text-xs">
                    {hg.status === 'Evicted' && <span>Evicted Week {totalWeeks - 1}</span>}
                    {hg.status === 'Jury' && <span>Made jury</span>}
                    {hg.competitionsWon.hoh > 0 && <span>HoH {hg.competitionsWon.hoh}x</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <h3 className="text-xl font-semibold mb-1">Competition Beast</h3>
              <p className="text-sm text-muted-foreground mb-4">Most competitions won</p>
              
              {(() => {
                const sorted = [...gameState.houseguests].sort(
                  (a, b) => getTotalCompetitions(b) - getTotalCompetitions(a)
                );
                const top = sorted[0];
                return top ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl mb-2 overflow-hidden">
                      {top.avatarUrl ? (
                        <img src={top.avatarUrl} alt={top.name} className="w-full h-full object-cover" />
                      ) : (
                        top.name.charAt(0)
                      )}
                    </div>
                    <p className="font-medium">{top.name}</p>
                    <p className="text-sm">{getTotalCompetitions(top)} wins</p>
                  </div>
                ) : null;
              })()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <h3 className="text-xl font-semibold mb-1">Block Star</h3>
              <p className="text-sm text-muted-foreground mb-4">Most times nominated</p>
              
              {(() => {
                const sorted = [...gameState.houseguests].sort(
                  (a, b) => {
                    const aNoms = getNominationsCount(a.nominations);
                    const bNoms = getNominationsCount(b.nominations);
                    return bNoms - aNoms;
                  }
                );
                const top = sorted[0];
                const nomCount = getNominationsCount(top.nominations);
                return top && nomCount > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl mb-2 overflow-hidden">
                      {top.avatarUrl ? (
                        <img src={top.avatarUrl} alt={top.name} className="w-full h-full object-cover" />
                      ) : (
                        top.name.charAt(0)
                      )}
                    </div>
                    <p className="font-medium">{top.name}</p>
                    <p className="text-sm">{nomCount} nominations</p>
                  </div>
                ) : (
                  <p className="text-sm italic">No nominations recorded</p>
                );
              })()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <h3 className="text-xl font-semibold mb-1">HoH Champion</h3>
              <p className="text-sm text-muted-foreground mb-4">Most HoH wins</p>
              
              {(() => {
                const sorted = [...gameState.houseguests].sort(
                  (a, b) => b.competitionsWon.hoh - a.competitionsWon.hoh
                );
                const top = sorted[0];
                return top && top.competitionsWon.hoh > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl mb-2 overflow-hidden">
                      {top.avatarUrl ? (
                        <img src={top.avatarUrl} alt={top.name} className="w-full h-full object-cover" />
                      ) : (
                        top.name.charAt(0)
                      )}
                    </div>
                    <p className="font-medium">{top.name}</p>
                    <p className="text-sm">{top.competitionsWon.hoh} HoH wins</p>
                  </div>
                ) : (
                  <p className="text-sm italic">No HoH wins recorded</p>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerStats;
