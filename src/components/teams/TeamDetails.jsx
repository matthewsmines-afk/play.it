
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { Event } from '@/entities/Event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Settings,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  Plus,
  UserPlus,
  Trophy,
  Target
} from 'lucide-react';
import { createPageUrl } from '@/utils';

import TeamRoster from './TeamRoster';
import TeamEvents from './TeamEvents';
import StatsCenter from './StatsCenter';
import TeamChat from './TeamChat';
import EditTeamForm from './EditTeamForm';
import JoinRequestsList from './JoinRequestsList'; // Added import for JoinRequestsList

export default function TeamDetails({ team, players = [], onBack, onUpdate }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // Changed from 'roster' to 'events'
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [teamEvents, setTeamEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeamData = async () => {
      if (!team?.id) return;
      
      setIsLoading(true);
      try {
        // Load players who are members of this team
        const allPlayers = await Player.filter({ 
          team_memberships: { 
            '$elemMatch': { 
              team_id: team.id, 
              is_active: true 
            } 
          } 
        });
        setTeamPlayers(allPlayers || []);

        // Load team events
        const events = await Event.filter({ team_id: team.id }, '-date_time');
        setTeamEvents(events || []);

      } catch (error) {
        console.error('Error loading team data:', error);
      }
      setIsLoading(false);
    };

    loadTeamData();

    // Check URL parameters for editing mode
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit');
    setIsEditing(editMode === 'true');

  }, [team]);

  const handleEditComplete = async () => {
    setIsEditing(false);
    if (onUpdate) {
      await onUpdate();
    }
    // Clear edit parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', url);
  };

  const handleAddPlayer = () => {
    navigate(createPageUrl('EditPlayer') + `?teamId=${team.id}`);
  };

  if (isEditing) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">Edit Team</h1>
        </div>
        <EditTeamForm
          team={team}
          onComplete={handleEditComplete}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading team details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{team.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary">{team.age_group}</Badge>
              <Badge variant="outline">{team.sport}</Badge>
              <Badge variant="outline">{team.default_match_format}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditing(true)} variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Edit Team
        </Button>
      </div>

      {/* Join Requests - NEW */}
      <JoinRequestsList teamId={team.id} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-slate-800">{teamPlayers.length}</p>
            <p className="text-sm text-slate-500">Players</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-slate-800">{teamEvents.length}</p>
            <p className="text-sm text-slate-500">Events</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-slate-800">
              {(teamEvents || []).filter(e => e.event_type === 'match').length}
            </p>
            <p className="text-sm text-slate-500">Matches</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-slate-800">
              {(teamEvents || []).filter(e => e.match_status === 'completed' && e.our_score > e.opponent_score).length}
            </p>
            <p className="text-sm text-slate-500">Wins</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roster" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Squad</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <TeamEvents 
            team={team} 
            players={teamPlayers}
            events={teamEvents}
            onUpdate={() => window.location.reload()}
          />
        </TabsContent>

        <TabsContent value="roster" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Team Roster</h2>
            <Button onClick={handleAddPlayer} className="btn-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </div>
          <TeamRoster 
            team={team} 
            players={teamPlayers}
            onUpdate={() => window.location.reload()}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsCenter 
            team={team} 
            players={teamPlayers}
            events={teamEvents.filter(e => e.event_type === 'match')}
          />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <TeamChat team={team} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
