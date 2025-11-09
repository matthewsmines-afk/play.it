
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation } from '@/entities/Conversation';
import { Message } from '@/entities/Message';
import { User } from '@/entities/User';
import { Player } from '@/entities/Player';
import { Team } from '@/entities/Team';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarContent as it's not used
import { 
  Send, 
  Users, 
  Settings,
  MessageSquare,
  // Plus, // Plus is not used
  // BarChart3 // BarChart3 is not used
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'p') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export default function TeamChat({ teamId, currentUser }) {
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const loadTeamData = useCallback(async () => {
    try {
      const [teamData, players] = await Promise.all([
        Team.get(teamId),
        Player.filter({ team_id: teamId })
      ]);
      
      setTeam(teamData);
      
      // Get all team members (coaches + parents)
      const coachIds = teamData.coaches || [];
      const parentIds = players.map(p => p.parent_user_id).filter(Boolean);
      const allMemberIds = [...new Set([...coachIds, ...parentIds])];
      
      if (allMemberIds.length > 0) {
        const members = await User.filter({ id: { '$in': allMemberIds } });
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  }, [teamId]);

  const loadOrCreateConversation = useCallback(async () => {
    try {
      // Check if team conversation already exists
      const existingConversations = await Conversation.filter({ 
        type: 'team_group', 
        team_id: teamId 
      });
      
      let teamConversation;
      if (existingConversations.length > 0) {
        teamConversation = existingConversations[0];
      } else {
        // Create team conversation if it doesn't exist
        const teamData = await Team.get(teamId);
        const coachIds = teamData.coaches || [];
        const players = await Player.filter({ team_id: teamId });
        const parentIds = players.map(p => p.parent_user_id).filter(Boolean);
        const allParticipants = [...new Set([...coachIds, ...parentIds])];
        
        teamConversation = await Conversation.create({
          type: 'team_group',
          title: `${teamData.name} Team Chat`,
          team_id: teamId,
          created_by: currentUser.id,
          participants: allParticipants,
          is_active: true
        });
      }
      
      setConversation(teamConversation);
      
      // Load messages for this conversation
      const conversationMessages = await Message.filter(
        { conversation_id: teamConversation.id }, 
        '-created_date'
      );
      setMessages(conversationMessages);
      
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }, [teamId, currentUser.id]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await Promise.all([
        loadTeamData(),
        loadOrCreateConversation()
      ]);
      setIsLoading(false);
    };
    
    initialize();
  }, [loadTeamData, loadOrCreateConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || isSending) return;
    
    setIsSending(true);
    try {
      const messageData = {
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        content: newMessage.trim(),
        message_type: 'text'
      };
      
      const sentMessage = await Message.create(messageData);
      setMessages(prev => [...prev, sentMessage]);
      
      // Update conversation with latest message
      await Conversation.update(conversation.id, {
        last_message_at: new Date().toISOString(),
        last_message_preview: newMessage.trim()
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setIsSending(false);
  };

  const handleNavigateToFullChat = () => {
    if (conversation) {
      navigate(createPageUrl('Conversation') + `?conversationId=${conversation.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-48 bg-slate-200 rounded"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6 text-center">
        <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="font-semibold text-slate-700 mb-2">Team chat not available</h3>
        <p className="text-slate-500 text-sm">There was an issue setting up the team chat.</p>
      </div>
    );
  }

  const isCoach = team?.coaches?.includes(currentUser.id);

  return (
    <div> {/* Changed from p-6 to no padding */}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Team Chat</h2>
          <p className="text-sm text-slate-500">
            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNavigateToFullChat}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Open Full Chat
          </Button>
          {isCoach && (
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Preview */}
      <div className="bg-white rounded-lg border border-slate-200 h-64 flex flex-col card-shadow">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 text-sm">No messages yet</p>
              <p className="text-slate-400 text-xs">Be the first to say hello!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.slice(-5).map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {message.sender_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-sm text-slate-800">
                        {message.sender_name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {safeFormatDate(message.created_date)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Quick Message Form */}
        <div className="p-3 border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={isSending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!newMessage.trim() || isSending}
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {messages.length > 5 && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={handleNavigateToFullChat}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            View All Messages ({messages.length})
          </Button>
        </div>
      )}
    </div>
  );
}
