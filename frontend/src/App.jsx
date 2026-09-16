import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import PlayerArena from './pages/PlayerArena';
import AdminConsole from './pages/AdminConsole';
import PortalAccess from './pages/PortalAccess';

function AppContent() {
  const { currentView } = useGame();

  return (
    <div className={`min-h-screen ${currentView === 'portal' ? 'bg-black' : 'bg-background'} text-on-surface antialiased selection:bg-acid-chartreuse selection:text-primary`}>
      {currentView === 'arena' && <PlayerArena />}
      {currentView === 'admin' && <AdminConsole />}
      {currentView === 'portal' && <PortalAccess />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
