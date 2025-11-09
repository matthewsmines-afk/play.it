import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserX, ShieldAlert } from 'lucide-react';

export default function ConfirmAbsentModal({ player, onConfirm, onClose }) {
  if (!player) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Confirm Removal
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{player.first_name} {player.last_name}</strong> from the match day squad? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(player)}>
            <UserX className="w-4 h-4 mr-2" />
            Yes, Remove Player
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}