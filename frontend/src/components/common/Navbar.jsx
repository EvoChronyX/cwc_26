import React, { useState } from 'react';
import ClashLogo from './ClashLogo';
import { useGame } from '../../context/GameContext';

export default function Navbar() {
  const { currentView, setCurrentView, buzzersArmed } = useGame();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'arena', label: 'Player Arena', icon: 'swords' },
    { id: 'admin', label: 'Admin Console', icon: 'tune' },
    { id: 'portal', label: 'Portal Access / Login', icon: 'vpn_key' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-hairline-light">
      <div className="h-16 w-full px-4 sm:px-8 flex items-center justify-between">
        {/* Left Branding & Status Indicators */}
        <div className="flex items-center gap-3 sm:gap-space-md">
          <button 
            onClick={() => setCurrentView('arena')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <ClashLogo className="h-7 sm:h-8 w-auto" />
            <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant hidden sm:inline-block">v2.4</span>
          </button>

          <div className="hidden lg:flex items-center gap-space-xs bg-surface-subtle px-space-sm py-space-2xs rounded-full">
            <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse"></span>
            <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase">LIVE: ONLINE</span>
          </div>

          <div className="hidden xl:flex items-center gap-space-xs bg-primary px-space-sm py-space-2xs rounded-full">
            <span className={`w-2 h-2 rounded-full ${buzzersArmed ? 'bg-acid-chartreuse' : 'bg-sabotage-crimson'}`}></span>
            <span className="font-label-mono-sm text-label-mono-sm text-on-primary uppercase">ROUND 03 // {buzzersArmed ? 'ACTIVE' : 'LOCKED'}</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-space-md">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`transition-all duration-150 font-body-base text-sm lg:text-base px-3 lg:px-space-sm py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'text-primary font-semibold bg-surface-subtle shadow-sm border border-hairline-light'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] opacity-75">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Telemetry Profile & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-label-mono-sm text-label-mono-sm uppercase text-primary font-bold">AGENT #8491</span>
            <span className="font-label-mono-sm text-label-mono-sm text-signal-emerald">SYNCED // NODE-09</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[1px_1px_0px_#CCFF00]">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-primary hover:bg-surface-subtle rounded focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-hairline-light px-4 py-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-body-base text-sm flex items-center gap-3 ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-subtle'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
