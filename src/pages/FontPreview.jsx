
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Paintbrush, Play, Star, Shield, Users, Edit, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const fontScales = [
  {
    id: 'font-scale-compact',
    name: 'Compact (Mobile)',
    description: 'Ideal for mobile devices and data-dense interfaces, like Sky Sports.'
  },
  {
    id: 'font-scale-standard',
    name: 'Standard (Default)',
    description: 'A balanced size for comfortable reading on most devices.'
  },
  {
    id: 'font-scale-large',
    name: 'Large (Accessibility)',
    description: 'Larger text for improved readability and accessibility.'
  }
];

const colorThemes = [
  { 
    id: 'theme-athletic', 
    name: 'Athletic Clean (New)', 
    primary: '#1e293b', 
    secondary: '#f87171', 
    accent: '#94a3b8',
    description: 'Clean, professional design inspired by modern fitness apps'
  },
  { 
    id: 'theme-default', 
    name: 'Classic Navy', 
    primary: '#1e293b', 
    secondary: '#16a34a', 
    accent: '#0ea5e9' 
  },
  { 
    id: 'theme-electric', 
    name: 'Electric', 
    primary: '#2563eb', 
    secondary: '#4f46e5', 
    accent: '#84cc16' 
  },
  { 
    id: 'theme-dynamic', 
    name: 'Dynamic', 
    primary: '#1e293b', 
    secondary: '#475569', 
    accent: '#f97316' 
  },
  { 
    id: 'theme-vibrant', 
    name: 'Vibrant', 
    primary: '#581c87', 
    secondary: '#14b8a6', 
    accent: '#e879f9' 
  },
];

export default function FontPreview() {
  const navigate = useNavigate();
  const [activeScale, setActiveScale] = useState('font-scale-compact');
  const [activeTheme, setActiveTheme] = useState('theme-athletic'); // Default to new theme

  useEffect(() => {
    const body = document.body;
    // Remove any existing scale classes
    fontScales.forEach(scale => body.classList.remove(scale.id));
    // Add the new active scale class
    body.classList.add(activeScale);

    // Cleanup function to remove the class when the component unmounts
    return () => {
      body.classList.remove(activeScale);
    };
  }, [activeScale]);

  useEffect(() => {
    const body = document.body;
    // Remove any existing theme classes
    colorThemes.forEach(theme => body.classList.remove(theme.id));
    // Add the new active theme class
    body.classList.add(activeTheme);
    // Cleanup function to remove the class when the component unmounts
    return () => {
      body.classList.remove(activeTheme);
    };
  }, [activeTheme]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* FIXED: Clean white header */}
      <div className="p-4 md:p-8 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(createPageUrl('Dashboard'))}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Typography & Theme Preview</h1>
              <p className="text-sm text-slate-600">Clean, professional design with the <span className="font-bold text-slate-900">Inter</span> font family.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Color Theme Selector */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]"><Paintbrush className="w-5 h-5"/> Color Scheme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colorThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    activeTheme === theme.id ? 'border-[var(--primary)] bg-[var(--muted)]' : 'border-transparent bg-[var(--card)] hover:bg-[var(--muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-[var(--foreground)]">{theme.name}</h3>
                    {activeTheme === theme.id && <Check className="w-5 h-5 text-[var(--primary)]" />}
                  </div>
                  {theme.description && (
                    <p className="text-xs text-[var(--muted-foreground)] mb-3">{theme.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Scale Selector */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">Font Size</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fontScales.map((scale) => (
                <button
                  key={scale.id}
                  onClick={() => setActiveScale(scale.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    activeScale === scale.id ? 'border-[var(--primary)] bg-[var(--muted)]' : 'border-transparent bg-[var(--card)] hover:bg-[var(--muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-[var(--foreground)]">{scale.name}</h3>
                    {activeScale === scale.id && <Check className="w-5 h-5 text-[var(--primary)]" />}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">{scale.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-[var(--card)] text-[var(--card-foreground)] card-shadow">
            <CardHeader>
              <CardTitle>UI Component Showcase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h2 className="athletic-font mb-2 text-[var(--foreground)]">Lions FC vs Tigers United</h2>
                <h3 className="font-bold mb-2 text-[var(--foreground)]">Match Day Lineup</h3>
                <p className="text-base text-[var(--muted-foreground)]">
                  This is standard paragraph text using Work Sans (Regular 400). It's now lighter for better mobile readability. The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              
              {/* NEW: Font Weight Showcase */}
              <div>
                <h3 className="font-bold border-b pb-2 mb-4 border-[var(--border)] text-[var(--foreground)]">Font Weights</h3>
                <div className="space-y-2 text-[var(--muted-foreground)]">
                  <p style={{ fontWeight: 200 }}>ExtraLight (200) - Used for subtle, secondary information.</p>
                  <p style={{ fontWeight: 300 }}>Light (300) - Good for helper text or less important details.</p>
                  <p style={{ fontWeight: 400 }}>Regular (400) - The new default for all body copy.</p>
                  <p style={{ fontWeight: 500 }}>Medium (500) - Used for labels and slightly emphasized text.</p>
                  <p style={{ fontWeight: 600 }}>Semibold (600) - Used for sub-headings and buttons.</p>
                  <p style={{ fontWeight: 700 }}>Bold (700) - Used for primary page titles and main headings.</p>
                </div>
              </div>

              {/* Button Showcase */}
              <div>
                  <h3 className="font-bold border-b pb-2 mb-4 border-[var(--border)] text-[var(--foreground)]">Button Styles</h3>
                  <div className="flex flex-wrap items-center gap-4">
                      <Button className="btn-primary"><Edit className="w-4 h-4 mr-2"/> Primary</Button>
                      <Button className="btn-secondary"><Play className="w-4 h-4 mr-2"/> Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button disabled>Disabled</Button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <h4 className="font-bold border-b pb-2 border-[var(--border)] text-[var(--foreground)]">Player Card</h4>
                   <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center font-bold text-[var(--primary-foreground)]">10</div>
                         <div>
                           <p className="font-bold text-[var(--foreground)]">Jamie Vardy</p>
                           <p className="text-sm text-[var(--muted-foreground)]">Striker (ST)</p>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="font-bold border-b pb-2 border-[var(--border)] text-[var(--foreground)]">Match Info</h4>
                   <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)]">League Match</Badge>
                      <Badge className="bg-[var(--secondary)] text-[var(--secondary-foreground)]">Home</Badge>
                      <Badge variant="outline">U16</Badge>
                   </div>
                   <div className="text-sm space-y-2 text-[var(--muted-foreground)]">
                      <p className="flex items-center gap-2"><Shield className="w-4 h-4"/> <span className="font-bold">Formation:</span> 4-4-2</p>
                      <p className="flex items-center gap-2"><Users className="w-4 h-4"/> <span className="font-bold">Players Available:</span> 16</p>
                      <p className="flex items-center gap-2"><Star className="w-4 h-4"/> <span className="font-bold">Avg Rating:</span> 7.8</p>
                   </div>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
