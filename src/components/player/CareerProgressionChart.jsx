import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Heart } from 'lucide-react';

export default function CareerProgressionChart({ player, seasonContributions, currentSeasonStats }) {
  // Get current season string
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

  // Combine and sort all season data
  const chartData = [
    ...seasonContributions.map(contribution => ({
      season: contribution.season,
      goals: contribution.stats?.goals || 0,
      assists: contribution.stats?.assists || 0,
      games: contribution.stats?.games_played || 0,
      tackles: contribution.stats?.tackles || 0
    })),
    {
      season: currentSeasonString,
      goals: currentSeasonStats.goals || 0,
      assists: currentSeasonStats.assists || 0,
      games: currentSeasonStats.games_played || 0,
      tackles: currentSeasonStats.tackles || 0
    }
  ].sort((a, b) => a.season.localeCompare(b.season));

  // Calculate goals per game for each season
  const goalsPerGameData = chartData.map(season => ({
    season: season.season,
    goalsPerGame: season.games > 0 ? (season.goals / season.games).toFixed(2) : 0
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Not enough data to show progression charts yet</p>
          <p className="text-sm text-slate-400 mt-2">Complete more seasons to see your progress over time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goals & Assists Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Goals & Assists Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="goals" stroke="#10b981" strokeWidth={2} name="Goals" />
              <Line type="monotone" dataKey="assists" stroke="#3b82f6" strokeWidth={2} name="Assists" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Games Played */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Games Played Per Season
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="games" fill="#8b5cf6" name="Games Played" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goals Per Game Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Goals Per Game (Efficiency)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={goalsPerGameData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="goalsPerGame" fill="#ef4444" name="Goals Per Game" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">Career Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Seasons Tracked:</strong> {chartData.length}
            </p>
            <p>
              <strong>Total Goals:</strong> {chartData.reduce((sum, s) => sum + s.goals, 0)}
            </p>
            <p>
              <strong>Total Assists:</strong> {chartData.reduce((sum, s) => sum + s.assists, 0)}
            </p>
            <p>
              <strong>Total Games:</strong> {chartData.reduce((sum, s) => sum + s.games, 0)}
            </p>
            {chartData.length > 1 && (
              <p className="pt-2 border-t border-blue-300">
                <strong>Trend:</strong> {
                  chartData[chartData.length - 1].goals > chartData[chartData.length - 2].goals
                    ? '📈 Goals are increasing!'
                    : chartData[chartData.length - 1].goals < chartData[chartData.length - 2].goals
                    ? '📉 Goals have decreased this season'
                    : '➡️ Goal output is consistent'
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}