import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Trophy, Clock } from 'lucide-react';

export default function MatchReportModal({
  isOpen,
  onClose,
  players = [],
  playerMinutes = {},
  matchStats = {},
  ourScore = 0,
  opponentScore = 0,
  opponent = '',
  onSave
}) {
  const [ratings, setRatings] = useState({});
  const [motmPlayerId, setMotmPlayerId] = useState('');

  // Get players who actually played (have minutes > 0)
  const playersWhoPlayed = players.filter(player => 
    playerMinutes[player.id] && playerMinutes[player.id] > 0
  );

  useEffect(() => {
    // Initialize ratings for all players who played
    const initialRatings = {};
    const currentPlayersWhoPlayed = players.filter(player => 
      playerMinutes[player.id] && playerMinutes[player.id] > 0
    );
    
    currentPlayersWhoPlayed.forEach(player => {
      initialRatings[player.id] = '';
    });
    setRatings(initialRatings);
  }, [players, playerMinutes]);

  const handleRatingChange = (playerId, rating) => {
    setRatings(prev => ({
      ...prev,
      [playerId]: rating ? parseInt(rating) : ''
    }));
  };

  const handleSave = () => {
    // Filter out empty ratings and convert to numbers
    const finalRatings = {};
    Object.entries(ratings).forEach(([playerId, rating]) => {
      if (rating !== '' && rating !== null && rating !== undefined) {
        finalRatings[playerId] = parseInt(rating);
      }
    });

    onSave({
      ratings: finalRatings,
      motmPlayerId: motmPlayerId || null
    });
  };

  // Helper function to convert seconds to minutes (properly)
  const formatMinutes = (timeInSeconds) => {
    if (!timeInSeconds) return 0;
    return Math.round(timeInSeconds / 60);
  };

  const canSave = Object.keys(ratings).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto h-[85vh] max-h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-4 py-3 border-b bg-slate-50 flex-shrink-0">
          <DialogTitle className="text-lg font-bold text-center">
            Final Match Report
          </DialogTitle>
          <div className="text-center mt-2">
            <div className="text-2xl font-bold text-slate-800">
              {ourScore} - {opponentScore}
            </div>
            <p className="text-sm text-slate-600 mt-1">vs {opponent}</p>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Man of the Match Selection */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <Label className="font-semibold text-yellow-800 text-sm">Man of the Match</Label>
            </div>
            <Select value={motmPlayerId} onValueChange={setMotmPlayerId}>
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue placeholder="Select Man of the Match" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No Man of the Match</SelectItem>
                {playersWhoPlayed.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Player Ratings */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Star className="w-4 h-4" />
              Player Ratings
            </Label>
            
            {playersWhoPlayed.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No players recorded minutes in this match</p>
            ) : (
              <div className="space-y-2">
                {playersWhoPlayed.map(player => {
                  const timeInSeconds = playerMinutes[player.id] || 0;
                  const minutes = formatMinutes(timeInSeconds);
                  const stats = matchStats[player.id] || {};
                  
                  return (
                    <div key={player.id} className="bg-white border border-slate-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">
                            {player.first_name} {player.last_name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{minutes} min</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Label className="text-xs font-medium">Rating:</Label>
                          <Select
                            value={ratings[player.id]?.toString() || ''}
                            onValueChange={(value) => handleRatingChange(player.id, value)}
                          >
                            <SelectTrigger className="w-12 h-8 text-sm">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>-</SelectItem>
                              {Array.from({ length: 10 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Player stats */}
                      {(stats.goals > 0 || stats.assists > 0 || stats.tackles > 0 || stats.saves > 0) && (
                        <div className="flex gap-2 flex-wrap">
                          {stats.goals > 0 && (
                            <Badge variant="outline" className="text-green-600 bg-green-50 text-xs px-2 py-0">
                              {stats.goals} goal{stats.goals > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {stats.assists > 0 && (
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 text-xs px-2 py-0">
                              {stats.assists} assist{stats.assists > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {stats.tackles > 0 && (
                            <Badge variant="outline" className="text-purple-600 bg-purple-50 text-xs px-2 py-0">
                              {stats.tackles} tackle{stats.tackles > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {stats.saves > 0 && (
                            <Badge variant="outline" className="text-orange-600 bg-orange-50 text-xs px-2 py-0">
                              {stats.saves} save{stats.saves > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add some padding at the bottom for safe scrolling */}
          <div className="h-4"></div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t bg-slate-50 p-3 flex-shrink-0">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-9 text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 h-9 text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              Finish Match
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}