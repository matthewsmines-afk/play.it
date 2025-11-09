import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Goal, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const eventIcons = {
    goal: Goal,
    assist: '🤝',
    tackle: ' tackled ',
    save: ' saved ',
    substitution_in: ArrowRight,
    substitution_out: ArrowLeft,
    yellow_card: () => <div className="w-3 h-4 bg-yellow-400 border border-slate-400 rounded-sm" />,
    red_card: () => <div className="w-3 h-4 bg-red-600 border border-slate-400 rounded-sm" />,
}

export default function EventLogModal({ isOpen, events, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Match Events
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
          {events.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No events logged yet</p>
          ) : (
            events.map(event => {
                const Icon = eventIcons[event.event_type];
                return (
                  <div key={event.id || event.timestamp} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        {Icon && typeof Icon === 'function' ? <Icon /> : Icon && <Icon className="w-4 h-4 text-slate-600" />}
                        <p className="font-semibold text-slate-800 text-sm">{event.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-600">{event.minute}'</p>
                    </div>
                  </div>
                )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}