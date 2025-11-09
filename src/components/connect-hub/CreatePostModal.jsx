import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Users, Handshake, ShoppingCart, Star, MapPin, Trophy, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Import form components
import CreatePlayerAvailableForm from './forms/CreatePlayerAvailableForm';
import CreateTeamRecruitingForm from './forms/CreateTeamRecruitingForm';
import CreateFriendlyWantedForm from './forms/CreateFriendlyWantedForm';
import CreateEquipmentSaleForm from './forms/CreateEquipmentSaleForm';

const getAvailablePostTypes = (userType) => {
  const allPostTypes = [
    { id: 'player_available', label: 'Player Available', icon: User, form: CreatePlayerAvailableForm, availableFor: ['parent'] },
    { id: 'team_recruiting', label: 'Team Recruiting', icon: Users, form: CreateTeamRecruitingForm, availableFor: ['coach'] },
    { id: 'friendly_wanted', label: 'Friendly Wanted', icon: Handshake, form: CreateFriendlyWantedForm, availableFor: ['coach'] },
    { id: 'equipment_sale', label: 'Equipment For Sale', icon: ShoppingCart, form: CreateEquipmentSaleForm, availableFor: ['parent', 'coach', 'player'] },
    { id: 'coaching_session', label: 'Coaching Session', icon: Star, form: null, availableFor: ['coach'] },
    { id: 'ground_share', label: 'Ground Share', icon: MapPin, form: null, availableFor: ['coach'] },
    { id: 'tournament_announcement', label: 'Tournament', icon: Trophy, form: null, availableFor: ['coach'] },
  ];

  return allPostTypes.filter(postType => 
    postType.availableFor.includes(userType)
  );
};

export default function CreatePostModal({ isOpen, onClose, currentUser, onPostCreated }) {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);

    const availablePostTypes = getAvailablePostTypes(currentUser?.user_type || 'parent');

    const handleSelectType = (type) => {
        if (!type.form) {
            alert("This feature is coming soon!");
            return;
        }
        setSelectedType(type);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setSelectedType(null);
    };
    
    const handleClose = () => {
        setStep(1);
        setSelectedType(null);
        onClose();
    };

    const SelectedForm = selectedType?.form;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    {step === 2 && (
                        <Button variant="ghost" size="sm" onClick={handleBack} className="absolute left-4 top-4">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    )}
                    <DialogTitle className="text-center">
                        {step === 1 ? "Create a New Post" : `Post: ${selectedType.label}`}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === 1 ? 
                            `What would you like to share with the community?${currentUser?.user_type === 'parent' ? ' (Parent options)' : currentUser?.user_type === 'coach' ? ' (Coach options)' : ''}` : 
                            "Fill in the details for your post."
                        }
                    </DialogDescription>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="grid grid-cols-2 gap-4 py-4"
                        >
                            {availablePostTypes.map((type) => (
                                <Button
                                    key={type.id}
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2"
                                    onClick={() => handleSelectType(type)}
                                >
                                    <type.icon className="w-6 h-6" />
                                    <span className="text-sm font-semibold">{type.label}</span>
                                </Button>
                            ))}
                        </motion.div>
                    )}
                    {step === 2 && SelectedForm && (
                         <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                         >
                            <SelectedForm 
                                currentUser={currentUser} 
                                onPostCreated={() => {
                                    onPostCreated();
                                    handleClose();
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}