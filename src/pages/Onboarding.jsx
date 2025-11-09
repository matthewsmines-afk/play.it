import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User as CoachIcon, Shield, Heart, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  {
    name: 'Coach',
    value: 'coach',
    description: 'Manage teams, schedule events, and track player performance',
    details: [
      'Create and manage teams',
      'Schedule matches and training',
      'Track player statistics',
      'Communicate with parents'
    ],
    icon: CoachIcon,
    color: 'blue'
  },
  {
    name: 'Parent',
    value: 'parent',
    description: 'Follow your child\'s team and stay updated on all activities',
    details: [
      'View child\'s match schedule',
      'RSVP to events',
      'Track player progress',
      'Connect with coaches'
    ],
    icon: Heart,
    color: 'red'
  },
  {
    name: 'Player',
    value: 'player',
    description: 'Manage your own profile and team activities (14+)',
    details: [
      'View your match schedule',
      'Track your stats',
      'Communicate with team',
      'Manage your profile'
    ],
    icon: Shield,
    color: 'green'
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = role selection, 2 = confirmation

  const handleSelectRole = (roleValue) => {
    setSelectedRole(roleValue);
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!selectedRole || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await User.updateMyUserData({ 
        user_type: selectedRole,
        available_roles: [selectedRole]
      });
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Failed to set user role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedRole(null);
  };

  const selectedRoleData = roles.find(r => r.value === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9c1edbf77d9233404b226/e2b8a8c86_PlayIT.png" 
            alt="PLAY.IT Logo" 
            className="h-12 mx-auto mb-6" 
          />
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome to PLAY.IT</h1>
          <p className="text-slate-600 text-lg">
            {step === 1 ? 'Choose your role to get started' : 'Review your selection'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {roles.map((role, index) => (
                <motion.div
                  key={role.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    onClick={() => handleSelectRole(role.value)}
                    className={cn(
                      'cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105',
                      'border-2 hover:border-slate-300'
                    )}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={cn(
                        'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                        role.color === 'blue' && 'bg-blue-100',
                        role.color === 'red' && 'bg-red-100',
                        role.color === 'green' && 'bg-green-100'
                      )}>
                        <role.icon className={cn(
                          'w-8 h-8',
                          role.color === 'blue' && 'text-blue-600',
                          role.color === 'red' && 'text-red-600',
                          role.color === 'green' && 'text-green-600'
                        )} />
                      </div>
                      <CardTitle className="text-xl">{role.name}</CardTitle>
                      <CardDescription className="text-sm mt-2">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {role.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-2 border-slate-300 shadow-xl">
                <CardHeader className="text-center pb-6">
                  <div className={cn(
                    'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
                    selectedRoleData.color === 'blue' && 'bg-blue-100',
                    selectedRoleData.color === 'red' && 'bg-red-100',
                    selectedRoleData.color === 'green' && 'bg-green-100'
                  )}>
                    <selectedRoleData.icon className={cn(
                      'w-10 h-10',
                      selectedRoleData.color === 'blue' && 'text-blue-600',
                      selectedRoleData.color === 'red' && 'text-red-600',
                      selectedRoleData.color === 'green' && 'text-green-600'
                    )} />
                  </div>
                  <CardTitle className="text-2xl mb-2">You selected: {selectedRoleData.name}</CardTitle>
                  <CardDescription className="text-base">
                    {selectedRoleData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-6">
                    <h3 className="font-semibold text-slate-800 mb-3">What you can do:</h3>
                    <ul className="space-y-2">
                      {selectedRoleData.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> You can add additional roles later if needed (e.g., if you're both a parent and a coach).
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Setting up...' : 'Confirm & Continue'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}