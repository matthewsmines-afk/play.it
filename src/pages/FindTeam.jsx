import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '@/entities/Team';
import { Club } from '@/entities/Club';
import { Player } from '@/entities/Player';
import { TeamJoinRequest } from '@/entities/TeamJoinRequest';
import { User } from '@/entities/User';
import { InvokeLLM } from '@/integrations/Core';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MapPin, Users, Trophy, Send } from 'lucide-react';
import { createPageUrl } from '@/utils';

const AGE_GROUPS = ["Under 4", "Under 5"].concat(Array.from({ length: 18 }, (_, i) => `Under ${i + 6}`)).concat(["23 Plus"]);

export default function FindTeam() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedClub, setSelectedClub] = useState('all');
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [teamsData, clubsData, userData] = await Promise.all([
          Team.filter({ is_active: true }),
          Club.list(),
          User.me()
        ]);

        setTeams(teamsData || []);
        setClubs(clubsData || []);
        setCurrentUser(userData);

        // Load player data if playerId in URL
        const urlParams = new URLSearchParams(window.location.search);
        const playerId = urlParams.get('playerId');
        if (playerId && playerId !== 'new') {
          const playerData = await Player.get(playerId);
          setCurrentPlayer(playerData);
        }
      } catch (error) {
        console.error('Error loading team data:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getClubName = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Independent Team';
  };

  const getTeamCoaches = (team) => {
    // For now, return placeholder. In real implementation, you'd fetch coach details
    return team.coaches?.length > 0 ? `${team.coaches.length} coach${team.coaches.length > 1 ? 'es' : ''}` : 'Coach TBD';
  };

  const handleAiSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsAiSearching(true);
    try {
      const response = await InvokeLLM({
        prompt: `Help me find suitable football teams based on this search: "${searchTerm}". 
        Consider factors like age group, location, skill level, and team type. 
        Return structured search criteria that would help filter teams.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_age_group: { type: "string" },
            location_keywords: { type: "array", items: { type: "string" } },
            team_characteristics: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Apply AI suggestions to filters
      if (response.suggested_age_group && AGE_GROUPS.includes(response.suggested_age_group)) {
        setSelectedAgeGroup(response.suggested_age_group);
      }

      // You could extend this to apply location and other filters
      console.log('AI Search Results:', response);
    } catch (error) {
      console.error('AI search failed:', error);
    }
    setIsAiSearching(false);
  };

  const filteredTeams = teams.filter(team => {
    const nameMatch = !searchTerm || team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const ageMatch = selectedAgeGroup === 'all' || team.age_group === selectedAgeGroup;
    const clubMatch = selectedClub === 'all' || team.club_id === selectedClub;
    const clubNameMatch = !searchTerm || getClubName(team.club_id).toLowerCase().includes(searchTerm.toLowerCase());

    return (nameMatch || clubNameMatch) && ageMatch && clubMatch;
  });

  const handleJoinRequest = async (team) => {
    if (!currentUser || !currentPlayer) {
      alert('Please ensure you have created a child profile first.');
      return;
    }

    try {
      await TeamJoinRequest.create({
        team_id: team.id,
        player_id: currentPlayer.id,
        parent_user_id: currentUser.id,
        parent_name: currentUser.full_name,
        player_first_name: currentPlayer.first_name,
        player_last_name: currentPlayer.last_name,
        message_from_parent: `Hi, I'd like my child ${currentPlayer.first_name} to join ${team.name}.`
      });

      alert(`Join request sent to ${team.name}! The coach will review your request and get back to you.`);
    } catch (error) {
      console.error('Error sending join request:', error);
      alert('Failed to send join request. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Dashboard'))} className="h-11 w-11">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Find a Team</h1>
          <p className="text-sm text-slate-600">
            {currentPlayer ? `Finding teams for ${currentPlayer.first_name}` : 'Browse local teams and request to join'}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="card-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search teams by name or club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                onClick={handleAiSearch} 
                disabled={isAiSearching || !searchTerm.trim()}
                variant="outline"
              >
                {isAiSearching ? 'AI Searching...' : 'AI Search'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by age group..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Age Groups</SelectItem>
                  {AGE_GROUPS.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by club..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clubs</SelectItem>
                  {clubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Found {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
        </p>

        {filteredTeams.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Teams Found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search criteria or check back later for new teams.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map(team => (
              <Card key={team.id} className="card-shadow hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <p className="text-sm text-slate-600">{getClubName(team.club_id)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary">{team.age_group}</Badge>
                      <Badge variant="outline">{team.sport}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{getTeamCoaches(team)}</span>
                    </div>

                    {team.home_ground_location?.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{team.home_ground_location.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Trophy className="w-4 h-4" />
                      <span>Default format: {team.default_match_format}</span>
                    </div>

                    <Button 
                      onClick={() => handleJoinRequest(team)}
                      className="w-full mt-4"
                      disabled={!currentPlayer}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Request to Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}