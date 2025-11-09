import React, { useState, useEffect } from 'react';
import { Team } from '@/entities/Team';
import { ConnectPost } from '@/entities/ConnectPost';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

export default function CreateTeamRecruitingForm({ currentUser, onPostCreated }) {
    const [myTeams, setMyTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [positions, setPositions] = useState([]);
    const [description, setDescription] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeam || positions.length === 0 || !description) {
            toast.error("Please fill all fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            const postData = {
                post_type: 'team_recruiting',
                created_by_user_id: currentUser.id,
                created_by_user_name: currentUser.full_name,
                title: `${selectedTeam.name} is recruiting!`,
                description,
                age_groups: [selectedTeam.age_group],
                location_text: selectedTeam.home_ground || 'Location not set',
                team_id: selectedTeam.id,
                specific_fields: {
                    positions_needed: positions,
                }
            };
            await ConnectPost.create(postData);
            toast.success("Recruitment post has been published!");
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
                <Label htmlFor="team">Which team is recruiting?</Label>
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
                <Label htmlFor="positions">What positions are you looking for?</Label>
                <MultiSelect
                    options={POSITIONS.map(p => ({ value: p, label: p }))}
                    selected={positions}
                    onChange={setPositions}
                    placeholder="Select positions..."
                    className="w-full"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">More Details</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., 'We are an ambitious team looking for committed players for the upcoming season. Trials will be held...'"
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