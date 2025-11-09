
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { User } from '@/entities/User'; // Added User import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Users,
  Search,
  Star,
  Edit,
  Trash2,
  UserMinus,
  Trophy,
  Target,
  Shield,
  UserPlus, // Added UserPlus
  X // Added X for close button
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function TeamRoster({ team, players = [], onUpdate }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [myChildren, setMyChildren] = useState([]);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  useEffect(() => {
    const loadUserAndChildren = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        // Load coach's children
        const children = await Player.filter({ parent_user_id: user.id });
        
        // Filter out children already on this team
        const childrenNotOnTeam = (children || []).filter(child => {
          // Check if the child has any team memberships at all
          if (!child.team_memberships || child.team_memberships.length === 0) {
            return true; // Child is not on any team, so can be added
          }
          // Check if the child is already on THIS specific team and is active
          const isOnTeam = child.team_memberships?.some(m => 
            m.team_id === team.id && m.is_active
          );
          return !isOnTeam; // Return true if NOT on the team (or inactive), so they can be added
        });
        
        setMyChildren(childrenNotOnTeam);
      } catch (error) {
        console.error('Error loading user or children:', error);
        toast.error('Failed to load user or children data.');
      }
    };
    
    // Only load if team is available
    if (team?.id) {
      loadUserAndChildren();
    }
  }, [team.id]); // Dependency array includes team.id to re-run if team changes

  const filteredPlayers = players.filter(player =>
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditPlayer = (playerId) => {
    navigate(createPageUrl('EditPlayer') + `?playerId=${playerId}&teamId=${team.id}`);
  };

  const handleRemoveFromTeam = async (player) => {
    try {
      // Remove this team from player's team_memberships
      const updatedMemberships = player.team_memberships?.filter(m => m.team_id !== team.id) || [];
      
      await Player.update(player.id, {
        team_memberships: updatedMemberships
      });

      toast.success(`${player.first_name} ${player.last_name} removed from team`);
      if (onUpdate) onUpdate(); // Trigger a re-fetch of players in the parent component
    } catch (error) {
      console.error('Error removing player from team:', error);
      toast.error('Failed to remove player from team');
    }
  };

  const handleAddChildToTeam = async (child) => {
    try {
      let updatedMemberships = [...(child.team_memberships || [])];
      
      // Check if there's an existing membership for this team
      const existingMembershipIndex = updatedMemberships.findIndex(m => m.team_id === team.id);

      if (existingMembershipIndex !== -1) {
        // If membership exists, update it to be active
        updatedMemberships[existingMembershipIndex] = {
          ...updatedMemberships[existingMembershipIndex],
          is_active: true,
          role: updatedMemberships[existingMembershipIndex].role || 'primary' // Preserve existing role or set default
        };
      } else {
        // If no existing membership for this team, add a new one
        updatedMemberships.push({
          team_id: team.id,
          is_active: true,
          role: 'primary' // Default role for new memberships
        });
      }
      
      await Player.update(child.id, {
        team_memberships: updatedMemberships
      });
      
      setShowAddChildModal(false);
      if (onUpdate) onUpdate(); // Trigger a re-fetch of players in the parent component
      toast.success(`${child.first_name} ${child.last_name} added to ${team.name}!`);
    } catch (error) {
      console.error('Error adding child to team:', error);
      toast.error('Failed to add child to team. Please try again.');
    }
  };

  const handleViewPlayerProfile = (playerId) => {
    navigate(createPageUrl('PlayerProfile') + `?playerId=${playerId}`);
  };

  const getPlayerTeamInfo = (player) => {
    const membership = player.team_memberships?.find(m => m.team_id === team.id);
    return membership || {};
  };

  const getPlayerSeasonStats = (player) => {
    // For now, return career stats - will be enhanced with season-specific stats later
    return {
      goals: player.career_stats?.goals || 0,
      assists: player.career_stats?.assists || 0,
      games: player.career_stats?.games_played || 0
    };
  };

  if (players.length === 0 && myChildren.length === 0) { // Condition modified to also check for children
    return (
      <Card className="text-center py-16 card-shadow">
        <CardContent>
          <Users className="w-16 h-16 mx-auto text-slate-300 mb-6" />
          <h3 className="text-xl font-semibold text-slate-700 mb-3">No players yet</h3>
          <p className="text-base text-slate-500 mb-8 font-light leading-relaxed">
            Start building your squad by adding players to the team.
          </p>
          <Button 
            onClick={() => navigate(createPageUrl('EditPlayer') + `?teamId=${team.id}`)}
            size="lg" 
            className="btn-primary px-8 py-3 mr-2"
          >
            Add First Player
          </Button>
          {myChildren.length > 0 && ( // Conditionally render "Add My Child" even in empty state
            <Button
              onClick={() => setShowAddChildModal(true)}
              variant="outline"
              size="lg"
              className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100 px-8 py-3"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add My Child
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Player/Add Child Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Team Roster ({players.length} players)</h2>
        <div className="flex gap-2">
          {myChildren.length > 0 && (
            <Button
              onClick={() => setShowAddChildModal(true)}
              variant="outline"
              className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add My Child
            </Button>
          )}
          <Button
            onClick={() => navigate(createPageUrl('EditPlayer') + `?teamId=${team.id}`)}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddChildModal && myChildren.length > 0 && ( // Ensure there are children to show
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-blue-800 text-lg">Add Your Child to Team</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAddChildModal(false)}>
                <X className="w-4 h-4 text-blue-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {myChildren.map(child => (
                <div key={child.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {child.first_name} {child.last_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {child.main_position} {child.date_of_birth ? `• Age ${calculateAge(child.date_of_birth)}` : ''}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAddChildToTeam(child)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add to Team
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => {
          const teamInfo = getPlayerTeamInfo(player);
          const stats = getPlayerSeasonStats(player);
          
          return (
            <Card key={player.id} className="card-shadow hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                      {teamInfo.jersey_number || '?'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{player.first_name} {player.last_name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {player.main_position}
                        </Badge>
                        {teamInfo.role && (
                          <Badge variant="outline" className="text-xs">
                            {teamInfo.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditPlayer(player.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from Team</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {player.first_name} {player.last_name} from {team.name}? 
                            This will not delete the player's profile, just remove them from this team.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveFromTeam(player)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove from Team
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Player Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <Target className="w-4 h-4 mx-auto text-green-600 mb-1" />
                    <p className="font-bold text-slate-800">{stats.goals}</p>
                    <p className="text-xs text-slate-500">Goals</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <Trophy className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                    <p className="font-bold text-slate-800">{stats.assists}</p>
                    <p className="text-xs text-slate-500">Assists</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <Shield className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                    <p className="font-bold text-slate-800">{stats.games}</p>
                    <p className="text-xs text-slate-500">Games</p>
                  </div>
                </div>

                {/* Additional Info */}
                {player.preferred_foot && (
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Preferred foot:</span> {player.preferred_foot}
                  </div>
                )}

                {/* View Profile Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => handleViewPlayerProfile(player.id)}
                >
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && searchTerm && (
        <Card className="text-center py-12 card-shadow">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No players found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search terms.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 'N/A';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
