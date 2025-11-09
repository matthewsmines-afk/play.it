
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Team } from '@/entities/Team';
import { Player } from '@/entities/Player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, UserIcon, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NewMessageModal({ isOpen, onClose, currentUser, onCreateConversation, onSendRequest }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allUsers, allTeams, myPlayers] = await Promise.all([
        User.list(),
        Team.list(),
        Player.filter({ parent_user_id: currentUser.id })
      ]);

      // Get teams where current user is a coach or has a child
      const myTeamIds = [
        ...allTeams.filter(team => team.coaches?.includes(currentUser.id)).map(t => t.id),
        ...myPlayers.map(p => p.team_id)
      ];

      const myTeams = allTeams.filter(team => myTeamIds.includes(team.id));

      setUsers(allUsers.filter(u => u.id !== currentUser.id));
      setTeams(myTeams);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, [currentUser.id]); // Added currentUser.id to dependencies

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]); // Added loadData to dependencies

  const getConnectionContext = (user) => {
    // Determine relationship context
    if (user.role === 'admin') return 'System Administrator';
    
    // Check if user is a coach in any of my teams
    const sharedTeams = teams.filter(team => team.coaches?.includes(user.id));
    if (sharedTeams.length > 0) {
      return `Coach of ${sharedTeams[0].name}`;
    }

    // Check if user is a parent of a player in my teams
    // This would require additional logic to check players
    return 'Parent/User';
  };

  const canDirectMessage = (user) => {
    // Coaches can message other coaches directly
    const myCoachTeams = teams.filter(team => team.coaches?.includes(currentUser.id));
    const userCoachTeams = teams.filter(team => team.coaches?.includes(user.id));
    
    return myCoachTeams.length > 0 && userCoachTeams.length > 0;
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user) => {
    if (canDirectMessage(user)) {
      // Create conversation directly
      onCreateConversation([currentUser, user]);
    } else {
      // Send message request
      if (!messageText.trim()) {
        alert('Please write a message to send with your request.');
        return;
      }
      
      const context = getConnectionContext(user);
      onSendRequest(user, messageText, context);
    }
  };

  const handleTeamSelect = (team) => {
    const teamParticipants = [{ id: currentUser.id, name: currentUser.full_name, team_name: team.name }];
    onCreateConversation(teamParticipants, true, team.id);
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUsers([]);
    setMessageText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users or teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="teams">Team Chats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <ScrollArea className="h-64">
                {isLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{user.full_name}</p>
                            <p className="text-xs text-slate-500">{getConnectionContext(user)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={canDirectMessage(user) ? 'default' : 'secondary'}>
                            {canDirectMessage(user) ? 'Direct' : 'Request'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {/* Message text for requests */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Message (required for message requests)
                </label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Hi, I'd like to discuss..."
                  className="mt-1"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">
                  This message will be sent with your request to users who require approval.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="teams" className="space-y-4">
              <ScrollArea className="h-64">
                {isLoading ? (
                  <div className="text-center py-8">Loading teams...</div>
                ) : filteredTeams.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No team chats available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTeams.map(team => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleTeamSelect(team)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{team.name}</p>
                            <p className="text-xs text-slate-500">{team.age_group} • {team.sport}</p>
                          </div>
                        </div>
                        <Badge>Team Chat</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
