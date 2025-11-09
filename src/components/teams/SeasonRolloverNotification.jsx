import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Trophy, Users, ArrowRight, X } from 'lucide-react';
import { Team } from '@/entities/Team';
import { toast } from 'sonner';

export default function SeasonRolloverNotification({ 
  rolloverData, 
  onDismiss, 
  onRefreshTeams 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [processedTeams, setProcessedTeams] = useState(new Set());

  if (!rolloverData || !rolloverData.age_group_updates || rolloverData.age_group_updates.length === 0) {
    return null;
  }

  const handleUpdateTeamAgeGroup = async (teamId, newAgeGroup) => {
    setIsUpdating(true);
    try {
      await Team.update(teamId, { age_group: newAgeGroup });
      setProcessedTeams(prev => new Set([...prev, teamId]));
      toast.success(`Team age group updated to ${newAgeGroup}`);
      
      if (onRefreshTeams) {
        onRefreshTeams();
      }
    } catch (error) {
      console.error('Error updating team age group:', error);
      toast.error('Failed to update team age group');
    }
    setIsUpdating(false);
  };

  const handleSkipTeam = (teamId) => {
    setProcessedTeams(prev => new Set([...prev, teamId]));
    toast.info('Age group update skipped');
  };

  const pendingUpdates = rolloverData.age_group_updates.filter(
    update => !processedTeams.has(update.team_id) && !update.coach_confirmed
  );

  const completedUpdates = rolloverData.age_group_updates.filter(
    update => processedTeams.has(update.team_id) || update.coach_confirmed
  );

  if (pendingUpdates.length === 0 && completedUpdates.length > 0) {
    return (
      <Alert className="mb-6 bg-green-50 border-green-200">
        <Trophy className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Season {rolloverData.season} Update Complete!</strong> 
          All team age groups have been reviewed. Your stats have been archived and the new season has begun.
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="ml-4 text-green-600 hover:text-green-700"
          >
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (pendingUpdates.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Calendar className="w-5 h-5" />
            New Season: {rolloverData.season}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-orange-700 mt-2">
          The new football season has started! Please review the suggested age group updates for your teams.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingUpdates.map((update) => (
          <div 
            key={update.team_id} 
            className="bg-white p-4 rounded-lg border border-orange-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-slate-800">Team Update Needed</h3>
                  <p className="text-sm text-slate-600">Team ID: {update.team_id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="text-slate-600">
                {update.old_age_group}
              </Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="secondary" className="text-orange-700 bg-orange-100">
                {update.new_age_group} (Suggested)
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleUpdateTeamAgeGroup(update.team_id, update.new_age_group)}
                disabled={isUpdating}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                Update to {update.new_age_group}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSkipTeam(update.team_id)}
                disabled={isUpdating}
                size="sm"
              >
                Keep {update.old_age_group}
              </Button>
            </div>
          </div>
        ))}

        <div className="text-xs text-orange-600 bg-orange-100 p-3 rounded-lg">
          <strong>What happened:</strong> Player stats from last season have been archived. 
          Career totals are preserved, but current season stats have reset to zero for fresh tracking.
        </div>
      </CardContent>
    </Card>
  );
}