import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Navbar from './components/common/Navbar';
import PlayerArena from './pages/PlayerArena';
import AdminConsole from './pages/AdminConsole';
import PortalAccess from './pages/PortalAccess';

function AppContent() {
  const { currentView } = useGame();

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased selection:bg-acid-chartreuse selection:text-primary">
      {currentView === 'portal' && <Navbar />}
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
