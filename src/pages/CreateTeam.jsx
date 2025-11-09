import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Team } from '@/entities/Team';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import CreateTeamForm from '../components/teams/CreateTeamForm';

export default function CreateTeam() {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.confirm("Are you sure you want to go back? Any unsaved changes will be lost.")) {
            navigate(createPageUrl('Dashboard'));
        }
    };

    const handleCreateTeam = async (teamData) => {
        try {
            const me = await User.me();
            const additionalCoaches = Array.isArray(teamData.additionalCoaches) ? teamData.additionalCoaches : [];
            const allCoachIds = [...new Set([me.id, ...additionalCoaches])];

            const teamWithCoaches = {
                ...teamData,
                coaches: allCoachIds,
            };
            
            await Team.create(teamWithCoaches);
            navigate(createPageUrl('Dashboard'));
        } catch (error) {
            console.error('Error creating team:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header matching Coach Dashboard style */}
            <div className="p-4 sm:p-6 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-start gap-4">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleBack}
                            className="flex-shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Create New Team</h1>
                            <p className="text-sm text-slate-600 font-light mt-2">
                                Set up your team with essential details and locations
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Content area */}
            <CreateTeamForm
                onSubmit={handleCreateTeam}
                onCancel={handleBack}
                isPage={true}
            />
        </div>
    );
}