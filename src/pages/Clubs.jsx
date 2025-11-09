
import React, { useState, useEffect } from 'react';
import { Club } from '@/entities/Club';
import { Team } from '@/entities/Team';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload, Building2, Users, Search, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { UploadFile, ExtractDataFromUploadedFile } from '@/integrations/Core';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import CreateClubForm from '../components/clubs/CreateClubForm';
import ClubCard from '../components/clubs/ClubCard';
import ImportClubsModal from '../components/clubs/ImportClubsModal';

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadClubsData();
  }, []);

  const loadClubsData = async () => {
    setIsLoading(true);
    try {
      const [clubsData, teamsData] = await Promise.all([
        Club.list('-created_date'),
        Team.list()
      ]);
      setClubs(clubsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading clubs data:', error);
    }
    setIsLoading(false);
  };

  const handleCreateClub = async (clubData) => {
    try {
      await Club.create(clubData);
      setShowCreateForm(false);
      loadClubsData();
    } catch (error) {
      console.error('Error creating club:', error);
    }
  };

  const handleImportClubs = async (file) => {
    try {
      const { file_url } = await UploadFile({ file });
      
      const clubSchema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            short_name: { type: "string" },
            location: { type: "string" },
            founded_year: { type: "number" },
            website: { type: "string" },
            contact_email: { type: "string" },
            contact_phone: { type: "string" },
            address: { type: "string" },
            primary_color: { type: "string" },
            secondary_color: { type: "string" },
            description: { type: "string" }
          },
          required: ["name"]
        }
      };

      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: clubSchema
      });

      if (result.status === 'success' && result.output) {
        await Club.bulkCreate(result.output);
        setShowImportModal(false);
        loadClubsData();
      } else {
        console.error('Failed to extract club data:', result.details);
      }
    } catch (error) {
      console.error('Error importing clubs:', error);
    }
  };

  const getClubTeamCount = (clubId) => {
    return teams.filter(team => team.club_id === clubId).length;
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.location && club.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* FIXED: Clean white header */}
      <div className="p-4 md:p-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(createPageUrl('Dashboard'))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Club Management</h1>
            <p className="text-sm text-slate-600">Find your club or create a new one</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-slate-900 text-white hover:bg-slate-800 gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create New Club</span>
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Search */}
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search clubs by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
        </Card>

        <AnimatePresence>
          {showCreateForm && (
            <CreateClubForm
              onSubmit={handleCreateClub}
              onCancel={() => setShowCreateForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Clubs Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading clubs...</div>
        ) : filteredClubs.length === 0 && !showCreateForm ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {searchTerm ? 'No clubs found' : 'No clubs yet'}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Create your first club or import clubs from a CSV file'}
              </p>
              {!searchTerm && (
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Club
                  </Button>
                  <Button 
                    onClick={() => setShowImportModal(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  teamCount={getClubTeamCount(club.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <ImportClubsModal 
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportClubs}
        />
      </div>
    </div>
  );
}
