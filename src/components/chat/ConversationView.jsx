import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/entities/Message';
import { Conversation } from '@/entities/Conversation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ConversationView({ conversation, currentUser, onConversationUpdate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const messagesData = await Message.filter({ 
        conversation_id: conversation.id 
      }, 'created_date');
      
      setMessages(messagesData || []);

      // Mark messages as read
      const unreadMessages = (messagesData || []).filter(msg => 
        msg.sender_id !== currentUser.id && 
        (!msg.read_by || !msg.read_by.includes(currentUser.id))
      );

      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(async (msg) => {
            const readBy = msg.read_by || [];
            if (!readBy.includes(currentUser.id)) {
              readBy.push(currentUser.id);
              await Message.update(msg.id, { read_by: readBy });
            }
          })
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        content: newMessage.trim()
      };

      await Message.create(messageData);

      // Update conversation's last message
      await Conversation.update(conversation.id, {
        last_message_at: new Date().toISOString(),
        last_message_preview: newMessage.trim().substring(0, 100)
      });

      setNewMessage('');
      loadMessages();
      
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setIsSending(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.sender_id === currentUser.id;
              const showSender = index === 0 || messages[index - 1].sender_id !== message.sender_id;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col",
                    isOwnMessage ? "items-end" : "items-start"
                  )}
                >
                  {showSender && !isOwnMessage && (
                    <span className="text-xs text-slate-500 mb-1 ml-2">
                      {message.sender_name}
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    )}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <span className={cn(
                      "text-xs mt-1 block",
                      isOwnMessage ? "text-blue-100" : "text-slate-500"
                    )}>
                      {format(new Date(message.created_date), 'p')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}