import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function SeasonRolloverNotification({ rolloverData, onDismiss, onRefreshTeams }) {
  if (!rolloverData || !rolloverData.age_group_updates) return null;

  const pendingUpdates = rolloverData.age_group_updates.filter(update => !update.coach_confirmed);
  
  if (pendingUpdates.length === 0) return null;

  const handleConfirmAgeGroups = async () => {
    try {
      // In a real implementation, you'd update the SeasonRollover entity to mark confirmations
      // For now, we'll just refresh the teams and dismiss
      if (onRefreshTeams) {
        await onRefreshTeams();
      }
      onDismiss();
    } catch (error) {
      console.error('Error confirming age groups:', error);
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-200 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-blue-800">New Season Started - Age Group Updates</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-blue-700 mb-4">
          Welcome to the {rolloverData.season} season! Some teams may need age group updates:
        </p>
        
        <div className="space-y-2 mb-4">
          {pendingUpdates.map((update, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
              <div>
                <span className="font-medium">Team needs update:</span>
                <Badge variant="outline" className="ml-2">{update.old_age_group}</Badge>
                <span className="mx-2">→</span>
                <Badge variant="default" className="bg-blue-600">{update.new_age_group}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleConfirmAgeGroups} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm Age Group Updates
          </Button>
          <Button variant="outline" onClick={onDismiss}>
            I'll Handle This Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}