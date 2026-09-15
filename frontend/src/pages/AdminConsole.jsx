import React, { useState } from 'react';
import ClashLogo from '../components/common/ClashLogo';
import { useGame } from '../context/GameContext';

export default function AdminConsole() {
  const {
    setCurrentView,
    p1Score,
    p2Score,
    buzzersArmed,
    isLockedIn,
    lockedPlayer,
    auditLogs,
    adjustScore,
    armBuzzers,
    lockBuzzers,
    resetBuzzers,
    awardFastestAnswer,
    rejectLockIn,
    deploySabotage,
    cancelSabotage,
    clearLogs,
    playTone
  } = useGame();

  const [customP1Delta, setCustomP1Delta] = useState('');
  const [customP2Delta, setCustomP2Delta] = useState('');
  const [targetSab1, setTargetSab1] = useState('Player 2 (Elena)');
  const [targetSab2, setTargetSab2] = useState('Player 2 (Elena)');
  const [targetSab4, setTargetSab4] = useState('Player 1 (Alex)');
  const [targetSab6, setTargetSab6] = useState('Player 2 (Elena)');

  const handleApplyCustom = (player) => {
    const val = parseInt(player === 1 ? customP1Delta : customP2Delta, 10);
    if (!isNaN(val)) {
      adjustScore(player, val);
      if (player === 1) setCustomP1Delta('');
      else setCustomP2Delta('');
      playTone(900, 0.1);
    }
  };

  const handleGlobalFreeze = () => {
    lockBuzzers();
    playTone(200, 0.3, 'sawtooth');
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col md:flex-row">
      
      {/* Left Sidebar (Desktop Fixed / Mobile Flow) */}
      <aside className="w-full md:w-64 bg-surface-container-low z-30 flex flex-col pt-20 md:pt-space-md pb-space-lg md:fixed md:top-0 md:left-0 md:h-full border-r border-hairline-light">
        <div className="px-space-md mb-6 flex flex-col gap-space-2xs">
          <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant tracking-wider">
            SYSTEM TELEMETRY
          </span>
          <span className="font-headline-md text-headline-md tracking-tight font-bold text-primary">
            ADMIN CONSOLE
          </span>
        </div>

        <nav className="flex-1 px-space-sm flex flex-col gap-1.5">
          <button
            onClick={() => setCurrentView('admin')}
            className="flex items-center px-space-sm py-space-xs transition-all bg-primary text-on-primary font-semibold rounded-lg text-left cursor-pointer w-full"
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">tune</span>
            Console Overview
          </button>
          <button
            onClick={() => setCurrentView('arena')}
            className="flex items-center px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all font-body-base text-body-base text-left cursor-pointer w-full"
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">swords</span>
            Live Arena HUD
          </button>
          <button
            onClick={() => setCurrentView('portal')}
            className="flex items-center px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all font-body-base text-body-base text-left cursor-pointer w-full"
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">vpn_key</span>
            Portal / Security
          </button>
        </nav>

        <div className="px-space-md pt-space-md mt-auto">
          <div className="bg-surface-subtle p-space-sm rounded-lg flex flex-col gap-space-2xs border border-hairline-light">
            <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">TELEMETRY LATENCY</span>
            <span className="font-label-mono-lg text-label-mono-lg text-primary font-bold">14ms // STABLE</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 w-full">
        
        {/* Sub Header for Admin View */}
        <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/90 backdrop-blur-md z-40 flex items-center justify-between px-4 sm:px-8 border-b border-hairline-light">
          <div className="flex items-center gap-space-md">
            <ClashLogo className="h-7 sm:h-8 w-auto" />
            <span className="font-headline-md text-headline-md tracking-tight font-bold text-primary hidden sm:inline-block">
              CLASH // CONTROL
            </span>
            <div className="flex items-center gap-space-xs bg-surface-subtle px-space-sm py-space-2xs rounded-full">
              <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse"></span>
              <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase">LIVE STATUS: ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <nav className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setCurrentView('arena')}
                className="font-body-base text-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1 cursor-pointer"
              >
                Player Arena
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className="transition-colors text-primary font-semibold bg-surface-subtle px-space-sm py-space-xs rounded-full text-sm cursor-pointer"
              >
                Admin Console
              </button>
              <button
                onClick={() => setCurrentView('portal')}
                className="font-body-base text-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1 cursor-pointer"
              >
                Portal Access / Login
              </button>
            </nav>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Console Content Workspace */}
        <main className="w-full pt-20 p-4 sm:p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
          
          {/* Executive Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 gap-6 border-b border-hairline-light">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase text-on-surface tracking-wider rounded-full">
                  Telemetry // Season 04
                </span>
                <span className="px-3 py-1 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase tracking-wider rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald"></span> Host Master Online
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary font-bold">
                Executive Arena Orchestration
              </h1>
              <p className="font-body-base text-body-base text-on-surface-variant">
                Direct hardware circuit manipulation, millisecond resolution buzzer triage, point adjustments, and hostile sensory sabotage triggers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-surface-subtle px-4 py-3 rounded-lg flex flex-col items-end border border-hairline-light">
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Round Clock</span>
                <span className="font-label-mono-lg text-label-mono-lg font-bold text-primary">03:42.89</span>
              </div>
              <button
                type="button"
                onClick={handleGlobalFreeze}
                className="bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase px-5 py-3 rounded-none shadow-[3px_3px_0px_#CCFF00] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">lock_reset</span> Global Freeze
              </button>
            </div>
          </div>

          {/* Section 1: Buzzer Master Deck */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline-light">
              <div>
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant block mb-1">
                  Subsystem 01 // Input Lock &amp; Arbitrage
                </span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
                  Buzzer Signal Command
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={armBuzzers}
                  className="px-5 py-2.5 bg-signal-emerald text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-none shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-base">sensors</span> Arm Buzzers
                </button>
                <button
                  type="button"
                  onClick={lockBuzzers}
                  className="px-5 py-2.5 bg-sabotage-crimson text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded-none shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-base">block</span> Lock Buzzers
                </button>
                <button
                  type="button"
                  onClick={resetBuzzers}
                  className="px-4 py-2.5 bg-surface-subtle hover:bg-surface-container-high text-primary font-label-mono-sm text-label-mono-sm uppercase rounded-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">refresh</span> Reset Signal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Panel */}
              <div className="bg-surface-subtle p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Gate Status</span>
                    <span className={`px-2 py-0.5 font-label-mono-sm text-label-mono-sm uppercase rounded-full ${
                      buzzersArmed ? 'bg-signal-emerald/20 text-on-surface' : 'bg-sabotage-crimson/20 text-sabotage-crimson'
                    }`}>
                      {buzzersArmed ? 'Armed // Live' : 'Hardware Frozen'}
                    </span>
                  </div>
                  <div className="font-headline-lg text-headline-lg font-bold text-primary mt-3 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${buzzersArmed ? 'bg-signal-emerald animate-pulse' : 'bg-sabotage-crimson'}`}></span>
                    {buzzersArmed ? 'ARMED & READY' : 'CIRCUIT LOCKED'}
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-1">
                  <div className="flex justify-between text-body-sm font-body-sm text-on-surface-variant">
                    <span>Input Circuit Latency</span>
                    <span className="font-label-mono-sm text-label-mono-sm text-primary">0.04 ms</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                    <div className="bg-signal-emerald h-full w-1/4"></div>
                  </div>
                </div>
              </div>

              {/* Fastest Lock-In Card */}
              <div className="md:col-span-2 bg-canvas-dark text-on-primary p-5 rounded-lg flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                  <span className="font-headline-xl text-headline-xl font-extrabold text-white text-[120px]">01</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
                  <div>
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-acid-chartreuse tracking-widest block mb-1">
                      Validated First Lock-In
                    </span>
                    <h3 className="font-headline-lg text-headline-lg font-bold text-white tracking-tight">
                      {lockedPlayer.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-surface-variant mt-1">
                      Verified microsecond circuit switch at Node #07A
                    </p>
                  </div>
                  <div className="text-left md:text-right bg-hairline-dark/60 p-4 rounded-lg">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-surface-variant">Reaction Latency</span>
                    <div className="font-label-mono-lg text-headline-md font-bold text-acid-chartreuse">
                      {lockedPlayer.latency}
                    </div>
                    <span className="text-body-sm font-body-sm text-signal-emerald">Delta: -0.089s advantage</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 z-10 border-t border-hairline-dark">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-signal-emerald"></span>
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-surface-variant">
                      Lock registered at {lockedPlayer.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => awardFastestAnswer(1)}
                      className="px-3 py-1.5 bg-acid-chartreuse text-primary font-label-mono-sm text-label-mono-sm uppercase hover:bg-white transition-colors cursor-pointer font-bold"
                    >
                      Grant Floor (+50)
                    </button>
                    <button
                      type="button"
                      onClick={rejectLockIn}
                      className="px-3 py-1.5 bg-hairline-dark text-surface-variant hover:text-white font-label-mono-sm text-label-mono-sm uppercase transition-colors cursor-pointer"
                    >
                      Foul Nullify
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Player Scoring Core */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player 1 Terminal */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-6 relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
                      P1
                    </div>
                    <div>
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Contender // Blue Terminal</span>
                      <h3 className="font-headline-md text-headline-md font-bold text-primary">Alex Vance</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase rounded-full text-on-surface">Lane #01</span>
                </div>
                <div className="bg-surface-subtle p-6 rounded-lg flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Active Score</span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant mt-1">Streak: 4 Questions</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-xl text-display-hero font-bold tracking-tight text-primary">
                      {p1Score.toLocaleString()}
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">PTS</span>
                  </div>
                </div>

                {/* Fast Increment Deck */}
                <div className="flex flex-col gap-2">
                  <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Rapid Adjusters</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[100, 50, 10, -10, -50, -100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => adjustScore(1, val)}
                        className={`py-2 font-label-mono-sm text-label-mono-sm font-bold rounded transition-colors cursor-pointer ${
                          val > 0
                            ? 'bg-surface-subtle hover:bg-primary hover:text-on-primary'
                            : 'bg-surface-subtle hover:bg-sabotage-crimson hover:text-on-primary'
                        }`}
                      >
                        {val > 0 ? `+${val}` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Custom Input */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => adjustScore(1, 150)}
                    className="py-3 bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded shadow-[2px_2px_0px_#CCFF00] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-1 cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span> Correct (+150)
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustScore(1, -75)}
                    className="py-3 bg-surface-subtle hover:bg-error hover:text-on-error font-label-mono-sm text-label-mono-sm uppercase rounded transition-all flex items-center justify-center gap-1 text-on-surface cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span> Penalty (-75)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-hairline-light">
                <input
                  className="flex-1 px-3 py-2 bg-surface-subtle font-label-mono-sm text-label-mono-sm text-primary rounded outline-none focus:bg-white"
                  placeholder="Enter manual delta..."
                  type="number"
                  value={customP1Delta}
                  onChange={(e) => setCustomP1Delta(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCustom(1)}
                  className="px-4 py-2 bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded cursor-pointer font-bold"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Player 2 Terminal */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-6 relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
                      P2
                    </div>
                    <div>
                      <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Contender // Red Terminal</span>
                      <h3 className="font-headline-md text-headline-md font-bold text-primary">Elena Rostova</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase rounded-full text-on-surface">Lane #02</span>
                </div>
                <div className="bg-surface-subtle p-6 rounded-lg flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Active Score</span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant mt-1">Streak: 1 Question</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-xl text-display-hero font-bold tracking-tight text-primary">
                      {p2Score.toLocaleString()}
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">PTS</span>
                  </div>
                </div>

                {/* Fast Increment Deck */}
                <div className="flex flex-col gap-2">
                  <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Rapid Adjusters</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[100, 50, 10, -10, -50, -100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => adjustScore(2, val)}
                        className={`py-2 font-label-mono-sm text-label-mono-sm font-bold rounded transition-colors cursor-pointer ${
                          val > 0
                            ? 'bg-surface-subtle hover:bg-primary hover:text-on-primary'
                            : 'bg-surface-subtle hover:bg-sabotage-crimson hover:text-on-primary'
                        }`}
                      >
                        {val > 0 ? `+${val}` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Custom Input */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => adjustScore(2, 150)}
                    className="py-3 bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded shadow-[2px_2px_0px_#CCFF00] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-1 cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span> Correct (+150)
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustScore(2, -75)}
                    className="py-3 bg-surface-subtle hover:bg-error hover:text-on-error font-label-mono-sm text-label-mono-sm uppercase rounded transition-all flex items-center justify-center gap-1 text-on-surface cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span> Penalty (-75)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-hairline-light">
                <input
                  className="flex-1 px-3 py-2 bg-surface-subtle font-label-mono-sm text-label-mono-sm text-primary rounded outline-none focus:bg-white"
                  placeholder="Enter manual delta..."
                  type="number"
                  value={customP2Delta}
                  onChange={(e) => setCustomP2Delta(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCustom(2)}
                  className="px-4 py-2 bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded cursor-pointer font-bold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Sabotage Warfare Deployment Deck */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-hairline-light">
              <div>
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-sabotage-crimson block mb-1">
                  Subsystem 02 // Cognitive &amp; Sensory Disruption
                </span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
                  Live Sabotage Armory
                </h2>
              </div>
              <div className="flex items-center gap-4 text-body-sm font-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-signal-emerald"></span> Armed</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sabotage-crimson"></span> Active</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-outline"></span> Cooldown</span>
              </div>
            </div>

            {/* Sabotage Grid (6 Distinct Units) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Sabotage 1 */}
              <div className="bg-surface-subtle p-5 rounded-lg flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-full">Available</span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">DUR: 15s</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md font-bold text-primary mt-1">Static Blind</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Injects heavy analog grain and severe optical blurring to target player HUD.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target:</span>
                    <select
                      className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1"
                      value={targetSab1}
                      onChange={(e) => setTargetSab1(e.target.value)}
                    >
                      <option value="Player 2 (Elena)">P2 - Elena Rostova</option>
                      <option value="Player 1 (Alex)">P1 - Alex Vance</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => deploySabotage('Static Blind', 15, targetSab1)}
                    className="w-full py-2.5 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-colors cursor-pointer"
                  >
                    Deploy Disruption
                  </button>
                </div>
              </div>

              {/* Sabotage 2 */}
              <div className="bg-surface-subtle p-5 rounded-lg flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-full">Available</span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">DUR: 20s</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md font-bold text-primary mt-1">Reverse Controls</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Inverts buzzer touch triggers and directional multiple choice selection matrix.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target:</span>
                    <select
                      className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1"
                      value={targetSab2}
                      onChange={(e) => setTargetSab2(e.target.value)}
                    >
                      <option value="Player 2 (Elena)">P2 - Elena Rostova</option>
                      <option value="Player 1 (Alex)">P1 - Alex Vance</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => deploySabotage('Reverse Controls', 20, targetSab2)}
                    className="w-full py-2.5 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-colors cursor-pointer"
                  >
                    Deploy Disruption
                  </button>
                </div>
              </div>

              {/* Sabotage 3 */}
              <div className="bg-surface-subtle p-5 rounded-lg flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-sabotage-crimson/20 text-sabotage-crimson font-label-mono-sm text-label-mono-sm uppercase rounded-full">Active</span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">REM: 08s</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md font-bold text-primary mt-1">Sound Distortion</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Streams 85dB filtered pink noise and synthetic radio fuzz into target earpiece.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target:</span>
                    <span className="text-body-sm font-body-sm text-primary font-semibold">P1 - Alex Vance</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => cancelSabotage('Sound Distortion')}
                    className="w-full py-2.5 bg-surface-container-high hover:bg-sabotage-crimson hover:text-on-primary text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-colors cursor-pointer"
                  >
                    Abort Pulse Early
                  </button>
                </div>
              </div>

              {/* Sabotage 4 */}
              <div className="bg-surface-subtle p-5 rounded-lg flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-full">Available</span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">DUR: 1 Round</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md font-bold text-primary mt-1">Buzzer Jammer</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Artificially inserts 3.00s latency buffer upon hardware buzzer strike.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target:</span>
                    <select
                      className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1"
                      value={targetSab4}
                      onChange={(e) => setTargetSab4(e.target.value)}
                    >
                      <option value="Player 1 (Alex)">P1 - Alex Vance</option>
                      <option value="Player 2 (Elena)">P2 - Elena Rostova</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => deploySabotage('Buzzer Jammer', 30, targetSab4)}
                    className="w-full py-2.5 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-colors cursor-pointer"
                  >
                    Deploy Disruption
                  </button>
                </div>
              </div>

              {/* Sabotage 5 */}
              <div className="bg-surface-subtle p-5 rounded-lg flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-outline/20 text-on-surface-variant font-label-mono-sm text-label-mono-sm uppercase rounded-full">Cooling 14s</span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">MULTIPLIER</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md font-bold text-primary mt-1">Double Risk</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Stake next response: +200% points or instant severe -200 deduction.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target:</span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">Both Contenders</span>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 bg-surface-container text-outline font-label-mono-sm text-label-mono-sm uppercase font-bold cursor-not-allowed"
                  >
                    Recharging Nodes
                  </button>
                </div>
              </div>

              {/* Sabotage 6 */}
              <div className="bg-surface-subtle p-5 rounded-lg flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-signal-emerald/20 text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-full">Available</span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">INSTANT</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md font-bold text-primary mt-1">Time Drain</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Drains 10 continuous seconds from countdown clock during active prompt.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">Target:</span>
                    <select
                      className="bg-surface-container-lowest px-2 py-1 text-body-sm font-body-sm rounded outline-none flex-1"
                      value={targetSab6}
                      onChange={(e) => setTargetSab6(e.target.value)}
                    >
                      <option value="Player 2 (Elena)">P2 - Elena Rostova</option>
                      <option value="Player 1 (Alex)">P1 - Alex Vance</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => deploySabotage('Time Drain', 10, targetSab6)}
                    className="w-full py-2.5 bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary font-label-mono-sm text-label-mono-sm uppercase font-bold transition-colors cursor-pointer"
                  >
                    Trigger Instant Drain
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Live Leaderboard & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            
            {/* Leaderboard Ranking Table (2 Cols) */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant block mb-1">Rank Assessment</span>
                  <h3 className="font-headline-md text-headline-md font-bold text-primary">Live Tournament Matrix</h3>
                </div>
                <button
                  type="button"
                  onClick={() => playTone(950, 0.1)}
                  className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant hover:text-primary flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span> Export CSV
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant border-b border-hairline-light">
                      <th className="py-3 px-4">Pos</th>
                      <th className="py-3 px-4">Contender</th>
                      <th className="py-3 px-4">Avg Speed</th>
                      <th className="py-3 px-4">Sabotages</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-subtle font-body-base text-body-base">
                    <tr className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-4 px-4 font-label-mono-sm font-bold text-primary">#01</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-primary">Alex Vance</div>
                        <div className="text-body-sm font-body-sm text-on-surface-variant">Sector Prime // Lane 1</div>
                      </td>
                      <td className="py-4 px-4 font-label-mono-sm">0.142s</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-surface-subtle rounded font-label-mono-sm text-xs font-bold border border-hairline-light">2 Received</span>
                      </td>
                      <td className="py-4 px-4 text-right font-headline-md font-bold text-primary">{p1Score.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-4 px-4 font-label-mono-sm font-bold text-on-surface-variant">#02</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-primary">Elena Rostova</div>
                        <div className="text-body-sm font-body-sm text-on-surface-variant">Sector Zero // Lane 2</div>
                      </td>
                      <td className="py-4 px-4 font-label-mono-sm">0.231s</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-surface-subtle rounded font-label-mono-sm text-xs font-bold border border-hairline-light">1 Received</span>
                      </td>
                      <td className="py-4 px-4 text-right font-headline-md font-bold text-primary">{p2Score.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-surface-subtle/50 transition-colors text-on-surface-variant">
                      <td className="py-4 px-4 font-label-mono-sm">#03</td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-primary">Marcus Thorne</div>
                        <div className="text-body-sm font-body-sm text-on-surface-variant">Queued // Bench 1</div>
                      </td>
                      <td className="py-4 px-4 font-label-mono-sm">0.289s</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-surface-subtle rounded font-label-mono-sm text-xs border border-hairline-light">0 Received</span>
                      </td>
                      <td className="py-4 px-4 text-right font-headline-md font-bold text-on-surface-variant">980</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real-time Activity Feed / Audit Log (1 Col) */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-hairline-light">
                <div>
                  <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant block mb-1">Terminal Trace</span>
                  <h3 className="font-headline-md text-headline-md font-bold text-primary">Audit Log</h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-signal-emerald animate-ping"></span>
              </div>

              {/* Telemetry Log Scroller */}
              <div className="flex flex-col gap-3 h-72 overflow-y-auto pr-1">
                {auditLogs.map((item) => (
                  <div key={item.id} className="p-2.5 bg-surface-subtle rounded text-body-sm font-body-sm flex flex-col gap-0.5 border border-hairline-light">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant font-label-mono-sm">
                      <span>{item.time}</span>
                      <span className={item.colorClass}>{item.category}</span>
                    </div>
                    <span className="text-primary font-medium">{item.message}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={clearLogs}
                className="w-full py-2 bg-surface-subtle hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-mono-sm text-label-mono-sm uppercase transition-colors text-center cursor-pointer"
              >
                Purge Telemetry History
              </button>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
