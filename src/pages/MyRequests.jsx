import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamJoinRequest } from '@/entities/TeamJoinRequest';
import { Team } from '@/entities/Team';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [teams, setTeams] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);

        // Load all requests for this parent
        const allRequests = await TeamJoinRequest.filter({ 
          parent_user_id: user.id 
        }, '-created_date');
        
        setRequests(allRequests || []);

        // Load team details for each request
        if (allRequests && allRequests.length > 0) {
          const teamIds = [...new Set(allRequests.map(r => r.team_id))];
          const teamsData = await Team.filter({ id: { '$in': teamIds } });
          
          const teamsMap = {};
          teamsData.forEach(team => {
            teamsMap[team.id] = team;
          });
          setTeams(teamsMap);
        }
      } catch (error) {
        console.error('Error loading requests:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Declined</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
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
            <h1 className="text-2xl font-semibold text-white mb-2">My Team Requests</h1>
            <p className="text-gray-400">Track the status of your team join requests</p>
          </div>
        </div>
      </div>

      {/* White Content Area */}
      <div className="bg-white min-h-screen rounded-t-3xl relative -mt-3 pb-24">
        <div className="px-4 pt-8 pb-6">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-3">No requests yet</h3>
              <p className="text-gray-500 mb-8 font-light leading-relaxed px-6">
                When you request to join a team, you'll be able to track the status here.
              </p>
              <Button
                onClick={() => navigate(createPageUrl('FindTeam'))}
                className="bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white px-8 py-3"
              >
                Find a Team
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <Card key={request.id} className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(request.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-800">
                              {teams[request.team_id]?.name || 'Team'}
                            </h3>
                            <p className="text-sm text-slate-600">
                              For: {request.player_first_name} {request.player_last_name}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span>Requested on {format(new Date(request.created_date), 'PPP')}</span>
                          </div>

                          {request.message_from_parent && (
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-slate-600 italic">"{request.message_from_parent}"</p>
                            </div>
                          )}

                          {request.coach_notes && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-800 mb-1">Coach Response:</p>
                              <p className="text-blue-700">{request.coach_notes}</p>
                            </div>
                          )}

                          {request.status === 'approved' && (
                            <div className="mt-4">
                              <Button
                                onClick={() => navigate(createPageUrl('MyChildren'))}
                                size="sm"
                                variant="outline"
                              >
                                View Player Profile
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}