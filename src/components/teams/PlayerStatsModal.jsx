import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Clock, Target, Shield, Users, ExternalLink } from 'lucide-react';

export default function PlayerStatsModal({ player, isOpen, onClose, onViewFullProfile }) {
  if (!player) return null;

  const stats = [
    { label: 'Games Played', value: player.games_played || 0, icon: Users, color: 'blue' },
    { label: 'Goals', value: player.total_goals || 0, icon: Target, color: 'green' },
    { label: 'Assists', value: player.total_assists || 0, icon: Users, color: 'blue' },
    { label: 'Tackles', value: player.total_tackles || 0, icon: Shield, color: 'purple' },
    { label: 'Saves', value: player.total_saves || 0, icon: Trophy, color: 'orange' },
    { label: 'Playing Time', value: `${Math.round((player.total_time_played_minutes || 0) / 60)}h`, icon: Clock, color: 'slate' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {player.jersey_number || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{player.first_name} {player.last_name}</h3>
                  <p className="text-sm text-slate-600 capitalize">{player.main_position || 'Player'}</p>
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key Stats */}
          <div className="flex items-center justify-center gap-6 py-4 bg-slate-50 rounded-lg">
            {player.average_rating && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg">{player.average_rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-slate-600">Avg Rating</p>
              </div>
            )}
            {(player.man_of_the_match_awards || 0) > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-lg">{player.man_of_the_match_awards}</span>
                </div>
                <p className="text-xs text-slate-600">MOTM Awards</p>
              </div>
            )}
          </div>

          {/* All Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                  <Icon className={`w-4 h-4 mx-auto mb-2 text-${stat.color}-500`} />
                  <div className="font-bold text-lg text-slate-800">{stat.value}</div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => onViewFullProfile(player.id)}
            className="w-full"
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Profile & Match History
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}