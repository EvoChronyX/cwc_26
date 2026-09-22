import React, { useState } from 'react';
import ClashLogo from '../components/common/ClashLogo';
import { useGame } from '../context/GameContext';
import { PREDEFINED_AVATARS } from '../assets/avatars';

export default function PlayerArena() {
  const {
    setCurrentView,
    nammaAreaSubTab,
    setNammaAreaSubTab,
    teamName,
    p1Handle,
    p2Handle,
    playerAvatar,
    activeFaction,
    teams,
    buzzersArmed,
    isLockedIn,
    buzzerPressResult,
    activeThreat,
    executeBuzzIn,
    deploySabotageToTeam,
    playTone,
    currentTeamId,
    logout,
    roundState,
    startRound0,
    endRound0,
    activeTeamIds
  } = useGame();

  const [sortByR0, setSortByR0] = useState(false);

  const selectedAvatarObj = PREDEFINED_AVATARS.find((a) => a.id === playerAvatar) || PREDEFINED_AVATARS[0];

  // Sabotage Target state per card in Power-up Pothys
  const [targetTeam1, setTargetTeam1] = useState(2);
  const [targetTeam2, setTargetTeam2] = useState(2);
  const [targetTeam3, setTargetTeam3] = useState(2);
  const [targetTeam4, setTargetTeam4] = useState(2);
  const [targetTeam5, setTargetTeam5] = useState(2);
  const [targetTeam6, setTargetTeam6] = useState(2);

  const currentTeam = teams.find((t) => t.id === currentTeamId) ||
                      teams.find((t) => t.teamName?.toUpperCase() === teamName?.toUpperCase()) ||
                      teams[0] || {
    id: 1,
    score: 0,
    r0: 0,
    r0Score: 0,
    teamName: teamName || 'TEAM KINETIC',
    p1: p1Handle || 'Alex Vance',
    p2: p2Handle || 'Sarah Connor',
    lane: 'Lane #01',
    winRate: '0%',
    activeSabotages: []
  };

  const rivalTeams = teams.filter((t) => t.id !== currentTeam?.id);

  // Top 3 Leaderboard hierarchy sorting & avatar mapping
  const sortedTeams = [...teams].sort((a, b) => {
    if (sortByR0 || roundState.isEnded) {
      const diffR0 = (b.r0 || b.r0Score || 0) - (a.r0 || a.r0Score || 0);
      if (diffR0 !== 0) return diffR0;
    }
    return b.score - a.score;
  });
  const rank1 = sortedTeams[0] || currentTeam;
  const rank2 = sortedTeams[1] || teams[1] || currentTeam;
  const rank3 = sortedTeams[2] || teams[2] || currentTeam;

  const getTeamAvatar = (team) => {
    if (!team) return PREDEFINED_AVATARS[0].src;
    if (team.id === currentTeam?.id) {
      return selectedAvatarObj.src || selectedAvatarObj.svg;
    }
    const idx = (team.id) % PREDEFINED_AVATARS.length;
    return PREDEFINED_AVATARS[idx].src || PREDEFINED_AVATARS[idx].svg;
  };

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

        {/* Bottom Sidebar Action: Logout / Switch Squad */}
        <div className="p-space-sm border-t border-hairline-light mt-auto">
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

      {/* Main Area */}
      <div className="pl-64 w-full min-h-screen">
        


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
                <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8">
                  {/* Left Area (60% width): Team Info & Player Names */}
                  <div className="w-full md:w-[60%] flex flex-col justify-between gap-6">
                    {/* Team Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-hairline-light gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold shadow-[2px_2px_0px_#CCFF00] shrink-0">
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
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-surface-subtle rounded-full font-label-mono-sm text-xs text-primary font-bold border border-hairline-light">
                          STATUS: ONLINE &amp; SYNCHRONIZED
                        </span>
                      </div>
                    </div>

                    {/* 2-Player Squad Members */}
                    <div className="bg-surface-subtle p-5 rounded-xl border border-hairline-light flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase font-bold">
                          2-PLAYER SQUAD MEMBERS
                        </span>
                        <span className="font-label-mono-sm text-[11px] text-signal-emerald font-bold">
                          ACTIVE PAIR
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-hairline-light">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-primary text-lg">person</span>
                            <span className="font-body-base text-sm font-semibold text-primary">
                              Player 1: {currentTeam.p1 || p1Handle}
                            </span>
                          </div>
                          <span className="font-label-mono-sm text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded font-bold">
                            POD 01
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-hairline-light">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-primary text-lg">person</span>
                            <span className="font-body-base text-sm font-semibold text-primary">
                              Player 2: {currentTeam.p2 || p2Handle}
                            </span>
                          </div>
                          <span className="font-label-mono-sm text-[10px] bg-cobalt-deep text-on-primary px-2 py-0.5 rounded font-bold">
                            POD 02
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Area (40% width from right to left): Bigger Profile Picture */}
                  <div className="w-full md:w-[40%] flex flex-col items-center justify-center relative rounded-2xl overflow-hidden border-2 border-primary bg-black p-3 shadow-[4px_4px_0px_#CCFF00] min-h-[240px] sm:min-h-[280px]">
                    <div className="w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center bg-surface-dark group">
                      <img
                        src={selectedAvatarObj.src || selectedAvatarObj.svg}
                        alt={selectedAvatarObj.name}
                        className="w-full h-full max-h-[260px] md:max-h-[300px] object-cover rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 flex items-center justify-between">
                        <span className="font-label-mono-sm text-[11px] text-acid-chartreuse font-bold uppercase tracking-wider">
                          SQUAD PROFILE PIC
                        </span>
                        <span className="font-label-mono-sm text-[10px] text-white/90 uppercase font-bold">
                          {selectedAvatarObj.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Team Leaderboard with Top 3 Hierarchy Podium */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-hairline-light flex flex-col gap-6">
                
                {/* Leaderboard Header matching the hierarchy reference */}
                <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
                  <h2 className="font-black text-3xl sm:text-4xl text-acid-chartreuse tracking-wider uppercase drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                    LEADERBOARD
                  </h2>
                  <p className="font-body-base text-sm sm:text-base text-on-surface-variant mt-1.5">
                    Compete with fellow coders and climb to the top of the rankings
                  </p>
                </div>

                {/* Top 3 Hierarchy Podium Layout */}
                <div className="w-full flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 md:gap-8 pt-4 pb-6 px-2">
                  
                  {/* RANK 2 (Left) */}
                  <div className="flex-1 max-w-[240px] w-full flex flex-col items-center order-2 sm:order-1">
                    {/* Circular Avatar + Badge 2 */}
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
                    {/* Rank 2 Card */}
                    <div className="w-full bg-surface-subtle border-2 border-[#8A99AD]/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md">
                      <h3 className="font-bold text-primary text-base sm:text-lg truncate max-w-full">
                        {rank2.teamName}
                      </h3>
                      {rank2.id === 1 && (
                        <span className="bg-acid-chartreuse text-canvas-dark text-[9px] font-bold px-1.5 py-0.2 rounded uppercase mt-0.5">
                          YOU
                        </span>
                      )}
                      <span className="font-black text-2xl sm:text-3xl text-primary mt-2">
                        {rank2.score.toLocaleString()}
                      </span>
                      <span className="font-label-mono-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-bold mt-0.5">
                        POINTS
                      </span>
                    </div>
                  </div>

                  {/* RANK 1 (Center - Elevated & Bigger) */}
                  <div className="flex-1 max-w-[270px] w-full flex flex-col items-center order-1 sm:order-2 -translate-y-0 sm:-translate-y-6">
                    {/* Circular Avatar + Badge 1 with Chartreuse Glow */}
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
                    {/* Rank 1 Card */}
                    <div className="w-full bg-surface-subtle border-2 border-acid-chartreuse rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(204,255,0,0.25),4px_4px_0px_#CCFF00]">
                      <h3 className="font-black text-acid-chartreuse text-lg sm:text-xl truncate max-w-full">
                        {rank1.teamName}
                      </h3>
                      {rank1.id === 1 && (
                        <span className="bg-acid-chartreuse text-canvas-dark text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-0.5">
                          YOUR TEAM
                        </span>
                      )}
                      <span className="font-black text-3xl sm:text-4xl text-primary mt-2 tracking-tight">
                        {rank1.score.toLocaleString()}
                      </span>
                      <span className="font-label-mono-sm text-xs text-acid-chartreuse uppercase tracking-widest font-bold mt-0.5">
                        POINTS
                      </span>
                    </div>
                  </div>

                  {/* RANK 3 (Right) */}
                  <div className="flex-1 max-w-[240px] w-full flex flex-col items-center order-3">
                    {/* Circular Avatar + Badge 3 */}
                    <div className="relative mb-3">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#FF8C38] bg-black p-1 shadow-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={getTeamAvatar(rank3)}
                          alt={rank3.teamName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#FF8C38] text-black font-black flex items-center justify-center text-sm shadow-md border-2 border-black">
                        3
                      </div>
                    </div>
                    {/* Rank 3 Card */}
                    <div className="w-full bg-surface-subtle border-2 border-[#FF8C38]/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md">
                      <h3 className="font-bold text-primary text-base sm:text-lg truncate max-w-full">
                        {rank3.teamName}
                      </h3>
                      {rank3.id === 1 && (
                        <span className="bg-acid-chartreuse text-canvas-dark text-[9px] font-bold px-1.5 py-0.2 rounded uppercase mt-0.5">
                          YOU
                        </span>
                      )}
                      <span className="font-black text-2xl sm:text-3xl text-[#FF8C38] mt-2">
                        {rank3.score.toLocaleString()}
                      </span>
                      <span className="font-label-mono-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-bold mt-0.5">
                        POINTS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Division Standings Subheading */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 pb-2 border-t border-hairline-light">
                  <div>
                    <span className="font-label-mono-sm text-xs uppercase text-on-surface-variant font-bold tracking-widest">
                      COMPLETE DIVISION STANDINGS
                    </span>
                    <h3 className="font-headline-md text-primary uppercase font-bold tracking-tight">
                      All Connected Squads
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSortByR0(!sortByR0)}
                      className={`px-3 py-1 rounded-full font-label-mono-sm text-xs uppercase font-bold transition-all cursor-pointer border ${
                        sortByR0
                          ? 'bg-acid-chartreuse text-canvas-dark border-acid-chartreuse shadow-[2px_2px_0px_#000]'
                          : 'bg-surface-subtle hover:bg-surface-container text-primary border-hairline-light'
                      }`}
                    >
                      {sortByR0 ? 'Ranked: Round 0 (Mani Adi)' : 'Sort by: Round 0 (Mani Adi)'}
                    </button>
                    <span className="bg-primary text-on-primary px-3 py-1 rounded-full font-label-mono-sm text-label-mono-sm uppercase font-bold">
                      {sortByR0 ? 'SORTED BY: ROUND 0 PTS' : 'SORTED BY: TOTAL SCORE'}
                    </span>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="border-b border-hairline-light bg-surface-subtle font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                        <th className="py-4 px-4">RANK</th>
                        <th className="py-4 px-6">TEAM IDENTITY</th>
                        <th className="py-4 px-4">SQUAD MEMBERS</th>
                        <th className="py-4 px-4 text-acid-chartreuse">R0 (MANI ADI)</th>
                        <th className="py-4 px-4">R1 SCORE</th>
                        <th className="py-4 px-4">R2 SCORE</th>
                        <th className="py-4 px-6">TOTAL PTS</th>
                        <th className="py-4 px-6 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-light font-body-base text-body-base">
                      {[...teams]
                        .sort((a, b) => {
                          if (sortByR0) {
                            return ((b.r0 || b.r0Score || 0) - (a.r0 || a.r0Score || 0)) || (b.score - a.score);
                          }
                          return b.score - a.score;
                        })
                        .map((t, idx) => {
                          const isOnline = activeTeamIds.includes(t.id) || t.isOnline;
                          return (
                            <tr key={t.id} className={`hover:bg-surface-subtle/50 transition-colors ${t.id === currentTeamId ? 'bg-surface-subtle/40' : ''}`}>
                              <td className="py-4 px-4 font-label-mono-lg text-label-mono-lg font-bold text-primary">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                  idx === 0 ? 'bg-acid-chartreuse text-canvas-dark' : 'bg-surface-container text-on-surface-variant'
                                }`}>
                                  #0{idx + 1}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-primary text-base">{t.teamName}</span>
                                  {t.id === currentTeamId && (
                                    <span className="bg-acid-chartreuse text-canvas-dark text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="font-label-mono-sm text-xs text-on-surface-variant uppercase">{t.lane}</span>
                              </td>
                              <td className="py-4 px-4 font-body-base text-sm text-on-surface-variant">
                                {t.p1} &amp; {t.p2}
                              </td>
                              <td className="py-4 px-4 font-headline-md text-acid-chartreuse font-bold">
                                {t.r0 || t.r0Score || 0} PTS
                              </td>
                              <td className="py-4 px-4 font-label-mono-sm text-label-mono-sm">{t.r1}</td>
                              <td className="py-4 px-4 font-label-mono-sm text-label-mono-sm">{t.r2}</td>
                              <td className="py-4 px-6 font-headline-md text-headline-md font-bold text-primary">
                                {t.score.toLocaleString()}
                              </td>
                              <td className="py-4 px-6 text-right">
                                {isOnline ? (
                                  <span className="inline-block bg-primary text-acid-chartreuse px-2.5 py-0.5 rounded-full font-label-mono-sm text-[10px] font-bold uppercase">
                                    ONLINE
                                  </span>
                                ) : (
                                  <span className="inline-block bg-surface-subtle text-on-surface-variant/60 px-2.5 py-0.5 rounded-full font-label-mono-sm text-[10px] font-bold uppercase border border-hairline-light">
                                    OFFLINE
                                  </span>
                                )}
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

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={startRound0}
                    disabled={roundState.isActive}
                    className={`px-4 py-2.5 rounded-xl font-label-mono-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all ${
                      roundState.isActive
                        ? 'bg-surface-subtle text-on-surface-variant/40 border-hairline-light cursor-not-allowed'
                        : 'bg-signal-emerald text-canvas-dark border-signal-emerald hover:bg-signal-emerald/90 shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">play_arrow</span>
                    Start Round
                  </button>
                  <button
                    onClick={endRound0}
                    disabled={!roundState.isActive}
                    className={`px-4 py-2.5 rounded-xl font-label-mono-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all ${
                      !roundState.isActive
                        ? 'bg-surface-subtle text-on-surface-variant/40 border-hairline-light cursor-not-allowed'
                        : 'bg-sabotage-crimson text-white border-sabotage-crimson hover:bg-sabotage-crimson/90 shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">stop</span>
                    End Round
                  </button>
                  <div className="bg-primary text-on-primary p-3 rounded-xl flex flex-col items-start min-w-[140px] shadow-[3px_3px_0px_#CCFF00]">
                    <span className="font-label-mono-sm text-[10px] text-acid-chartreuse uppercase font-bold">ROUND 0 STATUS</span>
                    <span className="font-label-mono-sm text-xs text-on-primary font-bold tracking-tight flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${roundState.isActive ? 'bg-signal-emerald animate-pulse' : 'bg-on-surface-variant/50'}`}></span>
                      {roundState.isActive ? 'IN PROGRESS' : roundState.isEnded ? 'CONCLUDED' : 'STANDBY'}
                    </span>
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
                        ? `BUZZER LOCKED // TRANSMITTED (#${buzzerPressResult.rank || 1})`
                        : buzzersArmed
                        ? 'BUZZER ACTIVE (READY)'
                        : 'BUZZER CIRCUIT LOCKED (BUSY)'}
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
                    isLockedIn || !buzzersArmed ? 'scale-125 opacity-0' : 'animate-ping'
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
                    <span className={`material-symbols-outlined text-6xl mb-2 ${isLockedIn ? 'text-signal-emerald' : buzzersArmed ? 'text-acid-chartreuse' : 'text-sabotage-crimson'}`}>
                      {isLockedIn ? 'task_alt' : buzzersArmed ? 'notifications_active' : 'lock'}
                    </span>
                    <span className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-primary tracking-tight leading-tight uppercase">
                      {isLockedIn ? 'LOCKED' : buzzersArmed ? 'MANI ADI' : 'LOCKED'}
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse tracking-widest uppercase mt-1 font-bold">
                      {isLockedIn ? `POSITION #${buzzerPressResult.rank || 1}` : buzzersArmed ? 'BUZZ IN NOW' : 'CIRCUIT FROZEN'}
                    </span>
                    <span className="font-label-mono-sm text-[10px] text-on-primary-container tracking-wider uppercase mt-3">
                      {isLockedIn ? 'PRIORITY SECURED' : buzzersArmed ? 'TAP SCREEN // SPACEBAR' : 'WAIT FOR GAME MASTER'}
                    </span>
                  </button>
                </div>

                {/* Real-Time Ultra-Cool Feedback Banner */}
                <div className="relative z-10 mt-6 w-full max-w-2xl transition-all duration-300">
                  {isLockedIn ? (
                    <div className="bg-primary border-2 border-acid-chartreuse rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[4px_4px_0px_#CCFF00]">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-14 h-14 rounded-2xl bg-signal-emerald text-primary flex items-center justify-center font-bold text-2xl shadow-md">
                          <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                        </div>
                        <div>
                          <span className="font-headline-lg text-xl sm:text-2xl text-acid-chartreuse font-bold block">
                            {buzzerPressResult.title} ({buzzerPressResult.latency})
                          </span>
                          <span className="font-body-base text-sm text-on-primary block mt-0.5">
                            System Click Time: <strong className="text-signal-emerald">{buzzerPressResult.clientTime || buzzerPressResult.time}</strong> • Priority lock registered for <strong>{currentTeam.teamName}</strong>.
                          </span>
                        </div>
                      </div>
                      <span className="bg-surface-dark text-signal-emerald font-label-mono-sm text-xs px-4 py-2 rounded-full uppercase font-bold border border-hairline-dark tracking-wider whitespace-nowrap">
                        #{buzzerPressResult.rank || 1} IN QUEUE
                      </span>
                    </div>
                  ) : !buzzersArmed ? (
                    <div className="bg-surface-dark border border-sabotage-crimson/50 rounded-2xl p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sabotage-crimson/20 text-sabotage-crimson flex items-center justify-center">
                          <span className="material-symbols-outlined font-bold">lock</span>
                        </div>
                        <div className="text-left">
                          <span className="font-label-mono-sm text-label-mono-sm text-sabotage-crimson font-bold block">
                            CIRCUIT LOCKED // CONTENDERS BUSY
                          </span>
                          <span className="font-body-sm text-body-sm text-on-primary-container">
                            The Game Master has locked all buzzers. Stand by for the circuit to be armed.
                          </span>
                        </div>
                      </div>
                      <span className="font-label-mono-sm text-xs text-sabotage-crimson font-bold px-3 py-1 bg-sabotage-crimson/10 rounded-full border border-sabotage-crimson/30">
                        LOCKED
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
                      <span className="font-label-mono-sm text-label-mono-sm text-signal-emerald font-bold hidden sm:block">READY</span>
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

              {/* ROUND 0 CONCLUSION // HIGHEST SCORER BANNER */}
              {roundState.isEnded && roundState.highestScorer && (
                <div className="w-full bg-surface-dark text-on-primary rounded-3xl p-6 sm:p-8 border-2 border-acid-chartreuse shadow-[6px_6px_0px_#CCFF00] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-acid-chartreuse">
                    <span className="material-symbols-outlined text-[160px]">emoji_events</span>
                  </div>
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-acid-chartreuse text-canvas-dark flex items-center justify-center font-bold shadow-lg">
                      <span className="material-symbols-outlined text-4xl">military_tech</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="bg-acid-chartreuse text-canvas-dark font-label-mono-sm text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          Round 0 Winner
                        </span>
                        <span className="font-label-mono-sm text-xs text-acid-chartreuse font-bold">
                          HIGHEST SCORER IDENTIFIED
                        </span>
                      </div>
                      <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-white mt-1">
                        {roundState.highestScorer.teamName}
                      </h2>
                      <p className="font-body-base text-sm text-on-surface-variant/80">
                        Seized top seed with <strong className="text-acid-chartreuse">{roundState.highestScorer.r0Score ?? roundState.highestScorer.score} PTS</strong> in Mani Adi (+1 pt per correct floor answer).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-canvas-dark px-5 py-3 rounded-2xl border border-hairline-dark text-right">
                      <span className="font-label-mono-sm text-[10px] text-on-surface-variant uppercase block">ROUND 0 SCORE</span>
                      <span className="font-label-mono-lg text-2xl font-bold text-acid-chartreuse">
                        +{roundState.highestScorer.r0Score ?? roundState.highestScorer.score} PTS
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DEDICATED MANI ADI (ROUND 0) LEADERBOARD */}
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-hairline-light flex flex-col gap-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline-light pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-acid-chartreuse bg-primary p-1 rounded-lg text-lg">leaderboard</span>
                      <h3 className="font-headline-lg text-xl font-bold text-primary">
                        Mani Adi Leaderboard // Round 0 Standings
                      </h3>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                      Ranked by direct floor correct answers (+1 pt per verified response). Highest scorer takes the round.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-mono-sm text-xs text-on-surface-variant">
                      ACTIVE SQUADS: <strong className="text-primary">{activeTeamIds.length}</strong> / {teams.length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-hairline-light text-on-surface-variant font-label-mono-sm text-xs uppercase">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Squad</th>
                        <th className="py-3 px-4">Roster</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Correct Answers (R0)</th>
                        <th className="py-3 px-6 text-right">Total Arena Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-light">
                      {[...teams]
                        .sort((a, b) => {
                          const r0Diff = (b.r0 || b.r0Score || 0) - (a.r0 || a.r0Score || 0);
                          if (r0Diff !== 0) return r0Diff;
                          return b.score - a.score;
                        })
                        .map((team, idx) => {
                          const isOnline = activeTeamIds.includes(team.id) || team.status === 'CONNECTED';
                          const isSelf = team.id === currentTeam.id;
                          const r0Pts = team.r0 || team.r0Score || 0;
                          const isLeader = idx === 0 && r0Pts > 0;

                          return (
                            <tr
                              key={team.id}
                              className={`transition-colors ${
                                isSelf
                                  ? 'bg-acid-chartreuse/10 font-bold'
                                  : isOnline
                                  ? 'hover:bg-surface-subtle/60'
                                  : 'opacity-40 grayscale bg-surface-subtle/30'
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
                                    <div className="flex items-center gap-2">
                                      <span className="font-headline-md text-sm text-primary font-bold">
                                        {team.teamName}
                                      </span>
                                      {isSelf && (
                                        <span className="bg-primary text-acid-chartreuse text-[9px] font-label-mono-sm uppercase px-2 py-0.5 rounded-full font-bold">
                                          YOU
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-label-mono-sm text-[11px] text-on-surface-variant uppercase">
                                      {team.lane}
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
                                <span className={`inline-block px-3 py-1 rounded-xl font-label-mono-sm text-sm font-bold ${
                                  r0Pts > 0 ? 'bg-primary text-acid-chartreuse' : 'bg-surface-subtle text-on-surface-variant'
                                }`}>
                                  {r0Pts} {r0Pts === 1 ? 'PT' : 'PTS'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right font-headline-md text-base font-bold text-primary">
                                {team.score.toLocaleString()}
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
