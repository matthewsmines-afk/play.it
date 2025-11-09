import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Users, ChevronDown, Check } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRoles();
  }, []);

  const loadUserRoles = async () => {
    try {
      const user = await User.me();
      const roles = [];
      
      // Check what roles this user has
      if (user.user_type === 'coach' || user.user_type === 'parent') {
        roles.push(user.user_type);
      }
      
      // Check if user has multiple roles stored
      if (user.available_roles && Array.isArray(user.available_roles)) {
        user.available_roles.forEach(role => {
          if (!roles.includes(role)) {
            roles.push(role);
          }
        });
      }
      
      setUserRoles(roles);
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
    setIsLoading(false);
  };

  const handleRoleSwitch = async (newRole) => {
    try {
      // Update active role preference
      await User.updateMyUserData({
        active_role: newRole
      });
      
      onRoleChange(newRole);
      
      // FIXED: Navigate to Dashboard instead of reloading current page
      navigate(createPageUrl('Dashboard'));
      
      // Small delay then reload to ensure navigation completes
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const handleAddRole = async (roleToAdd) => {
    try {
      const user = await User.me();
      const existingRoles = user.available_roles || [user.user_type];
      
      if (!existingRoles.includes(roleToAdd)) {
        existingRoles.push(roleToAdd);
        
        await User.updateMyUserData({
          available_roles: existingRoles,
          active_role: roleToAdd
        });
        
        // FIXED: Navigate to Dashboard before reload
        navigate(createPageUrl('Dashboard'));
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  const roleLabels = {
    coach: 'Coach',
    parent: 'Parent',
    player: 'Player'
  };

  const roleIcons = {
    coach: Users,
    parent: UserIcon,
    player: UserIcon
  };

  const CurrentIcon = roleIcons[currentRole] || UserIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
          <CurrentIcon className="w-5 h-5" />
          <span className="hidden md:inline">{roleLabels[currentRole]}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userRoles.map(role => {
          const Icon = roleIcons[role];
          const isActive = role === currentRole;
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => !isActive && handleRoleSwitch(role)}
              className={isActive ? 'bg-slate-100' : ''}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{roleLabels[role]}</span>
              {isActive && <Check className="w-4 h-4 ml-auto text-green-600" />}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-slate-500">Add Role</DropdownMenuLabel>
        
        {!userRoles.includes('coach') && (
          <DropdownMenuItem onClick={() => handleAddRole('coach')}>
            <Users className="w-4 h-4 mr-2" />
            <span>I'm also a Coach</span>
          </DropdownMenuItem>
        )}
        
        {!userRoles.includes('parent') && (
          <DropdownMenuItem onClick={() => handleAddRole('parent')}>
            <UserIcon className="w-4 h-4 mr-2" />
            <span>I'm also a Parent</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}