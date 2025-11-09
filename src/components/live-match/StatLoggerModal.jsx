import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Target, Heart, Shield, Crosshair, Square, SquareX, UserMinus } from 'lucide-react';

const StatIcons = {
  goal: Target,
  assist: Heart,
  save: Shield,
  tackle: Crosshair,
  yellow_card: Square,
  red_card: SquareX
};

export default function StatLoggerModal({
  isOpen,
  onClose,
  statType,
  players,
  onLogStat
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedAssist, setSelectedAssist] = useState(null);
  const [isOwnGoalByOpponent, setIsOwnGoalByOpponent] = useState(false);

  if (!statType) {
    return null;
  }

  const handleSubmit = () => {
    if (!selectedPlayer && !isOwnGoalByOpponent) return;

    const statData = {
      statType,
      player: selectedPlayer,
      assist: selectedAssist,
      isOwnGoalByOpponent: isOwnGoalByOpponent
    };

    onLogStat(statData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPlayer(null);
    setSelectedAssist(null);
    setIsOwnGoalByOpponent(false);
    onClose();
  };

  const handleSelectOwnGoal = () => {
      setSelectedPlayer(null);
      setIsOwnGoalByOpponent(true);
  }

  const handleSelectPlayer = (player) => {
      setSelectedPlayer(player);
      setIsOwnGoalByOpponent(false);
  }

  const StatIcon = StatIcons[statType] || Target;
  const isGoal = statType === 'goal';
  const eligibleAssistPlayers = players ? players.filter(p => p.id !== selectedPlayer?.id) : [];
  const safeStatType = statType || 'stat';
  const displayStatType = safeStatType.replace('_', ' ').toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatIcon className="w-5 h-5" />
            Log {displayStatType}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold mb-3 block">
              Who {isGoal ? 'scored' : `got the ${safeStatType.replace('_', ' ')}`}?
            </Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {isGoal && (
                  <Button
                      variant={isOwnGoalByOpponent ? "default" : "outline"}
                      className="justify-start h-12 p-3"
                      onClick={handleSelectOwnGoal}
                  >
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center text-sm font-bold">
                            <UserMinus className="w-4 h-4"/>
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">Own Goal by Opponent</div>
                        </div>
                    </div>
                  </Button>
              )}
              {players && players.length > 0 ? players.map(player => (
                <Button
                  key={player.id}
                  variant={selectedPlayer?.id === player.id ? "default" : "outline"}
                  className="justify-start h-12 p-3"
                  onClick={() => handleSelectPlayer(player)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {player.jersey_number || '?'}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{player.first_name} {player.last_name}</div>
                      <Badge variant="secondary" className="text-xs">{player.main_position || 'N/A'}</Badge>
                    </div>
                  </div>
                </Button>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No players available</p>
              )}
            </div>
          </div>

          {isGoal && selectedPlayer && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  Who assisted? (Optional)
                </Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  <Button
                    variant={!selectedAssist ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedAssist(null)}
                  >
                    No assist
                  </Button>
                  {eligibleAssistPlayers.map(player => (
                    <Button
                      key={player.id}
                      variant={selectedAssist?.id === player.id ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedAssist(player)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {player.jersey_number || '?'}
                        </div>
                        {player.first_name} {player.last_name}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedPlayer && !isOwnGoalByOpponent}
              className="bg-green-600 hover:bg-green-700"
            >
              Log {safeStatType.replace('_', ' ')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}