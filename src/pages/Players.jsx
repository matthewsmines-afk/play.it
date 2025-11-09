import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Player } from "@/entities/Player";
import { Team } from "@/entities/Team";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, Trophy, Target, Heart } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Players() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [playersData, teamsData] = await Promise.all([
        Player.list(),
        Team.list()
      ]);
      setPlayers(playersData || []);
      setTeams(teamsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const getTeamNames = (player) => {
    if (!player.team_memberships || player.team_memberships.length === 0) return "No Team";
    
    const activeTeamIds = player.team_memberships
      .filter(m => m.is_active)
      .map(m => m.team_id);
    
    const teamNames = teams
      .filter(t => activeTeamIds.includes(t.id))
      .map(t => t.name);
    
    return teamNames.length > 0 ? teamNames.join(", ") : "No Team";
  };

  const getCareerStats = (player) => {
    return {
      goals: player.total_goals || 0,
      assists: player.total_assists || 0,
      games: player.games_played || 0
    };
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = selectedTeam === "all" || 
      player.team_memberships?.some(m => m.team_id === selectedTeam && m.is_active);
    
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Header with semi-transparent background */}
      <div className="p-4 sm:p-6 bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Players</h1>
              <p className="text-sm text-slate-600 mt-1">View all players across your teams</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full sm:w-48 bg-white">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content with semi-transparent cards */}
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No players found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlayers.map(player => {
                const stats = getCareerStats(player);
                return (
                  <Card
                    key={player.id}
                    className="cursor-pointer hover:shadow-lg transition-all bg-white/95 backdrop-blur-sm"
                    onClick={() => navigate(createPageUrl("PlayerProfile") + `?playerId=${player.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {player.jersey_number || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {player.first_name} {player.last_name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">{getTeamNames(player)}</p>
                          <p className="text-xs text-slate-600 font-semibold mt-1">{player.main_position}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                            <Target className="w-3 h-3" />
                          </div>
                          <p className="text-lg font-bold text-slate-900">{stats.goals}</p>
                          <p className="text-xs text-slate-500">Goals</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                            <Heart className="w-3 h-3" />
                          </div>
                          <p className="text-lg font-bold text-slate-900">{stats.assists}</p>
                          <p className="text-xs text-slate-500">Assists</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                            <Trophy className="w-3 h-3" />
                          </div>
                          <p className="text-lg font-bold text-slate-900">{stats.games}</p>
                          <p className="text-xs text-slate-500">Games</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}