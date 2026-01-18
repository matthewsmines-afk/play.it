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
      <div
        className="min-h-screen text-[var(--foreground)]"
        style={{ backgroundColor: "#2D2C29" }}
      >
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
            }

            /* GLOBAL FONT RULES - NO ITALICS */
            * {
              font-style: normal !important;
            }
            
            /* ===== REFINED FONT HIERARCHY - MATCHING CREATE TEAM PAGE ===== */
            
            /* Base body text - 14px regular */
            body, p, span, div, a, li {
              font-size: 14px !important;
              font-weight: 400 !important;
              line-height: 1.5 !important;
              color: #1e293b !important;
            }

            /* Page Titles (h1) - 24px bold black */
            h1, .text-2xl, .text-3xl {
              font-size: 24px !important;
              font-weight: 700 !important;
              line-height: 1.3 !important;
              color: #0f172a !important;
            }

            /* Card Section Headers (h2) - 18px bold black */
            h2, [class*="CardTitle"], .card-title {
              font-size: 18px !important;
              font-weight: 700 !important;
              line-height: 1.4 !important;
              color: #0f172a !important;
            }

            /* Subsection Headers (h3) - 16px bold black */
            h3 {
              font-size: 16px !important;
              font-weight: 700 !important;
              line-height: 1.4 !important;
              color: #0f172a !important;
            }

            /* Small Headers (h4, h5, h6) - 14px bold black */
            h4, h5, h6 {
              font-size: 14px !important;
              font-weight: 700 !important;
              line-height: 1.4 !important;
              color: #0f172a !important;
            }

            /* Page subtitles and section descriptions - 13px regular muted */
            .text-muted, 
            .text-slate-500, 
            .text-slate-600, 
            .text-gray-500, 
            .text-gray-600,
            [class*="text-muted"] {
              font-size: 13px !important;
              font-weight: 400 !important;
              color: #64748b !important;
            }

            /* Form labels - 14px bold black */
            label,
            [class*="Label"] {
              font-size: 14px !important;
              font-weight: 700 !important;
              color: #0f172a !important;
            }

            /* Input fields, textareas, selects - 14px regular */
            input[type="text"],
            input[type="email"],
            input[type="number"],
            input[type="password"],
            input[type="tel"],
            textarea,
            select {
              font-size: 14px !important;
              font-weight: 400 !important;
              color: #1e293b !important;
            }

            /* Input placeholders - 14px regular muted */
            ::placeholder {
              font-size: 14px !important;
              font-weight: 400 !important;
              color: #94a3b8 !important;
              font-style: normal !important;
            }

            /* Buttons - 14px semibold */
            button {
              font-size: 14px !important;
              font-weight: 600 !important;
              line-height: 1.4 !important;
            }

            /* Extra small text - 12px regular */
            .text-xs, [class*="text-xs"] {
              font-size: 12px !important;
              font-weight: 400 !important;
            }
            
            /* Small text - 13px regular */
            .text-sm, [class*="text-sm"] {
              font-size: 13px !important;
              font-weight: 400 !important;
            }

            /* Base/medium text - 14px regular */
            .text-base, [class*="text-base"] {
              font-size: 14px !important;
              font-weight: 400 !important;
            }

            /* Large text - 16px */
            .text-lg, [class*="text-lg"] {
              font-size: 16px !important;
            }

            /* Extra large text - 18px */
            .text-xl, [class*="text-xl"] {
              font-size: 18px !important;
            }

            /* Bold text modifier */
            .font-bold, .font-semibold, [class*="font-bold"], [class*="font-semibold"] {
              font-weight: 700 !important;
            }

            /* Regular weight text modifier */
            .font-normal, .font-light, [class*="font-normal"], [class*="font-light"] {
              font-weight: 400 !important;
            }

            /* ===== DROPDOWN/SELECT SPECIFIC RULES ===== */
            
            /* Select trigger button - 14px regular */
            button[role="combobox"],
            button[aria-haspopup="listbox"],
            [class*="SelectTrigger"],
            [class*="select-trigger"] {
              font-size: 14px !important;
              font-weight: 400 !important;
            }

            /* All text inside select triggers */
            button[role="combobox"] *,
            button[aria-haspopup="listbox"] *,
            [class*="SelectTrigger"] *,
            [class*="select-trigger"] * {
              font-size: 14px !important;
              font-weight: 400 !important;
            }

            /* SelectValue (placeholder/selected value) */
            [class*="SelectValue"],
            [data-placeholder],
            span[data-state] {
              font-size: 14px !important;
              font-weight: 400 !important;
            }

            /* Dropdown items */
            select, 
            [role="option"],
            [role="menuitem"],
            [data-radix-collection-item],
            .select-item,
            [class*="SelectItem"],
            [class*="select-item"] {
              font-size: 14px !important;
              font-weight: 400 !important;
            }

            /* Dropdown content containers */
            [class*="SelectContent"],
            [role="listbox"],
            [data-radix-select-content] {
              font-size: 14px !important;
            }

            /* Ensure all children inside dropdowns are 14px */
            [class*="SelectContent"] *,
            [role="listbox"] *,
            [data-radix-select-content] * {
              font-size: 14px !important;
              font-weight: 400 !important;
            }

            /* ===== MAXIMUM TRANSPARENCY - SHOW PITCH EVERYWHERE ===== */
            
            /* All Card components - highly transparent with strong blur */
            [class*="Card"],
            .card,
            [data-card] {
              background-color: rgba(255, 255, 255, 0.45) !important;
              backdrop-filter: blur(12px) !important;
              -webkit-backdrop-filter: blur(12px) !important;
            }



            /* Card headers specifically */
            [class*="CardHeader"],
            [class*="card-header"] {
              background-color: transparent !important;
            }

            /* Card content */
            [class*="CardContent"],
            [class*="card-content"] {
              background-color: transparent !important;
            }

            /* White backgrounds - make highly transparent */
            .bg-white:not(.sidebar *),
            [class*="bg-white"]:not(.sidebar *),
            [style*="background-color: white"]:not(.sidebar *),
            [style*="background-color: #fff"]:not(.sidebar *),
            [style*="background-color: #ffffff"]:not(.sidebar *) {
              background-color: rgba(255, 255, 255, 0.40) !important;
              backdrop-filter: blur(12px) !important;
              -webkit-backdrop-filter: blur(12px) !important;
            }

            /* Grey backgrounds - make highly transparent */
            .bg-gray-50:not(.sidebar *),
            .bg-gray-100:not(.sidebar *),
            .bg-slate-50:not(.sidebar *),
            .bg-slate-100:not(.sidebar *),
            [class*="bg-gray-50"]:not(.sidebar *),
            [class*="bg-gray-100"]:not(.sidebar *),
            [class*="bg-slate-50"]:not(.sidebar *),
            [class*="bg-slate-100"]:not(.sidebar *) {
              background-color: rgba(248, 250, 252, 0.30) !important;
              backdrop-filter: blur(10px) !important;
              -webkit-backdrop-filter: blur(10px) !important;
            }

            /* Specific overrides for elements that need to stay transparent */
            .bg-transparent,
            [class*="bg-transparent"] {
              background-color: transparent !important;
              backdrop-filter: none !important;
            }

            /* Modal/Dialog backgrounds - semi-transparent */
            [role="dialog"],
            [data-radix-dialog-content],
            .modal,
            .dialog {
              background-color: rgba(255, 255, 255, 0.55) !important;
              backdrop-filter: blur(15px) !important;
              -webkit-backdrop-filter: blur(15px) !important;
            }

            /* Dropdown menus - semi-transparent */
            [role="menu"],
            [data-radix-dropdown-content],
            [data-radix-select-content],
            .dropdown-content {
              background-color: rgba(255, 255, 255, 0.60) !important;
              backdrop-filter: blur(12px) !important;
              -webkit-backdrop-filter: blur(12px) !important;
            }

            /* Popover content - semi-transparent */
            [data-radix-popover-content],
            .popover-content {
              background-color: rgba(255, 255, 255, 0.60) !important;
              backdrop-filter: blur(12px) !important;
              -webkit-backdrop-filter: blur(12px) !important;
            }

            /* Input fields - keep readable but transparent */
            input[type="text"],
            input[type="email"],
            input[type="number"],
            input[type="password"],
            input[type="tel"],
            textarea,
            select {
              background-color: rgba(255, 255, 255, 0.50) !important;
              backdrop-filter: blur(8px) !important;
              -webkit-backdrop-filter: blur(8px) !important;
            }

            /* Header areas with white/grey backgrounds */
            header[class*="bg-white"]:not([style*="background-color: #2D2C29"]),
            .header[class*="bg-white"]:not([style*="background-color: #2D2C29"]) {
              background-color: rgba(255, 255, 255, 0.45) !important;
              backdrop-filter: blur(12px) !important;
              -webkit-backdrop-filter: blur(12px) !important;
            }

            /* Keep sidebar fully opaque for readability */
            .sidebar,
            .sidebar *,
            [data-sidebar],
            [data-sidebar] * {
              background-color: white !important;
              backdrop-filter: none !important;
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
                background-color: rgba(255, 255, 255, 0.65) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                color: #111827;
                border-top-left-radius: 2rem;
                border-top-right-radius: 2rem;
                margin-top: -1.25rem;
                position: relative;
                z-index: 10;
            }

            /* OPTIMIZED BACKGROUND IMAGE - Faster Loading */
            .pitch-background {
              display: none;
            }
          `}
        </style>

        <SidebarProvider>
          <div className="flex w-full min-h-screen theme-charcoal relative">
            {/* OPTIMIZED Background Image with CSS class */}
            <div className="pitch-background" />

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