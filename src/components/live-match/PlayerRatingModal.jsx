import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star, Users } from 'lucide-react';

const RatingStars = ({ rating, onRatingChange, playerId }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          className={`w-6 h-6 transition-colors ${
            star <= (hoverRating || rating) 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRatingChange(playerId, star)}
        >
          <Star className="w-full h-full" />
        </button>
      ))}
      <span className="ml-2 font-bold text-lg min-w-[30px]">
        {rating || 0}/10
      </span>
    </div>
  );
};

export default function PlayerRatingModal({ participatingPlayers, existingRatings = {}, onSave, onClose }) {
  const [ratings, setRatings] = useState(existingRatings);

  const handleRatingChange = (playerId, rating) => {
    setRatings(prev => ({ ...prev, [playerId]: rating }));
  };

  const handleSave = () => {
    onSave(ratings);
  };

  const ratedCount = Object.keys(ratings).length;
  const totalPlayers = participatingPlayers.length;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Rate Player Performances
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Rate each player's performance in this match (1-10 scale)
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium">
              Rated: {ratedCount} / {totalPlayers} players
            </p>
          </div>

          {participatingPlayers.map(player => (
            <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {player.jersey_number || '?'}
                </div>
                <div>
                  <p className="font-semibold">{player.first_name} {player.last_name}</p>
                  <p className="text-xs text-slate-500">
                    {player.positions?.join(', ') || 'Player'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <RatingStars
                  rating={ratings[player.id] || 0}
                  onRatingChange={handleRatingChange}
                  playerId={player.id}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Skip Ratings
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={ratedCount === 0}
            className="bg-gradient-to-r from-blue-600 to-blue-700"
          >
            Continue ({ratedCount} rated)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}