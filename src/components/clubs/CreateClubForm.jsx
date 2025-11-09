import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Building2 } from 'lucide-react';
import LocationPicker from '../shared/LocationPicker';

export default function CreateClubForm({ onSubmit, onCancel, initialData }) {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    short_name: initialData?.short_name || "",
    hq_location: initialData?.hq_location || null,
    founded_year: initialData?.founded_year || "",
    website: initialData?.website || "",
    contact_email: initialData?.contact_email || "",
    contact_phone: initialData?.contact_phone || "",
    address: initialData?.address || "",
    primary_color: initialData?.primary_color || "#16a34a",
    secondary_color: initialData?.secondary_color || "",
    description: initialData?.description || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      founded_year: formData.founded_year ? parseInt(formData.founded_year, 10) : null
    };
    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="card-shadow border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              {isEditing ? "Edit Club Details" : "Create New Club"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5 text-slate-700" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-800">Club Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Manchester United FC"
                  required
                  className="border-slate-300 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_name" className="text-sm font-semibold text-slate-800">Short Name</Label>
                <Input
                  id="short_name"
                  value={formData.short_name}
                  onChange={(e) => handleInputChange('short_name', e.target.value)}
                  placeholder="e.g., MUFC"
                  className="border-slate-300 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="founded_year" className="text-sm font-semibold text-slate-800">Founded Year</Label>
                <Input
                  id="founded_year"
                  type="number"
                  value={formData.founded_year}
                  onChange={(e) => handleInputChange('founded_year', e.target.value)}
                  placeholder="e.g., 1878"
                  min="1800"
                  max={new Date().getFullYear()}
                  className="border-slate-300 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold text-slate-800">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.clubwebsite.com"
                  className="border-slate-300 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-sm font-semibold text-slate-800">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="info@club.com"
                  className="border-slate-300 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-sm font-semibold text-slate-800">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+44 20 1234 5678"
                  className="border-slate-300 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-800">Headquarters Location</Label>
              <LocationPicker
                value={formData.hq_location}
                onChange={(location) => handleInputChange('hq_location', location)}
                label=""
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-800">Club Colors</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_color" className="text-xs font-medium text-slate-700">Primary Color *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="p-1 h-10 w-12 cursor-pointer bg-white"
                    />
                    <Input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#16a34a"
                      className="border-slate-300 focus:border-blue-500 bg-white text-slate-900"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color" className="text-xs font-medium text-slate-700">Secondary Color (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color || "#ffffff"}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="p-1 h-10 w-12 cursor-pointer bg-white"
                    />
                    <Input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#ffffff"
                      className="border-slate-300 focus:border-blue-500 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-800">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the club..."
                className="h-24 border-slate-300 focus:border-blue-500 bg-white text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Save Changes" : "Create Club"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}