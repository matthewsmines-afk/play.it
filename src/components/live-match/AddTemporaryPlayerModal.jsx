import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, User } from 'lucide-react';
import { TemporaryPlayer } from '@/entities/TemporaryPlayer';

const POSITIONS = [
  { value: "GK", label: "Goalkeeper (GK)" },
  { value: "CB", label: "Center Back (CB)" },
  { value: "LB", label: "Left Back (LB)" },
  { value: "RB", label: "Right Back (RB)" },
  { value: "CDM", label: "Defensive Midfielder (CDM)" },
  { value: "CM", label: "Central Midfielder (CM)" },
  { value: "CAM", label: "Attacking Midfielder (CAM)" },
  { value: "LM", label: "Left Midfielder (LM)" },
  { value: "RM", label: "Right Midfielder (RM)" },
  { value: "LW", label: "Left Winger (LW)" },
  { value: "RW", label: "Right Winger (RW)" },
  { value: "ST", label: "Striker (ST)" },
  { value: "CF", label: "Center Forward (CF)" }
];

const SOURCES = [
  { value: "opposition_loan", label: "Borrowed from Opposition" },
  { value: "guest_player", label: "Guest Player" },
  { value: "last_minute_arrival", label: "Last Minute Arrival" },
  { value: "other", label: "Other" }
];

export default function AddTemporaryPlayerModal({ isOpen, onClose, onAdd, eventId, usedJerseyNumbers }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    jersey_number: '',
    position: '',
    source: 'guest_player',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const tempPlayer = await TemporaryPlayer.create({
        ...formData,
        event_id: eventId,
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number, 10) : null
      });
      
      onAdd(tempPlayer);
      setFormData({
        first_name: '',
        last_name: '',
        jersey_number: '',
        position: '',
        source: 'guest_player',
        notes: ''
      });
      onClose();
    } catch (error) {
      console.error('Error adding temporary player:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isJerseyNumberTaken = usedJerseyNumbers.includes(parseInt(formData.jersey_number, 10));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Temporary Player
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Smith"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="jersey_number" className="text-sm font-medium">Jersey Number</Label>
              <Input
                id="jersey_number"
                type="number"
                value={formData.jersey_number}
                onChange={(e) => handleInputChange('jersey_number', e.target.value)}
                placeholder="e.g. 99"
                min="1"
                max="99"
                className={isJerseyNumberTaken ? "border-red-500" : ""}
              />
              {isJerseyNumberTaken && (
                <p className="text-xs text-red-600">This number is already in use</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium">Position</Label>
              <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map(pos => (
                    <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm font-medium">Player Source</Label>
            <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map(source => (
                  <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information..."
              className="h-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.first_name || !formData.last_name || isJerseyNumberTaken}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Adding...' : 'Add Player'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}