
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Team } from '@/entities/Team';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Users, RefreshCw, ArrowLeft, ArrowDownUp } from 'lucide-react'; // Added ArrowDownUp
import { toast } from "sonner";
import { cn } from '@/lib/utils';

import SubstitutionModal from './SubstitutionModal';

// Map formations to specific pitch slots with their coordinates
const FORMATIONS = {
  "3v3": {
    "1-1": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'def', label: 'DEF', col: 3, row: 5 },
      { id: 'att', label: 'ATT', col: 3, row: 3 }
    ],
    "Pyramid": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 2, row: 5 },
      { id: 'rb', label: 'RB', col: 4, row: 5 },
      { id: 'st', label: 'ST', col: 3, row: 3 }
    ]
  },
  "5v5": {
    "1-2-1": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 2, row: 5 },
      { id: 'rb', label: 'RB', col: 4, row: 5 },
      { id: 'cm', label: 'CM', col: 3, row: 4 },
      { id: 'st', label: 'ST', col: 3, row: 2 }
    ],
    "1-1-2": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'cb', label: 'CB', col: 3, row: 5 },
      { id: 'cm', label: 'CM', col: 3, row: 4 },
      { id: 'lf', label: 'LF', col: 2, row: 2 },
      { id: 'rf', label: 'RF', col: 4, row: 2 }
    ],
    "2-2": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 2, row: 5 },
      { id: 'rb', label: 'RB', col: 4, row: 5 },
      { id: 'lf', label: 'LF', col: 2, row: 3 },
      { id: 'rf', label: 'RF', col: 4, row: 3 }
    ],
    "Diamond": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'cb', label: 'CB', col: 3, row: 5 },
      { id: 'lm', label: 'LM', col: 2, row: 4 },
      { id: 'rm', label: 'RM', col: 4, row: 4 },
      { id: 'st', label: 'ST', col: 3, row: 2 }
    ]
  },
  "7v7": {
    "2-3-1": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 2, row: 6 },
      { id: 'rb', label: 'RB', col: 4, row: 6 },
      { id: 'lm', label: 'LM', col: 2, row: 4 },
      { id: 'cm', label: 'CM', col: 3, row: 4 },
      { id: 'rm', label: 'RM', col: 4, row: 4 },
      { id: 'st', label: 'ST', col: 3, row: 2 }
    ],
    "3-2-1": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'cb', label: 'CB', col: 3, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'lm', label: 'LM', col: 2, row: 4 },
      { id: 'rm', label: 'RM', col: 4, row: 4 },
      { id: 'st', label: 'ST', col: 3, row: 2 }
    ],
    "3-1-2": [
        { id: 'gk', label: 'GK', col: 3, row: 7 },
        { id: 'lb', label: 'LB', col: 2, row: 6 },
        { id: 'cb', label: 'CB', col: 3, row: 6 },
        { id: 'rb', label: 'RB', col: 4, row: 6 },
        { id: 'cdm', label: 'CDM', col: 3, row: 4 },
        { id: 'lf', label: 'LF', col: 2, row: 2 },
        { id: 'rf', label: 'RF', col: 4, row: 2 }
    ]
  },
  "9v9": {
    "3-2-3": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 2, row: 6 },
      { id: 'cb', label: 'CB', col: 3, row: 6 },
      { id: 'rb', label: 'RB', col: 4, row: 6 },
      { id: 'cm1', label: 'CM', col: 2, row: 4 },
      { id: 'cm2', label: 'CM', col: 4, row: 4 },
      { id: 'lw', label: 'LW', col: 2, row: 2 },
      { id: 'st', label: 'ST', col: 3, row: 2 },
      { id: 'rw', label: 'RW', col: 4, row: 2 }
    ],
    "3-3-2": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'cb', label: 'CB', col: 3, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'lm', label: 'LM', col: 2, row: 4 },
      { id: 'cm', label: 'CM', col: 3, row: 4 },
      { id: 'rm', label: 'RM', col: 4, row: 4 },
      { id: 'ls', label: 'ST', col: 2, row: 2 },
      { id: 'rs', label: 'ST', col: 4, row: 2 }
    ],
    "4-3-1": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 1, row: 6 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'rb', label: 'RB', col: 5, row: 6 },
      { id: 'lm', label: 'LM', col: 2, row: 4 },
      { id: 'cm', label: 'CM', col: 3, row: 4 },
      { id: 'rm', label: 'RM', col: 4, row: 4 },
      { id: 'st', label: 'ST', col: 3, row: 2 }
    ]
  },
  "11v11": {
    "4-4-2": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 1, row: 6 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'rb', label: 'RB', col: 5, row: 6 },
      { id: 'lm', label: 'LM', col: 1, row: 4 },
      { id: 'lcm', label: 'CM', col: 2, row: 4 },
      { id: 'rcm', label: 'CM', col: 4, row: 4 },
      { id: 'rm', label: 'RM', col: 5, row: 4 },
      { id: 'lst', label: 'ST', col: 2, row: 2 },
      { id: 'rst', label: 'ST', col: 4, row: 2 }
    ],
    "4-3-3": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 1, row: 6 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'rb', label: 'RB', col: 5, row: 6 },
      { id: 'cdm', label: 'CDM', col: 3, row: 5 },
      { id: 'lcm', label: 'CM', col: 2, row: 4 },
      { id: 'rcm', label: 'CM', col: 4, row: 4 },
      { id: 'lw', label: 'LW', col: 1, row: 2 },
      { id: 'st', label: 'ST', col: 3, row: 2 },
      { id: 'rw', label: 'RW', col: 5, row: 2 }
    ],
    "4-5-1": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 1, row: 6 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'rb', label: 'RB', col: 5, row: 6 },
      { id: 'lm', label: 'LM', col: 1, row: 4 },
      { id: 'lcdm', label: 'CDM', col: 2, row: 4 },
      { id: 'cam', label: 'CAM', col: 3, row: 3 },
      { id: 'rcdm', label: 'CDM', col: 4, row: 4 },
      { id: 'rm', label: 'RM', col: 5, row: 4 },
      { id: 'st', label: 'ST', col: 3, row: 2 }
    ],
    "3-5-2": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'cb', label: 'CB', col: 3, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'lwb', label: 'LWB', col: 1, row: 4 },
      { id: 'lcm', label: 'CM', col: 2, row: 4 },
      { id: 'cm', label: 'CM', col: 3, row: 4 },
      { id: 'rcm', label: 'CM', col: 4, row: 4 },
      { id: 'rwb', label: 'RWB', col: 5, row: 4 },
      { id: 'lst', label: 'ST', col: 2, row: 2 },
      { id: 'rst', label: 'ST', col: 4, row: 2 }
    ],
    "4-2-3-1": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lb', label: 'LB', col: 1, row: 6 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'rb', label: 'RB', col: 5, row: 6 },
      { id: 'lcdm', label: 'CDM', col: 2, row: 5 },
      { id: 'rcdm', label: 'CDM', col: 4, row: 5 },
      { id: 'lw', label: 'LW', col: 1, row: 3 },
      { id: 'cam', label: 'CAM', col: 3, row: 3 },
      { id: 'rw', label: 'RW', col: 5, row: 3 },
      { id: 'st', label: 'ST', col: 3, row: 2 }
    ],
    "3-4-3": [
      { id: 'gk', label: 'GK', col: 3, row: 7 },
      { id: 'lcb', label: 'CB', col: 2, row: 6 },
      { id: 'cb', label: 'CB', col: 3, row: 6 },
      { id: 'rcb', label: 'CB', col: 4, row: 6 },
      { id: 'lm', label: 'LM', col: 1, row: 4 },
      { id: 'lcm', label: 'CM', col: 2, row: 4 },
      { id: 'rcm', label: 'CM', col: 4, row: 4 },
      { id: 'rm', label: 'RM', col: 5, row: 4 },
      { id: 'lw', label: 'LW', col: 1, row: 2 },
      { id: 'st', label: 'ST', col: 3, row: 2 },
      { id: 'rw', label: 'RW', col: 5, row: 2 }
    ]
  }
};

export default function SquadTacticalPitch({ roster, team, onBack }) {
  const [playerPositions, setPlayerPositions] = useState({});
  const [formation, setFormation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dragKey, setDragKey] = useState(0);
  const [subModalState, setSubModalState] = useState({ 
    isOpen: false, 
    playerIn: null, 
    playerOut: null 
  });

  useEffect(() => {
    if (team) {
      const transformedPositions = {};
      const teamPlayerPositions = team.player_positions || {};
      for (const playerId in teamPlayerPositions) {
        const posData = teamPlayerPositions[playerId];
        if (posData && posData.position) {
          transformedPositions[posData.position] = playerId;
        }
      }
      setPlayerPositions(transformedPositions);
      setFormation(team.formation || Object.keys(FORMATIONS[team.default_match_format] || {})[0] || '');
    }
  }, [team]);

  const handleSaveFormation = async () => {
    setIsSaving(true);
    try {
      const positionsToSave = {};
      for (const posId in playerPositions) {
        const playerId = playerPositions[posId];
        positionsToSave[playerId] = { position: posId };
      }

      await Team.update(team.id, {
        player_positions: positionsToSave,
        formation: formation
      });
      toast.success('Formation saved successfully!');
    } catch (error) {
      console.error('Error saving formation:', error);
      toast.error('Failed to save formation');
    }
    setIsSaving(false);
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setPlayerPositions(currentPositions => {
      const updatedPositions = {};
      
      Object.keys(currentPositions).forEach(posId => {
        if (currentPositions[posId] !== draggableId) {
          updatedPositions[posId] = currentPositions[posId];
        }
      });

      if (destination.droppableId !== 'bench') {
        const existingPlayerAtDestination = currentPositions[destination.droppableId];
        
        if (existingPlayerAtDestination) {
          const sourcePosition = Object.keys(currentPositions).find(
            posId => currentPositions[posId] === draggableId
          );
          
          if (sourcePosition) {
            updatedPositions[sourcePosition] = existingPlayerAtDestination;
          }
        }
        
        updatedPositions[destination.droppableId] = draggableId;
      }
      
      return updatedPositions;
    });

    setDragKey(prev => prev + 1);
  };

  const handleConfirmSubstitution = (playerOutId, playerInId) => {
    setPlayerPositions(currentPositions => {
      const newPositions = { ...currentPositions };
      const positionOfPlayerOut = Object.keys(newPositions).find(posId => newPositions[posId] === playerOutId);

      if (positionOfPlayerOut) {
        newPositions[positionOfPlayerOut] = playerInId;
      }

      return newPositions;
    });

    setSubModalState({ isOpen: false, playerIn: null, playerOut: null });
    setDragKey(prev => prev + 1);
  };

  const getPlayerForPosition = (positionId) => {
    const playerId = playerPositions[positionId];
    return playerId ? roster.find(p => p.id === playerId) : null;
  };

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

  return (
    <DragDropContext key={dragKey} onDragEnd={handleDragEnd}>
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="shadow-inner bg-slate-50">
              <CardContent className="p-2">
                <div className="relative aspect-[9/16] bg-green-600 bg-[url('/pitch-lines.svg')] bg-cover bg-center rounded-lg overflow-hidden">
                  
                  {formation && formationConfig.length > 0 ? (
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-7 z-10">
                      {formationConfig.map((pos, positionIndex) => (
                        <Droppable key={`${pos.id}-${dragKey}`} droppableId={pos.id}>
                          {(provided, snapshot) => {
                            const player = getPlayerForPosition(pos.id);
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="relative flex items-center justify-center p-1"
                                style={{ gridColumn: pos.col, gridRow: pos.row }}
                              >
                                <div className={cn(
                                  "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
                                  snapshot.isDraggingOver
                                    ? 'bg-black/40 scale-110 shadow-xl'
                                    : (player ? '' : 'bg-black/20')
                                )}>
                                  {(!player || snapshot.isDraggingOver) && (
                                    <span className="text-white font-bold text-xs">{pos.label}</span>
                                  )}
                                </div>
                                {player && (
                                  <Draggable 
                                    key={`${player.id}-${dragKey}`} 
                                    draggableId={player.id} 
                                    index={1000 + positionIndex}
                                  >
                                    {(provided, dragSnapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-grab transition-transform",
                                          dragSnapshot.isDragging ? 'z-20 scale-110' : 'z-10'
                                        )}
                                      >
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold border-3 border-white shadow-lg">
                                          {player.jersey_number || '?'}
                                        </div>
                                        <span className="text-white text-[10px] md:text-xs font-semibold bg-black/60 px-1 py-0.5 rounded-full mt-1 shadow-sm whitespace-nowrap max-w-[80px] truncate">
                                          {player.first_name?.[0]}. {player.last_name}
                                        </span>
                                        <Button 
                                          size="sm" 
                                          variant="secondary" 
                                          className="mt-1 h-5 px-2 text-[9px] bg-white/90 hover:bg-white text-slate-700"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSubModalState({ isOpen: true, playerOut: player, playerIn: null });
                                          }}
                                        >
                                          <ArrowDownUp className="w-3 h-3 mr-1" /> {/* Changed icon from RefreshCw to ArrowDownUp */}
                                          Sub
                                        </Button>
                                      </div>
                                    )}
                                  </Draggable>
                                )}
                                {provided.placeholder}
                              </div>
                            );
                          }}
                        </Droppable>
                      ))}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white/50 text-center p-4">Select a formation to position players.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Formation Setup
                  </CardTitle>
                  {onBack && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onBack}
                      className="text-slate-500 hover:text-slate-700 p-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Label htmlFor="formation" className="font-bold whitespace-nowrap">Formation:</Label>
                  <Select value={formation} onValueChange={setFormation}>
                    <SelectTrigger id="formation" className="w-[180px]">
                      <SelectValue placeholder="Select a formation" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(FORMATIONS[team.default_match_format] || {}).map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSaveFormation}
                  disabled={isSaving || !formation}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Formation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-500" />
                  Substitute Bench ({availablePlayers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="bench">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "space-y-2 p-2 bg-slate-50 rounded-lg min-h-[100px] transition-colors",
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      )}
                    >
                      {availablePlayers.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No players on the bench.</p>
                      ) : (
                        availablePlayers.map((player, index) => (
                          <Draggable key={`${player.id}-bench-${dragKey}`} draggableId={player.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "transition-all",
                                  snapshot.isDragging ? 'opacity-50 rotate-2 scale-105' : ''
                                )}
                              >
                                <div className="flex items-center p-2 bg-white rounded-lg border shadow-sm">
                                  <div {...provided.dragHandleProps} className="cursor-grab pr-2">
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                      player.jersey_number ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                                    )}>
                                      {player.jersey_number || '?'}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 truncate text-sm">{player.first_name} {player.last_name}</p>
                                    <Badge variant="secondary" className="text-xs">{player.main_position}</Badge>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 ml-2 flex-shrink-0"
                                    onClick={() => setSubModalState({ isOpen: true, playerIn: player, playerOut: null })}
                                  >
                                    <ArrowDownUp className="w-4 h-4" /> {/* Changed icon from RefreshCw to ArrowDownUp */}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
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
    </DragDropContext>
  );
}
