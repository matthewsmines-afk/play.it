import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Goal } from 'lucide-react';

export default function GoalScorerModal({ players, isOurGoal, onSave, onClose }) {
  const [scorerId, setScorerId] = useState('');
  const [assistId, setAssistId] = useState('');
  const [isOwnGoal, setIsOwnGoal] = useState(false);

  const handleSave = () => {
    onSave({
      scorerId: isOwnGoal ? scorerId : scorerId || null,
      assistId: isOwnGoal ? null : assistId || null,
      isOwnGoal: isOwnGoal
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Goal className="w-6 h-6 text-green-500" />
            {isOurGoal ? 'Log Goal' : 'Opponent Goal'}
          </DialogTitle>
        </DialogHeader>

        {isOurGoal && (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="own-goal" 
                checked={isOwnGoal} 
                onCheckedChange={setIsOwnGoal}
              />
              <Label htmlFor="own-goal" className="font-medium">This was an Own Goal</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Who scored? *</Label>
              <Select value={scorerId} onValueChange={setScorerId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal scorer" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jersey_number} {player.first_name} {player.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Who assisted? (Optional)</Label>
              <Select value={assistId} onValueChange={setAssistId} disabled={isOwnGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assist provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No assist</SelectItem>
                  {players.filter(p => p.id !== scorerId).map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jersey_number} {player.first_name} {player.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={!scorerId && isOurGoal}>
            Save Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}