import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import ChatSystem from "../components/chat/ChatSystem";

export default function Chat() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header with semi-transparent background */}
      <div className="p-4 bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Messages</h1>
            <p className="text-xs text-slate-600">Your conversations</p>
          </div>
        </div>
      </div>

      {/* Chat content */}
      <div className="flex-1">
        <ChatSystem />
      </div>
    </div>
  );
}