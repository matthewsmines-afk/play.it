
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { Team } from '@/entities/Team';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF', 'LF', 'RF'];

export default function EditPlayer() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    main_position: 'CM',
    positions: [],
    preferred_foot: 'Right',
    jersey_number: '',
    parent_user_id: '',
    emergency_contact: '',
    medical_notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const urlParams = new URLSearchParams(window.location.search);
      const playerId = urlParams.get('playerId');
      const teamId = urlParams.get('teamId');

      if (teamId) {
        const teamData = await Team.get(teamId);
        setTeam(teamData);
      }

      if (playerId) {
        const playerData = await Player.get(playerId);
        setPlayer(playerData);
        setFormData({
          first_name: playerData.first_name || '',
          last_name: playerData.last_name || '',
          date_of_birth: playerData.date_of_birth || '',
          main_position: playerData.main_position || 'CM',
          positions: playerData.positions || [],
          preferred_foot: playerData.preferred_foot || 'Right',
          jersey_number: playerData.team_memberships?.find(m => m.team_id === teamId)?.jersey_number || '',
          parent_user_id: playerData.parent_user_id || '',
          emergency_contact: playerData.emergency_contact || '',
          medical_notes: playerData.medical_notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load player data');
    }
    setIsLoading(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const teamId = urlParams.get('teamId');
      
      const playerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        main_position: formData.main_position,
        positions: formData.positions,
        preferred_foot: formData.preferred_foot,
        parent_user_id: formData.parent_user_id || currentUser.id,
        emergency_contact: formData.emergency_contact,
        medical_notes: formData.medical_notes,
      };

      if (player) {
        // Update existing player
        await Player.update(player.id, playerData);
        
        // Update jersey number in team membership if changed
        if (teamId && formData.jersey_number) {
          const updatedMemberships = player.team_memberships.map(m => 
            m.team_id === teamId 
              ? { ...m, jersey_number: parseInt(formData.jersey_number) }
              : m
          );
          await Player.update(player.id, { team_memberships: updatedMemberships });
        }
        
        toast.success('Player updated successfully!');
      } else {
        // Create new player
        const newPlayer = await Player.create({
          ...playerData,
          team_memberships: teamId ? [{
            team_id: teamId,
            jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
            role: 'primary',
            is_active: true
          }] : []
        });
        
        toast.success('Player added successfully!');
      }
      
      if (teamId) {
        navigate(createPageUrl('Dashboard') + `?teamId=${teamId}`);
      } else {
        navigate(createPageUrl('Players'));
      }
    } catch (error) {
      console.error('Error saving player:', error);
      toast.error('Failed to save player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#2D2C29" }}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* FIXED: Clean white header */}
      <div className="p-4 md:p-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {player ? 'Edit Player' : 'Add New Player'}
            </h1>
            {team && (
              <p className="text-sm text-slate-600">{team.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
            
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="John"
                    className={`text-slate-900 ${errors.first_name ? 'border-red-500' : ''}`}
                  />
                  {errors.first_name && (
                    <p className="text-xs text-red-500">{errors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Smith"
                    className={`text-slate-900 ${errors.last_name ? 'border-red-500' : ''}`}
                  />
                  {errors.last_name && (
                    <p className="text-xs text-red-500">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-sm font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className={`text-slate-900 ${errors.date_of_birth ? 'border-red-500' : ''}`}
                />
                {errors.date_of_birth && (
                  <p className="text-xs text-red-500">{errors.date_of_birth}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Position Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Position Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="main_position" className="text-sm font-medium">Main Position</Label>
                  <Select value={formData.main_position} onValueChange={(value) => handleInputChange('main_position', value)}>
                    <SelectTrigger id="main_position" className="text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_foot" className="text-sm font-medium">Preferred Foot</Label>
                  <Select value={formData.preferred_foot} onValueChange={(value) => handleInputChange('preferred_foot', value)}>
                    <SelectTrigger id="preferred_foot" className="text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Left">Left</SelectItem>
                      <SelectItem value="Right">Right</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {team && (
                <div className="space-y-2">
                  <Label htmlFor="jersey_number" className="text-sm font-medium">Jersey Number</Label>
                  <Input
                    id="jersey_number"
                    type="number"
                    value={formData.jersey_number}
                    onChange={(e) => handleInputChange('jersey_number', e.target.value)}
                    placeholder="e.g., 10"
                    min="1"
                    max="99"
                    className="text-slate-900"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Medical */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact & Medical</CardTitle>
              <CardDescription className="text-xs">Emergency information (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact" className="text-sm font-medium">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                  placeholder="+44 7700 900000"
                  className="text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_notes" className="text-sm font-medium">Medical Notes</Label>
                <Textarea
                  id="medical_notes"
                  value={formData.medical_notes}
                  onChange={(e) => handleInputChange('medical_notes', e.target.value)}
                  placeholder="Any medical conditions, allergies, or important notes..."
                  rows={3}
                  className="text-slate-900"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button - Fixed at bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:relative md:border-0 md:bg-transparent z-50">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {player ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  {player ? 'Update Player' : 'Add Player'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
