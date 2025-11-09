import React, { useState, useEffect } from 'react';
import { Player } from '@/entities/Player';
import { TeamJoinRequest } from '@/entities/TeamJoinRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  UserCheck,
  UserPlus,
  Calendar,
  MapPin,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Duplicate detection logic
const findPotentialDuplicates = (newPlayerData, existingPlayers) => {
  const matches = [];
  
  existingPlayers.forEach(existing => {
    let matchScore = 0;
    let matchReasons = [];
    
    // Exact name match
    const firstNameMatch = newPlayerData.player_first_name.toLowerCase() === existing.first_name.toLowerCase();
    const lastNameMatch = newPlayerData.player_last_name.toLowerCase() === existing.last_name.toLowerCase();
    
    if (firstNameMatch && lastNameMatch) {
      matchScore += 100;
      matchReasons.push('Exact name match');
    } else if (firstNameMatch || lastNameMatch) {
      matchScore += 30;
      matchReasons.push('Partial name match');
    }
    
    // Similar names (fuzzy matching)
    const firstNameSimilar = calculateSimilarity(
      newPlayerData.player_first_name.toLowerCase(),
      existing.first_name.toLowerCase()
    );
    const lastNameSimilar = calculateSimilarity(
      newPlayerData.player_last_name.toLowerCase(),
      existing.last_name.toLowerCase()
    );
    
    if (firstNameSimilar > 0.8 && lastNameSimilar > 0.8) {
      matchScore += 50;
      matchReasons.push('Very similar name');
    }
    
    // Date of birth match
    if (newPlayerData.date_of_birth && existing.date_of_birth) {
      if (newPlayerData.date_of_birth === existing.date_of_birth) {
        matchScore += 80;
        matchReasons.push('Same date of birth');
      }
    }
    
    // Position match
    if (newPlayerData.main_position && existing.main_position) {
      if (newPlayerData.main_position === existing.main_position) {
        matchScore += 10;
        matchReasons.push('Same position');
      }
    }
    
    // If already has a parent, less likely to be duplicate
    if (existing.parent_user_id) {
      matchScore -= 20;
      matchReasons.push('Already has parent linked');
    }
    
    if (matchScore >= 50) {
      matches.push({
        player: existing,
        score: matchScore,
        reasons: matchReasons
      });
    }
  });
  
  return matches.sort((a, b) => b.score - a.score);
};

// Simple string similarity (Levenshtein-based)
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function JoinRequestReview({ request, teamId, onRequestHandled, onClose }) {
  const [duplicates, setDuplicates] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null); // 'approve', 'merge', 'decline'
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const [coachNotes, setCoachNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkForDuplicates = async () => {
      try {
        // Get all players in this team
        const allPlayers = await Player.filter({
          team_memberships: {
            '$elemMatch': { team_id: teamId }
          }
        });
        
        // Find potential duplicates
        const matches = findPotentialDuplicates(request, allPlayers);
        setDuplicates(matches);
      } catch (error) {
        console.error('Error checking for duplicates:', error);
      }
    };
    
    checkForDuplicates();
  }, [request, teamId]);

  const handleApproveAsNew = async () => {
    setIsSubmitting(true);
    try {
      // Get the player
      const player = await Player.get(request.player_id);
      
      // Add team membership
      const updatedMemberships = [
        ...(player.team_memberships || []),
        {
          team_id: teamId,
          is_active: true,
          role: 'primary'
        }
      ];
      
      await Player.update(request.player_id, {
        team_memberships: updatedMemberships
      });
      
      // Update request status
      await TeamJoinRequest.update(request.id, {
        status: 'approved',
        coach_notes: coachNotes
      });
      
      onRequestHandled();
    } catch (error) {
      console.error('Error approving request:', error);
    }
    setIsSubmitting(false);
  };

  const handleMerge = async (duplicatePlayer) => {
    setIsSubmitting(true);
    try {
      // Link parent to existing player
      await Player.update(duplicatePlayer.id, {
        parent_user_id: request.parent_user_id
      });
      
      // Mark the new player as merged (we'll keep it for reference but inactive)
      await Player.update(request.player_id, {
        team_memberships: [{
          team_id: teamId,
          is_active: false,
          role: 'merged_duplicate'
        }]
      });
      
      // Update request with reference to merged player
      await TeamJoinRequest.update(request.id, {
        status: 'approved',
        coach_notes: `Merged with existing player ${duplicatePlayer.first_name} ${duplicatePlayer.last_name}`,
        potential_duplicate_player_id: duplicatePlayer.id
      });
      
      onRequestHandled();
    } catch (error) {
      console.error('Error merging players:', error);
    }
    setIsSubmitting(false);
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      await TeamJoinRequest.update(request.id, {
        status: 'declined',
        coach_notes: coachNotes
      });
      
      onRequestHandled();
    } catch (error) {
      console.error('Error declining request:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Join Request</DialogTitle>
          <DialogDescription>
            {request.parent_name} wants to add their child to your team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requested Player Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-500">Name</Label>
                  <p className="font-semibold">{request.player_first_name} {request.player_last_name}</p>
                </div>
                {request.date_of_birth && (
                  <div>
                    <Label className="text-sm text-slate-500">Age</Label>
                    <p className="font-semibold">{calculateAge(request.date_of_birth)} years</p>
                  </div>
                )}
                {request.main_position && (
                  <div>
                    <Label className="text-sm text-slate-500">Position</Label>
                    <p className="font-semibold">{request.main_position}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-slate-500">Parent</Label>
                  <p className="font-semibold">{request.parent_name}</p>
                </div>
              </div>
              
              {request.message_from_parent && (
                <div>
                  <Label className="text-sm text-slate-500">Message from Parent</Label>
                  <p className="text-sm bg-slate-50 p-3 rounded-lg mt-1">{request.message_from_parent}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Duplicate Detection */}
          {duplicates.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Potential Duplicate Detected!</strong> This player may already exist in your team.
              </AlertDescription>
            </Alert>
          )}

          {duplicates.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Potential Matches in Your Team:</h3>
              {duplicates.map((dup, index) => (
                <Card key={dup.player.id} className={`border-2 ${selectedDuplicate?.id === dup.player.id ? 'border-blue-500' : 'border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{dup.player.first_name} {dup.player.last_name}</h4>
                          <Badge variant={dup.score >= 100 ? 'destructive' : dup.score >= 70 ? 'default' : 'secondary'}>
                            {dup.score >= 100 ? 'Very Likely Match' : dup.score >= 70 ? 'Likely Match' : 'Possible Match'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500">Age:</span> {calculateAge(dup.player.date_of_birth)} years
                          </div>
                          <div>
                            <span className="text-slate-500">Position:</span> {dup.player.main_position || 'N/A'}
                          </div>
                          <div>
                            <span className="text-slate-500">Jersey:</span> #{dup.player.team_memberships?.[0]?.jersey_number || 'N/A'}
                          </div>
                          <div>
                            <span className="text-slate-500">Parent:</span> {dup.player.parent_user_id ? 'Linked' : 'None'}
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-xs text-slate-500">Match reasons:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dup.reasons.map((reason, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{reason}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedAction('merge');
                          setSelectedDuplicate(dup.player);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Merge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Coach Notes */}
          <div>
            <Label htmlFor="coach_notes">Coach Notes (Optional)</Label>
            <Textarea
              id="coach_notes"
              placeholder="Add any notes about this request..."
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            
            {selectedAction === 'merge' && selectedDuplicate ? (
              <Button
                onClick={() => handleMerge(selectedDuplicate)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Merging...' : `Merge with ${selectedDuplicate.first_name}`}
              </Button>
            ) : (
              <Button
                onClick={handleApproveAsNew}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Approving...' : 'Approve as New Player'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}