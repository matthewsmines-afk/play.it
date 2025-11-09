
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Team } from '@/entities/Team';
import { Player } from '@/entities/Player';
import { Event } from '@/entities/Event';
import { RSVP } from '@/entities/RSVP';
import { MatchEvent } from '@/entities/MatchEvent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Users,
  RefreshCw,
  Target,
  Heart,
  Square,
  SquareX,
  Shield,
  Crosshair,
  Clock,
  Trophy,
  Dribbble,
  X as XIcon
} from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import SubstitutionModal from '../components/squad-manager/SubstitutionModal';
import EventLogModal from '../components/live-match/EventLogModal';
import StatLoggerModal from '../components/live-match/StatLoggerModal';
import ScoreAdjustmentModal from '../components/live-match/ScoreAdjustmentModal';

// FORMATIONS configuration - same as Squad Tactics
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
      { id: 'lcdm', label: 'CDM', col: 4, row: 7 },
      { id: 'rcdm', label: 'CDM', col: 6, row: 7 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'cam', label: 'CAM', col: 5, row: 4 },
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
      { id: 'lwb', label: 'LWB', col: 2, row: 9 },
      { id: 'lcb', label: 'CB', col: 3, row: 11 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 11 },
      { id: 'rwb', label: 'RWB', col: 8, row: 9 },
      { id: 'lcm', label: 'CM', col: 3, row: 6 },
      { id: 'cm', label: 'CM', col: 5, row: 6 },
      { id: 'rcm', label: 'CM', col: 7, row: 6 },
      { id: 'lf', label: 'ST', col: 4, row: 3 },
      { id: 'rf', label: 'ST', col: 6, row: 3 }
    ],
    "5-4-1": [
      { id: 'gk', label: 'GK', col: 5, row: 13 },
      { id: 'lwb', label: 'LWB', col: 2, row: 9 },
      { id: 'lcb', label: 'CB', col: 3, row: 11 },
      { id: 'cb', label: 'CB', col: 5, row: 10 },
      { id: 'rcb', label: 'CB', col: 7, row: 11 },
      { id: 'rwb', label: 'RWB', col: 8, row: 9 },
      { id: 'lm', label: 'LM', col: 2, row: 6 },
      { id: 'lcm', label: 'CM', col: 4, row: 6 },
      { id: 'rcm', label: 'CM', col: 6, row: 6 },
      { id: 'rm', label: 'RM', col: 8, row: 6 },
      { id: 'st', label: 'ST', col: 5, row: 2 }
    ]
  }
};

export default function LiveMatch() {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Match state
  const [ourScore, setOurScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [showEventLog, setShowEventLog] = useState(false);
  const [matchEvents, setMatchEvents] = useState([]);
  const [substitutionHistory, setSubstitutionHistory] = useState([]);
  const [recordedGoals, setRecordedGoals] = useState([]); // Track goals for removal
  const [matchStats, setMatchStats] = useState({}); // New state for aggregated stats

  // Squad management
  const [playerPositions, setPlayerPositions] = useState({});
  const [formation, setFormation] = useState('');
  const [playerMinutes, setPlayerMinutes] = useState({}); // Stores minutes in seconds
  const [playerEntryTimes, setPlayerEntryTimes] = useState({}); // Stores time in seconds
  const [substitutionModal, setSubstitutionModal] = useState({
    isOpen: false,
    playerIn: null,
    playerOut: null
  });

  const [statLoggerModal, setStatLoggerModal] = useState({
    isOpen: false,
    statType: null
  });
  const [scoreAdjustmentModal, setScoreAdjustmentModal] = useState({
    isOpen: false,
    type: null // 'add_goal' or 'remove_goal'
  });
  const [isMatchCompleted, setIsMatchCompleted] = useState(false);
  const [isConfirmingEnd, setIsConfirmingEnd] = useState(false); // To indicate that match ending process is in progress

  // Selection state for substitutions
  const [selection, setSelection] = useState(null);

  // Match format consistency system state
  const [showFormatWarning, setShowFormatWarning] = useState(false);
  const [formatMismatchDetails, setFormatMismatchDetails] = useState(null);

  // Helper to calculate match stats from events
  const calculateMatchStats = useCallback((events, allPlayers) => {
    const stats = {};
    allPlayers.forEach(player => {
        stats[player.id] = { goals: 0, assists: 0, tackles: 0, saves: 0, yellow_cards: 0, red_cards: 0 };
    });

    events.forEach(event => {
        if (event.player_id && stats[event.player_id]) {
            switch (event.event_type) {
                case 'goal':
                    stats[event.player_id].goals++;
                    break;
                case 'assist':
                    stats[event.player_id].assists++;
                    break;
                case 'tackle':
                    stats[event.player_id].tackles++;
                    break;
                case 'save':
                    stats[event.player_id].saves++;
                    break;
                case 'yellow_card':
                    stats[event.player_id].yellow_cards++;
                    break;
                case 'red_card':
                    stats[event.player_id].red_cards++;
                    break;
            }
        }
    });
    return stats;
  }, []);

  useEffect(() => {
    const loadMatchData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('eventId');

      if (!eventId) {
        setError('No event ID provided');
        setIsLoading(false);
        return;
      }

      try {
        let eventData = await Event.get(eventId);
        if (!eventData) {
          setError('Event not found');
          setIsLoading(false);
          return;
        }

        // Load team data early and set it
        const teamData = await Team.get(eventData.team_id);
        if (!teamData) {
          setError('Team not found for event'); // General error if team not found
          setIsLoading(false);
          return;
        }
        setTeam(teamData); // Set team state early

        // Check for match format compatibility (RE-IMPLEMENTED LOGIC)
        const eventMatchFormat = eventData.match_format; // e.g., "5v5"
        const teamSavedFormation = teamData.formation_name; // e.g., "1-2-1"

        if (eventMatchFormat && teamSavedFormation) {
            // Get the list of valid formation *names* for the *event's* specific format.
            const validFormationsForEvent = FORMATIONS[eventMatchFormat] ? Object.keys(FORMATIONS[eventMatchFormat]) : [];

            // Check if the team's saved formation is in the list of valid formations for this event.
            const isFormationCompatible = validFormationsForEvent.includes(teamSavedFormation);

            if (!isFormationCompatible) {
                // Only show warning if the saved tactic is NOT valid for this specific match.
                setFormatMismatchDetails({
                    eventFormat: eventMatchFormat,
                    teamDefault: teamData.default_match_format, // For display purposes in the message
                    hasFormation: !!teamSavedFormation,
                    formationName: teamSavedFormation
                });
                setShowFormatWarning(true);
            }
        }


        // Check if match is already completed
        if (eventData.match_status === 'completed') {
          setIsMatchCompleted(true);
          // If match is completed, navigate to the MatchReport page immediately
          navigate(createPageUrl('MatchReport') + `?eventId=${eventData.id}`);
          return; // Exit here as control transfers to MatchReport page
        }

        // --- SNAPSHOT LOGIC ---
        if (eventData.is_snapshot_created) {
          // **LOAD FROM SNAPSHOT**
          // Snapshot exists, so we load everything directly from the event.
          // Fetch all players associated with the team
          const playersData = await Player.filter({ team_id: eventData.team_id });

          setEvent(eventData);
          setPlayers(playersData); // Set all team players for general use (bench, modal, etc.)
          setPlayerPositions(eventData.player_positions || {});
          setFormation(eventData.match_format || '');
          setCurrentTime(eventData.current_match_time || 0);
          setOurScore(eventData.our_score || 0);
          setOpponentScore(eventData.opponent_score || 0);
          setPlayerMinutes(eventData.player_minutes || {});
          setSubstitutionHistory(eventData.substitution_history || []);
          setRecordedGoals(eventData.recorded_goals || []);


          // Re-initialize player entry times based on saved minutes and current time
          const initialEntryTimes = {};
          if (eventData.player_minutes && eventData.current_match_time !== undefined) {
            Object.keys(eventData.player_minutes).forEach(playerId => {
              // Only set entry time if player has played some minutes or is currently on pitch
              if (eventData.player_minutes[playerId] > 0 || Object.values(eventData.player_positions || {}).includes(playerId)) {
                initialEntryTimes[playerId] = eventData.current_match_time - (eventData.player_minutes[playerId] || 0);
              }
            });
          }
          setPlayerEntryTimes(initialEntryTimes);

        } else {
          // **CREATE SNAPSHOT**
          // This is the first time loading the match, so we create the snapshot.
          if (!teamData.formation_name || !teamData.player_positions) {
            toast.error('Please set up your squad formation first');
            navigate(createPageUrl('SquadTactics') + `?teamId=${teamData.id}&eventId=${eventId}&returnToLive=true`);
            return;
          }

          let allTeamPlayers = await Player.filter({ team_id: teamData.id });

          // Apply RSVP filtering for initial available players
          const rsvps = await RSVP.filter({ event_id: eventId });
          const notAttendingIds = rsvps
            .filter(rsvp => rsvp.status === 'not_attending')
            .map(rsvp => rsvp.player_id);

          const availablePlayersForSnapshot = allTeamPlayers.filter(p => !notAttendingIds.includes(p.id));

          // Use team's default formation and positions as the base
          // Filter initialPositions to only include players who are actually available
          const initialPositions = {};
          for (const posId in teamData.player_positions) {
            const playerId = teamData.player_positions[posId];
            if (availablePlayersForSnapshot.some(p => p.id === playerId)) {
              initialPositions[posId] = playerId;
            }
          }

          const initialFormation = teamData.formation_name;

          // Initialize player minutes and entry times only for players initially on the pitch
          const initialPlayerMinutes = {};
          const initialEntryTimes = {};
          Object.values(initialPositions).forEach(playerId => {
            initialPlayerMinutes[playerId] = 0;
            initialEntryTimes[playerId] = 0; // Started at beginning of match (time 0)
          });

          const snapshotData = {
            player_positions: initialPositions,
            match_format: initialFormation,
            player_minutes: initialPlayerMinutes,
            our_score: 0,
            opponent_score: 0,
            current_match_time: 0,
            substitution_history: [],
            recorded_goals: [], // Initialize recorded goals for new event
            is_snapshot_created: true,
            match_status: 'in_progress', // Set initial status
          };

          await Event.update(eventId, snapshotData);

          // Update local event state to reflect the snapshot was created
          eventData = { ...eventData, ...snapshotData, is_snapshot_created: true };

          // Set state from the newly created snapshot
          setEvent(eventData);
          setPlayers(allTeamPlayers); // Keep all team players in state for future substitutions
          setPlayerPositions(initialPositions);
          setFormation(initialFormation);
          setCurrentTime(0);
          setOurScore(0);
          setOpponentScore(0);
          setPlayerMinutes(initialPlayerMinutes);
          setPlayerEntryTimes(initialEntryTimes);
          setSubstitutionHistory([]);
          setRecordedGoals([]); // Set recorded goals for new event
        }

        // Load match events (goals, cards, etc.) regardless of snapshot
        // If match is completed, use final_match_events saved in the event, otherwise fetch from MatchEvent table.
        // NOTE: With the new flow, if eventData.match_status is 'completed', we navigate away,
        // so this branch will only be for 'in_progress' matches.
        try {
          const events = await MatchEvent.filter({ event_id: eventId });
          setMatchEvents(events || []);
        } catch (error) {
          console.warn('Could not load match events:', error);
        }

      } catch (error) {
        console.error('Error loading match data:', error);
        setError('Failed to load match data');
      }
      setIsLoading(false);
    };

    loadMatchData();
  }, [navigate, calculateMatchStats]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1; // newTime is in seconds
          // Update player minutes for players currently on the pitch
          setPlayerMinutes(prevMinutes => {
            const updated = { ...prevMinutes };
            Object.values(playerPositions).forEach(playerId => {
              if (playerEntryTimes[playerId] !== undefined) {
                updated[playerId] = newTime - playerEntryTimes[playerId]; // This is duration in seconds
              } else {
                // If a player somehow got on the pitch without an entry time
                // This typically means they were on the pitch at time 0
                setPlayerEntryTimes(current => ({ ...current, [playerId]: 0 })); // Set to 0 if starting at time 0
                updated[playerId] = newTime; // Minutes played from time 0 to newTime
              }
            });
            return updated;
          });
          return newTime;
        });
      }, 1000); // Changed from 60000 to 1000 - update every second for testing, change back to 60000 for production
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, playerPositions, playerEntryTimes]);

  // Auto-save match state
  useEffect(() => {
    if (event && !isLoading && !isMatchCompleted) { // Do not auto-save if match is completed
      const saveMatchState = async () => {
        try {
          await Event.update(event.id, {
            current_match_time: currentTime,
            our_score: ourScore,
            opponent_score: opponentScore,
            player_positions: playerPositions,
            match_format: formation,
            player_minutes: playerMinutes,
            substitution_history: substitutionHistory,
            recorded_goals: recordedGoals,
            // matchEvents are saved as part of final_match_events only on completion,
            // otherwise they are managed by the MatchEvent table.
          });
        } catch (error) {
          console.error('Failed to auto-save match state:', error);
        }
      };

      const timeoutId = setTimeout(saveMatchState, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [event, isLoading, currentTime, ourScore, opponentScore, playerPositions, formation, playerMinutes, substitutionHistory, recordedGoals, isMatchCompleted]);

  // Effect to calculate match stats whenever matchEvents or players change
  useEffect(() => {
      // Ensure all players are available to initialize stats for them
      if (players.length > 0) {
          setMatchStats(calculateMatchStats(matchEvents, players));
      }
  }, [matchEvents, players, calculateMatchStats]);


  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setCurrentTime(0);
    // When resetting timer, also reset player minutes and entry times
    setPlayerMinutes({});
    setPlayerEntryTimes({});
    setOurScore(0);
    setOpponentScore(0);
    setSubstitutionHistory([]);
    setRecordedGoals([]);
    setMatchEvents([]);
  };

  const calculateFinalPlayerMinutes = useCallback(() => {
    const finalMinutes = { ...playerMinutes };
    // Update minutes for players currently on the pitch
    Object.values(playerPositions).forEach(playerId => {
        if (playerEntryTimes[playerId] !== undefined) {
            finalMinutes[playerId] = currentTime - playerEntryTimes[playerId];
        } else {
            // Should not happen if playerEntryTimes is correctly managed,
            // but as a fallback, assume they played the whole match time if their entry time is missing.
            finalMinutes[playerId] = currentTime;
        }
    });
    return finalMinutes;
  }, [playerMinutes, playerPositions, playerEntryTimes, currentTime]);

  const handleEndMatch = async () => {
    if (!event) return;

    setIsConfirmingEnd(true);
    setIsTimerRunning(false); // Stop the timer

    // Calculate final player minutes one last time
    const finalPlayerMinutes = calculateFinalPlayerMinutes();

    // CRITICAL FIX: Aggregate match events into player career stats
    const playerStatsUpdates = {};
    const currentMatchStats = calculateMatchStats(matchEvents, players);

    // Prepare bulk updates for player career stats
    for (const [playerId, matchStats] of Object.entries(currentMatchStats)) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        playerStatsUpdates[playerId] = {
          total_goals: (player.total_goals || 0) + (matchStats.goals || 0),
          total_assists: (player.total_assists || 0) + (matchStats.assists || 0),
          total_tackles: (player.total_tackles || 0) + (matchStats.tackles || 0),
          total_saves: (player.total_saves || 0) + (matchStats.saves || 0),
          games_played: (player.games_played || 0) + 1, // Increment games played
          total_time_played_minutes: (player.total_time_played_minutes || 0) + Math.floor((finalPlayerMinutes[playerId] || 0) / 60)
        };
      }
    }

    const finalMatchData = {
        match_status: 'completed',
        our_score: ourScore,
        opponent_score: opponentScore,
        current_match_time: currentTime,
        player_positions: playerPositions,
        player_minutes: finalPlayerMinutes,
        player_stats: currentMatchStats, // Save match-specific stats
        substitution_history: substitutionHistory,
        recorded_goals: recordedGoals,
        final_match_events: matchEvents, // Save all events to event object
    };

    try {
        // Update event with final match data
        await Event.update(event.id, finalMatchData);

        // Update all player career stats
        for (const [playerId, statsUpdate] of Object.entries(playerStatsUpdates)) {
          await Player.update(playerId, statsUpdate);
        }

        toast.success("Match finished and saved. Redirecting to report.");
        setIsMatchCompleted(true);
        navigate(createPageUrl('MatchReport') + `?eventId=${event.id}`);
    } catch (error) {
        console.error("Error finalizing match:", error);
        toast.error("Failed to finalize match. Please try again.");
    } finally {
        setIsConfirmingEnd(false);
    }
  };

  const handleBackNavigation = () => {
    // If match is already completed, go to Dashboard
    if (isMatchCompleted) {
      navigate(createPageUrl('Dashboard'));
    } else {
      // If match is in progress, perform a save and then navigate to Dashboard
      handleBackWithoutFinishing();
    }
  };

  const handleBackWithoutFinishing = async () => {
    if (!event) {
      navigate(createPageUrl('Dashboard'));
      return;
    }
    try {
      // Force immediate save of current state before navigating
      await Event.update(event.id, {
        current_match_time: currentTime,
        our_score: ourScore,
        opponent_score: opponentScore,
        player_positions: playerPositions,
        match_format: formation,
        player_minutes: playerMinutes,
        substitution_history: substitutionHistory,
        recorded_goals: recordedGoals,
        match_status: 'in_progress' // Ensure it stays as in_progress
      });

      // Now navigate back
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error saving match state:', error);
      toast.error('Failed to save match progress');
      // Still navigate back even if save failed
      navigate(createPageUrl('Dashboard'));
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60); // Round seconds to nearest whole number
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const adjustTime = (adjustmentMinutes) => {
    setCurrentTime(prev => Math.max(0, prev + (adjustmentMinutes * 60)));
  };

  const logStat = async (statData) => {
    const { statType, player, assist, isOwnGoalByOpponent } = statData;
    if (!event) return;

    try {
      if (isOwnGoalByOpponent && statType === 'goal') {
        // Handle Opponent Own Goal
        setOurScore(prev => prev + 1);
        const goalRecord = {
          player: { id: 'opponent_own_goal', first_name: 'Opponent', last_name: '(Own Goal)' },
          assist: null,
          minute: Math.floor(currentTime / 60),
          isOwnGoalByOpponent: true,
          timestamp: Date.now()
        };
        setRecordedGoals(prev => [...prev, goalRecord]);

        // Optional: Log a generic event
        const newMatchEvent = await MatchEvent.create({
          event_id: event.id,
          event_type: 'goal',
          minute: Math.floor(currentTime / 60),
          notes: 'Own Goal by Opponent'
        });
        setMatchEvents(prev => [...prev, newMatchEvent]);

        toast.success('Own Goal logged for your team');
        return; // Exit after handling own goal
      }

      // Proceed with normal player stat logging
      const mainEventData = {
        event_id: event.id,
        player_id: player.id,
        event_type: statType,
        minute: Math.floor(currentTime / 60), // Log minute as completed minutes
        notes: `${player.first_name} ${player.last_name} - ${statType.replace('_', ' ')}`
      };
      const newMainMatchEvent = await MatchEvent.create(mainEventData);

      const newEvents = [{
        ...newMainMatchEvent, // Use the actual saved object from DB
        details: `${player.first_name} ${player.last_name} - ${statType.replace('_', ' ')}`
      }];


      // Handle goal logic
      if (statType === 'goal') {
        setOurScore(prev => prev + 1);

        // Track goal for removal purposes
        const goalRecord = {
          player,
          assist,
          minute: Math.floor(currentTime / 60),
          isOwnGoalByOpponent: false,
          timestamp: Date.now() // Use a timestamp for unique identification
        };
        setRecordedGoals(prev => [...prev, goalRecord]);

        // Log assist if provided
        if (assist) {
          const assistEventData = {
            event_id: event.id,
            player_id: assist.id,
            event_type: 'assist',
            minute: Math.floor(currentTime / 60),
            notes: `${assist.first_name} ${assist.last_name} - assist`
          };
          const newAssistMatchEvent = await MatchEvent.create(assistEventData);
          newEvents.push({
            ...newAssistMatchEvent, // Use the actual saved object from DB
            details: `${assist.first_name} ${assist.last_name} - assist`
          });
        }
      }

      setMatchEvents(prev => [...prev, ...newEvents]);
      toast.success(`${statType.replace('_', ' ')} logged for ${player.first_name}`);

    } catch (error) {
      console.error('Error logging stat:', error);
      toast.error('Failed to log stat');
    }
  };

  const handleScoreAdjustment = (adjustment, scoreType) => {
    // OPPONENT SCORE: Direct adjustment, no modal needed
    if (scoreType === 'opponent') {
      if (adjustment > 0) {
        setOpponentScore(prev => prev + 1);
        toast.success('Opponent score increased');
      } else {
        setOpponentScore(prev => Math.max(0, prev - 1));
        toast.success('Opponent score decreased');
      }
      return;
    }

    // OUR SCORE: Use modal for player attribution and goal management
    if (adjustment > 0) {
      // PLUS button: Add goal with player selection
      setScoreAdjustmentModal({
        isOpen: true,
        type: 'add_goal',
        scoreType: 'our'
      });
    } else {
      // MINUS button: Remove goal with goal selection
      if (recordedGoals.length === 0) {
        // No recorded goals to remove, just decrement score
        setOurScore(prev => Math.max(0, prev - 1));
        toast.info('Score decreased. No specific goal to remove.');
      } else {
        // Show modal to select which goal to remove
        setScoreAdjustmentModal({
          isOpen: true,
          type: 'remove_goal',
          scoreType: 'our'
        });
      }
    }
  };

  const handleScoreAdjustmentConfirm = async (data) => {
    if (data.type === 'add') {
      // Add goal with player attribution
      await logStat({
        statType: 'goal',
        player: data.player,
        assist: data.assist,
        isOwnGoalByOpponent: data.isOwnGoalByOpponent || false
      });
    } else if (data.type === 'remove') {
      // Remove goal and associated assist
      const goalToRemove = data.goalToRemove;

      // Remove from recorded goals
      setRecordedGoals(prev => prev.filter(g => g.timestamp !== goalToRemove.timestamp));

      // Remove corresponding MatchEvents (this can be complex, for now, just remove from UI events)
      setMatchEvents(prev => prev.filter(e => {
        // This logic needs to handle own goals gracefully
        const isGoalEvent = !goalToRemove.isOwnGoalByOpponent && e.event_type === 'goal' && e.player_id === goalToRemove.player.id && e.minute === goalToRemove.minute;
        const isAssistEvent = !goalToRemove.isOwnGoalByOpponent && e.event_type === 'assist' && goalToRemove.assist && e.player_id === goalToRemove.assist.id && e.minute === goalToRemove.minute;
        const isOpponentOwnGoalEvent = goalToRemove.isOwnGoalByOpponent && e.event_type === 'goal' && e.notes === 'Own Goal by Opponent' && e.minute === goalToRemove.minute;

        return !(isGoalEvent || isAssistEvent || isOpponentOwnGoalEvent);
      }));

      // Adjust score - always our score in this modal
      setOurScore(prev => Math.max(0, prev - 1));

      toast.success('Goal removed successfully');
    }
    setScoreAdjustmentModal({ isOpen: false, type: null });
  };

  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2 || typeof pos1.col === 'undefined' || typeof pos1.row === 'undefined' || typeof pos2.col === 'undefined' || typeof pos2.row === 'undefined') {
      return Infinity;
    }
    const dx = pos1.col - pos2.col;
    const dy = pos1.row - pos2.row;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const remapPlayersForNewFormation = (oldFormationName, newFormationName, currentPositions) => {
    if (!team || !team.default_match_format) return currentPositions;

    const currentMatchFormatConfig = FORMATIONS[team.default_match_format] || {};
    const newFormationConfig = currentMatchFormatConfig[newFormationName] || [];

    if (newFormationConfig.length === 0) return {};

    const newPositions = {};
    const usedNewPositions = new Set();

    const playersWithCurrentPosDetails = Object.entries(currentPositions)
      .map(([oldPositionId, playerId]) => {
        let oldPosDetails = null;
        for (const fName in currentMatchFormatConfig) {
          const config = currentMatchFormatConfig[fName];
          oldPosDetails = config.find(pos => pos.id === oldPositionId);
          if (oldPosDetails) break;
        }
        return { playerId, oldPosDetails };
      })
      .filter(p => p.oldPosDetails);

    playersWithCurrentPosDetails.sort((a, b) => {
      if (b.oldPosDetails.row !== a.oldPosDetails.row) {
        return b.oldPosDetails.row - a.oldPosDetails.row;
      }
      return a.oldPosDetails.col - b.oldPosDetails.col;
    });

    playersWithCurrentPosDetails.forEach(({ playerId, oldPosDetails }) => {
      let bestMatch = null;
      let shortestDistance = Infinity;

      newFormationConfig.forEach(newPos => {
        if (usedNewPositions.has(newPos.id)) return;

        const distance = calculateDistance(oldPosDetails, newPos);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          bestMatch = newPos;
        }
      });

      if (bestMatch) {
        newPositions[bestMatch.id] = playerId;
        usedNewPositions.add(bestMatch.id);
      }
    });

    return newPositions;
  };

  const handleFormationChange = (newFormation) => {
    if (Object.keys(playerPositions).length > 0) {
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
        }
      }
    }

    setFormation(newFormation);
    setSelection(null);
  };

  const handlePlayerClick = (playerId, currentPositionId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    if (!selection) {
      setSelection({ type: 'player', id: playerId, sourceId: currentPositionId });
      // Removed setSelectedPlayer as it's no longer used for stat logging directly
    } else if (selection.type === 'player') {
      if (selection.id === playerId) {
        setSelection(null);
      } else {
        // Perform swap
        performPlayerMove(selection, { type: 'player', id: playerId, sourceId: currentPositionId });
      }
    } else if (selection.type === 'position') {
      performPlayerMove({ id: playerId, sourceId: currentPositionId }, selection);
    }
  };

  const handlePositionClick = (positionId) => {
    if (!selection) {
      setSelection({ type: 'position', id: positionId });
    } else if (selection.type === 'player') {
      performPlayerMove(selection, { type: 'position', id: positionId });
    } else if (selection.type === 'position') {
      if (selection.id === positionId) {
        setSelection(null);
      } else {
        setSelection({ type: 'position', id: positionId });
      }
    }
  };

  const performPlayerMove = (playerToMove, target) => {
    const newPositions = { ...playerPositions };

    const sourcePlayerId = playerToMove.id;
    const sourcePositionId = playerToMove.sourceId; // 'bench' or a position ID

    const targetIsPlayer = target.type === 'player';
    const targetPosId = targetIsPlayer ? target.sourceId : target.id;
    const playerWhoWasAtTargetPosId = newPositions[targetPosId] || null; // The player who is currently at the target pitch spot

    // 1. Vacate the source position if it's on the pitch
    if (sourcePositionId !== 'bench') {
      delete newPositions[sourcePositionId];
    }

    // 2. Vacate the target position if it's occupied by another player
    if (playerWhoWasAtTargetPosId) {
      delete newPositions[targetPosId];
    }

    // 3. Place source player at the target position (if it's on the pitch)
    if (targetPosId !== 'bench') {
      newPositions[targetPosId] = sourcePlayerId;
      // Update entry time if coming from bench
      if (sourcePositionId === 'bench') {
        setPlayerEntryTimes(prev => ({ ...prev, [sourcePlayerId]: currentTime }));
      }
    }

    // 4. If a player was displaced (`playerWhoWasAtTargetPosId`), move them to the source's original position (if source was on pitch)
    if (playerWhoWasAtTargetPosId && sourcePositionId !== 'bench') {
      newPositions[sourcePositionId] = playerWhoWasAtTargetPosId;
    }

    // --- Substitution History Logging ---
    const playerInDetails = players.find(p => p.id === sourcePlayerId);
    const playerOutDetails = players.find(p => p.id === playerWhoWasAtTargetPosId);

    let logSub = false;
    let subPlayerInName = '';
    let subPlayerOutName = '';

    // Scenario 1: Player from bench comes onto the pitch
    if (sourcePositionId === 'bench' && targetPosId !== 'bench') {
      logSub = true;
      subPlayerInName = playerInDetails ? `${playerInDetails.first_name} ${playerInDetails.last_name}` : 'Unknown Player';
      subPlayerOutName = playerOutDetails ? `${playerOutDetails.first_name} ${playerOutDetails.last_name}` : 'Bench';
    }
    // Scenario 2: Player from pitch goes to the bench
    else if (sourcePositionId !== 'bench' && targetPosId === 'bench') {
      logSub = true;
      subPlayerInName = 'Bench';
      subPlayerOutName = playerInDetails ? `${playerInDetails.first_name} ${playerInDetails.last_name}` : 'Unknown Player';
    }
    // Scenario 3: Player on pitch swaps with another player on pitch (true pitch-to-pitch substitution)
    else if (sourcePositionId !== 'bench' && targetPosId !== 'bench' && playerOutDetails) {
      logSub = true;
      subPlayerInName = playerInDetails ? `${playerInDetails.first_name} ${playerInDetails.last_name}` : 'Unknown Player';
      subPlayerOutName = playerOutDetails ? `${playerOutDetails.first_name} ${playerOutDetails.last_name}` : 'Unknown Player';
    }

    if (logSub) {
      setSubstitutionHistory(prev => [...prev, {
        minute: Math.round(currentTime / 60),
        playerIn: subPlayerInName,
        playerOut: subPlayerOutName,
        timestamp: Date.now()
      }]);
    }

    setPlayerPositions(newPositions);
    setSelection(null);
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      // Remove from positions if on pitch
      const newPositions = { ...playerPositions };
      const positionId = Object.keys(newPositions).find(posId => newPositions[posId] === playerId);
      if (positionId) {
        delete newPositions[positionId];
        setPlayerPositions(newPositions);
      }

      // Remove from players list
      setPlayers(prev => prev.filter(p => p.id !== playerId));

      // Clear any selection
      if (selection?.id === playerId) {
        setSelection(null);
      }

      toast.success('Player removed from match');
    } catch (error) {
      console.error('Error removing player:', error);
      toast.error('Failed to remove player');
    }
  };

  const getPlayerForPosition = (positionId) => {
    const playerId = playerPositions[positionId];
    return playerId ? players.find(p => p.id === playerId) : null;
  };

  const handleDismissWarning = () => {
    setShowFormatWarning(false);
  };

  const handleGoToTeamSettings = () => {
    if (team) navigate(createPageUrl('Teams') + `?teamId=${team.id}&edit=true`);
  };

  const handleGoToSquadTactics = () => {
    if (team && event) navigate(createPageUrl('SquadTactics') + `?teamId=${team.id}&eventId=${event.id}&returnToLive=true`);
  };

  if (isLoading) return <div className="p-4">Loading match...</div>;
  if (error) return <div className="p-4 text-red-600 font-bold">{error}</div>;
  if (!event || !team) return <div className="p-4">Match data not found</div>;
  if (isMatchCompleted) return null; // Component should not render if match is already completed and navigated away

  const formatKey = team.default_match_format;
  const formationKey = formation;
  const formationConfig = FORMATIONS[formatKey]?.[formationKey] || [];
  const availableFormations = FORMATIONS[formatKey] ? Object.keys(FORMATIONS[formatKey]) : [];

  const playersOnPitchIds = Object.values(playerPositions);
  const playersOnPitch = players.filter(p => playersOnPitchIds.includes(p.id));
  const availablePlayers = players.filter(p => !playersOnPitchIds.includes(p.id));

  // Log stat buttons - REMOVED SUB BUTTON and made remaining buttons larger
  const floatingButtons = [
    { icon: Target, label: 'Goal', statType: 'goal', bgColor: 'bg-slate-800' },
    { icon: Heart, label: 'Assist', statType: 'assist', bgColor: 'bg-slate-800' },
    { icon: Square, label: 'Yellow', statType: 'yellow_card', bgColor: 'bg-slate-800' },
    { icon: SquareX, label: 'Red', statType: 'red_card', bgColor: 'bg-slate-800' },
    { icon: Shield, label: 'Save', statType: 'save', bgColor: 'bg-slate-800' },
    { icon: Crosshair, label: 'Tackle', statType: 'tackle', bgColor: 'bg-slate-800' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Live Match</h1>
            <p className="text-xs text-slate-500">{team.name} vs {event.opponent}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowEventLog(true)}>
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      {/* Format Mismatch Warning */}
      {showFormatWarning && formatMismatchDetails && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 mx-4 rounded-md">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Formation Mismatch Warning
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p className="mb-2">
                      This match is set to <strong>{formatMismatchDetails.eventFormat}</strong> format,
                      but your team's default is <strong>{formatMismatchDetails.teamDefault}</strong>.
                    </p>
                    {formatMismatchDetails.hasFormation && (
                      <p className="mb-2">
                        Your saved squad tactics formation "<strong>{formatMismatchDetails.formationName}</strong>"
                        may not be compatible with the current match format.
                      </p>
                    )}
                    <p className="font-medium">
                      To fix this, you can either:
                    </p>
                    <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                      <li>Update your team's default match format to {formatMismatchDetails.eventFormat}</li>
                      <li>Update your squad tactics for {formatMismatchDetails.eventFormat} format</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="-m-2 p-2 rounded-md inline-flex text-amber-400 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onClick={handleDismissWarning}
              >
                <span className="sr-only">Dismiss</span>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button size="sm" variant="outline" onClick={handleGoToTeamSettings}>
              Edit Team Settings
            </Button>
            <Button size="sm" variant="outline" onClick={handleGoToSquadTactics}>
              Update Squad Tactics
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismissWarning}>
              Continue Anyway
            </Button>
          </div>
        </div>
      )}

      {/* Timer & Scoreboard - REDESIGNED */}
      <div className="p-2 md:p-4">
        <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-4 space-y-4 max-w-2xl mx-auto">
          {/* Main Display: Score & Timer */}
          <div className="flex items-center justify-between text-center px-2">
            <div className="flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider">MY TEAM</span>
              <p className="text-5xl sm:text-6xl font-mono font-bold">{ourScore}</p>
            </div>
            <div className="flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider">MATCH TIME</span>
              <p className="text-4xl sm:text-5xl font-mono font-bold text-cyan-400">{formatTime(currentTime)}</p>
            </div>
            <div className="flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider">OPPONENT</span>
              <p className="text-5xl sm:text-6xl font-mono font-bold">{opponentScore}</p>
            </div>
          </div>
          
          {/* Controls Deck */}
          <div className="flex items-center justify-between text-center pt-3 border-t border-slate-700/50">
             {/* My Team Score Controls */}
            <div className="flex-1 flex justify-center items-center gap-3">
              <button onClick={() => handleScoreAdjustment(1, 'our')} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors font-bold text-lg" disabled={isConfirmingEnd}>+</button>
              <button onClick={() => handleScoreAdjustment(-1, 'our')} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors font-bold text-lg" disabled={isConfirmingEnd}>-</button>
            </div>

            {/* Timer Controls */}
            <div className="flex-1 flex justify-center items-center gap-2 border-x border-slate-700/50">
              <button onClick={() => adjustTime(-1)} className="w-7 h-7 bg-white/10 text-white rounded-md flex items-center justify-center hover:bg-white/20 transition-colors font-bold text-xs" disabled={isConfirmingEnd} title="Remove 1 minute">-1</button>
              {!isTimerRunning ? (
                  <button onClick={startTimer} className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg" disabled={isConfirmingEnd} title="Start timer"><Play className="w-5 h-5 ml-0.5" /></button>
              ) : (
                  <button onClick={pauseTimer} className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors shadow-lg" disabled={isConfirmingEnd} title="Pause timer"><Pause className="w-5 h-5" /></button>
              )}
              <button onClick={() => adjustTime(1)} className="w-7 h-7 bg-white/10 text-white rounded-md flex items-center justify-center hover:bg-white/20 transition-colors font-bold text-xs" disabled={isConfirmingEnd} title="Add 1 minute">+1</button>
            </div>

            {/* Opponent Score Controls */}
            <div className="flex-1 flex justify-center items-center gap-3">
              <button onClick={() => handleScoreAdjustment(1, 'opponent')} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors font-bold text-lg" disabled={isConfirmingEnd}>+</button>
              <button onClick={() => handleScoreAdjustment(-1, 'opponent')} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors font-bold text-lg" disabled={isConfirmingEnd}>-</button>
            </div>
          </div>
          
          {/* Finish Match Button */}
          <div className="flex justify-center pt-4 border-t border-slate-700/50">
            <Button
              onClick={handleEndMatch}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors"
              disabled={isConfirmingEnd}
            >
              {isConfirmingEnd ? "FINISHING..." : "FINISH MATCH"}
            </Button>
          </div>
        </div>
      </div>

      {/* Log Stats - Made buttons bigger for mobile */}
      <div className="p-1 md:p-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 px-2 md:px-6 pt-2 md:pt-6">
            <CardTitle className="text-sm font-bold text-slate-800">Log Stats</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 md:px-6 pb-2 md:pb-6">
            <div className="flex w-full gap-1.5">
              {floatingButtons.map((btn) => (
                <button
                  key={btn.statType}
                  onClick={() => {
                    setStatLoggerModal({ isOpen: true, statType: btn.statType });
                  }}
                  className="flex-1 bg-slate-800 text-white p-2 rounded-lg flex flex-col items-center justify-center gap-1.5 hover:opacity-80 transition-opacity h-16"
                  disabled={isConfirmingEnd}
                >
                  <btn.icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold leading-tight tracking-tighter uppercase">{btn.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tactical Pitch */}
      <div className="p-1 md:p-4">
        <Card className="shadow-sm">
          <CardContent className="p-1 md:p-2">
            <div
              className="relative aspect-[2/3] bg-green-600 rounded-lg overflow-hidden shadow-inner"
              onClick={() => { setSelection(null); }}
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9c1edbf77d9233404b226/ada40ee79_AdobeStock_1522404292.jpg"
                alt="Football pitch"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

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
                      >
                        <div
                          className={cn(
                            "relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer",
                            {
                              "bg-black/20": !isSelectedPosition && !player,
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

                                {/* TIME INDICATOR - Top Left (MINUTES ONLY) */}
                                {playerMinutes[player.id] !== undefined && playerMinutes[player.id] > 0 && (
                                  <div className="absolute -top-1 -left-1 bg-black/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white z-30">
                                    {Math.floor(playerMinutes[player.id] / 60)}'
                                  </div>
                                )}

                                {/* Sub button - Top Right */}
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="absolute -top-1 -right-1 h-5 w-5 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md z-30 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubstitutionModal({ isOpen: true, playerOut: player, playerIn: null });
                                  }}
                                  disabled={isConfirmingEnd}
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
                  <p className="text-white/80 text-center p-4 text-sm bg-black/40 rounded-lg">
                    Select a formation to position players.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bench - Keep remove buttons here */}
      <div className="p-1 md:p-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-2 md:px-6 pt-2 md:pt-6">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              Bench ({availablePlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6 pb-2 md:pb-6">
            <div className="space-y-2">
              {availablePlayers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">All players positioned.</p>
              ) : (
                availablePlayers.map((player) => {
                  const isSelected = selection?.type === 'player' && selection.id === player.id;
                  const minutesPlayed = playerMinutes[player.id] || 0; // minutesPlayed is in seconds

                  return (
                    <div
                      key={player.id}
                      className={cn(
                        "flex items-center p-3 bg-white rounded-lg border shadow-sm cursor-pointer transition-all",
                        isSelected && "ring-2 ring-blue-500 bg-blue-50"
                      )}
                      onClick={() => handlePlayerClick(player.id, 'bench')}
                    >
                      <div className="relative">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 bg-slate-600 text-white"
                        )}>
                          {player.jersey_number || '?'}
                        </div>
                        {/* TIME INDICATOR FOR BENCH PLAYERS (MINUTES ONLY) */}
                        {minutesPlayed > 0 && (
                          <div className="absolute -top-1 -right-1 bg-black/90 text-white text-[8px] font-bold px-1 py-0.5 rounded-full border border-white">
                            {Math.floor(minutesPlayed / 60)}'
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 ml-3">
                        <p className="font-semibold text-slate-800 truncate text-sm">
                          {player.first_name} {player.last_name}
                        </p>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          {player.main_position}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 ml-2 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubstitutionModal({ isOpen: true, playerIn: player, playerOut: null });
                        }}
                        disabled={isConfirmingEnd}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>

                      {/* Remove button - ONLY for bench players */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 ml-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            disabled={isConfirmingEnd}
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {player.first_name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the player from this match day squad. Are you sure?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemovePlayer(player.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formation - Moved here */}
      <div className="p-1 md:p-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-2 md:px-6 pt-2 md:pt-6">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Dribbble className="w-4 h-4" />
              Formation
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6 pb-2 md:pb-6">
            <Select value={formationKey} onValueChange={handleFormationChange} disabled={isConfirmingEnd}>
              <SelectTrigger>
                <SelectValue placeholder="Select formation..." />
              </SelectTrigger>
              <SelectContent>
                {availableFormations.map((fKey) => (
                  <SelectItem key={fKey} value={fKey}>
                    {formatKey} ({fKey})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Substitution History */}
      {substitutionHistory.length > 0 && (
        <div className="p-1 md:p-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 px-2 md:px-6 pt-2 md:pt-6">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                Substitution History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6 pb-2 md:pb-6">
              <div className="space-y-2">
                {substitutionHistory.map((sub, index) => (
                  <div key={sub.timestamp || index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-semibold">{sub.playerIn}</span>
                      <span className="text-slate-500 mx-2">←→</span>
                      <span className="font-semibold">{sub.playerOut}</span>
                    </div>
                    <Badge variant="outline">{sub.minute}'</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <SubstitutionModal
        isOpen={substitutionModal.isOpen}
        onClose={() => setSubstitutionModal({ isOpen: false, playerIn: null, playerOut: null })}
        onConfirm={(playerOutId, playerInId) => {
          // Handle substitution logic here
          const playerOut = players.find(p => p.id === playerOutId);
          const playerIn = players.find(p => p.id === playerInId);

          if (playerOut && playerIn) {
            // Find position of player going off
            const positionId = Object.keys(playerPositions).find(pos => playerPositions[pos] === playerOutId);
            if (positionId) {
              const newPositions = { ...playerPositions };
              newPositions[positionId] = playerInId;
              setPlayerPositions(newPositions);

              // Update entry time for incoming player
              setPlayerEntryTimes(prev => ({
                ...prev,
                [playerInId]: currentTime
              }));

              // Log substitution
              setSubstitutionHistory(prev => [...prev, {
                minute: Math.round(currentTime / 60), // Log minutes
                playerOut: `${playerOut.first_name} ${playerOut.last_name}`,
                playerIn: `${playerIn.first_name} ${playerIn.last_name}`,
                timestamp: Date.now()
              }]);

              toast.success('Substitution completed!');
            }
          }

          setSubstitutionModal({ isOpen: false, playerIn: null, playerOut: null });
        }}
        playerIn={substitutionModal.playerIn}
        playerOut={substitutionModal.playerOut}
        pitchPlayers={formationConfig
          .map(pos => ({
            player: getPlayerForPosition(pos.id),
            positionId: pos.id,
            positionLabel: pos.label
          }))
          .filter(p => p.player)
        }
        benchPlayers={availablePlayers}
      />

      <EventLogModal
        isOpen={showEventLog}
        events={matchEvents}
        onClose={() => setShowEventLog(false)}
      />

      {/* Stat Logger Modal */}
      <StatLoggerModal
        isOpen={statLoggerModal.isOpen}
        onClose={() => setStatLoggerModal({ isOpen: false, statType: null })}
        statType={statLoggerModal.statType}
        players={playersOnPitch}
        onLogStat={logStat}
      />

      {/* Score Adjustment Modal */}
      <ScoreAdjustmentModal
        isOpen={scoreAdjustmentModal.isOpen}
        onClose={() => setScoreAdjustmentModal({ isOpen: false, type: null, scoreType: null })}
        adjustmentType={scoreAdjustmentModal.type}
        scoreType={scoreAdjustmentModal.scoreType}
        players={playersOnPitch}
        existingGoals={recordedGoals}
        onConfirm={handleScoreAdjustmentConfirm}
      />
    </div>
  );
}
