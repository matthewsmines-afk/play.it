
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/entities/Event';
import { Player } from '@/entities/Player';
import { Team } from '@/entities/Team';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from 'lucide-react';
import { createPageUrl } from '@/utils';
import LogMatchStatsForm from '../components/teams/LogMatchStatsForm';

export default function MatchReportPage() {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('eventId');
      if (!eventId) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      try {
        const eventData = await Event.get(eventId);
        if (!eventData) throw new Error("Event not found");

        const [teamData, playersData] = await Promise.all([
          Team.get(eventData.team_id),
          Player.filter({ team_id: eventData.team_id })
        ]);

        setEvent(eventData);
        setTeam(teamData);
        setPlayers(playersData);
      } catch (error) {
        console.error("Error loading match report data:", error);
        navigate(createPageUrl('Dashboard'));
      }
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);
  
  const handleSave = () => {
    // This will be triggered from the child component.
    // On successful save, navigate back to the team's event page.
    navigate(createPageUrl('Teams') + `?teamId=${team.id}&tab=events`);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading Match Report...</p>
      </div>
    );
  }

  if (!event || !team) {
    return <div className="p-6">Error loading data.</div>;
  }

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Teams') + `?teamId=${team.id}&tab=events`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Match Report</h1>
          <p className="text-sm text-slate-600">
            vs {event.opponent} on {new Date(event.date_time).toLocaleDateString()}
          </p>
        </div>
      </div>

      <LogMatchStatsForm 
        event={{...event, team_name: team.name}} // Pass team name for better labels
        players={players}
        onSave={handleSave}
        onCancel={() => navigate(createPageUrl('Teams') + `?teamId=${team.id}&tab=events`)}
        isPage={true} // Prop to indicate it's a page, not a modal
      />
    </div>
  );
}
