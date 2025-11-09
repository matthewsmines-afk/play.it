
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/entities/Event';
import { Team } from '@/entities/Team'; // Assuming a Team entity exists for fetching team data
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Construction, ListTodo, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function LiveTraining() {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null); // New state for team information
  const [isLoading, setIsLoading] = useState(true);

  // Callback function for consistent back navigation
  const handleBack = useCallback(() => {
    if (team?.id) {
      navigate(createPageUrl('Dashboard') + `?teamId=${team.id}`);
    } else {
      navigate(createPageUrl('Dashboard'));
    }
  }, [navigate, team]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (!eventId) {
      // If no eventId, navigate to the Teams page (original behavior)
      // This is an initial invalid state before trying to load anything specific.
      navigate(createPageUrl('Teams'));
      return;
    }

    const loadEventAndTeam = async () => {
      try {
        const eventData = await Event.get(eventId);
        if (eventData) {
          setEvent(eventData);
          // If event data is found, try to load the associated team
          if (eventData.team_id) {
            const teamData = await Team.get(eventData.team_id);
            setTeam(teamData);
          } else {
            console.warn('Event has no associated team_id, proceeding without team data.');
            setTeam(null); // Ensure team is null if no team_id
          }
        } else {
          // If event not found, set both to null to trigger the "not found" state
          setEvent(null);
          setTeam(null);
        }
      } catch (error) {
        console.error('Error fetching event or team:', error);
        // On error, set both to null to trigger the "not found" state
        setEvent(null);
        setTeam(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventAndTeam();
  }, [navigate]); // navigate is a dependency for useEffect

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading training session...</p>
      </div>
    );
  }

  // If event or team data is not found after loading
  if (!event || !team) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Training session not found.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {/* Changed the back button to use the new handleBack function for consistent navigation */}
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Live Training</h1>
            <p className="text-sm text-slate-600">{event.title}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Session Planner */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListTodo className="w-5 h-5" />
                  Session Planner
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                  <Construction className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700">Feature Coming Soon</h3>
                  <p className="text-sm text-slate-500">
                    Plan your training sessions by adding exercises and drills here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Timer */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5" />
                  Session Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold font-mono text-slate-800 py-8">
                  00:00
                </div>
                <div className="flex justify-center gap-2">
                  <Button variant="outline">Start</Button>
                  <Button variant="outline">Reset</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
