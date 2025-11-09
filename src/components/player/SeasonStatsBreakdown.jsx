import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Heart, Shield, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SeasonStatsBreakdown({ player, seasonContributions, currentSeasonStats, teams }) {
  // Get current season string (e.g., "2024/25")
  const getCurrentSeasonString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    if (month >= 9) {
      return `${year}/${(year + 1).toString().slice(2)}`;
    } else {
      return `${year - 1}/${year.toString().slice(2)}`;
    }
  };

  const currentSeasonString = getCurrentSeasonString();

  // Combine historical and current season data
  const allSeasons = [
    {
      season: currentSeasonString,
      stats: currentSeasonStats,
      isCurrent: true,
      team_id: player.team_memberships?.find(m => m.is_active)?.team_id
    },
    ...seasonContributions.map(contribution => ({
      season: contribution.season,
      stats: contribution.stats || {},
      isCurrent: false,
      team_id: contribution.team_id
    }))
  ].sort((a, b) => {
    // Sort by season string, most recent first
    return b.season.localeCompare(a.season);
  });

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Unknown Team';
  };

  const calculateGoalsPerGame = (stats) => {
    if (!stats.games_played) return '0.00';
    return (stats.goals / stats.games_played).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-slate-600" />
            Season-by-Season Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allSeasons.map((seasonData, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      Season {seasonData.season}
                      {seasonData.isCurrent && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600">{getTeamName(seasonData.team_id)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{seasonData.stats.games_played || 0}</p>
                    <p className="text-xs text-slate-500">Games</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <Target className="w-4 h-4 mx-auto text-green-600 mb-1" />
                    <p className="text-xl font-bold text-slate-800">{seasonData.stats.goals || 0}</p>
                    <p className="text-xs text-slate-600">Goals</p>
                    <p className="text-xs text-green-600">{calculateGoalsPerGame(seasonData.stats)} per game</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                    <Heart className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-xl font-bold text-slate-800">{seasonData.stats.assists || 0}</p>
                    <p className="text-xs text-slate-600">Assists</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
                    <Shield className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                    <p className="text-xl font-bold text-slate-800">{seasonData.stats.tackles || 0}</p>
                    <p className="text-xs text-slate-600">Tackles</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
                    <Clock className="w-4 h-4 mx-auto text-slate-600 mb-1" />
                    <p className="text-xl font-bold text-slate-800">
                      {Math.round((seasonData.stats.minutes_played || 0) / 60)}h
                    </p>
                    <p className="text-xs text-slate-600">Minutes</p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                    <Star className="w-4 h-4 mx-auto text-yellow-600 mb-1" />
                    <p className="text-xl font-bold text-slate-800">{seasonData.stats.man_of_the_match_awards || 0}</p>
                    <p className="text-xs text-slate-600">MOTM</p>
                  </div>

                  {seasonData.stats.saves > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-2 text-center">
                      <Shield className="w-4 h-4 mx-auto text-orange-600 mb-1" />
                      <p className="text-xl font-bold text-slate-800">{seasonData.stats.saves}</p>
                      <p className="text-xs text-slate-600">Saves</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {allSeasons.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No season data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}