
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Player } from '@/entities/Player';
import { Event } from '@/entities/Event';
import { X, Save, Star, Trophy, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from "date-fns";
import { toast } from 'sonner'; // Assuming sonner for toasts
import { motion } from 'framer-motion'; // Assuming framer-motion for animations

const STAT_TYPES = [
  { value: 'goals', label: 'Goals' },
  { value: 'assists', label: 'Assists' },
  { value: 'tackles', label: 'Tackles' },
  { value: 'saves', label: 'Saves' },
];

export default function LogMatchStatsForm({ event, players: teamPlayers, onSave, onCancel, isPage = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [originalStats, setOriginalStats] = useState(null); // To store stats before editing for delta calculation
  const [isSaving, setIsSaving] = useState(false); // New state for saving status

  const [ourScore, setOurScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [playerStats, setPlayerStats] = useState({});
  const [playerRatings, setPlayerRatings] = useState({});
  const [motmPlayerId, setMotmPlayerId] = useState(null);

  useEffect(() => {
    // If event is not yet loaded, skip initialization
    if (!event) return; 

    // Determine if we are editing an existing completed match or logging a new one
    const isEventCompleted = event.match_status === 'completed';
    setIsEditing(isEventCompleted);

    // Initialize scores
    const currentOurScore = event.our_score || 0;
    const currentOpponentScore = event.opponent_score || 0;
    setOurScore(currentOurScore);
    setOpponentScore(currentOpponentScore);

    // Initialize MOTM
    const currentMotmPlayerId = event.man_of_the_match_player_id || null;
    setMotmPlayerId(currentMotmPlayerId || ''); // Set to '' for Select component default

    // Initialize player ratings
    let currentPlayerRatings = JSON.parse(JSON.stringify(event.player_ratings || {})); // Deep copy
    // Ensure all teamPlayers have a rating entry, defaulting to ''
    teamPlayers.forEach(p => {
        if (currentPlayerRatings[p.id] === undefined || currentPlayerRatings[p.id] === null) {
            currentPlayerRatings[p.id] = ''; 
        }
    });
    setPlayerRatings(currentPlayerRatings);

    // --- Player Stats Initialization ---
    // Load existing stats from event.player_stats (if any)
    const existingStatsFromEvent = event.player_stats || {};
    
    // Determine which match events to use (prefer final_match_events)
    let matchEvents = [];
    if (event.final_match_events && event.final_match_events.length > 0) {
      matchEvents = event.final_match_events;
    } else if (event.match_events && event.match_events.length > 0) {
      matchEvents = event.match_events;
    }
    
    let finalPlayerStats = {}; // This will be the state for playerStats

    if (Object.keys(existingStatsFromEvent).length > 0) {
      // If player_stats explicitly exists, use it. This indicates manual logging or a previous edit.
      finalPlayerStats = JSON.parse(JSON.stringify(existingStatsFromEvent)); // Deep copy
    } else if (matchEvents.length > 0) {
      // If player_stats is empty but we have match events, calculate from events.
      teamPlayers.forEach(p => {
        finalPlayerStats[p.id] = { goals: 0, assists: 0, tackles: 0, saves: 0, yellow_cards: 0, red_cards: 0 };
      });

      matchEvents.forEach(matchEvent => {
        if (matchEvent.player_id && finalPlayerStats[matchEvent.player_id]) {
          switch (matchEvent.event_type) {
            case 'goal':
              finalPlayerStats[matchEvent.player_id].goals++;
              break;
            case 'assist':
              finalPlayerStats[matchEvent.player_id].assists++;
              break;
            case 'tackle':
              finalPlayerStats[matchEvent.player_id].tackles++;
              break;
            case 'save':
              finalPlayerStats[matchEvent.player_id].saves++;
              break;
            case 'yellow_card':
              finalPlayerStats[matchEvent.player_id].yellow_cards++;
              break;
            case 'red_card':
              finalPlayerStats[matchEvent.player_id].red_cards++;
              break;
          }
        }
      });
    } else {
        // If neither player_stats nor match events exist, initialize with zeros for all players
        teamPlayers.forEach(p => {
            finalPlayerStats[p.id] = { goals: 0, assists: 0, tackles: 0, saves: 0, yellow_cards: 0, red_cards: 0 };
        });
    }
    // Ensure all players are represented in finalPlayerStats, even if they had no events/stats
    teamPlayers.forEach(p => {
        if (!finalPlayerStats[p.id]) {
            finalPlayerStats[p.id] = { goals: 0, assists: 0, tackles: 0, saves: 0, yellow_cards: 0, red_cards: 0 };
        }
    });

    setPlayerStats(finalPlayerStats);
    // --- End Player Stats Initialization ---

    // Store the original state for delta calculation during edits
    const initialStatsSnapshot = {
        our_score: currentOurScore,
        opponent_score: currentOpponentScore,
        man_of_the_match_player_id: currentMotmPlayerId,
        player_stats: JSON.parse(JSON.stringify(finalPlayerStats)), // Deep copy
        player_ratings: JSON.parse(JSON.stringify(currentPlayerRatings)), // Deep copy
    };
    setOriginalStats(initialStatsSnapshot);
  }, [event, teamPlayers]); // Depend on event and teamPlayers

  const handleStatChange = (playerId, stat, value) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [stat]: parseInt(value, 10) || 0
      }
    }));
  };

  const handleRatingChange = (playerId, value) => {
    const val = value === '' ? '' : parseInt(value, 10);
    // Optional: add validation for 1-10 range if value is not empty
    if (value !== '' && (isNaN(val) || val < 1 || val > 10)) {
      setPlayerRatings(prev => ({
        ...prev,
        [playerId]: '' // Clear if invalid or outside range
      }));
    } else {
      setPlayerRatings(prev => ({
        ...prev,
        [playerId]: val
      }));
    }
  };

  const handleSaveStats = async () => {
    setIsSaving(true);
    try {
      if (!originalStats) {
        toast.error("Error: Original stats not loaded.");
        setIsSaving(false);
        return;
      }

      const playerUpdatePromises = [];

      // Iterate over all players to calculate deltas
      for (const player of teamPlayers) {
        const fullPlayer = await Player.get(player.id); // Get current player data from DB
        const updatedPlayerData = {};
        let needsUpdate = false;

        const oldPlayerStats = originalStats.player_stats?.[player.id] || { goals: 0, assists: 0, tackles: 0, saves: 0 };
        const newPlayerStats = playerStats[player.id] || { goals: 0, assists: 0, tackles: 0, saves: 0 };
        
        // Stat Deltas (only for stats present in STAT_TYPES)
        STAT_TYPES.forEach(statType => {
          const statKey = statType.value;
          const oldVal = oldPlayerStats[statKey] || 0;
          const newVal = newPlayerStats[statKey] || 0;
          const delta = newVal - oldVal;

          if (delta !== 0) {
            updatedPlayerData[`total_${statKey}`] = (fullPlayer[`total_${statKey}`] || 0) + delta;
            needsUpdate = true;
          }
        });
        
        // MOTM Delta
        const wasOriginalMotm = originalStats.man_of_the_match_player_id === player.id;
        const isNewMotm = motmPlayerId === player.id;
        const motmDelta = (isNewMotm ? 1 : 0) - (wasOriginalMotm ? 1 : 0);
        if (motmDelta !== 0) {
          updatedPlayerData.man_of_the_match_awards = (fullPlayer.man_of_the_match_awards || 0) + motmDelta;
          needsUpdate = true;
        }

        // Rating Delta
        const oldPlayerRating = originalStats.player_ratings?.[player.id];
        const newPlayerRating = playerRatings[player.id]; // Can be '' (empty string) if cleared, or actual number

        let ratingPointsDelta = 0;
        let ratedMatchesDelta = 0;

        // Convert potential empty string to null/undefined for consistent logic
        const oldRatingValue = oldPlayerRating === '' || oldPlayerRating === null ? undefined : oldPlayerRating;
        const newRatingValue = newPlayerRating === '' || newPlayerRating === null ? undefined : newPlayerRating;

        if (newRatingValue !== undefined) { // New rating exists
            if (oldRatingValue !== undefined) { // Old rating exists too, so it's a change
                ratingPointsDelta = newRatingValue - oldRatingValue;
            } else { // New rating added where there was none
                ratingPointsDelta = newRatingValue;
                ratedMatchesDelta = 1;
            }
        } else if (oldRatingValue !== undefined) { // Old rating exists but new one doesn't (cleared)
            ratingPointsDelta = -oldRatingValue;
            ratedMatchesDelta = -1;
        }

        if (ratingPointsDelta !== 0 || ratedMatchesDelta !== 0) {
            const newTotalRatingPoints = (fullPlayer.total_rating_points || 0) + ratingPointsDelta;
            const newRatedMatches = (fullPlayer.rated_matches || 0) + ratedMatchesDelta;
            
            updatedPlayerData.total_rating_points = newTotalRatingPoints;
            updatedPlayerData.rated_matches = newRatedMatches;
            updatedPlayerData.average_rating = newRatedMatches > 0 ? parseFloat((newTotalRatingPoints / newRatedMatches).toFixed(1)) : null;
            needsUpdate = true;
        }

        // Games played logic: only when first marking as completed, not on subsequent edits.
        // `isEditing` being false means `event.match_status` was not 'completed' when the form loaded.
        if (!isEditing && (event.player_minutes?.[player.id] || 0) > 0) {
          updatedPlayerData.games_played = (fullPlayer.games_played || 0) + 1;
          needsUpdate = true;
        }

        if (needsUpdate) {
          playerUpdatePromises.push(Player.update(player.id, updatedPlayerData));
        }
      }

      // Prepare event update data
      const finalEventData = {
        our_score: ourScore,
        opponent_score: opponentScore,
        player_stats: playerStats, // This will include yellow/red cards if calculated from events
        player_ratings: playerRatings,
        man_of_the_match_player_id: motmPlayerId,
        match_status: 'completed', // Ensure it's marked as completed
      };

      await Promise.all([
        Event.update(event.id, finalEventData),
        ...playerUpdatePromises
      ]);
      
      toast.success("Match report saved successfully!");
      onSave();
    } catch (error) {
      console.error("Error saving match stats:", error);
      toast.error("Failed to save match report.");
    } finally {
      setIsSaving(false);
    }
  };

  const FormContent = (
    <div className="space-y-6">
      {/* Final Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Final Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="ourScore">{event.team_name || 'Our Score'}</Label>
              <Input id="ourScore" type="number" value={ourScore} onChange={(e) => setOurScore(parseInt(e.target.value, 10) || 0)} required className="text-2xl h-12 text-center font-bold"/>
            </div>
            <span className="text-2xl font-bold mt-5">:</span>
            <div className="flex-1 space-y-1">
              <Label htmlFor="opponentScore">{event.opponent}</Label>
              <Input id="opponentScore" type="number" value={opponentScore} onChange={(e) => setOpponentScore(parseInt(e.target.value, 10) || 0)} required className="text-2xl h-12 text-center font-bold"/>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Man of the Match Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500"/> Man of the Match</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={motmPlayerId || ''} onValueChange={setMotmPlayerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a player..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None</SelectItem> {/* Changed value to empty string for consistency with motmPlayerId state */}
              {teamPlayers.map(player => (
                <SelectItem key={player.id} value={player.id}>
                  #{player.jersey_number} - {player.first_name} {player.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Player Performance Card */}
      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Player Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {teamPlayers.map(player => (
              <div key={player.id} className="p-4 border rounded-lg bg-slate-50/50">
                <p className="font-bold mb-3 text-slate-800">#{player.jersey_number} {player.first_name} {player.last_name}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STAT_TYPES.map(stat => (
                    <div key={stat.value} className="space-y-1">
                      <Label htmlFor={`${player.id}-${stat.value}`} className="text-xs">{stat.label}</Label>
                      <Input 
                        id={`${player.id}-${stat.value}`}
                        type="number"
                        min="0"
                        value={playerStats[player.id]?.[stat.value] || 0}
                        onChange={(e) => handleStatChange(player.id, stat.value, e.target.value)}
                        className="h-9"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                       <Label htmlFor={`${player.id}-rating`} className="text-xs flex items-center gap-1"><Star className="w-3 h-3"/> Rating (1-10)</Label>
                       <Input 
                         id={`${player.id}-rating`}
                         type="number"
                         min="1" max="10"
                         value={playerRatings[player.id] !== undefined ? playerRatings[player.id] : ''}
                         onChange={(e) => handleRatingChange(player.id, e.target.value)}
                         placeholder="N/A"
                         className="h-9"
                       />
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
  
  if (isPage) {
    return (
        <div className="w-full">
            {FormContent}
            <div className="flex justify-end w-full gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white/80 backdrop-blur-sm py-3">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
                </Button>
                <Button onClick={handleSaveStats} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Report</>}
                </Button>
            </div>
        </div>
    );
  }

  // Original modal rendering logic
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel} // Close modal on backdrop click
    >
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{isEditing ? 'Edit Match Report' : 'Log Final Match Stats'}</CardTitle>
            <p className="text-sm text-slate-500">vs {event.opponent} on {format(new Date(event.date_time), 'PPP')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-6">
          {FormContent}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t pt-4">
          <div className="flex justify-end w-full gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveStats} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> {isEditing ? 'Save Changes' : 'Finalize Match'}</>}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
