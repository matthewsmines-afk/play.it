
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';
import { openInMaps } from '@/components/utils/openInMaps';

// Fix for default Leaflet icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to recenter the map when marker position changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export default function LocationPicker({ value, onChange, label }) {
  const initialPosition = value?.latitude && value?.longitude ? [value.latitude, value.longitude] : [51.505, -0.09];
  const [markerPosition, setMarkerPosition] = useState(initialPosition);
  const [searchTerm, setSearchTerm] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Auto-search with debounce
  useEffect(() => {
    const searchLocations = async () => {
      // console.log('Search triggered for:', searchTerm); // Debug log
      
      if (!searchTerm.trim() || searchTerm.length < 3) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setSearchError(null);
      // console.log('Starting search API call...'); // Debug log
      
      try {
        const response = await InvokeLLM({
          prompt: `Search for locations matching: "${searchTerm}". Return JSON with locations array containing display_name, lat, and lon for each result.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              locations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    display_name: { type: 'string' },
                    lat: { type: 'string' },
                    lon: { type: 'string' },
                  },
                },
              },
            },
          },
        });
        
        // console.log('Search API response:', response); // Debug log
        setSuggestions(response.locations || []);
        
      } catch (error) {
        console.error('Search API error:', error); // Debug log
        setSearchError('Search failed - please try again');
        setSuggestions([]);
      }
      
      setIsLoading(false);
      // console.log('Search completed, loading set to false'); // Debug log
    };

    const timeoutId = setTimeout(searchLocations, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setMarkerPosition([lat, lon]);
    setSuggestions([]);
    setSearchTerm(suggestion.display_name);
    onChange({
      address: suggestion.display_name,
      latitude: lat,
      longitude: lon,
    });
  };

  const handleMarkerDrag = useCallback(async (e) => {
    const { lat, lng } = e.target.getLatLng();
    setMarkerPosition([lat, lng]);
    setIsReverseGeocoding(true);
    
    // Simple fallback for now - we can improve this later
    const fallbackAddress = `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setSearchTerm(fallbackAddress); // Update search term to show coordinates temporarily
    onChange({
        address: fallbackAddress,
        latitude: lat,
        longitude: lng
    });
    setIsReverseGeocoding(false);
  }, [onChange]);

  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        handleMarkerDrag(e);
      },
    }),
    [handleMarkerDrag],
  );

  const showDropdown = searchTerm.length > 2 && (isLoading || suggestions.length > 0 || searchError);

  // console.log('Render state:', { searchTerm: searchTerm.length, isLoading, suggestionsCount: suggestions.length, showDropdown }); // Debug log

  return (
    <div className="space-y-2">
      <Label htmlFor="location-search" className="font-semibold text-sm">{label}</Label>
      
      <div className="relative">
        <div className="relative">
          <Input
            id="location-search"
            type="text"
            placeholder="Search for a location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
          )}
        </div>

        {/* Simplified, more visible dropdown */}
        {showDropdown && (
          <div 
            className="absolute top-full left-0 right-0 z-[1000] bg-white border border-slate-300 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto"
            style={{ zIndex: 1000 }}
          >
            {isLoading && (
              <div className="p-3 text-sm text-slate-500 flex items-center gap-2 border-b">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            )}
            
            {searchError && (
              <div className="p-3 text-sm text-red-600 border-b">
                {searchError}
              </div>
            )}
            
            {!isLoading && !searchError && suggestions.length === 0 && (
              <div className="p-3 text-sm text-slate-500">
                No locations found for "{searchTerm}"
              </div>
            )}
            
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{suggestion.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="text-xs text-slate-400 mt-1">
        Debug: {searchTerm.length} chars, Loading: {isLoading ? 'Yes' : 'No'}, Suggestions: {suggestions.length}, Show: {showDropdown ? 'Yes' : 'No'}
      </div>

      <div className="h-64 w-full rounded-lg overflow-hidden border">
        <MapContainer center={markerPosition} zoom={13} scrollWheelZoom={false} className="h-full w-full">
          <ChangeView center={markerPosition} zoom={13} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Marker
            position={markerPosition}
            draggable={true}
            eventHandlers={eventHandlers}
          />
        </MapContainer>
      </div>

      {value?.address && !showDropdown && (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-700">{value.address}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openInMaps(value.latitude, value.longitude, value.address)}
          >
            <Navigation className="h-3 w-3 mr-1" />
            Directions
          </Button>
        </div>
      )}

      {isReverseGeocoding && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Finding address...</span>
        </div>
      )}
    </div>
  );
}
