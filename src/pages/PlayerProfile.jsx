import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { PlayerSeasonContribution } from '@/entities/PlayerSeasonContribution';
import { Team } from '@/entities/Team';
import { User } from '@/entities/User';
import { Event } from '@/entities/Event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Edit,
  Trophy,
  Target,
  Heart,
  Shield,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';
import { createPageUrl } from '@/utils';

import SeasonStatsBreakdown from '../components/player/SeasonStatsBreakdown';
import CareerProgressionChart from '../components/player/CareerProgressionChart';

export default function PlayerProfile() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [seasonContributions, setSeasonContributions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState('current');
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    const loadPlayerData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const playerId = urlParams.get('playerId');

      if (!playerId) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      try {
        const [playerData, user, contributions] = await Promise.all([
          Player.get(playerId),
          User.me(),
          PlayerSeasonContribution.filter({ player_id: playerId }, '-season')
        ]);

        setPlayer(playerData);
        setCurrentUser(user);
        setSeasonContributions(contributions || []);

        // Load teams
        if (playerData.team_memberships && playerData.team_memberships.length > 0) {
          const teamIds = playerData.team_memberships
            .filter(m => m.team_id)
            .map(m => m.team_id);
          
          if (teamIds.length > 0) {
            const teamsData = await Team.filter({ id: { '$in': teamIds } });
            setTeams(teamsData || []);

            // Load recent matches
            const matches = await Event.filter({
              team_id: { '$in': teamIds },
              event_type: 'match',
              match_status: 'completed'
            }, '-date_time', 5);
            setRecentMatches(matches || []);
          }
        }
      } catch (error) {
        console.error('Error loading player data:', error);
      }
      setIsLoading(false);
    };

    loadPlayerData();
  }, [navigate]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getActiveTeams = () => {
    if (!player || !player.team_memberships) return [];
    return player.team_memberships
      .filter(m => m.is_active)
      .map(membership => {
        const team = teams.find(t => t.id === membership.team_id);
        return {
          ...membership,
          teamName: team?.name || 'Unknown Team',
          teamAgeGroup: team?.age_group
        };
      });
  };

  const getCurrentSeasonStats = () => {
    return player?.career_stats || {
      games_played: 0,
      goals: 0,
      assists: 0,
      tackles: 0,
      saves: 0,
      minutes_played: 0,
      man_of_the_match_awards: 0
    };
  };

  const getCareerTotals = () => {
    // Sum all season contributions + current season
    const currentStats = getCurrentSeasonStats();
    const historicalStats = seasonContributions.reduce((acc, contribution) => {
      const stats = contribution.stats || {};
      return {
        games_played: acc.games_played + (stats.games_played || 0),
        goals: acc.goals + (stats.goals || 0),
        assists: acc.assists + (stats.assists || 0),
        tackles: acc.tackles + (stats.tackles || 0),
        saves: acc.saves + (stats.saves || 0),
        minutes_played: acc.minutes_played + (stats.minutes_played || 0),
        man_of_the_match_awards: acc.man_of_the_match_awards + (stats.man_of_the_match_awards || 0)
      };
    }, {
      games_played: 0,
      goals: 0,
      assists: 0,
      tackles: 0,
      saves: 0,
      minutes_played: 0,
      man_of_the_match_awards: 0
    });

    return {
      games_played: historicalStats.games_played + currentStats.games_played,
      goals: historicalStats.goals + currentStats.goals,
      assists: historicalStats.assists + currentStats.assists,
      tackles: historicalStats.tackles + currentStats.tackles,
      saves: historicalStats.saves + currentStats.saves,
      minutes_played: historicalStats.minutes_played + currentStats.minutes_played,
      man_of_the_match_awards: historicalStats.man_of_the_match_awards + currentStats.man_of_the_match_awards
    };
  };

  const getDisplayStats = () => {
    if (selectedSeason === 'current') {
      return getCurrentSeasonStats();
    } else if (selectedSeason === 'career') {
      return getCareerTotals();
    } else {
      // Specific season selected
      const contribution = seasonContributions.find(c => c.season === selectedSeason);
      return contribution?.stats || {
        games_played: 0,
        goals: 0,
        assists: 0,
        tackles: 0,
        saves: 0,
        minutes_played: 0,
        man_of_the_match_awards: 0
      };
    }
  };

  const canEdit = () => {
    if (!currentUser || !player) return false;
    // Parent can edit their own child
    if (currentUser.id === player.parent_user_id) return true;
    // Coach can edit players on their teams
    const activeTeamIds = getActiveTeams().map(t => t.team_id);
    return activeTeamIds.some(teamId => {
      const team = teams.find(t => t.id === teamId);
      return team?.coaches?.includes(currentUser.id);
    });
  };

  const getAvailableSeasons = () => {
    const seasons = ['current', 'career'];
    seasonContributions.forEach(contribution => {
      if (contribution.season && !seasons.includes(contribution.season)) {
        seasons.push(contribution.season);
      }
    });
    return seasons;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2D2C29' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-4">
        <p className="text-red-600">Player not found</p>
      </div>
    );
  }

  const activeTeams = getActiveTeams();
  const displayStats = getDisplayStats();
  const careerTotals = getCareerTotals();
  const availableSeasons = getAvailableSeasons();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2D2C29' }}>
      {/* Dark Header */}
      <div className="text-white pt-6 pb-4">
        <div className="mx-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            {canEdit() && (
              <Button
                onClick={() => navigate(createPageUrl('EditPlayer') + `?playerId=${player.id}`)}
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Player Header Card */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#3A3936' }}>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {activeTeams[0]?.jersey_number || '?'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {player.first_name} {player.last_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-white/20 text-white border-0">
                    {player.main_position || 'No Position'}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0">
                    Age {calculateAge(player.date_of_birth)}
                  </Badge>
                  {player.preferred_foot && (
                    <Badge className="bg-white/20 text-white border-0">
                      {player.preferred_foot} Footed
                    </Badge>
                  )}
                </div>
                {activeTeams.length > 0 && (
                  <div className="space-y-1">
                    {activeTeams.map((teamMembership, idx) => (
                      <div key={idx} className="text-sm text-gray-300">
                        🏆 {teamMembership.teamName}
                        {teamMembership.teamAgeGroup && ` (${teamMembership.teamAgeGroup})`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White Content Area */}
      <div className="bg-white min-h-screen rounded-t-3xl relative -mt-3 pb-24">
        <div className="px-4 pt-8 pb-6">
          
          {/* Season Selector */}
          {availableSeasons.length > 2 && (
            <div className="mb-6">
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Current Season
                    </div>
                  </SelectItem>
                  <SelectItem value="career">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Career Totals
                    </div>
                  </SelectItem>
                  {seasonContributions.map((contribution) => (
                    <SelectItem key={contribution.id} value={contribution.season}>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Season {contribution.season}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stats Display */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="progression">Progression</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                    <p className="text-3xl font-bold text-slate-800">{displayStats.games_played}</p>
                    <p className="text-xs text-slate-600">Games</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 mx-auto text-green-600 mb-2" />
                    <p className="text-3xl font-bold text-slate-800">{displayStats.goals}</p>
                    <p className="text-xs text-slate-600">Goals</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <Heart className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                    <p className="text-3xl font-bold text-slate-800">{displayStats.assists}</p>
                    <p className="text-xs text-slate-600">Assists</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                    <p className="text-3xl font-bold text-slate-800">{displayStats.tackles}</p>
                    <p className="text-xs text-slate-600">Tackles</p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-600" />
                        <span className="text-sm text-slate-600">Minutes</span>
                      </div>
                      <span className="text-2xl font-bold text-slate-800">
                        {Math.round(displayStats.minutes_played / 60)}h
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-slate-600">MOTM</span>
                      </div>
                      <span className="text-2xl font-bold text-slate-800">
                        {displayStats.man_of_the_match_awards || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {displayStats.saves > 0 && (
                  <Card className="col-span-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-slate-600">Saves (GK)</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">{displayStats.saves}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Career Comparison (when viewing current season) */}
              {selectedSeason === 'current' && seasonContributions.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Career Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-800">{careerTotals.games_played}</p>
                        <p className="text-xs text-blue-600">Total Games</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-800">{careerTotals.goals}</p>
                        <p className="text-xs text-blue-600">Total Goals</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-800">{careerTotals.assists}</p>
                        <p className="text-xs text-blue-600">Total Assists</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Matches */}
              {recentMatches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recentMatches.map((match) => {
                        const isWin = match.our_score > match.opponent_score;
                        const isDraw = match.our_score === match.opponent_score;
                        const resultColor = isWin ? 'text-green-600' : isDraw ? 'text-yellow-600' : 'text-red-600';
                        
                        return (
                          <div key={match.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="text-sm text-slate-700">vs {match.opponent}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${resultColor}`}>
                                {match.our_score} - {match.opponent_score}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="breakdown" className="mt-6">
              <SeasonStatsBreakdown
                player={player}
                seasonContributions={seasonContributions}
                currentSeasonStats={getCurrentSeasonStats()}
                teams={teams}
              />
            </TabsContent>

            <TabsContent value="progression" className="mt-6">
              <CareerProgressionChart
                player={player}
                seasonContributions={seasonContributions}
                currentSeasonStats={getCurrentSeasonStats()}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}