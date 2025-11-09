import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home } from "lucide-react";

export default function BottomNavigation() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    // Always navigate to Dashboard, which will route to correct role-based dashboard
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pointer-events-none">
      <button
        onClick={handleHomeClick}
        className="pointer-events-auto bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 p-4 rounded-full shadow-2xl transition-all duration-200 active:scale-95"
        aria-label="Go to Dashboard"
      >
        <Home className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}