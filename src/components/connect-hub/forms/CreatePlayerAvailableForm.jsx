import React, { useState, useEffect, useCallback } from 'react';
import { Player } from '@/entities/Player';
import { ConnectPost } from '@/entities/ConnectPost';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePlayerAvailableForm({ currentUser, onPostCreated }) {
    const [myPlayers, setMyPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadPlayers = async () => {
            setIsLoading(true);
            try {
                const players = await Player.filter({ parent_user_id: currentUser.id });
                setMyPlayers(players);
            } catch (error) {
                console.error("Error loading players:", error);
            }
            setIsLoading(false);
        };
        loadPlayers();
    }, [currentUser.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPlayer || !description || !location) {
            toast.error("Please fill all fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            const postData = {
                post_type: 'player_available',
                created_by_user_id: currentUser.id,
                created_by_user_name: currentUser.full_name,
                title: `U${selectedPlayer.age_group} ${selectedPlayer.main_position} looking for a team`,
                description,
                age_groups: [selectedPlayer.age_group],
                location_text: location,
                player_id: selectedPlayer.id,
                specific_fields: {
                    positions_needed: [selectedPlayer.main_position]
                }
            };

            await ConnectPost.create(postData);
            toast.success("Your post has been published!");
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

    if (myPlayers.length === 0) {
        return <div className="text-center p-8 text-sm text-slate-600">You do not have any players linked to your parent account. Please add a player first.</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <div className="space-y-2">
                <Label htmlFor="player">Which player is available?</Label>
                <Select onValueChange={id => setSelectedPlayer(myPlayers.find(p => p.id === id))} required>
                    <SelectTrigger><SelectValue placeholder="Select your player..." /></SelectTrigger>
                    <SelectContent>
                        {myPlayers.map(player => (
                            <SelectItem key={player.id} value={player.id}>
                                {player.first_name} {player.last_name} (U{player.age_group})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {selectedPlayer && (
                 <div className="p-3 bg-slate-50 rounded-md text-sm">
                    <p><strong>Position:</strong> {selectedPlayer.main_position}</p>
                    <p><strong>Age Group:</strong> U{selectedPlayer.age_group}</p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., 'Looking for a competitive team for the new season. Strong defender, great attitude.'"
                    required
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="location">General Location</Label>
                <Input
                    id="location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., South Manchester"
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