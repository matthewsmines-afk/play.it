
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  CheckCircle,
  XCircle,
  HelpCircle,
  Loader2,
  Trash2,
  Play,
  Plus,
  BarChart2,
  MoreVertical,
  Edit,
  Users,
} from "lucide-react";
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Event } from '@/entities/Event';
import { RSVP } from '@/entities/RSVP';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'EEEE, MMM d') => {
  if (!dateString) return 'Date not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

const safeFormatTime = (dateString) => {
  if (!dateString) return 'Time not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid time';
    return format(date, 'p'); // 'p' is for 'h:mm a'
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid time';
  }
};

const eventTypeConfig = {
  training: { label: "Training", icon: Play, color: "blue" },
  match: { label: "Match", icon: BarChart2, color: "green" },
  tournament: { label: "Tournament", icon: BarChart2, color: "purple" },
  meeting: { label: "Meeting", icon: Users, color: "orange" },
  other: { label: "Event", icon: Calendar, color: "gray" },
};

const EventCard = React.memo(({ event, teamPlayers, onEventUpdate }) => {
  const [rsvps, setRsvps] = useState([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const getPlayerName = useCallback((playerId) => {
    const player = teamPlayers.find(p => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : 'Unknown Player';
  }, [teamPlayers]);

  const handleFetchRsvps = useCallback(async () => {
    if (!event.rsvp_required) return; // Only fetch if RSVP is required
    if (rsvps.length > 0 && isCollapsibleOpen) return; // Don't refetch if already fetched and open

    setIsLoadingRsvps(true);
    try {
      const rsvpData = await RSVP.filter({ event_id: event.id });
      setRsvps(rsvpData);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    } finally {
      setIsLoadingRsvps(false);
    }
  }, [event.rsvp_required, event.id, rsvps.length, isCollapsibleOpen]);

  // Fetch RSVPs when collapsible opens
  useEffect(() => {
    if (isCollapsibleOpen) {
      handleFetchRsvps();
    }
  }, [isCollapsibleOpen, handleFetchRsvps]);

  // Calculate RSVP groups
  const attendingPlayers = rsvps.filter(rsvp => rsvp.status === 'attending');
  const notAttendingPlayers = rsvps.filter(rsvp => rsvp.status === 'not_attending');
  const rsvpPlayerIds = rsvps.map(rsvp => rsvp.player_id);
  const pendingPlayers = teamPlayers.filter(player => !rsvpPlayerIds.includes(player.id));

  const EventIcon = eventTypeConfig[event.event_type]?.icon || Calendar;
  
  // CRITICAL: Check completion status first, then date
  const isMatchCompleted = event.match_status === 'completed';
  const isUpcoming = !isMatchCompleted && new Date(event.date_time) >= new Date();
  
  return (
    <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-base text-slate-800">{safeFormatDate(event.date_time)}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <EventIcon className="w-3.5 h-3.5" />
                <span className="capitalize">{eventTypeConfig[event.event_type]?.label}</span>
                {(event.event_type === 'match' || event.event_type === 'tournament') && event.match_type && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{event.match_type}</span>
                  </>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEventUpdate?.('edit', event)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEventUpdate?.('delete', event)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="">Delete Event</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {event.opponent && (
            <p className="text-sm font-semibold text-slate-600 mt-2">vs {event.opponent}</p>
          )}

          <div className="space-y-1.5 text-xs text-slate-600 mt-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{safeFormatTime(event.date_time)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900/10">
            <div className="flex items-center justify-between">
              {event.rsvp_required && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="text-xs h-8 px-2">
                    View Attendance <ChevronDown className="w-4 h-4 ml-1 ui-open:rotate-180 transition-transform" />
                  </Button>
                </CollapsibleTrigger>
              )}
              
              {/* FIXED BUTTON LOGIC: Status-based, not date-based */}
              {isMatchCompleted && (event.event_type === 'match' || event.event_type === 'tournament') ? (
                // Match is completed - show report button
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onEventUpdate?.('report', event)}>
                  <BarChart2 className="w-3 h-3 mr-2" />
                  Match Report
                </Button>
              ) : (event.event_type === 'match' || event.event_type === 'training') && isUpcoming ? (
                // Match/training is upcoming and not completed - show go live button
                <Button size="sm" className="h-8 text-xs bg-secondary text-white" onClick={() => onEventUpdate?.('goLive', event)}>
                  <Play className="w-3 h-3 mr-2" />
                  Go Live
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>

        <CollapsibleContent className="px-4 pb-4">
          {isLoadingRsvps ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {attendingPlayers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    Attending ({attendingPlayers.length})
                  </h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
                    {attendingPlayers.map(rsvp => <span key={rsvp.id}>{getPlayerName(rsvp.player_id)}</span>)}
                  </div>
                </div>
              )}
              {notAttendingPlayers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    Not Attending ({notAttendingPlayers.length})
                  </h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
                      {notAttendingPlayers.map(rsvp => <span key={rsvp.id}>{getPlayerName(rsvp.player_id)}</span>)}
                  </div>
                </div>
              )}
              {pendingPlayers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    Pending ({pendingPlayers.length})
                  </h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
                    {pendingPlayers.map(player => <span key={player.id}>{player.first_name} {player.last_name}</span>)}
                  </div>
                </div>
              )}
              {(attendingPlayers.length === 0 && notAttendingPlayers.length === 0 && pendingPlayers.length === 0 && event.rsvp_required) && (
                <p className="text-center text-slate-500 py-2">No RSVP responses yet.</p>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});


export default function TeamEvents({ team, players: teamPlayers, events, onEventUpdate }) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    return events
      .filter(event => {
        // Show in upcoming if: not completed AND date is in future/present
        const isNotCompleted = event.match_status !== 'completed';
        const isFutureOrPresentDate = new Date(event.date_time) >= new Date();
        return isNotCompleted && isFutureOrPresentDate;
      })
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
  }, [events]);

  const pastEvents = useMemo(() => {
    if (!events) return [];
    return events
      .filter(event => {
        // Show in past if: completed OR date is in past
        const isCompleted = event.match_status === 'completed';
        const isPastDate = new Date(event.date_time) < new Date();
        return isCompleted || isPastDate;
      })
      .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
  }, [events]);


  const handleTeamEventUpdate = useCallback((action, event) => {
    switch (action) {
      case 'edit':
        navigate(createPageUrl('CreateEvent') + `?eventId=${event.id}`);
        break;
      case 'delete':
        setEventToDelete(event);
        setShowDeleteConfirm(true);
        break;
      case 'goLive':
        const url = event.event_type === 'training' ? 'LiveTraining' : 'LiveMatch';
        navigate(createPageUrl(url) + `?eventId=${event.id}`);
        break;
      case 'report':
         navigate(createPageUrl('MatchReport') + `?eventId=${event.id}`);
        break;
      default:
        console.warn('Unknown event action:', action);
    }
  }, [navigate]);

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await Event.delete(eventToDelete.id);
        onEventUpdate(); // This should trigger a refresh in the parent component
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setShowDeleteConfirm(false);
        setEventToDelete(null);
      }
    }
  };

  if (!events) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="py-4 text-xl font-bold">Events</h2>
        <Button onClick={() => navigate(createPageUrl('CreateEvent') + `?teamId=${team.id}`)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-3 text-slate-600">Upcoming</h3>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} teamPlayers={teamPlayers} onEventUpdate={handleTeamEventUpdate} />
            ))}
          </div>
        ) : (
          <Card className="flex items-center justify-center py-10 text-center bg-slate-50 border-dashed">
            <div>
              <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">No upcoming events scheduled.</p>
            </div>
          </Card>
        )}
      </div>

       <div>
        <h3 className="text-base font-semibold mb-3 text-slate-600">Past</h3>
        {pastEvents.length > 0 ? (
          <div className="space-y-4">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} teamPlayers={teamPlayers} onEventUpdate={handleTeamEventUpdate} />
            ))}
          </div>
        ) : (
          <Card className="flex items-center justify-center py-10 text-center bg-slate-50 border-dashed">
             <div>
              <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">No past events found.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event and all associated data, including RSVPs and match reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
