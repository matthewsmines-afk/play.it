
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Calendar, Clock, MapPin, Users as UsersIcon } from 'lucide-react';
import { Event } from '@/entities/Event';

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
    { value: "5v5", label: "5 vs 5" },
    { value: "7v7", label: "7 vs 7" },
    { value: "11v11", label: "11 vs 11" }
  ]
};

export default function AddEventForm({ teamId, event, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    event_type: 'training',
    sport: 'football', // Added sport
    match_format: '',    // Added match_format
    meet_time: '',
    date_time: '',
    duration_minutes: 90,
    location: '',
    what3words: '',
    opponent: '',
    description: '',
    is_home: true,
    mandatory: false,
    rsvp_required: false // Add rsvp_required
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [opponentSuggestions, setOpponentSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showOpponentSuggestions, setShowOpponentSuggestions] = useState(false);

  useEffect(() => {
    loadSuggestions();
    if (event) {
      setFormData({
        event_type: event.event_type || 'training',
        sport: event.sport || 'football', // Initialize sport from event
        match_format: event.match_format || '', // Initialize match_format from event
        // Ensure null from DB becomes an empty string for the input
        meet_time: event.meet_time || '',
        date_time: event.date_time || '',
        duration_minutes: event.duration_minutes || 90,
        location: event.location || '',
        what3words: event.what3words || '',
        opponent: event.opponent || '',
        description: event.description || '',
        is_home: event.is_home !== undefined ? event.is_home : true,
        mandatory: event.mandatory || false,
        rsvp_required: event.rsvp_required || false // Add rsvp_required
      });
    }
  }, [event]);

  const loadSuggestions = async () => {
    try {
      // Get unique locations from existing events
      const allEvents = await Event.list();
      const locations = [...new Set(allEvents.map(e => e.location).filter(Boolean))];
      const opponents = [...new Set(allEvents.map(e => e.opponent).filter(Boolean))];
      
      setLocationSuggestions(locations);
      setOpponentSuggestions(opponents);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const generateTitle = (eventType, opponent, matchFormat) => {
    switch (eventType) {
      case 'training':
        return 'Training Session';
      case 'match':
        const formatText = matchFormat ? ` (${matchFormat})` : '';
        return opponent ? `Match vs ${opponent}${formatText}` : `Match${formatText}`;
      case 'tournament':
        return opponent ? `Tournament vs ${opponent}` : 'Tournament';
      case 'meeting':
        return 'Team Meeting';
      case 'other':
        return 'Team Event';
      default:
        return 'Team Event';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = generateTitle(formData.event_type, formData.opponent, formData.match_format); // Pass match_format to title generator
    
    const eventData = {
      ...formData,
      title,
      // If the input is an empty string, store it as null in the database
      meet_time: formData.meet_time ? formData.meet_time : null,
      date_time: formData.date_time ? formData.date_time : null
    };
    
    onSubmit(eventData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset match_format if sport changes and the new sport doesn't have the current format
      ...(field === 'sport' && !MATCH_FORMATS[value]?.find(f => f.value === prev.match_format) && { match_format: '' })
    }));
    
    // Show suggestions when typing in location or opponent fields
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

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {event ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            {/* Event Type & Sport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="event_type" className="font-semibold text-lg">Event Type *</Label>
                <Select value={formData.event_type} onValueChange={(v) => handleInputChange('event_type', v)} required>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-lg py-3">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport" className="font-semibold text-lg">Sport</Label>
                <Select value={formData.sport} onValueChange={(v) => handleInputChange('sport', v)}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS.map(sport => (
                      <SelectItem key={sport.value} value={sport.value} className="text-lg py-3">
                        {sport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Match Format - only show for matches or tournaments */}
            {isMatchOrTournament && (
              <div className="space-y-2">
                <Label htmlFor="match_format" className="font-semibold text-lg">Match Format *</Label>
                <Select value={formData.match_format} onValueChange={(v) => handleInputChange('match_format', v)} required={isMatchOrTournament}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Select match format" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATCH_FORMATS[formData.sport]?.map(format => (
                      <SelectItem key={format.value} value={format.value} className="text-lg py-3">
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Times Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="meet_time" className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Meet Time (Optional)
                </Label>
                <Input 
                  id="meet_time" 
                  type="datetime-local" 
                  value={formData.meet_time} 
                  onChange={(e) => handleInputChange('meet_time', e.target.value)}
                />
                <p className="text-xs text-slate-500">When players should arrive</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_time" className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Time *
                </Label>
                <Input 
                  id="date_time" 
                  type="datetime-local" 
                  value={formData.date_time} 
                  onChange={(e) => handleInputChange('date_time', e.target.value)} 
                  required 
                />
                <p className="text-xs text-slate-500">When the event actually starts</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="font-semibold">Duration (minutes)</Label>
              <Input 
                id="duration_minutes" 
                type="number" 
                value={formData.duration_minutes} 
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))} 
                min="15"
                step="15"
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <Label htmlFor="location" className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location/Venue
                </Label>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={(e) => handleInputChange('location', e.target.value)} 
                  placeholder="Training ground, stadium name, etc."
                  onFocus={() => formData.location.length > 0 && setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                />
                
                {/* Location Suggestions Dropdown */}
                {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1">
                    {filteredLocationSuggestions.map((location, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        onClick={() => selectLocationSuggestion(location)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="what3words" className="font-semibold">What3Words (Optional)</Label>
                <Input 
                  id="what3words" 
                  value={formData.what3words} 
                  onChange={(e) => handleInputChange('what3words', e.target.value)} 
                  placeholder="e.g. ///filled.count.soap"
                />
                <p className="text-xs text-slate-500">3-word address for precise location</p>
              </div>
            </div>

            {/* Opponent Section for matches/tournaments */}
            {isMatchOrTournament && (
              <div className="space-y-2 relative">
                <Label htmlFor="opponent" className="font-semibold flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Opponent
                </Label>
                <Input 
                  id="opponent" 
                  value={formData.opponent} 
                  onChange={(e) => handleInputChange('opponent', e.target.value)} 
                  placeholder="Opponent team name"
                  onFocus={() => formData.opponent.length > 0 && setShowOpponentSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowOpponentSuggestions(false), 200)}
                />
                
                {/* Opponent Suggestions Dropdown */}
                {showOpponentSuggestions && filteredOpponentSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1">
                    {filteredOpponentSuggestions.map((opponent, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        onClick={() => selectOpponentSuggestion(opponent)}
                      >
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-slate-400" />
                          <span>{opponent}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
                placeholder="Additional notes, instructions, or details about this event..."
                className="h-24"
              />
            </div>

            <div className="space-y-4">
              {isMatchOrTournament && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_home" 
                    checked={formData.is_home}
                    onCheckedChange={(checked) => handleInputChange('is_home', checked)}
                  />
                  <Label htmlFor="is_home" className="font-medium">Home venue</Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mandatory" 
                  checked={formData.mandatory}
                  onCheckedChange={(checked) => handleInputChange('mandatory', checked)}
                />
                <Label htmlFor="mandatory" className="font-medium">Mandatory attendance</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rsvp_required" 
                  checked={formData.rsvp_required}
                  onCheckedChange={(checked) => handleInputChange('rsvp_required', checked)}
                />
                <Label htmlFor="rsvp_required" className="font-medium">Require RSVP from parents</Label>
              </div>
            </div>

            {/* Preview of generated title */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <Label className="font-semibold text-slate-700">Event Title (Auto-generated)</Label>
              <p className="text-lg font-medium text-slate-800 mt-1">
                {generateTitle(formData.event_type, formData.opponent, formData.match_format)} {/* Pass match_format */}
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600">
                <Save className="w-4 h-4 mr-2" />
                {event ? 'Save Changes' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
