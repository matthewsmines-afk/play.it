import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/entities/Player';
import { User } from '@/entities/User';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { MultiSelect } from '@/components/ui/MultiSelect';

const POSITIONS = [
  { value: "GK", label: "Goalkeeper (GK)", category: "Goalkeeper" },
  { value: "CB", label: "Center Back (CB)", category: "Defender" },
  { value: "LB", label: "Left Back (LB)", category: "Defender" },
  { value: "RB", label: "Right Back (RB)", category: "Defender" },
  { value: "LWB", label: "Left Wing Back (LWB)", category: "Defender" },
  { value: "RWB", label: "Right Wing Back (RWB)", category: "Defender" },
  { value: "CDM", label: "Defensive Midfielder (CDM)", category: "Midfielder" },
  { value: "CM", label: "Central Midfielder (CM)", category: "Midfielder" },
  { value: "CAM", label: "Attacking Midfielder (CAM)", category: "Midfielder" },
  { value: "LM", label: "Left Midfielder (LM)", category: "Midfielder" },
  { value: "RM", label: "Right Midfielder (RM)", category: "Midfielder" },
  { value: "LW", label: "Left Winger (LW)", category: "Midfielder" },
  { value: "RW", label: "Right Winger (RW)", category: "Midfielder" },
  { value: "ST", label: "Striker (ST)", category: "Attacker" },
  { value: "CF", label: "Center Forward (CF)", category: "Attacker" },
  { value: "LF", label: "Left Forward (LF)", category: "Attacker" },
  { value: "RF", label: "Right Forward (RF)", category: "Attacker" }
];

const BASIC_POSITIONS_MAP = {
  Goalkeeper: "GK",
  Defender: "CB",
  Midfielder: "CM",
  Attacker: "ST"
};

const ADVANCED_TO_BASIC_MAP = {
  GK: "Goalkeeper",
  CB: "Defender", LB: "Defender", RB: "Defender", LWB: "Defender", RWB: "Defender",
  CDM: "Midfielder", CM: "Midfielder", CAM: "Midfielder", LM: "Midfielder", RM: "Midfielder", LW: "Midfielder", RW: "Midfielder",
  ST: "Attacker", CF: "Attacker", LF: "Attacker", RF: "Attacker"
};

export default function AddMyChild() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    main_position: '',
    preferred_foot: '',
    positions: [],
    date_of_birth: '',
    emergency_contact: '',
    medical_notes: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [positionMode, setPositionMode] = useState('basic');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
        navigate(createPageUrl('Dashboard'));
      }
      setIsLoading(false);
    };
    loadUser();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return null;
    }
  };

  const handleBasicPositionChange = (basicPosition) => {
    const advancedPosition = BASIC_POSITIONS_MAP[basicPosition];
    setFormData(prev => ({ ...prev, main_position: advancedPosition }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      console.log('Creating child for user:', currentUser.id);
      console.log('Form data:', formData);
      
      const playerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        main_position: formData.main_position,
        preferred_foot: formData.preferred_foot,
        positions: formData.positions,
        date_of_birth: formData.date_of_birth,
        emergency_contact: formData.emergency_contact,
        medical_notes: formData.medical_notes,
        parent_user_id: currentUser.id,
        team_memberships: [],
        career_stats: {
          games_played: 0,
          goals: 0,
          assists: 0,
          tackles: 0,
          saves: 0,
          minutes_played: 0,
          man_of_the_match_awards: 0
        }
      };

      console.log('Creating player with data:', playerData);
      
      const newPlayer = await Player.create(playerData);
      console.log('Created player:', newPlayer);
      
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error creating child profile:', error);
      alert('Failed to create child profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 text-center min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  const playerAge = calculateAge(formData.date_of_birth);
  const availableSecondaryPositions = POSITIONS.filter(p => p.value !== formData.main_position);

  const groupedSecondaryPositions = [
    {
      label: "Goalkeepers",
      options: availableSecondaryPositions.filter(p => p.category === "Goalkeeper").map(p => ({ value: p.value, label: p.label }))
    },
    {
      label: "Defenders",
      options: availableSecondaryPositions.filter(p => p.category === "Defender").map(p => ({ value: p.value, label: p.label }))
    },
    {
      label: "Midfielders",
      options: availableSecondaryPositions.filter(p => p.category === "Midfielder").map(p => ({ value: p.value, label: p.label }))
    },
    {
      label: "Attackers",
      options: availableSecondaryPositions.filter(p => p.category === "Attacker").map(p => ({ value: p.value, label: p.label }))
    }
  ].filter(group => group.options.length > 0);

  const currentBasicPosition = ADVANCED_TO_BASIC_MAP[formData.main_position] || '';
  
  return (
    <div className="min-h-screen bg-white md:bg-transparent">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 md:px-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="text-black hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative">
            <span className="relative flex h-6 w-6">
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-orange-500"></span>
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-black leading-tight max-w-sm mb-2">
          Hi {currentUser?.full_name?.split(' ')[0] || 'there'},
          <br />
          Add your child here.
        </h1>
        <p className="text-base text-gray-600 font-normal">Create a profile for your child to find and join teams</p>
      </div>

      {/* Content Area */}
      <div className="relative z-10 pb-24">
        <div className="px-4 pt-8 pb-6 md:px-6">
          <Card className="card-shadow bg-white border-none rounded-xl">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-black border-b pb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="font-semibold text-sm text-black">First Name *</Label>
                      <Input 
                        id="first_name" 
                        value={formData.first_name} 
                        onChange={(e) => handleInputChange('first_name', e.target.value)} 
                        required 
                        placeholder="Child's first name"
                        className="bg-white text-black border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="font-semibold text-sm text-black">Last Name *</Label>
                      <Input 
                        id="last_name" 
                        value={formData.last_name} 
                        onChange={(e) => handleInputChange('last_name', e.target.value)} 
                        required 
                        placeholder="Child's last name"
                        className="bg-white text-black border-gray-300"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="font-semibold text-sm text-black">
                        Date of Birth *
                        {playerAge !== null && <span className="text-gray-600 font-normal ml-2">(Age: {playerAge})</span>}
                      </Label>
                      <Input 
                        id="date_of_birth" 
                        type="date" 
                        value={formData.date_of_birth} 
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        required
                        className="bg-white text-black border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_foot" className="font-semibold text-sm text-black">Preferred Foot</Label>
                      <Select value={formData.preferred_foot} onValueChange={(value) => handleInputChange('preferred_foot', value)}>
                        <SelectTrigger className="bg-white text-black border-gray-300">
                          <SelectValue placeholder="Select foot" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Left">Left Footed</SelectItem>
                          <SelectItem value="Right">Right Footed</SelectItem>
                          <SelectItem value="Both">Both Feet</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <Label className="font-bold text-black">Player Positions</Label>
                  <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-min">
                    <Button 
                      type="button" 
                      onClick={() => setPositionMode('basic')} 
                      className={`h-9 px-4 text-sm ${positionMode === 'basic' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-transparent text-black hover:bg-gray-200'}`}
                    >
                      Basic
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setPositionMode('advanced')} 
                      className={`h-9 px-4 text-sm ${positionMode === 'advanced' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-transparent text-black hover:bg-gray-200'}`}
                    >
                      Advanced
                    </Button>
                  </div>

                  {positionMode === 'basic' ? (
                    <div className="space-y-2">
                      <Label htmlFor="basic_position" className="font-semibold text-sm text-black">Main Position *</Label>
                      <Select value={currentBasicPosition} onValueChange={handleBasicPositionChange} required>
                        <SelectTrigger className="bg-white text-black border-gray-300">
                          <SelectValue placeholder="Select basic position" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {Object.keys(BASIC_POSITIONS_MAP).map(pos => (
                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="main_position" className="font-semibold text-sm text-black">Main Position *</Label>
                        <Select value={formData.main_position} onValueChange={(value) => handleInputChange('main_position', value)} required>
                          <SelectTrigger className="bg-white text-black border-gray-300">
                            <SelectValue placeholder="Select main position" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectGroup>
                              <SelectLabel>Goalkeepers</SelectLabel>
                              {POSITIONS.filter(p => p.category === "Goalkeeper").map(pos => (
                                <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Defenders</SelectLabel>
                              {POSITIONS.filter(p => p.category === "Defender").map(pos => (
                                <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Midfielders</SelectLabel>
                              {POSITIONS.filter(p => p.category === "Midfielder").map(pos => (
                                <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Attackers</SelectLabel>
                              {POSITIONS.filter(p => p.category === "Attacker").map(pos => (
                                <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="positions" className="font-semibold text-sm text-black">Secondary Positions</Label>
                        <MultiSelect 
                          options={groupedSecondaryPositions} 
                          selected={formData.positions} 
                          onChange={(positions) => handleInputChange('positions', positions)}
                          placeholder="Select secondary positions..."
                          className="bg-white text-black border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-black border-b pb-3">Contact & Medical</h3>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact" className="font-semibold text-sm text-black">Emergency Contact Number</Label>
                    <Input 
                      id="emergency_contact" 
                      value={formData.emergency_contact} 
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)} 
                      placeholder="Your phone number for emergencies"
                      className="bg-white text-black border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical_notes" className="font-semibold text-sm text-black">Medical Notes</Label>
                    <Input 
                      id="medical_notes" 
                      value={formData.medical_notes} 
                      onChange={(e) => handleInputChange('medical_notes', e.target.value)} 
                      placeholder="Any medical conditions, allergies, or important notes"
                      className="bg-white text-black border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('Dashboard'))} disabled={isSubmitting} className="border-gray-300 text-black hover:bg-gray-100">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.main_position}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Add Child'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}