import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation } from '@/entities/Conversation';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

import ConversationView from '../components/chat/ConversationView';

export default function ConversationPage() {
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConversationData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const conversationId = urlParams.get('conversationId');
      
      if (!conversationId) {
        navigate(createPageUrl('Chat'));
        return;
      }

      try {
        const [conversationData, userData] = await Promise.all([
          Conversation.get(conversationId),
          User.me()
        ]);
        
        setConversation(conversationData);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error loading conversation:', error);
        navigate(createPageUrl('Chat'));
      }
      setIsLoading(false);
    };

    loadConversationData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#2D2C29" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!conversation || !currentUser) {
    return (
      <div className="p-6 text-white">
        <p>Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* FIXED: Header with better contrast */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(createPageUrl('Chat'))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg text-slate-800">{conversation.title}</h1>
          {conversation.type === 'team_group' && (
            <p className="text-sm text-slate-500">Team Chat</p>
          )}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 bg-white">
        <ConversationView 
          conversation={conversation}
          currentUser={currentUser}
          onConversationUpdate={() => {
            // Optionally reload conversation data
          }}
        />
      </div>
    </div>
  );
}