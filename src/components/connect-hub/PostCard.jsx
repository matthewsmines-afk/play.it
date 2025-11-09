import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const POST_TYPE_CONFIG = {
  player_available: { label: 'Player Available', color: 'bg-blue-100 text-blue-800' },
  player_looking_for_team: { label: 'Looking for Team', color: 'bg-purple-100 text-purple-800' },
  team_recruiting: { label: 'Team Recruiting', color: 'bg-green-100 text-green-800' },
  friendly_wanted: { label: 'Friendly Match', color: 'bg-amber-100 text-amber-800' },
  equipment_sale: { label: 'Equipment Sale', color: 'bg-orange-100 text-orange-800' },
  coaching_session: { label: 'Coaching', color: 'bg-indigo-100 text-indigo-800' },
  ground_share: { label: 'Ground Share', color: 'bg-teal-100 text-teal-800' },
  tournament_announcement: { label: 'Tournament', color: 'bg-red-100 text-red-800' },
};

export default function PostCard({ 
  post, 
  currentUser, 
  onEdit, 
  onDelete, 
  onMarkAsFulfilled,
  onRenew,
  showActions = false 
}) {
  const isOwner = currentUser && post.created_by_user_id === currentUser.id;
  const config = POST_TYPE_CONFIG[post.post_type] || { label: post.post_type, color: 'bg-slate-100 text-slate-800' };

  // Calculate days since post creation
  const daysSinceCreated = Math.floor(
    (new Date() - new Date(post.created_date)) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysSinceCreated >= 25; // Warn if 25+ days old
  const isExpired = daysSinceCreated >= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <Badge className={config.color}>{config.label}</Badge>
            {showActions && isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMarkAsFulfilled(post.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Fulfilled
                  </DropdownMenuItem>
                  {isExpired && onRenew && (
                    <DropdownMenuItem onClick={() => onRenew(post.id)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renew Post
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete(post.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
          <p className="text-xs text-slate-500">
            by {post.created_by_user_name} • {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
          </p>
          {isExpiringSoon && showActions && (
            <Badge variant="outline" className="mt-2 text-amber-600 border-amber-600">
              Expires in {30 - daysSinceCreated} days
            </Badge>
          )}
          {isExpired && showActions && (
            <Badge variant="outline" className="mt-2 text-red-600 border-red-600">
              Expired
            </Badge>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-slate-600 mb-4 line-clamp-3">{post.description}</p>

          <div className="space-y-2 mt-auto">
            {post.location_text && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{post.location_text}</span>
              </div>
            )}

            {post.age_groups && post.age_groups.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4" />
                <div className="flex flex-wrap gap-1">
                  {post.age_groups.map((age, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{age}</Badge>
                  ))}
                </div>
              </div>
            )}

            {post.specific_fields?.price && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <DollarSign className="w-4 h-4" />
                <span>£{post.specific_fields.price}</span>
              </div>
            )}

            {post.specific_fields?.tournament_start_date && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.specific_fields.tournament_start_date).toLocaleDateString()}
                  {post.specific_fields.tournament_end_date && 
                    ` - ${new Date(post.specific_fields.tournament_end_date).toLocaleDateString()}`
                  }
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}