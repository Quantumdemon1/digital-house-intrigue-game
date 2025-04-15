
import React from 'react';
import { PlayerSelectionProvider } from './hooks/usePlayerSelection';
import POVPlayerSelectionContent from './POVPlayerSelectionContent';

const POVPlayerSelectionEntry: React.FC = () => {
  return (
    <PlayerSelectionProvider>
      <POVPlayerSelectionContent />
    </PlayerSelectionProvider>
  );
};

export default POVPlayerSelectionEntry;
