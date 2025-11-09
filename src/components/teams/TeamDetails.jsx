import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { Event } from '@/entities/Event';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Settings,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
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
import JoinRequestsList from './JoinRequestsList';

const TeamDetailsTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "events", label: "Events", icon: Calendar },
    { id: "roster", label: "Squad", icon: Users },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-slate-200/50 rounded-lg p-1.5">
      <div className="grid w-full grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center gap-1 p-3 rounded-md
                transition-all duration-200
                ${isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              <span className={`text-xs whitespace-nowrap ${isActive ? 'text-white font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const QuickStat = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <Card className="bg-white/60 backdrop-blur-xl border-slate-200/50">
      <CardContent className="p-4 text-center">
        <Icon className={`w-6 h-6 mx-auto mb-2 ${colorClasses[color]}`} />
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600">{title}</p>
      </CardContent>
    </Card>
  );
};

export default function TeamDetails({ team, players = [], onBack, onUpdate }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [teamEvents, setTeamEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeamData = async () => {
      if (!team?.id) return;
      
      setIsLoading(true);
      try {
        const allPlayers = await Player.filter({ 
          team_memberships: { 
            '$elemMatch': { 
              team_id: team.id, 
              is_active: true 
            } 
          } 
        });
        setTeamPlayers(allPlayers || []);

        const events = await Event.filter({ team_id: team.id }, '-date_time');
        setTeamEvents(events || []);

      } catch (error) {
        console.error('Error loading team data:', error);
      }
      setIsLoading(false);
    };

    loadTeamData();

    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit');
    setIsEditing(editMode === 'true');

  }, [team]);

  const handleEditComplete = async () => {
    setIsEditing(false);
    if (onUpdate) {
      await onUpdate();
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', url);
  };

  const handleAddPlayer = () => {
    navigate(createPageUrl('EditPlayer') + `?teamId=${team.id}`);
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="p-4 sm:p-6 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">Edit Team</h1>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <EditTeamForm
              team={team}
              onComplete={handleEditComplete}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const matchesCount = (teamEvents || []).filter(e => e.event_type === 'match').length;
  const winsCount = (teamEvents || []).filter(e => e.match_status === 'completed' && e.our_score > e.opponent_score).length;

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white/95 backdrop-blur-sm border-b border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">{team.name}</h1>
                <p className="text-sm text-slate-600 font-light mt-2">
                  Team management and performance tracking
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                onClick={handleAddPlayer}
                className="px-6 py-3 text-sm shadow-lg w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
              <Button 
                onClick={() => setIsEditing(true)} 
                className="px-6 py-3 text-sm shadow-lg w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Team
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <Badge variant="secondary" className="text-xs">{team.age_group}</Badge>
            <Badge variant="outline" className="text-xs">{team.sport}</Badge>
            <Badge variant="outline" className="text-xs">{team.default_match_format}</Badge>
          </div>

          {/* Tabs */}
          <TeamDetailsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto relative z-10">
        {/* Join Requests - only show in roster tab */}
        {activeTab === 'roster' && (
          <JoinRequestsList teamId={team.id} />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <QuickStat
            title="Players"
            value={teamPlayers.length}
            icon={Users}
            color="blue"
          />
          <QuickStat
            title="Events"
            value={teamEvents.length}
            icon={Calendar}
            color="green"
          />
          <QuickStat
            title="Matches"
            value={matchesCount}
            icon={Target}
            color="purple"
          />
          <QuickStat
            title="Wins"
            value={winsCount}
            icon={Trophy}
            color="orange"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'events' && (
          <TeamEvents 
            team={team} 
            players={teamPlayers}
            events={teamEvents}
            onUpdate={() => window.location.reload()}
          />
        )}

        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Team Roster</h2>
              <Button 
                onClick={handleAddPlayer} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </div>
            <TeamRoster 
              team={team} 
              players={teamPlayers}
              onUpdate={() => window.location.reload()}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <StatsCenter 
            team={team} 
            players={teamPlayers}
            events={teamEvents.filter(e => e.event_type === 'match')}
          />
        )}

        {activeTab === 'chat' && (
          <TeamChat team={team} />
        )}
      </div>
    </div>
  );
}