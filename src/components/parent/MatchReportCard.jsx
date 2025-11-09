import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Heart, Shield, Star, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const safeFormatDate = (dateString) => {
  if (!dateString) return 'Date not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'EEE, d MMM yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

export default function MatchReportCard({ match, playerStats, childName, onClick }) {
  const isWin = match.match_status === 'completed' && match.our_score > match.opponent_score;
  const isDraw = match.match_status === 'completed' && match.our_score === match.opponent_score;
  const isLoss = match.match_status === 'completed' && match.our_score < match.opponent_score;

  const resultColor = isWin ? 'bg-green-50 border-green-200' : 
                       isDraw ? 'bg-yellow-50 border-yellow-200' : 
                       isLoss ? 'bg-red-50 border-red-200' : 
                       'bg-slate-50 border-slate-200';

  const resultBadge = isWin ? 'Win' : isDraw ? 'Draw' : isLoss ? 'Loss' : 'Scheduled';
  const resultBadgeColor = isWin ? 'bg-green-100 text-green-800' : 
                            isDraw ? 'bg-yellow-100 text-yellow-800' : 
                            isLoss ? 'bg-red-100 text-red-800' : 
                            'bg-slate-100 text-slate-800';

  return (
    <Card 
      className={`${resultColor} border-2 cursor-pointer hover:shadow-lg transition-all duration-200`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Match Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-slate-800">
                vs {match.opponent}
              </h3>
              <Badge className={resultBadgeColor}>{resultBadge}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>{safeFormatDate(match.date_time)}</span>
            </div>
            {match.location?.address && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{match.is_home ? 'Home' : 'Away'}</span>
              </div>
            )}
          </div>
          
          {match.match_status === 'completed' && (
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-800">
                {match.our_score} - {match.opponent_score}
              </div>
              <p className="text-xs text-slate-500">{match.match_type || 'Match'}</p>
            </div>
          )}
        </div>

        {/* Player Stats */}
        {playerStats && (
          <div className="border-t border-slate-300 pt-3 mt-3">
            <p className="text-sm font-medium text-slate-700 mb-2">{childName}'s Performance:</p>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Goals */}
              {(playerStats.goals > 0 || match.match_status === 'completed') && (
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <Target className="w-4 h-4 mx-auto text-green-600 mb-1" />
                  <p className="text-lg font-bold text-slate-800">{playerStats.goals || 0}</p>
                  <p className="text-xs text-slate-500">Goals</p>
                </div>
              )}
              
              {/* Assists */}
              {(playerStats.assists > 0 || match.match_status === 'completed') && (
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <Heart className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <p className="text-lg font-bold text-slate-800">{playerStats.assists || 0}</p>
                  <p className="text-xs text-slate-500">Assists</p>
                </div>
              )}
              
              {/* Minutes Played */}
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <Shield className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                <p className="text-lg font-bold text-slate-800">{playerStats.minutes_played || 0}'</p>
                <p className="text-xs text-slate-500">Minutes</p>
              </div>
            </div>

            {/* MOTM Badge */}
            {playerStats.is_man_of_the_match && (
              <div className="mt-2 flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800">Man of the Match!</span>
              </div>
            )}

            {/* Coach Rating */}
            {playerStats.match_rating && (
              <div className="mt-2 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2">
                <span className="text-sm text-blue-700">Coach Rating:</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                  <span className="font-bold text-blue-800">{playerStats.match_rating}/10</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Stats Message */}
        {!playerStats && match.match_status === 'completed' && (
          <div className="border-t border-slate-300 pt-3 mt-3">
            <p className="text-sm text-slate-500 text-center">No stats recorded for this match</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}