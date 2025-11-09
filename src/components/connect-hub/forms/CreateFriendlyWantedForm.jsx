import React, { useState, useEffect } from 'react';
import { Team } from '@/entities/Team';
import { ConnectPost } from '@/entities/ConnectPost';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateFriendlyWantedForm({ currentUser, onPostCreated }) {
    const [myTeams, setMyTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [formData, setFormData] = useState({
        availability: '',
        venue: 'both',
        ability: 'mid'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadTeams = async () => {
            setIsLoading(true);
            const allTeams = await Team.list();
            const coachTeams = allTeams.filter(team => team.coaches?.includes(currentUser.id));
            setMyTeams(coachTeams);
            setIsLoading(false);
        };
        loadTeams();
    }, [currentUser.id]);

    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeam || !formData.availability) {
            toast.error("Please select a team and enter availability.");
            return;
        }
        setIsSubmitting(true);
        try {
            const postData = {
                post_type: 'friendly_wanted',
                created_by_user_id: currentUser.id,
                created_by_user_name: currentUser.full_name,
                title: `Friendly wanted for ${selectedTeam.name} (${selectedTeam.age_group})`,
                description: `Looking for a friendly match.`,
                age_groups: [selectedTeam.age_group],
                location_text: selectedTeam.home_ground || 'Flexible location',
                team_id: selectedTeam.id,
                specific_fields: {
                    availability_text: formData.availability,
                    venue_preference: formData.venue,
                    team_ability: formData.ability,
                }
            };
            await ConnectPost.create(postData);
toast.success("Friendly request has been published!");
            onPostCreated();
        } catch (error) {
            console.error("Error creating post:", error);
            toast.error("Failed to create post.");
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div className="text-center p-8"><Loader2 className="animate-spin mx-auto"/></div>;
    }

    if (myTeams.length === 0) {
        return <div className="text-center p-8 text-sm text-slate-600">You are not a coach of any teams. Please create a team first.</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <div className="space-y-2">
                <Label>Team</Label>
                <Select onValueChange={id => setSelectedTeam(myTeams.find(t => t.id === id))} required>
                    <SelectTrigger><SelectValue placeholder="Select your team..." /></SelectTrigger>
                    <SelectContent>
                        {myTeams.map(team => (
                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2">
                <Label>Team Ability</Label>
                <Select value={formData.ability} onValueChange={v => handleInputChange('ability', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2">
                <Label>Venue Preference</Label>
                <Select value={formData.venue} onValueChange={v => handleInputChange('venue', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="away">Away</SelectItem>
                        <SelectItem value="both">Home or Away</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Availability</Label>
                <Input
                    value={formData.availability}
                    onChange={e => handleInputChange('availability', e.target.value)}
                    placeholder="e.g., Weekends in July, any Tue/Thu evening"
                    required
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Publish Post
                </Button>
            </div>
        </form>
    );
}