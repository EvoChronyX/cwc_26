import React, { useState } from 'react';
import ClashLogo from '../components/common/ClashLogo';
import { useGame } from '../context/GameContext';

export default function PlayerArena() {
  const {
    setCurrentView,
    nammaAreaSubTab,
    setNammaAreaSubTab,
    teamName,
    p1Handle,
    p2Handle,
    activeFaction,
    teams,
    buzzersArmed,
    isLockedIn,
    buzzerPressResult,
    activeThreat,
    executeBuzzIn,
    deploySabotageToTeam,
    playTone
  } = useGame();

  // Sabotage Target state per card in Power-up Pothys
  const [targetTeam1, setTargetTeam1] = useState(2);
  const [targetTeam2, setTargetTeam2] = useState(2);
  const [targetTeam3, setTargetTeam3] = useState(2);
  const [targetTeam4, setTargetTeam4] = useState(2);
  const [targetTeam5, setTargetTeam5] = useState(2);
  const [targetTeam6, setTargetTeam6] = useState(2);

  const currentTeam = teams.find((t) => t.id === 1) || {
    score: 1450,
    teamName: teamName || 'TEAM KINETIC',
    p1: p1Handle || 'VALKYRIE_01',
    p2: p2Handle || 'NEXUS_CORE',
    lane: 'Lane #01',
    winRate: '78%',
    activeSabotages: []
  };

  const rivalTeams = teams.filter((t) => t.id !== 1);

  return (
    <div className="w-full min-h-screen bg-background flex">
      
      {/* Dedicated Left Sidebar for Namma Area */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col pt-space-md pb-space-lg border-r border-hairline-light">
        <div className="px-space-md mb-6 flex flex-col gap-space-2xs">
          <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant tracking-wider">
            PLAYER SUITE // LIVE ARENA
          </span>
          <span className="font-headline-md text-headline-md tracking-tight font-bold text-primary">
            NAMMA AREA
          </span>
        </div>

        {/* The 3 Dedicated Options for Namma Area */}
        <nav className="flex-1 px-space-sm flex flex-col gap-1.5">
          {/* 1. Kootani */}
          <button
            type="button"
            onClick={() => {
              setNammaAreaSubTab('kootani');
              playTone(750, 0.08);
            }}
            className={`flex items-center px-space-sm py-2.5 transition-all rounded-lg text-left cursor-pointer w-full font-body-base text-sm ${
              nammaAreaSubTab === 'kootani'
                ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">groups</span>
            Kootani
          </button>

          {/* 2. Mani Adi */}
          <button
            type="button"
            onClick={() => {
              setNammaAreaSubTab('mani-adi');
              playTone(850, 0.08);
            }}
            className={`flex items-center px-space-sm py-2.5 transition-all rounded-lg text-left cursor-pointer w-full font-body-base text-sm ${
              nammaAreaSubTab === 'mani-adi'
                ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">notifications_active</span>
            Mani Adi
          </button>

          {/* 3. Power-up Pothys */}
          <button
            type="button"
            onClick={() => {
              setNammaAreaSubTab('power-up-pothys');
              playTone(950, 0.08);
            }}
            className={`flex items-center px-space-sm py-2.5 transition-all rounded-lg text-left cursor-pointer w-full font-body-base text-sm ${
              nammaAreaSubTab === 'power-up-pothys'
                ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">bolt</span>
            Power-up Pothys
          </button>
        </nav>

        {/* Sidebar Telemetry Footer */}
        <div className="px-space-md pt-space-md mt-auto">
          <div className="bg-surface-subtle p-space-sm rounded-lg flex flex-col gap-1 border border-hairline-light">
            <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">ACTIVE SQUAD</span>
            <span className="font-label-mono-lg text-sm text-primary font-bold">{currentTeam.teamName}</span>
            <div className="flex items-center justify-between pt-1 border-t border-hairline-light mt-1">
              <span className="font-label-mono-sm text-xs text-on-surface-variant">{currentTeam.lane}</span>
              <span className="font-label-mono-sm text-xs text-signal-emerald font-bold">{currentTeam.score} PTS</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="pl-64 w-full min-h-screen">
        
        {/* Top Header */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-md z-40 flex items-center justify-between px-4 sm:px-8 border-b border-hairline-light">
          <div className="flex items-center gap-space-md">
            <ClashLogo className="h-7 sm:h-8 w-auto" />
            <span className="font-headline-md text-headline-md tracking-tight font-bold text-primary hidden sm:inline-block">
              NAMMA AREA
            </span>
            <div className="flex items-center gap-space-xs bg-surface-subtle px-space-sm py-space-2xs rounded-full">
              <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse"></span>
              <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase">SYS_ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <nav className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentView('arena')}
                className="transition-colors text-primary font-semibold bg-surface-subtle px-space-sm py-space-xs rounded-full text-sm cursor-pointer"
              >
                Namma Area
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('admin')}
                className="font-body-base text-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1 cursor-pointer"
              >
                Admin Console
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('portal')}
                className="font-body-base text-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1 cursor-pointer"
              >
                Portal Access / Login
              </button>
            </nav>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[1px_1px_0px_#CCFF00]">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Top Transmission Status Ribbon */}
        <section className="w-full mt-16 bg-canvas-dark text-on-primary px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-hairline-dark">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal-emerald animate-ping"></span>
              <span className="font-label-mono-sm text-label-mono-sm uppercase text-signal-emerald tracking-widest">
                TRANSMISSION: 8.4ms LATENCY
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container">MATCH ID:</span>
              <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse font-bold">#ARENA-FINALS-994</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-surface-dark px-3 py-1 rounded-full">
              <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container">SPECTATORS:</span>
              <span className="font-label-mono-sm text-label-mono-sm text-on-primary font-bold">1,842 LIVE</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-fixed px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-mono-sm text-label-mono-sm uppercase font-bold tracking-wider">SYNC ENGINE: ACTIVE</span>
            </div>
          </div>
        </section>

        {/* Content Workspace */}
        <main className="w-full p-4 sm:p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
          
          {/* ========================================================================= */}
          {/* SUBTAB 1: KOOTANI (Team Dossier & Leaderboard)                            */}
          {/* ========================================================================= */}
          {nammaAreaSubTab === 'kootani' && (
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 gap-6 border-b border-hairline-light">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase text-on-surface tracking-wider rounded-full">
                      KOOTANI // SQUAD ALLIANCE HUB
                    </span>
                    <span className="px-3 py-1 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase tracking-wider rounded-full flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald"></span> {currentTeam.teamName}
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary font-bold">
                    Squad Dossier &amp; Tournament Standings
                  </h1>
                  <p className="font-body-base text-body-base text-on-surface-variant">
                    Your official 2-player team identity, synchronized scoring telemetry, division standings, and global tournament rankings.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-surface-subtle p-4 rounded-xl flex flex-col items-start min-w-[130px] border border-hairline-light">
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">ROUND CLOCK</span>
                    <span className="font-label-mono-lg text-headline-md text-primary font-bold tracking-tight">01:42.85</span>
                  </div>
                  <div className="bg-primary text-on-primary p-4 rounded-xl flex flex-col items-start min-w-[140px] shadow-[3px_3px_0px_#CCFF00]">
                    <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse uppercase">TEAM SCORE</span>
                    <span className="font-label-mono-lg text-headline-md text-on-primary font-bold tracking-tight">
                      {currentTeam.score.toLocaleString()} PTS
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Dossier Hero Card */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-hairline-light">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-hairline-light gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold shadow-[2px_2px_0px_#CCFF00]">
                      T1
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                          {currentTeam.teamName}
                        </h2>
                        <span className="bg-acid-chartreuse text-canvas-dark text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          YOUR TEAM
                        </span>
                      </div>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                        {currentTeam.lane} // DIVISION: {activeFaction}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-surface-subtle rounded-full font-label-mono-sm text-label-mono-sm text-primary font-bold border border-hairline-light">
                      STATUS: ONLINE &amp; SYNCHRONIZED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Squad Members */}
                  <div className="bg-surface-subtle p-5 rounded-xl border border-hairline-light flex flex-col gap-3">
                    <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase font-bold">
                      2-PLAYER SQUAD MEMBERS
                    </span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between p-2 bg-surface-container-lowest rounded border border-hairline-light">
                        <span className="font-body-base text-sm font-semibold text-primary">Player 1: {currentTeam.p1 || p1Handle}</span>
                        <span className="font-label-mono-sm text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded">POD 01</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-surface-container-lowest rounded border border-hairline-light">
                        <span className="font-body-base text-sm font-semibold text-primary">Player 2: {currentTeam.p2 || p2Handle}</span>
                        <span className="font-label-mono-sm text-[10px] bg-cobalt-deep text-on-primary px-1.5 py-0.5 rounded">POD 02</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-surface-subtle p-5 rounded-xl border border-hairline-light flex flex-col justify-between">
                    <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase font-bold">
                      ARENA PERFORMANCE
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="font-label-mono-sm text-sm text-on-surface-variant">WIN STREAK</span>
                      <span className="font-headline-md font-bold text-primary">{currentTeam.streak} Questions</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="font-label-mono-sm text-sm text-on-surface-variant">BUZZ ACCURACY</span>
                      <span className="font-headline-md font-bold text-signal-emerald">{currentTeam.winRate}</span>
                    </div>
                  </div>

                  {/* Active Disruptions */}
                  <div className="bg-surface-subtle p-5 rounded-xl border border-hairline-light flex flex-col justify-between">
                    <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase font-bold">
                      DEFENSIVE STATUS
                    </span>
                    <div className="mt-2">
                      {currentTeam.activeSabotages.length > 0 ? (
                        <div className="p-3 bg-error-container rounded border border-sabotage-crimson text-sabotage-crimson font-body-base text-xs font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sabotage-crimson animate-ping"></span>
                          Under Attack: {currentTeam.activeSabotages.join(', ')}
                        </div>
                      ) : (
                        <div className="p-3 bg-signal-emerald/10 text-secondary rounded font-body-base text-xs font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-signal-emerald"></span>
                          Shields Nominal // No Active Disruptions
                        </div>
                      )}
                    </div>
                    <span className="font-label-mono-sm text-[10px] text-on-surface-variant uppercase mt-2">
                      Report disruptions to Game Master on Thalaivar Page.
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Team Leaderboard */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-hairline-light">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 pb-4 border-b border-hairline-light">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-signal-emerald"></span>
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant font-bold tracking-widest">
                        GLOBAL BRACKET STANDINGS
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg text-primary uppercase font-bold tracking-tight">
                      Live Tournament Team Leaderboard
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-on-primary px-3 py-1 rounded-full font-label-mono-sm text-label-mono-sm uppercase font-bold">
                      SORTED BY: TOTAL SCORE (PTS)
                    </span>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-hairline-light bg-surface-subtle font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                        <th className="py-4 px-6">RANK</th>
                        <th className="py-4 px-6">TEAM IDENTITY</th>
                        <th className="py-4 px-6">SQUAD MEMBERS</th>
                        <th className="py-4 px-6">R1 SCORE</th>
                        <th className="py-4 px-6">R2 SCORE</th>
                        <th className="py-4 px-6">TOTAL PTS</th>
                        <th className="py-4 px-6 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-light font-body-base text-body-base">
                      {teams.map((t, idx) => (
                        <tr key={t.id} className={`hover:bg-surface-subtle/50 transition-colors ${t.id === 1 ? 'bg-surface-subtle/40' : ''}`}>
                          <td className="py-4 px-6 font-label-mono-lg text-label-mono-lg font-bold text-primary">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              idx === 0 ? 'bg-acid-chartreuse text-canvas-dark' : 'bg-surface-container text-on-surface-variant'
                            }`}>
                              #0{idx + 1}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary text-base">{t.teamName}</span>
                              {t.id === 1 && (
                                <span className="bg-acid-chartreuse text-canvas-dark text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase">{t.lane}</span>
                          </td>
                          <td className="py-4 px-6 font-body-base text-sm text-on-surface-variant">
                            {t.p1} &amp; {t.p2}
                          </td>
                          <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">{t.r1}</td>
                          <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">{t.r2}</td>
                          <td className="py-4 px-6 font-headline-md text-headline-md font-bold text-primary">
                            {t.score.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="inline-block bg-primary text-acid-chartreuse px-2.5 py-0.5 rounded-full font-label-mono-sm text-[10px] font-bold uppercase">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 2: MANI ADI (Dedicated Buzzer Arena with Enhanced Telemetry)       */}
          {/* ========================================================================= */}
          {nammaAreaSubTab === 'mani-adi' && (
            <div className="flex flex-col gap-8">
              
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 gap-6 border-b border-hairline-light">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase text-on-surface tracking-wider rounded-full">
                      MANI ADI // LIVE BUZZER ARENA
                    </span>
                    <span className="px-3 py-1 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase tracking-wider rounded-full flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald"></span> {currentTeam.teamName}
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary font-bold">
                    Tactile Buzzer Trigger Deck
                  </h1>
                  <p className="font-body-base text-body-base text-on-surface-variant">
                    Strike your optical debounce actuator with microsecond precision. First to press seizes response priority on the active tournament challenge.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-surface-subtle p-4 rounded-xl flex flex-col items-start min-w-[130px] border border-hairline-light">
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">ROUND CLOCK</span>
                    <span className="font-label-mono-lg text-headline-md text-primary font-bold tracking-tight">01:42.85</span>
                  </div>
                  <div className="bg-primary text-on-primary p-4 rounded-xl flex flex-col items-start min-w-[140px] shadow-[3px_3px_0px_#CCFF00]">
                    <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse uppercase">BUZZ SENSITIVITY</span>
                    <span className="font-label-mono-lg text-headline-md text-on-primary font-bold tracking-tight">0.002 SEC</span>
                  </div>
                </div>
              </div>

              {/* MASSIVE INTERACTIVE BUZZER UNIT */}
              <div className="w-full bg-canvas-dark text-on-primary rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl flex flex-col items-center text-center border border-hairline-dark">
                {/* Ambient Technical Grid Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#CCFF00_1px,transparent_1px)] [background-size:24px_24px]"></div>

                {/* Status Telemetry Pill */}
                <div className="relative z-10 flex items-center gap-3 mb-8">
                  <div className="flex items-center gap-2 bg-surface-dark px-6 py-2.5 rounded-full border border-hairline-dark shadow-md">
                    <span className={`w-3 h-3 rounded-full ${isLockedIn ? 'bg-acid-chartreuse' : buzzersArmed ? 'bg-signal-emerald animate-pulse' : 'bg-sabotage-crimson'}`}></span>
                    <span className={`font-label-mono-sm text-label-mono-sm uppercase tracking-widest font-bold ${
                      isLockedIn ? 'text-acid-chartreuse' : buzzersArmed ? 'text-signal-emerald' : 'text-sabotage-crimson'
                    }`}>
                      {isLockedIn
                        ? 'BUZZER LOCKED // TRANSMITTED'
                        : buzzersArmed
                        ? 'BUZZER ACTIVE (READY)'
                        : 'BUZZER CIRCUIT LOCKED'}
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container hidden sm:inline-block">
                    TRIGGER MODE: ZERO-DEBOUNCE QUANTUM
                  </span>
                </div>

                {/* Center Interactive Massive Button Container */}
                <div className="relative z-10 my-6 flex items-center justify-center">
                  {/* Outer Pulsing Ring */}
                  <div className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-acid-chartreuse/10 pointer-events-none transition-all duration-1000 ${
                    isLockedIn ? 'scale-125 opacity-0' : 'animate-ping'
                  }`}></div>
                  
                  {/* Secondary Halo */}
                  <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-acid-chartreuse/30 pointer-events-none"></div>

                  {/* THE ROUND BUZZER BUTTON */}
                  <button
                    type="button"
                    onClick={executeBuzzIn}
                    disabled={!buzzersArmed || isLockedIn}
                    className={`relative w-60 h-60 sm:w-76 sm:h-76 rounded-full flex flex-col items-center justify-center p-6 select-none cursor-pointer focus:outline-none transition-all duration-150 active:scale-95 ${
                      isLockedIn
                        ? 'bg-surface-dark border-4 border-signal-emerald shadow-[0px_0px_60px_rgba(0,255,133,0.5)]'
                        : buzzersArmed
                        ? 'bg-primary border-4 border-acid-chartreuse shadow-[0px_0px_45px_rgba(204,255,0,0.5)] hover:shadow-[0px_0px_70px_rgba(204,255,0,0.8)]'
                        : 'bg-surface-dark border-4 border-sabotage-crimson opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-6xl mb-2 ${isLockedIn ? 'text-signal-emerald' : 'text-acid-chartreuse'}`}>
                      {isLockedIn ? 'task_alt' : 'notifications_active'}
                    </span>
                    <span className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-primary tracking-tight leading-tight uppercase">
                      {isLockedIn ? 'LOCKED' : 'MANI ADI'}
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse tracking-widest uppercase mt-1 font-bold">
                      {isLockedIn ? 'TRANSMITTED' : 'BUZZ IN NOW'}
                    </span>
                    <span className="font-label-mono-sm text-[10px] text-on-primary-container tracking-wider uppercase mt-3">
                      TAP SCREEN // SPACEBAR
                    </span>
                  </button>
                </div>

                {/* Real-Time Ultra-Cool Feedback Banner */}
                <div className="relative z-10 mt-6 w-full max-w-2xl transition-all duration-300">
                  {isLockedIn ? (
                    <div className="bg-primary border-2 border-acid-chartreuse rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[4px_4px_0px_#CCFF00] animate-bounce">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-14 h-14 rounded-2xl bg-signal-emerald text-primary flex items-center justify-center font-bold text-2xl shadow-md">
                          <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                        </div>
                        <div>
                          <span className="font-headline-lg text-xl sm:text-2xl text-acid-chartreuse font-bold block">
                            {buzzerPressResult.title} ({buzzerPressResult.latency})
                          </span>
                          <span className="font-body-base text-sm text-on-primary block mt-0.5">
                            Precision timestamp: <strong className="text-signal-emerald">{buzzerPressResult.time}</strong> • Priority lock registered for <strong>{currentTeam.teamName}</strong>.
                          </span>
                        </div>
                      </div>
                      <span className="bg-surface-dark text-signal-emerald font-label-mono-sm text-xs px-4 py-2 rounded-full uppercase font-bold border border-hairline-dark tracking-wider whitespace-nowrap">
                        1ST IN QUEUE
                      </span>
                    </div>
                  ) : (
                    <div className="bg-surface-dark border border-hairline-dark rounded-2xl p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-acid-chartreuse text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined font-bold">timer</span>
                        </div>
                        <div className="text-left">
                          <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse font-bold block">
                            SYSTEM READY FOR INPUT
                          </span>
                          <span className="font-body-sm text-body-sm text-on-primary-container">
                            Strike the buzzer now to seize response priority on the current challenge.
                          </span>
                        </div>
                      </div>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container hidden sm:block">READY</span>
                    </div>
                  )}
                </div>

                {/* Micro Guidance */}
                <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-6 text-on-primary-container font-label-mono-sm text-label-mono-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-acid-chartreuse">bolt</span>
                    FASTEST TIME REGISTERED TODAY: 0.142s
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-acid-chartreuse">lock_clock</span>
                    FALSE BUZZ PENALTY: -50 PTS
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 3: POWER-UP POTHYS (Sabotages Armory in Previous Admin Style)      */}
          {/* ========================================================================= */}
          {nammaAreaSubTab === 'power-up-pothys' && (
            <div className="flex flex-col gap-8">
              
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 gap-6 border-b border-hairline-light">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase text-sabotage-crimson tracking-wider rounded-full font-bold">
                      POWER-UP POTHYS // DISRUPTION ARMORY
                    </span>
                    <span className="px-3 py-1 bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase tracking-wider rounded-full">
                      SQUAD ARSENAL ACTIVE
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary font-bold">
                    Tactical Sabotages Armory
                  </h1>
                  <p className="font-body-base text-body-base text-on-surface-variant">
                    Deploy cognitive and sensory disruption payloads against rival contending teams to scramble their response buffers and clocks.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-body-sm font-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-signal-emerald"></span> Armed</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sabotage-crimson"></span> Active</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-outline"></span> Cooldown</span>
                </div>
              </div>

              {/* Incoming Threat Monitor Pill */}
              <div className={`p-5 rounded-2xl flex items-center justify-between transition-colors border ${
                activeThreat.isActive
                  ? 'bg-error-container border-sabotage-crimson shadow-[3px_3px_0px_#FF2A3B]'
                  : 'bg-surface-subtle border-hairline-light'
              }`}>
                <div className="flex items-center gap-4">
                  <span className={`w-4 h-4 rounded-full ${activeThreat.isActive ? 'bg-sabotage-crimson animate-ping' : 'bg-signal-emerald'}`}></span>
                  <div>
                    <span className={`font-label-mono-sm text-label-mono-sm uppercase font-bold block ${
                      activeThreat.isActive ? 'text-sabotage-crimson' : 'text-primary'
                    }`}>
                      {activeThreat.name}
                    </span>
                    <span className="font-body-base text-sm text-on-surface-variant">
                      {activeThreat.sub}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase block">REMAINING DURATION</span>
                  <span className={`font-headline-lg text-headline-lg font-bold ${
                    activeThreat.isActive ? 'text-sabotage-crimson' : 'text-on-surface-variant'
                  }`}>
                    00:{activeThreat.timeLeft < 10 ? `0${activeThreat.timeLeft}` : activeThreat.timeLeft}
                  </span>
                </div>
              </div>

              {/* 6 Sabotages in 3-Column Grid (Modeled after Previous Admin Armory) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Sabotage 1: Static Blind */}
                <div className="bg-surface-subtle p-6 rounded-xl flex flex-col justify-between gap-4 border border-hairline-light hover:bg-surface-container/60 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-full">Available</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">DUR: 15s</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-primary mt-1">Static Blind</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Injects heavy analog grain and severe optical blurring to target player HUD.</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target Team:</span>
                      <select
                        className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1 border border-hairline-light"
                        value={targetTeam1}
                        onChange={(e) => setTargetTeam1(Number(e.target.value))}
                      >
                        {rivalTeams.map((t) => (
                          <option key={t.id} value={t.id}>{t.teamName}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deploySabotageToTeam('Static Blind', 15, targetTeam1)}
                      className="w-full py-3 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#CCFF00]"
                    >
                      Deploy Disruption
                    </button>
                  </div>
                </div>

                {/* Sabotage 2: Reverse Controls */}
                <div className="bg-surface-subtle p-6 rounded-xl flex flex-col justify-between gap-4 border border-hairline-light hover:bg-surface-container/60 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-full">Available</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">DUR: 20s</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-primary mt-1">Reverse Controls</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Inverts buzzer touch triggers and directional multiple choice selection matrix.</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target Team:</span>
                      <select
                        className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1 border border-hairline-light"
                        value={targetTeam2}
                        onChange={(e) => setTargetTeam2(Number(e.target.value))}
                      >
                        {rivalTeams.map((t) => (
                          <option key={t.id} value={t.id}>{t.teamName}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deploySabotageToTeam('Reverse Controls', 20, targetTeam2)}
                      className="w-full py-3 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#CCFF00]"
                    >
                      Deploy Disruption
                    </button>
                  </div>
                </div>

                {/* Sabotage 3: Sound Distortion */}
                <div className="bg-surface-subtle p-6 rounded-xl flex flex-col justify-between gap-4 border border-hairline-light hover:bg-surface-container/60 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-full">Available</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">DUR: 10s</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-primary mt-1">Sound Distortion</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Streams 85dB filtered pink noise and synthetic radio fuzz into target earpiece.</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target Team:</span>
                      <select
                        className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1 border border-hairline-light"
                        value={targetTeam3}
                        onChange={(e) => setTargetTeam3(Number(e.target.value))}
                      >
                        {rivalTeams.map((t) => (
                          <option key={t.id} value={t.id}>{t.teamName}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deploySabotageToTeam('Sound Distortion', 10, targetTeam3)}
                      className="w-full py-3 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#CCFF00]"
                    >
                      Deploy Disruption
                    </button>
                  </div>
                </div>

                {/* Sabotage 4: Buzzer Jammer */}
                <div className="bg-surface-subtle p-6 rounded-xl flex flex-col justify-between gap-4 border border-hairline-light hover:bg-surface-container/60 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-sabotage-crimson text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded-full">CRITICAL</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">DUR: 30s</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-primary mt-1">Buzzer Jammer</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Artificially inserts 3.00s latency buffer upon hardware buzzer strike.</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target Team:</span>
                      <select
                        className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1 border border-hairline-light"
                        value={targetTeam4}
                        onChange={(e) => setTargetTeam4(Number(e.target.value))}
                      >
                        {rivalTeams.map((t) => (
                          <option key={t.id} value={t.id}>{t.teamName}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deploySabotageToTeam('Buzzer Jammer', 30, targetTeam4)}
                      className="w-full py-3 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#CCFF00]"
                    >
                      Deploy Disruption
                    </button>
                  </div>
                </div>

                {/* Sabotage 5: Double Risk */}
                <div className="bg-surface-subtle p-6 rounded-xl flex flex-col justify-between gap-4 border border-hairline-light hover:bg-surface-container/60 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-cobalt-deep text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded-full">2X MULT</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">STAKE</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-primary mt-1">Double Risk</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Stake next response: +200% points or instant severe -200 deduction.</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target Team:</span>
                      <select
                        className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1 border border-hairline-light"
                        value={targetTeam5}
                        onChange={(e) => setTargetTeam5(Number(e.target.value))}
                      >
                        {rivalTeams.map((t) => (
                          <option key={t.id} value={t.id}>{t.teamName}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deploySabotageToTeam('Double Risk', 15, targetTeam5)}
                      className="w-full py-3 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#CCFF00]"
                    >
                      Deploy Disruption
                    </button>
                  </div>
                </div>

                {/* Sabotage 6: Time Drain */}
                <div className="bg-surface-subtle p-6 rounded-xl flex flex-col justify-between gap-4 border border-hairline-light hover:bg-surface-container/60 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-full">Available</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">-5 SEC</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-primary mt-1">Time Drain</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Instantly accelerates target squad's answer countdown clock.</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target Team:</span>
                      <select
                        className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1 border border-hairline-light"
                        value={targetTeam6}
                        onChange={(e) => setTargetTeam6(Number(e.target.value))}
                      >
                        {rivalTeams.map((t) => (
                          <option key={t.id} value={t.id}>{t.teamName}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deploySabotageToTeam('Time Drain', 10, targetTeam6)}
                      className="w-full py-3 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#CCFF00]"
                    >
                      Trigger Instant Drain
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
