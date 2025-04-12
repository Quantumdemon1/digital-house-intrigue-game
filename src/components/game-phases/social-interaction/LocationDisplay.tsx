
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';

interface LocationDisplayProps {
  currentLocation: string;
  activeGuests: Houseguest[];
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ currentLocation, activeGuests }) => {
  // Determine who is 'present'
  const presentGuests = useMemo(() => activeGuests.filter(hg => {
    // Simple random presence for now - in a full implementation, this would be deterministic
    return Math.random() > 0.3; // ~70% chance present
  }), [activeGuests]);

  return (
    <div className="mb-4 p-3 bg-card border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold flex items-center gap-1">
          <MapPin size={16} /> Current Location:
        </h4>
        <span className="font-mono text-sm">
          {currentLocation.replace('-', ' ')}
        </span>
      </div>
      
      <h5 className="text-xs uppercase text-muted-foreground font-semibold mb-1">Present:</h5>
      {presentGuests.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {presentGuests.map(guest => (
            <Badge key={guest.id} variant="secondary">{guest.name}</Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">You are alone here.</p>
      )}
    </div>
  );
};

export default LocationDisplay;
