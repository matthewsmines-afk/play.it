import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Calendar, Globe, Users } from 'lucide-react';

export default function ClubCard({ club, teamCount }) {
  const primaryColor = club.primary_color || '#cccccc';
  const secondaryColor = club.secondary_color || primaryColor;
  
  // Use hq_location if available, fallback to legacy location field
  const displayLocation = club.hq_location?.address || club.location;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-shadow border-0 hover:shadow-xl transition-all duration-300 group overflow-hidden">
        <div
          className="h-2"
          style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
        />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                {club.name}
              </h3>
              {club.short_name && (
                <p className="text-sm text-slate-500 font-medium">({club.short_name})</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-800">{teamCount}</div>
              <div className="text-xs text-slate-500">teams</div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            {displayLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{displayLocation}</span>
              </div>
            )}
            {club.founded_year && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Founded {club.founded_year}</span>
              </div>
            )}
            {club.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {club.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {club.description && (
            <p className="text-sm text-slate-600 mt-4 line-clamp-2">
              {club.description}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Club Colors</span>
              <div className="flex items-center -space-x-1">
                {club.primary_color && (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: club.primary_color }}
                  />
                )}
                {club.secondary_color && (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: club.secondary_color }}
                  />
                )}
                {!club.primary_color && (
                  <span className="text-slate-400 font-medium">Not set</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}