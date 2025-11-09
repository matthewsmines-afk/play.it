import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Save } from 'lucide-react';

const AGE_GROUPS = [
  'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 
  'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21', 'Senior'
];

export default function EditPostModal({ isOpen, post, onClose, onSubmit, teams, players }) {
  const [formData, setFormData] = useState({
    title: post.title || '',
    description: post.description || '',
    location_text: post.location_text || '',
    age_groups: post.age_groups || [],
    specific_fields: post.specific_fields || {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecificFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specific_fields: {
        ...prev.specific_fields,
        [field]: value
      }
    }));
  };

  // Render specific fields based on post type
  const renderSpecificFields = () => {
    switch (post.post_type) {
      case 'player_available':
      case 'team_recruiting':
        return (
          <div className="space-y-2">
            <Label>Positions Needed/Available</Label>
            <Input
              value={formData.specific_fields.positions_needed?.join(', ') || ''}
              onChange={(e) => handleSpecificFieldChange('positions_needed', e.target.value.split(',').map(s => s.trim()))}
              placeholder="e.g., GK, CB, ST"
            />
          </div>
        );

      case 'player_looking_for_team':
        return (
          <div className="space-y-2">
            <Label>Availability</Label>
            <Textarea
              value={formData.specific_fields.availability_text || ''}
              onChange={(e) => handleSpecificFieldChange('availability_text', e.target.value)}
              placeholder="When are you available?"
            />
          </div>
        );

      case 'friendly_wanted':
        return (
          <>
            <div className="space-y-2">
              <Label>Venue Preference</Label>
              <Select
                value={formData.specific_fields.venue_preference || 'both'}
                onValueChange={(value) => handleSpecificFieldChange('venue_preference', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                  <SelectItem value="both">Either</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team Ability</Label>
              <Select
                value={formData.specific_fields.team_ability || 'mid'}
                onValueChange={(value) => handleSpecificFieldChange('team_ability', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Beginner/Recreational</SelectItem>
                  <SelectItem value="mid">Intermediate</SelectItem>
                  <SelectItem value="high">Advanced/Competitive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'equipment_sale':
        return (
          <>
            <div className="space-y-2">
              <Label>Price (£)</Label>
              <Input
                type="number"
                value={formData.specific_fields.price || ''}
                onChange={(e) => handleSpecificFieldChange('price', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={formData.specific_fields.item_condition || 'used_good'}
                onValueChange={(value) => handleSpecificFieldChange('item_condition', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used_like_new">Used - Like New</SelectItem>
                  <SelectItem value="used_good">Used - Good</SelectItem>
                  <SelectItem value="used_fair">Used - Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'tournament_announcement':
        return (
          <>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.specific_fields.tournament_start_date || ''}
                onChange={(e) => handleSpecificFieldChange('tournament_start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.specific_fields.tournament_end_date || ''}
                onChange={(e) => handleSpecificFieldChange('tournament_end_date', e.target.value)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="e.g., U16 Goalkeeper Available"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              rows={4}
              placeholder="Provide details about your post..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location_text}
              onChange={(e) => handleChange('location_text', e.target.value)}
              placeholder="e.g., Manchester, UK"
            />
          </div>

          <div className="space-y-2">
            <Label>Age Groups</Label>
            <MultiSelect
              options={AGE_GROUPS.map(age => ({ value: age, label: age }))}
              selected={formData.age_groups}
              onChange={(selected) => handleChange('age_groups', selected)}
              placeholder="Select age groups..."
            />
          </div>

          {renderSpecificFields()}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}