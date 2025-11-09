import React, { useState, useEffect } from 'react';
import { TeamJoinRequest } from '@/entities/TeamJoinRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, UserPlus, Clock } from 'lucide-react';
import { format } from 'date-fns';

import JoinRequestReview from './JoinRequestReview';

export default function JoinRequestsList({ teamId }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const allRequests = await TeamJoinRequest.filter({ 
        team_id: teamId,
        status: 'pending'
      }, '-created_date');
      
      setRequests(allRequests || []);
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, [teamId]);

  const handleRequestHandled = () => {
    setSelectedRequest(null);
    loadRequests();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-500">Loading requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return null; // Don't show anything if no pending requests
  }

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Bell className="w-5 h-5" />
            Pending Join Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {requests.map(request => (
                <div key={request.id} className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">
                          {request.player_first_name} {request.player_last_name}
                        </h4>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(request.created_date), 'MMM d')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Parent: {request.parent_name}
                      </p>
                      {request.message_from_parent && (
                        <p className="text-sm text-slate-500 mt-2 italic line-clamp-2">
                          "{request.message_from_parent}"
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => setSelectedRequest(request)}
                      size="sm"
                      className="ml-4"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedRequest && (
        <JoinRequestReview
          request={selectedRequest}
          teamId={teamId}
          onRequestHandled={handleRequestHandled}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
}