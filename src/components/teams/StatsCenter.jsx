
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart2, Star, Trophy, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TeamFormStats from './TeamFormStats';
import PlayerStatsModal from './PlayerStatsModal';

const ADVANCED_TO_BASIC_MAP = {
  GK: "Goalkeeper",
  CB: "Defender", RB: "Defender", LB: "Defender", RWB: "Defender", LWB: "Defender",
  CM: "Midfielder", CDM: "Midfielder", CAM: "Midfielder", RM: "Midfielder", LM: "Midfielder", RW: "Midfielder", LW: "Midfielder",
  ST: "Attacker", CF: "Attacker", RF: "Attacker", LF: "Attacker",
};

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

export default function StatsCenter({ players, completedMatches }) {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false); // Kept for PlayerStatsModal functionality
  const [sortStat, setSortStat] = useState('average_rating');

  const groupedAndSortedPlayers = useMemo(() => {
    const groups = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Attacker: [],
    };

    // Sort all players first by the selected stat, then group them
    const sorted = [...players].sort((a, b) => {
      const aValue = a[sortStat] || 0;
      const bValue = b[sortStat] || 0;
      return bValue - aValue; // Descending order
    });

    sorted.forEach(player => {
      const group = ADVANCED_TO_BASIC_MAP[player.main_position] || "Midfielder"; // Fallback to Midfielder if position is undefined or unrecognized
      if (groups[group]) {
        groups[group].push(player);
      }
    });

    return groups;
  }, [players, sortStat]);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const handleViewFullProfile = (playerId) => {
    navigate(createPageUrl('PlayerProfile') + `?playerId=${playerId}`);
    setShowPlayerModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Player Stats Modal - Moved to top as per outline suggestion for placement */}
      <PlayerStatsModal
        player={selectedPlayer}
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        onViewFullProfile={handleViewFullProfile}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Statistics Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeamFormStats matches={completedMatches} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Player Leaderboard
            </CardTitle>
            <div className="w-48">
              <Select value={sortStat} onValueChange={setSortStat}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="average_rating">Rating</SelectItem>
                  <SelectItem value="total_goals">Goals</SelectItem>
                  <SelectItem value="total_assists">Assists</SelectItem>
                  <SelectItem value="man_of_the_match_awards">MOTM</SelectItem>
                  <SelectItem value="games_played">Games Played</SelectItem>
                  <SelectItem value="total_tackles">Tackles</SelectItem>
                  <SelectItem value="total_saves">Saves</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {players.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500">No players on this team to display stats for.</p>
            </div>
          ) : (
            POSITION_ORDER.map(groupName => (
              groupedAndSortedPlayers[groupName] && groupedAndSortedPlayers[groupName].length > 0 && (
                <div key={groupName}>
                  <h4 className="font-bold text-slate-700 text-base mb-2">{groupName}s</h4>
                  <div className="space-y-2">
                    {groupedAndSortedPlayers[groupName].map(player => (
                      <div
                        key={player.id}
                        className="flex items-center p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                        onClick={() => handlePlayerClick(player)}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                          {player.jersey_number || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-800">{player.first_name} {player.last_name}</p>
                          <p className="text-xs text-slate-500 capitalize">{player.main_position}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800 flex items-center gap-1 justify-end">
                            {sortStat === 'average_rating' && <Star className="w-3 h-3 text-yellow-500" />}
                            {sortStat === 'average_rating' ? (player[sortStat] || 0).toFixed(1) : (player[sortStat] || 0)}
                          </div>
                          <p className="text-xs text-slate-500 capitalize">
                            {sortStat.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
