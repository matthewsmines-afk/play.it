
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ChatSystem from '../components/chat/ChatSystem';

export default function Chat() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* FIXED: Clean white header */}
      <div className="p-4 md:p-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(createPageUrl('Dashboard'))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chat</h1>
            <p className="text-sm text-slate-600">Communicate with coaches and team members</p>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-4">
        <ChatSystem />
      </div>
    </div>
  );
}
