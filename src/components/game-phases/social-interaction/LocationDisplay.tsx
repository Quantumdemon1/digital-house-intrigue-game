
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Home, Sofa, UtensilsCrossed, Bed } from 'lucide-react';
import { Houseguest } from '@/models/houseguest';
import { StatusAvatar } from '@/components/ui/status-avatar';

interface LocationDisplayProps {
  currentLocation: string;
  activeGuests: Houseguest[];
}

const locationIcons: Record<string, React.ElementType> = {
  'living-room': Sofa,
  'kitchen': UtensilsCrossed,
  'bedroom': Bed,
  'backyard': Home,
  'default': MapPin
};

const locationColors: Record<string, string> = {
  'living-room': 'from-blue-500/20 to-blue-600/10',
  'kitchen': 'from-amber-500/20 to-amber-600/10',
  'bedroom': 'from-purple-500/20 to-purple-600/10',
  'backyard': 'from-green-500/20 to-green-600/10',
  'default': 'from-muted to-muted/50'
};

const LocationDisplay: React.FC<LocationDisplayProps> = ({ currentLocation, activeGuests }) => {
  // Determine who is 'present' - in full implementation this would be deterministic
  const presentGuests = useMemo(() => activeGuests.filter(() => {
    return Math.random() > 0.3; // ~70% chance present
  }), [activeGuests]);

  const LocationIcon = locationIcons[currentLocation] || locationIcons['default'];
  const gradientClass = locationColors[currentLocation] || locationColors['default'];
  const formattedLocation = currentLocation.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className={`rounded-xl border border-border overflow-hidden bg-gradient-to-br ${gradientClass}`}>
      {/* Location Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm">
              <LocationIcon className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Current Location</h4>
              <p className="text-sm text-muted-foreground font-mono">{formattedLocation}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {presentGuests.length} here
          </Badge>
        </div>
      </div>
      
      {/* Present Guests */}
      <div className="p-4">
        <h5 className="text-xs uppercase text-muted-foreground font-semibold mb-3 tracking-wider">
          Houseguests Present
        </h5>
        {presentGuests.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {presentGuests.map(guest => (
              <div key={guest.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                <StatusAvatar
                  name={guest.name}
                  imageUrl={guest.imageUrl}
                  size="sm"
                  showBadge={false}
                />
                <span className="text-sm font-medium text-foreground">{guest.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground italic">
            <Users className="h-4 w-4" />
            <span className="text-sm">You are alone here.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDisplay;
