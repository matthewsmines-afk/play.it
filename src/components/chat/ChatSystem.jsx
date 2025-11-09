import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { Team } from '@/entities/Team';
import { Player } from '@/entities/Player';
import { Conversation } from '@/entities/Conversation';
import { Message } from '@/entities/Message';
import { MessageRequest } from '@/entities/MessageRequest';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Users, 
  User as UserIcon,
  Pin,
  Bell
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { createPageUrl } from '@/utils';

import NewMessageModal from './NewMessageModal';
import MessageRequestModal from './MessageRequestModal';

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

// Format "time ago" style
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return '';
  }
};

export default function ChatSystem() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [messageRequests, setMessageRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  }, []);

  const loadConversations = useCallback(async (user) => {
    try {
      // Get conversations where user is a participant
      const allConversations = await Conversation.list('-last_message_at');
      const userConversations = allConversations.filter(conv => 
        conv.participants && conv.participants.includes(user.id)
      );
      
      // Load unread counts for each conversation
      const unreadMap = {};
      await Promise.all(
        userConversations.map(async (conv) => {
          try {
            const messages = await Message.filter({ conversation_id: conv.id }, '-created_date');
            const unreadCount = messages.filter(msg => 
              msg.sender_id !== user.id && 
              (!msg.read_by || !msg.read_by.includes(user.id))
            ).length;
            unreadMap[conv.id] = unreadCount;
          } catch (error) {
            console.error('Error loading unread count:', error);
            unreadMap[conv.id] = 0;
          }
        })
      );
      
      setUnreadCounts(unreadMap);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  const loadMessageRequests = useCallback(async (user) => {
    try {
      // Load pending requests where user is the target
      const requests = await MessageRequest.filter({ 
        target_id: user.id, 
        status: 'pending' 
      }, '-created_date');
      setMessageRequests(requests);
    } catch (error) {
      console.error('Error loading message requests:', error);
    }
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      const user = await loadCurrentUser();
      if (user) {
        await Promise.all([
          loadConversations(user),
          loadMessageRequests(user)
        ]);
      }
      setIsLoading(false);
    };

    initializeChat();
  }, [loadCurrentUser, loadConversations, loadMessageRequests]);

  const handleNewConversation = async (participants, isTeamGroup = false, teamId = null) => {
    try {
      const title = isTeamGroup 
        ? `${participants[0].team_name} Team Chat`
        : participants.length === 2 
          ? participants.find(p => p.id !== currentUser.id)?.name 
          : 'Group Chat';

      const conversationData = {
        type: isTeamGroup ? 'team_group' : 'private',
        title,
        team_id: teamId,
        created_by: currentUser.id,
        participants: participants.map(p => p.id),
        is_active: true
      };

      const newConversation = await Conversation.create(conversationData);
      await loadConversations(currentUser);
      setShowNewMessage(false);
      
      // Navigate to the new conversation
      navigate(createPageUrl('Conversation') + `?conversationId=${newConversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleMessageRequest = async (targetUser, initialMessage, context) => {
    try {
      await MessageRequest.create({
        requester_id: currentUser.id,
        requester_name: currentUser.full_name,
        target_id: targetUser.id,
        target_name: targetUser.full_name,
        initial_message: initialMessage,
        context,
        status: 'pending'
      });
      setShowNewMessage(false);
    } catch (error) {
      console.error('Error sending message request:', error);
    }
  };

  const handleRequestResponse = async (request, approved) => {
    try {
      await MessageRequest.update(request.id, { 
        status: approved ? 'approved' : 'declined' 
      });

      if (approved) {
        // Create conversation and send initial message
        const conversationData = {
          type: 'private',
          title: request.requester_name,
          created_by: request.requester_id,
          participants: [request.requester_id, request.target_id],
          is_active: true
        };

        const newConversation = await Conversation.create(conversationData);
        
        // Send the initial message
        await Message.create({
          conversation_id: newConversation.id,
          sender_id: request.requester_id,
          sender_name: request.requester_name,
          content: request.initial_message
        });

        // Update conversation with last message info
        await Conversation.update(newConversation.id, {
          last_message_at: new Date().toISOString(),
          last_message_preview: request.initial_message.substring(0, 100)
        });

        await loadConversations(currentUser);
      }

      await loadMessageRequests(currentUser);
    } catch (error) {
      console.error('Error handling request response:', error);
    }
  };

  const handleConversationClick = (conversation) => {
    navigate(createPageUrl('Conversation') + `?conversationId=${conversation.id}`);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort conversations with team groups pinned to top
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.type === 'team_group' && b.type !== 'team_group') return -1;
    if (b.type === 'team_group' && a.type !== 'team_group') return 1;
    
    // Then by last message time
    const aTime = a.last_message_at ? new Date(a.last_message_at) : new Date(a.created_date);
    const bTime = b.last_message_at ? new Date(b.last_message_at) : new Date(b.created_date);
    return bTime - aTime;
  });

  // Calculate total unread messages
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800">Chats</h2>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white">
                {totalUnread}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {messageRequests.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowRequests(true)}
                className="relative h-8 w-8"
              >
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] leading-none rounded-full">
                  {messageRequests.length}
                </Badge>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowNewMessage(true)}
              className="h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="h-[500px]">
        <div>
          {sortedConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No conversations yet</h3>
              <p className="text-slate-500 text-sm mb-4">Start chatting with coaches and team members</p>
              <Button 
                variant="outline" 
                onClick={() => setShowNewMessage(true)}
              >
                Start a conversation
              </Button>
            </div>
          ) : (
            sortedConversations.map((conversation) => {
              const unreadCount = unreadCounts[conversation.id] || 0;
              const hasUnread = unreadCount > 0;

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className="p-4 cursor-pointer transition-colors hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="flex-shrink-0 relative">
                        {conversation.type === 'team_group' ? (
                          <Users className="w-5 h-5 text-blue-500" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-slate-500" />
                        )}
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-slate-800 truncate ${hasUnread ? 'font-bold' : ''}`}>
                            {conversation.title}
                          </span>
                          {conversation.type === 'team_group' && (
                            <Pin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                        {conversation.last_message_preview && (
                          <p className={`text-sm truncate ${hasUnread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                            {conversation.last_message_preview}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      {conversation.last_message_at && (
                        <span className="text-xs text-slate-400">
                          {formatTimeAgo(conversation.last_message_at)}
                        </span>
                      )}
                      {hasUnread && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                      {conversation.type === 'team_group' && (
                        <Badge className="text-[10px] font-medium bg-slate-800 text-white">
                          Team
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        currentUser={currentUser}
        onCreateConversation={handleNewConversation}
        onSendRequest={handleMessageRequest}
      />

      {/* Message Requests Modal */}
      <MessageRequestModal
        isOpen={showRequests}
        onClose={() => setShowRequests(false)}
        requests={messageRequests}
        onRequestResponse={handleRequestResponse}
      />
    </div>
  );
}