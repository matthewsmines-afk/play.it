import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Shield, Calendar, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

const teamBackgroundImage = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9c1edbf77d9233404b226/56a72eca7_AdobeStock_471939270.jpg';

const TeamCard = React.memo(({ team, playerCount, onClick, onEdit }) => {
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border-0 relative team-card bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 cursor-pointer" onClick={onClick}>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors leading-tight">
                {team.name}
              </h3>
              <div className="flex items-center gap-2 text-white/80 text-xs font-normal">
                <Shield className="w-3.5 h-3.5" />
                <span>{team.age_group}</span>
                <span>•</span>
                <span className="capitalize">{team.sport}</span>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-xl font-bold text-white">{playerCount}</div>
              <div className="text-xs text-white/60 font-normal">players</div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 flex-shrink-0 text-white/70 hover:text-white hover:bg-white/10 ml-2" 
              onClick={handleEditClick}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2.5 text-xs text-white/70 cursor-pointer font-normal leading-relaxed" onClick={onClick}>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              <span>{team.coaches?.length || 1} coach{team.coaches?.length > 1 ? 'es' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{team.home_ground || 'Home ground TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{team.season || 'Current season'}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 cursor-pointer" onClick={onClick}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 font-normal">Team Colors</span>
              <div className="flex items-center -space-x-1">
                {team.primary_color && (
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white/80 shadow-sm"
                    style={{ backgroundColor: team.primary_color }}
                  />
                )}
                {team.secondary_color && (
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white/80 shadow-sm"
                    style={{ backgroundColor: team.secondary_color }}
                  />
                )}
                {!team.primary_color && !team.secondary_color && (
                  <span className="capitalize text-sm text-white/60 font-normal">Not set</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

TeamCard.displayName = 'TeamCard';

export default TeamCard;