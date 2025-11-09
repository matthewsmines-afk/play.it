import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Goal, Users, Shield, Target } from 'lucide-react';

const STATS = [
  { key: 'goals', label: 'Goal', icon: Goal, color: 'bg-green-100 text-green-700' },
  { key: 'assists', label: 'Assist', icon: Users, color: 'bg-blue-100 text-blue-700' },
  { key: 'saves', label: 'Save', icon: Shield, color: 'bg-purple-100 text-purple-700' },
  { key: 'tackles', label: 'Tackle', icon: Target, color: 'bg-orange-100 text-orange-700' }
];

export default function StatsLogger({ players, onStatUpdate }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedStat, setSelectedStat] = useState('');

  const handleAddStat = () => {
    if (selectedPlayer && selectedStat) {
      onStatUpdate(selectedPlayer, selectedStat, 1);
      // Keep player selected but clear stat for quick logging
      setSelectedStat('');
    }
  };

  const selectedStatObj = STATS.find(s => s.key === selectedStat);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5" />
          Log Player Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Player</label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jersey_number} {player.first_name} {player.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stat Type</label>
              <Select value={selectedStat} onValueChange={setSelectedStat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stat" />
                </SelectTrigger>
                <SelectContent>
                  {STATS.map(stat => (
                    <SelectItem key={stat.key} value={stat.key}>
                      <div className="flex items-center gap-2">
                        <stat.icon className="w-4 h-4" />
                        {stat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAddStat} 
            disabled={!selectedPlayer || !selectedStat}
            className="w-full"
          >
            {selectedStatObj && (
              <selectedStatObj.icon className="w-4 h-4 mr-2" />
            )}
            Log {selectedStat ? selectedStatObj?.label : 'Stat'}
          </Button>

          {/* Quick stat buttons for common actions */}
          <div className="grid grid-cols-2 gap-2">
            {STATS.map(stat => (
              <Button
                key={stat.key}
                variant="outline"
                size="sm"
                className={selectedStat === stat.key ? stat.color : ''}
                onClick={() => setSelectedStat(stat.key)}
              >
                <stat.icon className="w-4 h-4 mr-2" />
                {stat.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}