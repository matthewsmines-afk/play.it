import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { Team } from '@/entities/Team';
import { Event } from '@/entities/Event';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Filter } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import MatchReportCard from '../components/parent/MatchReportCard';
import MatchReportDetail from '../components/parent/MatchReportDetail';

export default function MatchHistory() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [teams, setTeams] = useState({});
  const [matches, setMatches] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatchStats, setSelectedMatchStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
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
            const [teamsData, matchesData] = await Promise.all([
              Team.filter({ id: { '$in': teamIds } }),
              Event.filter({ 
                team_id: { '$in': teamIds },
                event_type: 'match'
              }, '-date_time')
            ]);
            
            const teamsMap = {};
            (teamsData || []).forEach(team => {
              teamsMap[team.id] = team;
            });
            setTeams(teamsMap);

            // Filter to only completed matches
            const completedMatches = (matchesData || []).filter(
              match => match.match_status === 'completed'
            );
            setMatches(completedMatches);
          }
        }
      } catch (error) {
        console.error('Error loading match history:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getPlayerStatsForMatch = (match, playerId) => {
    if (!match.match_player_performance || !match.match_player_performance[playerId]) {
      return null;
    }

    const perfData = match.match_player_performance[playerId];
    return {
      goals: perfData.public_stats?.goals || 0,
      assists: perfData.public_stats?.assists || 0,
      tackles: perfData.public_stats?.tackles || 0,
      saves: perfData.public_stats?.saves || 0,
      minutes_played: perfData.public_stats?.minutes_played || 0,
      is_man_of_the_match: perfData.public_stats?.is_man_of_the_match || false,
      match_rating: perfData.coach_only?.match_rating || null,
      tactical_notes: perfData.coach_only?.tactical_notes || null
    };
  };

  const getChildForMatch = (match) => {
    return children.find(child => 
      child.team_memberships?.some(membership => 
        membership.team_id === match.team_id && membership.is_active
      )
    );
  };

  const filteredMatches = selectedChild === 'all' 
    ? matches 
    : matches.filter(match => {
        const child = getChildForMatch(match);
        return child && child.id === selectedChild;
      });

  const handleMatchClick = (match) => {
    const child = getChildForMatch(match);
    if (child) {
      const stats = getPlayerStatsForMatch(match, child.id);
      setSelectedMatch(match);
      setSelectedMatchStats(stats);
    }
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
            <h1 className="text-2xl font-semibold text-white mb-2">Match History</h1>
            <p className="text-gray-400">View past match reports and performance stats</p>
          </div>
        </div>
      </div>

      {/* White Content Area */}
      <div className="bg-white min-h-screen rounded-t-3xl relative -mt-3 pb-24">
        <div className="px-4 pt-8 pb-6">
          {/* Filter */}
          {children.length > 1 && (
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-slate-600" />
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filter by child" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Children</SelectItem>
                    {children.map(child => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.first_name} {child.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Match List */}
          {filteredMatches.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-3">No matches yet</h3>
              <p className="text-gray-500 font-light leading-relaxed px-6">
                Match reports will appear here after your child's matches are completed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map(match => {
                const child = getChildForMatch(match);
                if (!child) return null;

                const stats = getPlayerStatsForMatch(match, child.id);
                
                return (
                  <MatchReportCard
                    key={match.id}
                    match={match}
                    playerStats={stats}
                    childName={`${child.first_name} ${child.last_name}`}
                    onClick={() => handleMatchClick(match)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchReportDetail
          match={selectedMatch}
          playerStats={selectedMatchStats}
          childName={`${getChildForMatch(selectedMatch)?.first_name} ${getChildForMatch(selectedMatch)?.last_name}`}
          onClose={() => {
            setSelectedMatch(null);
            setSelectedMatchStats(null);
          }}
        />
      )}
    </div>
  );
}