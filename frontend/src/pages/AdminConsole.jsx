import React, { useState } from 'react';
import ClashLogo from '../components/common/ClashLogo';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';

export default function AdminConsole() {
  const {
    setCurrentView,
    adminSubTab,
    setAdminSubTab,
    currentUser,
    teams,
    buzzersArmed,
    buzzerQueue,
    queueIndex,
    currentBuzzerWinner,
    advanceToNextPlayer,
    auditLogs,
    adjustTeamScore,
    armBuzzers,
    lockBuzzers,
    resetBuzzers,
    awardFastestAnswer,
    removeSabotageFromTeam,
    clearLogs,
    playTone,
    logout,
    activeTeamIds,
    roundState,
    startRound0,
    endRound0,
    awardCorrectAnswer
  } = useGame();

  // Active filter in Total Comalies
  const [onlyActive, setOnlyActive] = useState(false);

  // Sabotage Neutralizer States in Thalaivar Page
  const [selectedNeutralizeTeamId, setSelectedNeutralizeTeamId] = useState(2); // default Team Vortex
  const [selectedNeutralizeSabotage, setSelectedNeutralizeSabotage] = useState('');

  // Total Comalies Custom Inputs state per team
  const [customScoreDeltas, setCustomScoreDeltas] = useState({});

  // Kanaku Valaku filter category
  const [logFilter, setLogFilter] = useState('ALL');

  const selectedNeutralizeTeam = teams.find((t) => t.id === Number(selectedNeutralizeTeamId)) || teams[0];

  const handleNeutralizeSabotage = () => {
    if (!selectedNeutralizeTeam) return;
    const sabotageToRemove = selectedNeutralizeSabotage || (selectedNeutralizeTeam.activeSabotages[0] || 'ALL DISRUPTIONS');
    removeSabotageFromTeam(selectedNeutralizeTeam.id, sabotageToRemove);
  };

  const handleCustomDeltaChange = (teamId, val) => {
    setCustomScoreDeltas((prev) => ({ ...prev, [teamId]: val }));
  };

  const handleApplyCustomScore = (teamId) => {
    const val = parseInt(customScoreDeltas[teamId], 10);
    if (!isNaN(val)) {
      adjustTeamScore(teamId, val);
      playTone(900, 0.1);
      setCustomScoreDeltas((prev) => ({ ...prev, [teamId]: '' }));
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.category.toUpperCase().includes(logFilter);
  });

  return (
    <div className="w-full min-h-screen bg-background flex">
      
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col pt-space-md pb-space-lg border-r border-hairline-light">
        <div className="px-space-md mb-6 flex flex-col gap-space-2xs">
          <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant tracking-wider">
            SYSTEM TELEMETRY
          </span>
          <span className="font-headline-md text-headline-md tracking-tight font-bold text-primary">
            ADMIN CONSOLE
          </span>
        </div>

        {/* The 3 Admin Options Requested by User */}
        <nav className="flex-1 px-space-sm flex flex-col gap-1.5">
          {/* 1. Thalaivar Page */}
          <button
            type="button"
            onClick={() => {
              setAdminSubTab('thalaivar');
              playTone(750, 0.08);
            }}
            className={`flex items-center px-space-sm py-2.5 transition-all rounded-lg text-left cursor-pointer w-full font-body-base text-sm ${
              adminSubTab === 'thalaivar'
                ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">military_tech</span>
            Thalaivar Page
          </button>

          {/* 2. Total Comalies */}
          <button
            type="button"
            onClick={() => {
              setAdminSubTab('total-comalies');
              playTone(850, 0.08);
            }}
            className={`flex items-center px-space-sm py-2.5 transition-all rounded-lg text-left cursor-pointer w-full font-body-base text-sm ${
              adminSubTab === 'total-comalies'
                ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">groups</span>
            Total Comalies
          </button>

          {/* 3. Kanaku Valaku */}
          <button
            type="button"
            onClick={() => {
              setAdminSubTab('kanaku-valaku');
              playTone(950, 0.08);
            }}
            className={`flex items-center px-space-sm py-2.5 transition-all rounded-lg text-left cursor-pointer w-full font-body-base text-sm ${
              adminSubTab === 'kanaku-valaku'
                ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">receipt_long</span>
            Kanaku Valaku
          </button>
        </nav>

        {/* Bottom Telemetry Latency Card */}
        <div className="px-space-md pt-space-md mt-auto">
          <div className="bg-surface-subtle p-space-sm rounded-lg flex flex-col gap-space-2xs border border-hairline-light">
            <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">TELEMETRY LATENCY</span>
            <span className="font-label-mono-lg text-label-mono-lg text-primary font-bold">14ms // STABLE</span>
          </div>
        </div>

        {/* Bottom Sidebar Action: Logout Admin */}
        <div className="p-space-sm border-t border-hairline-light mt-2">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-space-sm py-2.5 w-full rounded-lg text-left cursor-pointer font-label-mono-sm text-xs uppercase tracking-wider text-sabotage-crimson hover:bg-sabotage-crimson/10 font-bold transition-all border border-sabotage-crimson/30"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>LOGOUT / EXIT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (No horizontal navbar above) */}
      <div className="pl-64 w-full min-h-screen">
        
        {/* Workspaces for the 3 Subtabs */}
        <main className="w-full pt-6 p-4 sm:p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
          
          {/* ========================================================================= */}
          {/* TAB 1: THALAIVAR PAGE (Console Overview with Buzzer Queue & Neutralizer) */}
          {/* ========================================================================= */}
          {adminSubTab === 'thalaivar' && (
            <div className="flex flex-col gap-8">
              
              {/* Executive Header Banner */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 gap-6 border-b border-hairline-light">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase text-on-surface tracking-wider rounded-full">
                      THALAIVAR CONSOLE // OVERVIEW
                    </span>
                    <span className={`px-3 py-1 font-label-mono-sm text-label-mono-sm uppercase tracking-wider rounded-full flex items-center gap-1.5 font-bold ${
                      currentUser?.role === 'admin' ? 'bg-signal-emerald/20 text-on-surface' : 'bg-sabotage-crimson/20 text-sabotage-crimson'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${currentUser?.role === 'admin' ? 'bg-signal-emerald' : 'bg-sabotage-crimson animate-pulse'}`}></span>
                      {currentUser?.role === 'admin' ? `Host Master Active (${currentUser.display_name || 'GM'})` : 'ADMIN SESSION INACTIVE'}
                    </span>
                  </div>
                  {currentUser?.role !== 'admin' && (
                    <div className="w-full bg-error-container/30 border border-sabotage-crimson text-sabotage-crimson p-3.5 rounded-xl flex items-center justify-between gap-4 font-label-mono-sm text-xs font-bold my-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        <span>Game Master is not logged in. Controls will not persist. Please sign in via Portal.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentView('portal')}
                        className="px-3 py-1.5 bg-sabotage-crimson text-on-primary rounded uppercase font-bold cursor-pointer hover:bg-black transition-colors shrink-0"
                      >
                        Login as Admin
                      </button>
                    </div>
                  )}
                  <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary font-bold">
                    Executive Arena Orchestration
                  </h1>
                  <p className="font-body-base text-body-base text-on-surface-variant">
                    Direct hardware buzzer triage with sequential queue resolution, and instant administrative sabotage neutralization for all connected teams.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={lockBuzzers}
                    className="bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase px-5 py-3 rounded-none shadow-[3px_3px_0px_#CCFF00] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">lock_reset</span> Global Freeze
                  </button>
                </div>
              </div>

              {/* Subsystem 01: Buzzer Master Command */}
              <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm flex flex-col gap-6 border border-hairline-light">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline-light">
                  <div>
                    <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant block mb-1">
                      Subsystem 01 // Input Lock &amp; Sequential Queue Arbitrage
                    </span>
                    <div className="flex items-center gap-3">
                      <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
                        Buzzer Signal Command
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full font-label-mono-sm text-xs font-bold uppercase tracking-wider ${
                        roundState.isActive
                          ? 'bg-signal-emerald/20 text-signal-emerald border border-signal-emerald/40 animate-pulse'
                          : roundState.isEnded
                          ? 'bg-acid-chartreuse/20 text-primary border border-acid-chartreuse'
                          : 'bg-surface-subtle text-on-surface-variant'
                      }`}>
                        {roundState.isActive ? 'ROUND 0 // ACTIVE' : roundState.isEnded ? 'ROUND 0 // ENDED' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={startRound0}
                      className="px-5 py-2.5 bg-signal-emerald text-on-surface font-label-mono-sm text-label-mono-sm uppercase rounded-none shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <span className="material-symbols-outlined text-base">play_circle</span> Start Round
                    </button>
                    <button
                      type="button"
                      onClick={endRound0}
                      className="px-5 py-2.5 bg-sabotage-crimson text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded-none shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <span className="material-symbols-outlined text-base">stop_circle</span> End Round
                    </button>
                    <div className="h-6 w-px bg-hairline-light mx-1 hidden sm:block"></div>
                    <button
                      type="button"
                      onClick={armBuzzers}
                      className="px-4 py-2 bg-surface-subtle hover:bg-surface-container-high text-primary font-label-mono-sm text-xs uppercase rounded-none transition-all flex items-center gap-1.5 cursor-pointer font-bold border border-hairline-light"
                    >
                      <span className="material-symbols-outlined text-sm">sensors</span> Arm
                    </button>
                    <button
                      type="button"
                      onClick={lockBuzzers}
                      className="px-4 py-2 bg-surface-subtle hover:bg-surface-container-high text-sabotage-crimson font-label-mono-sm text-xs uppercase rounded-none transition-all flex items-center gap-1.5 cursor-pointer font-bold border border-hairline-light"
                    >
                      <span className="material-symbols-outlined text-sm">block</span> Lock
                    </button>
                    <button
                      type="button"
                      onClick={resetBuzzers}
                      className="px-4 py-2 bg-surface-subtle hover:bg-surface-container-high text-primary font-label-mono-sm text-xs uppercase rounded-none transition-all flex items-center gap-1.5 cursor-pointer font-bold border border-hairline-light"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span> Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Gate Status Panel */}
                  <div className="bg-surface-subtle p-5 rounded-lg flex flex-col justify-between border border-hairline-light">
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

                    {/* Buzzer Queue Mini Indicator & Real-Time Contenders List */}
                    <div className="mt-6 flex flex-col gap-2">
                      <div className="flex justify-between text-body-sm font-body-sm text-on-surface-variant">
                        <span>Queue Position</span>
                        <span className="font-label-mono-sm text-label-mono-sm text-primary font-bold">
                          {buzzerQueue.length === 0 ? '0 Buzzers' : `${queueIndex + 1} of ${buzzerQueue.length} Buzzers`}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-2 w-full">
                        {buzzerQueue.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className={`h-full transition-colors ${
                              idx === queueIndex
                                ? 'bg-acid-chartreuse'
                                : idx < queueIndex
                                ? 'bg-outline-variant'
                                : 'bg-surface-container'
                            }`}
                          ></div>
                        ))}
                      </div>

                      {/* Live Contenders Queue List */}
                      {buzzerQueue.length > 0 && (
                        <div className="mt-3 flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                          <span className="font-label-mono-sm text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                            Live Order of Press:
                          </span>
                          {buzzerQueue.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className={`px-2.5 py-1.5 rounded flex items-center justify-between text-xs font-label-mono-sm transition-all border ${
                                idx === queueIndex
                                  ? 'bg-acid-chartreuse/20 border-acid-chartreuse text-primary font-bold shadow-sm'
                                  : 'bg-surface-container-lowest border-hairline-light text-on-surface-variant'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  idx === queueIndex ? 'bg-acid-chartreuse text-canvas-dark' : 'bg-surface-subtle text-primary'
                                }`}>
                                  #{item.rank || idx + 1}
                                </span>
                                <span className="font-bold text-primary truncate max-w-[120px]">{item.teamName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-acid-chartreuse font-bold">{item.clientTime || item.timestamp}</span>
                                <span className="text-[10px] bg-surface-subtle px-1.5 py-0.5 rounded text-on-surface-variant font-bold">{item.latency}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Validated Lock-In Card with Team Name and Enlarged Buttons */}
                  <div className="lg:col-span-2 bg-canvas-dark text-on-primary p-6 rounded-xl flex flex-col justify-between relative overflow-hidden shadow-lg border border-hairline-dark">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                      <span className="font-headline-xl text-headline-xl font-extrabold text-white text-[120px]">
                        0{queueIndex + 1}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-acid-chartreuse text-canvas-dark font-label-mono-sm text-label-mono-sm uppercase font-bold">
                            QUEUE POSITION #{currentBuzzerWinner.rank || (buzzerQueue.length > 0 ? queueIndex + 1 : 0)}
                          </span>
                          <span className="font-label-mono-sm text-label-mono-sm text-primary-fixed uppercase tracking-wider">
                            VALIDATED SIGNAL
                          </span>
                        </div>
                        <h3 className="font-headline-lg text-headline-lg font-bold text-white tracking-tight">
                          {currentBuzzerWinner.teamName} <span className="text-acid-chartreuse">// {currentBuzzerWinner.name}</span>
                        </h3>
                        <p className="font-body-sm text-body-sm text-surface-variant mt-1.5 flex flex-wrap items-center gap-2">
                          <span>
                            Client Click Time: <strong className="text-acid-chartreuse font-label-mono-sm">{currentBuzzerWinner.clientTime || currentBuzzerWinner.timestamp}</strong>
                          </span>
                          {currentBuzzerWinner.serverTime && currentBuzzerWinner.serverTime !== '--:--:--' && (
                            <span className="text-on-surface-variant text-xs">
                              (Server Log: {currentBuzzerWinner.serverTime})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="text-left md:text-right bg-hairline-dark/70 p-4 rounded-lg border border-hairline-dark">
                        <span className="font-label-mono-sm text-label-mono-sm uppercase text-surface-variant">Reaction Latency</span>
                        <div className="font-label-mono-lg text-headline-md font-bold text-acid-chartreuse">
                          {currentBuzzerWinner.latency}
                        </div>
                        <span className="text-body-sm font-body-sm text-signal-emerald">Delta: Validated Order</span>
                      </div>
                    </div>

                    {/* ENLARGED BUTTONS: Grant Floor (+50) & Next player */}
                    <div className="mt-8 pt-6 flex flex-wrap items-center justify-between gap-4 z-10 border-t border-hairline-dark">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-signal-emerald animate-pulse"></span>
                        <span className="font-label-mono-sm text-label-mono-sm uppercase text-surface-variant">
                          Contending Team Ready for Arbitrage
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Enlarged "Correct Answer (+1 Pt)" Button */}
                        <button
                          type="button"
                          onClick={() => awardCorrectAnswer(currentBuzzerWinner.teamId)}
                          disabled={!currentBuzzerWinner.teamId}
                          className={`px-8 py-4 font-headline-md text-headline-md uppercase font-bold tracking-wider transition-all duration-150 flex items-center gap-2 ${
                            !currentBuzzerWinner.teamId
                              ? 'bg-hairline-dark text-on-surface-variant opacity-50 cursor-not-allowed'
                              : 'bg-acid-chartreuse text-canvas-dark hover:bg-white hover:scale-105 active:scale-95 cursor-pointer shadow-[4px_4px_0px_#050505]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">check_circle</span>
                          <span>Correct Answer (+1 Pt)</span>
                        </button>

                        {/* Enlarged "Next player" Button */}
                        <button
                          type="button"
                          onClick={advanceToNextPlayer}
                          disabled={queueIndex >= buzzerQueue.length - 1}
                          className={`px-8 py-4 font-headline-md text-headline-md uppercase font-bold tracking-wider transition-all duration-150 cursor-pointer shadow-[4px_4px_0px_#CCFF00] flex items-center gap-2 ${
                            queueIndex >= buzzerQueue.length - 1
                              ? 'bg-hairline-dark text-on-surface-variant cursor-not-allowed opacity-50 shadow-none'
                              : 'bg-primary text-on-primary hover:bg-surface-dark hover:scale-105 active:scale-95 border-2 border-acid-chartreuse'
                          }`}
                        >
                          <span>Wrong / Next</span>
                          <span className="material-symbols-outlined text-xl">skip_next</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subsystem 02: Emergency Sabotage Neutralizer */}
              <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm flex flex-col gap-6 border border-hairline-light">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline-light">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-sabotage-crimson text-on-primary font-label-mono-sm text-label-mono-sm uppercase font-bold">
                        ADMIN OVERRIDE
                      </span>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                        TACTICAL DISRUPTION DEFUSER
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
                      Emergency Sabotage Neutralizer
                    </h2>
                    <p className="font-body-base text-body-base text-on-surface-variant mt-1">
                      Instantly defuse and strip accidental or hostile sabotages from any connected contender team across the tournament floor.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-sabotage-crimson">health_and_safety</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  {/* Select Target Team */}
                  <div className="md:col-span-4 flex flex-col gap-2">
                    <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="target-team-select">
                      Select Targeted Team:
                    </label>
                    <select
                      id="target-team-select"
                      className="w-full bg-surface-subtle text-primary font-headline-md text-headline-md px-4 py-3.5 border-2 border-primary rounded-none focus:outline-none focus:border-cobalt-deep uppercase font-bold cursor-pointer"
                      value={selectedNeutralizeTeamId}
                      onChange={(e) => setSelectedNeutralizeTeamId(Number(e.target.value))}
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.teamName} ({t.p1} &amp; {t.p2} - {t.lane})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Sabotages on this Team */}
                  <div className="md:col-span-4 flex flex-col gap-2">
                    <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="target-sabotage-select">
                      Select Active Disruption:
                    </label>
                    <select
                      id="target-sabotage-select"
                      className="w-full bg-surface-subtle text-primary font-body-base text-body-base px-4 py-4 border-2 border-primary rounded-none focus:outline-none focus:border-cobalt-deep font-semibold cursor-pointer"
                      value={selectedNeutralizeSabotage}
                      onChange={(e) => setSelectedNeutralizeSabotage(e.target.value)}
                    >
                      {selectedNeutralizeTeam.activeSabotages.length > 0 ? (
                        selectedNeutralizeTeam.activeSabotages.map((sab) => (
                          <option key={sab} value={sab}>
                            ⚠️ {sab} (ACTIVE DISRUPTION)
                          </option>
                        ))
                      ) : (
                        <option value="">NO ACTIVE SABOTAGES (ALL CLEAR)</option>
                      )}
                    </select>
                  </div>

                  {/* BIGGER SIZE REMOVE SABOTAGE BUTTON */}
                  <div className="md:col-span-4">
                    <button
                      type="button"
                      onClick={handleNeutralizeSabotage}
                      className="w-full px-8 py-4 bg-sabotage-crimson text-on-primary font-headline-md text-headline-md uppercase tracking-wider font-bold hover:bg-error hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-[4px_4px_0px_#050505]"
                    >
                      <span className="material-symbols-outlined text-2xl">shield_with_heart</span>
                      <span>REMOVE SABOTAGE</span>
                    </button>
                  </div>
                </div>

                {/* Status Notice */}
                <div className="p-4 bg-surface-subtle rounded-lg flex items-center justify-between border border-hairline-light">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      selectedNeutralizeTeam.activeSabotages.length > 0 ? 'bg-sabotage-crimson animate-ping' : 'bg-signal-emerald'
                    }`}></span>
                    <span className="font-body-base text-body-base text-primary">
                      Status for <strong>{selectedNeutralizeTeam.teamName}</strong> ({selectedNeutralizeTeam.p1} &amp; {selectedNeutralizeTeam.p2}):{' '}
                      {selectedNeutralizeTeam.activeSabotages.length > 0 ? (
                        <span className="text-sabotage-crimson font-bold">
                          Impacted by {selectedNeutralizeTeam.activeSabotages.join(', ')}
                        </span>
                      ) : (
                        <span className="text-signal-emerald font-bold">Shields nominal. No active disruptions.</span>
                      )}
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase font-bold">
                    SCORE: {selectedNeutralizeTeam.score.toLocaleString()} PTS
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TOTAL COMALIES (Table of Connected Teams & Live Scoring Deck)     */}
          {/* ========================================================================= */}
          {adminSubTab === 'total-comalies' && (
            <div className="flex flex-col gap-8">
              
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 gap-4 border-b border-hairline-light">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase font-bold">
                      TOTAL COMALIES
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                      // CONNECTED TEAMS (2 PLAYERS PER SQUAD)
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                    Active Tournament Teams Roster
                  </h1>
                  <p className="font-body-base text-body-base text-on-surface-variant">
                    Direct live score manipulation for all connected 2-player teams, team status monitors, and custom manual adjustment entries.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-surface-subtle px-4 py-2 rounded-lg font-label-mono-sm text-label-mono-sm text-primary font-bold border border-hairline-light flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse"></span>
                    <span>
                      ACTIVE NOW: <strong className="text-signal-emerald">{teams.filter((t) => activeTeamIds.includes(t.id) || t.isOnline).length}</strong> / {teams.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnlyActive(!onlyActive)}
                    className={`px-3.5 py-2 rounded-lg font-label-mono-sm text-xs font-bold uppercase transition-all cursor-pointer border ${
                      onlyActive
                        ? 'bg-signal-emerald text-on-surface border-signal-emerald shadow-[2px_2px_0px_#000]'
                        : 'bg-surface-subtle hover:bg-surface-container-high text-primary border-hairline-light'
                    }`}
                  >
                    {onlyActive ? 'Showing Active Only' : 'Filter: Active Only'}
                  </button>
                </div>
              </div>

              {/* Connected Teams Table */}
              <div className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-6 border border-hairline-light">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-surface-subtle font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant border-b border-hairline-light">
                        <th className="py-4 px-6">Team Identity</th>
                        <th className="py-4 px-6">Lane / Tag</th>
                        <th className="py-4 px-6">Disruptions</th>
                        <th className="py-4 px-6">Current Score</th>
                        <th className="py-4 px-6">Rapid Adjusters</th>
                        <th className="py-4 px-6 text-right">Custom Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-subtle font-body-base text-body-base">
                      {(onlyActive
                        ? teams.filter((t) => activeTeamIds.includes(t.id) || t.isOnline)
                        : teams
                      ).map((team) => {
                        const isOnline = activeTeamIds.includes(team.id) || !!team.isOnline;
                        return (
                          <tr
                            key={team.id}
                            className={`transition-all ${
                              isOnline
                                ? 'hover:bg-surface-subtle/60 bg-surface-container-lowest'
                                : 'opacity-35 grayscale hover:opacity-65 bg-surface-subtle/10'
                            }`}
                          >
                            {/* Team Name & 2 Squad Members */}
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-[1px_1px_0px_#CCFF00] ${
                                    isOnline
                                      ? 'bg-primary text-on-primary'
                                      : 'bg-surface-subtle text-on-surface-variant/60 border border-hairline-light'
                                  }`}
                                >
                                  T{team.id}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-bold text-base ${
                                        isOnline ? 'text-primary' : 'text-on-surface-variant'
                                      }`}
                                    >
                                      {team.teamName}
                                    </span>
                                    {isOnline ? (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-mono-sm text-[10px] font-bold bg-signal-emerald/20 text-signal-emerald border border-signal-emerald/40 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse"></span>
                                        ONLINE
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-mono-sm text-[10px] font-bold bg-surface-subtle text-on-surface-variant/50 border border-hairline-light">
                                        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30"></span>
                                        OFFLINE
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase">
                                    {team.p1} &amp; {team.p2}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Lane & Tag */}
                            <td className="py-5 px-6">
                              <span className="px-2.5 py-1 bg-surface-subtle rounded font-label-mono-sm text-xs font-bold text-primary border border-hairline-light">
                                {team.lane}
                              </span>
                            </td>

                            {/* Active Sabotages */}
                            <td className="py-5 px-6">
                              {team.activeSabotages.length > 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-error-container text-sabotage-crimson rounded-full font-label-mono-sm text-xs font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sabotage-crimson animate-ping"></span>
                                  {team.activeSabotages.join(', ')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-signal-emerald/10 text-secondary font-label-mono-sm text-xs font-bold rounded-full">
                                  CLEAR
                                </span>
                              )}
                            </td>

                            {/* Live Score */}
                            <td className="py-5 px-6">
                              <div className="flex flex-col">
                                <div className="flex items-baseline gap-1">
                                  <span className="font-headline-lg text-headline-lg font-bold text-primary">
                                    {team.score.toLocaleString()}
                                  </span>
                                  <span className="font-label-mono-sm text-xs text-on-surface-variant">PTS</span>
                                </div>
                                <span className="font-label-mono-sm text-[10px] text-acid-chartreuse font-bold">
                                  ROUND 0: {team.r0 || team.r0Score || 0} PTS
                                </span>
                              </div>
                            </td>

                            {/* Rapid Adjusters (+100, +50, +10, -10, -50, -100) */}
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-1 flex-wrap">
                                {[100, 50, 10, -10, -50, -100].map((delta) => (
                                  <button
                                    key={delta}
                                    type="button"
                                    onClick={() => adjustTeamScore(team.id, delta)}
                                    className={`px-2.5 py-1.5 rounded font-label-mono-sm text-xs font-bold transition-all cursor-pointer ${
                                      delta > 0
                                        ? 'bg-surface-subtle hover:bg-primary hover:text-on-primary text-primary'
                                        : 'bg-surface-subtle hover:bg-sabotage-crimson hover:text-on-primary text-primary'
                                    }`}
                                  >
                                    {delta > 0 ? `+${delta}` : delta}
                                  </button>
                                ))}
                              </div>
                            </td>

                            {/* Custom Delta Input */}
                            <td className="py-5 px-6 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  placeholder="± Delta"
                                  className="w-24 px-2.5 py-1.5 bg-surface-subtle text-primary font-label-mono-sm text-xs rounded border border-hairline-light outline-none focus:bg-white"
                                  value={customScoreDeltas[team.id] || ''}
                                  onChange={(e) => handleCustomDeltaChange(team.id, e.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleApplyCustomScore(team.id)}
                                  className="px-3 py-1.5 bg-primary text-on-primary font-label-mono-sm text-xs uppercase rounded cursor-pointer font-bold shadow-[1px_1px_0px_#CCFF00]"
                                >
                                  Set
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: KANAKU VALAKU (Audit Log Telemetry Records Stream)               */}
          {/* ========================================================================= */}
          {adminSubTab === 'kanaku-valaku' && (
            <div className="flex flex-col gap-8">
              
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 gap-4 border-b border-hairline-light">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-cobalt-deep text-on-primary font-label-mono-sm text-label-mono-sm uppercase font-bold">
                      KANAKU VALAKU
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                      // REAL-TIME AUDIT LOG &amp; TELEMETRY STREAM
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                    Kanaku Valaku
                  </h1>
                  <p className="font-body-base text-body-base text-on-surface-variant">
                    Full chronological transaction record of buzzer locks, score increments, arbitrage rulings, and sabotage overrides for all squads.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playTone(950, 0.1);
                      window.open(api.audit.getExportUrl(), '_blank');
                    }}
                    className="px-4 py-2 bg-surface-subtle hover:bg-surface-container-high text-primary font-label-mono-sm text-label-mono-sm uppercase rounded flex items-center gap-1.5 cursor-pointer border border-hairline-light"
                  >
                    <span className="material-symbols-outlined text-sm">download</span> Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={clearLogs}
                    className="px-4 py-2 bg-primary text-on-primary font-label-mono-sm text-label-mono-sm uppercase rounded cursor-pointer shadow-[2px_2px_0px_#CCFF00]"
                  >
                    Purge History
                  </button>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {['ALL', 'LOCK', 'SCORE', 'SABOTAGE', 'NEUTRALIZE', 'QUEUE', 'SYS'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setLogFilter(cat);
                      playTone(800, 0.05);
                    }}
                    className={`px-3 py-1.5 rounded-full font-label-mono-sm text-xs uppercase cursor-pointer transition-all ${
                      logFilter === cat
                        ? 'bg-primary text-on-primary font-bold shadow-[1px_1px_0px_#CCFF00]'
                        : 'bg-surface-subtle text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Telemetry Stream View */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4 border border-hairline-light">
                <div className="flex items-center justify-between pb-3 border-b border-hairline-light">
                  <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant">
                    SHOWING {filteredLogs.length} OF {auditLogs.length} TOTAL AUDIT ENTRIES
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-signal-emerald animate-pulse"></span>
                </div>

                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 bg-surface-subtle rounded-lg flex flex-col gap-1 border border-hairline-light hover:bg-surface-container/50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-label-mono-sm">
                        <span className="text-on-surface-variant font-bold">{log.time}</span>
                        <span className={`px-2 py-0.5 bg-canvas-dark text-on-primary rounded text-[10px] uppercase font-bold tracking-wider ${log.colorClass}`}>
                          {log.category}
                        </span>
                      </div>
                      <span className="text-primary font-medium text-sm mt-1">{log.message}</span>
                    </div>
                  ))}
                  {filteredLogs.length === 0 && (
                    <div className="p-8 text-center text-on-surface-variant font-label-mono-sm text-sm">
                      NO LOG ENTRIES MATCH CURRENT FILTER.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
