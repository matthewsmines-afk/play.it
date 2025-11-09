
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { Team } from '@/entities/Team';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, User as UserIcon, Edit, Trophy, Target } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function MyChildren() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);

        // ADDED: Role guard - if user is viewing as coach, redirect to dashboard
        const activeRole = user.active_role || user.user_type;
        if (activeRole === 'coach') {
          navigate(createPageUrl('Dashboard'));
          return;
        }

        const allPlayers = await Player.filter({ parent_user_id: user.id });
        setChildren(allPlayers || []);

        if (allPlayers && allPlayers.length > 0) {
          const teamIds = [...new Set(
            allPlayers.flatMap(child => 
              (child.team_memberships || [])
                .filter(membership => membership.is_active)
                .map(membership => membership.team_id)
            )
          )].filter(Boolean);

          if (teamIds.length > 0) {
            const teamsData = await Team.filter({ id: { '$in': teamIds } });
            setTeams(teamsData || []);
          }
        }
      } catch (error) {
        console.error('Error loading children data:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, [navigate]);

  const getTeamForPlayer = (playerId) => {
    const player = children.find(p => p.id === playerId);
    if (!player || !player.team_memberships) return null;
    const activeMembership = player.team_memberships.find(m => m.is_active);
    if (!activeMembership) return null;
    return teams.find(t => t.id === activeMembership.team_id);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2D2C29' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2D2C29' }}>
      {/* Dark Header */}
      <div className="text-white pt-6 pb-4">
        <div className="mx-4">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#3A3936' }}>
            <h1 className="text-2xl font-semibold text-white mb-2">My Children</h1>
            <p className="text-gray-400 mb-4">Manage your children's profiles and track their progress</p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(createPageUrl('AddMyChild'))}
                className="bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white border-0 px-6 py-2 rounded-lg font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('MyRequests'))}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-6 py-2 rounded-lg font-medium"
              >
                View My Requests
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* White Content Area */}
      <div className="bg-white min-h-screen rounded-t-3xl relative -mt-3 pb-24">
        <div className="px-4 pt-8 pb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children.map((child) => {
                const team = getTeamForPlayer(child.id);
                const stats = child.career_stats || {};
                return (
                  <Card key={child.id} className="card-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{child.first_name} {child.last_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Age {calculateAge(child.date_of_birth)}</Badge>
                            {child.main_position && (
                              <Badge variant="secondary">{child.main_position}</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(createPageUrl(`EditPlayer?playerId=${child.id}`))}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {team && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Current Team</p>
                          <p className="text-blue-600 font-semibold">{team.name}</p>
                        </div>
                      )}
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center bg-slate-50 p-2 rounded-lg">
                          <Trophy className="w-4 h-4 mx-auto text-green-600 mb-1" />
                          <p className="text-lg font-bold text-slate-800">{stats.goals || 0}</p>
                          <p className="text-xs text-slate-500">Goals</p>
                        </div>
                        <div className="text-center bg-slate-50 p-2 rounded-lg">
                          <Target className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                          <p className="text-lg font-bold text-slate-800">{stats.assists || 0}</p>
                          <p className="text-xs text-slate-500">Assists</p>
                        </div>
                        <div className="text-center bg-slate-50 p-2 rounded-lg">
                          <UserIcon className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                          <p className="text-lg font-bold text-slate-800">{stats.games_played || 0}</p>
                          <p className="text-xs text-slate-500">Games</p>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(createPageUrl(`PlayerProfile?playerId=${child.id}`))}
                      >
                        View Full Profile
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
