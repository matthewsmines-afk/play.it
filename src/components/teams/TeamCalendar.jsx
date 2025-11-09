import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  MapPin, 
  Clock, 
  Trophy, 
  Dumbbell,
  Users,
  Plus
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Event } from '@/entities/Event';

import AddEventForm from './AddEventForm';

const eventTypeIcons = {
  training: Dumbbell,
  match: Trophy,
  tournament: Trophy,
  meeting: Users,
  other: Calendar
};

const eventTypeColors = {
  training: 'bg-blue-500',
  match: 'bg-green-500',
  tournament: 'bg-purple-500',
  meeting: 'bg-orange-500',
  other: 'bg-slate-500'
};

export default function TeamCalendar({ teamId, events, isLoading, onEventUpdate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date) => {
    return events.filter(event => 
      isSameDay(new Date(event.date_time), date)
    );
  };

  const handleAddEventForDate = (date) => {
    setSelectedDate(format(date, "yyyy-MM-dd'T'HH:mm"));
    setShowAddEventForm(true);
  };

  const handleAddEvent = async (eventData) => {
    await Event.create({ ...eventData, team_id: teamId });
    setShowAddEventForm(false);
    setSelectedDate(null);
    onEventUpdate();
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div>
      {showAddEventForm && (
        <AddEventForm
          teamId={teamId}
          event={selectedDate ? { date_time: selectedDate } : null}
          onSubmit={handleAddEvent}
          onCancel={() => {
            setShowAddEventForm(false);
            setSelectedDate(null);
          }}
        />
      )}

      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5"/>
            Team Calendar
          </CardTitle>
          <Button 
            onClick={() => setShowAddEventForm(true)}
            className="bg-gradient-to-r from-green-600 to-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Add Event
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-slate-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-slate-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] p-2 border rounded-lg transition-all duration-200 cursor-pointer hover:bg-slate-50 ${
                  isToday ? 'bg-blue-50 border-blue-200' : 'border-slate-200'
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                onClick={() => handleAddEventForDate(day)}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isToday ? 'text-blue-600' : 'text-slate-800'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => {
                    const EventIcon = eventTypeIcons[event.event_type];
                    return (
                      <div
                        key={event.id}
                        className={`p-1 rounded text-xs text-white ${eventTypeColors[event.event_type]} flex items-center gap-1`}
                        title={`${event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} - ${format(new Date(event.date_time), 'p')} ${event.location ? `at ${event.location}` : ''}`}
                      >
                        <EventIcon className="w-3 h-3" />
                        <span className="truncate text-xs">{event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}</span>
                      </div>
                    );
                  })}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-slate-500 font-medium">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Events List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming This Month</h3>
          <div className="space-y-3">
            {events
              .filter(event => isSameMonth(new Date(event.date_time), currentMonth))
              .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
              .slice(0, 5)
              .map(event => {
                const EventIcon = eventTypeIcons[event.event_type];
                return (
                  <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50">
                    <div className={`p-2 rounded-lg ${eventTypeColors[event.event_type]} bg-opacity-20`}>
                      <EventIcon className={`w-4 h-4 ${eventTypeColors[event.event_type].replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={eventTypeColors[event.event_type].replace('bg-', 'bg-') + '/20 ' + eventTypeColors[event.event_type].replace('bg-', 'text-')}>
                          {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(event.date_time), 'MMM d')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(event.date_time), 'p')}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </div>
  );
}