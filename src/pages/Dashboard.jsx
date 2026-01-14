import React, { useState, useEffect, useCallback } from "react";
import { Team } from "@/entities/Team";
import { Player } from "@/entities/Player";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { Club } from "@/entities/Club";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  Calendar,
  Play,
  Trophy,
  Plus,
  Clock,
  MapPin,
  TrendingUp,
  ChevronRight,
  Pencil,
  Trash2,
  Building2,
  MessageSquare,
  Network
} from "lucide-react";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";

import QuickStats from "../components/dashboard/QuickStats";
import UpcomingMatches from "../components/dashboard/UpcomingMatches";
import RecentActivity from "../components/dashboard/RecentActivity";
import ParentDashboard from "./ParentDashboard";
import TeamCard from "../components/teams/TeamCard";
import TeamDetails from "../components/teams/TeamDetails";
import SeasonRolloverNotification from "../components/dashboard/SeasonRolloverNotification";
import BottomNavigation from "@/components/shared/BottomNavigation";

const CoachDashboardTabs = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: "my_teams", label: "My Teams", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "Chat" },
    { id: "connect_hub", label: "Market", icon: Network, path: "ConnectHub" },
    { id: "my_club", label: "My Club", icon: Building2, path: "Clubs" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-1.5 mb-6">
      <div className="grid w-full grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.path) {
                  navigate(createPageUrl(tab.path));
                } else {
                  onTabChange(tab.id);
                }
              }}
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

const CoachDashboard = ({ user }) => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState("my_teams");
  const [userClubs, setUserClubs] = useState([]);
  const [seasonRolloverData, setSeasonRolloverData] = useState(null);
  const navigate = useNavigate();

  const clearTeamParams = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('teamId');
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', url);
  }, []);

  const checkSeasonRollover = useCallback(async () => {
    try {
      const { SeasonManager } = await import('../components/utils/seasonManager');
      if (SeasonManager.isSeasonRolloverDate()) {
        const rolloverResult = await SeasonManager.processSeasonRollover();
        if (rolloverResult.success) {
          const { SeasonRollover } = await import('@/entities/SeasonRollover');
          const rolloverRecords = await SeasonRollover.list('-created_date', 1);
          if (rolloverRecords.length > 0) {
            setSeasonRolloverData(rolloverRecords[0]);
          }
        }
      } else {
        const { SeasonRollover } = await import('@/entities/SeasonRollover');
        const recentRollovers = await SeasonRollover.list('-created_date', 1);
        if (recentRollovers.length > 0) {
          const rollover = recentRollovers[0];
          const hasUnconfirmedUpdates = rollover.age_group_updates?.some(update => !update.coach_confirmed);
          if (hasUnconfirmedUpdates) {
            setSeasonRolloverData(rollover);
          }
        }
      }
    } catch (error) {
      console.error('Error checking season rollover:', error);
    }
  }, []);

  const loadCoachData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allTeams = await Team.filter({ coaches: { '$in': [user.id] }, is_active: true });
      const safeTeams = Array.isArray(allTeams) ? allTeams : [];
      setTeams(safeTeams);

      const teamIds = safeTeams.map((t) => t.id).filter((id) => id);

      let playersData = [];
      let eventsData = [];
      let clubsData = [];

      if (teamIds.length > 0) {
        const clubIds = [...new Set(safeTeams.map(t => t.club_id).filter(Boolean))];

        try {
          const promises = [
            Player.filter({ team_memberships: { '$elemMatch': { team_id: { '$in': teamIds } } } }),
            Event.filter({ team_id: { '$in': teamIds } }, '-date_time')
          ];

          if (clubIds.length > 0) {
            promises.push(Club.filter({ id: { '$in': clubIds } }));
          }

          const results = await Promise.all(promises);
          playersData = Array.isArray(results[0]) ? results[0] : [];
          eventsData = Array.isArray(results[1]) ? results[1] : [];
          clubsData = results[2] ? (Array.isArray(results[2]) ? results[2] : []) : [];

        } catch (promiseError) {
          console.error('Error loading team data:', promiseError);
        }
      }

      setUserClubs(clubsData);
      setPlayers(playersData);
      setEvents(eventsData);

      await checkSeasonRollover();

      const urlParams = new URLSearchParams(window.location.search);
      const teamId = urlParams.get('teamId');

      if (teamId && teamId !== 'undefined' && teamId !== 'null' && teamId.trim() !== '') {
        const teamExists = safeTeams.find((t) => t.id === teamId);
        if (teamExists) {
          const teamDetails = await Team.get(teamId);
          setSelectedTeam(teamDetails);
        } else {
          clearTeamParams();
        }
      }

    } catch (error) {
      console.error('Error loading coach dashboard data:', error);
      setTeams([]);
      setPlayers([]);
      setEvents([]);
      setUserClubs([]);
    }
    setIsLoading(false);
  }, [user.id, clearTeamParams, checkSeasonRollover]);

  useEffect(() => {
    loadCoachData();
  }, [loadCoachData]);

  const loadTeamsAndPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const teamsData = await Team.filter({ coaches: { '$in': [user.id] }, is_active: true });
      const safeTeams = Array.isArray(teamsData) ? teamsData : [];
      setTeams(safeTeams);

      const teamIds = safeTeams.map((t) => t.id).filter((id) => id);
      if (teamIds.length > 0) {
        const playersData = await Player.filter({ team_memberships: { '$elemMatch': { team_id: { '$in': teamIds } } } });
        setPlayers(Array.isArray(playersData) ? playersData : []);
      } else {
        setPlayers([]);
      }
    } catch (error) {
      console.error('Error loading teams and players:', error);
      setTeams([]);
      setPlayers([]);
    }
    setIsLoading(false);
  }, [user.id]);

  const handleSelectTeam = async (team) => {
    if (!team || !team.id) return;
    setIsLoading(true);
    try {
      const fullTeamData = await Team.get(team.id);
      setSelectedTeam(fullTeamData);
      const url = new URL(window.location.href);
      url.searchParams.set('teamId', fullTeamData.id);
      url.searchParams.delete('edit');
      window.history.pushState({}, '', url);
    } catch (error) {
      console.error("Error selecting team:", error);
      clearTeamParams();
    }
    setIsLoading(false);
  };

  const handleEditTeam = async (teamId) => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const team = await Team.get(teamId);
      setSelectedTeam(team);
      const url = new URL(window.location.href);
      url.searchParams.set('teamId', teamId);
      url.searchParams.set('edit', 'true');
      window.history.pushState({}, '', url);
    } catch (error) {
      console.error("Error preparing to edit team:", error);
      clearTeamParams();
    }
    setIsLoading(false);
  };

  const handleBackToDashboard = () => {
    setSelectedTeam(null);
    clearTeamParams();
  };

  const getTeamPlayerCount = useCallback((teamId) => {
    return (players || []).filter((player) =>
      player.team_memberships?.some(m => m.team_id === teamId && m.is_active)
    ).length;
  }, [players]);

  const handleDismissSeasonRollover = () => {
    setSeasonRolloverData(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (selectedTeam) {
    return (
      <TeamDetails
        team={selectedTeam}
        players={(players || []).filter((p) => p.team_memberships?.some(m => m.team_id === selectedTeam.id))}
        onBack={handleBackToDashboard}
        onUpdate={loadTeamsAndPlayers}
      />
    );
  }

  const safeTeams = Array.isArray(teams) ? teams : [];
  const safePlayers = Array.isArray(players) ? players : [];
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Light Header Area with semi-transparent white */}
      <div className="p-4 sm:p-6 bg-white/95 backdrop-blur-sm border-b border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                Coach Dashboard
              </h1>
              <p className="text-sm text-slate-600 font-light mt-2">
                Your central command center for teams and clubs.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={() => navigate(createPageUrl("CreateTeam"))}
                className="px-6 py-3 text-sm shadow-lg w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Team
              </Button>
            </div>
          </div>
          <CoachDashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Content Area with transparent background to show pitch */}
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto relative z-10">
        {seasonRolloverData && (
          <SeasonRolloverNotification
            rolloverData={seasonRolloverData}
            onDismiss={handleDismissSeasonRollover}
            onRefreshTeams={loadCoachData}
          />
        )}

        {activeTab === "my_teams" && (
          <div className="space-y-8">
            {safeTeams.length === 0 ? (
              <Card className="text-center py-16 card-shadow bg-white/95 backdrop-blur-sm">
                <CardContent className="px-6">
                  <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">No teams yet</h3>
                  <p className="text-base text-gray-500 mb-8 font-light leading-relaxed">Create your first team to get started with managing players, scheduling matches, and tracking performance.</p>
                  <Button
                    onClick={() => navigate(createPageUrl('CreateTeam'))}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 px-8 py-3"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create First Team
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <AnimatePresence>
                  {safeTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      playerCount={getTeamPlayerCount(team.id)}
                      onClick={() => handleSelectTeam(team)}
                      onEdit={() => handleEditTeam(team.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
              <QuickStats
                title="Total Teams"
                value={safeTeams.length}
                icon={Trophy}
                color="blue" />

              <QuickStats
                title="Total Players"
                value={safePlayers.length}
                icon={Users}
                color="green" />

              <QuickStats
                title="Matches This Season"
                value={safeEvents.filter((e) => e.event_type === 'match' && new Date(e.date_time) >= new Date()).length}
                icon={Calendar}
                color="purple" />

              <QuickStats
                title="Win Rate"
                value={`${safeEvents.filter((m) => m.match_status === 'completed' && m.our_score > m.opponent_score).length}/${safeEvents.filter((m) => m.match_status === 'completed').length}`}
                icon={TrendingUp}
                color="orange" />

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <UpcomingMatches
                  matches={safeEvents.filter((e) => e.event_type === 'match' && new Date(e.date_time) >= new Date()).sort((a, b) => new Date(a.date_time) - new Date(b.date_time))}
                  isLoading={isLoading}
                  onGoLiveClick={(match) => navigate(createPageUrl(`LiveMatch?eventId=${match.id}`))} />

              </div>
              <div>
                <RecentActivity
                  teams={safeTeams}
                  matches={safeEvents.filter((m) => m.match_status === 'completed').slice(0, 5)}
                  isLoading={isLoading} />

              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        
        if (!currentUser.user_type) {
          navigate(createPageUrl('Onboarding'));
          return;
        }

        let displayRole = currentUser.user_type;
        if (currentUser.active_role) {
          displayRole = currentUser.active_role;
        }
        
        setUser({ ...currentUser, user_type: displayRole });

      } catch (error) {
        console.error("Error checking user role:", error);
      }
      setIsLoading(false);
    };

    checkUserRole();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        <p className="text-slate-900 ml-2">Loading...</p>
      </div>
    );
  }

  if (user?.user_type === 'parent') {
    return <ParentDashboard user={user} />;
  }

  if (user?.user_type === 'coach') {
    return <CoachDashboard user={user} />;
  }

  return null;
}

export default Dashboard;