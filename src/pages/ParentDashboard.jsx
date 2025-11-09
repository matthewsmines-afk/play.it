
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { Team } from '@/entities/Team';
import { Event } from '@/entities/Event';
import { RSVP } from '@/entities/RSVP'; // NEW import for RSVP entity
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  User as UserIcon,
  Plus,
  ArrowRight,
  CheckCircle, // NEW import for CheckCircle icon
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/shared/BottomNavigation'; // FIXED: Correct import path

import QuickRSVPCard from '../components/parent/QuickRSVPCard'; // NEW import
import BulkRSVPModal from '../components/parent/BulkRSVPModal'; // NEW import

// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'EEE, d MMM') => {
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

const safeFormatTime = (dateString, formatString = 'p') => {
  if (!dateString) return 'Time not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

export default function ParentDashboard({ user }) {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [teams, setTeams] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]); // NEW: State to store RSVPs
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null); // NEW: State to manage the currently selected child for filtering

  const [showBulkRSVP, setShowBulkRSVP] = useState(false); // NEW: State to control Bulk RSVP Modal visibility
  const [bulkRSVPChild, setBulkRSVPChild] = useState(null); // NEW: State to store child for Bulk RSVP
  const [bulkRSVPTeam, setBulkRSVPTeam] = useState(null); // NEW: State to store team for Bulk RSVP

  const loadParentData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allPlayers = await Player.filter({ parent_user_id: user.id });
      setChildren(allPlayers || []);

      if (allPlayers && allPlayers.length > 0) {
        // If no child is selected or the previously selected child is no longer valid, default to the first child
        if (selectedChild === null || !allPlayers.some(p => p.id === selectedChild)) {
          setSelectedChild(allPlayers[0].id);
        }

        const teamIds = [...new Set(
          allPlayers.flatMap(child => 
            (child.team_memberships || [])
              .filter(membership => membership.is_active)
              .map(membership => membership.team_id)
          )
        )].filter(Boolean);

        const playerIds = allPlayers.map(p => p.id); // Collect all player IDs to fetch their RSVPs

        if (teamIds.length > 0) {
          const [teamsData, eventsData, rsvpsData] = await Promise.all([
            Team.filter({ id: { '$in': teamIds } }),
            Event.filter({ team_id: { '$in': teamIds } }, '-date_time'),
            RSVP.filter({ player_id: { '$in': playerIds } }), // Fetch RSVPs for all children
          ]);
          
          setTeams(teamsData || []);
          setRsvps(rsvpsData || []); // Set the fetched RSVPs

          const allEvents = eventsData || [];
          const now = new Date();
          
          const upcoming = allEvents
            .filter(event => new Date(event.date_time) >= now)
            .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
          
          setUpcomingEvents(upcoming);
        } else {
          // If no teams, clear related states
          setTeams([]);
          setUpcomingEvents([]);
          setRsvps([]);
        }
      } else {
        // If no children, clear all related states
        setSelectedChild(null);
        setTeams([]);
        setUpcomingEvents([]);
        setRsvps([]);
      }
    } catch (error) {
      console.error('Error loading parent dashboard data:', error);
    }
    setIsLoading(false);
  }, [user.id, selectedChild]); // selectedChild is updated within this effect, so it's not a dependency

  useEffect(() => {
    loadParentData();
  }, [loadParentData]);

  const getTeamForPlayer = (playerId) => {
    const player = children.find(p => p.id === playerId);
    if (!player || !player.team_memberships) return null;
    const activeMembership = player.team_memberships.find(m => m.is_active);
    if (!activeMembership) return null;
    return teams.find(t => t.id === activeMembership.team_id);
  };
  
  const getChildForEvent = (event) => {
    return children.find(child => 
      child.team_memberships?.some(membership => 
        membership.team_id === event.team_id && membership.is_active
      )
    );
  };
  
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const getUpcomingEventsNeedingRSVP = (childId) => {
    if (!childId) return [];
    const now = new Date();
    return upcomingEvents.filter(event => {
      const child = children.find(c => c.id === childId);
      if (!child) return false;
      
      const isChildTeam = child.team_memberships?.some(m => 
        m.team_id === event.team_id && m.is_active
      );
      
      if (!isChildTeam) return false;
      
      const rsvp = rsvps.find(r => r.event_id === event.id && r.player_id === childId);
      // An event needs RSVP if it's in the future and the player's RSVP status is 'pending' or non-existent
      return (!rsvp || rsvp.status === 'pending') && new Date(event.date_time) > now;
    });
  };

  const openBulkRSVP = (child) => {
    const childTeam = teams.find(t => 
      child.team_memberships?.some(m => m.team_id === t.id && m.is_active)
    );
    
    // The BulkRSVPModal needs to know the player and their associated team
    setBulkRSVPChild(child);
    setBulkRSVPTeam(childTeam);
    setShowBulkRSVP(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2D2C29' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2D2C29' }}>
      {/* Dark Header Section */}
      <div className="text-white pt-6 pb-4">
        <div className="mx-4 mb-6">
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#3A3936' }}>
            <h1 className="text-2xl font-semibold text-white mb-2">Parent Portal</h1>
            <p className="text-gray-400 mb-4">
              Keep track of your {children.length === 1 ? "child's" : "children's"} football journey
            </p>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => navigate(createPageUrl('AddMyChild'))}
                className="bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white border-0 px-6 py-2 rounded-lg font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add My Child
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* White Content Area */}
      <div className="bg-white min-h-screen rounded-t-3xl relative -mt-3 pb-24">
        <div className="px-4 pt-8 pb-6 space-y-6">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate(createPageUrl('MyChildren'))}
              variant="outline"
              className="h-24 flex-col gap-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200"
            >
              <UserIcon className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">My Children</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl('MatchHistory'))}
              variant="outline"
              className="h-24 flex-col gap-2 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200"
            >
              <Trophy className="w-6 h-6 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Match Reports</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl('Calendar'))}
              variant="outline"
              className="h-24 flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200"
            >
              <Calendar className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">Calendar</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl('FindTeam'))}
              variant="outline"
              className="h-24 flex-col gap-2 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200"
            >
              <Users className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-semibold text-orange-800">Find Team</span>
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-16">
              <UserIcon className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-3">No children yet</h3>
              <p className="text-gray-500 mb-8 font-light leading-relaxed px-6">
                Add your child to start managing their football journey, finding teams, and tracking performance.
              </p>
              <Button
                onClick={() => navigate(createPageUrl('AddMyChild'))}
                className="bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white px-8 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Child
              </Button>
            </div>
          ) : (
            <>
              {/* RSVP Section - NEW PRIORITY PLACEMENT */}
              {selectedChild && getUpcomingEventsNeedingRSVP(selectedChild).length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-amber-500" />
                        Response Needed
                      </h2>
                      <p className="text-sm text-slate-600">
                        {getUpcomingEventsNeedingRSVP(selectedChild).length} event(s) awaiting your response
                      </p>
                    </div>
                    {getUpcomingEventsNeedingRSVP(selectedChild).length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const child = children.find(c => c.id === selectedChild);
                          if (child) openBulkRSVP(child);
                        }}
                      >
                        Bulk RSVP ({getUpcomingEventsNeedingRSVP(selectedChild).length})
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {getUpcomingEventsNeedingRSVP(selectedChild).map((event) => {
                      const child = children.find(c => c.id === selectedChild);
                      const team = teams.find(t => 
                        child?.team_memberships?.some(m => m.team_id === t.id && m.is_active)
                      );
                      const existingRSVP = rsvps.find(r => r.event_id === event.id && r.player_id === selectedChild);

                      return (
                        <QuickRSVPCard
                          key={event.id}
                          event={event}
                          player={child}
                          team={team}
                          existingRSVP={existingRSVP}
                          onRSVPUpdate={loadParentData} // Call loadParentData to refresh data after RSVP
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming Events Section */}
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Upcoming Events</h2>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 2).map(event => {
                      const child = getChildForEvent(event);
                      return (
                        <Card key={event.id} className="card-shadow overflow-hidden">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center bg-slate-100 p-3 rounded-lg">
                              <span className="font-bold text-slate-700 text-sm">{safeFormatDate(event.date_time, 'MMM')}</span>
                              <span className="font-bold text-slate-800 text-2xl -mt-1">{safeFormatDate(event.date_time, 'd')}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-slate-800 leading-tight">{event.title}</p>
                                {child && (
                                  <Badge variant="secondary" className="flex items-center gap-1.5">
                                    <UserIcon className="w-3 h-3" />
                                    {child.first_name}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 mt-1.5 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  <span>{safeFormatTime(event.date_time)}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed bg-slate-50">
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-600 font-medium">No upcoming events</p>
                      <p className="text-sm text-slate-500">Your children's schedule is clear!</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* My Children Section */}
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">My Children</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                  {children.map((child, index) => {
                    const team = getTeamForPlayer(child.id);
                    return (
                      <motion.div
                        key={child.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex-shrink-0 w-[70%] sm:w-[45%]"
                      >
                        <Card 
                          className="card-shadow h-full flex flex-col"
                          onClick={() => navigate(createPageUrl(`PlayerProfile?playerId=${child.id}`))}
                        >
                          <CardContent className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="font-bold text-slate-800 text-lg">{child.first_name} {child.last_name}</p>
                              {team && <p className="text-sm text-blue-600 font-semibold mt-1">{team.name}</p>}
                            </div>
                            <Button variant="link" className="p-0 h-auto mt-4 text-sm self-start">
                              View Profile <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bulk RSVP Modal */}
      {showBulkRSVP && bulkRSVPChild && bulkRSVPTeam && (
        <BulkRSVPModal
          isOpen={showBulkRSVP}
          onClose={() => {
            setShowBulkRSVP(false);
            setBulkRSVPChild(null);
            setBulkRSVPTeam(null);
          }}
          // Pass only the events relevant to the bulkRSVPChild's active team memberships
          events={upcomingEvents.filter(e => 
            bulkRSVPChild.team_memberships?.some(m => m.team_id === e.team_id && m.is_active)
          )}
          player={bulkRSVPChild}
          team={bulkRSVPTeam}
          existingRSVPs={rsvps.filter(r => r.player_id === bulkRSVPChild.id)}
          onComplete={loadParentData} // Call loadParentData to refresh data after bulk RSVP
        />
      )}

      <BottomNavigation />
    </div>
  );
}
