import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { UserMinus } from 'lucide-react';

export default function ScoreAdjustmentModal({
  isOpen,
  onClose,
  adjustmentType,
  scoreType,
  players = [],
  existingGoals = [],
  onConfirm
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedAssist, setSelectedAssist] = useState(null);
  const [selectedGoalToRemove, setSelectedGoalToRemove] = useState(null);
  const [isOwnGoalByOpponent, setIsOwnGoalByOpponent] = useState(false);

  const isAdding = adjustmentType === 'add_goal';
  const eligibleAssistPlayers = Array.isArray(players) ? players.filter(p => p && p.id !== selectedPlayer?.id) : [];

  const handleSubmit = () => {
    if (isAdding && !selectedPlayer && !isOwnGoalByOpponent) return;
    if (!isAdding && !selectedGoalToRemove) return;

    const data = isAdding ? {
      type: 'add',
      player: selectedPlayer,
      assist: selectedAssist,
      isOwnGoalByOpponent: isOwnGoalByOpponent
    } : {
      type: 'remove',
      goalToRemove: selectedGoalToRemove
    };

    onConfirm(data);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPlayer(null);
    setSelectedAssist(null);
    setSelectedGoalToRemove(null);
    setIsOwnGoalByOpponent(false);
    onClose();
  };
  
  const handleSelectOwnGoal = () => {
    setSelectedPlayer(null);
    setIsOwnGoalByOpponent(true);
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    setIsOwnGoalByOpponent(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAdding ? 'Add Goal - Who Scored?' : 'Remove Goal - Select Goal'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isAdding ? (
            <>
              <div>
                <Label className="text-sm font-semibold mb-3 block">Select goal scorer:</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
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
                  {Array.isArray(players) && players.map(player => {
                    if (!player || !player.id) return null;
                    return (
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
                            <Badge variant="secondary" className="text-xs">{player.main_position}</Badge>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {selectedPlayer && (
                <div className="pt-4 border-t">
                  <Label className="text-sm font-semibold mb-2 block">Who assisted? (Optional)</Label>
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
              )}
            </>
          ) : (
            <div>
              <Label className="text-sm font-semibold mb-3 block">Select goal to remove:</Label>
              {!Array.isArray(existingGoals) || existingGoals.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No goals recorded yet</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {existingGoals.map((goal, index) => (
                    <Button
                      key={goal.timestamp || index}
                      variant={selectedGoalToRemove === goal ? "default" : "outline"}
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => setSelectedGoalToRemove(goal)}
                    >
                      <div className="text-left w-full">
                        <div className="font-semibold">
                          {goal.isOwnGoalByOpponent ? 'Opponent (Own Goal)' : `${goal.player.first_name} ${goal.player.last_name}`} - {goal.minute}'
                        </div>
                        {goal.assist && !goal.isOwnGoalByOpponent && (
                          <div className="text-sm text-slate-500">
                            Assisted by {goal.assist.first_name} {goal.assist.last_name}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={isAdding ? (!selectedPlayer && !isOwnGoalByOpponent) : !selectedGoalToRemove}
              className={isAdding ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isAdding ? 'Add Goal' : 'Remove Goal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}