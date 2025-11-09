import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from 'lucide-react';

export default function SubstitutionModal({
  isOpen,
  onClose,
  onConfirm,
  playerIn,
  playerOut,
  pitchPlayers, // array of { player, positionId, positionLabel }
  benchPlayers  // array of players
}) {

  const handleSelect = (selectedPlayer) => {
    if (playerIn) {
      // We are bringing playerIn ON for selectedPlayer (who is on the pitch)
      onConfirm(selectedPlayer.id, playerIn.id);
    } else if (playerOut) {
      // We are taking playerOut OFF for selectedPlayer (who is on the bench)
      onConfirm(playerOut.id, selectedPlayer.id);
    }
  };

  // Add null checks for playerIn and playerOut
  const title = playerIn ? `Bring on ${playerIn.first_name || 'Player'}?` : 
                playerOut ? `Substitute ${playerOut.first_name || 'Player'}?` : 
                'Make Substitution';
  
  const description = playerIn ? "Select a player from the pitch to replace." : "Select a player from the bench to bring on.";
  const playersToList = playerIn ? pitchPlayers : benchPlayers;

  // Don't render if we don't have the required data
  if (!playerIn && !playerOut) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
          {playersToList && playersToList.length > 0 ? playersToList.map(p => {
            const player = p.player || p; 
            const positionLabel = p.positionLabel;

            // Add null check for player
            if (!player) return null;

            return (
              <Button key={player.id} variant="outline" className="w-full justify-start h-auto p-3 text-left" onClick={() => handleSelect(player)}>
                 <div className="flex items-center gap-3 w-full">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm bg-slate-200 text-slate-700">
                        {player.jersey_number || '?'}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800">{player.first_name || ''} {player.last_name || 'Player'}</p>
                        <Badge variant="secondary" className="text-xs h-5">{positionLabel || player.main_position || 'N/A'}</Badge>
                    </div>
                 </div>
              </Button>
            );
          }) : (
            <p className="text-sm text-slate-500 text-center py-8">No players available for substitution.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}