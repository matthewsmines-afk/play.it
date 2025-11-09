import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal } from 'lucide-react';

const POST_TYPES = [
    { value: 'all', label: 'All Post Types' },
    { value: 'player_available', label: 'Players Available' },
    { value: 'team_recruiting', label: 'Teams Recruiting' },
    { value: 'friendly_wanted', label: 'Friendlies Wanted' },
    { value: 'equipment_sale', label: 'Equipment For Sale' },
    { value: 'coaching_session', label: 'Coaching Sessions' },
    { value: 'ground_share', label: 'Ground Sharing' },
    { value: 'tournament_announcement', label: 'Tournaments' },
];

const AGE_GROUPS = [
  "U4", "U5", "U6", "U7", "U8", "U9", "U10", "U11", "U12", 
  "U13", "U14", "U15", "U16", "U17", "U18", "U19", "U20", 
  "U21", "U23", "Senior", "Mixed Age"
];

export default function FilterBar({ filters, onFilterChange }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleFilter = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const resetFilters = () => {
        onFilterChange({
            postType: 'all',
            location: '',
            ageGroups: []
        });
    };

    return (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center md:hidden mb-4">
                <h3 className="font-semibold text-slate-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    {isExpanded ? 'Hide' : 'Show'}
                </Button>
            </div>
            <div className={`${isExpanded ? 'block' : 'hidden'} md:grid md:grid-cols-3 gap-4`}>
                {/* Post Type */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Post Type</label>
                    <Select value={filters.postType} onValueChange={v => handleFilter('postType', v)}>
                        <SelectTrigger className="bg-white text-slate-900">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {POST_TYPES.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Location</label>
                    <Input 
                        placeholder="City or Postcode..."
                        value={filters.location}
                        onChange={e => handleFilter('location', e.target.value)}
                        className="bg-white text-slate-900"
                    />
                </div>

                {/* Age Groups */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Age Groups</label>
                    <Select 
                        value={filters.ageGroups.length > 0 ? filters.ageGroups[0] : 'all'} 
                        onValueChange={v => handleFilter('ageGroups', v === 'all' ? [] : [v])}
                    >
                        <SelectTrigger className="bg-white text-slate-900">
                            <SelectValue placeholder="All Ages" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Age Groups</SelectItem>
                            {AGE_GROUPS.map(ag => <SelectItem key={ag} value={ag}>{ag}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="col-span-full flex justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        <X className="w-4 h-4 mr-2" />
                        Reset Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}