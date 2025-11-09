import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Trophy, Users } from "lucide-react";
import { format } from "date-fns";

// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'MMM d, h:mm a') => {
  if (!dateString) return 'Date not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

export default function RecentActivity({ teams, matches, isLoading }) {
  const safeTeams = Array.isArray(teams) ? teams : [];
  const safeMatches = Array.isArray(matches) ? matches : [];

  const activities = [
    ...safeTeams.slice(0, 2).map(team => ({
      type: 'team_created',
      title: `${team.name} created`,
      time: team.created_date,
      icon: Users,
      color: 'blue'
    })),
    ...safeMatches.slice(0, 3).map(match => ({
      type: 'match_completed',
      title: `vs ${match.opponent}`,
      subtitle: `${match.our_score} - ${match.opponent_score}`,
      time: match.date_time,
      icon: Trophy,
      color: match.our_score > match.opponent_score ? 'green' : match.our_score < match.opponent_score ? 'red' : 'gray'
    }))
  ].sort((a, b) => {
    try {
      return new Date(b.time) - new Date(a.time);
    } catch (error) {
      return 0;
    }
  }).slice(0, 5);

  return (
    <Card className="shadow-sm bg-white border border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-light">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`p-2.5 rounded-full ${
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'red' ? 'bg-red-100' : 'bg-slate-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.color === 'blue' ? 'text-blue-600' :
                    activity.color === 'green' ? 'text-green-600' :
                    activity.color === 'red' ? 'text-red-600' : 'text-slate-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm leading-snug">{activity.title}</p>
                  {activity.subtitle && (
                    <p className="text-sm text-slate-600">{activity.subtitle}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 font-light">
                    {safeFormatDate(activity.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}