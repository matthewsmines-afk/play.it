import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RefreshCw, LogIn, LogOut } from 'lucide-react';

export default function SubstitutionModal({ 
  isOpen, 
  onClose, 
  playerToReplace = null, 
  availablePlayers = [], 
  onConfirm,
  title = "Player Substitution",
  maxPlayers = 11,
  currentPlayersOnPitch = 0
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  const isBringingOn = title && title.includes && title.includes("Bring");
  const isReplacementRequired = isBringingOn && currentPlayersOnPitch >= maxPlayers;

  const handleConfirm = () => {
    // If replacement is required, a selection must be made.
    if (isReplacementRequired && !selectedPlayerId) {
      return; // Button will be disabled, but this is a safeguard.
    }

    if (isBringingOn && playerToReplace) {
      // playerToReplace is coming ON from bench.
      // selectedPlayerId is player from pitch coming OFF.
      onConfirm(selectedPlayerId || null, playerToReplace.id);
    } else if (playerToReplace) {
      // playerToReplace is coming OFF from pitch.
      // selectedPlayerId is player from bench coming ON.
      onConfirm(playerToReplace.id, selectedPlayerId || null);
    }
    
    // Reset and close
    setSelectedPlayerId('');
    onClose();
  };

  const handleCancel = () => {
    setSelectedPlayerId('');
    onClose();
  };

  // Safety checks for playerToReplace
  if (!playerToReplace) {
    return null;
  }

  const mainPlayerLabel = isBringingOn ? "Player Coming On" : "Player Coming Off";
  const selectLabel = isBringingOn ? "Select Player to Replace" : "Select Replacement Player";
  const placeholder = isBringingOn 
    ? (isReplacementRequired ? "Select player to come off *" : "Optional: Select player to replace")
    : "Choose player to bring on";
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-500" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <Label className="text-sm text-slate-600 flex items-center gap-1">
              {isBringingOn ? <LogIn className="w-4 h-4 text-green-500"/> : <LogOut className="w-4 h-4 text-red-500" />}
              {mainPlayerLabel}:
            </Label>
            <div className="flex items-center gap-3 mt-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isBringingOn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {playerToReplace.jersey_number || '?'}
              </div>
              <span className="font-medium">
                {playerToReplace.first_name} {playerToReplace.last_name}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{selectLabel}{isReplacementRequired && ' *'}:</Label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {/* Allow no selection if replacement is not required */}
                {!isReplacementRequired && (
                  <SelectItem value={null}>
                    {isBringingOn ? "Don't replace anyone" : "Don't bring anyone on"}
                  </SelectItem>
                )}
                {availablePlayers && availablePlayers.map && availablePlayers.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">#{player.jersey_number || '?'}</span>
                      <span>{player.first_name} {player.last_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isReplacementRequired && <p className="text-xs text-slate-500">Pitch is full, you must select a player to replace.</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isReplacementRequired && !selectedPlayerId}
            className="bg-green-600 hover:bg-green-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Make Substitution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}