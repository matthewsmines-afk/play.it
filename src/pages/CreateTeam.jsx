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
        <div className="min-h-screen bg-slate-50 relative">
            {/* Faded Football Pitch Background - Same as Coach Dashboard */}
            <div 
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9c1edbf77d9233404b226/2f17c4a5e_AdobeStock_865516778.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.40,
                    top: '0px'
                }}
            />

            {/* Header matching Coach Dashboard style */}
            <div className="p-4 sm:p-6 bg-white border-b border-slate-200 relative z-10">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-start gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleBack}
                            className="flex-shrink-0 bg-white hover:bg-slate-100 border border-slate-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-900" />
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
            
            {/* Content area with z-index */}
            <div className="relative z-10">
                <CreateTeamForm
                    onSubmit={handleCreateTeam}
                    onCancel={handleBack}
                    isPage={true}
                />
            </div>
        </div>
    );
}