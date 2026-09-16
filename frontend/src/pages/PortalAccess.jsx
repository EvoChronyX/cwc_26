import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { PREDEFINED_AVATARS } from '../assets/avatars';
import heroBg from '../assets/background.jpeg';

export default function PortalAccess() {
  const {
    setCurrentView,
    setNammaAreaSubTab,
    setAdminSubTab,
    teamName,
    setTeamName,
    p1Handle,
    setP1Handle,
    p2Handle,
    setP2Handle,
    playerAvatar,
    setPlayerAvatar,
    activeFaction,
    setActiveFaction,
    arenaPin,
    setArenaPin,
    playTone
  } = useGame();

  const [authMode, setAuthMode] = useState('player'); // 'player' | 'admin'
  const [gmId, setGmId] = useState('GM_ARBITER_07');
  const [sessionToken, setSessionToken] = useState('STG-TOURNAMENT-2025-Q1');
  const [masterKey, setMasterKey] = useState('••••••••••••••••••••');
  const [keyVerified, setKeyVerified] = useState(false);

  // Scroll detection for animated appearance
  const [hasScrolled, setHasScrolled] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    playTone(700, 0.1);
    setHasScrolled(true);
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  const selectedAvatarObj = PREDEFINED_AVATARS.find((a) => a.id === playerAvatar) || PREDEFINED_AVATARS[0];

  const handleVerifyKey = () => {
    playTone(1050, 0.15);
    setKeyVerified(true);
    setTimeout(() => setKeyVerified(false), 3000);
  };

  const handleEnterArena = () => {
    playTone(900, 0.2);
    setNammaAreaSubTab('kootani');
    setCurrentView('arena');
  };

  const handleLaunchAdmin = () => {
    playTone(1100, 0.2);
    setAdminSubTab('thalaivar');
    setCurrentView('admin');
  };

  return (
    <div className="relative w-full min-h-[170vh] text-on-surface selection:bg-acid-chartreuse selection:text-primary">
      
      {/* 1. COMPLETE FIXED BACKGROUND IMAGE IN CENTER POSITION WITHOUT REPETITION */}
      <div 
        className="fixed inset-0 w-full h-full bg-center bg-no-repeat bg-cover z-0 pointer-events-none"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      >
        {/* Subtle Overlay to ensure visual crispness */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#CCFF00_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* 2. INITIAL VIEWPORT: ONLY BACKGROUND & 'KEELA POLAM' SCROLLING TEXT (FLOATING BUTTON REMOVED) */}
      <section className="w-full h-screen flex flex-col justify-end items-center relative z-10 select-none pb-0">
        {/* 'Keela polam' Continuous Scrolling Text Marquee Ticker */}
        <div 
          onClick={scrollToContent}
          className="w-full bg-black/90 border-y-2 border-acid-chartreuse py-3.5 overflow-hidden whitespace-nowrap cursor-pointer hover:bg-black transition-colors"
        >
          <div className="animate-marquee font-headline-md font-extrabold text-sm sm:text-base text-acid-chartreuse tracking-widest uppercase flex items-center gap-8">
            <span>KEELA POLAM ✦ கீழ போலாம் ✦ SCROLL DOWN ✦ KEELA POLAM ✦ கீழ போலாம் ✦ SCROLL DOWN ✦</span>
            <span>KEELA POLAM ✦ கீழ போலாம் ✦ SCROLL DOWN ✦ KEELA POLAM ✦ கீழ போலாம் ✦ SCROLL DOWN ✦</span>
            <span>KEELA POLAM ✦ கீழ போலாம் ✦ SCROLL DOWN ✦ KEELA POLAM ✦ கீழ போலாம் ✦ SCROLL DOWN ✦</span>
            <span>KEELA POLAM ✦ கீழ போலாம் ✦ SCROLL DOWN ✦ KEELA POLAM ✦ கீழ போலாம் ✦ SCROLL DOWN ✦</span>
          </div>
        </div>
      </section>

      {/* 3. SCROLL REVEAL CONTENT: TEXT REVEALS IN ANIMATED MANNER, THEN LOGIN SECTION */}
      <div 
        ref={contentRef}
        className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 flex flex-col gap-10 relative z-10"
      >
        
        {/* Staggered Animated Text Header Block */}
        <div className="flex flex-col gap-4 text-center items-center">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-acid-chartreuse text-canvas-dark rounded font-label-mono-sm text-xs uppercase font-bold tracking-wider shadow-sm transition-all duration-700 ease-out transform ${
              hasScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            <span>CHAMPIONSHIP STAGE</span>
            <span>//</span>
            <span>LIVE EVENT PORTAL</span>
          </div>

          {/* Hero Title */}
          <h1 
            className={`font-display-hero text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white font-extrabold leading-none drop-shadow-xl transition-all duration-700 delay-150 ease-out transform ${
              hasScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          >
            STAGE CLASH: <br className="hidden sm:inline" />
            <span className="text-acid-chartreuse">LIVE TOURNAMENT ACCESS</span>
          </h1>

          {/* Subtitle Description */}
          <p 
            className={`font-body-base text-sm sm:text-base text-gray-200 max-w-2xl leading-relaxed drop-shadow-md transition-all duration-700 delay-300 ease-out transform ${
              hasScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          >
            Register your official 2-player team identity, select your tactical avatar profile, and synchronize hardware debounce triggers for live stage confrontation.
          </p>

          {/* Protocol Info */}
          <div 
            className={`flex items-center gap-4 text-white/80 font-label-mono-sm text-xs pt-2 border-t border-white/20 transition-all duration-700 delay-450 ease-out transform ${
              hasScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            <span>SQUAD PROTOCOL: 2 PLAYERS PER TEAM</span>
            <span>•</span>
            <span>DEBOUNCE ENGINE: ARMED</span>
          </div>
        </div>

        {/* Animated Login Section Card at the Bottom */}
        <div 
          className={`bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl rounded-2xl p-6 sm:p-10 flex flex-col gap-8 border-2 border-primary relative overflow-hidden transition-all duration-800 delay-600 ease-out transform ${
            hasScrolled ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95 pointer-events-none'
          }`}
        >
          {/* Top Neon Edge */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-acid-chartreuse via-primary to-signal-emerald"></div>

          {/* Mode Selector Tabs (Player vs Game Master) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-hairline-light">
            <div>
              <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase font-bold block mb-1">
                ACCESS GATEWAY
              </span>
              <h2 className="font-headline-lg text-2xl font-bold text-primary">
                {authMode === 'player' ? 'Contender Squad Registration' : 'Game Master Command'}
              </h2>
            </div>

            <div className="inline-flex p-1 bg-surface-subtle rounded-xl border border-hairline-light">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('player');
                  playTone(700, 0.08);
                }}
                className={`px-5 py-2.5 text-xs font-label-mono-sm tracking-wider uppercase transition-all duration-150 flex items-center gap-2 rounded-lg cursor-pointer ${
                  authMode === 'player'
                    ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${authMode === 'player' ? 'bg-acid-chartreuse' : 'bg-outline-variant'}`}></span>
                <span>Player Access</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('admin');
                  playTone(850, 0.08);
                }}
                className={`px-5 py-2.5 text-xs font-label-mono-sm tracking-wider uppercase transition-all duration-150 flex items-center gap-2 rounded-lg cursor-pointer ${
                  authMode === 'admin'
                    ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${authMode === 'admin' ? 'bg-acid-chartreuse' : 'bg-outline-variant'}`}></span>
                <span>Game Master</span>
              </button>
            </div>
          </div>

          {/* PLAYER ACCESS MODE FORM (With Profile Picture Avatar Selection) */}
          {authMode === 'player' ? (
            <div className="flex flex-col gap-8">
              
              {/* AVATAR SELECTION DECK (FOR PLAYERS ONLY) */}
              <div className="flex flex-col gap-3 p-5 bg-surface-subtle rounded-xl border border-hairline-light">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">face</span>
                    <span className="font-label-mono-sm text-xs uppercase font-bold text-primary">
                      SELECT PROFILE PICTURE AVATAR (5 PREDEFINED OPTIONS)
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-xs text-on-surface-variant">
                    SELECTED: <strong className="text-primary">{selectedAvatarObj.name} ({selectedAvatarObj.callsign})</strong>
                  </span>
                </div>

                {/* 5 Predefined Avatar Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {PREDEFINED_AVATARS.map((av) => {
                    const isSelected = playerAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setPlayerAvatar(av.id);
                          playTone(850, 0.08);
                        }}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer border-2 text-center relative ${
                          isSelected
                            ? 'border-primary bg-primary text-on-primary shadow-[3px_3px_0px_#CCFF00] scale-105'
                            : 'border-hairline-light bg-surface-container-lowest hover:border-primary/50 text-on-surface'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-acid-chartreuse text-canvas-dark flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                          </div>
                        )}
                        <img
                          src={av.svg}
                          alt={av.name}
                          className="w-14 h-14 rounded-lg object-cover bg-black border border-hairline-dark shadow-sm"
                        />
                        <span className="font-headline-md text-xs font-bold leading-tight line-clamp-1">
                          {av.name}
                        </span>
                        <span className={`font-label-mono-sm text-[10px] uppercase font-bold ${
                          isSelected ? 'text-acid-chartreuse' : 'text-on-surface-variant'
                        }`}>
                          {av.callsign}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Team Name Input */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <label className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold">
                    TEAM NAME (DUAL CONTENDER SQUAD)
                  </label>
                  <span className="font-label-mono-sm text-xs text-signal-emerald font-bold">1 SQUAD = 2 PLAYERS</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value.toUpperCase())}
                    placeholder="ENTER OFFICIAL SQUAD NAME..."
                    className="w-full bg-surface-subtle text-primary font-headline-md text-lg sm:text-xl px-4 py-3 border-2 border-primary rounded-xl focus:outline-none focus:border-cobalt-deep font-bold uppercase tracking-tight"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase font-bold">LOBBY_VERIFIED</span>
                    <span className="material-symbols-outlined text-signal-emerald text-base font-bold">verified</span>
                  </div>
                </div>
              </div>

              {/* 2 Player Member Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold">
                    MEMBER 01 CALLSIGN
                  </label>
                  <input
                    type="text"
                    value={p1Handle}
                    onChange={(e) => setP1Handle(e.target.value)}
                    placeholder="e.g. Alex Vance // VALKYRIE_01"
                    className="w-full bg-surface-subtle text-primary font-body-base text-sm px-4 py-3 border border-hairline-light rounded-xl focus:outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold">
                    MEMBER 02 CALLSIGN
                  </label>
                  <input
                    type="text"
                    value={p2Handle}
                    onChange={(e) => setP2Handle(e.target.value)}
                    placeholder="e.g. Sarah Connor // NEXUS_CORE"
                    className="w-full bg-surface-subtle text-primary font-body-base text-sm px-4 py-3 border border-hairline-light rounded-xl focus:outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>

              {/* Faction & Arena PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold">
                    DIVISION / FACTION
                  </label>
                  <select
                    value={activeFaction}
                    onChange={(e) => setActiveFaction(e.target.value)}
                    className="w-full bg-surface-subtle text-primary font-body-base text-sm px-4 py-3 border border-hairline-light rounded-xl focus:outline-none focus:border-primary font-bold"
                  >
                    <option value="KINETIC">FACTION // KINETIC (PRIMARY)</option>
                    <option value="VORTEX">FACTION // VORTEX (DEFENSIVE)</option>
                    <option value="CYBER">FACTION // CYBER SPECTRE (TACTICAL)</option>
                    <option value="NEO">FACTION // NEO PULSE (AGGRESSIVE)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold">
                    ARENA SESSION PIN
                  </label>
                  <input
                    type="text"
                    value={arenaPin}
                    onChange={(e) => setArenaPin(e.target.value)}
                    placeholder="e.g. 794-20"
                    className="w-full bg-surface-subtle text-primary font-label-mono-lg text-sm px-4 py-3 border border-hairline-light rounded-xl focus:outline-none focus:border-primary font-bold tracking-widest uppercase"
                  />
                </div>
              </div>

              {/* Action Submit Button */}
              <button
                type="button"
                onClick={handleEnterArena}
                className="w-full py-4 sm:py-5 bg-primary text-on-primary font-label-mono-lg text-base sm:text-lg uppercase tracking-wider font-extrabold shadow-[4px_4px_0px_#CCFF00] hover:bg-black active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer rounded-xl"
              >
                <span>ENTER NAMMA AREA WITH SQUAD</span>
                <span className="material-symbols-outlined text-2xl text-acid-chartreuse">arrow_forward</span>
              </button>
            </div>
          ) : (
            /* GAME MASTER / ADMIN LOGIN FORM */
            <div className="flex flex-col gap-6">
              <div className="p-4 bg-sabotage-crimson/10 border border-sabotage-crimson/30 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-sabotage-crimson text-2xl font-bold">admin_panel_settings</span>
                <span className="font-label-mono-sm text-xs text-primary font-bold uppercase">
                  RESTRICTED TOURNAMENT MASTER NERVE CENTER • DUAL AUTHORIZATION REQUIRED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold">
                    GAME MASTER IDENTIFIER
                  </label>
                  <input
                    type="text"
                    value={gmId}
                    onChange={(e) => setGmId(e.target.value)}
                    className="w-full bg-surface-subtle text-primary font-body-base text-sm px-4 py-3 border border-hairline-light rounded-xl focus:outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold">
                    SESSION TOKEN
                  </label>
                  <input
                    type="text"
                    value={sessionToken}
                    onChange={(e) => setSessionToken(e.target.value)}
                    className="w-full bg-surface-subtle text-primary font-body-base text-sm px-4 py-3 border border-hairline-light rounded-xl focus:outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold">
                  MASTER SECURITY OVERRIDE KEY
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    className="flex-1 bg-surface-subtle text-primary font-label-mono-lg text-sm px-4 py-3 border border-hairline-light rounded-xl focus:outline-none focus:border-primary font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyKey}
                    className="px-5 py-3 bg-surface-container hover:bg-surface-container-high text-primary font-label-mono-sm text-xs font-bold uppercase rounded-xl border border-hairline-light cursor-pointer"
                  >
                    {keyVerified ? 'KEY VERIFIED ✓' : 'VERIFY KEY'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLaunchAdmin}
                className="w-full py-4 sm:py-5 bg-sabotage-crimson text-on-primary font-label-mono-lg text-base sm:text-lg uppercase tracking-wider font-extrabold shadow-[4px_4px_0px_#000] hover:bg-black active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer rounded-xl mt-2"
              >
                <span>LAUNCH ADMIN COMMAND CONSOLE</span>
                <span className="material-symbols-outlined text-2xl">tune</span>
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
