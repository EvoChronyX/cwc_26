import React, { useState } from 'react';
import ClashLogo from '../components/common/ClashLogo';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';
import { PREDEFINED_AVATARS } from '../assets/avatars';

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
    awardCorrectAnswer,
    roundLocks,
    toggleRoundLock,
    deleteAllTeams,
    deleteAllRecords
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

  // Confirmation Modals for Kanakvaala page data management
  const [showDeleteRecordsModal, setShowDeleteRecordsModal] = useState(false);
  const [showDeleteUsersModal, setShowDeleteUsersModal] = useState(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  // Leaderboard sorting
  const [sortByR0, setSortByR0] = useState(false);

  const selectedNeutralizeTeam = teams.find((t) => t.id === Number(selectedNeutralizeTeamId)) || teams[0] || {
    id: 0,
    teamName: 'NO REGISTERED SQUADS',
    p1: 'N/A',
    p2: 'N/A',
    score: 0,
    activeSabotages: [],
    lane: 'N/A'
  };

  const handleNeutralizeSabotage = () => {
    if (!selectedNeutralizeTeam || !selectedNeutralizeTeam.id) return;
    const sabotageToRemove = selectedNeutralizeSabotage || (selectedNeutralizeTeam.activeSabotages?.[0] || 'ALL DISRUPTIONS');
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

  const getTeamAvatar = (team) => {
    if (!team || !team.id) return PREDEFINED_AVATARS[0].src;
    const idx = (team.id) % PREDEFINED_AVATARS.length;
    return PREDEFINED_AVATARS[idx]?.src || PREDEFINED_AVATARS[idx]?.svg || PREDEFINED_AVATARS[0].src;
  };

  const sortedTeams = [...(teams || [])].sort((a, b) => {
    if (sortByR0 || roundState.isEnded) {
      const diffR0 = (b.r0 || b.r0Score || 0) - (a.r0 || a.r0Score || 0);
      if (diffR0 !== 0) return diffR0;
    }
    return (b.score || 0) - (a.score || 0);
  });

  const rank1 = sortedTeams[0] || { id: 0, teamName: 'NO SQUAD REGISTERED', p1: 'PLAYER 1', p2: 'PLAYER 2', score: 0 };
  const rank2 = sortedTeams[1] || { id: 0, teamName: 'NO SQUAD REGISTERED', p1: 'PLAYER 1', p2: 'PLAYER 2', score: 0 };
  const rank3 = sortedTeams[2] || { id: 0, teamName: 'NO SQUAD REGISTERED', p1: 'PLAYER 1', p2: 'PLAYER 2', score: 0 };

  const handleDeleteAllRecordsConfirm = async () => {
    try {
      setIsProcessingDelete(true);
      await deleteAllRecords();
      setShowDeleteRecordsModal(false);
      playTone(600, 0.2);
    } catch (err) {
      console.error('Failed to delete records:', err);
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const handleDeleteAllUsersConfirm = async () => {
    try {
      setIsProcessingDelete(true);
      await deleteAllTeams();
      setShowDeleteUsersModal(false);
      playTone(400, 0.3);
    } catch (err) {
      console.error('Failed to delete users:', err);
    } finally {
      setIsProcessingDelete(false);
    }
  };

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

        {/* Admin Navigation Options */}
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

          {/* 4. Leaderboard (Added as requested) */}
          <button
            type="button"
            onClick={() => {
              setAdminSubTab('leaderboard');
              playTone(1050, 0.08);
            }}
            className={`flex items-center px-space-sm py-2.5 transition-all rounded-lg text-left cursor-pointer w-full font-body-base text-sm ${
              adminSubTab === 'leaderboard'
                ? 'bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#CCFF00]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-space-sm text-[20px]">leaderboard</span>
            Leaderboard
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
                      disabled={teams.length === 0}
                      className="w-full bg-surface-subtle text-primary font-headline-md text-headline-md px-4 py-3.5 border-2 border-primary rounded-none focus:outline-none focus:border-cobalt-deep uppercase font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedNeutralizeTeamId}
                      onChange={(e) => setSelectedNeutralizeTeamId(Number(e.target.value))}
                    >
                      {teams.length > 0 ? (
                        teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.teamName} ({t.p1} &amp; {t.p2} - {t.lane})
                          </option>
                        ))
                      ) : (
                        <option value="0">NO TEAMS REGISTERED IN DATABASE</option>
                      )}
                    </select>
                  </div>

                  {/* Active Sabotages on this Team */}
                  <div className="md:col-span-4 flex flex-col gap-2">
                    <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase" htmlFor="target-sabotage-select">
                      Select Active Disruption:
                    </label>
                    <select
                      id="target-sabotage-select"
                      disabled={teams.length === 0 || !selectedNeutralizeTeam?.id}
                      className="w-full bg-surface-subtle text-primary font-body-base text-body-base px-4 py-4 border-2 border-primary rounded-none focus:outline-none focus:border-cobalt-deep font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      value={selectedNeutralizeSabotage}
                      onChange={(e) => setSelectedNeutralizeSabotage(e.target.value)}
                    >
                      {(selectedNeutralizeTeam.activeSabotages || []).length > 0 ? (
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
                      disabled={teams.length === 0 || !selectedNeutralizeTeam?.id || !(selectedNeutralizeTeam.activeSabotages?.length > 0)}
                      className={`w-full px-8 py-4 font-headline-md text-headline-md uppercase tracking-wider font-bold transition-all duration-150 flex items-center justify-center gap-3 ${
                        teams.length === 0 || !selectedNeutralizeTeam?.id || !(selectedNeutralizeTeam.activeSabotages?.length > 0)
                          ? 'bg-surface-subtle text-on-surface-variant/40 border border-hairline-light cursor-not-allowed'
                          : 'bg-sabotage-crimson text-on-primary hover:bg-error hover:scale-[1.02] active:scale-95 cursor-pointer shadow-[4px_4px_0px_#050505]'
                      }`}
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
                      (selectedNeutralizeTeam.activeSabotages || []).length > 0 ? 'bg-sabotage-crimson animate-ping' : 'bg-signal-emerald'
                    }`}></span>
                    <span className="font-body-base text-body-base text-primary">
                      {teams.length === 0 ? (
                        <span className="text-on-surface-variant font-bold">Roster empty. No registered teams in the database for the active game.</span>
                      ) : (
                        <>
                          Status for <strong>{selectedNeutralizeTeam.teamName}</strong> ({selectedNeutralizeTeam.p1} &amp; {selectedNeutralizeTeam.p2}):{' '}
                          {(selectedNeutralizeTeam.activeSabotages || []).length > 0 ? (
                            <span className="text-sabotage-crimson font-bold">
                              Impacted by {selectedNeutralizeTeam.activeSabotages.join(', ')}
                            </span>
                          ) : (
                            <span className="text-signal-emerald font-bold">Shields nominal. No active disruptions.</span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase font-bold">
                    SCORE: {(selectedNeutralizeTeam.score || 0).toLocaleString()} PTS
                  </span>
                </div>
              </div>

              {/* Subsystem 03: Round 1 & Round 2 Arsenal Lock Controls (Power of Potis) */}
              <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm flex flex-col gap-6 border border-hairline-light">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline-light">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">lock_open</span>
                      <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                        Arsenal Round Lock Controls // Power of Potis
                      </h2>
                    </div>
                    <p className="font-body-base text-body-base text-on-surface-variant mt-1">
                      Independently unlock or lock Round 1 &amp; Round 2 items in real-time across all player arena terminals.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-label-mono-sm text-xs text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse"></span>
                    LIVE SYNC VIA WEBSOCKET
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Round 1 Lock Card */}
                  <div className={`p-6 rounded-xl border flex flex-col justify-between gap-5 transition-all ${
                    roundLocks.round1Unlocked
                      ? 'bg-signal-emerald/10 border-signal-emerald shadow-[3px_3px_0px_#00FF85]'
                      : 'bg-surface-subtle border-hairline-light'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-label-mono-sm text-xs uppercase font-bold text-on-surface-variant">ROUND 01 ARSENAL</span>
                        <h3 className="font-headline-md text-xl font-bold text-primary mt-1">Round 1 (Puzzles &amp; Quiz)</h3>
                        <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                          11 Advantages (20-100 pts) + 10 Sabotages (40-100 pts)
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-label-mono-sm text-xs font-bold uppercase flex items-center gap-1.5 ${
                        roundLocks.round1Unlocked
                          ? 'bg-signal-emerald text-on-surface font-bold'
                          : 'bg-sabotage-crimson/20 text-sabotage-crimson border border-sabotage-crimson/40'
                      }`}>
                        <span className="material-symbols-outlined text-sm">{roundLocks.round1Unlocked ? 'lock_open' : 'lock'}</span>
                        {roundLocks.round1Unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleRoundLock(1, !roundLocks.round1Unlocked)}
                        className={`w-full py-3.5 px-4 rounded-lg font-headline-md text-sm uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          roundLocks.round1Unlocked
                            ? 'bg-surface-dark text-on-primary hover:bg-sabotage-crimson border border-hairline-dark'
                            : 'bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary shadow-[2px_2px_0px_#CCFF00]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{roundLocks.round1Unlocked ? 'lock' : 'lock_open'}</span>
                        <span>{roundLocks.round1Unlocked ? 'LOCK ROUND 1 ARSENAL' : 'UNLOCK ROUND 1 ARSENAL'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Round 2 Lock Card */}
                  <div className={`p-6 rounded-xl border flex flex-col justify-between gap-5 transition-all ${
                    roundLocks.round2Unlocked
                      ? 'bg-signal-emerald/10 border-signal-emerald shadow-[3px_3px_0px_#00FF85]'
                      : 'bg-surface-subtle border-hairline-light'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-label-mono-sm text-xs uppercase font-bold text-on-surface-variant">ROUND 02 ARSENAL</span>
                        <h3 className="font-headline-md text-xl font-bold text-primary mt-1">Round 2 (Coding &amp; Debugging)</h3>
                        <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                          13 Advantages (30-150 pts) + 8 Sabotages (50-130 pts)
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-label-mono-sm text-xs font-bold uppercase flex items-center gap-1.5 ${
                        roundLocks.round2Unlocked
                          ? 'bg-signal-emerald text-on-surface font-bold'
                          : 'bg-sabotage-crimson/20 text-sabotage-crimson border border-sabotage-crimson/40'
                      }`}>
                        <span className="material-symbols-outlined text-sm">{roundLocks.round2Unlocked ? 'lock_open' : 'lock'}</span>
                        {roundLocks.round2Unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleRoundLock(2, !roundLocks.round2Unlocked)}
                        className={`w-full py-3.5 px-4 rounded-lg font-headline-md text-sm uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          roundLocks.round2Unlocked
                            ? 'bg-surface-dark text-on-primary hover:bg-sabotage-crimson border border-hairline-dark'
                            : 'bg-primary text-on-primary hover:bg-acid-chartreuse hover:text-primary shadow-[2px_2px_0px_#CCFF00]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{roundLocks.round2Unlocked ? 'lock' : 'lock_open'}</span>
                        <span>{roundLocks.round2Unlocked ? 'LOCK ROUND 2 ARSENAL' : 'UNLOCK ROUND 2 ARSENAL'}</span>
                      </button>
                    </div>
                  </div>
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
                      {teams.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-on-surface-variant font-label-mono-sm text-sm uppercase">
                            No squads registered in tournament roster. Register new squads to initialize game.
                          </td>
                        </tr>
                      ) : (
                        (onlyActive
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
                      }))}
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

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      playTone(950, 0.1);
                      window.open(api.audit.getExportUrl(), '_blank');
                    }}
                    className="px-4 py-2 bg-surface-subtle hover:bg-surface-container-high text-primary font-label-mono-sm text-xs uppercase rounded flex items-center gap-1.5 cursor-pointer border border-hairline-light"
                  >
                    <span className="material-symbols-outlined text-sm">download</span> Export CSV
                  </button>

                  {/* Delete All Records Button */}
                  <button
                    type="button"
                    onClick={() => {
                      playTone(600, 0.1);
                      setShowDeleteRecordsModal(true);
                    }}
                    className="px-4 py-2 bg-sabotage-crimson hover:bg-error text-on-primary font-label-mono-sm text-xs uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-[2px_2px_0px_#000]"
                  >
                    <span className="material-symbols-outlined text-sm">delete_sweep</span> Delete All Records
                  </button>

                  {/* Delete All Users Button */}
                  <button
                    type="button"
                    onClick={() => {
                      playTone(450, 0.1);
                      setShowDeleteUsersModal(true);
                    }}
                    className="px-4 py-2 bg-surface-dark hover:bg-sabotage-crimson text-sabotage-crimson hover:text-white border-2 border-sabotage-crimson font-label-mono-sm text-xs uppercase font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-[2px_2px_0px_#FF2A3B]"
                  >
                    <span className="material-symbols-outlined text-sm">group_remove</span> Delete All Users
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

          {/* ========================================================================= */}
          {/* TAB 4: LEADERBOARD (Real-Time Podium & Standings Mirror for Admin)       */}
          {/* ========================================================================= */}
          {adminSubTab === 'leaderboard' && (
            <div className="flex flex-col gap-8">
              
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 gap-4 border-b border-hairline-light">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-acid-chartreuse text-canvas-dark font-label-mono-sm text-label-mono-sm uppercase font-bold">
                      ADMIN OVERVIEW
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                      // TOURNAMENT LEADERBOARD &amp; PODIUM
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                    Tournament Leaderboard
                  </h1>
                  <p className="font-body-base text-body-base text-on-surface-variant">
                    Live hierarchical standings, podium winners, and complete score telemetry mirroring the player perspective in real-time.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSortByR0(!sortByR0)}
                    className={`px-3.5 py-2 rounded-lg font-label-mono-sm text-xs font-bold uppercase transition-all cursor-pointer border ${
                      sortByR0
                        ? 'bg-acid-chartreuse text-canvas-dark border-acid-chartreuse shadow-[2px_2px_0px_#000]'
                        : 'bg-surface-subtle hover:bg-surface-container-high text-primary border-hairline-light'
                    }`}
                  >
                    {sortByR0 ? 'Sorted: Round 0 Points' : 'Sort: Round 0 Points'}
                  </button>
                  <div className="bg-surface-subtle px-4 py-2 rounded-lg font-label-mono-sm text-label-mono-sm text-primary font-bold border border-hairline-light flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse"></span>
                    <span>TOTAL SQUADS: {teams.length}</span>
                  </div>
                </div>
              </div>

              {/* Top 3 Hierarchy Podium Layout */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-hairline-light flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center text-center pt-2 pb-2">
                  <h2 className="font-black text-3xl sm:text-4xl text-acid-chartreuse tracking-wider uppercase drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                    STANDINGS PODIUM
                  </h2>
                  <p className="font-body-base text-sm text-on-surface-variant mt-1">
                    Top 3 Ranked Tournament Contenders
                  </p>
                </div>

                <div className="w-full flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 md:gap-8 pt-4 pb-6 px-2">
                  
                  {/* RANK 2 (Left) */}
                  <div className="flex-1 max-w-[240px] w-full flex flex-col items-center order-2 sm:order-1">
                    <div className="relative mb-3">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#8A99AD] bg-black p-1 shadow-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={getTeamAvatar(rank2)}
                          alt={rank2.teamName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#8A99AD] text-black font-black flex items-center justify-center text-sm shadow-md border-2 border-black">
                        2
                      </div>
                    </div>
                    <div className="w-full bg-surface-subtle border-2 border-[#8A99AD]/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md">
                      <h3 className="font-bold text-primary text-base sm:text-lg truncate max-w-full">
                        {rank2.teamName}
                      </h3>
                      <span className="font-body-sm text-xs text-on-surface-variant truncate max-w-full">
                        {rank2.p1} &amp; {rank2.p2}
                      </span>
                      <span className="font-black text-2xl sm:text-3xl text-primary mt-2">
                        {(rank2.score || 0).toLocaleString()}
                      </span>
                      <span className="font-label-mono-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-bold mt-0.5">
                        POINTS
                      </span>
                    </div>
                  </div>

                  {/* RANK 1 (Center - Elevated & Bigger) */}
                  <div className="flex-1 max-w-[270px] w-full flex flex-col items-center order-1 sm:order-2 -translate-y-0 sm:-translate-y-6">
                    <div className="relative mb-3">
                      <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-acid-chartreuse bg-black p-1 shadow-[0_0_35px_rgba(204,255,0,0.5)] overflow-hidden flex items-center justify-center">
                        <img
                          src={getTeamAvatar(rank1)}
                          alt={rank1.teamName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-10 h-10 rounded-full bg-acid-chartreuse text-canvas-dark font-black flex items-center justify-center text-lg shadow-lg border-2 border-black animate-pulse">
                        1
                      </div>
                    </div>
                    <div className="w-full bg-surface-subtle border-2 border-acid-chartreuse rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(204,255,0,0.25),4px_4px_0px_#CCFF00]">
                      <h3 className="font-black text-acid-chartreuse text-lg sm:text-xl truncate max-w-full">
                        {rank1.teamName}
                      </h3>
                      <span className="font-body-sm text-xs text-on-surface-variant truncate max-w-full">
                        {rank1.p1} &amp; {rank1.p2}
                      </span>
                      <span className="font-black text-3xl sm:text-4xl text-primary mt-2 tracking-tight">
                        {(rank1.score || 0).toLocaleString()}
                      </span>
                      <span className="font-label-mono-sm text-xs text-acid-chartreuse uppercase tracking-widest font-bold mt-0.5">
                        POINTS
                      </span>
                    </div>
                  </div>

                  {/* RANK 3 (Right) */}
                  <div className="flex-1 max-w-[240px] w-full flex flex-col items-center order-3">
                    <div className="relative mb-3">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#C87D55] bg-black p-1 shadow-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={getTeamAvatar(rank3)}
                          alt={rank3.teamName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#C87D55] text-black font-black flex items-center justify-center text-sm shadow-md border-2 border-black">
                        3
                      </div>
                    </div>
                    <div className="w-full bg-surface-subtle border-2 border-[#C87D55]/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md">
                      <h3 className="font-bold text-primary text-base sm:text-lg truncate max-w-full">
                        {rank3.teamName}
                      </h3>
                      <span className="font-body-sm text-xs text-on-surface-variant truncate max-w-full">
                        {rank3.p1} &amp; {rank3.p2}
                      </span>
                      <span className="font-black text-2xl sm:text-3xl text-primary mt-2">
                        {(rank3.score || 0).toLocaleString()}
                      </span>
                      <span className="font-label-mono-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-bold mt-0.5">
                        POINTS
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Full Roster Standings Table */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-hairline-light flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-hairline-light pb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">format_list_numbered</span>
                    <h3 className="font-headline-lg text-xl font-bold text-primary">
                      Complete Squad Standings
                    </h3>
                  </div>
                  <span className="font-label-mono-sm text-xs text-on-surface-variant">
                    {teams.length} Registered Squads
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-hairline-light text-on-surface-variant font-label-mono-sm text-xs uppercase">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Squad Name</th>
                        <th className="py-3 px-4">Roster</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Round 0 Pts</th>
                        <th className="py-3 px-6 text-right">Total Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-light">
                      {sortedTeams.map((team, idx) => {
                        const isOnline = activeTeamIds.includes(team.id) || team.isOnline;
                        const r0Pts = team.r0 || team.r0Score || 0;
                        const isLeader = idx === 0 && team.score > 0;

                        return (
                          <tr
                            key={team.id}
                            className={`transition-colors ${
                              isOnline ? 'hover:bg-surface-subtle/60' : 'opacity-50 grayscale bg-surface-subtle/30'
                            }`}
                          >
                            <td className="py-4 px-4 font-label-mono-sm text-sm">
                              <div className="flex items-center gap-1.5">
                                {isLeader ? (
                                  <span className="w-6 h-6 rounded-full bg-acid-chartreuse text-primary flex items-center justify-center font-bold text-xs shadow-sm">
                                    ★
                                  </span>
                                ) : (
                                  <span className="w-6 h-6 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center text-xs font-bold border border-hairline-light">
                                    {idx + 1}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getTeamAvatar(team)}
                                  alt={team.teamName}
                                  className="w-9 h-9 rounded-xl border border-hairline-light bg-surface-subtle object-cover"
                                />
                                <div>
                                  <span className="font-headline-md text-sm text-primary font-bold block">
                                    {team.teamName}
                                  </span>
                                  <span className="font-label-mono-sm text-[11px] text-on-surface-variant uppercase">
                                    {team.lane || `Squad #${team.id}`}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-body-base text-xs text-on-surface-variant">
                              {team.p1} &amp; {team.p2}
                            </td>
                            <td className="py-4 px-4">
                              {isOnline ? (
                                <span className="inline-flex items-center gap-1.5 bg-signal-emerald/10 text-signal-emerald px-2.5 py-1 rounded-full font-label-mono-sm text-[10px] font-bold uppercase border border-signal-emerald/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse"></span>
                                  ONLINE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-surface-subtle text-on-surface-variant/60 px-2.5 py-1 rounded-full font-label-mono-sm text-[10px] font-bold uppercase border border-hairline-light">
                                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40"></span>
                                  OFFLINE
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-xl font-label-mono-sm text-xs font-bold ${
                                r0Pts > 0 ? 'bg-primary text-acid-chartreuse' : 'bg-surface-subtle text-on-surface-variant'
                              }`}>
                                {r0Pts} PTS
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-headline-md text-base font-bold text-primary">
                              {team.score.toLocaleString()} PTS
                            </td>
                          </tr>
                        );
                      })}
                      {sortedTeams.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-on-surface-variant font-label-mono-sm text-sm">
                            NO REGISTERED SQUADS IN DATABASE.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Confirmation Modal: Delete All Records */}
      {showDeleteRecordsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border-2 border-sabotage-crimson max-w-lg w-full p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(255,42,59,0.3)] flex flex-col gap-6">
            <div className="flex items-center gap-3 text-sabotage-crimson pb-2 border-b border-hairline-light">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <div>
                <h3 className="font-headline-lg text-lg sm:text-xl font-bold uppercase tracking-tight">
                  Confirm: Delete All Records
                </h3>
                <span className="font-label-mono-sm text-xs uppercase text-on-surface-variant">
                  Kanaku Valaku Telemetry Purge
                </span>
              </div>
            </div>

            <p className="font-body-base text-sm text-on-surface leading-relaxed">
              This action will permanently delete all <strong>Kanaku Valaku records</strong>:
            </p>
            <ul className="list-disc list-inside font-label-mono-sm text-xs text-on-surface-variant flex flex-col gap-1.5 pl-2">
              <li>All Audit Logs &amp; Event Timestamps</li>
              <li>All Score Transaction Ledgers &amp; History</li>
              <li>All Buzzer Lock-in Event Logs</li>
              <li>All Active &amp; Historical Sabotage Instances</li>
            </ul>
            <p className="font-body-sm text-xs text-on-surface-variant/80 italic">
              Note: Squad user profiles and their current score wallet balances will NOT be deleted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline-light">
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={() => setShowDeleteRecordsModal(false)}
                className="px-5 py-2.5 bg-surface-subtle hover:bg-surface-container-high text-primary font-label-mono-sm text-xs uppercase font-bold rounded-lg cursor-pointer transition-colors border border-hairline-light"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={handleDeleteAllRecordsConfirm}
                className="px-6 py-2.5 bg-sabotage-crimson hover:bg-error text-on-primary font-label-mono-sm text-xs uppercase font-bold rounded-lg cursor-pointer transition-all shadow-[2px_2px_0px_#000] flex items-center gap-2"
              >
                {isProcessingDelete ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Purging...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">delete_forever</span>
                    <span>Yes, Delete All Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete All Users */}
      {showDeleteUsersModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border-2 border-error max-w-lg w-full p-6 sm:p-8 rounded-2xl shadow-[0_0_60px_rgba(255,42,59,0.5)] flex flex-col gap-6">
            <div className="flex items-center gap-3 text-sabotage-crimson pb-2 border-b border-hairline-light">
              <span className="material-symbols-outlined text-3xl animate-bounce">dangerous</span>
              <div>
                <h3 className="font-headline-lg text-lg sm:text-xl font-bold uppercase tracking-tight text-sabotage-crimson">
                  Critical: Delete All Users
                </h3>
                <span className="font-label-mono-sm text-xs uppercase text-on-surface-variant">
                  Total Comalies Database Purge
                </span>
              </div>
            </div>

            <p className="font-body-base text-sm text-on-surface leading-relaxed">
              This action will permanently delete <strong>ALL user accounts and squads</strong> from the Total Comalies database:
            </p>
            <ul className="list-disc list-inside font-label-mono-sm text-xs text-on-surface-variant flex flex-col gap-1.5 pl-2">
              <li>Purges all {teams.length} squads from the database <code className="text-acid-chartreuse">teams</code> table</li>
              <li>Cascades and deletes all associated transactions and player records</li>
              <li>Resets the platform for an entirely new tournament game</li>
              <li>Allows registering brand-new teams with fresh starting scores (100 pts)</li>
            </ul>
            <div className="p-3 bg-sabotage-crimson/15 border border-sabotage-crimson/40 rounded-lg text-sabotage-crimson font-label-mono-sm text-xs font-bold">
              ⚠️ WARNING: THIS CANNOT BE UNDONE. ALL CURRENT PLAYERS WILL BE SIGNED OUT.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline-light">
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={() => setShowDeleteUsersModal(false)}
                className="px-5 py-2.5 bg-surface-subtle hover:bg-surface-container-high text-primary font-label-mono-sm text-xs uppercase font-bold rounded-lg cursor-pointer transition-colors border border-hairline-light"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={handleDeleteAllUsersConfirm}
                className="px-6 py-2.5 bg-sabotage-crimson hover:bg-error text-on-primary font-label-mono-sm text-xs uppercase font-bold rounded-lg cursor-pointer transition-all shadow-[3px_3px_0px_#000] flex items-center gap-2"
              >
                {isProcessingDelete ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Purging Users...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">group_remove</span>
                    <span>Yes, Purge All Squads</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
