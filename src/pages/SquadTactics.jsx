
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '@/entities/Team';
import { Player } from '@/entities/Player';
import { Event } from '@/entities/Event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, RefreshCw, ArrowLeft, Save } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import SubstitutionModal from '../components/squad-manager/SubstitutionModal';

// FORMATIONS configuration - Updated with more options for each format
const FORMATIONS = {
  "3v3": {
    "1-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'def', label: 'DEF', col: 5, row: 10 },
      { id: 'att', label: 'ATT', col: 5, row: 2 }
    ],
    "Pyramid": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 3, row: 10 },
      { id: 'rb', label: 'RB', col: 7, row: 10 }
    ],
    "Triangle": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'def', label: 'DEF', col: 3, row: 10 },
      { id: 'att', label: 'ATT', col: 7, row: 3 }
    ],
    "Line": [
      { id: 'gk', label: 'GK', col: 2, row: 13 },
      { id: 'def', label: 'DEF', col: 5, row: 13 },
      { id: 'att', label: 'ATT', col: 8, row: 13 }
    ]
  },
  "5v5": {
    "1-2-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 3, row: 10 },
      { id: 'rb', label: 'RB', col: 7, row: 10 },
      { id: 'cm', label: 'CM', col: 5, row: 6 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ],
    "1-1-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'cm', label: 'CM', col: 5, row: 6 },
      { id: 'lf', label: 'LF', col: 3, row: 2 },
      { id: 'rf', label: 'RF', col: 7, row: 2 }
    ],
    "2-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 3, row: 10 },
      { id: 'rb', label: 'RB', col: 7, row: 10 },
      { id: 'lf', label: 'LF', col: 3, row: 4 },
      { id: 'rf', label: 'RF', col: 7, row: 4 }
    ],
    "Diamond": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ],
    "2-1-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'cm', label: 'CM', col: 5, row: 7 },
      { id: 'st', label: 'ST', col: 5, row: 3 }
    ],
    "1-3": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 5 },
      { id: 'cm', label: 'CM', col: 5, row: 5 },
      { id: 'rm', label: 'RM', col: 8, row: 5 }
    ]
  },
  "7v7": {
    "2-3-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 3, row: 10 },
      { id: 'rb', label: 'RB', col: 7, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'cm', label: 'CM', col: 5, row: 6 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ],
    "3-2-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lcb', label: 'CB', col: 3, row: 10 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 10 },
      { id: 'lm', label: 'LM', col: 3, row: 6 },
      { id: 'rm', label: 'RM', col: 7, row: 6 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ],
    "3-1-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 3, row: 10 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rb', label: 'RB', col: 7, row: 10 },
      { id: 'cdm', label: 'CDM', col: 5, row: 6 },
      { id: 'lf', label: 'LF', col: 3, row: 2 },
      { id: 'rf', label: 'RF', col: 7, row: 2 }
    ],
    "2-2-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'lm', label: 'LM', col: 3, row: 6 },
      { id: 'rm', label: 'RM', col: 7, row: 6 },
      { id: 'lf', label: 'LF', col: 3, row: 3 },
      { id: 'rf', label: 'RF', col: 7, row: 3 }
    ],
    "1-3-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 7 },
      { id: 'cm', label: 'CM', col: 5, row: 7 },
      { id: 'rm', label: 'RM', col: 8, row: 7 },
      { id: 'ls', label: 'ST', col: 3, row: 2 },
      { id: 'rs', label: 'ST', col: 7, row: 2 }
    ],
    "2-4": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 3, row: 10 },
      { id: 'rb', label: 'RB', col: 7, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 5 },
      { id: 'lcm', label: 'CM', col: 4, row: 5 },
      { id: 'rcm', label: 'CM', col: 6, row: 5 },
      { id: 'rm', label: 'RM', col: 8, row: 5 }
    ]
  },
  "9v9": {
    "3-2-3": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 3, row: 10 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rb', label: 'RB', col: 7, row: 10 },
      { id: 'cm1', label: 'CM', col: 3, row: 6 },
      { id: 'cm2', label: 'CM', col: 7, row: 6 },
      { id: 'lw', label: 'LW', col: 2, row: 2 },
      { id: 'st', label: 'ST', col: 5, row: 2 },
      { id: 'rw', label: 'RW', col: 8, row: 2 }
    ],
    "3-3-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lcb', label: 'CB', col: 3, row: 10 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'cm', label: 'CM', col: 5, row: 6 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'ls', label: 'ST', col: 3, row: 2 },
      { id: 'rs', label: 'ST', col: 7, row: 2 }
    ],
    "4-3-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'lcb', label: 'CB', col: 4, row: 10 },
      { id: 'rcb', label: 'CB', col: 6, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'lm', label: 'LM', col: 3, row: 6 },
      { id: 'cm', label: 'CM', col: 5, row: 6 },
      { id: 'rm', label: 'RM', col: 7, row: 6 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ],
    "4-2-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'lcb', label: 'CB', col: 4, row: 10 },
      { id: 'rcb', label: 'CB', col: 6, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'cdm1', label: 'CDM', col: 4, row: 7 },
      { id: 'cdm2', label: 'CDM', col: 6, row: 7 },
      { id: 'lf', label: 'LF', col: 3, row: 3 },
      { id: 'rf', label: 'RF', col: 7, row: 3 }
    ],
    "3-4-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lcb', label: 'CB', col: 3, row: 10 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'lcm', label: 'CM', col: 4, row: 6 },
      { id: 'rcm', label: 'CM', col: 6, row: 6 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ],
    "4-4": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'lcb', label: 'CB', col: 4, row: 10 },
      { id: 'rcb', label: 'CB', col: 6, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 5 },
      { id: 'lcm', label: 'CM', col: 4, row: 5 },
      { id: 'rcm', label: 'CM', col: 6, row: 5 },
      { id: 'rm', label: 'RM', col: 8, row: 5 }
    ]
  },
  "11v11": {
    "4-4-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'lcb', label: 'CB', col: 4, row: 10 },
      { id: 'rcb', label: 'CB', col: 6, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'lcm', label: 'CM', col: 4, row: 6 },
      { id: 'rcm', label: 'CM', col: 6, row: 6 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'lst', label: 'ST', col: 4, row: 2 },
      { id: 'rst', label: 'ST', col: 6, row: 2 }
    ],
    "4-3-3": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'lcb', label: 'CB', col: 4, row: 10 },
      { id: 'rcb', label: 'CB', col: 6, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'cdm', label: 'CDM', col: 5, row: 8 },
      { id: 'lcm', label: 'CM', col: 3, row: 6 },
      { id: 'rcm', label: 'CM', col: 7, row: 6 },
      { id: 'lw', label: 'LW', col: 2, row: 2 },
      { id: 'st', label: 'ST', col: 5, row: 2 },
      { id: 'rw', label: 'RW', col: 8, row: 2 }
    ],
    "4-5-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'lcb', label: 'CB', col: 4, row: 10 },
      { id: 'rcb', label: 'CB', col: 6, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'lcdm', label: 'CDM', col: 4, row: 7 }, // Changed row from 6 to 7
      { id: 'rcdm', label: 'CDM', col: 6, row: 7 }, // Changed row from 6 to 7
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'cam', label: 'CAM', col: 5, row: 4 }, // Changed row from 5 to 4
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ],
    "3-5-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lcb', label: 'CB', col: 3, row: 10 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 10 },
      { id: 'lwb', label: 'LWB', col: 2, row: 6 },
      { id: 'lcdm', label: 'CDM', col: 4, row: 6 },
      { id: 'rcdm', label: 'CDM', col: 6, row: 6 },
      { id: 'rwb', label: 'RWB', col: 8, row: 6 },
      { id: 'cam', label: 'CAM', col: 5, row: 5 },
      { id: 'lst', label: 'ST', col: 4, row: 2 },
      { id: 'rst', label: 'ST', col: 6, row: 2 }
    ],
    "4-2-3-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lb', label: 'LB', col: 2, row: 10 },
      { id: 'lcb', label: 'CB', col: 4, row: 10 },
      { id: 'rcb', label: 'CB', col: 6, row: 10 },
      { id: 'rb', label: 'RB', col: 8, row: 10 },
      { id: 'lcdm', label: 'CDM', col: 4, row: 7 },
      { id: 'rcdm', label: 'CDM', col: 6, row: 7 },
      { id: 'lam', label: 'CAM', col: 3, row: 4 },
      { id: 'cam', label: 'CAM', col: 5, row: 4 },
      { id: 'ram', label: 'CAM', col: 7, row: 4 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ],
    "3-4-3": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lcb', label: 'CB', col: 3, row: 10 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 10 },
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'lcm', label: 'CM', col: 4, row: 6 },
      { id: 'rcm', label: 'CM', col: 6, row: 6 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'lw', label: 'LW', col: 2, row: 3 },
      { id: 'st', label: 'ST', col: 5, row: 2 },
      { id: 'rw', label: 'RW', col: 8, row: 3 }
    ],
    "5-3-2": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lwb', label: 'LWB', col: 2, row: 9 }, // Changed row from 10 to 9
      { id: 'lcb', label: 'CB', col: 3, row: 11 }, // Changed row from 10 to 11
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 11 }, // Changed row from 10 to 11
      { id: 'rwb', label: 'RWB', col: 8, row: 9 }, // Changed row from 10 to 9
      { id: 'lcm', label: 'CM', col: 3, row: 6 },
      { id: 'cm', label: 'CM', col: 5, row: 6 },
      { id: 'rcm', label: 'CM', col: 7, row: 6 },
      { id: 'lf', label: 'ST', col: 4, row: 3 },
      { id: 'rf', label: 'ST', col: 6, row: 3 }
    ],
    "5-4-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lwb', label: 'LWB', col: 2, row: 9 }, // Changed row from 10 to 9
      { id: 'lcb', label: 'CB', col: 3, row: 11 }, // Changed row from 10 to 11
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 11 }, // Changed row from 10 to 11
      { id: 'rwb', label: 'RWB', col: 8, row: 9 }, // Changed row from 10 to 9
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'lcm', label: 'CM', col: 4, row: 6 },
      { id: 'rcm', label: 'CM', col: 6, row: 6 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ]
  }
};

export default function SquadTactics() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [event, setEvent] = useState(null);
  const [roster, setRoster] = useState([]);
  const [playerPositions, setPlayerPositions] = useState({});
  const [formation, setFormation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [subModalState, setSubModalState] = useState({
    isOpen: false,
    playerIn: null,
    playerOut: null
  });

  // Track original state to detect changes
  const [originalPlayerPositions, setOriginalPlayerPositions] = useState({});
  const [originalFormation, setOriginalFormation] = useState('');
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);

  // Updated state to handle both player and position selection
  const [selection, setSelection] = useState(null); // { type: 'player' | 'position', id: string, sourceId?: string }
  const [showInstructions, setShowInstructions] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // New state for initial load

  const pitchRef = useRef(null);
  const positionRefs = useRef({});

  // Function to calculate distance between two positions on the pitch
  const calculateDistance = (pos1, pos2) => {
    // Ensure pos1 and pos2 are valid objects with col and row
    if (!pos1 || !pos2 || typeof pos1.col === 'undefined' || typeof pos1.row === 'undefined' || typeof pos2.col === 'undefined' || typeof pos2.row === 'undefined') {
      console.warn("Invalid position data for distance calculation", pos1, pos2);
      return Infinity; // Return a large value if positions are invalid, making them undesirable matches
    }
    const dx = pos1.col - pos2.col;
    const dy = pos1.row - pos2.row;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Function to intelligently remap players when formation changes
  const remapPlayersForNewFormation = (oldFormationName, newFormationName, currentPositions) => {
    if (!team || !team.default_match_format) {
      console.warn("Team or default_match_format not available for remapping.");
      return currentPositions; // Cannot remap without team context
    }

    const currentMatchFormatConfig = FORMATIONS[team.default_match_format] || {};

    // Get the configuration for the new formation
    const newFormationConfig = currentMatchFormatConfig[newFormationName] || [];

    if (newFormationConfig.length === 0) {
      // If the new formation has no positions defined, all players implicitly go to bench
      return {};
    }

    const newPositions = {};
    const usedNewPositions = new Set(); // Keep track of new positions that have been assigned a player

    // Collect all players currently on the pitch with their original position details (col, row)
    const playersWithCurrentPosDetails = Object.entries(currentPositions)
      .map(([oldPositionId, playerId]) => {
        // Find the 'col' and 'row' for this oldPositionId by searching *all* formations
        // within the current team's default_match_format. This is more robust
        // as it doesn't rely on the 'oldFormationName' directly to find position data.
        let oldPosDetails = null;
        for (const fName in currentMatchFormatConfig) {
          const config = currentMatchFormatConfig[fName];
          oldPosDetails = config.find(pos => pos.id === oldPositionId);
          if (oldPosDetails) break;
        }
        return { playerId, oldPosDetails };
      })
      .filter(p => p.oldPosDetails); // Only include players whose old position details could be found

    // Sort players by their old position's row, prioritizing players deeper on the pitch (GK, defenders, etc.)
    // This helps in assigning key defensive positions first.
    playersWithCurrentPosDetails.sort((a, b) => {
      // Sort by row (closer to GK is higher row number), then by column for tie-breaking
      if (b.oldPosDetails.row !== a.oldPosDetails.row) {
        return b.oldPosDetails.row - a.oldPosDetails.row;
      }
      return a.oldPosDetails.col - b.oldPosDetails.col;
    });

    // For each player, find the closest available position in the new formation
    playersWithCurrentPosDetails.forEach(({ playerId, oldPosDetails }) => {
      let bestMatch = null;
      let shortestDistance = Infinity;

      newFormationConfig.forEach(newPos => {
        // Check if this new position is already taken
        if (usedNewPositions.has(newPos.id)) {
          return;
        }

        const distance = calculateDistance(oldPosDetails, newPos);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          bestMatch = newPos;
        }
      });

      // If a suitable new position was found, assign the player to it
      if (bestMatch) {
        newPositions[bestMatch.id] = playerId;
        usedNewPositions.add(bestMatch.id);
      }
      // If no bestMatch is found, the player is implicitly moved to the bench
    });

    return newPositions;
  };

  const loadTeamAndPlayers = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('teamId');
    const eventId = urlParams.get('eventId');

    if (!teamId) {
      navigate(createPageUrl('Dashboard')); // Navigate to dashboard if no teamId
      return;
    }

    try {
      const [teamData, playersData] = await Promise.all([
        Team.get(teamId),
        Player.filter({ team_id: teamId })
      ]);

      setTeam(teamData);
      setRoster(playersData);

      let loadedPositions = {};
      let loadedFormation = '';

      if (eventId) {
        try {
          const eventData = await Event.get(eventId);
          setEvent(eventData);

          // Load existing lineup if it exists for the event, otherwise fallback to team's default
          if (eventData.player_positions && Object.keys(eventData.player_positions).length > 0) {
            loadedPositions = eventData.player_positions;
          } else if (teamData.player_positions && typeof teamData.player_positions === 'object') {
            loadedPositions = teamData.player_positions;
          }

          // Set formation based on event or team's default
          if (eventData.match_format) {
            loadedFormation = eventData.match_format;
          } else if (teamData.formation_name) {
            loadedFormation = teamData.formation_name;
          }

        } catch (error) {
          console.error('Error loading event:', error);
          // Even if event loading fails, proceed with team data
          const savedPositions = teamData.player_positions && typeof teamData.player_positions === 'object'
            ? teamData.player_positions
            : {};
          const savedFormation = teamData.formation_name || '';

          loadedPositions = savedPositions;
          loadedFormation = savedFormation;
        }
      } else {
        // Load team's saved formation as fallback if no event context
        const savedPositions = teamData.player_positions && typeof teamData.player_positions === 'object'
          ? teamData.player_positions
          : {};
        const savedFormation = teamData.formation_name || '';

        loadedPositions = savedPositions;
        loadedFormation = savedFormation;
      }

      console.log('Loaded formation:', loadedFormation);
      console.log('Loaded positions:', loadedPositions);

      setPlayerPositions(loadedPositions);
      setFormation(loadedFormation);
      // Store original values for change detection
      setOriginalPlayerPositions(loadedPositions);
      setOriginalFormation(loadedFormation);
      setInitialLoad(false); // Mark initial load as complete

    } catch (error) {
      console.error('Error loading squad tactics data:', error);
      toast.error('Failed to load team data.');
      navigate(createPageUrl('Dashboard')); // Navigate to dashboard on error
    }
  }, [navigate, setTeam, setRoster, setEvent, setPlayerPositions, setFormation, setOriginalPlayerPositions, setOriginalFormation, setInitialLoad]);

  useEffect(() => {
    loadTeamAndPlayers();
  }, [loadTeamAndPlayers]);

  // Function to check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (initialLoad) return false; // Don't show unsaved changes dialog on initial load

    if (formation !== originalFormation) return true;

    // Deep compare player positions
    const currentKeys = Object.keys(playerPositions).sort();
    const originalKeys = Object.keys(originalPlayerPositions).sort();

    if (currentKeys.length !== originalKeys.length) return true;

    for (const key of currentKeys) {
      if (playerPositions[key] !== originalPlayerPositions[key]) return true;
    }

    return false;
  };

  const handleSaveSquad = async () => {
    if (!team || !formation) {
      toast.error("Please select a formation before saving.");
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving formation:', formation);
      console.log('Saving positions:', playerPositions);

      // Save to team as default
      await Team.update(team.id, {
        formation_name: formation,
        player_positions: playerPositions
      });

      // If editing for a specific event, save to event as well
      if (event) {
        const playersOnPitchIds = Object.values(playerPositions);
        const benchPlayers = roster
          .filter(p => !playersOnPitchIds.includes(p.id))
          .map(p => p.id);

        await Event.update(event.id, {
          match_format: formation,
          starting_lineup: playersOnPitchIds,
          substitutes_bench: benchPlayers,
          player_positions: playerPositions
        });
        toast.success("Squad saved successfully for the upcoming match!");
      } else {
        toast.success("Default team squad saved successfully!");
      }

      // Update original values after successful save
      setOriginalPlayerPositions({...playerPositions}); // Ensure a new object reference for deep comparison to work
      setOriginalFormation(formation);

    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save squad.');
    } finally {
      setIsSaving(false);
    }
  };

  // This is the main function that handles all player moves and swaps
  const performPlayerMove = (playerToMove, target) => {
    // playerToMove: { id: playerId, sourceId: 'posId' | 'bench' }
    // target: { type: 'player' | 'position', id: targetPlayerId | targetPositionId, sourceId?: targetPositionId | 'bench' }

    const newPositions = { ...playerPositions };

    // Determine if the player being moved was on the pitch
    const wasMovedPlayerOnPitch = playerToMove.sourceId !== 'bench';

    // 1. Remove playerToMove from their original pitch position (if they were on pitch)
    if (wasMovedPlayerOnPitch) {
      delete newPositions[playerToMove.sourceId];
    }

    if (target.type === 'position') { // Moving to an empty pitch spot or to the bench
      const targetPositionId = target.id;

      if (targetPositionId !== 'bench') { // Moving to a pitch position
        newPositions[targetPositionId] = playerToMove.id;
      }
      // If targetPositionId is 'bench', the player is effectively moved to bench
      // by being removed from newPositions (handled above) and not re-added.

    } else if (target.type === 'player') { // Swapping with another player
      const otherPlayer = target;
      const wasOtherPlayerOnPitch = otherPlayer.sourceId !== 'bench';

      // 2. Remove the 'otherPlayer' from their original pitch position (if they were on pitch)
      if (wasOtherPlayerOnPitch) {
        delete newPositions[otherPlayer.sourceId];
      }

      // 3. Place playerToMove into otherPlayer's original spot (if otherPlayer was on pitch)
      if (wasOtherPlayerOnPitch) {
        newPositions[otherPlayer.sourceId] = playerToMove.id;
      }

      // 4. Place otherPlayer into playerToMove's original spot (if playerToMove was on pitch)
      if (wasMovedPlayerOnPitch) {
        newPositions[playerToMove.sourceId] = otherPlayer.id;
      }
    }

    setPlayerPositions(newPositions);
    setSelection(null); // Clear selection after the move
    setShowInstructions(false); // Hide instructions
  };

  const handlePlayerClick = (playerId, currentPositionId) => {
    if (!selection) {
      // Nothing is selected, so select this player
      setSelection({ type: 'player', id: playerId, sourceId: currentPositionId });
      setShowInstructions(true);
      setTimeout(() => setShowInstructions(false), 3000);
    } else if (selection.type === 'player') {
      // A player is already selected
      if (selection.id === playerId) {
        setSelection(null); // Deselect if clicking the same player
        setShowInstructions(false);
      } else {
        // Perform a swap with the clicked player
        performPlayerMove(selection, { type: 'player', id: playerId, sourceId: currentPositionId });
      }
    } else if (selection.type === 'position') {
      // A position is selected, so move the clicked player there
      performPlayerMove({ id: playerId, sourceId: currentPositionId }, selection);
    }
  };

  const handlePositionClick = (positionId) => {
    if (!selection) {
      // Nothing is selected, so select this position
      setSelection({ type: 'position', id: positionId });
      setShowInstructions(true);
      setTimeout(() => setShowInstructions(false), 3000);
    } else if (selection.type === 'player') {
      // A player is selected, move them to this empty position
      performPlayerMove(selection, { type: 'position', id: positionId });
    } else if (selection.type === 'position') {
      // Another position is selected, either deselect or select the new one
      if (selection.id === positionId) {
        setSelection(null);
        setShowInstructions(false);
      } else {
        setSelection({ type: 'position', id: positionId });
        setShowInstructions(true);
        setTimeout(() => setShowInstructions(false), 3000);
      }
    }
  };

  const handleConfirmSubstitution = (playerOutId, playerInId) => {
    const newPositions = { ...playerPositions };
    let positionId = null;

    for (const [pos, pid] of Object.entries(newPositions)) {
      if (pid === playerOutId) {
        positionId = pos;
        break;
      }
    }

    if (positionId) {
      newPositions[positionId] = playerInId;
      setPlayerPositions(newPositions);
      toast.success('Substitution made!');
    }

    setSubModalState({ isOpen: false, playerIn: null, playerOut: null });
  };

  const getPlayerForPosition = (positionId) => {
    const playerId = playerPositions[positionId];
    return playerId ? roster.find(p => p.id === playerId) : null;
  };

  const navigateBack = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('teamId');
    const eventId = urlParams.get('eventId');
    const returnToLive = urlParams.get('returnToLive');

    if (returnToLive === 'true' && eventId) {
      navigate(createPageUrl('LiveMatch') + `?eventId=${eventId}`);
    } else if (teamId) {
      navigate(createPageUrl('Dashboard') + `?teamId=${teamId}`);
    } else {
      navigate(createPageUrl('Dashboard')); // Fallback
    }
  }, [navigate]);

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedChangesDialog(true);
    } else {
      navigateBack();
    }
  };

  const handleSaveAndBack = async () => {
    setShowUnsavedChangesDialog(false);
    await handleSaveSquad();
    // Small delay to ensure save completes before navigating, or rely on toast
    // If handleSaveSquad updates original state, then hasUnsavedChanges would be false.
    // However, for consistency, explicitly navigate after some time.
    setTimeout(navigateBack, 100);
  };

  const handleDiscardAndBack = () => {
    setShowUnsavedChangesDialog(false);
    navigateBack();
  };

  const handleFormationChange = (newFormation) => {
    // Only attempt remapping if players are currently on the pitch
    if (Object.keys(playerPositions).length > 0) {
      // Remap if changing to a different formation or if no formation was set before
      if (newFormation !== formation) {
        const remappedPositions = remapPlayersForNewFormation(formation, newFormation, playerPositions);

        const playersBeforeRemap = Object.keys(playerPositions).length;
        const playersAfterRemap = Object.keys(remappedPositions).length;
        const playersMovedToBench = playersBeforeRemap - playersAfterRemap;

        setPlayerPositions(remappedPositions);

        if (playersMovedToBench > 0) {
          toast.info(`Formation changed. ${playersMovedToBench} player(s) moved to bench.`);
        } else if (playersAfterRemap > 0) {
          toast.success('Formation updated. All players repositioned automatically.');
        } else {
          // No players were on the pitch, or all moved to bench (e.g., picked a smaller formation with no previous players)
          toast.info('Formation selected.');
        }
      } else {
        // Same formation selected again, no remapping needed
        toast.info('Formation selected.');
      }
    } else {
      // No players on the pitch, just set the formation
      toast.info('Formation selected.');
    }

    setFormation(newFormation);
    setSelection(null);
    setShowInstructions(false);
  };

  if (!team) {
    return <div className="p-4">Loading...</div>;
  }

  const formationConfig = FORMATIONS[team.default_match_format]?.[formation] || [];
  const playersOnPitchIds = Object.values(playerPositions);
  const availablePlayers = roster.filter(p => !playersOnPitchIds.includes(p.id));

  const pitchPlayersForModal = formationConfig
    .map(pos => ({
      player: getPlayerForPosition(pos.id),
      positionId: pos.id,
      positionLabel: pos.label
    }))
    .filter(p => p.player);

  const renderPitchContent = () => (
    <div
      className="relative aspect-[2/3] bg-green-600 rounded-lg overflow-hidden shadow-inner"
      ref={pitchRef}
      onClick={() => { setSelection(null); setShowInstructions(false); }} // Click pitch to deselect
    >
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9c1edbf77d9233404b226/ada40ee79_AdobeStock_1522404292.jpg"
        alt="Football pitch"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Instructions overlay */}
      {showInstructions && selection && (
        <div className="absolute top-4 left-4 right-4 z-30 bg-blue-600 text-white p-3 rounded-lg shadow-lg">
          {selection.type === 'player' && (
            <>
              <p className="text-sm font-semibold">Player selected!</p>
              <p className="text-xs">Now tap an empty position or another player to move/swap them.</p>
            </>
          )}
          {selection.type === 'position' && (
            <>
              <p className="text-sm font-semibold">Position selected!</p>
              <p className="text-xs">Now tap a player on the bench to place them here.</p>
            </>
          )}
        </div>
      )}

      {formation && formationConfig.length > 0 ? (
        <div className="absolute inset-0 grid grid-cols-9 grid-rows-[repeat(16,minmax(0,1fr))] z-10">
          {formationConfig.map((pos) => {
            const player = getPlayerForPosition(pos.id);
            const isSelected = selection?.type === 'player' && selection.id === player?.id;
            const isSelectedPosition = selection?.type === 'position' && selection.id === pos.id;
            const isAvailableTarget = selection?.type === 'player' && !player;

            return (
              <div
                key={pos.id}
                style={{ gridColumn: pos.col, gridRow: pos.row + 1 }}
                className="flex items-center justify-center"
                ref={el => positionRefs.current[pos.id] = el}
              >
                <div
                  className={cn(
                    "relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer",
                    {
                      "bg-black/20": !isSelectedPosition,
                      "bg-green-500/50 ring-2 ring-green-300 animate-pulse": isAvailableTarget,
                      "ring-4 ring-blue-400 bg-blue-400/50": isSelectedPosition,
                    }
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!player) handlePositionClick(pos.id);
                  }}
                >
                  {!player && <span className="text-white font-bold text-[10px] z-10">{pos.label}</span>}

                  {player && (
                    <div
                      className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center transition-transform z-20",
                        isSelected && "ring-4 ring-blue-400 rounded-full"
                      )}
                      onClick={(e) => { e.stopPropagation(); handlePlayerClick(player.id, pos.id); }}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold border-2 border-white shadow-lg">
                          <span className="text-xs">{player.jersey_number || '?'}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute -top-1 -right-1 h-5 w-5 bg-white/90 hover:bg-white text-slate-700 rounded-md shadow-md z-10 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubModalState({ isOpen: true, playerOut: player, playerIn: null });
                          }}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="-mt-1">
                        <span className="text-white text-[8px] md:text-[9px] font-semibold bg-black/60 px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap max-w-[80px] truncate">
                          {player.first_name?.[0]}. {player.last_name}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-white/80 text-center p-4 text-sm bg-black/40 rounded-lg">Select a formation to position players.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-0 py-3 sticky top-0 z-30 sm:px-4">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Squad Tactics</h1>
              <p className="text-xs text-slate-500">{team.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200">
        <div className="p-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Formation Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="formation" className="text-xs font-medium whitespace-nowrap">Formation:</Label>
                <Select value={formation} onValueChange={handleFormationChange}>
                  <SelectTrigger id="formation" className="text-sm h-9">
                    <SelectValue placeholder="Select formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(FORMATIONS[team.default_match_format] || {}).map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <Card className="shadow-sm">
          <CardContent className="p-2">
            {renderPitchContent()}
          </CardContent>
        </Card>

        <div className="w-full">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                Bench ({availablePlayers.length})
                {selection?.type === 'position' && (
                  <Badge className="bg-blue-100 text-blue-800 ml-2">
                    Position Selected - Tap a player to place them
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "space-y-2 p-2 bg-slate-50 rounded-lg min-h-[80px] transition-colors"
                )}
              >
                {availablePlayers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">All players positioned.</p>
                ) : (
                  availablePlayers.map((player) => {
                    const isSelected = selection?.type === 'player' && selection.id === player.id;
                    const isAvailableTarget = selection?.type === 'position'; // Any bench player is a target if a position is selected
                    return (
                      <div
                        key={player.id}
                        className={cn(
                          "flex items-center p-2 bg-white rounded-lg border shadow-sm cursor-pointer transition-all",
                          isSelected && "ring-2 ring-blue-500 bg-blue-50",
                          isAvailableTarget && "bg-green-50 animate-pulse" // Highlight bench players if a position is selected
                        )}
                        onClick={() => handlePlayerClick(player.id, 'bench')}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0",
                          player.jersey_number ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                        )}>
                          {player.jersey_number || '?'}
                        </div>
                        <div className="flex-1 min-w-0 ml-2">
                          <p className="font-semibold text-slate-800 truncate text-xs">{player.first_name} {player.last_name}</p>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">{player.main_position}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 ml-2 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubModalState({ isOpen: true, playerIn: player, playerOut: null });
                          }}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4">
          <Button
            className="w-full h-12 text-base font-bold"
            onClick={handleSaveSquad}
            disabled={isSaving || (!formation && Object.keys(playerPositions).length === 0)}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isSaving ? 'Saving Squad...' : 'Save Squad'}
          </Button>
        </div>
      </div>

      <SubstitutionModal
        isOpen={subModalState.isOpen}
        onClose={() => setSubModalState({ isOpen: false, playerIn: null, playerOut: null })}
        onConfirm={handleConfirmSubstitution}
        playerIn={subModalState.playerIn}
        playerOut={subModalState.playerOut}
        pitchPlayers={pitchPlayersForModal}
        benchPlayers={availablePlayers}
      />

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You've made changes to your squad formation and lineup. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row-reverse sm:space-x-2 sm:space-x-reverse gap-2">
            <AlertDialogAction onClick={handleSaveAndBack} className="w-full sm:w-auto">
              Save & Continue
            </AlertDialogAction>
            <Button variant="outline" onClick={handleDiscardAndBack} className="w-full sm:w-auto">
              Discard Changes
            </Button>
            <AlertDialogCancel onClick={() => setShowUnsavedChangesDialog(false)} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
