import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy, Target, Heart, Shield, Clock, Star, Award } from 'lucide-react';
import { format } from 'date-fns';

const safeFormatDate = (dateString) => {
  if (!dateString) return 'Date not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'EEEE, d MMMM yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

const safeFormatTime = (dateString) => {
  if (!dateString) return 'Time not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'p');
  } catch (error) {
    return 'Invalid date';
  }
};

export default function MatchReportDetail({ match, playerStats, childName, onClose }) {
  const isWin = match.match_status === 'completed' && match.our_score > match.opponent_score;
  const isDraw = match.match_status === 'completed' && match.our_score === match.opponent_score;
  const isLoss = match.match_status === 'completed' && match.our_score < match.opponent_score;

  const resultText = isWin ? 'Victory!' : isDraw ? 'Draw' : isLoss ? 'Defeat' : 'Match Details';
  const resultColor = isWin ? 'text-green-600' : isDraw ? 'text-yellow-600' : isLoss ? 'text-red-600' : 'text-slate-600';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{childName}'s Match Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Overview */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">vs {match.opponent}</h3>
                <p className="text-sm text-slate-600">{match.match_type || 'Match'}</p>
              </div>
              {match.match_status === 'completed' && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-1">
                    {match.our_score} - {match.opponent_score}
                  </div>
                  <p className={`text-lg font-semibold ${resultColor}`}>{resultText}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700">{safeFormatDate(match.date_time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700">{safeFormatTime(match.date_time)}</span>
              </div>
              {match.location?.address && (
                <>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{match.is_home ? 'Home' : 'Away'}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-slate-700">{match.location.address}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Player Performance */}
          {playerStats && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">{childName}'s Performance</h3>
              
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Target className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <p className="text-3xl font-bold text-slate-800">{playerStats.goals || 0}</p>
                  <p className="text-sm text-slate-600">Goals</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Heart className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-3xl font-bold text-slate-800">{playerStats.assists || 0}</p>
                  <p className="text-sm text-slate-600">Assists</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <Shield className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                  <p className="text-3xl font-bold text-slate-800">{playerStats.tackles || 0}</p>
                  <p className="text-sm text-slate-600">Tackles</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                  <p className="text-3xl font-bold text-slate-800">{playerStats.minutes_played || 0}'</p>
                  <p className="text-sm text-slate-600">Minutes</p>
                </div>
              </div>

              {/* Additional Stats */}
              {playerStats.saves > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-800">Saves (GK)</span>
                    <span className="text-xl font-bold text-orange-800">{playerStats.saves}</span>
                  </div>
                </div>
              )}

              {/* Special Achievements */}
              <div className="space-y-2">
                {playerStats.is_man_of_the_match && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="font-bold text-yellow-800">Man of the Match!</p>
                      <p className="text-sm text-yellow-700">Outstanding performance</p>
                    </div>
                  </div>
                )}

                {playerStats.match_rating && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-800">Coach Rating</p>
                        <p className="text-sm text-blue-600">Match performance assessment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 text-blue-600 fill-blue-600" />
                        <span className="text-3xl font-bold text-blue-800">{playerStats.match_rating}</span>
                        <span className="text-lg text-blue-600">/10</span>
                      </div>
                    </div>
                  </div>
                )}

                {playerStats.tactical_notes && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-slate-800 mb-2">Coach Notes:</p>
                    <p className="text-sm text-slate-700">{playerStats.tactical_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Stats */}
          {!playerStats && match.match_status === 'completed' && (
            <div className="bg-slate-50 rounded-lg p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">No detailed stats recorded for this match</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}