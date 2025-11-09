import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'MMM d, p') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export default function MessageRequestModal({ isOpen, onClose, requests, onRequestResponse }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Message Requests</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No pending message requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{request.requester_name}</p>
                      <p className="text-xs text-slate-500">{request.context}</p>
                    </div>
                    <Badge variant="outline">
                      {safeFormatDate(request.created_date, 'MMM d')}
                    </Badge>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-sm text-slate-700">{request.initial_message}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onRequestResponse(request, true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      onClick={() => onRequestResponse(request, false)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}