
import React, { useState, useEffect } from 'react';
import { Event } from '@/entities/Event';
import { Team } from '@/entities/Team';
import { User } from '@/entities/User';
import { Player } from '@/entities/Player';
import { RSVP } from '@/entities/RSVP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Trophy, ArrowLeft, CheckCircle, XCircle, HelpCircle, Dumbbell, PartyPopper } from 'lucide-react';
import { format, isSameDay, startOfToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

import QuickRSVPCard from '../components/parent/QuickRSVPCard';

// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'EEEE, MMMM d') => {
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
    return format(date, 'p');
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid time';
  }
};

const eventTypeIcons = {
  training: Dumbbell, // Changed from Users to Dumbbell
  match: Trophy,
  tournament: Trophy,
  meeting: Users,
  other: Users
};

export default function Calendar() {
    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [rsvps, setRSVPs] = useState([]);
    const [children, setChildren] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const user = await User.me();
                setCurrentUser(user);

                let allEvents = [];
                let allTeams = [];
                let loadedChildren = [];
                let allRSVPs = [];

                if (user.user_type === 'coach' || user.active_role === 'coach') {
                    const coachTeams = await Team.filter({ coaches: { '$in': [user.id] }, is_active: true });
                    allTeams = coachTeams || [];
                    
                    if (allTeams.length > 0) {
                        const teamIds = allTeams.map(t => t.id);
                        const coachEvents = await Event.filter({ team_id: { '$in': teamIds } }, '-date_time');
                        allEvents = coachEvents || [];
                    }
                }

                if (user.user_type === 'parent' || user.active_role === 'parent') {
                    loadedChildren = await Player.filter({ parent_user_id: user.id });
                    
                    if (loadedChildren && loadedChildren.length > 0) {
                        const teamIds = [...new Set(
                            loadedChildren.flatMap(child => 
                                (child.team_memberships || [])
                                    .filter(m => m.is_active)
                                    .map(m => m.team_id)
                            )
                        )].filter(Boolean);

                        if (teamIds.length > 0) {
                            const [parentTeams, parentEvents, rsvpData] = await Promise.all([
                                Team.filter({ id: { '$in': teamIds } }),
                                Event.filter({ team_id: { '$in': teamIds } }, '-date_time'),
                                RSVP.filter({ player_id: { '$in': loadedChildren.map(c => c.id) } })
                            ]);
                            
                            allTeams = [...allTeams, ...(parentTeams || [])];
                            allEvents = [...allEvents, ...(parentEvents || [])];
                            allRSVPs = rsvpData || [];
                        }
                    }
                }

                // Filter for upcoming events with valid dates and sort them
                const upcomingEvents = allEvents
                    .filter(e => {
                        if (!e.date_time) return false;
                        try {
                            const eventDate = new Date(e.date_time);
                            return !isNaN(eventDate.getTime()) && eventDate >= startOfToday();
                        } catch (error) {
                            return false;
                        }
                    })
                    .sort((a, b) => {
                        try {
                            return new Date(a.date_time) - new Date(b.date_time);
                        } catch (error) {
                            return 0;
                        }
                    });

                // Sort: Events needing RSVP first
                if (loadedChildren.length > 0) {
                    upcomingEvents.sort((a, b) => {
                        const childA = loadedChildren.find(c => 
                            c.team_memberships?.some(m => m.team_id === a.team_id && m.is_active)
                        );
                        const childB = loadedChildren.find(c => 
                            c.team_memberships?.some(m => m.team_id === b.team_id && m.is_active)
                        );

                        if (childA) {
                            const rsvpA = allRSVPs.find(r => r.event_id === a.id && r.player_id === childA.id);
                            const needsResponseA = !rsvpA || rsvpA.status === 'pending';
                            
                            if (childB) {
                                const rsvpB = allRSVPs.find(r => r.event_id === b.id && r.player_id === childB.id);
                                const needsResponseB = !rsvpB || rsvpB.status === 'pending';
                                
                                if (needsResponseA && !needsResponseB) return -1;
                                if (!needsResponseA && needsResponseB) return 1;
                            }
                        }
                        
                        return 0; // Keep original date order
                    });
                }

                setEvents(upcomingEvents);
                setTeams(allTeams);
                setChildren(loadedChildren);
                setRSVPs(allRSVPs);

            } catch (error) {
                console.error("Error loading calendar data:", error);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const getTeam = (teamId) => {
        return (teams || []).find(t => t.id === teamId);
    };

    const handleEventClick = (event) => {
        navigate(createPageUrl('Dashboard') + `?teamId=${event.team_id}`);
    };

    const getRSVPForEvent = (eventId, playerId) => {
        return rsvps.find(r => r.event_id === eventId && r.player_id === playerId);
    };

    const getRSVPStatusBadge = (event) => {
        if (!event.rsvp_required) return null;
        
        const child = children?.find(c => 
            c.team_memberships?.some(m => m.team_id === event.team_id && m.is_active)
        );
        
        if (!child) return null;
        
        const rsvp = getRSVPForEvent(event.id, child.id);
        
        if (!rsvp || rsvp.status === 'pending') {
            return (
                <Badge variant="outline" className="text-amber-600 border-amber-400">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Pending
                </Badge>
            );
        }
        
        if (rsvp.status === 'attending') {
            return (
                <Badge variant="outline" className="text-green-600 border-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Attending
                </Badge>
            );
        }
        
        if (rsvp.status === 'not_attending') {
            return (
                <Badge variant="outline" className="text-red-600 border-red-400">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Attending
                </Badge>
            );
        }
        
        return null;
    };

    return (
        <div className="min-h-screen bg-transparent">
            {/* Header with semi-transparent background */}
            <div className="p-4 bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(createPageUrl("Dashboard"))}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Calendar</h1>
                        <p className="text-xs text-slate-600">Upcoming events and matches</p>
                    </div>
                </div>
            </div>

            {/* Content with semi-transparent cards */}
            <div className="p-4 space-y-4">
                {isLoading ? (
                    <p>Loading calendar...</p>
                ) : events.length === 0 ? (
                    <Card className="bg-white/95 backdrop-blur-sm">
                        <CardContent className="text-center py-12">
                            <CalendarIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">No events found</h3>
                            <p className="text-slate-500">There are no events scheduled for any of your teams.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => {
                            const team = getTeam(event.team_id);
                            
                            // For parents, show Quick RSVP cards
                            if (currentUser && (currentUser.user_type === 'parent' || currentUser.active_role === 'parent')) {
                                const child = children?.find(c => 
                                    c.team_memberships?.some(m => m.team_id === event.team_id && m.is_active)
                                );
                                
                                if (child) {
                                    const existingRSVP = getRSVPForEvent(event.id, child.id);
                                    return (
                                        <QuickRSVPCard
                                            key={event.id}
                                            event={event}
                                            player={child}
                                            team={team}
                                            existingRSVP={existingRSVP}
                                            onRSVPUpdate={() => window.location.reload()}
                                            // QuickRSVPCard is a custom component, assuming it handles its own Card styling internally.
                                            // If it accepts a className prop for its root Card, it would be passed here.
                                            // For this specific change, we only apply to explicit Card components in *this* file.
                                        />
                                    );
                                }
                            }

                            // Default event card for coaches
                            const EventIcon = eventTypeIcons[event.event_type] || Users;
                            return (
                                <Card key={event.id} onClick={() => handleEventClick(event)} className="bg-white/95 backdrop-blur-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4 flex gap-4 items-start">
                                        <div className="p-2 bg-blue-50 rounded-lg mt-1">
                                            <EventIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-slate-800">{event.title}</p>
                                                    {team && <p className="text-xs font-semibold" style={{color: team.primary_color || '#1e293b'}}>{team.name}</p>}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline">{event.event_type}</Badge>
                                                    {getRSVPStatusBadge(event)}
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-600 mt-2 space-y-1">
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
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
