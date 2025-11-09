import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { X, Trophy, CheckCircle, BarChart2, Loader2 } from 'lucide-react';
import { Event } from '@/entities/Event';
import { MatchEvent } from '@/entities/MatchEvent';
import { Player } from '@/entities/Player';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function EndMatchReviewModal({ event, players, onClose }) {
  const navigate = useNavigate();
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  const handleFinalizeAndReport = async () => {
    setIsFinalizing(true);
    try {
      // 1. Fetch all match events for this game
      const allMatchEvents = await MatchEvent.filter({ event_id: event.id });

      // 2. Aggregate stats
      const finalPlayerStats = {};
      let finalOurScore = 0;

      // Initialize stats objects for all players to ensure they exist
      players.forEach(p => {
        finalPlayerStats[p.id] = { goals: 0, assists: 0, tackles: 0, saves: 0 };
      });

      allMatchEvents.forEach(matchEvent => {
        const { player_id, event_type } = matchEvent;
        if (!player_id) return;

        if (!finalPlayerStats[player_id]) {
          finalPlayerStats[player_id] = { goals: 0, assists: 0, tackles: 0, saves: 0 };
        }

        switch (event_type) {
          case 'goal':
            finalPlayerStats[player_id].goals = (finalPlayerStats[player_id].goals || 0) + 1;
            finalOurScore++;
            break;
          case 'assist':
            finalPlayerStats[player_id].assists = (finalPlayerStats[player_id].assists || 0) + 1;
            break;
          case 'tackle':
            finalPlayerStats[player_id].tackles = (finalPlayerStats[player_id].tackles || 0) + 1;
            break;
          case 'save':
            finalPlayerStats[player_id].saves = (finalPlayerStats[player_id].saves || 0) + 1;
            break;
          default:
            break;
        }
      });

      // 3. Prepare final event data to update
      const updatedEventData = {
        match_status: 'completed',
        // Preserve existing scores and stats in case they were manually adjusted
        our_score: finalOurScore,
        player_stats: finalPlayerStats,
        // Carry over opponent score if it was set
        opponent_score: event.opponent_score || 0,
      };

      // 4. Update the main Event record with aggregated stats
      await Event.update(event.id, updatedEventData);

      toast.success("Match finalized. Redirecting to report...");

      // 5. Navigate to the Match Report page
      navigate(createPageUrl('MatchReport') + `?eventId=${event.id}`);

    } catch (error) {
      console.error("Error finalizing match:", error);
      toast.error("Failed to finalize match. Please try again.");
      setIsFinalizing(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Match Finished!</CardTitle>
              <p className="text-sm text-slate-500">
                Final Score: {event.our_score} - {event.opponent_score}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            The match has ended. You can now proceed to the official match report to confirm stats, add player ratings, and finalize the result.
          </p>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-4">
          <div className="flex justify-end w-full gap-3">
            <Button variant="outline" onClick={onClose}>
              Back to Live Match
            </Button>
            <Button
              onClick={handleFinalizeAndReport}
              disabled={isFinalizing}
              className="btn-primary"
            >
              {isFinalizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Go to Match Report
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}