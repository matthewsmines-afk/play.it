import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RSVP } from '@/entities/RSVP';
import { CheckCircle, XCircle, Calendar, MapPin, Clock, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BulkRSVPModal({ isOpen, onClose, events, player, team, existingRSVPs, onComplete }) {
  const [responses, setResponses] = useState(() => {
    // Initialize with existing RSVPs or default to 'pending'
    const initial = {};
    events.forEach(event => {
      const existingRSVP = existingRSVPs.find(r => r.event_id === event.id);
      initial[event.id] = existingRSVP?.status || 'pending';
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleResponseChange = (eventId, status) => {
    setResponses(prev => ({
      ...prev,
      [eventId]: status
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const promises = events.map(async (event) => {
        const newStatus = responses[event.id];
        const existingRSVP = existingRSVPs.find(r => r.event_id === event.id);

        if (existingRSVP) {
          // Update existing RSVP if status changed
          if (existingRSVP.status !== newStatus) {
            await RSVP.update(existingRSVP.id, { status: newStatus });
          }
        } else {
          // Create new RSVP
          await RSVP.create({
            event_id: event.id,
            player_id: player.id,
            status: newStatus
          });
        }
      });

      await Promise.all(promises);
      
      const attendingCount = Object.values(responses).filter(r => r === 'attending').length;
      const notAttendingCount = Object.values(responses).filter(r => r === 'not_attending').length;
      
      toast.success(
        `Updated ${events.length} events: ${attendingCount} attending, ${notAttendingCount} not attending`
      );
      
      if (onComplete) onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving bulk RSVPs:', error);
      toast.error('Failed to save RSVPs. Please try again.');
    }
    setIsSaving(false);
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'match': return 'bg-red-100 text-red-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'tournament': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const pendingCount = Object.values(responses).filter(r => r === 'pending').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bulk RSVP for {player.first_name}</DialogTitle>
          <DialogDescription>
            Respond to {events.length} upcoming events for {team.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {events.map((event) => {
              const currentResponse = responses[event.id];
              
              return (
                <div key={event.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {event.event_type}
                        </Badge>
                        {event.event_type === 'match' && event.opponent && (
                          <span className="text-xs text-slate-600">vs {event.opponent}</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-800">
                        {event.title || `${event.event_type} - ${team.name}`}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(event.date_time), 'EEE, MMM d')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(event.date_time), 'h:mm a')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleResponseChange(event.id, 'attending')}
                      className={cn(
                        "flex-1",
                        currentResponse === 'attending'
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      )}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Can Go
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleResponseChange(event.id, 'not_attending')}
                      className={cn(
                        "flex-1",
                        currentResponse === 'not_attending'
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      )}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Can't Go
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-slate-600">
            {pendingCount > 0 ? (
              <span className="text-amber-600 font-medium">
                {pendingCount} event{pendingCount !== 1 ? 's' : ''} pending
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                All events responded to ✓
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveAll} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save All Responses'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}