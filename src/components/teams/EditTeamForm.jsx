
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Users, Check, Plus, Trash2 } from 'lucide-react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiSelect } from '@/components/ui/MultiSelect';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from '@/entities/User';
import { Club } from '@/entities/Club';
import { Event } from '@/entities/Event';
import { Team } from '@/entities/Team';
import { Player } from '@/entities/Player';
import KitUploader from './KitUploader';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SPORTS = ["football", "rugby", "cricket", "basketball", "tennis"];
const AGE_GROUPS = [
  "U4", "U5", "U6", "U7", "U8", "U9", "U10", "U11", "U12",
  "U13", "U14", "U15", "U16", "U17", "U18", "U19", "U20",
  "U21", "U23", "Senior", "Mixed Age"
];

export default function EditTeamForm({ team, onSubmit, onCancel }) {
  const isEditing = !!team;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ...team,
    club_name: '',
    additionalCoaches: [],
  });
  
  const [allUsers, setAllUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [homeGroundSuggestions, setHomeGroundSuggestions] = useState([]);
  const [trainingGroundSuggestions, setTrainingGroundSuggestions] = useState([]);
  const [showHomeGroundSuggestions, setShowHomeGroundSuggestions] = useState(false);
  const [showTrainingGroundSuggestions, setShowTrainingGroundSuggestions] = useState(false);
  const [showClubCombobox, setShowClubCombobox] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
        try {
            const me = await User.me();
            setCurrentUser(me);

            const users = await User.list();
            const userOptions = (users || [])
                .filter(u => u.id !== me.id)
                .map(u => ({ value: u.id, label: `${u.full_name} (${u.email})` }));
            setAllUsers(userOptions);

            const clubsData = await Club.list();
            setClubs(clubsData || []);

            // Set initial coaches data safely
            const existingCoaches = Array.isArray(team.coaches) ? team.coaches : [];
            const additionalCoaches = existingCoaches.filter(id => id !== me.id);
            
            // Set initial club name
            if (team.club_id) {
              const club = clubsData.find(c => c.id === team.club_id);
              if (club) {
                setFormData(prev => ({ ...prev, club_name: club.name }));
              }
            }

            setFormData(prev => ({
              ...prev,
              additionalCoaches: additionalCoaches,
            }));

            // Load venue suggestions
            const [allEvents, allTeams] = await Promise.all([
                Event.list(),
                Team.list() 
            ]);
            
            const eventLocations = (allEvents || []).map(e => e.location).filter(Boolean);
            const teamHomeGrounds = (allTeams || []).map(t => t.home_ground).filter(Boolean);
            const teamTrainingGrounds = (allTeams || []).map(t => t.training_ground).filter(Boolean);
            const allLocations = [...new Set([...eventLocations, ...teamHomeGrounds, ...teamTrainingGrounds])];
            
            setHomeGroundSuggestions(allLocations);
            setTrainingGroundSuggestions(allLocations);
            
        } catch (error) {
            console.error("Error loading initial data:", error);
        }
    }
    loadInitialData();
  }, [team]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    delete submitData.club_name; // Remove the search field from final submission
    onSubmit(submitData);
  };

  const handleDeleteTeam = async () => {
    try {
      // Archive team instead of hard delete - preserve all historical data
      await Team.update(team.id, { 
        is_active: false,
        archived_date: new Date().toISOString(),
        archived_reason: 'Team deleted by coach'
      });

      // Update all player memberships to inactive
      const teamPlayers = await Player.filter({ 
        team_memberships: { 
          '$elemMatch': { 
            team_id: team.id, 
            is_active: true 
          } 
        } 
      });

      for (const player of teamPlayers) {
        const updatedMemberships = player.team_memberships.map(membership => 
          membership.team_id === team.id 
            ? { ...membership, is_active: false, end_date: new Date().toISOString() }
            : membership
        );
        
        await Player.update(player.id, { team_memberships: updatedMemberships });
      }

      // Navigate back to dashboard using the correct method
      navigate(createPageUrl('Dashboard'));
      
    } catch (error) {
      console.error('Error archiving team:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'home_ground' && value && value.length > 0) {
      setShowHomeGroundSuggestions(true);
    }
    if (field === 'training_ground' && value && value.length > 0) {
      setShowTrainingGroundSuggestions(true);
    }
  };

  const handleKitUpload = (kitType, url) => {
    handleInputChange(`${kitType}_kit_url`, url);
  };

  const handleClubSelect = (club) => {
    setFormData(prev => ({
      ...prev,
      club_id: club.id,
      club_name: club.name,
    }));
    setShowClubCombobox(false);
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(formData.club_name.toLowerCase())
  );

  const exactClubMatch = clubs.find(club => 
    club.name.toLowerCase() === formData.club_name.toLowerCase()
  );

  const filteredHomeGroundSuggestions = homeGroundSuggestions
    .filter(loc => formData.home_ground && loc.toLowerCase().includes(formData.home_ground.toLowerCase()))
    .slice(0, 8);

  const filteredTrainingGroundSuggestions = trainingGroundSuggestions
    .filter(loc => formData.training_ground && loc.toLowerCase().includes(formData.training_ground.toLowerCase()))
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="card-shadow border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Edit Team Details
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Club Selection */}
            <div className="space-y-2">
              <Label htmlFor="club_name" className="text-sm font-semibold text-slate-700">Club (Optional)</Label>
              <Popover open={showClubCombobox} onOpenChange={setShowClubCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showClubCombobox}
                    className="w-full justify-between font-normal border-slate-300 focus:border-blue-500"
                  >
                    {formData.club_id
                      ? clubs.find((club) => club.id === formData.club_id)?.name
                      : (formData.club_name || "Search for a club or type to create new...")}
                    <X 
                      className={`ml-2 h-4 w-4 shrink-0 opacity-50 ${formData.club_id || formData.club_name ? "" : "hidden"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, club_id: '', club_name: '' }));
                      }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search clubs..." 
                      value={formData.club_name}
                      onValueChange={(value) => {
                        handleInputChange('club_name', value);
                        if (value === '') {
                          handleInputChange('club_id', '');
                        }
                      }}
                    />
                    <CommandEmpty>
                      {formData.club_name && !exactClubMatch && (
                        <div className="p-2">
                          <Button 
                            onClick={() => {
                              handleInputChange('club_id', ''); 
                              setShowClubCombobox(false);
                            }}
                            variant="ghost" 
                            className="w-full justify-start text-left text-blue-600 hover:text-blue-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create "{formData.club_name}"
                          </Button>
                        </div>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setFormData(prev => ({ ...prev, club_id: '', club_name: '' }));
                          setShowClubCombobox(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            !formData.club_id ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        Independent Team (No Club)
                      </CommandItem>
                      {filteredClubs.map((club) => (
                        <CommandItem
                          key={club.id}
                          onSelect={() => handleClubSelect(club)}
                          className="flex items-center"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.club_id === club.id ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <div>
                            <div className="font-medium">{club.name}</div>
                            {club.location && (
                              <div className="text-xs text-slate-500">{club.location}</div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport" className="text-sm font-semibold text-slate-700">Sport</Label>
              <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map(sport => (
                    <SelectItem key={sport} value={sport}>{sport.charAt(0).toUpperCase() + sport.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Team Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Lions FC Under 16"
                  required
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age_group" className="text-sm font-semibold text-slate-700">Age Group *</Label>
                <Select value={formData.age_group} onValueChange={(value) => handleInputChange('age_group', value)}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Select age group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_GROUPS.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_match_format" className="text-sm font-semibold text-slate-700">Default Match Format *</Label>
                <Select value={formData.default_match_format} onValueChange={(value) => handleInputChange('default_match_format', value)}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Select match format..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3v3">3 vs 3</SelectItem>
                    <SelectItem value="5v5">5 vs 5</SelectItem>
                    <SelectItem value="7v7">7 vs 7</SelectItem>
                    <SelectItem value="9v9">9 vs 9</SelectItem>
                    <SelectItem value="11v11">11 vs 11</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season" className="text-sm font-semibold text-slate-700">Season</Label>
                <Input
                  id="season"
                  value={formData.season}
                  onChange={(e) => handleInputChange('season', e.target.value)}
                  placeholder="e.g., 2024/25"
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Venue Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700">Venues</h4>
              
              <div className="space-y-2 relative">
                <Label htmlFor="home_ground" className="text-sm font-semibold text-slate-700">Home Ground (Matches)</Label>
                <Input
                  id="home_ground"
                  value={formData.home_ground}
                  onChange={(e) => handleInputChange('home_ground', e.target.value)}
                  placeholder="Where you play home matches"
                  className="border-slate-300 focus:border-blue-500"
                  onFocus={() => formData.home_ground && setShowHomeGroundSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowHomeGroundSuggestions(false), 200)}
                />
                
                {showHomeGroundSuggestions && filteredHomeGroundSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1">
                    {filteredHomeGroundSuggestions.map((location, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-sm"
                        onClick={() => {
                          handleInputChange('home_ground', location);
                          setShowHomeGroundSuggestions(false);
                        }}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="training_ground" className="text-sm font-semibold text-slate-700">Training Ground (Optional)</Label>
                <Input
                  id="training_ground"
                  value={formData.training_ground}
                  onChange={(e) => handleInputChange('training_ground', e.target.value)}
                  placeholder="Where you train (can be different from home ground)"
                  className="border-slate-300 focus:border-blue-500"
                  onFocus={() => formData.training_ground && setShowTrainingGroundSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTrainingGroundSuggestions(false), 200)}
                />
                
                {showTrainingGroundSuggestions && filteredTrainingGroundSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1">
                    {filteredTrainingGroundSuggestions.map((location, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-sm"
                        onClick={() => {
                          handleInputChange('training_ground', location);
                          setShowTrainingGroundSuggestions(false);
                        }}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Kit Upload Section */}
            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-slate-700">Team Kits</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KitUploader 
                        label="Home Kit"
                        currentUrl={formData.home_kit_url}
                        onUpload={(url) => handleKitUpload('home', url)}
                    />
                    <KitUploader 
                        label="Away Kit"
                        currentUrl={formData.away_kit_url}
                        onUpload={(url) => handleKitUpload('away', url)}
                    />
                    <KitUploader 
                        label="Third Kit"
                        currentUrl={formData.third_kit_url}
                        onUpload={(url) => handleKitUpload('third', url)}
                    />
                </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Additional Coaches
              </Label>
              <MultiSelect
                options={allUsers}
                selected={formData.additionalCoaches || []}
                onChange={(values) => handleInputChange('additionalCoaches', values || [])}
                className="w-full"
                placeholder="Select coaches..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Team Colors</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_color" className="text-xs font-medium text-slate-600">Primary Color *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="p-1 h-10 w-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#16a34a"
                      className="border-slate-300 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color" className="text-xs font-medium text-slate-600">Secondary Color (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color || "#ffffff"}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="p-1 h-10 w-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#ffffff"
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Team
              </Button>
              
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Team: {team.name}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>This will permanently archive the team. <strong>This action cannot be undone.</strong></p>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="font-medium text-amber-800">What happens to player data?</p>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li>• Player profiles remain intact</li>
                  <li>• All match history and stats are preserved</li>
                  <li>• Parents can still view their child's historical performance</li>
                  <li>• Players become available to join other teams</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTeam}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
