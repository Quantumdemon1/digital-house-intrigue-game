
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { GameProvider } from './contexts/game';
import { AIThoughtsProvider } from './components/ai-feedback';
import { RelationshipImpactProvider } from './contexts/RelationshipImpactContext';
import { RelationshipImpactDisplay } from './components/relationship';
import { GameControlProvider } from './contexts/GameControlContext';
import GameScreen from './components/game-screen/GameScreen';
import GameSetup from './components/GameSetup';
import AuthPage from './components/auth/AuthPage';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <div className="app min-h-screen bg-background">
      <AuthProvider>
        <RelationshipImpactProvider>
          <GameProvider>
            <GameControlProvider>
              <AIThoughtsProvider>
                <Routes>
                  <Route path="/" element={<AuthPage />} />
                  <Route 
                    path="/setup" 
                    element={
                      <PrivateRoute>
                        <GameSetup />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/game" 
                    element={
                      <PrivateRoute>
                        <GameScreen />
                      </PrivateRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <RelationshipImpactDisplay />
                <Toaster position="top-center" richColors />
              </AIThoughtsProvider>
            </GameControlProvider>
          </GameProvider>
        </RelationshipImpactProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
