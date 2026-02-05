
import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { GameProvider } from './contexts/game';
import { AIThoughtsProvider } from './components/ai-feedback';
import { RelationshipImpactProvider } from './contexts/RelationshipImpactContext';
import { RelationshipImpactDisplay } from './components/relationship';
import { GameControlProvider } from './contexts/GameControlContext';
import { SettingsProvider } from './components/settings';
import GameScreen from './components/game-screen/GameScreen';
import GameSetup from './components/GameSetup';
import AuthPage from './components/auth/AuthPage';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  // Global handler for unhandled promise rejections (e.g., failed GLB loads)
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      // Check if it's a GLB/model loading error
      if (event.reason?.message?.includes('Could not load') || 
          event.reason?.message?.includes('Failed to fetch')) {
        console.warn('Suppressed model loading error:', event.reason?.message);
        event.preventDefault(); // Prevent crash
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  return (
    <div className="app min-h-screen bg-background">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <SettingsProvider>
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
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
