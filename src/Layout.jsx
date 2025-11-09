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
  { title: "C-Hub", url: createPageUrl("ConnectHub"), icon: Users },
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
      <div
        className="min-h-screen text-[var(--foreground)]"
        style={{ backgroundColor: "#2D2C29" }}
      >
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
            }

            /* GLOBAL FONT RULES - NO ITALICS, BLACK/GREY TEXT ONLY */
            * {
              font-style: normal !important;
            }
            
            /* Standardize all text colors for light backgrounds */
            body, p, span, div, label, input, textarea, select {
              color: #1e293b !important; /* slate-800 */
            }
            
            /* Headings */
            h1, h2, h3, h4, h5, h6 {
              color: #0f172a !important; /* slate-900 */
              font-style: normal !important;
            }
            
            /* Muted/secondary text */
            .text-muted, .text-slate-500, .text-slate-600, .text-gray-500, .text-gray-600 {
              color: #64748b !important; /* slate-500 */
            }
            
            /* Input placeholders */
            ::placeholder {
              color: #94a3b8 !important; /* slate-400 */
              font-style: normal !important;
            }
            
            /* CRITICAL: Text on dark backgrounds MUST be white/light */
            [class*="bg-slate-900"] *, 
            [class*="bg-slate-800"] *, 
            [class*="bg-black"] *,
            [class*="bg-gray-900"] *,
            [class*="bg-gray-800"] *,
            .dark-bg *,
            [style*="background-color: #2D2C29"] *,
            [style*="background-color: #1e293b"] *,
            [style*="background-color: #0f172a"] * {
              color: #ffffff !important;
            }

            /* White text on dark backgrounds - explicit class */
            .text-white, [style*="color: white"], [style*="color: #fff"] {
              color: #ffffff !important;
            }

            /* Ensure icons on dark backgrounds are white */
            [class*="bg-slate-900"] svg, 
            [class*="bg-slate-800"] svg, 
            [class*="bg-black"] svg,
            .dark-bg svg {
              color: #ffffff !important;
            }

            :root, .theme-charcoal {
              --background: 40 4% 17%; /* Charcoal #2D2C29 */
              --foreground: 0 0% 100%; /* White */
              
              --card: 40 3% 22%; /* Darker Card #3A3936 */
              --card-foreground: 0 0% 100%;

              --primary: 0 0% 98%; /* Almost White */
              --primary-foreground: 40 4% 17%; /* Charcoal */

              --secondary: 14 83% 58%; /* Orange/Red */
              --secondary-foreground: 0 0% 100%;

              --muted: 40 3% 22%;
              --muted-foreground: 0 0% 63%; /* Lighter Gray */
              
              --popover: 40 4% 17%;
              --popover-foreground: 0 0% 100%;
              
              --border: 40 3% 30%; /* Lighter border for dark theme */
              --input: 40 3% 30%;
              --ring: 14 83% 58%;
            }

            /* --- White content pane styling --- */
            .content-pane {
                background-color: white;
                color: #111827; /* Tailwind gray-900 */
                border-top-left-radius: 2rem;
                border-top-right-radius: 2rem;
                margin-top: -1.25rem;
                position: relative;
                z-index: 10;
            }
          `}
        </style>

        <SidebarProvider>
          <div className="flex w-full min-h-screen theme-charcoal">
            {/* --- DESKTOP SIDEBAR --- */}
            <Sidebar className="bg-white hidden md:flex">
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
            <main className="flex-1 flex flex-col w-full min-w-0 min-h-screen">
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