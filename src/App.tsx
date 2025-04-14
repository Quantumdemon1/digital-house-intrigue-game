
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { GameProvider } from './contexts/GameContext';
import { AIThoughtsProvider } from './components/ai-feedback';
import { RelationshipImpactProvider } from './contexts/RelationshipImpactContext';
import { RelationshipImpactDisplay } from './components/relationship';
import { GameControlProvider } from './contexts/GameControlContext';
import GameScreen from './components/game-screen/GameScreen';
import GameSetup from './components/GameSetup';

function App() {
  return (
    <div className="app min-h-screen bg-background">
      <RelationshipImpactProvider>
        <GameProvider>
          <GameControlProvider>
            <AIThoughtsProvider>
              <Routes>
                <Route path="/" element={<GameSetup />} />
                <Route path="/game" element={<GameScreen />} />
              </Routes>
              <RelationshipImpactDisplay />
              <Toaster position="top-center" richColors />
            </AIThoughtsProvider>
          </GameControlProvider>
        </GameProvider>
      </RelationshipImpactProvider>
    </div>
  );
}

export default App;
