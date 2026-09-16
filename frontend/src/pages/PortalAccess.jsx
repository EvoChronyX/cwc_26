import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

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
    <div className="w-full flex items-center justify-center min-h-screen bg-background pt-16 pb-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12 flex flex-col gap-10">
        
        {/* Top Telemetry & Global Breadcrumb Bar */}
        <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-hairline-light">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-signal-emerald animate-pulse"></span>
            <span className="font-label-mono-sm text-label-mono-sm tracking-widest text-on-surface uppercase">SYS_ACTIVE // CLASH_NODE_09</span>
            <span className="text-outline-variant font-label-mono-sm text-label-mono-sm">/</span>
            <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">REGISTRATION PROTOCOL</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full">
              <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">REGION:</span>
              <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface font-bold">US-EAST (0.14ms)</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-on-primary rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-acid-chartreuse"></span>
              <span className="font-label-mono-sm text-label-mono-sm uppercase">NET: SECURED</span>
            </div>
          </div>
        </header>

        {/* Editorial Header Block */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-surface-dark text-acid-chartreuse font-label-mono-sm text-label-mono-sm uppercase">SESSION SETUP</span>
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase tracking-wider">// ARENA SYNC 4.2</span>
            </div>
            <h1 className="font-display-hero text-headline-xl lg:text-display-hero uppercase tracking-tight leading-none text-primary font-bold">
              STAGE CLASH:<br />LIVE TOURNAMENT ACCESS
            </h1>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-end gap-3 pb-1">
            <p className="font-body-lead text-body-lead text-on-surface-variant leading-relaxed">
              Register your team identity (2 players per squad) to sync hardware buzzers or authenticate directly as presiding Game Master.
            </p>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="font-label-mono-sm text-label-mono-sm">EST. QUEUE LATENCY: &lt; 0.4 SEC</span>
            </div>
          </div>
        </section>

        {/* Main Workspace Bento Split */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Form Container */}
          <section className="lg:col-span-7 bg-surface-container-lowest shadow-sm rounded-none p-6 sm:p-8 flex flex-col gap-8 relative overflow-hidden border border-hairline-light">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-acid-chartreuse via-cobalt-deep to-acid-chartreuse"></div>

            {/* Mode Selector Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-hairline-light">
              <div className="inline-flex p-1 bg-surface-subtle rounded-none">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('player');
                    playTone(700, 0.08);
                  }}
                  className={`px-5 py-2.5 text-xs font-label-mono-sm tracking-wider uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                    authMode === 'player'
                      ? 'bg-primary text-on-primary shadow-sm'
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
                  className={`px-5 py-2.5 text-xs font-label-mono-sm tracking-wider uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                    authMode === 'admin'
                      ? 'bg-cobalt-deep text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${authMode === 'admin' ? 'bg-acid-chartreuse' : 'bg-outline-variant'}`}></span>
                  <span>Admin Console Login</span>
                </button>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">AUTH PROTOCOL:</span>
                <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase font-bold">
                  {authMode === 'player' ? 'TEAM SQUAD SYNC' : 'GAME MASTER DIRECT'}
                </span>
              </div>
            </div>

            {/* PLAYER ACCESS PANEL */}
            {authMode === 'player' ? (
              <div className="flex flex-col gap-6">
                
                {/* 1. Team Name Field (NEW - Team consists of 2 players) */}
                <div className="bg-surface-subtle p-5 flex flex-col gap-2 border border-hairline-light">
                  <div className="flex items-center justify-between">
                    <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase font-bold tracking-wider">
                      TEAM IDENTIFIER (2 PLAYERS SQUAD)
                    </span>
                    <span className="px-2 py-0.5 bg-primary text-acid-chartreuse font-label-mono-sm text-xs font-bold uppercase">
                      DUAL POD
                    </span>
                  </div>
                  <label className="font-label-mono-sm text-xs text-on-surface-variant uppercase" htmlFor="team-name">
                    Registered Team Name:
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest text-primary font-headline-md text-headline-md px-4 py-3 border-b-2 border-primary focus:border-cobalt-deep focus:outline-none placeholder:text-outline-variant font-bold uppercase tracking-tight"
                    id="team-name"
                    placeholder="ENTER YOUR TEAM NAME..."
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                {/* 2 Players Handles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Player 1 */}
                  <div className="bg-surface-subtle p-5 flex flex-col gap-4 border border-hairline-light">
                    <div className="flex items-center justify-between">
                      <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase font-bold tracking-wider">POD 01 // PLAYER 1</span>
                      <span className="w-3 h-3 bg-acid-chartreuse"></span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="p1-handle">
                        Player 1 Handle
                      </label>
                      <input
                        className="w-full bg-surface-container-lowest text-primary font-headline-md text-headline-md px-3 py-2 border-b-2 border-primary focus:border-cobalt-deep focus:outline-none placeholder:text-outline-variant font-medium uppercase tracking-tight"
                        id="p1-handle"
                        placeholder="ENTER HANDLE..."
                        type="text"
                        value={p1Handle}
                        onChange={(e) => setP1Handle(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">BUZZER POD STATUS</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-secondary uppercase font-bold">READY (CH-01)</span>
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className="bg-surface-subtle p-5 flex flex-col gap-4 border border-hairline-light">
                    <div className="flex items-center justify-between">
                      <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase font-bold tracking-wider">POD 02 // PLAYER 2</span>
                      <span className="w-3 h-3 bg-cobalt-deep"></span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="p2-handle">
                        Player 2 Handle
                      </label>
                      <input
                        className="w-full bg-surface-container-lowest text-primary font-headline-md text-headline-md px-3 py-2 border-b-2 border-primary focus:border-cobalt-deep focus:outline-none placeholder:text-outline-variant font-medium uppercase tracking-tight"
                        id="p2-handle"
                        placeholder="ENTER HANDLE..."
                        type="text"
                        value={p2Handle}
                        onChange={(e) => setP2Handle(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">BUZZER POD STATUS</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-secondary uppercase font-bold">READY (CH-02)</span>
                    </div>
                  </div>
                </div>

                {/* Faction & Arena PIN Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                  {/* Faction Selection */}
                  <div className="md:col-span-7 flex flex-col gap-2">
                    <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">Select Division / Faction</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['KINETIC', 'SYNTH', 'VECTOR'].map((faction) => (
                        <button
                          key={faction}
                          type="button"
                          onClick={() => {
                            setActiveFaction(faction);
                            playTone(750, 0.06);
                          }}
                          className={`py-2.5 px-2 font-label-mono-sm text-label-mono-sm uppercase text-center transition-all cursor-pointer ${
                            activeFaction === faction
                              ? 'bg-primary text-on-primary shadow-[2px_2px_0px_#CCFF00]'
                              : 'bg-surface-subtle text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          {faction}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PIN Code */}
                  <div className="md:col-span-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="arena-pin">
                        Match PIN
                      </label>
                      <span className="font-label-mono-sm text-label-mono-sm text-cobalt-deep font-bold">LOBBY #882</span>
                    </div>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-subtle text-primary font-label-mono-lg text-label-mono-lg px-3 py-2 text-center tracking-widest uppercase focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                        id="arena-pin"
                        maxLength={6}
                        type="text"
                        value={arenaPin}
                        onChange={(e) => setArenaPin(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-base">lock_open</span>
                    <span className="font-label-mono-sm text-label-mono-sm uppercase">LOBBY PASSCODE AUTHENTICATED</span>
                  </div>
                  <button
                    onClick={handleEnterArena}
                    type="button"
                    className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-headline-md text-headline-md uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform duration-100 flex items-center justify-center gap-3 cursor-pointer shadow-[4px_4px_0px_#CCFF00]"
                  >
                    <span>Enter Namma Area</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ADMIN ACCESS PANEL */
              <div className="flex flex-col gap-6">
                <div className="p-4 bg-surface-subtle border-l-4 border-cobalt-deep flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <p className="font-label-mono-sm text-label-mono-sm uppercase text-primary font-bold">GAME MASTER CONSOLE ELEVATION</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Direct hardware telemetry override, round arbitration, and scoring overrides.</p>
                  </div>
                  <span className="px-3 py-1 bg-surface-dark text-on-primary font-label-mono-sm text-label-mono-sm uppercase tracking-wider self-start sm:self-auto">ROOT_ROLE</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="gm-id">
                      Game Master Identifier
                    </label>
                    <input
                      className="w-full bg-surface-subtle text-primary font-body-base text-body-base px-3 py-3 border-b-2 border-primary focus:border-cobalt-deep focus:outline-none uppercase font-semibold"
                      id="gm-id"
                      type="text"
                      value={gmId}
                      onChange={(e) => setGmId(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="session-token">
                      Session Target Token
                    </label>
                    <input
                      className="w-full bg-surface-subtle text-primary font-body-base text-body-base px-3 py-3 border-b-2 border-primary focus:border-cobalt-deep focus:outline-none uppercase font-semibold"
                      id="session-token"
                      type="text"
                      value={sessionToken}
                      onChange={(e) => setSessionToken(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="master-key">
                    Admin Passcode / Master Cryptographic Key
                  </label>
                  <div className="relative flex items-center">
                    <input
                      className="w-full bg-surface-subtle text-primary font-label-mono-lg text-label-mono-lg px-3 py-3 border-b-2 border-primary focus:border-cobalt-deep focus:outline-none"
                      id="master-key"
                      type="password"
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                    />
                    <button
                      onClick={handleVerifyKey}
                      className="absolute right-3 text-on-surface-variant hover:text-primary font-label-mono-sm text-label-mono-sm uppercase cursor-pointer"
                      type="button"
                    >
                      {keyVerified ? '✓ VERIFIED' : 'VERIFY'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-signal-emerald"></span>
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">HOST PERMISSION LEVEL: UNRESTRICTED</span>
                  </div>
                  <button
                    onClick={handleLaunchAdmin}
                    className="w-full sm:w-auto px-8 py-4 bg-cobalt-deep text-on-primary font-headline-md text-headline-md uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform duration-100 flex items-center justify-center gap-3 cursor-pointer shadow-[4px_4px_0px_#050505]"
                    type="button"
                  >
                    <span>Launch Admin Command</span>
                    <span className="material-symbols-outlined">terminal</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Tactical Telemetry & Session Dossier Sidebar */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            {/* Active Match Status Card */}
            <div className="bg-surface-dark text-on-primary p-6 sm:p-7 flex flex-col gap-6 relative">
              <div className="flex items-center justify-between border-b border-hairline-dark pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-acid-chartreuse text-canvas-dark font-label-mono-sm text-label-mono-sm uppercase font-bold">LOBBY 01</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-primary-fixed uppercase tracking-wider">LIVE BRACKET FEED</span>
                </div>
                <span className="font-label-mono-sm text-label-mono-sm text-signal-emerald font-bold uppercase">ROUND 3/5</span>
              </div>

              {/* Mini Vector Visualizer */}
              <div className="bg-surface-dark/60 p-4 border border-hairline-dark flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono-sm text-label-mono-sm text-outline uppercase">BUZZER FREQUENCY SYNCHRONIZATION</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse">99.8%</span>
                </div>
                <svg className="w-full h-12" fill="none" preserveAspectRatio="none" viewBox="0 0 300 40">
                  <path d="M0 20 L25 20 L35 5 L45 35 L55 20 L90 20 L100 8 L110 32 L120 20 L170 20 L180 2 L190 38 L200 20 L240 20 L250 12 L260 28 L270 20 L300 20" fill="none" stroke="#CCFF00" strokeLinejoin="round" strokeWidth="2" />
                  <line stroke="#222222" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="300" y1="20" y2="20" />
                </svg>
                <div className="grid grid-cols-3 gap-2 pt-1 font-label-mono-sm text-label-mono-sm text-primary-fixed-dim">
                  <div>LATENCY: <span className="text-on-primary">1.2MS</span></div>
                  <div>JITTER: <span className="text-on-primary">0.03MS</span></div>
                  <div>DROP: <span className="text-signal-emerald">0.00%</span></div>
                </div>
              </div>

              {/* Quick Telemetry HUD */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-label-mono-sm text-label-mono-sm text-primary-fixed-dim uppercase">SLOT ALLOCATION</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-on-primary">2 OF 2 SEATS READY</span>
                </div>
                {/* Segmented Progress Bar */}
                <div className="grid grid-cols-10 gap-1.5 h-2 w-full">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-acid-chartreuse h-full"></div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-hairline-dark font-label-mono-sm text-label-mono-sm">
                <span className="text-outline uppercase">NEXT ENGAGEMENT:</span>
                <span className="text-acid-chartreuse tracking-widest font-bold">T-MINUS 00:01:42</span>
              </div>
            </div>

            {/* Editorial Info Cell */}
            <div className="bg-surface-subtle p-6 flex flex-col gap-3 border border-hairline-light">
              <div className="flex items-center gap-2">
                <span className="font-label-mono-sm text-label-mono-sm text-cobalt-deep uppercase font-bold">MATCH PROTOCOL BRIEF</span>
                <span className="text-outline-variant">/</span>
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">V3.4</span>
              </div>
              <p className="font-body-base text-body-base text-on-surface leading-relaxed">
                Stage Clash executes zero-tolerance input arbitration. Buzzer inputs are lock-checked server side within a 10-microsecond rolling quantum window. Dual-player teams must confirm presence via tactile trigger within 30 seconds of match call.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleEnterArena}
                  className="inline-flex items-center gap-1.5 font-label-mono-sm text-label-mono-sm text-primary hover:text-cobalt-deep uppercase underline underline-offset-4 cursor-pointer"
                >
                  <span>Review Tournament Rules in Namma Area</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>
              </div>
            </div>
          </aside>
        </main>

        {/* Visual Showcase Mosaic Section */}
        <section className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-hairline-light">
            <div className="flex flex-col gap-1">
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">ACTIVE ARENAS &amp; BROADCAST HUBS</span>
              <h2 className="font-headline-lg text-headline-lg uppercase text-primary font-bold">Live Tournament Pods</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">LIVE FEED RECORDERS: 03 ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-4 flex flex-col gap-3 group border border-hairline-light">
              <div className="w-full aspect-[16/10] bg-surface-dark relative overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                  alt="Esports Arena Stage"
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-canvas-dark text-on-primary font-label-mono-sm text-label-mono-sm uppercase">ARENA // A</div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-acid-chartreuse text-canvas-dark font-label-mono-sm text-label-mono-sm uppercase font-bold">BROADCAST 4K</div>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="font-label-mono-sm text-label-mono-sm text-cobalt-deep uppercase font-bold">POD A-10 • DUAL CONSOLE</span>
                <h3 className="font-headline-md text-headline-md uppercase text-primary font-bold">Main Stage Center Ring</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Primary competitive desk with dual hydraulic buzzers and physical response dampening.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 flex flex-col gap-3 group border border-hairline-light">
              <div className="w-full aspect-[16/10] bg-surface-dark relative overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                  alt="Mechanical tactile buzzer controllers"
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-canvas-dark text-on-primary font-label-mono-sm text-label-mono-sm uppercase">BUZZER // HARDWARE</div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-signal-emerald text-canvas-dark font-label-mono-sm text-label-mono-sm uppercase font-bold">TESTED 0.0MS</div>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="font-label-mono-sm text-label-mono-sm text-cobalt-deep uppercase font-bold">TELEMETRY RIG • V7</span>
                <h3 className="font-headline-md text-headline-md uppercase text-primary font-bold">Precision Lockout Units</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Optical debounce actuators wired directly to stage arbitration servers.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 flex flex-col gap-3 group border border-hairline-light">
              <div className="w-full aspect-[16/10] bg-surface-dark relative overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                  alt="Arbitration control nerve center"
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-canvas-dark text-on-primary font-label-mono-sm text-label-mono-sm uppercase">ADMIN // CONTROL</div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase font-bold">GAME MASTER 01</div>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="font-label-mono-sm text-label-mono-sm text-cobalt-deep uppercase font-bold">CONTROL ROOM • RACK B</span>
                <h3 className="font-headline-md text-headline-md uppercase text-primary font-bold">Arbitration Nerve Center</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time instant replay, override control switches, and tournament seed management.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Persistent Live Status Ticker */}
        <footer className="w-full mt-4 pt-4 border-t-2 border-primary">
          <div className="bg-primary text-on-primary p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-acid-chartreuse animate-pulse"></span>
              <p className="font-label-mono-sm text-label-mono-sm uppercase tracking-wider text-acid-chartreuse">
                MATCH STATUS: <span className="text-on-primary font-bold">LOBBY OPEN</span> • BUZZERS: <span className="text-on-primary font-bold">ARMED &amp; READY</span> • CONNECTED TEAMS: <span className="text-on-primary font-bold">4</span>
              </p>
            </div>
            <div className="flex items-center gap-6 font-label-mono-sm text-label-mono-sm uppercase">
              <span className="text-primary-fixed-dim">TOURNAMENT_ID: #CLASH-9042</span>
              <button
                type="button"
                onClick={() => playTone(800, 0.1)}
                className="text-acid-chartreuse cursor-pointer hover:underline uppercase bg-transparent border-none p-0 font-bold"
              >
                HARDWARE_RE-SYNC [F9]
              </button>
              <span className="text-primary-fixed-dim">NODE: NY-02</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
