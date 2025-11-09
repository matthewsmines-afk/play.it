
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Calendar, Clock, MapPin, Users as UsersIcon, ArrowLeft, Plus } from 'lucide-react';
import { Event } from '@/entities/Event';
import { Team } from '@/entities/Team';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

// Safe date formatting function
const safeFormatDateTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

const EVENT_TYPES = [
  { value: "training", label: "Training Session" },
  { value: "match", label: "Match" },
  { value: "tournament", label: "Tournament" },
  { value: "meeting", label: "Team Meeting" },
  { value: "other", label: "Other" }
];

const SPORTS = [
  { value: "football", label: "Football" }
];

const MATCH_FORMATS = {
  football: [
    { value: "3v3", label: "3 vs 3" },
    { value: "5v5", label: "5 vs 5" },
    { value: "7v7", label: "7 vs 7" },
    { value: "9v9", label: "9 vs 9" },
    { value: "11v11", label: "11 vs 11" }
  ]
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    event_type: 'match', // Changed default to 'match'
    sport: 'football',
    match_format: '', // Will be set from team default
    match_type: 'league',
    kit_selection: 'tbc',
    meet_time: '',
    date_time: '',
    duration_minutes: 90,
    location: '',
    what3words: '',
    opponent: '',
    description: '',
    // Removed: temporary_players field
    is_home: true,
    rsvp_required: true,
    team_id: ''
  });

  const [showMeetTime, setShowMeetTime] = useState(false);

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [opponentSuggestions, setOpponentSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showOpponentSuggestions, setShowOpponentSuggestions] = useState(false);

  const loadEventData = useCallback(async (id) => {
    try {
      const eventData = await Event.get(id);
      
      setFormData({
        ...eventData,
        date_time: safeFormatDateTime(eventData.date_time),
        meet_time: safeFormatDateTime(eventData.meet_time),
        kit_selection: eventData.kit_selection || 'tbc',
        // Provide defaults for any fields that might be null/undefined
        event_type: eventData.event_type || 'training',
        sport: eventData.sport || 'football',
        match_format: eventData.match_format || '',
        match_type: eventData.match_type || 'league',
        duration_minutes: eventData.duration_minutes || 90,
        location: eventData.location || '',
        what3words: eventData.what3words || '',
        opponent: eventData.opponent || '',
        description: eventData.description || '',
        // temporary_players: eventData.temporary_players || '', // This field is removed
        is_home: eventData.is_home !== undefined ? eventData.is_home : true,
        rsvp_required: eventData.rsvp_required !== undefined ? eventData.rsvp_required : true,
        team_id: eventData.team_id
      });

      if (eventData.meet_time) {
        setShowMeetTime(true);
      }
    } catch (error) {
      console.error('Error loading event data:', error);
      navigate(createPageUrl('Dashboard'));
    }
  }, [navigate]);

  const loadTeam = useCallback(async (teamId) => {
    try {
      const teamData = await Team.get(teamId);
      setTeam(teamData);
      
      // Set default match format from team's default when loading team
      if (!isEditing && teamData.default_match_format) {
        setFormData(prev => ({
          ...prev,
          match_format: teamData.default_match_format
        }));
      }
    } catch (error) {
      console.error('Error loading team:', error);
      navigate(createPageUrl('Dashboard'));
    }
  }, [navigate, isEditing]);

  const loadSuggestions = useCallback(async () => {
    try {
      const allEvents = await Event.list();
      const locations = [...new Set(allEvents.map(e => e.location).filter(Boolean))];
      const opponents = [...new Set(allEvents.map(e => e.opponent).filter(Boolean))];
      
      setLocationSuggestions(locations);
      setOpponentSuggestions(opponents);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('teamId');
    const currentEventId = urlParams.get('eventId');
    
    if (currentEventId) {
      setEventId(currentEventId);
      setIsEditing(true);
      loadEventData(currentEventId);
    } else {
      // Only set default match format for new events
      if (teamId) {
        loadTeam(teamId);
        loadSuggestions();
      } else {
        navigate(createPageUrl('Dashboard'));
      }
    }
  }, [navigate, loadTeam, loadSuggestions, loadEventData]);

  // This effect handles loading the team when editing an event,
  // especially if the teamId was not initially in the URL.
  useEffect(() => {
    if (isEditing && formData.team_id && !team) {
      loadTeam(formData.team_id);
    }
  }, [isEditing, formData.team_id, team, loadTeam]);

  useEffect(() => {
    // This existing effect needs to remain for the case where meet_time is added manually
    // or changed after initial load (which is handled by loadEventData).
    if (formData.meet_time && !showMeetTime) {
      setShowMeetTime(true);
    }
  }, [formData.meet_time, showMeetTime]);

  const generateTitle = (eventType, opponent, matchFormat) => {
    switch (eventType) {
      case 'training':
        return 'Training Session';
      case 'match':
        return 'Match';
      case 'tournament':
        return 'Tournament';
      case 'meeting':
        return 'Team Meeting';
      case 'other':
        return 'Team Event';
      default:
        return 'Team Event';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team) {
      console.error('Team not loaded, cannot save event.');
      return;
    }

    const title = generateTitle(formData.event_type, formData.opponent, formData.match_format);
    
    const eventData = {
      ...formData,
      title,
      team_id: team.id,
      meet_time: formData.meet_time || null,
      date_time: formData.date_time || null
    };
    
    try {
      if (isEditing) {
        await Event.update(eventId, eventData);
      } else {
        await Event.create(eventData);
      }
      navigate(createPageUrl('Dashboard') + `?teamId=${team.id}`);
    } catch (error) {
      console.error('Error saving event:', error);
      // Optionally show an error message to the user
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      ...(field === 'sport' && !MATCH_FORMATS[value]?.find(f => f.value === prev.match_format) && { match_format: '' })
    }));
    
    if (field === 'location' && value.length > 0) {
      setShowLocationSuggestions(true);
    } else if (field === 'location') {
      setShowLocationSuggestions(false);
    }
    
    if (field === 'opponent' && value.length > 0) {
      setShowOpponentSuggestions(true);
    } else if (field === 'opponent') {
      setShowOpponentSuggestions(false);
    }
  };

  const handleAddMeetTime = () => {
    setShowMeetTime(true);
    // Pre-populate meet time with start time if start time exists
    if (formData.date_time) {
      handleInputChange('meet_time', formData.date_time);
    }
  };

  const handleRemoveMeetTime = () => {
    setShowMeetTime(false);
    handleInputChange('meet_time', ''); // Clear the value
  };

  const selectLocationSuggestion = (location) => {
    setFormData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  const selectOpponentSuggestion = (opponent) => {
    setFormData(prev => ({ ...prev, opponent }));
    setShowOpponentSuggestions(false);
  };

  const filteredLocationSuggestions = locationSuggestions.filter(loc => 
    loc.toLowerCase().includes(formData.location.toLowerCase())
  ).slice(0, 5);

  const filteredOpponentSuggestions = opponentSuggestions.filter(opp => 
    opp.toLowerCase().includes(formData.opponent.toLowerCase())
  ).slice(0, 5);

  const isMatchOrTournament = formData.event_type === 'match' || formData.event_type === 'tournament';

  const getMatchFormatHelperText = () => {
    if (!team?.default_match_format) return null;
    
    if (formData.match_format === team.default_match_format) {
      return (
        <p className="text-xs text-green-600">
          ✓ Matches your team's default format ({team.default_match_format})
        </p>
      );
    } else if (formData.match_format && formData.match_format !== team.default_match_format) {
      return (
        <p className="text-xs text-amber-600">
          ⚠️ Different from team default ({team.default_match_format}). Check your squad tactics are compatible.
        </p>
      );
    }
    
    return null;
  };

  if (!team || (isEditing && !formData.team_id)) {
    // If editing, wait for formData to be loaded to get team_id, then load team
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Dashboard') + `?teamId=${team.id}`)} className="h-11 w-11">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="text-sm text-slate-500 font-light">{team.name}</p>
        </div>
      </div>

      <Card className="card-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-100">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
            <Calendar className="w-5 h-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Type & Sport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="event_type" className="font-semibold text-sm">Event Type *</Label>
                <Select value={formData.event_type} onValueChange={(v) => handleInputChange('event_type', v)} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport" className="font-semibold text-sm">Sport</Label>
                <Select value={formData.sport} onValueChange={(v) => handleInputChange('sport', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS.map(sport => (
                      <SelectItem key={sport.value} value={sport.value}>
                        {sport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Match Format & Kit Selection - only show for matches or tournaments */}
            {isMatchOrTournament && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="match_format" className="font-semibold text-sm">Match Format *</Label>
                  <Select value={formData.match_format} onValueChange={(v) => handleInputChange('match_format', v)} required={isMatchOrTournament}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select match format" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATCH_FORMATS[formData.sport]?.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getMatchFormatHelperText()}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="kit_selection" className="font-semibold text-sm">Kit Selection *</Label>
                  <Select value={formData.kit_selection} onValueChange={(v) => handleInputChange('kit_selection', v)} required={isMatchOrTournament}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select kit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Kit</SelectItem>
                      <SelectItem value="away">Away Kit</SelectItem>
                      <SelectItem value="third">Third Kit</SelectItem>
                      <SelectItem value="tbc">TBC (To Be Confirmed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* New: Match Type Selection */}
            {formData.event_type === 'match' && (
              <div className="space-y-2">
                <Label htmlFor="match_type" className="font-semibold text-sm">Match Type *</Label>
                <Select value={formData.match_type} onValueChange={(v) => handleInputChange('match_type', v)} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select match type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 font-light">
                  Stats from 'League' matches count towards player career totals. 'Friendly' match stats do not.
                </p>
              </div>
            )}

            {/* Times Section */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date_time" className="font-semibold text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Start Time *
                </Label>
                <Input 
                  id="date_time" 
                  type="datetime-local" 
                  value={formData.date_time} 
                  onChange={(e) => handleInputChange('date_time', e.target.value)} 
                  required 
                  className="h-11"
                />
                <p className="text-xs text-slate-500 font-light">When the event actually starts (e.g., kick-off).</p>
              </div>

              {showMeetTime ? (
                <div className="space-y-2 p-4 bg-slate-50 rounded-lg border">
                  <Label htmlFor="meet_time" className="font-semibold text-sm flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    Meet Time
                  </Label>
                  <Input 
                    id="meet_time" 
                    type="datetime-local" 
                    value={formData.meet_time} 
                    onChange={(e) => handleInputChange('meet_time', e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-slate-500 font-light">Optional: Set an earlier time for players to arrive.</p>
                  <Button type="button" variant="link" size="sm" className="p-0 h-auto text-red-600 text-xs" onClick={handleRemoveMeetTime}>
                    Remove Meet Time
                  </Button>
                </div>
              ) : (
                <div>
                  <Button type="button" variant="outline" onClick={handleAddMeetTime} className="text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Earlier Meet Time
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="font-semibold text-sm">Duration (minutes)</Label>
              <Input 
                id="duration_minutes" 
                type="number" 
                value={formData.duration_minutes} 
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))} 
                min="15"
                step="15"
                className="h-11"
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <Label htmlFor="location" className="font-semibold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location/Venue
                </Label>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={(e) => handleInputChange('location', e.target.value)} 
                  placeholder="Training ground, stadium name, etc."
                  className="h-11"
                  onFocus={() => formData.location.length > 0 && setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                />
                
                {/* Location Suggestions Dropdown */}
                {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1">
                    {filteredLocationSuggestions.map((location, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-sm"
                        onClick={() => selectLocationSuggestion(location)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="what3words" className="font-semibold text-sm">What3Words (Optional)</Label>
                <Input 
                  id="what3words" 
                  value={formData.what3words} 
                  onChange={(e) => handleInputChange('what3words', e.target.value)} 
                  placeholder="e.g. ///filled.count.soap"
                  className="h-11"
                />
                <p className="text-xs text-slate-500 font-light">3-word address for precise location</p>
              </div>
            </div>

            {/* Opponent Section for matches/tournaments */}
            {isMatchOrTournament && (
              <div className="space-y-2 relative">
                <Label htmlFor="opponent" className="font-semibold text-sm flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Opponent
                </Label>
                <Input 
                  id="opponent" 
                  value={formData.opponent} 
                  onChange={(e) => handleInputChange('opponent', e.target.value)} 
                  placeholder="Opponent team name"
                  className="h-11"
                  onFocus={() => formData.opponent.length > 0 && setShowOpponentSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowOpponentSuggestions(false), 200)}
                />
                
                {/* Opponent Suggestions Dropdown */}
                {showOpponentSuggestions && filteredOpponentSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1">
                    {filteredOpponentSuggestions.map((opponent, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-sm"
                        onClick={() => selectOpponentSuggestion(opponent)}
                      >
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-3 h-3 text-slate-400" />
                          <span>{opponent}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-sm">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
                placeholder="Additional notes, instructions, or details about this event..."
                className="h-28"
              />
            </div>

            {/* Removed: Temporary Players section */}

            <div className="space-y-3">
              {isMatchOrTournament && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_home" 
                    checked={formData.is_home}
                    onCheckedChange={(checked) => handleInputChange('is_home', checked)}
                  />
                  <Label htmlFor="is_home" className="font-medium text-sm">Home venue</Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rsvp_required" 
                  checked={formData.rsvp_required}
                  onCheckedChange={(checked) => handleInputChange('rsvp_required', checked)}
                />
                <Label htmlFor="rsvp_required" className="font-medium text-sm">Require RSVP from parents</Label>
              </div>
            </div>

            {/* Preview of generated title */}
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
              <Label className="font-semibold text-slate-700 text-sm">Event Title (Auto-generated)</Label>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {generateTitle(formData.event_type, formData.opponent, formData.match_format)}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(createPageUrl('Dashboard') + `?teamId=${team.id}`)}
                className="px-6 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-2 text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
