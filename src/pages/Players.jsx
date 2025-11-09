
import React, { useState, useEffect } from 'react';
import { Player } from '@/entities/Player';
import { Team } from '@/entities/Team';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Shield, TrendingUp, Search, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Players() {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [playersData, teamsData] = await Promise.all([
                    Player.list('-created_date'),
                    Team.list()
                ]);
                setPlayers(playersData || []);
                setTeams(teamsData || []);
            } catch (error) {
                console.error("Error loading players and teams:", error);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const getTeamNames = (player) => {
        if (!player.team_memberships || player.team_memberships.length === 0) {
            return ['No team'];
        }
        
        const activeTeams = player.team_memberships
            .filter(m => m.is_active)
            .map(membership => {
                const team = (teams || []).find(t => t.id === membership.team_id);
                return team ? team.name : 'Unknown Team';
            });
        
        return activeTeams.length > 0 ? activeTeams : ['No active team'];
    };

    const filteredPlayers = (players || []).filter(player => {
        const searchMatch = searchTerm === '' || 
            `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        
        const teamMatch = selectedTeam === 'all' || 
            (player.team_memberships && player.team_memberships.some(m => 
                m.team_id === selectedTeam && m.is_active
            ));
        
        return searchMatch && teamMatch;
    });

    const handlePlayerClick = (playerId) => {
        navigate(createPageUrl('PlayerProfile') + `?playerId=${playerId}`);
    };

    const getCareerStats = (player) => {
        return player.career_stats || {
            games_played: 0,
            goals: 0,
            assists: 0,
            minutes_played: 0
        };
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* FIXED: Clean white header */}
            <div className="p-4 md:p-6 bg-white border-b border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigate(createPageUrl('Dashboard'))}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-900">Players</h1>
                        <p className="text-sm text-slate-600">Manage all players across your teams</p>
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="p-4 md:p-6 space-y-6">
                <Card className="bg-white">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    placeholder="Search by player name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-white text-slate-900"
                                />
                            </div>
                            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                <SelectTrigger className="w-full md:w-[200px] bg-white text-slate-900">
                                    <SelectValue placeholder="Filter by team..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Teams</SelectItem>
                                    {(teams || []).map(team => (
                                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-slate-900">Loading players...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredPlayers.map(player => {
                                    const teamNames = getTeamNames(player);
                                    const stats = getCareerStats(player);
                                    const primaryMembership = player.team_memberships?.find(m => m.is_active && m.role === 'primary');
                                    
                                    return (
                                        <div 
                                            key={player.id} 
                                            onClick={() => handlePlayerClick(player.id)} 
                                            className="bg-white p-4 rounded-lg border border-slate-200 card-shadow hover:shadow-lg transition-shadow cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {primaryMembership?.jersey_number || '?'}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-800 text-sm">
                                                        {player.first_name} {player.last_name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">{teamNames.join(', ')}</p>
                                                    {player.main_position && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                                                                {player.main_position}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="bg-slate-50 p-2 rounded">
                                                    <p className="font-bold text-slate-700">{stats.games_played}</p>
                                                    <p className="text-slate-500">Games</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded">
                                                    <p className="font-bold text-slate-700">{stats.goals}</p>
                                                    <p className="text-slate-500">Goals</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded">
                                                    <p className="font-bold text-slate-700">{stats.assists}</p>
                                                    <p className="text-slate-500">Assists</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded">
                                                    <p className="font-bold text-slate-700">
                                                        {Math.round((stats.minutes_played || 0) / 60)} hrs
                                                    </p>
                                                    <p className="text-slate-500">Play Time</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {!isLoading && filteredPlayers.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Players Found</h3>
                                <p className="text-sm text-slate-500">No players match your current search or filter.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
