import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import {
  Home,
  Users,
  Building2,
  Calendar,
  Menu,
  MessageSquare,
  Palette,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import BottomNavigation from "@/components/shared/BottomNavigation";
import RoleSwitcher from "@/components/shared/RoleSwitcher";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
  { title: "Market", url: createPageUrl("ConnectHub"), icon: Users },
  { title: "Clubs", url: createPageUrl("Clubs"), icon: Building2 },
  { title: "Players", url: createPageUrl("Players"), icon: Users },
  { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
  { title: "Chat", url: createPageUrl("Chat"), icon: MessageSquare },
  { title: "Font Preview", url: createPageUrl("FontPreview"), icon: Palette },
];

const newLogoUrl =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9c1edbf77d9233404b226/8a63c9ddb_PlayIT.png";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setActiveRole(user.active_role || user.user_type);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
  };

  if (currentPageName === "Onboarding") {
    return <>{children}</>;
  }

  if (currentPageName === "ParentDashboard") {
      return (
          <div className="md:hidden">
              {children}
              <BottomNavigation />
          </div>
      )
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              background-color: white;
            }

            /* NO ITALICS */
            * {
              font-style: normal !important;
            }
            
            /* Typography Hierarchy */
            h1 { font-size: 24px; font-weight: 700; color: #0f172a; }
            h2 { font-size: 18px; font-weight: 700; color: #0f172a; }
            h3 { font-size: 16px; font-weight: 700; color: #0f172a; }
            h4, h5, h6 { font-size: 14px; font-weight: 700; color: #0f172a; }
            
            body, p, span, div, a, li { 
              font-size: 14px; 
              font-weight: 400; 
              color: #1e293b; 
            }
            
            label { font-weight: 700; color: #0f172a; }
            button { font-weight: 600; }
            
            ::placeholder { color: #94a3b8; }
            
            /* Orange accent for gradient buttons */
            .bg-gradient-to-r.from-orange-500 { 
              background: linear-gradient(to right, #f97316, #ef4444);
            }
            
            /* Keep sidebar opaque */
            .sidebar, .sidebar * { background-color: white !important; }
            
            /* Text on dark backgrounds stays white */
            [class*="bg-black"] *, 
            [class*="bg-slate-900"] *, 
            [class*="bg-slate-800"] *,
            [class*="bg-gray-900"] * { 
              color: #ffffff !important; 
            }
            
            [class*="bg-black"] svg,
            [class*="bg-slate-900"] svg { 
              color: #ffffff !important; 
            }
          `}
        </style>

        <SidebarProvider>
          <div className="flex w-full min-h-screen bg-white">
            {/* --- DESKTOP SIDEBAR --- */}
            <Sidebar className="sidebar bg-white hidden md:flex relative z-20">
              <SidebarHeader className="p-6 bg-white">
                <img src={newLogoUrl} alt="PLAY.IT Logo" className="h-8" />
              </SidebarHeader>

              <SidebarContent className="p-3 bg-white">
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`rounded-lg p-3 transition-all duration-300 ${
                              location.pathname === item.url
                                ? "bg-black text-white"
                                : "hover:bg-gray-100 text-black"
                            }`}
                          >
                            <Link
                              to={item.url}
                              className="flex items-center gap-3"
                            >
                              <item.icon className="w-5 h-5" />
                              <span className="font-semibold text-sm">
                                {item.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="p-4 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {currentUser?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-black text-sm">
                      {currentUser?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {activeRole || 'Loading...'}
                    </p>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>

            {/* --- MAIN CONTENT AREA (Mobile and Desktop) --- */}
            <main className="flex-1 flex flex-col w-full min-w-0 min-h-screen relative z-10">
              {/* --- MOBILE HEADER --- */}
              <header
                className="sticky top-0 z-20 px-4 py-3 md:hidden"
                style={{ backgroundColor: "#2D2C29" }}
              >
                <div className="flex items-center justify-between">
                  <SidebarTrigger className="hover:bg-gray-800 p-2 rounded-lg transition-colors">
                    <Menu className="w-6 h-6 text-white" />
                  </SidebarTrigger>
                  <img src={newLogoUrl} alt="PLAY.IT" className="h-[13.6px]" />
                  {activeRole && (
                    <RoleSwitcher 
                      currentRole={activeRole} 
                      onRoleChange={handleRoleChange}
                    />
                  )}
                </div>
              </header>

              <div className="flex-1 w-full overflow-y-auto">
                {children}
              </div>

              {/* --- MOBILE BOTTOM NAVIGATION --- */}
              <div className="md:hidden">
                <BottomNavigation />
              </div>

            </main>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}