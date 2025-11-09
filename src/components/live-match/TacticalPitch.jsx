import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import PitchDisplay from '../shared/PitchDisplay';

const PlayerToken = React.memo(({ player, team }) => {
  const primaryColor = team?.primary_color || '#3b82f6';
  const secondaryColor = team?.secondary_color || '#ffffff';

  return (
    <div className="flex flex-col items-center group cursor-pointer w-14">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md mb-1"
        style={{ backgroundColor: primaryColor, color: secondaryColor }}
      >
        <span className="font-bold text-sm">{player.jersey_number || '?'}</span>
      </div>
      <p className="text-white text-xs font-semibold truncate bg-black/40 px-1.5 py-0.5 rounded-md w-full text-center">
        {player.last_name}
      </p>
    </div>
  );
});

export default function TacticalPitch({ players, formationPositions, team }) {
  const playerMap = useMemo(() => {
    if (!players || !Array.isArray(players)) {
      return {};
    }
    return players.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {});
  }, [players]);

  // Add safety check for formationPositions as well
  if (!formationPositions || !Array.isArray(formationPositions)) {
    return (
      <PitchDisplay>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-sm">No formation positions available</p>
        </div>
      </PitchDisplay>
    );
  }

  return (
    <PitchDisplay>
      {formationPositions.map((pos) => {
        const player = playerMap[pos.playerId];
        if (!player) return null;

        return (
          <div
            key={pos.playerId}
            className="absolute transition-all duration-500"
            style={{
              top: pos.y,
              left: pos.x,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <PlayerToken player={player} team={team} />
          </div>
        );
      })}
    </PitchDisplay>
  );
}