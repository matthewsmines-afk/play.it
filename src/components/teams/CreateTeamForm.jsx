
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '@/entities/Team';
import { Club } from '@/entities/Club';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import LocationPicker from '../shared/LocationPicker';

const AGE_GROUPS = [
  "U4", "U5", "U6", "U7", "U8", "U9", "U10", "U11", "U12",
  "U13", "U14", "U15", "U16", "U17", "U18", "U19", "U20",
  "U21", "U23", "Senior", "Mixed Age"
];

export default function CreateTeamForm() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sport: 'football',
    age_group: '',
    default_match_format: '11v11',
    club_id: '',
    home_ground_location: null,
    training_ground_location: null,
    primary_color: '#000000',
    secondary_color: '#ffffff',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const clubsList = await Club.list();
      setClubs(clubsList || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.age_group.trim()) {
      newErrors.age_group = 'Age group is required';
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
      const teamData = {
        ...formData,
        coaches: [currentUser.id],
        is_active: true,
        // Ensure club_id is null if it's an empty string for API compatibility
        club_id: formData.club_id === '' ? null : formData.club_id,
      };

      const newTeam = await Team.create(teamData);

      toast.success('Team created successfully!');
      navigate(createPageUrl('Dashboard') + `?teamId=${newTeam.id}`);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team. Please try again.');
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

  return (
    <div className="pb-28 md:pb-8 bg-transparent">
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Basic Info Card */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Basic Information</CardTitle>
              <CardDescription className="text-xs text-slate-600">Essential team details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-transparent">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-800">
                  Team Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Eagles Under 16"
                  className={`bg-white text-slate-900 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age_group" className="text-sm font-medium text-slate-800">
                  Age Group <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.age_group} 
                  onValueChange={(value) => handleInputChange('age_group', value)}
                >
                  <SelectTrigger id="age_group" className={`bg-white text-slate-900 ${errors.age_group ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select age group..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {AGE_GROUPS.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.age_group && (
                  <p className="text-xs text-red-500">{errors.age_group}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sport" className="text-sm font-medium text-slate-800">Sport</Label>
                  <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                    <SelectTrigger id="sport" className="bg-white text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="football">Football</SelectItem>
                      <SelectItem value="rugby">Rugby</SelectItem>
                      <SelectItem value="cricket">Cricket</SelectItem>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_match_format" className="text-sm font-medium text-slate-800">Match Format</Label>
                  <Select value={formData.default_match_format} onValueChange={(value) => handleInputChange('default_match_format', value)}>
                    <SelectTrigger id="default_match_format" className="bg-white text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="3v3">3v3</SelectItem>
                      <SelectItem value="5v5">5v5</SelectItem>
                      <SelectItem value="7v7">7v7</SelectItem>
                      <SelectItem value="9v9">9v9</SelectItem>
                      <SelectItem value="11v11">11v11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Club Selection Card */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Club Affiliation</CardTitle>
              <CardDescription className="text-xs text-slate-600">Link team to a club (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-transparent">
              <div className="space-y-2">
                <Label htmlFor="club_id" className="text-sm font-medium text-slate-800">Select Club</Label>
                <Select value={formData.club_id} onValueChange={(value) => handleInputChange('club_id', value)}>
                  <SelectTrigger id="club_id" className="bg-white text-slate-900">
                    <SelectValue placeholder="No club (independent team)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value={null}>No club (independent team)</SelectItem>
                    {clubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Team Colors Card */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Team Colors</CardTitle>
              <CardDescription className="text-xs text-slate-600">Choose your team's colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-transparent">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color" className="text-sm font-medium text-slate-800">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="p-1 h-10 w-12 cursor-pointer bg-white"
                    />
                    <Input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#000000"
                      className="bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color" className="text-sm font-medium text-slate-800">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="p-1 h-10 w-12 cursor-pointer bg-white"
                    />
                    <Input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#ffffff"
                      className="bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Locations</CardTitle>
              <CardDescription className="text-xs text-slate-600">Set home ground and training venue (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-transparent">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-800">Home Ground</Label>
                <LocationPicker
                  value={formData.home_ground_location}
                  onChange={(location) => handleInputChange('home_ground_location', location)}
                  placeholder="Search for home ground..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-800">Training Ground</Label>
                <LocationPicker
                  value={formData.training_ground_location}
                  onChange={(location) => handleInputChange('training_ground_location', location)}
                  placeholder="Search for training ground..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Team...
                </>
              ) : (
                'Create Team'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
