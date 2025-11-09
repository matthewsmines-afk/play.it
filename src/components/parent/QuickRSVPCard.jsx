import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RSVP } from '@/entities/RSVP';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  Users,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function QuickRSVPCard({ event, player, team, existingRSVP, onRSVPUpdate }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(existingRSVP?.status || 'pending');

  const handleRSVP = async (status) => {
    setIsSubmitting(true);
    try {
      if (existingRSVP) {
        await RSVP.update(existingRSVP.id, { status });
      } else {
        await RSVP.create({
          event_id: event.id,
          player_id: player.id,
          status
        });
      }
      
      setCurrentStatus(status);
      
      if (status === 'attending') {
        toast.success(`${player.first_name} confirmed for ${event.title}`);
      } else {
        toast.info(`${player.first_name} marked as not attending`);
      }
      
      if (onRSVPUpdate) onRSVPUpdate();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP. Please try again.');
    }
    setIsSubmitting(false);
  };

  const getEventTypeColor = () => {
    switch (event.event_type) {
      case 'match': return 'bg-red-100 text-red-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'tournament': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const isUpcoming = new Date(event.date_time) > new Date();
  const isPastEvent = !isUpcoming;
  const needsResponse = currentStatus === 'pending' && isUpcoming;

  return (
    <Card className={cn(
      "transition-all",
      needsResponse && "ring-2 ring-amber-400 bg-amber-50/50"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getEventTypeColor()}>
                  {event.event_type}
                </Badge>
                {event.event_type === 'match' && event.opponent && (
                  <span className="text-xs text-slate-600">vs {event.opponent}</span>
                )}
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">
                {event.title || `${event.event_type} - ${team.name}`}
              </h3>
            </div>
            
            {needsResponse && (
              <Badge variant="outline" className="text-amber-600 border-amber-400">
                <AlertCircle className="w-3 h-3 mr-1" />
                Response needed
              </Badge>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-3 h-3" />
              <span>{format(new Date(event.date_time), 'EEE, MMM d • h:mm a')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              <span>{team.name}</span>
            </div>
          </div>

          {/* RSVP Status & Actions */}
          {isPastEvent ? (
            <div className="text-xs text-slate-500 italic">Event has passed</div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleRSVP('attending')}
                disabled={isSubmitting}
                className={cn(
                  "flex-1",
                  currentStatus === 'attending' 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                )}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {currentStatus === 'attending' ? 'Attending' : 'Can Go'}
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleRSVP('not_attending')}
                disabled={isSubmitting}
                className={cn(
                  "flex-1",
                  currentStatus === 'not_attending'
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                )}
              >
                <XCircle className="w-4 h-4 mr-1" />
                {currentStatus === 'not_attending' ? 'Not Going' : "Can't Go"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}