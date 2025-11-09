import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Play, Navigation } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { openInMaps } from '@/components/utils/openInMaps';

// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'PPP p') => {
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

export default function UpcomingMatches({ matches, isLoading, onGoLiveClick }) {
  if (isLoading) {
    return (
      <Card className="shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Calendar className="w-5 h-5" />
            Upcoming Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4 border rounded-xl">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const safeMatches = Array.isArray(matches) ? matches : [];

  return (
    <Card className="shadow-sm bg-white border border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Calendar className="w-5 h-5" />
          Upcoming Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeMatches.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-light">No upcoming matches scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeMatches.map((match) => (
              <div key={match.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="font-bold text-lg text-slate-800 leading-tight">
                        vs {match.opponent || 'TBD'}
                      </p>
                      {match.match_type && (
                        <Badge variant={match.match_type === 'league' ? 'default' : 'outline'} className="text-xs capitalize font-semibold">
                          {match.match_type}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-light">
                      <Calendar className="w-4 h-4" />
                      <span>{safeFormatDate(match.date_time)}</span>
                    </div>
                  </div>
                </div>

                {match.location?.address && (
                  <div className="flex justify-between items-center text-slate-600 mb-4 text-sm font-light">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{match.location.address} {match.is_home ? "(Home)" : "(Away)"}</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            openInMaps(match.location.latitude, match.location.longitude, match.location.address);
                        }}
                    >
                        <Navigation className="w-3.5 h-3.5 mr-1.5" />
                        Directions
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full">
                  <Button
                    onClick={() => onGoLiveClick?.(match)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play IT
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}